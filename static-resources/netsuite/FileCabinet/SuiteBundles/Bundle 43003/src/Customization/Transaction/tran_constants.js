/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.Constants = VAT.Constants || {};

VAT.Constants.TransactionMap = {
	"BILL":{"id":"17","name":"Bill","alternatecode":"vendbill","internalid":"vendorbill","featurelist":["nondeductible"]},
	"BILLCRED":{"id":"20","name":"Bill Credit","alternatecode":"vendcred","internalid":"vendorcredit","featurelist":["nondeductible"]},
	"CARDCHRG":{"id":"21","name":"Credit Card","alternatecode":"cardchrg","internalid":"creditcardcharge","featurelist":[]},
	"CARDRFND":{"id":"22","name":"CCard Refund","alternatecode":"cardrfnd","internalid":"creditcardrefund","featurelist":[]},
	"CHK":{"id":"3","name":"Check","alternatecode":"check","internalid":"check","featurelist":["nondeductible"]},
	"CREDMEM":{"id":"10","name":"Credit Memo","alternatecode":"custcred","internalid":"creditmemo","featurelist":[]},
	"EXPREPT":{"id":"28","name":"Expense Report","alternatecode":"exprept","internalid":"expensereport","featurelist":["nondeductible"]},
	"GENJRNL":{"id":"1","name":"Journal","alternatecode":"journal","internalid":"journalentry","featurelist":[]},
	"INV":{"id":"7","name":"Invoice","alternatecode":"custinv","internalid":"invoice","featurelist":[]},
	"PURCHORD":{"id":"15","name":"Purchase Order","alternatecode":"purchord","internalid":"purchaseorder","featurelist":[]},
	"RCPT":{"id":"5","name":"Cash Sale","alternatecode":"cashsale","internalid":"cashsale","featurelist":[]},
	"RETURN":{"id":"29","name":"Cash Refund","alternatecode":"cashrfnd","internalid":"cashrefund","featurelist":[]},
	"SALESORD":{"id":"31","name":"Sales Order","alternatecode":"salesord","internalid":"salesorder","featurelist":[]}
	};

VAT.Constants.ScriptMap = {
	"customscript_tax_bundle_maintenance":{"name":"Tax Bundle Maintenance","executioncontext":[""]},
	"customscript_tax_tran_cs":{"name":"Tax Transaction Fields CS","executioncontext":["userevent","userinterface"]},
	"customscript_tax_tran_ue":{"name":"Tax Transaction Fields UE","executioncontext":["userevent","userinterface"]}
	};

VAT.Constants.EUNexuses = {
	"AT":{"id":"13","nexuscode":"AT"},
	"BE":{"id":"20","nexuscode":"BE"},
	"BG":{"id":"22","nexuscode":"BG"},
	"CY":{"id":"55","nexuscode":"CY"},
	"CZ":{"id":"56","nexuscode":"CZ"},
	"DE":{"id":"57","nexuscode":"DE"},
	"DK":{"id":"59","nexuscode":"DK"},
	"EE":{"id":"64","nexuscode":"EE"},
	"EL":{"id":"89","nexuscode":"EL"},
	"GR":{"id":"89","nexuscode":"GR"},
	"ES":{"id":"68","nexuscode":"ES"},
	"FI":{"id":"70","nexuscode":"FI"},
	"FR":{"id":"75","nexuscode":"FR"},
	"GB":{"id":"77","nexuscode":"GB"},
	"UK":{"id":"77","nexuscode":"UK"},
	"HR":{"id":"98","nexuscode":"HR"},
	"HU":{"id":"100","nexuscode":"HU"},
	"IE":{"id":"102","nexuscode":"IE"},
	"IT":{"id":"110","nexuscode":"IT"},
	"LT":{"id":"133","nexuscode":"LT"},
	"LU":{"id":"134","nexuscode":"LU"},
	"LV":{"id":"135","nexuscode":"LV"},
	"MC":{"id":"138","nexuscode":"MC"},
	"MT":{"id":"153","nexuscode":"MT"},
	"NL":{"id":"166","nexuscode":"NL"},
	"PL":{"id":"179","nexuscode":"PL"},
	"PT":{"id":"184","nexuscode":"PT"},
	"RO":{"id":"189","nexuscode":"RO"},
	"SE":{"id":"196","nexuscode":"SE"},
	"SI":{"id":"199","nexuscode":"SI"},
	"SK":{"id":"201","nexuscode":"SK"}
};

VAT.Session = function() {
	//VATSESSION object is per nexus - VATSESSION:{AT:{},BE:{}};
	this.sessionId = 'VATSESSION';
	this.sessionObj = JSON.parse(nlapiGetContext().getSessionObject(this.sessionId) || '{}');
};

VAT.Session.prototype.setSession = function(nexus, id, value) {
	if (!nexus || !id || !value) {
		return;
	}
	this.sessionObj[nexus] = this.sessionObj[nexus] || {}; 
	this.sessionObj[nexus][id] = this.sessionObj[nexus][id] || value;
	nlapiGetContext().setSessionObject(this.sessionId, JSON.stringify(this.sessionObj));
};

VAT.Session.prototype.getSession = function(nexus, id) {
	if (!nexus || !id) {
		return;
	}
	if (this.sessionObj[nexus] && this.sessionObj[nexus][id]) {
		return this.sessionObj[nexus][id];
	}
	
	this.sessionObj[nexus] = {};
	this.sessionObj[nexus][id] = {};
	return this.sessionObj[nexus][id];
};

VAT.Session.prototype.clearSession = function() {
	this.sessionObj = {};
	nlapiGetContext().setSessionObject(this.sessionId, JSON.stringify(this.sessionObject));
};

VAT.Session.NOTC = function() {
	//{NOTC:{DEFAULT_CODE1:[transactiontypes]}};
	this.id = 'NOTC';
	VAT.Session.call(this);
};

VAT.Session.NOTC.prototype = Object.create(VAT.Session.prototype);

VAT.Session.NOTC.prototype.setDefault = function(nexus, type, code) {
	var value = this.getSession(nexus, this.id) || {};
	value[code] = value[code] || [];
	
	if (value[code].indexOf(type) == -1) {
		value[code].push(type);
	}
	
	this.setSession(nexus, this.id, value);
};

VAT.Session.NOTC.prototype.getDefault = function(nexus, type) {
	var value = this.getSession(nexus, this.id);
	var defaultCode = '';
	
	for (var code in value) {
		if (value[code].indexOf(type) > -1) {
			defaultCode = code;
			break;
		}
	}
	return defaultCode;
};