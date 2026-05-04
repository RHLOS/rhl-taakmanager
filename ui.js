    // ═══ Modal helpers ═══
    function showModal(title, bodyHtml, buttons) {
      return new Promise(resolve => {
        const overlay = document.getElementById('modal');
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = bodyHtml;
        const actions = document.getElementById('modalActions');
        actions.innerHTML = '';

        buttons.forEach(btn => {
          const b = document.createElement('button');
          b.className = `modal-btn ${btn.class || 'cancel'}`;
          b.textContent = btn.label;
          b.addEventListener('click', () => {
            overlay.style.display = 'none';
            resolve(btn.value);
          });
          actions.appendChild(b);
        });

        overlay.style.display = 'flex';

        const firstInput = document.querySelector('#modalBody input');
        if (firstInput) setTimeout(() => firstInput.focus(), 50);

        const handler = (e) => {
          if (e.key === 'Enter') {
            const primary = buttons.find(b => b.class === 'primary');
            if (primary) { overlay.style.display = 'none'; resolve(primary.value); }
            document.removeEventListener('keydown', handler);
          }
          if (e.key === 'Escape') {
            overlay.style.display = 'none';
            resolve(null);
            document.removeEventListener('keydown', handler);
          }
        };
        document.addEventListener('keydown', handler);
      });
    }

    async function modalInput(title, label, placeholder) {
      const bodyHtml = `<label>${esc(label)}</label><input type="text" id="modalInputVal" placeholder="${esc(placeholder || '')}">`;
      const result = await showModal(title, bodyHtml, [
        { label: 'Annuleren', class: 'cancel', value: null },
        { label: 'Toevoegen', class: 'primary', value: 'ok' }
      ]);
      if (result !== 'ok') return null;
      return document.getElementById('modalInputVal')?.value?.trim() || null;
    }

    async function modalNewProject(title) {
      const bodyHtml = `
        <label>Naam</label><input type="text" id="modalInputVal" placeholder="Projectnaam">
        <label>Categorie</label>
        <select id="modalSelectCat">
          <option value="Werk">RHLC</option>
          <option value="Privé">Raimon</option>
          <option value="Natasja">Natasja</option>
        </select>`;
      const result = await showModal(title, bodyHtml, [
        { label: 'Annuleren', class: 'cancel', value: null },
        { label: 'Aanmaken', class: 'primary', value: 'ok' }
      ]);
      if (result !== 'ok') return null;
      const naam = document.getElementById('modalInputVal')?.value?.trim();
      const cat = document.getElementById('modalSelectCat')?.value;
      if (!naam) return null;
      return { naam, cat };
    }

    async function modalConfirm(title, message, confirmLabel, isDanger) {
      const bodyHtml = `<p style="font-size:14px;color:var(--text);line-height:1.5;">${esc(message)}</p>`;
      const result = await showModal(title, bodyHtml, [
        { label: 'Annuleren', class: 'cancel', value: false },
        { label: confirmLabel || 'Bevestigen', class: isDanger ? 'danger' : 'primary', value: true }
      ]);
      return result === true;
    }

    // ═══ Saving indicator ═══
    let savingTimeout;
    function showSaving() {
      const el = document.getElementById('savingIndicator');
      el.classList.add('active');
      el.innerHTML = '<div class="saving-dot"></div> <span>Opslaan...</span>';
    }
    function showSaved() {
      const el = document.getElementById('savingIndicator');
      el.innerHTML = '<span class="saved-check">✓ Opgeslagen</span>';
      el.classList.add('active');
      clearTimeout(savingTimeout);
      savingTimeout = setTimeout(() => el.classList.remove('active'), 2000);
    }

    // ═══ Toast / Undo ═══
    let activeToast = null;
    function showToast(message, undoFn) {
      if (activeToast) activeToast.remove();
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `<span>${esc(message)}</span>`;
      if (undoFn) {
        const btn = document.createElement('button');
        btn.className = 'toast-undo';
        btn.textContent = 'Ongedaan maken';
        btn.addEventListener('click', async () => {
          toast.remove();
          activeToast = null;
          await undoFn();
        });
        toast.appendChild(btn);
      }
      document.body.appendChild(toast);
      activeToast = toast;
      setTimeout(() => {
        if (activeToast === toast) {
          toast.classList.add('hiding');
          setTimeout(() => { toast.remove(); activeToast = null; }, 300);
        }
      }, 5000);
    }

    // ═══ Datum helpers ═══
    function formatDate(d) {
      if (!d) return '';
      const dt = new Date(d);
      return `${String(dt.getDate()).padStart(2,'0')}-${String(dt.getMonth()+1).padStart(2,'0')}-${dt.getFullYear()}`;
    }
    function daysUntil(d) {
      if (!d) return null;
      const dt = new Date(d), now = new Date();
      dt.setHours(0,0,0,0); now.setHours(0,0,0,0);
      return Math.ceil((dt - now) / 86400000);
    }
