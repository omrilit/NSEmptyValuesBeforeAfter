/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var INTRASTAT;
if (!INTRASTAT) INTRASTAT = {};
if (!INTRASTAT.Context) INTRASTAT.Context ={};

INTRASTAT.Context.FR_eng = function() {
	var template = {
		UITemplate: {sales: "INTRASTAT_HTML_FR_ENG_SALE", purchase: "INTRASTAT_HTML_FR_ENG_PURCHASE"},
		PDFTemplate: {sales: "INTRASTAT_PDF_FR_ENG_SALE", purchase: "INTRASTAT_PDF_FR_ENG_PURCHASE", row: "INTRASTAT_PDF_FR_ROW"},
		ExcelTemplate: {sales: "INTRASTAT_XLS_FR_ENG_SALE", purchase: "INTRASTAT_XLS_FR_ENG_PURCHASE", row: "INTRASTAT_XLS_FR_ROW"}
	};
	var countrycode = "FR";
	var language = "eng";
	var rowsetmeta;
	var helpLabel = "Click here for Intrastat Help Topics";
	var helpURL = "/app/help/helpcenter.nl?topic=DOC_EUIntrastatReport";
	var indicatormeta = {"good": "0", "service": "3"};
	var options = {"0": "B2B Goods", "2": "Triangulated Goods", "3": "Services"};
	
	this.setCountryCode = function (code) {countrycode = code;};
	this.getCountryCode = function() {return countrycode;};
	this.getName = function (countryname) {return "France (English)";};
	this.getLanguage = function () { return language;};
	this.getLocale = function () {return countrycode + "_" + language;};
	this.getRowSetMetaData = function() { return rowsetmeta;};
	
	this.getExportData = getExportData;
	function getExportData(params) {
		if (params.cachefileid) {
			var rowset = new INTRASTAT.CacheRowSet(params, null, true).getInclusiveResult(); 
			for(var irow = 0; irow < rowset.length; irow++) {
				var indicator = rowset[irow].indicator;
				rowset[irow].indicator = options[indicator]; //replace the content
			}
			return rowset;
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
			var reportObj = new INTRASTAT.ReportRunner(params.fromperiodid, params.toperiodid, params.subsidiaryid, countrycode, true, indicatormeta);
			
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
		colmetadata.push(new INTRASTAT.ColumnMetaData("trandate", "text", "Date", true, "trandate").setAlignment(null));
		colmetadata.push(new INTRASTAT.ColumnMetaData("tranno", "textarea", "Tran No", true, "tranno", false).setLinkParam(INTRASTAT.ACTION.transaction, null, "trantype")); 
		if (isSales) {
			colmetadata.push(new INTRASTAT.ColumnMetaData("entity", "textarea", "Customer<br/>Name", true, "entity").setLinkParam(INTRASTAT.ACTION.entity, 'customer')); 
			colmetadata.push(new INTRASTAT.ColumnMetaData("vatno", "text", "Customer<br/>VAT No", true, "vatno")); 
			colmetadata.push(new INTRASTAT.ColumnMetaData("country", "text", "Goods<br/>Sent To", true, "countrycode", false)); 
		} else {
			colmetadata.push(new INTRASTAT.ColumnMetaData("entity", "textarea", "Vendor Name", true, "entity").setLinkParam(INTRASTAT.ACTION.entity, 'vendor')); 
			colmetadata.push(new INTRASTAT.ColumnMetaData("vatno", "text", "Vendor VAT No", true, "vatno")); 
			colmetadata.push(new INTRASTAT.ColumnMetaData("country", "text", "Goods Received From", true, "countrycode", true)); 
		}
		colmetadata.push(new INTRASTAT.ColumnMetaData("amount", "text", "Value", true, "netamount").setAlignment("right"));
		colmetadata.push(new INTRASTAT.ColumnMetaData("commodity", "text", "Commodity Code", true, "commoditycode", true));
		colmetadata.push(new INTRASTAT.ColumnMetaData("deliveryterm", "text", "Delivery Term", true, "deliveryterm", true ));
		colmetadata.push(new INTRASTAT.ColumnMetaData("notc", "text", "Nature of<br/>Transaction", true, "notc", false));
		colmetadata.push(new INTRASTAT.ColumnMetaData("weight", "text", "Net Mass (kg)", true, "grossweight", true).setAlignment("right")); 
		colmetadata.push(new INTRASTAT.ColumnMetaData("quantity", "text", "Supplementary Unit", true, "quantity", true).setAlignment("right")); 
		colmetadata.push(new INTRASTAT.ColumnMetaData("indicator", "select", "Indicator", true, "indicator").setOptions(options).setAlignment(null));
		colmetadata.push(new INTRASTAT.ColumnMetaData("indicatorref", "text", "Previous Indicator", false, "indicator").setAlignment(null));
		colmetadata.push(new INTRASTAT.ColumnMetaData("trantype", "text", "Transaction Type", false, "trantype"));
		var uicontextmeta = {exclude: colmetadata[0].getId(), row: colmetadata[1].getId(), indicator: colmetadata[13].getId(), 
				indicatorref: colmetadata[14].getId(), helplabel: helpLabel, helpurl: helpURL};

		return new INTRASTAT.Context.UIContext(params, colmetadata, uicontextmeta, template.UITemplate);
	};
	
	this.getExportContextList = function(params) { 
		var pdfMetaData = INTRASTAT.FILETYPE.pdf;

		var printExport = new INTRASTAT.Context.ExportContext(params, "fr_eng_print", "Print", template.PDFTemplate, pdfMetaData);
		var excelExport = new INTRASTAT.Context.ExportContext(params, "fr_eng_excel", "Export to Excel", template.ExcelTemplate, INTRASTAT.FILETYPE.excel);
		
		return [printExport, excelExport];
	};
};

INTRASTAT.Context.FR_fra = function() {
	var template = {
		UITemplate: {sales: "INTRASTAT_HTML_FR_FRA_SALE", purchase: "INTRASTAT_HTML_FR_FRA_PURCHASE"},
		PDFTemplate: {sales: "INTRASTAT_PDF_FR_FRA_SALE", purchase: "INTRASTAT_PDF_FR_FRA_PURCHASE", row: "INTRASTAT_PDF_FR_ROW"},
		ExcelTemplate: {sales: "INTRASTAT_XLS_FR_FRA_SALE", purchase: "INTRASTAT_XLS_FR_FRA_PURCHASE", row: "INTRASTAT_XLS_FR_ROW"}
	};
	var countrycode = "FR";
	var language = "fra";
	var rowsetmeta;
	var helpLabel = "Click here for Intrastat Help Topics";
	var helpURL = "/app/help/helpcenter.nl?topic=DOC_EUIntrastatReport";
	var indicatormeta = {"good": "0", "service": "3"};
	var options = {"0": "B2B Goods", "2": "Triangulated Goods", "3": "Services"};
	
	this.setCountryCode = function (code) {countrycode = code;};
	this.getCountryCode = function() {return countrycode;};
	this.getName = function (countryname) {return "France (Fran&#x00e7;ais)";};
	this.getLanguage = function () { return language;};
	this.getLocale = function () {return countrycode + "_" + language;};
	this.getRowSetMetaData = function() { return rowsetmeta;};
	
	this.getExportData = getExportData;
	function getExportData(params) {
		if (params.cachefileid) {
			var rowset = new INTRASTAT.CacheRowSet(params, null, true).getInclusiveResult(); 
			for(var irow = 0; irow < rowset.length; irow++) {
				var indicator = rowset[irow].indicator;
				rowset[irow].indicator = options[indicator]; //replace the content
			}
			return rowset;
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
			Date.CultureInfo = Date.CultureInfo_fr;
			var reportObj = new INTRASTAT.ReportRunner(params.fromperiodid, params.toperiodid, params.subsidiaryid, countrycode, true, indicatormeta);
			
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
	};
	
	this.getUIContext = function(params){ 
		var isSales = (params.type == INTRASTAT.SALEREPORT);
		var colmetadata = [];
		colmetadata.push(new INTRASTAT.ColumnMetaData("exclude", "checkbox", "Exclure", true, "exclude").setAlignment(null));
		colmetadata.push(new INTRASTAT.ColumnMetaData("row", "integer", "Ligne", true, "row").setAlignment(null));
		colmetadata.push(new INTRASTAT.ColumnMetaData("trandate", "text", "Date", true, "trandate").setAlignment(null));
		colmetadata.push(new INTRASTAT.ColumnMetaData("tranno", "textarea", "La Facture N&#x00b0;", true, "tranno", true).setLinkParam(INTRASTAT.ACTION.transaction, null, "trantype")); 
		if (isSales) {
			colmetadata.push(new INTRASTAT.ColumnMetaData("entity", "textarea", "Nom du Client", true, "entity").setLinkParam(INTRASTAT.ACTION.entity, 'customer')); 
			colmetadata.push(new INTRASTAT.ColumnMetaData("vatno", "text", "Num&#x00e9;ro<br/>d&#39;identification<br/>de l&#39;acqu&#x00e9;reur C.E.", true, "vatno")); 
			colmetadata.push(new INTRASTAT.ColumnMetaData("country", "text", "Pays Dest. Prov.", true, "countrycode", true)); 
		} else {
			colmetadata.push(new INTRASTAT.ColumnMetaData("entity", "textarea", "Nom du Fournisseur", true, "entity").setLinkParam(INTRASTAT.ACTION.entity, 'vendor')); 
			colmetadata.push(new INTRASTAT.ColumnMetaData("vatno", "text", "Num&#x00e9;ro d&#39;identification <br/>de l&#39;fournisseur C.E.", true, "vatno")); 
			colmetadata.push(new INTRASTAT.ColumnMetaData("country", "text", "Pays d&#39;origine", true, "countrycode", true)); 
		}
		colmetadata.push(new INTRASTAT.ColumnMetaData("amount", "text", "Valeur Fiscale<br/>(en euros)", true, "netamount").setAlignment("right"));
		colmetadata.push(new INTRASTAT.ColumnMetaData("commodity", "text", "Nomenclature<br/>de Produit", true, "commoditycode"));
		colmetadata.push(new INTRASTAT.ColumnMetaData("deliveryterm", "text", "Mode Transport", true, "deliveryterm", true));
		colmetadata.push(new INTRASTAT.ColumnMetaData("notc", "text", "Nature Transaction", true, "notc", true));
		colmetadata.push(new INTRASTAT.ColumnMetaData("weight", "text", "Masse Nette (kg)", true, "grossweight", true).setAlignment("right")); 
		colmetadata.push(new INTRASTAT.ColumnMetaData("quantity", "text", "Unit&#x00e9;s Suppl&#x00e9;mentaires", true, "quantity", true).setAlignment("right")); 
		colmetadata.push(new INTRASTAT.ColumnMetaData("indicator", "select", "Indicateur", true, "indicator").setOptions(options).setAlignment(null));
		colmetadata.push(new INTRASTAT.ColumnMetaData("indicatorref", "text", "Previous Indicator", false, "indicator").setAlignment(null));
		colmetadata.push(new INTRASTAT.ColumnMetaData("trantype", "text", "Transaction Type", false, "trantype"));
		var uicontextmeta = {exclude: colmetadata[0].getId(), row: colmetadata[1].getId(), indicator: colmetadata[13].getId(), 
				indicatorref: colmetadata[14].getId(), helplabel: helpLabel, helpurl: helpURL};

		return new INTRASTAT.Context.UIContext(params, colmetadata, uicontextmeta, template.UITemplate);
	};
	
	this.getExportContextList = function(params) { 
		var pdfMetaData = INTRASTAT.FILETYPE.pdf;

		var printExport = new INTRASTAT.Context.ExportContext(params, "fr_fra_print", "Print", template.PDFTemplate, pdfMetaData);
		var excelExport = new INTRASTAT.Context.ExportContext(params, "fr_fra_excel", "Export to Excel", template.ExcelTemplate, INTRASTAT.FILETYPE.excel);
		
		return [printExport, excelExport];
	};
};