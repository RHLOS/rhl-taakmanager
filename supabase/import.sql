-- ============================================
-- RHL Taakmanager — Data Import uit taken.json
-- ============================================

-- ============================================
-- Hoofdtaken
-- ============================================

insert into taken (nr, taak, categorie, prioriteit, type) values
  (8,  'HSPI project',                   'Werk',  'hoog',    'normaal'),
  (10, 'Privé divers',                   'Privé', 'normaal', 'normaal'),
  (11, 'NGSJ — openstaande taken',       'Privé', 'normaal', 'normaal'),
  (12, 'Financieel maandoverzicht zakelijk', 'Werk', 'normaal', 'normaal'),
  (15, 'Werk divers',                    'Werk',  'normaal', 'normaal'),
  (18, 'Commercie',                      'Werk',  'normaal', 'normaal'),
  (26, 'Leeslijst',                      'Werk',  'normaal', 'normaal'),
  (28, 'Natasja',                        'Privé', 'normaal', 'normaal'),
  (31, 'Follow up commercial leads',     'Werk',  'hoog',    'normaal');

-- ============================================
-- Subtaken: #8 HSPI project
-- ============================================
insert into subtaken (taak_id, sub_id, tekst, gedaan, deadline, volgorde) values
  ((select id from taken where nr = 8), '8a', 'Notulen verwerken', true, null, 1),
  ((select id from taken where nr = 8), '8b', 'Gesprekken nieuwe leden: Newwen (ingepland), Poppelman (ingepland), Pagter (wachten op reactie)', true, null, 2),
  ((select id from taken where nr = 8), '8c', 'Bellen reguliere leden 6x: Auke (RFH), Nick (MS), Sean (JBB), Mark (FL), Jaap (CPA), Herman (AL)', false, null, 3),
  ((select id from taken where nr = 8), '8d', 'Datumprikker verstuurd. Reactie: Ralph, Wouter, Robert. Wacht nog op: Desiree, Nora, Eveline.', false, null, 4),
  ((select id from taken where nr = 8), '8e', 'AI overzichtsdocument', true, null, 5),
  ((select id from taken where nr = 8), '8f', 'Contract Herold: goedgekeurd', true, null, 6),
  ((select id from taken where nr = 8), '8g', 'Presentatie kennismakingsmeetings gemaakt', true, null, 7),
  ((select id from taken where nr = 8), '8h', 'Bellen handelaren 4x: RL (gedaan), FMG (gedaan), VDP (maandag), DFG (maandag)', false, '2026-03-30', 8);

