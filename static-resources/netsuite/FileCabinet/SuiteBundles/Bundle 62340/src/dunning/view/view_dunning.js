/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.view = dunning.view || {};
dunning.model = dunning.model || {};

var dao = dao || {};

dunning.view.CUSTOMER = 'customer';
dunning.view.INVOICE = 'invoice';
dunning.view.L10N_VAR_CUSTOM_RECORD = 'customrecord_suite_l10n_variable';
dunning.view.L10N_VAR_VALUE = 'custrecord_3805_variable_value';
dunning.view.DUNNING_PROCEDURE_CUSTOM_RECORD = 'customrecord_3805_dunning_procedure';
dunning.view.DUNNING_PROCEDURE_SOURCE = 'custrecord_3805_dp_type';
dunning.view.DUNNING_PROCEDURE_SUB = 'custrecord_3805_dp_sub';
dunning.view.DUNNING_PROCEDURE_DEPT = 'custrecord_3805_dp_dept';
dunning.view.DUNNING_PROCEDURE_LOC = 'custrecord_3805_dp_locations';
dunning.view.DUNNING_PROCEDURE_CLASS = 'custrecord_3805_dp_classes';
dunning.view.DUNNING_PROCEDURE_PRIORITY = 'custrecord_3805_dp_weighting';
dunning.view.DUNNING_PROCEDURE_SAVED_SEARCH_CUSTOMER = 'custrecord_3805_dp_cust_search';
dunning.view.DUNNING_PROCEDURE_SAVED_SEARCH_INVOICE = 'custrecord_3805_dp_invoice_search';
dunning.view.DUNNING_PROCEDURE_DEFAULT_DUNNING_MANAGER = 'custrecord_3805_default_dunning_manager';
dunning.view.DUNNING_EVAL_RESULT_CUSTOM_RECORD = 'customrecord_3805_dunning_eval_result';
dunning.view.DUNNING_EVAL_RESULT_STATUS = 'custrecord_3805_eval_result_status';
dunning.view.AUTO_ASSIGNMENT_SEARCH = 'customsearch_3805_dp_auto_assignment';

dunning.view.BULK_ASSIGNMENT_DUNNING_PROCEDURE_ID = 'custpage_3805_dunning_procedure';
dunning.view.BULK_ASSIGNMENT_RECORD_TYPE = 'custpage_3805_dunning_source';

dunning.view.BULK_ASSIGNMENT_CLASS_MAP = {};
dunning.view.BULK_ASSIGNMENT_CLASS_MAP[dunning.view.CUSTOMER] = {
  dao: dao.DunningCustomerDAO,
  model: dunning.model.DunningCustomer,
  pluginImpl: 'customscript_3805_bulk_assignment_cust',
  sublist: 'custpage_3805_customer_sublist'
};
dunning.view.BULK_ASSIGNMENT_CLASS_MAP[dunning.view.INVOICE] = {
  dao: dao.DunningInvoiceDAO,
  model: dunning.model.DunningInvoice,
  pluginImpl: 'customscript_3805_bulk_assignment_invc',
  sublist: 'custpage_3805_invoice_sublist'
};

dunning.view.DunningTemplate = function () {
  this.id = null;
  this.name = null;
  this.description = null;
  this.attachStatement = null;
  this.attachCopiesOfInvoices = null;
  this.onlyOpenInvoicesOnTheStatement = null;
  this.onlyOverdueInvoices = null;
  this.dunningTemplateDocument = null;
  this.dunningCRMTemplate = null;
};

dunning.view.DunningTemplateDocument = function () {
  this.id = null;
  this.name = null;
  this.locale = null;
  this.language = null;
  this.subject = null;
  this.headerDocument = null;
  this.bodyDocument = null;
  this.footerDocument = null;
  this.default = null;
  this.dunningTemplateParent = null;
};

dunning.view.DunningCRMTemplate = function () {
  this.id = null;
  this.name = null;
  this.locale = null;
  this.language = null;
  this.emailTemplate = null;
  this.default = null;
  this.dunningCRMTemplateEmailParent = null;
};

