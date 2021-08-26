/**
 * Copyright © 2017, 2018, 2019 Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Adapter = TAF.ES.Adapter || {};

TAF.ES.Adapter.IssuedInvoiceAdapter = function _IssuedInvoiceAdapter(listValueMap) {
    TAF.ES.Adapter.ESTransactionAdapter.apply(this, arguments);
    this.Name = 'IssuedInvoiceAdapter';
};
TAF.ES.Adapter.IssuedInvoiceAdapter.prototype = Object.create(TAF.ES.Adapter.ESTransactionAdapter.prototype);

TAF.ES.Adapter.IssuedInvoiceAdapter.prototype.createTxnObject = function _createTxnObject(rawLine, companyInfo, resourceMgr) {
    if (!rawLine) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'rawLine is required.');
    }
    if (!companyInfo) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'companyInfo is required.');
    }

    var date = this.getTxnPeriod(rawLine.tranDate);
    var isPerson = rawLine.isCustomerPerson === 'T';
    var customerName = isPerson ? rawLine.customerFirstName + ' ' + rawLine.customerLastName : rawLine.customerCompanyName;
    var customerIdType = this.getListValueCode(rawLine.customerIdType);
    var customerVatNo = this.getVATNo(rawLine.customerVatRegNo, customerIdType === TAF.SII.CONSTANTS.ENTITY.ID_TYPE_NIF_VAT);
    var isRetroactive = nlapiStringToDate(rawLine.tranDate) < new Date(2017, 6, 1);

    var txnObject = {
        internalId: rawLine.internalId,
        vatNo: this.getVATNo(companyInfo.vatNo),
        tranId: rawLine.tranId,
        month: date.month,
        year: date.year,
        tranDate: rawLine.tranDate,
        description: (isRetroactive ? rawLine.memo || resourceMgr.GetString('SII_RETROACTIVE_DESCRIPTION') : rawLine.memo) || '',
        invoiceType: this.getListValueCode(rawLine.invoiceType) || TAF.SII.CONSTANTS.TRANSACTION.INVOICE, // default to F1 if null/empty
        specialSchemeCode: isRetroactive ? this.getListValueCode(rawLine.specialSchemeCode) || TAF.SII.CONSTANTS.TRANSACTION.SPCL_SCHEME_CODE_RETROACTIVE_ISSUED : this.getListValueCode(rawLine.specialSchemeCode),
        propertyLocation: this.getListValueCode(rawLine.propertyLocation),
        landRegistrationNo: rawLine.landRegisterRef || '',
        isIssuedByThirdParty: rawLine.isIssuedByThirdParty === 'T'
                ? TAF.SII.CONSTANTS.TRANSACTION.FLAG_YES
                : TAF.SII.CONSTANTS.TRANSACTION.FLAG_NO,
        exemptionClassification: isRetroactive ? TAF.SII.CONSTANTS.TRANSACTION.EXEMPTION_NO_SURCHARGE : '',
        operationDate: rawLine.operationDate || '',
        customerName: customerName,
        customerVatNo: customerVatNo,
        customerCountryCode: rawLine.billingCountryCode || rawLine.defaultBillingCountryCode || '',
        customerIdType: customerIdType,
        customerId: rawLine.customerId || '',
        total: 0,
        servicesTaxableAmount: 0,
        taxableAmount: 0,
        exemptAmount: 0,
        servicesExemptAmount: 0,
        notSubjectAmount: 0,
        servicesNotSubjectAmount: 0,
        isTransactionType: this.isTransactionType(customerIdType, customerVatNo),
        externalReference: rawLine.externalReference,
        isArticle72_73: rawLine.isArticle72_73 === 'T' ? TAF.SII.CONSTANTS.TRANSACTION.FLAG_YES : TAF.SII.CONSTANTS.TRANSACTION.FLAG_NO,
        isNotReportedInTime: rawLine.isNotReportedInTime === 'T' ? TAF.SII.CONSTANTS.TRANSACTION.FLAG_YES : TAF.SII.CONSTANTS.TRANSACTION.FLAG_NO,
		isMacroData: TAF.SII.CONSTANTS.TRANSACTION.FLAG_NO,
        isArticle61d: rawLine.isArticle61d === 'T' ? TAF.SII.CONSTANTS.TRANSACTION.FLAG_YES : TAF.SII.CONSTANTS.TRANSACTION.FLAG_NO,
        lines: [],
        exemptLines: [],
        goodsExemptLines: [],
        serviceLines: [],
        servicesExemptLines: []
    };

    return txnObject;
};

TAF.ES.Adapter.IssuedInvoiceAdapter.prototype.createTxnLineObject = function _createTxnLineObject(rawLine) {
    if (!rawLine) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'rawTxnLine is required.');
    }

    var taxCode = SFC.TaxCodes.Load(rawLine.taxCode);
    var txnLineObject = {
        signedAmount: rawLine.account ? -parseFloat(rawLine.signedAmount) || 0 : 0,
        taxAmount: parseFloat(rawLine.taxAmount) || 0,
        taxRate: taxCode ? parseFloat(taxCode.GetRate()) || 0 : 0,
        isReverseCharge: taxCode ? taxCode.IsReverseCharge() : false,
        isService: taxCode ? taxCode.IsService() : false,
        exemptionDetails: this.getListValueCode(rawLine.exemptionLineDetails || rawLine.exemptionDetails),
    };

    return txnLineObject;
};

TAF.ES.Adapter.IssuedInvoiceAdapter.prototype.isTransactionType = function _isTransactionType(customerIdType, customerVatNo) {
    var result = false;
    var formattedCustomerVatNo = (customerVatNo || '').toLowerCase();

    if (customerIdType || (formattedCustomerVatNo && formattedCustomerVatNo.indexOf('n') === 0)) {
        result = true;
    }

    return result;
};
