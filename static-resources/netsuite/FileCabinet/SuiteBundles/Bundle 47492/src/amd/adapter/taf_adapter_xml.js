/**
 * Copyright 2017 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 * 
 */

define(['N/xml'],
    adapterXML);

function adapterXML(xml) {
    return {
        getParser: function() {
            return xml.Parser;
        },
        getXPath: function() {
            return xml.XPath;
        }
    };
}