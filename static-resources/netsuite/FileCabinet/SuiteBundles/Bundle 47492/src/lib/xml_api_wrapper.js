/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.XML = TAF.XML || {};
TAF.XML.Parser = TAF.XML.Parser || {};
TAF.XML.XPath = TAF.XML.XPath || {};


TAF.XML.escape = function(options) {
    return nlapiEscapeXML((options || {}).xmlText);
};


TAF.XML.validate = function(options) {
    var options = options || {};
    return nlapiValidateXML(options.xml, options.xsdFilePathOrId, options.importFolderPathOrId);
};


TAF.XML.Parser.fromString = function(options) {
    return nlapiStringToXML((options || {}).text);
};


TAF.XML.Parser.toString = function(options) {
    return nlapiXMLToString((options || {}).document);
};


TAF.XML.XPath.select = function(options) {
    var options = options || {};
    return nlapiSelectNodes(options.node, options.xpath);
};
