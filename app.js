    // ═══ Kolom-header filter/sort popups ═══
    let allProjecten = [], allSubtaken = [], allSubsubtaken = [];
    let subsByProject = new Map();
    let subsubsBySubtaak = new Map();
    let currentSort = null;
    let activeFilters = {};
    let currentView = 'inbox';
    let displayMode = 'lijst'; // 'lijst' | 'kanban' | 'calendar'
    let searchQuery = '';
    let catFilter = null;

    function buildIndexes() {
      subsByProject = new Map();
      subsubsBySubtaak = new Map();
      allSubtaken.forEach(s => {
        if (!subsByProject.has(s.taak_id)) subsByProject.set(s.taak_id, []);
        subsByProject.get(s.taak_id).push(s);
      });
      allSubsubtaken.forEach(ss => {
        if (!subsubsBySubtaak.has(ss.subtaak_id)) subsubsBySubtaak.set(ss.subtaak_id, []);
        subsubsBySubtaak.get(ss.subtaak_id).push(ss);
      });
    }

    function getSubsFor(projectId) {
      return subsByProject.get(projectId) || [];
    }
    function getSubsubsFor(subtaakId) {
      return subsubsBySubtaak.get(subtaakId) || [];
    }

    // Helper: is item niet verwijderd?
    function isActief(item) { return !item.verwijderd_op; }
    function isVerwijderd(item) { return !!item.verwijderd_op; }

    function getFilterOptions(col) {
      switch(col) {
        case 'prio': return ['★ Prioriteit', '☆ Normaal'];
        case 'cat': return ['Werk', 'Privé', 'Natasja'];
        case 'project': return [...new Set(allProjecten.filter(p => !p.gedaan).map(p => p.taak))].sort();
        case 'taak': return [...new Set(allSubtaken.filter(s => !s.gedaan).map(s => s.tekst))].sort();
        case 'deadline': return ['Vandaag', 'Deze week', 'Heeft deadline', 'Geen deadline'];
        default: return [];
      }
    }

    function closePopups() {
      document.querySelectorAll('.col-popup').forEach(p => p.remove());
    }

    document.querySelectorAll('.th-filter').forEach(th => {
      th.addEventListener('click', (e) => {
        e.stopPropagation();
        closePopups();

        const col = th.dataset.col;
        const options = getFilterOptions(col);
        const currentFilter = activeFilters[col];

        const popup = document.createElement('div');
        popup.className = 'col-popup';

        popup.innerHTML = `<div class="col-popup-title">Sorteren</div>`;
        const sortAsc = document.createElement('button');
        sortAsc.className = 'col-popup-btn' + (currentSort?.col === col && currentSort?.dir === 'asc' ? ' active' : '');
        sortAsc.textContent = '↑ Oplopend';
        sortAsc.addEventListener('click', () => { currentSort = { col, dir: 'asc' }; closePopups(); renderAll(); });
        popup.appendChild(sortAsc);

        const sortDesc = document.createElement('button');
        sortDesc.className = 'col-popup-btn' + (currentSort?.col === col && currentSort?.dir === 'desc' ? ' active' : '');
        sortDesc.textContent = '↓ Aflopend';
        sortDesc.addEventListener('click', () => { currentSort = { col, dir: 'desc' }; closePopups(); renderAll(); });
        popup.appendChild(sortDesc);

        const sep = document.createElement('div');
        sep.className = 'col-popup-sep';
        popup.appendChild(sep);

        const filterTitle = document.createElement('div');
        filterTitle.className = 'col-popup-title';
        filterTitle.textContent = 'Filter';
        popup.appendChild(filterTitle);

        const checkboxes = [];

        // Snelle toggle: Alles / Geen
        const toggleRow = document.createElement('div');
        toggleRow.className = 'col-popup-toggle';
        const allLink = document.createElement('button');
        allLink.type = 'button';
        allLink.className = 'col-popup-link';
        allLink.textContent = 'Alles';
        allLink.addEventListener('click', (ev) => {
          ev.stopPropagation();
          checkboxes.forEach(cb => { cb.checked = true; });
        });
        const noneLink = document.createElement('button');
        noneLink.type = 'button';
        noneLink.className = 'col-popup-link';
        noneLink.textContent = 'Geen';
        noneLink.addEventListener('click', (ev) => {
          ev.stopPropagation();
          checkboxes.forEach(cb => { cb.checked = false; });
        });
        toggleRow.appendChild(allLink);
        toggleRow.appendChild(document.createTextNode(' · '));
        toggleRow.appendChild(noneLink);
        popup.appendChild(toggleRow);

        options.forEach(opt => {
          const label = document.createElement('label');
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.value = opt;
          cb.checked = !currentFilter || currentFilter.has(opt);
          checkboxes.push(cb);
          label.appendChild(cb);
          if (col === 'cat') {
            const badge = document.createElement('span');
            badge.className = 'cat' + (opt === 'Werk' ? ' w' : opt === 'Natasja' ? ' n' : ' p');
            badge.textContent = opt === 'Werk' ? 'RHLC' : opt;
            label.appendChild(badge);
          } else {
            label.appendChild(document.createTextNode(opt));
          }
          popup.appendChild(label);
        });

        const sep2 = document.createElement('div');
        sep2.className = 'col-popup-sep';
        popup.appendChild(sep2);

        const actions = document.createElement('div');
        actions.className = 'col-popup-actions';

        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Filter wissen';
        clearBtn.addEventListener('click', () => {
          delete activeFilters[col];
          th.classList.remove('active');
          closePopups();
          renderAll();
        });
        actions.appendChild(clearBtn);

        const applyBtn = document.createElement('button');
        applyBtn.className = 'primary';
        applyBtn.textContent = 'Toepassen';
        applyBtn.addEventListener('click', () => {
          const selected = new Set(checkboxes.filter(cb => cb.checked).map(cb => cb.value));
          if (selected.size === options.length) {
            delete activeFilters[col];
            th.classList.remove('active');
          } else {
            activeFilters[col] = selected;
            th.classList.add('active');
          }
          closePopups();
          renderAll();
        });
        actions.appendChild(applyBtn);
        popup.appendChild(actions);

        const rect = th.getBoundingClientRect();
        popup.style.left = Math.min(rect.left, window.innerWidth - 220) + 'px';
        popup.style.top = (rect.bottom + 4) + 'px';
        document.body.appendChild(popup);
        popup.addEventListener('click', (ev) => ev.stopPropagation());
      });
    });

    document.addEventListener('click', closePopups);

    // ═══ Filter/sort logica ═══
    function filterSubsByActiveFilters(items) {
      return items;
    }

    function projectMatchesFilter(project) {
      for (const [col, selected] of Object.entries(activeFilters)) {
        switch(col) {
          case 'cat':
            if (!selected.has(project.categorie)) return false;
            break;
          case 'prio':
            const isPrio = project.prioriteit === 'hoog';
            const label = isPrio ? '★ Prioriteit' : '☆ Normaal';
            if (!selected.has(label)) return false;
            break;
          case 'project':
            if (!selected.has(project.taak)) return false;
            break;
          case 'deadline':
            const hasDl = !!project.deadline;
            const days = hasDl ? daysUntil(project.deadline) : null;
            let match = false;
            if (selected.has('Heeft deadline') && hasDl) match = true;
            if (selected.has('Geen deadline') && !hasDl) match = true;
            if (selected.has('Vandaag') && days === 0) match = true;
            if (selected.has('Deze week') && days !== null && days >= 0 && days <= 7) match = true;
            if (!match) return false;
            break;
        }
      }
      return true;
    }

    function sortItems(items) {
      if (!currentSort) return items;
      const s = [...items];
      const dir = currentSort.dir === 'asc' ? 1 : -1;
      s.sort((a, b) => {
        let va, vb;
        const projA = allProjecten.find(p => p.id === a.taak_id) ||
          (() => { const st = allSubtaken.find(st => st.id === a.subtaak_id); return allProjecten.find(p => p.id === st?.taak_id); })();
        const projB = allProjecten.find(p => p.id === b.taak_id) ||
          (() => { const st = allSubtaken.find(st => st.id === b.subtaak_id); return allProjecten.find(p => p.id === st?.taak_id); })();
        switch(currentSort.col) {
          case 'project': va = (projA?.taak || '').toLowerCase(); vb = (projB?.taak || '').toLowerCase(); break;
          case 'cat': va = projA?.categorie || ''; vb = projB?.categorie || ''; break;
          case 'prio': va = (a.prio_ster || a.prioriteit) ? 0 : 1; vb = (b.prio_ster || b.prioriteit) ? 0 : 1; break;
          case 'taak': va = (a.tekst || '').toLowerCase(); vb = (b.tekst || '').toLowerCase(); break;
          case 'deadline': va = a.deadline || '9999-12-31'; vb = b.deadline || '9999-12-31'; break;
          default: va = a.volgorde || 0; vb = b.volgorde || 0;
        }
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
      });
      return s;
    }

    function sortProjecten(projects) {
      if (!currentSort) return projects;
      const s = [...projects];
      const dir = currentSort.dir === 'asc' ? 1 : -1;
      s.sort((a, b) => {
        let va, vb;
        switch(currentSort.col) {
          case 'project': va = a.taak.toLowerCase(); vb = b.taak.toLowerCase(); break;
          case 'cat': va = a.categorie; vb = b.categorie; break;
          case 'prio': va = a.prioriteit === 'hoog' ? 0 : 1; vb = b.prioriteit === 'hoog' ? 0 : 1; break;
          case 'deadline':
            va = a.deadline || '9999-12-31'; vb = b.deadline || '9999-12-31'; break;
          default: va = a.nr; vb = b.nr;
        }
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
      });
      return s;
    }

    function projectHasDeadline(project, mode) {
      const dl = project.deadline ? daysUntil(project.deadline) : null;
      if (mode === 'vandaag' && dl !== null && dl <= 0) return true;
      if (mode === 'week' && dl !== null && dl >= 0 && dl <= 7) return true;
      return getSubsFor(project.id).some(s => {
        if (s.gedaan) return false;
        const d = s.deadline ? daysUntil(s.deadline) : null;
        if (mode === 'vandaag') return d !== null && d <= 0;
        if (mode === 'week') return d !== null && d >= 0 && d <= 7;
        return false;
      });
    }

    function projectIsPrio(project) {
      if (project.prioriteit === 'hoog') return true;
      return getSubsFor(project.id).some(s => !s.gedaan && s.prio_ster);
    }

    function projectHasInbox(project) {
      if (project.inbox) return true;
      const subs = getSubsFor(project.id);
      if (subs.some(s => !s.gedaan && s.inbox)) return true;
      return subs.some(s => getSubsubsFor(s.id).some(ss => !ss.gedaan && ss.inbox));
    }

    function countInbox() {
      let count = allProjecten.filter(p => !p.gedaan && p.inbox).length;
      count += allSubtaken.filter(s => !s.gedaan && s.inbox).length;
      count += allSubsubtaken.filter(s => !s.gedaan && s.inbox).length;
      return count;
    }

    function getViewProjects() {
      if (currentView === 'voltooid') {
        return allProjecten.filter(p => p.gedaan && isActief(p));
      }
      if (currentView === 'prullenmand') {
        return [];
      }

      let projects = allProjecten.filter(p => !p.gedaan && isActief(p));

      if (catFilter) projects = projects.filter(p => p.categorie === catFilter);

      if (currentView === 'inbox') {
        projects = projects.filter(p => projectHasInbox(p));
      } else if (currentView === 'vandaag') {
        projects = projects.filter(p => projectHasDeadline(p, 'vandaag'));
      } else if (currentView === 'week') {
        projects = projects.filter(p => projectHasDeadline(p, 'week'));
      } else if (currentView === 'prioriteit') {
        projects = projects.filter(p => projectIsPrio(p));
      } else if (currentView.startsWith('project:')) {
        const projectId = currentView.split(':')[1];
        projects = projects.filter(p => p.id === projectId);
      }

      return projects;
    }

    function getViewTitle() {
      switch(currentView) {
        case 'alle': return 'Alle taken';
        case 'inbox': return 'Inbox';
        case 'vandaag': return 'Vandaag & Verlopen';
        case 'week': return 'Deze week';
        case 'prioriteit': return 'Prioriteit';
        case 'voltooid': return 'Voltooid';
        case 'zoekresultaten': return 'Zoekresultaten';
        default:
          if (currentView.startsWith('project:')) {
            const pid = currentView.split(':')[1];
            const p = allProjecten.find(pr => pr.id === pid);
            return p ? p.taak : 'Project';
          }
          return 'Taken';
      }
    }

    function countItemsWithDeadline(mode) {
      let count = 0;
      allProjecten.filter(p => !p.gedaan && isActief(p)).forEach(p => {
        const dl = p.deadline ? daysUntil(p.deadline) : null;
        if (mode === 'vandaag' && dl !== null && dl <= 0) count++;
        else if (mode === 'week' && dl !== null && dl >= 0 && dl <= 7) count++;
        getSubsFor(p.id).filter(s => !s.gedaan && isActief(s)).forEach(s => {
          const d = s.deadline ? daysUntil(s.deadline) : null;
          if (mode === 'vandaag' && d !== null && d <= 0) count++;
          else if (mode === 'week' && d !== null && d >= 0 && d <= 7) count++;
          getSubsubsFor(s.id).filter(ss => !ss.gedaan && isActief(ss)).forEach(ss => {
            const dss = ss.deadline ? daysUntil(ss.deadline) : null;
            if (mode === 'vandaag' && dss !== null && dss <= 0) count++;
            else if (mode === 'week' && dss !== null && dss >= 0 && dss <= 7) count++;
          });
        });
      });
      return count;
    }

    function countPrio() {
      let count = 0;
      allProjecten.filter(p => !p.gedaan && isActief(p)).forEach(p => {
        if (p.prioriteit === 'hoog') count++;
        getSubsFor(p.id).filter(s => !s.gedaan && isActief(s)).forEach(s => {
          if (s.prio_ster) count++;
          getSubsubsFor(s.id).filter(ss => !ss.gedaan && isActief(ss) && ss.prio_ster).forEach(() => count++);
        });
      });
      return count;
    }

    function updateSidebar() {
      const openSubs = allSubtaken.filter(s => !s.gedaan && isActief(s));
      const openSubsubs = allSubsubtaken.filter(ss => !ss.gedaan && isActief(ss));

      const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val || ''; };
      el('badgeAlle', openSubs.length + openSubsubs.length);
      const inboxCount = countInbox();
      el('badgeInbox', inboxCount || '');
      el('badgeVandaag', countItemsWithDeadline('vandaag') || '');
      el('badgeWeek', countItemsWithDeadline('week') || '');
      el('badgePrio', countPrio() || '');
      const voltooidCount = allSubtaken.filter(s => s.gedaan && isActief(s)).length +
        allSubsubtaken.filter(s => s.gedaan && isActief(s)).length;
      el('badgeVoltooid', voltooidCount || '');
      const prullenmandCount = allProjecten.filter(isVerwijderd).length +
        allSubtaken.filter(isVerwijderd).length +
        allSubsubtaken.filter(isVerwijderd).length;
      el('badgePrullenmand', prullenmandCount || '');

      document.querySelectorAll('.sidebar-item[data-view]').forEach(item => {
        item.classList.toggle('active', item.dataset.view === currentView);
      });

      const container = document.getElementById('sidebarProjecten');
      container.innerHTML = '';
      const open = allProjecten.filter(p => !p.gedaan && isActief(p));
      open.forEach(p => {
        const subs = getSubsFor(p.id).filter(s => !s.gedaan && isActief(s));
        const subsubs = subs.reduce((acc, s) => acc + getSubsubsFor(s.id).filter(ss => !ss.gedaan && isActief(ss)).length, 0);
        const count = subs.length + subsubs;
        const isActive = currentView === `project:${p.id}`;
        const div = document.createElement('div');
        div.className = 'sidebar-item' + (isActive ? ' active' : '');
        div.dataset.view = `project:${p.id}`;
        div.innerHTML = `<span class="icon">▸</span> ${p.taak} <span class="badge">${count || ''}</span>`;
        div.addEventListener('click', () => {
          if (displayMode !== 'lijst') setDisplayMode('lijst');
          currentView = `project:${p.id}`;
          renderAll();
          document.querySelectorAll('.chev').forEach(c => c.classList.add('open'));
          document.querySelectorAll('.row-taak, .row-subtaak').forEach(r => r.classList.remove('collapsed'));
        });
        container.appendChild(div);
      });

      document.getElementById('viewTitle').textContent = getViewTitle();
    }

    function saveExpandState() {
      const open = { projects: new Set(), taken: new Set() };
      document.querySelectorAll('.row-project').forEach(row => {
        if (row.querySelector('.chev.open')) open.projects.add(row.dataset.projectId);
      });
      document.querySelectorAll('.row-taak').forEach(row => {
        if (row.querySelector('.chev.open')) open.taken.add(row.dataset.taakId);
      });
      return open;
    }

    function restoreExpandState(open) {
      document.querySelectorAll('.row-project').forEach(row => {
        const id = row.dataset.projectId;
        if (open.projects.has(id)) {
          const chev = row.querySelector('.chev');
          if (chev) chev.classList.add('open');
          document.querySelectorAll(`.row-taak[data-parent="${id}"]`).forEach(r => r.classList.remove('collapsed'));
        }
      });
      document.querySelectorAll('.row-taak').forEach(row => {
        const id = row.dataset.taakId;
        if (open.taken.has(id)) {
          const chev = row.querySelector('.chev');
          if (chev) chev.classList.add('open');
          document.querySelectorAll(`.row-subtaak[data-parent-taak="${id}"]`).forEach(r => r.classList.remove('collapsed'));
        }
      });
    }

    function renderAll() {
      // Auto-clear search wanneer we niet (meer) in de zoekresultaten-view zitten
      if (currentView !== 'zoekresultaten' && searchQuery) {
        searchQuery = '';
        const inp = document.getElementById('searchInput');
        if (inp) inp.value = '';
      }

      // Display-mode dispatch (Lijst | Kanban | Calendar)
      const tableWrap = document.querySelector('.table-wrap');
      const kanbanWrap = document.getElementById('kanbanContainer');
      const calWrap = document.getElementById('calendarContainer');
      const toolbar = document.getElementById('mainToolbar');
      const metricsEl = document.querySelector('.metrics');

      if (displayMode === 'kanban') {
        if (tableWrap)  tableWrap.style.display = 'none';
        if (kanbanWrap) kanbanWrap.style.display = '';
        if (calWrap)    calWrap.style.display = 'none';
        if (toolbar)    toolbar.style.display = 'none';
        if (metricsEl)  metricsEl.style.display = '';
        document.getElementById('viewTitle').textContent = 'Kanban';
        renderKanban(kanbanWrap);
        // Geen sidebar-item active in kanban-modus
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        return;
      }
      if (displayMode === 'calendar') {
        if (tableWrap)  tableWrap.style.display = 'none';
        if (kanbanWrap) kanbanWrap.style.display = 'none';
        if (calWrap)    calWrap.style.display = '';
        if (toolbar)    toolbar.style.display = 'none';
        if (metricsEl)  metricsEl.style.display = '';
        document.getElementById('viewTitle').textContent = 'Calendar';
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        renderCalendar(calWrap);
        return;
      }
      // Lijst-mode (default)
      if (tableWrap)  tableWrap.style.display = '';
      if (kanbanWrap) kanbanWrap.style.display = 'none';
      if (calWrap)    calWrap.style.display = 'none';
      if (toolbar)    toolbar.style.display = 'flex';

      const expandState = saveExpandState();
      const tbody = document.getElementById('tbody');
      tbody.innerHTML = '';

      let filtered = getViewProjects().filter(p => projectMatchesFilter(p));
      filtered = sortProjecten(filtered);

      if (currentView === 'prullenmand') {
        renderPrullenmand(tbody);
      } else if (currentView === 'voltooid') {
        renderVoltooid(tbody);
      } else if (currentView === 'inbox') {
        renderInbox(tbody);
      } else if (currentView === 'vandaag') {
        renderVandaag(tbody);
      } else if (currentView === 'week') {
        renderWeek(tbody);
      } else if (currentView === 'prioriteit') {
        renderPrioriteit(tbody);
      } else if (currentView === 'zoekresultaten') {
        renderZoekresultaten(tbody);
      } else if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;padding:40px;color:var(--text-2);">
          Geen taken in deze weergave
        </td></tr>`;
      } else {
        filtered.forEach(p => renderProject(p, allSubtaken, allSubsubtaken, tbody));
      }

      const openAll = allProjecten.filter(p => !p.gedaan);
      document.getElementById('mTotal').textContent = openAll.length;
      document.getElementById('mOpen').textContent = allSubtaken.filter(s => !s.gedaan && isActief(s)).length;
      document.getElementById('mPrio').textContent = openAll.filter(p => projectIsPrio(p)).length;
      document.getElementById('mAlles').textContent =
        allSubtaken.filter(s => !s.gedaan && isActief(s)).length +
        allSubsubtaken.filter(s => !s.gedaan && isActief(s)).length;

      updateSidebar();
      const isInbox = currentView === 'inbox';
      const isPrullen = currentView === 'prullenmand';
      document.getElementById('btnAllesVerwerken').style.display = isInbox ? '' : 'none';
      document.getElementById('btnFilterWerk').style.display = isInbox ? 'none' : '';
      document.getElementById('btnFilterPrive').style.display = isInbox ? 'none' : '';
      document.getElementById('btnFilterNatasja').style.display = isInbox ? 'none' : '';

      // In prullenmand-weergave wordt "+ Nieuwe taak" vervangen door "🗑 Alles verwijderen"
      const btnNew = document.querySelector('.btn-new');
      if (btnNew) {
        btnNew.textContent = isPrullen ? '🗑 Alles verwijderen' : '+ Nieuwe taak';
        btnNew.classList.toggle('btn-danger', isPrullen);
      }

      attachToggle();
      restoreExpandState(expandState);
      attachCheckboxes();
      attachStars();
      attachBezig();
      attachEditable();
      attachDeadlines();
      attachAddButtons();
      attachDeleteButtons();
      attachInboxVerwerkt();
      attachPrullenmandButtons();
    }

    // ═══ Init ═══
    async function reloadData() {
      const [projecten, subtaken, subsubtaken] = await Promise.all([
        api('taken', 'order=nr.asc'),
        api('subtaken', 'order=volgorde.asc'),
        api('sub_subtaken', 'order=volgorde.asc'),
      ]);
      allProjecten = projecten;
      allSubtaken = subtaken;
      allSubsubtaken = subsubtaken;
      buildIndexes();
    }

    async function refreshUI() {
      await reloadData();
      renderAll();
    }

    async function cleanupPrullenmand() {
      const cutoff = new Date(Date.now() - 7 * 86400000).toISOString();
      try {
        await delWhere('sub_subtaken', 'verwijderd_op=lt.' + cutoff);
        await delWhere('subtaken', 'verwijderd_op=lt.' + cutoff);
        await delWhere('taken', 'verwijderd_op=lt.' + cutoff);
      } catch(e) { /* stil negeren */ }
    }

    async function init() {
      const tbody = document.getElementById('tbody');
      tbody.innerHTML = `<tr><td colspan="12" style="padding:20px;color:var(--text-2);font-size:12px;">Laden...</td></tr>`;

      try {
        const [projecten, subtaken, subsubtaken] = await Promise.all([
          api('taken', 'order=nr.asc'),
          api('subtaken', 'order=volgorde.asc'),
          api('sub_subtaken', 'order=volgorde.asc'),
        ]);

        allProjecten = projecten;
        allSubtaken = subtaken;
        allSubsubtaken = subsubtaken;
        buildIndexes();

        await cleanupPrullenmand();

        renderAll();
        bindBtnNew();

        document.getElementById('tilePrio').addEventListener('click', () => {
          if (displayMode !== 'lijst') setDisplayMode('lijst');
          currentView = 'prioriteit';
          document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
          document.querySelector('.sidebar-item[data-view="prioriteit"]')?.classList.add('active');
          renderAll();
        });

      } catch (err) {
        document.getElementById('tbody').innerHTML = `
          <tr><td colspan="12" style="text-align:center;padding:40px;color:var(--red);">
            Kan taken niet laden: ${err.message}
          </td></tr>`;
      }
    }

    // ═══ In/uitklappen ═══
    function attachToggle() {
      document.querySelectorAll('.row-project').forEach(row => {
        row.addEventListener('click', (e) => {
          if (e.target.closest('input[type="checkbox"]') || e.target.closest('.star') || e.target.closest('.cb')) return;
          const id = row.dataset.projectId;
          const chev = row.querySelector('.chev');
          const isOpen = chev.classList.contains('open');

          chev.classList.toggle('open');
          document.querySelectorAll(`.row-taak[data-parent="${id}"]`).forEach(r => {
            r.classList.toggle('collapsed', isOpen);
            if (isOpen) {
              const tId = r.dataset.taakId;
              if (tId) {
                const tChev = r.querySelector('.chev');
                if (tChev) tChev.classList.remove('open');
                document.querySelectorAll(`.row-subtaak[data-parent-taak="${tId}"]`).forEach(sr => {
                  sr.classList.add('collapsed');
                });
              }
            }
          });
        });
      });

      document.querySelectorAll('.row-taak').forEach(row => {
        const chev = row.querySelector('.chev');
        if (!chev) return;
        row.addEventListener('click', (e) => {
          if (e.target.closest('.cb') || e.target.closest('.star')) return;
          const tId = row.dataset.taakId;
          const isOpen = chev.classList.contains('open');
          chev.classList.toggle('open');
          document.querySelectorAll(`.row-subtaak[data-parent-taak="${tId}"]`).forEach(r => {
            r.classList.toggle('collapsed', isOpen);
          });
        });
      });
    }

    document.querySelectorAll('.cat-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.cat;
        catFilter = catFilter === cat ? null : cat;
        document.getElementById('btnFilterWerk').classList.toggle('active', catFilter === 'Werk');
        document.getElementById('btnFilterPrive').classList.toggle('active', catFilter === 'Privé');
        document.getElementById('btnFilterNatasja').classList.toggle('active', catFilter === 'Natasja');
        renderAll();
      });
    });

    document.getElementById('btnAllesVerwerken').addEventListener('click', async () => {
      const items = [
        ...allProjecten.filter(p => !p.gedaan && p.inbox).map(p => ({ id: p.id, table: 'taken' })),
        ...allSubtaken.filter(s => !s.gedaan && s.inbox).map(s => ({ id: s.id, table: 'subtaken' })),
        ...allSubsubtaken.filter(ss => !ss.gedaan && ss.inbox).map(ss => ({ id: ss.id, table: 'sub_subtaken' }))
      ];
      try {
        await Promise.all(items.map(i => patch(i.table, i.id, { inbox: false })));
        await refreshUI();
      } catch (err) {
        alert('Verwerken mislukt: ' + err.message);
      }
    });

    document.getElementById('btnCollapseAll').addEventListener('click', () => {
      document.querySelectorAll('.chev').forEach(c => c.classList.remove('open'));
      document.querySelectorAll('.row-taak, .row-subtaak').forEach(r => r.classList.add('collapsed'));
    });
    document.getElementById('btnExpandAll').addEventListener('click', () => {
      document.querySelectorAll('.chev').forEach(c => c.classList.add('open'));
      document.querySelectorAll('.row-taak, .row-subtaak').forEach(r => r.classList.remove('collapsed'));
    });

    function attachEditable() {
      document.querySelectorAll('.editable').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          if (el.querySelector('.edit-input')) return;

          const current = el.textContent.trim();
          const id = el.dataset.id;
          const table = el.dataset.table;
          const field = el.dataset.field;

          const input = document.createElement('input');
          input.className = 'edit-input';
          input.type = 'text';
          input.value = current;
          el.textContent = '';
          el.appendChild(input);
          input.focus();
          input.select();

          const save = async () => {
            const val = input.value.trim();
            el.textContent = val || current;
            if (val && val !== current) {
              try {
                await patch(table, id, { [field]: val });
              } catch (err) {
                el.textContent = current;
                alert('Opslaan mislukt: ' + err.message);
              }
            }
          };

          input.addEventListener('blur', save);
          input.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') input.blur();
            if (ev.key === 'Escape') { el.textContent = current; }
          });
        });
      });
    }

    // ═══ Deadlines: klik om datum te kiezen ═══
    function attachDeadlines() {
      document.querySelectorAll('.editable-dl').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = el.dataset.id;
          const table = el.dataset.table;
          const raw = el.dataset.raw || '';
          const current = el.textContent.trim();

          showDatePicker(el, raw, async (val) => {
            if (val) {
              el.dataset.raw = val;
              const days = daysUntil(val);
              el.className = `editable-dl dl ${days <= 2 ? 'urgent' : days <= 7 ? 'warning' : 'normal'}`;
              el.textContent = formatDate(val);
            } else {
              el.dataset.raw = '';
              el.className = 'editable-dl dl';
              el.textContent = '—';
            }
            if (val !== raw) {
              try {
                await patch(table, id, { deadline: val || null });
                const arr = table === 'subtaken' ? allSubtaken : table === 'sub_subtaken' ? allSubsubtaken : allProjecten;
                const item = arr.find(i => String(i.id) === String(id));
                if (item) item.deadline = val || null;
              } catch (err) {
                el.textContent = current;
                alert('Opslaan mislukt: ' + err.message);
              }
            }
          });
        });
      });
    }

    function showDatePicker(anchorEl, currentValue, onSelect) {
      document.querySelectorAll('.date-picker-popup').forEach(p => p.remove());

      const today = new Date();
      let year, month;
      if (currentValue) {
        const d = new Date(currentValue + 'T00:00:00');
        year = d.getFullYear();
        month = d.getMonth();
      } else {
        year = today.getFullYear();
        month = today.getMonth();
      }

      const MAANDEN = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
      const WEEKDAGEN = ['Ma','Di','Wo','Do','Vr','Za','Zo'];
      const todayStr = today.toISOString().split('T')[0];

      const popup = document.createElement('div');
      popup.style.cssText = 'position:fixed;width:228px;background:#1c1c1e;border:1px solid #3a3a3c;border-radius:10px;padding:12px;z-index:2000;box-shadow:0 8px 32px rgba(0,0,0,.6);user-select:none;font-family:inherit;color:#f5f5f7;';

      function render() {
        const firstDay = new Date(year, month, 1).getDay();
        const startOffset = (firstDay + 6) % 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrev = new Date(year, month, 0).getDate();

        let dayCells = '';
        for (let i = startOffset - 1; i >= 0; i--) {
          dayCells += `<div style="text-align:center;padding:5px 0;font-size:13px;color:#636366;">${daysInPrev - i}</div>`;
        }
        for (let d = 1; d <= daysInMonth; d++) {
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === currentValue;
          const bg = isSelected ? 'background:#0a84ff;' : '';
          const col = isSelected ? 'color:#fff;' : isToday ? 'color:#0a84ff;' : 'color:#f5f5f7;';
          const fw = (isToday || isSelected) ? 'font-weight:700;' : '';
          dayCells += `<div class="dp-day" data-date="${dateStr}" style="text-align:center;padding:5px 0;font-size:13px;border-radius:6px;cursor:pointer;${bg}${col}${fw}">${d}</div>`;
        }
        const total = startOffset + daysInMonth;
        const remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
        for (let d = 1; d <= remaining; d++) {
          dayCells += `<div style="text-align:center;padding:5px 0;font-size:13px;color:#636366;">${d}</div>`;
        }

        const wdHtml = WEEKDAGEN.map(d => `<div style="text-align:center;font-size:11px;color:#636366;padding:2px 0;">${d}</div>`).join('');

        popup.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <button class="dp-prev" style="background:none;border:none;color:#0a84ff;cursor:pointer;font-size:20px;padding:0 6px;line-height:1;border-radius:6px;">‹</button>
            <span style="font-size:13px;font-weight:600;text-transform:capitalize;">${MAANDEN[month]} ${year}</span>
            <button class="dp-next" style="background:none;border:none;color:#0a84ff;cursor:pointer;font-size:20px;padding:0 6px;line-height:1;border-radius:6px;">›</button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px;">${wdHtml}</div>
          <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;">${dayCells}</div>
          <button class="dp-clear" style="display:block;width:100%;margin-top:8px;padding:5px;background:none;border:1px solid #3a3a3c;border-radius:6px;color:#98989d;font-size:12px;cursor:pointer;font-family:inherit;">Deadline wissen</button>
        `;

        popup.querySelector('.dp-prev').addEventListener('click', (e) => { e.stopPropagation(); month--; if (month < 0) { month = 11; year--; } render(); });
        popup.querySelector('.dp-next').addEventListener('click', (e) => { e.stopPropagation(); month++; if (month > 11) { month = 0; year++; } render(); });
        popup.querySelector('.dp-clear').addEventListener('click', (e) => { e.stopPropagation(); popup.remove(); document.removeEventListener('click', outsideHandler); onSelect(''); });

        popup.querySelectorAll('.dp-day').forEach(el => {
          el.addEventListener('mouseenter', () => { if (el.dataset.date !== currentValue) el.style.background = '#3a3a3c'; });
          el.addEventListener('mouseleave', () => { if (el.dataset.date !== currentValue) el.style.background = ''; });
          el.addEventListener('click', (e) => { e.stopPropagation(); popup.remove(); document.removeEventListener('click', outsideHandler); onSelect(el.dataset.date); });
        });
      }

      render();
      document.body.appendChild(popup);

      const rect = anchorEl.getBoundingClientRect();
      let top = rect.bottom + 4;
      let left = rect.left;
      if (left + 240 > window.innerWidth) left = window.innerWidth - 244;
      if (top + 300 > window.innerHeight) top = rect.top - 304;
      popup.style.top = top + 'px';
      popup.style.left = left + 'px';

      function outsideHandler() {
        popup.remove();
        document.removeEventListener('click', outsideHandler);
      }
      setTimeout(() => document.addEventListener('click', outsideHandler), 0);
    }


    // ═══ + knoppen: taken toevoegen ═══
    function attachAddButtons() {
      document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const type = btn.dataset.add;
          const parentId = btn.dataset.parentId;

          const label = type === 'subtaak' ? 'Nieuwe taak' : 'Nieuwe subtaak';
          const tekst = await modalInput(label, 'Naam', 'Wat moet er gedaan worden?');
          if (!tekst) return;

          try {
            if (type === 'subtaak') {
              const bestaande = document.querySelectorAll(`.row-taak[data-parent="${parentId}"]`);
              const volgorde = bestaande.length + 1;
              await post('subtaken', {
                taak_id: parentId,
                tekst: tekst.trim(),
                volgorde: volgorde
              });
            } else if (type === 'subsubtaak') {
              const bestaande = document.querySelectorAll(`.row-subtaak[data-parent-taak="${parentId}"]`);
              const volgorde = bestaande.length + 1;
              await post('sub_subtaken', {
                subtaak_id: parentId,
                tekst: tekst.trim(),
                volgorde: volgorde
              });
            }
            await refreshUI();
          } catch (err) {
            alert('Toevoegen mislukt: ' + err.message);
          }
        });
      });
    }

    // ═══ Nieuwe taak knop ═══
    let btnNewBound = false;
    function bindBtnNew() {
      if (btnNewBound) return;
      btnNewBound = true;
      document.querySelector('.btn-new').addEventListener('click', async () => {
        // In prullenmand-weergave: alles permanent verwijderen
        if (currentView === 'prullenmand') {
          const total = allProjecten.filter(isVerwijderd).length +
                        allSubtaken.filter(isVerwijderd).length +
                        allSubsubtaken.filter(isVerwijderd).length;
          if (total === 0) {
            showToast('Prullenmand is al leeg');
            return;
          }
          const ok = await modalConfirm(
            'Prullenmand leegmaken',
            `Weet je zeker dat je ${total} item${total === 1 ? '' : 's'} definitief wil verwijderen? Dit kan niet ongedaan gemaakt worden.`,
            'Definitief verwijderen',
            true
          );
          if (!ok) return;
          try {
            await delWhere('sub_subtaken', 'verwijderd_op=not.is.null');
            await delWhere('subtaken', 'verwijderd_op=not.is.null');
            await delWhere('taken', 'verwijderd_op=not.is.null');
            await refreshUI();
            showToast('Prullenmand geleegd');
          } catch (err) {
            showToast('Verwijderen mislukt: ' + err.message);
          }
          return;
        }

        const result = await modalNewProject('Nieuw project');
        if (!result) return;

        try {
          const meta = await api('meta', 'sleutel=eq.volgend_nr');
          const nr = parseInt(meta[0]?.waarde || '99');

          await post('taken', {
            nr: nr,
            taak: result.naam,
            categorie: result.cat,
            prioriteit: 'normaal'
          });

          await fetch(`${SB}/rest/v1/meta?sleutel=eq.volgend_nr`, {
            method: 'PATCH',
            headers: { ...hdrs, 'Prefer': 'return=representation' },
            body: JSON.stringify({ waarde: String(nr + 1) })
          });

          await refreshUI();
        } catch (err) {
          alert('Toevoegen mislukt: ' + err.message);
        }
      });
    }

    // ═══ Verwijder knoppen ═══
    async function setCascadeVerwijderd(id, table, timestamp) {
      await patch(table, id, { verwijderd_op: timestamp });
      if (table === 'taken') {
        for (const sub of allSubtaken.filter(s => s.taak_id === id)) {
          await patch('subtaken', sub.id, { verwijderd_op: timestamp });
          for (const ss of allSubsubtaken.filter(s => s.subtaak_id === sub.id)) {
            await patch('sub_subtaken', ss.id, { verwijderd_op: timestamp });
          }
        }
      } else if (table === 'subtaken') {
        for (const ss of allSubsubtaken.filter(s => s.subtaak_id === id)) {
          await patch('sub_subtaken', ss.id, { verwijderd_op: timestamp });
        }
      }
    }

    function attachDeleteButtons() {
      document.querySelectorAll('.del-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = btn.dataset.delId;
          const table = btn.dataset.delTable;

          const bevestig = await modalConfirm('Verwijderen', 'Dit item naar de prullenmand verplaatsen?', 'Verwijderen', true);
          if (!bevestig) return;

          try {
            await setCascadeVerwijderd(id, table, new Date().toISOString());
            await refreshUI();
            showToast('Naar prullenmand verplaatst', async () => {
              await setCascadeVerwijderd(id, table, null);
              await refreshUI();
            });
          } catch (err) {
            showToast('Verwijderen mislukt: ' + err.message);
          }
        });
      });
    }

    // ═══ Inbox: verwerkt (inbox=false) ═══
    function attachInboxVerwerkt() {
      document.querySelectorAll('.inbox-verwerkt-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = btn.dataset.verwerktId;
          const table = btn.dataset.verwerktTable;
          try {
            await patch(table, id, { inbox: false });
            await refreshUI();
          } catch (err) {
            alert('Verwerken mislukt: ' + err.message);
          }
        });
      });
    }

    // ═══ Prullenmand: herstellen en definitief verwijderen ═══
    function attachPrullenmandButtons() {
      document.querySelectorAll('.restore-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = btn.dataset.restoreId;
          const table = btn.dataset.restoreTable;
          try {
            await patch(table, id, { verwijderd_op: null });
            await refreshUI();
          } catch (err) {
            alert('Herstellen mislukt: ' + err.message);
          }
        });
      });

      document.querySelectorAll('.permanent-del-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          if (!await modalConfirm('Definitief verwijderen', 'Dit kan niet ongedaan worden. Weet je het zeker?', 'Definitief verwijderen', true)) return;
          const id = btn.dataset.permId;
          const table = btn.dataset.permTable;
          try {
            await del(table, id);
            await refreshUI();
          } catch (err) {
            alert('Verwijderen mislukt: ' + err.message);
          }
        });
      });
    }

    // ═══ Checkboxes: afvinken ═══
    function attachCheckboxes() {
      document.querySelectorAll('.cb').forEach(cb => {
        cb.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = cb.dataset.id;
          const table = cb.dataset.table;
          if (!id || !table) return;

          if (cb.classList.contains('done')) {
            try {
              await patch(table, id, { gedaan: false, gedaan_datum: null });
              await refreshUI();
            } catch (err) {
              alert('Terugzetten mislukt: ' + err.message);
            }
            return;
          }

          cb.textContent = '✓';
          cb.classList.add('done');
          cb.style.pointerEvents = 'none';

          try {
            await patch(table, id, {
              gedaan: true,
              gedaan_datum: new Date().toISOString().split('T')[0]
            });
            await refreshUI();
            showToast('Taak afgerond', async () => {
              await patch(table, id, { gedaan: false, gedaan_datum: null });
              await refreshUI();
            });
          } catch (err) {
            cb.textContent = '○';
            cb.classList.remove('done');
            cb.style.pointerEvents = '';
            showToast('Opslaan mislukt: ' + err.message);
          }
        });
      });
    }

    // ═══ Prio sterren: toggle ═══
    function attachStars() {
      document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = star.dataset.id;
          const table = star.dataset.table;
          const field = star.dataset.field;
          if (!id || !table || !field) return;

          const isOn = star.classList.contains('on');
          star.classList.toggle('on');
          star.classList.toggle('off');

          let value;
          if (field === 'prioriteit' && table === 'taken') {
            value = isOn ? 'normaal' : 'hoog';
          } else {
            value = !isOn;
          }

          try {
            await patch(table, id, { [field]: value });
          } catch (err) {
            star.classList.toggle('on');
            star.classList.toggle('off');
            alert('Opslaan mislukt: ' + err.message);
          }
        });
      });
    }

    // ═══ Bezig-toggle: aan/uit ═══
    function attachBezig() {
      document.querySelectorAll('.bz').forEach(el => {
        el.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = el.dataset.bzId;
          const table = el.dataset.bzTable;
          if (!id || !table) return;

          const isOn = el.classList.contains('on');
          el.classList.toggle('on');
          el.classList.toggle('off');
          el.textContent = isOn ? '○' : '●';

          try {
            await patch(table, id, { bezig: !isOn });
            // Lokale state bijwerken zodat de Kanban-view straks meteen klopt
            const arr = table === 'taken' ? allProjecten : table === 'subtaken' ? allSubtaken : allSubsubtaken;
            const item = arr.find(x => x.id === id);
            if (item) item.bezig = !isOn;
          } catch (err) {
            el.classList.toggle('on');
            el.classList.toggle('off');
            el.textContent = isOn ? '●' : '○';
            alert('Opslaan mislukt: ' + err.message);
          }
        });
      });
    }

    // ═══ View-switcher: Lijst | Kanban | Calendar ═══
    function setDisplayMode(mode) {
      displayMode = mode;
      document.querySelectorAll('.vs-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.mode === mode);
      });
    }
    document.querySelectorAll('.vs-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setDisplayMode(btn.dataset.mode);
        renderAll();
      });
    });

    // ═══ Sidebar navigatie ═══
    document.querySelectorAll('.sidebar-item[data-view]').forEach(item => {
      item.addEventListener('click', () => {
        // Sidebar nav betekent: terug naar Lijst-modus
        if (displayMode !== 'lijst') setDisplayMode('lijst');
        currentView = item.dataset.view;
        renderAll();
      });
    });

    // ═══ Zoekfunctie ═══
    let searchTimeout;
    let viewBeforeSearch = currentView;
    document.getElementById('searchInput').addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const q = e.target.value.trim();
        if (q) {
          if (currentView !== 'zoekresultaten') {
            viewBeforeSearch = currentView;
            currentView = 'zoekresultaten';
          }
          searchQuery = q;
        } else {
          searchQuery = '';
          if (currentView === 'zoekresultaten') {
            currentView = viewBeforeSearch;
          }
        }
        renderAll();
      }, 200);
    });

    // Projecten in/uitklappen
    document.getElementById('projectenToggle').addEventListener('click', () => {
      const list = document.getElementById('sidebarProjecten');
      const chev = document.getElementById('projectenChev');
      const isHidden = list.style.display === 'none';
      list.style.display = isHidden ? 'block' : 'none';
      chev.classList.toggle('open', isHidden);
    });

    init();
