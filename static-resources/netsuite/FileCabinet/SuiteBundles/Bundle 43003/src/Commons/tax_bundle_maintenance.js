/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

var VAT; 
if (!VAT) VAT = {};

VAT.FEATURE = {
	nondeductible: "nondeductible",
	onlinefiling: "online", 
	intrastat: "intrastat",
	eusales: "eusales"
}

VAT.STAGE = {
	start: {id: "start", next: "nondeductible"},
	nondeductible: {id: "nondeductible", next: "eusales"},
	eusales: {id: "eusales", next: "onlinefiling"},
	onlinefiling: {id: "onlinefiling", next: "end"},
	end: {id: "end", next: null}
}

VAT.PARAMS = {
	stage: "custscript_maintenance_stage"
}

if (!VAT.CONFIG) VAT.CONFIG = {};
VAT.CONFIG.RECORDTYPE = { 
	setup: "customrecord_tax_return_setup_item",
	mapper: "customrecord_tax_report_map"
}

VAT.CONFIG.FIELDS = {
	countrycode: "custrecord_vat_cfg_country",
	name: "custrecord_vat_cfg_name",
	type: "custrecord_vat_cfg_type", 
	value: "custrecord_vat_cfg_value",
	subsidiary: "custrecord_vat_cfg_subsidiary",
	tab: "custrecord_vat_cfg_taborder",
	label: "custrecord_vat_cfg_label",
	visible: "custrecord_vat_cfg_isvisible",
	mandatory: "custrecord_vat_cfg_ismandatory",
	help: "custrecord_vat_cfg_helptext",
	product: "custrecord_vat_cfg_product", 
	nondeductible: "custrecord_vat_cfg_nondeductible"
}

function onRun() {
	try {
		var stage = nlapiGetContext().getSetting('SCRIPT', VAT.PARAMS.stage);
		nlapiLogExecution("Debug", "onRun: stage", stage);

		var feature = getEnabledFeature();
		switch (stage) {
			case VAT.STAGE.start.id:
				nlapiLogExecution("Debug", "onRun: started", stage);
				reschedule(VAT.STAGE.start.next);
				break;
			case VAT.STAGE.nondeductible.id:
				if(feature[VAT.FEATURE.nondeductible]) {
					new VAT.NonDeductible().run();
				} else {
					nlapiLogExecution("Debug", "Skipping: not enabled", stage);
				}
				break;
			case VAT.STAGE.eusales.id:
				if(feature[VAT.FEATURE.eusales]) {
					new VAT.EUSales().run();
				} else {
					nlapiLogExecution("Debug", "Skipping: not enabled", stage);
				}
				break;
			case VAT.STAGE.onlinefiling.id:
				if(feature[VAT.FEATURE.onlinefiling]) {
					new VAT.OnlineFiling().run();
				} else {
					nlapiLogExecution("Debug", "Skipping: not enabled", stage);
				}
				break;				
			case VAT.STAGE.end.id: default:  
				nlapiLogExecution("Debug", "onRun: terminated", stage);
				break;
		}
	} catch(ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "onRun", errorMsg);
	}
}

function getEnabledFeature() {
	var feature = {};
	try {
		var searchColumns = [new nlobjSearchColumn("custrecord_tax_map_option_value", "custrecord_enable_feature")];
		var searchFilters = [new nlobjSearchFilter("custrecord_map_type", null, "is", "SCRIPT"), 
		    new nlobjSearchFilter("custrecord_internal_id", null, "is", "customscript_tax_bundle_maintenance")];
		var rs = nlapiSearchRecord("customrecord_tax_report_map", null, searchFilters, searchColumns);
		
		for (var iresult in rs) {
			var value = rs[iresult].getValue("custrecord_tax_map_option_value", "custrecord_enable_feature");				
			feature[value] = true;
		}
	} catch(ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "getEnabledFeature", errorMsg);
	}
	
	return feature;
}

function checkReschedule(stage) {
	try {
		if (nlapiGetContext().getRemainingUsage() <= 100) {
			reschedule(stage);
			return true;
		} else {
			return false;
		}
	} catch(ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "checkReschedule", errorMsg);
	}
}

function reschedule(stage) {
	try {
		var params = {};
		params[VAT.PARAMS.stage] = stage;
	
		nlapiScheduleScript(nlapiGetContext().getScriptId(), nlapiGetContext().getDeploymentId(), params);
	} catch(ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "reschedule", errorMsg);
	}
}

function updateLabels(fieldName, labelValue, stage) {
	try {
		var searchColumns = [new nlobjSearchColumn(VAT.CONFIG.FIELDS.name)];
		var searchFilters = [new nlobjSearchFilter(VAT.CONFIG.FIELDS.name, null, "is", fieldName)];
		var rs = nlapiSearchRecord(VAT.CONFIG.RECORDTYPE.setup, null, searchFilters, searchColumns);

		for(var i in rs){
			nlapiSubmitField(VAT.CONFIG.RECORDTYPE.setup, rs[i].getId(), VAT.CONFIG.FIELDS.label, labelValue);
			checkReschedule(stage);
		}
	} catch(ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "updateLabels", errorMsg);
	}
}

