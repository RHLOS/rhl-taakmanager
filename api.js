    // ═══ Supabase config ═══
    const SB = 'https://fhkttfzqdjynzmtjbujv.supabase.co';
    const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoa3R0ZnpxZGp5bnptdGpidWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDg5NjgsImV4cCI6MjA5MDI4NDk2OH0.0p7IK97uPxBcazlUwredncV8EIFuvgjAhe46N9P118I';
    const hdrs = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' };

    // ═══ Veiligheid: voorkom XSS ═══
    function esc(str) {
      if (!str) return '';
      const d = document.createElement('div');
      d.textContent = str;
      return d.innerHTML;
    }

    async function api(table, params = '') {
      const r = await fetch(`${SB}/rest/v1/${table}?${params}`, { headers: hdrs });
      if (!r.ok) throw new Error(`Fout bij laden ${table}`);
      return r.json();
    }

    async function post(table, data) {
      showSaving();
      const r = await fetch(`${SB}/rest/v1/${table}`, {
        method: 'POST', headers: { ...hdrs, 'Prefer': 'return=representation' },
        body: JSON.stringify(data)
      });
      if (!r.ok) { const t = await r.text(); throw new Error(`Fout bij aanmaken: ${t}`); }
      showSaved();
      return r.json();
    }

    const ALLOWED_TABLES = new Set(['taken','subtaken','sub_subtaken','contexts','meta','afgerond_log']);

    async function del(table, idOrFilter) {
      if (!ALLOWED_TABLES.has(table)) throw new Error(`Ongeldige tabel: ${table}`);
      const filter = idOrFilter ? `id=eq.${idOrFilter}` : '';
      const r = await fetch(`${SB}/rest/v1/${table}?${filter}`, { method: 'DELETE', headers: hdrs });
      if (!r.ok) throw new Error('Fout bij verwijderen');
    }

    async function delWhere(table, filter) {
      if (!ALLOWED_TABLES.has(table)) throw new Error(`Ongeldige tabel: ${table}`);
      if (!filter || typeof filter !== 'string') throw new Error('Ongeldig filter');
      const r = await fetch(`${SB}/rest/v1/${table}?${filter}`, { method: 'DELETE', headers: hdrs });
      if (!r.ok) throw new Error('Fout bij verwijderen');
    }

    async function patch(table, id, data) {
      showSaving();
      const r = await fetch(`${SB}/rest/v1/${table}?id=eq.${id}`, {
        method: 'PATCH', headers: { ...hdrs, 'Prefer': 'return=representation' },
        body: JSON.stringify(data)
      });
      if (!r.ok) throw new Error(`Fout bij opslaan`);
      showSaved();
      return r.json();
    }
