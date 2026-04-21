-- SQL Skript für Datenbank
CREATE DATABASE stutengarten;
USE stutengarten;


-- Kinderkonten
CREATE TABLE kunden (
	id INT AUTO_INCREMENT PRIMARY KEY,
	stutengarten_id VARCHAR(50) UNIQUE NOT NULL,
	vorname VARCHAR(50) NOT NULL,
	nachname VARCHAR(50) NOT NULL
);

-- Index für stutengarten_id ist durch UNIQUE Constraint schon implizit da,
-- aber sicherheitshalber explizit definieren schadet nicht, falls UNIQUE mal wegfällt.
-- (Hier aber optional, da UNIQUE bereits einen Index erzeugt).


CREATE TABLE kundensparbuecher (
	id INT AUTO_INCREMENT PRIMARY KEY,
	kunden_fk VARCHAR(50) NOT NULL,
	saldo INT DEFAULT 0,
	FOREIGN KEY (kunden_fk) REFERENCES kunden(stutengarten_id) ON DELETE CASCADE
);
-- PERFORMANCE OPTIMIERUNG: Index für Fremdschlüssel
CREATE INDEX idx_kundensparbuecher_kunden_fk ON kundensparbuecher(kunden_fk);


CREATE TABLE kundenumsaetze (
	id INT AUTO_INCREMENT PRIMARY KEY,
	kundensparbuch_fk INT NOT NULL,
	betrag INT NOT NULL,
	verwendungszweck VARCHAR(255),
	FOREIGN KEY (kundensparbuch_fk) REFERENCES kundensparbuecher(id) ON DELETE CASCADE
);
-- PERFORMANCE OPTIMIERUNG: Index für Fremdschlüssel (Wichtig für Historie!)
CREATE INDEX idx_kundenumsaetze_kundensparbuch_fk ON kundenumsaetze(kundensparbuch_fk);


-- vordefinierte Aktien
CREATE TABLE aktien (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(100) NOT NULL UNIQUE,
	symbol VARCHAR(5) NOT NULL UNIQUE,
	beschreibung TEXT,
	erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE kundenaktien (
	id INT AUTO_INCREMENT PRIMARY KEY,
	besitzer_fk VARCHAR(50) NOT NULL,
	aktie_fk INT NOT NULL,
	investierter_betrag INT NOT NULL,
	aktueller_wert INT NOT NULL,
	wochentage ENUM('MONTAG', 'DIENSTAG', 'MITTWOCH', 'DONNERSTAG', 'FREITAG', 'SAMSTAG', 'SONNTAG') NOT NULL,
	FOREIGN KEY (besitzer_fk) REFERENCES kunden(stutengarten_id) ON DELETE CASCADE,
	FOREIGN KEY (aktie_fk) REFERENCES aktien(id) ON DELETE CASCADE
);
-- PERFORMANCE OPTIMIERUNG: Indizes für Portfolio-Abfragen
CREATE INDEX idx_kundenaktien_besitzer_fk ON kundenaktien(besitzer_fk);
CREATE INDEX idx_kundenaktien_aktie_fk ON kundenaktien(aktie_fk);


-- Unternehmenskonten
CREATE TABLE unternehmen (
	id INT AUTO_INCREMENT PRIMARY KEY,
	bezeichnung VARCHAR(255) NOT NULL UNIQUE,
	mappe_abgegeben BOOL DEFAULT FALSE
);

CREATE TABLE unternehmenssparbuecher (
	id INT AUTO_INCREMENT PRIMARY KEY,
	unternehmen_fk INT NOT NULL,
	saldo INT DEFAULT 0,
	FOREIGN KEY (unternehmen_fk) REFERENCES unternehmen(id) ON DELETE CASCADE
);
-- PERFORMANCE OPTIMIERUNG: Index für Firmensuche
CREATE INDEX idx_unternehmenssparbuecher_unternehmen_fk ON unternehmenssparbuecher(unternehmen_fk);


CREATE TABLE unternehmensumsaetze (
	id INT AUTO_INCREMENT PRIMARY KEY,
	unternehmenssparbuecher_fk INT NOT NULL,
	betrag INT NOT NULL,
	verwendungszweck VARCHAR(255),
	FOREIGN KEY (unternehmenssparbuecher_fk) REFERENCES unternehmenssparbuecher(id) ON DELETE CASCADE
);
-- PERFORMANCE OPTIMIERUNG: Index für Firmenumsätze
CREATE INDEX idx_unternehmensumsaetze_fk ON unternehmensumsaetze(unternehmenssparbuecher_fk);
	

-- Statistik
CREATE TABLE kundenstatistik (
	id INT AUTO_INCREMENT PRIMARY KEY,
	wochentage ENUM('MONTAG', 'DIENSTAG', 'MITTWOCH', 'DONNERSTAG', 'FREITAG', 'SAMSTAG', 'SONNTAG') NOT NULL,
	gesamtumsatz INT
);
-- PERFORMANCE OPTIMIERUNG: Index für Wochentag (da danach gesucht/gefiltert wird)
CREATE INDEX idx_kundenstatistik_wochentage ON kundenstatistik(wochentage);
	

-- Unternehmensstatistik
CREATE TABLE unternehmensstatistik (
	id INT AUTO_INCREMENT PRIMARY KEY,
	wochentage ENUM('MONTAG', 'DIENSTAG', 'MITTWOCH', 'DONNERSTAG', 'FREITAG', 'SAMSTAG', 'SONNTAG') NOT NULL,
	gesamtumsatz INT
);
-- PERFORMANCE OPTIMIERUNG: Index für Wochentag
CREATE INDEX idx_unternehmensstatistik_wochentage ON unternehmensstatistik(wochentage);


-- Wirtschaftsbeihilfe
CREATE TABLE wirtschaftsbeihilfe (
	id INT AUTO_INCREMENT PRIMARY KEY,
	beruf VARCHAR(255) NOT NULL,
	betrag INT NOT NULL,
	unternehmen_fk INT NOT NULL,
	FOREIGN KEY (unternehmen_fk) REFERENCES unternehmen(id) ON DELETE CASCADE
);
-- PERFORMANCE OPTIMIERUNG: Index für Fremdschlüssel
CREATE INDEX idx_wirtschaftsbeihilfe_unternehmen_fk ON wirtschaftsbeihilfe(unternehmen_fk);