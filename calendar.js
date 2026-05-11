    // ═══ Calendar view ═══
    // Maandweergave + rolling-week (vandaag + 6 dagen).
    // Klik op dag = dagdetail onderaan. Klik op taak = detail-modal met afvinkoptie.

    let calMode = 'maand'; // 'maand' | 'week'
    let calSelectedDate = null;
    let calMonthOffset = 0; // tov huidige maand

    const CAL_MONTH_NAMES = ['Januari','Februari','Maart','April','Mei','Juni',
                              'Juli','Augustus','September','Oktober','November','December'];
    const CAL_DAY_NAMES_SHORT  = ['Ma','Di','Wo','Do','Vr','Za','Zo'];
    const CAL_DAY_NAMES_LONG   = ['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'];
    const CAL_MONTH_NAMES_SHORT = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];

    function buildCalItems() {
      const items = [];

      allProjecten.filter(p => p.deadline && !p.gedaan && isActief(p)).forEach(p => {
        items.push({
          id: p.id, table: 'taken', tekst: p.taak,
          deadline: p.deadline, cat: p.categorie || 'Werk',
          path: p.taak, level: 'project'
        });
      });

      allSubtaken.filter(s => s.deadline && !s.gedaan && isActief(s)).forEach(s => {
        const proj = allProjecten.find(p => p.id === s.taak_id);
        items.push({
          id: s.id, table: 'subtaken', tekst: s.tekst,
          deadline: s.deadline, cat: proj?.categorie || 'Werk',
          path: proj ? proj.taak + ' › ' + s.tekst : s.tekst, level: 'sub'
        });
      });

      allSubsubtaken.filter(ss => ss.deadline && !ss.gedaan && isActief(ss)).forEach(ss => {
        const sub = allSubtaken.find(s => s.id === ss.subtaak_id);
        const proj = sub ? allProjecten.find(p => p.id === sub.taak_id) : null;
        items.push({
          id: ss.id, table: 'sub_subtaken', tekst: ss.tekst,
          deadline: ss.deadline, cat: proj?.categorie || 'Werk',
          path: [proj?.taak, sub?.tekst, ss.tekst].filter(Boolean).join(' › '),
          level: 'subsub'
        });
      });

      if (catFilter) return items.filter(it => it.cat === catFilter);
      return items;
    }

    function renderCalendar(container) {
      container.innerHTML = '';

      // Mode-toggle + nav in dezelfde header
      const header = document.createElement('div');
      header.className = 'cal-header';

      const modeToggle = document.createElement('div');
      modeToggle.className = 'cal-mode-toggle';
      ['maand', 'week'].forEach(m => {
        const btn = document.createElement('button');
        btn.textContent = m.charAt(0).toUpperCase() + m.slice(1);
        btn.className = 'cal-mode-btn' + (calMode === m ? ' active' : '');
        btn.addEventListener('click', () => { calMode = m; renderCalendar(container); });
        modeToggle.appendChild(btn);
      });
      header.appendChild(modeToggle);

      if (calMode === 'maand') {
        const nav = buildMonthNav(container);
        header.appendChild(nav);
      }

      container.appendChild(header);

      const items = buildCalItems();
      if (calMode === 'maand') {
        renderMonthGrid(container, items);
      } else {
        renderWeekStrip(container, items);
      }

      if (calSelectedDate) {
        renderDayDetail(container, items, calSelectedDate);
      }
    }

    function buildMonthNav(container) {
      const nav = document.createElement('div');
      nav.className = 'cal-nav';

      const prev = document.createElement('button');
      prev.className = 'cal-nav-btn';
      prev.textContent = '‹';
      prev.addEventListener('click', () => { calMonthOffset--; renderCalendar(container); });

      const now = new Date();
      const viewDate = new Date(now.getFullYear(), now.getMonth() + calMonthOffset, 1);
      const title = document.createElement('span');
      title.className = 'cal-nav-title';
      title.textContent = CAL_MONTH_NAMES[viewDate.getMonth()] + ' ' + viewDate.getFullYear();

      const next = document.createElement('button');
      next.className = 'cal-nav-btn';
      next.textContent = '›';
      next.addEventListener('click', () => { calMonthOffset++; renderCalendar(container); });

      nav.appendChild(prev);
      nav.appendChild(title);
      nav.appendChild(next);
      return nav;
    }

    function renderMonthGrid(container, items) {
      const now = new Date();
      const viewDate = new Date(now.getFullYear(), now.getMonth() + calMonthOffset, 1);
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      const today = now.toISOString().slice(0, 10);

      const grid = document.createElement('div');
      grid.className = 'cal-grid';

      CAL_DAY_NAMES_SHORT.forEach(d => {
        const cell = document.createElement('div');
        cell.className = 'cal-day-header';
        cell.textContent = d;
        grid.appendChild(cell);
      });

      const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Ma=0
      for (let i = 0; i < firstDayOfWeek; i++) {
        const empty = document.createElement('div');
        empty.className = 'cal-day empty';
        grid.appendChild(empty);
      }

      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayItems = items.filter(it => it.deadline === dateStr);
        const isToday = dateStr === today;
        const isSelected = dateStr === calSelectedDate;
        const isPast = !isToday && dateStr < today;

        const cell = document.createElement('div');
        cell.className = 'cal-day'
          + (isToday    ? ' today'    : '')
          + (isSelected ? ' selected' : '')
          + (isPast     ? ' past'     : '');
        cell.dataset.date = dateStr;

        const num = document.createElement('span');
        num.className = 'cal-day-num';
        num.textContent = d;
        cell.appendChild(num);

        if (dayItems.length) {
          const dots = document.createElement('div');
          dots.className = 'cal-dots';
          dayItems.slice(0, 4).forEach(it => {
            const dot = document.createElement('span');
            dot.className = 'cal-dot ' + (it.cat === 'Privé' ? 'prive' : 'werk');
            dots.appendChild(dot);
          });
          if (dayItems.length > 4) {
            const more = document.createElement('span');
            more.className = 'cal-dot-more';
            more.textContent = '+' + (dayItems.length - 4);
            dots.appendChild(more);
          }
          cell.appendChild(dots);
        }

        cell.addEventListener('click', () => {
          calSelectedDate = (calSelectedDate === dateStr) ? null : dateStr;
          renderCalendar(container);
        });

        grid.appendChild(cell);
      }

      container.appendChild(grid);
    }

    function renderWeekStrip(container, items) {
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);

      const strip = document.createElement('div');
      strip.className = 'cal-week-strip';

      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dateStr = d.toISOString().slice(0, 10);
        const dayName = CAL_DAY_NAMES_SHORT[(d.getDay() + 6) % 7]; // Ma=0
        const isToday = dateStr === todayStr;
        const isSelected = dateStr === calSelectedDate;
        const dayItems = items.filter(it => it.deadline === dateStr);

        const col = document.createElement('div');
        col.className = 'cal-week-col'
          + (isToday    ? ' today'    : '')
          + (isSelected ? ' selected' : '');
        col.dataset.date = dateStr;

        const head = document.createElement('div');
        head.className = 'cal-week-head';
        head.innerHTML = `<span class="cal-week-dayname">${dayName}</span>`
          + `<span class="cal-week-num${isToday ? ' today' : ''}">${d.getDate()}</span>`;
        col.appendChild(head);

        if (dayItems.length === 0) {
          const empty = document.createElement('div');
          empty.className = 'cal-week-empty';
          empty.textContent = '–';
          col.appendChild(empty);
        } else {
          dayItems.forEach(it => {
            const chip = document.createElement('div');
            chip.className = 'cal-week-chip ' + (it.cat === 'Privé' ? 'prive' : 'werk');
            chip.textContent = it.tekst;
            chip.title = it.path;
            chip.addEventListener('click', e => { e.stopPropagation(); showCalItemModal(it, container); });
            col.appendChild(chip);
          });
        }

        col.addEventListener('click', () => {
          calSelectedDate = (calSelectedDate === dateStr) ? null : dateStr;
          renderCalendar(container);
        });

        strip.appendChild(col);
      }

      container.appendChild(strip);
    }

    function renderDayDetail(container, items, dateStr) {
      const dayItems = items.filter(it => it.deadline === dateStr);
      if (!dayItems.length) return;

      const d = new Date(dateStr + 'T00:00:00');
      const detail = document.createElement('div');
      detail.className = 'cal-day-detail';

      const title = document.createElement('h3');
      title.className = 'cal-detail-title';
      title.textContent = `${CAL_DAY_NAMES_LONG[d.getDay()]} ${d.getDate()} ${CAL_MONTH_NAMES_SHORT[d.getMonth()]}`;
      detail.appendChild(title);

      const list = document.createElement('ul');
      list.className = 'cal-detail-list';

      dayItems.forEach(it => {
        const li = document.createElement('li');
        li.className = 'cal-detail-item';
        const parts = it.path.split(' › ');
        const parentPath = parts.slice(0, -1).join(' › ');
        li.innerHTML = `<span class="cal-detail-dot ${it.cat === 'Privé' ? 'prive' : 'werk'}"></span>`
          + (parentPath ? `<span class="cal-detail-path">${esc(parentPath)}</span>` : '')
          + `<span class="cal-detail-name">${esc(it.tekst)}</span>`;
        li.addEventListener('click', () => showCalItemModal(it, container));
        list.appendChild(li);
      });

      detail.appendChild(list);
      container.appendChild(detail);
    }

    async function showCalItemModal(it, container) {
      const parts = it.path.split(' › ');
      const parentPath = parts.slice(0, -1).join(' › ');

      // ── Verzamel onderliggende taken ──
      let children = [];
      if (it.level === 'project') {
        allSubtaken.filter(s => s.taak_id === it.id && !s.gedaan && isActief(s)).forEach(s => {
          children.push({ tekst: s.tekst, level: 'sub', deadline: s.deadline });
          allSubsubtaken
            .filter(ss => ss.subtaak_id === s.id && !ss.gedaan && isActief(ss))
            .forEach(ss => children.push({ tekst: ss.tekst, level: 'subsub', deadline: ss.deadline }));
        });
      } else if (it.level === 'sub') {
        allSubsubtaken
          .filter(ss => ss.subtaak_id === it.id && !ss.gedaan && isActief(ss))
          .forEach(ss => children.push({ tekst: ss.tekst, level: 'subsub', deadline: ss.deadline }));
      }

      // ── Kinderen HTML ──
      let childrenHtml = '';
      if (children.length) {
        childrenHtml = '<div class="cal-modal-children">';
        children.forEach(c => {
          const prefix = c.level === 'subsub'
            ? '<span class="cal-child-prefix subsub">↳</span>'
            : '<span class="cal-child-prefix">•</span>';
          const dlTag = c.deadline
            ? `<span class="cal-modal-child-dl">${c.deadline}</span>`
            : '';
          childrenHtml += `<div class="cal-modal-child">${prefix}${esc(c.tekst)}${dlTag}</div>`;
        });
        childrenHtml += '</div>';
      }

      // ── Body HTML ──
      const bodyHtml = `
        ${parentPath ? `<p class="cal-modal-path">${esc(parentPath)}</p>` : ''}
        <p class="cal-modal-title-text">${esc(it.tekst)}</p>
        ${childrenHtml}
        <div class="cal-modal-deadline-row">
          <span class="cal-modal-dl-label">Deadline</span>
          <input type="date" id="calDeadlineInput" value="${it.deadline || ''}">
          <button type="button" class="cal-deadline-clear"
            onclick="document.getElementById('calDeadlineInput').value=''">✕ Wis</button>
        </div>
      `;

      const action = await showModal(it.tekst, bodyHtml, [
        { label: '✓ Afvinken',     value: 'done',   class: 'cal-check'  },
        { label: '💾 Bewaren',     value: 'save',   class: 'cal-save'   },
        { label: '🗑 Verwijderen', value: 'delete', class: 'cal-delete' },
        { label: 'Sluiten',        value: null,     class: 'cal-close'  }
      ]);

      if (action === 'done') {
        await patch(it.table, it.id, {
          gedaan: true,
          gedaan_datum: new Date().toISOString().split('T')[0]
        });
        await reloadData();
        renderCalendar(container);
        showToast('Afgevinkt ✓');

      } else if (action === 'save') {
        const newDeadline = document.getElementById('calDeadlineInput')?.value || null;
        await patch(it.table, it.id, { deadline: newDeadline || null });
        await reloadData();
        renderCalendar(container);
        showToast('Deadline opgeslagen ✓');

      } else if (action === 'delete') {
        const ok = await modalConfirm(
          'Verwijderen?',
          `"${it.tekst}" verplaatsen naar de prullenmand?`,
          'Verwijderen', true
        );
        if (ok) {
          await patch(it.table, it.id, { verwijderd_op: new Date().toISOString() });
          await reloadData();
          renderCalendar(container);
          showToast('Verwijderd');
        }
      }
    }
