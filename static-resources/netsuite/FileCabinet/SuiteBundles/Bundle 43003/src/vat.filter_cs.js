/**
 * Copyright © 2014, 2018, 2019, Oracle and/or its affiliates. All rights reserved.
 */

if (!Object.keys) {
  Object.keys = (function () {
	'use strict';
	var hasOwnProperty = Object.prototype.hasOwnProperty,
		hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
		dontEnums = [
		  'toString',
		  'toLocaleString',
		  'valueOf',
		  'hasOwnProperty',
		  'isPrototypeOf',
		  'propertyIsEnumerable',
		  'constructor'
		],
		dontEnumsLength = dontEnums.length;

	return function (obj) {
	  if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
		throw new TypeError('Object.keys called on non-object');
	  }

	  var result = [], prop, i;

	  for (prop in obj) {
		if (hasOwnProperty.call(obj, prop)) {
		  result.push(prop);
		}
	  }

	  if (hasDontEnumBug) {
		for (i = 0; i < dontEnumsLength; i++) {
		  if (hasOwnProperty.call(obj, dontEnums[i])) {
			result.push(dontEnums[i]);
		  }
		}
	  }
	  return result;
	};
  }());
}

var KEYS = {
		ACTION_TYPE : 'actiontype',
		ARCHIVED_FILE : 'archivedfile',
		BOOK_ID : 'bookid',
		BOX_NUM : 'boxnum',
		BOX_NAME: 'boxname',
		BUILD_CACHE : 'buildcache',
		COUNTRY_CODE : 'countrycode',
		CREATE_CACHE : 'createcache',
		CUSTPAGE_TAXPERIODLIST : 'custpage_taxperiodlist',
		DRILLDOWN : 'drilldown',
		EXCEL : 'exportexcel',
		HAS_SCHEMA : 'hasschema',
		INTERNAL_ID : 'internalid',
		ID : 'id',
		IS_CONSOLIDATED : 'isconsolidated',
		IS_FLAGGED : 'isflagged',
		LANGUAGE_CODE : 'languagecode',
		LOAD : 'load',
		LOCATION_ID : 'locationid',
		ONLINE_FILING : 'onlinefiling',
		PERIOD_FROM : 'periodfrom',
		PERIOD_TO : 'periodto',
		POPUP : 'popup',
		PREVIEW : 'preview',
		PREVIEW_ONLINE_FILING : 'onlinefilingpreview',
		PRIMARY_BOOK : 'primarybook',
        PRINT_PERIOD_FROM : 'custpage_printperiodfrom',
        PRINT_PERIOD_TO : 'custpage_printperiodto',
		PURCHASE : 'PURCHASE',
		PURCHASE_CACHE : 'purchasecache',
		PURCHASE_CACHE_ID : 'purchasecacheid',
		PURCHASE_DRILL_CACHE : 'purchasedrillcache',
		PURCHASE_DRILLDOWN : 'purchasedrilldown',
		REC_TYPE: 'rectype',
		RECORD_ID : 'recordid',
		REPORT : 'report',
		REPORT_INDEX : 'reportindex',
		REPORT_TYPE : 'reporttype',
		SALE : 'SALE',
		SALE_CACHE : 'salecache',
		SALE_CACHE_ID : 'salecacheid',
		SALE_DRILL_CACHE : 'saledrillcache',
		SALE_DRILLDOWN : 'saledrilldown',
		SUB_ID : 'subid',
		SUBMISSION : 'submission',
		SUPPLEMENTARY : 'supplementary',
		SUPPLEMENTARY2 : 'supplementary2',
		SUPPLEMENTARY_CACHE : 'supplementarycache',
		SUPPLEMENTARY_DATA : 'supplementarydata',
		SUPPLEMENTARY_FORMAT : 'supplementaryformat',
		SUPPLEMENTARY_PURCHASE_CACHE : 'supplementarypurchasecache',
		SUPPLEMENTARY_SALE_CACHE : 'supplementarysalecache',
		SUPPLEMENTARY_TYPE : 'supplementarytype',
		SYSNOTE : 'sysnote',
		SYSNOTE_MTD : 'sysnotemtd',
		TAX_FORM_SCHEMA : 'taxformschema',
		TAX_PERIOD_LIST : 'taxperiodlist',
		TRUE : 'true',
		TYPE : 'type',
		URL_EXPORT : 'urlexport',
		URL_FORMAT : 'urlformat',
		URL_MAIN : 'urlmain',
		URL_PRINT : 'urlprint',
		URL_REFRESH : 'urlrefresh',
		VALIDATE : 'validate',
};
var context = nlapiGetContext();
var isMultibook = context.getFeature("MULTIBOOK");

function pageInit() {

}

function fieldChanged(type, name) {
	switch (name) {
		case KEYS.SUB_ID: OnSubsidiaryChange(); break;
		case KEYS.LOCATION_ID: OnLocationChange(); break;
		case KEYS.REPORT_INDEX: OnReportIndexChange(); break;
		case KEYS.BOOK_ID: OnBookIdChange(); break;
	}
}

function OnSubsidiaryChange() {
	setWindowChanged(window, false);
	var urlMgr = new VAT.UrlManager(getBaseUrl(KEYS.URL_REFRESH));
	urlMgr.addUrlParameter(KEYS.SUB_ID, nlapiGetFieldValue(KEYS.SUB_ID));
	urlMgr.addUrlParameter(KEYS.PERIOD_FROM, nlapiGetFieldValue(KEYS.PERIOD_FROM));
	urlMgr.addUrlParameter(KEYS.PERIOD_TO, nlapiGetFieldValue(KEYS.PERIOD_TO));
	urlMgr.addUrlParameter(KEYS.IS_CONSOLIDATED, nlapiGetFieldValue(KEYS.IS_CONSOLIDATED));
	if (isMultibook) {
		urlMgr.addUrlParameter(KEYS.BOOK_ID, nlapiGetFieldValue(KEYS.BOOK_ID) || '');
	}
	window.location = urlMgr.getFullUrl();
}

function OnReportIndexChange() {
	setWindowChanged(window, false);
	var urlMgr = new VAT.UrlManager(getBaseUrl(KEYS.URL_REFRESH));
	urlMgr.addUrlParameters(getReportFilters());
	urlMgr.addUrlParameter(KEYS.SALE_CACHE_ID, nlapiGetFieldValue(KEYS.SALE_DRILL_CACHE));
	urlMgr.addUrlParameter(KEYS.PURCHASE_CACHE_ID, nlapiGetFieldValue(KEYS.PURCHASE_DRILL_CACHE));
	window.location = urlMgr.getFullUrl();
}

function OnBookIdChange() {
	if (isMultibook) {
		var field = nlapiGetField(KEYS.IS_CONSOLIDATED);
		var adjustfield = Ext.get('adjustment');
		if (!adjustfield) {
			setWindowChanged(window, false);
			return;
		} else {
			if (nlapiGetFieldValue(KEYS.BOOK_ID) != nlapiGetFieldValue(KEYS.PRIMARY_BOOK)) {
				nlapiSetFieldValue(KEYS.IS_CONSOLIDATED, 'F');
				field.setDisplayType('hidden');
				adjustfield.hide();
			} else {
				field.setDisplayType('normal');
				adjustfield.show();
			}
			setWindowChanged(window, false);
		}
	}
}

function OnRefresh() {

	setWindowChanged(window, false);
	var urlMgr = new VAT.UrlManager(getBaseUrl(KEYS.URL_REFRESH));
	urlMgr.addUrlParameters(getReportFilters());
	window.location = urlMgr.getFullUrl();
}

