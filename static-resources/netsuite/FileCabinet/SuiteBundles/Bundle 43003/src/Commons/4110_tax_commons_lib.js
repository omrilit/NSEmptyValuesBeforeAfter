/**
 * Copyright © 2014, 2018, Oracle and/or its affiliates. All rights reserved.
 */

//This is a library for server-side script only.
var VAT;
if (!VAT) VAT = {};

VAT.TaxCache = function() {
//	NetSuite trims spaces, use + character to determine start and end of line
	var _threshold = 99998;
	this.RemoveTaxCache = removeTaxCache;
	function removeTaxCache(id) {
		try {
			var rec = nlapiLoadRecord("customrecord_tax_cache", id);

			var recordcount = rec.getLineItemCount("recmachcustrecord_tax_cache");
			for(var irecord = 0; irecord < recordcount; irecord++) {
				rec.removeLineItem("recmachcustrecord_tax_cache", 1);
			}
			var internalid = nlapiSubmitRecord(rec);
			nlapiDeleteRecord("customrecord_tax_cache", internalid);
		} catch(ex) {logException(ex, "RemoveTaxCache");}
	};

    this.GetOnlineFilingCache = GetOnlineFilingCache;
	function GetOnlineFilingCache(onlineFilingId, type) {
		var result = {detail: '', metadata: '', name: '', properties: ''};
		try {
			var sublist = 'recmachcustrecord_online_filing';

			var rec = nlapiLoadRecord('customrecord_online_filing', onlineFilingId);
			var detailcount = rec.getLineItemCount(sublist);
			var detaillist = [];

			for(var iparse = 0; iparse <= detailcount; iparse++) {
				var value = (type == 'SALE') ?
                        rec.getLineItemValue(sublist, 'custrecord_sales_details', iparse+1) :
                        rec.getLineItemValue(sublist, 'custrecord_purch_detail', iparse+1);
				detaillist.push(value ? value.slice(1, -1) : '');
			}
			result.detail = JSON.parse(detaillist.join(''));
		} catch(ex) {logException(ex, 'GetOnlineFilingCache');}

		return result;
	}

	this.GetSysNoteCache = GetSysNoteCache;
	function GetSysNoteCache(sysnoteid, type) {
		var result = {detail: "", metadata: "", name: "", properties: ""};
		try {
			var sublist = "recmachcustrecord_vatonline_submitted_period";

			var rec = nlapiLoadRecord("customrecord_vatonline_submittedperiod", sysnoteid);
			var detailcount = rec.getLineItemCount(sublist);
			var detaillist = [];

			for(var iparse = 0; iparse <= detailcount; iparse++) {
				var value = (type == "SALE")?rec.getLineItemValue(sublist, "custrecord_sales_details", iparse+1):rec.getLineItemValue(sublist, "custrecord_purch_detail", iparse+1);
				detaillist.push(value?value.slice(1, -1):"");
			}
			result.detail = JSON.parse(detaillist.join(""));
		} catch(ex) {logException(ex, "GetSysNoteCache");}

		return result;
	}

	this.AppendTaxCache = function(cacheid, details, meta, properties) {
		var internalid =  0;
		try {
			var content = JSON.stringify(details);
			var metadata = JSON.stringify(meta);
			var contentlength = content ? Math.ceil(content.length/_threshold) : 0;
			var metadatalength = metadata ? Math.ceil(metadata.length/_threshold) : 0;

			var counter = (contentlength > metadatalength)?contentlength:metadatalength;
			var sublist = "recmachcustrecord_tax_cache";
			var rec = nlapiLoadRecord("customrecord_tax_cache", cacheid);

			var recordcount = rec.getLineItemCount(sublist);
			for(var irecord = 0; irecord < recordcount; irecord++) {
				rec.removeLineItem(sublist, 1);
			}

			rec.setFieldValue("custrecord_tax_cache_properties", properties);
			for(var iparse = 0; iparse < counter; iparse++) {
				rec.selectNewLineItem(sublist);
				rec.setCurrentLineItemValue(sublist,'custrecord_detail', "+" + content.substring(iparse*_threshold, (iparse*_threshold) + _threshold) + "+");
				if (iparse < metadatalength) {
					rec.setCurrentLineItemValue(sublist,'custrecord_metadata', "+" + metadata.substring(iparse*_threshold, (iparse*_threshold) + _threshold) + "+");
				}
				rec.commitLineItem(sublist);
			}
			internalid = nlapiSubmitRecord(rec);
		} catch(ex) {logException(ex, "AppendTaxCache");}
		return internalid;
	};

	this.UpdateTaxCache = function(cacheid, properties, meta) {
		var result = {detail: "", metadata: "", name: "", properties: ""};
		try {
			var metadata = JSON.stringify(meta);
			var rec = nlapiLoadRecord("customrecord_tax_cache", cacheid);
			var sublist = "recmachcustrecord_tax_cache";

			result.cacheid = cacheid;
			result.name = rec.getFieldValue("name");
			result.properties = properties;

			rec.setFieldValue("custrecord_tax_cache_properties", properties);
			var detailcount = rec.getLineItemCount(sublist);
			var detaillist = [];
			for(var iparse = 0; iparse < detailcount; iparse++) {
				rec.selectLineItem(sublist, iparse+1);
				rec.setCurrentLineItemValue(sublist, "custrecord_metadata", "");
				rec.commitLineItem(sublist);

				detaillist.push(rec.getLineItemValue(sublist, "custrecord_detail", iparse+1) ? rec.getLineItemValue(sublist, "custrecord_detail", iparse+1).slice(0, -1) : "");
			}

			for(var imeta = 0; imeta < detailcount; imeta++) {
				rec.selectLineItem(sublist, imeta+1);
				rec.setCurrentLineItemValue(sublist, "custrecord_metadata", "+" + metadata.substring(imeta*_threshold, (imeta*_threshold) + _threshold) + "+");
				rec.commitLineItem(sublist);
			}
			nlapiSubmitRecord(rec);

			result.detail = detaillist.join("");
			result.metadata = metadata;
		} catch(ex) {logException(ex, "UpdateTaxCache");}

		return result;
	};

	this.AddTaxCache = function(cachecode, properties, details, meta) {//pass strings
		var internalid =  0;
		try {
			var content = JSON.stringify(details);
			var metadata = JSON.stringify(meta);
			var contentlength = content ? Math.ceil(content.length/_threshold) : 0;
			var metadatalength = metadata ? Math.ceil(metadata.length/_threshold) : 0;

			var counter = (contentlength > metadatalength)?contentlength:metadatalength;
			var sublist = "recmachcustrecord_tax_cache";
			var rec = nlapiCreateRecord("customrecord_tax_cache");
			rec.setFieldValue("name", cachecode);
			rec.setFieldValue("custrecord_tax_cache_properties", properties);

			for(var iparse = 0; iparse < counter; iparse++) {
				rec.selectNewLineItem(sublist);

				rec.setCurrentLineItemValue(sublist,'custrecord_detail', "+" + content.substring(iparse*_threshold, (iparse*_threshold) + _threshold) + "+");
				if (iparse < metadatalength) {
					rec.setCurrentLineItemValue(sublist,'custrecord_metadata', "+" + metadata.substring(iparse*_threshold, (iparse*_threshold) + _threshold) + "+");
				}

				rec.commitLineItem(sublist);
			}
			internalid = nlapiSubmitRecord(rec);
		} catch(ex) {logException(ex, "AddTaxCache");}
		return internalid;
	};

	this.GetTaxCache = function(cacheid) {
		var result = {detail: "", metadata: "", name: "", properties: "", rawdetail: ""};
		try {
			var rec = nlapiLoadRecord("customrecord_tax_cache", cacheid);

			result.name = rec.getFieldValue("name");
			result.properties = rec.getFieldValue("custrecord_tax_cache_properties");
			var detailcount = rec.getLineItemCount("recmachcustrecord_tax_cache");
			var sublist = "recmachcustrecord_tax_cache";

			var detaillist = [];
			var metadatalist = [];
			for(var iparse = 0; iparse < detailcount; iparse++) {
				detaillist.push(rec.getLineItemValue(sublist, "custrecord_detail", iparse+1) ? rec.getLineItemValue(sublist, "custrecord_detail", iparse+1).slice(1, -1) : "");
				metadatalist.push(rec.getLineItemValue(sublist, "custrecord_metadata", iparse+1) ? rec.getLineItemValue(sublist, "custrecord_metadata", iparse+1).slice(1, -1) : "");
			}

			result.rawdetail = detaillist.join("");
			result.detail = JSON.parse(detaillist.join(""));
			result.metadata = JSON.parse(metadatalist.join(""));
		} catch(ex) {logException(ex, "GetTaxCache");}
		return result;
	};

	this.GetTaxCacheProperties = function(cacheid) {
		var properties = "";
		try {
			var sr = nlapiSearchRecord("customrecord_tax_cache", null, new nlobjSearchFilter("ID", null, "equalto", cacheid), new nlobjSearchColumn("custrecord_tax_cache_properties"));
			properties = sr[0].getValue("custrecord_tax_cache_properties");
		} catch(ex) {logException(ex, "GetTaxCacheProperties");}
		return properties;
	};

	this.CleanupCacheRecord = function(cachename) {
		try {
			var filters = [new nlobjSearchFilter("name", null, "startswith", cachename)];
			var columns = [new nlobjSearchColumn("name")];

			var rs = nlapiSearchRecord("customrecord_tax_cache", null, filters, columns);
			for(var irow in rs) {
				removeTaxCache(rs[irow].getId());
			}
		} catch(ex) {logException(ex, "cleanupCacheRecord");}
	};

	this.GetCacheMetaData = function(cacheid) {
		var metadata = {};
		try {
			var filters = [new nlobjSearchFilter("internalid", null, "is", cacheid)];
			var columns = [new nlobjSearchColumn("name"), new nlobjSearchColumn("custrecord_tax_cache_properties")];

			var rs = nlapiSearchRecord("customrecord_tax_cache", null, filters, columns);
			for(var irow in rs) {
				var property = rs[irow].getValue("custrecord_tax_cache_properties");
				metadata = {
					"name": rs[irow].getValue("name"),
					"properties": property?JSON.parse(property): {}
				};
			}
		} catch(ex) {logException(ex, "GetCacheMetaData");}
		return metadata;
	};

	this.GetTaxCacheIdByName = function(name) {
		if (!name) {
			return [];
		}

		var cache = nlapiSearchRecord("customrecord_tax_cache", null, new nlobjSearchFilter('name', null, 'is', name));
		var ids = [];

		for (var i = 0; cache && i < cache.length; i++) {
			ids.push(cache[i].getId());
		}

		return ids;
	};
};

