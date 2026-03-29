    // ═══ Render helpers ═══
    function catBadge(cat) {
      return cat === 'Werk' ? '<span class="cat w">W</span>' : '<span class="cat p">P</span>';
    }
    function starHtml(isOn) {
      return `<span class="star ${isOn ? 'on' : 'off'}">★</span>`;
    }
    function deadlineHtml(d) {
      if (!d) return '';
      const days = daysUntil(d);
      const cls = days !== null && days <= 7 ? 'urgent' : 'normal';
      return `<span class="dl ${cls}">${formatDate(d)}</span>`;
    }
    function contextHtml(ctx) {
      if (!ctx) return '';
      const arr = Array.isArray(ctx) ? ctx : [ctx];
      if (arr.length === 0) return '';
      return `<div class="ctx">${arr.map(c => `<span>${c}</span>`).join('')}</div>`;
    }

    function starHtmlData(isOn, id, table, field) {
      return `<span class="star ${isOn ? 'on' : 'off'}" data-id="${id}" data-table="${table}" data-field="${field}">★</span>`;
    }

    function editableDeadline(date, id, table) {
      const display = date ? formatDate(date) : '';
      const urgent = date && daysUntil(date) <= 7;
      const cls = date ? (urgent ? 'urgent' : 'normal') : '';
      return `<span class="editable-dl dl ${cls}" data-id="${id}" data-table="${table}" data-field="deadline" data-raw="${date || ''}">${display || '—'}</span>`;
    }

    function editableWerkelijk(val, id, table) {
      const display = val ? val + 'm' : '';
      return `<span class="editable-num tijd" data-id="${id}" data-table="${table}" data-field="tijd_uitgevoerd">${display || '—'}</span>`;
    }

    const GESCHAT_OPTIES = ['', '<15 min', '<30 min', '<60 min', '<90 min', '<120 min'];
    const CONTEXT_OPTIES = ['@Kantoor', '@Thuis', '@Onderweg', '@Computer', '@Telefoon', '@Online'];

    function editableGeschat(val, id, table) {
      return `<span class="editable-select tijd" data-id="${id}" data-table="${table}" data-field="tijdsinschatting" data-type="geschat">${val || '—'}</span>`;
    }

    function editableContext(ctx, id, table) {
      const arr = Array.isArray(ctx) ? ctx : (ctx ? [ctx] : []);
      const display = arr.length > 0 ? arr.join(', ') : '';
      return `<span class="editable-select" data-id="${id}" data-table="${table}" data-field="context" data-type="context" data-raw='${JSON.stringify(arr)}'>${display || '—'}</span>`;
    }

    function renderProject(project, subtaken, subsubtaken, tbody) {
      const cat = project.categorie;
      const isPrio = project.prioriteit === 'hoog';
      const openSubs = getSubsFor(project.id).filter(s => !s.gedaan && isActief(s));

      tbody.insertAdjacentHTML('beforeend', `
        <tr class="row-project" data-project-id="${project.id}">
          <td class="cd"></td>
          <td class="cp">${starHtmlData(isPrio, project.id, 'taken', 'prioriteit')}</td>
          <td>${catBadge(cat)}</td>
          <td><span class="chev">▶</span> <span class="editable" data-id="${project.id}" data-table="taken" data-field="taak">${esc(project.taak)}</span></td>
          <td></td>
          <td></td>
          <td>${editableDeadline(project.deadline, project.id, 'taken')}</td>
          <td>${editableGeschat(project.tijdsinschatting, project.id, 'taken')}</td>
          <td>${editableWerkelijk(project.tijd_uitgevoerd, project.id, 'taken')}</td>
          <td>${editableContext(project.context, project.id, 'taken')}</td>
          <td class="col-add"><button class="add-btn" data-add="subtaak" data-parent-id="${project.id}" data-cat="${cat}" title="Taak toevoegen">+</button><button class="del-btn" data-del-id="${project.id}" data-del-table="taken" title="Verwijderen">🗑</button></td>
        </tr>
      `);

      openSubs.forEach(sub => {
        const subs = getSubsubsFor(sub.id).filter(ss => !ss.gedaan && isActief(ss));
        const hasSubs = subs.length > 0;

        tbody.insertAdjacentHTML('beforeend', `
          <tr class="row-taak collapsed" data-parent="${project.id}" data-taak-id="${sub.id}">
            <td class="cd">${!hasSubs ? `<span class="cb" data-id="${sub.id}" data-table="subtaken">○</span>` : ''}</td>
            <td class="cp">${starHtmlData(sub.prio_ster, sub.id, 'subtaken', 'prio_ster')}</td>
            <td>${catBadge(cat)}</td>
            <td></td>
            <td>${hasSubs ? '<span class="chev">▶</span> ' : ''}<span class="editable" data-id="${sub.id}" data-table="subtaken" data-field="tekst">${esc(sub.tekst)}</span></td>
            <td></td>
            <td>${editableDeadline(sub.deadline, sub.id, 'subtaken')}</td>
            <td>${editableGeschat(sub.tijdsinschatting, sub.id, 'subtaken')}</td>
            <td>${editableWerkelijk(sub.tijd_uitgevoerd, sub.id, 'subtaken')}</td>
            <td>${editableContext(sub.context, sub.id, 'subtaken')}</td>
            <td class="col-add"><button class="add-btn" data-add="subsubtaak" data-parent-id="${sub.id}" title="Subtaak toevoegen">+</button><button class="del-btn" data-del-id="${sub.id}" data-del-table="subtaken" title="Verwijderen">🗑</button></td>
          </tr>
        `);

        subs.forEach(ss => {
          tbody.insertAdjacentHTML('beforeend', `
            <tr class="row-subtaak collapsed" data-parent-taak="${sub.id}">
              <td class="cd"><span class="cb" data-id="${ss.id}" data-table="sub_subtaken">○</span></td>
              <td class="cp">${starHtmlData(ss.prioriteit, ss.id, 'sub_subtaken', 'prioriteit')}</td>
              <td></td>
              <td></td>
              <td></td>
              <td><span class="editable" data-id="${ss.id}" data-table="sub_subtaken" data-field="tekst">${esc(ss.tekst)}</span></td>
              <td>${editableDeadline(ss.deadline, ss.id, 'sub_subtaken')}</td>
              <td>${editableGeschat(ss.tijdsinschatting, ss.id, 'sub_subtaken')}</td>
              <td>${editableWerkelijk(ss.tijd_uitgevoerd, ss.id, 'sub_subtaken')}</td>
              <td>${editableContext(ss.context, ss.id, 'sub_subtaken')}</td>
              <td class="col-add"><button class="del-btn" data-del-id="${ss.id}" data-del-table="sub_subtaken" title="Verwijderen">🗑</button></td>
            </tr>
          `);
        });
      });
    }

    function renderInbox(tbody) {
      const inboxSubs = allSubtaken.filter(s => !s.gedaan && s.inbox);
      const inboxSubSubs = allSubsubtaken.filter(s => !s.gedaan && s.inbox);
      const inboxProjecten = allProjecten.filter(p => !p.gedaan && p.inbox);

      if (inboxSubs.length === 0 && inboxSubSubs.length === 0 && inboxProjecten.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;padding:40px;color:var(--text-2);">
          Inbox is leeg
        </td></tr>`;
        return;
      }

      inboxProjecten.forEach(p => {
        const cat = p.categorie;
        tbody.insertAdjacentHTML('beforeend', `
          <tr class="row-taak">
            <td class="cd"></td>
            <td class="cp">${starHtmlData(p.prioriteit === 'hoog', p.id, 'taken', 'prioriteit')}</td>
            <td>${catBadge(cat)}</td>
            <td><span class="editable" data-id="${p.id}" data-table="taken" data-field="taak">${p.taak}</span></td>
            <td><span style="color:var(--text-3);font-size:11px;">nieuw project</span></td>
            <td></td>
            <td>${editableDeadline(p.deadline, p.id, 'taken')}</td>
            <td>${editableGeschat(p.tijdsinschatting, p.id, 'taken')}</td>
            <td>${editableWerkelijk(p.tijd_uitgevoerd, p.id, 'taken')}</td>
            <td>${editableContext(p.context, p.id, 'taken')}</td>
            <td class="col-add"><button class="del-btn" data-del-id="${p.id}" data-del-table="taken" title="Verwijderen">🗑</button></td>
          </tr>
        `);
      });

      inboxSubs.forEach(sub => {
        const project = allProjecten.find(p => p.id === sub.taak_id);
        const cat = project ? project.categorie : 'Werk';
        const projectNaam = project ? project.taak : '?';
        tbody.insertAdjacentHTML('beforeend', `
          <tr class="row-taak">
            <td class="cd"><span class="cb" data-id="${sub.id}" data-table="subtaken">○</span></td>
            <td class="cp">${starHtmlData(sub.prio_ster, sub.id, 'subtaken', 'prio_ster')}</td>
            <td>${catBadge(cat)}</td>
            <td><span style="color:var(--text-3);font-size:11px;">${esc(projectNaam)}</span></td>
            <td><span class="editable" data-id="${sub.id}" data-table="subtaken" data-field="tekst">${esc(sub.tekst)}</span></td>
            <td></td>
            <td>${editableDeadline(sub.deadline, sub.id, 'subtaken')}</td>
            <td>${editableGeschat(sub.tijdsinschatting, sub.id, 'subtaken')}</td>
            <td>${editableWerkelijk(sub.tijd_uitgevoerd, sub.id, 'subtaken')}</td>
            <td>${editableContext(sub.context, sub.id, 'subtaken')}</td>
            <td class="col-add"><button class="del-btn" data-del-id="${sub.id}" data-del-table="subtaken" title="Verwijderen">🗑</button></td>
          </tr>
        `);
      });

      inboxSubSubs.forEach(ss => {
        const sub = allSubtaken.find(s => s.id === ss.subtaak_id);
        const project = sub ? allProjecten.find(p => p.id === sub.taak_id) : null;
        const taakNaam = sub ? sub.tekst : '?';
        tbody.insertAdjacentHTML('beforeend', `
          <tr class="row-subtaak">
            <td class="cd"><span class="cb" data-id="${ss.id}" data-table="sub_subtaken">○</span></td>
            <td class="cp">${starHtmlData(ss.prioriteit, ss.id, 'sub_subtaken', 'prioriteit')}</td>
            <td></td>
            <td><span style="color:var(--text-3);font-size:11px;">${project ? project.taak : '?'}</span></td>
            <td><span style="color:var(--text-3);font-size:11px;">${esc(taakNaam)}</span></td>
            <td><span class="editable" data-id="${ss.id}" data-table="sub_subtaken" data-field="tekst">${ss.tekst}</span></td>
            <td>${editableDeadline(ss.deadline, ss.id, 'sub_subtaken')}</td>
            <td>${editableGeschat(ss.tijdsinschatting, ss.id, 'sub_subtaken')}</td>
            <td>${editableWerkelijk(ss.tijd_uitgevoerd, ss.id, 'sub_subtaken')}</td>
            <td>${editableContext(ss.context, ss.id, 'sub_subtaken')}</td>
            <td class="col-add"><button class="del-btn" data-del-id="${ss.id}" data-del-table="sub_subtaken" title="Verwijderen">🗑</button></td>
          </tr>
        `);
      });
    }

    function renderVoltooid(tbody) {
      const items = [
        ...allSubtaken.filter(s => s.gedaan && isActief(s)).map(s => {
          const p = allProjecten.find(pr => pr.id === s.taak_id);
          return { tekst: s.tekst, datum: s.gedaan_datum, project: p?.taak || '?', cat: p?.categorie || 'Werk' };
        }),
        ...allSubsubtaken.filter(s => s.gedaan && isActief(s)).map(ss => {
          const sub = allSubtaken.find(s => s.id === ss.subtaak_id);
          const p = sub ? allProjecten.find(pr => pr.id === sub.taak_id) : null;
          return { tekst: ss.tekst, datum: ss.gedaan_datum, project: p?.taak || '?', taak: sub?.tekst || '?', cat: p?.categorie || 'Werk' };
        })
      ];

      items.sort((a, b) => (b.datum || '').localeCompare(a.datum || ''));

      if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;padding:40px;color:var(--text-2);">
          Geen voltooide taken
        </td></tr>`;
        return;
      }

      items.forEach(item => {
        const catHtml = item.cat === 'Werk' ? '<span class="cat w">W</span>' : '<span class="cat p">P</span>';
        tbody.insertAdjacentHTML('beforeend', `
          <tr class="row-taak">
            <td class="cd"><span class="cb done">✓</span></td>
            <td class="cp"></td>
            <td>${catHtml}</td>
            <td><span style="color:var(--text-3);font-size:11px;">${item.project}</span></td>
            <td>${item.taak ? `<span style="color:var(--text-3);font-size:11px;">${item.taak}</span>` : ''}</td>
            <td style="text-decoration:line-through;color:var(--text-3);">${esc(item.tekst)}</td>
            <td><span class="dl normal">${item.datum ? formatDate(item.datum) : ''}</span></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        `);
      });
    }

    function renderPrullenmand(tbody) {
      const verwijderd = [
        ...allProjecten.filter(isVerwijderd).map(p => ({ ...p, _table: 'taken', _label: p.taak, _type: 'project' })),
        ...allSubtaken.filter(isVerwijderd).map(s => {
          const p = allProjecten.find(pr => pr.id === s.taak_id);
          return { ...s, _table: 'subtaken', _label: s.tekst, _type: 'taak', _project: p?.taak || '?' };
        }),
        ...allSubsubtaken.filter(isVerwijderd).map(ss => {
          const s = allSubtaken.find(su => su.id === ss.subtaak_id);
          return { ...ss, _table: 'sub_subtaken', _label: ss.tekst, _type: 'subtaak', _project: s?.tekst || '?' };
        })
      ];

      if (verwijderd.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;padding:40px;color:var(--text-2);">
          Prullenmand is leeg
        </td></tr>`;
        return;
      }

      verwijderd.forEach(item => {
        const verwijderdDatum = formatDate(item.verwijderd_op);
        tbody.insertAdjacentHTML('beforeend', `
          <tr class="row-taak">
            <td class="cd"></td>
            <td class="cp"></td>
            <td></td>
            <td><span style="color:var(--text-3);font-size:11px;">${item._project || item._type}</span></td>
            <td>${esc(item._label)}</td>
            <td></td>
            <td><span class="dl normal">${verwijderdDatum}</span></td>
            <td></td>
            <td></td>
            <td></td>
            <td class="col-add">
              <button class="add-btn restore-btn" data-restore-id="${item.id}" data-restore-table="${item._table}" title="Herstellen">↩</button>
              <button class="del-btn permanent-del-btn" data-perm-id="${item.id}" data-perm-table="${item._table}" title="Definitief verwijderen" style="opacity:1;">🗑</button>
            </td>
          </tr>
        `);
      });
    }
