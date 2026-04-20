-- 1. Datenbank auswählen
USE stutengarten;

-- 2. Fremdschlüsselprüfung ausschalten
SET FOREIGN_KEY_CHECKS = 0; 

-- 3. Alle Tabellen leeren (TRUNCATE ist schnell und setzt Auto-Increment-Zähler zurück)
TRUNCATE TABLE kundenumsaetze;
TRUNCATE TABLE kundensparbuecher;
TRUNCATE TABLE kundenaktien;
TRUNCATE TABLE unternehmensumsaetze;
TRUNCATE TABLE unternehmenssparbuecher;
TRUNCATE TABLE wirtschaftsbeihilfe;
TRUNCATE TABLE kundenstatistik;
TRUNCATE TABLE unternehmensstatistik;
TRUNCATE TABLE kunden;
TRUNCATE TABLE unternehmen;

-- 4. Fremdschlüsselprüfung wieder einschalten
SET FOREIGN_KEY_CHECKS = 1;