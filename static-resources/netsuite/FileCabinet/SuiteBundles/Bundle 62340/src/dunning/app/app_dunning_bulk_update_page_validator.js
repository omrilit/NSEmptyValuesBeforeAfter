/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningBulkUpdatePageValidator = function DunningBulkUpdatePageValidator (messages) {
  var FieldAPI = ns_wrapper.api.field;
  var ProcessResult = suite_l10n.process.ProcessResult;

  var SUBSIDIARY_FIELD = 'custpage_3805_dunning_bulk_update_sub';
  var ALLOW_EMAIL_FIELD = 'custpage_3805_dunning_bulk_update_email';
  var ALLOW_PRINT_FIELD = 'custpage_3805_dunning_bulk_update_print';
  var DO_NOT_SENT_TO_CUST_FIELD = 'custpage_3805_dunning_bulk_dont_send_cust_mail';

  var TRANS_NO_SELECTION = 'dbu.validation.no_selection';
  var TRANS_NO_SENDING_MEDIA = 'dbu.validation.no_sending_media';
  var TRANS_CONCURRENCY_VALIDATION_OW = 'dbu.validation.validate_concurrency_ow';
  var TRANS_CONCURRENCY_VALIDATION_SI = 'dbu.validation.validate_concurrency_si';

  var NOT_CHECKED = 'F';

  var SUITELET = 'SUITELET';
  var BULK_UPDATE_SERVICE_SU_ID = 'customscript_3805_bulk_update_proc_svc';
  var BULK_UPDATE_SERVICE_DEPLOY_ID = 'customdeploy_3805_bulk_update_proc_svc';

  var UNDEFINED = 'undefined';
  var NULL = 'null';

  var context = ns_wrapper.context();

  this.validate = function validate () {
    var result = new ProcessResult();
    result.success = true;
    result.message = '';

    var allowEmail = FieldAPI.getFieldValue(ALLOW_EMAIL_FIELD);
    var allowPrint = FieldAPI.getFieldValue(ALLOW_PRINT_FIELD);
    var dontSendToCust = FieldAPI.getFieldValue(DO_NOT_SENT_TO_CUST_FIELD);

    /* No values for Bulk Update fields */
    if (!allowEmail && !allowPrint && !dontSendToCust) {
      result.success = false;
      result.message = messages[TRANS_NO_SELECTION];
      /* If no selection for sending via email or print */
    } else if (allowEmail == NOT_CHECKED && allowPrint == NOT_CHECKED) {
      result.success = false;
      result.message = messages[TRANS_NO_SENDING_MEDIA];
      /* verification of bulk update is ongoing */
    } else {
      result = checkBulkUpdateInProgress();
    }

    return result;
  };

  function checkBulkUpdateInProgress (subsidiary) {
    var subsidiary = FieldAPI.getFieldValue(SUBSIDIARY_FIELD);
    var subsidiaryText = FieldAPI.getFieldText(SUBSIDIARY_FIELD);

    var recObj;
    var result = {
      success: true,
      message: null
    };

    /* This prevents execution for OW without subsidiary, De Morgan's Laws, NOT(!subsidiary && isOW) */
    if (subsidiary || !context.isOW()) {
      var suiteletURL = ns_wrapper.api.url.resolveUrl(SUITELET, BULK_UPDATE_SERVICE_SU_ID, BULK_UPDATE_SERVICE_DEPLOY_ID);
      var params = {'subsidiary': subsidiary};
      var responseObj = ns_wrapper.api.url.requestUrlCs(suiteletURL, params);
      var responseBody = responseObj.getBody();

      if (responseBody && responseBody != UNDEFINED && responseBody != NULL) {
        recObj = JSON.parse(responseBody);

        var notification;
        if (context.isOW()) {
          notification = messages[TRANS_CONCURRENCY_VALIDATION_OW];
        } else {
          notification = messages[TRANS_CONCURRENCY_VALIDATION_SI];
        }

        var stringFormatter = new suite_l10n.string.StringFormatter(notification);
        var parameters = {
          USER: recObj.owner,
          SUBSIDIARY: subsidiaryText
        };
        stringFormatter.replaceParameters(parameters);
        notification = stringFormatter.toString();

        result.success = false;
        result.message = notification;
      }
    }
    return result;
  }
};
