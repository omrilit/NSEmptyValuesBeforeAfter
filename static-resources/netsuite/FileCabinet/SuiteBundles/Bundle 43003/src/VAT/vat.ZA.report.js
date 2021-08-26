/**
 * Copyright © 2014, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.ZA = VAT.ZA || {};

VAT.ZA.BaseData = function(params) {
	this.CountryCode = 'ZA';
	VAT.ReportData.call(this, params);
};
VAT.ZA.BaseData.prototype = Object.create(VAT.ReportData.prototype);

VAT.ZA.BaseData.prototype.ProcessReportData = function(data, headerData) {
	var ds = {};
	ds.ToPeriodId = this.periodTo;
	ds.FromPeriodId = this.periodFrom;
	ds.SubId = this.subId;
	ds.ReportIndex = this.className;

	for (var i in data) {
		ds[i] = nlapiFormatCurrency(data[i]);
	}

	for (var j in headerData) {
		ds[j] = headerData[j];
	}

	return ds;
};

VAT.ZA.Report = VAT.ZA.Report || {};
VAT.ZA.Report.Data = function(params) {
	var _CountryCode = 'ZA';
	this.TaxMap = {
		box015: {id: 'box015', label: 'Box 15', taxcodelist: [{taxcode: 'S', available: 'PURCHASE'}]},
		box014: {id: 'box014', label: 'Box 14', taxcodelist: [{taxcode: 'SC', available: 'PURCHASE'}]},
		box014A: {id: 'box014A', label: 'Box 14A', taxcodelist: [{taxcode: 'I', available: 'PURCHASE'}]}
	};

	var _Defs = {
		S: function(taxcode) {
			return taxcode.CountryCode == _CountryCode && taxcode.Rate > 0 && !taxcode.IsCapitalGoods && !taxcode.IsForExport && !taxcode.IsImport && !taxcode.IsExempt;
		},
		SC: function(taxcode) {
			return taxcode.CountryCode == _CountryCode && taxcode.IsCapitalGoods && !taxcode.IsForExport && !taxcode.IsImport && !taxcode.IsExempt;
		},
		Z: function(taxcode) {
			return taxcode.CountryCode == _CountryCode && taxcode.Rate == 0.00 && !taxcode.IsCapitalGoods && !taxcode.IsForExport && !taxcode.IsImport && !taxcode.IsExempt;
		},
		O: function(taxcode) {
			return taxcode.CountryCode == _CountryCode && !taxcode.IsCapitalGoods && taxcode.IsForExport && !taxcode.IsImport && !taxcode.IsExempt;
		},
		I: function(taxcode) {
			return taxcode.CountryCode == _CountryCode && !taxcode.IsCapitalGoods && !taxcode.IsForExport && taxcode.IsImport && !taxcode.IsExempt;
		},
		E: function(taxcode) {
			return taxcode.CountryCode == _CountryCode && !taxcode.IsCapitalGoods && !taxcode.IsForExport && !taxcode.IsImport && taxcode.IsExempt;
		}
	};
	this.TaxDefinition = _Defs;
	VAT.ZA.BaseData.call(this, params);
};
VAT.ZA.Report.Data.prototype = Object.create(VAT.ZA.BaseData.prototype);

VAT.ZA.Report.Data.prototype.GetData = function() {
	var _DR = this.DataReader;
	var sales = _DR.GetSalesSummary();
	var purchases = _DR.GetPurchaseSummary();
	var salesadj = _DR.GetSalesAdjustmentSummary(this.TaxMap);
	var purchaseadj = _DR.GetPurchaseAdjustmentSummary(this.TaxMap);
	var obj = {};
	var emptyboxes = ['box009', 'box012', 'box015A', 'box016', 'box017', 'box018', 'box005', 'box006', 'box007', 'box008', 'box010', 'boxlesscredit', 'boxaddpenalty', 'boxinterest'];
	for (var iempty = 0; iempty < emptyboxes.length; iempty++) { obj[emptyboxes[iempty]] = 0;}
	
    var fractionMultiplier = 0;
    
    var taxRate = sales.Of('S').Rate || sales.Of('SC').Rate || 0;
    fractionMultiplier = taxRate / (100 + taxRate);
    fractionMultiplier = parseFloat(fractionMultiplier.toFixed(15));
    
    obj.boxtaxrate = taxRate;
	obj.box011 = parseFloat((obj.box010 * fractionMultiplier).toFixed(2));
	obj.box001 = sales.Of('S').GrossAmount;
	obj.box004 = parseFloat((obj.box001 * fractionMultiplier).toFixed(2));
	obj.box001A = sales.Of('SC').GrossAmount;
	obj.box004A = parseFloat((obj.box001A * fractionMultiplier).toFixed(2));
	obj.box002 = sales.Of('Z').NetAmount;
	obj.box002A = sales.Of('O').NetAmount;
	obj.box003 = sales.Of('E').NetAmount;

	obj.box015 = purchases.Of('S').TaxAmount + purchaseadj.Of('box015', 'S').TaxAmount;
	obj.box014 = purchases.Of('SC').TaxAmount + purchaseadj.Of('box014', 'SC').TaxAmount;
	obj.box014A = purchases.Of('I').TaxAmount + purchaseadj.Of('box014A', 'I').TaxAmount;

	obj.box013 = obj.box004 + obj.box004A + obj.box009 + obj.box011 + obj.box012;
	obj.box019 = obj.box014 + obj.box014A + obj.box015 + obj.box015A + obj.box016 + obj.box017 + obj.box018;
	obj.box020 = obj.box013 - obj.box019;
	obj.boxtotalpenalty = obj.boxaddpenalty + obj.boxinterest;
	obj.boxtotalvatamtpay = obj.box020 + obj.boxtotalpenalty - obj.boxlesscredit;
	
	return obj;
};

VAT.ZA.Report.Data.prototype.GetDrilldownData = function(boxNumber) {
	var _DR = this.DataReader;
	var ds = {};
	var data = [];

	switch (boxNumber) {
		case 'box001': case 'box004': data = _DR.GetSalesDetails(['S']); break;
		case 'box001A': case 'box004A': data = _DR.GetSalesDetails(['SC']); break;
		case 'box002': data = _DR.GetSalesDetails(['Z']); break;
		case 'box002A': data = _DR.GetSalesDetails(['O']); break;
		case 'box003': data = _DR.GetSalesDetails(['E']); break;
		case 'box015': data = _DR.GetPurchaseDetails(['S'], 'box015'); break;
		case 'box014': data = _DR.GetPurchaseDetails(['SC'], 'box014'); break;
		case 'box014A': data = _DR.GetPurchaseDetails(['I'], 'box014A'); break;
	}

	ds.ReportData = data;
	return ds;
};

VAT.ZA.BaseReport = function() {
	this.isNewFramework = false;
	VAT.Report.call(this);
	this.CountryCode = 'ZA';
	this.Type = 'VAT';
	this.ReportType = 'Report';
	this.ReportName = "VAT 201";
	this.HelpURL = "/app/help/helpcenter.nl?topic=DOC_SouthAfricaTaxTopics";
	this.HelpLabel = "Click here for South Africa VAT Help Topics";
	this.isAdjustable = true;
};
VAT.ZA.BaseReport.prototype = Object.create(VAT.Report.prototype);

VAT.ZA.ENG = VAT.ZA.ENG || {};
VAT.ZA.ENG.Report = function() {
	VAT.ZA.BaseReport.call(this);
	this.Name = 'South Africa (English)';
	this.ClassName = 'VAT.ZA.ENG.Report';
	this.LanguageCode = 'ENG';
	this.metadata = {template: {'pdf': 'VAT_PDF_ZA_ENG', 'html': 'VAT_HTML_ZA_ENG'}};
};
VAT.ZA.ENG.Report.prototype = Object.create(VAT.ZA.BaseReport.prototype);