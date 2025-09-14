export const STANDARD_APP_NAME = 'Captain App'
export const SUPPORTED_TOOLS = {
    JIRA: 'Jira'
}

export const VERSION_STATUS_MESSAGES = {
    CREATED: 'Created',
    START_TEXT_EXTRACT: 'Started text extraction',
    COMPLETE_TEXT_EXTRACT: 'Text extraction complete',
    ERR_TEXT_EXTRACT: 'Error occurred during text extraction',
    START_REQ_EXTRACT_P1: 'Started requirement extraction (Phase 1)',
    COMPLETE_REQ_EXTRACT_P1: 'Requirement extraction (Phase 1) complete',
    ERR_REQ_EXTRACT_P1: 'Error occurred during requirement extraction (Phase 1)',
    START_REQ_EXTRACT_P2: 'Started requirement extraction (Phase 2)',
    DEDUP_EXPLICIT_WITH_GEMINI: 'Started deduplication of explicit requirements with Gemini',
    WRITE_EXPLICIT_TO_FIRESTORE: 'Storing explicit requirements',
    COMPLETE_EXP_REQ: 'Completed processing of explicit requirements',
    SEARCH_IMPLICIT_DISCOVERY: 'Searching for implicit requirements from standards and regulations',
    COMPLETE_IMP_REQ_FETCH: 'Completed fetching of implicit requirements',
    PROCESS_IMPLICIT_WITH_GEMINI: 'Processing of implicit requirements with Gemini',
    WRITE_IMPLICIT_TO_FIRESTORE: 'Storing implicit requirements',
    CONFIRM_REQ_EXTRACT: 'Confirm extracted requirements',
    CONFIRM_REQ_EXTRACT_RETRY: 'Something went wrong, please retry',
    ERR_REQ_EXTRACT_P2: 'Error occurred during requirement extraction (Phase 2)',
    START_TESTCASE_CREATION: 'Started proposed test cases creation',
    CONFIRM_TESTCASES: 'Confirm proposed test cases',
    ERR_TESTCASE_CREATION: 'Error occurred during proposed test cases creation',
    START_JIRA_CREATION: 'Creating test cases on Jira',
    COMPLETE_JIRA_CREATION: 'Completed creating test cases on Jira',
    ERR_JIRA_CREATION: 'Error occurred during testcase creation on Jira',
    START_JIRA_SYNC: 'Started syncing the testcases with Jira',
    COMPLETE_JIRA_SYNC: 'Completed syncing the testcases',
    ERR_JIRA_SYNC: 'Error occurred during testcases sync',
}

export const VERSION_STATUS_SHOW_LOADER = {
    CREATED: false,
    START_TEXT_EXTRACT: true,
    COMPLETE_TEXT_EXTRACT: true,
    ERR_TEXT_EXTRACT: false,
    START_REQ_EXTRACT_P1: true,
    COMPLETE_REQ_EXTRACT_P1: true,
    ERR_REQ_EXTRACT_P1: false,
    START_REQ_EXTRACT_P2: true,
    DEDUP_EXPLICIT_WITH_GEMINI: true,
    WRITE_EXPLICIT_TO_FIRESTORE: true,
    COMPLETE_EXP_REQ: true,
    SEARCH_IMPLICIT_DISCOVERY: true,
    COMPLETE_IMP_REQ_FETCH: true,
    PROCESS_IMPLICIT_WITH_GEMINI: true,
    WRITE_IMPLICIT_TO_FIRESTORE: true,
    CONFIRM_REQ_EXTRACT: false,
    CONFIRM_REQ_EXTRACT_RETRY: false,
    ERR_REQ_EXTRACT_P2: false,
    START_TESTCASE_CREATION: true,
    CONFIRM_TESTCASES: false,
    ERR_TESTCASE_CREATION: false,
    START_JIRA_CREATION: true,
    COMPLETE_JIRA_CREATION: false,
    ERR_JIRA_CREATION: false,
    START_JIRA_SYNC: true,
    COMPLETE_JIRA_SYNC: false,
    ERR_JIRA_SYNC: false,
}

export const VERSION_STATUS_RANK = {
    CREATED: 0,
    START_TEXT_EXTRACT: 1,
    COMPLETE_TEXT_EXTRACT: 2,
    START_REQ_EXTRACT_P1: 3,
    COMPLETE_REQ_EXTRACT_P1: 4,
    START_REQ_EXTRACT_P2: 5,
    DEDUP_EXPLICIT_WITH_GEMINI: 6,
    WRITE_EXPLICIT_TO_FIRESTORE: 7,
    COMPLETE_EXP_REQ: 8,
    SEARCH_IMPLICIT_DISCOVERY: 9,
    COMPLETE_IMP_REQ_FETCH: 10,
    PROCESS_IMPLICIT_WITH_GEMINI: 11,
    WRITE_IMPLICIT_TO_FIRESTORE: 12,
    CONFIRM_REQ_EXTRACT: 13,
    START_TESTCASE_CREATION: 14,
    CONFIRM_TESTCASES: 15,
    START_JIRA_CREATION: 16,
    COMPLETE_JIRA_CREATION: 17,
    START_JIRA_SYNC: 18,
    COMPLETE_JIRA_SYNC: 19
}

export const REQ_STATUS_MESSAGES = {
    TESTCASES_CREATION_QUEUED: 'Test cases creation queued',
    TESTCASES_CREATION_STARTED: 'Test cases creation in progress',
    TESTCASES_CREATION_COMPLETE: 'Test cases creation complete',
    ERR_TESTCASE_CREATION: 'Error occurred during test cases creation'
}

export const TC_DATASET_STATUS_MESSAGES = {
    NOT_STARTED: 'Dataset not yet generated. Please go to Datasets tab and select \'create datasets\' once you delete the ones not needed.',
    DATASET_GENERATION_QUEUED: 'Dataset generation queued',
    DATASET_GENERATION_STARTED: 'Dataset generation in progress',
    DATASET_GENERATION_COMPLETED: 'Dataset generation completed',
    ERR_DATASET_GENERATION: 'Error occurred during dataset generation'
}

export const PUBLIC_PATHS = ['/login', '/notice']