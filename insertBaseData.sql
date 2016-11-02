INSERT INTO people (firstName, lastName, status, role, emailAddress, phoneNumber, rank, biography) 
	VALUES ("Jack", "Jackson", 0, 0, "foobar@example.com", "123-456-78960", "OF-9", "this is a sample biography");

INSERT INTO people (firstName, lastName, status, role, emailAddress, phoneNumber, rank, biography) 
	VALUES ("Steve", "Steveson", 0, 1, "steve@example.com", "+011-232-12324", "LtCol", "this is a sample person who could be a Principal!");

INSERT INTO people (firstName, lastName, status, role, emailAddress, phoneNumber, rank, biography) 
	VALUES ("Roger", "Rogewell", 0, 1, "roger@example.com", "+1-412-7324", "Maj", "Roger is another test person we have in the database");

INSERT INTO billets (name, createdAt, updatedAt) VALUES ('EF1 Advisor 04532', 1478098949000, 1478098949000);
INSERT INTO billetAdvisors (billetId, advisorId, createdAt) VALUES ((SELECT id from billets where name ='EF1 Advisor 04532'), null, 1478098949000);
INSERT INTO billets (name, createdAt, updatedAt) VALUES ('EF2 Advisor 4987', 1478098949000, 1478098949000);
INSERT INTO billetAdvisors (billetId, advisorId, createdAt) VALUES ((SELECT id from billets where name ='EF2 Advisor 4987'), null, 1478098949000);
INSERT INTO billets (name, createdAt, updatedAt) VALUES ('EF3 Advisor 427', 1478098949000, 1478098949000);
INSERT INTO billetAdvisors (billetId, advisorId, createdAt) VALUES ((SELECT id from billets where name ='EF3 Advisor 427'), null, 1478098949000);
INSERT INTO billets (name, createdAt, updatedAt) VALUES ('EF4 Advisor 3', 1478098949000, 1478098949000);
INSERT INTO billetAdvisors (billetId, advisorId, createdAt) VALUES ((SELECT id from billets where name ='EF4 Advisor 3'), null, 1478098949000);

INSERT INTO advisorOrganizations (name, createdAt, updatedAt) VALUES ('EF1', 1478098949000, 1478098949000);
INSERT INTO advisorOrganizations (name, createdAt, updatedAt) VALUES ('EF2', 1478098949000, 1478098949000);
INSERT INTO advisorOrganizations (name, createdAt, updatedAt) VALUES ('EF3', 1478098949000, 1478098949000);
INSERT INTO advisorOrganizations (name, createdAt, updatedAt) VALUES ('EF4', 1478098949000, 1478098949000);

UPDATE billets SET advisorOrganizationId = (SELECT id FROM advisorOrganizations WHERE name ='EF1') WHERE name LIKE 'EF1%';
UPDATE billets SET advisorOrganizationId = (SELECT id FROM advisorOrganizations WHERE name ='EF2') WHERE name LIKE 'EF2%';
UPDATE billets SET advisorOrganizationId = (SELECT id FROM advisorOrganizations WHERE name ='EF3') WHERE name LIKE 'EF3%';
UPDATE billets SET advisorOrganizationId = (SELECT id FROM advisorOrganizations WHERE name ='EF4') WHERE name LIKE 'EF4%';
