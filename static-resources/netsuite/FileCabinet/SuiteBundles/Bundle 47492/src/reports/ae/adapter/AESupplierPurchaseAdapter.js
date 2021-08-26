/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.AE = TAF.AE || {};
TAF.AE.Adapter = TAF.AE.Adapter || {};

TAF.AE.Adapter.PurchaseSummary = function _PurchaseSummary() {
	var summary = {
		purchaseTotalAED : '',
		vatTotalAED : '',
		transactionCountTotal : ''
	};
	return summary;
};

TAF.AE.Adapter.Purchase = function _Purchase() {
	var purchase = {
		supplierName : '',
		supplierCountry: '',
		supplierTRN : '',
		invoiceDate : '',
		invoiceNo : '',
		permitNo : '',
		glNumber: '',
		lineNo : '',
		productDescription : '',
		purchaseValueAED : '',
		vatValueAED : '',
		taxCode : '',
		fcyCode : '',
		purchaseFCY : '',
		vatFCY : ''
	};
	return purchase;
};

TAF.AE.Adapter.PurchaseAdapter = function _PurchaseAdapter(params, state) {
	TAF.AE.Adapter.AETransactionAdapter.apply(this, arguments);
};
TAF.AE.Adapter.PurchaseAdapter.prototype = Object.create(TAF.AE.Adapter.AETransactionAdapter.prototype);

TAF.AE.Adapter.PurchaseAdapter.prototype.convertPurchaseSummary = function _convertPurchaseSummary(searchObj) {
	var summary = new TAF.AE.Adapter.PurchaseSummary();
	
	try {
		summary.purchaseTotalAED = searchObj.netAmountSum || 0;
		summary.vatTotalAED = -parseFloat(searchObj.taxAmountSum || 0);
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.AE.Adapter.PurchaseAdapter.convertPurchaseSummary', ex.toString());
	}
	
	return summary;
};

TAF.AE.Adapter.PurchaseAdapter.prototype.convertPurchase = function _convertPurchase(searchObj) {
	var purchase = new TAF.AE.Adapter.Purchase();
	try {
		purchase.supplierName = searchObj.mainName || searchObj.entity || searchObj.vendorLineEntityId || '';
		purchase.supplierCountry = searchObj.aeEmirate || '';
		purchase.supplierTRN = this.getVATNo(searchObj.aeTrn || searchObj.vendorLineTrn) || '';
		purchase.invoiceDate = searchObj.aeInvoiceDate || searchObj.tranDate || this.DEFAULT.DATE;
		purchase.invoiceNo = searchObj.number || '';
		purchase.permitNo = searchObj.aeImportPermitNumber || '';
		purchase.glNumber = searchObj.glNumber || '';
		purchase.productDescription = searchObj.item || searchObj.localizedName.trim() || searchObj.account || '';

		this.setTaxDetails(purchase, searchObj);
		this.setLineNo(purchase, searchObj);
		this.setAmounts(purchase, searchObj);

	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.AE.Adapter.PurchaseAdapter.convertPurchase', ex.toString());
	}
	return purchase;
};

TAF.AE.Adapter.PurchaseAdapter.prototype.setAEDValues = function _setAEDValues(purchase, searchObj, taxRate) {
    purchase.purchaseValueAED = searchObj.netAmount;
    if (this.isMultibook || purchase.isReverseCharge) {
        purchase.vatValueAED = searchObj.netAmount * taxRate;
    } else {
        purchase.vatValueAED = -parseFloat(searchObj.taxAmount) || 0;
    }
};

TAF.AE.Adapter.PurchaseAdapter.prototype.setFCYValues = function _setFCYValues(purchase, searchObj, taxRate) {
    if ((!this.isMulticurrency) || (this.baseCurrency == searchObj.currency)) {
        purchase.fcyCode = this.DEFAULT.ISO_CURRENCY;
        purchase.purchaseFCY = 0;
        purchase.vatFCY = 0;
    } else {
        purchase.purchaseFCY = searchObj.fxAmount;
        purchase.vatFCY = purchase.purchaseFCY * taxRate;
        purchase.fcyCode = this.currencyMap[searchObj.currency] || '';
    }
};

TAF.AE.Adapter.PurchaseAdapter.prototype.isValidPurchaseLine = function _isValidPurchaseLine(searchObj) {
    var isValid = true;
    var taxCode = this.taxCodeCache[searchObj.taxItemId];

    if (!taxCode) {
        isValid = false;
    }

    return isValid;
};