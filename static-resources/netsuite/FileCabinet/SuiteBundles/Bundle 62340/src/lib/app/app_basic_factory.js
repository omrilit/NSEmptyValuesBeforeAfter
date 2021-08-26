/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var suite_l10n = suite_l10n || {};
suite_l10n.app = suite_l10n.app || {};
suite_l10n.app.factory = suite_l10n.app.factory || {};

/*
 * Basic factory implementation. Factories to be made in the future should just use this as to prevent replication of
 * instance creation code.
 */
suite_l10n.app.factory.BasicFactory = function BasicFactory (params) {
  params = params || [];

  function getInstance (className, parameters) {
    var instanceCreationString = ['return new ', className, '(', params.join(), ');'].join('');
    var callback = new Function(params, instanceCreationString);

    return callback.apply(null, parameters);
  }

  return {
    getInstance: getInstance
  };
};
