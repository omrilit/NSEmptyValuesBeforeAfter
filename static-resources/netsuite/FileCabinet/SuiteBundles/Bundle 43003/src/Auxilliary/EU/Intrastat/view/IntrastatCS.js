/**
 * Copyright © 2016, Oracle and/or its affiliates. All rights reserved.
 */

var CUSTPAGE_PREFIX = 'custpage_';
var reloadCache = !getUrlParamValue(CONSTANTS.FIELD.COUNTRY_FORM);

var dataReady = false;
function isDataReady() { return dataReady; }

function fieldChanged(type, name) {
	switch (name) {
		case CUSTPAGE_PREFIX + CONSTANTS.FIELD.SUB_ID:
			refreshIntrastat({}, [CONSTANTS.FIELD.COUNTRY_CODE, CONSTANTS.FIELD.COUNTRY_FORM]);
			break;
		case CUSTPAGE_PREFIX + CONSTANTS.FIELD.REPORT_TYPE:
			refreshIntrastat({}, [CONSTANTS.FIELD.COUNTRY_FORM]);
			break;
		case CUSTPAGE_PREFIX + CONSTANTS.FIELD.COUNTRY_FORM:
			refreshIntrastat();
			break;
		default:
			// do nothing
	}
}

function handleEvent(actionType, actionParams) {
	switch (actionType) {
		case CONSTANTS.ACTION_TYPE.REFRESH:
			refreshIntrastat();
			break;
		case CONSTANTS.ACTION_TYPE.SETUP:
			openSetup();
			break;
		case CONSTANTS.ACTION_TYPE.EXPORT:
			exportIntrastat(actionParams);
			break;
		default:
			// do nothing
	}
}

function getUrl() {
	var refreshUrl = nlapiResolveURL('SUITELET', CONSTANTS.SCRIPT.INTRASTAT, CONSTANTS.DEPLOYMENT.INTRASTAT);
	var urlMgr = new VAT.UrlManager(refreshUrl);
	urlMgr.addUrlParameter(CONSTANTS.FIELD.SUB_ID, nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.SUB_ID) || '');
	urlMgr.addUrlParameter(CONSTANTS.FIELD.BOOK_ID, nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.BOOK_ID) || '');
	urlMgr.addUrlParameter(CONSTANTS.FIELD.REPORT_TYPE, nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.REPORT_TYPE));
	urlMgr.addUrlParameter(CONSTANTS.FIELD.COUNTRY_FORM, nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.COUNTRY_FORM));
	urlMgr.addUrlParameter(CONSTANTS.FIELD.FROM_DATE, nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.FROM_DATE));
	urlMgr.addUrlParameter(CONSTANTS.FIELD.TO_DATE, nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.TO_DATE));
	urlMgr.addUrlParameter(CONSTANTS.FIELD.COUNTRY_CODE, nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.COUNTRY_FORM).split('-')[1]);
	urlMgr.addUrlParameter(CONSTANTS.FIELD.LANGUAGE_CODE, nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.LANGUAGE_CODE));
	return urlMgr;
}

function refreshIntrastat(paramsToAdd, paramsToRemove) {
	showMessageBox('Reloading', 'Reloading');

	waitAndExecute(isDataReady, function() {
		var url = getUrl();

		for (var paramName in paramsToAdd) {
			url.addUrlParameter(paramName, paramsToAdd[paramName]);
		}

		for (var i = 0; paramsToRemove && i < paramsToRemove.length; i++) {
			url.removeUrlParameter(paramsToRemove[i]);
		}

		url.addUrlParameter(CONSTANTS.FIELD.RELOAD_CACHE, 'T');

		NS.form.setChanged(false);
		window.location = url.getFullUrl();
	});
}

function openSetup() {
	var urlMgr = getUrl();
	urlMgr.addUrlParameter(CONSTANTS.FIELD.ACTION_TYPE, CONSTANTS.ACTION_TYPE.SETUP);
	urlMgr.addUrlParameter('section', 'intrastat');
	urlMgr.addUrlParameter('onlinefiling', 'load');
	urlMgr.addUrlParameter('subid', nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.SUB_ID) || '');
	urlMgr.addUrlParameter('periodfrom', nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.FROM_DATE));
	urlMgr.addUrlParameter('periodto', nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.TO_DATE));
	nlExtOpenWindow(urlMgr.getFullUrl(),'custwindow_onlinefiling', 800, 600, null, false, 'Intrastat Setup');
}

function exportIntrastat(fileType) {
	var url = getUrl();
	url.addUrlParameter(CONSTANTS.FIELD.COUNTRY_CODE, nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.COUNTRY_CODE));
	url.addUrlParameter(CONSTANTS.FIELD.LANGUAGE_CODE, nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.LANGUAGE_CODE));
	url.addUrlParameter(CONSTANTS.FIELD.ACTION_TYPE, CONSTANTS.ACTION_TYPE.EXPORT);
	url.addUrlParameter(CONSTANTS.FIELD.FILE_TYPE, fileType);
	url.addUrlParameter(CONSTANTS.FIELD.CACHE_NAME, getCacheName(nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.COUNTRY_CODE)));
	url.addUrlParameter(CONSTANTS.FIELD.RELOAD_CACHE, 'F');

	callExport('Creating file', 'Creating file', url.getFullUrl());
}

function callExport(title, progressText, url) {
	showMessageBox(title, progressText);

	waitAndExecute(isDataReady, function() {
		Ext.Ajax.request({
			url: url,
			params: {excludeCache: JSON.stringify(excludeCache), indicatorCache: JSON.stringify(indicatorCache)},
			timeout: 300000,
			method: 'POST',
			callback: function(options, success, response) {
				hideMessageBox();

				if (success) {
					try {
						var obj = Ext.decode(response.responseText);
						obj.message ? alert(obj.message) : null;
						obj.url ? window.open(obj.url) : null;
					} catch(e) {
						alert('File creation failed. Please contact your administrator.');
					}
				} else {
					alert('File creation failed. Please contact your administrator.');
				}
			}
		});
	});
}

function showMessageBox(title, progressText) {
	Ext.MessageBox.show({
		title: title,
		msg: 'Please wait...',
		progressText: progressText,
		width: 300,
		wait: true,
		waitConfig: {interval:200}
	});
}

function hideMessageBox() {
	Ext.MessageBox.hide();
}

function waitAndExecute(fnToWait, fnToExecute) {
	var timeoutId = null;

	timeoutId = window.setInterval(function() {
		if (fnToWait()) {
			window.clearInterval(timeoutId);
			fnToExecute();
		}
	}, 1000);
};

function getCacheName(countryCode) {
	return ['intrastat', countryCode, nlapiGetContext().getUser()].join('-');
}

function getUrlParamValue(name) {
	var matches = location.href.match(new RegExp('[?&]' + name + '=([^&]*)'));
	return matches && matches[1];
}

function getRecordUrl(record, id) {
	return nlapiResolveURL('RECORD', record, id);
}

function getReportFilters() {
	var reportFilters = {};
	reportFilters['subid'] = nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.SUB_ID);
	reportFilters['periodfrom'] = nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.FROM_DATE);
	reportFilters['periodto'] = nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.TO_DATE);
	reportFilters['countryform'] = nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.COUNTRY_FORM);
	return reportFilters;
}