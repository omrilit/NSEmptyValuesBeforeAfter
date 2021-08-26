/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var suite_l10n = suite_l10n || {};
suite_l10n.app = suite_l10n.app || {};

suite_l10n.app.AbstractSubListRowConverter = function AbstractSubListRowConverter () {
  var obj = {};

  obj.convertToRow = function (result) {
    throw new Error('Abstract function convertToRow requires an override');
  };

  obj.getJSLink = function getJSLink (input) {
    var link = ['<a href=\'javascript:', input.script, '\'>', input.text, '</a>'];
    return link.join('');
  };

  return obj;
};