function logException(ex, methodname) {
	var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
	nlapiLogExecution("ERROR", methodname, errorMsg);
}

function getTransactionMap() {
	var tranMap = {};

	try {
		var filter = [new nlobjSearchFilter("custrecord_map_type", null, "is", 'TXN'), new nlobjSearchFilter("isinactive", null, "is", 'F')];
		var column = [new nlobjSearchColumn("name"),
					  new nlobjSearchColumn("custrecord_transaction_name"),
					  new nlobjSearchColumn("custrecord_alt_code"),
					  new nlobjSearchColumn("custrecord_internal_id"),
					  new nlobjSearchColumn("custrecord_tax_map_option_value", "custrecord_enable_feature")
					  ];
		var rs = nlapiSearchRecord('customrecord_tax_report_map', null, filter, column);

		for(var irow in rs) {
			var id = rs[irow].getValue('custrecord_transaction_name');
			var trancode = rs[irow].getValue('name');
			var tranname= rs[irow].getText('custrecord_transaction_name');
			var alternatecode = rs[irow].getValue('custrecord_alt_code');
			var tranid = rs[irow].getValue('custrecord_internal_id');
			var featureid = rs[irow].getValue("custrecord_tax_map_option_value", "custrecord_enable_feature");

			if (!tranMap[trancode]) {
				tranMap[trancode] = {id: id, name: tranname, alternatecode: alternatecode, internalid: tranid, featurelist: []};
				if (featureid) {
					tranMap[trancode].featurelist.push(featureid);
				}
			} else {
				tranMap[trancode].featurelist.push(featureid);
			}
		}
	} catch(ex) {logException(ex, "getTransactionMap");}

	return tranMap;
}

function getExecutionContextMap() {
	var scriptMap = {};
	try {
		var filter = [new nlobjSearchFilter("custrecord_map_type", null, "is", 'SCRIPT'), new nlobjSearchFilter("isinactive", null, "is", 'F')];
		var column = [new nlobjSearchColumn("name"), new nlobjSearchColumn("custrecord_internal_id"),
					  new nlobjSearchColumn("custrecord_tax_map_option_value", "custrecord_execution_context")];
		var rs = nlapiSearchRecord('customrecord_tax_report_map', null, filter, column);

		for(var irow in rs) {
			var name = rs[irow].getValue("name");
			var id = rs[irow].getValue("custrecord_internal_id");
			var context =  rs[irow].getValue("custrecord_tax_map_option_value", "custrecord_execution_context");

			if (scriptMap[id]) {
				scriptMap[id].executioncontext.push(context);
			} else {
				scriptMap[id] = {name: name, executioncontext: [context]};
			}
		}
	} catch(ex) {logException(ex, "getExecutionContextMap");}

	return scriptMap;
}

function getEUNexuses() {
	var nexuses = {};

	try {
		var filter = [new nlobjSearchFilter("custrecord_is_eu_country", null, "is", 'T'), new nlobjSearchFilter("isinactive", null, "is", 'F')];
		var column = [new nlobjSearchColumn("custrecord_country_name"),
				new nlobjSearchColumn("name"),
				new nlobjSearchColumn("custrecord_alt_code"),
				new nlobjSearchColumn("custrecord_tax_map_option_value", "custrecord_enable_feature"),
				new nlobjSearchColumn("custrecord_tax_map_option_value", "custrecord_vat_class"),
				new nlobjSearchColumn("custrecord_tax_map_option_metadata", "custrecord_vat_class")
		]; //will become repeating
		var rs = nlapiSearchRecord('customrecord_tax_report_map', null, filter, column)

		for(var irow in rs) {
			var countrycode = rs[irow].getValue('name');
			var countryid = rs[irow].getValue('custrecord_country_name');
			var altcountrycode = rs[irow].getValue('custrecord_alt_code');
			var featureid = rs[irow].getValue("custrecord_tax_map_option_value", "custrecord_enable_feature");
			var vatclass = rs[irow].getValue("custrecord_tax_map_option_value", "custrecord_vat_class");
			var meta = rs[irow].getValue("custrecord_tax_map_option_metadata", "custrecord_vat_class");

			if (!nexuses[countrycode]) {
				nexuses[countrycode] = {id: countryid, nexuscode: countrycode, feature: {}, vatclass: {}};

				if (featureid && !nexuses[countrycode].feature[featureid]) {
					nexuses[countrycode].feature[featureid] = true;
				}

				if (vatclass && !nexuses[countrycode].vatclass[vatclass]) {
					nexuses[countrycode].vatclass[vatclass] = JSON.parse(meta);
				}

				if (altcountrycode) {
					nexuses[altcountrycode] = nexuses[countrycode];
				}
			} else {
				if (featureid) {
					nexuses[countrycode].feature[featureid] = true;
				}

				if (vatclass) {
					nexuses[countrycode].vatclass[vatclass] = JSON.parse(meta);
				}
			}
		}
	} catch(ex) {logException(ex, "getEUNexuses");}
	return nexuses;
}

