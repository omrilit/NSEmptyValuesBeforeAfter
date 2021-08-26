/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var suite_l10n = suite_l10n || {};
suite_l10n.request = suite_l10n.request || {};

suite_l10n.request.RequestAdapterFactory = function RequestAdapterFactory (adapterClassName) {
  function getRequestAdapter () {
    var method = ['return new ', adapterClassName, '()'].join('');
    var callback = new Function(method);
    return callback();
  }

  return {
    getRequestAdapter: getRequestAdapter
  };
};
