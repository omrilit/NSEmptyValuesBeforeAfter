/**
 * Copyright � 2018, 2019, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define([], function() {
    return {
        APP: {
            GUID: 'e5775970-8e28-40ff-ad4a-956e88304834'
        },
        ACTION: {
            SUBMIT: 'submit',
            DOWNLOAD: 'download',
            ERROR: 'error',
            FIELD_HELP: 'fieldhelp',
            SAVE_CONFIG: 'save_config',
            SUBMIT_CSV: 'submit_csv',
            SYSTEM_NOTE: 'sysnote',
            VALIDATE_SETUP: 'validate_setup'
        },
        Status: {
            PENDING: 'PENDING',
            FAILED: 'FAILED',
            SUBMITTED: 'SUBMITTED',
            FOR_SUBMISSION: 'FOR SUBMISSION',
            FOR_USER_AUTHORIZATION: 'FOR USER AUTHORIZATION',
            USER_DENIED_AUTHORIZATION: 'USER DENIED AUTHORIZATION',
            USER_AUTHORIZED: 'USER AUTHORIZED',
            RETRIEVED: 'RETRIEVED',

            // Used on forms
            SUCCESS: 'SUCCESS',
            ERROR: 'ERROR'
        },
        CONFIG: {
            SUBMIT_CSV: {
                VRN: 'VRNMTDCSV',
                PERIOD_TYPE: 'PeriodTypeMTDCSV',
                PERIOD_FROM: 'PeriodFromMTDCSV',
                PERIOD_TO: 'PeriodToMTDCSV'
            }
        },
        HTTP: {
            Status: {
                OK: 200
            },
            Message: {
                404: 'There is no matching data for your selected period '
            }
        },
        TOKEN_ID: 'ACCESS_TOKEN',
        CACHE_ID: 'CACHE',
        STATE_ID: 'STATE',
        DOWNLOAD_DETAILS: 'DOWNLOAD_DETAILS',
        MIN_TIME_IN_SEC: 300,
        DEFAULT_DOWNLOAD_FOLDER: 'Online Filing',
        BASE_URL: 'https://system.netsuite.com',
        BASE_REDIRECT_PATH: '/app/site/hosting/scriptlet.nl',
        BREXIT_DATE: '2029/1/1',
        ENVIRONMENT: {
            TEST: 1,
            LIVE: 2
        },
        MESSAGE: {
            ERROR: {
                ILLEGAL_OPERATION: {
                    name: 'ILLEGAL_OPERATION',
                    message: 'Creating, editing and copying of an Online Filing record is not allowed. For more information contact your accounting group or NetSuite Administrator.'
                },
                INVALID_FILE: {
                    code: 'INVALID_FILE',
                    message: 'The file is invalid. Only {0} file is accepted.'
                },
                MISSING_REQUIRED_FIELD: {
                    code: 'MISSING_REQUIRED_FIELD',
                    message: '{0} is a required field.'
                },
                PARSING_ERROR: {
                    code: 'PARSING_ERROR',
                    message: 'Cannot parse file. Please make sure that the file format and contents are correct.'
                },
                NOT_AUTHORIZED: {
                    code: 'INVALID_ONLINE_FILING_REQUEST',
                    message: 'Request not authorized'
                },
                INVALID_PARAMETERS: {
                    code: 'INVALID_ONLINE_FILING_REQUEST',
                    message: 'Invalid parameters'
                },
                INVALID_VAT_VALUE: {
                    code: 'INVALID_VAT_VALUE',
                    message: 'The VAT Registration Number (VRN) in the CSV file must match the VRN in the Setup page.'
                },
                INVALID_VALUE: {
                    code: 'INVALID_BOX_VALUE',
                    message: '{0} requires a value in the proper format.'
                },
                NO_FILE_SELECTED: {
                    code: 'NO_FILE_SELECTED',
                    message: 'Please select the valid {0} file to be submitted.'
                }
            },
            ONLINE_FILING: {
                IN_PROCESS: 'Your VAT 100 Return {0} is in process. You will receive an email for the {0} results. You may close this window now.',
                NOT_IN_PROCESS: 'Your VAT 100 Return {0} cannot be processed at this time.'
            },
            IMPORT: {
                NOTE: 'Select the CSV file to be submitted. Make sure the file is in the correct format.',
                SETUP_SAVED: 'Setup changes were successfully saved.',
                ERROR: {
                    MISSING_VRN: 'Please enter a VAT Registration No.',
                    MISSING_PERIOD_TYPE: 'Please select the VAT Reporting Period.',
                    MISSING_TAX_PERIOD: 'Please select tax period.',
                    INVALID_TAX_PERIOD: 'The tax period you selected does not match your VAT Reporting period.'
                }
            }
        },
        SCRIPT: {
        	ONLINE_FILING_IMPORT: 'customscript_online_filing_import_su'
        },
        DEPLOY: {
        	ONLINE_FILING_IMPORT: 'customdeploy_online_filing_import_su'
        },
        TIME: {
            MINUTES: 60
        }
    };
});
