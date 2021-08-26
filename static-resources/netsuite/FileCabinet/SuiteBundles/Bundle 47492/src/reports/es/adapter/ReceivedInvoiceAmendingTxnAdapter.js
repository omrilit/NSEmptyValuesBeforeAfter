/**
 * Copyright © 2017, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Adapter = TAF.ES.Adapter || {};

TAF.ES.Adapter.ReceivedInvoiceAmendingTxnAdapter = function _ReceivedInvoiceAmendingTxnAdapter(listValueMap) {
    TAF.ES.Adapter.ESTransactionAdapter.apply(this, arguments);
    this.Name = 'ReceivedInvoiceAmendingTxnAdapter';
};
TAF.ES.Adapter.ReceivedInvoiceAmendingTxnAdapter.prototype = Object.create(TAF.ES.Adapter.ESTransactionAdapter.prototype);

TAF.ES.Adapter.ReceivedInvoiceAmendingTxnAdapter.prototype.createTxnObject = function _createTxnObject(rawLine, origBillObject, companyInfo, resourceMgr) {
    if (!rawLine) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'rawLine is required.');
    }
    if (!origBillObject) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'origBillObject is required.');
    }
    if (!companyInfo) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'companyInfo is required.');
    }

    var date = this.getTxnPeriod(rawLine.accountingDate || rawLine.tranDate);
    var vendorData = this.getVendorData(origBillObject);
    var isJournal = rawLine.recordType === 'journalentry';
    var isRetroactive = nlapiStringToDate(rawLine.tranDate) < new Date(2017, 6, 1);
    
    var txnObject = {
        internalId: rawLine.internalId,
        vatNo: this.getVATNo(companyInfo.vatNo),
        correctedInvoiceType: TAF.SII.CONSTANTS.TRANSACTION.CORRECTED_INVOICE_TYPE_DIFFERENCE,
        tranId: isJournal ? rawLine.referenceNo : rawLine.tranId,
        month: date.month,
        year: date.year,
        tranDate: rawLine.tranDate,
        description: (isRetroactive ? rawLine.memo || resourceMgr.GetString('SII_RETROACTIVE_DESCRIPTION') : rawLine.memo) || '',
        invoiceType: this.getListValueCode(rawLine.invoiceType),
        specialSchemeCode: isRetroactive ? this.getListValueCode(origBillObject.specialSchemeCode) || TAF.SII.CONSTANTS.TRANSACTION.SPCL_SCHEME_CODE_RETROACTIVE_RECEIVED : this.getListValueCode(origBillObject.specialSchemeCode),
        invoiceDate: rawLine.invoiceDate || '',
        operationDate: rawLine.operationDate || '',
        accountingDate: rawLine.accountingDate || '',
        vendorName: vendorData.name,
        vendorVatNo: vendorData.vatNo,
        vendorCountryCode: vendorData.countryCode,
        vendorIdType: vendorData.idType,
        vendorId: vendorData.id,
        total: 0,
        taxableAmount: 0,
        totalTax: 0,
        lines: [],
        reverseChargeLines: [],
        origTranId: origBillObject.tranId,
        origTranDate: origBillObject.tranDate || '',
        origInvoiceDate: origBillObject.invoiceDate || '',
        externalReference: rawLine.externalReference,
        isArticle72_73: origBillObject.isArticle72_73 === 'T' ? TAF.SII.CONSTANTS.TRANSACTION.FLAG_YES : TAF.SII.CONSTANTS.TRANSACTION.FLAG_NO,
        isNotReportedInTime: origBillObject.isNotReportedInTime === 'T' ? TAF.SII.CONSTANTS.TRANSACTION.FLAG_YES : TAF.SII.CONSTANTS.TRANSACTION.FLAG_NO
    };

    return txnObject;
};

TAF.ES.Adapter.ReceivedInvoiceAmendingTxnAdapter.prototype.getVendorData = function _getVendorData(origBillObject) {
    var vendor = {};

    vendor.id = origBillObject.vendorId || '';
    vendor.isPerson = origBillObject.isVendorPerson === 'T';
    vendor.name = vendor.isPerson ? origBillObject.vendorFirstName + ' ' + origBillObject.vendorLastName : origBillObject.vendorCompanyName;
    vendor.idType = this.getListValueCode(origBillObject.vendorIdType);
    vendor.vatNo = this.getVATNo(origBillObject.vendorVatRegNo, vendor.idType === TAF.SII.CONSTANTS.ENTITY.ID_TYPE_NIF_VAT);
    vendor.countryCode = origBillObject.billingCountryCode || origBillObject.defaultBillingCountryCode || '';

    return vendor;
};

TAF.ES.Adapter.ReceivedInvoiceAmendingTxnAdapter.prototype.createTxnLineObject = function _createTxnLineObject(rawLine) {
    if (!rawLine) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'rawTxnLine is required.');
    }

    var taxCodeDao = TAF.DAO.TaxCodeDaoSingleton.getInstance({ countryCode: 'ES', hasSTCBundle: this.hasSTCBundle });
    var taxCode;
    
    if(rawLine.isCustomGL === 'T') {
        taxCode = taxCodeDao.searchById(this.extractTaxCode(rawLine.memoLine));
    } else {
        taxCode = rawLine.taxCode ? taxCodeDao.searchById(rawLine.taxCode) : '';
    }
    
    var signedAmount = rawLine.signedAmount;
    var taxAmount = signedAmount < 0 ? -Math.abs(rawLine.taxAmount) : Math.abs(rawLine.taxAmount);
    var txnLineObject = {
        signedAmount: parseFloat(signedAmount) || 0,
        taxAmount: parseFloat(taxAmount) || 0,
        taxRate: taxCode ? taxCode.Rate || 0 : 0,
        isReverseCharge: taxCode ? taxCode.IsReverseCharge : false,
        isService: taxCode ? taxCode.IsService : false,
        isExcluded: taxCode ? taxCode.IsExcluded : false,
        isNonDeductible: rawLine.isCustomGL === 'T' && rawLine.memoLine.indexOf(TAF.SII.CONSTANTS.MEMO.NON_DEDUCTIBLE) > -1
    };

    if(taxCode && taxCode.Parent && taxCode.IsReverseCharge) {
        var parentTaxCode = taxCodeDao.searchById(taxCode.Parent);
        txnLineObject.taxRate = parseFloat(parentTaxCode.Rate) || 0;
        txnLineObject.taxAmount = rawLine.hasRevChargeGLlines && taxCode.IsPostNotional ? 0 : parseFloat(((parentTaxCode.Rate/100) * rawLine.signedAmount).toFixed(2)) || 0;
    }
	
	 if(taxCode && taxCode.Parent && taxCode.IsEC && !taxCode.IsReverseCharge ) {
        var parentTaxCode = taxCodeDao.searchById(taxCode.Parent);
        txnLineObject.taxRate = parseFloat(parentTaxCode.Rate) || 0;
        txnLineObject.taxAmount =parseFloat(((parentTaxCode.Rate/100) * rawLine.signedAmount).toFixed(2)) || 0;
    }
    
    if(rawLine.isCustomGL === 'T' && rawLine.memoLine.indexOf(TAF.SII.CONSTANTS.MEMO.REVERSE_CHARGE) > -1) {
        txnLineObject.signedAmount = 0;
        txnLineObject.taxAmount = -parseFloat(rawLine.signedAmount) || 0;
    }

    return txnLineObject;
};