function validateOnlineFiling(callback, isOnlineFiling, noCaching, callbackParams) {
	var urlMgr = new VAT.UrlManager(getBaseUrl(KEYS.URL_MAIN));
	var countryCode = nlapiGetFieldValue(KEYS.COUNTRY_CODE);
	urlMgr.addUrlParameters(getPrintFilters());
	urlMgr.addUrlParameter(KEYS.ACTION_TYPE, KEYS.VALIDATE);
	urlMgr.addUrlParameter(KEYS.TYPE, KEYS.SUBMISSION);
	urlMgr.addUrlParameter(KEYS.COUNTRY_CODE, countryCode);
	urlMgr.addUrlParameter(KEYS.LANGUAGE_CODE, nlapiGetFieldValue(KEYS.LANGUAGE_CODE));
	urlMgr.addUrlParameter(KEYS.TAX_PERIOD_LIST, nlapiGetFieldValue(KEYS.CUSTPAGE_TAXPERIODLIST));

	if(countryCode === 'GB' && isOnlineFiling) {
		var confirm_msg = ['Please indicate that all values to be submitted are final and correct. '];
		confirm_msg.push('It is your responsibility to ensure that these are reviewed and confirmed to be accurate before submission to HMRC.');
		confirm_msg.push('<br><br>');
		confirm_msg.push('<input type="checkbox" id="chkfinal" onclick="toggleOnlineFiling()"/>Final and Correct');

		Ext.MessageBox.buttonText = {
			no: 'CANCEL',
			yes: 'SUBMIT',
			ok: 'OK'
		};
		Ext.MessageBox.getDialog().buttons[1].disable();
		
		Ext.MessageBox.confirm('Important', confirm_msg.join(''), function(btn) {
			if(btn == 'yes') {
				submitOnlineFiling(noCaching);
			}
		});
	} else {
		submitOnlineFiling(noCaching);
	}
	
	function submitOnlineFiling(noCaching) {
		Ext.Ajax.request({
			url: urlMgr.getFullUrl(),
			timeout: 300000,
			method: 'GET',
			success: function(xhr) {
				var objmsg = Ext.decode(xhr.responseText);

				var messagelist = [];
				for(var imsg = 0; imsg < objmsg.length; imsg++) {
					if (objmsg[imsg].status == "fail") {
						messagelist.push(objmsg[imsg].message);
					}
				}
					
				if (messagelist.length > 0) {
					Ext.Msg.show({
						title:'',
						msg: messagelist.join("<br/><br/>"),
						buttons: Ext.Msg.OK,
						width: 400,
						icon: Ext.MessageBox.WARNING
					});
				} else {
					if ((!nlapiGetFieldValue(KEYS.SALE_DRILL_CACHE) || !nlapiGetFieldValue(KEYS.PURCHASE_DRILL_CACHE)) && !noCaching) {

						var urlMgr2 = new VAT.UrlManager(getBaseUrl(KEYS.URL_MAIN));
						urlMgr2.addUrlParameter(KEYS.ACTION_TYPE, KEYS.CREATE_CACHE);
						urlMgr2.addUrlParameter(KEYS.REPORT, nlapiGetFieldValue(KEYS.REPORT_INDEX));
	  					
						Ext.MessageBox.show({
							 title: 'Processing ...',
							 msg: 'Please wait ...',
							 width:300,
							 progress:true,
							 modal: true
						});

						Ext.Ajax.request({
							url: urlMgr2.getFullUrl(),
							timeout: 300000,
							method: 'GET',
							success: function(xhr) {
								var obj = Ext.decode(xhr.responseText);
								nlapiSetFieldValue(KEYS.SALE_DRILL_CACHE, obj.saledrilldown);
								nlapiSetFieldValue(KEYS.PURCHASE_DRILL_CACHE, obj.purchasedrilldown);
							},
							callback: function() {
								generateDrillDownCache("", "", nlapiGetFieldValue(KEYS.CUSTPAGE_TAXPERIODLIST).split(","),
										nlapiGetFieldValue(KEYS.SALE_DRILL_CACHE), nlapiGetFieldValue(KEYS.PURCHASE_DRILL_CACHE), callback);
							}
						});
					} else {
						callback(callbackParams);
					}
				}
			},
			failure: function() {
				Ext.Msg.show({
					title:'You cannot submit the report due to the following errors',
					msg: "Validation Callback Failed",
					buttons: Ext.Msg.OK,
					width: 400,
					icon: Ext.MessageBox.Error
				});
			}
		});
	}
}

function toggleOnlineFiling() {
	var submitBtn = Ext.MessageBox.getDialog().buttons[1];
	
	submitBtn.disabled ? submitBtn.enable() : submitBtn.disable();
}

function OnGeneratePH(){
	validateOnlineFiling(OnSupplementaryPH);
}

function OnGenerateXml() {
	validateOnlineFiling(GenerateXml);
}

function GenerateXml() {

	var urlMgr = new VAT.UrlManager(getBaseUrl(KEYS.URL_EXPORT));
	urlMgr.addUrlParameters(getPrintFilters());
	urlMgr.addUrlParameter(KEYS.SALE_DRILL_CACHE, nlapiGetFieldValue(KEYS.SALE_DRILL_CACHE));
	urlMgr.addUrlParameter(KEYS.PURCHASE_DRILL_CACHE, nlapiGetFieldValue(KEYS.PURCHASE_DRILL_CACHE));
	urlMgr.addUrlParameter(KEYS.TAX_PERIOD_LIST, nlapiGetFieldValue(KEYS.CUSTPAGE_TAXPERIODLIST));

	var inputfields = Ext.select('.amountinput');
	var wholeinputfields = Ext.select('.amountwholeinput');
	var otherinputfields = Ext.select('.textinput');

	if (hasSchema()) {
		urlMgr.addUrlParameters(getInputParams());
		urlMgr.addUrlParameters(getParamsByClassName('amount'));
		urlMgr.addUrlParameters(getParamsByClassName('amountwhole'));
		urlMgr.addUrlParameters(getParamsByClassName('amountcent'));
		urlMgr.addUrlParameters(getParamsByClassName('param'));
	} else {
		var inputelements = inputfields.elements;
		for(var ielem = 0; ielem < inputelements.length; ielem++) {
			var elem = inputelements[ielem];
			urlMgr.addUrlParameter(elem.id, unformat(elem.value));
		}

		var wholeinputelements = wholeinputfields.elements;
		for(var iwholeelem = 0; iwholeelem < wholeinputelements.length; iwholeelem++) {
			var wholeelem = wholeinputelements[iwholeelem];
			urlMgr.addUrlParameter(wholeelem.id, unformat(wholeelem.value));
		}

		var otherinputelements = otherinputfields.elements;
		for(var iotherelem = 0; iotherelem < otherinputelements.length; iotherelem++) {
			var otherelem = otherinputelements[iotherelem];
			urlMgr.addUrlParameter(otherelem.id, unformat(otherelem.value));
		}
	}

	doTransactionFlagging(urlMgr, function callback(urlMgr) {
		window.open(urlMgr.getFullUrl());
	});
};

function OnGenerateXls() {
    GenerateXls();
};

function GenerateXls() {

    var urlMgr = new VAT.UrlManager(getBaseUrl(KEYS.URL_EXPORT));
    urlMgr.addUrlParameters(getPrintFilters());
    urlMgr.addUrlParameter(KEYS.ACTION_TYPE, KEYS.EXCEL);
    urlMgr.addUrlParameter(KEYS.SALE_DRILL_CACHE, nlapiGetFieldValue(KEYS.SALE_DRILL_CACHE));
    urlMgr.addUrlParameter(KEYS.PURCHASE_DRILL_CACHE, nlapiGetFieldValue(KEYS.PURCHASE_DRILL_CACHE));
    urlMgr.addUrlParameter(KEYS.TAX_PERIOD_LIST, nlapiGetFieldValue(KEYS.CUSTPAGE_TAXPERIODLIST));

    urlMgr.addUrlParameters(getInputParams());


    window.open(urlMgr.getFullUrl());
}


function doTransactionFlagging(urlMgr, callback) {
	if (nlapiGetFieldValue(KEYS.IS_CONSOLIDATED) == "F" || !nlapiGetFieldValue(KEYS.IS_CONSOLIDATED)) {
		Ext.Msg.show({
			title: "Export File",
			msg: 'Do you want to flag transactions in this report? If you click No, the file will be generated but transactions will not be flagged.',
			buttons: {
				yes: "Yes",
				no: "No"
			},
			closable: false,
			fn: function(btn) {
				if (btn == "yes") {
					try {
						Ext.select(".filingstatus").elements[0].innerHTML = "FINAL";
					} catch(e) {
						//log exception?
					}

					if (urlMgr && urlMgr.getFullUrl()) {
						urlMgr.addUrlParameter(KEYS.IS_FLAGGED, 'T');
					}

					callback(urlMgr, true);
				} else if (btn == "no") {
					if (urlMgr && urlMgr.getFullUrl()) {
						urlMgr.addUrlParameter(KEYS.IS_FLAGGED, 'F');
					}

					callback(urlMgr, false);
				}
			}
		});
	} else {
		Ext.Msg.show({
			title: "Export File",
			msg: 'Flagging of transactions for VAT is not available when the Group box is checked',
			buttons: {
				ok: "OK"
			},
			closable: false,
			fn: function(btn) {
				if (btn == "ok") {
					urlMgr.addUrlParameter(KEYS.IS_FLAGGED, 'F');
					callback(urlMgr, false);
				}
			}
		});
	}
}