function getReportNexus() {
	var nexuses = {};

	try {
		var filter = [new nlobjSearchFilter("custrecord_map_type", null, "is", 'NEXUS')];
		var column = [new nlobjSearchColumn("custrecord_country_name"),
				new nlobjSearchColumn("name"),
				new nlobjSearchColumn("custrecord_internal_id"),
				new nlobjSearchColumn("custrecord_alt_code"),
				new nlobjSearchColumn("custrecord_tax_map_option_value", "custrecord_enable_feature"),
				new nlobjSearchColumn("custrecord_tax_map_option_value", "custrecord_vat_class"),
				new nlobjSearchColumn("name", "custrecord_vat_class"),
				new nlobjSearchColumn("custrecord_tax_map_option_metadata", "custrecord_vat_class"),
				new nlobjSearchColumn("custrecord_format_supplementary")
		]; //will become repeating
		var rs = nlapiSearchRecord('customrecord_tax_report_map', null, filter, column);

		for(var irow in rs) {
			var countrycode = rs[irow].getValue('name');
			var internalid = rs[irow].getValue("custrecord_internal_id");
			var countryid = rs[irow].getValue('custrecord_country_name');
			var altcountrycode = rs[irow].getValue('custrecord_alt_code');
			var featureid = rs[irow].getValue("custrecord_tax_map_option_value", "custrecord_enable_feature");
			var formatsupplementary = rs[irow].getValue("custrecord_format_supplementary");

			var reportname = rs[irow].getValue("name", "custrecord_vat_class");
			var vatclass = rs[irow].getValue("custrecord_tax_map_option_value", "custrecord_vat_class");
			var meta = rs[irow].getValue("custrecord_tax_map_option_metadata", "custrecord_vat_class");

			if (!nexuses[countrycode]) {
				nexuses[countrycode] = {id: countryid, internalid: internalid, nexuscode: countrycode, feature: {}, vatclass: {}};
				if (altcountrycode) {
					nexuses[altcountrycode] = {id: countryid, nexuscode: altcountrycode};
				}

				if (featureid && !nexuses[countrycode].feature[featureid]) {
					nexuses[countrycode].feature[featureid] = true;
				}

				if (vatclass && !nexuses[countrycode].vatclass[vatclass]) {
					nexuses[countrycode].vatclass[vatclass] = JSON.parse(meta);
					nexuses[countrycode].vatclass[vatclass].name = reportname;
				}
			} else {
				if (featureid) {
					nexuses[countrycode].feature[featureid] = true;
				}

				if (vatclass) {
					nexuses[countrycode].vatclass[vatclass] = JSON.parse(meta);
					nexuses[countrycode].vatclass[vatclass].name = reportname;
				}
			}

			nexuses[countrycode].formatsupplementary = formatsupplementary == "T" ? true : false;
		}
	} catch(ex) {logException(ex, "getReportNexus");}
	return nexuses;
}

function getEUSubsidiaries(subsidiaryIds) {
	var list = [];
	var isOW = nlapiGetContext().getSetting("FEATURE", "SUBSIDIARIES") == "T";
	if (!isOW) return list;

	try {
		var valideunexus = getEUNexuses();
		var filters = [new nlobjSearchFilter("isinactive", null, "is", 'F'), new nlobjSearchFilter("iselimination", null, "is", 'F')];
		var columns = [new nlobjSearchColumn("namenohierarchy"), new nlobjSearchColumn("country"), new nlobjSearchColumn("name")];
		var rs;
		
		if (subsidiaryIds && subsidiaryIds.length > 0) {
		    filters.push(new nlobjSearchFilter('internalid', null, 'anyof', subsidiaryIds));
		}
		
		rs = nlapiSearchRecord('subsidiary', null, filters, columns);
		for(var isearch in rs) {
			var countrycode = rs[isearch].getValue('country');
			var subName = rs[isearch].getValue("name");
			var count = subName.match(/ : /g) == null ? 0 : subName.match(/ : /g).length;
			for (var leadingSpaces = "", jcount = 0; jcount < count; ++jcount)
				leadingSpaces += "&nbsp;&nbsp;&nbsp;";

			if (valideunexus[countrycode]) {
				list.push({id: rs[isearch].getId(), name: leadingSpaces + rs[isearch].getValue('namenohierarchy'), text: leadingSpaces + rs[isearch].getValue('namenohierarchy')});
			} else {
				var subrec = nlapiLoadRecord('subsidiary', rs[isearch].getId());
				var nexuscount = subrec.getLineItemCount('nexus');
				for(var inexus = 1; inexus <= nexuscount; inexus++) {
					var nexuscountry = subrec.getLineItemValue('nexus', 'country', inexus);
					if (valideunexus[nexuscountry]) {
						list.push({id: subrec.getId(), name: leadingSpaces + subrec.getFieldValue('name')});
						break;
					}
				}
			}
		}
	} catch(ex) {logException(ex, "getEUSubsidiaries");}

	return list;
}

function getNonDeductibleNexuses() {
	var nexuses = {};

	try {
		var filter = [new nlobjSearchFilter("custrecord_is_nondeductible", null, "is", 'T'), new nlobjSearchFilter("isinactive", null, "is", 'F')];
		var column = [new nlobjSearchColumn("custrecord_country_name"), new nlobjSearchColumn("name"), new nlobjSearchColumn("custrecord_alt_code")];
		var rs = nlapiSearchRecord('customrecord_tax_report_map', null, filter, column);

		for(var irow in rs) {
			var countrycode = rs[irow].getValue('name');
			var countryid = rs[irow].getValue('custrecord_country_name');
			var altcountrycode = rs[irow].getValue('custrecord_alt_code');

			nexuses[countrycode] = {id: countryid, nexuscode: countrycode};
			if (altcountrycode) {
				nexuses[altcountrycode] = {id: countryid, nexuscode: altcountrycode};
			}
		}
	} catch(ex) {logException(ex, "getNonDeductibleNexuses");}
	return nexuses;
}

function getNonDeductibleSubsidiaryList() {
	var subsidiarylist = [];
	try {
		var validnexus = getNonDeductibleNexuses();
		var filters = [new nlobjSearchFilter("isinactive", null, "is", 'F'), new nlobjSearchFilter("iselimination", null, "is", 'F'), new nlobjSearchFilter("isinactive", null, "is", 'F')];
		var columns = [new nlobjSearchColumn("namenohierarchy"), new nlobjSearchColumn("country"), new nlobjSearchColumn("name")];
		var rs = nlapiSearchRecord('subsidiary', null, filters, columns);

		for(var isearch in rs) {
			var countrycode = rs[isearch].getValue('country');
			var subsidiaryid = rs[isearch].getId();
			if (validnexus[countrycode]) {
				subsidiarylist.push(subsidiaryid);
			} else {
				var subrec = nlapiLoadRecord('subsidiary', subsidiaryid);
				var nexuscount = subrec.getLineItemCount('nexus');
				for(var inexus = 1; inexus <= nexuscount; inexus++) {
					var nexuscountry = subrec.getLineItemValue('nexus', 'country', inexus);
					if (validnexus[nexuscountry]) {
						subsidiarylist.push(subsidiaryid);
						break;
					}
				}
			}
		}
	} catch(ex) {logException(ex, "getNonDeductibleSubsidiaryList");}
	return subsidiarylist;
}

function getTaxFilingNexuses() {
	var nexuses = {};

	try {
		var filter = [new nlobjSearchFilter("custrecord_is_tax_filing_config", null, "is", 'T'), new nlobjSearchFilter("isinactive", null, "is", 'F')];
		var column = [new nlobjSearchColumn("custrecord_country_name"), new nlobjSearchColumn("name"), new nlobjSearchColumn("custrecord_alt_code")];
		var rs = nlapiSearchRecord('customrecord_tax_report_map', null, filter, column)

		for(var irow in rs) {
			var countrycode = rs[irow].getValue('name');
			var countryid = rs[irow].getValue('custrecord_country_name');
			var altcountrycode = rs[irow].getValue('custrecord_alt_code');

			nexuses[countrycode] = {id: countryid, nexuscode: countrycode};
			if (altcountrycode) {
				nexuses[altcountrycode] = {id: countryid, nexuscode: altcountrycode};
			}
		}
	} catch(ex) {logException(ex, "getTaxFilingNexuses");}
	return nexuses;
}

function getAllNexuses() {//uses country code
	var nexuses = [];
	if (nlapiGetContext().getSetting("FEATURE", 'ADVTAXENGINE')) {
		var filters = [new nlobjSearchFilter("isinactive", null, "is", "F")];
		var columns = [new nlobjSearchColumn("country", null, "GROUP")];
		var rs = nlapiSearchRecord("salestaxitem", null, filters, columns);
		for (var icode in  rs) {
			nexuses.push(rs[icode].getValue("country", null, "GROUP"));
		}
	} else {
		nexuses.push(nlapiLoadConfiguration("companyinformation").getFieldValue("country"));
	}

	return nexuses;
}

function getSupplementarySettings() {
	var supplementarySettings = {};
	try {
		var sr = nlapiSearchRecord("customrecord_tax_report_map", null,
				[new nlobjSearchFilter("custrecord_map_type", null, "is", "SETTINGS"),
				 new nlobjSearchFilter("custrecord_alt_code", null, "is", "supplementary")],
				 new nlobjSearchColumn("custrecord_internal_id"));

		supplementarySettings = sr[0].getValue("custrecord_internal_id") ? JSON.parse(sr[0].getValue("custrecord_internal_id")) : {};
	} catch (ex) { logException(ex, "getSupplementarySettings"); }
	return supplementarySettings;
}


