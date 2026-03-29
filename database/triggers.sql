USE FreelancePlatform;

-- Drop existing triggers first to avoid duplicates
DROP TRIGGER IF EXISTS auto_create_escrow;
DROP TRIGGER IF EXISTS auto_open_dispute;
DROP TRIGGER IF EXISTS auto_create_profile;
DROP TRIGGER IF EXISTS validate_project_budget;

DELIMITER $$

-- TRIGGER 1: When a contract is inserted as 'Signed',
-- automatically create a Pending escrow payment
CREATE TRIGGER auto_create_escrow
AFTER INSERT ON CONTRACT
FOR EACH ROW
BEGIN
  IF NEW.status = 'Signed' THEN
    INSERT INTO ESCROW_PAYMENT (escrow_id, contract_id, amount, status)
    SELECT 
      NEW.contract_id + 1000,
      NEW.contract_id,
      COALESCE(
        (SELECT b.amount FROM BID b WHERE b.project_id = NEW.project_id LIMIT 1),
        (SELECT p.budget FROM PROJECT p WHERE p.project_id = NEW.project_id LIMIT 1),
        0.00
      ),
      'Pending'
    FROM DUAL;
  END IF;
END$$

-- -- TRIGGER 2: When escrow status changes to 'Refunded',
-- -- automatically open a Dispute record
CREATE TRIGGER auto_open_dispute
AFTER UPDATE ON ESCROW_PAYMENT
FOR EACH ROW
BEGIN
  IF NEW.status = 'Refunded' AND OLD.status != 'Refunded' THEN
    INSERT INTO DISPUTE (dispute_id, contract_id, description, status)
    VALUES (
      NEW.escrow_id + 999,
      NEW.contract_id,
      'Auto-flagged: escrow was refunded',
      'Open'
    );
  END IF;
END$$

-- TRIGGER 3: When a new user is inserted,
-- automatically create their profile based on their role
CREATE TRIGGER auto_create_profile
AFTER INSERT ON USER
FOR EACH ROW
BEGIN
  IF NEW.role_id = 1 THEN
    INSERT INTO CUSTOMER_PROFILE (customer_id, user_id)
    VALUES (NEW.user_id, NEW.user_id);
  ELSEIF NEW.role_id = 2 THEN
    INSERT INTO FREELANCER_PROFILE (freelancer_id, user_id, bio, reputation_score)
    VALUES (NEW.user_id, NEW.user_id, '', 0.00);
  ELSEIF NEW.role_id = 3 THEN
    INSERT INTO ARTIST_PROFILE (artist_id, user_id, bio, reputation_score)
    VALUES (NEW.user_id, NEW.user_id, '', 0.00);
  END IF;
END$$

-- TRIGGER 4: Before a project is inserted,
-- validate that budget is greater than 0
-- and deadline is not in the past
CREATE TRIGGER validate_project_budget
BEFORE INSERT ON PROJECT
FOR EACH ROW
BEGIN
  IF NEW.budget <= 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Project budget must be greater than 0';
  END IF;
  IF NEW.deadline < CURDATE() THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Project deadline cannot be in the past';
  END IF;
END$$

DELIMITER ;

