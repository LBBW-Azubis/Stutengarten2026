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

CREATE TABLE kundensparbuecher (
	id INT AUTO_INCREMENT PRIMARY KEY,
	kunden_fk VARCHAR(50) NOT NULL,
	saldo INT DEFAULT 0,
	FOREIGN KEY (kunden_fk) REFERENCES kunden(stutengarten_id) ON DELETE CASCADE
	);
	
CREATE TABLE kundenumsaetze (
	id INT AUTO_INCREMENT PRIMARY KEY,
	kundensparbuch_fk INT NOT NULL,
	betrag INT NOT NULL,
	verwendungszweck VARCHAR(255),
	FOREIGN	KEY (kundensparbuch_fk) REFERENCES kundensparbuecher(id) ON DELETE CASCADE
	);

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

CREATE TABLE unternehmensumsaetze (
	id INT AUTO_INCREMENT PRIMARY KEY,
	unternehmenssparbuecher_fk INT NOT NULL,
	betrag INT NOT NULL,
	verwendungszweck VARCHAR(255),
	FOREIGN KEY (unternehmenssparbuecher_fk) REFERENCES unternehmenssparbuecher(id) ON DELETE CASCADE
	);
	

-- Statistik
CREATE TABLE kundenstatistik (
	id INT AUTO_INCREMENT PRIMARY KEY,
	wochentage ENUM('MONTAG', 'DIENSTAG', 'MITTWOCH', 'DONNERSTAG', 'FREITAG', 'SAMSTAG', 'SONNTAG') NOT NULL,
	gesamtumsatz INT
	);
	

-- Unternehmensstatistik
CREATE TABLE unternehmensstatistik (
	id INT AUTO_INCREMENT PRIMARY KEY,
	wochentage ENUM('MONTAG', 'DIENSTAG', 'MITTWOCH', 'DONNERSTAG', 'FREITAG', 'SAMSTAG', 'SONNTAG') NOT NULL,
	gesamtumsatz INT
	);


-- Wirtschaftsbeihilfe
CREATE TABLE wirtschaftsbeihilfe (
	id INT AUTO_INCREMENT PRIMARY KEY,
	beruf VARCHAR(255) NOT NULL,
	betrag INT NOT NULL,
	unternehmen_fk INT NOT NULL,
	FOREIGN KEY (unternehmen_fk) REFERENCES unternehmen(id) ON DELETE CASCADE

	);


INSERT INTO aktien (name, symbol, beschreibung) VALUES
('Apfel AG', 'APF', 'Technologie-Unternehmen'),
('Mercedos AG', 'MRC', 'Auto-Hersteller'),
('Bananen Bank', 'BNB', 'Bank'),
('Prinzen Sport', 'PSP', 'Schokoladen-Produzent'),
('Lufthannah', 'LHH', 'Flugzeuge'),
('Porche', 'POR', 'Auto-Hersteller'),
('H&N', 'HuN', 'Kleidungs-Produzent'),
('Fohrtnait', 'FRNT', 'Computerspiele');