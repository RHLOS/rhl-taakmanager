    // ═══ Kanban view ═══
    // Toont alleen subtaken + sub_subtaken (geen projecten — die zijn containers).
    // Kolommen: Inbox | Bezig | Werk | Privé.
    // Volgorde van regels: inbox > bezig > categorie van het parent-project.
    // Drag-and-drop verandert de relevante flags (inbox/bezig).

    function buildKanbanItems() {
      const subs = allSubtaken
        .filter(s => !s.gedaan && isActief(s))
        .map(s => {
          const project = allProjecten.find(p => p.id === s.taak_id);
          return {
            id: s.id, table: 'subtaken',
            tekst: s.tekst, deadline: s.deadline, context: s.context,
            prio: !!s.prio_ster, bezig: !!s.bezig, inbox: !!s.inbox,
            _project: project, _parentSub: null, _level: 'sub',
          };
        });

      const subsubs = allSubsubtaken
        .filter(ss => !ss.gedaan && isActief(ss))
        .map(ss => {
          const sub = allSubtaken.find(s => s.id === ss.subtaak_id);
          const project = sub ? allProjecten.find(p => p.id === sub.taak_id) : null;
          return {
            id: ss.id, table: 'sub_subtaken',
            tekst: ss.tekst, deadline: ss.deadline, context: ss.context,
            prio: !!ss.prioriteit, bezig: !!ss.bezig, inbox: !!ss.inbox,
            _project: project, _parentSub: sub, _level: 'subsub',
          };
        });

      return [...subs, ...subsubs];
    }

    function classifyKanbanItem(it) {
      if (it.inbox) return 'inbox';
      if (it.bezig) return 'bezig';
      const cat = it._project?.categorie;
      if (cat === 'Werk')  return 'werk';
      if (cat === 'Privé') return 'prive';
      return 'werk'; // fallback bij ontbrekende categorie
    }

    function renderKanbanCard(it) {
      const projectPath = it._level === 'subsub'
        ? `${esc(it._project?.taak || '?')} <span style="color:var(--text-3);">›</span> ${esc(it._parentSub?.tekst || '?')}`
        : esc(it._project?.taak || '?');

      const today = new Date().toISOString().slice(0, 10);
      const overdue = it.deadline && it.deadline < today;
      const deadlinePill = it.deadline
        ? `<span class="kb-pill deadline${overdue ? ' over' : ''}">${formatDate(it.deadline)}</span>`
        : '';

      const ctxArr = Array.isArray(it.context) ? it.context : (it.context ? [it.context] : []);
      const ctxPills = ctxArr.map(c => `<span class="kb-pill context">@${esc(c)}</span>`).join('');

      const prioPill = it.prio ? '<span class="kb-pill prio">★</span>' : '';

      return `
        <div class="kanban-card" draggable="true" data-id="${it.id}" data-table="${it.table}">
          <div class="kanban-card-project">${projectPath}</div>
          <div class="kanban-card-title">${esc(it.tekst)}</div>
          <div class="kanban-card-meta">${prioPill}${deadlinePill}${ctxPills}</div>
        </div>`;
    }

    function renderKanban(container) {
      const all = buildKanbanItems();
      const cols = { inbox: [], bezig: [], werk: [], prive: [] };
      for (const it of all) cols[classifyKanbanItem(it)].push(it);

      // Sorteer per kolom: prio eerst, dan deadline (vroegste eerst, geen deadline laatst)
      const sortFn = (a, b) => {
        if (a.prio !== b.prio) return a.prio ? -1 : 1;
        const ad = a.deadline || '9999-99-99';
        const bd = b.deadline || '9999-99-99';
        return ad.localeCompare(bd);
      };
      Object.values(cols).forEach(arr => arr.sort(sortFn));

      const colHtml = (key, label) => `
        <div class="kanban-col" data-col="${key}">
          <div class="kanban-col-header">
            <div class="kanban-col-title">${label}</div>
            <div class="kanban-col-count">${cols[key].length}</div>
          </div>
          <div class="kanban-col-body">${cols[key].map(renderKanbanCard).join('')}</div>
        </div>`;

      container.innerHTML = `
        <div class="kanban">
          ${colHtml('inbox', 'Inbox')}
          ${colHtml('bezig', 'Bezig')}
          ${colHtml('werk',  'Werk')}
          ${colHtml('prive', 'Privé')}
        </div>`;

      attachKanbanDnd(container);
    }

    function attachKanbanDnd(container) {
      container.querySelectorAll('.kanban-card').forEach(card => {
        card.addEventListener('dragstart', (e) => {
          card.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', JSON.stringify({
            id: card.dataset.id, table: card.dataset.table,
          }));
        });
        card.addEventListener('dragend', () => card.classList.remove('dragging'));
      });

      container.querySelectorAll('.kanban-col').forEach(col => {
        col.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          col.classList.add('drop-target');
        });
        col.addEventListener('dragleave', (e) => {
          // alleen weghalen als we de kolom écht verlaten
          if (!col.contains(e.relatedTarget)) col.classList.remove('drop-target');
        });
        col.addEventListener('drop', async (e) => {
          e.preventDefault();
          col.classList.remove('drop-target');

          let data;
          try { data = JSON.parse(e.dataTransfer.getData('text/plain')); }
          catch { return; }
          if (!data?.id || !data?.table) return;

          const target = col.dataset.col;
          let patchObj;
          if (target === 'inbox')      patchObj = { inbox: true,  bezig: false };
          else if (target === 'bezig') patchObj = { inbox: false, bezig: true  };
          else                         patchObj = { inbox: false, bezig: false };

          try {
            await patch(data.table, data.id, patchObj);
            const arr = data.table === 'subtaken' ? allSubtaken : allSubsubtaken;
            const item = arr.find(x => x.id === data.id);
            if (item) Object.assign(item, patchObj);
            renderKanban(container);
          } catch (err) {
            alert('Verplaatsen mislukt: ' + err.message);
          }
        });
      });
    }
