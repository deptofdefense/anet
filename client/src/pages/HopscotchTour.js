import History from 'components/History'
import {Organization} from 'models'

let userTour = function(currentUser) { return {
	id: 'home',
	steps: [
		{
			title: 'Welcome',
			content: 'Welcome to ANET! This tour will quickly show you where to find information in ANET 2, and how to draft a report.',
			target: '.persistent-tour-launcher',
			placement: 'bottom',
		},
		{
			title: 'Home',
			content: 'Click on the logo to get back to your homepage, from wherever you are.',
			target: '.logo img',
			placement: 'right',
			fixedElement: true
		},
		{
			title: 'Search',
			content: 'Search for reports, people, or organizations. You\'ll be able to save your searches.',
			target: 'searchBarInput',
			placement: 'bottom',
			fixedElement: true
		},
		{
			title: 'Left navigation',
			content: 'Use this menu to move between areas for a specific section.',
			target: 'leftNav',
			placement: 'right',
			fixedElement: true,
		},
		{
			title: 'My ANET snapshot',
			content: 'This area shows you how many reports you\'ve drafted but haven\'t submitted, the number of your reports waiting for approval from your organization\'s approval chain, and your organization\'s reports published in the last 7 days and upcoming engagements.',
			target: '.home-tile-row',
			placement: 'bottom',
		},
		{
			title: 'New Report',
			content: 'Create a report by clicking on this button.',
			target: 'createButton',
			placement: 'left',
			fixedElement: true,
		}
	]
}}

let superUserTour = function(currentUser) { return {
	id: 'home',
	steps: [
		{
			title: 'Welcome',
			content: 'Welcome to ANET! As a super user, there are a few things you\'ll need to do make sure your organization is ready to use ANET 2, and to keep it up to date from now on. This guided tour will show you how to do things like find reports you need to approve and update your organization\'s positions, billet codes, and people. It will also show you how to set up approval chains for your organization, create new people and positions, and link Afghan principals to your organization\'s advisors. First we\'ll look around the home page, then we\'ll look through your organization\'s page.',
			target: '.persistent-tour-launcher',
			placement: 'bottom',
		},
		{
			title: 'Home',
			content: 'Click on the logo to get back to your homepage, from wherever you are.',
			target: '.logo img',
			placement: 'right',
			fixedElement: true
		},
		{
			title: 'Search',
			content: 'Search for reports, people, or organizations. You\'ll be able to save your searches.',
			target: 'searchBarInput',
			placement: 'bottom',
			fixedElement: true
		},
		{
			title: 'Left navigation',
			content: 'Use this menu to move between areas for a specific section.',
			target: 'leftNav',
			placement: 'right',
			fixedElement: true,
		},
		{
			title: 'My ANET snapshot',
			content: 'This area shows you how many reports need your approval, the number of your reports have been drafted but not submitted, your organization\'s submitted reports in the last 7 days, as well as upcoming engagements in your organization.',
			target: '.home-tile-row',
			placement: 'bottom',
		},
		{
			title: 'EFs / AOs',
			content: 'You can navigate to your organization from this dropdown list. Find your organization from this list to start the tour that will walk you through how to set up and update your organization as a super user.',
			target: 'organizations',
			placement: 'right',
			fixedElement: true,
			multipage: true,
			onNext: () => History.push(Organization.pathFor(currentUser.position.organization))
		},
		{}
	]
}}

let reportTour = function(currentUser) { return {
	id: 'report',
	steps: [
		{
			title: 'Meeting goal(s)',
			content: "Use this section to tell readers why you met with your principal. Were you working on a specific goal or problem with them? This will be part of your report's summary, so use this space to tell readers the high-level purpose of your engagement.",
			target: 'intent',
			placement: 'right',
		},
		{
			title: 'Engagement date',
			content: 'When did this engagement happen, or when will it take place? Simply select it from the calendar.',
			target: '#engagementDate',
			placement: 'right',
		},
		{
			title: 'Engagement location',
			content:
				'Start typing the location of where the engagement took place. Select one of the options available, or ask your Super User to add it.',
			target: '#location',
			placement: 'right',
		},
		{
			title: 'Atmospherics',
			content: 'Select whether it went well or not.',
			target: '#neutralAtmos',
			placement: 'bottom',
		},
		{
			title: 'Attendee(s)',
			content: 'Start typing the name of everyone who was at the meeting. Select one of the options available or ask your Super User to add it.',
			target: '#attendees',
			placement: 'right',
		},
		{
			title: 'Primary advisor and principal',
			content: "Use these check boxes to indicate who the primary advisor and primary principal was. The people you choose will display on your report's summary as the main individuals involved in your engagement.",
			target: '#attendeesTable',
			placement: 'bottom',
		},
		{
			title: 'PoAMs',
			content: 'Select the PoAMs that apply to this engagement. These are not required.',
			target: '#poams',
			placement: 'right',
		},
		{
			title: 'Key outcomes',
			content: "Use this section to tell readers what the main information or results from your engagement were. This will be displayed in your report's summary, so include information that you think would be valuable for leadership and other organizations to know.",
			target: '#keyOutcomes',
			placement: 'right',
		},
		{
			title: 'Next steps',
			content: "Here, tell readers about the next concrete steps that you'll be taking to build on the progress made in your engagement. This will be displayed in your report's summary, so include information that will explain to leadership what you are doing next, as a result of your meeting's outcomes.",
			target: '#nextSteps',
			placement: 'right',
		},
		{
			title: 'Detailed report',
			content: `If there's more information from your meeting that you'd like to include, click on the "Add detailed comments" button. You will have additional space to record discussion topics and notes that may be helpful to you, your organization, or leadership later on. This section does not display in the report summary.`,
			target: '#toggleReportDetails',
			placement: 'right',
		},
		{
			title: 'Preview and submit',
			content: "Pressing this button will save the report as a draft and take you to the preview page. You will have a chance to review your report before you send it for approval and then to the SFAC.",
			target: '#formBottomSubmit',
			placement: 'left',
		},
		{
			title: 'Start this tour again',
			content: 'Click this button to restart the tour.',
			target: '.persistent-tour-launcher',
			placement: 'left',
		},
	]
}}