dunning.view.RenderedTemplate = function () {
  this.message = null;
  this.subject = null;
};

dunning.view.ViewDunningMessageInput = function () {
  this.dunningManager = null;
  this.email = null;
  this.subject = null;
  this.body = null;
  this.source = null;
  this.sendDate = null;
  this.attachments = null;
  this.recordAttachments = null;
};

dunning.view.ViewDunningContact = function () {
  this.id = null;
  this.email = null;
  this.source = null;
  this.dunningManager = null;
};

dunning.view.DunningLevelAssessmentInput = function () {
  this.internalid = null;
  this.recordType = null;
  this.procedure = null;
  this.level = null;
  this.daysOverdue = null;
  this.lastSentDate = null;
  this.dunningPaused = null;
  this.override = null;
  this.invoices = [];
  this.customer = null;
  this.parentDPOverride = null;
};

dunning.view.DunningLevel = function () {
  this.id = null;
  this.name = null;
  this.procedureID = null;
  this.daysOverdue = null;
  this.minOutstandingAmount = null;
  this.templateId = null;
  this.currency = null;
};

dunning.view.DunningProcedure = function () {
  this.id = null;
  this.name = null;
  this.description = null;
  this.dunningSource = null;
  this.sendingSchedule = null;
  this.daysBetweenSendingLetters = null;
  this.subsidiaries = null;
  this.savedSearchCustomer = null;
  this.savedSearchInvoice = null;
  this.weighting = null;
  this.allowOverride = null;
  this.departments = null;
  this.classes = null;
  this.locations = null;
  this.preferredLanguage = null;
  this.assignAutomatically = null;
  this.currency = null;
  this.dunningManager = null;
};

dunning.view.BulkAssignerData = function () {
  this.dao = null;
  this.modelClass = null;
  this.recordIdsToUpdate = [];
  this.dunningProcedureId = null;
  this.dunningManagerId = null;
};

dunning.view.DunningProcedurePriority = function () {
  this.priorityListId = null;
  this.priorityFieldName = null;
  this.priorityNumber = null;
};

dunning.view.DunningAssignmentCustomerSubListRow = function () {
  this.id = null;
  this.customer = null;
  this.assign_dunning = null;
  this.subsidiary = null;
  this.dunning_procedure = null;
  this.dunning_level = null;
  this.dunning_letter_sent = null;
  this.dunning_sending_type = null;
};

dunning.view.DunningAssignmentInvoiceSubListRow = function () {
  this.id = null;
  this.customer = null;
  this.assign_dunning = null;
  this.invoice = null;
  this.totalamount = null;
  this.currency = null;
  this.duedate = null;
  this.daysoverdue = null;
  this.dunning_procedure = null;
  this.dunning_level = null;
  this.dunning_letter_sent = null;
  this.dunning_sending_type = null;
};

dunning.view.DunningAssignmentRecordRowLink = function () {
  this.recordType = null;
  this.recordId = null;
  this.text = null;
};

dunning.view.BulkAssignmentParameters = function () {
  this.dao = null;
  this.modelClass = null;
  this.recordIdsToUpdate = [];
  this.dunningProcedureId = null;
  this.dunningManagerId = null;
};

dunning.view.DunningAssignInput = function () {
  this.recordId = null;
  this.type = null;
  this.subsidiary = null;
  this.classification = null;
  this.location = null;
  this.department = null;
};

dunning.view.DunningAssignResult = function () {
  this.dunningProcedure = null;
};

dunning.view.DunningAssignResultHandlerInput = function () {
  this.recordId = null;
  this.dunningProcedureList = null;
  this.requestDetails = null;
};

dunning.view.DunningCustomer = function () {
  this.id = null;
  this.language = null;
  this.sendByEmail = null;
  this.sendByPrint = null;
  this.isDunningPaused = null;
  this.lastSentDate = null;
  this.dunningProcedureId = null;
  this.dunningLevelId = null;
  this.dunningManager = null;
  this.email = null;
  this.source = null;
  this.recordType = null;
  this.subsidiary = null;
};

