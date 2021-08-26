/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var ECSALES;
if (!ECSALES){ ECSALES = {}; }
ECSALES.Class = {};
ECSALES.Constant = {};
ECSALES.Print = {};

ECSALES.Constant._INDICATOR_FIELDID_DD_PREFIX = 'ecindselect';
ECSALES.Constant._INDICATOR_FIELDID_HF_PREFIX = 'ecindselhidden';
ECSALES.Constant._EXCLUDE_FIELDID_CB_PREFIX = 'ecexcludecheck';
ECSALES.Constant._COUNTRYCODE_HF_PREFIX = 'eccountrycodehidden';
ECSALES.Constant._AMOUNT_HF_PREFIX = 'ecamounthidden';
ECSALES.Constant._CUSTOMERNAME_HF_PREFIX = 'eccustnamehidden';

// url parameters...
ECSALES.Constant._TAXPERIOD_URL_PARAM = 'custscript_ecsalestaxperiodid';
ECSALES.Constant._SUBSIDIARY_URL_PARAM= 'custscript_ecsalessubsld';
ECSALES.Constant._NEXUS_COUNTRY_CODE_URL_PARAM = 'custpage_nexus_cc';
ECSALES.Constant._IS_CONSOLIDATED = "custpage_isconsolidated";
ECSALES.Constant._COUNTRY_FORM = "custpage_countryform";
ECSALES.Constant._LOG_XML_REQUEST_URL_PARAM = 'logxml'; 
ECSALES.Constant._FROMDATE_URL_PARAM = 'custscript_ecsalesfromdateld';
ECSALES.Constant._TODATE_URL_PARAM = 'custscript_ecsalestodateld';
 
function pageInit () {
	if (document.getElementById("main_mh")) 
	document.getElementById("main_mh").style.display = "none";
	
	if (document.forms['main_form'].elements['custscript_ecsalessubsld'])
	document.forms['main_form'].elements['custscript_ecsalessubsld'].onchange = OnSubsidiaryChange;

	if (document.forms['main_form'].elements['custpage_countryform'])
	document.forms['main_form'].elements['custpage_countryform'].onchange = OnCountryFormChange;	
	
	if (document.getElementById("custpage_ecsales_listmarkall"))
	document.getElementById("custpage_ecsales_listmarkall").onclick = OnMarkAll;
		
	if (document.getElementById("custpage_ecsales_listunmarkall"))
	document.getElementById("custpage_ecsales_listunmarkall").onclick = OnUnmarkAll;
	createPageOptions();
}

function OnMarkAll() {
	if (nlapiGetField("custpage_markall")) {
		nlapiSetFieldValue("custpage_markall", "marked");
	}
	custpage_ecsales_listMarkAll(true);
	return false;
}

function OnUnmarkAll() {
	if (nlapiGetField("custpage_markall")) {
		nlapiSetFieldValue("custpage_markall", "unmarked");
	}
	custpage_ecsales_listMarkAll(false);
	return false;
}

function OnPageChange(value, countryform, sublistname) {
	var result = processEcSales(countryform, sublistname);
	var newExcludeList = nlapiGetFieldValue('custpage_exclude') + result.excludeList.join("|");
	var newIndicatorList = nlapiGetFieldValue('custpage_indicator') + result.indicatorList.join("|");
	
	nlapiSetFieldValue('custpage_exclude', result.excludeList.join("|"));
	nlapiSetFieldValue('custpage_indicator', result.indicatorList.join("|"));
	nlapiSetFieldValue('custpage_pageno', value);
	setWindowChanged(window, false);
	if (document.forms['main_form'].onsubmit()) {
		document.forms['main_form'].elements['_button'].value= 'submitter';
		document.forms['main_form'].submit();
	}
}

function createPageOptions() {	
	var pageoption = nlapiGetFieldValue('custpage_pageoption');
	if (pageoption) {
		Ext.get('custpage_ecsales_list_layer').select('tr:first').createChild("<td align='right'>"+pageoption+"</td>");
	}
}

function OnCountryFormChange() {
	var url = [];
		url.push(nlapiGetFieldValue("urlrefresh"));
		url.push("&custscript_ecsalessubsld=" + nlapiGetFieldValue("custscript_ecsalessubsld"));
		url.push("&custpage_isconsolidated=" + nlapiGetFieldValue("custpage_isconsolidated"));
		url.push("&custscript_ecsalesfromdateld=" + nlapiGetFieldValue("custscript_ecsalesfromdateld"));
		url.push("&custscript_ecsalestodateld=" + nlapiGetFieldValue("custscript_ecsalestodateld"));
		url.push("&custpage_countryform=" + nlapiGetFieldValue("custpage_countryform"));
		setWindowChanged(window, false);
	window.location = url.join("");
}
	
