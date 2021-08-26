/**
 * Copyright © 2015, 2018, Oracle and/or its affiliates. All rights reserved. 
 */

var VAT = VAT || {};
VAT.MY = VAT.MY || {};
VAT.MY.ENG = VAT.MY.ENG || {};
VAT.MY.MAY = VAT.MY.MAY || {};

// Base Data
VAT.MY.BaseData = function(params) {
	this.CountryCode = 'MY';
	VAT.ReportData.call(this, params);
};
VAT.MY.BaseData.prototype = Object.create(VAT.ReportData.prototype);

VAT.MY.BaseData.prototype.ProcessReportData = function(data, headerData) {
	var ds = {};
	ds.ToPeriodId = this.periodTo;
	ds.FromPeriodId = this.periodFrom;
	ds.SubId = this.subId;
	ds.ReportIndex = this.className;

	for(var i in data) {
		if (data[i]) {
			ds[i] = i.indexOf('rate') > -1 ? data[i] : nlapiFormatCurrency(data[i]);
		} else {
			ds[i] = nlapiFormatCurrency(0);
		}
	}

	for(var j in headerData) {
		ds[j] = headerData[j];
	}

	return ds;
};

VAT.MY.BaseData.prototype.ProcessPrintData = function(data) {
	for (var k in this.otherParams) {
		if (this.otherParams[k]) {
			data[k] = this.otherParams[k];
			if (k.indexOf('chk') > -1) {
				data[k] = data[k] == 'T' ? 'X' : '';
			}
		} else {
			data[k] = '';
		}
	}
	return data;
};

// Old Data
VAT.MY.Report = VAT.MY.Report || {};
VAT.MY.Report.Data = function(params) {
	var _CountryCode = 'MY';
	this.TaxMap = {
			box5b: {id: 'box5b', label: '5b', taxcodelist: [{taxcode: 'SR', available: 'SALE'}, {taxcode: 'DS', available: 'SALE'}, {taxcode: 'AJS', available: 'SALE'}]},
			box6b: {id: 'box6b', label: '6b', taxcodelist: [{taxcode: 'TX', available: 'PURCHASE'}, {taxcode: 'IM', available: 'PURCHASE'}, {taxcode: 'TX-E43', available: 'PURCHASE'},
															{taxcode: 'TX-CAP', available: 'PURCHASE'}, {taxcode: 'TX-RE', available: 'PURCHASE'}, {taxcode: 'AJP', available: 'PURCHASE'}]},
			box17: {id: 'box17', label: '17', taxcodelist: [{taxcode: 'AJP', available: 'PURCHASE'}]},
			box18: {id: 'box18', label: '18', taxcodelist: [{taxcode: 'AJS', available: 'SALE'}]}
	};
	this.TaxDefinition = {
		TX: function(taxcode) { // 6a, 6b
			return taxcode.CountryCode == _CountryCode && taxcode.IsForPurchase && taxcode.Rate > 0 && taxcode.IsCategoryType('S0', true);
		},
		'TX-RE': function(taxcode) { // 6a, 6b
			return taxcode.CountryCode == _CountryCode && taxcode.IsForPurchase && taxcode.Rate > 0 && taxcode.IsCategoryType('S9');
		},
		'TX-CAP': function(taxcode) { // 6a, 6b, 16
			return taxcode.CountryCode == _CountryCode && taxcode.IsForPurchase && taxcode.Rate > 0 && taxcode.IsCategoryType('S2');
		},
		'TX-E43': function(taxcode) { // 6a, 6b
			return taxcode.CountryCode == _CountryCode && taxcode.IsForPurchase && taxcode.Rate > 0 && taxcode.IsCategoryType('S4') && taxcode.IsExempt;
		},
		IM: function(taxcode) { // 6a, 6b
			return taxcode.CountryCode == _CountryCode && taxcode.IsForPurchase && taxcode.Rate > 0 && taxcode.IsCategoryType('S0', true) && taxcode.IsImport;
		},
		AJP: function(taxcode) { // 6b, 17
			return taxcode.CountryCode == _CountryCode && taxcode.IsForPurchase && taxcode.Rate > 0 && taxcode.IsCategoryType('S5');
		},
		IS: function(taxcode) { // 14, 15
			return taxcode.CountryCode == _CountryCode && taxcode.IsForPurchase && taxcode.Rate == 0 && taxcode.IsCategoryType('S1') && taxcode.IsImport;
		},
		AJS: function(taxcode) { // 5b, 18
			return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate > 0 && taxcode.IsCategoryType('S7');
		},
		SR: function(taxcode) { // 5a, 5b
			return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate > 0 && taxcode.IsCategoryType('S0', true);
		},
		DS: function(taxcode) { // 5a, 5b
			return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate > 0 && taxcode.IsCategoryType('S0', true);
		},
		RS: function(taxcode) { // 13
			return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S8');
		},
		ES43: function(taxcode) { // 12
			return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S4') && taxcode.IsExempt;
		},
		ES: function(taxcode) { // 12
			return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S0', true) && taxcode.IsExempt;
		},
		ZRE: function(taxcode) { // 11
			return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S0', true) && taxcode.IsForExport;
		},
		ZRL: function(taxcode) { // 10
			return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S0', true) && !taxcode.IsForExport;
		},
		OS: function(taxcode) { // no box, part of TX-RE computation
			return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S10');
		},
		GS: function(taxcode) { // no box, part of TX-RE computation
			return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S11');
		}
	};
	VAT.MY.BaseData.call(this, params);
};
VAT.MY.Report.Data.prototype = Object.create(VAT.MY.BaseData.prototype);

VAT.MY.Report.Data.prototype.GetRGLData = function() {
    var rgl = new Tax.RealizedGainLoss().run({
        nexus: new VAT.DAO.NexusDAO().getByCountryCode(this.CountryCode).id,
        subId: this.subId,
        bookId: this.bookId,
        periodFrom: this.periodFrom,
        periodTo: this.periodTo,
        dateFormat: this.DataHeader.shortdate,
        defaults: {
            taxCode: 'ES43',
            taxType: 'ES33_ESN33',
        }
    });
    
    return {
        summary: rgl.getSummary(),
        details: rgl.getDetails()
    };
};

