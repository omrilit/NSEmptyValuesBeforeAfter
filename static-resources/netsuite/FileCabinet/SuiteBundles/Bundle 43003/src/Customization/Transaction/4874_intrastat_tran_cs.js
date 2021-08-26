/**
 * Copyright � 2017, 2019, Oracle and/or its affiliates. All rights reserved.
 */

var VAT;
if (!VAT) VAT = {};
VAT.taxtrantype = "BILL";

if(!_4874) { var _4874 = {} };
_4874.IntrastatTranCS = {}

VAT.LogError = function (ex, functionname) {
	var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
	nlapiLogExecution("ERROR", functionname, errorMsg);
};

//Business Logic Functions
//Setting the nexus NOTC
VAT.NexusNOTC = function () {
	this.run = function(mode) {
		if (VAT.taxtrantype != "RETURN" && VAT.taxtrantype != "RCPT" &&  VAT.taxtrantype != "CHK" && VAT.taxtrantype != "CREDMEM" &&
				VAT.taxtrantype != "INV" && VAT.taxtrantype != "SALESORD" && VAT.taxtrantype != "BILL" && VAT.taxtrantype != "BILLCRED"  &&
				VAT.taxtrantype != "PURCHORD") {return;}

		initNexusNOTC(mode);
	};

	function initNexusNOTC(mode) {
		try {
			if (mode == 'edit') { //Intrastat
				var nexus_notc = nlapiGetFieldValue('custpage_temp_nexus_notc');

				if (nexus_notc) {
					nlapiSetFieldValue('custbody_nexus_notc', nexus_notc);
				}
			}
		} catch (ex) {VAT.LogError(ex, "VAT.NexusNOTC.initNexusNOTC");}
	}
};

VAT.TaxFieldConductor = function TaxFieldConductor() {
	var hasVisibleSlaves = false;
	var fieldsFilteredByNexus = {
		'custbody_mode_of_transport': '',
		'custcol_statistical_procedure_sale' : '',
		'custcol_statistical_procedure_purc' : '',
		'custbody_transaction_region' : '',
	};

	function getFieldValues(list) {
		for (var f in list) {
			var field = nlapiGetField(f);
			if (field != null && !field.isHidden()) {
				hasVisibleSlaves = true;
				list[f] = nlapiGetFieldValue(f);
			}
		}
	}

	function restoreFieldValues(list) {
		for (var f in list) {
				nlapiSetFieldValue(f, list[f], false);
		}
	}

	this.run = function run() {
		getFieldValues(fieldsFilteredByNexus);

		if (hasVisibleSlaves) {
			nlapiSetFieldValue('custbody_itr_nexus', nlapiGetFieldValue('custpage_itr_nexus'), true, true);
			restoreFieldValues(fieldsFilteredByNexus);
		}
	};
};


//Declared Functions
_4874.IntrastatTranCS.onPageInit = function onPageInit(mode) {
	try {
		var currentcontext = nlapiGetContext().getExecutionContext();
		var executioncontext = VAT.Constants.ScriptMap["customscript_tax_tran_cs"].executioncontext;
		var clientcontext = executioncontext ? executioncontext.join(",") : "";
		if (clientcontext.indexOf(currentcontext) == -1) {return true;}

		//populate the tran VAT.taxtrantype
		var trantype = nlapiGetFieldValue("type");

		for(var imap in VAT.Constants.TransactionMap) {
			if (VAT.Constants.TransactionMap[imap].alternatecode == trantype) {
				VAT.taxtrantype = imap;
				break;
			}
		}

		new VAT.TaxFieldConductor().run();
		new VAT.NexusNOTC().run(mode);
		new VAT.RegimeCode().run();

	} catch(ex) {VAT.LogError(ex, "onPageInit");}
	return true;
}

_4874.IntrastatTranCS.onSaveRecord = function onSaveRecord() {
	var result = true;
    try {
		nlapiSetFieldValue('custbody_delivery_terms', nlapiGetFieldValue('custpage_delivery_terms'));
		nlapiSetFieldValue('custbody_regime_code', nlapiGetFieldValue('custpage_regime_code_of_supply'));
		result = new VAT.CounterPartyVAT().validateField();
		
    } catch (ex) {
        VAT.LogError(ex, "onSaveRecord");
    }
    return result;
}

var _countryNexusMap = {};
var NEXUS_FIELD_MAP = {
	documentNumber: {sublist: '', id: 'custbody_itr_doc_number', nexus:['CZ']}
};