function OnSubsidiaryChange() {
	var url = [];
		url.push(nlapiGetFieldValue("urlrefresh"));
		url.push("&custscript_ecsalessubsld=" + nlapiGetFieldValue("custscript_ecsalessubsld"));
		url.push("&custpage_isconsolidated=" + nlapiGetFieldValue("custpage_isconsolidated"));
		url.push("&custscript_ecsalesfromdateld=" + nlapiGetFieldValue("custscript_ecsalesfromdateld"));
		url.push("&custscript_ecsalestodateld=" + nlapiGetFieldValue("custscript_ecsalestodateld"));
		setWindowChanged(window, false);
	window.location = url.join("");
}
	
function refreshECSales() {
	var url = [];
		url.push(nlapiGetFieldValue("urlrefresh"));
		url.push("&custscript_ecsalessubsld=" + nlapiGetFieldValue("custscript_ecsalessubsld"));
		url.push("&custpage_isconsolidated=" + nlapiGetFieldValue("custpage_isconsolidated"));
		url.push("&custscript_ecsalesfromdateld=" + nlapiGetFieldValue("custscript_ecsalesfromdateld"));
		url.push("&custscript_ecsalestodateld=" + nlapiGetFieldValue("custscript_ecsalestodateld"));
		url.push("&custpage_countryform=" + nlapiGetFieldValue("custpage_countryform"));
	setWindowChanged(window, false);
	window.location = url.join("");
}

function exportEcSales(hmrcFormat, countryform, sublistname, exportid)  {
	var result = processEcSales(countryform, sublistname);
	
	if (result.isMissingVAT) {
		alert("Some of the transactions do not have the customer's VAT number. We recommend that you update NetSuite with this.");
	} 
	showMessge();
	window.setTimeout("sendEcSales('" + result.indicatorList.join("|") + "','" + result.excludeList.join("|") + "','export', '" + hmrcFormat +"','" + exportid +"' )",1000);
}

function printEcSales(countryform, sublistname) {
	var result = processEcSales(countryform, sublistname);

	if (result.isMissingVAT) {
		alert("Some of the transactions do not have the customer's VAT number. We recommend that you update NetSuite with this.");
	} 
	
	showMessge();
	window.setTimeout("sendEcSales('" + result.indicatorList.join("|") + "','" + result.excludeList.join("|") + "','print')",1000);   
}

function submitEcSales(countryform, sublistname) {
	var result = processEcSales(countryform, sublistname);
	if (result.isMissingVAT) {
		alert("Some of the transactions do not have the customer's VAT number. You must update these records before submission.");
		return;
	} 
	sendEcSales(result.indicatorList.join("|"),result.excludeList.join("|"),'submit');
	alert('Your ESL Report online submission is queued. You can continue working while waiting for the email notification status.');	
}

function processEcSales (countryform, sublistname) {
	var totalCount = nlapiGetLineItemCount(sublistname);
	var isMissingVAT = false;
	var mgr = new ECSALES.ContextManager();
	var objContext = mgr.createContext(ECSALES, "ECSALES.Context." + countryform);
	var colMetaData = objContext.getListColumnMetaData();
	var excludeId = colMetaData[mgr.findIndex(colMetaData, "exclude")].id;
	var rowId = colMetaData[mgr.findIndex(colMetaData, "row")].id;
	var indicatorId = colMetaData[mgr.findIndex(colMetaData, "indicator")].id;
	var indicatorrefId = colMetaData[mgr.findIndex(colMetaData, "indicatorref")].id;
	var vatnoId = colMetaData[mgr.findIndex(colMetaData, "vatno")].id;
	
	var excludeList = [];
	var indicatorList = [];

	for(var iRow = 1; iRow <= totalCount; iRow++) {
		if (nlapiGetLineItemValue(sublistname, excludeId, iRow) == "T") { //Excluded
			excludeList.push(nlapiGetLineItemValue(sublistname, rowId, iRow));
		}
		
		if (!isMissingVAT) {
			var currentVATNo = nlapiGetLineItemValue(sublistname, vatnoId, iRow);
			if (!currentVATNo || currentVATNo == '&nbsp;') {
				isMissingVAT = true;
			}
		}
		var rownumber = nlapiGetLineItemValue(sublistname, rowId, iRow);
		var origIndicator = nlapiGetLineItemValue(sublistname, indicatorrefId, iRow);
		var currentIndicator = nlapiGetLineItemValue(sublistname, indicatorId, iRow);
		
		if (origIndicator != currentIndicator) {
			indicatorList.push(rownumber + ":" + currentIndicator);
		}
	}

	return {
		"excludeList": excludeList,
		"indicatorList": indicatorList,
		"totalCount": totalCount,
		"isMissingVAT": isMissingVAT
	};
}

