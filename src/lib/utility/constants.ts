export const STANDARD_APP_NAME = 'Captain App'

export const SUPPORTED_TOOLS = {
    JIRA: 'Jira'
}

export const VERSION_STATUS = {
    CREATED: {
        MESSAGE: 'Created',
        LOADER: false,
        RANK: 0,
        ALLOW_REUPLOAD: false
    },
    START_TEXT_EXTRACT: {
        MESSAGE: 'Started text extraction',
        LOADER: true,
        RANK: 1,
        ALLOW_REUPLOAD: false
    },
    COMPLETE_TEXT_EXTRACT: {
        MESSAGE: 'Text extraction complete',
        LOADER: true,
        RANK: 2,
        ALLOW_REUPLOAD: false
    },
    ERR_TEXT_EXTRACT: {
        MESSAGE: 'Error occurred during text extraction',
        LOADER: false,
        RANK: null,
        ALLOW_REUPLOAD: true
    },
    START_REQ_EXTRACT_P1: {
        MESSAGE: 'Started requirement extraction (Phase 1)',
        LOADER: true,
        RANK: 3,
        ALLOW_REUPLOAD: false
    },
    START_CONTEXT_GENERATION: {
        MESSAGE: 'Started context generation',
        LOADER: true,
        RANK: 4,
        ALLOW_REUPLOAD: false
    },
    START_REQ_EXTRACTION: {
        MESSAGE: 'Started requirement extraction',
        LOADER: true,
        RANK: 5,
        ALLOW_REUPLOAD: false
    },
    START_REQ_PERSIST: {
        MESSAGE: 'Started persisting requirements',
        LOADER: true,
        RANK: 6,
        ALLOW_REUPLOAD: false
    },
    COMPLETE_REQ_EXTRACT_P1: {
        MESSAGE: 'Requirement extraction (Phase 1) complete',
        LOADER: true,
        RANK: 7,
        ALLOW_REUPLOAD: false
    },
    ERR_REQ_EXTRACT_P1: {
        MESSAGE: 'Error occurred during requirement extraction (Phase 1)',
        LOADER: false,
        RANK: null,
        ALLOW_REUPLOAD: true
    },
    START_EXP_REQ_EXTRACT: {
        MESSAGE: 'Started extracting explicit requirements (Phase 2)',
        LOADER: true,
        RANK: 8,
        ALLOW_REUPLOAD: false
    },
    START_STORE_EXPLICIT: {
        MESSAGE: 'Started storing explicit requirements',
        LOADER: true,
        RANK: 9,
        ALLOW_REUPLOAD: false
    },
    START_CHANGE_DETECTION: {
        MESSAGE: 'Started change detection',
        LOADER: true,
        RANK: 10,
        ALLOW_REUPLOAD: false
    },
    START_DEPRECATION_EXPLICIT: {
        MESSAGE: 'Started deprecating explicit requirements',
        LOADER: true,
        RANK: 11,
        ALLOW_REUPLOAD: false
    },
    START_DEDUPE_EXPLICIT: {
        MESSAGE: 'Started deduplicating explicit requirements',
        LOADER: true,
        RANK: 12,
        ALLOW_REUPLOAD: false
    },
    CONFIRM_CHANGE_ANALYSIS_EXPLICIT: {
        MESSAGE: 'Confirm change analysis for explicit requirements',
        LOADER: false,
        RANK: 13,
        ALLOW_REUPLOAD: false
    },
    CONFIRM_EXP_REQ_EXTRACT: {
        MESSAGE: 'Confirm explicit requirements',
        LOADER: false,
        RANK: 14,
        ALLOW_REUPLOAD: false
    },
    ERR_EXP_REQ_EXTRACT: {
        MESSAGE: 'Error occurred during explicit requirement extraction',
        LOADER: false,
        RANK: null,
        ALLOW_REUPLOAD: true
    },
    ERR_CHANGE_ANALYSIS_EXPLICIT: {
        MESSAGE: 'Error occurred during change analysis',
        LOADER: false,
        RANK: null,
        ALLOW_REUPLOAD: true
    },
    START_IMPLICIT_REQ_EXTRACT: {
        MESSAGE: 'Started extracting implicit requirements (Phase 3)',
        LOADER: true,
        RANK: 15,
        ALLOW_REUPLOAD: false
    },
    START_IMPLICIT_ANALYSIS: {
        MESSAGE: 'Started analyzing implicit requirements (Phase 3)',
        LOADER: true,
        RANK: 16,
        ALLOW_REUPLOAD: false
    },
    START_IMPLICIT_DISCOVERY: {
        MESSAGE: 'Started discovering implicit requirements from regulations and standards',
        LOADER: true,
        RANK: 17,
        ALLOW_REUPLOAD: false
    },
    START_IMPLICIT_REFINE: {
        MESSAGE: 'Started refining implicit requirements',
        LOADER: true,
        RANK: 18,
        ALLOW_REUPLOAD: false
    },
    START_STORE_IMPLICIT: {
        MESSAGE: 'Started storing implicit requirements',
        LOADER: true,
        RANK: 19,
        ALLOW_REUPLOAD: false
    },
    START_DEDUPE_IMPLICIT: {
        MESSAGE: 'Started deduplicating implicit requirements',
        LOADER: true,
        RANK: 20,
        ALLOW_REUPLOAD: false
    },
    CONFIRM_CHANGE_ANALYSIS_IMPLICIT: {
        MESSAGE: 'Confirm change analysis for implicit requirements',
        LOADER: false,
        RANK: 21,
        ALLOW_REUPLOAD: false
    },
    CONFIRM_IMP_REQ_EXTRACT: {
        MESSAGE: 'Confirm requirements',
        LOADER: false,
        RANK: 22,
        ALLOW_REUPLOAD: false
    },
    ERR_IMP_REQ_EXTRACT: {
        MESSAGE: 'Error occurred during implicit requirement extraction',
        LOADER: false,
        RANK: null,
        ALLOW_REUPLOAD: false
    },
    ERR_CHANGE_ANALYSIS_IMPLICIT: {
        MESSAGE: 'Error occurred during implicit requirement change analysis',
        LOADER: false,
        RANK: null,
        ALLOW_REUPLOAD: false
    },
    START_TESTCASE_CREATION: {
        MESSAGE: 'Started proposed test cases creation',
        LOADER: true,
        RANK: 23,
        ALLOW_REUPLOAD: false
    },
    CONFIRM_TESTCASES: {
        MESSAGE: 'Confirm proposed test cases',
        LOADER: false,
        RANK: 24,
        ALLOW_REUPLOAD: false
    },
    ERR_TESTCASE_CREATION: {
        MESSAGE: 'An error occurred during proposed test cases creation',
        LOADER: false,
        RANK: null,
        ALLOW_REUPLOAD: false
    },
    START_TC_CREATION_ON_TOOL: {
        MESSAGE: 'Creating test cases on tool',
        LOADER: true,
        RANK: 25,
        ALLOW_REUPLOAD: false
    },
    COMPLETE_TC_CREATION_ON_TOOL: {
        MESSAGE: 'Completed creating test cases on tool',
        LOADER: false,
        RANK: 26,
        ALLOW_REUPLOAD: false
    },
    ERR_TC_CREATION_ON_TOOL: {
        MESSAGE: 'Error occurred during test cases creation on tool',
        LOADER: false,
        RANK: null,
        ALLOW_REUPLOAD: false
    },
    START_TC_SYNC_WITH_TOOL: {
        MESSAGE: 'Started syncing the test cases with tool',
        LOADER: true,
        RANK: 27,
        ALLOW_REUPLOAD: false
    },
    COMPLETE_TC_SYNC_WITH_TOOL: {
        MESSAGE: 'Completed syncing the test cases',
        LOADER: false,
        RANK: 28,
        ALLOW_REUPLOAD: false
    },
    ERR_TC_SYNC_WITH_TOOL: {
        MESSAGE: 'Error occurred during test cases sync',
        LOADER: false,
        RANK: null,
        ALLOW_REUPLOAD: false
    }
}

