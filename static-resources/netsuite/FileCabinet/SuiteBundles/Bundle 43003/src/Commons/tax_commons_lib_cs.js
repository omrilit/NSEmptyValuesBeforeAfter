/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

//This is a common library for client-side scripts only
function setFieldHelp() {
	Ext.select('.tooltip').each(function(el){
		el.set({"title":"What's this?"});
		el.setStyle('cursor', 'help');
		el.setStyle('text-decoration', 'none');
		el.on('mouseover', function(event, htmlel, obj){
			Ext.get(htmlel.id).setStyle('text-decoration', 'underline');
		});
		el.on('mouseout', function(event, htmlel, obj){
			Ext.get(htmlel.id).setStyle('text-decoration', 'none');
		});

		el.on('click', function(event, htmlel, obj){
			getTaxFieldHelp(event, htmlel, obj, {formid: nlapiGetFieldValue("formid")});
		});
	});
}

function getTaxFieldHelp(event, htmlel, obj, params) {
	var url = [parent.nlapiGetFieldValue("urlmain")];
	url.push('&actiontype=fieldhelp');
	url.push("&report=" + parent.nlapiGetFieldValue("reportindex"));
	url.push("&periodfrom=" + parent.nlapiGetFieldValue("periodfrom"));
	url.push("&periodto=" + parent.nlapiGetFieldValue("periodto"));
	url.push("&subid=" + parent.nlapiGetFieldValue("subid")); 
	url.push("&isconsolidated=" + parent.nlapiGetFieldValue("isconsolidated"));
	url.push("&formid=" + nlapiGetFieldValue("formid"));
	url.push("&fieldid=" + htmlel.id);
	
	Ext.Ajax.request({
		url: url.join(""),
		timeout: 300000,
		method: 'POST',
		success: function(xhr) {
			var msgobj = Ext.decode(xhr.responseText);
			
			var msg = Ext.MessageBox.show({
				title: unescape(msgobj.title),
				msg: unescape(msgobj.text),
				width: 300
			});
			msg.getDialog().setPosition(event.getPageX(), event.getPageY());
		}, 
		failure: function(xhr) {
			Ext.MessageBox.alert("An error occurred while retrieving the field level help.  Please contact technical support");
		}
	});
}