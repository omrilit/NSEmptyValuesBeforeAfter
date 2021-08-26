/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

/**
 * @param {string} className
 * @param {dunning.view.DunningLevelAssessmentInput} assessmentInput
 * @param {dunning.view.DunningLevel|null} newLevel
 * @returns {dunning.app.CustomerDunningResultCreator}
 * @throws {ReferenceError}
 */
dunning.app.DunningResultCreatorFactory = function (className, assessmentInput, newLevel) {
  var constructor = Function('return this.' + className)();

  if (!constructor) {
    throw ReferenceError('Undefined class ' + className);
  }

  return new constructor(assessmentInput, newLevel);
};
