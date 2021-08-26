/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

/**
 * @param {string} className
 * @param {Object} templateView
 * @returns {dunning.app.PDFTemplateBuilder}
 * @constructor
 */
dunning.app.createTemplateBuilder = function (className, templateView) {
  var constructor = Function('return this.' + className)();

  if (!constructor) {
    throw ReferenceError('Undefined class ' + className);
  }

  return new constructor(templateView);
};
