-- -----------------------------------------------------------
-- Beispiel-Daten für stutengarten-Datenbank
-- -----------------------------------------------------------

-- KUNDEN
INSERT INTO kunden (stutengarten_id, vorname, nachname)
VALUES
('K1', 'Max', 'Mustermann'),
('K2', 'Anna', 'Müller'),
('K3', 'Paul', 'Schmidt');


-- KUNDENSPARBUECHER
INSERT INTO kundensparbuecher (kunden_fk, saldo)
VALUES
('K1', 150),
('K2', 300),
('K3', 50);


-- KUNDENUMSAETZE
INSERT INTO kundenumsaetze (kundensparbuch_fk, betrag, verwendungszweck)
VALUES
(1, 50, 'Taschengeld'),
(2, -20, 'Döner'),
(3, 100, 'Geschenk');


-- KUNDENAKTIEN
INSERT INTO kundenaktien (besitzer_fk, wert, wochentage)
VALUES
('K1', 3, 'MONTAG'),
('K2', 5, 'MITTWOCH'),
('K3', 4, 'FREITAG');


-- UNTERNEHMEN
INSERT INTO unternehmen (bezeichnung, mappe_abgegeben)
VALUES
('Polizei', TRUE),
('DM', FALSE),
('Aldi', TRUE);


-- UNTERNEHMENSPARBUCH
INSERT INTO unternehmenssparbuecher (unternehmen_fk, saldo)
VALUES
(1, 1000),
(2, 500),
(3, 1500);


-- UNTERNEHMENSUMSAETZE
INSERT INTO unternehmensumsaetze (unternehmenssparbuecher_fk, betrag, verwendungszweck)
VALUES
(1, 200, 'Festnahmen'),
(2, -100, 'Einkauf von Material'),
(3, 300, 'Verkauf');


-- KUNDENSTATISTIK
INSERT INTO kundenstatistik (wochentage, gesamtumsatz)
VALUES
('MONTAG', 120),
('MITTWOCH', 80),
('FREITAG', 200);


-- UNTERNEHMENSSTATISTIK
INSERT INTO unternehmensstatistik (wochentage, gesamtumsatz)
VALUES
('MONTAG', 400),
('MITTWOCH', 250),
('FREITAG', 600);


-- WIRTSCHAFTSBEIHILFE
INSERT INTO wirtschaftsbeihilfe (beruf, betrag, unternehmen_fk)
VALUES
('Polizist', 100, 1),
('Verkäufer', 80, 2),
('Verkäufer', 120, 3);