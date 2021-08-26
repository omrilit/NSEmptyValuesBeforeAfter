/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var ns_wrapper = ns_wrapper || {};
ns_wrapper.api = ns_wrapper.api || {};
ns_wrapper.api.config = ns_wrapper.api.config || {};

ns_wrapper.api.config.Configuration = function Configuration (type) {
  var configObj = nlapiLoadConfiguration(type);

  this.getFieldValue = function getFieldValue (name) {
    return configObj.getFieldValue(name);
  };
};
