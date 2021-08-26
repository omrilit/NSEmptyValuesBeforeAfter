/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

var Tax;
if (!Tax) Tax = {};
Tax.MAP_RECORD_TYPE = "customrecord_tax_report_map";
Tax.NonDeductible = function () {
	var _ResMgr = initResMgr();
	var isOW = nlapiGetContext().getSetting("FEATURE", "SUBSIDIARIES") == "T";
	var TAB = {id: "custpage_nonded", label: _ResMgr.GetString("FORM_TAB_LABEL_NONDEDTAX")};
	
	var GROUP = {global: {id: TAB.id + "_globalpref", label: _ResMgr.GetString("FORM_GROUP_LABEL_ENABLE_NONDEDUCT_CHECK")}}		
	var FIELDS = {
		subsidiary: {id: TAB.id + "_subsidiaryid", label: _ResMgr.GetString("FORM_FIELD_LABEL_SUBSIDIARY"), defaultvalue: "1", type: "select"},
		checkline: 	{id: TAB.id + "_checkline", label: _ResMgr.GetString("FORM_FIELD_LABEL_ENABLENONDEDUCTCHECK"), defaultvalue: "T", type: "checkbox", 
					 help: _ResMgr.GetString("INFO_ENABLE_NONDEDUCTCHECK")},
		internalid: {id: TAB.id + "_internalid", label: "Internal Id", type: "longtext"}
	}
	function getDefaultValue(storedval, defaultval) {
		if (storedval) {return storedval.value}
		else {return defaultval};
	}
	
	this.display = display;
	function display(form, params) {
		try {
			var _App = new SFC.System.Application("");
			form.addTab(TAB.id, TAB.label);
			form.addFieldGroup(GROUP.global.id, GROUP.global.label, TAB.id);
			
			if (isOW) {
				var subsidiaryList = getNonDeductibleSubsidiaryList();
				var subsidiaryfield = new SFC.System.SubsidiaryCombobox(form, FIELDS.subsidiary.id, FIELDS.subsidiary.label, 
						params[FIELDS.subsidiary.id], "normal", subsidiaryList, GROUP.global.id, "startcol");
			}
			form.addField(FIELDS.checkline.id, FIELDS.checkline.type, FIELDS.checkline.label, null, GROUP.global.id).setHelpText(FIELDS.checkline.help).setLayoutType("normal", "none");
			var recordmap = retrieve(params);
			nlapiLogExecution("Audit", "Tax.NonDeductible.display: Retrieved Record", JSON.stringify(recordmap));
			form.getField(FIELDS.checkline.id).setDefaultValue(getDefaultValue(recordmap[FIELDS.checkline.id], FIELDS.checkline.defaultvalue));
			//Hidden Fields
			
			var internalfield = form.addField(FIELDS.internalid.id, FIELDS.internalid.type, FIELDS.internalid.label, null, TAB.id);
			internalfield.setDefaultValue(JSON.stringify(recordmap));
			internalfield.setDisplayType("hidden");
		} catch(ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "Tax.NonDeductible.display", errorMsg);
		}
	}
	
	this.save = save;
	function save(params) {
		try {
			var recordmap = JSON.parse(params[FIELDS.internalid.id]);
			var recordlist = [];
			var recordset = {};
			
			recordset[FIELDS.subsidiary.id] = params[FIELDS.subsidiary.id]; 
			recordset[FIELDS.checkline.id] = params[FIELDS.checkline.id];
			nlapiLogExecution("Audit", "Tax.NonDeductible.save:", 
					["Old Values", JSON.stringify(recordmap), "New Values", JSON.stringify(recordset)].join("<br/>"));
			
			for(var ifield in recordset) {
				var value = recordset[ifield];
				
				if (recordmap[ifield]) {
					updateRecord(recordmap[ifield].internalid, ifield, value);
				} else {
					var rec = createRecord(ifield, value);
					if (isOW) {
						rec.setFieldValue(Tax.CONFIG_FIELDS.subsidiaryid, recordset[FIELDS.subsidiary.id]);
					}
					nlapiSubmitRecord(rec);
				}
			}
		} catch(ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "Tax.NonDeductible.save", errorMsg);
		}
	}
	
	function updateRecord(id, field, value) {
		var successful = true;
		try {
			nlapiLogExecution("Audit", "Tax.NonDeductible.updateRecord", JSON.stringify({id:id, field:field, value:value}));
			nlapiSubmitField(Tax.CONFIG_RECORD_TYPE, parseInt(id), Tax.CONFIG_FIELDS.value, value);
		} catch(ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "Tax.NonDeductible.updateRecord", errorMsg);
			successful = false;
		}
		
		return successful;
	}
	
	function createRecord(id, value) {
		var rec;
		try {
			rec = nlapiCreateRecord(Tax.CONFIG_RECORD_TYPE);
			rec.setFieldValue(Tax.CONFIG_FIELDS.name, id);
			rec.setFieldValue(Tax.CONFIG_FIELDS.value, value);
			rec.setFieldValue(Tax.CONFIG_FIELDS.type, Tax.CONFIG_VALUE.type.text);
			rec.setFieldValue(Tax.CONFIG_FIELDS.isnondeductible, "T");
		} catch(ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "Tax.NonDeductible.save", errorMsg);
			rec = null;
		}
		
		return rec;
	}
	
	function retrieve(params) {
		var recordmap = {};
		try {
			var filter = [new nlobjSearchFilter(Tax.CONFIG_FIELDS.inactive, null, "is", 'F'), new nlobjSearchFilter(Tax.CONFIG_FIELDS.isnondeductible, null, "is", 'T')];
			if (isOW && params[FIELDS.subsidiary.id]) {
				filter.push(new nlobjSearchFilter(Tax.CONFIG_FIELDS.subsidiaryid, null, "is", params[FIELDS.subsidiary.id]));
			}
			var column = [new nlobjSearchColumn(Tax.CONFIG_FIELDS.value), new nlobjSearchColumn(Tax.CONFIG_FIELDS.name)];
			var rs = nlapiSearchRecord(Tax.CONFIG_RECORD_TYPE, null, filter, column);

			for(var irow in rs) {
				var value = rs[irow].getValue(Tax.CONFIG_FIELDS.value);
				var fieldname = rs[irow].getValue(Tax.CONFIG_FIELDS.name);
				recordmap[fieldname] = {value: value, internalid: rs[irow].getId()};
			}
		} catch(ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "Tax.NonDeductible.retrieve", errorMsg);
		}
		
		return recordmap;
	}
	
	function initResMgr(){
		var _CultureId = nlapiGetContext().getPreference("LANGUAGE");
	    return (new ResourceMgr(_CultureId));
	}
}