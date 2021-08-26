/**
 * Copyright 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.Generic = TAF.Generic || {};
TAF.Generic.Adapter = TAF.Generic.Adapter || {};

TAF.Generic.Adapter.Line = function _Line(id){
    return {
        companyCode             : '',
        internalId              : '',
        subTranId               : '',
        documentNo              : '',
        year                    : '',
        lineItem                : '',
        period                  : '',
        postingPeriod           : '',
        documentDate            : '',
        localCurrencyCode       : '',
        localAmountDebit        : '',
        localAmountCredit       : '',
        documentCurrencyCode    : '',
        documentAmountDebit     : '',
        documentAmountCredit    : '',
        glAccountNumber         : '',
        glAccountName           : '',
        entityName              : '',
        taxRegistrationNumber   : '',
        department              : '',
        classes                 : '',
        location                : '',
        journalDescription      : '',
        transactionType         : '',
        creator                 : ''
    };
};

TAF.Generic.Adapter.GLAdapter = function _GLAdapter(state) {
    if (state) {
        this.state = state;
        this.companyCode = state.company.name;
        this.localCurrencyCode = this.getLocalCurrency(state);
    }
};

TAF.Generic.Adapter.GLAdapter.prototype.getLocalCurrency = function _getLocalCurrency(state) {
    if (state.isMultiBook) {
        return this.getCurrencyISOCode(state.company.bookCurrency);
    } else if (state.isMultiCurrency) {
        return this.getCurrencyISOCode(state.company.baseCurrency);
    }
    return TAF.CURRENCY_LOCALE_MAP[state.company.currencyLocale];
};

TAF.Generic.Adapter.GLAdapter.prototype.getCurrencyISOCode = function _getCurrencyISOCode(currencyId) {
    return currencyId && this.state.currencyMap && this.state.currencyMap[currencyId] ?
        this.state.currencyMap[currencyId].symbol : '';
};

TAF.Generic.Adapter.GLAdapter.prototype.getGlLine = function _getGlLine(rawData, periodId) {
    try {
        if (!rawData.isPosting || !rawData.account) {
            return null;
        }
        
        var glLine = this.getLineValues(rawData);
        glLine.postingPeriod = this.getPeriod(periodId);

        var document = this.getDocumentValues(rawData);
        glLine.documentCurrencyCode = this.getCurrencyISOCode(document.currency) || this.localCurrencyCode;
        glLine.documentAmountDebit = document.debit;
        glLine.documentAmountCredit = document.credit;
        
        var account = this.getAccountInfo(rawData.account);        glLine.glAccountNumber = account.localizedNumber || account.number;        glLine.glAccountName = account.localizedName || account.name;
        
        glLine.subTranId = this.getSubTranId(rawData);

        glLine = this.appendCustomFields(rawData, glLine);
        
        return glLine;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'getGlLine', ex.toString());
        throw nlapiCreateError('ADAPTER_ERROR', 'Unable to transform data');
    }
};

TAF.Generic.Adapter.GLAdapter.prototype.appendCustomFields = function _appendCustomFields(rawData, glLine) {
    try {
        var fields = this.state.fields;
        
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i].customFieldId;
            glLine[field] = rawData[field];
        }
        return glLine;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'appendCustomFields', ex.toString());
        throw ex;
    } 
};

TAF.Generic.Adapter.GLAdapter.prototype.getSubTranId = function _getSubTranId(rawData) {
    if (this.state.isGLSupported) {
        return rawData.glNumber;
    }
    if (this.state.lastId != rawData.id) {
        this.state.lastId = rawData.id;
        this.state.subTranId++;
    }
    return this.state.subTranId.toString(); 
};

TAF.Generic.Adapter.GLAdapter.prototype.getLineValues = function _getLineValues(rawData) {
    try {
        var glLine = {};
        glLine.companyCode = this.companyCode;
        glLine.internalId = rawData.id;
        glLine.documentNo = rawData.tranId;
        glLine.lineItem = parseInt(rawData.lineId) + 1;       
        glLine.year = rawData.tranDate;
        glLine.period = rawData.tranDate;
        glLine.documentDate = rawData.tranDate;
        glLine.localCurrencyCode = this.localCurrencyCode;
        glLine.localAmountDebit = rawData.debitAmount;
        glLine.localAmountCredit = rawData.creditAmount;
        glLine.entityName = rawData.entity;
        glLine.taxRegistrationNumber = rawData.customerTaxNo || rawData.vendorTaxNo;
        glLine.department = rawData.department;
        glLine.classes = rawData.classes;
        glLine.location = rawData.location;
        glLine.journalDescription = rawData.memo || rawData.memoMain || 
                                    rawData.tranId || [rawData.typeText, 'ID #', rawData.id].join(' ');
        glLine.transactionType = rawData.type;
        glLine.creator = rawData.createdBy;
        return glLine;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'getGlLine', ex.toString());
        throw ex;
    }    
};

TAF.Generic.Adapter.GLAdapter.prototype.getDocumentValues = function _getDocumentValues(rawData) {
    var document = {
        currency : rawData.currency || this.localCurrencyCode,
        debit  : 0,
        credit : 0
    };
    
    var fxAmount = parseFloat(rawData.fxAmount); 
    var amount = this.state.isMultiCurrency && fxAmount ? fxAmount : rawData.netAmount;
    amount = Math.abs(amount);
    if (rawData.debitAmount > 0) {
        document.debit = amount;
    } else {
        document.credit = amount;
    }
    
    return document;
};

TAF.Generic.Adapter.GLAdapter.prototype.getPeriod = function _getPeriod(periodId) {
    return (periodId && this.state.periodMap[periodId]) ? this.state.periodMap[periodId].name || '' : '';
};

TAF.Generic.Adapter.GLAdapter.prototype.getAccountInfo = function _getAccountInfo(accountId) {
    var account = {
        number: '',
        name: '',        localizedName: '',        localizedNumber: ''
    };
    if (accountId && this.state && this.state.accounts && this.state.accounts[accountId]) {
        account.number = this.state.accounts[accountId].accountNumber || '';
        account.name = this.state.accounts[accountId].name || '';        account.localizedName = this.state.accounts[accountId].localizedName || '';        account.localizedNumber = this.state.accounts[accountId].localizedNumber || '';
    };
    return account;
};
