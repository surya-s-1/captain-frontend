export const STANDARD_APP_NAME = 'Captain App'
export const SUPPORTED_TOOLS = {
    JIRA: 'Jira'
}

export const STATUS_MESSAGES = {
    CREATED: 'Created',
    START_TEXT_EXTRACT: 'Started text extraction',
    COMPLETE_TEXT_EXTRACT: 'Text extraction complete',
    ERR_TEXT_EXTRACT: 'Error occurred during text extraction',
    START_REQ_EXTRACT_P1: 'Started requirement extraction (Phase 1)',
    COMPLETE_REQ_EXTRACT_P1: 'Requirement extraction (Phase 1) complete',
    ERR_REQ_EXTRACT_P1: 'Error occurred during requirement extraction (Phase 1)',
    START_REQ_EXTRACT_P2: 'Started requirement extraction (Phase 2)',
    COMPLETE_EXP_REQ: 'Completed explicit requirements extraction',
    COMPLETE_IMP_REQ: 'Completed implicit requirements extraction',
    PROCESS_IMP_REQ: 'Started processing implicit requirements',
    CONFIRM_REQ_EXTRACT: 'Confirm extracted requirements',
    ERR_REQ_EXTRACT_P2: 'Error occurred during requirement extraction (Phase 2)',
    START_TESTCASE_CREATION: 'Started proposed test cases creation',
    CONFIRM_TESTCASE_CREATION: 'Confirm proposed test cases',
    ERR_TESTCASE_CREATION: 'Error occurred during proposed test cases creation',
    START_JIRA_CREATION: 'Creating test cases on Jira',
    COMPLETE_JIRA_CREATION: 'Completed creating test cases on Jira',
    ERR_JIRA_CREATION: 'Error occurred during testcase creation on Jira',
    START_JIRA_SYNC: 'Started syncing the testcases with Jira',
    COMPLETE_JIRA_SYNC: 'Completed syncing the testcases',
    ERR_JIRA_SYNC: 'Error occurred during testcases sync',
}

export const STATUS_SHOW_LOADER = {
    CREATED: false,
    START_TEXT_EXTRACT: true,
    COMPLETE_TEXT_EXTRACT: true,
    ERR_TEXT_EXTRACT: false,
    START_REQ_EXTRACT_P1: true,
    COMPLETE_REQ_EXTRACT_P1: true,
    ERR_REQ_EXTRACT_P1: false,
    START_REQ_EXTRACT_P2: true,
    COMPLETE_EXP_REQ: true,
    COMPLETE_IMP_REQ: true,
    PROCESS_IMP_REQ: true,
    CONFIRM_REQ_EXTRACT: false,
    ERR_REQ_EXTRACT_P2: false,
    START_TESTCASE_CREATION: true,
    CONFIRM_TESTCASE_CREATION: false,
    ERR_TESTCASE_CREATION: false,
    START_JIRA_CREATION: true,
    COMPLETE_JIRA_CREATION: false,
    ERR_JIRA_CREATION: false,
    START_JIRA_SYNC: true,
    COMPLETE_JIRA_SYNC: false,
    ERR_JIRA_SYNC: false,
}