function OnPrint(){

	if (hasSchema()) {
		Ext.MessageBox.show({
			msg: 'Please wait...',
			progressText: 'Printing...',
			width: 300,
			wait: true,
			waitConfig: {interval:200},
			title: 'Printing Report'
		});

		var params = {};
		params[KEYS.REPORT] = nlapiGetFieldValue(KEYS.REPORT_INDEX);
		params[KEYS.SUB_ID] = nlapiGetFieldValue(KEYS.SUB_ID);
		params[KEYS.PERIOD_FROM] = nlapiGetFieldValue(KEYS.PRINT_PERIOD_FROM);
		params[KEYS.PERIOD_TO] = nlapiGetFieldValue(KEYS.PRINT_PERIOD_TO);
		params[KEYS.IS_CONSOLIDATED] = nlapiGetFieldValue(KEYS.IS_CONSOLIDATED);
		if (isMultibook) {
			params[KEYS.BOOK_ID] = nlapiGetFieldValue(KEYS.BOOK_ID);
		}
		params[KEYS.HAS_SCHEMA] = true;
		params = objConcat(getInputParams(), params);
		params = objConcat(getParamsByClassName('amount'), params);
		params = objConcat(getParamsByClassName('amountwhole'), params);
		params = objConcat(getParamsByClassName('amountcent'), params);
		params = objConcat(getParamsByClassName('param'), params);
		params = objConcat(getParamsByClassName('amountinput'), params);
		params = objConcat(getParamsByClassName('amountwholeinput'), params);
		params = objConcat(getParamsByClassName('amountreadonly'), params);

		Ext.Ajax.request({
			url: new VAT.UrlManager(getBaseUrl(KEYS.URL_PRINT)).getFullUrl(),
			params: params,
			timeout: 300000,
			method: 'POST',
			success: function(xhr) {
				Ext.MessageBox.hide();
				var obj = Ext.decode(xhr.responseText);
				window.open(obj.url);
			}
		});
	} else {
		var urlMgr = new VAT.UrlManager(getBaseUrl(KEYS.URL_PRINT));
		urlMgr.addUrlParameters(getPrintFilters());
		urlMgr.addUrlParameters(getInputParams());
		urlMgr.addUrlParameters(getParamsByClassName('amount'));
		urlMgr.addUrlParameters(getParamsByClassName('amountwhole'));
		urlMgr.addUrlParameters(getParamsByClassName('amountcent'));
		urlMgr.addUrlParameters(getParamsByClassName('param'));
		urlMgr.addUrlParameters(getParamsByClassName('amountinput'));
		urlMgr.addUrlParameters(getParamsByClassName('amountwholeinput'));
		urlMgr.addUrlParameters(getParamsByClassName('amountreadonly'));

		window.open(urlMgr.getFullUrl());
	}
}

function hasSchema() {
	var hasSchema = false;
	try {
		var taxformschema = Ext.decode(nlapiGetFieldValue(KEYS.TAX_FORM_SCHEMA));
		if (Object.keys(taxformschema).length > 0) {
			hasSchema = true;
		}
	} catch(ex) {}
	return hasSchema;
}

function objConcat(src, dest) {
	for (var isrc in src) {
		dest[isrc] = src[isrc];
	}
	return dest;
}

function getParamsByClassName(classname) {
	classname = '.' + classname;
	var isnew = hasSchema();
	var params = {};
	var elements = Ext.select(classname).elements;

	for(var ielements = 0; ielements < elements.length; ielements++) {
		var element = elements[ielements];
		params[element.id] = isnew ?
				element.innerHTML || nlapiGetFieldValue(element.id) :
				unformat(element.innerHTML || nlapiGetFieldValue(element.id));
	}
	return params;
}

function getInputParams() {
	var isnew = hasSchema();
	var params = {};
	Ext.select("input[type='text']").each(setParams);
	Ext.select("input[type='checkbox']").each(setParams);
	Ext.select("input[type='radio']").each(setParams);
	return params;

	function setParams(el) {
		params[el.dom.id] = isnew ? nlapiGetFieldValue(el.dom.id) : encodeURI(nlapiGetFieldValue(el.dom.id));
	}
}

function paramsToUrl(params) {
	var paramList = [];
	for (var iparams in params) {
		paramList.push("&" + iparams + "=" + params[iparams]);
	}
	return paramList;
}

function downloadArchiveFile(internalid) {

	var urlMgr = new VAT.UrlManager(getBaseUrl(KEYS.URL_EXPORT));
	urlMgr.addUrlParameter(KEYS.ACTION_TYPE, KEYS.ARCHIVED_FILE);
	urlMgr.addUrlParameter(KEYS.INTERNAL_ID, internalid);
	window.open(urlMgr.getFullUrl());
}

function openSubmittedPeriod(internalid, isOnlineFiling) {
	var rec = isOnlineFiling ? 'customrecord_online_filing' : 'customrecord_vatonline_submittedperiod';
	var recUrl = nlapiResolveURL('record', rec);
	var urlMgr = new VAT.UrlManager(recUrl);
	
	urlMgr.addUrlParameter(KEYS.ID, internalid);
	urlMgr.addUrlParameter(KEYS.POPUP, 't');
	window.open(urlMgr.getFullUrl());
}

function createStore(pageSize, url, fields) {
    return new Ext.data.XmlStore({
        autoDestroy: true,
        autoLoad: {params:{start:0, limit: pageSize}},
        proxy : new Ext.data.HttpProxy({
            method: 'GET',
            prettyUrls: true,
            listeners: {
                'exception': function(proxy, type, action, option, response, arg){
                    alert("An error occurred while retrieving the system notes:" + type);
                }
            },
            url: url,
                api: {
                    load: url,
                    read: url
                }
            }),
        record: 'Note',
        totalProperty: 'Total',
        idPath: 'Id',
        fields: fields
    });
}

function createGrid(store, columns, pageSize, renderTo) {
    return new Ext.grid.GridPanel({
        store: store,
        columns: columns,
         bbar: new Ext.PagingToolbar({
             pageSize: pageSize,
             store: store,
             displayInfo: false,
             displayMsg: 'Displaying System Note {0} - {1} of {2}',
             emptyMsg: "No System Notes to display"
         }),
         enableColumnHide: false,
         renderTo: renderTo,
         width: 800,
         autoHeight: true,
         height: 200,
         layout:'fit'
     });
}

function createSystemNotesTab(pagesize, urlMgr, fields, columns, isMultiBook) {
    var systemNotesStore = createStore(pagesize, urlMgr.getFullUrl(), fields);
    var systemNotesGrid = createGrid(systemNotesStore, columns, pagesize, 'sysnotedata');
    var hiddenColumn = isMultiBook ? 1 : 0;
    switch(nlapiGetFieldValue("countrycode")) {
        case "GB":
            systemNotesGrid.getColumnModel().setHidden(2 + hiddenColumn, true);
            systemNotesGrid.getColumnModel().setHidden(4 + hiddenColumn, true);
            break;
        case "IE": case "CZ":
            systemNotesGrid.getColumnModel().setHidden(3 + hiddenColumn, true);
            systemNotesGrid.getColumnModel().setHidden(4 + hiddenColumn, false);
            break;
        default:
            systemNotesGrid.getColumnModel().setHidden(3 + hiddenColumn, true);
        systemNotesGrid.getColumnModel().setHidden(4 + hiddenColumn, true);
            break;
    }
}

function createOnlineFilingTab(pagesize, urlMgr, fields, columns, isMultiBook) {
    urlMgr.addUrlParameter(KEYS.ACTION_TYPE, KEYS.SYSNOTE_MTD);
    onlineFilingStore = createStore(pagesize, urlMgr.getFullUrl(), fields);
    onlineFilingGrid = createGrid(onlineFilingStore, columns, pagesize, 'sysnotemtddata');

    var hiddenColumn = isMultiBook ? 1 : 0;
    onlineFilingGrid.getColumnModel().setHidden(2 + hiddenColumn, true);
    onlineFilingGrid.getColumnModel().setHidden(4 + hiddenColumn, true);
}