/**
 * @param code Template Name
 * @returns {}
 */
function getTaxTemplate(code) {
	nlapiLogExecution("Debug", "getTaxTemplate", code);

	var template = {short: "", long: "", internalid: ""};
	try {
		var filters = [new nlobjSearchFilter("isinactive", null, "is", "F"), new nlobjSearchFilter("name", null, "is", code)];
		var columns = [new nlobjSearchColumn("name")];

		var rs = nlapiSearchRecord("customrecord_tax_template", null, filters, columns);
		if (rs) {
			var internalid = rs[0].getId();
			template.internalid = internalid;

			//get the short template
			var rec = nlapiLoadRecord("customrecord_tax_template", internalid);
			template.short = rec.getFieldValue("custrecord_tax_template_short");

			//get the long template
			var content_sublist = "recmachcustrecord_template_content";
			var contentcount = rec.getLineItemCount(content_sublist);
			var longtemplate = [];
			for(var ilong = 0; ilong < contentcount; ilong++) {
				longtemplate.push(rec.getLineItemValue(content_sublist, "custrecord_tax_template_content", ilong+1));
			}
			template.long = longtemplate.join("");
			template.schema = rec.getFieldValue("custrecord_tax_form_schema");

			var attachment_sublist = "recmachcustrecord_template_attachment";
			var attachmentcount = rec.getLineItemCount(attachment_sublist);
			var documentmap = {};
			var documentid = [];
			for(var idocument = 0; idocument < attachmentcount; idocument++) {
				var name = rec.getLineItemValue(attachment_sublist, "name", idocument+1);
				var id = rec.getLineItemValue(attachment_sublist, "custrecord_tax_template_attachment", idocument+1);
				documentmap[id] = {name: name, url: ""};
				documentid.push(id);
			}

			if (documentid.length > 0) { //search the urls
				var docfilters = [new nlobjSearchFilter("internalid", null, "is", documentid)];
				var doccolumns = [new nlobjSearchColumn("url")];

				var docrs = nlapiSearchRecord("file", null, docfilters, doccolumns);
				for(var idoc in docrs) {
					var docurl = docrs[idoc].getValue("url");
					var docid = docrs[idoc].getId();
					if (documentmap[docid]) {
						documentmap[docid].url = docurl;
					}
				}

				//transfer to template
				for(var idoc in documentmap) {
					template[documentmap[idoc].name] = documentmap[idoc].url
				}
			}
		}
	} catch(ex) {logException(ex, "getTaxTemplate");}

	return template;
}

function createCustomButton(id, label, onClick, url, isEnabled, buttons, configToCheck) {
	return {
		Name : id,
		Label : label,
		Handler : onClick,
		URL : url,
		IsEnabled : isEnabled,
		Buttons : buttons ? buttons : null,
        configToCheck: configToCheck
	};
};

function getNetAmount(obj, isTruncate) {
	if (obj) {
		if (isTruncate) {
			return parseInt(obj.NetAmount);
		} else {
			return Number(obj.NetAmount);
		}
	} else {
		return Number(0);
	}
}

function getTaxAmount(obj, isTruncate) {
	if (obj) {
		if (isTruncate) {
			return parseInt(obj.TaxAmount);
		} else {
			return Number(obj.TaxAmount);
		}
	} else {
		return Number(0);
	}
}

function getNotionalAmount(obj, isTruncate) {
	if (obj) {
		if (isTruncate) {
			return parseInt(Number(obj.NotionalAmount));
		} else {
			return Number(obj.NotionalAmount);
		}
	} else {
		return Number(0);
	}
}

function getRate(obj) {
	if (obj && obj.Rate) {
		return String(obj.Rate) + '%';
	} else {
		return "&nbsp;";
	}
}

function getDETaxRegion() {
	var regionmap = {};

	try {
		var filter = [new nlobjSearchFilter("custrecord_map_type", null, "is", 'DETAXREGION')];
		var column = [new nlobjSearchColumn("name"), new nlobjSearchColumn("custrecord_internal_id")];
		var rs = nlapiSearchRecord('customrecord_tax_report_map', null, filter, column)

		for(var irow in rs) {
			var id = rs[irow].getValue('custrecord_internal_id');
			var regionname = rs[irow].getValue('name');

			regionmap[id] = {id: id, name: regionname}
		}
	} catch(ex) {logException(ex, "getDETaxRegion");}

	return regionmap;
}

function stringToCharArray (value) {
	nlapiLogExecution("DEBUG", "stringToCharArray: ", value);
	if (value) {
		return value.split('');
	} else {
		return [];
	}
}

function appendAttributeArrayToContainer (container, attributeName, objArray, iExpectedArraySize) {
	if (!container || !attributeName) {
		return;
	}

	if (objArray && objArray.length > 0 ) {
		for(var i = 0; i < objArray.length; i++) {
			eval("container." + attributeName + i + "='" + objArray[i] +"'");
		}

		//Append empty string to array indices without values
		if (iExpectedArraySize && objArray.length < iExpectedArraySize) {
			for(var i = objArray.length; i < iExpectedArraySize; i++) {
				eval( "container." + attributeName + i + "='&nbsp;'");
			}
		}
	} else if (iExpectedArraySize) {
		//no array but with expected array size
		for(var i = 0; i < iExpectedArraySize; i++) {
			eval( "container." + attributeName + i + "='&nbsp;'");
		}
	} else {
		//append empty value to container.attributeName
		eval("container." + attributeName + "=''");
	}
}

function retrieveCentAmount(value) {
	try {
		if (!value)
			return "";

		var strValue = new String(value);

		if (strValue .indexOf(".") > -1) {
			return strValue .substr(strValue .indexOf(".") + 1);
		} else {
			return "";
		}
	} catch(e) {
		return value;
	}
}

function retrieveWholeAmount(value) {
	try {
		if (!value)
			return "";

		var strValue = new String(value);
		if (strValue.indexOf(".") > -1) {
			return strValue.substr(0, strValue.length - (strValue.length - strValue.lastIndexOf(".")));
		} else {
			return strValue;
		}

	} catch(e) {
		return value;
	}
}

function getCoveredPeriodIds(startDate, endDate) {
	var periodIds = [];
	try {
		var filters = [
			new nlobjSearchFilter("isinactive", null, "is", "F"),
			new nlobjSearchFilter("startdate", null, "onorafter", startDate),
			new nlobjSearchFilter("enddate", null, "onorbefore", endDate)
		];

		var sr = nlapiSearchRecord("taxperiod", null, filters);
		for (var isr = 0; (sr && isr < sr.length); isr++) {
			periodIds.push(sr[isr].getId());
		}
	} catch (ex) {
		logException(ex, 'getCoveredPeriodIds')
	}
	return periodIds;
}

/**
 * Finds a class in a given namespace and returns an instance of that class.
 * @param {Object} parent - The topmost namespace.
 * @param {String} name - The full reference to the class, e.g. 'VAT.EU.DataCollector'.
 * @param {Object} params - Optional parameter object to be passed to the class's constructor.
 * @returns {Object} - An instance of the class.
 */
function findClass(parent, name, params) {
	if (!name) {
		throw nlapiCreateError('MISSING_REQ_PARAM', 'A class name is required.');
	}

	if (!parent) {
		throw nlapiCreateError('MISSING_REQ_PARAM', 'A parent object is required.');
	}

	try {
		var path = name.split('.');
		var Class = parent;

		for (var i = 1; i < path.length; i++) {
			Class = Class[path[i]];
		}
		return new Class(params);
	} catch(e) {
		throw nlapiCreateError('CLASS_NOT_FOUND', 'Cannot find the class "' + name + '".');
	}
}

