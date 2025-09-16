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
        RANK: null // Errors typically don't have a rank
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
    DEDUP_EXPLICIT_WITH_GEMINI: {
        MESSAGE: 'Started deduplication of explicit requirements with Gemini',
        LOADER: true,
        RANK: 6
    },
    WRITE_EXPLICIT_TO_FIRESTORE: {
        MESSAGE: 'Storing explicit requirements',
        LOADER: true,
        RANK: 7
    },
    COMPLETE_EXP_REQ: {
        MESSAGE: 'Completed processing of explicit requirements',
        LOADER: true,
        RANK: 8
    },
    SEARCH_IMPLICIT_DISCOVERY: {
        MESSAGE: 'Searching for implicit requirements from standards and regulations',
        LOADER: true,
        RANK: 9
    },
    COMPLETE_IMP_REQ_FETCH: {
        MESSAGE: 'Completed fetching of implicit requirements',
        LOADER: true,
        RANK: 10
    },
    PROCESS_IMPLICIT_WITH_GEMINI: {
        MESSAGE: 'Processing of implicit requirements with Gemini',
        LOADER: true,
        RANK: 11
    },
    WRITE_IMPLICIT_TO_FIRESTORE: {
        MESSAGE: 'Storing implicit requirements',
        LOADER: true,
        RANK: 12
    },
    CONFIRM_REQ_EXTRACT: {
        MESSAGE: 'Confirm extracted requirements',
        LOADER: false,
        RANK: 13
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
        RANK: 14
    },
    CONFIRM_TESTCASES: {
        MESSAGE: 'Confirm proposed test cases',
        LOADER: false,
        RANK: 15
    },
    ERR_TESTCASE_CREATION: {
        MESSAGE: 'Error occurred during proposed test cases creation',
        LOADER: false,
        RANK: null
    },
    START_REQ_CREATION_ON_TOOL: {
        MESSAGE: 'Creating requirements on tool',
        LOADER: true,
        RANK: 16
    },
    COMPLETE_REQ_CREATION_ON_TOOL: {
        MESSAGE: 'Completed creating requirements on tool',
        LOADER: false,
        RANK: 17
    },
    ERR_REQ_CREATION_ON_TOOL: {
        MESSAGE: 'Error occurred during requirements creation on tool',
        LOADER: false,
        RANK: null
    },
    START_REQ_SYNC_WITH_TOOL: {
        MESSAGE: 'Started syncing the requirements with tool',
        LOADER: true,
        RANK: 18
    },
    COMPLETE_REQ_SYNC_WITH_TOOL: {
        MESSAGE: 'Completed syncing the requirements',
        LOADER: false,
        RANK: 19
    },
    ERR_REQ_SYNC_WITH_TOOL: {
        MESSAGE: 'Error occurred during requirements sync',
        LOADER: false,
        RANK: null
    },
    START_TC_CREATION_ON_TOOL: {
        MESSAGE: 'Creating test cases on tool',
        LOADER: true,
        RANK: 20
    },
    COMPLETE_TC_CREATION_ON_TOOL: {
        MESSAGE: 'Completed creating test cases on tool',
        LOADER: false,
        RANK: 21
    },
    ERR_TC_CREATION_ON_TOOL: {
        MESSAGE: 'Error occurred during test cases creation on tool',
        LOADER: false,
        RANK: null
    },
    START_TC_SYNC_WITH_TOOL: {
        MESSAGE: 'Started syncing the test cases with tool',
        LOADER: true,
        RANK: 22
    },
    COMPLETE_TC_SYNC_WITH_TOOL: {
        MESSAGE: 'Completed syncing the test cases',
        LOADER: false,
        RANK: 23
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

export const PUBLIC_PATHS = ['/login', '/notice']