function buildReportTabs(customtabs) {
	var pagesize = parseInt(context.getPreference('LISTSEGMENTSIZE'));
	var countryCode = nlapiGetFieldValue(KEYS.COUNTRY_CODE);
	var tabs = customtabs;
	
	if (countryCode === 'GB' && nlapiGetFieldValue('isonlinefiling') !== 'true') {
		tabs = customtabs.slice(0, 2);
	}
	
	var tabPanel = new Ext.TabPanel({
		renderTo: 'maintab',
		width:'auto',
		activeTab: 0,
		frame:true,
		defaults:{autoHeight: true},
		items:tabs
	});

	if (!Ext.get('sysnotedata')) {
		return;
	}

	var urlMgr = new VAT.UrlManager(getBaseUrl(KEYS.URL_MAIN));
	urlMgr.addUrlParameters(getReportFilters());
	urlMgr.addUrlParameter(KEYS.ACTION_TYPE, KEYS.SYSNOTE);
	urlMgr.addUrlParameter(KEYS.COUNTRY_CODE, countryCode);

	var fields = [];
	var columns = [];
	var columnWidth = {
		userName : 120,
		date     : 100,
		fileName : 200,
		status   : 100,
		type     : 100,
		period   : 100
	};
	if (isMultibook) {
		columnWidth = {
			userName : 'auto',
			date     : 'auto',
			fileName : 'auto',
			status   : 'auto',
			type     : 'auto',
			period   : 'auto',
			book     : 'auto'
		};
		fields = [{name: 'AccountingBook', mapping: 'AccountingBook'}];
		columns = [{header: "Accounting Book", width: columnWidth.book, dataIndex: 'AccountingBook', sortable: false}];
	}
	var defaultFields = [
					 {name: 'User', mapping: 'User'},{name: 'Date', mapping: 'Date'},
					 {name: 'File', mapping: 'File'}, {name: 'PeriodFrom', mapping: 'PeriodFrom'}, {name: 'Type', mapping: 'Type'},
					 {name: 'PeriodTo', mapping: 'PeriodTo'}, {name: 'HasActionLink', mapping: 'HasActionLink'},
					 {name: 'Id', mapping: 'Id'},{name: 'Status', mapping: 'Status'},
					 {name: 'IsMTD', mapping: 'IsMTD'}
				 ];
	var defaultColumns =  [
					   {header: "User Name", width: columnWidth.userName, dataIndex: 'User', sortable: false},
					   {header: "Date", width: columnWidth.date, dataIndex: 'Date', sortable: false},
					   {header: "File Name", width: columnWidth.fileName, dataIndex: 'File',
						   renderer  : function(value, metadata, record) {
							   return '<a href="javascript:downloadArchiveFile('+record.get("Id")+')">'+value+'</a>';
						   }
					   },
					   {header: "Status", width: columnWidth.status, dataIndex: 'Status',
						   renderer  : function(value, metadata, record) {
							   var isMTD = record.get("IsMTD") == 'T' ? true : false;
							   return '<a href="javascript:openSubmittedPeriod(' + record.get("Id")+ ',' +isMTD+ ')">'+ value  +'</a>';
						   }
					   },
					   {header: "Type", width: columnWidth.type, dataIndex: 'Type', sortable: false},
					   {header: "From Period", width: columnWidth.period, dataIndex: 'PeriodFrom', sortable: false},
					   {header: "To Period", width: columnWidth.period, dataIndex: 'PeriodTo', sortable: false},
					   {header: 'Action', dataIndex :'Id',
						   renderer  : function(value, metadata, record) {
                               var isMTD = record.get('IsMTD') === 'T';
                               var isNotCSVSubmit = true;
                               if (isMTD) {
                                   isNotCSVSubmit = record.get('MTDType') === 'SUBMIT';
                               }
							   if (record.get('HasActionLink') === 'T' && isNotCSVSubmit) {
								   return '<a href="javascript:preview(' + value + ',' + isMTD + ')">View & Print</a>';
							   }
						   }
					   }
				   ];
	fields = fields.concat(defaultFields);
	columns = columns.concat(defaultColumns);
    createSystemNotesTab(pagesize, urlMgr, fields, columns, isMultibook);

	// System Note Tab for MTD, GB Nexus
	if (Ext.get('sysnotemtddata')) {
        urlMgr.addUrlParameter(KEYS.ACTION_TYPE, KEYS.SYSNOTE_MTD);

        var fields_mtd = fields.slice();
        var columns_mtd = columns.slice();
        fields_mtd.push({name: "MTDType", mapping: 'MTDType'});
        columns_mtd.push({header: "Type", id: 'MTDType', dataIndex: 'MTDType', sortable: false});
        
        createOnlineFilingTab(pagesize, urlMgr, fields_mtd, columns_mtd, isMultibook);
	}
}

function preview(id, isOnlineFiling) {

	var urlMgr = new VAT.UrlManager(getBaseUrl(KEYS.URL_MAIN));
	urlMgr.addUrlParameters(getPrintFilters());
    urlMgr.addUrlParameter(KEYS.ACTION_TYPE, isOnlineFiling ? KEYS.PREVIEW_ONLINE_FILING : KEYS.PREVIEW);
	urlMgr.addUrlParameter(KEYS.RECORD_ID, id);

	var windowtitle = "Final";
	if (nlapiGetFieldValue("countrycode") == "GB") {
		windowtitle = "Submitted Copy";
	}

	nlExtOpenWindow(urlMgr.getFullUrl(), 'custwindow_preview', 860, 500, null, false, windowtitle);
}

function OnLocationChange() {

	setWindowChanged(window, false);
	var urlMgr = new VAT.UrlManager(getBaseUrl(KEYS.URL_REFRESH));
	urlMgr.addUrlParameters(getReportFilters());

	Ext.onReady(function(){
		Ext.MessageBox.show({
			msg: 'Please wait...',
			progressText: 'Refreshing...',
			width: 300,
			wait: true,
			waitConfig: {interval:200},
			title: 'Refreshing Report'
		});

		window.location = urlMgr.getFullUrl();
	});
}

function OnAdjust(url) {
	nlExtOpenWindow(url, 'custwindow_adjustment', Math.ceil(screen.availWidth*.90), 500, null, false, 'Adjust Return');
}

function OnFormat() {

    var strMsgs = JSON.parse(nlapiGetFieldValue('custpage_cs_msgs'));
	var urlMgr = new VAT.UrlManager(getBaseUrl(KEYS.URL_FORMAT));
	urlMgr.addUrlParameter(KEYS.SUB_ID, nlapiGetFieldValue(KEYS.SUB_ID));
	urlMgr.addUrlParameter(KEYS.COUNTRY_CODE, nlapiGetFieldValue(KEYS.COUNTRY_CODE));
	if (isMultibook) {
		urlMgr.addUrlParameter(KEYS.BOOK_ID, nlapiGetFieldValue(KEYS.BOOK_ID));
	}
	nlExtOpenWindow(urlMgr.getFullUrl(), 'custwindow_formatting', Math.ceil(screen.availWidth*.65), 530, null, false, strMsgs['BTN_OPTIONS_FORMATTING']);
}

var _formatter = null;
function unformat(value, isWhole) {
	if (!value) {
		return value;
	}
	return _formatter.unformat(value, isWhole);
}

function formatCurrency(value) {
	return _formatter.formatCurrency(value);
}

function formatNumber(value) {
	return _formatter.formatNumber(value);
}

Ext.onReady(function(){
	OnBookIdChange();

	Ext.select('.maxwidth').setStyle('width', '825px');
	Ext.select('.x-btn-text').setStyle({
		'font-size': '14px',
		'color': '#333333',
		'font-weight': 600,
		'padding':'0px 12px',
		'height':'23px'
	 });

	Ext.MessageBox.show({title: 'Loading Report', msg: 'Please wait...', width: 300, closable: true, wait: true, waitConfig: {interval:200}});
	attachFieldEvents();
	attachComputations();

	if (Ext.select('.customtab').elements.length > 0) {
		var customtabs = [];
		Ext.select('.customtab').each(function(el){
			customtabs.push({
				"title": el.getAttribute("label"),
				"contentEl": el.getAttribute("id")
				});
		});
		buildReportTabs(customtabs);
	}

	var fields = ['dateformat','longdateformat','month','negative_number_format','numberformat','quarter','period_separator','use_tax_period_name','year'];
	var format = {};
	new Ext.data.JsonStore({
		url: nlapiResolveURL('SUITELET', 'customscript_vat_main', 'customdeploy_vat_ui') +
		'&actiontype=loadformat&subid=' + nlapiGetFieldValue("subid") +
		'&countrycode=' + (nlapiGetFieldValue('countrycode') || '') +
		'&context=userinterface',
		autoLoad: true,
		idProperty: 'dateformat',
		fields: fields,
		listeners: {
			load: function(obj, records, options) {
				try {
					for (var field in fields) {
						format[fields[field]] = obj.getAt(0).get(fields[field]);
					}
					_formatter = VAT.Report.FormatterSingleton.getInstance(nlapiGetFieldValue("subid"), nlapiGetFieldValue('countrycode'), nlapiGetFieldValue('languagecode'), format);

					formatFields();

					Ext.select(".amountwholeinput").on("focus", function (e, t, o) {t.value = unformat(t.value);});
					Ext.select(".amountinput").on("focus", function (e, t, o) {t.value = unformat(t.value);});

					Ext.select('.amountinput').on('blur', function(e, t, o){
						validateAmount(t, false);
						t.value = formatCurrency(t.value).toString();
						formatFields();
					});
					Ext.select('.rateinput').on('blur', function(e, t, o){
						validateAmount(t, false);
						formatFields();
					});

					Ext.select('.amountwholeinput').on('blur', function(e, t, o){
						validateAmount(t, true);
						if (isCentExists(t, true)) {
							var cent = Ext.isIE ? el.dom.parentElement.nextSibling.childNodes[0].value : el.dom.parentElement.nextElementSibling.firstElementChild.value;
							formatNegativeWholeCent(t.value, cent, el, true);
						} else {
							t.value = formatNumber(t.value).toString();
						}
					});
				} catch (ex) {}
				finally {
					Ext.MessageBox.hide();
				}
			},
			exception: function() {
				Ext.MessageBox.hide();
			}
		}
	});
});

