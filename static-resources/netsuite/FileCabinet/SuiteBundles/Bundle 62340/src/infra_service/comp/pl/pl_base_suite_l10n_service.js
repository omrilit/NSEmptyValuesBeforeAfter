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
  var log = new ns_wrapper.Log();
  var stringFormatter = new suite_l10n.string.StringFormatter();

  log.debug('request', stringFormatter.stringify(request));
  var response = new suite_l10n.service.view.ServiceResponse();
  response.success = true;
  return response;
}

// @formatter:on