VAT.MY.Report.Data.prototype.GetData = function() {
	var _DR = this.DataReader;
	var sales = _DR.GetSalesSummary();
	var purchases = _DR.GetPurchaseSummary();
	var salesadj = _DR.GetSalesAdjustmentSummary(this.TaxMap);
	var purchaseadj = _DR.GetPurchaseAdjustmentSummary(this.TaxMap);
	var rgl = this.GetRGLData().summary;
    
	var standardGSTrate = 0.06;
	var obj = {};
	var emptyboxes = ['box19b', 'box19c', 'box19d', 'box19e', 'box19others',
					  'box19b_percent', 'box19c_percent', 'box19d_percent', 'box19e_percent', 'box19others_percent'];
	var reclaimableTXREResult = this.GetReclaimableTXRE(sales, purchases.Of('TX-RE').TaxAmount);

	for ( var iempty = 0; iempty < emptyboxes.length; iempty++) {
		obj[emptyboxes[iempty]] = 0;
	}
	obj.box5a = sales.Accrue(['SR', 'DS']).NetAmount;
	obj.box5b = sales.Accrue(['SR', 'DS', 'AJS']).TaxAmount + salesadj.Accrue('box5b', ['SR', 'DS', 'AJS']).TaxAmount;
	obj.box6a = purchases.Accrue(['TX', 'IM', 'TX-E43', 'TX-RE', 'TX-CAP']).NetAmount;
	obj.box10 = sales.Of('ZRL').NetAmount;
	obj.box11 = sales.Of('ZRE').NetAmount;
	obj.box12 = sales.Accrue(['ES', 'ES43']).NetAmount + parseFloat(rgl.netAmount || 0);
	obj.box13 = sales.Of('RS').NetAmount;
	obj.box14 = purchases.Of('IS').NetAmount;
	obj.box16 = purchases.Of('TX-CAP').NetAmount;
	obj.box17 = purchases.Of('AJP').NetAmount;
	obj.box18 = sales.Of('AJS').NetAmount;
	obj.box6b = purchases.Accrue(['TX', 'IM', 'TX-E43', 'TX-CAP', 'AJP']).TaxAmount +
				reclaimableTXREResult.reclaimabletxre +
				purchaseadj.Accrue('box6b', ['TX', 'IM', 'TX-E43', 'TX-CAP', 'TX-RE', 'AJP']).TaxAmount;
	obj.box15 = obj.box14 * standardGSTrate;

	if (obj.box5b > obj.box6b){
		obj.box7 = obj.box5b - obj.box6b;
		obj.box8 = 0;
	}else{
		obj.box7 = 0;
		obj.box8 = obj.box6b - obj.box5b;
	}

	obj.box19a = obj.box5b;
	obj.box19total = obj.box19a;
	obj.box19a_percent = obj.box19a ? 100 : 0;
	obj.irrpercent = obj.box6b ? reclaimableTXREResult.irrpercent : 0;
	return obj;
};

VAT.MY.Report.Data.prototype.GetReclaimableTXRE = function(salesSummary, txre_tax_amount) {
	var reclaimableResults = {
		reclaimabletxre: 0,
		irrpercent: 0
	};
	var ringgitThreshold = 5000;
	var percentageThreshold = 0.05;
	var totalSalesNetAmount = salesSummary.Accrue(['SR', 'ZRL', 'ZRE', 'DS', 'OS', 'RS', 'GS']).NetAmount;
	var netAmountES = salesSummary.Of('ES').NetAmount;
	var totalSalesNetAmountWithES = (totalSalesNetAmount + netAmountES) || 1;

	if (netAmountES <= ringgitThreshold &&
		netAmountES / totalSalesNetAmountWithES <= percentageThreshold) {
		reclaimableResults.irrpercent = 100;
		reclaimableResults.reclaimabletxre = txre_tax_amount;
	} else {
		reclaimableResults.irrpercent = (totalSalesNetAmount / totalSalesNetAmountWithES) * 100;
		reclaimableResults.reclaimabletxre = txre_tax_amount * (totalSalesNetAmount / totalSalesNetAmountWithES);
	}
	return reclaimableResults;
};


VAT.MY.Report.Data.prototype.GetHeaderData = function() {
	var dataHeader = this.DataHeader;
	dataHeader.StartDate = new Date(dataHeader.StartDate).toString(dataHeader.shortdate);
	dataHeader.EndDate = new Date(dataHeader.EndDate).toString(dataHeader.shortdate);
	return dataHeader;
};

VAT.MY.Report.Data.prototype.GetDrilldownData = function(boxNumber) {
	var _DR = this.DataReader;
	var ds = {};
	var data = [];
	var rgl = [];
	
	if (!this.params.salecacheid) {
	    rgl = this.GetRGLData().details;
	}

	switch (boxNumber) {
		case 'box5a':
			data = _DR.GetSalesDetails(['SR', 'DS']);
			break;
		case 'box5b':
			data = _DR.GetSalesDetails(['SR', 'DS', 'AJS'], 'box5b');
			break;
		case 'box6a':
			data = _DR.GetPurchaseDetails(['TX', 'IM', 'TX-E43', 'TX-RE', 'TX-CAP']);
			break;
		case 'box10':
			data = _DR.GetSalesDetails(['ZRL']);
			break;
		case 'box11':
			data = _DR.GetSalesDetails(['ZRE']);
			break;
		case 'box12':
		    data = _DR.GetSalesDetails(['ES', 'ES43']).concat(rgl);
			break;
		case 'box13':
			data = _DR.GetSalesDetails(['RS']);
			break;
		case 'box14':
			data = _DR.GetPurchaseDetails(['IS']);
			break;
		case 'box16':
			data = _DR.GetPurchaseDetails(['TX-CAP']);
			break;
		case 'box17':
			data = _DR.GetPurchaseDetails(['AJP'], 'box17');
			break;
		case 'box18':
			data = _DR.GetSalesDetails(['AJS'], 'box18');
			break;
		case 'box6b':
			data = _DR.GetPurchaseDetails(['TX', 'IM', 'TX-E43', 'TX-CAP', 'AJP', 'TX-RE'], 'box6b');
			break;
	}
	ds.ReportData = data;
	return ds;
};

