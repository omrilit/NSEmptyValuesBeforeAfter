/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

if (!VAT) VAT = {};
if (!VAT.LU) VAT.LU = {};

VAT.LU.Data = function(startPeriodId, endPeriodId, subId, isConsolidated, salecacheid, purchasecacheid) {
    var _CountryCode = 'LU';
	var _taxmap = {
		box37: {id: 'box37', label: 'Box 37', taxcodelist:[{taxcode: 'S', available: 'SALE'}]},
		box38: {id: 'box38', label: 'Box 38', taxcodelist:[{taxcode: 'R', available: 'SALE'}]},
		box39: {id: 'box39', label: 'Box 39', taxcodelist:[{taxcode: 'R3', available: 'SALE'}]},
		box40: {id: 'box40', label: 'Box 40', taxcodelist:[{taxcode: 'INT', available: 'SALE'}]},
		box23: {id: 'box23', label: 'Box 23', taxcodelist:[{taxcode: 'S', available: 'PURCHASE'},
		                                                   {taxcode: 'R', available: 'PURCHASE'},
		                                                   {taxcode: 'R3', available: 'PURCHASE'},
		                                                   {taxcode: 'INT', available: 'PURCHASE'}]}
	};
	
    var _Defs = {
        S: function(taxcode) {
			return taxcode.CountryCode == _CountryCode && 
	                !taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport && 
	                !taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && !taxcode.IsReverseCharge && 
	                taxcode.IsCategoryType('S0', true) && taxcode.Rate > 0;
        },
        R: function(taxcode) {
        	return taxcode.CountryCode == _CountryCode && 
		            taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport && 
		            !taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && !taxcode.IsReverseCharge && 
		            taxcode.IsCategoryType('S0', true) && taxcode.Rate > 0;
        },
        INT: function(taxcode) {
			return taxcode.CountryCode == _CountryCode && 
	                !taxcode.IsReduced && taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport && 
	                !taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && !taxcode.IsReverseCharge && 
	                taxcode.IsCategoryType('S0', true) && taxcode.Rate > 0;
        },
        R3: function(taxcode) {
        	return taxcode.CountryCode == _CountryCode && 
		            !taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport && 
		            !taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && !taxcode.IsReverseCharge && 
		            taxcode.IsCategoryType('S1', false) && taxcode.Rate > 0;
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
        I: function(taxcode) {
        	return taxcode.CountryCode == _CountryCode && 
		            !taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport && 
		            taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && taxcode.IsReverseCharge && 
		            taxcode.IsCategoryType('S0', true);
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
        ES: function(taxcode) {
        	return taxcode.CountryCode == _CountryCode && 
		            !taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport && 
		            !taxcode.IsImport && taxcode.IsEC && !taxcode.IsService && !taxcode.IsReverseCharge && 
		            taxcode.IsCategoryType('S0', true);
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
        ESSP: function(taxcode) {
        	return taxcode.CountryCode == _CountryCode && 
		            !taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport && 
		            !taxcode.IsImport && taxcode.IsEC && taxcode.IsService && taxcode.IsReverseCharge && 
		            taxcode.IsCategoryType('S0', true);
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
        ESSPINT: function(taxcode) {
        	return taxcode.CountryCode == _CountryCode && 
		            !taxcode.IsReduced && taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport && 
		            !taxcode.IsImport && taxcode.IsEC && taxcode.IsService && taxcode.IsReverseCharge && 
		            taxcode.IsCategoryType('S0', true);
        },
        RC: function(taxcode) {
        	return taxcode.CountryCode == _CountryCode && 
		            !taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport && 
		            !taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && taxcode.IsReverseCharge && 
		            taxcode.IsCategoryType('S0', true);
        },
        RCR: function(taxcode) {
        	return taxcode.CountryCode == _CountryCode && 
		            taxcode.IsReduced && !taxcode.IsSuperReduced && !taxcode.IsExempt && !taxcode.IsForExport && 
		            !taxcode.IsImport && !taxcode.IsEC && !taxcode.IsService && taxcode.IsReverseCharge && 
		            taxcode.IsCategoryType('S0', true);
        }
    };
    
    this.TaxMap = _taxmap;
    this.TaxDefinition = _Defs;

	var _DR = new VAT.DataReader(new VAT.TaxcodeDefinitions(_CountryCode, _Defs), startPeriodId, endPeriodId, subId, isConsolidated, salecacheid, purchasecacheid);
	
	this.GetData = function() {
		var sales = _DR.GetSalesSummary();
		var purchases = _DR.GetPurchaseSummary();
		var salesadj = _DR.GetSalesAdjustmentSummary(_taxmap);
		var purchaseadj = _DR.GetPurchaseAdjustmentSummary(_taxmap);
		
		var data = {box04:0, box05:0, box14:0, box16:0, box424:0, box17:0, box14:0, box16:0, box424:0, box17:0,
					box82:0, box83:0, box84:0, box85:0, box52:0, box81:0, box416:0, box417:0, box418:0, box451:0, 
					box452:0, box453:0, box57:0, box58:0, box59:0, box60:0, box426:0, box227:0, box26:0, box28:0, 
					box228:0, box29:0, box14:0, box84:0, box30:0};
		
		var schema = new VAT.Configuration().getTaxFormSchema(_CountryCode, 'eng', 'VAT', 'Ver2014');
		data.srate = schema['srate'].value;
		data.rrate = schema['rrate'].value;
		data.r3rate = schema['r3rate'].value;
		data.intrate = schema['intrate'].value;
		
		data.box03 = sales.Accrue(['S', 'R', 'INT', 'R3', 'E', 'O', 'MT', 'ES', 'ER', 'EINT', 'ER3', 'ESSS']).NetAmount;
		data.box11 = sales.Accrue(['ES', 'ER', 'EINT', 'ER3']).NetAmount;
		data.box12 = sales.Of('O').NetAmount;
		data.box13 = sales.Of('E').NetAmount;
		data.box15 = sales.Of('MT').NetAmount;
		data.box423 = sales.Of('ESSS').NetAmount;
		data.box419 = sales.Of('RC').NetAmount;
		data.box32 = sales.Of('S').NetAmount;
		data.box33 = sales.Of('R').NetAmount;
		data.box34 = sales.Of('R3').NetAmount;
		data.box35 = sales.Of('INT').NetAmount;
		data.box37 = sales.Of('S').TaxAmount + salesadj.Of('box37', 'S').TaxAmount;
		data.box38 = sales.Of('R').TaxAmount + salesadj.Of('box38', 'R').TaxAmount;
		data.box39 = sales.Of('R3').TaxAmount + salesadj.Of('box39', 'R3').TaxAmount;
		data.box40 = sales.Of('INT').TaxAmount + salesadj.Of('box40', 'INT').TaxAmount;
		data.box42 = purchases.Of('ES').NetAmount;
		data.box43 = purchases.Of('ER').NetAmount;
		data.box44 = purchases.Of('ER3').NetAmount;
		data.box45 = purchases.Of('EINT').NetAmount;
		data.box47 = purchases.Of('ES').NotionalAmount;
		data.box48 = purchases.Of('ER').NotionalAmount;
		data.box49 = purchases.Of('ER3').NotionalAmount;
		data.box50 = purchases.Of('EINT').NotionalAmount;
		data.box53 = purchases.Of('I').NetAmount;
		data.box54 = purchases.Of('IR').NetAmount;
		data.box55 = purchases.Of('IR3').NetAmount;
		data.box56 = purchases.Of('IINT').NetAmount;
		data.box62 = purchases.Of('I').NotionalAmount;
		data.box63 = purchases.Of('IR').NotionalAmount;
		data.box64 = purchases.Of('IR3').NotionalAmount;
		data.box65 = purchases.Of('IINT').NotionalAmount;
		data.box88 = purchases.Of('ESSP').NetAmount;
		data.box89 = purchases.Of('ESSPR').NetAmount;
		data.box90 = purchases.Of('ESSPR3').NetAmount;
		data.box91 = purchases.Of('ESSPINT').NetAmount;
		data.box93 = purchases.Of('ESSP').NotionalAmount;
		data.box94 = purchases.Of('ESSPR').NotionalAmount;
		data.box95 = purchases.Of('ESSPR3').NotionalAmount;
		data.box96 = purchases.Of('ESSPINT').NotionalAmount;
		data.box420 = purchases.Of('RC').NetAmount;
		data.box421 = purchases.Of('RC').NotionalAmount;
		data.box92 = purchases.Of('RCR').NetAmount;
		data.box97 = purchases.Of('RCR').NotionalAmount;
		data.box23 = purchases.Accrue(['S', 'R', 'INT', 'R3']).TaxAmount + purchaseadj.Accrue('box23', ['S', 'R', 'INT', 'R3']).TaxAmount;
		data.box24 = purchases.Accrue(['ES', 'ER', 'EINT', 'ER3']).NotionalAmount;
		data.box25 = purchases.Of('I').NotionalAmount;
		data.box27 = purchases.Accrue(['ESSP', 'ESSPR', 'ESSPR3', 'ESSPINT', 'RC', 'RCR']).NotionalAmount;
		
		data.box09 = data.box03;
		data.box22 = data.box32 + data.box33 + data.box34 + data.box35;
		data.box41 = data.box37 + data.box38 + data.box39 + data.box40 + data.box83 + data.box417 + data.box452;
		
		data.box46 = data.box42 + data.box43 + data.box44 + data.box45 + data.box85; 
		data.box51 = data.box47 + data.box48 + data.box49 + data.box50;
		data.box86 = data.box41 + data.box51;
		data.box87 = data.box86;
		
		data.box66 = data.box57 * (data.srate/100);
		data.box67 = data.box58 * (data.rrate/100);
		data.box68 = data.box59 * (data.r3rate/100);
		data.box69 = data.box60 * (data.intrate/100);
		data.box61 = data.box53 + data.box54 + data.box55 + data.box56 + data.box57 + data.box58 + data.box59 + data.box60;
		data.box407 = data.box62 + data.box63 + data.box64 + data.box65 + data.box66 + data.box67 + data.box68 + data.box69;
		
		data.box422 = data.box88 + data.box89 + data.box90 + data.box91 + data.box426;
		data.box219 = data.box93 + data.box94 + data.box95 + data.box96;
		data.box10 = data.box422 + data.box420 + data.box92;
		data.box72 = data.box87 + data.box407 + data.box219 + data.box421 + data.box97 + data.box227;
		data.box31 = (data.box23 + data.box24 + data.box25 + data.box26 + data.box27 + data.box28 + data.box228) - (data.box29 + data.box30);
		data.box98 = data.box72;
		data.box73 = data.box31;
		data.box74 = data.box98 - data.box73;
		return data;
	};

	this.GetHeaderData = GetHeaderData;
	function GetHeaderData(languageCode) {
		var headerData = new VAT.DataHeader(startPeriodId, endPeriodId, subId, isConsolidated, languageCode, null, _CountryCode);
		return headerData;
	}

    this.GetDrilldownData = function(boxNumber) {
        var data = [];
		switch (String(boxNumber)) {
			case 'box03': data = _DR.GetSalesDetails(['S', 'R', 'INT', 'R3', 'E', 'O', 'MT', 'ES', 'ER', 'EINT', 'ER3', 'ESSS']); break;
			case 'box11': data = _DR.GetSalesDetails(['ES', 'ER', 'EINT', 'ER3']); break;
			case 'box12': data = _DR.GetSalesDetails(['O']); break;
			case 'box13': data = _DR.GetSalesDetails(['E']); break;
			case 'box15': data = _DR.GetSalesDetails(['MT']); break;
			case 'box423': data = _DR.GetSalesDetails(['ESSS']); break;
			case 'box419': data = _DR.GetSalesDetails(['RC']); break;
			case 'box32': case 'box37': data = _DR.GetSalesDetails(['S'], 'box37'); break;
			case 'box33': case 'box38': data = _DR.GetSalesDetails(['R'], 'box38'); break;
			case 'box34': case 'box39': data = _DR.GetSalesDetails(['R3'], 'box39'); break;
			case 'box35': case 'box40': data = _DR.GetSalesDetails(['INT'], 'box40'); break;
			case 'box42': case 'box47': data = _DR.GetPurchaseDetails(['ES']); break;
			case 'box43': case 'box48': data = _DR.GetPurchaseDetails(['ER']); break;
			case 'box44': case 'box49': data = _DR.GetPurchaseDetails(['ER3']); break;
			case 'box45': case 'box50': data = _DR.GetPurchaseDetails(['EINT']); break;
			case 'box53': case 'box62': data = _DR.GetPurchaseDetails(['I']); break;
			case 'box54': case 'box63': data = _DR.GetPurchaseDetails(['IR']); break;
			case 'box55': case 'box64': data = _DR.GetPurchaseDetails(['IR3']); break;
			case 'box56': case 'box65': data = _DR.GetPurchaseDetails(['IINT']); break;
			case 'box88': case 'box93': data = _DR.GetPurchaseDetails(['ESSP']); break;
			case 'box89': case 'box94': data = _DR.GetPurchaseDetails(['ESSPR']); break;
			case 'box90': case 'box95': data = _DR.GetPurchaseDetails(['ESSPR3']); break;
			case 'box91': case 'box96': data = _DR.GetPurchaseDetails(['ESSPINT']); break;
			case 'box420': case 'box421': data = _DR.GetPurchaseDetails(['RC']); break;
			case 'box92': case 'box97': data = _DR.GetPurchaseDetails(['RCR']); break;
			case 'box23': data = _DR.GetPurchaseDetails(['S', 'R', 'INT', 'R3'], 'box23'); break;
			case 'box24': data = _DR.GetPurchaseDetails(['ES', 'ER', 'EINT', 'ER3']); break;
			case 'box25': data = _DR.GetPurchaseDetails(['I']); break;
			case 'box27': data = _DR.GetPurchaseDetails(['ESSP', 'ESSPR', 'ESSPR3', 'ESSPINT', 'RC', 'RCR']); break;
		}
		return data;
	};
};

VAT.LU.GetData = function(fromPeriodId, toPeriodId, subId, isConsolidated, className, languageCode) {
	var ds = {};
	var dataReader = new VAT.LU.Data(fromPeriodId, toPeriodId, subId, isConsolidated);
	var data = dataReader.GetData();
	var headerData = dataReader.GetHeaderData(languageCode);
	var formatter = VAT.Report.FormatterSingleton.getInstance(subId, 'LU', languageCode);
	
	ds.ToPeriodId = toPeriodId;
	ds.FromPeriodId = fromPeriodId;
	ds.SubId = subId;
	ds.ReportIndex = className;
	
	var startdate = new SFC.System.TaxPeriod(fromPeriodId).GetStartDate();
	var enddate = new SFC.System.TaxPeriod(toPeriodId).GetEndDate();
	var monthcount = Math.abs((enddate.getFullYear() * 12 + enddate.getMonth()) - (startdate.getFullYear() * 12 + startdate.getMonth())) + 1;
	
	if (monthcount == 3) {
		ds.taxperiod  = formatter.formatDate(startdate.toString('MMMM yyyy'), 'MMMM', false).toUpperCase() + " - " + 
						formatter.formatDate(enddate.toString('MMMM yyyy'), 'MMMM', false).toUpperCase() + 
						(languageCode == 'ENG' ? ' quarter ' : ' TRIMESTRE ');
	} else if (monthcount == 1) {
		ds.taxperiod = (languageCode == 'ENG' ? ' month of ' : ' mois de ') + 
						formatter.formatDate(startdate.toString('MMMM yyyy'), 'MMMM', false).toUpperCase();
	} else {
		ds.taxperiod = (languageCode == 'ENG' ? ' month of ' : ' mois de ') + 
						formatter.formatDate(startdate.toString('MMMM yyyy'), 'MMMM', false).toUpperCase() + " - " +
						formatter.formatDate(enddate.toString('MMMM yyyy'), 'MMMM', false).toUpperCase();
	}
	
	ds.taxyear = headerData.taxyear;
	ds.company = headerData.company;
	ds.vatno = headerData.vatno;

	for(var i in data) {
		if (data[i]) {
			ds[i] = data[i];
		} else {
			ds[i] = 0;
		}
	}	
	return ds;
};

VAT.LU.GetPrintData = function(fromPeriodId, toPeriodId, subId, isConsolidated, userInfo, params, languageCode) {
	var dataReader = new VAT.LU.Data(fromPeriodId, toPeriodId, subId, isConsolidated);
	var headerData = dataReader.GetHeaderData(languageCode);
	
	var ds = {};
	for (var k in params) {
		if (params[k]) {
			ds[k] = params[k];
		} else {
			ds[k] = ' ';
		}
	}
	
	ds.printmsg = headerData.printmsg;
	
	var checkboxes = ['box01sales', 'box01purch'];
	for (var checkbox in checkboxes) {
		ds[checkboxes[checkbox]] == 'T' ? ds[checkboxes[checkbox]] = '✓' : ds[checkboxes[checkbox]] = ' ';
	}
	return ds;
};

VAT.LU.GetDrilldownData = function(boxNum, startPeriodId, endPeriodId, subId, isConsolidated, salecacheid, purchasecacheid) {
	var ds = [];
	var dataSource = new VAT.LU.Data(startPeriodId, endPeriodId, subId, isConsolidated, salecacheid, purchasecacheid);
	var rptData = dataSource.GetDrilldownData(boxNum);
	ds.ReportData = rptData;
	return ds;
};

VAT.LU.GetAdjustmentMetaData = function (fromPeriodId, toPeriodId, subId, isConsolidated) {
	var ds = new VAT.LU.Data(fromPeriodId, toPeriodId, subId, isConsolidated);
	
	return {
		TaxDefinition: ds.TaxDefinition,
		TaxMap: ds.TaxMap
	};
};

if (!VAT.LU.ENG) VAT.LU.ENG = {};
VAT.LU.ENG.Report = function() {
	this.CountryCode = 'LU';
	this.LanguageCode = 'ENG';
	this.Type = 'VAT';
	this.Subtype = 'Ver2014';
	
	var details = new VAT.Configuration().getTaxReportMapperDetails(this.CountryCode, this.LanguageCode);
	var form = new VAT.Configuration().getReportForms(this.CountryCode, this.LanguageCode, this.Type, this.Subtype);
    
	this.Name = form[this.CountryCode][this.Type][this.Subtype].label;
    this.ClassName = form[this.CountryCode][this.Type][this.Subtype].internalId;
    this.HelpURL = form[this.CountryCode][this.Type][this.Subtype].property.HelpURL;
    this.HelpLabel = form[this.CountryCode][this.Type][this.Subtype].property.HelpLabel;
    this.isAdjustable = form[this.CountryCode][this.Type][this.Subtype].property.isAdjustable == true;
    this.EffectiveFrom = form[this.CountryCode][this.Type][this.Subtype].effectiveFrom;
    this.ValidUntil =  form[this.CountryCode][this.Type][this.Subtype].validUntil;
    this.isHandleBars =  form[this.CountryCode][this.Type][this.Subtype].isHandleBars;
    this.SchemaId =  form[this.CountryCode][this.Type][this.Subtype].schemaId;
	
	this.GetAdjustmentMetaData = function (fromPeriodId, toPeriodId, subId, isConsolidated) {
		 return VAT.LU.GetAdjustmentMetaData(fromPeriodId, toPeriodId, subId, isConsolidated);
    };

    this.GetReportTemplate = function(fromPeriodId, toPeriodId) {
    	var template = getTaxTemplate(details.VAT.templates.html);
    	return _App.RenderTemplate(template.short, {imgurl : template.imgurl});
    };

    this.GetPrintTemplate = function(fromPeriodId, toPeriodId) {
		var template = getTaxTemplate(details.VAT.templates.pdf);
		return _App.RenderTemplate(template.short, {
			fontUrl : nlapiEscapeXML(template.fontUrl),
			fontBoldUrl : nlapiEscapeXML(template.fontBoldUrl),
			fontBoldItalicUrl : nlapiEscapeXML(template.fontBoldItalicUrl),
			fontItalicUrl : nlapiEscapeXML(template.fontItalicUrl),
			imgurl: nlapiEscapeXML(template.imgurl),
			koodak: nlapiEscapeXML(template.koodak)});
    };

    this.GetData = function(fromPeriodId, toPeriodId, subId, isConsolidated) {
        return VAT.LU.GetData(fromPeriodId, toPeriodId, subId, isConsolidated, this.ClassName, this.LanguageCode);
    };

    this.GetPrintData = function(fromPeriodId, toPeriodId, subId, isConsolidated, userInfo, params) {
        return VAT.LU.GetPrintData(fromPeriodId, toPeriodId, subId, isConsolidated, userInfo, params, this.LanguageCode);
    };

    this.GetDrilldownData = function(boxNum, startPeriodId, endPeriodId, subId, isConsolidated, salecacheid, purchasecacheid) {
		return VAT.LU.GetDrilldownData(boxNum, startPeriodId, endPeriodId, subId, isConsolidated, salecacheid, purchasecacheid);
    };
};

if (!VAT.LU.FRA) VAT.LU.FRA = {};
VAT.LU.FRA.Report = function() {
	this.CountryCode = 'LU';
    this.LanguageCode = 'FRA';
    this.Type = 'VAT';
    this.Subtype = 'Ver2014';
    
    var details = new VAT.Configuration().getTaxReportMapperDetails(this.CountryCode, this.LanguageCode);
    var form = new VAT.Configuration().getReportForms(this.CountryCode, this.LanguageCode, this.Type, this.Subtype);
    
    this.Name = form[this.CountryCode][this.Type][this.Subtype].label;
    this.ClassName = form[this.CountryCode][this.Type][this.Subtype].internalId;
    this.HelpURL = form[this.CountryCode][this.Type][this.Subtype].property.HelpURL;
    this.HelpLabel = form[this.CountryCode][this.Type][this.Subtype].property.HelpLabel;
    this.isAdjustable = form[this.CountryCode][this.Type][this.Subtype].property.isAdjustable == true;
    this.EffectiveFrom = form[this.CountryCode][this.Type][this.Subtype].effectiveFrom;
    this.ValidUntil =  form[this.CountryCode][this.Type][this.Subtype].validUntil;
    this.isHandleBars =  form[this.CountryCode][this.Type][this.Subtype].isHandleBars;
    this.SchemaId =  form[this.CountryCode][this.Type][this.Subtype].schemaId;
	
	this.GetAdjustmentMetaData = function (fromPeriodId, toPeriodId, subId, isConsolidated) {
		 return VAT.LU.GetAdjustmentMetaData(fromPeriodId, toPeriodId, subId, isConsolidated);
    };
    
    this.GetReportTemplate = function(fromPeriodId, toPeriodId) {
    	var template = getTaxTemplate(details.VAT.templates.html);
    	return _App.RenderTemplate(template.short, {imgurl : template.imgurl});
    };

    this.GetPrintTemplate = function(fromPeriodId, toPeriodId) {
    	var template = getTaxTemplate(details.VAT.templates.pdf);
    	return _App.RenderTemplate(template.short, {
    		fontUrl : nlapiEscapeXML(template.fontUrl),
			fontBoldUrl : nlapiEscapeXML(template.fontBoldUrl),
			fontBoldItalicUrl : nlapiEscapeXML(template.fontBoldItalicUrl),
			fontItalicUrl : nlapiEscapeXML(template.fontItalicUrl),
			imgurl: nlapiEscapeXML(template.imgurl),
			koodak: nlapiEscapeXML(template.koodak)});
    };

    this.GetData = function(fromPeriodId, toPeriodId, subId, isConsolidated) {
        return VAT.LU.GetData(fromPeriodId, toPeriodId, subId, isConsolidated, this.ClassName, this.LanguageCode);
    };

    this.GetPrintData = function(fromPeriodId, toPeriodId, subId, isConsolidated, userInfo, params) {
        return VAT.LU.GetPrintData(fromPeriodId, toPeriodId, subId, isConsolidated, userInfo, params, this.LanguageCode);
    };

    this.GetDrilldownData = function(boxNum, startPeriodId, endPeriodId, subId, isConsolidated, salecacheid, purchasecacheid) {
		return VAT.LU.GetDrilldownData(boxNum, startPeriodId, endPeriodId, subId, isConsolidated, salecacheid, purchasecacheid);
    };
};