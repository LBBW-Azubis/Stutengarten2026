SET FOREIGN_KEY_CHECKS = 0;

-- Alle Tabellen leeren:
TRUNCATE TABLE kunden;
TRUNCATE TABLE kundenaktien;
TRUNCATE TABLE kundensparbuecher;
TRUNCATE TABLE kundenumsaetze;
TRUNCATE TABLE kundenstatistik;
TRUNCATE TABLE unternehmen;
TRUNCATE TABLE unternehmenssparbuecher;
TRUNCATE TABLE unternehmensumsaetze;
TRUNCATE TABLE unternehmensstatistik;
TRUNCATE TABLE wirtschaftsbeihilfe;
TRUNCATE TABLE aktien;

SET FOREIGN_KEY_CHECKS = 1;