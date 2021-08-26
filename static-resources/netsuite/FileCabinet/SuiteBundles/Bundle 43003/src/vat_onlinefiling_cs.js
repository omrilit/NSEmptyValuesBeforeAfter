/**
 * Copyright © 2014, 2019, Oracle and/or its affiliates. All rights reserved.
 */
var ELEMENTS = {
	CHECKBOX: {
		MTD: 'mtd'
	}
};

function OnSave() {
	validateSetupFiling(saveFiling);
}

function validateSetupFiling(callback) {
	var requestParams = {};
	getFieldValues.call(requestParams, 'input');
	getFieldValues.call(requestParams, 'select');
	
	Ext.Ajax.request({
		url: getUrl({actiontype: 'validate', type: 'form'}),
		timeout: 300000,
		params: requestParams,
		method: 'POST',
		success: function(xhr) {
			var objmsg = Ext.decode(xhr.responseText);
			
			var messagelist = [];
			for(var imsg = 0; imsg < objmsg.length; imsg++) {
				if (objmsg[imsg].status == 'fail') {
					messagelist.push(objmsg[imsg].message);
				}
			}
			
			if (messagelist.length > 0) {
				Ext.Msg.show({
					title:'You cannot submit the form due to the following errors',
					msg: messagelist.join('<br/>'),
					buttons: Ext.Msg.OK,
					icon: Ext.MessageBox.WARNING,
					width: 400
				});
			} else {
				callback();
			}
		},
		failure: function() {
			Ext.Msg.show({
				title:'You cannot submit the form due to the following error(s)',
				msg: 'Validation Callback Failed',
				buttons: Ext.Msg.OK,
				icon: Ext.MessageBox.Error,
				width: 400
			});
		}
	});
}

function saveFiling() {
	var requestParams = {};
	getFieldValues.call(requestParams, 'select');
	
	var fields = Ext.select('input');
	var elements = fields.elements;
	for(var ielem = 0; ielem < elements.length; ielem++) {
		var element = elements[ielem];
		
		switch(element.type) {
			case 'radio': 
				if (element.checked) {
					requestParams[element.id] = element.value;
				}
				break;
			case 'checkbox':
				requestParams[element.id] = element.checked?'T':'F';
				break;
			default:
				requestParams[element.id] = escape(element.value);
				break;
		}
	}

	Ext.MessageBox.show({
		title: 'Saving settings',
		msg: 'Please wait...',
		progressText: 'Saving...',
		width: 300,
		wait: true,
		waitConfig: {interval:200}
	});

	Ext.Ajax.request({
		url: getUrl({actiontype: 'onlinefiling', onlinefiling: 'save'}),
		params: requestParams,
		timeout: 300000,
		method: 'POST',
		success: function(xhr) {
			parent.Ext.WindowMgr.get('custwindow_onlinefiling').close();
		}, 
		failure: function(xhr) {
			parent.Ext.WindowMgr.get('custwindow_onlinefiling').close();
		}
	});	
}

function getUrl(params) {
	var filters = parent.getReportFilters();
	for (var filter in filters) {
		params[filter] = filters[filter];
	}
	
	var urlManager = new VAT.UrlManager(nlapiResolveURL('SUITELET', 'customscript_vat_main', 'customdeploy_vat_ui'));
	urlManager.addUrlParameters(params);
	return urlManager.getFullUrl();
}

function OnCancel() {
	cancelSetup();
}

function cancelSetup() {
	parent.Ext.WindowMgr.get('custwindow_onlinefiling').close();
}

function getFieldValues(fieldType) {
	var field = Ext.select(fieldType);
	var elements = field.elements;
	for(var element = 0; element < elements.length; element++) {
		var currentElement = elements[element];
		
		if(currentElement.multiple) {
			var selectedValues = [];
			for (var i = 0; i < currentElement.options.length; i++) {
		         if(currentElement.options[i].selected){
		        	 selectedValues.push(currentElement.options[i].value);
		          }
		      }
			this[currentElement.id] = selectedValues.join('|');
		} else {
			this[currentElement.id] = currentElement.value;
		}
	}
}

function showCal(refobj) {
	var defaultvalue = refobj.value?refobj.value:new Date().toString();
	new Ext.Window({
		closeAction: 'hide',
		width: 193, 
		height: 230,
		layout : 'fit',
		hideBorders : true,
		items: {
			xtype: 'datepicker',
			format: 'm/d/y',
			value: new Date(defaultvalue),
			listeners: {
				select: function(obj, date) {
					var dt = new Date(date);
					refobj.value = dt.format('m/d/Y');
					this.findParentByType('window').hide();
				}
			}
		}
	}).show();
}

function validateAmount(obj) {
	try {
		if (nlapiFormatCurrency(obj.value)) {
			obj.value = nlapiFormatCurrency(obj.value);
		} else {
			 obj.value = nlapiFormatCurrency(0);
		}
	} catch(ex) {
		alert(ex);
	}
}

function isNumeric(eventObj, obj) {
	var numReservedChar = (nlapiFormatCurrency(0)).substring(1).length;

	var keyCode = (document.all) ? eventObj.keyCode : eventObj.which;  //Check For Browser Type      
	
	if (keyCode <= 31)  //Ignore control characters
		return true;
	
	if (keyCode == '.'.charCodeAt(0))
		return obj.value.indexOf('.') == -1;
	
	if ((obj.value.indexOf('.') == -1) && (obj.value.length == (obj.maxLength - numReservedChar))){
		return keyCode == '.'.charCodeAt(0);
		
	}
	
	return (keyCode >= '0'.charCodeAt(0)) && (keyCode <= '9'.charCodeAt(0));
}

Ext.onReady(function(){
	var data = Ext.decode(nlapiGetFieldValue('metadata'));
	
	var selfields = Ext.select('select');
	var selelements = selfields.elements;
	for(var iselelem = 0; iselelem < selelements.length; iselelem++) {
		var selelement = selelements[iselelem];
		if (data[selelement.id]) {
			Ext.each(selelement.options, function(item, index){
				 if(item.value == data[selelement.id]) {
					 selelement.selectedIndex = index;
				 }
			});
		}
	}
	
	var radiofield = Ext.select('input[type=radio]');
	var relements = radiofield.elements;
	for(var irelem = 0; irelem < relements.length; irelem++) {
		var relement = relements[irelem];
		
		if (data[relement.id] == relement.value) {
			relement.click();
		}
	}
	
	var checkfield = Ext.select('input[type=checkbox]');
	var celements = checkfield.elements;
	var isMTD = false;
	for(var icelem = 0; icelem < celements.length; icelem++) {
		var celement = celements[icelem];

		if (data[celement.id] == 'T') {
			celement.checked = true;
		}
		
		switch(celement.id) {
			case ELEMENTS.CHECKBOX.MTD: isMTD = data[celement.id] == 'T'; break;
		}
	}
	
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
	
	setFieldHelp();
});
