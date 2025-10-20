export const STANDARD_APP_NAME = 'Captain App'

export const SUPPORTED_TOOLS = {
    JIRA: 'Jira'
}

export const VERSION_STATUS = {
    CREATED: {
        MESSAGE: 'Created',
        LOADER: false,
        RANK: 0
    },
    START_TEXT_EXTRACT: {
        MESSAGE: 'Started text extraction',
        LOADER: true,
        RANK: 1
    },
    COMPLETE_TEXT_EXTRACT: {
        MESSAGE: 'Text extraction complete',
        LOADER: true,
        RANK: 2
    },
    ERR_TEXT_EXTRACT: {
        MESSAGE: 'Error occurred during text extraction',
        LOADER: false,
        RANK: null
    },
    START_REQ_EXTRACT_P1: {
        MESSAGE: 'Started requirement extraction (Phase 1)',
        LOADER: true,
        RANK: 3
    },
    COMPLETE_REQ_EXTRACT_P1: {
        MESSAGE: 'Requirement extraction (Phase 1) complete',
        LOADER: true,
        RANK: 4
    },
    ERR_REQ_EXTRACT_P1: {
        MESSAGE: 'Error occurred during requirement extraction (Phase 1)',
        LOADER: false,
        RANK: null
    },
    START_REQ_EXTRACT_P2: {
        MESSAGE: 'Started requirement extraction (Phase 2)',
        LOADER: true,
        RANK: 5
    },
    START_STORE_EXPLICIT: {
        MESSAGE: 'Started storing explicit requirements',
        LOADER: true,
        RANK: 6
    },
    START_DEDUPE_EXPLICIT: {
        MESSAGE: 'Storing deduping explicit requirements',
        LOADER: true,
        RANK: 7
    },
    START_IMPLICIT_DISCOVERY: {
        MESSAGE: 'Searching for implicit requirements from standards and regulations',
        LOADER: true,
        RANK: 8
    },
    START_REFINE_IMPLICIT: {
        MESSAGE: 'Started refining implicit requirements with Gemini',
        LOADER: true,
        RANK: 9
    },
    START_STORE_IMPLICIT: {
        MESSAGE: 'Started storing implicit requirements',
        LOADER: true,
        RANK: 10
    },
    START_DEDUPE_IMPLICIT: {
        MESSAGE: 'Started deduping implicit requirements',
        LOADER: true,
        RANK: 11
    },
    CONFIRM_REQ_EXTRACT: {
        MESSAGE: 'Completed requirement extraction. Please confirm them.',
        LOADER: false,
        RANK: 12
    },
    CONFIRM_REQ_EXTRACT_RETRY: {
        MESSAGE: 'Something went wrong, please retry',
        LOADER: false,
        RANK: null
    },
    ERR_REQ_EXTRACT_P2: {
        MESSAGE: 'Error occurred during requirement extraction (Phase 2)',
        LOADER: false,
        RANK: null
    },
    START_TESTCASE_CREATION: {
        MESSAGE: 'Started proposed test cases creation',
        LOADER: true,
        RANK: 15
    },
    CONFIRM_TESTCASES: {
        MESSAGE: 'Confirm proposed test cases',
        LOADER: false,
        RANK: 16
    },
    ERR_TESTCASE_CREATION: {
        MESSAGE: 'Error occurred during proposed test cases creation',
        LOADER: false,
        RANK: null
    },
    START_TC_CREATION_ON_TOOL: {
        MESSAGE: 'Creating test cases on tool',
        LOADER: true,
        RANK: 18
    },
    COMPLETE_TC_CREATION_ON_TOOL: {
        MESSAGE: 'Completed creating test cases on tool',
        LOADER: false,
        RANK: 19
    },
    ERR_TC_CREATION_ON_TOOL: {
        MESSAGE: 'Error occurred during test cases creation on tool',
        LOADER: false,
        RANK: null
    },
    START_TC_SYNC_WITH_TOOL: {
        MESSAGE: 'Started syncing the test cases with tool',
        LOADER: true,
        RANK: 21
    },
    COMPLETE_TC_SYNC_WITH_TOOL: {
        MESSAGE: 'Completed syncing the test cases',
        LOADER: false,
        RANK: 22
    },
    ERR_TC_SYNC_WITH_TOOL: {
        MESSAGE: 'Error occurred during test cases sync',
        LOADER: false,
        RANK: null
    },
}

export const REQ_STATUS_MESSAGES = {
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

export const CHANGE_ANALYSIS_DROPDOWN_OPTIONS = Object.keys(CHANGE_ANALYSIS_STATUS)
.filter(k => k !== CHANGE_ANALYSIS_STATUS.IGNORED).map(k => ({
    label: k,
    value: CHANGE_ANALYSIS_STATUS[k],
    color: CHANGE_ANALYSIS_STATUS_COLORS[k],
    disabled: k === CHANGE_ANALYSIS_STATUS.NEW
}))

export const PUBLIC_PATHS = ['/login', '/notice']