function sendEcSales(indicatorList, excludeList, type, hmrcFormat, exportid)  {
	var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) { alert("Browser does not support HTTP Request"); return; }

	var params = [];
	var suiteletUrl;
	if (type == "export") {
		suiteletUrl = nlapiResolveURL('SUITELET', 'customscript_new_ec_sales_listdisp', 'customdeploy_new_ec_sales_export');
		params.push("&custpage_hmrcformat=" + hmrcFormat);
		params.push("&custpage_exportid=" + exportid);
	} else if (type == "print") {
		suiteletUrl = nlapiResolveURL('SUITELET', 'customscript_new_ec_sales_listdisp', 'customdeploy_new_ec_sales_print');
	} else if (type == "submit") {
		suiteletUrl = nlapiResolveURL('SUITELET', 'customscript_new_ec_sales_listdisp', 'customdeploy_new_ec_sales_queuehmrc');
	} else {
		alert("Invalid Post URL.  Please contact support");
		return;
	}
	
	params.push("&custscript_ecsalessubsld=" + nlapiGetFieldValue("custscript_ecsalessubsld"));
	params.push("&custpage_isconsolidated=" + nlapiGetFieldValue("custpage_isconsolidated"));
	params.push("&custpage_countryform=" + nlapiGetFieldValue("custpage_countryform"));
	params.push("&custscript_ecsalesfromdateld=" + nlapiGetFieldValue("custscript_ecsalesfromdateld"));
	params.push("&custscript_ecsalestodateld=" + nlapiGetFieldValue("custscript_ecsalestodateld"));
	params.push("&custpage_indicator=" + indicatorList);
	params.push("&custpage_exclude=" + excludeList);
	params.push("&custpage_markall=" + nlapiGetFieldValue("custpage_markall"));

	if (document.getElementById('custpage_displaypageno')) {
		params.push("&custpage_cachefileid=" + nlapiGetFieldValue("custpage_cachefileid"));
		params.push("&custpage_cachefilename=" + nlapiGetFieldValue("custpage_cachefilename"));
		params.push("&custpage_filterfileid=" + nlapiGetFieldValue("custpage_filterfileid"));		
		params.push("&custpage_filterfilename=" + nlapiGetFieldValue("custpage_filterfilename"));
		params.push("&custpage_pageno=" + document.getElementById('custpage_displaypageno').value);
	}

	var sublistname = "custpage_ecsales_list";
	if (nlapiGetFieldValue("custpage_countryform").substring(0, 2) == "CZ") {
		var cancelmap = {};
		var totalCount = nlapiGetLineItemCount(sublistname);
		for(var iRow = 1; iRow <= totalCount; iRow++) {
			var value = nlapiGetLineItemValue(sublistname, "custpage_4873_cancel", iRow);
			cancelmap[nlapiGetLineItemValue(sublistname, "custpage_4873_row", iRow)] = value?value:"F";  
		}
		
		params.push("&custpage_cancel=" + Ext.encode(cancelmap));
	}

	if (navigator.userAgent.indexOf('MSIE') !=-1){ xmlHttp.open("POST", suiteletUrl, false); }
    else{ xmlHttp.open("POST", suiteletUrl, true); }

    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.setRequestHeader("Content-length", params.join("").length);
    xmlHttp.setRequestHeader("Connection", "close");
    
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) { 
			if (type != 'submit') {
				hideMessge();
				//window.open(xmlHttp.responseText);
				var fileid = parseInt(xmlHttp.responseText)
				var fileurl = nlapiResolveURL('SUITELET', 'customscript_new_ec_sales_listdisp', 'customdeploy_new_ec_sales_listdisp') + "&actiontype=openfile&fileid=" + fileid;
				window.open(fileurl);
			}
		} else if (this.readyState == 4 && this.status != 200) {
			if (type != 'submit') {
				hideMessge();
				alert("An error was encountered during file generation.  Please contact support.");
			}
		}
    }
	xmlHttp.send(encodeURI(params));
}

function showMessge() {
	var messageObj = document.getElementById('4873light');
	messageObj.style.display='block';
	messageObj.style.top=(Number(screen.height/4).toFixed(0));
	messageObj.style.left=(Number(screen.width/3).toFixed(0));
}

function hideMessge() {
	document.getElementById('4873light').style.display='none';
}

function getUrlParamValue(name) {
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");  
    var regexS = "[\\?&]"+name+"=([^&#]*)";  
    var regex = new RegExp( regexS );  
    var results = regex.exec( window.location.href );  
    if (results == null) { return ""; }
    else { return results[1]; }
}

function GetXmlHttpObject(handler) {
    var objXMLHttp = null;
    if (window.XMLHttpRequest) 
    {
        objXMLHttp = new XMLHttpRequest();
    }
    else 
        if (window.ActiveXObject) 
        {
            objXMLHttp = new ActiveXObject("Msxml2.XMLHTTP");
        }
    return objXMLHttp;
}

Ext.onReady(function(){
	var isNewVersion = nlapiGetContext().version === '2014.1' ? false : true;
	if (isNewVersion) {
		Ext.select('.x-btn-text').setStyle({
			'font-size': '14px',
			'color': '#333333',
			'font-weight': 600,
			'padding':'0px 12px',
			'height':'23px'
			 });
	}
});
