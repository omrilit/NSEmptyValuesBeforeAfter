/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var KEYS = {
	SUBSIDIARY_FIELD: 'custpage_subid',
	REPORT_TYPE_FIELD: 'custpage_type',
	COUNTRY_FORM_FIELD: 'custpage_countryform'
}

function fieldChanged(type, name) {
	switch (name) {
		case KEYS.SUBSIDIARY_FIELD:
			OnSubsidiaryChange();
			break;
		case KEYS.REPORT_TYPE_FIELD:
			OnReportTypeChange();
			break;
		case KEYS.COUNTRY_FORM_FIELD:
			OnCountryFormChange();
			break;
	}
}

function pageInit() {
	try {
		if (document.getElementById("main_mh"))
			document.getElementById("main_mh").style.display = "none";

		if (document.getElementById("custpage_intrastat_listmarkall"))
			document.getElementById("custpage_intrastat_listmarkall").onclick = OnMarkAll;

		if (document.getElementById("custpage_intrastat_listunmarkall"))
			document.getElementById("custpage_intrastat_listunmarkall").onclick = OnUnmarkAll;

		var pageoption = nlapiGetFieldValue('custpage_pageoption');
		if (pageoption) {
			Ext.get('custpage_intrastat_list_layer').select('tr:first').createChild("<td align='right'><div align='right' style='font: 11px Verdana,Arial,Helvetica,sans-serif;'>" + pageoption + "</div></td>");
		}

		if (nlapiGetField("custpage_exportfileid")) {
			var exportfileid = nlapiGetFieldValue("custpage_exportfileid");

			if (!isNaN(parseInt(exportfileid))) {
				var routeurl = [nlapiResolveURL("SUITELET", "customscript_intrastat_listdisp", "customdeploy_intrastat_listdisp")];
				routeurl.push("&actiontype=route&exportfileid=" + parseInt(exportfileid));
				window.open(routeurl.join(""));
			} else {
				alert("An error occurred during export.  Please contact customer service.");
			}
		}
	} catch (ex) {

	}
}

function OnMarkAll() {
	if (nlapiGetField("custpage_markall")) {
		nlapiSetFieldValue("custpage_markall", "marked");
	}
	custpage_intrastat_listMarkAll(true);
	return false;
}

function OnUnmarkAll() {
	if (nlapiGetField("custpage_markall")) {
		nlapiSetFieldValue("custpage_markall", "unmarked");
	}
	custpage_intrastat_listMarkAll(false);
	return false;
}

function OnPageChange(value) {
	nlapiSetFieldValue('custpage_pageno', value);
	setWindowChanged(window, false);
	if (document.forms['main_form'].onsubmit()) {
		document.forms['main_form'].elements['_button'].value = 'submitter';
		document.forms['main_form'].submit();
	}
}

function OnReportTypeChange() {
	setWindowChanged(window, false);
	var refreshUrl = nlapiResolveURL("SUITELET", "customscript_intrastat_listdisp", "customdeploy_intrastat_listdisp");
	var url = [];
	url.push(refreshUrl);
	url.push("&custpage_subid=" + nlapiGetFieldValue("custpage_subid"));
	url.push("&custpage_isconsolidated=" + nlapiGetFieldValue("custpage_isconsolidated"));
	url.push("&custpage_fromperiodid=" + nlapiGetFieldValue("custpage_fromperiodid"));
	url.push("&custpage_toperiodid=" + nlapiGetFieldValue("custpage_toperiodid"));
	url.push("&custpage_countryform=" + nlapiGetFieldValue("custpage_countryform"));
	url.push("&custpage_type=" + nlapiGetFieldValue("custpage_type"));
	window.location = url.join("");
}

function OnCountryFormChange() {
	setWindowChanged(window, false);
	var refreshUrl = nlapiResolveURL("SUITELET", "customscript_intrastat_listdisp", "customdeploy_intrastat_listdisp");
	var url = [];
	url.push(refreshUrl);
	url.push("&custpage_subid=" + nlapiGetFieldValue("custpage_subid"));
	url.push("&custpage_isconsolidated=" + nlapiGetFieldValue("custpage_isconsolidated"));
	url.push("&custpage_fromperiodid=" + nlapiGetFieldValue("custpage_fromperiodid"));
	url.push("&custpage_toperiodid=" + nlapiGetFieldValue("custpage_toperiodid"));
	url.push("&custpage_countryform=" + nlapiGetFieldValue("custpage_countryform"));
	url.push("&custpage_type=" + nlapiGetFieldValue("custpage_type"));
	window.location = url.join("");
}

function OnSubsidiaryChange() {
	setWindowChanged(window, false);
	var refreshUrl = nlapiResolveURL("SUITELET", "customscript_intrastat_listdisp", "customdeploy_intrastat_listdisp");
	var url = [];
	url.push(refreshUrl);
	url.push("&custpage_subid=" + nlapiGetFieldValue("custpage_subid"));
	url.push("&custpage_isconsolidated=" + nlapiGetFieldValue("custpage_isconsolidated"));
	url.push("&custpage_fromperiodid=" + nlapiGetFieldValue("custpage_fromperiodid"));
	url.push("&custpage_toperiodid=" + nlapiGetFieldValue("custpage_toperiodid"));
	url.push("&custpage_type=" + nlapiGetFieldValue("custpage_type"));

	window.location = url.join("");
}

function OnRefreshIntrastat() {
	setWindowChanged(window, false);
	var refreshUrl = nlapiResolveURL("SUITELET", "customscript_intrastat_listdisp", "customdeploy_intrastat_listdisp");
	var url = [];
	url.push(refreshUrl);
	url.push("&custpage_subid=" + nlapiGetFieldValue("custpage_subid"));
	url.push("&custpage_isconsolidated=" + nlapiGetFieldValue("custpage_isconsolidated"));
	url.push("&custpage_fromperiodid=" + nlapiGetFieldValue("custpage_fromperiodid"));
	url.push("&custpage_toperiodid=" + nlapiGetFieldValue("custpage_toperiodid"));
	url.push("&custpage_countryform=" + nlapiGetFieldValue("custpage_countryform"));
	url.push("&custpage_type=" + nlapiGetFieldValue("custpage_type"));
	window.location = url.join("");
}

function onExport(exportid, timestampformat) {
	nlapiSetFieldValue('custpage_pageno', nlapiGetFieldValue("custpage_pageno"));
	nlapiSetFieldValue('custpage_exportid', exportid);
	var timestamp = new Date();
	if (!timestampformat) {
		timestampformat = "MMddyyHHmmss";
	}
	nlapiSetFieldValue('custpage_timestamp', timestamp.toString(timestampformat));

	setWindowChanged(window, false);
	if (document.forms['main_form'].onsubmit()) {
		document.forms['main_form'].elements['_button'].value = 'submitter';
		document.forms['main_form'].submit();
	}
}

Ext.onReady(function() {
	Ext.select('.x-btn-text').setStyle({
		'font-size': '14px',
		'color': '#333333',
		'font-weight': 600,
		'padding': '0px 12px',
		'height': '23px'
	});
});