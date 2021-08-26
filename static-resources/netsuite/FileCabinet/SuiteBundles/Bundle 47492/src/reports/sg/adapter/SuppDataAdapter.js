/**
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.SG = TAF.SG || {};
TAF.SG.Adapter = TAF.SG.Adapter || {};

TAF.SG.Adapter.SuppDataSummary = function _SuppDataSummary() {
    return {
        supplyTotalSGD : '',
        gstTotalSGD : '',
        transactionCountTotal : ''
    };
};

TAF.SG.Adapter.SuppData = function _SuppData() {
    return {
        customerName : '',
        customerUEN : '',
        invoiceDate : '',
        invoiceNo : '',
        lineNo : '',
        productDescription : '',
        supplyValueSGD : '',
        gstValueSGD : '',
        taxCode : '',
        country : '',
        fcyCode : '',
        supplyFCY : '',
        gstFCY : '',
        taxRate : ''
    };
};

TAF.SG.Adapter.SupplyAdapter = function _SupplyAdapter(params, state) {
    this.DEFAULT = {
        ISO_CURRENCY : 'XXX',
        DATE : '12/31/9999'
    };

    this.isMultibook = params.isMultibook;
    this.isMulticurrency = params.isMulticurrency;
    this.baseCurrency = params.baseCurrency;
    this.currencyMap = params.currencyMap;
    this.companyCountry = params.companyCountry;
    this.isRgl = params.isRgl;
    this.accounts = params.accounts;
    this.salesAccountTypes = params.salesAccountTypes;
    this.purchaseAccountTypes = params.purchaseAccountTypes;
    this.taxCodeCache = params.taxCodeCache;
    this.CUSTOMER_ACCOUNTING_TXNS = ['vendorbill', 'vendorcredit', 'check', 'journalentry', 'creditcardcharge', 'creditcardrefund'];

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

TAF.SG.Adapter.SupplyAdapter.prototype.convertRglDataSummary = function _convertRglDataSummary(realizedObj) {
    var summary = new TAF.SG.Adapter.SuppDataSummary();

    try {
        summary.supplyTotalSGD = Number(realizedObj.rglAmount);
        summary.gstTotalSGD = 0;
        summary.transactionCountTotal = Number(realizedObj.count);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.SG.Adapter.SupplyAdapter.convertRglDataSummary exception', ex.toString());
        throw nlapiCreateError('DATA_ERROR', 'Error in getting supply rgl data summary');
    }

    return summary;
};


TAF.SG.Adapter.SupplyAdapter.prototype.convertSuppData = function _convertSuppData(searchObj) {
    var suppData = new TAF.SG.Adapter.SuppData();
    var customerName;
    var customerCountry;

    try {
        customerName = searchObj.isIndividual ?
                [searchObj.customerFirstName, searchObj.customerMiddleName, searchObj.customerLastName].join(' ') :
                (searchObj.customerCompanyName || searchObj.customerName || '');
        customerCountry = (this.companyCountry != (searchObj.shippingCountry || searchObj.billingCountry)) ?
                searchObj.shippingCountry || searchObj.billingCountry || '' : '';
        suppData.customerName = customerName || searchObj.vendorName || searchObj.vendorLineEntityId;
        suppData.customerUEN = searchObj.customerUEN || searchObj.vendorUEN || searchObj.vendorLineUen || '';
        suppData.invoiceDate = searchObj.docDate || searchObj.tranDate || this.DEFAULT.DATE;
        suppData.invoiceNo = searchObj.number || '';
        suppData.productDescription = searchObj.item || searchObj.account || '';
        suppData.country = customerCountry;

        this.setTaxDetails(suppData, searchObj);
        this.setLineNo(suppData, searchObj);
        this.setAmounts(suppData, searchObj);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.SG.Adapter.SupplyAdapter.convertSuppData exception', ex.toString());
    }

    return suppData;
};

TAF.SG.Adapter.SupplyAdapter.prototype.setTaxDetails = function _setTaxDetails(suppData, searchObj) {
    var taxCode = this.taxCodeCache[searchObj.taxItemId];

    if (!taxCode) {
        return;
    }

    suppData.taxCode = taxCode.Name;
    if (taxCode.IsReverseCharge && taxCode.Parent && taxCode.IsPostNotional) {
        var parentTaxCode = this.taxCodeCache[taxCode.Parent];
        suppData.taxRate = parentTaxCode && parentTaxCode.Rate;
        suppData.isReverseCharge = true;
    } else {
        suppData.taxRate = taxCode.Rate;
    }
};

TAF.SG.Adapter.SupplyAdapter.prototype.setLineNo = function _setLineNo(suppData, searchObj) {
    if (this.state.tranId == searchObj.id) {
        suppData.lineNo = ++this.state.lineNo;
    } else {
        this.state.tranId = searchObj.id;
        this.state.lineNo = 1;
        suppData.lineNo = this.state.lineNo;
    }
};

TAF.SG.Adapter.SupplyAdapter.prototype.setAmounts = function _setAmounts(suppData, searchObj) {
    var taxRate = (parseFloat(suppData.taxRate) || 0) / 100;
    this.setSGDValues(suppData, searchObj, taxRate);
    this.setFCYValues(suppData, searchObj, taxRate);
};

TAF.SG.Adapter.SupplyAdapter.prototype.setSGDValues = function _setSGDValues(suppData, searchObj, taxRate) {

    suppData.supplyValueSGD = searchObj.netAmount;
    if (this.isMultibook || suppData.isReverseCharge) {
        suppData.gstValueSGD = suppData.supplyValueSGD * taxRate;
    } else {
        suppData.gstValueSGD = parseFloat(searchObj.taxAmount) || 0;
    }

    if (this.isTaxCodeValid(searchObj, 'DS')) {
        this.setDeemedSupplyLineSign(suppData, searchObj.creditAmount, ['supplyValueSGD', 'gstValueSGD']);
    }
};

TAF.SG.Adapter.SupplyAdapter.prototype.setFCYValues = function _setFCYValues(suppData, searchObj, taxRate) {
    if ((!this.isMulticurrency) || (this.baseCurrency == searchObj.currency)) {
        suppData.fcyCode = this.DEFAULT.ISO_CURRENCY;
        suppData.supplyFCY = 0;
        suppData.gstFCY = 0;
    } else {
        suppData.supplyFCY = searchObj.fxAmount;
        suppData.gstFCY = suppData.supplyFCY * taxRate;
        suppData.fcyCode = this.currencyMap[searchObj.currency] || '';

        if (this.isTaxCodeValid(searchObj, 'DS')) {
            this.setDeemedSupplyLineSign(suppData, searchObj.creditAmount, ['supplyFCY', 'gstFCY']);
        }
    }
};

TAF.SG.Adapter.SupplyAdapter.prototype.setDeemedSupplyLineSign = function _setDeemedSupplyLineSign(suppData, creditAmount, properties) {
    var sign = +creditAmount > 0 ? 1 : -1;
    for (var i = 0; i < properties.length; i++) {
        suppData[properties[i]] = Math.abs(suppData[properties[i]]) * sign;
    }
};

TAF.SG.Adapter.SupplyAdapter.prototype.convertSuppSummaryData = function _convertSuppSummaryData(searchObj) {
    if(!searchObj) {
        throw nlapiCreateError('MISSING_PARAMETER', 'searchObj is required');
    }
    var suppSummaryData = {};

    this.setTaxDetails(suppSummaryData, searchObj);
    var taxRate = (parseFloat(suppSummaryData.taxRate) || 0) / 100;
    this.setSGDValues(suppSummaryData, searchObj, taxRate);

    return suppSummaryData;
};

TAF.SG.Adapter.SupplyAdapter.prototype.isTaxCodeValid = function _isTaxCodeValid(searchObj, expected) {
    var account = this.accounts[searchObj.accountId];
    var taxCode = this.taxCodeCache[searchObj.taxItemId];
    return this.taxCodeDef.GetTypeOf(taxCode) === expected && this.purchaseAccountTypes.indexOf(account.accountType) > -1;
};

TAF.SG.Adapter.SupplyAdapter.prototype.isValidSupplyLine = function _isValidSupplyLine(searchObj) {
    var isValid = false;
    var account = this.accounts[searchObj.accountId];
    var taxCode = this.taxCodeCache[searchObj.taxItemId];
    var isSupplyLine = account ? this.salesAccountTypes.indexOf(account.accountType) > -1 : false;

    if (taxCode) {
        isValid = isSupplyLine || this.isTaxCodeValid(searchObj, 'DS') || this.isTaxCodeValid(searchObj, 'TXCA') || this.isTaxCodeValid(searchObj, 'TXCA2') || this.isTaxCodeValid(searchObj, 'SRRC') || this.isTaxCodeValid(searchObj, 'SROVR');
    }

    return isValid;
};