function updateAttribute (attributeField, attributeName, attributeValue, stage) {
	try {
		var searchColumns = [new nlobjSearchColumn(VAT.CONFIG.FIELDS.name)];
		var searchFilters = [new nlobjSearchFilter(attributeField, null, "is", attributeName)];
		var rs = nlapiSearchRecord(VAT.CONFIG.RECORDTYPE.setup, null, searchFilters, searchColumns);

		for(var i in rs){
			nlapiSubmitField(VAT.CONFIG.RECORDTYPE.setup, rs[i].getId(), attributeField, attributeValue);
			checkReschedule(stage);
		}
	} catch(ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "updateAttribute", errorMsg);
	}
}

function updateValue(fieldName, fieldValue, stage) {
	try {
		var searchColumns = [new nlobjSearchColumn(VAT.CONFIG.FIELDS.name)];
		var searchFilters = [new nlobjSearchFilter(VAT.CONFIG.FIELDS.name, null, "is", fieldName)];
		var rs = nlapiSearchRecord(VAT.CONFIG.RECORDTYPE.setup, null, searchFilters, searchColumns);

		for(var i in rs){
			nlapiSubmitField(VAT.CONFIG.RECORDTYPE.setup, rs[i].getId(), VAT.CONFIG.FIELDS.label, fieldValue);
			checkReschedule(stage);
		}
	} catch(ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "updateValue", errorMsg);
	}
}

function cleanUpConfiguration(fieldName, stage) {
	try {
		var searchColumns = [new nlobjSearchColumn(VAT.CONFIG.FIELDS.name)];
		var searchFilters = [new nlobjSearchFilter(VAT.CONFIG.FIELDS.name, null, "is", fieldName)];
		var rs = nlapiSearchRecord(VAT.CONFIG.RECORDTYPE.setup, null, searchFilters, searchColumns);

		for(var i in rs){
			nlapiDeleteRecord(VAT.CONFIG.RECORDTYPE.setup, rs[i].getId());
			checkReschedule(stage);
		}
	} catch(ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "cleanUpConfiguration", errorMsg);
	}
}

VAT.OnlineFiling = function() {
	this.run = function() {
		try {
			updateTaxContact();
			checkReschedule(VAT.STAGE.onlinefiling.id);
			
			updateLabels("ESLPostCode", "VAT Postcode", VAT.STAGE.onlinefiling.id);
			updateLabels("SenderID", "HMRC User ID", VAT.STAGE.onlinefiling.id);
			updateAttribute(VAT.CONFIG.FIELDS.mandatory, "VATRegistration", "F", VAT.STAGE.onlinefiling.id);
			updateValue("SubmissionGateway", "https://transaction-engine.tax.service.gov.uk/submission", VAT.STAGE.onlinefiling.id);
			updateValue("PollGateway", "https://transaction-engine.tax.service.gov.uk/poll", VAT.STAGE.onlinefiling.id);
			
			reschedule(VAT.STAGE.onlinefiling.next);
		} catch(ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "VAT.OnlineFiling.run", errorMsg);
		}
	}
	
	function updateEntity(internalid, recordtype) {
		try {
			var filter = [new nlobjSearchFilter("internalid", null, "is", internalid), new nlobjSearchFilter("contactrole", "contact", "is", -10)];
			var column = [new nlobjSearchColumn("contact"), new nlobjSearchColumn("firstname", "contact"), new nlobjSearchColumn("middlename", "contact"), new nlobjSearchColumn("lastname", "contact")];
			var rs = nlapiSearchRecord(recordtype, null, filter, column);

			if (rs) {
				var contactid = rs[0].getValue("contact");
				var lastname = rs[0].getValue("lastname", "contact");
				var firstname = rs[0].getValue("firstname", "contact");
				var middlename = rs[0].getValue("middlename", "contact");
				
				var submitlist = ["custentity_tax_contact","custentity_tax_contact_last","custentity_tax_contact_first","custentity_tax_contact_middle"];
				var submitvalue = [contactid, lastname, firstname, middlename];
				
				nlapiSubmitField(rs[0].getRecordType(), rs[0].getId(), submitlist, submitvalue);
			}
			
		} catch(ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "updateEntity", errorMsg);
		}
	}

	
	function updateTaxContact() {
		try {
			var filter = [new nlobjSearchFilter("country", null, "is", "PH"), 
			              new nlobjSearchFilter("custentity_tax_contact", null, "is", "@NONE@"), 
			              new nlobjSearchFilter("type", null, "anyof", ["CustJob", "Vendor"])];
			var column = [new nlobjSearchColumn("internalid")];
			
			var searchObj = nlapiCreateSearch('entity', filter, column);
			var rowset = searchObj.runSearch();

			for(var ipage = 0; ipage < 100; ipage++) {
				var startindex = ipage*1000;
				var endindex = ipage*1000 + 1000;
				var rs = rowset.getResults(startindex, endindex);

				if (rs.length == 0) {
					break;
				} else {
					if (nlapiGetContext().getRemainingUsage() < 100) {break;}
					for(var irow = 0; irow<rs.length; irow++) {
						var rec = nlapiLoadRecord(rs[irow].getRecordType(), rs[irow].getId());
						updateEntity(rec.getId(), rec.getRecordType());
						checkReschedule(VAT.STAGE.onlinefiling.id);
					}
				}
			}
		} catch(ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "updateTaxContact", errorMsg);
		}		
	}
}

