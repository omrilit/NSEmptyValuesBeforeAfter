/**
 * @license
 * Copyright © 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

/**
 * @constructor
 * @extends {suite_l10n.app.BaseConverter<dunning.model.DunningTemplateDocument, dunning.view.DunningTemplateDocument>}
 */
dunning.app.DunningTemplateDocumentConverter = function () {
  return new suite_l10n.app.BaseConverter({
    model: dunning.model.DunningTemplateDocument,
    view: dunning.view.DunningTemplateDocument,
    modelViewMap: {
      id: 'id',
      name: 'name',
      language: 'language',
      subject: 'subject',
      headerDocument: 'headerDocument',
      bodyDocument: 'bodyDocument',
      footerDocument: 'footerDocument',
      default: 'default',
      dunningTemplateEmailParent: 'dunningTemplateParent',
      dunningTemplatePdfParent: 'dunningTemplateParent'
    },
    recordModelMap: {
      id: 'internalid',
      name: 'name',
      language: 'custrecord_3805_template_language',
      subject: 'custrecord_3805_template_subject',
      headerDocument: 'custrecord_3805_header_doc',
      bodyDocument: 'custrecord_3805_body_doc',
      footerDocument: 'custrecord_3805_footer_doc',
      default: 'custrecord_3805_template_default',
      dunningTemplateEmailParent: 'custrecord_3805_template_parent_email',
      dunningTemplatePdfParent: 'custrecord_3805_template_parent_pdf'
    }
  });
};