function attachFieldEvents() {
	if (hasSchema()) {
		Ext.select(".amountwhole").on("click", function (e, t, o) {OnDrillDown(t.id, t.name);});
		Ext.select(".amountcent").on("click", function (e, t, o) {OnDrillDown(t.id, t.name);});
		Ext.select(".amount").on("click", function (e, t, o) {OnDrillDown(t.id, t.name);});
	}

	Ext.select(".amountwholeinput").each(function(el){el.set({"maxlength": 15});});
	Ext.select(".amountinput").each(function(el){el.set({"maxlength": 15});});
	Ext.select(".rateinput").each(function(el){el.set({"maxlength": 3});});
	Ext.select('.amountwholeinput').setStyle('text-align', 'right');
	Ext.select('.rateinput').setStyle('text-align', 'right');
	Ext.select("input[readonly]").setStyle('background', 'transparent');
	Ext.select('.amountinput').setStyle('text-align', 'right');

	Ext.select(".amountwholeinput").on("keydown", function (e, t, o) {
		if (
		   !(e.getKey() >= 96 && e.getKey() <= 105) && !(e.getKey() >= 48 && e.getKey() <= 57) &&
			e.getKey() != 46 && e.getKey() > 31) {
			e.preventDefault();
		}
	});
	Ext.select(".amountinput").on("keydown", function (e, t, o) {
		if (
			(t.value.indexOf('.') > -1 && (e.getKey() == 110 || e.getKey() == 190)) ||
			(!(e.getKey() >= 96 && e.getKey() <= 105) && !(e.getKey() >= 48 && e.getKey() <= 57) && e.getKey() != 46 && e.getKey() > 31 && !(e.getKey() == 110 || e.getKey() == 190))
		) {
			e.preventDefault();
		}
	});
	Ext.select(".rateinput").on("keydown", function (e, t, o) {
		if (
			(t.value.indexOf('.') > -1 && (e.getKey() == 110 || e.getKey() == 190)) ||
			(!(e.getKey() >= 96 && e.getKey() <= 105) && !(e.getKey() >= 48 && e.getKey() <= 57) && e.getKey() != 46 && e.getKey() > 31 && !(e.getKey() == 110 || e.getKey() == 190))
		) {
			e.preventDefault();
		}
	});
	Ext.select(".rateinput").on("keyup", function (e, t, o) {
		if (t.value > 100) {
			t.value = 100;
		}
	});
}

function attachComputations() {
	var calcFieldMap = {};
	var fields = Ext.decode(nlapiGetFieldValue(KEYS.TAX_FORM_SCHEMA));

	//create the graph
	for (var ifield in fields) {
		var objField = fields[ifield];
		var value = 0;

		if (!Ext.get(ifield)) {
			value = 0;
		} else if (objField.fieldtype == "COMPUTATION"  || objField.fieldtype == "INPUT" || objField.fieldtype == "INPUTRATE") {
			value = Ext.get(ifield).dom.value;
		} else {
			value = Ext.get(ifield).dom.innerHTML;
		}
		var fx = computeField(fields, ifield, objField.threshold, objField.value);
		calcFieldMap[ifield] = {id: ifield, notation: objField.notation, type: objField.fieldtype, value: value, callback: [], method: fx?fx:null};
	}

	//assemble the callbacks
	for(var iCalc in calcFieldMap) {
		var objCalcField = calcFieldMap[iCalc];
		var objCalcNotation = objCalcField.notation;

		for(var iNotation = 0; iNotation < objCalcNotation.length; iNotation++) {
			var objNotation = objCalcNotation[iNotation];

			//determine other dependency computations;
			var objCallbackField = calcFieldMap[objNotation.field];
			if (objCallbackField.type == "COMPUTATION" || objCallbackField.type == "INPUT" || objCallbackField.type == "INPUTRATE") {
				objCallbackField.callback.push(objCalcField.id);
			}
		}
	}

	//attach the callbacks
	for(var icallback in calcFieldMap) {
		var objcallback = calcFieldMap[icallback];
		var callbacklist = objcallback.callback;
		if (callbacklist.length > 0) {
			var callback = createCallback(callbacklist, calcFieldMap);
			Ext.get(icallback).on('blur', callback);
		}
	}
}

function createCallback(callbacklist, calcFieldMap) {
	return function() {
		for(var ilist = 0; ilist < callbacklist.length; ilist++) {
			var elemid = callbacklist[ilist];
			var execMethod = calcFieldMap[elemid].method;
			if (execMethod) {
				execMethod();
			}
			if (calcFieldMap[elemid].callback) { //recurse
				var callback = createCallback(calcFieldMap[elemid].callback, calcFieldMap);
				callback();
			}
		}
	}
}

function computeField(fields, field, threshold, defaultvalue) {
	return function() {
		try {
			var total = 0;
			var expr = [];

			for (var i=0; i < fields[field].notation.length; i++) {
				var formfield = fields[field].notation[i].field;
				var fieldtype = fields[formfield].fieldtype;
				var value = 0;
				switch (fieldtype) {
					case 'CONSTANT':
						value = Number(fields[formfield].value);
						break;
					case 'INPUT':
					case 'COMPUTATION':
					case 'DERIVATION':
						var objFormField = Ext.get(formfield);
						var isWholeNumber = objFormField.hasClass("amountwhole") || objFormField.hasClass("amountwholeinput");
						value = Number(unformat((fieldtype == 'DERIVATION' ? objFormField.dom.innerHTML : objFormField.dom.value)), isWholeNumber);
						break;
					case 'RATE':
						value = Number(fields[formfield].value) / 100;
						break;
					case 'INPUTRATE':
						value = Number(Ext.get(formfield).dom.value) / 100;
						break;
				}
				expr.push(value);
				expr.push(fields[field].notation[i].operator);
			}

			var postfix = infixToPostfix(expr);
			total = calculatePostfix(postfix);

			if (!isNaN(parseInt(threshold)) && !isNaN(parseInt(defaultvalue)) && parseInt(threshold) > total) {
				total = defaultvalue;
			}

			var objField = Ext.get(field);
			var formattedTotal = total;
			if (objField.hasClass("amount") || objField.hasClass("amountinput")) {
				formattedTotal = formatCurrency(total);
			} else if (objField.hasClass("amountwhole") || objField.hasClass("amountwholeinput")) {
				formattedTotal = formatNumber(total);
			}

			nlapiSetFieldValue(field, formattedTotal);
		} catch (ex) {
			logException(ex, 'vat.filter_cs.js - computeField');
		}
	};
}

var math = {
		'*': function(left, right) {return left * right;},
		'/': function(left, right) {return left / right;},
		'+': function(left, right) {return left + right;},
		'-': function(left, right) {return left - right;}
};

function calculatePostfix(expr) {
	var total = 0;
	try {
		var stack = [];
		for (var token = 0; token < expr.length; token++) {
			var mdas = /[\*\/\+\-]$/;
			if (mdas.test(expr[token])) {
				var right = Number(stack.pop());
				var left = Number(stack.pop());
				var result = math[expr[token]](left, right);
				stack.push(result);
			} else {
				stack.push(expr[token]);
			}
		}
		total = stack.pop() || 0;
	} catch (ex) {
		//console.log('vat.filter_cs.js - calculatePostfix :: Exception: ' + ex.toString());
		logException(ex, 'vat.filter_cs.js - calculatePostfix');
	}
	return total;
}

function infixToPostfix(expr) { //Shungting-yard algorithm
	var operatorprecedence = {
		'*':3,
		'/':3,
		'+':2,
		'-':2
	};
	var operatorstack = [];
	var operandstack = [];

	try {
		for (var token = 0; token < expr.length; token++) {
			switch (expr[token]) {
				case '*':
				case '/':
				case '+':
				case '-':
					while (operatorstack.length > 0 && operatorprecedence[operatorstack[operatorstack.length - 1]] >= operatorprecedence[expr[token]]) {
						operandstack.push(operatorstack.pop());
					}
					operatorstack.push(expr[token]);
					break;
					/* Not yet supported
					case '(':
						operatorstack.push(expr[token]);
						break;
					case ')':
						while (operatorstack.length > 0 && operatorstack[operatorstack.length - 1] != '(') {
							operandstack.push(operatorstack.pop());
						}
						operatorstack.pop(); //remove '('
						break;
					 */
				case '=':
					break;
				default:
					operandstack.push(expr[token]);
					break;
			}
		}

		while (operatorstack.length > 0) {
			operandstack.push(operatorstack.pop());
		}
	} catch (ex) {
		//console.log('vat.filter_cs.js - infixToPostfix :: Exception: ' + ex.toString());
		logException(ex, 'vat.filter_cs.js - infixToPostfix');
	}
	return operandstack;
}

function jsonConcat() {
	if (!arguments) {
		return {};
	}

	for (var iargs = 0; iargs < arguments.length; iargs++) {
		for (var key in iargs) {
			if (!arguments[iargs][key]) {
				arguments[iargs][key] = iargs[key];
			}
		}
	}
	return arguments[0];
}