-- ============================================
-- Subtaken: #10 Privé divers
-- ============================================
insert into subtaken (taak_id, sub_id, tekst, gedaan, deadline, volgorde) values
  ((select id from taken where nr = 10), '10a', 'Retour SugarCity', false, null, 1),
  ((select id from taken where nr = 10), '10b', 'Paspoort verlengen', false, null, 2),
  ((select id from taken where nr = 10), '10c', 'NordVPN op andere apparaten installeren', false, null, 3),
  ((select id from taken where nr = 10), '10d', 'Andere mogelijkheden NordVPN verkennen', false, null, 4),
  ((select id from taken where nr = 10), '10e', 'Belastingdocumenten verzamelen — nog te doen: Jaarruimte berekening, DG, RABO, SAXO, UPO (gedaan: ASN, DFG, ING, KNAB, NN, RAISIN)', false, '2026-03-29', 5),
  ((select id from taken where nr = 10), '10f', 'Noodpakket aanvullen: €300 + vochtige doekjes', false, null, 6),
  ((select id from taken where nr = 10), '10g', '2x webinar AI-Report kijken', false, null, 7),
  ((select id from taken where nr = 10), '10h', 'Boeken op MacBook sorteren naar ext. HD', false, null, 8),
  ((select id from taken where nr = 10), '10i', 'Inplannen langs camping Loman', false, null, 9),
  ((select id from taken where nr = 10), '10j', 'ChatGPT afsluiten & Gemini openen', false, null, 10),
  ((select id from taken where nr = 10), '10k', 'Follow-up Antonio (scheiding & morning routine)', false, '2026-03-29', 11),
  ((select id from taken where nr = 10), '10l', 'Overhemden SS kopen', false, null, 12),
  ((select id from taken where nr = 10), '10m', 'Notion gekoppeld aan Claude', true, null, 13),
  ((select id from taken where nr = 10), '10n', 'Salaris overgemaakt', true, null, 14),
  ((select id from taken where nr = 10), '10o', 'Agenda shortcuts instellen', false, null, 15),
  ((select id from taken where nr = 10), '10p', 'Wandelschoenen schoonmaken', false, '2026-03-28', 16),
  ((select id from taken where nr = 10), '10q', 'Whisky Harold uitzoeken', false, '2026-03-28', 17),
  ((select id from taken where nr = 10), '10r', 'Bellen Roos (niet opgenomen)', false, '2026-03-30', 18),
  ((select id from taken where nr = 10), '10s', 'Bellen Marjolein (niet opgenomen)', false, '2026-03-30', 19),
  ((select id from taken where nr = 10), '10t', 'Alle AI dumps op 1 plek (Notion?)', false, null, 20),
  ((select id from taken where nr = 10), '10u', 'Alle bookmarks uit Safari in Notion', false, null, 21),
  ((select id from taken where nr = 10), '10v', 'Alle leeslijst en linkjes voortaan in CC?', false, null, 22);

-- ============================================
-- Subtaken: #11 NGSJ
-- ============================================
insert into subtaken (taak_id, sub_id, tekst, gedaan, deadline, volgorde) values
  ((select id from taken where nr = 11), '11a', 'Welkomstbrief nieuwe leden updaten & versturen', false, null, 1),
  ((select id from taken where nr = 11), '11b', 'Kaartje Jubilea (25 jr)', false, null, 2),
  ((select id from taken where nr = 11), '11c', 'Contact Gabriel (deel 3 pelgrimsverhaal)', false, null, 3),
  ((select id from taken where nr = 11), '11d', 'Zoeken naar andere locaties café & presentaties', false, null, 4);

-- ============================================
-- Subtaken: #12 Financieel maandoverzicht
-- ============================================
insert into subtaken (taak_id, sub_id, tekst, gedaan, deadline, volgorde) values
  ((select id from taken where nr = 12), '12a', 'Overzicht invullen', false, null, 1),
  ((select id from taken where nr = 12), '12b', 'Analyse maken', false, null, 2);

-- ============================================
-- Subtaken: #15 Werk divers
-- ============================================
insert into subtaken (taak_id, sub_id, tekst, gedaan, deadline, volgorde) values
  ((select id from taken where nr = 15), '15a', 'Lunch met Rico inplannen', false, null, 1),
  ((select id from taken where nr = 15), '15b', 'Leeslijst Chrome leegmaken', false, null, 2),
  ((select id from taken where nr = 15), '15c', 'Oefenen met PowerPoint via Claude', true, null, 3),
  ((select id from taken where nr = 15), '15d', 'Broodfonds/Schenkkring regelen', true, null, 4),
  ((select id from taken where nr = 15), '15e', 'Bij Henri nagaan wanneer de PPWR tool kijken', false, '2026-03-30', 5),
  ((select id from taken where nr = 15), '15f', 'Afspraak Lisa inplannen', true, null, 6),
  ((select id from taken where nr = 15), '15g', 'Omzetbelasting betalen', true, null, 7),
  ((select id from taken where nr = 15), '15h', 'Transcriptie maken met AI van twee gesprekken', false, null, 8),
  ((select id from taken where nr = 15), '15i', 'Terugbellen Remco Jansen', true, null, 9),
  ((select id from taken where nr = 15), '15j', 'f.u. Newwen met info over PPWR', true, null, 10),
  ((select id from taken where nr = 15), '15k', 'Fotograaf en Vormgever/Website', false, null, 11);

