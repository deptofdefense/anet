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

INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) 
	VALUES ('EF1', '', 'EF', 1478098949000, 1478098949000);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('EF1.1', '', 'Sub-EF', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF1'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.1.A', '', 'Milestone', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF1.1'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.1.B', '', 'Milestone', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF1.1'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.1.C', '', 'Milestone', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF1.1'));

INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('EF1.2', '', 'Sub-EF', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF1'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.2.A', '', 'Milestone', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF1.2'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.2.B', '', 'Milestone', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF1.2'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.2.C', '', 'Milestone', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF1.2'));

INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('EF1.3', '', 'Sub-EF', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF1'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.3.A', '', 'Milestone', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF1.3'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.3.B', '', 'Milestone', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF1.3'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.3.C', '', 'Milestone', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF1.3'));

INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) 
	VALUES ('EF2', '', 'EF', 1478098949000, 1478098949000);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) 
	VALUES ('EF3', '', 'EF', 1478098949000, 1478098949000);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) 
	VALUES ('EF4', '', 'EF', 1478098949000, 1478098949000);
