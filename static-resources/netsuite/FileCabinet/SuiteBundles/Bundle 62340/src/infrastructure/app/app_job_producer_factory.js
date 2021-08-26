/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var infra = infra || {};
infra.app = infra.app || {};

/**
 * Factory that creates different types of Job Producers depending on the Job Rule setting
 * @param {model.JobRule} jobRule
 * @returns {*}
 * @throws {ReferenceError}
 */
infra.app.JobProducerFactory = function (jobRule) {
  var className = jobRule.jobProducerClass;
  var constructor = Function('return this.' + className)();

  if (!constructor) {
    throw ReferenceError('Undefined class ' + className);
  }

  return new constructor(jobRule);
};
