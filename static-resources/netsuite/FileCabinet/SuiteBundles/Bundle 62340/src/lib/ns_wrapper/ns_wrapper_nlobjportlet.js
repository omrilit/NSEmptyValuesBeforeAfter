/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var ns_wrapper = ns_wrapper || {};

ns_wrapper.Portlet = function Portlet (pPortlet) {
  var portlet = pPortlet;

  this.addColumn = function (name, type, label, just) {
    return portlet.addColumn(name, type, label, just);
  };

  this.addEditColumn = function (column, showView, showHrefCol) {
    portlet.addEditColumn(column, showView, showHrefCol);
  };

  this.addField = function (name, type, label, source) {
    portlet.addField(name, type, label, source);
  };

  this.addLine = function (text, url, indent) {
    portlet.addLine(text, url, indent);
  };

  this.addRow = function (row) {
    portlet.addRow(row);
  };

  this.addRows = function (rows) {
    portlet.addRows(rows);
  };

  this.setHtml = function (html) {
    portlet.setHtml(html);
  };

  this.setRefreshInterval = function (n) {
    portlet.setRefreshInterval(n);
  };

  this.setScript = function (scriptid) {
    portlet.setScript(scriptid);
  };

  this.setSubmitButton = function (url, label, target) {
    portlet.setSubmitButton(url, label, target);
  };

  this.setTitle = function (title) {
    portlet.setTitle(title);
  };

  this.getPortlet = function () {
    return portlet;
  };
};
