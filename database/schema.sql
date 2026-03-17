CREATE DATABASE IF NOT EXISTS FreelancePlatform;
USE FreelancePlatform;

-- Cleanup to rerun the query everytime
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS TRANSACTION, ESCROW_PAYMENT, DISPUTE, REVIEW, CONTRACT, BID, PROJECT, CATEGORY, PORTFOLIO, SKILLS, ARTIST_PROFILE, FREELANCER_PROFILE, CUSTOMER_PROFILE, USER, ROLE;
SET FOREIGN_KEY_CHECKS = 1;

-- Tables
CREATE TABLE ROLE (
    role_id INT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL
); 

CREATE TABLE USER (
    user_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    role_id INT,
    FOREIGN KEY (role_id) REFERENCES ROLE(role_id)
);

CREATE TABLE CUSTOMER_PROFILE (
    customer_id INT PRIMARY KEY,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES USER(user_id)
);

CREATE TABLE FREELANCER_PROFILE (
    freelancer_id INT PRIMARY KEY,
    user_id INT,
    bio TEXT,
    reputation_score DECIMAL(3,2),
    FOREIGN KEY (user_id) REFERENCES USER(user_id)
);

CREATE TABLE ARTIST_PROFILE (
    artist_id INT PRIMARY KEY,
    user_id INT,
    bio TEXT,
    reputation_score DECIMAL(3,2),
    FOREIGN KEY (user_id) REFERENCES USER(user_id)
);

CREATE TABLE SKILLS (
    skill_id INT PRIMARY KEY,
    skill_name VARCHAR(50) NOT NULL
);

CREATE TABLE PORTFOLIO (
    portfolio_id INT PRIMARY KEY,
    freelancer_id INT,
    artist_id INT,
    description TEXT,
    FOREIGN KEY (freelancer_id) REFERENCES FREELANCER_PROFILE(freelancer_id),
    FOREIGN KEY (artist_id) REFERENCES ARTIST_PROFILE(artist_id)
);

CREATE TABLE CATEGORY (
    category_id INT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL
);

CREATE TABLE PROJECT (
    project_id INT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    budget DECIMAL(10,2) NOT NULL,
    deadline DATE NOT NULL,
    customer_id INT,
    category_id INT,
    FOREIGN KEY (customer_id) REFERENCES CUSTOMER_PROFILE(customer_id),
    FOREIGN KEY (category_id) REFERENCES CATEGORY(category_id)
);

CREATE TABLE BID (
    bid_id INT PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    proposal TEXT,
    project_id INT,
    freelancer_id INT,
    FOREIGN KEY (project_id) REFERENCES PROJECT(project_id),
    FOREIGN KEY (freelancer_id) REFERENCES FREELANCER_PROFILE(freelancer_id)
);

CREATE TABLE CONTRACT (
    contract_id INT PRIMARY KEY,
    project_id INT,
    freelancer_id INT,
    status VARCHAR(20),
    FOREIGN KEY (project_id) REFERENCES PROJECT(project_id),
    FOREIGN KEY (freelancer_id) REFERENCES FREELANCER_PROFILE(freelancer_id)
);

CREATE TABLE ESCROW_PAYMENT (
    escrow_id INT PRIMARY KEY,
    contract_id INT,
    amount DECIMAL(10,2) NOT NULL CHECK (amount>=0),
    status VARCHAR(20),
    FOREIGN KEY (contract_id) REFERENCES CONTRACT(contract_id)
);

CREATE TABLE TRANSACTION (
    transaction_id INT PRIMARY KEY,
    escrow_id INT,
    date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount>=0),
    type VARCHAR(20),
    FOREIGN KEY (escrow_id) REFERENCES ESCROW_PAYMENT(escrow_id)
);

CREATE TABLE DISPUTE (
    dispute_id INT PRIMARY KEY,
    contract_id INT,
    description TEXT,
    status VARCHAR(20),
    FOREIGN KEY (contract_id) REFERENCES CONTRACT(contract_id)
);

CREATE TABLE REVIEW (
    review_id INT PRIMARY KEY,
    contract_id INT,
    rating INT NOT NULL CHECK (rating>=1 AND rating<=5),
    comment TEXT,
    FOREIGN KEY (contract_id) REFERENCES CONTRACT(contract_id)
);