_4874.IntrastatTranCS.onFieldChanged = function onFieldChanged(sublistid, fieldid, linenum) {
    if (fieldid === 'custpage_country_of_origin_temp') {
		new VAT.CountryOfOrigin().setValue();
	} else if (fieldid !== 'nexus') {
		return;
	}

	var nexus = nlapiGetFieldValue('nexus');
	setDisplayFields(nexus);
}

function setDisplayFields(nexusId) {
	for (var f in NEXUS_FIELD_MAP) {
		var nexusField = NEXUS_FIELD_MAP[f];
		var field = nlapiGetField(nexusField.id);
		if (!field) {
			continue;
		}
		var country = _countryNexusMap[nexusId] ? _countryNexusMap[nexusId] : nlapiLookupField('nexus', nexusId, 'country');
		_countryNexusMap[nexusId] = country;

		if (nexusField.nexus.indexOf(country) > -1) {
			field.setDisplayType('normal');
		} else {
			field.setDisplayType('hidden');
		}
	}
}

function onMark(mark) {
	if (!nlapiGetLineItemField('item', 'custcol_5892_eutriangulation')) {
		alert('The EU Triangulation column is hidden on the transaction form used.\n\n' +
			  'To use the Mark/Clear EU Triangulation Column buttons, ' +
			  'edit the transaction form to show the EU Triangulation column.');
	}

	var itemCount = nlapiGetLineItemCount('item');
	if (itemCount == 0) {
		return;
	}

	for (var item = 1; item <= itemCount; item++) {
		nlapiSetLineItemValue('item', 'custcol_5892_eutriangulation', item, mark);
	}
	nlapiRefreshLineItems('item');
}

_4874.IntrastatTranCS.validateLine = function validateLine(sublist, id) {
    var result = true;
    try {
        if (sublist === 'item') {
            result = new VAT.CounterPartyVAT().validateLine();
            new VAT.CountryOfOrigin().setCurrentLineItemValue();
        }
    } catch (ex) {
        VAT.LogError(ex, 'validateLine');
    }
    return result;
}

/******** BE fields ********/
VAT.CounterPartyVAT = function() {
    this.supportedNexus = ['BE'];
    this.sublist = 'item';
    this.strMsgs = JSON.parse(nlapiGetFieldValue('custpage_cs_msgs'));
};

VAT.CounterPartyVAT.prototype.validateField = function() {
    var result = true;
    var counterPartyVATFieldValue = nlapiGetFieldValue('custbody_counterparty_vat');
    if (!this.isValidCounterPartyVAT(counterPartyVATFieldValue)) {
        alert(this.strMsgs["ERR_FIELD_TAXREPORTING_COUNTERPARTYVAT_VALUE"]);
        result = false;
    }
    return result;
};

VAT.CounterPartyVAT.prototype.validateLine = function() {
    var result = true;
    var lineCounterpartyVAT = nlapiGetCurrentLineItemValue(this.sublist, 'custcol_counterparty_vat');
    if (!this.isValidCounterPartyVAT(lineCounterpartyVAT)) {
        alert(this.strMsgs["ERR_FIELD_COUNTERPARTYVAT_VALUE"]);
        result = false;
    }
    return result;
};

VAT.CounterPartyVAT.prototype.isValidCounterPartyVAT = function(value) {
    var isValid = true;
    if (value) {
        isValid = (/^[a-zA-Z]{2}[a-zA-Z0-9]{2,}$/).test(value);
    }
    return isValid;
};

VAT.CountryOfOrigin = function() {
    this.supportedNexus = ['BE'];
    this.sublist = 'item';
};

VAT.CountryOfOrigin.prototype.setValue = function() {
    var tempValue = nlapiGetFieldValue('custpage_country_of_origin_temp');
    nlapiSetFieldValue('custbody_country_of_origin', tempValue);
};

VAT.CountryOfOrigin.prototype.setCurrentLineItemValue = function() {
    var code = nlapiGetCurrentLineItemValue(this.sublist, 'custpage_country_of_origin_line_temp');
    var name = nlapiGetCurrentLineItemText(this.sublist, 'custpage_country_of_origin_line_temp');
    nlapiSetCurrentLineItemValue(this.sublist, 'custcol_country_of_origin_code', code, false);
    nlapiSetCurrentLineItemValue(this.sublist, 'custcol_country_of_origin_name', name, false);
};

VAT.RegimeCode = function RegimeCode(){
	this.run = setStoredRegimeCode;

	function setStoredRegimeCode(){
		var regimeCode = nlapiGetFieldValue("custbody_regime_code");
		nlapiSetFieldValue("custpage_regime_code_of_supply", regimeCode);
		nlapiSetFieldValue("custbody_regime_code", "");
	}
};

