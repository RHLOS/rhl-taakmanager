-- ============================================
-- RHL Taakmanager — Database Schema
-- ============================================

-- Tabel: taken (hoofdtaken)
create table taken (
  id uuid default gen_random_uuid() primary key,
  nr integer unique not null,
  taak text not null,
  categorie text check (categorie in ('Werk', 'Privé')) not null,
  prioriteit text check (prioriteit in ('hoog', 'normaal', 'laag')) default 'normaal',
  type text check (type in ('normaal', 'laag')) default 'normaal',
  deadline date,
  locatie text[],
  tijdsinschatting text check (tijdsinschatting in ('<15min', '<1uur', '>1uur')),
  gedaan boolean default false,
  gedaan_datum date,
  aangemaakt_op timestamptz default now(),
  bijgewerkt_op timestamptz default now()
);

-- Tabel: subtaken
create table subtaken (
  id uuid default gen_random_uuid() primary key,
  taak_id uuid references taken(id) on delete cascade,
  sub_id text not null,
  tekst text not null,
  prioriteit boolean default false,
  deadline date,
  locatie text[],
  tijdsinschatting text check (tijdsinschatting in ('<15min', '<1uur', '>1uur')),
  gedaan boolean default false,
  gedaan_datum date,
  volgorde integer default 0,
  aangemaakt_op timestamptz default now()
);

-- Tabel: laag_prioriteit (lage prioriteit lijsten)
create table laag_prioriteit (
  id uuid default gen_random_uuid() primary key,
  nr integer unique not null,
  taak text not null,
  categorie text check (categorie in ('Werk', 'Privé')) not null,
  aangemaakt_op timestamptz default now()
);

-- Tabel: laag_items (items binnen lage prioriteit lijsten)
create table laag_items (
  id uuid default gen_random_uuid() primary key,
  lijst_id uuid references laag_prioriteit(id) on delete cascade,
  tekst text not null,
  gedaan boolean default false,
  gedaan_datum date,
  volgorde integer default 0
);

-- Tabel: afgerond_log (historie van afgeronde taken)
create table afgerond_log (
  id uuid default gen_random_uuid() primary key,
  taak_nr text not null,
  taak_tekst text not null,
  categorie text,
  gedaan_datum date not null,
  notities text,
  aangemaakt_op timestamptz default now()
);

-- Tabel: meta (instellingen)
create table meta (
  sleutel text primary key,
  waarde text
);

-- Initiële meta-waarden
insert into meta values ('volgend_nr', '33');
insert into meta values ('laatste_update', '2026-03-27');

-- ============================================
-- Auto-update bijgewerkt_op bij wijzigingen
-- ============================================
create or replace function update_bijgewerkt_op()
returns trigger as $$
begin
  new.bijgewerkt_op = now();
  return new;
end;
$$ language plpgsql;

create trigger taken_bijgewerkt_op
  before update on taken
  for each row execute function update_bijgewerkt_op();

-- ============================================
-- Row Level Security (RLS)
-- ============================================
alter table taken enable row level security;
alter table subtaken enable row level security;
alter table laag_prioriteit enable row level security;
alter table laag_items enable row level security;
alter table afgerond_log enable row level security;
alter table meta enable row level security;

-- Policies: anon key mag alles lezen en schrijven (persoonlijke app, één gebruiker)
create policy "Alles toegestaan" on taken for all using (true) with check (true);
create policy "Alles toegestaan" on subtaken for all using (true) with check (true);
create policy "Alles toegestaan" on laag_prioriteit for all using (true) with check (true);
create policy "Alles toegestaan" on laag_items for all using (true) with check (true);
create policy "Alles toegestaan" on afgerond_log for all using (true) with check (true);
create policy "Alles toegestaan" on meta for all using (true) with check (true);
