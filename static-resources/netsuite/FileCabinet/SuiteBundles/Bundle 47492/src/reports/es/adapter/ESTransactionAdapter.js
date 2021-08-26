/**
 * Copyright © 2017, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Adapter = TAF.ES.Adapter || {};

TAF.ES.Adapter.ESTransactionAdapter = function _ESTransactionAdapter(listValueMap) {
    if (!listValueMap) {
        throw nlapiCreateError('INVALID_PARAMETER', 'listValueMap data is invalid');
    }
    this.listValueMap = listValueMap;

    var STC_BUNDLE = '9b168872-32ec-4d8e-b73e-38193fedc4d3';
    this.hasSTCBundle = SFC.Registry.IsInstalled(STC_BUNDLE);
};

TAF.ES.Adapter.ESTransactionAdapter.prototype.createTxnLineObject = function _createTxnLineObject(rawLine) {
    if (!rawLine) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'rawTxnLine is required.');
    }

    var taxCode = SFC.TaxCodes.Load(rawLine.taxCode);
    var netAmount = parseFloat(rawLine.netAmount) || 0;
    var taxAmount = parseFloat(rawLine.taxAmount) || 0;
    var taxRate = taxCode ? parseFloat(taxCode.GetRate()) || 0 : 0;

    var txnLineObject = {
        netAmount: netAmount,
        taxAmount: taxAmount,
        taxRate: taxRate
    };

    return txnLineObject;
};

TAF.ES.Adapter.ESTransactionAdapter.prototype.getListValueCode = function _getListValueCode(id) {
    return this.listValueMap[id] ? this.listValueMap[id].code : '';
};

TAF.ES.Adapter.ESTransactionAdapter.prototype.getTxnPeriod = function _getTxnPeriod(dateString) {
    if (!dateString) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'dateString is required.');
    }

    try {
        var date = nlapiStringToDate(dateString);
        return {
            month: date.getMonth() + 1,
            year: date.getFullYear()
        };
    } catch (ex) {
        logException(ex, this.Name + '.getTxnPeriod');
        throw ex;
    }
};

TAF.ES.Adapter.ESTransactionAdapter.prototype.getVATNo = function _getVATNo(vatNo, isRetainPrefix) {
    if (!vatNo) {
        return '';
    }

    vatNo = vatNo.replace(/[^A-Za-z0-9]/g, '');
    return isRetainPrefix ? vatNo : vatNo.replace(/^[A-Z]{2}/i, '');
};

TAF.ES.Adapter.ESTransactionAdapter.prototype.extractTaxCode = function _extractTaxCode(memo) {
    if(!memo) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'memo is required.');
    }
    
    var taxCode;
    try {
        for(var key in TAF.SII.CONSTANTS.MEMO) {
            if(memo.indexOf(TAF.SII.CONSTANTS.MEMO[key]) > -1) {
                taxCode = memo.replace(TAF.SII.CONSTANTS.MEMO[key],'');
            }
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'Error in TAF.ES.Adapter.ReceivedInvoiceAdapter.extractTaxCode', ex.toString());
        throw nlapiCreateError('ADAPTER_ERROR', 'Unable to transform data');
    }
    
    return taxCode;
}