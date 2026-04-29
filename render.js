    // ═══ Render helpers ═══
    function catBadge(cat) {
      return cat === 'Werk' ? '<span class="cat w">W</span>' : '<span class="cat p">P</span>';
    }

    function starHtmlData(isOn, id, table, field) {
      return `<span class="star ${isOn ? 'on' : 'off'}" data-id="${id}" data-table="${table}" data-field="${field}">★</span>`;
    }

    function bezigHtmlData(isBezig, id, table) {
      return `<span class="bz ${isBezig ? 'on' : 'off'}" data-bz-id="${id}" data-bz-table="${table}" title="Markeer als bezig">${isBezig ? '●' : '○'}</span>`;
    }

    function editableDeadline(date, id, table) {
      const display = date ? formatDate(date) : '';
      const urgent = date && daysUntil(date) <= 7;
      const cls = date ? (urgent ? 'urgent' : 'normal') : '';
      return `<span class="editable-dl dl ${cls}" data-id="${id}" data-table="${table}" data-field="deadline" data-raw="${date || ''}">${display || '—'}</span>`;
    }

function editableContext(ctx, id, table) {
      const arr = normalizeContext(ctx);
      const display = arr.length > 0 ? arr.join(', ') : '';
      return `<span class="editable-select" data-id="${id}" data-table="${table}" data-field="context" data-type="context" data-raw='${JSON.stringify(arr)}'>${display || '—'}</span>`;
    }

    function renderProject(project, subtaken, subsubtaken, tbody) {
      const cat = project.categorie;
      const isPrio = project.prioriteit === 'hoog';
      const openSubs = filterSubsByActiveFilters(getSubsFor(project.id).filter(s => !s.gedaan && isActief(s)));

      tbody.insertAdjacentHTML('beforeend', `
        <tr class="row-project" data-project-id="${project.id}">
          <td class="col-nr-cell">${project.nr}</td>
          <td class="cd"></td>
          <td class="cp">${starHtmlData(isPrio, project.id, 'taken', 'prioriteit')}</td>
          <td class="cbz"></td>
          <td>${catBadge(cat)}</td>
          <td><span class="chev">▶</span> <span class="editable" data-id="${project.id}" data-table="taken" data-field="taak">${esc(project.taak)}</span></td>
          <td></td>
          <td></td>
          <td>${editableDeadline(project.deadline, project.id, 'taken')}</td>
          <td>${editableContext(project.context, project.id, 'taken')}</td>
          <td class="col-add"><button class="add-btn" data-add="subtaak" data-parent-id="${project.id}" data-cat="${cat}" title="Taak toevoegen">+</button><button class="del-btn" data-del-id="${project.id}" data-del-table="taken" title="Verwijderen">🗑</button></td>
        </tr>
      `);

      openSubs.forEach((sub, si) => {
        const subs = filterSubsByActiveFilters(getSubsubsFor(sub.id).filter(ss => !ss.gedaan && isActief(ss)));
        const hasSubs = subs.length > 0;
        const taakNr = `${project.nr}.${si + 1}`;

        tbody.insertAdjacentHTML('beforeend', `
          <tr class="row-taak collapsed" data-parent="${project.id}" data-taak-id="${sub.id}">
            <td class="col-nr-cell">${taakNr}</td>
            <td class="cd">${!hasSubs ? `<span class="cb" data-id="${sub.id}" data-table="subtaken">○</span>` : ''}</td>
            <td class="cp">${starHtmlData(sub.prio_ster, sub.id, 'subtaken', 'prio_ster')}</td>
            <td class="cbz">${bezigHtmlData(sub.bezig, sub.id, 'subtaken')}</td>
            <td>${catBadge(cat)}</td>
            <td></td>
            <td>${hasSubs ? '<span class="chev">▶</span> ' : ''}<span class="editable" data-id="${sub.id}" data-table="subtaken" data-field="tekst">${esc(sub.tekst)}</span></td>
            <td></td>
            <td>${editableDeadline(sub.deadline, sub.id, 'subtaken')}</td>
            <td>${editableContext(sub.context, sub.id, 'subtaken')}</td>
            <td class="col-add"><button class="add-btn" data-add="subsubtaak" data-parent-id="${sub.id}" title="Subtaak toevoegen">+</button><button class="del-btn" data-del-id="${sub.id}" data-del-table="subtaken" title="Verwijderen">🗑</button></td>
          </tr>
        `);

        subs.forEach((ss, ssi) => {
          tbody.insertAdjacentHTML('beforeend', `
            <tr class="row-subtaak collapsed" data-parent-taak="${sub.id}">
              <td class="col-nr-cell">${taakNr}.${ssi + 1}</td>
              <td class="cd"><span class="cb" data-id="${ss.id}" data-table="sub_subtaken">○</span></td>
              <td class="cp">${starHtmlData(ss.prioriteit, ss.id, 'sub_subtaken', 'prioriteit')}</td>
            <td class="cbz">${bezigHtmlData(ss.bezig, ss.id, 'sub_subtaken')}</td>
              <td></td>
              <td></td>
              <td></td>
              <td><span class="editable" data-id="${ss.id}" data-table="sub_subtaken" data-field="tekst">${esc(ss.tekst)}</span></td>
              <td>${editableDeadline(ss.deadline, ss.id, 'sub_subtaken')}</td>
              <td>${editableContext(ss.context, ss.id, 'sub_subtaken')}</td>
              <td class="col-add"><button class="del-btn" data-del-id="${ss.id}" data-del-table="sub_subtaken" title="Verwijderen">🗑</button></td>
            </tr>
          `);
        });
      });
    }

    function renderInbox(tbody) {
      const inboxSubs = sortItems(allSubtaken.filter(s => !s.gedaan && isActief(s) && s.inbox));
      const inboxSubSubs = sortItems(allSubsubtaken.filter(s => !s.gedaan && isActief(s) && s.inbox));
      const inboxProjecten = allProjecten.filter(p => !p.gedaan && isActief(p) && p.inbox);

      if (inboxSubs.length === 0 && inboxSubSubs.length === 0 && inboxProjecten.length === 0) {
        tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;padding:40px;color:var(--text-2);">
          Inbox is leeg
        </td></tr>`;
        return;
      }

      inboxProjecten.forEach(p => {
        const cat = p.categorie;
        tbody.insertAdjacentHTML('beforeend', `
          <tr class="row-taak">
            <td class="col-nr-cell"></td>
            <td class="cd"></td>
            <td class="cp">${starHtmlData(p.prioriteit === 'hoog', p.id, 'taken', 'prioriteit')}</td>
            <td class="cbz"></td>
            <td>${catBadge(cat)}</td>
            <td><span class="editable" data-id="${p.id}" data-table="taken" data-field="taak">${p.taak}</span></td>
            <td><span style="color:var(--text-3);font-size:11px;">nieuw project</span></td>
            <td></td>
            <td>${editableDeadline(p.deadline, p.id, 'taken')}</td>
            <td>${editableContext(p.context, p.id, 'taken')}</td>
            <td class="col-add"><button class="inbox-verwerkt-btn" data-verwerkt-id="${p.id}" data-verwerkt-table="taken" title="Verwerkt — uit inbox halen">↗</button><button class="del-btn" data-del-id="${p.id}" data-del-table="taken" title="Verwijderen">🗑</button></td>
          </tr>
        `);
      });

      inboxSubs.forEach(sub => {
        const project = allProjecten.find(p => p.id === sub.taak_id);
        const cat = project ? project.categorie : 'Werk';
        const projectNaam = project ? project.taak : '?';
        tbody.insertAdjacentHTML('beforeend', `
          <tr class="row-taak">
            <td class="col-nr-cell"></td>
            <td class="cd"><span class="cb" data-id="${sub.id}" data-table="subtaken">○</span></td>
            <td class="cp">${starHtmlData(sub.prio_ster, sub.id, 'subtaken', 'prio_ster')}</td>
            <td class="cbz">${bezigHtmlData(sub.bezig, sub.id, 'subtaken')}</td>
            <td>${catBadge(cat)}</td>
            <td><span style="color:var(--text-3);font-size:11px;">${esc(projectNaam)}</span></td>
            <td><span class="editable" data-id="${sub.id}" data-table="subtaken" data-field="tekst">${esc(sub.tekst)}</span></td>
            <td></td>
            <td>${editableDeadline(sub.deadline, sub.id, 'subtaken')}</td>
            <td>${editableContext(sub.context, sub.id, 'subtaken')}</td>
            <td class="col-add"><button class="inbox-verwerkt-btn" data-verwerkt-id="${sub.id}" data-verwerkt-table="subtaken" title="Verwerkt — uit inbox halen">↗</button><button class="del-btn" data-del-id="${sub.id}" data-del-table="subtaken" title="Verwijderen">🗑</button></td>
          </tr>
        `);
      });

      inboxSubSubs.forEach(ss => {
        const sub = allSubtaken.find(s => s.id === ss.subtaak_id);
        const project = sub ? allProjecten.find(p => p.id === sub.taak_id) : null;
        const taakNaam = sub ? sub.tekst : '?';
        tbody.insertAdjacentHTML('beforeend', `
          <tr class="row-subtaak">
            <td class="col-nr-cell"></td>
            <td class="cd"><span class="cb" data-id="${ss.id}" data-table="sub_subtaken">○</span></td>
            <td class="cp">${starHtmlData(ss.prioriteit, ss.id, 'sub_subtaken', 'prioriteit')}</td>
            <td class="cbz">${bezigHtmlData(ss.bezig, ss.id, 'sub_subtaken')}</td>
            <td></td>
            <td><span style="color:var(--text-3);font-size:11px;">${project ? project.taak : '?'}</span></td>
            <td><span style="color:var(--text-3);font-size:11px;">${esc(taakNaam)}</span></td>
            <td><span class="editable" data-id="${ss.id}" data-table="sub_subtaken" data-field="tekst">${ss.tekst}</span></td>
            <td>${editableDeadline(ss.deadline, ss.id, 'sub_subtaken')}</td>
            <td>${editableContext(ss.context, ss.id, 'sub_subtaken')}</td>
            <td class="col-add"><button class="inbox-verwerkt-btn" data-verwerkt-id="${ss.id}" data-verwerkt-table="sub_subtaken" title="Verwerkt — uit inbox halen">↗</button><button class="del-btn" data-del-id="${ss.id}" data-del-table="sub_subtaken" title="Verwijderen">🗑</button></td>
          </tr>
        `);
      });
    }

    function subCat(sub) { return allProjecten.find(p => p.id === sub.taak_id)?.categorie || 'Werk'; }
    function subsubCat(ss) { const sub = allSubtaken.find(s => s.id === ss.subtaak_id); return sub ? subCat(sub) : 'Werk'; }
    function matchesCat(cat) { return !catFilter || cat === catFilter; }

    function renderVandaag(tbody) {
      const subs = sortItems(allSubtaken.filter(s => !s.gedaan && isActief(s) && s.deadline && daysUntil(s.deadline) <= 0 && matchesCat(subCat(s))));
      const subsubs = sortItems(allSubsubtaken.filter(ss => !ss.gedaan && isActief(ss) && ss.deadline && daysUntil(ss.deadline) <= 0 && matchesCat(subsubCat(ss))));

      if (subs.length === 0 && subsubs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="14" style="text-align:center;padding:40px;color:var(--text-2);">Geen verlopen of vandaag vervallende taken</td></tr>`;
        return;
      }

      subs.forEach(sub => {
        const project = allProjecten.find(p => p.id === sub.taak_id);
        const cat = project ? project.categorie : 'Werk';
        tbody.insertAdjacentHTML('beforeend', `
          <tr class="row-taak">
            <td class="col-nr-cell"></td>
            <td class="cd"><span class="cb" data-id="${sub.id}" data-table="subtaken">○</span></td>
            <td class="cp">${starHtmlData(sub.prio_ster, sub.id, 'subtaken', 'prio_ster')}</td>
            <td class="cbz">${bezigHtmlData(sub.bezig, sub.id, 'subtaken')}</td>
            <td>${catBadge(cat)}</td>
            <td><span style="color:var(--text-3);font-size:11px;">${esc(project?.taak || '?')}</span></td>
            <td><span class="editable" data-id="${sub.id}" data-table="subtaken" data-field="tekst">${esc(sub.tekst)}</span></td>
            <td></td>
            <td>${editableDeadline(sub.deadline, sub.id, 'subtaken')}</td>
            <td>${editableContext(sub.context, sub.id, 'subtaken')}</td>
            <td class="col-add"><button class="del-btn" data-del-id="${sub.id}" data-del-table="subtaken" title="Verwijderen">🗑</button></td>
          </tr>
        `);
      });

      subsubs.forEach(ss => {
        const sub = allSubtaken.find(s => s.id === ss.subtaak_id);
        const project = sub ? allProjecten.find(p => p.id === sub.taak_id) : null;
        tbody.insertAdjacentHTML('beforeend', `
          <tr class="row-subtaak">
            <td class="col-nr-cell"></td>
            <td class="cd"><span class="cb" data-id="${ss.id}" data-table="sub_subtaken">○</span></td>
            <td class="cp">${starHtmlData(ss.prioriteit, ss.id, 'sub_subtaken', 'prioriteit')}</td>
            <td class="cbz">${bezigHtmlData(ss.bezig, ss.id, 'sub_subtaken')}</td>
            <td></td>
            <td><span style="color:var(--text-3);font-size:11px;">${esc(project?.taak || '?')}</span></td>
            <td><span style="color:var(--text-3);font-size:11px;">${esc(sub?.tekst || '?')}</span></td>
            <td><span class="editable" data-id="${ss.id}" data-table="sub_subtaken" data-field="tekst">${esc(ss.tekst)}</span></td>
            <td>${editableDeadline(ss.deadline, ss.id, 'sub_subtaken')}</td>
            <td>${editableContext(ss.context, ss.id, 'sub_subtaken')}</td>
            <td class="col-add"><button class="del-btn" data-del-id="${ss.id}" data-del-table="sub_subtaken" title="Verwijderen">🗑</button></td>
          </tr>
        `);
      });
    }

    function renderWeek(tbody) {
      const subs = sortItems(allSubtaken.filter(s => !s.gedaan && isActief(s) && s.deadline && daysUntil(s.deadline) >= 0 && daysUntil(s.deadline) <= 7 && matchesCat(subCat(s))));
      const subsubs = sortItems(allSubsubtaken.filter(ss => !ss.gedaan && isActief(ss) && ss.deadline && daysUntil(ss.deadline) >= 0 && daysUntil(ss.deadline) <= 7 && matchesCat(subsubCat(ss))));

      if (subs.length === 0 && subsubs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="14" style="text-align:center;padding:40px;color:var(--text-2);">Geen taken met deadline deze week</td></tr>`;
        return;
      }

      subs.forEach(sub => {
        const project = allProjecten.find(p => p.id === sub.taak_id);
        const cat = project ? project.categorie : 'Werk';
        tbody.insertAdjacentHTML('beforeend', `
          <tr class="row-taak">
            <td class="col-nr-cell"></td>
            <td class="cd"><span class="cb" data-id="${sub.id}" data-table="subtaken">○</span></td>
            <td class="cp">${starHtmlData(sub.prio_ster, sub.id, 'subtaken', 'prio_ster')}</td>
            <td class="cbz">${bezigHtmlData(sub.bezig, sub.id, 'subtaken')}</td>
            <td>${catBadge(cat)}</td>
            <td><span style="color:var(--text-3);font-size:11px;">${esc(project?.taak || '?')}</span></td>
            <td><span class="editable" data-id="${sub.id}" data-table="subtaken" data-field="tekst">${esc(sub.tekst)}</span></td>
            <td></td>
            <td>${editableDeadline(sub.deadline, sub.id, 'subtaken')}</td>
            <td>${editableContext(sub.context, sub.id, 'subtaken')}</td>
            <td class="col-add"><button class="del-btn" data-del-id="${sub.id}" data-del-table="subtaken" title="Verwijderen">🗑</button></td>
          </tr>
        `);
      });

      subsubs.forEach(ss => {
        const sub = allSubtaken.find(s => s.id === ss.subtaak_id);
        const project = sub ? allProjecten.find(p => p.id === sub.taak_id) : null;
        tbody.insertAdjacentHTML('beforeend', `
          <tr class="row-subtaak">
            <td class="col-nr-cell"></td>
            <td class="cd"><span class="cb" data-id="${ss.id}" data-table="sub_subtaken">○</span></td>
            <td class="cp">${starHtmlData(ss.prioriteit, ss.id, 'sub_subtaken', 'prioriteit')}</td>
            <td class="cbz">${bezigHtmlData(ss.bezig, ss.id, 'sub_subtaken')}</td>
            <td></td>
            <td><span style="color:var(--text-3);font-size:11px;">${esc(project?.taak || '?')}</span></td>
            <td><span style="color:var(--text-3);font-size:11px;">${esc(sub?.tekst || '?')}</span></td>
            <td><span class="editable" data-id="${ss.id}" data-table="sub_subtaken" data-field="tekst">${esc(ss.tekst)}</span></td>
            <td>${editableDeadline(ss.deadline, ss.id, 'sub_subtaken')}</td>
            <td>${editableContext(ss.context, ss.id, 'sub_subtaken')}</td>
            <td class="col-add"><button class="del-btn" data-del-id="${ss.id}" data-del-table="sub_subtaken" title="Verwijderen">🗑</button></td>
          </tr>
        `);
      });
    }

    function renderPrioriteit(tbody) {
      const subs = sortItems(allSubtaken.filter(s => !s.gedaan && isActief(s) && s.prio_ster && matchesCat(subCat(s))));
      const subsubs = sortItems(allSubsubtaken.filter(ss => !ss.gedaan && isActief(ss) && ss.prioriteit && matchesCat(subsubCat(ss))));

      if (subs.length === 0 && subsubs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="14" style="text-align:center;padding:40px;color:var(--text-2);">Geen prioriteit taken</td></tr>`;
        return;
      }

      subs.forEach(sub => {
        const project = allProjecten.find(p => p.id === sub.taak_id);
        const cat = project ? project.categorie : 'Werk';
        tbody.insertAdjacentHTML('beforeend', `
          <tr class="row-taak">
            <td class="col-nr-cell"></td>
            <td class="cd"><span class="cb" data-id="${sub.id}" data-table="subtaken">○</span></td>
            <td class="cp">${starHtmlData(sub.prio_ster, sub.id, 'subtaken', 'prio_ster')}</td>
            <td class="cbz">${bezigHtmlData(sub.bezig, sub.id, 'subtaken')}</td>
            <td>${catBadge(cat)}</td>
            <td><span style="color:var(--text-3);font-size:11px;">${esc(project?.taak || '?')}</span></td>
            <td><span class="editable" data-id="${sub.id}" data-table="subtaken" data-field="tekst">${esc(sub.tekst)}</span></td>
            <td></td>
            <td>${editableDeadline(sub.deadline, sub.id, 'subtaken')}</td>
            <td>${editableContext(sub.context, sub.id, 'subtaken')}</td>
            <td class="col-add"><button class="del-btn" data-del-id="${sub.id}" data-del-table="subtaken" title="Verwijderen">🗑</button></td>
          </tr>
        `);
      });

      subsubs.forEach(ss => {
        const sub = allSubtaken.find(s => s.id === ss.subtaak_id);
        const project = sub ? allProjecten.find(p => p.id === sub.taak_id) : null;
        tbody.insertAdjacentHTML('beforeend', `
          <tr class="row-subtaak">
            <td class="col-nr-cell"></td>
            <td class="cd"><span class="cb" data-id="${ss.id}" data-table="sub_subtaken">○</span></td>
            <td class="cp">${starHtmlData(ss.prioriteit, ss.id, 'sub_subtaken', 'prioriteit')}</td>
            <td class="cbz">${bezigHtmlData(ss.bezig, ss.id, 'sub_subtaken')}</td>
            <td></td>
            <td><span style="color:var(--text-3);font-size:11px;">${esc(project?.taak || '?')}</span></td>
            <td><span style="color:var(--text-3);font-size:11px;">${esc(sub?.tekst || '?')}</span></td>
            <td><span class="editable" data-id="${ss.id}" data-table="sub_subtaken" data-field="tekst">${esc(ss.tekst)}</span></td>
            <td>${editableDeadline(ss.deadline, ss.id, 'sub_subtaken')}</td>
            <td>${editableContext(ss.context, ss.id, 'sub_subtaken')}</td>
            <td class="col-add"><button class="del-btn" data-del-id="${ss.id}" data-del-table="sub_subtaken" title="Verwijderen">🗑</button></td>
          </tr>
        `);
      });
    }

    function renderZoekresultaten(tbody) {
      const q = (searchQuery || '').toLowerCase();
      if (!q) {
        tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;padding:40px;color:var(--text-2);">Typ iets in het zoekveld om te zoeken</td></tr>`;
        return;
      }

      const matches = (text) => text && text.toLowerCase().includes(q);
      const projecten = allProjecten.filter(p => isActief(p) && !p.gedaan && matches(p.taak));
      const subs = allSubtaken.filter(s => isActief(s) && !s.gedaan && matches(s.tekst));
      const subsubs = allSubsubtaken.filter(ss => isActief(ss) && !ss.gedaan && matches(ss.tekst));
      const total = projecten.length + subs.length + subsubs.length;

      if (total === 0) {
        tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;padding:40px;color:var(--text-2);">Geen resultaten voor "${esc(searchQuery)}"</td></tr>`;
        return;
      }

      tbody.insertAdjacentHTML('beforeend', `
        <tr><td colspan="11" style="padding:14px 16px;background:var(--card);border-bottom:1px solid var(--sep);font-size:13px;color:var(--text-2);">
          ${total} ${total === 1 ? 'resultaat' : 'resultaten'} voor "<strong style="color:var(--text);">${esc(searchQuery)}</strong>"
        </td></tr>
      `);

      projecten.forEach(p => {
        tbody.insertAdjacentHTML('beforeend', `
          <tr class="row-taak">
            <td class="col-nr-cell"></td>
            <td class="cd"></td>
            <td class="cp">${starHtmlData(p.prioriteit === 'hoog', p.id, 'taken', 'prioriteit')}</td>
            <td class="cbz"></td>
            <td>${catBadge(p.categorie)}</td>
            <td><span class="editable" data-id="${p.id}" data-table="taken" data-field="taak">${esc(p.taak)}</span></td>
            <td><span style="color:var(--text-3);font-size:11px;">project</span></td>
            <td></td>
            <td>${editableDeadline(p.deadline, p.id, 'taken')}</td>
            <td>${editableContext(p.context, p.id, 'taken')}</td>
            <td class="col-add"><button class="del-btn" data-del-id="${p.id}" data-del-table="taken" title="Verwijderen">🗑</button></td>
          </tr>
        `);
      });

      subs.forEach(sub => {
        const project = allProjecten.find(p => p.id === sub.taak_id);
        const cat = project ? project.categorie : 'Werk';
        tbody.insertAdjacentHTML('beforeend', `
          <tr class="row-taak">
            <td class="col-nr-cell"></td>
            <td class="cd"><span class="cb" data-id="${sub.id}" data-table="subtaken">○</span></td>
            <td class="cp">${starHtmlData(sub.prio_ster, sub.id, 'subtaken', 'prio_ster')}</td>
            <td class="cbz">${bezigHtmlData(sub.bezig, sub.id, 'subtaken')}</td>
            <td>${catBadge(cat)}</td>
            <td><span style="color:var(--text-3);font-size:11px;">${esc(project?.taak || '?')}</span></td>
            <td><span class="editable" data-id="${sub.id}" data-table="subtaken" data-field="tekst">${esc(sub.tekst)}</span></td>
            <td></td>
            <td>${editableDeadline(sub.deadline, sub.id, 'subtaken')}</td>
            <td>${editableContext(sub.context, sub.id, 'subtaken')}</td>
            <td class="col-add"><button class="del-btn" data-del-id="${sub.id}" data-del-table="subtaken" title="Verwijderen">🗑</button></td>
          </tr>
        `);
      });

      subsubs.forEach(ss => {
        const sub = allSubtaken.find(s => s.id === ss.subtaak_id);
        const project = sub ? allProjecten.find(p => p.id === sub.taak_id) : null;
        tbody.insertAdjacentHTML('beforeend', `
          <tr class="row-subtaak">
            <td class="col-nr-cell"></td>
            <td class="cd"><span class="cb" data-id="${ss.id}" data-table="sub_subtaken">○</span></td>
            <td class="cp">${starHtmlData(ss.prioriteit, ss.id, 'sub_subtaken', 'prioriteit')}</td>
            <td class="cbz">${bezigHtmlData(ss.bezig, ss.id, 'sub_subtaken')}</td>
            <td></td>
            <td><span style="color:var(--text-3);font-size:11px;">${esc(project?.taak || '?')}</span></td>
            <td><span style="color:var(--text-3);font-size:11px;">${esc(sub?.tekst || '?')}</span></td>
            <td><span class="editable" data-id="${ss.id}" data-table="sub_subtaken" data-field="tekst">${esc(ss.tekst)}</span></td>
            <td>${editableDeadline(ss.deadline, ss.id, 'sub_subtaken')}</td>
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
          return { id: s.id, table: 'subtaken', tekst: s.tekst, datum: s.gedaan_datum, project: p?.taak || '?', cat: p?.categorie || 'Werk' };
        }),
        ...allSubsubtaken.filter(s => s.gedaan && isActief(s)).map(ss => {
          const sub = allSubtaken.find(s => s.id === ss.subtaak_id);
          const p = sub ? allProjecten.find(pr => pr.id === sub.taak_id) : null;
          return { id: ss.id, table: 'sub_subtaken', tekst: ss.tekst, datum: ss.gedaan_datum, project: p?.taak || '?', taak: sub?.tekst || '?', cat: p?.categorie || 'Werk' };
        })
      ];

      items.sort((a, b) => (b.datum || '').localeCompare(a.datum || ''));

      if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;padding:40px;color:var(--text-2);">
          Geen voltooide taken
        </td></tr>`;
        return;
      }

      items.forEach(item => {
        const catHtml = item.cat === 'Werk' ? '<span class="cat w">W</span>' : '<span class="cat p">P</span>';
        tbody.insertAdjacentHTML('beforeend', `
          <tr class="row-taak">
            <td class="cd"><span class="cb done" data-id="${item.id}" data-table="${item.table}" style="cursor:pointer;" title="Terugzetten naar actief">✓</span></td>
            <td class="cp"></td>
            <td>${catHtml}</td>
            <td><span style="color:var(--text-3);font-size:11px;">${item.project}</span></td>
            <td>${item.taak ? `<span style="color:var(--text-3);font-size:11px;">${item.taak}</span>` : ''}</td>
            <td style="text-decoration:line-through;color:var(--text-3);">${esc(item.tekst)}${item.datum ? `<br><span style="font-size:11px;color:var(--text-3);">Afgerond: ${formatDate(item.datum)}</span>` : ''}</td>
            <td></td>
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
        tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;padding:40px;color:var(--text-2);">
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
            <td>${esc(item._label)}${verwijderdDatum ? `<br><span style="font-size:11px;color:var(--text-3);">Verwijderd: ${verwijderdDatum}</span>` : ''}</td>
            <td></td>
            <td></td>
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
