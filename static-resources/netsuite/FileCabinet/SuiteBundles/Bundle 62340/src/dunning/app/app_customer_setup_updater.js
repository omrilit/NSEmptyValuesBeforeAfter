/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.CustomerSetupUpdater = function CustomerSetupUpdater () {
  var CUSTOMER = 'customer';
  var FIELD_MAP = {
    'allowByEmail': 'custentity_3805_dunning_letters_toemail',
    'allowByPrint': 'custentity_3805_dunning_letters_toprint',
    'dontSendToCustomer': 'custentity_3805_exclude_comp_email'
  };

  /**
   * Update dunning setup values for the following fields if they are included in the parameters
   * Allow Letters to be Emailed
   * Allow Letters to be Printed
   * Do not Send Letters to Customer Email
   *
   * @param {string} id - Customer ID
   * @param {Object} params - update parameters for dunning setup
   */
  this.updateCustomer = function updateCustomer (id, params) {
    var fields = [];
    var values = [];

    for (var i in params) {
      var fieldName = FIELD_MAP[i];
      if (fieldName && params[i]) {
        fields.push(fieldName);
        values.push(params[i]);
      }
    }

    var custDAO = new dao.DunningCustomerDAO();
    var model = custDAO.retrieve(id);
    model.excludeCompanyEmail = params.dontSendToCustomer;
    model.sendByEmail = params.allowByEmail;
    model.sendByPrint = params.allowByPrint;
    custDAO.update(model);

    return {
      recordType: CUSTOMER,
      id: id,
      fields: fields,
      values: values
    };
  };
};
