/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.AE = TAF.AE || {};
TAF.AE.Adapter = TAF.AE.Adapter || {};

TAF.AE.Adapter.CustomerSupplySummary = function _CustomerSupplySummary() {
    return {
        supplyTotalAED : '',
        vatTotalAED : '',
        transactionCountTotal : ''
    };
};

TAF.AE.Adapter.CustomerSupply = function _CustomerSupply() {
    return {
        customerName : '',
        customerCountry: '',
        customerTRN : '',
        invoiceDate : '',
        invoiceNo : '',
        glNumber: '',
        lineNo : '',
        productDescription : '',
        supplyValueAED : '',
        vatValueAED : '',
        taxCode : '',
        country : '',
        fcyCode : '',
        supplyFCY : '',
        vatFCY : '',
        taxRate : ''
    };
};

TAF.AE.Adapter.CustomerSupplyAdapter = function _CustomerSupplyAdapter(params, state) {
	TAF.AE.Adapter.AETransactionAdapter.apply(this, arguments);

    this.accounts = params.accounts;
    this.salesAccountTypes = params.salesAccountTypes;
    this.purchaseAccountTypes = params.purchaseAccountTypes;
    this.taxCodeCache = params.taxCodeCache;
    this.CUSTOMER_ACCOUNTING_TXNS = ['vendorbill', 'vendorcredit', 'check', 'journalentry', 'creditcardcharge', 'creditcardrefund'];
};
TAF.AE.Adapter.CustomerSupplyAdapter.prototype = Object.create(TAF.AE.Adapter.AETransactionAdapter.prototype);

TAF.AE.Adapter.CustomerSupplyAdapter.prototype.convertCustomerSupply = function _convertCustomerSupply(searchObj) {
    var customerSupply = new TAF.AE.Adapter.CustomerSupply();
    var customerName;
    var customerCountry;

    try {
        customerName = searchObj.isIndividual ?
                [searchObj.customerFirstName, searchObj.customerMiddleName, searchObj.customerLastName].join(' ') :
                (searchObj.customerCompanyName || searchObj.customerName || '');
        customerSupply.customerName = customerName || searchObj.vendorName || searchObj.vendorLineEntityId;
        customerSupply.customerTRN = this.getVATNo(searchObj.customerTRN || searchObj.vendorTRN || searchObj.vendorLineTrn) || '';
        customerSupply.invoiceDate =  searchObj.tranDate || this.DEFAULT.DATE;
        customerSupply.invoiceNo = searchObj.number || '';
        customerSupply.glNumber = searchObj.glNumber || '';
        customerSupply.productDescription = searchObj.item || searchObj.localizedName.trim() || searchObj.account || '';
        customerSupply.customerCountry = searchObj.customerEmirate || '';
        customerSupply.country = searchObj.shippingCountry || searchObj.billingCountry || '';

        this.setTaxDetails(customerSupply, searchObj);
        this.setLineNo(customerSupply, searchObj);
        this.setAmounts(customerSupply, searchObj);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.AE.Adapter.CustomerSupplyAdapter.convertCustomerSupply exception', ex.toString());
    }

    return customerSupply;
};

TAF.AE.Adapter.CustomerSupplyAdapter.prototype.setAEDValues = function _setAEDValues(customerSupply, searchObj, taxRate) {

	searchObj.taxAmount = this.getSign(searchObj.netAmount) != this.getSign(searchObj.taxAmount) ? searchObj.taxAmount * -1 : searchObj.taxAmount;
    customerSupply.supplyValueAED = searchObj.netAmount;
    if (this.isMultibook || customerSupply.isReverseCharge) {
        customerSupply.vatValueAED = customerSupply.supplyValueAED * taxRate;
    } else {
        customerSupply.vatValueAED = parseFloat(searchObj.taxAmount) || 0;
    }
};

TAF.AE.Adapter.CustomerSupplyAdapter.prototype.setFCYValues = function _setFCYValues(customerSupply, searchObj, taxRate) {
    if ((!this.isMulticurrency) || (this.baseCurrency == searchObj.currency)) {
        customerSupply.fcyCode = this.DEFAULT.ISO_CURRENCY;
        customerSupply.supplyFCY = 0;
        customerSupply.vatFCY = 0;
    } else {
        customerSupply.supplyFCY = searchObj.fxAmount;
        customerSupply.vatFCY = customerSupply.supplyFCY * taxRate;
        customerSupply.fcyCode = this.currencyMap[searchObj.currency] || '';
    }
};

TAF.AE.Adapter.CustomerSupplyAdapter.prototype.isValidCustomerSupplyLine = function _isValidCustomerSupplyLine(searchObj) {
    var isValid = false;
    var account = this.accounts[searchObj.accountId];
    var taxCode = this.taxCodeCache[searchObj.taxItemId];
    var isJournalEntry = searchObj.recordType == 'journalentry';
    var isSupplyLine = account ? this.salesAccountTypes.indexOf(account.accountType) > -1 : false;// account check condition is added for the issue "U5 -614292 TAF > UAE FAF > Transaction with Non-Posting Discount (Header) > Cannot read property "accountType" from undefined" 
    isValid =  taxCode && (!isJournalEntry ? isSupplyLine : isJournalEntry);

    return isValid;
};