// 2018 Data
VAT.MY.Report2018 = VAT.MY.Report2018 || {};
VAT.MY.Report2018.Data = function(params) {
    var _CountryCode = 'MY';
    this.TaxMap = {
            box5b: {id: 'box5b', label: '5b', taxcodelist: [{taxcode: 'SR', available: 'SALE'}, {taxcode: 'DS', available: 'SALE'}, {taxcode: 'AJS', available: 'SALE'}]},
            box6b: {id: 'box6b', label: '6b', taxcodelist: [{taxcode: 'TX', available: 'PURCHASE'}, {taxcode: 'IM', available: 'PURCHASE'}, {taxcode: 'TX-IES', available: 'PURCHASE'},
                                                            {taxcode: 'TX-CG', available: 'PURCHASE'}, {taxcode: 'TX-RE', available: 'PURCHASE'}, {taxcode: 'AJP', available: 'PURCHASE'},
                                                            {taxcode: 'TX-FRS', available: 'PURCHASE'}]},
            box17: {id: 'box17', label: '17', taxcodelist: [{taxcode: 'AJP', available: 'PURCHASE'}]},
            box18: {id: 'box18', label: '18', taxcodelist: [{taxcode: 'AJS', available: 'SALE'}]}
    };
    this.TaxDefinition = {
        TX: function(taxcode) { // 6a, 6b
            return taxcode.CountryCode == _CountryCode && taxcode.IsForPurchase && taxcode.Rate > 0 && taxcode.IsCategoryType('S0', true);
        },
        'TX-RE': function(taxcode) { // 6a, 6b
            return taxcode.CountryCode == _CountryCode && taxcode.IsForPurchase && taxcode.Rate > 0 && taxcode.IsCategoryType('S9');
        },
        IM: function(taxcode) { // 6a, 6b
            return taxcode.CountryCode == _CountryCode && taxcode.IsForPurchase && taxcode.Rate > 0 && taxcode.IsCategoryType('S0', true) && taxcode.IsImport;
        },
        AJP: function(taxcode) { // 6b, 17
            return taxcode.CountryCode == _CountryCode && taxcode.IsForPurchase && taxcode.Rate > 0 && taxcode.IsCategoryType('S5');
        },
        IS: function(taxcode) { // 14, 15
            return taxcode.CountryCode == _CountryCode && taxcode.IsForPurchase && taxcode.Rate == 0 && taxcode.IsCategoryType('S1') && taxcode.IsImport;
        },
        AJS: function(taxcode) { // 5b, 18
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate > 0 && taxcode.IsCategoryType('S7');
        },
        SR: function(taxcode) { // 5a, 5b
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate > 0 && taxcode.IsCategoryType('S0', true);
        },
        DS: function(taxcode) { // 5a, 5b
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate > 0 && taxcode.IsCategoryType('S0', true);
        },
        RS: function(taxcode) { // 13
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S8');
        },
        ES: function(taxcode) { // 12
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S0', true) && taxcode.IsExempt;
        },
        ZRE: function(taxcode) { // 11
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S0', true) && taxcode.IsForExport;
        },
        ZRL: function(taxcode) { // 10
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S0', true) && !taxcode.IsForExport;
        },
        OS: function(taxcode) { // no box, part of TX-RE computation
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S10');
        },
        GS: function(taxcode) { // no box, part of TX-RE computation
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S11');
        },
        'TX-IES': function(taxcode) { // 6a, 6b
            return taxcode.CountryCode == _CountryCode && taxcode.IsForPurchase && taxcode.Rate > 0 && taxcode.IsCategoryType('S4') && taxcode.IsExempt;
        },
        'TX-CG': function(taxcode) { // 6a, 6b, 16
            return taxcode.CountryCode == _CountryCode && taxcode.IsForPurchase && taxcode.Rate > 0 && taxcode.IsCategoryType('S2');
        },
        IES: function(taxcode) { // 12
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S4') && taxcode.IsExempt;
        },
        'TX-FRS': function(taxcode) { // 6a, 5b
            return taxcode.CountryCode == _CountryCode && taxcode.IsForPurchase && taxcode.Rate > 0 && taxcode.IsCategoryType('S13');
        },
        'SRA-RC': function(taxcode) { // 5a, 5b, 6a, 6b
            return taxcode.CountryCode == _CountryCode && taxcode.Rate == 0 && taxcode.IsReverseCharge && taxcode.NotionalRate > 0 && taxcode.IsCategoryType('S16');
        },
        ZDA: function(taxcode) { // 11, reclaimable TX-RE
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S17');
        },
        'SR-JWS': function(taxcode) { // 5a, reclaimable TX-RE
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S19');
        },
        NTX: function(taxcode) { // 10, reclaimable TX-RE
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S21');
        },
        'OS-TXM': function(taxcode) { // reclaimable TX-RE
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S20');
        }
    };
    VAT.MY.BaseData.call(this, params);
};
VAT.MY.Report2018.Data.prototype = Object.create(VAT.MY.BaseData.prototype);

VAT.MY.Report2018.Data.prototype.GetRGLData = function() {
    var rgl = new Tax.RealizedGainLoss().run({
        nexus: new VAT.DAO.NexusDAO().getByCountryCode(this.CountryCode).id,
        subId: this.subId,
        bookId: this.bookId,
        periodFrom: this.periodFrom,
        periodTo: this.periodTo,
        dateFormat: this.DataHeader.shortdate,
        defaults: {
            taxCode: 'IES',
            taxType: 'IES',
        }
    });

    return {
        summary: rgl.getSummary(),
        details: rgl.getDetails()
    };
};

VAT.MY.Report2018.Data.prototype.GetData = function() {
    var _DR = this.DataReader;
    var sales = _DR.GetSalesSummary();
    var purchases = _DR.GetPurchaseSummary();
    var salesadj = _DR.GetSalesAdjustmentSummary(this.TaxMap);
    var purchaseadj = _DR.GetPurchaseAdjustmentSummary(this.TaxMap);
    var rgl = this.GetRGLData().summary;

    var standardGSTrate = 0.06;
    var obj = {};
    var emptyboxes = ['box19b', 'box19c', 'box19d', 'box19e', 'box19others',
                      'box19b_percent', 'box19c_percent', 'box19d_percent', 'box19e_percent', 'box19others_percent'];
    var reclaimableTXREResult = this.GetReclaimableTXRE(sales, purchases.Of('TX-RE').TaxAmount);

    for (var iempty = 0; iempty < emptyboxes.length; iempty++) {
        obj[emptyboxes[iempty]] = 0;
    }
    obj.box5a = sales.Accrue(['SR', 'DS', 'SR-JWS', 'SRA-RC']).NetAmount;
    obj.box5b = sales.Accrue(['SR', 'DS', 'AJS']).TaxAmount + sales.Of('SRA-RC').NotionalAmount +
                salesadj.Accrue('box5b', ['SR', 'DS', 'AJS']).TaxAmount;
    obj.box6a = purchases.Accrue(['TX', 'IM', 'TX-IES', 'TX-RE', 'TX-CG', 'TX-FRS', 'SRA-RC']).NetAmount;
    obj.box10 = sales.Accrue(['ZRL', 'NTX']).NetAmount;
    obj.box11 = sales.Accrue(['ZRE', 'ZDA']).NetAmount;
    obj.box12 = sales.Accrue(['ES', 'IES']).NetAmount + parseFloat(rgl.netAmount || 0);
    obj.box13 = sales.Of('RS').NetAmount;
    obj.box14 = purchases.Of('IS').NetAmount;
    obj.box16 = purchases.Of('TX-CG').NetAmount;
    obj.box17 = purchases.Of('AJP').NetAmount;
    obj.box18 = sales.Of('AJS').NetAmount;
    obj.box6b = purchases.Accrue(['TX', 'IM', 'TX-IES', 'TX-CG', 'AJP', 'TX-FRS']).TaxAmount +
                purchases.Of('SRA-RC').NotionalAmount + reclaimableTXREResult.reclaimabletxre +
                purchaseadj.Accrue('box6b', ['TX', 'IM', 'TX-IES', 'TX-CG', 'TX-RE', 'AJP', 'TX-FRS']).TaxAmount;
    obj.box15 = obj.box14 * standardGSTrate;

    if (obj.box5b > obj.box6b) {
        obj.box7 = obj.box5b - obj.box6b;
        obj.box8 = 0;
    } else {
        obj.box7 = 0;
        obj.box8 = obj.box6b - obj.box5b;
    }

    obj.box19a = obj.box5b;
    obj.box19total = obj.box19a;
    obj.box19a_percent = obj.box19a ? 100 : 0;
    obj.irrpercent = obj.box6b ? reclaimableTXREResult.irrpercent : 0;
    return obj;
};

