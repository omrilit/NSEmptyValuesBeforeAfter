/**
 * Copyright � 2017, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Adapter = TAF.ES.Adapter || {};

TAF.ES.Adapter.CashCollectionsAdapter = function _CashCollectionsAdapter(listValueMap) {
    TAF.ES.Adapter.ESTransactionAdapter.apply(this, arguments);
    this.Name = 'CashCollectionsAdapter';
};
TAF.ES.Adapter.CashCollectionsAdapter.prototype = Object.create(TAF.ES.Adapter.ESTransactionAdapter.prototype);

TAF.ES.Adapter.CashCollectionsAdapter.prototype.createTxnObject = function _createTxnObject(rawLine, companyInfo) {
    if (!rawLine) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'rawLine is required.');
    }
    if (!companyInfo) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'companyInfo is required.');
    }

    var isPerson = rawLine.isCustomerPerson === 'T';
    var customerName = isPerson ? this.sanitizeString(rawLine.customerFirstName) + ' ' + this.sanitizeString(rawLine.customerLastName) : this.sanitizeString(rawLine.customerCompanyName);
    var customerIdType = this.getListValueCode(this.sanitizeString(rawLine.customerIdType));
    var customerVatNo = this.getVATNo(this.sanitizeString(rawLine.customerVatRegNo), customerIdType === TAF.SII.CONSTANTS.ENTITY.ID_TYPE_NIF_VAT);
    var txnObject = {
        vatNo: this.getVATNo(companyInfo.vatNo),
        year: this.sanitizeString(rawLine.year),
        customerName: customerName,
        customerVatNo: customerVatNo,
        customerIdType: customerIdType,
        customerId: this.sanitizeString(rawLine.customerId) || '',
        customerCountryCode: this.sanitizeString(rawLine.defaultBillingCountryCode) || '',
        grossAmount: rawLine.grossAmount || 0
    };

    return txnObject;
};

TAF.ES.Adapter.CashCollectionsAdapter.prototype.sanitizeString = function _sanitizeString(text) {
    return text == '- None -' ? '' : text;
};
