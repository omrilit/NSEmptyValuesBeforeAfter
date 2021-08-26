/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningPDFTemplateManager = function DunningPDFTemplateManager () {
  var obj = new dunning.app.DunningTemplateManager();

  obj.getTemplateDocumentModel = obj.getPDFTemplateDocumentModel;

  return obj;
};
