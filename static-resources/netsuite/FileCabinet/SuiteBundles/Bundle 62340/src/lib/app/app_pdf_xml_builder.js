/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var suite_l10n = suite_l10n || {};
suite_l10n.app = suite_l10n.app || {};

/**
 * @param {string} options
 * @param {string} [options.body]
 * @param {string} [options.footer]
 * @param {string} [options.header]
 * @param {string} [options.language]
 * @returns {string}
 */
suite_l10n.app.PDFXMLBuilder = function (options) {
  /**
   * @param {Object.<string,string>} [attributes={}]
   * @returns {string}
   */
  function attributes (attributes) {
    return Object.keys(attributes || {})
      .sort()
      .map(function (key) { return ' ' + key + '="' + attributes[key] + '"'; })
      .join('');
  }

  /**
   * @param {string} name
   * @param {Object.<string,string>} [attrs]
   * @returns {renderer}
   */
  function tag (name, attrs) {
    /**
     * @param {...*}
     * @returns {string}
     */
    var renderer = function () {
      var content = Array.prototype.slice.call(arguments).join('');
      return '<' + name + attributes(attrs) + '>' + content + '</' + name + '>';
    };
    renderer.toString = renderer;
    return renderer;
  }

  var pdf = {};
  var body = {};
  var macrolist = [];

  if (options.language) {
    pdf.lang = options.language;
  }
  if (options.footer) {
    body['footer'] = 'basefooter';
    body['footer-height'] = '20.mm';
    macrolist.push(tag('macro', { id: body['footer'] })(options.footer));
  }
  if (options.header) {
    body['header'] = 'baseheader';
    body['header-height'] = '20.mm';
    macrolist.push(tag('macro', { id: body['header'] })(options.header));
  }

  return '<?xml version="1.0" encoding="UTF-8"?>' +
    '<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">' +
    tag('pdf', pdf)(
      tag('head')(macrolist ? tag('macrolist').apply(null, macrolist) : ''),
      tag('body', body)(options.body)
    );
};