VAT.Configuration = function () {
	this.getSchemaByFormId = getSchemaByFormId;
	function getSchemaByFormId(formid) {
		var schema = {};
		try {
			nlapiLogExecution("Debug", "getSchemaByFormId: formid", formid);
			var column = [new nlobjSearchColumn("name")];
			var filter = [new nlobjSearchFilter("custrecord_tax_form_internalid", null, "is", formid), new nlobjSearchFilter("isinactive", null, "is", 'F')];
			var rs = nlapiSearchRecord("customrecord_tax_form", null, filter, column);

			if (rs) {
				schema = getSchema(rs[0].getId());
			}
		} catch(ex) {logException(ex, "VAT.Configuration.getSchemaByFormId");}
		return schema;
	}

	this.getSchemaByCountry = getSchemaByCountry;
	function getSchemaByCountry(countrycode) {
		var schema = {};
		try {
			nlapiLogExecution("Debug", "getSchemaByCountry: countrycode", countrycode);
			var column = [new nlobjSearchColumn("name"), new nlobjSearchColumn("custrecord_ext_schema")];
			var filter = [new nlobjSearchFilter("name", null, "is", countrycode), new nlobjSearchFilter("custrecord_map_type", null, "is", "NEXUS"), new nlobjSearchFilter("isinactive", null, "is", 'F')];
			var rs = nlapiSearchRecord("customrecord_tax_report_map", null, filter, column);

			var schemalist = [];
			for(var irow in rs) {
				var schemaid = rs[irow].getValue("custrecord_ext_schema");
				
				if(schemaid) {
				    schemalist.push(getSchema(schemaid));
				}
			}

			for(var ilist = 0; ilist<schemalist.length; ilist++) {
				var schemaobj = schemalist[ilist];
				for(var ielem in schemaobj) {
					schema[ielem] = schemaobj[ielem];
				}
			}
		} catch(ex) {logException(ex, "VAT.Configuration.getSchemaByCountry");}
		return schema;
	}

	this.getTaxFormSchema = getTaxFormSchema;
	function getTaxFormSchema(countrycode, languagecode, type, subtype) {  //this is the extension schema for setup tax filing.
		var schema = null;
		try {
			var filters = [
				new nlobjSearchFilter('name', null, 'is', countrycode),
				new nlobjSearchFilter("isinactive", null, "is", "F"),
				new nlobjSearchFilter('custrecord_language', 'custrecord_tax_report_map', 'is', languagecode)
			];

			if (type) {
				filters.push(new nlobjSearchFilter('custrecord_type', 'custrecord_tax_report_map', 'is', type));
			}

			if (subtype) {
				filters.push(new nlobjSearchFilter('custrecord_subtype', 'custrecord_tax_report_map', 'is', subtype));
			}

			var rs = nlapiSearchRecord('customrecord_tax_report_map', null, filters, new nlobjSearchColumn('custrecord_schema', 'custrecord_tax_report_map'));
			if (rs && rs.length > 0) {
				schema = getSchema(rs[0].getValue('custrecord_schema', 'custrecord_tax_report_map'));
			}
		} catch(ex) {logException(ex, "VAT.Configuration.getTaxFormSchema");}
		return schema || {};
	}

	this.getSchema = getSchema;
	function getSchema(internalid) {
		var schema = {};
		try {
			var column = [new nlobjSearchColumn("custrecord_internalid"),
						  new nlobjSearchColumn("custrecord_schema_type"),
						  new nlobjSearchColumn("custrecord_label"),
						  new nlobjSearchColumn("custrecord_default"),
						  new nlobjSearchColumn("custrecord_altcode"),
						  new nlobjSearchColumn("custrecord_fieldhelp"),
						  new nlobjSearchColumn("custrecord_field_type"),
						  new nlobjSearchColumn("custrecord_field_length"),
						  new nlobjSearchColumn("custrecord_field_threshold"),
						  new nlobjSearchColumn("custrecord_tax_map_option_value", "custrecord_validation"),
						  new nlobjSearchColumn("custrecord_tax_map_option_metadata", "custrecord_validation"),
						  new nlobjSearchColumn("custrecord_tax_lov", "custrecord_field_schema"),
						  new nlobjSearchColumn("name", "custrecord_field_schema"),
						  new nlobjSearchColumn("custrecord_language_6391", "custrecord_field_schema"),
						  new nlobjSearchColumn("custrecord_language_6392", "custrecord_field_schema"),
						  new nlobjSearchColumn("custrecord_tax_lov_desc", "custrecord_field_schema"),
						  new nlobjSearchColumn("custrecord_notation_internalid", "custrecord_field_schema"),
						  new nlobjSearchColumn("custrecord_operator", "custrecord_field_schema"),
						  new nlobjSearchColumn("custrecord_sequence", "custrecord_field_schema")];
			column[column.length] = column[column.length - 1].setSort();

			var filter = [new nlobjSearchFilter("isinactive", null, "is", "F"), new nlobjSearchFilter("custrecord_tax_form", null, "is", internalid)];
			var rs = nlapiSearchRecord("customrecord_tax_field", null, filter, column);
			var validationmap = {};
			var lovmap = {};

			for(var irow in rs) {
				var internalid = rs[irow].getValue("custrecord_internalid");
				var metadata = rs[irow].getValue("custrecord_tax_map_option_metadata", "custrecord_validation");
				var optionmeta = metadata?JSON.parse(metadata):{};
				var validationtype = rs[irow].getValue("custrecord_tax_map_option_value", "custrecord_validation");
				var lov = rs[irow].getValue("custrecord_tax_lov", "custrecord_field_schema");
				var lovdesc = rs[irow].getValue("custrecord_tax_lov_desc", "custrecord_field_schema");
				var lovname = rs[irow].getValue("name", "custrecord_field_schema");
				var lovlang1 = rs[irow].getValue("custrecord_language_6391", "custrecord_field_schema");
				var lovlang2 = rs[irow].getValue("custrecord_language_6392", "custrecord_field_schema");
				var formfield = rs[irow].getValue("custrecord_notation_internalid", "custrecord_field_schema");
				var operator = rs[irow].getValue("custrecord_operator", "custrecord_field_schema");

				if (!validationmap[internalid]) validationmap[internalid] = [];
				if (!lovmap[internalid]) lovmap[internalid] = [];

				if (!schema[internalid]) {
					if (validationtype) validationmap[internalid].push(validationtype);
					if (lovname) lovmap[internalid].push(lovname);

					schema[internalid] = {
							validation: metadata?[{"type": validationtype, "plugin": optionmeta.plugin, "method": optionmeta.method, "interrupt": (optionmeta.interrupt == true)}]:[],
							type: rs[irow].getText("custrecord_schema_type"),
							label: rs[irow].getValue("custrecord_label"),
							length: rs[irow].getValue("custrecord_field_length"),
							value:  rs[irow].getValue("custrecord_default"),
							altcode: rs[irow].getValue("custrecord_altcode"),
							help: rs[irow].getValue("custrecord_fieldhelp"),
							fieldtype: rs[irow].getValue("custrecord_field_type"),
							threshold: rs[irow].getValue("custrecord_field_threshold"),
							lov: lovname?[{value: lov, description: lovdesc, lang1: lovlang1, lang2: lovlang2}]:[],
							notation:formfield?[{field:formfield, operator:operator}]:[]
					};
				} else {
					if (validationtype && validationmap[internalid].indexOf(validationtype) == -1) {
						validationmap[internalid].push(validationtype);
						schema[internalid].validation.push({"type": validationtype, "plugin": optionmeta.plugin, "method": optionmeta.method});
					}

					if (lovname && lovmap[internalid].indexOf(lovname) == -1) {
						lovmap[internalid].push(lovname);
						schema[internalid].lov.push({value: lov, description: lovdesc, lang1: lovlang1, lang2: lovlang2});
					}

					if (formfield) {
						schema[internalid].notation.push({field:formfield, operator:operator});
					}
				}
			}
		} catch(ex) {logException(ex, "VAT.Configuration.getSchema");}
		return schema;
	}

	this.getTaxReportMapperDetails = getTaxReportMapperDetails; //must deprecate this with getTaxFormDetails
	function getTaxReportMapperDetails(countryCode, languageCode, isSupplementary) {
		var details = {};
		try {
			var filters = [new nlobjSearchFilter("name", null, isSupplementary ? "is" : "isnot", "supplementary"),
						   new nlobjSearchFilter("custrecord_language", null, "startswith", languageCode.length > 2 ? languageCode.slice(0, -1).toLowerCase() : languageCode.toLowerCase()),
						   new nlobjSearchFilter("name", "custrecord_tax_report_map", "startswith", countryCode.toUpperCase())];
			var columns = [new nlobjSearchColumn("name"),
						   new nlobjSearchColumn("custrecord_type"),
						   new nlobjSearchColumn("custrecord_format"),
						   new nlobjSearchColumn("custrecord_tax_report_template"),
						   new nlobjSearchColumn("custrecord_plugin"),
						   new nlobjSearchColumn("custrecord_meta"),
						   new nlobjSearchColumn("custrecord_schema"),
						   new nlobjSearchColumn("custrecord_detail_label"),
						   new nlobjSearchColumn("isinactive")];
			columns[0].setSort();
			columns[1].setSort();

			var sr = nlapiSearchRecord("customrecord_tax_report_map_details", null, filters, columns);
			if (!sr) {
				return;
			}

			for (var isr = 0; isr < sr.length; isr++) {
				var type = sr[isr].getValue("custrecord_type");
				if (!details[type]) {
					details[type] = {templates:{}};
				}
				details[type].name = details[type].name || sr[isr].getValue("name");
				details[type].meta = details[type].meta || sr[isr].getValue("custrecord_meta") ? JSON.parse(sr[isr].getValue("custrecord_meta")) : "";
				details[type].plugin = details[type].plugin || sr[isr].getValue("custrecord_plugin");
				details[type].templates[sr[isr].getValue("custrecord_format")] = sr[isr].getText("custrecord_tax_report_template");
				details[type].schemaId = details[type].schemaId || sr[isr].getValue("custrecord_schema");
				details[type].label = details[type].label || sr[isr].getValue("custrecord_detail_label");

				if (sr[isr].getValue("isinactive") == 'F') {
					if (details[type].activeTemplates == null) {
						details[type].activeTemplates = [];
					}
					details[type].activeTemplates[sr[isr].getValue("custrecord_format")] = sr[isr].getText("custrecord_tax_report_template");
				}
			}
		} catch (ex) { logException(ex, "getTaxReportMapperDetails"); }
		return details;
	}

	/**
	 * Return all the reports/forms used by tax engine
	 * @param countryCode: Optional.
	 * @param languageCode: Optional.
	 * @param type: Optional.
	 * @param subtype: Optional.
	 * @param format: Optional.
	 * @returns Result:
	 * {CountryCode: {hasSubtype: true,  Subtype:{  property:{}, plugin:"val", schemaId:"val", label:"val", effectiveFrom:"val", validUntil:"val",template:{ language:{format: "val"} }  }}}
	 * CO.VAT.template.ENG.HTML
	 *
	 * {CountryCode: {property:{}, plugin:"val", schemaId:"val", label:"val", effectiveFrom:"val", validUntil:"val", template:{language: {format: "val"} }}}
	 * ID.SUPPLEMENTARY.A1.template.ENG.HTML
	 * */
	this.getReportForms = getReportForms;
	function getReportForms(countryCode, languageCode, type, subtype, format) {
		var details = {};
		try {
			var filters = [new nlobjSearchFilter("isinactive", null, "is", "F")];

			if (type) {
				filters.push(new nlobjSearchFilter("custrecord_type", null, "is", type));
			}
			if (subtype) {
				filters.push(new nlobjSearchFilter("custrecord_subtype", null, "is", subtype));
			}
			if (languageCode) {
				filters.push(new nlobjSearchFilter("custrecord_template_language", "custrecord_tax_report_template", "startswith", languageCode));
			}
			if (format) {
				filters.push(new nlobjSearchFilter("custrecord_template_format", "custrecord_tax_report_template", "startswith", format));
			}
			if (countryCode) {
				filters.push(new nlobjSearchFilter("name", "custrecord_tax_report_map", "startswith", countryCode.toUpperCase()));
			}

			var columns = [new nlobjSearchColumn("name"),
						   new nlobjSearchColumn("custrecord_detail_internalid"),
						   new nlobjSearchColumn("custrecord_type"),
						   new nlobjSearchColumn("custrecord_subtype"),
						   new nlobjSearchColumn("custrecord_template_format", "custrecord_tax_report_template"),
						   new nlobjSearchColumn("custrecord_template_language", "custrecord_tax_report_template"),
						   new nlobjSearchColumn("name", "custrecord_tax_report_template"),
						   new nlobjSearchColumn("custrecord_ishandlebars", "custrecord_tax_report_template"),
						   new nlobjSearchColumn("custrecord_plugin"),
						   new nlobjSearchColumn("custrecord_meta"),
						   new nlobjSearchColumn("custrecord_schema"),
						   new nlobjSearchColumn("custrecord_detail_label"),
						   new nlobjSearchColumn("custrecord_effective_from"),
						   new nlobjSearchColumn("custrecord_valid_until")];
			columns[0].setSort();
			columns[1].setSort();
			columns[2].setSort();

			var sr = nlapiSearchRecord("customrecord_tax_report_map_details", null, filters, columns);
			for (var isr = 0; isr < ((sr)?sr.length:0); isr++) {
				var name = sr[isr].getValue("name");
				var internalId = sr[isr].getValue("custrecord_detail_internalid");
				var type = sr[isr].getValue("custrecord_type");
				var subtype = sr[isr].getValue("custrecord_subtype");
				var language = sr[isr].getValue("custrecord_template_language", "custrecord_tax_report_template");
				var format = sr[isr].getValue("custrecord_template_format", "custrecord_tax_report_template");
				var templateId = sr[isr].getValue("name", "custrecord_tax_report_template");
				var isHandleBars = sr[isr].getValue("custrecord_ishandlebars", "custrecord_tax_report_template") == "T";
				var isSubtype = subtype?true:false;
				var plugin = sr[isr].getValue("custrecord_plugin");
				var property = sr[isr].getValue("custrecord_meta");
				var schemaId = sr[isr].getValue("custrecord_schema");
				var label = sr[isr].getValue("custrecord_detail_label");
				var effectiveFrom = sr[isr].getValue("custrecord_effective_from");
				var validUntil = sr[isr].getValue("custrecord_valid_until");

				if (!details[countryCode]) {
					details[countryCode] = {"hasSubtype": isSubtype};
				}
				var objCountry = details[countryCode];

				if (!objCountry[type]) {
					objCountry[type] = {};
				}
				var objType = objCountry[type];

				//assemble the form
				var objForm;
				if (isSubtype) {
					if (!objType[subtype]) {
						objType[subtype] = {};
					}
					objForm = objType[subtype];
				} else {
					objForm = objType;
				}
				var objproperty = {};
				if (property) {
					objproperty = JSON.parse(property);
				}
				objForm.name = name;
				objForm.isHandleBars = isHandleBars;
				objForm.internalId = internalId;
				objForm.property = objproperty;
				objForm.schemaId = schemaId;
				objForm.label = label;
				objForm.plugin = plugin;
				objForm.effectiveFrom = effectiveFrom?nlapiStringToDate(effectiveFrom):new Date(1970, 0, 1);
				objForm.validUntil = validUntil?nlapiStringToDate(validUntil):new Date(2100, 0, 1);

				//assemble the templates
				if (!objForm.template) {
					objForm.template = {};
				}
				var objTemplate = objForm.template;
				if (!objTemplate[language]) {
					objTemplate[language] = {};
				}
				var objTemplatelang = objTemplate[language];
				objTemplatelang[format] = templateId
			}
		} catch (ex) { logException(ex, "getForms"); }
		//nlapiLogExecution("Debug", "getForms", JSON.stringify(details));
		return details;
	}

	this.getHeaderConfigOverrides = getHeaderConfigOverrides;
	function getHeaderConfigOverrides(subsidiary, nexus) {
		var configuration = {};
		var overrides = {};
		var isOneWorld = nlapiGetContext().getFeature('SUBSIDIARIES');

		if (isOneWorld) {
			configuration = new Tax.Returns.Configuration(nexus, subsidiary);
		} else {
			configuration = new Tax.Returns.Configuration(nexus);
		}

		var configValues = Tax.DefaultValue[nexus];

		if (configValues) {
			for ( var iconfig in configValues) {
				var configobj = configValues[iconfig];
				var value = configuration.GetValue(configobj.internalid);
				if (value == null) { // vat online config does not
					// exist
					overrides[iconfig] = configobj.value; //use default
				} else { // vat online config exist
					overrides[iconfig] = value;
				}
			}
		}

		return overrides;
	};
};

