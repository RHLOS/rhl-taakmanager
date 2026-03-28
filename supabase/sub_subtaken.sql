-- ============================================
-- Sub-subtaken tabel
-- ============================================
create table sub_subtaken (
  id uuid default gen_random_uuid() primary key,
  subtaak_id uuid references subtaken(id) on delete cascade,
  tekst text not null,
  gedaan boolean default false,
  gedaan_datum date,
  volgorde integer default 0,
  aangemaakt_op timestamptz default now()
);

-- RLS
alter table sub_subtaken enable row level security;
create policy "Alles toegestaan" on sub_subtaken for all using (true) with check (true);

-- ============================================
-- Subtaak 8c: Bellen reguliere leden
-- Tekst bijwerken + sub-subtaken aanmaken
-- ============================================
update subtaken set tekst = 'Bellen reguliere leden' where sub_id = '8c';

insert into sub_subtaken (subtaak_id, tekst, gedaan, volgorde) values
  ((select id from subtaken where sub_id = '8c'), 'Auke (RFH)', false, 1),
  ((select id from subtaken where sub_id = '8c'), 'Nick (MS)', false, 2),
  ((select id from subtaken where sub_id = '8c'), 'Sean (JBB)', false, 3),
  ((select id from subtaken where sub_id = '8c'), 'Mark (FL)', false, 4),
  ((select id from subtaken where sub_id = '8c'), 'Jaap (CPA)', false, 5),
  ((select id from subtaken where sub_id = '8c'), 'Herman (AL)', false, 6);

-- ============================================
-- Subtaak 8d: Datumprikker — wacht op reactie
-- ============================================
update subtaken set tekst = 'Datumprikker — wacht op reactie' where sub_id = '8d';

insert into sub_subtaken (subtaak_id, tekst, gedaan, volgorde) values
  ((select id from subtaken where sub_id = '8d'), 'Ralph', true, 1),
  ((select id from subtaken where sub_id = '8d'), 'Wouter', true, 2),
  ((select id from subtaken where sub_id = '8d'), 'Robert', true, 3),
  ((select id from subtaken where sub_id = '8d'), 'Desiree', false, 4),
  ((select id from subtaken where sub_id = '8d'), 'Nora', false, 5),
  ((select id from subtaken where sub_id = '8d'), 'Eveline', false, 6);

-- ============================================
-- Subtaak 8h: Bellen handelaren
-- ============================================
update subtaken set tekst = 'Bellen handelaren' where sub_id = '8h';

insert into sub_subtaken (subtaak_id, tekst, gedaan, volgorde) values
  ((select id from subtaken where sub_id = '8h'), 'RL', true, 1),
  ((select id from subtaken where sub_id = '8h'), 'FMG', true, 2),
  ((select id from subtaken where sub_id = '8h'), 'VDP', false, 3),
  ((select id from subtaken where sub_id = '8h'), 'DFG', false, 4);

-- ============================================
-- Subtaak 10e: Belastingdocumenten verzamelen
-- ============================================
update subtaken set tekst = 'Belastingdocumenten verzamelen' where sub_id = '10e';

insert into sub_subtaken (subtaak_id, tekst, gedaan, volgorde) values
  ((select id from subtaken where sub_id = '10e'), 'Jaarruimte berekening', false, 1),
  ((select id from subtaken where sub_id = '10e'), 'DG', false, 2),
  ((select id from subtaken where sub_id = '10e'), 'RABO', false, 3),
  ((select id from subtaken where sub_id = '10e'), 'SAXO', false, 4),
  ((select id from subtaken where sub_id = '10e'), 'UPO', false, 5),
  ((select id from subtaken where sub_id = '10e'), 'ASN', true, 6),
  ((select id from subtaken where sub_id = '10e'), 'DFG', true, 7),
  ((select id from subtaken where sub_id = '10e'), 'ING', true, 8),
  ((select id from subtaken where sub_id = '10e'), 'KNAB', true, 9),
  ((select id from subtaken where sub_id = '10e'), 'NN', true, 10),
  ((select id from subtaken where sub_id = '10e'), 'RAISIN', true, 11);
