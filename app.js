    // ═══ Kolom-header filter/sort popups ═══
    let allProjecten = [], allSubtaken = [], allSubsubtaken = [];
    let subsByProject = new Map();
    let subsubsBySubtaak = new Map();
    let currentSort = null;
    let activeFilters = {};
    let currentView = 'alle';
    let searchQuery = '';

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
        case 'cat': return ['Werk', 'Privé'];
        case 'project': return [...new Set(allProjecten.filter(p => !p.gedaan).map(p => p.taak))].sort();
        case 'taak': return [...new Set(allSubtaken.filter(s => !s.gedaan).map(s => s.tekst))].sort();
        case 'deadline': return ['Vandaag', 'Deze week', 'Heeft deadline', 'Geen deadline'];
        case 'geschat': return GESCHAT_OPTIES.filter(o => o);
        case 'context': return CONTEXT_OPTIES;
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
        options.forEach(opt => {
          const label = document.createElement('label');
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.value = opt;
          cb.checked = !currentFilter || currentFilter.has(opt);
          checkboxes.push(cb);
          label.appendChild(cb);
          label.appendChild(document.createTextNode(opt));
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
      if (mode === 'vandaag' && dl === 0) return true;
      if (mode === 'week' && dl !== null && dl >= 0 && dl <= 7) return true;
      return getSubsFor(project.id).some(s => {
        if (s.gedaan) return false;
        const d = s.deadline ? daysUntil(s.deadline) : null;
        if (mode === 'vandaag') return d === 0;
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
        case 'vandaag': return 'Vandaag';
        case 'week': return 'Deze week';
        case 'prioriteit': return 'Prioriteit';
        case 'voltooid': return 'Voltooid';
        default:
          if (currentView.startsWith('project:')) {
            const pid = currentView.split(':')[1];
            const p = allProjecten.find(pr => pr.id === pid);
            return p ? p.taak : 'Project';
          }
          return 'Taken';
      }
    }

    function updateSidebar() {
      const open = allProjecten.filter(p => !p.gedaan);
      const openSubs = allSubtaken.filter(s => !s.gedaan);

      const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val || ''; };
      el('badgeAlle', openSubs.length);
      const inboxCount = countInbox();
      el('badgeInbox', inboxCount || '');
      el('badgeVandaag', open.filter(p => projectHasDeadline(p, 'vandaag')).length || '');
      el('badgeWeek', open.filter(p => projectHasDeadline(p, 'week')).length || '');
      el('badgePrio', open.filter(p => projectIsPrio(p)).length || '');
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
      open.forEach(p => {
        const count = getSubsFor(p.id).filter(s => !s.gedaan && isActief(s)).length;
        const isActive = currentView === `project:${p.id}`;
        const div = document.createElement('div');
        div.className = 'sidebar-item' + (isActive ? ' active' : '');
        div.dataset.view = `project:${p.id}`;
        div.innerHTML = `<span class="icon">▸</span> ${p.taak} <span class="badge">${count || ''}</span>`;
        div.addEventListener('click', () => {
          currentView = `project:${p.id}`;
          renderAll();
        });
        container.appendChild(div);
      });

      document.getElementById('viewTitle').textContent = getViewTitle();
    }

    function renderAll() {
      const tbody = document.getElementById('tbody');
      tbody.innerHTML = '';

      let filtered = getViewProjects().filter(p => projectMatchesFilter(p));
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(p => {
          if (p.taak && p.taak.toLowerCase().includes(q)) return true;
          const subs = allSubtaken.filter(s => s.taak_id === p.id);
          if (subs.some(s => s.tekst && s.tekst.toLowerCase().includes(q))) return true;
          const subIds = subs.map(s => s.id);
          return allSubsubtaken.some(ss => subIds.includes(ss.subtaak_id) && ss.tekst && ss.tekst.toLowerCase().includes(q));
        });
      }
      filtered = sortProjecten(filtered);

      if (currentView === 'prullenmand') {
        renderPrullenmand(tbody);
      } else if (currentView === 'voltooid') {
        renderVoltooid(tbody);
      } else if (currentView === 'inbox') {
        renderInbox(tbody);
      } else if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;padding:40px;color:var(--text-2);">
          Geen taken in deze weergave
        </td></tr>`;
      } else {
        filtered.forEach(p => renderProject(p, allSubtaken, allSubsubtaken, tbody));
      }

      const openAll = allProjecten.filter(p => !p.gedaan);
      document.getElementById('mTotal').textContent = openAll.length;
      document.getElementById('mOpen').textContent = allSubtaken.filter(s => !s.gedaan).length;
      document.getElementById('mWerk').textContent = openAll.filter(p => p.categorie === 'Werk').length;
      document.getElementById('mPrio').textContent = openAll.filter(p => projectIsPrio(p)).length;

      updateSidebar();

      attachToggle();
      attachCheckboxes();
      attachStars();
      attachEditable();
      attachNotities();
      attachDeadlines();
      attachWerkelijk();
      attachSelects();
      attachAddButtons();
      attachDeleteButtons();
      attachPrullenmandButtons();
    }

    // ═══ Init ═══
    async function reloadData() {
      const [projecten, subtaken, subsubtaken] = await Promise.all([
        api('taken', 'order=nr.asc'),
        api('subtaken', 'order=volgorde.asc'),
        api('sub_subtaken', 'order=volgorde.asc')
      ]);
      allProjecten = projecten;
      allSubtaken = subtaken;
      allSubsubtaken = subsubtaken;
      buildIndexes();
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
      tbody.innerHTML = `<tr><td colspan="11" style="padding:20px;color:var(--text-2);font-size:12px;">Laden...</td></tr>`;

      try {
        const [projecten, subtaken, subsubtaken] = await Promise.all([
          api('taken', 'order=nr.asc'),
          api('subtaken', 'order=volgorde.asc'),
          api('sub_subtaken', 'order=volgorde.asc')
        ]);

        allProjecten = projecten;
        allSubtaken = subtaken;
        allSubsubtaken = subsubtaken;
        buildIndexes();

        await cleanupPrullenmand();

        renderAll();
        bindBtnNew();

      } catch (err) {
        document.getElementById('tbody').innerHTML = `
          <tr><td colspan="11" style="text-align:center;padding:40px;color:var(--red);">
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

    document.getElementById('btnCollapseAll').addEventListener('click', () => {
      document.querySelectorAll('.chev').forEach(c => c.classList.remove('open'));
      document.querySelectorAll('.row-taak, .row-subtaak').forEach(r => r.classList.add('collapsed'));
    });
    document.getElementById('btnExpandAll').addEventListener('click', () => {
      document.querySelectorAll('.chev').forEach(c => c.classList.add('open'));
      document.querySelectorAll('.row-taak, .row-subtaak').forEach(r => r.classList.remove('collapsed'));
    });

    // ═══ Tekstvelden: klik om te bewerken ═══
    function attachNotities() {
      document.querySelectorAll('.notitie-cel').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          if (el.querySelector('textarea')) return;

          const id = el.dataset.id;
          const table = el.dataset.table;
          const current = el.dataset.notitie || '';

          const ta = document.createElement('textarea');
          ta.className = 'edit-input notitie-ta';
          ta.value = current;
          ta.rows = 3;
          el.innerHTML = '';
          el.appendChild(ta);
          ta.focus();

          const save = async () => {
            const val = ta.value.trim();
            el.dataset.notitie = val;
            el.innerHTML = val ? '📝' : '<span class="notitie-add">+</span>';
            if (val !== current) {
              try {
                await patch(table, id, { notities: val || null });
              } catch (err) {
                el.innerHTML = current ? '📝' : '<span class="notitie-add">+</span>';
                el.dataset.notitie = current;
                alert('Opslaan mislukt: ' + err.message);
              }
            }
          };

          ta.addEventListener('blur', save);
          ta.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape') {
              el.dataset.notitie = current;
              el.innerHTML = current ? '📝' : '<span class="notitie-add">+</span>';
            }
          });
        });
      });
    }

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
          if (el.querySelector('input')) return;

          const id = el.dataset.id;
          const table = el.dataset.table;
          const raw = el.dataset.raw || '';
          const current = el.textContent.trim();

          const input = document.createElement('input');
          input.className = 'edit-input';
          input.type = 'date';
          input.value = raw;
          input.style.width = '130px';
          el.textContent = '';
          el.appendChild(input);
          input.focus();

          const save = async () => {
            const val = input.value;
            if (val) {
              el.dataset.raw = val;
              const days = daysUntil(val);
              el.className = `editable-dl dl ${days <= 7 ? 'urgent' : 'normal'}`;
              el.textContent = formatDate(val);
            } else {
              el.dataset.raw = '';
              el.className = 'editable-dl dl';
              el.textContent = '—';
            }

            if (val !== raw) {
              try {
                await patch(table, id, { deadline: val || null });
              } catch (err) {
                el.textContent = current;
                alert('Opslaan mislukt: ' + err.message);
              }
            }
          };

          input.addEventListener('blur', save);
          input.addEventListener('change', () => input.blur());
          input.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape') { el.textContent = current; }
          });
        });
      });
    }

    // ═══ Werkelijk: klik om minuten in te voeren ═══
    function attachWerkelijk() {
      document.querySelectorAll('.editable-num').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          if (el.querySelector('input')) return;

          const id = el.dataset.id;
          const table = el.dataset.table;
          const current = el.textContent.trim();
          const currentNum = parseInt(current) || '';

          const input = document.createElement('input');
          input.className = 'edit-input';
          input.type = 'number';
          input.min = '0';
          input.placeholder = 'min';
          input.value = currentNum;
          input.style.width = '60px';
          el.textContent = '';
          el.appendChild(input);
          input.focus();
          input.select();

          const save = async () => {
            const val = parseInt(input.value) || null;
            el.textContent = val ? val + 'm' : '—';

            if (val !== (parseInt(current) || null)) {
              try {
                await patch(table, id, { tijd_uitgevoerd: val });
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

    // ═══ Geschat & Context: dropdown selectie ═══
    function attachSelects() {
      document.querySelectorAll('.editable-select').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          document.querySelectorAll('.select-popup').forEach(p => p.remove());

          const id = el.dataset.id;
          const table = el.dataset.table;
          const field = el.dataset.field;
          const type = el.dataset.type;

          const popup = document.createElement('div');
          popup.className = 'select-popup';

          if (type === 'geschat') {
            const current = el.textContent.trim();
            GESCHAT_OPTIES.forEach(opt => {
              const label = document.createElement('label');
              const radio = document.createElement('input');
              radio.type = 'radio';
              radio.name = 'geschat_' + id;
              radio.value = opt;
              radio.checked = (opt === current) || (opt === '' && current === '—');
              label.appendChild(radio);
              label.appendChild(document.createTextNode(opt || 'Geen'));
              label.addEventListener('click', async () => {
                el.textContent = opt || '—';
                popup.remove();
                try {
                  await patch(table, id, { [field]: opt || null });
                } catch (err) {
                  el.textContent = current;
                  alert('Opslaan mislukt: ' + err.message);
                }
              });
              popup.appendChild(label);
            });
          } else if (type === 'context') {
            let selected = [];
            try { selected = JSON.parse(el.dataset.raw || '[]'); } catch(e) {}

            CONTEXT_OPTIES.forEach(opt => {
              const label = document.createElement('label');
              const cb = document.createElement('input');
              cb.type = 'checkbox';
              cb.value = opt;
              cb.checked = selected.includes(opt);
              cb.addEventListener('change', () => {
                if (cb.checked) {
                  selected.push(opt);
                } else {
                  selected = selected.filter(s => s !== opt);
                }
              });
              label.appendChild(cb);
              label.appendChild(document.createTextNode(opt));
              popup.appendChild(label);
            });

            const saveBtn = document.createElement('div');
            saveBtn.style.cssText = 'padding:6px 14px;text-align:center;';
            saveBtn.innerHTML = '<button style="padding:4px 16px;border:none;background:var(--accent);color:#fff;border-radius:6px;font-size:11px;cursor:pointer;font-family:inherit;">Opslaan</button>';
            saveBtn.querySelector('button').addEventListener('click', async () => {
              el.textContent = selected.length > 0 ? selected.join(', ') : '—';
              el.dataset.raw = JSON.stringify(selected);
              popup.remove();
              try {
                await patch(table, id, { [field]: selected.length > 0 ? selected : null });
              } catch (err) {
                alert('Opslaan mislukt: ' + err.message);
              }
            });
            popup.appendChild(saveBtn);
          }

          const rect = el.getBoundingClientRect();
          popup.style.position = 'fixed';
          popup.style.left = rect.left + 'px';
          popup.style.top = (rect.bottom + 4) + 'px';
          document.body.appendChild(popup);

          const closePopup = (ev) => {
            if (!popup.contains(ev.target) && ev.target !== el) {
              popup.remove();
              document.removeEventListener('click', closePopup);
            }
          };
          setTimeout(() => document.addEventListener('click', closePopup), 0);
        });
      });
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
                sub_id: '',
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
            await reloadData();
            renderAll();
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

          await reloadData();
          renderAll();
        } catch (err) {
          alert('Toevoegen mislukt: ' + err.message);
        }
      });
    }

    // ═══ Verwijder knoppen ═══
    function attachDeleteButtons() {
      document.querySelectorAll('.del-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = btn.dataset.delId;
          const table = btn.dataset.delTable;

          const bevestig = await modalConfirm('Verwijderen', 'Dit item naar de prullenmand verplaatsen?', 'Verwijderen', true);
          if (!bevestig) return;

          try {
            await patch(table, id, { verwijderd_op: new Date().toISOString() });

            if (table === 'taken') {
              const subs = allSubtaken.filter(s => s.taak_id === id);
              for (const sub of subs) {
                await patch('subtaken', sub.id, { verwijderd_op: new Date().toISOString() });
                const subsubs = allSubsubtaken.filter(ss => ss.subtaak_id === sub.id);
                for (const ss of subsubs) {
                  await patch('sub_subtaken', ss.id, { verwijderd_op: new Date().toISOString() });
                }
              }
            } else if (table === 'subtaken') {
              const subsubs = allSubsubtaken.filter(ss => ss.subtaak_id === id);
              for (const ss of subsubs) {
                await patch('sub_subtaken', ss.id, { verwijderd_op: new Date().toISOString() });
              }
            }

            await reloadData();
            renderAll();
            showToast('Naar prullenmand verplaatst', async () => {
              await patch(table, id, { verwijderd_op: null });
              if (table === 'taken') {
                for (const sub of allSubtaken.filter(s => s.taak_id === id)) {
                  await patch('subtaken', sub.id, { verwijderd_op: null });
                  for (const ss of allSubsubtaken.filter(s => s.subtaak_id === sub.id)) {
                    await patch('sub_subtaken', ss.id, { verwijderd_op: null });
                  }
                }
              } else if (table === 'subtaken') {
                for (const ss of allSubsubtaken.filter(s => s.subtaak_id === id)) {
                  await patch('sub_subtaken', ss.id, { verwijderd_op: null });
                }
              }
              await reloadData();
              renderAll();
            });
          } catch (err) {
            showToast('Verwijderen mislukt: ' + err.message);
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
            await reloadData();
            renderAll();
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
            await reloadData();
            renderAll();
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
              await reloadData();
              renderAll();
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
            await reloadData();
            renderAll();
            showToast('Taak afgerond', async () => {
              await patch(table, id, { gedaan: false, gedaan_datum: null });
              await reloadData();
              renderAll();
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

    // ═══ Sidebar navigatie ═══
    document.querySelectorAll('.sidebar-item[data-view]').forEach(item => {
      if (item.dataset.view === 'beheer') return;
      item.addEventListener('click', () => {
        currentView = item.dataset.view;
        renderAll();
      });
    });

    // ═══ Zoekfunctie ═══
    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchQuery = e.target.value.trim();
        if (searchQuery && currentView !== 'alle') {
          currentView = 'alle';
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