VAT.Help = function(request, response) {
	var result = {"title": "Field Help", "text": "This is a custom field"};

	var isExposed = nlapiLoadConfiguration("userpreferences").getFieldValue("exposeids") == "T";
	this.Run = function(params) {
		nlapiLogExecution("Debug", "VAT.Help", JSON.stringify(params));
		try {
			var config = new VAT.Configuration();
			var template = getTaxTemplate(params.formid);
			var schema = config.getSchema(template.schema);

			var helptext = [];
			var schemafield = schema[params.fieldid];
			if (schemafield && !schemafield.help) {
				helptext.push("This is a custom field of type " + schemafield.type);
			} else if (schemafield && schemafield.help){
				helptext.push(schemafield.help);
			}

			if (isExposed) {
				helptext.push("<br/><div align='right'>Field ID: " + params.fieldid + "</div>");
			}

			result = {"title": "Field Help", "text": escape(helptext.join("<br/>"))};
		} catch(ex) {logException(ex, "VAT.Help.Run");}

		response.write(JSON.stringify(result));
	};
};

VAT.Validator = function() {
	var context = nlapiGetContext();
	var _IsOneWorld = context.getFeature("SUBSIDIARIES");
	var _IsMultibook = context.getFeature("MULTIBOOK");

	this.isRequired = isRequired;
	function isRequired(params) {
		if (!params.value) {
			return {"status": "fail", "message": params.label + " is required " + params.source};
		} else {
			return {"status": "success", "message": ""};
		}
	}

	function searchSubmissionByType(params) {
		var submissionlistid = [];
		try {
			nlapiLogExecution("Debug", "searchSubmissionByType: Params", JSON.stringify(params));
			var periodlist = params.taxperiodlist.split(",");
			var nexus = params.countrycode;

			var reportingtype = "";
			if (nexus == "CZ"){
				reportingtype = params.taxreturncode;
			} else if (nexus == "IE") {
				reportingtype = params.vatreportingtype;
			}

			var filters = [new nlobjSearchFilter("isinactive", null, "is", "F"),
						   new nlobjSearchFilter("custrecord_online_form", null, "isnotempty"),
						   new nlobjSearchFilter("custrecord_nexus", null, "is", nexus),
						   new nlobjSearchFilter("custrecord_submitted_period", null, "anyof", periodlist),
						   new nlobjSearchFilter("custrecord_submitted_type", null, "is", reportingtype)
						   ];
			if (_IsOneWorld) {
				filters.push(new nlobjSearchFilter("custrecord_vatonline_subsidiary", null, "is", params.subid));
			}

			var columns = [new nlobjSearchColumn("custrecord_submitted_period"), new nlobjSearchColumn("custrecord_vatonline_status")];
			var rs = nlapiSearchRecord("customrecord_vatonline_submittedperiod", null, filters, columns);

			for(var irs in rs) {
				submissionlistid.push(rs[irs].getId());
			}
		} catch(ex) {logException(ex, "VAT.Validator.searchSubmissionByType");}

		return submissionlistid;
	}

	this.isSubmitted = isSubmitted;
	function isSubmitted(params) {
		nlapiLogExecution("Debug", "isSubmitted", JSON.stringify(params));
		var result = {"status": "success", "message": ""};

		if (params.allowmultipleflagging == 'T') {
			return result;
		}

		switch(params.filingstatus) {
			case "FINAL":
				if (params.countrycode == "CZ" || params.countrycode == "IE") {
					if (searchSubmissionByType(params).length > 0) {
						result = {"status": "fail", "message": "The final version of the file (Type: " + (params.countrycode == "CZ"?params.taxreturncode_text:params.vatreportingtype_text) + ") for the selected tax period already exists. See System Notes."};
					}
				} else {
					result = {"status": "fail", "message": "The final version of the file for the selected tax period already exists. See System Notes."};
				}
				break;
			case "SUBMITTED":
				result = {"status": "fail", "message": "The tax period you selected has already been submitted"};
				break;
			default:
				var taxperiodlist = params.submittedperiodname;
				if (taxperiodlist.length > 0) {
					var message = ["The final version of the file already exists for the following tax periods. See System Notes.</br></br>"];

					for(var iperiod in taxperiodlist) {
						message.push(taxperiodlist[iperiod] +"</br>");
					}
					result = {"status": "fail", "message": message.join("")};
				} else if ((params.countrycode == "CZ" && params.taxreturncode != "B")){
					result = {"status": "fail", "message": "Other submission types (Correction, Additional) can only be generated after the final version of the Proper form has been generated."};
				} else if ((params.countrycode == "IE" && params.vatreportingtype != "0" )) {
					result = {"status": "fail", "message": "Other submission types (Amended, Supplementary) can only be generated after the final version of the Original form has been generated."};
				}
				break;
		}

		return result;
	}

	this.isPeriodValid = isPeriodValid;
	function isPeriodValid(params) {
		nlapiLogExecution("Debug", "isPeriodValid", JSON.stringify(params));
		var startdate = Date.parseExact(params.StartDate, params.longdate);
		var enddate = Date.parseExact(params.EndDate, params.longdate);
		var result = {"status": "success", "message": ""};
		var monthcount = monthCount(startdate, enddate);
		var firstmonth = startdate.getMonth();
		var filingperiod = params.vatreportingperiod;

		if (params.countrycode == "IE") { //needs refining the list values should be retrieved from record type.
			switch(String(params.vatreportingperiod)) {
				case "0": filingperiod = 2; break;
				case "3": filingperiod = 6; break;
				case "2": filingperiod = 4; break;
				case "1": filingperiod = 1; break;
			}
		}

		switch(String(filingperiod)) {
			case "QUARTERLY": case "3":
				nlapiLogExecution("Debug", "Quarterly", monthCount(startdate, enddate));
				if ( monthcount != 3) {
					result = {"status": "fail", "message": "The tax period you selected does not match your Tax Filing Setup"};
				} /*else if (firstmonth != 0 && firstmonth != 3 && firstmonth != 6 && firstmonth != 9) {
					result = {"status": "fail", "message": "The first period of the quarter should be January, April, July or October"};
				}*/
				break;
			case "MONTHLY": case "1":
				if (monthcount != 1) {
					result = {"status": "fail", "message": "The tax period you selected does not match your Tax Filing Setup"};
				}
				break;
			case "YEARLY": case "12":
				if (monthcount != 12) {
					result = {"status": "fail", "message": "The tax period you selected does not match your Tax Filing Setup"};
				} /*else if (firstmonth != 0) {
					result = {"status": "fail", "message": "The first period should be January"};
				}*/
				break;
			case "6":
				if (monthcount != 6) {
					result = {"status": "fail", "message": "The tax period you selected does not match your Tax Filing Setup"};
				} /*else if (firstmonth != 0 && firstmonth != 5) {
					result = {"status": "fail", "message": "The first period should be January or July"};
				}*/
				break;
			case "2":
				if (monthcount != 2) {
					result = {"status": "fail", "message": "The tax period you selected does not match your Tax Filing Setup"};
				} /*else if (firstmonth != 0 && firstmonth != 2 && firstmonth != 4 && firstmonth != 6 && firstmonth != 8 && firstmonth != 10) {
					result = {"status": "fail", "message": "The first period should be January, March, May, July, September or November"};
				}*/
				break;
			default:
				nlapiLogExecution("Debug", "No Period Type Match Found:" + params.vatreportingperiod, typeof params.vatreportingperiod);
		}
		return result;
	}

	function monthCount(fromDate, toDate) {
	    return Math.round((toDate - fromDate) / (1000 * 60 * 60 * 24 * 30)) || 1;
	}
};

