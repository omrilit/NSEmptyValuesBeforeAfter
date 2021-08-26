/**
 * © 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var FAM,
    LOCALIZATION_FILENAME = 'fam_resource',
    PREFIX_CUSTOM         = 'custom_';
    DEFAULT_LANG          = 'en_US';

if (!FAM) FAM = {};

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

//================

var jp3867ns;
if (!jp3867ns) { jp3867ns = {}; }
if(!(jp3867ns.Resources)) jp3867ns.Resources={};

//==============================================================================
jp3867ns.Resources.ResourceManager = function ResourceManager(resfilename, userLanguage)
{
    var _UserLanguage = userLanguage == null? getUserLanguagePreference(): userLanguage;
    var _ResourceFile = resfilename;
    var _CustomResourceFile = PREFIX_CUSTOM + resfilename;
    var _FolderId = getFolderId(resfilename);  
    var _Resources = {};
    var _CustomResources = {};
    
    loadResource(_UserLanguage);
    
    //--------------------------------------------------------------------------
    function loadResource(language) {
        if (language) {
            if (!_CustomResources[language]) {
                _CustomResources[language] = loadResourceFile(language, true);
            }
            if (!_Resources[language]) {
                _Resources[language] = loadResourceFile(language);
            }
        }
        if (!_Resources[DEFAULT_LANG]) {
            _Resources[DEFAULT_LANG] = loadResourceFile(DEFAULT_LANG);
        }
    }
    
    function extractFromResx(resx, fieldName, pageName) {
        var node, value = null;
        
        if (!resx || !fieldName) return null;
        
        if (pageName) {
            node = nlapiSelectNode(resx, "//*[local-name()='data' and @page='" + pageName + 
                "' and @name='" + fieldName + "']");
        }
        else {
            node = nlapiSelectNode(resx, "//*[local-name()='data' and @name='" + fieldName +
                "' and not(@page)]");
        }
        
        if (node)
            value = nlapiSelectValue(node, "value") || null;
        
        return value;
    }
    
    /** Fetch the display value using the parameters */
    this.GetString = function GetString(fieldName, pageName, userLanguage, messageParam)
    {
    	var returnValue = null;
    	//null check
        if(userLanguage == null || userLanguage.length == 0) {
        	userLanguage = _UserLanguage;
        }
        
        if(_Resources[DEFAULT_LANG] == null) {
            loadResource(userLanguage);
        }
        
        /** attempt to load from custom resource file */
        returnValue = extractFromResx(_CustomResources[userLanguage], fieldName, pageName);
        
        /** attempt to load from resource file based on the user language */
        if(returnValue == null || returnValue.length == 0) {
            returnValue = extractFromResx(_Resources[userLanguage], fieldName, pageName);
        }
        
        /** attempt to load from default resource file if no field item found */
        if(returnValue == null || returnValue.length == 0 && _Resources[DEFAULT_LANG]) {
            returnValue = extractFromResx(_Resources[DEFAULT_LANG], fieldName, pageName);
        }
        
        //No data was found, set with a failsoft value
        if(returnValue == null || returnValue.length == 0) {
        	returnValue = "(" + fieldName + ")";
        }
        
        if (messageParam!= null) {
        	returnValue = injectMessageParameter(returnValue, messageParam);
        }
        return returnValue;
    }
    
    /**
     * Replace message with blank value from parameter.
     * Blank value is difined by (number) - pattern, i.e. (0) will be replace with
     * first element in param, (1) from 2nd and so forth
     * 
     *  strVar -> The message
     *  param -> param values to be replaced on the message
     */
    function injectMessageParameter(strVar, param){
    	var returnValue = strVar;

    	// search pattern to find string to replace
    	var paramPattern = /[(]\d[)]/g;


    	//Return index of number inserted on string, also contains other non-numeric values
    	var paramList = returnValue.match(paramPattern);
    	
    	//Replace the original string
    	for(i in paramList){
    		if (!isNaN(i) && param[i] != null){
    			returnValue = returnValue.replace(paramList[i],param[i]);
    		}
    	}
    	return returnValue;
    }

    //--------------------------------------------------------------------------
    function getUserLanguagePreference()
    {
        return nlapiGetContext().getPreference('LANGUAGE');
    }
    
    
    //--------------------------------------------------------------------------
    function getFileId(fileName)
    {
        var result = nlapiSearchRecord( "file", null,
            [new nlobjSearchFilter("name", null, 'is', fileName)],
            [new nlobjSearchColumn("internalid")]);
                
        return result == null? null: result[0].getValue("internalid");
    }
    
    

    //--------------------------------------------------------------------------
    function getFolderId(fileName)
    {
        var fileId = getFileId(fileName);
        if(fileId == null)
            return null;
        
        var file = nlapiLoadFile(fileId);
        if(file == null)
            return null;
            
        return file.getFolder();
    }

    //--------------------------------------------------------------------------
    function loadResourceFile(userLanguage, isCustom) {
        var filename, fileId, file, xmlString,
            prefix = isCustom ? _CustomResourceFile : _ResourceFile;
        
        userLanguage = userLanguage;
        
        filename = prefix + '.' + userLanguage + '.resx.xml';
        fileId = getFileId(filename);
        if (!fileId) return null;
        
        file = nlapiLoadFile(fileId);
        if (!file) return null;
        
        xmlString = eval(jp3867ns.Library.trim(file.getValue().replace(/<\?xml(.|[\n])*?\?>/i, '')));
        return nlapiStringToXML(xmlString);
    }
}

if (!LOCALIZATION_FILENAME) {
	nlapiLogExecution('ERROR','FAM Resource Library','Filename for resource xml undefined');
}
else if (!FAM.resourceManager) {
	FAM.resourceManager = new jp3867ns.Resources.ResourceManager(LOCALIZATION_FILENAME,
        nlapiGetContext().getPreference('LANGUAGE'));
}
