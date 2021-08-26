/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var INTRASTAT = INTRASTAT || {};
INTRASTAT.Context = INTRASTAT.Context || {};

INTRASTAT.Context.DE = function() {
	this.countrycode = "DE";
	this.rowsetmeta = {};
	this.helpLabel = "Click here for Intrastat Help Topics";
	this.helpURL = "/app/help/helpcenter.nl?topic=DOC_EUIntrastatReport";

	this.setCountryCode = function(code) {
		this.countrycode = code;
	};

	this.getCountryCode = function() {
		return this.countrycode;
	};

	this.getLanguage = function() {
		return this.language;
	};

	this.getLocale = function() {
		return this.countrycode + "_" + this.language;
	};

	this.getRowSetMetaData = function() {
		return this.rowsetmeta;
	};

	this.getName = function() {
		return this.name;
	};
};

INTRASTAT.Context.DE.prototype.getExportData = function _getExportData(params) {
	if (params.cachefileid) {
		return new INTRASTAT.CacheRowSet(params, null, true).getInclusiveResult(); //get the cache - must be updated already
	} else {
		return [];
	}
};

INTRASTAT.Context.DE.prototype.getData = function _getData(params) {
	params.nexus = this.countrycode;
	if (params.cachefileid) {
		var rowset = new INTRASTAT.CacheRowSet(params); //get the cache
	} else { //build rowset
		var reportObj = new INTRASTAT.ReportRunner(params.fromperiodid, params.toperiodid, params.subsidiaryid, this.countrycode, true);

		var reportContent = [];
		if (params.type == INTRASTAT.PURCHASEREPORT) {
			reportContent = reportObj.getPurchaseReport();
		} else {
			reportContent = reportObj.getSalesReport();
		}

		var rowset = new INTRASTAT.CacheRowSet(params, reportContent);
	}
	this.rowsetmeta = rowset.getRowSetMetaData();
	return rowset.getPageResult();
};

INTRASTAT.Context.DE.prototype.getExportContextList = function _getExportContextList(params) {
	var pdfMetaData = INTRASTAT.FILETYPE.pdf;
	var printExport = new INTRASTAT.Context.ExportContext(params, this.exportType.print.id, this.exportType.print.label, this.template.PDFTemplate, pdfMetaData, null);
	var excelExport = new INTRASTAT.Context.ExportContext(params, this.exportType.excel.id, this.exportType.excel.label, this.template.ExcelTemplate, INTRASTAT.FILETYPE.excel, null);
	var asciiExport = new INTRASTAT.Context.ExportContext(params, this.exportType.ascii.id, this.exportType.ascii.label, this.template.AsciiTemplate, INTRASTAT.FILETYPE.ascii, null, new VAT.Formatter.DE.Intrastat(new VAT.Formatter.DE.Intrastat.AsciiFieldDefinitions()));
	return [printExport, excelExport, asciiExport];
};

INTRASTAT.Context.DE_eng = function() {
	this.template = {
		UITemplate: {
			sales: "INTRASTAT_HTML_DE_ENG_SALE",
			purchase: "INTRASTAT_HTML_DE_ENG_PURCHASE"
		},
		PDFTemplate: {
			sales: "INTRASTAT_PDF_DE_ENG_SALE",
			purchase: "INTRASTAT_PDF_DE_ENG_PURCHASE",
			row: "INTRASTAT_PDF_DE_ROW"
		},
		ExcelTemplate: {
			sales: "INTRASTAT_XLS_DE_ENG_SALE",
			purchase: "INTRASTAT_XLS_DE_ENG_PURCHASE",
			row: "INTRASTAT_XLS_DE_ROW"
		},
		AsciiTemplate: {
			sales: "INTRASTAT_ASCII_DE",
			purchase: "INTRASTAT_ASCII_DE",
			salesrow: "INTRASTAT_ASCII_DE_SALE_ROW",
			purchaserow: "INTRASTAT_ASCII_DE_PURCHASE_ROW",
			filename: {sale: "VER", purchase: "EIN"}
		}
	};

	this.exportType = {
		print: {
			id: 'de_eng_print',
			label: 'Print'
		},
		excel: {
			id: 'de_eng_excel',
			label: 'Export to Excel'
		},
		ascii: {
			id: 'de_eng_ascii',
			label: 'Export to ASCII'
		}
	};

	this.language = "eng";
	this.name = "Germany (English)";

	INTRASTAT.Context.DE.call(this);
};
INTRASTAT.Context.DE_eng.prototype = Object.create(INTRASTAT.Context.DE.prototype);