VAT.XML = VAT.XML || {};
VAT.XML.Parser = VAT.XML.Parser || {};
VAT.XML.XPath = VAT.XML.XPath || {};

VAT.XML.escape = function(xmlString) {
	return nlapiEscapeXML(xmlString);
};

VAT.XML.validate = function(options) {
	options = options || {};
	return nlapiValidateXML(options.xml, options.xsdFilePathOrId, options.importFolderPathOrId);
};

VAT.XML.Parser.fromString = function(xmlString) {
	return nlapiStringToXML(xmlString);
};

VAT.XML.Parser.toString = function(xmlDocument) {
	return nlapiXMLToString(xmlDocument);
};

VAT.XML.XPath.selectNodes = function(node, xpath) {
	var options = {node: node, xpath: xpath};
	return nlapiSelectNodes(options.node, options.xpath);
};

VAT.XML.XPath.selectNode = function(node, xpath) {
	var options = {node: node, xpath: xpath};
	return nlapiSelectNodes(options.node, options.xpath)[0];
};

VAT.XML.XPath.selectNodesPerAttrValue = function(node, xpath, attr, value) {
	var options = {node: node, xpath: xpath, attr: attr, value: value};
	return nlapiSelectNodes(options.node, options.xpath + '[@' + options.attr + '="' + options.value + '"]');
};

