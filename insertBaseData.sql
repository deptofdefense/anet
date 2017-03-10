--DROP TABLE approvers;
--DROP TABLE approvalActions;
--DROP TABLE positionRelationships;
--DROP TABLE reportPoams;
--DROP TABLE reportPeople;
--DROP TABLE peoplePositions;
--DROP TABLE savedSearches;
--DROP TABLE positions;
--DROP TABLE poams;
--DROP TABLE comments;
--DROP TABLE reports;
--DROP TABLE people;
--DROP TABLE approvalSteps;
--DROP TABLE locations;
--DROP TABLE organizations;
--DROP TABLE adminSettings;
--DROP TABLE pendingEmails;
--DROP TABLE DATABASECHANGELOG;
--DROP TABLE DATABASECHANGELOGLOCK;

TRUNCATE TABLE peoplePositions;
TRUNCATE TABLE approvers;
TRUNCATE TABLE approvalActions;
TRUNCATE TABLE positionRelationships;
TRUNCATE TABLE reportPoams;
TRUNCATE TABLE reportPeople;
TRUNCATE TABLE comments;
TRUNCATE TABLE savedSearches;
DELETE FROM positions;
DELETE FROM poams WHERE parentPoamId IS NOT NULL;
DELETE FROM poams WHERE parentPoamId IS NULL;
DELETE FROM reports;
DELETE FROM people;
DELETE FROM approvalSteps;
DELETE FROM locations;
DELETE FROM organizations;
DELETE FROM adminSettings;

