/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.template_validator = dunning.template_validator || {};

dunning.template_validator.afterSubmit = function afterSubmit () {
  var xmlValidator = new dunning.app.DunningTemplateValidator();
  xmlValidator.validateTemplate(nlapiGetNewRecord());
};
