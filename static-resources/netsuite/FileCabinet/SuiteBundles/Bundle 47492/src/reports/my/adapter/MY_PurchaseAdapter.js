/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.MY = TAF.MY || {};
TAF.MY.Adapter = TAF.MY.Adapter || {};

TAF.MY.Adapter.Purchase = function _Purchase() {
	var purchase = {
		supplierName : '',
		supplierBRN : '',
		invoiceDate : '',
		invoiceNo : '',
		importDeclarationNo : '',
		lineNo : '',
		productDescription : '',
		purchaseValueMYR : 0,
		gstValueMYR : 0,
		taxCode : '',
		fcyCode : '',
		purchaseFCY : 0,
		gstFCY : 0
	};
	return purchase;
};

TAF.MY.Adapter.PurchaseAdapter = function _PurchaseAdapter(params, state) {
	
	if (!params) {
		throw nlapiCreateError('MISSING_PARAMETER', 'params is null or undefined.');
		nlapiLogExecution('ERROR', 'TAF.MY.Adapter.PurchaseAdapter MISSING_PARAMETER', 'params is null or undefined.');
	}
	
	if (typeof(params.totals) == undefined || params.totals == null) {
		throw nlapiCreateError('MISSING_PARAMETER', 'totals parameter is null or undefined.');
		nlapiLogExecution('ERROR', 'TAF.MY.Adapter.PurchaseAdapter MISSING_PARAMETER', 'totals parameter is null or undefined.');
	}
	
	if (typeof(params.isMultiCurrency) == undefined || params.isMultiCurrency == null) {
		throw nlapiCreateError('MISSING_PARAMETER', 'isMultiCurrency parameter is null or undefined.');
		nlapiLogExecution('ERROR', 'TAF.MY.Adapter.PurchaseAdapter MISSING_PARAMETER', 'isMultiCurrency parameter is null or undefined.');
	}
	
	if (typeof(params.baseCurrency) == undefined || params.baseCurrency == null) {
		throw nlapiCreateError('MISSING_PARAMETER', 'baseCurrency parameter is null or undefined.');
		nlapiLogExecution('ERROR', 'TAF.MY.Adapter.PurchaseAdapter MISSING_PARAMETER', 'baseCurrency parameter is null or undefined.');
	}
	
	if (typeof(params.currencyMap) == undefined || params.currencyMap == null) {
		throw nlapiCreateError('MISSING_PARAMETER', 'currencyMap parameter is null or undefined.');
		nlapiLogExecution('ERROR', 'TAF.MY.Adapter.PurchaseAdapter MISSING_PARAMETER', 'currencyMap parameter is null or undefined.');
	}
	
	this.DEFAULT = {
		ISO_CURRENCY : 'XXX',
		DATE : '12/31/9999'
	};

	this.totals = params.totals;
	this.isMultiCurrency = params.isMultiCurrency;
	this.isMultiBook = params.isMultiBook;
	this.bookId = params.bookId;
	this.baseCurrency = params.baseCurrency;
	this.currencyMap = params.currencyMap;
	if (state) {
		this.state = state;
	} else {
		this.state = {
			tranId : -1,
			lineNo: 0
		};
	}
};

