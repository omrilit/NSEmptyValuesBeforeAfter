/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */
var VAT = VAT || {};
VAT.LU = VAT.LU || {};
VAT.LU.BaseData = function(params) {
	this.CountryCode = 'LU';
	VAT.ReportData.call(this, params);
};
VAT.LU.BaseData.prototype = Object.create(VAT.ReportData.prototype);
VAT.LU.BaseData.prototype.ProcessReportData = function(data, headerData) {
	var ds = {};
	ds.ToPeriodId = this.periodTo;
	ds.FromPeriodId = this.periodFrom;
	ds.SubId = this.subId;
	ds.ReportIndex = this.className;
	for (var i in data) {
		if (data[i]) {
			ds[i] = i.indexOf('rate') > -1 ? data[i] : nlapiFormatCurrency(data[i]);
		} else {
			ds[i] = nlapiFormatCurrency(0);
		}
	}
	for (var j in headerData) {
		ds[j] = headerData[j];
	}
	ds.taxperiod = this.GetTaxPeriodForHeader();
	return ds;
};
VAT.LU.BaseData.prototype.ProcessPrintData = function(reportData) {
	for (var k in this.otherParams) {
		if (this.otherParams[k]) {
			reportData[k] = this.otherParams[k];
		} else {
			reportData[k] = '';
		}
	}
	reportData.library = _App.GetLibraryFile(VAT.LIB.FORMAT).getValue();
	reportData.box204 = reportData.box204 == 'T' ? ' ✓ ' : '&nbsp;&nbsp;&nbsp;';
	reportData.box205 = reportData.box205 == 'T' ? ' ✓ ' : '&nbsp;&nbsp;&nbsp;';
	return reportData;
};
VAT.LU.BaseData.prototype.GetTaxPeriodForHeader = function() {
	var taxPeriod = '';
	var formatter = VAT.Report.FormatterSingleton.getInstance(this.subId, this.CountryCode, this.languageCode);
	var startdate = new SFC.System.TaxPeriod(this.periodFrom).GetStartDate();
	var enddate = new SFC.System.TaxPeriod(this.periodTo).GetEndDate();
	var monthcount = Math.abs((enddate.getFullYear() * 12 + enddate.getMonth()) - (startdate.getFullYear() * 12 + startdate.getMonth())) + 1;
	if (monthcount == 3) {
		taxPeriod = [
		this.languageCode == 'ENG' ? 'the ' : '',
		formatter.formatDate(startdate.toString('MMMM yyyy'), 'MMMM', false).toUpperCase(),
		' - ',
		formatter.formatDate(enddate.toString('MMMM yyyy'), 'MMMM', false).toUpperCase(),
		this.languageCode == 'ENG' ? ' quarter of calendar year' : ' TRIMESTRE de l\'année civile'
		].join('');
	} else if (monthcount == 1) {
		taxPeriod = formatter.formatDate(startdate.toString('MMMM yyyy'), 'MMMM', false).toUpperCase();
	} else {
		taxPeriod = [
		formatter.formatDate(startdate.toString('MMMM yyyy'), 'MMMM', false).toUpperCase(),
		' - ',
		formatter.formatDate(enddate.toString('MMMM yyyy'), 'MMMM', false).toUpperCase()
		].join('');
	}
	return taxPeriod;
};
VAT.LU.Report2015 = VAT.LU.Report2015 || {};
VAT.LU.Report2015.Data = function(params) {
	_CountryCode = 'LU';
	this.TaxMap = {
		box702: {id: 'box702', label: 'Box 702', taxcodelist: [{taxcode: 'S', available: 'SALE'}]},
		box704: {id: 'box704', label: 'Box 704', taxcodelist: [{taxcode: 'INT', available: 'SALE'}]},
		box706: {id: 'box706', label: 'Box 706', taxcodelist: [{taxcode: 'R', available: 'SALE'}]},
		box040: {id: 'box040', label: 'Box 040', taxcodelist: [{taxcode: 'R3', available: 'SALE'}]},
		box458: {id: 'box458', label: 'Box 458',
		taxcodelist: [
			{taxcode: 'S', available: 'PURCHASE'},
			{taxcode: 'R', available: 'PURCHASE'},
			{taxcode: 'INT', available: 'PURCHASE'},
			{taxcode: 'R3', available: 'PURCHASE'}
		]},
	};
	this.TaxDefinition = {
		S_old: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && !taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true) && taxcode.Rate == 15;
		},
		S: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && !taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true) && taxcode.Rate > 0 && taxcode.Rate != 15 &&
			!taxcode.IsNonDeductible && !taxcode.IsNonDeductibleRef;
		},
		R_old: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && !taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true) && taxcode.Rate == 6;
		},
		R: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && !taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true) && taxcode.Rate > 0 && taxcode.Rate != 6 &&
			!taxcode.IsNonDeductible && !taxcode.IsNonDeductibleRef;
		},
		INT_old: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && !taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true) && taxcode.Rate == 12;
		},
		INT: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && !taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true) && taxcode.Rate > 0 && taxcode.Rate != 12 &&
			!taxcode.IsNonDeductible && !taxcode.IsNonDeductibleRef;
		},
		R3: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && !taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S1', false) && taxcode.Rate > 0 &&
			!taxcode.IsNonDeductible && !taxcode.IsNonDeductibleRef;
		},
		E: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && !taxcode.IsSuperReduced && taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && !taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true);
		},
		O: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && taxcode.IsForExport &&
			!taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && !taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true);
		},
		I_old: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true) && taxcode.NotionalRate == 15;
		},
		I: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true);
		},
		IR_old: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true) && taxcode.NotionalRate == 6;
		},
		IR: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true);
		},
		IR3: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S1', false);
		},
		IINT_old: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true) && taxcode.NotionalRate == 12;
		},
		IINT: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true);
		},
		MT: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && !taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S2', false);
		},
		ES_old: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && taxcode.IsEC && !taxcode.IsService && !taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true) && taxcode.NotionalRate == 15;
		},
		ES: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && taxcode.IsEC && !taxcode.IsService && !taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true);
		},
		ER_old: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && taxcode.IsEC && !taxcode.IsService && !taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true) && taxcode.NotionalRate == 6;
		},
		ER: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && taxcode.IsEC && !taxcode.IsService && !taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true);
		},
		ER3: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && taxcode.IsEC && !taxcode.IsService && !taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S1', false);
		},
		EINT_old: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && taxcode.IsEC && !taxcode.IsService && !taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true) && taxcode.NotionalRate == 12;
		},
		EINT: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && taxcode.IsEC && !taxcode.IsService && !taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true);
		},
		ESSS: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && taxcode.IsEC && taxcode.IsService && !taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true);
		},
		ESSP_old: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && taxcode.IsEC && taxcode.IsService && taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true) && taxcode.NotionalRate == 15;
		},
		ESSP: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && taxcode.IsEC && taxcode.IsService && taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true);
		},
		ESSPR_old: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && taxcode.IsEC && taxcode.IsService && taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true) && taxcode.NotionalRate == 6;
		},
		ESSPR: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && taxcode.IsEC && taxcode.IsService && taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true);
		},
		ESSPR3: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && taxcode.IsEC && taxcode.IsService && taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S1', false);
		},
		ESSPINT_old: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && taxcode.IsEC && taxcode.IsService && taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true) && taxcode.NotionalRate == 12;
		},
		ESSPINT: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && taxcode.IsEC && taxcode.IsService && taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true);
		},
		RC_old: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true) && taxcode.NotionalRate == 15;
		},
		RC: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			!taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true);
		},
		RCR_old: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true) && taxcode.NotionalRate == 6;
		},
		RCR: function(taxcode) {
			return taxcode.CountryCode == _CountryCode &&
			taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport &&
			!taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && taxcode.IsReverseCharge &&
			taxcode.IsCategoryType('S0', true);
		},
		Deduct: function(taxcode) {
			return taxcode.CountryCode == _CountryCode && taxcode.Rate > 0 && !taxcode.IsNonDeductible && taxcode.IsNonDeductibleRef;
		},
		NonDeduct: function(taxcode) {
			return taxcode.CountryCode == _CountryCode && taxcode.Rate > 0 && taxcode.IsNonDeductible && !taxcode.IsNonDeductibleRef;
		}
	};
	VAT.LU.BaseData.call(this, params);
};
VAT.LU.Report2015.Data.prototype = Object.create(VAT.LU.BaseData.prototype);
VAT.LU.Report2015.Data.prototype.GetData = function() {
	var sales = this.DataReader.GetSalesSummary();
	var purchases = this.DataReader.GetPurchaseSummary();
	var salesadj = this.DataReader.GetSalesAdjustmentSummary(this.TaxMap);
	var purchaseadj = this.DataReader.GetPurchaseAdjustmentSummary(this.TaxMap);
	var schema = new VAT.Configuration().getTaxFormSchema(this.CountryCode, this.languageCode.toLowerCase(), 'VAT', 'Ver2015');
	var nondeductible = this.DataReader.GetNonDeductibleSummary();

	var data = {};
	data.srate = schema.srate.value;
	data.srate_old = schema.srate_old.value;
	data.intrate = schema.intrate.value;
	data.intrate_old = schema.intrate_old.value;
	data.rrate = schema.rrate.value;
	data.rrate_old = schema.rrate_old.value;
	data.r3rate = schema.r3rate.value;
	data.box454 = sales.Accrue(['S', 'R', 'INT', 'R3', 'E', 'O', 'MT', 'ES', 'ER', 'EINT', 'ER3', 'ESSS']).NetAmount;
	data.box455 = 0;
	data.box456 = 0;
	data.box012 = data.box454 + data.box455 + data.box456;
	data.box457 = sales.Accrue(['ES', 'ER', 'EINT', 'ER3']).NetAmount;
	data.box014 = sales.Of('O').NetAmount;
	data.box015 = sales.Of('E').NetAmount;
	data.box016 = 0;
	data.box017 = sales.Of('MT').NetAmount;
	data.box018 = 0;
	data.box423 = sales.Of('ESSS').NetAmount;
	data.box424 = 0;
	data.box226 = 0;
	data.box019 = 0;
	data.box419 = sales.Of('RC').NetAmount;
	data.box021 = data.box457 + data.box014 + data.box015 + data.box017 + data.box423 + data.box419;
	data.box022 = data.box012 - data.box021;
	data.box701 = sales.Of('S').NetAmount;
	data.box029 = sales.Of('S_old').NetAmount;
	data.box703 = sales.Of('INT').NetAmount;
	data.box032 = sales.Of('INT_old').NetAmount;
	data.box705 = sales.Of('R').NetAmount;
	data.box030 = sales.Of('R_old').NetAmount;
	data.box031 = sales.Of('R3').NetAmount;
	data.box403 = 0;
	data.box033 = 0;
	data.box418 = 0;
	data.box416 = 0;
	data.box453 = 0;
	data.box451 = 0;
	data.box037 = data.box701 + data.box029 + data.box703 + data.box032 + data.box705 + data.box030 + data.box031;
	data.box702 = sales.Of('S').TaxAmount + salesadj.Of('box702', 'S').TaxAmount;
	data.box038 = sales.Of('S_old').TaxAmount;
	data.box704 = sales.Of('INT').TaxAmount + salesadj.Of('box704', 'INT').TaxAmount;
	data.box041 = sales.Of('INT_old').TaxAmount;
	data.box706 = sales.Of('R').TaxAmount + salesadj.Of('box706', 'R').TaxAmount;
	data.box039 = sales.Of('R_old').TaxAmount;
	data.box040 = sales.Of('R3').TaxAmount + salesadj.Of('box040', 'R3').TaxAmount;
	data.box042 = 0;
	data.box417 = 0;
	data.box452 = 0;
	data.box046 = data.box702 + data.box038 + data.box704 + data.box041 + data.box706 + data.box039 + data.box040;
	data.box711 = purchases.Of('ES').NetAmount;
	data.box047 = purchases.Of('ES_old').NetAmount;
	data.box713 = purchases.Of('EINT').NetAmount;
	data.box050 = purchases.Of('EINT_old').NetAmount;
	data.box715 = purchases.Of('ER').NetAmount;
	data.box048 = purchases.Of('ER_old').NetAmount;
	data.box049 = purchases.Of('ER3').NetAmount;
	data.box194 = 0;
	data.box051 = data.box711 + data.box047 + data.box713 + data.box050 + data.box715 + data.box048 + data.box049;
	data.box712 = purchases.Of('ES').NotionalAmount;
	data.box052 = purchases.Of('ES_old').NotionalAmount;
	data.box714 = purchases.Of('EINT').NotionalAmount;
	data.box055 = purchases.Of('EINT_old').NotionalAmount;
	data.box716 = purchases.Of('ER').NotionalAmount;
	data.box053 = purchases.Of('ER_old').NotionalAmount;
	data.box054 = purchases.Of('ER3').NotionalAmount;
	data.box056 = data.box712 + data.box052 + data.box714 + data.box055 + data.box716 + data.box053 + data.box054;
	data.box152 = 0;
	data.box721 = purchases.Of('I').NetAmount;
	data.box057 = purchases.Of('I_old').NetAmount;
	data.box723 = purchases.Of('IINT').NetAmount;
	data.box060 = purchases.Of('IINT_old').NetAmount;
	data.box725 = purchases.Of('IR').NetAmount;
	data.box058 = purchases.Of('IR_old').NetAmount;
	data.box059 = purchases.Of('IR3').NetAmount;
	data.box195 = 0;
	data.box731 = 0;
	data.box061 = 0;
	data.box733 = 0;
	data.box064 = 0;
	data.box735 = 0;
	data.box062 = 0;
	data.box063 = 0;
	data.box196 = 0;
	data.box065 = data.box721 + data.box057 + data.box723 + data.box060 + data.box725 + data.box058 + data.box059;
	data.box722 = purchases.Of('I').NotionalAmount;
	data.box066 = purchases.Of('I_old').NotionalAmount;
	data.box724 = purchases.Of('IINT').NotionalAmount;
	data.box069 = purchases.Of('IINT_old').NotionalAmount;
	data.box726 = purchases.Of('IR').NotionalAmount;
	data.box067 = purchases.Of('IR_old').NotionalAmount;
	data.box068 = purchases.Of('IR3').NotionalAmount;
	data.box732 = 0;
	data.box071 = 0;
	data.box734 = 0;
	data.box074 = 0;
	data.box736 = 0;
	data.box072 = 0;
	data.box073 = 0;
	data.box407 = data.box722 + data.box066 + data.box724 + data.box069 + data.box726 + data.box067 + data.box068;
	data.box741 = purchases.Of('ESSP').NetAmount;
	data.box427 = purchases.Of('ESSP_old').NetAmount;
	data.box743 = purchases.Of('ESSPINT').NetAmount;
	data.box433 = purchases.Of('ESSPINT_old').NetAmount;
	data.box745 = purchases.Of('ESSPR').NetAmount;
	data.box429 = purchases.Of('ESSPR_old').NetAmount;
	data.box431 = purchases.Of('ESSPR3').NetAmount;
	data.box435 = 0;
	data.box436 = data.box741 + data.box427 + data.box743 + data.box433 + data.box745 + data.box429 + data.box431;
	data.box742 = purchases.Of('ESSP').NotionalAmount;
	data.box428 = purchases.Of('ESSP_old').NotionalAmount;
	data.box744 = purchases.Of('ESSPINT').NotionalAmount;
	data.box434 = purchases.Of('ESSPINT_old').NotionalAmount;
	data.box746 = purchases.Of('ESSPR').NotionalAmount;
	data.box430 = purchases.Of('ESSPR_old').NotionalAmount;
	data.box432 = purchases.Of('ESSPR3').NotionalAmount;
	data.box462 = data.box742 + data.box428 + data.box744 + data.box434 + data.box746 + data.box430 + data.box432;
	data.box463 = 0;
	data.box751 = 0;
	data.box437 = 0;
	data.box753 = 0;
	data.box443 = 0;
	data.box755 = 0;
	data.box439 = 0;
	data.box441 = 0;
	data.box445 = 0;
	data.box464 = 0;
	data.box752 = 0;
	data.box438 = 0;
	data.box754 = 0;
	data.box444 = 0;
	data.box756 = 0;
	data.box440 = 0;
	data.box442 = 0;
	data.box761 = purchases.Of('RC').NetAmount;
	data.box420 = purchases.Of('RC_old').NetAmount;
	data.box765 = data.box761 + data.box420;
	data.box762 = purchases.Of('RC').NotionalAmount;
	data.box421 = purchases.Of('RC_old').NotionalAmount;
	data.box766 = data.box762 + data.box421;
	data.box763 = purchases.Of('RCR').NetAmount;
	data.box222 = purchases.Of('RCR_old').NetAmount;
	data.box767 = data.box763 + data.box222;
	data.box764 = purchases.Of('RCR').NotionalAmount;
	data.box223 = purchases.Of('RCR_old').NotionalAmount;
	data.box768 = data.box764 + data.box223;
	data.box409 = data.box436 + data.box765;
	data.box410 = data.box462 + data.box766;
	data.box227 = 0;
	data.box076 = data.box046 + data.box056 + data.box407 + data.box410 + data.box768;
	data.box458 = purchases.Accrue(['S', 'R', 'INT', 'R3', 'Deduct']).TaxAmount +
				  purchaseadj.Accrue('box458', ['S', 'R', 'INT', 'R3']).TaxAmount -
				  nondeductible.Of('NonDeduct').TaxAmount;
	data.box459 = purchases.Accrue(['ES', 'ER', 'EINT', 'ER3']).NotionalAmount;
	data.box460 = purchases.Of('I').NotionalAmount;
	data.box090 = 0;
	data.box461 = purchases.Accrue(['ESSP', 'ESSPR', 'ESSPINT', 'ESSPR3', 'RC', 'RCR']).NotionalAmount;
	data.box092 = 0;
	data.box228 = 0;
	data.box093 = data.box458 + data.box459 + data.box460 + data.box461;
	data.box097 = 0;
	data.box094 = 0;
	data.box095 = 0;
	data.box102 = data.box093;
	data.box103 = data.box076;
	data.box104 = data.box102;
	data.box105 = data.box103 - data.box104;
	return data;
};
VAT.LU.Report2015.Data.prototype.GetDrilldownData = function(boxNumber) {
	var _DR = this.DataReader;
	var data = [];
	switch (boxNumber) {
		case 'box454': data = _DR.GetSalesDetails(['S', 'R', 'INT', 'R3', 'E', 'O', 'MT', 'ES', 'ER', 'EINT', 'ER3', 'ESSS']); break;
		case 'box457': data = _DR.GetSalesDetails(['ES', 'ER', 'EINT', 'ER3']); break;
		case 'box014': data = _DR.GetSalesDetails(['O']); break;
		case 'box015': data = _DR.GetSalesDetails(['E']); break;
		case 'box017': data = _DR.GetSalesDetails(['MT']); break;
		case 'box423': data = _DR.GetSalesDetails(['ESSS']); break;
		case 'box419': data = _DR.GetSalesDetails(['RC']); break;
		case 'box701': data = _DR.GetSalesDetails(['S']); break;
		case 'box029': data = _DR.GetSalesDetails(['S_old']); break;
		case 'box703': data = _DR.GetSalesDetails(['INT']); break;
		case 'box032': data = _DR.GetSalesDetails(['INT_old']); break;
		case 'box705': data = _DR.GetSalesDetails(['R']); break;
		case 'box030': data = _DR.GetSalesDetails(['R_old']); break;
		case 'box031': data = _DR.GetSalesDetails(['R3']); break;
		case 'box702': data = _DR.GetSalesDetails(['S'], 'box702'); break;
		case 'box038': data = _DR.GetSalesDetails(['S_old']); break;
		case 'box704': data = _DR.GetSalesDetails(['INT'], 'box704'); break;
		case 'box041': data = _DR.GetSalesDetails(['INT_old']); break;
		case 'box706': data = _DR.GetSalesDetails(['R'], 'box706'); break;
		case 'box039': data = _DR.GetSalesDetails(['R_old']); break;
		case 'box040': data = _DR.GetSalesDetails(['R3'], 'box040'); break;
		case 'box711': case 'box712': data = _DR.GetPurchaseDetails(['ES']); break;
		case 'box047': case 'box052': data = _DR.GetPurchaseDetails(['ES_old']); break;
		case 'box713': case 'box714': data = _DR.GetPurchaseDetails(['EINT']); break;
		case 'box050': case 'box055': data = _DR.GetPurchaseDetails(['EINT_old']); break;
		case 'box715': case 'box716': data = _DR.GetPurchaseDetails(['ER']); break;
		case 'box048': case 'box053': data = _DR.GetPurchaseDetails(['ER_old']); break;
		case 'box049': case 'box054': data = _DR.GetPurchaseDetails(['ER3']); break;
		case 'box721': case 'box722': case 'box460': data = _DR.GetPurchaseDetails(['I']); break;
		case 'box057': case 'box066': data = _DR.GetPurchaseDetails(['I_old']); break;
		case 'box723': case 'box724': data = _DR.GetPurchaseDetails(['IINT']); break;
		case 'box060': case 'box069': data = _DR.GetPurchaseDetails(['IINT_old']); break;
		case 'box725': case 'box726': data = _DR.GetPurchaseDetails(['IR']); break;
		case 'box058': case 'box067': data = _DR.GetPurchaseDetails(['IR_old']); break;
		case 'box059': case 'box068': data = _DR.GetPurchaseDetails(['IR3']); break;
		case 'box741': case 'box742': data = _DR.GetPurchaseDetails(['ESSP']); break;
		case 'box427': case 'box428': data = _DR.GetPurchaseDetails(['ESSP_old']); break;
		case 'box743': case 'box744': data = _DR.GetPurchaseDetails(['ESSPINT']); break;
		case 'box433': case 'box434': data = _DR.GetPurchaseDetails(['ESSPINT_old']); break;
		case 'box745': case 'box746': data = _DR.GetPurchaseDetails(['ESSPR']); break;
		case 'box429': case 'box430': data = _DR.GetPurchaseDetails(['ESSPR_old']); break;
		case 'box431': case 'box432': data = _DR.GetPurchaseDetails(['ESSPR3']); break;
		case 'box761': case 'box762': data = _DR.GetPurchaseDetails(['RC']); break;
		case 'box420': case 'box421': data = _DR.GetPurchaseDetails(['RC_old']); break;
		case 'box763': case 'box764': data = _DR.GetPurchaseDetails(['RCR']); break;
		case 'box222': case 'box223': data = _DR.GetPurchaseDetails(['RCR_old']); break;
		case 'box458': data = _DR.GetPurchaseDetails(['S', 'R', 'INT', 'R3', 'Deduct'], 'box458').concat(
							  _DR.GetPurchaseDetailsSTCNDNeg(['NonDeduct'])); break;
		case 'box459': data = _DR.GetPurchaseDetails(['ES', 'ER', 'EINT', 'ER3']); break;
		case 'box461': data = _DR.GetPurchaseDetails(['ESSP', 'ESSPR', 'ESSPINT', 'ESSPR3', 'RC', 'RCR']); break;
	}
	return {ReportData: data};
};
VAT.LU.BaseReport = function() {
	this.isNewFramework = true;
	this.CountryCode = 'LU';
	this.Type = 'VAT';
	this.Subtype = 'Ver2015';
	var form = new VAT.Configuration().getReportForms(this.CountryCode, this.LanguageCode, this.Type, this.Subtype);
	this.Name = form[this.CountryCode][this.Type][this.Subtype].label;
	this.ClassName = form[this.CountryCode][this.Type][this.Subtype].internalId;
	this.HelpURL = form[this.CountryCode][this.Type][this.Subtype].property.HelpURL;
	this.HelpLabel = form[this.CountryCode][this.Type][this.Subtype].property.HelpLabel;
	this.isAdjustable = form[this.CountryCode][this.Type][this.Subtype].property.isAdjustable === true;
	this.EffectiveFrom = form[this.CountryCode][this.Type][this.Subtype].effectiveFrom;
	this.ValidUntil =  form[this.CountryCode][this.Type][this.Subtype].validUntil;
	this.isHandleBars =  form[this.CountryCode][this.Type][this.Subtype].isHandleBars;
	this.SchemaId =  form[this.CountryCode][this.Type][this.Subtype].schemaId;
	VAT.Report.call(this);
};
VAT.LU.BaseReport.prototype = Object.create(VAT.Report.prototype);
VAT.LU.ENG = VAT.LU.ENG || {};
VAT.LU.ENG.Report2015 = function() {
	this.LanguageCode = 'ENG';
	this.ReportType = 'Report2015';
	this.metadata = {
		template: {'pdf': 'VAT_PDF_LU_ENG_2015', 'html': 'VAT_HTML_LU_ENG_2015'}
	};
	VAT.LU.BaseReport.call(this);
};
VAT.LU.ENG.Report2015.prototype = Object.create(VAT.LU.BaseReport.prototype);
VAT.LU.FRA = VAT.LU.FRA || {};
VAT.LU.FRA.Report2015 = function() {
	this.LanguageCode = 'FRA';
	this.ReportType = 'Report2015';
	this.metadata = {
		template: {'pdf': 'VAT_PDF_LU_FRA_2015', 'html': 'VAT_HTML_LU_FRA_2015'}
	};
	VAT.LU.BaseReport.call(this);
};
VAT.LU.FRA.Report2015.prototype = Object.create(VAT.LU.BaseReport.prototype);
