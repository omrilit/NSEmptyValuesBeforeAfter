/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

/* eslint space-before-function-paren: ["error", {"named": "never"}] */
/* eslint no-unused-vars: 0 */
// @formatter:off

function processRequest(request) {
  var processor = new dunning.app.DunningLevelEvaluationService(dunning.app.InvoiceDunningLevelEvaluator);
  return processor.processRequest(request);
}

// @formatter:on