VAT.MY.Report2018.Data.prototype.GetReclaimableTXRE = function(salesSummary, txre_tax_amount) {
    var reclaimableResults = {
        reclaimabletxre: 0,
        irrpercent: 0
    };
    var ringgitThreshold = 5000;
    var percentageThreshold = 0.05;
    var totalSalesNetAmount = salesSummary.Accrue(['SR', 'ZRL', 'ZRE', 'DS', 'RS', 'GS', 'ZDA', 'OS-TXM', 'NTX']).NetAmount;
    var netAmountES = salesSummary.Of('ES').NetAmount;
    var totalSalesNetAmountWithES = (totalSalesNetAmount + netAmountES) || 1;
    var totalSalesNetAmountWithESAndSRJWS = totalSalesNetAmountWithES + salesSummary.Of('SR-JWS').NetAmount;

    if (netAmountES <= ringgitThreshold && (netAmountES / totalSalesNetAmountWithESAndSRJWS <= percentageThreshold)) {
        reclaimableResults.irrpercent = 100;
        reclaimableResults.reclaimabletxre = txre_tax_amount;
    } else {
        reclaimableResults.irrpercent = (totalSalesNetAmount / totalSalesNetAmountWithES) * 100;
        reclaimableResults.reclaimabletxre = txre_tax_amount * (totalSalesNetAmount / totalSalesNetAmountWithES);
    }
    return reclaimableResults;
};


VAT.MY.Report2018.Data.prototype.GetHeaderData = function() {
    var dataHeader = this.DataHeader;
    dataHeader.StartDate = new Date(dataHeader.StartDate).toString(dataHeader.shortdate);
    dataHeader.EndDate = new Date(dataHeader.EndDate).toString(dataHeader.shortdate);
    return dataHeader;
};

VAT.MY.Report2018.Data.prototype.GetDrilldownData = function(boxNumber) {
    var _DR = this.DataReader;
    var ds = {};
    var data = [];
    var rgl;

    switch (boxNumber) {
        case 'box5a':
            data = _DR.GetSalesDetails(['SR', 'DS', 'SR-JWS', 'SRA-RC']);
            break;
        case 'box5b':
            data = _DR.GetSalesDetails(['SR', 'DS', 'AJS', 'SRA-RC'], 'box5b');
            break;
        case 'box6a':
            data = _DR.GetPurchaseDetails(['TX', 'IM', 'TX-IES', 'TX-RE', 'TX-CG', 'TX-FRS', 'SRA-RC']);
            break;
        case 'box10':
            data = _DR.GetSalesDetails(['ZRL', 'NTX']);
            break;
        case 'box11':
            data = _DR.GetSalesDetails(['ZRE', 'ZDA']);
            break;
        case 'box12':
            rgl = [];
            if (!this.params.saleCacheId) {
                rgl = this.GetRGLData().details;
            }
            data = _DR.GetSalesDetails(['ES', 'IES']).concat(rgl);
            break;
        case 'box13':
            data = _DR.GetSalesDetails(['RS']);
            break;
        case 'box14':
            data = _DR.GetPurchaseDetails(['IS']);
            break;
        case 'box16':
            data = _DR.GetPurchaseDetails(['TX-CG']);
            break;
        case 'box17':
            data = _DR.GetPurchaseDetails(['AJP'], 'box17');
            break;
        case 'box18':
            data = _DR.GetSalesDetails(['AJS'], 'box18');
            break;
        case 'box6b':
            data = _DR.GetPurchaseDetails(['TX', 'IM', 'TX-IES', 'TX-CG', 'AJP', 'TX-RE', 'TX-FRS', 'SRA-RC'], 'box6b');
            break;
    }
    ds.ReportData = data;
    return ds;
};

