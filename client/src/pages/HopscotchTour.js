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
            onNext: () => History.push(Report.pathForNew())
        },
        {
            title: 'Meeting goal(s)',
            content: 'List out all of the goals for your meeting.',
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
            content: 'Use the checkboxes to select who the primary advisor and primary principal in the meeting were.',
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
            content: 'List the the key outcome(s) for this engagement.',
            target: '#keyOutcomes',
            placement: 'right',
        },
        {
            title: 'Next steps',
            content: 'List the next step(s) for this engagement.',
            target: '#nextSteps',
            placement: 'right',
        },
        {
            title: 'Detailed report',
            content: 'If you need to provide extra details, click on this button to display a large area for you to type the details.',
            target: '#toggleReportDetails',
            placement: 'right',
        },
    ]
}