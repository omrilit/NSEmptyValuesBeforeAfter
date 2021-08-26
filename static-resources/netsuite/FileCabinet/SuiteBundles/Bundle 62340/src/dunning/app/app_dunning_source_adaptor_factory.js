/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

/**
 * @param {string} className
 * @returns {(suite_l10n.customer.DunningCustomerAdaptor|suite_l10n.invoice.DunningInvoiceAdaptor)}
 * @throws {ReferenceError}
 */
dunning.app.DunningSourceAdaptorFactory = function (className) {
  var constructor = Function('return this.' + className)();

  if (!constructor) {
    throw ReferenceError('Undefined class ' + className);
  }

  return new constructor();
};