// June 2018 Data
VAT.MY.Report201806 = VAT.MY.Report201806 || {};
VAT.MY.Report201806.Data = function(params) {
    var _CountryCode = 'MY';
    this.TaxMap = {
            box5b: {id: 'box5b', label: '5b', taxcodelist: [{taxcode: 'SR', available: 'SALE'}, {taxcode: 'DS', available: 'SALE'}, {taxcode: 'ZRL', available: 'SALE'},
            	                                            {taxcode: 'AJS', available: 'SALE'}]},
            box6b: {id: 'box6b', label: '6b', taxcodelist: [{taxcode: 'TX', available: 'PURCHASE'}, {taxcode: 'IM', available: 'PURCHASE'}, {taxcode: 'TX-IES', available: 'PURCHASE'},
                                                            {taxcode: 'TX-CG', available: 'PURCHASE'}, {taxcode: 'TX-RE', available: 'PURCHASE'}, {taxcode: 'AJP', available: 'PURCHASE'},
                                                            {taxcode: 'TX-FRS', available: 'PURCHASE'},{taxcode: 'ZP', available: 'PURCHASE'}]},
            box17: {id: 'box17', label: '17', taxcodelist: [{taxcode: 'AJP', available: 'PURCHASE'}]},
            box18: {id: 'box18', label: '18', taxcodelist: [{taxcode: 'AJS', available: 'SALE'}]}
    };
    this.TaxDefinition = {
        IM: function(taxcode) { // 6a, 6b
            return taxcode.CountryCode == _CountryCode && taxcode.IsForPurchase && taxcode.Rate == 0 && taxcode.IsCategoryType('S0', true) &&
                   taxcode.IsImport;
        },
        TX: function(taxcode) { // 6a, 6b
            return taxcode.CountryCode == _CountryCode && taxcode.IsForPurchase && taxcode.Rate == 0 && taxcode.IsCategoryType('S23');
        },
        ZP: function(taxcode) { // 6a, 6b
            return taxcode.CountryCode == _CountryCode && taxcode.IsForPurchase && taxcode.Rate == 0 && taxcode.IsCategoryType('S23');
        },
        IS: function(taxcode) { // 14, 15
            return taxcode.CountryCode == _CountryCode && taxcode.IsForPurchase && taxcode.Rate == 0 && taxcode.IsCategoryType('S1') && taxcode.IsImport;
        },
        'TX-CG': function(taxcode) { // 6a, 6b, 16
            return taxcode.CountryCode == _CountryCode && taxcode.IsForPurchase && taxcode.Rate == 0 && taxcode.IsCategoryType('S2');
        },
        'TX-IES': function(taxcode) { // 6a, 6b
            return taxcode.CountryCode == _CountryCode && taxcode.IsForPurchase && taxcode.Rate == 0 && taxcode.IsCategoryType('S4') && taxcode.IsExempt;
        },
        AJP: function(taxcode) { // 6b, 17
            return taxcode.CountryCode == _CountryCode && taxcode.IsForPurchase && taxcode.Rate == 0 && taxcode.IsCategoryType('S5');
        },
        'TX-RE': function(taxcode) { // 6a, 6b
            return taxcode.CountryCode == _CountryCode && taxcode.IsForPurchase && taxcode.Rate == 0 && taxcode.IsCategoryType('S9');
        },
        'TX-FRS': function(taxcode) { // 6a, 5b
            return taxcode.CountryCode == _CountryCode && taxcode.IsForPurchase && taxcode.Rate > 0 && taxcode.IsCategoryType('S13');
        },
        'SRA-RC': function(taxcode) { // 5a, 5b, 6a, 6b
            return taxcode.CountryCode == _CountryCode && taxcode.Rate == 0 && taxcode.IsReverseCharge && taxcode.NotionalRate == 0 && taxcode.IsCategoryType('S16');
        },
        SR: function(taxcode) { // 5a, 5b
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S24');
        },
        DS: function(taxcode) { // 5a, 5b
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S25');
        },
        ES: function(taxcode) { // 12
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S0', true) && !taxcode.IsForExport &&
                   taxcode.IsExempt;
        },
        ZRE: function(taxcode) { // 11
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S0', true) && taxcode.IsForExport &&
                   !taxcode.IsExempt;
        },
        ZRL: function(taxcode) { // 10
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S26') && !taxcode.IsForExport;
        },
        IES: function(taxcode) { // 12
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S4') && taxcode.IsExempt;
        },
        AJS: function(taxcode) { // 5b, 18
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S7');
        },
        RS: function(taxcode) { // 13
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S8');
        },
        OS: function(taxcode) { // 15
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S10');
        },
        GS: function(taxcode) { // 15, part of TX-RE computation
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S11');
        },
        ZDA: function(taxcode) { // 11, reclaimable TX-RE
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S17');
        },
        'SR-JWS': function(taxcode) { // 5a, 15, reclaimable TX-RE
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S19');
        },
        'OS-TXM': function(taxcode) { // 15, reclaimable TX-RE
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S20');
        },
        NTX: function(taxcode) { // 10, reclaimable TX-RE
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsCategoryType('S21');
        }
    };
    VAT.MY.BaseData.call(this, params);
};
VAT.MY.Report201806.Data.prototype = Object.create(VAT.MY.BaseData.prototype);

VAT.MY.Report201806.Data.prototype.GetRGLData = function() {
    var rgl = new Tax.RealizedGainLoss().run({
        nexus: new VAT.DAO.NexusDAO().getByCountryCode(this.CountryCode).id,
        subId: this.subId,
        bookId: this.bookId,
        periodFrom: this.periodFrom,
        periodTo: this.periodTo,
        dateFormat: this.DataHeader.shortdate,
        defaults: {
            taxCode: 'IES',
            taxType: 'IES',
        }
    });
    var rglData = {
        summary: rgl.getSummary(),
        details: rgl.getDetails()
    };

    if (!this.IsValidRGLData(rglData)) {
        rglData.summary = {};
        rglData.details = [];
    }

    return rglData;
};

VAT.MY.Report201806.Data.prototype.IsValidRGLData = function(rglData) {
    var result = false;
    if (rglData && rglData.summary && rglData.summary.netAmount > 0) {
        result = true;
    }
    return result;
};

