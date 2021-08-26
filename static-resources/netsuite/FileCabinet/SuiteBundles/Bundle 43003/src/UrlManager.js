/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

var VAT;
if (!VAT) VAT = {};


/**
 * Responsible for constructing the URL given a base URL and corresponding URL parameters.
 * @param baseUrl The base URL to be used by the manager.
 */
VAT.UrlManager = function UrlManager(baseUrl) {
    this.baseUrl = baseUrl ? baseUrl.split('?')[0] : '';
    this.params = {};
    
    var paramsFromUrl = baseUrl && baseUrl.split('?')[1] ? baseUrl.split('?')[1].split('&') : [];
    for (var i = 0; i < paramsFromUrl.length; i++) {
        this.addUrlParameter(paramsFromUrl[i].split('=')[0], paramsFromUrl[i].split('=')[1]);
    }
};


/**
 * Adds a URL parameter to the manager.
 * @param name Parameter name.
 * @param value Parameter value.
 */
VAT.UrlManager.prototype.addUrlParameter = function addUrlParameter(name, value) {
    if (name != '' && name != null) {
        this.params[name] = value;
    } else {
        nlapiLogExecution('ERROR', 'PARAM_NAME_IS_REQUIRED', 'Parameter name is required.');
    }
};


VAT.UrlManager.prototype.removeUrlParameter = function removeUrlParameter(name) {
    if (name != '' && name != null) {
        delete this.params[name];
    } else {
        nlapiLogExecution('ERROR', 'PARAM_NAME_IS_REQUIRED', 'Parameter name is required.');
    }
};


/**
 * Adds several key-value pairs as URL parameters. 
 * @param obj Object containing parameter name-value pairs.
 */
VAT.UrlManager.prototype.addUrlParameters = function addUrlParameters(obj) {
    for (var param in obj) {
        this.addUrlParameter(param, obj[param]);
    }
};


/**
 * Constructs the URL from the provided base URL and URL parameters 
 * @returns A URL.
 */
VAT.UrlManager.prototype.getFullUrl = function getFullUrl() {
    var params = [];
    
    if (this.baseUrl) {
        for (var param in this.params) {
            params.push(param + '=' + this.params[param]);
        }
    }
    
    return this.baseUrl ? this.baseUrl + '?' + params.join('&') : '';
};
