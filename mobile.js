    // ═══ Mobile state ═══
    let allTaken = [], allSubtaken = [], allSubsubtaken = [], allContexten = [];
    let currentView = 'inbox'; // 'inbox' | 'vandaag' | 'prioriteit' | 'voltooid' | 'prullenmand' | 'project:<id>'
    let viewItems = []; // items voor de huidige view (vlakke lijst)
    let detailItem = null; // huidige item in detail-scherm (null = niet open)
    let detailCtxSelected = []; // context-selectie in modal

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
        const [taken, subs, subsubs, ctxs] = await Promise.all([
          api('taken', 'order=nr.asc'),
          api('subtaken', 'order=volgorde.asc'),
          api('sub_subtaken', 'order=volgorde.asc'),
          api('contexts', 'order=name.asc')
        ]);
        allTaken = taken;
        allSubtaken = subs;
        allSubsubtaken = subsubs;
        allContexten = ctxs.map(c => c.name);
        renderView();
        renderMenu();
        if (detailItem) refreshDetail();
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

    function prioPatch(table, val) {
      if (table === 'taken') return { prioriteit: val ? 'hoog' : 'normaal' };
      if (table === 'subtaken') return { prio_ster: val };
      if (table === 'sub_subtaken') return { prioriteit: val };
      return {};
    }

    function getContextArray(raw) {
      const c = raw.context;
      if (!c) return [];
      return Array.isArray(c) ? c : [c];
    }

    function nameField(table) {
      return table === 'taken' ? 'taak' : 'tekst';
    }

    function hasChildren(table) {
      return table === 'taken' || table === 'subtaken';
    }

    function getChildren(id, table) {
      if (table === 'taken') {
        return allSubtaken
          .filter(s => s.taak_id === id && !s.verwijderd_op)
          .map(s => toFlat(s, 'subtaken'));
      }
      if (table === 'subtaken') {
        return allSubsubtaken
          .filter(ss => ss.subtaak_id === id && !ss.verwijderd_op)
          .map(ss => toFlat(ss, 'sub_subtaken'));
      }
      return [];
    }

    function findItem(id, table) {
      const arr = table === 'taken' ? allTaken : table === 'subtaken' ? allSubtaken : allSubsubtaken;
      const raw = arr.find(x => x.id === id);
      return raw ? toFlat(raw, table) : null;
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

      // FAB tonen in inbox en project-view (nieuwe taak / nieuwe subtaak)
      const showFab = currentView === 'inbox' || currentView.startsWith('project:');
      document.getElementById('fabAdd').style.display = showFab ? 'flex' : 'none';
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
    async function toggleDone(id, table) {
      const item = findItem(id, table);
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

    async function softDelete(id, table) {
      try {
        await patch(table, id, { verwijderd_op: new Date().toISOString() });
        await loadData();
        showToast('Naar prullenmand');
      } catch (err) {
        showToast('Verwijderen mislukt');
      }
    }

    function wireRowInteractions(listEl) {
      listEl.addEventListener('click', async (e) => {
        const li = e.target.closest('.task-item');
        if (!li) return;
        const id = li.dataset.id;
        const table = li.dataset.table;
        const actionBtn = e.target.closest('[data-action]');
        if (actionBtn) {
          const action = actionBtn.dataset.action;
          if (action === 'toggle') await toggleDone(id, table);
          else if (action === 'delete') await softDelete(id, table);
          return;
        }
        openDetail(id, table);
      });
    }

    wireRowInteractions(document.getElementById('taskList'));

    // ═══ Nieuwe taak modal ═══
    const overlay = document.getElementById('modalOverlay');
    const input = document.getElementById('newTaskInput');
    let addCtx = { mode: 'inbox' }; // mode: 'inbox' | 'subtaak' | 'subsubtaak'

    const ADD_TITLES = { inbox: 'Nieuwe taak', subtaak: 'Nieuwe taak', subsubtaak: 'Nieuwe subtaak' };
    const ADD_PLACEHOLDERS = {
      inbox: 'Wat moet er gedaan worden?',
      subtaak: 'Naam van de taak',
      subsubtaak: 'Naam van de subtaak'
    };

    function openModal(ctx) {
      addCtx = ctx || { mode: 'inbox' };
      document.getElementById('modalTitle').textContent = ADD_TITLES[addCtx.mode] || 'Nieuw';
      input.placeholder = ADD_PLACEHOLDERS[addCtx.mode] || '';
      overlay.hidden = false;
      input.value = '';
      setTimeout(() => input.focus(), 50);
    }

    function closeModal() {
      overlay.hidden = true;
      input.blur();
    }

    document.getElementById('fabAdd').addEventListener('click', () => {
      if (currentView === 'inbox') openModal({ mode: 'inbox' });
      else if (currentView.startsWith('project:')) {
        openModal({ mode: 'subtaak', parentId: currentView.slice('project:'.length) });
      }
    });

    document.getElementById('btnAddChild').addEventListener('click', () => {
      if (!detailItem) return;
      if (detailItem.table === 'taken') {
        openModal({ mode: 'subtaak', parentId: detailItem.id });
      } else if (detailItem.table === 'subtaken') {
        openModal({ mode: 'subsubtaak', parentId: detailItem.id });
      }
    });

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
        if (addCtx.mode === 'inbox') {
          const meta = await api('meta', 'sleutel=eq.volgend_nr&select=waarde');
          const nr = parseInt(meta[0]?.waarde || '99');
          await post('taken', {
            nr, taak: tekst, categorie: 'Werk', prioriteit: 'normaal', inbox: true
          });
          await fetch(`${SB}/rest/v1/meta?sleutel=eq.volgend_nr`, {
            method: 'PATCH', headers: hdrs, body: JSON.stringify({ waarde: String(nr + 1) })
          });
        } else if (addCtx.mode === 'subtaak') {
          const bestaande = allSubtaken.filter(s => s.taak_id === addCtx.parentId && !s.verwijderd_op);
          await post('subtaken', {
            taak_id: addCtx.parentId, tekst, volgorde: bestaande.length + 1
          });
        } else if (addCtx.mode === 'subsubtaak') {
          const bestaande = allSubsubtaken.filter(ss => ss.subtaak_id === addCtx.parentId && !ss.verwijderd_op);
          await post('sub_subtaken', {
            subtaak_id: addCtx.parentId, tekst, volgorde: bestaande.length + 1
          });
        }
        closeModal();
        await loadData();
        showToast('Toegevoegd');
      } catch (err) {
        showToast('Toevoegen mislukt: ' + err.message);
      }
    }

    // ═══ Detail-scherm ═══
    function openDetail(id, table) {
      const item = findItem(id, table);
      if (!item) return;
      detailItem = item;
      fillDetail(item);
      document.getElementById('screenMain').hidden = true;
      document.getElementById('screenMenu').hidden = true;
      document.getElementById('screenDetail').hidden = false;
      document.getElementById('fabAdd').style.display = 'none';
    }

    function closeDetail() {
      detailItem = null;
      document.getElementById('screenDetail').hidden = true;
      showMain();
      renderView(); // FAB-weergave herstellen
    }

    function refreshDetail() {
      if (!detailItem) return;
      const fresh = findItem(detailItem.id, detailItem.table);
      if (!fresh) { closeDetail(); return; }
      fillDetail(fresh);
    }

    function fillDetail(item) {
      detailItem = item;
      const raw = item.raw;

      const titleMap = { taken: 'Project', subtaken: 'Taak', sub_subtaken: 'Subtaak' };
      document.getElementById('detailTitle').textContent = titleMap[item.table] || 'Taak';

      const nameEl = document.getElementById('detailName');
      if (document.activeElement !== nameEl) nameEl.value = item.tekst || '';

      const ddlEl = document.getElementById('detailDeadline');
      if (document.activeElement !== ddlEl) ddlEl.value = raw.deadline || '';

      const ctxs = getContextArray(raw);
      const ctxBtn = document.getElementById('detailContextBtn');
      if (ctxs.length) {
        ctxBtn.textContent = ctxs.join(', ');
        ctxBtn.classList.remove('empty');
      } else {
        ctxBtn.textContent = 'Kies…';
        ctxBtn.classList.add('empty');
      }

      const prioBtn = document.getElementById('detailPrio');
      const p = isPrio(item);
      prioBtn.textContent = p ? '★' : '☆';
      prioBtn.classList.toggle('active', p);

      const childSec = document.getElementById('detailChildSection');
      if (hasChildren(item.table)) {
        childSec.hidden = false;
        document.getElementById('detailChildTitle').textContent =
          item.table === 'taken' ? 'Taken' : 'Subtaken';
        renderDetailChildren(item.id, item.table);
      } else {
        childSec.hidden = true;
      }
    }

    function renderDetailChildren(parentId, parentTable) {
      const children = getChildren(parentId, parentTable);
      const list = document.getElementById('detailChildList');
      const empty = document.getElementById('detailChildEmpty');
      if (children.length === 0) {
        list.innerHTML = '';
        empty.hidden = false;
        return;
      }
      empty.hidden = true;
      list.innerHTML = children.map(item => `
        <li class="task-item" data-id="${item.id}" data-table="${item.table}">
          <button class="task-checkbox ${item.gedaan ? 'done' : ''}" data-action="toggle">${item.gedaan ? '✓' : ''}</button>
          <span class="task-text ${item.gedaan ? 'done' : ''}">${esc(item.tekst || '')}</span>
          <button class="task-delete" data-action="delete" aria-label="Verwijderen">🗑</button>
        </li>
      `).join('');
    }

    wireRowInteractions(document.getElementById('detailChildList'));

    document.getElementById('btnBackDetail').addEventListener('click', closeDetail);

    document.getElementById('detailName').addEventListener('blur', async (e) => {
      if (!detailItem) return;
      const newText = e.target.value.trim();
      if (!newText || newText === detailItem.tekst) return;
      try {
        await patch(detailItem.table, detailItem.id, { [nameField(detailItem.table)]: newText });
        await loadData();
      } catch (err) {
        showToast('Opslaan mislukt');
      }
    });

    document.getElementById('detailDeadline').addEventListener('change', async (e) => {
      if (!detailItem) return;
      try {
        await patch(detailItem.table, detailItem.id, { deadline: e.target.value || null });
        await loadData();
      } catch (err) {
        showToast('Opslaan mislukt');
      }
    });

    document.getElementById('detailPrio').addEventListener('click', async () => {
      if (!detailItem) return;
      const cur = isPrio(detailItem);
      try {
        await patch(detailItem.table, detailItem.id, prioPatch(detailItem.table, !cur));
        await loadData();
      } catch (err) {
        showToast('Opslaan mislukt');
      }
    });

    document.getElementById('btnDetailDelete').addEventListener('click', async () => {
      if (!detailItem) return;
      if (!confirm('Weet je zeker dat je dit wilt verwijderen?')) return;
      const id = detailItem.id, table = detailItem.table;
      closeDetail();
      try {
        await patch(table, id, { verwijderd_op: new Date().toISOString() });
        await loadData();
        showToast('Naar prullenmand');
      } catch (err) {
        showToast('Verwijderen mislukt');
      }
    });

    // ═══ Context-modal ═══
    const ctxOverlay = document.getElementById('ctxOverlay');
    const ctxListEl = document.getElementById('ctxList');

    function openCtxModal() {
      if (!detailItem) return;
      detailCtxSelected = [...getContextArray(detailItem.raw)];
      renderCtxList();
      ctxOverlay.hidden = false;
    }

    function closeCtxModal() { ctxOverlay.hidden = true; }

    function renderCtxList() {
      if (allContexten.length === 0) {
        ctxListEl.innerHTML = '<div class="ctx-empty">Nog geen contexten — maak eerst een aan op desktop</div>';
        return;
      }
      ctxListEl.innerHTML = allContexten.map(name => `
        <div class="ctx-item ${detailCtxSelected.includes(name) ? 'on' : ''}" data-name="${esc(name)}">
          <span class="ctx-check">✓</span>
          <span>${esc(name)}</span>
        </div>
      `).join('');
    }

    ctxListEl.addEventListener('click', (e) => {
      const item = e.target.closest('.ctx-item');
      if (!item) return;
      const name = item.dataset.name;
      if (detailCtxSelected.includes(name)) {
        detailCtxSelected = detailCtxSelected.filter(n => n !== name);
      } else {
        detailCtxSelected.push(name);
      }
      renderCtxList();
    });

    document.getElementById('btnCtxCancel').addEventListener('click', closeCtxModal);
    ctxOverlay.addEventListener('click', (e) => { if (e.target === ctxOverlay) closeCtxModal(); });

    document.getElementById('btnCtxSave').addEventListener('click', async () => {
      if (!detailItem) return;
      try {
        await patch(detailItem.table, detailItem.id, {
          context: detailCtxSelected.length > 0 ? detailCtxSelected : null
        });
        closeCtxModal();
        await loadData();
      } catch (err) {
        showToast('Opslaan mislukt');
      }
    });

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
        const detailOpen = !document.getElementById('screenDetail').hidden;
        if (detailOpen) closeDetail();
        else showMenu();
      }
      // Sluit menu: swipe naar links in menu, minstens 80px
      if (menuOpen && dx < -80) {
        showMain();
      }
    }, { passive: true });

    // ═══ Init ═══
    loadData();