function formatFields() {
	Ext.select('.amount').each(function(el){
		if (el.dom.innerHTML) {
			el.dom.innerHTML = formatCurrency(el.dom.innerHTML);
		}
	});
	Ext.select('.amountreadonly').each(function(el){
		if (el.dom.innerHTML) {
			el.dom.innerHTML = formatCurrency(el.dom.innerHTML);
		}
	});

	Ext.select('.amountinput').each(function(el){
		if (el.dom.value) {
			el.dom.value = formatCurrency(el.dom.value).toString();
		}
	});

	Ext.select('.amountwhole').each(function(el){
		if (isCentExists(el, false)) {
			var cent = Ext.isIE ? el.dom.parentElement.nextSibling.childNodes[0].innerHTML : el.dom.parentElement.nextElementSibling.firstElementChild.innerHTML;
			formatNegativeWholeCent(el.dom.innerHTML, cent, el, false);
		} else {
			el.dom.innerHTML = formatNumber(el.dom.innerHTML).toString();
		}
	});
	Ext.select('.amountwholeinput').each(function(el){
		if (isCentExists(el, true)) {
			var cent = Ext.isIE ? el.dom.parentElement.nextSibling.childNodes[0].value : el.dom.parentElement.nextElementSibling.firstElementChild.value;
			formatNegativeWholeCent(el.dom.value, cent, el, true);
		} else {
			el.dom.value = formatNumber(el.dom.value).toString();
		}
	});
}

function unformatFields() {
	Ext.select('.amount').each(function(el){
		el.update(unformat(el.dom.innerHTML).toString());
	});
	Ext.select('.amountinput').each(function(el){
		el.dom.value = unformat(el.dom.value).toString();
	});

	Ext.select('.amountwhole').each(function(el){
		if (isCentExists(el, false)) {
			var cent = Ext.isIE ? el.dom.parentElement.nextSibling.childNodes[0].innerHTML : el.dom.parentElement.nextElementSibling.firstElementChild.innerHTML;
			unformatNegativeWholeCent(el.dom.innerHTML, cent, el, false);
		} else {
			el.dom.innerHTML = unformat(el.dom.innerHTML, true).toString();
		}
	});
	Ext.select('.amountwholeinput').each(function(el){
		if (isCentExists(el, true)) {
			var cent = Ext.isIE ? el.dom.parentElement.nextSibling.childNodes[0].value : el.dom.parentElement.nextElementSibling.firstElementChild.value;
			unformatNegativeWholeCent(el.dom.value, cent, el, true);
		} else {
			el.dom.value = unformat(el.dom.value, true).toString();
		}
	});
}

function isCentExists(el, isInput) {
	var centExists = false;
	try {

		if (Ext.isIE) {
			centExists = el.dom.parentElement.nextSibling.childNodes[0].className.indexOf(isInput ? 'amountcentinput' : 'amountcent') > -1 ? true : false;
		} else {
			centExists = el.dom.parentElement.nextElementSibling.firstElementChild.className.indexOf(isInput ? 'amountcentinput' : 'amountcent') > -1 ? true : false;
		}
	} catch (ex) {

	}
	return centExists;
}

function formatNegativeWholeCent(whole, cent, el, isInput) {
	if (!_formatter) {
		_formatter = VAT.Report.FormatterSingleton.getInstance(nlapiGetFieldValue(KEYS.SUB_ID), nlapiGetFieldValue(KEYS.COUNTRY_CODE), nlapiGetFieldValue(KEYS.LANGUAGE_CODE));
	}

	if (Number(whole) < 0) {
		switch (_formatter.negative) {
			case '-%v':
				whole = formatNumber(whole).toString();
				break;
			case '(%v)':
				whole = formatNumber(whole).toString().replace(')', '');
				cent = _formatter.negative.replace('%v', cent).replace('(', '');
				break;
			case '%v-':
				whole = formatNumber(whole).toString().replace('-', '');
				cent = _formatter.negative.replace('%v', cent);
				break;
		}
	} else {
		whole = formatNumber(whole);
	}

	if (isInput) {
		el.dom.value = whole;
		if (Ext.isIE) {
			el.dom.parentElement.nextSibling.childNodes[0].value = cent;
		} else {
			el.dom.parentElement.nextElementSibling.firstElementChild.value = cent;
		}
	} else {
		el.dom.innerHTML = whole;
		if (Ext.isIE) {
			el.dom.parentElement.nextSibling.childNodes[0].innerHTML = cent;
		} else {
			el.dom.parentElement.nextElementSibling.firstElementChild.innerHTML = cent;
		}
	}
}

function unformatNegativeWholeCent(whole, cent, el, isInput) {
	if (cent.indexOf(')') == cent.length -1 || cent.indexOf('-') == cent.length - 1) {
		whole = '-' + whole.replace('(', '');
		cent = cent.replace('-', '').replace(')', '');
	}

	if (isInput) {
		el.dom.value = unformat(whole, true);
		if (Ext.isIE) {
			el.dom.parentElement.nextSibling.childNodes[0].value = unformat(cent, true);
		} else {
			el.dom.parentElement.nextElementSibling.firstElementChild.value = unformat(cent, true);
		}
	} else {
		el.dom.innerHTML = unformat(whole, true);
		if (Ext.isIE) {
			el.dom.parentElement.nextSibling.childNodes[0].innerHTML = unformat(cent, true);
		} else {
			el.dom.parentElement.nextElementSibling.firstElementChild.innerHTML = unformat(cent, true);
		}
	}
}

function validateAmount(obj, isWhole) {
	try {
		if (nlapiFormatCurrency(unformat(obj.value, isWhole))) {
			obj.value = unformat(obj.value, isWhole);
		} else {
			obj.value = 0;
		}
	} catch(ex) {
		alert(ex);
	}
}

function OnFilingSetup() {

	var urlMgr = new VAT.UrlManager(getBaseUrl(KEYS.URL_MAIN));
	urlMgr.addUrlParameters(getPrintFilters());
	urlMgr.addUrlParameter(KEYS.ACTION_TYPE, KEYS.ONLINE_FILING);
	urlMgr.addUrlParameter(KEYS.ONLINE_FILING, KEYS.LOAD);
	nlExtOpenWindow(urlMgr.getFullUrl(), 'custwindow_onlinefiling', 800, 500, null, false, 'Tax Filing Setup');
}

function IsNumeric(eventObj, obj) {
	var keyCode = (document.all) ? eventObj.keyCode : eventObj.which;  //Check For Browser Type

	if (keyCode <= 31)  //Ignore control characters
		return true;

	if (keyCode == ".".charCodeAt(0))
		return obj.value.indexOf(".") == -1;

	return (keyCode >= "0".charCodeAt(0)) && (keyCode <= "9".charCodeAt(0));
}

function IsIntegerOnly(eventObj, obj) {
	var keyCode = (document.all) ? eventObj.keyCode : eventObj.which;  //Check For Browser Type

	if (keyCode <= 31)
		return true;

	return (keyCode >= "0".charCodeAt(0)) && (keyCode <= "9".charCodeAt(0));
}

function OnFormatSave() {
	Ext.WindowMgr.get('custwindow_formatting').on("beforeclose", function(){
		Ext.MessageBox.show({title: 'Loading report...', msg: 'Please wait...', width: 300, wait: true, waitConfig: {interval:200}});
		OnRefresh();});
}

function OnDrillDown(boxNum, boxName) {

	var urlMgr = new VAT.UrlManager(getBaseUrl(KEYS.URL_MAIN));
	urlMgr.addUrlParameter(KEYS.ACTION_TYPE, KEYS.CREATE_CACHE);
	urlMgr.addUrlParameter(KEYS.REPORT, nlapiGetFieldValue(KEYS.REPORT_INDEX));

	if (!nlapiGetFieldValue(KEYS.SALE_DRILL_CACHE) || !nlapiGetFieldValue(KEYS.PURCHASE_DRILL_CACHE)) {
		Ext.MessageBox.show({
			 title: 'Loading Drill Down Report...',
			 msg: 'Please wait ...',
			 width:300,
			 progress:true,
			 modal: true
		});

		Ext.Ajax.request({
			url: urlMgr.getFullUrl(),
			timeout: 300000,
			method: 'GET',
			success: function(xhr) {
				var obj = Ext.decode(xhr.responseText);
				nlapiSetFieldValue(KEYS.SALE_DRILL_CACHE, obj.saledrilldown);
				nlapiSetFieldValue(KEYS.PURCHASE_DRILL_CACHE, obj.purchasedrilldown);
			},
			callback: function() {
				generateDrillDownCache(boxNum, boxName, nlapiGetFieldValue(KEYS.CUSTPAGE_TAXPERIODLIST).split(","), nlapiGetFieldValue(KEYS.SALE_DRILL_CACHE), nlapiGetFieldValue(KEYS.PURCHASE_DRILL_CACHE), openDrillDownWindow);
			}
		});
	} else {
		openDrillDownWindow(boxNum, boxName, nlapiGetFieldValue(KEYS.SALE_DRILL_CACHE), nlapiGetFieldValue(KEYS.PURCHASE_DRILL_CACHE));
	}
}