INTRASTAT.Context.DE_eng.prototype.getUIContext = function _getUIContext(params) {
	var isSales = (params.type == INTRASTAT.SALEREPORT);
	var colmetadata = [];
	colmetadata.push(new INTRASTAT.ColumnMetaData("exclude", "checkbox", "Exclude", true, "exclude").setAlignment(null));
	colmetadata.push(new INTRASTAT.ColumnMetaData("row", "integer", "Line", true, "row").setAlignment(null));
	colmetadata.push(new INTRASTAT.ColumnMetaData("itemdesc", "textarea", "Description<br/>of Goods", true, "itemdesc", false).setAlignment(null));
	colmetadata.push(new INTRASTAT.ColumnMetaData("item", "textarea", "Item", true, "item").setAlignment(null).setLinkParam(INTRASTAT.ACTION.item));

	if (isSales) {
		colmetadata.push(new INTRASTAT.ColumnMetaData("country", "text", "Country of<br/>Destination", true, "countrycode", false));
	} else {
		colmetadata.push(new INTRASTAT.ColumnMetaData("country", "text", "Country of<br/>Origin", true, "countrycode", false));
	}
	colmetadata.push(new INTRASTAT.ColumnMetaData("region", "text", "Region of<br/>Origin", true, "region", false).setAlignment(null));
	colmetadata.push(new INTRASTAT.ColumnMetaData("notc", "text", "Nature of<br/>Transaction", true, "notc", false));
	colmetadata.push(new INTRASTAT.ColumnMetaData("commodity", "text", "Commodity Code", true, "commoditycode", true));
	colmetadata.push(new INTRASTAT.ColumnMetaData("weight", "text", "Net Mass<br/>(kg)", true, "grossweight", false).setAlignment("right"));
	colmetadata.push(new INTRASTAT.ColumnMetaData("quantity", "text", "Supplementary Unit", true, "quantity", true).setAlignment("right"));
	colmetadata.push(new INTRASTAT.ColumnMetaData("amount", "text", "Value", true, "netamount").setAlignment("right"));
	colmetadata.push(new INTRASTAT.ColumnMetaData("statisticalvalue", "text", "Statistical<br/>Value", true, "statisticalvalue", true).setAlignment("right"));
	colmetadata.push(new INTRASTAT.ColumnMetaData("deliveryterm", "text", "Delivery Term", true, "deliveryterm", true));
	colmetadata.push(new INTRASTAT.ColumnMetaData("transportmode", "text", "Mode of Transport", true, "transportmode", true));

	var uicontextmeta = {
		exclude: colmetadata[0].getId(),
		row: colmetadata[1].getId(),
		helplabel: this.helpLabel,
		helpurl: this.helpURL
	};

	return new INTRASTAT.Context.UIContext(params, colmetadata, uicontextmeta, this.template.UITemplate);
};