VAT.MY.Report201806.Data.prototype.GetData = function() {
    var _DR = this.DataReader;
    var sales = _DR.GetSalesSummary();
    var purchases = _DR.GetPurchaseSummary();
    var salesadj = _DR.GetSalesAdjustmentSummary(this.TaxMap);
    var purchaseadj = _DR.GetPurchaseAdjustmentSummary(this.TaxMap);
    var rgl = this.GetRGLData().summary;
    var obj = {};
    var emptyboxes = ['box19b', 'box19c', 'box19d', 'box19e', 'box19others',
                      'box19b_percent', 'box19c_percent', 'box19d_percent', 'box19e_percent', 'box19others_percent'];
    var reclaimableTXREResult = this.GetReclaimableTXRE(sales, purchases.Of('TX-RE').TaxAmount);
    var rglNetAmount = parseFloat(rgl.netAmount || 0);

    for (var iempty = 0; iempty < emptyboxes.length; iempty++) {
        obj[emptyboxes[iempty]] = 0;
    }
    obj.box5a = sales.Accrue(['SR', 'DS', 'SRA-RC', 'ZRL']).NetAmount;
    obj.box5b = sales.Accrue(['SR', 'DS', 'ZRL', 'AJS']).TaxAmount + sales.Of('SRA-RC').NotionalAmount +
                salesadj.Accrue('box5b', ['SR', 'DS', 'ZRL', 'AJS']).TaxAmount;
    obj.box6a = purchases.Accrue(['TX', 'IM', 'TX-IES', 'TX-RE', 'TX-CG', 'TX-FRS', 'SRA-RC', 'ZP']).NetAmount;
    obj.box6b = purchases.Accrue(['TX', 'IM', 'TX-IES', 'TX-RE', 'TX-CG', 'TX-FRS', 'ZP', 'AJP']).TaxAmount +
                purchases.Of('SRA-RC').NotionalAmount + reclaimableTXREResult.reclaimabletxre +
                purchaseadj.Accrue('box6b', ['TX', 'IM', 'TX-IES', 'TX-RE', 'TX-CG', 'TX-FRS', 'ZP', 'AJP']).TaxAmount;
    if (obj.box5b > obj.box6b) {
        obj.box7 = obj.box5b - obj.box6b;
        obj.box8 = 0;
    } else {
        obj.box7 = 0;
        obj.box8 = obj.box6b - obj.box5b;
    }
    obj.box10 = 0;
    obj.box11 = sales.Accrue(['ZRE', 'ZDA']).NetAmount;
    obj.box12 = sales.Accrue(['ES', 'IES']).NetAmount + (rglNetAmount > 0 ? rglNetAmount : 0);
    obj.box13 = sales.Of('RS').NetAmount;
    obj.box14 = purchases.Of('IS').NetAmount;
    obj.box15 = sales.Accrue(['GS', 'NTX', 'SR-JWS', 'OS-TXM', 'OS']).NetAmount;
    obj.box16 = purchases.Of('TX-CG').NetAmount;
    obj.box17 = purchases.Of('AJP').NetAmount;
    obj.box18 = sales.Of('AJS').NetAmount;
    obj.box19a = obj.box5b;
    obj.box19total = obj.box19a;
    obj.box19a_percent = obj.box19a ? 100 : 0;
    obj.irrpercent = obj.box6b ? reclaimableTXREResult.irrpercent : 0;

    return obj;
};

VAT.MY.Report201806.Data.prototype.GetReclaimableTXRE = function(salesSummary, txre_tax_amount) {
    var reclaimableResults = {
        reclaimabletxre: 0,
        irrpercent: 0
    };
    var ringgitThreshold = 5000;
    var percentageThreshold = 0.05;
    var totalSalesNetAmount = salesSummary.Accrue(['SR', 'DS', 'ZRL', 'ZRE', 'RS', 'GS', 'ZDA', 'OS-TXM', 'NTX']).NetAmount;
    var netAmountES = salesSummary.Of('ES').NetAmount;
    var totalSalesNetAmountWithES = (totalSalesNetAmount + netAmountES) || 1;
    var totalSalesNetAmountWithESAndSRJWS = totalSalesNetAmountWithES + salesSummary.Of('SR-JWS').NetAmount;

    if (netAmountES <= ringgitThreshold && (netAmountES / totalSalesNetAmountWithESAndSRJWS <= percentageThreshold)) {
        reclaimableResults.irrpercent = 100;
        reclaimableResults.reclaimabletxre = txre_tax_amount;
    } else {
        reclaimableResults.irrpercent = (totalSalesNetAmount / totalSalesNetAmountWithES) * 100;
        reclaimableResults.reclaimabletxre = txre_tax_amount * (totalSalesNetAmount / totalSalesNetAmountWithES);
    }
    return reclaimableResults;
};


VAT.MY.Report201806.Data.prototype.GetHeaderData = function() {
    var dataHeader = this.DataHeader;
    dataHeader.StartDate = new Date(dataHeader.StartDate).toString(dataHeader.shortdate);
    dataHeader.EndDate = new Date(dataHeader.EndDate).toString(dataHeader.shortdate);
    return dataHeader;
};

VAT.MY.Report201806.Data.prototype.GetDrilldownData = function(boxNumber) {
    var _DR = this.DataReader;
    var ds = {};
    var data = [];
    var rglData;
    var rgl;

    switch (boxNumber) {
        case 'box5a':
            data = _DR.GetSalesDetails(['SR', 'DS', 'SRA-RC', 'ZRL']);
            break;
        case 'box5b':
            data = _DR.GetSalesDetails(['SR', 'DS', 'ZRL', 'AJS', 'SRA-RC'], 'box5b');
            break;
        case 'box6a':
            data = _DR.GetPurchaseDetails(['TX', 'IM', 'TX-IES', 'TX-RE', 'TX-CG', 'TX-FRS', 'SRA-RC', 'ZP']);
            break;
        case 'box6b':
            data = _DR.GetPurchaseDetails(['TX', 'IM', 'TX-IES', 'TX-RE', 'TX-CG', 'TX-FRS', 'ZP', 'AJP', 'SRA-RC'], 'box6b');
            break;
        case 'box10':
            data = [];
            break;
        case 'box11':
            data = _DR.GetSalesDetails(['ZRE', 'ZDA']);
            break;
        case 'box12':
            rgl = [];
            if (!this.params.saleCacheId) {
                rgl = this.GetRGLData().details;
            }
            data = _DR.GetSalesDetails(['ES', 'IES']).concat(rgl);
            break;
        case 'box13':
            data = _DR.GetSalesDetails(['RS']);
            break;
        case 'box14':
            data = _DR.GetPurchaseDetails(['IS']);
            break;
        case 'box15':
            data = _DR.GetSalesDetails(['GS', 'NTX', 'SR-JWS', 'OS-TXM', 'OS']);
            break;
        case 'box16':
            data = _DR.GetPurchaseDetails(['TX-CG']);
            break;
        case 'box17':
            data = _DR.GetPurchaseDetails(['AJP'], 'box17');
            break;
        case 'box18':
            data = _DR.GetSalesDetails(['AJS'], 'box18');
            break;
    }
    ds.ReportData = data;

    return ds;
};

//SST Data
VAT.MY.SSTSalesReport = VAT.MY.SSTSalesReport || {};
VAT.MY.SSTSalesReport.Data = function(params) {
    var _CountryCode = 'MY';
    this.TaxMap = {
            box11a_tax: {id: 'box11a_tax', label: '11a', 
            	taxcodelist: [{taxcode: 'SLS-MY 5', available: 'SALE'}]},
            box11b_tax: {id: 'box11b_tax', label: '11b', 
            	taxcodelist: [{taxcode: 'SLS-MY 10', available: 'SALE'}]},
    };
    this.TaxDefinition = {
        'SLS-MY 5': function(taxcode) { // 11a
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 5 && 
            		!taxcode.IsService && !taxcode.IsExempt;
        },
        'SLS-MY 10': function(taxcode) { // 11b
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate > 5 && 
            		!taxcode.IsService && !taxcode.IsExempt;
        },
        'SLS-MY 0': function(taxcode) { // 
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate == 0 && taxcode.IsExempt;
        },
    };
    VAT.MY.BaseData.call(this, params);
};
VAT.MY.SSTSalesReport.Data.prototype = Object.create(VAT.MY.BaseData.prototype);

