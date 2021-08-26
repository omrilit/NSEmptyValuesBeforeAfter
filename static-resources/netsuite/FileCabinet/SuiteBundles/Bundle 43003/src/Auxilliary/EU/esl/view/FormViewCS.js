/**
 * Copyright © 2006, 2017, Oracle and/or its affiliates. All rights reserved. 
 */

var CUSTPAGE_PREFIX = 'custpage_';
var CONSTANTS = null;

function pageInit() {
	CONSTANTS = JSON.parse(nlapiGetFieldValue(CUSTPAGE_PREFIX + 'constants'));
	setGroupDisplayType();
}

function fieldChanged(type, name) {
	switch (name) {
		case CUSTPAGE_PREFIX + CONSTANTS.FIELD.SUB_ID:
			refreshEslWithNewSubsidiary();
			break;
		case CUSTPAGE_PREFIX + CONSTANTS.FIELD.COUNTRY_FORM:
			refreshEsl();
			break;
		case CUSTPAGE_PREFIX + CONSTANTS.FIELD.BOOK_ID:
			setGroupDisplayType();
			break;
		case CUSTPAGE_PREFIX + CONSTANTS.FIELD.FROM_DATE:
		case CUSTPAGE_PREFIX + CONSTANTS.FIELD.TO_DATE:
            setRefreshFlag();
            break;
		default:
			break;
	}
}

function setGroupDisplayType() {
	var groupField = nlapiGetField(CUSTPAGE_PREFIX + CONSTANTS.FIELD.IS_CONSOLIDATED);
	if (!groupField) {
		return;
	}

	if (parseInt(nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.BOOK_ID)) > 1) {
		groupField.setDisplayType('hidden');
	} else {
		groupField.setDisplayType('normal');
	}
}

function handleEvent(actionType, actionParams) {
    switch (actionType) {
        case CONSTANTS.ACTIONTYPE.ESL_REFRESH: refreshEsl(); break;
        case CONSTANTS.ACTIONTYPE.ESL_PRINT: exportEsl('PDF'); break;
        case CONSTANTS.ACTIONTYPE.ESL_MAPPER_EXPORT: exportEsl(actionParams); break;
        case CONSTANTS.ACTIONTYPE.ESL_GB_SUBMIT_HMRC: submitHmrc('PDF'); break;
        case CONSTANTS.ACTIONTYPE.ESL_SETUP_TAX_FILING: setupTaxFiling(); break;
    }
}

function beforeEvent_BE(msg){
    var periodFrom = nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.FROM_DATE),
        periodTo = nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.TO_DATE);
    
    if(nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.REFRESH_FLAG)==='T'){ //modify to include other reports in another backlog
        alert(CONSTANTS.MESSAGES.ERR_NEEDREFRESH);
        return;
    } else if(periodFrom!=periodTo){
        alert(msg);
        return;
    }
    
    var yearPeriods = JSON.parse(nlapiGetFieldValue(CUSTPAGE_PREFIX + 'yearperiods'));
    if(yearPeriods.indexOf(+periodFrom)>-1){
        alert(msg);
        return;
    }
    
    handleEvent('export', 'XML');
}

function setRefreshFlag(){
    nlapiSetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.REFRESH_FLAG, 'T');
}

function getURL(){
	var url = nlapiResolveURL('SUITELET', CONSTANTS.SCRIPT.ESL, CONSTANTS.REPORT_MAP.eslOnlineDeployment);
	var urlMgr = new VAT.UrlManager(url);
	urlMgr.addUrlParameter(CONSTANTS.FIELD.COUNTRY_FORM, nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.COUNTRY_FORM));
	urlMgr.addUrlParameter(CONSTANTS.FIELD.SUB_ID, nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.SUB_ID));
	urlMgr.addUrlParameter(CONSTANTS.FIELD.IS_CONSOLIDATED, nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.IS_CONSOLIDATED));
	urlMgr.addUrlParameter(CONSTANTS.FIELD.FROM_DATE, nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.FROM_DATE));
	urlMgr.addUrlParameter(CONSTANTS.FIELD.TO_DATE, nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.TO_DATE));
	urlMgr.addUrlParameter(CONSTANTS.FIELD.BOOK_ID, nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.BOOK_ID));
	return urlMgr;
}

function refreshEsl() {
	var url = getURL();
	url.addUrlParameter(CONSTANTS.FIELD.CLEAR_CACHE, 'T');
	NS.form.setChanged(false);
	window.location = url.getFullUrl();
}

function refreshEslWithNewSubsidiary() {
	var url = getURL();
	url.addUrlParameter(CONSTANTS.FIELD.CLEAR_CACHE, 'T');
	url.removeUrlParameter(CONSTANTS.FIELD.COUNTRY_FORM);
	NS.form.setChanged(false);
	window.location = url.getFullUrl();
}

function exportEsl(fileType) {
	var url = getURL();
	url.addUrlParameter(CONSTANTS.FIELD.ACTION_TYPE, CONSTANTS.ACTIONTYPE.ESL_EXPORT);
	url.addUrlParameter(CONSTANTS.FIELD.FILE_TYPE, fileType);
	callExport('Creating file', 'Creating file', url.getFullUrl());
}

function callExport(title, progressText, url) {
	Ext.MessageBox.show({
		title: title,
		msg: 'Please wait...',
		progressText: progressText,
		width: 300,
		wait: true,
		waitConfig: {interval:200}
	});

	Ext.Ajax.request({
		url: url,
		params: {excludeCache: JSON.stringify(excludeCache), indicatorCache: JSON.stringify(indicatorCache), cancelCache: JSON.stringify(cancelCache)},
		timeout: 300000,
		method: 'POST',
		success: function(xhr) {
			Ext.MessageBox.hide();
			var obj = Ext.decode(xhr.responseText);
			obj.message ? alert(obj.message) : null;
			obj.url ? window.open(obj.url) : null;
		}
	});
}

