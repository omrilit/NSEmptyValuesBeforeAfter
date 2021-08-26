/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This workflow action retrieves the Dunning Evaluation Result and sends an email to the intended recipient.
 *
 * @author mmoya
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.wf = dunning.component.wf || {};

dunning.component.wf.DunningEvaluationResultProcessor = function () {
  var context = ns_wrapper.context();

  /**
   * @param {nlobjRecord} record
   */
  this.processResult = function (record) {
    if (context.getRemainingUsage() <= 6) {
      return;
    }

    var template = getTemplate(record);
    var templateBuilder = getTemplateBuilder(template);
    setTemplateRecords(record, templateBuilder);
    var renderedTemplate = templateBuilder.getRenderedTemplate();

    var message = renderedTemplate.message;
    var subject = renderedTemplate.subject;

    updateDunningEvaluationResultRecord(record, subject, message);
  };

  function getTemplateBuilder (template) {
    var templateBuilderClass = context.getScriptSetting('custscript_der_process_template_builder');
    return dunning.app.createTemplateBuilder(templateBuilderClass, template);
  }

  function getTemplate (record) {
    var templateId = record.getFieldValue('custrecord_3805_eval_result_template');
    var language = getLanguageId(record.getFieldValue('custrecord_3805_evaluation_result_cust'));
    var templateManagerClass = context.getScriptSetting('custscript_der_process_template_manager');

    var factory = new suite_l10n.app.factory.BasicFactory();
    var templateManager = factory.getInstance(templateManagerClass);
    return templateManager.getDunningTemplate(templateId, language);
  }

  function getLanguageId (customerId) {
    var isMultiLanguageOn = context.getFeature('multilanguage');
    var userPrefLang;

    if (isMultiLanguageOn) {
      userPrefLang = ns_wrapper.api.field.lookupField('customer', customerId, 'language');
    }
    return userPrefLang;
  }

  function updateDunningEvaluationResultRecord (record, subject, message) {
    var fields = ['custrecord_3805_eval_result_subject', 'custrecord_3805_eval_result_message'];
    var values = [subject, message];

    // update the record with the rendered message
    ns_wrapper.api.field.submitField(record.getRecordType(), record.getId(), fields, values, false);
  }

  function setTemplateRecords (record, templateBuilder) {
    var isCustomer = record.getFieldValue('custrecord_3805_eval_result_for_customer') == 'T';

    if (!isCustomer) {
      var contact = new ns_wrapper.Record('contact', record.getFieldValue('custrecord_3805_evaluation_result_entity')).getRawRecord();
      templateBuilder.addRecord('contact', contact);
    }

    var customer = new ns_wrapper.Record('customer', record.getFieldValue('custrecord_3805_evaluation_result_cust')).getRawRecord();
    templateBuilder.addRecord('customer', customer);

    var manager = new ns_wrapper.Record('employee', record.getFieldValue('custrecord_3805_eval_result_manager_id')).getRawRecord();
    templateBuilder.addRecord('employee', manager);

    setTemplateInvoices(record, templateBuilder);
  }

  function setTemplateInvoices (record, templateBuilder) {
    var isSourceCustomer = record.getFieldValue('custrecord_3805_eval_result_source_type') === 'customer';
    var invoiceList = record.getFieldValues('custrecord_3805_eval_result_invoice_list');

    if (invoiceList.length > 0) {
      // for customers, multiple invoices are expected
      if (isSourceCustomer) {
        // search for line items
        var invoiceSearch = new ns_wrapper.Search('invoice');
        invoiceSearch.setSavedSearchId('customsearch_base_dunning_invoice');
        invoiceSearch.addFilter('internalid', 'anyof', invoiceList);
        invoiceSearch.addFilter('mainline', 'is', 'T');
        invoiceSearch.addFilter('isreversal', 'is', 'F');

        var rs = invoiceSearch.getIterator();
        var results = [];
        while (rs.hasNext()) {
          results.push(rs.next());
        }

        templateBuilder.addSearchResults('invoicelist', results);
      } else {
        var r = new ns_wrapper.Record('invoice', invoiceList[0]);

        // daysoverdue is not available on record by default - let's calculate it
        var duedate = r.getFieldValue('duedate');
        var datesDiff = new Date() - ns_wrapper.Date.stringToDate(duedate);
        var dayOverdue = datesDiff <= 0 ? 0 : Math.floor(datesDiff / (1000 * 60 * 60 * 24));
        r.setFieldValue('daysoverdue', dayOverdue);

        templateBuilder.addRecord('invoice', r.getRawRecord());
      }
    }
  }
};

dunning.component.wf.processResult = function () {
  var processor = new dunning.component.wf.DunningEvaluationResultProcessor();

  try {
    processor.processResult(nlapiGetNewRecord());
  } catch (e) {
    if (e.getCode() === 'SSS_USAGE_LIMIT_EXCEEDED') {
      return; // it is safe
    }
    throw e;
  }
};