--Advisors
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, domainUsername, country, gender, createdAt, updatedAt)
	VALUES ('Jack Jackson', 0, 0, 'hunter+jack@dds.mil', '123-456-78960', 'OF-9', 'Jack is an advisor in EF2.1', 'jack', 'Germany', 'MALE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, domainUsername, country, gender, createdAt, updatedAt)
	VALUES ('Elizabeth Elizawell', 0, 0, 'hunter+liz@dds.mil', '+1-777-7777', 'Capt', 'Elizabeth is a test advisor we have in the database who is in EF1.1', 'elizabeth', 'United States of America', 'FEMALE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, domainUsername, country, gender, createdAt, updatedAt)
	VALUES ('Erin Erinson', 0, 0, 'hunter+erin@dds.mil', '+9-23-2323-2323', 'Civ', 'Erin is an Advisor in EF2.2 who can release her own reports', 'erin', 'Australia', 'FEMALE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, domainUsername, country, gender, createdAt, updatedAt)
	VALUES ('Reina Reinton', 0, 0, 'hunter+reina@dds.mil', '+23-23-11222', 'CIV', 'Reina is an Advisor in EF2.2', 'reina', 'Italy', 'FEMALE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- Principals
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, country, gender, createdAt, updatedAt)
	VALUES ('Steve Steveson', 0, 1, 'hunter+steve@dds.mil', '+011-232-12324', 'LtCol', 'this is a sample person who could be a Principal!', 'Afghanistan', 'MALE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, country, gender, createdAt, updatedAt)
	VALUES ('Roger Rogewell', 0, 1, 'hunter+roger@dds.mil', '+1-412-7324', 'Maj', 'Roger is another test person we have in the database', 'Afghanistan', 'MALE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, country, gender, createdAt, updatedAt)
	VALUES ('Christopf Topferness', 0, 1, 'hunter+christopf@dds.mil', '+1-422222222', 'CIV', 'Christopf works in the MoD Office', 'Afghanistan', 'MALE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- Super Users
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, domainUsername, createdAt, updatedAt)
	VALUES ('Bob Bobtown', 0, 0, 'hunter+bob@dds.mil', '+1-444-7324', 'Civ', 'Bob is a Super User in EF1.1', 'bob', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, domainUsername, createdAt, updatedAt)
	VALUES ('Henry Henderson', 0, 0, 'hunter+henry@dds.mil', '+2-456-7324', 'BGen', 'Henry is a Super User in EF2.1', 'henry', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, domainUsername, createdAt, updatedAt)
	VALUES ('Jacob Jacobson', 0, 0, 'hunter+jacob@dds.mil', '+2-456-7324', 'Civ', 'Jacob is a Super User in EF2.2', 'jacob', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, domainUsername, createdAt, updatedAt)
	VALUES ('Rebecca Beccabon', 0, 0, 'hunter+rebecca@dds.mil', '+2-456-7324', 'CTR', 'Rebecca is a Super User in EF2.2', 'rebecca', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, domainUsername, createdAt, updatedAt)
	VALUES ('Andrew Anderson', 0, 1, 'hunter+andrew@dds.mil', '+1-412-7324', 'CIV', 'Andrew is the EF1 Manager', 'andrew', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- Administrator
INSERT INTO people (name, status, role, emailAddress, domainUsername, createdAt, updatedAt)
	VALUES ('Arthur Dmin', '0', '0', 'hunter+arthur@dds.mil', 'arthur', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

--People
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, createdAt, updatedAt)
	VALUES ('Hunter Huntman', 0, 1, 'hunter+hunter@dds.mil', '+1-412-9314', 'CIV', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, domainUsername, createdAt, updatedAt)
	VALUES ('Nick Nicholson', 0, 0, 'hunter+nick@dds.mil', '+1-202-7324', 'CIV', '', 'nick', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, createdAt, updatedAt)
	VALUES ('Shardul Sharton', 1, 1, 'hunter+shardul@dds.mil', '+99-9999-9999', 'CIV', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO positions (name, type, status, currentPersonId, createdAt, updatedAt) VALUES ('ANET Administrator', 3, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO positions (name, type, status, currentPersonId, createdAt, updatedAt) VALUES ('EF1 Manager', 2, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO positions (name, type, status, currentPersonId, createdAt, updatedAt) VALUES ('EF1.1 Advisor A', 0, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO positions (name, type, status, currentPersonId, createdAt, updatedAt) VALUES ('EF1.1 SuperUser', 2, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO positions (name, type, status, currentPersonId, createdAt, updatedAt) VALUES ('EF2.1 Advisor B', 0, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO positions (name, type, status, currentPersonId, createdAt, updatedAt) VALUES ('EF2.1 SuperUser', 2, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO positions (name, type, status, currentPersonId, createdAt, updatedAt) VALUES ('EF2.2 Advisor C', 0, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO positions (name, type, status, currentPersonId, createdAt, updatedAt) VALUES ('EF2.2 Advisor D', 0, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO positions (name, type, status, currentPersonId, createdAt, updatedAt) VALUES ('EF2.2 Super User', 2, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO positions (name, type, status, currentPersonId, createdAt, updatedAt) VALUES ('EF2.2 Final Reviewer', 2, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO positions (name, type, status, currentPersonId, createdAt, updatedAt) VALUES ('EF4.1 Advisor E', 0, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO positions (name, type, status, currentPersonId, createdAt, updatedAt) VALUES ('EF9 Advisor <empty>', 0, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


-- Put Andrew in the EF1 Manager Billet
INSERT INTO peoplePositions (positionId, personId, createdAt) VALUES
	((SELECT id from positions where name = 'EF1 Manager'), (SELECT id from people where emailAddress = 'hunter+andrew@dds.mil'), CURRENT_TIMESTAMP);
UPDATE positions SET currentPersonId = (SELECT id from people where emailAddress = 'hunter+andrew@dds.mil') WHERE name = 'EF1 Manager';

-- Put Bob into the Super User Billet in EF1
INSERT INTO peoplePositions (positionId, personId, createdAt) VALUES
	((SELECT id from positions where name = 'EF1.1 SuperUser'), (SELECT id from people where emailAddress = 'hunter+bob@dds.mil'), CURRENT_TIMESTAMP);
UPDATE positions SET currentPersonId = (SELECT id from people where emailAddress = 'hunter+bob@dds.mil') WHERE name = 'EF1.1 SuperUser';

-- Put Henry into the Super User Billet in EF2
INSERT INTO peoplePositions (positionId, personId, createdAt) VALUES
	((SELECT id from positions where name = 'EF2.1 SuperUser'), (SELECT id from people where emailAddress = 'hunter+henry@dds.mil'), CURRENT_TIMESTAMP);
UPDATE positions SET currentPersonId = (SELECT id from people where emailAddress = 'hunter+henry@dds.mil') WHERE name = 'EF2.1 SuperUser';

-- Rotate an advisor through a billet ending up with Jack in the EF2 Advisor Billet
INSERT INTO peoplePositions (positionId, personId, createdAt) VALUES
	((SELECT id from positions where name = 'EF2.1 Advisor B'), (SELECT id from people where emailAddress = 'hunter+erin@dds.mil'), CURRENT_TIMESTAMP);
UPDATE positions SET currentPersonId = (SELECT id from people where emailAddress = 'hunter+erin@dds.mil') WHERE name = 'EF2.1 Advisor B';
INSERT INTO peoplePositions (positionId, personId, createdAt) VALUES
	((SELECT id from positions where name = 'EF2.1 Advisor B'), (SELECT id from people where emailAddress = 'hunter+jack@dds.mil'), CURRENT_TIMESTAMP);
UPDATE positions SET currentPersonId = (SELECT id from people where emailAddress = 'hunter+jack@dds.mil') WHERE name = 'EF2.1 Advisor B';

-- Put Elizabeth into the EF1 Advisor Billet
INSERT INTO peoplePositions (positionId, personId, createdAt) VALUES
	((SELECT id from positions where name = 'EF1.1 Advisor A'), (SELECT id from people where emailAddress = 'hunter+liz@dds.mil'), CURRENT_TIMESTAMP);
UPDATE positions SET currentPersonId = (SELECT id from people where emailAddress = 'hunter+liz@dds.mil') WHERE name = 'EF1.1 Advisor A';

-- Put Reina into the EF2.2 Advisor Billet
INSERT INTO peoplePositions (positionId, personId, createdAt) VALUES
	((SELECT id from positions where name = 'EF2.2 Advisor C'), (SELECT id from people where emailAddress = 'hunter+reina@dds.mil'), CURRENT_TIMESTAMP);
UPDATE positions SET currentPersonId = (SELECT id from people where emailAddress = 'hunter+reina@dds.mil') WHERE name = 'EF2.2 Advisor C';

-- Put Erin into the EF2.2 Advisor Billet
INSERT INTO peoplePositions (positionId, personId, createdAt) VALUES
	((SELECT id from positions where name = 'EF2.2 Advisor D'), (SELECT id from people where emailAddress = 'hunter+erin@dds.mil'), CURRENT_TIMESTAMP);
UPDATE positions SET currentPersonId = (SELECT id from people where emailAddress = 'hunter+erin@dds.mil') WHERE name = 'EF2.2 Advisor D';

-- Put Jacob in the EF 2.2 Super User Billet
INSERT INTO peoplePositions (positionId, personId, createdAt) VALUES
	((SELECT id from positions where name = 'EF2.2 Super User'), (SELECT id from people where emailAddress = 'hunter+jacob@dds.mil'), CURRENT_TIMESTAMP);
UPDATE positions SET currentPersonId = (SELECT id from people where emailAddress = 'hunter+jacob@dds.mil') WHERE name = 'EF2.2 Super User';

-- Put Rebecca in the EF 2.2 Final Reviewer Position
INSERT INTO peoplePositions (positionId, personId, createdAt) VALUES
	((SELECT id from positions where name = 'EF2.2 Final Reviewer'), (SELECT id from people where emailAddress = 'hunter+rebecca@dds.mil'), CURRENT_TIMESTAMP);
UPDATE positions SET currentPersonId = (SELECT id from people where emailAddress = 'hunter+rebecca@dds.mil') WHERE name = 'EF2.2 Final Reviewer';

-- Put Arthur into the Admin Billet
INSERT INTO peoplePositions (positionId, personId, createdAt) VALUES
	((SELECT id from positions where name = 'ANET Administrator'), (SELECT id from people where emailAddress = 'hunter+arthur@dds.mil'), CURRENT_TIMESTAMP);
UPDATE positions SET currentPersonId = (SELECT id from people where emailAddress = 'hunter+arthur@dds.mil') WHERE name = 'ANET Administrator';


INSERT INTO organizations(shortName, longName, type, createdAt, updatedAt) VALUES ('ANET Administrators','', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO organizations(shortName, longName, type, createdAt, updatedAt) VALUES ('EF1', 'Planning Programming, Budgeting and Execution', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
	INSERT INTO organizations(shortName, longName, type, parentOrgId, createdAt, updatedAt) VALUES ('EF1.1', '',0, (SELECT id from organizations WHERE shortName ='EF1'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO organizations(shortName, longName, type, createdAt, updatedAt) VALUES ('EF2', '',0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
	INSERT INTO organizations(shortName, longName, type, parentOrgId, createdAt, updatedAt) VALUES ('EF2.1', '', 0, (SELECT id from organizations WHERE shortName ='EF2'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
	INSERT INTO organizations(shortName, longName, type, parentOrgId, createdAt, updatedAt) VALUES ('EF2.2', '', 0, (SELECT id from organizations WHERE shortName ='EF2'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO organizations(shortName, longName, type, createdAt, updatedAt) VALUES ('EF3', '', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO organizations(shortName, longName, type, createdAt, updatedAt) VALUES ('EF4', '', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
	INSERT INTO organizations(shortName, longName, type, parentOrgId, createdAt, updatedAt) VALUES ('EF 4.1', '', 0 , (SELECT id FROM organizations WHERE shortName = 'EF4'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
	INSERT INTO organizations(shortName, longName, type, parentOrgId, createdAt, updatedAt) VALUES ('EF 4.2', '', 0 , (SELECT id FROM organizations WHERE shortName = 'EF4'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
	INSERT INTO organizations(shortName, longName, type, parentOrgId, createdAt, updatedAt) VALUES ('EF 4.3', '', 0 , (SELECT id FROM organizations WHERE shortName = 'EF4'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
	INSERT INTO organizations(shortName, longName, type, parentOrgId, createdAt, updatedAt) VALUES ('EF 4.4', '', 0 , (SELECT id FROM organizations WHERE shortName = 'EF4'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO organizations(shortName, longName, type, createdAt, updatedAt) VALUES ('EF5', '', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO organizations(shortName, longName, type, createdAt, updatedAt) VALUES ('EF6', '', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO organizations(shortName, longName, type, createdAt, updatedAt) VALUES ('EF7', '', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO organizations(shortName, longName, type, createdAt, updatedAt) VALUES ('EF8', '', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO organizations(shortName, longName, type, createdAt, updatedAt) VALUES ('EF9', 'Gender', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO organizations(shortName, longName, type, createdAt, updatedAt) VALUES ('TAAC-N', '', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO organizations(shortName, longName, type, createdAt, updatedAt) VALUES ('TAAC-S', '', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO organizations(shortName, longName, type, createdAt, updatedAt) VALUES ('TAAC-W', '', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO organizations(shortName, longName, type, createdAt, updatedAt) VALUES ('TAAC-E', '', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO organizations(shortName, longName, type, createdAt, updatedAt) VALUES ('TAAC-C', '', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO organizations(shortName, longName, type, createdAt, updatedAt) VALUES ('TAAC Air', '', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

UPDATE positions SET organizationId = (SELECT id FROM organizations WHERE shortName ='EF1') WHERE name LIKE 'EF1 %';
UPDATE positions SET organizationId = (SELECT id FROM organizations WHERE shortName ='EF1.1') WHERE name LIKE 'EF1.1%';
UPDATE positions SET organizationId = (SELECT id FROM organizations WHERE shortName ='EF2.1') WHERE name LIKE 'EF2.1%';
UPDATE positions SET organizationId = (SELECT id FROM organizations WHERE shortName ='EF2.2') WHERE name LIKE 'EF2.2%';
UPDATE positions SET organizationId = (SELECT id FROM organizations WHERE shortName ='EF3') WHERE name LIKE 'EF3%';
UPDATE positions SET organizationId = (SELECT id FROM organizations WHERE shortName ='EF4') WHERE name LIKE 'EF4%';
UPDATE positions SET organizationId = (SELECT id FROM organizations WHERE shortName='ANET Administrators') where name = 'ANET Administrator';

-- Create the EF1.1 approval process
INSERT INTO approvalSteps (advisorOrganizationId, name) VALUES
	((SELECT id from organizations where shortName='EF1.1'), 'EF1.1 Approvers');
INSERT INTO approvers (approvalStepId, positionId) VALUES
	((SELECT id from approvalSteps WHERE name='EF1.1 Approvers'), (SELECT id from positions where name = 'EF1.1 SuperUser'));

-- Create the EF 2.2 approval process
INSERT INTO approvalSteps (name, advisorOrganizationId) VALUES
	('EF2.2 Secondary Reviewers', (SELECT id from organizations where shortName='EF2.2'));
INSERT INTO approvalSteps (name, advisorOrganizationId, nextStepId) VALUES
	('EF2.2 Initial Approvers', (SELECT id from organizations where shortName='EF2.2'), (SELECT MAX(id) from approvalSteps));

INSERT INTO approvers (approvalStepId, positionId) VALUES
	((SELECT id from approvalSteps WHERE name='EF2.2 Initial Approvers'), (SELECT id from positions where name = 'EF2.2 Super User'));
INSERT INTO approvers (approvalStepId, positionId) VALUES
	((SELECT id from approvalSteps WHERE name='EF2.2 Initial Approvers'), (SELECT id from positions where name = 'EF2.2 Advisor D'));
INSERT INTO approvers (approvalStepId, positionId) VALUES
	((SELECT id from approvalSteps WHERE name='EF2.2 Secondary Reviewers'), (SELECT id from positions where name = 'EF2.2 Final Reviewer'));

INSERT INTO poams (shortName, longName, category, createdAt, updatedAt)	VALUES ('EF1', 'Budget and Planning', 'EF', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId)
	VALUES ('1.1', 'Budgeting in the MoD', 'Sub-EF', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT id from poams where shortName = 'EF1'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId, organizationId)
	VALUES ('1.1.A', 'Milestone the First in EF1.1', 'Milestone', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT id from poams where shortName = 'EF1.1'), (SELECT id from organizations where shortName='EF1.1'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId, organizationId)
	VALUES ('1.1.B', 'Milestone the Second in EF1.1', 'Milestone', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT id from poams where shortName = 'EF1.1'), (SELECT id from organizations where shortName='EF1.1'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId, organizationId)
	VALUES ('1.1.C', 'Milestone the Third in EF1.1', 'Milestone', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT id from poams where shortName = 'EF1.1'), (SELECT id from organizations where shortName='EF1.1'));

INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId, organizationId)
	VALUES ('EF1.2', 'Budgeting in the MoI', 'Sub-EF', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT id from poams where shortName = 'EF1'), (SELECT id from organizations WHERE shortName='EF1.2'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId, organizationId)
	VALUES ('1.2.A', 'Milestone the First in EF1.2', 'Milestone', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT id from poams where shortName = 'EF1.2'), (SELECT id from organizations where shortName='EF1.2'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId, organizationId)
	VALUES ('1.2.B', 'Milestone the Second in EF1.2', 'Milestone', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT id from poams where shortName = 'EF1.2'), (SELECT id from organizations where shortName='EF1.2'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId, organizationId)
	VALUES ('1.2.C', 'Milestone the Third in EF1.2', 'Milestone', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT id from poams where shortName = 'EF1.2'), (SELECT id from organizations where shortName='EF1.2'));

INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId, organizationId)
	VALUES ('EF1.3', 'Budgeting in the Police?', 'Sub-EF', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT id from poams where shortName = 'EF1'), (SELECT id FROM organizations WHERE shortName='EF1.3'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId, organizationId)
	VALUES ('1.3.A', 'Getting a budget in place', 'Milestone', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT id from poams where shortName = 'EF1.3'), (SELECT id from organizations where shortName='EF1.3'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId, organizationId)
	VALUES ('1.3.B', 'Tracking your expenses', 'Milestone', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT id from poams where shortName = 'EF1.3'), (SELECT id from organizations where shortName='EF1.3'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId, organizationId)
	VALUES ('1.3.C', 'Knowing when you run out of money', 'Milestone', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT id from poams where shortName = 'EF1.3'), (SELECT id from organizations where shortName='EF1.3'));

INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, organizationId)
	VALUES ('EF2', 'Transparency, Accountability, O (TAO)', 'EF', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT id from organizations where shortName='EF2'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId, organizationId)
	VALUES ('2.A', 'This is the first Milestone in EF2', 'Milestone', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT id from poams where shortName = 'EF2'), (SELECT id from organizations where shortName='EF2'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId, organizationId)
	VALUES ('2.B', 'This is the second Milestone in EF2', 'Milestone', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT id from poams where shortName = 'EF2'), (SELECT id from organizations where shortName='EF2'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId, organizationId)
	VALUES ('2.C', 'This is the third Milestone in EF2', 'Milestone', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT id from poams where shortName = 'EF2'), (SELECT id from organizations where shortName='EF2'));

INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('EF3', 'Rule of Law', 'EF', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('EF4', 'Force Gen (Training)', 'EF', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('EF5', 'Force Sustainment (Logistics)', 'EF', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('EF6', 'C2 Operations', 'EF', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('EF7', 'Intelligence', 'EF', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('EF8', 'Stratcom', 'EF', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('Gender', '', 'EF', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('TAAC-N', '', 'EF', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('TAAC-S', '', 'EF', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('TAAC-E', '', 'EF', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('TAAC-W', '', 'EF', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('TAAC-C', '', 'EF', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('TAAC Air', '', 'EF', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO locations (name, lat, lng, createdAt, updatedAt) VALUES('St Johns Airport', 47.613442, -52.740936, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO locations (name, lat, lng, createdAt, updatedAt) VALUES('Murray''s Hotel', 47.561517, -52.708760, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO locations (name, lat, lng, createdAt, updatedAt) VALUES('Wishingwells Park', 47.560040, -52.736962, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO locations (name, lat, lng, createdAt, updatedAt) VALUES('General Hospital', 47.571772, -52.741935, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO locations (name, lat, lng, createdAt, updatedAt) VALUES('Portugal Cove Ferry Terminal', 47.626718, -52.857241, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO locations (name, lat, lng, createdAt, updatedAt) VALUES('Cabot Tower', 47.570010, -52.681770, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO locations (name, lat, lng, createdAt, updatedAt) VALUES('Fort Amherst', 47.563763, -52.680590, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO locations (name, lat, lng, createdAt, updatedAt) VALUES('Harbour Grace Police Station', 47.705133, -53.214422, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO locations (name, lat, lng, createdAt, updatedAt) VALUES('Conception Bay South Police Station', 47.526784, -52.954739, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO locations (name, createdAt, updatedAt) VALUES ('MoD Headquarters Kabul', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO locations (name, createdAt, updatedAt) VALUES ('MoI Headquarters Kabul', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO locations (name, createdAt, updatedAt) VALUES ('President''s Palace', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO locations (name, createdAt, updatedAt) VALUES ('Kabul Police Academy', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO locations (name, createdAt, updatedAt) VALUES ('Police HQ Training Facility', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO locations (name, createdAt, updatedAt) VALUES ('Kabul Hospital', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO locations (name, createdAt, updatedAt) VALUES ('MoD Army Training Base 123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO locations (name, createdAt, updatedAt) VALUES ('MoD Location the Second', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO locations (name, createdAt, updatedAt) VALUES ('MoI Office Building ABC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


INSERT INTO organizations (shortName, longName, type, createdAt, updatedAt) VALUES ('MoD', 'Ministry of Defense', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO organizations (shortName, longName, type, createdAt, updatedAt) VALUES ('MoI', 'Ministry of Interior', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO positions (name, code, type, status, currentPersonId, organizationId, createdAt, updatedAt)
	VALUES ('Minister of Defense', 'MOD-FO-00001', 1, 0, NULL, (SELECT id FROM organizations WHERE longName LIKE 'Ministry of Defense'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO positions (name, code, type, status, currentPersonId, organizationId, createdAt, updatedAt)
	VALUES ('Chief of Staff - MoD', 'MOD-FO-00002', 1, 0, NULL, (SELECT id FROM organizations WHERE longName LIKE 'Ministry of Defense'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO positions (name, code, type, status, currentPersonId, organizationId, createdAt, updatedAt)
	VALUES ('Executive Assistant to the MoD', 'MOD-FO-00003', 1, 0, NULL, (SELECT id FROM organizations WHERE longName LIKE 'Ministry of Defense'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO positions (name, code, type, status, currentPersonId, organizationId, createdAt, updatedAt)
	VALUES ('Planning Captain', 'MOD-FO-00004', 1, 0, NULL, (SELECT id FROM organizations WHERE longName LIKE 'Ministry of Defense'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO positions (name, code, type, status, currentPersonId, organizationId, createdAt, updatedAt)
	VALUES ('Director of Budgeting - MoD', 'MOD-Bud-00001', 1, 0, NULL, (SELECT id FROM organizations WHERE longName LIKE 'Ministry of Defense'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO positions (name, code, type, status, currentPersonId, organizationId, createdAt, updatedAt)
	VALUES ('Writer of Expenses - MoD', 'MOD-Bud-00002', 1, 0, NULL, (SELECT id FROM organizations WHERE longName LIKE 'Ministry of Defense'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO positions (name, code, type, status, currentPersonId, organizationId, createdAt, updatedAt)
	VALUES ('Cost Adder - MoD', 'MOD-Bud-00003', 1, 0, NULL, (SELECT id FROM organizations WHERE longName LIKE 'Ministry of Defense'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO positions (name, code, type, status, currentPersonId, organizationId, createdAt, updatedAt)
	VALUES ('Chief of Police', 'MOI-Pol-HQ-00001', 1, 0, NULL, (SELECT id FROM organizations WHERE longName LIKE 'Ministry of Interior'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Put Steve into a Tashkil and associate with the EF1 Advisor Billet
INSERT INTO peoplePositions (positionId, personId, createdAt) VALUES
	((SELECT id from positions where name = 'Cost Adder - MoD'), (SELECT id from people where emailAddress = 'hunter+steve@dds.mil'), CURRENT_TIMESTAMP);
UPDATE positions SET currentPersonId = (SELECT id from people where emailAddress = 'hunter+steve@dds.mil') WHERE name = 'Cost Adder - MoD';
INSERT INTO positionRelationships (positionId_a, positionId_b, createdAt, updatedAt, deleted) VALUES
	((SELECT id from positions WHERE name ='EF1.1 Advisor A'),
	(SELECT id FROM positions WHERE name='Cost Adder - MoD'),
	CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

-- But Roger in a Tashkil and associate with the EF2 advisor billet
INSERT INTO peoplePositions (positionId, personId, createdAt) VALUES
	((SELECT id from positions where name = 'Chief of Police'), (SELECT id from people where emailAddress = 'hunter+roger@dds.mil'), CURRENT_TIMESTAMP);
UPDATE positions SET currentPersonId = (SELECT id from people where emailAddress = 'hunter+roger@dds.mil') WHERE name = 'Chief of Police';
INSERT INTO positionRelationships (positionId_a, positionId_b, createdAt, updatedAt, deleted) VALUES
	((SELECT id from positions WHERE name ='Chief of Police'),
	(SELECT id FROM positions WHERE name='EF2.1 Advisor B'),
	CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

-- But Christopf in a Tashkil
INSERT INTO peoplePositions (positionId, personId, createdAt) VALUES
	((SELECT id from positions where name = 'Planning Captain'), (SELECT id from people where emailAddress = 'hunter+christopf@dds.mil'), CURRENT_TIMESTAMP);
UPDATE positions SET currentPersonId = (SELECT id from people where emailAddress = 'hunter+christopf@dds.mil') WHERE name = 'Planning Captain';
INSERT INTO positionRelationships (positionId_a, positionId_b, createdAt, updatedAt, deleted) VALUES
	((SELECT id from positions WHERE name ='Planning Captain'),
	(SELECT id FROM positions WHERE name='EF2.2 Advisor D'),
	CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);


UPDATE positions SET locationId = (SELECT id from LOCATIONS where name = 'Kabul Police Academy') WHERE name = 'Chief of Police';
UPDATE positions SET locationId = (SELECT id from LOCATIONS where name = 'MoD Headquarters Kabul') WHERE name = 'Cost Adder - MoD';

--Write a couple reports!
INSERT INTO reports (createdAt, updatedAt, locationId, intent, text, nextSteps, authorId, state, engagementDate, atmosphere, advisorOrganizationId, principalOrganizationId) VALUES
	(CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT id from locations where name='General Hospital'), 'Discuss improvements in Annual Budgeting process',
	'Today I met with this dude to tell him all the great things that he can do to improve his budgeting process. I hope he listened to me',
	'Meet with the dude again next week',
	(SELECT id FROM people where emailAddress='hunter+jack@dds.mil'), 2, '2016-05-25', 0,
	(SELECT id FROM organizations where shortName = 'EF2.1'), (SELECT id FROM organizations WHERE longName LIKE 'Ministry of Defense'));
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+steve@dds.mil'), (SELECT max(id) FROM reports), 1);
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+jack@dds.mil'), (SELECT max(id) FROM reports), 1);

INSERT INTO reports (createdAt, updatedAt, locationId, intent, text, keyOutcomes, nextSteps, authorId, state, engagementDate, atmosphere, advisorOrganizationId, principalOrganizationId) VALUES
	(CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (select id from locations where name='General Hospital'), 'Run through FY2016 Numbers on tool usage',
	'Today we discussed the fiscal details of how spreadsheets break down numbers into rows and columns and then text is used to fill up space on a web page, it was very interesting and other adjectives',
	'we read over the spreadsheets for the FY17 Budget',
	'meet with him again :(', (SELECT id FROM people where domainUsername='jack'), 2, '2016-06-01', 0,
	(SELECT id FROM organizations where shortName = 'EF2.1'), (SELECT id FROM organizations WHERE longName LIKE 'Ministry of Defense'));
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+steve@dds.mil'), (SELECT max(id) from reports), 1);
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+roger@dds.mil'), (SELECT max(id) from reports), 0);
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+jack@dds.mil'), (SELECT max(id) FROM reports), 1);
INSERT INTO reportPoams (poamId, reportId) VALUES ((SELECT id from poams where shortName = '1.1.A'), (SELECT max(id) from reports));
INSERT INTO reportPoams (poamId, reportId) VALUES ((SELECT id from poams where shortName = '1.1.B'), (SELECT max(id) from reports));

INSERT INTO reports (createdAt, updatedAt, locationId, intent, text, keyOutcomes, nextSteps, authorId, state, engagementDate, atmosphere, advisorOrganizationId, principalOrganizationId) VALUES
	(CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (select id from locations where name='Kabul Hospital'), 'Looked at Hospital usage of Drugs',
	'This report needs to fill up more space',
	'putting something in the database to take up space',
	'to be more creative next time', (SELECT id FROM people where domainUsername='jack'), 2, '2016-06-03', 0,
	(SELECT id FROM organizations where shortName = 'EF2.1'), (SELECT id FROM organizations WHERE longName LIKE 'Ministry of Defense'));
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+steve@dds.mil'), (SELECT max(id) from reports), 1);
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+jack@dds.mil'), (SELECT max(id) FROM reports), 1);
INSERT INTO reportPoams (poamId, reportId) VALUES ((SELECT id from poams where shortName = '1.1.C'), (SELECT max(id) from reports));

INSERT INTO reports (createdAt, updatedAt, locationId, intent, text, keyOutcomes, nextSteps, authorId, state, engagementDate, atmosphere, advisorOrganizationId, principalOrganizationId) VALUES
	(CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (select id from locations where name='Kabul Hospital'), 'discuss enagement of Doctors with Patients',
	'Met with Nobody in this engagement and discussed no poams, what a waste of time',
	'None',
	'Head over to the MoD Headquarters buildling for the next engagement', (SELECT id FROM people where domainUsername='jack'), 2, '2016-06-10', 0,
	(SELECT id FROM organizations where shortName = 'EF2.1'), (SELECT id FROM organizations WHERE longName LIKE 'Ministry of Defense'));
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+steve@dds.mil'), (SELECT max(id) from reports), 1);
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+jack@dds.mil'), (SELECT max(id) FROM reports), 1);
INSERT INTO reportPoams (poamId, reportId) VALUES ((SELECT id from poams where shortName = '1.1.A'), (SELECT max(id) from reports));

INSERT INTO reports (createdAt, updatedAt, locationId, intent, text, nextSteps, authorId, state, releasedAt, engagementDate, atmosphere, atmosphereDetails, advisorOrganizationId, principalOrganizationId) VALUES
	(CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (select id from locations where name='MoD Headquarters Kabul'), 'Meet with Leadership regarding monthly status update',
	'This engagement was sooooo interesting',
	'Meet up with Roger next week to look at the numbers on the charts', (SELECT id FROM people where domainUsername='jack'), 2,CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 'Guy was grumpy',
	(SELECT id FROM organizations where shortName = 'EF2.1'), (SELECT id FROM organizations WHERE longName LIKE 'Ministry of Defense'));
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+steve@dds.mil'), (SELECT max(id) from reports), 1);
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+bob@dds.mil'), (SELECT max(id) from reports), 1);
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+jack@dds.mil'), (SELECT max(id) FROM reports), 1);
INSERT INTO reportPoams (poamId, reportId) VALUES ((SELECT id from poams where shortName = '1.1.B'), (SELECT max(id) from reports));

INSERT INTO reports (createdAt, updatedAt, locationId, intent, text, keyOutcomes, nextSteps, authorId, state, releasedAt, engagementDate, atmosphere, atmosphereDetails, advisorOrganizationId, principalOrganizationId) VALUES
	(CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (select id from locations where name='Fort Amherst'), 'Inspect Ft Amherst Medical Budgeting Facility?',
	'Went over to the fort to look at the beds and the spreadsheets and the numbers and the whiteboards and the planning and all of the budgets. It was GREAT!',
	'Seeing the whiteboards firsthand',
	'head to Cabot Tower and inspect their whiteboards next week', (SELECT id FROM people where domainUsername='jack'), 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, 'Very good tea',
	(SELECT id FROM organizations where shortName = 'EF2.1'), (SELECT id FROM organizations WHERE longName LIKE 'Ministry of Defense'));
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+roger@dds.mil'), (SELECT max(id) from reports), 1);
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+jack@dds.mil'), (SELECT max(id) FROM reports), 1);
INSERT INTO reportPoams (poamId, reportId) VALUES ((SELECT id from poams where shortName = '1.1.A'), (SELECT max(id) from reports));

INSERT INTO reports (createdAt, updatedAt, locationId, intent, text, nextSteps, authorId, state, engagementDate, atmosphere, advisorOrganizationId, principalOrganizationId) VALUES
	(CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (select id from locations where name='Cabot Tower'), 'Inspect Cabot Tower Budgeting Facility',
	'Looked over the places around Cabot Tower for all of the things that people do when they need to do math.  There were calculators, and slide rules, and paper, and computers',
	'keep writing fake reports to fill the database!!!', (SELECT id FROM people where domainUsername='jack'), 1, '2016-06-20', 1,
	(SELECT id FROM organizations where shortName = 'EF2.1'), (SELECT id FROM organizations WHERE longName LIKE 'Ministry of Defense'));
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+steve@dds.mil'), (SELECT max(id) from reports), 1);
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+jack@dds.mil'), (SELECT max(id) FROM reports), 1);
INSERT INTO reportPoams (poamId, reportId) VALUES ((SELECT id from poams where shortName = '1.1.C'), (SELECT max(id) from reports));

INSERT INTO reports (createdAt, updatedAt, locationId, intent, text, nextSteps, authorId, state, engagementDate, atmosphere, advisorOrganizationId, principalOrganizationId) VALUES
	(CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT id from locations where name='General Hospital'), 'Discuss discrepancies in monthly budgets',
	'Back to the hospital this week to test the recent locations feature of ANET, and also to look at math and numbers and budgets and things',
	'Meet with the dude again next week',(SELECT id FROM people where emailAddress='hunter+jack@dds.mil'), 1, '2016-06-25', 0,
	(SELECT id FROM organizations where shortName = 'EF2.1'), (SELECT id FROM organizations WHERE longName LIKE 'Ministry of Defense'));
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+steve@dds.mil'), (SELECT max(id) FROM reports), 1);
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+jack@dds.mil'), (SELECT max(id) FROM reports), 1);
INSERT INTO reportPoams (poamId, reportId) VALUES ((SELECT id from poams where shortName = '1.1.A'), (SELECT max(id) from reports));

INSERT INTO reports (createdAt, updatedAt, locationId, intent, text, nextSteps, authorId, state, engagementDate, atmosphere, advisorOrganizationId, principalOrganizationId) VALUES
	(CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT id from locations where name='St Johns Airport'), 'Inspect Air Operations Capabilities',
	'We went to the Aiport and looked at the planes, and the hangers, and the other things that airports have. ',
	'Go over to the Airport next week to look at the helicopters',(SELECT id FROM people where domainUsername='elizabeth'), 2, '2016-05-20', 0,
	(SELECT id FROM organizations where shortName = 'EF2.1'), (SELECT id FROM organizations WHERE longName LIKE 'Ministry of Defense'));
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+roger@dds.mil'), (SELECT max(id) FROM reports), 1);
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+liz@dds.mil'), (SELECT max(id) FROM reports), 1);
INSERT INTO reportPoams (poamId, reportId) VALUES ((SELECT id from poams where shortName = '2.A'), (SELECT max(id) from reports));

INSERT INTO reports (createdAt, updatedAt, locationId, intent, text, nextSteps, authorId, state, engagementDate, atmosphere, advisorOrganizationId, principalOrganizationId) VALUES
	(CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT id from locations where name='St Johns Airport'), 'Inspect Helicopter Capabilities',
	'Today we looked at the helicopters at the aiport and talked in depth about how they were not in good condition and the AAF needed new equipment.  I expressed my concerns to the pilots and promised to see what we can do.',
	'Figure out what can be done about the helicopters',(SELECT id FROM people where domainUsername='elizabeth'), 2, '2016-05-22', 0,
	(SELECT id FROM organizations where shortName = 'EF2.1'), (SELECT id FROM organizations WHERE longName LIKE 'Ministry of Defense'));
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+roger@dds.mil'), (SELECT max(id) FROM reports), 1);
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+liz@dds.mil'), (SELECT max(id) FROM reports), 1);
INSERT INTO reportPoams (poamId, reportId) VALUES ((SELECT id from poams where shortName = '2.A'), (SELECT max(id) from reports));

INSERT INTO reports (createdAt, updatedAt, locationId, intent, text, nextSteps, keyOutcomes, authorId, state, engagementDate, atmosphere, advisorOrganizationId, principalOrganizationId) VALUES
	(CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT id from locations where name='General Hospital'), 'Look for Budget Controls',
	'Goal of the meeting was to look for the word spreadsheet in a report and then return that in a search result about budget. Lets see what happens!!',
	'Searching for text', 'Test Cases are good', (SELECT id FROM people where domainUsername='erin'), 2, '2017-01-14', 0,
	(SELECT id FROM organizations where shortName = 'EF2.2'), (SELECT id FROM organizations WHERE longName LIKE 'Ministry of Defense'));
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+christopf@dds.mil'), (SELECT max(id) FROM reports), 1);
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+erin@dds.mil'), (SELECT max(id) FROM reports), 1);
INSERT INTO reportPoams (poamId, reportId) VALUES ((SELECT id from poams where shortName = '1.1.B'), (SELECT max(id) from reports));

INSERT INTO reports (createdAt, updatedAt, locationId, intent, text, nextSteps, keyOutcomes, authorId, state, engagementDate, atmosphere, advisorOrganizationId, principalOrganizationId) VALUES
	(CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT id from locations where name='General Hospital'), 'Look for Budget Controls Again',
	'The search for the spreadsheet was doomed to be successful, so we needed to generate more data in order to get a more full test of the system that really is going to have much much larger reports in it one day.',
	'Mocking up test cases','Better test data is always better', (SELECT id FROM people where domainUsername='erin'), 2, '2017-01-04', 0,
	(SELECT id FROM organizations where shortName = 'EF2.2'), (SELECT id FROM organizations WHERE longName LIKE 'Ministry of Defense'));
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+christopf@dds.mil'), (SELECT max(id) FROM reports), 1);
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='hunter+erin@dds.mil'), (SELECT max(id) FROM reports), 1);
INSERT INTO reportPoams (poamId, reportId) VALUES ((SELECT id from poams where shortName = '1.1.B'), (SELECT max(id) from reports));


UPDATE reports SET releasedAt = reports.createdAt WHERE state = 2;

--Create the default Approval Step
INSERT INTO approvalSteps (name, advisorOrganizationId) VALUES ('Default Approvers', (select id from organizations where shortName='ANET Administrators'));
INSERT INTO approvers (approvalStepId, positionId) VALUES ((SELECT id from approvalSteps where name = 'Default Approvers'), (SELECT id from positions where name = 'ANET Administrator'));

-- Set approvalStepId's from organizations with default
UPDATE reports SET
approvalStepId = (SELECT id FROM approvalSteps WHERE name = 'Default Approvers')
WHERE reports.id IN
(SELECT reports.id FROM reports INNER JOIN (people INNER JOIN (organizations INNER JOIN positions ON positions.organizationId = organizations.id) ON people.id = positions.currentPersonId) ON reports.authorId = people.id WHERE approvalStepId IS NULL AND reports.state = 1);

--Set the Admin Settings
INSERT INTO adminSettings ([key], value) VALUES ('SECURITY_BANNER_TEXT', 'DEMO USE ONLY');
INSERT INTO adminSettings ([key], value) VALUES ('SECURITY_BANNER_COLOR', 'green');
INSERT INTO adminSettings ([key], value) VALUES ('DEFAULT_APPROVAL_ORGANIZATION', (select CAST(id AS varchar) from organizations where shortName='ANET Administrators'));
INSERT INTO adminSettings ([key], value) VALUES ('MAP_LAYERS', '[{"name":"OSM","default" : true, "url":"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", "type":"osm"}]');

