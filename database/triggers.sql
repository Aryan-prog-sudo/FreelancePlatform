USE FreelancePlatform;

DELIMITER $$

CREATE TRIGGER auto_create_escrow
AFTER INSERT ON CONTRACT
FOR EACH ROW
BEGIN
  IF NEW.status = 'Signed' THEN
    INSERT INTO ESCROW_PAYMENT (escrow_id, contract_id, amount, status)
    SELECT 
      NEW.contract_id + 1000,
      NEW.contract_id,
      COALESCE((SELECT b.amount FROM BID b WHERE b.project_id = NEW.project_id LIMIT 1),
               (SELECT p.budget FROM PROJECT p WHERE p.project_id = NEW.project_id LIMIT 1),
               0.00),
      'Pending'
    FROM DUAL;
  END IF;
END$$

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

DELIMITER ;