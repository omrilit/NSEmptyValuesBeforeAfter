/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var ns_wrapper = ns_wrapper || {};

ns_wrapper.TemplateRenderer = function TemplateRenderer () {
  var obj = {
    addDataSource: addDataSource,
    setTemplate: setTemplate,
    addRecord: addRecord,
    addSearchResults: addSearchResults,
    renderToString: renderToString,
    renderToResponse: renderToResponse
  };

  var templateRenderer;

  function getRenderer () {
    if (!templateRenderer) {
      templateRenderer = nlapiCreateTemplateRenderer();
    }
    return templateRenderer;
  }

  function setTemplate (template) {
    getRenderer().setTemplate(template);
  }

  function addRecord (label, record) {
    getRenderer().addRecord(label, record);
  }

  function addSearchResults (label, result) {
    getRenderer().addSearchResults(label, result);
  }

  function renderToString () {
    return getRenderer().renderToString();
  }

  function renderToResponse (response) {
    getRenderer().renderToResponse(response);
  }

  function addDataSource (label, object) {
    var renderer = getRenderer();

    switch (typeof object) {
      case 'nlobjRecord':
        renderer.addRecord(label, object);
        break;
      case 'nlobjSearchResult':
        renderer.addSearchResults(label, object);
        break;
      default:
        break;
    }
  }

  return obj;
};
