/**
 * © 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * Resource Allocation Chart
 * RESX Translation : Server
 *
 * Version    Date          Author          Remarks
 *  1         2014 04 03      pmiller         Initial version
 *  2         2014 06 06      pmiller         Added default return values for getEXTLang & getNSLang
 *  3         2014 06 13      pmiller         Removed hardcoded path -- resx files will now be loaded via their internalid; assumption: unique file name
 *  
 * Version    Date          Author          Remarks
 *  1         2014 09 05      pmiller         Folder restructure and class rename
 *  2         2014 10 20      adimaunahan     Fixed bug in getString() when key is not present in current locale
 *  3         2014 11 13      pmiller         ML Merge:
 *            2014 10 01      jtorririt       Issue 310796 : Add copyright/comment on top of every source file
 *  4         2014 11 26      pmiller         Added possible fix to Issue 315743 NLCORP| Resource Allocation Chart is not working in Sandbox Environment (DRT'd)
 *                                            Adding extra DEBUG logs for investigation purposes
 *
 * Version    Date          Author          Remarks
 *  1
 *  2         2015 01 07      pmiller         Added "folder" field as search filter for getFileId; make sure files are under parent folder with name "bundle" (minor, unrelated to issue)
 */
RACTranslationManager = {
    defaultLang : 'en_US',
    extLangMap : {
        'cs_CZ' : 'cs',
        'da_DK' : 'da',
        'de_DE' : 'de',
        'en' : 'en',
        'en_US' : 'en',
        'es_AR' : 'es',
        'es_ES' : 'es',
        'fr_CA' : 'fr_CA',
        'fr_FR' : 'fr',
        'it_IT' : 'it',
        'ja_JP' : 'ja',
        'ko_KR' : 'ko',
        'nl_NL' : 'nl',
        'pt_BR' : 'pt_BR',
        'ru_RU' : 'ru',
        'sv_SE' : 'sv_SE',
        'th_TH' : 'th',
        'zh_CN' : 'zh_CN',
        'zh_TW' : 'zh_TW'
    },
    nsLangMap : {
        'cs_CZ' : 'cs_CZ',
        'da_DK' : 'da_DK',
        'de_DE' : 'de_DE',
        'en' : 'en_US',
        'en_US' : 'en_US',
        'es_AR' : 'es_AR',
        'es_ES' : 'es_ES',
        'fr_CA' : 'fr_CA',
        'fr_FR' : 'fr_FR',
        'it_IT' : 'it_IT',
        'ja_JP' : 'ja_JP',
        'ko_KR' : 'ko_KR',
        'nl_NL' : 'nl_NL',
        'pt_BR' : 'pt_BR',
        'ru_RU' : 'ru_RU',
        'sv_SE' : 'sv_SE',
        'th_TH' : 'th_TH',
        'zh_CN' : 'zh_CN',
        'zh_TW' : 'zh_TW'
    },
    initResources : function() {
        var startTime = new Date().getTime();
        this.bundleID = nlapiGetContext().getBundleId();
        this.prefLang = nlapiGetContext().getPreference('LANGUAGE');
        //nlapiLogExecution('DEBUG', 'RACTranslationManager.prefLang', this.prefLang);
        this.defaultXML = this.loadXML(this.defaultLang);
        this.prefXML = this.loadXML(this.getNSLang());
        //nlapiLogExecution('DEBUG', 'RACTranslationManager.initResources.runTime', (new Date().getTime() - startTime) + 'ms');
    },
    loadXML : function(lang) {
        //nlapiLogExecution('DEBUG', 'RACTranslationManager.loadXML.lang', lang);
        var fileName = "rac_resource." + lang + ".resx.xml";
        //nlapiLogExecution('DEBUG', 'RACTranslationManager.loadXML.fileName', fileName);
        var fileId = this.getFileId(fileName);
        var file = nlapiLoadFile(fileId);
        var fileValue = file.getValue();
        //nlapiLogExecution('DEBUG', 'RACTranslationManager.loadXML.fileValue', fileValue);
        var tokens = fileValue.split('\n');
        //nlapiLogExecution('DEBUG', 'RACTranslationManager.loadXML.tokens.length', tokens.length);
        var contentString = "";
        var logString = "";
        for(var i = 0; i < tokens.length; i++) {
            var tmp = tokens[i].trim();
            logString += tmp.replace('<', '&#60;').replace('>', '&#62;');
            contentString += tmp;
        }
        //nlapiLogExecution('DEBUG', 'RACTranslationManager.loadXML.contentString', logString);
        if (lang == this.defaultLang) {
            this.defaultRESXString = contentString;
        } else {
            this.prefRESXString = contentString;
        }
        return eval(contentString);
    },
    getEXTLang : function() {
        return this.extLangMap[this.prefLang] || this.extLangMap[this.defaultLang];
    },
    getNSLang : function() {
        return this.nsLangMap[this.prefLang] || this.nsLangMap[this.defaultLang];
    },
    getString : function(stringID) {
        var pref = this.prefXML.data.(@name == stringID);
        var def = this.defaultXML.data.(@name == stringID);
        if (pref && pref.value.toString()) return pref.value.toString();
        else if (def && def.value.toString()) return def.value.toString();
        else return "ERROR";
    },
    getFileId : function(fileName) {
        var results = psa_ra.serverlibrary.searchFile(fileName);
        var index = 0;
        if (results.length > 1) {
            //nlapiLogExecution('DEBUG', 'Duplicate Filename', 'Found multiple files with name ' + fileName);
            var bundleFolder = 'Bundle ' + this.bundleID;
            for ( var i in results) {
                var result = results[i];
                var folderId = result.getValue('folder');
                var parentName = null;
                do {
                    var _result = psa_ra.serverlibrary.searchFolder(folderId);
                    if (_result) {
                        parentName = _result[0].getValue('name');
                        if (parentName == bundleFolder) {
                            index = i;
                            folderId = '';
                            //nlapiLogExecution('DEBUG', 'Duplicate Filename Resolved', 'Found file with correct parent folder "' + bundleFolder + '"');
                        } else {
                            folderId = _result[0].getValue('parent');
                        }
                    }
                } while (folderId != '');
            }
        }
        return results == null ? null : results[index].getValue("internalid");
    }
}
RACTranslationManager.initResources();