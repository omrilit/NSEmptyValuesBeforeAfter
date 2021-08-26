/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var infra = infra || {};
infra.app = infra.app || {};

/**
 * @param {model.JobRule} jobRule
 * @returns {JobPlugin}
 * @throws {ReferenceError}
 */
infra.app.PluginFactory = function (jobRule) {
  var className = jobRule.pluginTypeClassSrc;
  var constructor = Function('return this.' + className)();

  if (!constructor) {
    throw ReferenceError('Undefined class ' + className);
  }

  return new constructor(jobRule.pluginImpl);
};
