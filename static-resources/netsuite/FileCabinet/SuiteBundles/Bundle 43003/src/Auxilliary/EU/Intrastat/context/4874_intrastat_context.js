/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var INTRASTAT;
if (!INTRASTAT) INTRASTAT = {};
if (!INTRASTAT.Context) INTRASTAT.Context = {};

INTRASTAT.Context.OTHER = function() {
	var template = {
		UITemplate: {sales: "INTRASTAT_HTML_SALE", purchase: "INTRASTAT_HTML_PURCHASE"},
		PDFTemplate: {sales: "INTRASTAT_PDF_SALE", purchase: "INTRASTAT_PDF_PURCHASE", row: "INTRASTAT_PDF_ROW"},
		ExcelTemplate: {sales: "INTRASTAT_XLS_SALE", purchase: "INTRASTAT_XLS_PURCHASE", row: "INTRASTAT_XLS_ROW"}
	};
	
	var countrycode = "OTHER";
	var language = "eng";
	var rowsetmeta;
	var helpLabel = "Click here for Intrastat Help Topics";
	var helpURL = "/app/help/helpcenter.nl?topic=DOC_EUIntrastatReport";
	
	this.setCountryCode = function (code) {countrycode = code; };
	this.getCountryCode = function() { return countrycode; };
	this.getName = function (countryname) { return countryname + " (English)"; };
	this.getLanguage = function () { return language; };
	this.getLocale = function () { return countrycode + "_" + language; };
	this.getRowSetMetaData = function() { return rowsetmeta; };
	
	this.getExportData = getExportData;
	function getExportData(params) {
		if (params.cachefileid) {
			return new INTRASTAT.CacheRowSet(params, null, true).getInclusiveResult(); //get the cache - must be updated already
		} else {
			return [];
		}
	}
	
	this.getData = getData;
	function getData(params) { //cache		
		params.nexus = countrycode;
		if (params.cachefileid) {
			var rowset = new INTRASTAT.CacheRowSet(params); //get the cache
		} else { //build rowset
			var reportObj = new INTRASTAT.ReportRunner(params.fromperiodid, params.toperiodid, params.subsidiaryid, countrycode);
			
			var reportContent = [];
			if (params.type == INTRASTAT.PURCHASEREPORT) {
				reportContent = reportObj.getPurchaseReport();
			} else {
				reportContent = reportObj.getSalesReport();
			}
			
			var rowset = new INTRASTAT.CacheRowSet(params, reportContent);
		}
		rowsetmeta = rowset.getRowSetMetaData();
		return rowset.getPageResult();
	}
	
	this.getUIContext = function(params){ 
		var isSales = (params.type == INTRASTAT.SALEREPORT);
		var colmetadata = [];
		colmetadata.push(new INTRASTAT.ColumnMetaData("exclude", "checkbox", "Exclude", true, "exclude").setAlignment(null));
		colmetadata.push(new INTRASTAT.ColumnMetaData("row", "integer", "Line", true, "row").setAlignment(null));
		colmetadata.push(new INTRASTAT.ColumnMetaData("commodity", "text", "Commodity Code", true, "commoditycode", true));
		colmetadata.push(new INTRASTAT.ColumnMetaData("amount", "text", "Value", true, "netamount").setAlignment("right"));
		colmetadata.push(new INTRASTAT.ColumnMetaData("deliveryterm", "text", "Delivery Term", true, "deliveryterm", true ));
		colmetadata.push(new INTRASTAT.ColumnMetaData("notc", "text", "Nature of<br/>Transaction", true, "notc", false));
		colmetadata.push(new INTRASTAT.ColumnMetaData("weight", "text", "Net Mass<br/>(kg)", true, "grossweight", false).setAlignment("right")); 
		colmetadata.push(new INTRASTAT.ColumnMetaData("quantity", "text", "Supplementary Unit", true, "quantity", true).setAlignment("right")); 
		
		if (isSales) {
			colmetadata.push(new INTRASTAT.ColumnMetaData("country", "text", "Goods<br/>Sent To", true, "countrycode", false)); 
		} else {
			colmetadata.push(new INTRASTAT.ColumnMetaData("country", "text", "Goods Received From", true, "countrycode", true)); 
		}
		colmetadata.push(new INTRASTAT.ColumnMetaData("tranno", "textarea", "Reference No", true, "tranno", false).setLinkParam(INTRASTAT.ACTION.transaction, null, "trantype")); 
		if (isSales) {
			colmetadata.push(new INTRASTAT.ColumnMetaData("entity", "textarea", "Customer Name", true, "entity").setLinkParam(INTRASTAT.ACTION.entity, 'customer')); 
			colmetadata.push(new INTRASTAT.ColumnMetaData("vatno", "text", "Customer VAT No", true, "vatno")); 
		} else {
			colmetadata.push(new INTRASTAT.ColumnMetaData("entity", "textarea", "Vendor Name", true, "entity").setLinkParam(INTRASTAT.ACTION.entity, 'vendor')); 
			colmetadata.push(new INTRASTAT.ColumnMetaData("vatno", "text", "Vendor VAT No", true, "vatno")); 
		}
		colmetadata.push(new INTRASTAT.ColumnMetaData("trantype", "text", "Transaction Type", false, "trantype"));
		var uicontextmeta = {exclude: colmetadata[0].getId(), row: colmetadata[1].getId(), helplabel: helpLabel, helpurl: helpURL};

		return new INTRASTAT.Context.UIContext(params, colmetadata, uicontextmeta, template.UITemplate);
	};
	
	this.getExportContextList = function(params) { //perhaps add callback function, for additional processing?
		var printExport = new INTRASTAT.Context.ExportContext(params, "generic_print", "Print", template.PDFTemplate, INTRASTAT.FILETYPE.pdf);
		var excelExport = new INTRASTAT.Context.ExportContext(params, "generic_excel", "Export to Excel", template.ExcelTemplate, INTRASTAT.FILETYPE.excel);
		
		return [printExport, excelExport];
	};
};