VAT.MY.SSTSalesReport.Data.prototype.GetData = function() {
    var _DR = this.DataReader;
    var sales = _DR.GetSalesSummary();
    var salesadj = _DR.GetSalesAdjustmentSummary(this.TaxMap);
    var obj = {};
    var emptyboxes = ['box11c_tax', 'box11c_net', 'box11dunit', 'box11dtax',
    					'box13a', 'box13b', 'box13c', 'box13_a',  
                      'box15','box17ltrrate','box17ltrnum', 
                      'box17ltrsales', 'box17ltrpay', 'box17kgrate', 'box17kgnum', 'box17kgsales',
                      'box17kgpay','box17advolsales', 'box17advolpay', 'box17',
						'box18a', 'box18b1', 'box18b2', 'box18b3i', 'box18c', 
                      'box18b3ii', 'box18b3iii', 'box19', 'box20', 'box21'];
    
    var emptywholenumboxes = ['box15rate'];

    for (var iempty = 0; iempty < emptyboxes.length; iempty++) {
        obj[emptyboxes[iempty]] = 0;
    }
    
    for (var indx = 0; indx < emptywholenumboxes.length; indx++) {
    	obj[emptywholenumboxes[indx]] = parseInt(0);
    }
    
    obj.box11a_tax = sales.Accrue(['SLS-MY 5']).TaxAmount + salesadj.Accrue('box11a_tax',['SLS-MY 5']).TaxAmount;
    obj.box11b_tax = sales.Accrue(['SLS-MY 10']).TaxAmount  + salesadj.Accrue('box11b_tax',['SLS-MY 10']).TaxAmount;
    obj.box11a_net = sales.Accrue(['SLS-MY 5']).NetAmount + salesadj.Accrue('box11a_tax',['SLS-MY 5']).NetAmount;
    obj.box11b_net = sales.Accrue(['SLS-MY 10']).NetAmount + salesadj.Accrue('box11b_tax',['SLS-MY 10']).NetAmount;
    obj.box12 = obj.box11a_tax + obj.box11b_tax;   
    
    obj.box14 = obj.box12 - obj.box13a - obj.box13b - obj.box13_a;
    obj.box16 = obj.box14 + obj.box15;

    return obj;
};

VAT.MY.SSTSalesReport.Data.prototype.GetHeaderData = function() {
    var dataHeader = this.DataHeader;
    dataHeader.company = dataHeader.legalname || dataHeader.company;
    dataHeader.StartDate = new Date(dataHeader.StartDate).toString(dataHeader.shortdate);
    dataHeader.EndDate = new Date(dataHeader.EndDate).toString(dataHeader.shortdate);
    return dataHeader;
};

VAT.MY.SSTSalesReport.Data.prototype.GetDrilldownData = function(boxNumber) {
    var _DR = this.DataReader;
    var ds = {};
    var data = [];
    this.SALE_FILTER = ["INV", "RCPT", "GENJRNL"];
    
    switch (boxNumber) {
        case 'box11a_tax':	//intentional fall through
        case 'box11a_net':	
            data = _DR.GetSalesDetails(['SLS-MY 5'],'box11a_tax',this.SALE_FILTER);
            break;
        case 'box11b_tax':	//intentional fall through
        case 'box11b_net':	
            data = _DR.GetSalesDetails(['SLS-MY 10'],'box11b_tax',this.SALE_FILTER);
            break;
    }
    ds.ReportData = data;
    
    return ds;
};

VAT.MY.SSTServicesReport = VAT.MY.SSTServicesReport || {};
VAT.MY.SSTServicesReport.Data = function(params) {
    var _CountryCode = 'MY';
    this.TaxMap = {
            box11c_tax: {id: 'box11c_tax', label: '11c', taxcodelist: [{taxcode: 'SVC-MY 6', available: 'SALE'}]}
    };
    this.TaxDefinition = {
        'SVC-MY 6': function(taxcode) { // 11c
            return taxcode.CountryCode == _CountryCode && taxcode.IsForSales && taxcode.Rate > 0 && taxcode.IsService;
        },
    };
    VAT.MY.BaseData.call(this, params);
};
VAT.MY.SSTServicesReport.Data.prototype = Object.create(VAT.MY.BaseData.prototype);

VAT.MY.SSTServicesReport.Data.prototype.GetData = function() {
    var _DR = this.DataReader;
    var sales = _DR.GetSalesSummary();
    var salesadj = _DR.GetSalesAdjustmentSummary(this.TaxMap);
    var obj = {};
	
    var emptyboxes = ['box11a_tax', 'box11a_net', 'box11b_tax', 'box11b_net', 
                      'box11dunit', 'box11dtax', 'box15', 'box15rate', 
                      'box13a', 'box13b', 'box13c', 'box13_a',
                      'box17ltrrate','box17ltrnum', 
                      'box17ltrsales', 'box17ltrpay', 'box17kgrate', 'box17kgnum', 'box17kgsales',
                      'box17kgpay','box17advolsales', 'box17advolpay', 'box17',
                      'box18a', 'box18b1', 'box18b2', 'box18b3i', 'box18c',
                      'box18b3ii', 'box18b3iii', 'box19', 'box20', 'box21'];

    for (var iempty = 0; iempty < emptyboxes.length; iempty++) {
        obj[emptyboxes[iempty]] = 0;
    }
    obj.box11c_net = sales.Accrue(['SVC-MY 6']).NetAmount + salesadj.Accrue('box11c_tax',['SVC-MY 6']).NetAmount;
    obj.box11c_tax = sales.Accrue(['SVC-MY 6']).TaxAmount + salesadj.Accrue('box11c_tax',['SVC-MY 6']).TaxAmount;
    obj.box12 = obj.box11c_tax + obj.box11dtax;   
    obj.box14 = obj.box12 - obj.box13a - obj.box13c;
    obj.box16 = obj.box14 + obj.box15;

    return obj;
};

VAT.MY.SSTServicesReport.Data.prototype.GetHeaderData = function() {
    var dataHeader = this.DataHeader;
    dataHeader.company = dataHeader.legalname || dataHeader.company;
    dataHeader.StartDate = new Date(dataHeader.StartDate).toString(dataHeader.shortdate);
    dataHeader.EndDate = new Date(dataHeader.EndDate).toString(dataHeader.shortdate);
    return dataHeader;
};

