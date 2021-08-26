/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var suite_l10n = suite_l10n || {};
suite_l10n.services = suite_l10n.services || {};
suite_l10n.services.ss = suite_l10n.services.ss || {};

suite_l10n.services.ss.runScheduler = function runScheduler () {
  var scheduler = new suite_l10n.services.app.Scheduler();
  scheduler.runScheduler();
};