dunning.view.DunningInvoice = function () {
  this.sendByEmail = null;
  this.sendByPrint = null;
  this.isDunningPaused = null;
  this.lastSentDate = null;
  this.dunningProcedureId = null;
  this.dunningLevelId = null;
  this.dunningManager = null;
  this.status = null;
  this.substatus = null;
  this.subsidiary = null;
  this.classification = null;
  this.location = null;
  this.department = null;
  this.customer = null;
};

/**
 * @extends {suite_l10n.service.view.ServiceRequest}
 * @constructor
 */
dunning.view.DunningAssignmentServiceRequest = function () {
  var obj = new suite_l10n.service.view.ServiceRequest();
  obj.pluginId = 'customscript_3805_auto_assign_dp_search';
  return obj;
};

dunning.view.DunningEvaluationResult = function () {
  this.id = null;
  this.procedure = null;
  this.level = null;
  this.entity = null;
  this.assignedToCustomer = null;
  this.invoices = null;
  this.recipient = null;
  this.recipientEmail = null;
  this.subject = null;
  this.message = null;
  this.dunningManager = null;
  this.subsidiary = null;
  this.templateId = null;
  this.sourceType = null;
  /**
   * @type {string|null}
   */
  this.customer = null;
};

dunning.view.DunningQueueSubListRow = function () {
  this.id = null;
  this.view_link = null;
  this.customer = null;
  this.applies_to = null;
  this.dunning_procedure = null;
  this.dunning_level = null;
  this.last_letter_sent = null;
  this.to_email = null;
  this.to_print = null;
  this.evaluation_date = null;
  this.related_entity = null;
};

dunning.view.DunningQueueActionInput = function () {
  this.derIdList = [];
};

dunning.view.ProcedureCurrencyManagerInput = function () {
  this.type = null;
  this.oldRecord = null;
  this.newRecord = null;
  this.context = null;
  this.isOneWorld = null;
};

dunning.view.DunningLevelStatementGeneratorInput = function () {
  this.daysOverdue = 0;
  this.amount = 0;
  this.overdueBalance = 0;
};

dunning.view.DunningQueueFormDefinition = function () {
  this.title = null;
  this.savedSearch = null;
  this.buttons = [];
  this.script = null;
  this.formType = null;
  this.display = false;
  this.deploymentId = null;
  this.queueFilters = [];
  this.queueFilterFieldValues = null;
  this.dunningRole = null;
};

dunning.view.DunningEvalResultModelGeneratorDefinition = function () {
  this.entity = null;
  this.recipient = null;
  this.procedureId = null;
  this.levelId = null;
  this.invoices = null;
  this.contacts = null;
  this.templateId = null;
  this.sourceType = null;
  this.letterType = null;
  this.letterTypeValue = null;
  this.customer = null;
  this.dunningManager = null;
  this.excludeCustomer = null;
};

dunning.view.DunningConfiguration = function () {
  this.id = null;
  this.subsidiary = null;
  this.autoAssignForInvoices = true;
  this.autoAssignForCustomers = true;
};

dunning.view.DunningInvoiceForm = function () {
  this.id = null;
  this.customformid = null;
};

dunning.view.DunningCustomerStatementForm = function () {
  this.isOpenOnly = false;
  this.customformid = null;
  this.statementDate = 0;
  this.statementStartDate = null;
};

dunning.view.DunningQueueFilter = function () {
  this.filterFields = [];
  this.fieldGroup = null;
  this.applyFiltersButton = null;
};

dunning.view.DunningQueueFormInput = function () {
  this.queueFilters = [];
  this.queueFilterFieldValues = null;
  this.display = false;
  this.dunningRole = null;
};

dunning.view.DunningQueueFormRequestFiltersDefinition = function () {
  this.requestParameter = null;
  this.colName = null;
  this.colFormula = null;
  this.operator = null;
  this.join = null;
  this.postProcess = null;
  this.fieldId = null;
};