TAF.MY.Adapter.PurchaseAdapter.prototype.getPurchase = function _getPurchase(searchObj) {
	
	if (!searchObj) {
		throw nlapiCreateError('MISSING_PARAMETER', 'searchObj is null or undefined.');
		nlapiLogExecution('ERROR', 'TAF.MY.Adapter.PurchaseAdapter.getPurchase MISSING_PARAMETER', 'searchObj is null or undefined.');
	}

	try {
		var purchase = new TAF.MY.Adapter.Purchase();
        var bookExchangeRate = (searchObj.bookExchangeRate != searchObj.exchangeRate) ? parseFloat(searchObj.bookExchangeRate) : 1;
        var exchangeRate = parseFloat(searchObj.exchangeRate) || 1;
        var foreignValues = this.getForeignValues(searchObj, exchangeRate);

        purchase.fcyCode = foreignValues.fcyCode;
        purchase.purchaseFCY = foreignValues.purchaseFCY;
        purchase.gstFCY = foreignValues.gstFCY;
		purchase.supplierName = searchObj.mainName || searchObj.entity || '';
		purchase.supplierBRN = searchObj.myBrn || '';
		purchase.invoiceDate = searchObj.tranDate || this.DEFAULT.DATE;
		purchase.invoiceNo = searchObj.tranId || searchObj.transactionNumber || '';
		purchase.importDeclarationNo = searchObj.myImportDeclarationNumber || '';
		purchase.productDescription = searchObj.memo || searchObj.item || searchObj.account || '';
		purchase.taxCode = searchObj.taxCode || '';
        purchase.purchaseValueMYR = parseFloat(searchObj.netAmount) || 0;

        purchase.gstValueMYR = (-parseFloat(searchObj.taxAmount) || 0) * bookExchangeRate;
        if (this.isMultiCurrency && this.baseCurrency == searchObj.currency && searchObj.exchangeRate != 1) {
            purchase.gstValueMYR /= exchangeRate;
        }

		if (this.state.tranId == searchObj.id) {
			purchase.lineNo = ++this.state.lineNo;
		} else {
			this.state.tranId = searchObj.id;
			this.state.lineNo = 1;
			purchase.lineNo = this.state.lineNo;
		}
		
		this.updateTotalAmounts({purchaseAmount: purchase.purchaseValueMYR, purchaseGstAmount: purchase.gstValueMYR});
	} catch (ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution('ERROR', 'TAF.MY.Adapter.PurchaseAdapter', errorMsg);
		var errorCode = ex.getCode != null ? ex.getCode() : 'ERROR';
		var errorDetails = ex.getDetails != null ? ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		throw nlapiCreateError(errorCode, errorDetails);
	}

	return purchase;
};

TAF.MY.Adapter.PurchaseAdapter.prototype.getForeignValues = function _getForeignValues(searchObj, exchangeRate) {
    var foreignValues = {
        fcyCode: this.DEFAULT.ISO_CURRENCY,
        purchaseFCY: 0,
        gstFCY: 0
    };

    if (this.isMultiCurrency && this.baseCurrency != searchObj.currency) {
        foreignValues.fcyCode = this.currencyMap[searchObj.currency].symbol;
        foreignValues.purchaseFCY = parseFloat(searchObj.fxAmount) || 0;
        foreignValues.gstFCY = (-parseFloat(searchObj.taxAmount) || 0) / exchangeRate;
    }

    return foreignValues;
};

TAF.MY.Adapter.PurchaseAdapter.prototype.updateTotalAmounts = function _updateTotalAmounts(params) {
	
	if (!params) {
		throw nlapiCreateError('MISSING_PARAMETER', 'params is null or undefined.');
		nlapiLogExecution('ERROR', 'TAF.MY.Adapter.PurchaseAdapter.updateTotalAmounts MISSING_PARAMETER', 'params is null or undefined.');
	}
	
	if (typeof(params.purchaseAmountparams) == undefined || params.purchaseAmount == null) {
		throw nlapiCreateError('MISSING_PARAMETER', 'purchaseAmount is null or undefined.');
		nlapiLogExecution('ERROR', 'TAF.MY.Adapter.PurchaseAdapter.updateTotalAmounts MISSING_PARAMETER', 'purchaseAmount is null or undefined.');
	}
	
	if (typeof(params.purchaseGstAmount) == undefined || params.purchaseGstAmount == null) {
		throw nlapiCreateError('MISSING_PARAMETER', 'purchaseGstAmount is null or undefined.');
		nlapiLogExecution('ERROR', 'TAF.MY.Adapter.PurchaseAdapter.updateTotalAmounts MISSING_PARAMETER', 'purchaseGstAmount is null or undefined.');
	}
	
    this.totals.purchaseLines++;
    this.totals.purchaseTotalAmount += parseFloat(params.purchaseAmount);
    this.totals.purchaseGstTotalAmount += parseFloat(params.purchaseGstAmount);
};