INTRASTAT.Context.DE_deu = function() {
	this.template = {
		UITemplate: {
			sales: "INTRASTAT_HTML_DE_DEU_SALE",
			purchase: "INTRASTAT_HTML_DE_DEU_PURCHASE"
		},
		PDFTemplate: {
			sales: "INTRASTAT_PDF_DE_DEU_SALE",
			purchase: "INTRASTAT_PDF_DE_DEU_PURCHASE",
			row: "INTRASTAT_PDF_DE_ROW"
		},
		ExcelTemplate: {
			sales: "INTRASTAT_XLS_DE_DEU_SALE",
			purchase: "INTRASTAT_XLS_DE_DEU_PURCHASE",
			row: "INTRASTAT_XLS_DE_ROW"
		},
		AsciiTemplate: {
			sales: "INTRASTAT_ASCII_DE",
			purchase: "INTRASTAT_ASCII_DE",
			salesrow: "INTRASTAT_ASCII_DE_SALE_ROW",
			purchaserow: "INTRASTAT_ASCII_DE_PURCHASE_ROW",
			filename: {sale: "VER", purchase: "EIN"}
		}
	};

	this.exportType = {
		print: {
			id: 'de_deu_print',
			label: 'Print'
		},
		excel: {
			id: 'de_deu_excel',
			label: 'Export to Excel'
		},
		ascii: {
			id: 'de_deu_ascii',
			label: 'Export to ASCII'
		}
	};

	this.language = "deu";
	this.name = "Germany (Deutsch)";
	
	INTRASTAT.Context.DE.call(this);
};
INTRASTAT.Context.DE_deu.prototype = Object.create(INTRASTAT.Context.DE.prototype);

INTRASTAT.Context.DE_deu.prototype.getUIContext = function _getUIContext(params) {
	var isSales = (params.type == INTRASTAT.SALEREPORT);
	var colmetadata = [];
	colmetadata.push(new INTRASTAT.ColumnMetaData("exclude", "checkbox", "Ausschlie&#x00df;en", true, "exclude").setAlignment(null));
	colmetadata.push(new INTRASTAT.ColumnMetaData("row", "integer", "Zeile", true, "row").setAlignment(null));
	colmetadata.push(new INTRASTAT.ColumnMetaData("itemdesc", "textarea", "Warenbezeichnung", true, "itemdesc", true).setAlignment(null));
	colmetadata.push(new INTRASTAT.ColumnMetaData("item", "textarea", "Pos.-Nr.", true, "item").setAlignment(null).setLinkParam(INTRASTAT.ACTION.item));
	colmetadata.push(new INTRASTAT.ColumnMetaData("country", "text", "Best.-Land", true, "countrycode", true));
	colmetadata.push(new INTRASTAT.ColumnMetaData("region", "text", "Urspr.-Reg", true, "region", true).setAlignment(null));
	colmetadata.push(new INTRASTAT.ColumnMetaData("notc", "text", "Art d.<br/>Gesch.", true, "notc", false));
	colmetadata.push(new INTRASTAT.ColumnMetaData("commodity", "text", "Warennummer", true, "commoditycode", true));
	colmetadata.push(new INTRASTAT.ColumnMetaData("weight", "text", "Eigenmasse<br/>in vollen kg", true, "grossweight", false).setAlignment("right"));
	colmetadata.push(new INTRASTAT.ColumnMetaData("quantity", "text", "Besondere Ma&#x00df;einheit", true, "quantity", true).setAlignment("right"));
	colmetadata.push(new INTRASTAT.ColumnMetaData("amount", "text", "Rechnungsbetrag<br/>in vollen Euro", true, "netamount").setAlignment("right"));
	colmetadata.push(new INTRASTAT.ColumnMetaData("statisticalvalue", "text", "Statistischer</br>Wert", true, "statisticalvalue", true).setAlignment("right"));
	colmetadata.push(new INTRASTAT.ColumnMetaData("deliveryterm", "text", "Lieferbedingungen", true, "deliveryterm", true));
	colmetadata.push(new INTRASTAT.ColumnMetaData("transportmode", "text", "Verkehrszweig", true, "transportmode", true));

	var uicontextmeta = {
		exclude: colmetadata[0].getId(),
		row: colmetadata[1].getId(),
		helplabel: this.helpLabel,
		helpurl: this.helpURL
	};

	return new INTRASTAT.Context.UIContext(params, colmetadata, uicontextmeta, this.template.UITemplate);
};