function submitHmrc(fileType) {
	var url = getURL();
	url.addUrlParameter(CONSTANTS.FIELD.ACTION_TYPE, CONSTANTS.ACTIONTYPE.ESL_GB_SUBMIT_HMRC);
	url.addUrlParameter(CONSTANTS.FIELD.FILE_TYPE, fileType);

	Ext.MessageBox.show({
		title: 'Submitting to HMRC',
		msg: 'Please wait...',
		progressText: 'Submitting to HMRC',
		width: 300,
		wait: true,
		waitConfig: {interval:200}
	});

	Ext.Ajax.request({
		url: url.getFullUrl(),
		params: {excludeCache: JSON.stringify(excludeCache), indicatorCache: JSON.stringify(indicatorCache), cancelCache: JSON.stringify(cancelCache)},
		timeout: 300000,
		method: 'POST',
		success: function(xhr) {
			Ext.MessageBox.hide();
			var obj = Ext.decode(xhr.responseText);
			alert(obj.message);
		}
	});
}

function setupTaxFiling() {
	var url = getURL();
	url.addUrlParameter(CONSTANTS.FIELD.ACTION_TYPE, CONSTANTS.ACTIONTYPE.ESL_SETUP_TAX_FILING);
	url.addUrlParameter('section', 'eusales');
	url.addUrlParameter('onlinefiling', 'load');
	url.addUrlParameter('subid', nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.SUB_ID));
	url.addUrlParameter('periodfrom', nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.FROM_DATE));
	url.addUrlParameter('periodto', nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.TO_DATE));
	url.addUrlParameter('eslreport', nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.COUNTRY_FORM));

	nlExtOpenWindow(url.getFullUrl(),'custwindow_onlinefiling', 800, 600, null, false, 'EU Sales Filing Setup');
}

function getCustomerUrl(customerName) {
	try {
		var filters = [new nlobjSearchFilter('entityid', null, 'is', customerName)];
		var columns = [new nlobjSearchColumn('entityid')];
		var rs = nlapiSearchRecord('customer', null, filters, columns);

		var id = null;
		if (rs && rs.length > 0) {
			id = rs[0].getId();

		} else { //Use Global Search
			rs = nlapiSearchGlobal(customerName);
			for (var i = 0; i < rs.length; ++i) {
				if (rs[i].getValue('name').toLowerCase() == customerName.toLowerCase()) {
					id = rs[i].getId();
					break;
				}
			}

			if (!id && rs.length > 0) { //Get the first one
				id = rs[0].getId();
			}
		}
		return nlapiResolveURL('RECORD', 'CUSTOMER', id);
	} catch(ex) {
		logException(ex, 'FormViewCS.getCustomerUrl');
		throw ex;
	}
}

function getTransactionUrl(tranNumber, tranType) {
	try {
		var recordId;
		switch(tranType) {
			case 'RCPT':
				recordId = 'cashsale'; break;
			case 'INV':
				recordId = 'invoice'; break;
			case 'CREDMEM':
				recordId = 'creditmemo'; break;
			case 'RETURN':
				recordId = 'cashrefund'; break;
			case 'GENJRNL':
				recordId = 'journalentry'; break;
			default:
				throw nlapiCreateError('INVALID_TRAN_TYPE', 'Unrecognized transaction type: ' + tranType);
		}

		var filters = [new nlobjSearchFilter('tranid', null, 'is', tranNumber)];
		var columns = [new nlobjSearchColumn('tranid')];
		var rs = nlapiSearchRecord(recordId, null, filters, columns);

		var internalId = null;
		if (rs && rs.length > 0) {
			internalId = rs[0].getId();
		}

		if (internalId) {
			return nlapiResolveURL('RECORD', recordId, internalId);
		} else {
			throw nlapiCreateError('INVALID_TRAN_ID', 'Unrecognized transaction ID: ' + tranNumber + ' of type: ' + tranType);
		}
	} catch(ex) {
		logException(ex, 'FormViewCS.getTransactionUrl');
		throw ex;
	}
}


function getScriptUrl() {
	return nlapiResolveURL('SUITELET', CONSTANTS.SCRIPT.ESL, CONSTANTS.REPORT_MAP.eslOnlineDeployment);
}

function getClass() {
	var form = nlapiGetFieldValue('custpage_countryform').match(/VAT.EU.ESL.(\w+).(\w+).*/);
	var language = form[2];
	var nexus = form[1];
	var nexusObj = CONSTANTS.EU_NEXUSES[nexus];

	if (!nexusObj.feature.euonline) {
		return;
	}

	var vatClasses = nexusObj.vatclass;
	var defaultClass = '';

	if (vatClasses && Object.keys(vatClasses).length > 0) {
		for(var vatClass in vatClasses) {
			if (String(vatClasses[vatClass].LanguageCode).toLowerCase() == language.toLowerCase()) {
				defaultClass = vatClass;
				break;
			}
		}
	}
	return defaultClass;
}

function getReportFilters() { //for Setup > EU Sales Filing
	var reportFilters = {};
	reportFilters.subid = nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.SUB_ID);
	reportFilters.periodfrom = nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.FROM_DATE);
	reportFilters.periodto = nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.TO_DATE);
	reportFilters.isconsolidated = nlapiGetFieldValue(CUSTPAGE_PREFIX + CONSTANTS.FIELD.IS_CONSOLIDATED);
	reportFilters.report = getClass();
	reportFilters.report_index = reportFilters.report;
	return reportFilters;
}