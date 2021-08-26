/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var suite_l10n = suite_l10n || {};
suite_l10n.parser = suite_l10n.parser || {};

suite_l10n.parser.ParseResult = function ParseResult () {
  var obj = new suite_l10n.process.ProcessResult();

  obj.setResult = function (result) {
    obj.setData('result', result);
  };

  obj.getResult = function () {
    return obj.getData('result');
  };
  return obj;
};

suite_l10n.parser.AbstractParser = function AbstractParser () {
  this.doParse = function doParse (inputString) {
    throw nlapiCreateError('DUNNING_UNAUTHORIZED_USE_OF_ABSTRACT_PARSER_CLASS', 'Please use a subclass of AbstractParser');
  };

  this.parse = function parse (inputString) {
    var result = new suite_l10n.parser.ParseResult();
    try {
      result.success = true;
      result.setResult(this.doParse(inputString));
    } catch (e) {
      var param = {'inputString': inputString, 'error': JSON.stringify(e)};

      nlapiLogExecution('ERROR', 'DUNNING_PARSER_ERROR', 'An error has occurred in AbstractParser class. Details: ' + JSON.stringify(param));
      result.success = false;
      result.message = e;
    }
    return result;
  };
};

suite_l10n.parser.XMLParser = function XMLParser () {
  var baseParser = new suite_l10n.parser.AbstractParser();

  baseParser.doParse = function doParse (inputString) {
    var objTree = new XML.ObjTree();
    return objTree.parseXML(inputString);
  };
  return baseParser;
};

suite_l10n.parser.JSONParser = function JSONParser () {
  var baseParser = new suite_l10n.parser.AbstractParser();

  baseParser.doParse = function doParse (inputString) {
    return JSON.parse(inputString);
  };
  return baseParser;
};

suite_l10n.parser.URLStringParser = function URLStringParser () {
  var baseParser = new suite_l10n.parser.AbstractParser();

  baseParser.doParse = function doParse (inputString) {
    var formatter = new suite_l10n.string.StringFormatter();
    var valuePairs = inputString.split('&');
    var obj = {};
    for (var i = 0; i < valuePairs.length; ++i) {
      var currPai = formatter.setString(valuePairs[i]).decodeHTML().toString().split('=');
      obj[currPai[0]] = currPai[1];
    }
    return obj;
  };
  return baseParser;
};
