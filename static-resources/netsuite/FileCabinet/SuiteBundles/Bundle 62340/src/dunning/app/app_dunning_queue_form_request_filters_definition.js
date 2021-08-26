/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningQueueFormRequestFiltersDefinition = function DunningQueueFormRequestFiltersDefinition () {
  var requestFiltersDefinitionList = [];

  var ALLOW_EMAIL_FORMULA = 'CASE WHEN {custrecord_3805_eval_result_source_type}=\'customer\' ' +
    'THEN {custrecord_3805_evaluation_result_cust.custentity_3805_dunning_letters_toemail} ' +
    'ELSE {custrecord_3805_eval_result_invoice_list.custbody_3805_dunning_letters_toemail} END';

  // var ALLOW_PRINT_FORMULA = 'CASE WHEN {custrecord_3805_eval_result_source_type}=\'customer\' ' +
  //   'THEN {custrecord_3805_evaluation_result_cust.custentity_3805_dunning_letters_toprint} ' +
  //   'ELSE {custrecord_3805_eval_result_invoice_list.custbody_3805_dunning_letters_toprint} END'

  var LAST_LETTER_SENT_FORMULA = 'CASE WHEN {custrecord_3805_eval_result_source_type}=\'customer\' ' +
    'THEN {custrecord_3805_evaluation_result_cust.custentity_3805_last_dunning_letter_sent} ' +
    'ELSE {custrecord_3805_eval_result_invoice_list.custbody_3805_last_dunning_letter_sent} END';

  var decodeURIComp = function decodeURIComp (uriComp) {
    var formatter = new suite_l10n.string.StringFormatter(uriComp);
    formatter.decodeURIComponent();
    return formatter.toString();
  };

  var processLastLetterSentTo = function processLastLetterSentTo (lastLetterSent) {
    var decodedDate = decodeURIComp(lastLetterSent);
    var lastLetterSentDate = ns_wrapper.Date.stringToDate(decodedDate);

    var lastLetterSentDateVl = new ns_wrapper.Date(lastLetterSentDate);
    lastLetterSentDateVl.addDays(1);

    return lastLetterSentDateVl.toString();
  };

  // Customer
  var dqfDefinition = new dunning.view.DunningQueueFormRequestFiltersDefinition();
  dqfDefinition.requestParameter = 'cust';
  dqfDefinition.operator = 'anyof';
  dqfDefinition.colName = 'custrecord_3805_evaluation_result_cust';
  dqfDefinition.fieldId = 'custpage_3805_dunning_qf_cust';
  requestFiltersDefinitionList.push(dqfDefinition);

  // Recipient
  dqfDefinition = new dunning.view.DunningQueueFormRequestFiltersDefinition();
  dqfDefinition.requestParameter = 'recp';
  dqfDefinition.operator = 'anyof';
  dqfDefinition.colName = 'custrecord_3805_evaluation_result_entity';
  dqfDefinition.fieldId = 'custpage_3805_dunning_qf_recp';
  requestFiltersDefinitionList.push(dqfDefinition);

  // Level
  dqfDefinition = new dunning.view.DunningQueueFormRequestFiltersDefinition();
  dqfDefinition.requestParameter = 'lvl';
  dqfDefinition.operator = 'is';
  dqfDefinition.join = 'custrecord_3805_evaluation_result_level';
  dqfDefinition.colName = 'name';
  dqfDefinition.fieldId = 'custpage_3805_dunning_qf_dp_lvl';
  requestFiltersDefinitionList.push(dqfDefinition);

  // Dunning Procedure
  dqfDefinition = new dunning.view.DunningQueueFormRequestFiltersDefinition();
  dqfDefinition.requestParameter = 'dp';
  dqfDefinition.operator = 'anyof';
  dqfDefinition.colName = 'custrecord_3805_evaluation_result_dp';
  dqfDefinition.fieldId = 'custpage_3805_dunning_qf_dp';
  requestFiltersDefinitionList.push(dqfDefinition);

  // Applies To
  dqfDefinition = new dunning.view.DunningQueueFormRequestFiltersDefinition();
  dqfDefinition.requestParameter = 'app';
  dqfDefinition.operator = 'anyof';
  dqfDefinition.join = 'custrecord_3805_evaluation_result_dp';
  dqfDefinition.colName = 'custrecord_3805_dp_type';
  dqfDefinition.fieldId = 'custpage_3805_dunning_qf_app_to';
  requestFiltersDefinitionList.push(dqfDefinition);

  // Allow Print
  dqfDefinition = new dunning.view.DunningQueueFormRequestFiltersDefinition();
  dqfDefinition.requestParameter = 'pr';
  dqfDefinition.operator = 'is';
  dqfDefinition.colName = 'formulatext';
  dqfDefinition.colFormula = ALLOW_EMAIL_FORMULA;
  dqfDefinition.fieldId = 'custpage_3805_dunning_qf_allow_print';
  requestFiltersDefinitionList.push(dqfDefinition);

  // Allow Email
  dqfDefinition = new dunning.view.DunningQueueFormRequestFiltersDefinition();
  dqfDefinition.requestParameter = 'em';
  dqfDefinition.operator = 'is';
  dqfDefinition.colName = 'formulatext';
  dqfDefinition.colFormula = ALLOW_EMAIL_FORMULA;
  dqfDefinition.fieldId = 'custpage_3805_dunning_qf_allow_email';
  requestFiltersDefinitionList.push(dqfDefinition);

  // Last Letter Sent From
  dqfDefinition = new dunning.view.DunningQueueFormRequestFiltersDefinition();
  dqfDefinition.requestParameter = 'llsf';
  dqfDefinition.operator = 'onorafter';
  dqfDefinition.colName = 'formuladate';
  dqfDefinition.colFormula = LAST_LETTER_SENT_FORMULA;
  dqfDefinition.fieldId = 'custpage_3805_dunning_qf_lls_from';
  dqfDefinition.postProcess = decodeURIComp;
  requestFiltersDefinitionList.push(dqfDefinition);

  // Last Letter Sent To
  dqfDefinition = new dunning.view.DunningQueueFormRequestFiltersDefinition();
  dqfDefinition.requestParameter = 'llst';
  dqfDefinition.operator = 'before';
  dqfDefinition.colName = 'formuladate';
  dqfDefinition.colFormula = LAST_LETTER_SENT_FORMULA;
  dqfDefinition.fieldId = 'custpage_3805_dunning_qf_lls_to';
  dqfDefinition.postProcess = processLastLetterSentTo;
  requestFiltersDefinitionList.push(dqfDefinition);

  // Evaluation Date From
  dqfDefinition = new dunning.view.DunningQueueFormRequestFiltersDefinition();
  dqfDefinition.requestParameter = 'evdf';
  dqfDefinition.operator = 'onorafter';
  dqfDefinition.colName = 'created';
  dqfDefinition.postProcess = decodeURIComp;
  dqfDefinition.fieldId = 'custpage_3805_dunning_qf_ev_date_from';
  requestFiltersDefinitionList.push(dqfDefinition);

  // Evaluation Date To
  dqfDefinition = new dunning.view.DunningQueueFormRequestFiltersDefinition();
  dqfDefinition.requestParameter = 'evdt';
  dqfDefinition.operator = 'onorbefore';
  dqfDefinition.colName = 'created';
  dqfDefinition.postProcess = decodeURIComp;
  dqfDefinition.fieldId = 'custpage_3805_dunning_qf_ev_date_to';
  requestFiltersDefinitionList.push(dqfDefinition);

  return requestFiltersDefinitionList;
};
