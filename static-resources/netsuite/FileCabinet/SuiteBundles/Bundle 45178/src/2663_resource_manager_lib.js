/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * Copyright (c) 1998-2008 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 */

/**
 * Revision History:
 * 
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2011/5/20   198389         1.00.2011.05.20.04      Not used anymore, processing is on
 *                                                    2663_resource_manager_s.js
 */
//================

var _2663;

if (!_2663) 
    _2663 = {};
    
if(!(_2663.Resources)) 
    _2663.Resources = {};
    
//==============================================================================
_2663.Resources.ResourceLoader = function ResourceLoader(resfilename, lang, ajaxCall) {
	// suitelet settings
	var scriptId = 'customscript_2663_resource_mgr_s';
	var scriptDeployment = 'customdeploy_2663_resource_mgr_s';
	
    //--------------------------------------------------------------------------
    this.LoadResources = function LoadResources(resourceNames) {
        this.resourceValues = {};
        
        if (!ajaxCall) {
            // load the resource file
            var resourceMgr = new _2663.Resources.ResourceManager(resfilename, lang);
            
            nlapiLogExecution('debug', 'Payment Module Processing', 'Resource File: ' + resfilename);
		    nlapiLogExecution('debug', 'Payment Module Processing', 'Language: ' + lang);
            // load only specific resources if given as string delimited by "|"
            if (resourceNames != '') {
                var resourceNameArr = resourceNames.split('|');
                for (var i = 0; i < resourceNameArr.length; i++) {
                    var resourceName = resourceNameArr[i];
                    this.resourceValues[resourceName] = resourceMgr.GetString(resourceName);
                    nlapiLogExecution('debug', 'Payment Module Processing', 'Resource [' + resourceName + '] : ' + this.resourceValues[resourceName]);
                }
            }
            // get all resources
            else { 
                this.resourceValues = resourceMgr.GetProperties(lang);
            }
        }
        else {
            this.resourceValues = _CallResourceMgrSuitelet(resourceNames);
        }
    }
    
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

//==============================================================================
_2663.Resources.ResourceManager = function ResourceManager( resfilename, userLanguage)
{
    var _UserLanguage = userLanguage == null? _GetUserLanguagePreference(): userLanguage;
    var _ResourceFile = resfilename;
    var _FolderId = _GetFolderId( resfilename );  
    var _Resources = {};
     
    _LoadResource(_UserLanguage);
    
    
    //--------------------------------------------------------------------------
    function _LoadResource( userLanguage)
    {
        if(_Resources[userLanguage] == null)
        {
            var resource = _OpenResourceFile( userLanguage);
            _Resources[userLanguage] = resource;
        }
    }
    
    
    
    //--------------------------------------------------------------------------
    this.GetString = function GetString( string, userLanguage)
    {
        var ci = userLanguage == null? _UserLanguage: userLanguage;
        
        if(_Resources[ci] == null)
            _LoadResource( ci);
            
        var resx = _Resources[ci];
        
        if( resx == null || resx.data == null)
            return "(" + string + ")";
        
        if( resx.data.(@name == string))
            return resx.data.(@name == string).value.toString();
            
        return "(" + string + ")";
    }
    
    
    
    //--------------------------------------------------------------------------
    this.GetStream = function GetStream( string, userLanguage)
    {
        var ci = userLanguage == null? _UserLanguage: userLanguage;
        
        if(_Resources[ci] == null)
            _LoadResource( ci);
            
        var resx = _Resources[ci];
        
        if( resx == null || resx.data == null)
            return "(" + string + ")";
        
        if( resx.data.(@name == string && @type == "System.Drawing.Bitmap, System.Drawing"))
            return resx.data.(@name == string).value;
            
        return "(" + string + ")";
    }
    
    
    //--------------------------------------------------------------------------
    function _GetUserLanguagePreference()
    {
        return nlapiGetContext().getPreference('LANGUAGE');
    }
    
    
    //--------------------------------------------------------------------------
    function _GetFileId( fileName)
    {
        var result = nlapiSearchRecord( "file", null,
            [new nlobjSearchFilter("name", null, 'is', fileName)],
            [new nlobjSearchColumn("internalid")]);
                
        return result == null? null: result[0].getValue("internalid");
    }
    
    

    //--------------------------------------------------------------------------
    function _GetFolderId( fileName)
    {
        var fileId = _GetFileId( fileName);
        if( fileId == null)
            return null;
        
        var file = nlapiLoadFile( fileId);
        if( file == null)
            return null;
            
        return file.getFolder();
    }
        
    
    
    //--------------------------------------------------------------------------
    function _OpenResourceFile( userLanguage )
    {
        
        var defaultResx = _ResourceFile + ".en_US.resx.xml"
        var resxFileName = _ResourceFile + "." + userLanguage + ".resx.xml";
        var fileId = _GetFileId( resxFileName);
        
        if (fileId == null) { fileId = _GetFileId(defaultResx); }

        if (fileId == null) { return null; }
            
        var file = nlapiLoadFile( fileId);
        if (file == null) { return null; }

        /*
        var author = nlapiGetContext().getUser();
        var recipient = 'rreese@netsuite.com';
        var subject_message = 'newXML with headers';
        var body_message = file.getValue();
        nlapiSendEmail(author, recipient, subject_message, body_message);
        */
    
        var xml = new XML();
        xml = eval(file.getValue());
        return xml;
    }
    
    //--------------------------------------------------------------------------
	// gets all the properties
    this.GetProperties = function GetProperties( userLanguage)
    {
        var ci = userLanguage == null? _UserLanguage: userLanguage;
        
        if(_Resources[ci] == null)
            _LoadResource( ci);
            
        var resx = _Resources[ci];
        
        var propArray = {};
        if( resx != null && resx.data != null) {
            for (var i = 0; i < resx.data.length(); i++) {
                var key = resx.data[i].@name;
                var value = resx.data[i].value.toString();
                propArray[key] = value;
                nlapiLogExecution('debug', 'Payment Module Processing', 'Resource [' + key + '] : ' + propArray[key]);
            }
        }
        
        return propArray;
    }
}