/**
 * Copyright © 2018, 2019 Oracle and/or its affiliates. All rights reserved.
 */

function ResourceMgr(cultureId)
{
    //Dependencies: none

    var _ResourceSet = null;
    var _Locale = null;
    
    this.GetString = _GetString;
    this.GetStringMap = _GetStringMap;
    this.AddHiddenCSStrings = _AddHiddenCSStrings;
    
    
    
    
    
    (function _constructor(locale)
    {
        _Locale = (locale||"en_US");
        _ResourceSet = _FetchResourceSet(_Locale);

    } (cultureId));

    function _FetchResourceSet()
    {
    	var fileId, fileName, translations, deltaTranslations;
    	
    	
    	if(!_Locale){_Locale = "en_US"};
    	
    	fileName = "taf_en_US.json";
    	fileId = _GetFileId(fileName);
    	translations = JSON.parse(nlapiLoadFile(fileId).getValue());
    	
    	if(_Locale.substring(0,2) !== "en"){
    		fileName = "taf_" + _Locale.replace("-","_") + ".json";
        	fileId = _GetFileId(fileName);
        	
        	if(fileId){
        		deltaTranslations = JSON.parse(nlapiLoadFile(fileId).getValue());
        	}
    	}
    	translations = _UpdateTranslation(translations, deltaTranslations);
    	return translations;
    }
    
    function _UpdateTranslation(t, d){
        for(var key in d) {
            var value = d[key];
            t[key] = value;
        }
        return t;
    }
    
    function _GetFileId(fileName)
    {
        var result = nlapiSearchRecord( "file", null,
            [new nlobjSearchFilter("name", null, 'is', fileName)],
            [new nlobjSearchColumn("internalid")]);
                
        return result == null? null: result[0].getValue("internalid");
    }


    function _GetStringMap(textIds){
    	var strMap = {}
    	
    	if(!_ResourceSet){
			_ResourceSet = _FetchResourceSet();
		}
    	
    	for(var i = 0; i < textIds.length; i++){
    		strMap[textIds[i]] = _ResourceSet[textIds[i]]||'{' + textIds[i] + '}';
    	}
    	
		return strMap;
    }


    function _GetString(key, bindValues)
    {
    	if(!_ResourceSet){
			_ResourceSet = _FetchResourceSet();
		}
    	
        if (_ResourceSet != null && _ResourceSet[key] !== undefined)
        {
            return bindValues === undefined ? _ResourceSet[key] : _BindString(_ResourceSet[key], bindValues);
        }

        return "{" + key + "}";
    }


    function _BindString(str, values)
    {
        if (str == null || values == null)
        {
            return str;
        }

        var bindStr = str;

        for (var m in values)
        {
            bindStr = bindStr.replace(new RegExp("\\{" + m + "\\}", "g"), values[m]);
        }

        return bindStr;
    }
    
    function _AddHiddenCSStrings(nsForm, strIds) {
    	
    	var fieldId = 'custpage_cs_msgs';
        var fieldValues = {};
        fieldValues[fieldId] = JSON.stringify(_GetStringMap(strIds));

        nsForm.addField('custpage_cs_msgs', 'longtext').setDisplayType('hidden');
        nsForm.setFieldValues(fieldValues);
    };
}