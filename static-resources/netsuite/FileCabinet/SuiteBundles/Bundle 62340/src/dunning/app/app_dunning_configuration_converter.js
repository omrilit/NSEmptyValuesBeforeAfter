/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

/**
 * @constructor
 * @extends {suite_l10n.app.BaseConverter<dunning.model.DunningConfiguration, dunning.view.DunningConfiguration>}
 */
dunning.app.DunningConfigurationConverter = function () {
  var obj = new suite_l10n.app.BaseConverter({
    model: dunning.model.DunningConfiguration,
    view: dunning.view.DunningConfiguration,
    modelViewMap: {
      id: 'id',
      subsidiary: 'subsidiary',
      autoAssignForCustomers: 'autoAssignForCustomers',
      autoAssignForInvoices: 'autoAssignForInvoices'
    },
    recordModelMap: {
      internalid: 'id',
      custrecord_3805_config_subsidiary: 'subsidiary',
      custrecord_3805_auto_assign_customer: 'autoAssignForCustomers',
      custrecord_3805_auto_assign_invoice: 'autoAssignForInvoices'
    }
  });

  /**
   * @param {dunning.model.DunningConfiguration} model
   * @returns {dunning.view.DunningConfiguration}
   */
  obj.castToView = function (model) {
    var view = suite_l10n.app.BaseConverter.prototype.castToView.call(obj, model);
    view.autoAssignForCustomers = model.autoAssignForCustomers === 'T';
    view.autoAssignForInvoices = model.autoAssignForInvoices === 'T';
    return view;
  };

  return obj;
};
