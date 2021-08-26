/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author ldimayuga
 */

var suite_l10n = suite_l10n || {};
suite_l10n.is = suite_l10n.is || {};

suite_l10n.is.afterInstall = function () {
  var context = ns_wrapper.context();
  var config = new dunning.app.DunningConfigurationCreator();

  if (context.isOW()) {
    config.createSubsidiaryConfiguration();
  } else {
    config.createSIConfiguration(context.getSubsidiary());
  }
};

suite_l10n.is.onUpdate = suite_l10n.is.afterInstall;
