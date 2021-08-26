/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope public
 */

define([], function () {
  'use strict';

  return {
    TYPE: {
      EVALUATION_RESULT: 'customrecord_3805_dunning_eval_result',
      JOB: 'customrecord_l10n_job',
      JOB_RULE: 'customrecord_l10n_job_rule',
      LEVEL: 'customrecord_3805_dunning_level',
      LOCALIZATION_VARIABLE: 'customrecord_suite_l10n_variable',
      TASK: 'customrecord_l10n_task',
      QUEUE_REQUEST: 'customrecord_3805_queue_request'
    },
    FIELD: {
      EVALUATION_RESULT: {
        ID: 'internalid',
        STATUS: 'custrecord_3805_eval_result_status',
        TYPE: 'custrecord_3805_eval_result_letter_type',
        CUSTOMER: 'custrecord_3805_evaluation_result_cust',
        LEVEL: 'custrecord_3805_evaluation_result_level',
        PROCEDURE: 'custrecord_3805_evaluation_result_dp',
        CREATED: 'created'
      },
      JOB: {
        NAME: 'name',
        STATUS: 'custrecord_l10n_job_state',
        RULE: 'custrecord_l10n_job_rule',
        START_DATE: 'custrecord_l10n_job_start_date',
        GOVERNANCE_USAGE: 'custrecord_l10n_job_gov_usage',
        DATA_COUNT: 'custrecord_l10n_data_count',
        RUN_NOW: 'custrecord_l10n_job_run_now'
      },
      JOB_PROPERTY: {
        NAME: 'name',
        VALUE: 'custrecord_l10n_job_prop_value',
        IS_DATA: 'custrecord_l10n_is_data'
      },
      JOB_RULE: {
        NAME: 'name'
      },
      LEVEL: {
        RULE: 'custrecord_3805_dl_rule'
      },
      LEVEL_RULE: {
        NAME: 'name'
      },
      LOCALIZATION_VARIABLE: {
        NAME: 'name',
        VALUE: 'custrecord_3805_variable_value',
        TYPE: 'custrecord_3805_variable_type'
      },
      QUEUE_REQUEST: {
        SCRIPT: 'custrecord_3805_queue_request_script',
        DEPLOYMENT: 'custrecord_3805_queue_request_deployment',
        DATA: 'custrecord_3805_queue_request_data',
        STATUS: 'custrecord_3805_queue_request_status'
      }
    },
    QUEUE_MODULE: {
      // Defines the number of Evaluation Records, that can be processed Synchronously from Dunning Queue.
      // All records above this number will be processed Asynchronously.
      // Average duration per send workflow was 1.28 s on Production at Friday 2014-03-17 16:00 CET
      SYNC_LIMIT: {
        EMAIL: 5,
        PDF: 0
      },
      SUITELET: {
        SCRIPT: 'customscript_3805_su_dunning_queue_ss2',
        DEPLOYMENT: {
          EMAIL: 'customdeploy_3805_dunning_queue_email',
          PDF: 'customdeploy_3805_dunning_queue_pdf'
        },
        PARAM: {
          PAGE: 'custpage_page_pagenumber',
          IDS: 'custscript_3805_mr_async_pending_ids',
          TYPE: 'custscript_3805_su_dunning_queue_type',
          MESSAGE: 'custpage_msg'
        }
      },
      ASYNC_PENDING: {
        SCRIPT: 'customscript_3805_mr_async_pending',
        PARAM: {
          IDS: 'custscript_3805_mr_async_pending_ids',
          TYPE: 'custscript_3805_mr_async_pending_type'
        }
      },
      ASYNC_REMOVE: {
        SCRIPT: 'customscript_3805_mr_async_remove',
        PARAM: {
          IDS: 'custscript_3805_mr_async_remove_ids',
          TYPE: 'custscript_3805_mr_async_remove_type'
        }
      },
      FILTER_PARAM: {
        CUSTOMER: 'custpage_filter_customer',
        SUBSIDIARY: 'custpage_filter_subsidiary',
        PROCEDURE: 'custpage_filter_dp',
        LEVEL: 'custpage_filter_dl',
        TARGET: 'custpage_filter_applyto',
        EVALUATION_START: 'custpage_filter_ev_start',
        EVALUATION_END: 'custpage_filter_ev_end',
        LETTER_START: 'custpage_filter_lls_start',
        LETTER_END: 'custpage_filter_lls_end',
        PAGE: 'custpage_page_pagenumber',
        SIZE: 'custpage_page_pagesize',
        URL: 'custpage_url',
        TYPE: 'custpage_type',
        TRANSLATIONS: 'custpage_translations'
      },
      PARAM: {
        PAGE: 'custpage_page_pagenumber',
        IDS: 'ev_result_ids',
        ACTION: 'action',
        TYPE: 'custscript_3805_su_dunning_queue_type'
      },
      ACTION: {
        PROCESS: 'process',
        REMOVE: 'remove'
      },
      SEARCH: {
        EMAIL: 'customsearch_3805_dunning_queue_send',
        PDF: 'customsearch_3805_dunning_queue_print'
      },
      STATUS: {
        PENDING: 'pending',
        REMOVED: 'removed'
      }
    },
    REQUEST_QUEUE: {
      SCRIPT: 'customscript_3805_ss_request_queue',
      DEPLOYMENT: 'customdeploy_3805_ss_request_queue'
    },
    REQUEST_QUEUE_STATUS: {
      PENDING: 'pending',
      DONE: 'done'
    },
    EMAIL_FIELDS_SU: {
      DUNNING_INVOICE_SEARCH: 'customsearch_base_dunning_invoice',
      SUITELET_SCRIPT: 'customscript_3805_su_add_email_field',
      SUITELET_DEPLOY: 'customdeploy_3805_add_email_field',
      FIELD_VALID: 'custparam_valid',
      VALIDATION: {
        VALID: 'T',
        DUPLICATE: 'N',
        NOT_VALID: 'F'
      },
      FIELDS: {
        SUBLIST: 'cuspage_sublist',
        SUBLIST_LABEL: 'custpage_sub_label',
        SUBLIST_ID: 'custpage_sub_id',
        FIELD_TO_ADD: 'custpage_field_to_add',
        TRANSLATIONS: 'custpage_translations'
      }
    }
  };
});