-- ============================================
-- Subtaken: #18 Commercie
-- ============================================
insert into subtaken (taak_id, sub_id, tekst, gedaan, deadline, volgorde) values
  ((select id from taken where nr = 18), '18a', 'MPS over residu & uitgangsmateriaal', false, null, 1),
  ((select id from taken where nr = 18), '18b', 'FSI over specifieke projecten', false, null, 2),
  ((select id from taken where nr = 18), '18c', 'HSPI/GPA over certificering icm FSI', false, null, 3),
  ((select id from taken where nr = 18), '18d', 'PM (nader in te vullen)', false, null, 4),
  ((select id from taken where nr = 18), '18e', 'Artikel voor Manual Master', false, null, 5),
  ((select id from taken where nr = 18), '18f', 'LinkedIn slider aanstaande wetgeving', false, null, 6),
  ((select id from taken where nr = 18), '18g', 'Vanaf 1/8 concurrenten DFG benaderen: contactpersonen directieniveau, aangepast profiel (SSS, SBTi, CSRD, etc.)', false, '2026-08-01', 7);

-- ============================================
-- Subtaken: #26 Leeslijst
-- ============================================
insert into subtaken (taak_id, sub_id, tekst, gedaan, deadline, volgorde) values
  ((select id from taken where nr = 26), '26a', 'IDH rapport', true, null, 1),
  ((select id from taken where nr = 26), '26b', 'AH impactverslag', false, null, 2),
  ((select id from taken where nr = 26), '26c', 'Boek Marlot', false, null, 3),
  ((select id from taken where nr = 26), '26d', 'Stuk Merieux', false, null, 4),
  ((select id from taken where nr = 26), '26e', 'Intentioneel leven', false, null, 5),
  ((select id from taken where nr = 26), '26f', 'Me, myself and AI', false, null, 6),
  ((select id from taken where nr = 26), '26g', 'Obsidian', false, null, 7),
  ((select id from taken where nr = 26), '26h', 'Verbaal meesterschap', false, null, 8),
  ((select id from taken where nr = 26), '26i', 'Omdenken werk', false, null, 9),
  ((select id from taken where nr = 26), '26j', 'Overtuigend debateren', false, null, 10),
  ((select id from taken where nr = 26), '26k', 'Je podium pakken', false, null, 11),
  ((select id from taken where nr = 26), '26l', '101 beïnvloedingstechnieken', false, null, 12),
  ((select id from taken where nr = 26), '26m', 'Einde vd strategie', false, null, 13),
  ((select id from taken where nr = 26), '26n', 'IMPACT herlezen', false, null, 14),
  ((select id from taken where nr = 26), '26o', 'The devil has a name', false, null, 15),
  ((select id from taken where nr = 26), '26p', 'Brother(s)', false, null, 16),
  ((select id from taken where nr = 26), '26q', 'Chasing the sun', false, null, 17);

-- ============================================
-- Subtaken: #28 Natasja
-- ============================================
insert into subtaken (taak_id, sub_id, tekst, gedaan, deadline, volgorde) values
  ((select id from taken where nr = 28), '28a', 'Autoverzekering', false, null, 1),
  ((select id from taken where nr = 28), '28b', 'Auto wassen', false, null, 2),
  ((select id from taken where nr = 28), '28c', 'VR experience', false, null, 3),
  ((select id from taken where nr = 28), '28d', 'Cabiner', false, null, 4);

-- ============================================
-- Subtaken: #31 Follow up commercial leads
-- ============================================
insert into subtaken (taak_id, sub_id, tekst, gedaan, deadline, volgorde) values
  ((select id from taken where nr = 31), '31a', 'Nabellen Mark-Jan Terwindt', false, '2026-03-30', 1),
  ((select id from taken where nr = 31), '31b', 'Nabellen Merthus Bezemer', false, '2026-04-10', 2),
  ((select id from taken where nr = 31), '31c', 'Nabellen Mindpact', false, '2026-03-30', 3),
  ((select id from taken where nr = 31), '31d', 'Nutreco: terugbellen indien geen bericht', false, '2026-04-10', 4);

