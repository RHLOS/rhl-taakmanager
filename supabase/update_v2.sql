-- ============================================
-- RHL Taakmanager — Schema Update v2
-- Voer dit uit in Supabase SQL Editor
-- (na de eerdere scripts)
-- ============================================

-- 1. Nieuwe velden op subtaken
alter table subtaken add column if not exists tijd_uitgevoerd integer;
alter table subtaken add column if not exists context text[];

-- 2. Nieuwe velden op sub_subtaken
alter table sub_subtaken add column if not exists tijd_uitgevoerd integer;
alter table sub_subtaken add column if not exists context text[];
alter table sub_subtaken add column if not exists prioriteit boolean default false;

-- 3. Nieuwe velden op taken (hoofdtaken / projecten)
alter table taken add column if not exists tijd_uitgevoerd integer;
alter table taken add column if not exists context text[];

-- 4. Tijdsinschatting constraints bijwerken
-- (verwijder oude, voeg nieuwe opties toe)
alter table taken drop constraint if exists taken_tijdsinschatting_check;
alter table taken add constraint taken_tijdsinschatting_check
  check (tijdsinschatting in ('<15 min', '<30 min', '<60 min', '<90 min', '<120 min'));

alter table subtaken drop constraint if exists subtaken_tijdsinschatting_check;
alter table subtaken add constraint subtaken_tijdsinschatting_check
  check (tijdsinschatting in ('<15 min', '<30 min', '<60 min', '<90 min', '<120 min'));

-- sub_subtaken had geen constraint, voeg toe
alter table sub_subtaken drop constraint if exists sub_subtaken_tijdsinschatting_check;
alter table sub_subtaken add constraint sub_subtaken_tijdsinschatting_check
  check (tijdsinschatting in ('<15 min', '<30 min', '<60 min', '<90 min', '<120 min'));

-- 5. Context check op alle tabellen (valide waarden)
-- We gebruiken text[] dus validatie doen we in de frontend

-- 6. Prioriteit veld als boolean op subtaken (voor ster)
alter table subtaken add column if not exists prio_ster boolean default false;

-- 7. Prioriteit veld als boolean op sub_subtaken
-- (al toegevoegd als 'prioriteit' hierboven)

-- 8. Meta: volgend_nr resetten naar 1 voor frisse start
update meta set waarde = '1' where sleutel = 'volgend_nr';
update meta set waarde = '2026-03-28' where sleutel = 'laatste_update';
