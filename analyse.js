    // ═══ Analyse Dashboard ═══

    const chartInstances = {};

    // ── Toggle: Analyse in/uit ──
    const sidebarAnalyse = document.getElementById('sidebarAnalyse');
    const analysePanel = document.getElementById('analysePanel');
    const mainPanel = document.querySelector('.main');

    sidebarAnalyse.addEventListener('click', () => {
      mainPanel.style.display = 'none';
      analysePanel.style.display = 'flex';
      document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
      sidebarAnalyse.classList.add('active');
      renderAnalyse();
    });

    // Terug naar main bij andere sidebar-items
    document.querySelectorAll('.sidebar-item[data-view]').forEach(item => {
      item.addEventListener('click', () => {
        analysePanel.style.display = 'none';
        mainPanel.style.display = '';
      });
    });

    // ── Filter state ──
    let analyseperiode = 'week'; // 'week' | 'maand'
    let analyseCat = 'alles';   // 'alles' | 'Werk' | 'Privé' | 'Natasja'

    document.getElementById('filterWeek').addEventListener('click', () => {
      analyseperiode = 'week';
      updateFilterButtons();
      renderAnalyse();
    });
    document.getElementById('filterMaand').addEventListener('click', () => {
      analyseperiode = 'maand';
      updateFilterButtons();
      renderAnalyse();
    });
    document.getElementById('filterAlles').addEventListener('click', () => {
      analyseCat = 'alles';
      updateFilterButtons();
      renderAnalyse();
    });
    document.getElementById('filterWerk').addEventListener('click', () => {
      analyseCat = 'Werk';
      updateFilterButtons();
      renderAnalyse();
    });
    document.getElementById('filterPrive').addEventListener('click', () => {
      analyseCat = 'Privé';
      updateFilterButtons();
      renderAnalyse();
    });
    document.getElementById('filterNatasja').addEventListener('click', () => {
      analyseCat = 'Natasja';
      updateFilterButtons();
      renderAnalyse();
    });

    function updateFilterButtons() {
      document.getElementById('filterWeek').classList.toggle('active', analyseperiode === 'week');
      document.getElementById('filterMaand').classList.toggle('active', analyseperiode === 'maand');
      document.getElementById('filterAlles').classList.toggle('active', analyseCat === 'alles');
      document.getElementById('filterWerk').classList.toggle('active', analyseCat === 'Werk');
      document.getElementById('filterPrive').classList.toggle('active', analyseCat === 'Privé');
      document.getElementById('filterNatasja').classList.toggle('active', analyseCat === 'Natasja');
    }

    // ── Hulpfuncties ──
    function getAfgerondItems() {
      // Combineer voltooide subtaken en sub_subtaken
      const subs = allSubtaken.filter(s => s.gedaan && s.gedaan_datum);
      const subsubs = allSubsubtaken.filter(ss => ss.gedaan && ss.gedaan_datum);

      // Voeg categorie toe
      const items = [
        ...subs.map(s => {
          const p = allProjecten.find(pr => pr.id === s.taak_id);
          return { ...s, categorie: p?.categorie || 'Werk' };
        }),
        ...subsubs.map(ss => {
          const sub = allSubtaken.find(s => s.id === ss.subtaak_id);
          const p = sub ? allProjecten.find(pr => pr.id === sub.taak_id) : null;
          return { ...ss, categorie: p?.categorie || 'Werk' };
        })
      ];

      if (analyseCat !== 'alles') return items.filter(i => i.categorie === analyseCat);
      return items;
    }

    function getOpenItems() {
      const subs = allSubtaken.filter(s => !s.gedaan && isActief(s));
      const subsubs = allSubsubtaken.filter(ss => !ss.gedaan && isActief(ss));
      if (analyseCat === 'alles') return [...subs, ...subsubs];

      const gefilterd = [];
      subs.forEach(s => {
        const p = allProjecten.find(pr => pr.id === s.taak_id);
        if ((p?.categorie || 'Werk') === analyseCat) gefilterd.push(s);
      });
      subsubs.forEach(ss => {
        const sub = allSubtaken.find(s => s.id === ss.subtaak_id);
        const p = sub ? allProjecten.find(pr => pr.id === sub.taak_id) : null;
        if ((p?.categorie || 'Werk') === analyseCat) gefilterd.push(ss);
      });
      return gefilterd;
    }

    function startOfWeek(date) {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      d.setHours(0,0,0,0);
      return d;
    }

    function weekLabel(dateStr) {
      const d = new Date(dateStr);
      const mon = startOfWeek(d);
      return `${String(mon.getDate()).padStart(2,'0')}-${String(mon.getMonth()+1).padStart(2,'0')}`;
    }

    function maandLabel(dateStr) {
      const d = new Date(dateStr);
      const mnd = ['Jan','Feb','Mrt','Apr','Mei','Jun','Jul','Aug','Sep','Okt','Nov','Dec'];
      return `${mnd[d.getMonth()]} ${d.getFullYear()}`;
    }

    function destroyChart(id) {
      if (chartInstances[id]) {
        chartInstances[id].destroy();
        delete chartInstances[id];
      }
    }

    function accentColor() {
      return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0071e3';
    }

    // ── KPI berekeningen ──
    function berekenKpis() {
      const afgerond = getAfgerondItems();
      const nu = new Date();

      // Afgerond deze week
      const weekGeleden = new Date(nu - 7 * 86400000);
      const dezeWeek = afgerond.filter(i => new Date(i.gedaan_datum) >= weekGeleden).length;

      // Open totaal
      const openTotaal = getOpenItems().length;

      // Op tijd %
      const metDeadline = afgerond.filter(i => i.deadline && i.gedaan_datum);
      const opTijd = metDeadline.filter(i => i.gedaan_datum <= i.deadline).length;
      const opTijdPct = metDeadline.length > 0 ? Math.round(opTijd / metDeadline.length * 100) : null;

      // Gem. doorlooptijd
      const metBeide = afgerond.filter(i => i.aangemaakt_op && i.gedaan_datum);
      let gemDagen = null;
      if (metBeide.length > 0) {
        const totaal = metBeide.reduce((sum, i) => {
          const dagen = Math.ceil((new Date(i.gedaan_datum) - new Date(i.aangemaakt_op)) / 86400000);
          return sum + Math.max(0, dagen);
        }, 0);
        gemDagen = Math.round(totaal / metBeide.length);
      }

      return { dezeWeek, openTotaal, opTijdPct, gemDagen };
    }

    function renderKpis() {
      const { dezeWeek, openTotaal, opTijdPct, gemDagen } = berekenKpis();
      document.getElementById('kpiDezeWeek').textContent = dezeWeek;
      document.getElementById('kpiOpen').textContent = openTotaal;
      document.getElementById('kpiOpTijd').textContent = opTijdPct !== null ? opTijdPct + '%' : '—';
      document.getElementById('kpiDoorlooptijd').textContent = gemDagen !== null ? gemDagen + ' d' : '—';
    }

    // ── Grafiek 1: Productiviteit ──
    function renderProductiviteit() {
      destroyChart('productiviteit');
      const afgerond = getAfgerondItems();

      // Groepeer per week of maand, laatste 8 periodes
      const counts = {};
      afgerond.forEach(i => {
        const label = analyseperiode === 'week' ? weekLabel(i.gedaan_datum) : maandLabel(i.gedaan_datum);
        counts[label] = (counts[label] || 0) + 1;
      });

      const labels = Object.keys(counts).sort().slice(-8);
      const data = labels.map(l => counts[l]);

      if (labels.length === 0) {
        document.getElementById('chartProductiviteit').parentElement.innerHTML =
          '<div class="chart-empty">Nog geen afgeronde taken</div>';
        return;
      }

      const ctx = document.getElementById('chartProductiviteit').getContext('2d');
      const accent = accentColor();
      chartInstances['productiviteit'] = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{ label: 'Afgerond', data, backgroundColor: accent + '99', borderColor: accent, borderWidth: 1, borderRadius: 4 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 } }, grid: { color: 'rgba(128,128,128,.1)' } }, x: { ticks: { font: { size: 10 } }, grid: { display: false } } }
        }
      });
    }

    // ── Grafiek 2: Werk/Privé ──
    function renderWerkPrive() {
      destroyChart('werkprive');

      let projecten = allProjecten.filter(p => !p.gedaan);
      if (analyseCat !== 'alles') projecten = projecten.filter(p => p.categorie === analyseCat);

      const werk = projecten.filter(p => p.categorie === 'Werk').length;
      const prive = projecten.filter(p => p.categorie === 'Privé').length;
      const natasja = projecten.filter(p => p.categorie === 'Natasja').length;
      const totaal = werk + prive + natasja;

      if (totaal === 0) {
        document.getElementById('chartWerkPrive').parentElement.innerHTML =
          '<div class="chart-empty">Geen open projecten</div>';
        return;
      }

      const ctx = document.getElementById('chartWerkPrive').getContext('2d');
      chartInstances['werkprive'] = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['RHLC', 'Raimon', 'Natasja'],
          datasets: [{ data: [werk, prive, natasja], backgroundColor: ['#0071e3', '#ff9f0a', '#30d158'], borderWidth: 0, hoverOffset: 4 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } } },
          cutout: '65%'
        }
      });
    }

    // ── Grafiek 3: Deadline compliance ──
    function renderDeadlineCompliance() {
      destroyChart('deadline');

      const afgerond = getAfgerondItems().filter(i => i.deadline && i.gedaan_datum);
      if (afgerond.length === 0) {
        document.getElementById('chartDeadline').parentElement.innerHTML =
          '<div class="chart-empty">Geen afgeronde taken met deadline</div>';
        return;
      }

      const opTijd = afgerond.filter(i => i.gedaan_datum <= i.deadline).length;
      const teLaat = afgerond.length - opTijd;

      const ctx = document.getElementById('chartDeadline').getContext('2d');
      chartInstances['deadline'] = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Op tijd', 'Te laat'],
          datasets: [{ data: [opTijd, teLaat], backgroundColor: ['#34c759', '#ff3b30'], borderWidth: 0, hoverOffset: 4 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } } },
          cutout: '65%'
        }
      });
    }

    // ── Grafiek 5: Context analyse ──
    function renderContext() {
      destroyChart('context');

      const open = getOpenItems().filter(i => i.context && i.context.length > 0);
      const counts = {};
      open.forEach(i => {
        normalizeContext(i.context).forEach(c => {
          counts[c] = (counts[c] || 0) + 1;
        });
      });

      const labels = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
      const data = labels.map(l => counts[l]);

      if (labels.length === 0) {
        document.getElementById('chartContext').parentElement.innerHTML =
          '<div class="chart-empty">Geen context-data (vul Context in bij taken)</div>';
        return;
      }

      const ctx = document.getElementById('chartContext').getContext('2d');
      const accent = accentColor();
      chartInstances['context'] = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{ label: 'Taken', data, backgroundColor: accent + '99', borderColor: accent, borderWidth: 1, borderRadius: 4 }]
        },
        options: {
          indexAxis: 'y',
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 } }, grid: { color: 'rgba(128,128,128,.1)' } }, y: { ticks: { font: { size: 11 } }, grid: { display: false } } }
        }
      });
    }

    // ── Grafiek 6: Project voortgang ──
    function renderProjectVoortgang() {
      const container = document.getElementById('projectVoortgang');
      container.innerHTML = '';

      let projecten = allProjecten.filter(p => !p.gedaan && isActief(p));
      if (analyseCat !== 'alles') projecten = projecten.filter(p => p.categorie === analyseCat);

      if (projecten.length === 0) {
        container.innerHTML = '<div class="chart-empty">Geen open projecten</div>';
        return;
      }

      projecten.forEach(p => {
        const subs = allSubtaken.filter(s => s.taak_id === p.id && isActief(s));
        const subsubs = allSubsubtaken.filter(ss => {
          const sub = allSubtaken.find(s => s.id === ss.subtaak_id);
          return sub && sub.taak_id === p.id && isActief(ss);
        });

        const totaal = subs.length + subsubs.length;
        const gedaan = subs.filter(s => s.gedaan).length + subsubs.filter(ss => ss.gedaan).length;
        const pct = totaal > 0 ? Math.round(gedaan / totaal * 100) : 0;

        const row = document.createElement('div');
        row.className = 'project-bar-row';
        row.innerHTML = `
          <div class="project-bar-label">
            <span>${esc(p.taak)}</span>
            <span class="project-bar-pct">${gedaan}/${totaal}</span>
          </div>
          <div class="project-bar-track">
            <div class="project-bar-fill" style="width:${pct}%"></div>
          </div>
        `;
        container.appendChild(row);
      });
    }

    // ── Hoofd render ──
    function renderAnalyse() {
      renderKpis();
      renderProductiviteit();
      renderWerkPrive();
      renderDeadlineCompliance();
      renderContext();
      renderProjectVoortgang();
    }
