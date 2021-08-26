/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var infra = infra || {};
infra.comp = infra.comp || {};
infra.comp.cs = infra.comp.cs || {};

infra.comp.cs.SublistPagination = function SublistPagination (formStateObject) {
  this.formStateObject = formStateObject;

  function isFirstPage (pageField) {
    var parameters = formStateObject.parameters;
    return Number(parameters[pageField]) === 1;
  }

  this.previous = function previous (pageField) {
    if (!isFirstPage(pageField)) {
      this.addToPage(pageField, -1);
    }
    this.renderPage(formStateObject);
  };

  this.next = function next (pageField) {
    this.addToPage(pageField, 1);
    this.renderPage(formStateObject);
  };

  this.addToPage = function addToPage (pageField, amount) {
    var parameters = formStateObject.parameters;
    parameters[pageField] = Number(parameters[pageField]) + amount;
  };

  this.renderPage = function renderPage () {
    var url = ns_wrapper.api.url.resolveUrlWithParams(formStateObject);
    new ns_wrapper.Window().forceChangeLocation(url);
  };
};
