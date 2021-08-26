/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @author jjaramillo
 */
define(
	[
		'../adapter/psa_racg_ad_cache',
		'../adapter/psa_racg_ad_file',
		'../adapter/psa_racg_ad_log',
		'../adapter/psa_racg_ad_runtime',
		'../adapter/psa_racg_ad_xml'
	],

	function (rCache, rFile, rLog, rRuntime, rXml) {
		var module = {
			cacheConstants: {
				cacheObject: 'PSA_RACG_TRANSLATIONS',
				defaultMap: 'PSA_RACG_TRANSLATIONS_DEFAULT_MAP',
				preferenceMap: 'PSA_RACG_TRANSLATIONS_PREFERENCE_MAP'
			},
			defaultLanguage: 'en_US',
			preferenceLanguage: rRuntime.getCurrentUserPreference({
				preference: 'LANGUAGE'
			}),
			languageMap: {
				cs_CZ: {ext: 'cs', ns: 'cs_CZ'},
				da_DK: {ext: 'da', ns: 'da_DK'},
				de_DE: {ext: 'de', ns: 'de_DE'},
				en: {ext: 'en', ns: 'en_US'},
				en_US: {ext: 'en', ns: 'en_US'},
				es_AR: {ext: 'es', ns: 'es_AR'},
				es_ES: {ext: 'es', ns: 'es_ES'},
				fr_CA: {ext: 'fr_CA', ns: 'fr_CA'},
				fr_FR: {ext: 'fr', ns: 'fr_FR'},
				it_IT: {ext: 'it', ns: 'it_IT'},
				ja_JP: {ext: 'ja', ns: 'ja_JP'},
				ko_KR: {ext: 'ko', ns: 'ko_KR'},
				nl_NL: {ext: 'nl', ns: 'nl_NL'},
				pt_BR: {ext: 'pt_BR', ns: 'pt_BR'},
				ru_RU: {ext: 'ru', ns: 'ru_RU'},
				sv_SE: {ext: 'sv_SE', ns: 'sv_SE'},
				th_TH: {ext: 'th', ns: 'th_TH'},
				zh_CN: {ext: 'zh_CN', ns: 'zh_CN'},
				zh_TW: {ext: 'zh_TW', ns: 'zh_TW'}
			},
			getLanguage: function (extension) {
				var lang = this.languageMap[this.preferenceLanguage];
				if (!lang) lang = this.languageMap[this.defaultLanguage];
				return lang[extension];
			}
		};

		module.getTranslationOfKey = function (params) {
			rLog.startMethod('getTranslationOfKey');
			var translationsMap = this.getTranslationsMap();
			rLog.endMethod();
			return translationsMap.preferenceMap[params.key] || translationsMap.defaultMap[params.key];
		};

		module.getTranslationsMap = function () {
			rLog.startMethod('getTranslationsMap');
			var translationsMap = {};
			translationsMap.preferenceMap = this.getMapInCache({
				key: this.cacheConstants.preferenceMap
			});
			translationsMap.defaultMap = this.getMapInCache({
				key: this.cacheConstants.defaultMap
			});
			rLog.endMethod();
			return translationsMap;
		};

		module.getMapInCache = function (params) {
			rLog.startMethod('getMapInCache');
			var cacheObject = rCache.getCache(this.cacheConstants.cacheObject),
				cacheKey = params.key + (params.key == this.cacheConstants.preferenceMap ? ('_' + this.preferenceLanguage) : ''),
				cacheMap = cacheObject.get({
					key: cacheKey
				});
			if (!cacheMap) {
				cacheObject.put({
					key: cacheKey,
					value: this.loadTranslationsMap(params)
				});
				cacheMap = cacheObject.get({
					key: cacheKey
				});
			}
			rLog.endMethod();
			return JSON.parse(cacheMap);
		};

		module.loadTranslationsMap = function (params) {
			rLog.startMethod('loadTranslationsMap');
			var translationsMap = {},
				xmlFileAsString = this.loadTranslationsFile(params),
				xmlObject = rXml.getParser().fromString({text: xmlFileAsString}),
				dataNodes = xmlObject.getElementsByTagName({tagName: 'data'});
			for (var int = 0; int < dataNodes.length; int++) {
				var eachDataNode = dataNodes[int];
				translationsMap[eachDataNode.getAttribute({name: 'name'})] = eachDataNode.textContent.trim();
			}
			rLog.endMethod();
			return translationsMap;
		};

		module.loadTranslationsFile = function (params) {
			rLog.startMethod('loadTranslationsFile');
			var fileNameLanguage = this.defaultLanguage;
			if (params.key === this.cacheConstants.preferenceMap) {
				fileNameLanguage = this.preferenceLanguage;
			}
			var fileId = null;
			try {
				fileId = rFile.getFileId({
					name: 'rac_resource.' + fileNameLanguage + '.resx.xml'
				});
			} catch (ex) {
				fileId = null;
			}
			if (!fileId) {
				fileId = rFile.getFileId({
					name: 'rac_resource.' + this.defaultLanguage + '.resx.xml'
				});
			}
			rLog.debug('Language file name = ' + fileId + '; default language = ' + this.defaultLanguage);
			var fileObject = rFile.load({
				id: fileId
			});
			rLog.endMethod();
			return fileObject.getContents();
		};

		return module;
	}
);