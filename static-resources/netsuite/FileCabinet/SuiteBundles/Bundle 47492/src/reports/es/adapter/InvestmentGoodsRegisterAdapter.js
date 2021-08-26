/**
 * Copyright © 2017, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Adapter = TAF.ES.Adapter || {};

TAF.ES.Adapter.InvestmentGoodsRegisterAdapter = function _InvestmentGoodsRegisterAdapter(listValueMap) {
    TAF.ES.Adapter.ESTransactionAdapter.apply(this, arguments);
    this.Name = 'InvestmentGoodsRegisterAdapter';
};
TAF.ES.Adapter.InvestmentGoodsRegisterAdapter.prototype = Object.create(TAF.ES.Adapter.ESTransactionAdapter.prototype);

TAF.ES.Adapter.InvestmentGoodsRegisterAdapter.prototype.createTxnObject = function _createTxnObject(rawLine, companyInfo) {
    if (!rawLine) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'rawLine is required.');
    }
    if (!companyInfo) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'companyInfo is required.');
    }

    var date = this.getTxnPeriod(rawLine.accountingDate || rawLine.tranDate);
    var isPerson = rawLine.isVendorPerson === 'T';
    var vendorName = isPerson ? rawLine.vendorFirstName + ' ' + rawLine.vendorLastName : rawLine.vendorCompanyName;
    var vendorIdType = this.getListValueCode(rawLine.vendorIdType);
    var vendorVatNo = this.getVATNo(rawLine.vendorVatRegNo, vendorIdType === TAF.SII.CONSTANTS.ENTITY.ID_TYPE_NIF_VAT);

    var txnObject = {
        internalId: rawLine.internalId,
        vatNo: this.getVATNo(companyInfo.vatNo),
        tranId: rawLine.tranId,
        month: date.month,
        year: date.year,
        tranDate: rawLine.tranDate,
        invoiceDate: rawLine.invoiceDate || '',
        vendorName: vendorName,
        vendorVatNo: vendorVatNo,
        vendorCountryCode: rawLine.billingCountryCode || rawLine.defaultBillingCountryCode || '',
        vendorIdType: vendorIdType,
        vendorId: rawLine.vendorId || '',
        lines: [],
        isTransactionType: this.isTransactionType(vendorIdType, vendorVatNo),
        externalReference: rawLine.externalReference
    };

    return txnObject;
};

TAF.ES.Adapter.InvestmentGoodsRegisterAdapter.prototype.createTxnLineObject = function _createTxnLineObject(rawLine) {
    if (!rawLine) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'rawTxnLine is required.');
    }

    var taxCode = SFC.TaxCodes.Load(rawLine.taxCode);
    var txnLineObject = {
        taxCodeName: taxCode ? taxCode.GetName() || '' : '',
        taxRate: taxCode ? parseFloat(taxCode.GetRate()) || 0 : 0,
        itemName: rawLine.itemName || '',
        serviceDate: rawLine.serviceDate || '',
        annualProrate: rawLine.annualProrate || 0
    };

    return txnLineObject;
};

TAF.ES.Adapter.InvestmentGoodsRegisterAdapter.prototype.isTransactionType = function _isTransactionType(vendorIdType, vendorVatNo) {
    var result = false;
    var formattedVendorVatNo = (vendorVatNo || '').toLowerCase();

    if (vendorIdType || (formattedVendorVatNo && formattedVendorVatNo.indexOf('n') === 0)) {
        result = true;
    }

    return result;
};
