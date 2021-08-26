/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This workflow action sends the email
 *
 * @author mmoya
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.wf = dunning.component.wf || {};

/**
 * @param {string} customerId
 * @returns {boolean}
 * @private
 */
dunning.component.wf.hasCustomerAllowedLetters = function (customerId) {
  var get = ns_wrapper.api.field.lookupField;
  return get('customer', customerId, 'custentity_3805_dunning_letters_toemail') == 'T';
};

/**
 * @param {string} customerId
 * @returns {boolean}
 * @private
 */
dunning.component.wf.canOverrideCustomer = function (customerId) {
  var get = ns_wrapper.api.field.lookupField;
  var procedure = get('customer', customerId, 'custentity_3805_dunning_procedure');
  return procedure && get('customrecord_3805_dunning_procedure', procedure, 'custrecord_3805_dp_override') == 'T';
};

/**
 * @param {string[]} invoices
 * @returns {boolean}
 * @private
 */
dunning.component.wf.hasInvoiceAllowedLetters = function (invoices) {
  var get = ns_wrapper.api.field.lookupField;
  return invoices && invoices.length > 0 &&
    get('invoice', invoices[0], 'custbody_3805_dunning_letters_toemail') == 'T';
};

/**
 * @param {dunning.view.DunningEvaluationResult} view
 * @returns {boolean}
 * @private
 */
dunning.component.wf.isSubmitAllowed = function (view) {
  return (view.sourceType == 'customer' &&
      dunning.component.wf.hasCustomerAllowedLetters(view.customer)) ||
    (view.sourceType == 'invoice' &&
      dunning.component.wf.canOverrideCustomer(view.customer) &&
      dunning.component.wf.hasInvoiceAllowedLetters(view.invoices));
};

/**
 * @param {dunning.app.DunningEvaluationResultConverter} converter
 * @param {dunning.app.DunningEmailManager} manager
 * @returns {function(nlobjRecord):string}
 * @private
 */
dunning.component.wf.createEmailSender = function (converter, manager) {
  return function (record) {
    var view = converter.castRecordToView(record);

    if (dunning.component.wf.isSubmitAllowed(view)) {
      return manager.sendEmail(manager.getEmailParameters(view), view.id);
    }

    return 'F';
  };
};

/**
 * @returns {string}
 * @public
 */
dunning.component.wf.sendEmail = function () {
  var converter = new dunning.app.DunningEvaluationResultConverter();
  var manager = new dunning.app.DunningEmailManager();
  var emailSender = dunning.component.wf.createEmailSender(converter, manager);

  return emailSender(nlapiGetNewRecord());
};