-- ============================================
-- Lage prioriteit lijsten
-- ============================================
insert into laag_prioriteit (nr, taak, categorie) values
  (29, 'Kijklijst',  'Werk'),
  (30, 'Shoplijst',  'Privé'),
  (32, 'Nice to do', 'Privé');

-- Kijklijst items
insert into laag_items (lijst_id, tekst, volgorde) values
  ((select id from laag_prioriteit where nr = 29), 'Down the road', 1),
  ((select id from laag_prioriteit where nr = 29), 'Pointer (elektrolyten, bloemen)', 2),
  ((select id from laag_prioriteit where nr = 29), 'F1', 3),
  ((select id from laag_prioriteit where nr = 29), 'The North', 4),
  ((select id from laag_prioriteit where nr = 29), 'I''ll push you', 5);

-- Shoplijst items
insert into laag_items (lijst_id, tekst, volgorde) values
  ((select id from laag_prioriteit where nr = 30), 'New Balance 9060', 1),
  ((select id from laag_prioriteit where nr = 30), 'Abisko Winter Stretch Trousers M, EU52/R, 550/Black', 2);

-- Nice to do items
insert into laag_items (lijst_id, tekst, volgorde) values
  ((select id from laag_prioriteit where nr = 32), 'Stadsplattegronden van Apeldoorn, Delft, Amsterdam, Uithoorn', 1),
  ((select id from laag_prioriteit where nr = 32), 'Bushcraft / Wildernis training / Outdoor-survival (re-wild.nl)', 2),
  ((select id from laag_prioriteit where nr = 32), 'Stamboom — Coda Archief Apeldoorn?', 3),
  ((select id from laag_prioriteit where nr = 32), 'Eigen planner maken (en laten drukken als relatiegeschenk)', 4);

-- ============================================
-- Afgeronde taken log
-- ============================================
insert into afgerond_log (taak_nr, taak_tekst, categorie, gedaan_datum, notities) values
  ('20',  'Facturen Q3 opzoeken',                    'Werk',  '2026-03-25', 'a. Parool · b. AI Report'),
  ('27',  'Commerciële promotie',                     'Werk',  '2026-03-25', 'Samengevoegd met #18 Commercie'),
  ('8a',  'HSPI: Notulen verwerken',                  'Werk',  '2026-03-25', null),
  ('8b',  'HSPI: Gesprekken nieuwe leden',            'Werk',  '2026-03-26', 'Newwen, Poppelman, Pagter allen benaderd'),
  ('8d',  'HSPI: Datumprikker werkgroepsessie',       'Werk',  '2026-03-25', 'Verstuurd, wacht op reacties'),
  ('8e',  'HSPI: AI overzichtsdocument',              'Werk',  '2026-03-25', null),
  ('8f',  'HSPI: Contract Herold goedgekeurd',        'Werk',  '2026-03-26', null),
  ('8g',  'HSPI: Presentatie kennismakingsmeetings',  'Werk',  '2026-03-25', null),
  ('10m', 'Notion gekoppeld aan Claude',              'Privé', '2026-03-25', null),
  ('10n', 'Salaris overgemaakt',                      'Privé', '2026-03-25', null),
  ('15c', 'Oefenen met PowerPoint via Claude',        'Werk',  '2026-03-26', null),
  ('15d', 'Broodfonds/Schenkkring regelen',           'Werk',  '2026-03-25', null),
  ('15f', 'Afspraak Lisa inplannen',                  'Werk',  '2026-03-27', null),
  ('15g', 'Omzetbelasting betalen',                   'Werk',  '2026-03-26', null),
  ('15i', 'Terugbellen Remco Jansen',                 'Werk',  '2026-03-26', null),
  ('15j', 'f.u. Newwen met info over PPWR',           'Werk',  '2026-03-26', null),
  ('26a', 'IDH rapport lezen',                        'Werk',  '2026-03-27', null);
