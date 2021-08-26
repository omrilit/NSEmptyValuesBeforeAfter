/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var suite_l10n = suite_l10n || {};
suite_l10n.string = suite_l10n.string || {};

suite_l10n.string.StringFormatter = function StringFormatter (string) {
  string = String(string);

  this.setString = function setString (newString) {
    string = String(newString);
    return this;
  };

  this.encodeHTML = function encodeHTML () {
    string = string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    return this;
  };

  this.decodeHTML = function decodeHTML () {
    string = string.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    return this;
  };

  this.hideCardNumbers = function hideCardNumbers (cardNumber) {
    var regex = /([0-9]{12})([0-9]{4})/g;
    if (!!cardNumber && (cardNumber.length > 0)) {
      regex = new RegExp('(' + cardNumber.substring(0, 12) + ')' + '(' + cardNumber.substring(12) + ')', 'g');
    }
    string = string.toString().replace(regex, '************$2');
    return this;
  };

  this.replaceParameters = function replaceParameters (parameters) {
    for (var i in parameters) {
      var re = new RegExp('\\{' + i + '\\}', 'g');
      string = string.replace(re, parameters[i]);
    }

    return this;
  };

  this.replaceStubs = function replaceStubs (map) {
    for (var i in map) {
      var re = new RegExp(i, 'g');
      string = string.replace(re, map[i]);
    }

    return this;
  };

  this.getPadString = function getPadString (minLength, character) {
    var remainingLength = parseInt(minLength, 10) - string.length;

    return remainingLength > 0 ? new Array(remainingLength + 1).join(character || ' ') : '';
  };

  this.padLeft = function padLeft (minLength, character) {
    string = this.getPadString(minLength, character) + string;
    return this;
  };

  this.padRight = function pad (minLength, character) {
    string = string + this.getPadString(minLength, character);
    return this;
  };

  this.encodeURI = function stringFormatterEncodeURI () {
    string = encodeURI(string);
    return this;
  };

  this.encodeURIComponent = function stringFormatterEncodeURIComponent () {
    string = encodeURIComponent(string);
    return this;
  };

  this.decodeURIComponent = function stringFormatterDecodeURIComponent () {
    string = decodeURIComponent(string);
    return this;
  };

  // Converts line ending CarriageReturn+LineFeed to LineFeed
  this.convertCRLFToLF = function convertCRLFToLF () {
    this.replace(/\r\n/g, '\n');
    return this;
  };

  this.replace = function replace (searchvalue, newvalue) {
    string = string.replace(searchvalue, newvalue);
    return this;
  };

  this.toString = function toString () {
    return string;
  };

  this.stringify = function stringify (object) {
    string = JSON.stringify(object);
    return this;
  };

  this.toUpperCase = function toUpperCase () {
    string = string.toUpperCase();
  };

  this.toLowerCase = function toLowerCase () {
    string = string.toLowerCase();
  };

  return this;
};

suite_l10n.string.QueryStringGenerator = function QueryStringGenerator () {
  this.generateQueryString = function generateQueryString (obj) {
    var str = '';

    if (obj) {
      var queryString = [];
      for (var i in obj) {
        queryString.push([i, obj[i]].join('='));
      }
      queryString = queryString.join('&');
      var formatter = new suite_l10n.string.StringFormatter(queryString);
      formatter.encodeURI();
      str = formatter.toString();
    }

    return str;
  };
};
