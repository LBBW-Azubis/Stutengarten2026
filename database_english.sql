-- SQL Skript 
CREATE DATABASE stutengarten;
USE stutengarten;


-- Kinderkonten
CREATE TABLE customers (
	id INT AUTO_INCREMENT PRIMARY KEY,
	stutengarten_id VARCHAR(50) UNIQUE NOT NULL,
	first_name VARCHAR(50) NOT NULL,
	surname VARCHAR(50) NOT NULL
	);

CREATE TABLE customer_savings_books (
	id INT AUTO_INCREMENT PRIMARY KEY,
	customers_fk INT NOT NULL,
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

CREATE TABLE customer_stocks (
	id INT AUTO_INCREMENT PRIMARY KEY,
	owner_fk INT NOT NULL,
	worth INT NOT NULL DEFAULT 3,
	weekdays ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
	FOREIGN KEY (owner_fk) REFERENCES customer(stutengarten_id) ON DELETE CASCADE
	);


-- Unternehmenskonten
CREATE TABLE companys (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(255) NOT NULL UNIQUE,
	submit_folder BOOL DEFAULT FALSE
	);

CREATE TABLE company_savings_books (
	id INT AUTO_INCREMENT PRIMARY KEY,
	companys_fk INT NOT NULL,
	balance INT DEFAULT 0,
	FOREIGN KEY (companys_fk) REFERENCES companys(id) ON DELETE CASCADE
	);

CREATE TABLE company_revenues (
	id INT AUTO_INCREMENT PRIMARY KEY,
	company_savings_books_fk INT NOT NULL,
	amount INT NOT NULL,
	purpose VARCHAR(255),
	FOREIGN KEY (company_savings_books_fk) REFERENCES company_savings_books(id) ON DELETE CASCADE
	);
	

-- Statistik
CREATE TABLE customer_statistics (
	id INT AUTO_INCREMENT PRIMARY KEY,
	weekdays ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
	total_revenue INT
	);
	

-- Unternehmensstatistik
CREATE TABLE company_statistics (
	id INT AUTO_INCREMENT PRIMARY KEY,
	weekdays ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
	total_revenue INT
	);


-- Wirtschaftsbeihilfe
CREATE TABLE economic_aid (
	id INT AUTO_INCREMENT PRIMARY KEY,
	profession VARCHAR(255) NOT NULL,
	amount INT NOT NULL,
	companys_fk INT NOT NULL,
	FOREIGN KEY (companys_fk) REFERENCES companys(id) ON DELETE CASCADE

	);

