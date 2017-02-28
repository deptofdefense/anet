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
            title: 'New Report',
            content: 'Create a report by clicking on this button. If you are a Super User you may have different options.',
            target: 'createButton',
            placement: 'bottom',
            fixedElement: true
        },
        {
            title: 'Left navigation',
            content: 'Use this menu to move between areas for a specific section.',
            target: 'leftNav',
            placement: 'right',
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
    ]
}