-- Indexes for the foreign keys
CREATE INDEX idx_user_role ON USER(role_id);
CREATE INDEX idx_customer_user ON CUSTOMER_PROFILE(user_id);
CREATE INDEX idx_freelancer_user ON FREELANCER_PROFILE(user_id);
CREATE INDEX idx_artist_user ON ARTIST_PROFILE(user_id);
CREATE INDEX idx_portfolio_freelancer ON PORTFOLIO(freelancer_id);
CREATE INDEX idx_portfolio_artist ON PORTFOLIO(artist_id);
CREATE INDEX idx_project_customer ON PROJECT(customer_id);
CREATE INDEX idx_project_category ON PROJECT(category_id);
CREATE INDEX idx_bid_project ON BID(project_id);
CREATE INDEX idx_bid_freelancer ON BID(freelancer_id);
CREATE INDEX idx_contract_project ON CONTRACT(project_id);
CREATE INDEX idx_contract_freelancer ON CONTRACT(freelancer_id);
CREATE INDEX idx_escrow_contract ON ESCROW_PAYMENT(contract_id);
CREATE INDEX idx_transaction_escrow ON TRANSACTION(escrow_id);
CREATE INDEX idx_dispute_contract ON DISPUTE(contract_id);
CREATE INDEX idx_review_contract ON REVIEW(contract_id);

-- Indexes for the primary keys
CREATE INDEX idx_pk_role ON ROLE(role_id);
CREATE INDEX idx_pk_user ON USER(user_id);
CREATE INDEX idx_pk_customer ON CUSTOMER_PROFILE(customer_id);
CREATE INDEX idx_pk_freelancer ON FREELANCER_PROFILE(freelancer_id);
CREATE INDEX idx_pk_artist ON ARTIST_PROFILE(artist_id);
CREATE INDEX idx_pk_skills ON SKILLS(skill_id);
CREATE INDEX idx_pk_category ON CATEGORY(category_id);
CREATE INDEX idx_pk_portfolio ON PORTFOLIO(portfolio_id);
CREATE INDEX idx_pk_project ON PROJECT(project_id);
CREATE INDEX idx_pk_bid ON BID(bid_id);
CREATE INDEX idx_pk_contract ON CONTRACT(contract_id);
CREATE INDEX idx_pk_escrow ON ESCROW_PAYMENT(escrow_id);
CREATE INDEX idx_pk_transaction ON TRANSACTION(transaction_id);
CREATE INDEX idx_pk_dispute ON DISPUTE(dispute_id);
CREATE INDEX idx_pk_review ON REVIEW(review_id);

-- Sample Data
INSERT INTO ROLE VALUES (1, 'Customer'), (2, 'Freelancer'), (3, 'Artist');
INSERT INTO USER VALUES (101, 'Alice Smith', 'alice@gmail.com', 'pass1', '555-0101', 1), (102, 'Bob Dev', 'bob@test.com', 'pass2', '555-0202', 2);
INSERT INTO CUSTOMER_PROFILE VALUES (1, 101);
INSERT INTO FREELANCER_PROFILE VALUES (1, 102, 'Dev Bio', 4.9);
INSERT INTO CATEGORY VALUES (1, 'Web Design');
INSERT INTO PROJECT VALUES (1, 'Website', 'Need a site', 1000.00, '2026-12-31', 1, 1);
INSERT INTO BID VALUES (1, 900.00, 'I can help!', 1, 1);
INSERT INTO CONTRACT VALUES (1, 1, 1, 'Signed');
INSERT INTO ESCROW_PAYMENT VALUES (1, 1, 900.00, 'Funded');
INSERT INTO TRANSACTION VALUES (1, 1, '2026-02-12', 900.00, 'Deposit');

-- View Tables
SELECT * FROM ROLE;
SELECT * FROM USER;

SELECT * FROM CUSTOMER_PROFILE;
SELECT * FROM FREELANCER_PROFILE;
SELECT * FROM ARTIST_PROFILE;

SELECT * FROM CATEGORY;
SELECT * FROM SKILLS;
SELECT * FROM PORTFOLIO;

SELECT * FROM PROJECT;
SELECT * FROM BID;
SELECT * FROM CONTRACT;

-- 5. FINANCIALS & LEGAL
SELECT * FROM ESCROW_PAYMENT;
SELECT * FROM TRANSACTION;
SELECT * FROM DISPUTE;
SELECT * FROM REVIEW;