export const REQ_STATUS_MESSAGES = {
    NOT_STARTED: 'Test cases creation not started yet',
    TESTCASES_CREATION_QUEUED: 'Test cases creation queued',
    TESTCASES_CREATION_STARTED: 'Test cases creation in progress',
    TESTCASES_CREATION_COMPLETE: 'Test cases creation complete',
    ERR_TESTCASE_CREATION: 'Error occurred during test cases creation'
}

export const TC_DATASET_STATUS_MESSAGES = {
    NOT_STARTED: 'Dataset creation not yet started. Click \'Create datasets\' button in Datasets tab to start the process.',
    DATASET_GENERATION_QUEUED: 'Dataset generation queued',
    DATASET_GENERATION_STARTED: 'Dataset generation in progress',
    DATASET_GENERATION_COMPLETED: 'Dataset generation completed',
    ERR_DATASET_GENERATION: 'Error occurred during dataset generation'
}

export const CHANGE_ANALYSIS_STATUS = {
    IGNORED: 'IGNORED',
    NEW: 'NEW',
    UNCHANGED: 'UNCHANGED',
    MODIFIED: 'MODIFIED',
    DEPRECATED: 'DEPRECATED'
}

const CHANGE_ANALYSIS_STATUS_COLORS = {
    IGNORED: 'gray',
    NEW: 'green',
    UNCHANGED: 'blue',
    MODIFIED: 'orange',
    DEPRECATED: 'red'
}

export const CHANGE_ANALYSIS_DROPDOWN_OPTIONS = Object.keys(CHANGE_ANALYSIS_STATUS).map(k => ({
    label: k,
    value: CHANGE_ANALYSIS_STATUS[k],
    color: CHANGE_ANALYSIS_STATUS_COLORS[k],
    disabled: [CHANGE_ANALYSIS_STATUS.NEW, CHANGE_ANALYSIS_STATUS.IGNORED].includes(k)
}))

export const PUBLIC_PATHS = ['/login', '/notice']

export const getNoticeMessage = (status: string): { title: string, content: string } => {
    switch (status) {
        case 'CONFIRM_EXP_REQ_EXTRACT':
            return {
                title: 'Verify extracted explicit requirements',
                content: 'Please remove any unwanted requirement and click confirm to go ahead with implicit requirements discovery on standards and regulations.'
            }
        
        case 'CONFIRM_CHANGE_ANALYSIS_EXPLICIT':
            return {
                title: 'Verify the results of change analysis',
                content: 'Please update the change status of the explicit requirements if they are not captured correctly and click on confirm.'
            }
        
        case 'CONFIRM_IMP_REQ_EXTRACT':
            return {
                title: 'Verify extracted implicit requirements',
                content: 'Please remove any unwanted requirement from the extracted requirements and click confirm to go ahead with test cases creation.'
            }
        
        case 'CONFIRM_TESTCASES':
            return {
                title: 'Verify proposed test cases',
                content: 'Please remove any unwanted test cases from the proposed ones and click confirm to go ahead with their creation/updation on Jira project.'
            }

        case 'ERR_IMP_REQ_EXTRACT':
        case 'ERR_CHANGE_ANALYSIS_IMPLICIT':
        case 'ERR_TESTCASE_CREATION':
        case 'ERR_TC_CREATION_ON_TOOL':
            return {
                title: 'Something went wrong',
                content: 'Please try again'
            }

        default:
            return {
                title: '',
                content: ''
            }
    }
}