let orgTour = function(currentUser) { return {
	id: 'org',
	steps: [
		{
			title: 'Your organization\'s information',
			content: 'In this section of the page, you will find general information about your organization. This includes a description of your organization, a list of who the super users are, and sub-organizations. If you\'re a super user for a parent EF or organization -- such as EF 1 rather than EF 1.1 -- you can make changes to your organization and any sub-organization. If you\'re a super user in a sub-organization, you can only make changes within that sub-organization.',
			target: 'info',
			placement: 'bottom',
		},
		{
			title: 'Supported positions',
			content: 'The "Support Positions" section shows the positions in your organization that currently have people assigned to them. The billet column tells you the position name of the position. The billet\'s code is at the end of the position name. If any of the information here looks wrong, click on the position name. You\'ll see a detailed view of that position, and will have the option to make changes. You can also take a guided tour of that page when you\'re on it.',
			target: '#supportedPositions h2',
			placement: 'top',
		},
		{
			title: 'Vacant positions',
			content: 'This section of the page will show you positions in your organizations that currently do not have anyone assigned to them. To assign someone to the position, or to mark the position inactive, you can click on the position name, and select the "Edit" button near the top-right of that page.',
			target: '#vacantPositions h2',
			placement: 'top',
		},
		{
			title: 'Approval process',
			content: 'Here, you can review the approval process for reports authored in your organization. If there\'s no approval chain set up, scroll to the top of the page and click the "Edit" button. You\'ll be able to add and name as many approval steps as you\'d like. There are a couple of important things to keep in mind when you\'re setting up approval chains. The first is that we recommend having more than one approver in each step. That means that more than one person can approve reports at that step. The second thing to keep in mind is that when a report has been approved by someone at each step in your approval chain, it will automatically go into that day\'s daily rollup. Lastly, you can add any one to your approval chain, they do not need to be a super user.',
			target: '#approvals h2',
			placement: 'top',
		},
		{
			title: 'PoAMs',
			content: 'The PoAMs or Pillars that your organization is responsible for will be displayed in this section. If you need to make changes, or if PoAMs change, please contact an administrator to update them.',
			target: '#poams h2',
			placement: 'top',
		},
		{
			title: 'Your orginization\'s reports',
			content: 'Here, you\'ll find the complete list of all reports authored by your members of your organization.',
			target: '#reports h2',
			placement: 'top',
		},
		{
			title: 'Edit your organization',
			content: 'If you need to make changes to any of the data we just went over, click the "Edit" button.',
			target: 'editButton',
			placement: 'left',
		},
		{
			title: 'Take a guided tour',
			content: 'If you want to go through this page\'s tour at some point in the future, you can always click on this button to get the tour. Clicking this button on another page will take you through the quick tour for that page.',
			target: '.persistent-tour-launcher',
			placement: 'left',
		},
		{
			title: 'Create',
			content: 'Those are the main areas you\'ll need to check as a super user. When reviewing your updating your organization\'s information, you might need to create new people or positions. New members of your team will automatically create new accounts when they log in for the first time, unless they are moving to ANET 2 from ANET 1. In those cases, they should already have an account. If you do need to create a new report, person, position, or location, click on this "Create" button and select what you need from the menu. Each of those pages will have their own, quick tours which will explain what you need to do to fill out those pages.',
			target: 'createButton',
			placement: 'left',
			fixedElement: true,
		},
	]
}}

export {userTour, superUserTour, reportTour, orgTour}
