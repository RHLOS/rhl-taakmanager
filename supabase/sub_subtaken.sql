-- ============================================
-- Sub-subtaken tabel + migraties
-- Voer dit als ENIGE script uit in Supabase SQL Editor
-- (schema.sql en import.sql zijn al uitgevoerd)
-- ============================================

-- 1. Sub-subtaken tabel aanmaken
create table sub_subtaken (
  id uuid default gen_random_uuid() primary key,
  subtaak_id uuid references subtaken(id) on delete cascade,
  tekst text not null,
  gedaan boolean default false,
  gedaan_datum date,
  deadline date,
  tijdsinschatting text,
  locatie text,
  volgorde integer default 0,
  aangemaakt_op timestamptz default now()
);

alter table sub_subtaken enable row level security;
create policy "Alles toegestaan" on sub_subtaken for all using (true) with check (true);

-- 2. Tijdsinschatting constraint bijwerken (toevoegen <2uur)
alter table taken drop constraint if exists taken_tijdsinschatting_check;
alter table taken add constraint taken_tijdsinschatting_check
  check (tijdsinschatting in ('<15min', '<1uur', '<2uur', '>1uur'));

alter table subtaken drop constraint if exists subtaken_tijdsinschatting_check;
alter table subtaken add constraint subtaken_tijdsinschatting_check
  check (tijdsinschatting in ('<15min', '<1uur', '<2uur', '>1uur'));

-- 3. Locatie veld op subtaken wijzigen van text[] naar text
alter table taken alter column locatie type text using (array_to_string(locatie, ', '));
alter table subtaken alter column locatie type text using (array_to_string(locatie, ', '));

-- 4. Lage prioriteit taken migreren naar de gewone taken-tabel
-- Kijklijst (#29) → gewone taak met subtaken
insert into taken (nr, taak, categorie, prioriteit, type) values
  (29, 'Kijklijst', 'Werk', 'laag', 'normaal'),
  (30, 'Shoplijst', 'Privé', 'laag', 'normaal'),
  (32, 'Nice to do', 'Privé', 'laag', 'normaal');

-- Kijklijst subtaken
insert into subtaken (taak_id, sub_id, tekst, volgorde) values
  ((select id from taken where nr = 29), '29a', 'Down the road', 1),
  ((select id from taken where nr = 29), '29b', 'Pointer (elektrolyten, bloemen)', 2),
  ((select id from taken where nr = 29), '29c', 'F1', 3),
  ((select id from taken where nr = 29), '29d', 'The North', 4),
  ((select id from taken where nr = 29), '29e', 'I''ll push you', 5);

-- Shoplijst subtaken
insert into subtaken (taak_id, sub_id, tekst, volgorde) values
  ((select id from taken where nr = 30), '30a', 'New Balance 9060', 1),
  ((select id from taken where nr = 30), '30b', 'Abisko Winter Stretch Trousers M, EU52/R, 550/Black', 2);

-- Nice to do subtaken
insert into subtaken (taak_id, sub_id, tekst, volgorde) values
  ((select id from taken where nr = 32), '32a', 'Stadsplattegronden van Apeldoorn, Delft, Amsterdam, Uithoorn', 1),
  ((select id from taken where nr = 32), '32b', 'Bushcraft / Wildernis training / Outdoor-survival (re-wild.nl)', 2),
  ((select id from taken where nr = 32), '32c', 'Stamboom — Coda Archief Apeldoorn?', 3),
  ((select id from taken where nr = 32), '32d', 'Eigen planner maken (en laten drukken als relatiegeschenk)', 4);

-- 5. Subtaak opsplitsingen (8c, 8d, 8h, 10e)
update subtaken set tekst = 'Bellen reguliere leden' where sub_id = '8c';
insert into sub_subtaken (subtaak_id, tekst, gedaan, volgorde) values
  ((select id from subtaken where sub_id = '8c'), 'Auke (RFH)', false, 1),
  ((select id from subtaken where sub_id = '8c'), 'Nick (MS)', false, 2),
  ((select id from subtaken where sub_id = '8c'), 'Sean (JBB)', false, 3),
  ((select id from subtaken where sub_id = '8c'), 'Mark (FL)', false, 4),
  ((select id from subtaken where sub_id = '8c'), 'Jaap (CPA)', false, 5),
  ((select id from subtaken where sub_id = '8c'), 'Herman (AL)', false, 6);

update subtaken set tekst = 'Datumprikker — wacht op reactie' where sub_id = '8d';
insert into sub_subtaken (subtaak_id, tekst, gedaan, volgorde) values
  ((select id from subtaken where sub_id = '8d'), 'Ralph', true, 1),
  ((select id from subtaken where sub_id = '8d'), 'Wouter', true, 2),
  ((select id from subtaken where sub_id = '8d'), 'Robert', true, 3),
  ((select id from subtaken where sub_id = '8d'), 'Desiree', false, 4),
  ((select id from subtaken where sub_id = '8d'), 'Nora', false, 5),
  ((select id from subtaken where sub_id = '8d'), 'Eveline', false, 6);

update subtaken set tekst = 'Bellen handelaren' where sub_id = '8h';
insert into sub_subtaken (subtaak_id, tekst, gedaan, volgorde) values
  ((select id from subtaken where sub_id = '8h'), 'RL', true, 1),
  ((select id from subtaken where sub_id = '8h'), 'FMG', true, 2),
  ((select id from subtaken where sub_id = '8h'), 'VDP', false, 3),
  ((select id from subtaken where sub_id = '8h'), 'DFG', false, 4);

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
