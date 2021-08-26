/**
 * Copyright © 2018, 2019, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define([
	'../adapter/taf_local_adapter_file',
	'../adapter/taf_local_adapter_runtime',
	'../adapter/taf_local_adapter_search'
	
],

function (file, runtime, search) {

    var locale;
    var LANG = "LANGUAGE";
    var translation;

    function _GetTranslation() {
        var deltaTranslation, strTranslations, fileId;

        if(!locale){
            locale = runtime.getCurrentUser().getPreference(LANG);
        }
        
        fileId = _GetFileId("taf_en_US.json");
        strTranslations = file.load({id: fileId});
        translation = JSON.parse(strTranslations.getContents());


        if (locale.substring(0,2) !== "en") {
            try {
            	fileId = _GetFileId("taf_"+locale.replace("-","_")+".json");
            	if(fileId){
            		strTranslations = file.load({id: fileId});
            		deltaTranslation = JSON.parse(strTranslations.getContents());
            	}
            }catch (e) {
                log.error("TRANSLATOR_ERROR", e);
            }
        }

        translation = _UpdateTranslation(translation, deltaTranslation);

        return translation||{};
    }

    function _UpdateTranslation(t, d){
        for(var key in d) {
            var value = d[key];
            t[key] = value;
        }
        return t;
    }

    function _GetString(code, bindValues){
    	if(!translation){
            translation = _GetTranslation();
        }
    	
    	if (translation && translation[code] !== undefined)
        {
            return bindValues === undefined ? translation[code] : _BindString(translation[code], bindValues);
        }

        return "{" + code + "}";
    }

    function _GetStringMap(stringArray) {
        var stringMap = {};
        
        for (var i = 0; i < stringArray.length; i++) {
            var key = stringArray[i];
            stringMap[key] = _GetString(key);
        }

        return stringMap;
    }

    function _SetLocale(l){
    	locale = l;
    }
    
    function _BindString(str, values){
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
    
    function _GetFileId(filename){
        if (!filename) {
            return null;
        }
        
        var searchObj, res;
        
        searchObj = search.create({
            type    : 'file',
            filters : [['name', 'is', filename]],
            columns : ['internalid']
        });
        res = searchObj.run().getRange(0,2);
        
        if(res.length){
            if(res.length>1){
                log.audit('getFileId', 'Found more than 1 file with filename: ' + filename + '. Returning first file found');
            }
            
            return res[0].getValue('internalid');
        }
        else{
            log.audit('getFileId', 'File: ' + filename + ' not found.');
            return null;
        }
    }

    return {
        getString : _GetString,
        getStringMap : _GetStringMap,
        setLocale : _SetLocale,
        getTranslation : _GetTranslation
    };
});
