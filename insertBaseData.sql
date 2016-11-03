INSERT INTO people (firstName, lastName, status, role, emailAddress, phoneNumber, rank, biography) 
	VALUES ("Jack", "Jackson", 0, 0, "foobar@example.com", "123-456-78960", "OF-9", "this is a sample biography");
INSERT INTO people (firstName, lastName, status, role, emailAddress, phoneNumber, rank, biography) 
	VALUES ("Steve", "Steveson", 0, 1, "steve@example.com", "+011-232-12324", "LtCol", "this is a sample person who could be a Principal!");
INSERT INTO people (firstName, lastName, status, role, emailAddress, phoneNumber, rank, biography) 
	VALUES ("Roger", "Rogewell", 0, 1, "roger@example.com", "+1-412-7324", "Maj", "Roger is another test person we have in the database");
INSERT INTO people (firstName, lastName, status, role, emailAddress, phoneNumber, rank, biography) 
	VALUES ("Elizabeth", "Elizawell", 0, 0, "liz@example.com", "+1-777-7777", "Capt", "elizabeth is another test person we have in the database");
INSERT INTO people (firstName, lastName, status, role, emailAddress, phoneNumber, rank, biography) 
	VALUES ("Bob", "Bobtown", 0, 0, "bob@example.com", "+1-444-7324", "Civ", "Bob is yet another test person we have in the database");
INSERT INTO people (firstName, lastName, status, role, emailAddress, phoneNumber, rank, biography) 
	VALUES ("Henry", "Henderson", 0, 1, "henry@example.com", "+2-456-7324", "BGen", "Henry is another test person we have in the database");
INSERT INTO people (firstName, lastName, status, role, emailAddress, phoneNumber, rank, biography) 
	VALUES ("Hunter", "Huntman", 0, 1, "hunter@example.com", "+1-412-9314", "CIV", "");
INSERT INTO people (firstName, lastName, status, role, emailAddress, phoneNumber, rank, biography) 
	VALUES ("Andrew", "Anderson", 0, 1, "henry@example.com", "+1-412-7324", "CIV", "");
INSERT INTO people (firstName, lastName, status, role, emailAddress, phoneNumber, rank, biography) 
	VALUES ("Nick", "Nicholson", 0, 0, "nick@example.com", "+1-202-7324", "CIV", "");
INSERT INTO people (firstName, lastName, status, role, emailAddress, phoneNumber, rank, biography) 
	VALUES ("Reina", "Reanton", 0, 0, "reina@example.com", "+42-233-7324", "CIV", "");
INSERT INTO people (firstName, lastName, status, role, emailAddress, phoneNumber, rank, biography) 
	VALUES ("Shardul", "Sharton", 0, 1, "shardul@example.com", "+99-9999-9999", "CIV", "");

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
INSERT INTO advisorOrganizations (name, createdAt, updatedAt) VALUES ('EF5', 1478098949000, 1478098949000);
INSERT INTO advisorOrganizations (name, createdAt, updatedAt) VALUES ('EF6', 1478098949000, 1478098949000);
INSERT INTO advisorOrganizations (name, createdAt, updatedAt) VALUES ('EF7', 1478098949000, 1478098949000);
INSERT INTO advisorOrganizations (name, createdAt, updatedAt) VALUES ('EF8', 1478098949000, 1478098949000);
INSERT INTO advisorOrganizations (name, createdAt, updatedAt) VALUES ('Gender', 1478098949000, 1478098949000);
INSERT INTO advisorOrganizations (name, createdAt, updatedAt) VALUES ('TAAC-N', 1478098949000, 1478098949000);
INSERT INTO advisorOrganizations (name, createdAt, updatedAt) VALUES ('TAAC-S', 1478098949000, 1478098949000);
INSERT INTO advisorOrganizations (name, createdAt, updatedAt) VALUES ('TAAC-W', 1478098949000, 1478098949000);
INSERT INTO advisorOrganizations (name, createdAt, updatedAt) VALUES ('TAAC-E', 1478098949000, 1478098949000);
INSERT INTO advisorOrganizations (name, createdAt, updatedAt) VALUES ('TAAC-C', 1478098949000, 1478098949000);
INSERT INTO advisorOrganizations (name, createdAt, updatedAt) VALUES ('TAAC Air', 1478098949000, 1478098949000);

UPDATE billets SET advisorOrganizationId = (SELECT id FROM advisorOrganizations WHERE name ='EF1') WHERE name LIKE 'EF1%';
UPDATE billets SET advisorOrganizationId = (SELECT id FROM advisorOrganizations WHERE name ='EF2') WHERE name LIKE 'EF2%';
UPDATE billets SET advisorOrganizationId = (SELECT id FROM advisorOrganizations WHERE name ='EF3') WHERE name LIKE 'EF3%';
UPDATE billets SET advisorOrganizationId = (SELECT id FROM advisorOrganizations WHERE name ='EF4') WHERE name LIKE 'EF4%';

INSERT INTO poams (shortName, longName, category, createdAt, updatedAt)	VALUES ('EF1', 'Budget and Planning', 'EF', 1478098949000, 1478098949000);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('EF1.1', 'Budgeting in the MoD', 'Sub-EF', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF1'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.1.A', 'Milestone the First in EF1.1', 'Milestone', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF1.1'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.1.B', 'Milestone the Second in EF1.1', 'Milestone', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF1.1'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.1.C', 'Milestone the Third in EF1.1', 'Milestone', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF1.1'));

INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('EF1.2', 'Budgeting in the MoI', 'Sub-EF', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF1'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.2.A', 'Milestone the First in EF1.2', 'Milestone', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF1.2'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.2.B', 'Milestone the Second in EF1.2', 'Milestone', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF1.2'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.2.C', 'Milestone the Third in EF1.2', 'Milestone', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF1.2'));

INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('EF1.3', 'Budgeting in the Police?', 'Sub-EF', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF1'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.3.A', 'Getting a budget in place', 'Milestone', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF1.3'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.3.B', 'Tracking your expenses', 'Milestone', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF1.3'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.3.C', 'Knowing when you run out of money', 'Milestone', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF1.3'));

INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('EF2', 'TAO', 'EF', 1478098949000, 1478098949000);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('2.A', 'This is the first Milestone in EF2', 'Milestone', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF2'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('2.B', 'This is the second Milestone in EF2', 'Milestone', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF2'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('2.C', 'This is the third Milestone in EF2', 'Milestone', 1478098949000, 1478098949000, (SELECT id from poams where shortName = 'EF2'));

INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('EF3', 'Rule of Law', 'EF', 1478098949000, 1478098949000);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('EF4', 'Force Gen', 'EF', 1478098949000, 1478098949000);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('EF5', 'Force Sustainment', 'EF', 1478098949000, 1478098949000);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('EF6', 'C2 Operations', 'EF', 1478098949000, 1478098949000);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('EF7', 'Intelligence', 'EF', 1478098949000, 1478098949000);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('EF8', 'Stratcom', 'EF', 1478098949000, 1478098949000);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('Gender', '', 'EF', 1478098949000, 1478098949000);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('TAAC-N', '', 'EF', 1478098949000, 1478098949000);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('TAAC-S', '', 'EF', 1478098949000, 1478098949000);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('TAAC-E', '', 'EF', 1478098949000, 1478098949000);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('TAAC-W', '', 'EF', 1478098949000, 1478098949000);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('TAAC-C', '', 'EF', 1478098949000, 1478098949000);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('TAAC Air', '', 'EF', 1478098949000, 1478098949000);
