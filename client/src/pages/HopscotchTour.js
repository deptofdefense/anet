import History from 'components/History'
import {Report, Organization} from 'models'

let userTour = function(currentUser) { return {
	id: 'global',
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
			multipage: true,
			onNext: () => History.push(Report.pathForNew(), {continuingHopscotchTour: true})
		},
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
			title: 'Start this tour again',
			content: 'Click this button to restart the tour.',
			target: '.persistent-tour-launcher',
			placement: 'bottom',
		},
	]
}}

let superUserTour = function(currentUser) { return {
	id: 'global',
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
			onNext: () => History.push(Organization.pathFor(currentUser.position.organization), {continuingHopscotchTour: true})
		},
		{
			title: 'New Report',
			content: 'Create a report by clicking on this button. If you are a Super User you may have different options.',
			target: 'createButton',
			placement: 'left',
			fixedElement: true,
			multipage: true,
			onNext: () => History.push(Report.pathForNew(), {continuingHopscotchTour: true})
		},
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
			title: 'Start this tour again',
			content: 'Click this button to restart the tour.',
			target: '.persistent-tour-launcher',
			placement: 'bottom',
		},
	]
}}

export {userTour, superUserTour}
