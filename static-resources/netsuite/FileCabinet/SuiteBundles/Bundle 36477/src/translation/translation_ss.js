/**
 * Resource Allocation Chart
 * RESX Translation : Server
 *
 * Version    Date          Author          Remarks
 *  1.00    2014 04 03      pmiller         Initial version
 *  2.00    2014 04 16      pbtan           Renamed and made this generic
 *  3.00    2014 06 03      pmiller         Added default return values for getEXTLang & getNSLang
 *                                          Removed stray characters
 *  4.00    2014 06 10      pmiller         Removed hardcoded path -- resx files will now be loaded via their internalid; assumption: unique file name
 */
TranslationManager = {
	defaultLang : 'en_US',
	extLangMap : {
		'cs_CZ' : 'cs',
		'da_DK' : 'da',
		'de_DE' : 'de',
		'en'    : 'en',
		'en_US' : 'en',
		'es_AR' : 'es',
		'es_ES' : 'es',
		'fi_FI' : 'fi',
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
		'en'    : 'en_US',
		'en_US' : 'en_US',
		'es_AR' : 'es_AR',
		'es_ES' : 'es_ES',
		'fi_FI' : 'fi_FI',
		'fr_CA' : 'fr_CA',
		'fr_FR' : 'fr_FR',
		'id_ID' : 'id_ID',
		'it_IT' : 'it_IT',
		'ja_JP' : 'ja_JP',
		'ko_KR' : 'ko_KR',
		'nl_NL' : 'nl_NL',
		'no_NO' : 'no_NO',
		'pt_BR' : 'pt_BR',
		'ru_RU' : 'ru_RU',
		'sv_SE' : 'sv_SE',
		'th_TH' : 'th_TH',
		'tr_TR' : 'tr_TR',
		'vi_VN' : 'vi_VN',
		'zh_CN' : 'zh_CN',
		'zh_TW' : 'zh_TW'
	},
	initResources : function() {
		var startTime = new Date().getTime();
		this.bundleID = nlapiGetContext().getBundleId();
		this.prefLang = nlapiGetContext().getPreference('LANGUAGE');
		nlapiLogExecution('DEBUG', 'TranslationManager.prefLang', this.prefLang);
		this.defaultXML = this.loadXML(this.defaultLang);
		this.prefXML = this.loadXML(this.getNSLang());
		nlapiLogExecution('DEBUG', 'TranslationManager.initResources.runTime', (new Date().getTime() - startTime) + 'ms');
	},
	loadXML : function(lang) {
		nlapiLogExecution('DEBUG', 'CTranslationManager.loadXML.lang', lang);
		var fileName = "rss." + lang + ".resx.xml";
		var fileId = this.getFileId(fileName);
		var file = nlapiLoadFile(fileId);
		var contentString = file.getValue().replace(/(\r\n|\n|\r)/gm, "");
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
		var result = nlapiSearchRecord("file", null, [
			new nlobjSearchFilter("name", null, 'is', fileName)
		], [
			new nlobjSearchColumn("internalid")
		]);
		return result == null ? null : result[0].getValue("internalid");
	}
};
TranslationManager.initResources();