VAT.XML.XPath.selectNodePerAttrValue = function(node, xpath, attr, value) {
	var options = {node: node, xpath: xpath, attr: attr, value: value};
	return nlapiSelectNodes(options.node, options.xpath + '[@' + options.attr + '="' + options.value + '"]')[0];
};

VAT.RenderHandlebarsTemplate = function(template, ds) {
	try{
		Handlebars.registerHelper('equal', function(l, r, options) {
			if (l === r) {
				return options.fn(this);
			}
			return options.inverse(this);
		});

		Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
			switch (operator) {
				case '==':
					return (v1 == v2) ? options.fn(this) : options.inverse(this);
				case '===':
					return (v1 === v2) ? options.fn(this) : options.inverse(this);
				case '<':
					return (v1 < v2) ? options.fn(this) : options.inverse(this);
				case '<=':
					return (v1 <= v2) ? options.fn(this) : options.inverse(this);
				case '>':
					return (v1 > v2) ? options.fn(this) : options.inverse(this);
				case '>=':
					return (v1 >= v2) ? options.fn(this) : options.inverse(this);
				case '&&':
					return (v1 && v2) ? options.fn(this) : options.inverse(this);
				case '||':
					return (v1 || v2) ? options.fn(this) : options.inverse(this);
				default:
					return options.inverse(this);
			}
		});

		Handlebars.registerHelper('eachRowPlusPadding', function(context, maxRowCount, blankRow, options) {
			var ret = "";
			
			if (!context) {
				return ret;
			}

			for (var i = 0; i < context.length; i++) {
				ret = ret + options.fn(context[i]);
			}

			for (var i = (context.length+1) % maxRowCount; i < maxRowCount; i++) {
				ret = ret + blankRow;
			}

			return ret;
		});

		var compiledTemplate = Handlebars.compile(template);
		return compiledTemplate(ds);
	} catch (ex) {
		logException(ex, 'VAT.RenderHandlebarsTemplate');
		throw nlapiCreateError('RENDER_ERROR', 'Unable to render data to template');
	}
};

VAT.TaxCodeLookup = function TaxCodeLookup(countryCode, taxDefinition) {
	this.instance = null;
	this.taxDefinition = taxDefinition;
	this.taxCodes = {};
	this.taxCodesMap = this.mapTaxCodesById(countryCode);
	this.pairDeductDetailsMap = {};
};

VAT.TaxCodeLookup.getInstance = function getInstance(countryCode, taxDefinition) {
	if (!this.instance) {
		this.instance = new VAT.TaxCodeLookup(countryCode, taxDefinition);
	}
	return this.instance;
};

VAT.TaxCodeLookup.prototype.mapTaxCodesById = function mapTaxCodesById(countryCode) {
	var taxCodesMap = {};
	var isAdvancedTaxes = nlapiGetContext().getFeature('ADVTAXENGINE');
	var filter = new nlobjSearchFilter('country', null, 'is', countryCode);
	var column = new nlobjSearchColumn('itemid');

	var sr = nlapiSearchRecord('salestaxitem', null, isAdvancedTaxes ? filter : null, column);
	for (var isr = 0; sr && isr < sr.length; isr++) {
		taxCodesMap[sr[isr].getValue('itemid')] = sr[isr].getId();
	}
	return taxCodesMap;
};

VAT.TaxCodeLookup.prototype.getMatchedKey = function getMatchedKey(taxCodeName, taxCodeKeys) {
	for (var key = 0; taxCodeKeys && key < taxCodeKeys.length; key++) {
		var matchedKey = this.getTaxCodeType(taxCodeName);
		if (matchedKey) {
			return matchedKey;
		}
	}
};

VAT.TaxCodeLookup.prototype.anyOf = function anyOf(taxCodeName, taxCodeKeys) {
	for (var key = 0; taxCodeKeys && key < taxCodeKeys.length; key++) {
		var matchedKey = this.getTaxCodeType(taxCodeName);
		if (matchedKey === taxCodeKeys[key]) {
			return true;
		}
	}
	return false;
};

VAT.TaxCodeLookup.prototype.typeOf = function typeOf(taxCodeName, taxCodeKey) {
	if (this.getTaxCodeType(taxCodeName) == taxCodeKey) {
		return true;
	}
	return false;
};

VAT.TaxCodeLookup.prototype.getTaxCodeType = function getTaxCodeType(taxCodeName) {
	var taxCode = this.taxCodes[taxCodeName];
	if (taxCode) {
		var key = getTaxCodeKey.call(this, taxCode);
		return key;
	}

	try {
		var taxCodeId = this.taxCodesMap[taxCodeName];
		if (!taxCodeId) {
			return;
		}
		var taxCodeDao = new Tax.DAO.TaxCodeRecordDao().getRecord({id: taxCodeId});
		var taxCodeAdapter = new Tax.Adapter.TaxCodeRecordAdapter();
		taxCodeAdapter.rawdata = taxCodeDao.dao;
		taxCode = taxCodeAdapter.transform();

		if (taxCode.IsEC || taxCode.IsReverseCharge) {
			taxCode.NotionalRate = getNotionalRate.call(this, taxCode.Parent);
		}

		if (!this.taxCodes[taxCodeName]) {
			this.taxCodes[taxCodeName] = taxCode;
		}

		var key = getTaxCodeKey.call(this, taxCode);
		return key;
	} catch (ex) {
		logException(ex, 'VAT.TaxCodeLookup.typeOf');
		throw ex;
	}

	function getTaxCodeKey(taxCode) {
		for (var tc in this.taxDefinition) {
			var found = this.taxDefinition[tc](taxCode);
			if (found) {
				return tc;
			}
		}
	}

	function getNotionalRate(taxCodeId) {
		var taxCodeName = '';
		for (var name in this.taxCodesMap) {
			if (this.taxCodesMap[name] == taxCodeId) {
				taxCodeName = name;
			}
		}

		var taxCode = null;
		if (!this.taxCodes[taxCodeName]) {
			var taxCodeDao = new Tax.DAO.TaxCodeRecordDao().getRecord({id: taxCodeId});
			var taxCodeAdapter = new Tax.Adapter.TaxCodeRecordAdapter();
			taxCodeAdapter.rawdata = taxCodeDao.dao;
			taxCode = taxCodeAdapter.transform();
			this.taxCodes[taxCodeName] = taxCode;
		} else {
			taxCode = this.taxCodes[taxCodeName];
		}

		return taxCode.Rate;
	}
};

VAT.TaxCodeLookup.prototype.getPairDeductDetails = function getPairDeductDetails(nonDeductTaxCodeName, countryCode) {
	
	if (Object.keys(this.pairDeductDetailsMap).length == 0) {
		
		var isAdvancedTaxes = nlapiGetContext().getFeature('ADVTAXENGINE');
		var filters = [new nlobjSearchFilter('custrecord_4110_nondeductible_parent', null, 'noneof', '@NONE@')];		
		if(isAdvancedTaxes) {
			filters.push(new nlobjSearchFilter('country', null, 'is', countryCode));
		}
		var columns = [new nlobjSearchColumn('name'), 
		               new nlobjSearchColumn('rate'), 
		               new nlobjSearchColumn('custrecord_4110_nondeductible_parent')];
		var searchResult = nlapiSearchRecord('salestaxitem', null, filters, columns);
		var taxcodeRecord = null;
		
		for (var index = 0; searchResult && index < searchResult.length; index++) {
			taxcodeRecord = searchResult[index];
			var deductTaxCodeDetails = {};
			deductTaxCodeDetails.name = taxcodeRecord.getValue('name');
			deductTaxCodeDetails.rate = parseFloat(taxcodeRecord.getValue('rate')) || '';
			this.pairDeductDetailsMap[taxcodeRecord.getText('custrecord_4110_nondeductible_parent')] = deductTaxCodeDetails;
		}
	}
	
	var pairDeductDetails = this.pairDeductDetailsMap[nonDeductTaxCodeName] || {name: '', rate: ''};
	return pairDeductDetails;
};
