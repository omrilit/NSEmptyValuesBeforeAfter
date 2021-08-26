/**
 * Copyright © 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 */ 

var TAF = TAF || {};
TAF.MY = TAF.MY || {};
TAF.MY.Adapter = TAF.MY.Adapter || {};


TAF.MY.Adapter.Supply = function _Supply() {
    return {
        customerName: '',
        customerBrn: '',
        invoiceDate: '',
        invoiceNo: '',
        lineNo: '',
        productDescription: '',
        signedAmount: '',
        amount: '',
        gstAmount: '',
        taxCode: '',
        country: '',
        currencyCode: '',
        foreignAmount: '',
        foreignGstAmount: ''
    };
};


TAF.MY.Adapter.SupplyAdapter = function _SupplyAdapter(state, section) {
    if (!state || !section) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'state and section are required');
    }
    
    this.state = state;
    this.section = section;
    
    this.isMultiCurrency = this.state[STATE_NAME.COMMON].isMultiCurrency;
    this.baseCurrency = this.state[STATE_NAME.COMMON].baseCurrency;
    this.currencyMap = this.state[STATE_NAME.COMMON].currencyMap;
    this.companyCountry = this.state[STATE_NAME.COMMON].companyCountry;
};


TAF.MY.Adapter.SupplyAdapter.prototype.getSupply = function _getSupply(raw) {
    if (!raw) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'raw data is required');
    }

    try {
        if (this.state[this.section].internalId == raw.id) {
            this.state[this.section].lineNumber++;
        } else {
            this.state[this.section].lineNumber = 1;
        }

        var supply = new TAF.MY.Adapter.Supply();
        var bookExchangeRate = (raw.bookExchangeRate != raw.exchangeRate) ? parseFloat(raw.bookExchangeRate) : 1;
        var exchangeRate = parseFloat(raw.exchangeRate) || 1;
        var foreignValues = this.getForeignValues(raw, exchangeRate);

        supply.currencyCode = foreignValues.currencyCode;
        supply.foreignAmount = foreignValues.foreignAmount;
        supply.foreignGstAmount = foreignValues.foreignGstAmount;
        supply.customerName = raw.customerIsPerson ? 
            raw.customerFirstName + ' ' + raw.customerMiddleName + ' ' + raw.customerLastName : 
            raw.customerCompanyName;
        supply.customerBrn = raw.customerBrn;
        supply.invoiceDate = raw.tranDate;
        supply.invoiceNo = raw.tranId || raw.transactionNumber || '';
        supply.lineNo = this.state[this.section].lineNumber;
        supply.productDescription = raw.memo || raw.item || raw.account || '';
        supply.country = this.getCountry(raw);
        supply.taxCode = raw.taxCode || this.getEffectiveRGLCode(raw.tranDate);
        supply.amount = (parseFloat(raw.netAmount) || 0) * bookExchangeRate;

        supply.gstAmount = (parseFloat(raw.taxAmount) || 0) * bookExchangeRate;
        if (this.isMultiCurrency && this.baseCurrency == raw.currency && raw.exchangeRate != 1) {
            supply.gstAmount /= exchangeRate;
        }

        this.state[this.section].internalId = raw.id;
        this.state.Footer.supplyLines++;
        this.state.Footer.supplyTotalAmount += supply.amount;
        this.state.Footer.supplyGstTotalAmount += parseFloat(supply.gstAmount);

        return supply;
    } catch(e) {
        var errorCode = e.getCode ? e.getCode() : 'ERROR';
        var errorDetails = e.getDetails ? e.getDetails() : 'Error: ' + (e.message || e);
        nlapiLogExecution('ERROR', 'TAF.MY.Adapter.SupplyAdapter.getSupply', errorCode + ': ' + errorDetails);
        throw nlapiCreateError(errorCode, errorDetails);
    }
};

TAF.MY.Adapter.SupplyAdapter.prototype.getForeignValues = function _getForeignValues(raw, exchangeRate) {
    var foreignValues = {
        currencyCode: 'XXX',
        foreignAmount: 0,
        foreignGstAmount: 0
    };

    if (this.isMultiCurrency && this.baseCurrency && raw.currency && this.baseCurrency != raw.currency) {
        foreignValues.currencyCode = this.currencyMap[raw.currency].symbol;
        foreignValues.foreignAmount = parseFloat(raw.fxAmount);
        foreignValues.foreignGstAmount = (parseFloat(raw.taxAmount) || 0) / exchangeRate;
    }

    return foreignValues;
};

TAF.MY.Adapter.SupplyAdapter.prototype.getCountry = function _getCountry(raw) {
    var country = '';
    if (raw.shippingCountry) {
        country =  raw.shippingCountry != this.companyCountry ? raw.shippingCountry_text : '';
    } else if (raw.billingCountry) {
        country =  raw.billingCountry != this.companyCountry ? raw.billingCountry_text : '';
    }
    return country;
};

TAF.MY.Adapter.SupplyAdapter.prototype.getEffectiveRGLCode = function _getEffectiveRGLCode(date) {
    var rglCodes = this.state[this.section].rglTaxCode;
    
    for(var i = 0; i < rglCodes.length; i++){
        var taxCodeValidUntil = rglCodes[i].validUntil; 
        if(!taxCodeValidUntil || 
            (Date.parse(taxCodeValidUntil).getTime() >= Date.parse(date).getTime())){
                return rglCodes[i].taxCode;
        }
    }
    
    throw nlapiCreateError('NO_VALID_RGL_TAXCODE', 'No valid RGL Tax Code found');
};
