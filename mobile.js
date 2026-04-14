    // ═══ Mobile state ═══
    let allTaken = [], allSubtaken = [], allSubsubtaken = [];
    let currentView = 'inbox'; // 'inbox' | 'vandaag' | 'prioriteit' | 'voltooid' | 'prullenmand' | 'project:<id>'
    let viewItems = []; // items voor de huidige view (vlakke lijst)

    // ═══ View configuratie ═══
    const VIEW_TITLES = {
      inbox: 'Inbox',
      vandaag: 'Vandaag & Verlopen',
      prioriteit: 'Prioriteit',
      voltooid: 'Voltooid',
      prullenmand: 'Prullenmand'
    };

    const VIEW_EMPTY = {
      inbox: 'Inbox is leeg',
      vandaag: 'Niets voor vandaag',
      prioriteit: 'Geen prioriteitstaken',
      voltooid: 'Nog niets voltooid',
      prullenmand: 'Prullenmand is leeg'
    };

    // ═══ Helpers ═══
    function toFlat(t, table) {
      return { id: t.id, table, tekst: table === 'taken' ? t.taak : t.tekst, gedaan: t.gedaan, raw: t };
    }

    function allFlat() {
      return [
        ...allTaken.map(t => toFlat(t, 'taken')),
        ...allSubtaken.map(s => toFlat(s, 'subtaken')),
        ...allSubsubtaken.map(ss => toFlat(ss, 'sub_subtaken'))
      ];
    }

    function isToday(deadline) {
      if (!deadline) return false;
      const today = new Date().toISOString().split('T')[0];
      return deadline <= today;
    }

    // ═══ Data laden ═══
    async function loadData() {
      try {
        const [taken, subs, subsubs] = await Promise.all([
          api('taken', 'order=nr.asc'),
          api('subtaken', 'order=volgorde.asc'),
          api('sub_subtaken', 'order=volgorde.asc')
        ]);
        allTaken = taken;
        allSubtaken = subs;
        allSubsubtaken = subsubs;
        renderView();
        renderMenu();
      } catch (err) {
        showToast('Laden mislukt: ' + err.message);
      }
    }

    // ═══ Filter items per view ═══
    function getViewItems() {
      const all = allFlat();

      if (currentView === 'inbox') {
        return all.filter(i => i.raw.inbox && !i.raw.verwijderd_op && !i.gedaan);
      }
      if (currentView === 'vandaag') {
        return all.filter(i => !i.raw.verwijderd_op && !i.gedaan && isToday(i.raw.deadline));
      }
      if (currentView === 'prioriteit') {
        return all.filter(i => !i.raw.verwijderd_op && !i.gedaan && isPrio(i));
      }
      if (currentView === 'voltooid') {
        return all.filter(i => i.gedaan && !i.raw.verwijderd_op);
      }
      if (currentView === 'prullenmand') {
        return all.filter(i => i.raw.verwijderd_op);
      }
      if (currentView.startsWith('project:')) {
        const projectId = currentView.slice('project:'.length);
        const subs = allSubtaken.filter(s => s.taak_id === projectId && !s.verwijderd_op);
        const subIds = subs.map(s => s.id);
        const subsubs = allSubsubtaken.filter(ss => subIds.includes(ss.subtaak_id) && !ss.verwijderd_op);
        return [
          ...subs.map(s => toFlat(s, 'subtaken')),
          ...subsubs.map(ss => toFlat(ss, 'sub_subtaken'))
        ].filter(i => !i.gedaan);
      }
      return [];
    }

    function isPrio(item) {
      if (item.table === 'taken') return item.raw.prioriteit === 'hoog';
      if (item.table === 'subtaken') return !!item.raw.prio_ster;
      if (item.table === 'sub_subtaken') return !!item.raw.prioriteit;
      return false;
    }

    // ═══ Render hoofdscherm ═══
    function renderView() {
      viewItems = getViewItems();

      // Titel + count
      let title;
      if (currentView.startsWith('project:')) {
        const projectId = currentView.slice('project:'.length);
        const project = allTaken.find(t => t.id === projectId);
        title = project ? project.taak : 'Project';
      } else {
        title = VIEW_TITLES[currentView] || 'Taken';
      }
      document.getElementById('viewTitle').textContent = title;
      document.getElementById('viewCount').textContent = viewItems.length;

      // Empty state
      const empty = document.getElementById('emptyState');
      const list = document.getElementById('taskList');
      if (viewItems.length === 0) {
        list.innerHTML = '';
        empty.textContent = VIEW_EMPTY[currentView] || 'Geen taken';
        empty.hidden = false;
        return;
      }
      empty.hidden = true;

      list.innerHTML = viewItems.map(item => `
        <li class="task-item" data-id="${item.id}" data-table="${item.table}">
          <button class="task-checkbox ${item.gedaan ? 'done' : ''}" data-action="toggle">${item.gedaan ? '✓' : ''}</button>
          <span class="task-text ${item.gedaan ? 'done' : ''}">${esc(item.tekst || '')}</span>
          <button class="task-delete" data-action="delete" aria-label="Verwijderen">🗑</button>
        </li>
      `).join('');

      // FAB alleen tonen in inbox (en later project-view met add)
      document.getElementById('fabAdd').style.display = currentView === 'inbox' ? 'flex' : 'none';
    }

    // ═══ Render menu ═══
    function renderMenu() {
      const all = allFlat();
      const actief = all.filter(i => !i.raw.verwijderd_op && !i.gedaan);

      document.getElementById('countInbox').textContent = actief.filter(i => i.raw.inbox).length;
      document.getElementById('countVandaag').textContent = actief.filter(i => isToday(i.raw.deadline)).length;
      document.getElementById('countPrio').textContent = actief.filter(i => isPrio(i)).length;
      document.getElementById('countVoltooid').textContent = all.filter(i => i.gedaan && !i.raw.verwijderd_op).length;
      document.getElementById('countPrullen').textContent = all.filter(i => i.raw.verwijderd_op).length;

      // Projectenlijst
      const projectList = document.getElementById('projectList');
      projectList.innerHTML = allTaken.filter(t => !t.verwijderd_op).map(p => {
        const subs = allSubtaken.filter(s => s.taak_id === p.id && !s.verwijderd_op && !s.gedaan);
        const subIds = subs.map(s => s.id);
        const subsubs = allSubsubtaken.filter(ss => subIds.includes(ss.subtaak_id) && !ss.verwijderd_op && !ss.gedaan);
        const total = subs.length + subsubs.length;
        return `
          <button class="menu-item project-item" data-view="project:${p.id}">
            <span class="menu-icon">📁</span>
            <span class="menu-label">${esc(p.taak)}</span>
            <span class="menu-count">${total}</span>
          </button>
        `;
      }).join('');

      // Highlight actieve view
      document.querySelectorAll('.menu-item').forEach(el => {
        el.classList.toggle('active', el.dataset.view === currentView);
      });
    }

    // ═══ Schermen wisselen ═══
    function showMain() {
      document.getElementById('screenMain').hidden = false;
      document.getElementById('screenMenu').hidden = true;
    }

    function showMenu() {
      renderMenu();
      document.getElementById('screenMain').hidden = true;
      document.getElementById('screenMenu').hidden = false;
    }

    function switchView(view) {
      currentView = view;
      renderView();
      showMain();
    }

    // ═══ Event handlers ═══
    document.getElementById('btnMenu').addEventListener('click', showMenu);
    document.getElementById('btnCloseMenu').addEventListener('click', showMain);

    document.getElementById('screenMenu').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-view]');
      if (!btn) return;
      switchView(btn.dataset.view);
    });

    // ═══ Task interactions ═══
    document.getElementById('taskList').addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const li = btn.closest('.task-item');
      const id = li.dataset.id;
      const table = li.dataset.table;
      const action = btn.dataset.action;

      if (action === 'toggle') {
        const item = viewItems.find(i => i.id === id && i.table === table);
        if (!item) return;
        const nieuw = !item.gedaan;
        try {
          await patch(table, id, {
            gedaan: nieuw,
            gedaan_datum: nieuw ? new Date().toISOString().split('T')[0] : null
          });
          await loadData();
        } catch (err) {
          showToast('Opslaan mislukt');
        }
      }

      if (action === 'delete') {
        try {
          await patch(table, id, { verwijderd_op: new Date().toISOString() });
          await loadData();
          showToast('Naar prullenmand');
        } catch (err) {
          showToast('Verwijderen mislukt');
        }
      }
    });

    // ═══ Nieuwe taak modal ═══
    const overlay = document.getElementById('modalOverlay');
    const input = document.getElementById('newTaskInput');

    function openModal() {
      overlay.hidden = false;
      input.value = '';
      setTimeout(() => input.focus(), 50);
    }

    function closeModal() {
      overlay.hidden = true;
      input.blur();
    }

    document.getElementById('fabAdd').addEventListener('click', openModal);
    document.getElementById('btnCancel').addEventListener('click', closeModal);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    document.getElementById('btnSave').addEventListener('click', saveNewTask);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveNewTask();
      if (e.key === 'Escape') closeModal();
    });

    async function saveNewTask() {
      const tekst = input.value.trim();
      if (!tekst) return;
      try {
        const meta = await api('meta', 'sleutel=eq.volgend_nr&select=waarde');
        const nr = parseInt(meta[0]?.waarde || '99');

        await post('taken', {
          nr: nr,
          taak: tekst,
          categorie: 'Werk',
          prioriteit: 'normaal',
          inbox: true
        });

        await fetch(`${SB}/rest/v1/meta?sleutel=eq.volgend_nr`, {
          method: 'PATCH',
          headers: hdrs,
          body: JSON.stringify({ waarde: String(nr + 1) })
        });

        closeModal();
        await loadData();
        showToast('Taak toegevoegd');
      } catch (err) {
        showToast('Toevoegen mislukt: ' + err.message);
      }
    }

    // ═══ Swipe gestures ═══
    // Swipe van linkerrand naar rechts → open menu
    // Swipe in menu naar links → sluit menu
    let touchStartX = 0, touchStartY = 0, touchActive = false;

    document.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      touchActive = true;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      if (!touchActive) return;
      touchActive = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartX;
      const dy = Math.abs(t.clientY - touchStartY);
      // Horizontaal gebaar: dx moet groter zijn dan verticale drift
      if (dy > 60) return;

      const menuOpen = !document.getElementById('screenMenu').hidden;

      // Open menu: swipe van linkerrand (<30px) naar rechts, minstens 80px
      if (!menuOpen && touchStartX < 30 && dx > 80) {
        showMenu();
      }
      // Sluit menu: swipe naar links in menu, minstens 80px
      if (menuOpen && dx < -80) {
        showMain();
      }
    }, { passive: true });

    // ═══ Init ═══
    loadData();
