/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This suitelet is called via url request to retrieve a set of translated strings
 *
 * @author cboydon
 */

/**
 * @param {nlobjRequest} request Request object containing locale and stringCodes
 * @param {nlobjResponse} response Response object containing messageMap
 */
function getMessageMap (request, response) { // eslint-disable-line no-unused-vars
  var locale = request.getParameter('locale');
  var stringCodes = convertStringCodes(request.getParameter('stringCodes'));

  var translator = new ns_wrapper.Translator(locale);
  var messageMap = translator.getStringMap(stringCodes);

  response.write(JSON.stringify(messageMap));
}

function convertStringCodes (stringCodesStr) {
  return stringCodesStr ? stringCodesStr.split(',') : [];
}
