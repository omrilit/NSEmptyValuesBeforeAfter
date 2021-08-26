/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.ss = dunning.component.ss || {};

dunning.component.ss.CustomerBulkUpdater = function CustomerBulkUpdater (usageLimit) {
  var BULK_UPDATE_COMPLETE_SUBJECT = 'dbu.customer.message.complete_subject';
  var BULK_UPDATE_COMPLETE_BODY_OW = 'dbu.customer.message.complete_body_ow';
  var BULK_UPDATE_COMPLETE_BODY_SI = 'dbu.customer.message.complete_body_si';
  var BULK_UPDATE_ERROR_HEADER = 'dbu.customer.message.error_file_header';
  var BULK_UPDATE_ERROR_STEPS = 'dbu.customer.message.error_steps';
  var BULK_UPDATE_ERROR_FILENAME = 'dbu.customer.message.error_filename';
  var ADMIN = -5;
  var BATCH = 'customrecord_dunning_bulk_batch';
  var STATUS = 'custrecord_3805_bulk_update_status';
  var PROCESSING = '2';
  var COMPLETED = '3';

  var NAME = 'entityid';
  var context = ns_wrapper.context();

  function getCustomerResultSet (params) {
    var search = new ns_wrapper.Search('customer');
    search.addColumn(NAME);
    if (context.isOW()) {
      search.addFilter('subsidiary', 'is', params.subsidiary);
    }

    search.addFilter('custentity_3805_dunning_procedure', 'noneof', '@NONE@');

    /**
     * These lines will be commented until we get benchmarking results.
     * Should we require optimization, we'll add filters to reduce the resultset
     */
    // if (params.allowByEmail) {
    // search.addFilter("custentity_3805_dunning_letters_toemail", "isnot", params.allowByEmail);
    // }
    //
    // if (params.allowByPrint) {
    // search.addFilter("custentity_3805_dunning_letters_toprint", "isnot", params.allowByPrint);
    // }
    //
    // if (params.dontSendToCustomer) {
    // search.addFilter("custentity_3805_exclude_comp_email", "isnot", params.dontSendToCustomer);
    // }
    return search.getIterator();
  }

  function encloseInQuotes (string) {
    var resultString = '';
    if (string.length > 0) {
      resultString = string.replace(/"/g, '\'');
      resultString = ['"', resultString, '"'].join('');
    }

    return resultString;
  }

  this.updateCustomers = function updateCustomers (customerResultSet, batch) {
    var id = batch.id;
    ns_wrapper.api.field.submitField(BATCH, id, STATUS, PROCESSING);
    var updater = new dunning.app.CustomerSetupUpdater();

    var scheduler = new ns_wrapper.Scheduler();

    var recordCount = 0;
    var failedRecords = 0;
    var errors = [];

    while (customerResultSet.hasNext()) {
      var curr = customerResultSet.next();
      recordCount++;
      if (context.getRemainingUsage() <= usageLimit) {
        scheduler.yieldScript();
      }

      try {
        updater.updateCustomer(curr.getId(), batch);
      } catch (ex) {
        failedRecords++;
        var errorDetails = ex.getDetails ? [ex.getCode(), ex.getDetails()].join(': ') : ex.toString();
        nlapiLogExecution('ERROR', 'Failed Updating ' + curr.getValue(NAME), errorDetails);
        errors.push([curr.getValue(NAME), encloseInQuotes(errorDetails)].join());
      }
    }

    ns_wrapper.api.field.submitField(BATCH, id, STATUS, COMPLETED);
    return {
      recordCount: recordCount,
      failedRecords: failedRecords,
      errors: errors
    };
  };

  function getErrorCSVFile (results, translator) {
    var errors = results.errors;
    var csvHeader = translator.getString(BULK_UPDATE_ERROR_HEADER);
    var fileName = translator.getString(BULK_UPDATE_ERROR_FILENAME);
    errors.splice(0, 0, csvHeader);
    return ns_wrapper.api.file.createFile(fileName, 'CSV', errors.join('\n'));
  }

  function sendNotification (params) {
    var results = params.results;
    var batch = params.batch;

    var language = context.getPreference('language');
    var translator = new ns_wrapper.Translator(language);

    var FIELD_VALUE_MAP = {
      '': translator.getString('dbu.form.options.unchanged'),
      'T': translator.getString('dbu.form.options.checked'),
      'F': translator.getString('dbu.form.options.not_checked')
    };

    var message = '';
    var messageParams = {
      'SUBSIDIARY': batch.subsidiaryName,
      'PROCESSED_RECORDS': results.recordCount - results.failedRecords,
      'FAILED_RECORDS': results.failedRecords,
      'RECORD_COUNT': results.recordCount,
      'ERROR_STEPS': '',
      'ALLOW_EMAIL': FIELD_VALUE_MAP[batch.allowByEmail || ''],
      'ALLOW_PRINT': FIELD_VALUE_MAP[batch.allowByPrint || ''],
      'DONT_SEND_TO_CUST': FIELD_VALUE_MAP[batch.dontSendToCustomer || '']
    };
    var subject = translator.getString(BULK_UPDATE_COMPLETE_SUBJECT);

    if (context.isOW()) {
      message = translator.getString(BULK_UPDATE_COMPLETE_BODY_OW);
    } else {
      message = translator.getString(BULK_UPDATE_COMPLETE_BODY_SI);
    }

    var emailSender = new ns_wrapper.EmailSender();

    if (results.failedRecords > 0) {
      emailSender.setAttachments(getErrorCSVFile(results, translator).getFile());
      messageParams.ERROR_STEPS = translator.getString(BULK_UPDATE_ERROR_STEPS);
    }

    var formatter = new suite_l10n.string.StringFormatter(message);
    formatter.replaceParameters(messageParams);
    message = formatter.toString();

    emailSender.send(ADMIN, batch.owner || ADMIN, subject, message);
  }

  this.processUpdates = function processUpdates (batch) {
    var customerResultSet = getCustomerResultSet(batch);
    var results = this.updateCustomers(customerResultSet, batch);
    var notifParams = {
      batch: batch,
      results: results
    };
    sendNotification(notifParams);
  };
};

dunning.bulkUpdateCustomers = function bulkUpdateCustomers () {
  var context = ns_wrapper.context();
  var usageLimit = context.getScriptSetting('custscript_3805_bulk_update_gov_limit') || 500;
  var batchDAO = new dao.DunningBulkUpdateBatchDAO();
  var updater = new dunning.component.ss.CustomerBulkUpdater(usageLimit);
  var batch;

  var scheduler = new ns_wrapper.Scheduler();
  do {
    if (context.getRemainingUsage() <= usageLimit) {
      scheduler.yieldScript();
    }

    batch = batchDAO.retrieveNextBatch();

    if (batch) {
      updater.processUpdates(batch);
    }
  } while (batch);
};
