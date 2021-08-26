/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */
var suite_l10n = suite_l10n || {};
suite_l10n.app = suite_l10n.app || {};

suite_l10n.app.SuiteletServiceRequest = function SuiteletServiceRequest () {
  var obj = new suite_l10n.app.BaseServiceRequest();

  obj.getServiceURL = function getServiceURL () {
    return nlapiResolveURL('SUITELET', 'customscript_suite_l10n_su_svc', 'customdeploy_suite_l10n_su_svc', false);
  };

  return obj;
};
