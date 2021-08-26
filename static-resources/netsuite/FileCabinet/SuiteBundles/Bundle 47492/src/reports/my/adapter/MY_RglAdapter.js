/**
 * Copyright © 2016, 2017, Oracle and/or its affiliates. All rights reserved.
 */ 

var TAF = TAF || {};
TAF.MY = TAF.MY || {};
TAF.MY.Adapter = TAF.MY.Adapter || {};


TAF.MY.Adapter.Rgl = function _Rgl() {
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


TAF.MY.Adapter.RglAdapter = function _RglAdapter(state, section) {
    if (!state || !section) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'state and section are required');
    }
    
    this.state = state;
    this.section = section;
    this.DEFAULT = {
        ISO_CURRENCY : 'XXX',
        DATE : '31/12/9999'
    };
    this.key = '';
    this.lineNo = 0;
};


TAF.MY.Adapter.RglAdapter.prototype.getSupply = function _getSupply(raw) {
    if (!raw) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'raw data is required');
    }

    try {
        var rgl = new TAF.MY.Adapter.Rgl();

        rgl.customerName = this.getCustomerName(raw);
        rgl.customerBrn = raw.entityBrn;
        rgl.invoiceDate = this.getDate(raw.date);
        rgl.invoiceNo = raw.sourceTranNo;
        rgl.productDescription = raw.memo || this.state[this.section].rglAccount || '';
        rgl.amount = parseFloat(raw.rglAmount) || 0;
        rgl.gstAmount = 0;
        rgl.taxCode = this.getEffectiveRGLCode(raw.date);
        rgl.currencyCode = raw.currency;
        rgl.foreignAmount = 0;
        rgl.foreignGstAmount = 0;

        var address = rgl.shipTo || rgl.billTo;
        rgl.country = address ? this.getCountry(address) : '';

        var key = this.getKey(rgl);
        rgl.lineNo = this.getLineNo(key);

        this.state.Footer.supplyLines++;
        this.state.Footer.supplyTotalAmount += rgl.amount;

        return rgl;
    } catch(e) {
        var errorCode = e.getCode ? e.getCode() : 'ERROR';
        var errorDetails = e.getDetails ? e.getDetails() : 'Error: ' + (e.message || e);
        nlapiLogExecution('ERROR', 'TAF.MY.Adapter.RglAdapter.getSupply', errorCode + ': ' + errorDetails);
        throw nlapiCreateError(errorCode, errorDetails);
    }
};

TAF.MY.Adapter.RglAdapter.prototype.getCustomerName = function _getCustomerName(searchObj) {
    if (!searchObj.entity || !searchObj.entityId) {
        return searchObj.entity || '';
    }
    
    var name = searchObj.entity;
    var id = searchObj.entityId + ' ';
    return name.replace(id, '');
};

TAF.MY.Adapter.RglAdapter.prototype.getDate = function _getDate(sourceDate) {
    if (!sourceDate) {
        return this.DEFAULT.DATE;
    }
    
    // Saved report date has different format
    return nlapiDateToString(Date.parse(sourceDate)) || this.DEFAULT.DATE;
};

TAF.MY.Adapter.RglAdapter.prototype.getKey = function _getKey(rgl) {
    if (!rgl) {
        return '';
    }
    
    var key = [rgl.invoiceNo, rgl.invoiceDate, rgl.customerName];
    return key.join('-');
};

TAF.MY.Adapter.RglAdapter.prototype.getLineNo = function _getLineNo(key) {
    if (this.key == key) {
        this.lineNo++;
    } else {
        this.key = key;
        this.lineNo = 1;
    }
    return this.lineNo;
};

TAF.MY.Adapter.RglAdapter.prototype.getCountry = function _getCountry(address) {
    var addressLines = address.split('\r\n');
    var country = addressLines[addressLines.length - 1];
    return country != this.state[STATE_NAME.COMMON].companyCountryName ? country : '';
};

TAF.MY.Adapter.RglAdapter.prototype.getEffectiveRGLCode = function _getEffectiveRGLCode(date) {
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
