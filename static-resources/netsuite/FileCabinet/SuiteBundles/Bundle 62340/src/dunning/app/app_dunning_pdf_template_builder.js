/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

/**
 * @param {dunning.view.DunningTemplate} templateView
 * @constructor
 * @extends {dunning.app.TemplateBuilder}
 */
dunning.app.PDFTemplateBuilder = function (templateView) {
  var obj = new dunning.app.TemplateBuilder(templateView);

  /**
   * @param {string} text
   * @returns {string}
   */
  function escapeAmpersand (text) {
    return text.replace(/&(#\d+|[a-z]{2,16});/gi, '{{{$1}}}')
      .replace(/&/g, '&amp;')
      .replace(/{{{(#\d+|[a-z]{2,16})}}}/gi, '&$1;');
  }

  /**
   * @param {string} text
   * @returns {string}
   */
  function removeXmlDeclaration (text) {
    return text.replace(/<\?xml.*\?>/gi, '');
  }

  /**
   * Template is valid XML document, therefore it must have only one root element.
   * This element is usualy DIV in Templates for Body section. And this causes problems, big tables are not splitted
   * into several pages. It is easier to trim them off instead of fixing all templates for each customer.
   * @param {string} text
   * @returns {string}
   */
  function trimRootDiv (text) {
    return text.replace(/^[\s\n]*<div>/i, '<section>')
      .replace(/<\/div>[\s\n]*$/i, '</section>');
  }

  /**
   * @param {number} fileId
   * @returns {string}
   */
  obj.getFileContents = function (fileId) {
    var file = fileId ? new ns_wrapper.File(fileId) : null;
    var contents = '';
    if (file) {
      contents = file.getValue() || '';
    }
    return contents;
  };

  /**
   * @returns {string}
   */
  obj.stitchTemplateDocuments = function () {
    var doc = templateView.dunningTemplateDocument;

    return suite_l10n.app.PDFXMLBuilder({
      body: trimRootDiv(removeXmlDeclaration(obj.getFileContents(doc.bodyDocument))),
      footer: removeXmlDeclaration(obj.getFileContents(doc.footerDocument)),
      header: removeXmlDeclaration(obj.getFileContents(doc.headerDocument)),
      language: doc.locale
    });
  };

  /**
   * @returns {dunning.view.RenderedTemplate}
   */
  obj.getRenderedTemplate = function () {
    var renderedTemplate = dunning.app.TemplateBuilder.prototype.getRenderedTemplate.call(this);
    renderedTemplate.message = escapeAmpersand(renderedTemplate.message);
    return renderedTemplate;
  };

  return obj;
};