VAT.EUSales = function() {
	this.run = function() {
		try {
			updateProjectVATNo();
			checkReschedule(VAT.STAGE.eusales.id);
			cleanUpConfiguration("ESLSenderID", VAT.STAGE.eusales.id);
			reschedule(VAT.STAGE.eusales.next);
		} catch(ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "VAT.EUSales.run", errorMsg);
		}
	}
	

	function updateProjectVATNo() {
		try {
			if (!nlapiGetContext().getFeature("jobs")) {
				nlapiLogExecution("Debug", "Skipping Project Update", "Project is not not enabled");
				return true;
			} //skip if no jobs
			
			var filters = [new nlobjSearchFilter("custentity_vat_reg_no", null, "is", "@NONE@")];
			var columns = [new nlobjSearchColumn("custentity_vat_reg_no")];
			var searchObj = nlapiCreateSearch('job', filters, columns);
			var rowset = searchObj.runSearch();

			for(var ipage = 0; ipage < 100; ipage++) {
				var startindex = ipage*1000;
				var endindex = ipage*1000 + 1000;
				var rs = rowset.getResults(startindex, endindex);

				if (rs.length == 0) {
					break;
				} else {
					if (nlapiGetContext().getRemainingUsage() < 100) {break;}
					for(var irow = 0; irow<rs.length; irow++) {
						var rec = nlapiLoadRecord('job', rs[irow].getId());
						nlapiSubmitRecord(rec);
						checkReschedule(VAT.STAGE.eusales.id);
					}
				}
			}
		} catch(ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "updateProjectVATNo", errorMsg);
		}		
	}
}

VAT.TaxContact = function () {
	this.run = function() {
		try {
			removeDeprecatedConfiguration();
			reschedule(VAT.STAGE.nondeductible.next);
		} catch(ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "VAT.NonDeductible.run", errorMsg);
		}
	}
	
	var filter = [new nlobjSearchFilter("country", null, "is", "PH"), new nlobjSearchFilter("custentity_tax_contact", null, "is", "@NONE@"), new nlobjSearchFilter("type", null, "anyof", ["CustJob", "Vendor"]), ];
	var column = [new nlobjSearchColumn("custentity_tax_contact")];
	var rs = nlapiSearchRecord("entity", null, filter, column);

}

VAT.NonDeductible = function () {
	this.run = function() {
		try {
			removeDeprecatedConfiguration();
			reschedule(VAT.STAGE.nondeductible.next);
		} catch(ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "VAT.NonDeductible.run", errorMsg);
		}
	}
	
	function removeDeprecatedConfiguration() {
		try {
			var deprecatedlist = searchDeprecatedRecords();
			
			for(var irow in deprecatedlist) {
				nlapiDeleteRecord(VAT.CONFIG.RECORDTYPE.setup, deprecatedlist[irow]);
				checkReschedule(VAT.STAGE.nondeductible.id);
			}
		} catch(ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "removeDeprecatedConfiguration", errorMsg);
		}
	}
	
	function searchDeprecatedRecords() {
		var internalidlist = [];
		try {
			var filter = [new nlobjSearchFilter(VAT.CONFIG.FIELDS.name, null, "isnot", "custpage_nonded_checkline"), 
			              new nlobjSearchFilter(VAT.CONFIG.FIELDS.name, null, "isnot", "custpage_nonded_subsidiaryid"),
			              new nlobjSearchFilter(VAT.CONFIG.FIELDS.nondeductible, null, "is", "T"),
			              ];
			var column = [new nlobjSearchColumn(VAT.CONFIG.FIELDS.name)];
			var rs = nlapiSearchRecord(VAT.CONFIG.RECORDTYPE.setup, null, filter, column)
			
			for(var irow in rs) {
				internalidlist.push(rs[irow].getId());
			}
		} catch(ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "searchDeprecatedRecords", errorMsg);
		}
		
		return internalidlist;
	}
}