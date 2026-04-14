    // ═══ Mobile state ═══
    let inboxItems = []; // Vlakke lijst: { id, table, tekst, ... }

    // ═══ Data laden ═══
    async function loadInbox() {
      try {
        const filter = 'inbox=eq.true&verwijderd_op=is.null&select=*';
        const [taken, subs, subsubs] = await Promise.all([
          api('taken', filter + '&order=nr.asc'),
          api('subtaken', filter + '&order=volgorde.asc'),
          api('sub_subtaken', filter + '&order=volgorde.asc')
        ]);
        // Combineer tot één vlakke lijst
        inboxItems = [
          ...taken.map(t => ({ id: t.id, table: 'taken', tekst: t.taak, gedaan: t.gedaan, raw: t })),
          ...subs.map(s => ({ id: s.id, table: 'subtaken', tekst: s.tekst, gedaan: s.gedaan, raw: s })),
          ...subsubs.map(ss => ({ id: ss.id, table: 'sub_subtaken', tekst: ss.tekst, gedaan: ss.gedaan, raw: ss }))
        ];
        renderInbox();
      } catch (err) {
        showToast('Laden mislukt: ' + err.message);
      }
    }

    // ═══ Render ═══
    function renderInbox() {
      const list = document.getElementById('taskList');
      const empty = document.getElementById('emptyState');
      const count = document.getElementById('inboxCount');

      const open = inboxItems.filter(i => !i.gedaan);
      count.textContent = open.length;

      if (inboxItems.length === 0) {
        list.innerHTML = '';
        empty.hidden = false;
        return;
      }
      empty.hidden = true;

      list.innerHTML = inboxItems.map(item => `
        <li class="task-item" data-id="${item.id}" data-table="${item.table}">
          <button class="task-checkbox ${item.gedaan ? 'done' : ''}" data-action="toggle">${item.gedaan ? '✓' : ''}</button>
          <span class="task-text ${item.gedaan ? 'done' : ''}">${esc(item.tekst || '')}</span>
          <button class="task-delete" data-action="delete" aria-label="Verwijderen">🗑</button>
        </li>
      `).join('');
    }

    // ═══ Event delegation op de lijst ═══
    document.getElementById('taskList').addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const li = btn.closest('.task-item');
      const id = li.dataset.id;
      const table = li.dataset.table;
      const action = btn.dataset.action;

      if (action === 'toggle') {
        const item = inboxItems.find(i => i.id === id && i.table === table);
        if (!item) return;
        const nieuw = !item.gedaan;
        try {
          await patch(table, id, {
            gedaan: nieuw,
            gedaan_datum: nieuw ? new Date().toISOString().split('T')[0] : null
          });
          item.gedaan = nieuw;
          renderInbox();
        } catch (err) {
          showToast('Opslaan mislukt');
        }
      }

      if (action === 'delete') {
        try {
          await patch(table, id, { verwijderd_op: new Date().toISOString() });
          inboxItems = inboxItems.filter(i => !(i.id === id && i.table === table));
          renderInbox();
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

    // Klik op overlay (niet op modal zelf) sluit ook
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
        // Volgnummer ophalen uit meta
        const meta = await api('meta', 'sleutel=eq.volgend_nr&select=waarde');
        const nr = parseInt(meta[0]?.waarde || '99');

        await post('taken', {
          nr: nr,
          taak: tekst,
          categorie: 'Werk',
          prioriteit: 'normaal',
          inbox: true
        });

        // Volgnummer ophogen
        await fetch(`${SB}/rest/v1/meta?sleutel=eq.volgend_nr`, {
          method: 'PATCH',
          headers: hdrs,
          body: JSON.stringify({ waarde: String(nr + 1) })
        });

        closeModal();
        await loadInbox();
        showToast('Taak toegevoegd');
      } catch (err) {
        showToast('Toevoegen mislukt: ' + err.message);
      }
    }

    // ═══ Init ═══
    loadInbox();
