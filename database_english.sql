-- SQL Script 
CREATE DATABASE stutengarten;
USE stutengarten;


-- Customer Accounts
CREATE TABLE customers (
	id INT AUTO_INCREMENT PRIMARY KEY,
	stutengarten_id VARCHAR(50) UNIQUE NOT NULL,
	first_name VARCHAR(50) NOT NULL,
	last_name VARCHAR(50) NOT NULL
	);

CREATE TABLE customer_savings_books (
	id INT AUTO_INCREMENT PRIMARY KEY,
	customers_fk VARCHAR(50) NOT NULL,
	balance INT DEFAULT 0,
	FOREIGN KEY (customers_fk) REFERENCES customers(stutengarten_id) ON DELETE CASCADE
	);
	
CREATE TABLE customer_transactions (
	id INT AUTO_INCREMENT PRIMARY KEY,
	customer_savings_book_fk INT NOT NULL,
	amount INT NOT NULL,
	purpose VARCHAR(255),
	FOREIGN	KEY (customer_savings_book_fk) REFERENCES customer_savings_books(id) ON DELETE CASCADE
	);

-- predefined Shares
CREATE TABLE shares (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(100) NOT NULL UNIQUE,
	symbol VARCHAR (5) NOT NULL UNIQUE,
	description TEXT,
	created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_shares (
	id INT AUTO_INCREMENT PRIMARY KEY,
	owner_fk VARCHAR(50) NOT NULL,
	share_fk INT NOT NULL,
	invested_amount INT NOT NULL,
	current_value INT NOT NULL,
	weekdays ENUM('MONTAG', 'DIENSTAG', 'MITTWOCH', 'DONNERSTAG', 'FREITAG', 'SAMSTAG', 'SONNTAG') NOT NULL,
	FOREIGN KEY (owner_fk) REFERENCES customers(stutengarten_id) ON DELETE CASCADE,
	FOREIGN KEY (share_fk) REFERENCES shares(id) ON DELETE CASCADE
	);


-- Company Accounts
CREATE TABLE company (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(255) NOT NULL UNIQUE,
	folder_submitted BOOL DEFAULT FALSE
	);

CREATE TABLE company_savings_books (
	id INT AUTO_INCREMENT PRIMARY KEY,
	company_fk INT NOT NULL,
	balance INT DEFAULT 0,
	FOREIGN KEY (company_fk) REFERENCES company(id) ON DELETE CASCADE
	);

CREATE TABLE company_revenues (
	id INT AUTO_INCREMENT PRIMARY KEY,
	company_savings_books_fk INT NOT NULL,
	amount INT NOT NULL,
	purpose VARCHAR(255),
	FOREIGN KEY (company_savings_books_fk) REFERENCES company_savings_books(id) ON DELETE CASCADE
	);
	

-- Statistics
CREATE TABLE customer_statistics (
	id INT AUTO_INCREMENT PRIMARY KEY,
	weekdays ENUM('MONTAG', 'DIENSTAG', 'MITTWOCH', 'DONNERSTAG', 'FREITAG', 'SAMSTAG', 'SONNTAG') NOT NULL,
	total_revenue INT
	);
	

-- Company Statistics
CREATE TABLE company_statistics (
	id INT AUTO_INCREMENT PRIMARY KEY,
	weekdays ENUM('MONTAG', 'DIENSTAG', 'MITTWOCH', 'DONNERSTAG', 'FREITAG', 'SAMSTAG', 'SONNTAG') NOT NULL,
	total_revenue INT
	);


-- Economic Aid
CREATE TABLE economic_aid (
	id INT AUTO_INCREMENT PRIMARY KEY,
	profession VARCHAR(255) NOT NULL,
	amount INT NOT NULL,
	company_fk INT NOT NULL,
	FOREIGN KEY (company_fk) REFERENCES company(id) ON DELETE CASCADE

	);


INSERT INTO shares (name, symbol, description) VALUES
('Apfel AG', 'APF', 'Technologie-Unternehmen'),
('Mercedos AG', 'MRC', 'Auto-Hersteller'),
('Bananen Bank', 'BNB', 'Bank'),
('Prinzen Sport', 'PSP', 'Schokoladen-Produzent'),
('Lufthannah', 'LHH', 'Flugzeuge'),
('Porche', 'POR', 'Auto-Hersteller'),
('H&N', 'HuN', 'Kleidungs-Produzent'),
('Fohrtnait', 'FRNT', 'Computerspiele');
