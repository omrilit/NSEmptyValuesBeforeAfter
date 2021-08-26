/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

function previewRenderedTemplate (request, response) { // eslint-disable-line no-unused-vars
  var tr = new ns_wrapper.TemplateRenderer();

  var id = request.getParameter('tempId');
  var currentTemplate = nlapiLoadRecord('customrecord_3805_dunning_template', id || 1);

  var customerId = currentTemplate.getFieldValue('custrecord_customer');
  var customer = nlapiLoadRecord('customer', customerId);
  tr.addRecord('customer', customer);

  var fileId = currentTemplate.getFieldValue('custrecord_temp_doc');

  var file = nlapiLoadFile(fileId);
  tr.setTemplate(file.getValue());

  response.setContentType('HTMLDOC');
  var a = tr.renderToString();
  response.write(a);
}
