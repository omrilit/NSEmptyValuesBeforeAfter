/**
 * Copyright © 2014, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.Translation = TAF.Translation || {};
 
TAF.Translation.en = TAF.Translation.en || {
    Culture: 'en',
    Strings: {
        FORM_TITLE: 'Audit Files',
        GENERATE: 'Generate',
        RESET: 'Reset',
        REPORT_FIELD_LABEL: 'Report',
        REPORT_FIELD_HELP: 'Select the tax audit file export format to generate.',
        SUB_FIELD_LABEL: 'Subsidiary',
        SUB_FIELD_HELP: 'Select which subsidiary data will be included in the tax audit file to be generated. Available only in OneWorld.',
        GROUP_FIELD_LABEL: 'Group',
        GROUP_FIELD_HELP: [
            'In some countries, group reporting or the ability to have the parent consolidate the reports for its subsidiaries',
            'is allowed. Check this box to enable group reporting. Available only in OneWorld.'
        ].join(' '),
        STARTPERIOD_FIELD_LABEL: 'Period',
        STARTPERIOD_FIELD_HELP: 'Select the period range to be included in the data export. This is based on accounting periods.',
        ENDPERIOD_FIELD_LABEL: 'To',
        ENDPERIOD_FIELD_HELP: 'Select the period range to be included in the data export. This is based on accounting periods.',
        ACCOUNTING_CONTEXT_FIELD_LABEL : 'Accounting Context',
        ACCOUNTING_CONTEXT_FIELD_HELP : 'Select the applicable accounting context for the report.',
        ENGINE_OPTION_LABEL : 'Use New Tax Audit File Reports Engine',
        ENGINE_OPTION_HELP : 'Check this box if you want to use the new Tax Audit File reports engine instead of the existing engine.  Note: The new reports engine runs as a scheduled script and may take a while to process. The report is still available through the download link on the Tax Audit File page.',
        ACCOUNTING_BOOK_FIELD_LABEL: 'Accounting Book',
        ACCOUNTING_BOOK_FIELD_HELP: 'Select the applicable accounting book context for the report.',
        POSTING_DATE_LABEL: 'Use Transaction Date',
        POSTING_DATE_FIELD_HELP: 'Check this box to use the Transaction Date as the Ecriture Date in the FEC file.',
        YES: 'Yes',
        NO: 'No',
        DELETED: 'Deleted',
        CANCELLED: 'Cancelled',
        REMOVED: 'Removed',
        GENERATED: 'Generated',
        DOWNLOADED: 'Downloaded',
        
        // Audit Files tab
        JOB_SUBLIST_SUBTAB: 'Audit Files',
        JOB_SUBLIST_CREATEDATE: 'Date Created',
        JOB_SUBLIST_CREATOR: 'Created By',
        JOB_SUBLIST_REPORT: 'Report',
        JOB_SUBLIST_SUB: 'Subsidiary',
        JOB_SUBLIST_ISGROUPED: 'Grouped',
        JOB_SUBLIST_PERIOD: 'Period',
        JOB_SUBLIST_DOWNLOAD: 'Download',
        JOB_SUBLIST_FAILED: 'Failed',
        JOB_SUBLIST_DELETE: 'Delete',
        JOB_SUBLIST_CANCEL: 'Cancel',
        JOB_SUBLIST_REMOVE: 'Remove',
        JOB_SUBLIST_GROUPED: 'grouped',
        JOB_SUBLIST_ACCOUNTING_BOOK: 'Accounting Book',
        JOB_SUBLIST_ACCOUNTING_CONTEXT: 'Accounting Context',
        
        // System Notes tab
        LOG_SUBLIST_SUBTAB: 'System Notes',
        LOG_SUBLIST_DATE: 'Date',
        LOG_SUBLIST_USER: 'User',
        LOG_SUBLIST_ACTION: 'Action',
        LOG_SUBLIST_FILENAME: 'Filename',
        
        // Form messages
        MSG_DISCLAIMER: [
            'Important: By using the NetSuite Tax Audit Files Bundle, you assume all responsibility for determining',
            'whether the data you generate and download is accurate or sufficient for your purposes.  You also assume',
            'all responsibility for the security of any data that you download from NetSuite and subsequently store',
            'outside of the NetSuite system.'
        ].join(' '),
        MSG_ALERT_QUEUED_TITLE: 'Confirmation',
        MSG_ALERT_QUEUED: [
            'Your request has been added to the queue. An email message will be sent to your account after the requested',
            'file has been successfully generated.'
        ].join(' '),
        MSG_ALERT_BUSY_TITLE: 'Unable to generate an audit file',
        MSG_ALERT_BUSY: 'Other audit files are currently being generated. Please try again later.',
        MSG_NO_DATA: 'No data available',
        MSG_CONFIRM_DELETE: 'Are you sure?',
        MSG_PERIOD_NOT_CHRONOLOGICAL: 'End period cannot be earlier than the start period.',
        
        // Email notification
        EMAIL_SUCCESS_SUBJECT: 'NetSuite Tax Audit File Export Notification [Successful]',
        EMAIL_SUCCESS_BODY: [
            'Greetings from NetSuite!\n\nThank you for using the Tax Audit Files Generator.  Here is the status of',
            'your data export:\n\nDate and time of export: {dateCreated}\nDate range of data export: {dateRange}\nReport:',
            '{reportName}\nFilename: {filename}\n\nThe Audit File was successfully generated.\n\nThe file can be downloaded',
            'at:\n{reportUrl}\n\nYou can also find the data export at the Tax Audit Files report page.\n\nSincerely,\nThe',
            'NetSuite Staff\n\n\n***PLEASE DO NOT RESPOND TO THIS MESSAGE***'
        ].join(' '),
        EMAIL_FAILED_SUBJECT: 'NetSuite Tax Audit File Export Notification [Failed]',
        EMAIL_FAILED_BODY: [
            'Greetings from NetSuite!\n\nThank you for using the Tax Audit Files Generator. Here is the status of your',
            'data export:\n\nDate and time of export: {dateCreated}\nDate range of data export: {dateRange}\nReport:',
            '{reportName}\n\nThe Audit File export failed:\n{errorMessage}\n\n1.  Please go to the Tax Audit Files',
            'report page and look for your data export.\n2.  Please check the parameters of your data export such as',
            'the date range to make sure they are correct.\n3.  If you are still getting an error, please contact support',
            'through your normal support channels for more information on how to resolve this error.\n4.  You can also',
            'choose to delete the failed data export file to remove it from the list.\n\nSincerely,\nThe NetSuite Staff\n\n\n***PLEASE',
            'DO NOT RESPOND TO THIS MESSAGE***'
        ].join(' '),
        
        // Audit Files generation: validation  error messages
         ERR_UNASSIGNED_PERIODS: [
		    'The report cannot be generated because either the selected period is unassigned or the subsidiary\'s fiscal calendar contains unassigned periods.\n',
			'To add unassigned periods to accounting period rollups:\n',
			'1.	On the Manage Accounting Periods page, select a fiscal calendar and check for unassigned periods.\n',
			'2.	Click an unassigned period to edit.\n',
			'3.	On the Edit Accounting Period page, assign the period to a sub-period for each fiscal calendar that exists.\n',
			'4.	Click Save.\n\n',
			'For more information, read the help topic, Using Fiscal Calendars at:\n',
			'{usingFiscalCalendarHelpUrl}\n'
		].join(' '),
        ERR_UNASSIGNED_PERIODS_URL: '/app/help/helpcenter.nl?fid=section_N1449211.html',
        ERR_CURRENCY_CHECK: 'One or more child subsidiaries have a different currency than the selected subsidiary: {subsidiaries}.',
        ERR_FR_SAFT_BLANK_GL_NO: 'Download failed. Please run GL Numbering Sequences.',
        ERR_FR_SAFT_GL_AUDIT_NUMBERING_IS_OFF: [
            'Please enable the GL Audit Numbering feature and run GL Numbering Sequences. To enable GL Audit Numbering,',
            'go to Setup > Company > Enable Features and check the GL Audit Numbering box on the Accounting subtab.'
        ].join(' '),
        MX_DIOT_NO_CLEARED_TXNS: [
            'Only cleared transactions are included in the DIOT report. The period you selected does not have any cleared',
            'transactions. Be sure to reconcile transactions before generating the DIOT report.'
        ].join(' '),
        
        // Statutory Chart of Accounts
        SCOA_FORM_TITLE: 'Statutory Chart of Accounts',
        SCOA_EDIT_BUTTON: 'Edit',
        SCOA_CANCEL_BUTTON: 'Cancel',
        SCOA_SUBSIDIARY_FILTER: 'Subsidiary',
        SCOA_SUBSIDIARY_FILTER_HELP: 'Select the subsidiary you want to create the statutory chart of accounts for.',
        SCOA_ACCOUNT_TYPE_FILTER: 'Account Type',
        SCOA_ACCOUNT_TYPE_FILTER_HELP: 'Use this field to filter the accounts that will appear on this page.',
        SCOA_ACCOUNT_TYPE_ALL: '- All -',
        SCOA_SUBLIST_NAME: 'Chart of Accounts',
        SCOA_ACCOUNT_COLUMN: 'Account',
        SCOA_NUMBER_COLUMN: 'Account Number',
        SCOA_NAME_COLUMN: 'Account Name',
        SCOA_CONFIRMATION: 'Confirmation',
        SCOA_ERROR: 'Error',
        SCOA_RELOAD_WARNING_MESSAGE: 'Data you entered on this page has not been saved and will be lost. Press OK to proceed.',
        SCOA_SAVE_CONFIRMATION_MESSAGE: 'Statutory Chart of Accounts successfully Saved.',
        SCOA_SAVE_ERROR_MESSAGE: 'Some changes were not saved. Please refresh the page.',

        SCOA_DEPRECATION_MESSAGE: [
            'Notice: The Statutory Chart of Accounts feature in the Tax Audit Files SuiteApp will be deprecated in a future ',
            'version of NetSuite. Details of when this change takes effect will be communicated to you, when a definite release ',
            'date has been set. In preparation for this change, you must start using Accounting Contexts to define the ',
            'country-specific account names and numbers to include in the tax audit file. For more information, see '
        ].join(''),
        
        SCOA_SETUP_ACCT_CONTEXT_LABEL: 'Setting Up Accounting Contexts',
        
        // TAF Mapper
        MAPPER_FORM_TITLE: 'Audit Files Field Mapping',
        MAPPER_EDIT_BUTTON: 'Edit',
        MAPPER_CANCEL_BUTTON: 'Cancel',
        MAPPER_SUBLIST_NAME: 'Mapping',
        MAPPER_CATEGORY_LABEL: 'Category',
        MAPPER_TO_LABEL: 'Value',
        MAPPER_SAVE_SUCCESSFUL: 'Saved successfully.',
        MAPPER_SAVE_ERROR: 'Some changes were not saved. Please refresh the page.',
        MAPPER_SUCCESS: 'Confirmation',
        MAPPER_ERROR: 'Error',
        MAPPER_RELOAD_WARNING_MESSAGE: 'Data you entered on this page has not been saved and will be lost. Press OK to proceed.',
        MAPPER_IMPORT_HELP_VIEWONLY_URL: 'DOC_section_4252635509',
        MAPPER_IMPORT_HELP_VIEWONLY_TXT: 'Click here for Field Mapping for Mexico help topic.',
        
        // UI Field Labels
        TAF_MAPPING_BANK: 'Bank',
        TAF_MAPPING_PAYMENT_METHOD: 'Payment Method',
        TAF_MAPPING_ACCOUNT_TYPE: 'Account Type',
        TAF_MAPPING_ACCOUNT: 'Account',
        TAF_MAPPING_SUBSIDIARY: 'Subsidiary',
        TAF_MAPPING_TRANSACTION_TYPE: 'Transaction Type',
        TAF_MAPPING_POLICY_TYPE: 'Policy',
        
        //France SAFT
        GENERAL_LEDGER: 'General Ledger',
		
        //Spain SII
        SII_RETROACTIVE_DESCRIPTION: 'Register from first half of year'
    }
};
