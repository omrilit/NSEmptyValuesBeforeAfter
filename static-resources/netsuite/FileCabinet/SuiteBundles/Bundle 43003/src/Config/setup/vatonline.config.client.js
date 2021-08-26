/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

var Tax;
if (!Tax) Tax = {};

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.href);
  if(results == null)
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}

function OnPageInit() {
	try {
		for (var i = 0; i < document.forms.length; ++i)
		{
			document.forms[i].setAttribute("autocomplete", "off");

			if (document.forms[i].elements["subid"])
			{
				document.forms[i].elements["subid"].onchange = SubsidiaryOnChange;
			}
		}
		if (getParameterByName('custpage_nexus')) {
			ShowTab("custpage_reporting",false); 
		} else if (getParameterByName('custpage_defaultingnexus')) {
			ShowTab("custpage_defaulting",false); 
		} else if (getParameterByName('custpage_nonded_subsidiaryid')) {
			ShowTab("custpage_nonded",false);
		}
	} catch(ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "OnPageInit", errorMsg);
	}
}

function OnFieldChange(type, name) {
	try {
		if (name == 'custpage_nexus') {
			setWindowChanged(window, false);
			var newurl = [nlapiResolveURL('SUITELET', 'customscript_tax_return_setup', 'customdeploy_tax_return_setup')];
			newurl.push("&custpage_nexus=" + nlapiGetFieldValue('custpage_nexus'));
			window.location = newurl.join("");
		}  else if (name == 'custpage_defaultingnexus') {
			setWindowChanged(window, false);
			var newdefurl = [nlapiResolveURL('SUITELET', 'customscript_tax_return_setup', 'customdeploy_tax_return_setup')];
			newdefurl.push("&custpage_defaultingnexus=" + nlapiGetFieldValue('custpage_defaultingnexus'));
			window.location = newdefurl.join("");
		} else if (name == "custpage_nonded_subsidiaryid") {
			setWindowChanged(window, false);
			var newurl = [nlapiResolveURL('SUITELET', 'customscript_tax_return_setup', 'customdeploy_tax_return_setup')];
			newurl.push("&custpage_nonded_subsidiaryid=" + nlapiGetFieldValue('custpage_nonded_subsidiaryid'));
			window.location = newurl.join("");
		}
	} catch(ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "OnFieldChange", errorMsg);
	}
}

function SubsidiaryOnChange() {
	try {
		setWindowChanged(window, false);
		var newurl = [nlapiResolveURL('SUITELET', 'customscript_tax_return_setup', 'customdeploy_tax_return_setup')];
		newurl.push("&subid=" + nlapiGetFieldValue('subid'));
		window.location = newurl.join("");
		
	} catch(ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "SubsidiaryOnChange", errorMsg);
	}
} 

function addDefaultNotc() {
	try {
		var trantype = nlapiGetFieldValues('custpage_trantype');
		var notcdef = nlapiGetFieldValue('custpage_notcdef');
		if (!notcdef) {
			alert("Please specify an NOTC");
			return true;
		}
		
		if (!trantype || trantype.length == 0) {
			alert("Please specify a transaction type");
			return true;
		}
		
		setWindowChanged(window, false);
		var newurl = [nlapiResolveURL('SUITELET', 'customscript_tax_return_setup', 'customdeploy_tax_return_add_default_notc')];
		newurl.push("&custpage_trantype=" + trantype);
		newurl.push("&custpage_defaultingnexus=" + nlapiGetFieldValue('custpage_defaultingnexus'));
		newurl.push("&custpage_notcdef=" + notcdef);
		window.location = newurl.join("");
	} catch(ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "onNewNotc", errorMsg);
	}
}

function addNewNotc() {
	try {
		setWindowChanged(window, false);
		var newurl = nlapiResolveURL('RECORD', 'customrecord_notc') + "&custrecord_notc_country=" + nlapiGetFieldValue('custpage_nexus') + "&custpage_nexuscode=" + nlapiGetFieldValue('custpage_nexuscode') + "&custpage_notcid=" + nlapiGetFieldValue('custpage_notcid');
		window.location = newurl;
		/*
		nlExtOpenWindow(newurl, 'td', 800, 200, null, false, '', {"beforeclose": function() {
			var closeurl = [nlapiResolveURL('SUITELET', 'customscript_tax_return_setup', 'customdeploy_tax_return_setup')];
			closeurl.push("&custpage_nexus=" + nlapiGetFieldValue('custpage_nexus'));
			
		}});
		*/
		
	} catch(ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "addNewNotc", errorMsg);
	}
}

function onInactivateDefaultNOTC() {
	try {
		var notccount = nlapiGetLineItemCount('custpage_notc_sublist');
		var inactivatedlist = [];
		
		for(var irow = 1; irow <= notccount; irow++) {
			if(nlapiGetLineItemValue('custpage_notc_sublist', 'custpage_inactive', irow) == 'T') {
				inactivatedlist.push(nlapiGetLineItemValue('custpage_notc_sublist', 'custrecord_id', irow));
			}
		}
		
		setWindowChanged(window, false);
		var newurl = [nlapiResolveURL('SUITELET', 'customscript_tax_return_setup', 'customdeploy_tax_return_inactivate_notc')];
		newurl.push("&custpage_defaultingnexus=" + nlapiGetFieldValue('custpage_defaultingnexus'));
		newurl.push("&custpage_inactivelist=" + inactivatedlist.join("|"));
		window.location = newurl.join("");
	} catch(ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "onNewNotc", errorMsg);
	}
}