-- ============================================
-- Hernummer alle taken vanaf 1
-- ============================================

-- Tijdelijk unique constraint verwijderen
alter table taken drop constraint if exists taken_nr_key;

-- Hernummer op volgorde van huidige nr
with genummerd as (
  select id, row_number() over (order by nr asc) as nieuw_nr
  from taken
)
update taken set nr = genummerd.nieuw_nr
from genummerd where taken.id = genummerd.id;

-- Unique constraint weer toevoegen
alter table taken add constraint taken_nr_key unique (nr);

-- Volgend nr bijwerken
update meta set waarde = (select (max(nr) + 1)::text from taken) where sleutel = 'volgend_nr';