function openDrillDownWindow (boxNum, boxName, salecache, purchasecache) {

	var urlMgr = new VAT.UrlManager(getBaseUrl(KEYS.URL_MAIN));
	urlMgr.addUrlParameters(getPrintFilters());
	urlMgr.addUrlParameter(KEYS.ACTION_TYPE, KEYS.DRILLDOWN);
	urlMgr.addUrlParameter(KEYS.BOX_NUM, boxNum);
	urlMgr.addUrlParameter(KEYS.BOX_NAME, boxName || "");
	urlMgr.addUrlParameter(KEYS.SALE_DRILLDOWN, salecache);
	urlMgr.addUrlParameter(KEYS.PURCHASE_DRILLDOWN, purchasecache);

	var params = [
				  'height='+(screen.height * .90),
				  'width='+ (screen.width * .90),
				  'fullscreen=yes'
				  ].join(',');

	window.open(urlMgr.getFullUrl(), boxNum, params);
}

function generateDrillDownCache(boxNum, boxName, periodlist, salecache, purchasecache, callbackmethod) {

	var params = {};
	params[KEYS.ACTION_TYPE] = KEYS.BUILD_CACHE;
	params[KEYS.REPORT_INDEX] = nlapiGetFieldValue(KEYS.REPORT_INDEX);
	params[KEYS.PERIOD_FROM] = periodlist[0];
	params[KEYS.PERIOD_TO] = periodlist[0];
	params[KEYS.SALE_DRILLDOWN] = salecache;
	params[KEYS.PURCHASE_DRILLDOWN] = purchasecache;
	params[KEYS.REPORT_TYPE] = KEYS.SALE;
	if (isMultibook) {
		params[KEYS.BOOK_ID] = nlapiGetFieldValue(KEYS.BOOK_ID);
	}

	if (nlapiGetFieldValue(KEYS.SUB_ID)) {
		params[KEYS.SUB_ID] = nlapiGetFieldValue(KEYS.SUB_ID);
		params[KEYS.IS_CONSOLIDATED] = nlapiGetFieldValue(KEYS.IS_CONSOLIDATED);
	}

	if (nlapiGetFieldValue(KEYS.LOCATION_ID)) {
		params[KEYS.LOCATION_ID] = nlapiGetFieldValue(KEYS.LOCATION_ID);
	}

	var urlMgr = new VAT.UrlManager(getBaseUrl(KEYS.URL_MAIN));

	Ext.Ajax.request({
		url: urlMgr.getFullUrl(),
		timeout: 300000,
		method: 'GET',
		params: params,
		success: function(xhr) {
			var obj = Ext.decode(xhr.responseText);
			Ext.MessageBox.updateProgress(1/(periodlist.length * 2 - 1));
		},
		callback: function() {
			params[KEYS.REPORT_TYPE] = KEYS.PURCHASE;
			Ext.Ajax.request({
				url: urlMgr.getFullUrl(),
				timeout: 300000,
				method: 'GET',
				params: params,
				success: function(xhr) {
					var obj = Ext.decode(xhr.responseText);
					Ext.MessageBox.updateProgress(1/(periodlist.length * 2 - 1));
				},
				callback: function() {
					if (periodlist.length > 1) {
						generateDrillDownCache(boxNum, boxName, periodlist.splice(1, periodlist.length), salecache, purchasecache, callbackmethod);
					} else {
						Ext.MessageBox.hide();
						callbackmethod(boxNum, boxName, salecache, purchasecache);
					}
				}
			});
		}
	});
}

function OnSupplementary(type, format, is_flagging, fxcallback) {

	//var drilldownused = (getSupplementarySettings().drilldowncache || ["ID", "TH", "TR"]).indexOf(nlapiGetFieldValue("countrycode")) > -1;
	var drilldownused = (["ID", "TH", "TR"]).indexOf(nlapiGetFieldValue(KEYS.COUNTRY_CODE)) > -1;

	Ext.MessageBox.show({
		title: 'Generating Supplementary Report...',
		msg: 'Please wait ...',
		width:300,
		progress:true,
		modal: true
   });

	if ((drilldownused && (!nlapiGetFieldValue(KEYS.SALE_DRILL_CACHE) || !nlapiGetFieldValue(KEYS.PURCHASE_DRILL_CACHE))) || (!drilldownused && !nlapiGetFieldValue(KEYS.SUPPLEMENTARY_CACHE))) {

		var urlMgr = new VAT.UrlManager(getBaseUrl(KEYS.URL_MAIN));
		urlMgr.addUrlParameter(KEYS.ACTION_TYPE, KEYS.CREATE_CACHE);
		urlMgr.addUrlParameter(KEYS.REPORT, nlapiGetFieldValue(KEYS.REPORT_INDEX));
		if(!drilldownused) {
			urlMgr.addUrlParameter(KEYS.SUPPLEMENTARY, KEYS.TRUE);
		}

		Ext.Ajax.request({
			url: urlMgr.getFullUrl(),
			timeout: 300000,
			method: 'GET',
			success: function(xhr) {
				var obj = Ext.decode(xhr.responseText);

				if (drilldownused) {
					nlapiSetFieldValue(KEYS.SALE_DRILL_CACHE, obj.saledrilldown);
					nlapiSetFieldValue(KEYS.PURCHASE_DRILL_CACHE, obj.purchasedrilldown);
				} else {
					var supplementarycache = {salecache: obj.saledrilldown, purchasecache: obj.purchasedrilldown};
					nlapiSetFieldValue(KEYS.SUPPLEMENTARY_CACHE, JSON.stringify(supplementarycache));
				}
			},
			callback: function() {
				var period = nlapiGetFieldValue(KEYS.CUSTPAGE_TAXPERIODLIST).split(",");

				if (['SLS', 'SLP'].indexOf(type) > -1 && format == 'dat') {
					if (period.length > 1) {
						period = [period[period.length-1]];
					}
				}

				generateSupplementaryCache(period, type, format, nlapiGetFieldValue(KEYS.SALE_DRILL_CACHE), nlapiGetFieldValue(KEYS.PURCHASE_DRILL_CACHE), nlapiGetFieldValue(KEYS.SUPPLEMENTARY_CACHE), is_flagging, fxcallback);
			}
		});
	} else {
		generateSupplementaryReport(type, format, nlapiGetFieldValue(KEYS.SALE_DRILL_CACHE), nlapiGetFieldValue(KEYS.PURCHASE_DRILL_CACHE), nlapiGetFieldValue(KEYS.SUPPLEMENTARY_CACHE), is_flagging, fxcallback);
	}
}

function OnSupplementaryPH() {
	doTransactionFlagging('', function callback(url, is_flagging) {
		var _is_flagging = is_flagging ? 'T' : 'F';
		OnSupplementary('SLS', 'dat', _is_flagging, OnSupplementarySLP);
	});
}

function OnSupplementarySLP(isflagged) {
	OnSupplementary('SLP', 'dat', isflagged);
}

function generateSupplementaryCache(periodlist, type, format, salecache, purchasecache, supplementarycache, is_flagging, fxcallback) {

	var params = {};
	params[KEYS.ACTION_TYPE] = KEYS.SUPPLEMENTARY_DATA;
	params[KEYS.REPORT_INDEX] = nlapiGetFieldValue(KEYS.REPORT_INDEX);
	params[KEYS.PERIOD_FROM] = periodlist[0];
	params[KEYS.PERIOD_TO] = nlapiGetFieldValue(KEYS.COUNTRY_CODE) != 'BE' ? periodlist[0] : periodlist[periodlist.length - 1];
	params[KEYS.SALE_DRILLDOWN] = salecache;
	params[KEYS.PURCHASE_DRILLDOWN] = purchasecache;
	params[KEYS.SUPPLEMENTARY_SALE_CACHE] = supplementarycache ? JSON.parse(supplementarycache).salecache : "";
	params[KEYS.SUPPLEMENTARY_PURCHASE_CACHE] = supplementarycache ? JSON.parse(supplementarycache).purchasecache : "";
	params[KEYS.SUPPLEMENTARY_TYPE] = type;
	params[KEYS.SUPPLEMENTARY_FORMAT] = format;
	params[KEYS.REPORT_TYPE] = KEYS.SALE;
	params[KEYS.TAX_PERIOD_LIST] = nlapiGetFieldValue(KEYS.CUSTPAGE_TAXPERIODLIST);
	if (isMultibook) {
		params[KEYS.BOOK_ID] = nlapiGetFieldValue(KEYS.BOOK_ID);
	}

	if (nlapiGetFieldValue(KEYS.SUB_ID)) {
		params[KEYS.SUB_ID] = nlapiGetFieldValue(KEYS.SUB_ID);
		params[KEYS.IS_CONSOLIDATED] = nlapiGetFieldValue(KEYS.IS_CONSOLIDATED);
	}

	if (nlapiGetFieldValue(KEYS.LOCATION_ID)) {
		params[KEYS.LOCATION_ID] = nlapiGetFieldValue(KEYS.LOCATION_ID);
	}

	Ext.Ajax.request({
		url: new VAT.UrlManager(getBaseUrl(KEYS.URL_MAIN)).getFullUrl(),
		timeout: 300000,
		method: 'GET',
		params: params,
		success: function(xhr) {
			var obj = Ext.decode(xhr.responseText);
			Ext.MessageBox.updateProgress(1/(periodlist.length * 2 - 1));
		},
		callback: function() {
			params[KEYS.REPORT_TYPE] = KEYS.PURCHASE;
			Ext.Ajax.request({
				url: new VAT.UrlManager(getBaseUrl(KEYS.URL_MAIN)).getFullUrl(),
				timeout: 300000,
				method: 'GET',
				params: params,
				success: function(xhr) {
					var obj = Ext.decode(xhr.responseText);
					Ext.MessageBox.updateProgress(1/(periodlist.length * 2 - 1));
				},
				callback: function() {
					if (periodlist.length > 1 && type != 'FORM725') {
						generateSupplementaryCache(periodlist.splice(1, periodlist.length), type, format, salecache, purchasecache, supplementarycache, is_flagging, fxcallback);
					} else {
						generateSupplementaryReport(type, format, salecache, purchasecache, supplementarycache, is_flagging, fxcallback);
					}
				}
			});
		}
	});
}

