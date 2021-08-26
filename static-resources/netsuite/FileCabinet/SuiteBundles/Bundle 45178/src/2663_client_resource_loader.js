/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * @author alaurito
 * 
 */

/**
 * Revision History:
 * 
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2011/5/20   198389         1.00.2011.05.20.04      Transfer AJAX call from resource_manager_lib.js
 */

var _2663;

if (!_2663) 
    _2663 = {};
    
if(!(_2663.Resources)) 
    _2663.Resources = {};
    
//==============================================================================
_2663.Resources.ClientResourceLoader = function ClientResourceLoader() {
    // suitelet settings
    var scriptId = 'customscript_2663_resource_mgr_s';
    var scriptDeployment = 'customdeploy_2663_resource_mgr_s';
    
    //--------------------------------------------------------------------------
    this.LoadResources = function LoadResources(lang, resourceNames) {
        this.resourceValues = _CallResourceMgrSuitelet(resourceNames);
    };
    
    //--------------------------------------------------------------------------
    function _CallResourceMgrSuitelet(lang, resourceNames) {
        // set the resources if given as string delimited by "|"
        var postdata = {};
        if (resourceNames != null && resourceNames != '') {
            postdata['custparam_resource'] = resourceNames;
        }

        // set the language to request because it cannot be retrieved in preference by external call to suitelet
        var lang = nlapiGetContext().getPreference('LANGUAGE');
        postdata['custparam_language'] = lang;
        
        // call suitelet that retrieves resources
        var reqUrl = nlapiResolveURL('SUITELET', scriptId, scriptDeployment, true);
        var response = nlapiRequestURL(reqUrl, postdata);
        
        // parse the response to an array
        return _ParseResponse(response);
    }
    
    //--------------------------------------------------------------------------
    function _ParseResponse(response) {
        var resourceValues = {};
        if (response != null) {
            var responseBody = response.getBody();
            if (responseBody != null && responseBody.length > 0) {
                responseBody = responseBody.substring(responseBody.indexOf('{') + 1, responseBody.indexOf('}'));
                var pairs = responseBody.split(', ');
                if (pairs != null) {
                    for (var i = 0; i < pairs.length; i++) {
                        var keyValuePair = pairs[i].split('=');
                        if (keyValuePair != null && keyValuePair.length >= 2) {
                            var key = keyValuePair.shift();
                            var value = keyValuePair.join('=');
                            resourceValues[key] = value;
                        }
                    }
                }
            }
        }
        return resourceValues;
    }
    
    //--------------------------------------------------------------------------
    this.GetResources = function GetResources(resourceNames) {
        if (this.resourceValues == null) {
            this.LoadResources(resourceNames);
        }
        return this.resourceValues;
    }
    
    //--------------------------------------------------------------------------
    this.GetString = function GetString(string) {
        if (this.resourceValues == null) {
            this.LoadResources();
        }
        return (this.resourceValues[string] != null ? this.resourceValues[string] : '(' + string + ')');
    }
};