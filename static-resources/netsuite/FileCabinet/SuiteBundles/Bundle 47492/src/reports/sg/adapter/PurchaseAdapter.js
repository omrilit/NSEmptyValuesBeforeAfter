/**
 * Copyright © 2014, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.SG = TAF.SG || {};
TAF.SG.Adapter = TAF.SG.Adapter || {};

TAF.SG.Adapter.PurchaseSummary = function _PurchaseSummary() {
	var summary = {
		purchaseTotalSGD : '',
		gstTotalSGD : '',
		transactionCountTotal : ''
	};
	return summary;
};

TAF.SG.Adapter.Purchase = function _Purchase() {
	var purchase = {
		supplierName : '',
		supplierUEN : '',
		invoiceDate : '',
		invoiceNo : '',
		permitNo : '',
		lineNo : '',
		productDescription : '',
		purchaseValueSGD : '',
		gstValueSGD : '',
		taxCode : '',
		fcyCode : '',
		purchaseFCY : '',
		gstFCY : ''
	};
	return purchase;
};

TAF.SG.Adapter.PurchaseAdapter = function _PurchaseAdapter(params, state) {
	this.DEFAULT = {
		ISO_CURRENCY : 'XXX',
		DATE : '12/31/9999'
	};

	this.isMultibook = params.isMultibook;
	this.isMulticurrency = params.isMulticurrency;
	this.baseCurrency = params.baseCurrency;
	this.currencyMap = params.currencyMap;
	this.taxCodeCache = params.taxCodeCache;

    if (VAT && VAT.SG) {
        this.taxCodeDef = new SFC.TaxCodes.Definitions(VAT.SG);
    }

	if (state) {
		this.state = state;
	} else {
		this.state = {
			tranId : -1,
			lineNo: 0
		};
	}
};

TAF.SG.Adapter.PurchaseAdapter.prototype.convertPurchaseSummary = function _convertPurchaseSummary(searchObj) {
	var summary = new TAF.SG.Adapter.PurchaseSummary();
	
	try {
		summary.purchaseTotalSGD = searchObj.netAmountSum || 0;
		summary.gstTotalSGD = -parseFloat(searchObj.taxAmountSum || 0);
		summary.transactionCountTotal = searchObj.formulaLineCount || 0;
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.SG.Adapter.PurchaseAdapter', ex.toString());
	}
	
	return summary;
};

TAF.SG.Adapter.PurchaseAdapter.prototype.convertPurchase = function _convertPurchase(searchObj) {
	var purchase = new TAF.SG.Adapter.Purchase();
	try {
		purchase.supplierName = searchObj.mainName || searchObj.entity || searchObj.vendorLineEntityId || '';
		purchase.supplierUEN = searchObj.sgUen || searchObj.vendorLineUen || '';
		purchase.invoiceDate = searchObj.sgInvoiceDate || searchObj.tranDate || this.DEFAULT.DATE;
		purchase.invoiceNo = searchObj.number || '';
		purchase.permitNo = searchObj.sgImportPermitNumber || '';
		purchase.productDescription = searchObj.item || searchObj.account || '';

		this.setTaxDetails(purchase, searchObj);
		this.setLineNo(purchase, searchObj);
		this.setAmounts(purchase, searchObj);

	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.SG.Adapter.PurchaseAdapter', ex.toString());
	}
	return purchase;
};

TAF.SG.Adapter.PurchaseAdapter.prototype.setTaxDetails = function _setTaxDetails(purchase, searchObj) {
    var taxCode = this.taxCodeCache[searchObj.taxCodeId];
    
    if (!taxCode) {
        return;
    }

    purchase.taxCode = taxCode.Name;
    if (taxCode.IsReverseCharge && taxCode.Parent && taxCode.IsPostNotional) {
        var parentTaxCode = this.taxCodeCache[taxCode.Parent];
        purchase.taxRate = parentTaxCode && parentTaxCode.Rate;
        purchase.isReverseCharge = true;
    } else {
        purchase.taxRate = taxCode.Rate;
    }
};

TAF.SG.Adapter.PurchaseAdapter.prototype.setLineNo = function _setLineNo(purchase, searchObj) {
    if (this.state.tranId == searchObj.id) {
        purchase.lineNo = ++this.state.lineNo;
    } else {
        this.state.tranId = searchObj.id;
        this.state.lineNo = 1;
        purchase.lineNo = this.state.lineNo;
    }
};

TAF.SG.Adapter.PurchaseAdapter.prototype.setAmounts = function _setAmounts(purchase, searchObj) {
    var taxRate = (parseFloat(purchase.taxRate) || 0) / 100;
    this.setSGDValues(purchase, searchObj, taxRate);
    this.setFCYValues(purchase, searchObj, taxRate);
};

TAF.SG.Adapter.PurchaseAdapter.prototype.setSGDValues = function _setSGDValues(purchase, searchObj, taxRate) {
    purchase.purchaseValueSGD = searchObj.netAmount;
    if (this.isMultibook || purchase.isReverseCharge) {
        purchase.gstValueSGD = searchObj.netAmount * taxRate;
    } else {
        purchase.gstValueSGD = -parseFloat(searchObj.taxAmount) || 0;
    }
};

TAF.SG.Adapter.PurchaseAdapter.prototype.setFCYValues = function _setFCYValues(purchase, searchObj, taxRate) {
    if ((!this.isMulticurrency) || (this.baseCurrency == searchObj.currency)) {
        purchase.fcyCode = this.DEFAULT.ISO_CURRENCY;
        purchase.purchaseFCY = 0;
        purchase.gstFCY = 0;
    } else {
        purchase.purchaseFCY = searchObj.fxAmount;
        purchase.gstFCY = purchase.purchaseFCY * taxRate;
        purchase.fcyCode = this.currencyMap[searchObj.currency] || '';
    }
};

TAF.SG.Adapter.PurchaseAdapter.prototype.convertPurchaseSummaryData = function _convertPurchaseSummaryData(searchObj) {
    if(!searchObj) {
        throw nlapiCreateError('MISSING_PARAMETER', 'searchObj is required');
    }
    var purchaseSummaryData = {};

    this.setTaxDetails(purchaseSummaryData, searchObj);
    var taxRate = (parseFloat(purchaseSummaryData.taxRate) || 0) / 100;
    this.setSGDValues(purchaseSummaryData, searchObj, taxRate);

    return purchaseSummaryData;
};

TAF.SG.Adapter.PurchaseAdapter.prototype.isValidPurchaseLine = function _isValidPurchaseLine(searchObj) {
    var isValid = true;
    var taxCode = this.taxCodeCache[searchObj.taxCodeId];

    if (!taxCode) {
        isValid = false;
    } else if (taxCode.IsReverseCharge && searchObj.recordType !== 'journalentry') {
        isValid = (this.taxCodeDef.GetTypeOf(taxCode) === 'TXCA' || this.taxCodeDef.GetTypeOf(taxCode) === 'SRRC');
    }

    return isValid;
};
