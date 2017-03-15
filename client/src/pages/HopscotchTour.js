import History from 'components/History'
import Report from 'models/Report'

export default {
    id: 'global',
    steps: [
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
}