function generateSupplementaryReport(type, format, salecache, purchasecache, supplementarycache, isflagged, fxcallback) {
	var urlmain = new VAT.UrlManager(getBaseUrl(KEYS.URL_MAIN)).getFullUrl();
	var params = createSupplementaryReportParams(type, format, salecache, purchasecache, supplementarycache, isflagged);

	if (format == 'dat') {
		sendSupplementaryDatRequest(urlmain, params, fxcallback, isflagged);
	} else {
		Ext.MessageBox.hide();
		var url = urlmain + (paramsToUrl(params)).join('');
		window.open(url);
	}
}

function createSupplementaryReportParams(type, format, salecache, purchasecache, supplementarycache, isflagged) {
	var cache = {};
	if (supplementarycache) {
		cache = JSON.parse(supplementarycache);
	} else {
		cache.salecache = '';
		cache.purchasecache = '';
	}

	var params = {};
	params[KEYS.ACTION_TYPE] = KEYS.SUPPLEMENTARY;
	params[KEYS.REPORT_INDEX] = nlapiGetFieldValue(KEYS.REPORT_INDEX);
    params[KEYS.PERIOD_FROM] = nlapiGetFieldValue(KEYS.PRINT_PERIOD_FROM);
    params[KEYS.PERIOD_TO] = nlapiGetFieldValue(KEYS.PRINT_PERIOD_TO);
	params[KEYS.SALE_CACHE] = salecache;
	params[KEYS.PURCHASE_CACHE] = purchasecache;
	params[KEYS.SUPPLEMENTARY_SALE_CACHE] = cache.salecache;
	params[KEYS.SUPPLEMENTARY_PURCHASE_CACHE] = cache.purchasecache;
	params[KEYS.SUPPLEMENTARY_TYPE] = type;
	params[KEYS.SUPPLEMENTARY_FORMAT] = format;
	params[KEYS.TAX_PERIOD_LIST] = nlapiGetFieldValue(KEYS.CUSTPAGE_TAXPERIODLIST);
	if (isMultibook) {
		params[KEYS.BOOK_ID] = nlapiGetFieldValue(KEYS.BOOK_ID);
	}

	var subid = nlapiGetFieldValue(KEYS.SUB_ID);
	if (subid) {
		params[KEYS.SUB_ID] = subid;
		params[KEYS.IS_CONSOLIDATED] = nlapiGetFieldValue(KEYS.IS_CONSOLIDATED);
	}

	var inputparams = getInputParams();
	for (var key in inputparams) {
	   params[key] = inputparams[key];
	}

	if (isflagged) {
		params[KEYS.IS_FLAGGED] = isflagged;
	}

	return params;
}

function sendSupplementaryDatRequest(urlmain, params, fxcallback, isflagged) {
	Ext.Ajax.request({
		url: urlmain,
		timeout: 300000,
		method: 'GET',
		params: params,
		success: function(xhr) {
			var obj = Ext.decode(xhr.responseText);
			if (obj.archiveid) {
				downloadArchiveFile(obj.archiveid);
			}
		},
		callback: function() {
			Ext.MessageBox.hide();
			if (fxcallback) {
				fxcallback(isflagged);
			}
		}
	});
}

function getBaseUrl(id) {
	return nlapiGetFieldValue(id);
}

function getReportFilters() {
    var reportFilters = {};
    reportFilters[KEYS.SUB_ID] = nlapiGetFieldValue(KEYS.SUB_ID) || '';
    reportFilters[KEYS.PERIOD_FROM] = nlapiGetFieldValue(KEYS.PERIOD_FROM);
    reportFilters[KEYS.PERIOD_TO] = nlapiGetFieldValue(KEYS.PERIOD_TO);
    reportFilters[KEYS.IS_CONSOLIDATED] = nlapiGetFieldValue(KEYS.IS_CONSOLIDATED);
    reportFilters[KEYS.REPORT] = nlapiGetFieldValue(KEYS.REPORT_INDEX);
    reportFilters[KEYS.REPORT_INDEX] = nlapiGetFieldValue(KEYS.REPORT_INDEX);
    reportFilters[KEYS.LOCATION_ID] = nlapiGetFieldValue(KEYS.LOCATION_ID) || '';
    if (isMultibook) {
        reportFilters[KEYS.BOOK_ID] = nlapiGetFieldValue(KEYS.BOOK_ID) || '';
    }
    return reportFilters;
}

function getPrintFilters() {
    var exportFilters = getReportFilters();
    exportFilters[KEYS.PERIOD_FROM] = nlapiGetFieldValue(KEYS.PRINT_PERIOD_FROM);
    exportFilters[KEYS.PERIOD_TO] = nlapiGetFieldValue(KEYS.PRINT_PERIOD_TO);
    return exportFilters;
}

function handleEvent(type, subType, format) {
	setWindowChanged(window, false);
	validateTaxPeriod(generateReport, [type, subType, format]);
}

function validateTaxPeriod(callback, params) {
	var validateUrl = new VAT.UrlManager(getBaseUrl(KEYS.URL_MAIN));
	validateUrl.addUrlParameters(getPrintFilters());
	validateUrl.removeUrlParameter(KEYS.REPORT_INDEX);
	validateUrl.addUrlParameter(KEYS.ACTION_TYPE, KEYS.VALIDATE);
	validateUrl.addUrlParameter(KEYS.TYPE, KEYS.SUBMISSION);
	validateUrl.addUrlParameter(KEYS.COUNTRY_CODE, nlapiGetFieldValue(KEYS.COUNTRY_CODE));
	validateUrl.addUrlParameter(KEYS.LANGUAGE_CODE, nlapiGetFieldValue(KEYS.LANGUAGE_CODE));
	validateUrl.addUrlParameter(KEYS.TAX_PERIOD_LIST, nlapiGetFieldValue(KEYS.CUSTPAGE_TAXPERIODLIST));

	Ext.Ajax.request({
		url: validateUrl.getFullUrl(),
		timeout: 300000,
		method: 'GET',
		success: function(xhr) {
			var objmsg = Ext.decode(xhr.responseText);

			var messagelist = [];
			for(var imsg = 0; imsg < objmsg.length; imsg++) {
				if (objmsg[imsg].status == "fail") {
					messagelist.push(objmsg[imsg].message);
				}
			}

			if (messagelist.length > 0) {
				Ext.Msg.show({
					title:'',
					msg: messagelist.join("<br/><br/>"),
					buttons: Ext.Msg.OK,
					width: 400,
					icon: Ext.MessageBox.WARNING
				});
			} else {
				callback.apply(this, params);
			}
		}
	});
}

function generateReport(type, subType, format) {
	var reportUrl = new VAT.UrlManager(getBaseUrl(KEYS.URL_MAIN));
	reportUrl.addUrlParameters(getPrintFilters());
	reportUrl.addUrlParameter(KEYS.ACTION_TYPE, KEYS.SUPPLEMENTARY2);
	reportUrl.addUrlParameter(KEYS.TAX_PERIOD_LIST, nlapiGetFieldValue(KEYS.CUSTPAGE_TAXPERIODLIST));
	reportUrl.addUrlParameter('countryCode', nlapiGetFieldValue(KEYS.COUNTRY_CODE));
	reportUrl.addUrlParameter('languageCode', nlapiGetFieldValue(KEYS.LANGUAGE_CODE));
	reportUrl.addUrlParameter('subtype', subType);
	reportUrl.addUrlParameter('format', format);

	Ext.Ajax.request({
		url: reportUrl.getFullUrl(),
		timeout: 300000,
		method: 'GET',
		success: function(xhr) {
			Ext.Msg.show({
				title: '',
				msg: 'You will be notified by email when the report is ready for viewing.',
				buttons: Ext.Msg.OK,
				width: 400,
				icon: Ext.MessageBox.INFO
			});
		}
	});
}