VAT.MY.SSTServicesReport.Data.prototype.GetDrilldownData = function(boxNumber) {
    var _DR = this.DataReader;
    var ds = {};
    var data = [];
    this.SALE_FILTER = ["INV", "RCPT", "GENJRNL"];

    switch (boxNumber) {
        case 'box11c_tax':	//intentional fall through
        case 'box11c_net':	
            data = _DR.GetSalesDetails(['SVC-MY 6'], 'box11c_tax');
            break;
    }
    ds.ReportData = data;

    return ds;
};

// Base Report
VAT.MY.BaseReport = function() {
	this.isNewFramework = true;
	this.CountryCode = 'MY';
	this.Type = 'VAT';
	VAT.Report.call(this);
};
VAT.MY.BaseReport.prototype = Object.create(VAT.Report.prototype);

// Old Report
VAT.MY.ENG.Report = function() {
	this.LanguageCode = 'ENG';
	this.ReportType = 'Report';
	this.metadata = {
		template: {'pdf': 'VAT_PDF_MY_ENG', 'html': 'VAT_HTML_MY_ENG'}
	};
	this.ClassName = 'VAT.MY.ENG.Report';
	this.Name = 'Malaysia (English)';
	this.ReportName = 'GST Tax Return';
	this.isAdjustable = true;
	VAT.MY.BaseReport.call(this);
};
VAT.MY.ENG.Report.prototype = Object.create(VAT.MY.BaseReport.prototype);

VAT.MY.MAY.Report = function() {
	this.LanguageCode = 'MAY';
	this.ReportType = 'Report';
	this.metadata = {
		template: {'pdf': 'VAT_PDF_MY_MAY', 'html': 'VAT_HTML_MY_MAY'}
	};
	this.ClassName = 'VAT.MY.MAY.Report';
	this.Name = 'Malaysia (Bahasa Malaysia)';
	this.ReportName = 'GST Tax Return';
	this.isAdjustable = true;
	VAT.MY.BaseReport.call(this);
};
VAT.MY.MAY.Report.prototype = Object.create(VAT.MY.BaseReport.prototype);

// 2018 Report
VAT.MY.ENG.Report2018 = function() {
    this.LanguageCode = 'ENG';
    this.ReportType = 'Report2018';
    this.Subtype = 'Ver2018';
    this.metadata = {
        template: {'pdf': 'VAT_PDF_MY_ENG', 'html': 'VAT_HTML_MY_ENG'}
    };
    this.ClassName = 'VAT.MY.ENG.Report2018';
    this.Name = 'Malaysia (English) 2018';
    this.ReportName = 'GST Tax Return';
    this.isAdjustable = true;
    VAT.MY.BaseReport.call(this);
};
VAT.MY.ENG.Report2018.prototype = Object.create(VAT.MY.BaseReport.prototype);

VAT.MY.MAY.Report2018 = function() {
    this.LanguageCode = 'MAY';
    this.ReportType = 'Report2018';
    this.Subtype = 'Ver2018';
    this.metadata = {
        template: {'pdf': 'VAT_PDF_MY_MAY', 'html': 'VAT_HTML_MY_MAY'}
    };
    this.ClassName = 'VAT.MY.MAY.Report2018';
    this.Name = 'Malaysia (Bahasa Malaysia) 2018';
    this.ReportName = 'GST Tax Return';
    this.isAdjustable = true;
    VAT.MY.BaseReport.call(this);
};
VAT.MY.MAY.Report2018.prototype = Object.create(VAT.MY.BaseReport.prototype);

// June 2018 Report
VAT.MY.ENG.Report201806 = function() {
    this.LanguageCode = 'ENG';
    this.ReportType = 'Report201806';
    this.Subtype = 'Ver201806';
    this.metadata = {
        template: {'pdf': 'VAT_PDF_MY_ENG_201806', 'html': 'VAT_HTML_MY_ENG_201806'}
    };
    this.ClassName = 'VAT.MY.ENG.Report201806';
    this.Name = 'Malaysia (English) 06/2018';
    this.ReportName = 'GST Tax Return';
    this.isAdjustable = true;
    VAT.MY.BaseReport.call(this);
};
VAT.MY.ENG.Report201806.prototype = Object.create(VAT.MY.BaseReport.prototype);

VAT.MY.MAY.Report201806 = function() {
    this.LanguageCode = 'MAY';
    this.ReportType = 'Report201806';
    this.Subtype = 'Ver201806';
    this.metadata = {
        template: {'pdf': 'VAT_PDF_MY_MAY_201806', 'html': 'VAT_HTML_MY_MAY_201806'}
    };
    this.ClassName = 'VAT.MY.MAY.Report201806';
    this.Name = 'Malaysia (Bahasa Malaysia) 06/2018';
    this.ReportName = 'GST Tax Return';
    this.isAdjustable = true;
    VAT.MY.BaseReport.call(this);
};
VAT.MY.MAY.Report201806.prototype = Object.create(VAT.MY.BaseReport.prototype);

// SST Report 2018
VAT.MY.ENG.SSTSalesReport = function() {
    this.LanguageCode = 'ENG';
    this.ReportType = 'SSTSalesReport';
    this.Subtype = 'SalesReport';
    this.metadata = {
        template: {'pdf': 'VAT_PDF_MY_SST_SALES', 'html': 'VAT_HTML_MY_SST_SALES'}
    };
    this.ClassName = 'VAT.MY.ENG.SSTSalesReport';
    this.Name = 'Malaysia Sales Tax (SST-02)';
    this.ReportName = 'Malaysia Sales Tax (SST-02)';
    this.isAdjustable = true;
    VAT.MY.BaseReport.call(this);
    
};
VAT.MY.ENG.SSTSalesReport.prototype = Object.create(VAT.MY.BaseReport.prototype);

//Service Report
VAT.MY.ENG.SSTServicesReport = function() {
    this.LanguageCode = 'ENG';
    this.ReportType = 'SSTServicesReport';
    this.Subtype = 'ServicesReport';
    this.metadata = {
        template: {'pdf': 'VAT_PDF_MY_SST_SERVICES', 'html': 'VAT_HTML_MY_SST_SERVICES'}
    };
    this.ClassName = 'VAT.MY.ENG.SSTServicesReport';
    this.Name = 'Malaysia Service Tax (SST-02)';
    this.ReportName = 'Malaysia Service Tax (SST-02)';
    this.isAdjustable = true;
    VAT.MY.BaseReport.call(this);
    
};
VAT.MY.ENG.SSTServicesReport.prototype = Object.create(VAT.MY.BaseReport.prototype);