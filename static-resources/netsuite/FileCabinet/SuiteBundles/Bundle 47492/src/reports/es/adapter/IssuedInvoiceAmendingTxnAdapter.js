/**
 * Copyright © 2017, 2018, 2019 Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Adapter = TAF.ES.Adapter || {};

TAF.ES.Adapter.IssuedInvoiceAmendingTxnAdapter = function _IssuedInvoiceAmendingTxnAdapter(listValueMap) {
    TAF.ES.Adapter.ESTransactionAdapter.apply(this, arguments);
    this.Name = 'IssuedInvoiceAmendingTxnAdapter';
};
TAF.ES.Adapter.IssuedInvoiceAmendingTxnAdapter.prototype = Object.create(TAF.ES.Adapter.ESTransactionAdapter.prototype);

TAF.ES.Adapter.IssuedInvoiceAmendingTxnAdapter.prototype.createTxnObject = function _createTxnObject(rawLine, origInvoiceObject, companyInfo, resourceMgr) {
    if (!rawLine) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'rawLine is required.');
    }
    if (!origInvoiceObject) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'origInvoiceObject is required.');
    }
    if (!companyInfo) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'companyInfo is required.');
    }

    var date = this.getTxnPeriod(rawLine.tranDate);
    var isPerson = origInvoiceObject.isCustomerPerson === 'T';
    var customerName = isPerson ? origInvoiceObject.customerFirstName + ' ' + origInvoiceObject.customerLastName : origInvoiceObject.customerCompanyName;
    var customerIdType = this.getListValueCode(origInvoiceObject.customerIdType);
    var customerVatNo = this.getVATNo(origInvoiceObject.customerVatRegNo, customerIdType === TAF.SII.CONSTANTS.ENTITY.ID_TYPE_NIF_VAT);
    var isRetroactive = nlapiStringToDate(rawLine.tranDate) < new Date(2017, 6, 1);
    
    var txnObject = {
        internalId: rawLine.internalId,
        vatNo: this.getVATNo(companyInfo.vatNo),
        tranId: rawLine.tranId,
        month: date.month,
        year: date.year,
        tranDate: rawLine.tranDate,
        description: (isRetroactive ? rawLine.memo || resourceMgr.GetString('SII_RETROACTIVE_DESCRIPTION') : rawLine.memo) || '',
        invoiceType: this.getListValueCode(rawLine.invoiceType),
        specialSchemeCode: isRetroactive ? this.getListValueCode(origInvoiceObject.specialSchemeCode) || TAF.SII.CONSTANTS.TRANSACTION.SPCL_SCHEME_CODE_RETROACTIVE_ISSUED : this.getListValueCode(origInvoiceObject.specialSchemeCode),
        propertyLocation: this.getListValueCode(origInvoiceObject.propertyLocation),
        landRegistrationNo: origInvoiceObject.landRegisterRef || '',
        isIssuedByThirdParty: origInvoiceObject.isIssuedByThirdParty === 'T'
                ? TAF.SII.CONSTANTS.TRANSACTION.FLAG_YES
                : TAF.SII.CONSTANTS.TRANSACTION.FLAG_NO,
        exemptionDetails: this.getListValueCode(origInvoiceObject.exemptionDetails),
        exemptionClassification: isRetroactive ? TAF.SII.CONSTANTS.TRANSACTION.EXEMPTION_NO_SURCHARGE : '',
        operationDate: rawLine.operationDate || '',
        customerName: customerName,
        customerVatNo: customerVatNo,
        customerCountryCode: origInvoiceObject.billingCountryCode || origInvoiceObject.defaultBillingCountryCode || '',
        customerIdType: customerIdType,
        customerId: origInvoiceObject.customerId || '',
        total: 0,
        servicesTaxableAmount: 0,
        taxableAmount: 0,
        exemptAmount: 0,
        servicesExemptAmount: 0,
        notSubjectAmount: 0,
        servicesNotSubjectAmount: 0,
        isTransactionType: this.isTransactionType(customerIdType, customerVatNo),
        correctedInvoiceType: rawLine.correctedInvoiceType,
        origTranId: origInvoiceObject.tranId,
        origTranDate: origInvoiceObject.tranDate,
        externalReference: rawLine.externalReference,
        isArticle72_73: origInvoiceObject.isArticle72_73 === 'T' ? TAF.SII.CONSTANTS.TRANSACTION.FLAG_YES : TAF.SII.CONSTANTS.TRANSACTION.FLAG_NO,
        isNotReportedInTime: origInvoiceObject.isNotReportedInTime === 'T' ? TAF.SII.CONSTANTS.TRANSACTION.FLAG_YES : TAF.SII.CONSTANTS.TRANSACTION.FLAG_NO,
        isArticle61d: origInvoiceObject.isArticle61d === 'T' ? TAF.SII.CONSTANTS.TRANSACTION.FLAG_YES : TAF.SII.CONSTANTS.TRANSACTION.FLAG_NO,
        lines: [],
        exemptLines: [],
        goodsExemptLines: [],
        serviceLines: [],
        servicesExemptLines: []
    };

    return txnObject;
};

TAF.ES.Adapter.IssuedInvoiceAmendingTxnAdapter.prototype.createTxnLineObject = function _createTxnLineObject(rawLine) {
    if (!rawLine) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'rawTxnLine is required.');
    }

    var taxCode = SFC.TaxCodes.Load(rawLine.taxCode);
    var signedAmount = rawLine.signedAmount;
    var taxAmount = signedAmount > 0 ? -Math.abs(rawLine.taxAmount) : Math.abs(rawLine.taxAmount);
    var txnLineObject = {
        signedAmount: rawLine.account ? -parseFloat(rawLine.signedAmount) || 0 : 0,
        taxAmount: parseFloat(taxAmount) || 0,
        taxRate: taxCode ? parseFloat(taxCode.GetRate()) || 0 : 0,
        isReverseCharge: taxCode ? taxCode.IsReverseCharge() : false,
        isService: taxCode ? taxCode.IsService() : false,
        exemptionDetails: this.getListValueCode(rawLine.exemptionLineDetails || rawLine.exemptionDetails)
    };

    return txnLineObject;
};

TAF.ES.Adapter.IssuedInvoiceAmendingTxnAdapter.prototype.isTransactionType = function _isTransactionType(customerIdType, customerVatNo) {
    var result = false;
    var formattedCustomerVatNo = (customerVatNo || '').toLowerCase();

    if (customerIdType || (formattedCustomerVatNo && formattedCustomerVatNo.indexOf('n') === 0)) {
        result = true;
    }

    return result;
};
