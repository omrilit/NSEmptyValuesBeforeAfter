/**
 * Copyright © 2017, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Adapter = TAF.ES.Adapter || {};

TAF.ES.Adapter.ReceivedInvoiceAdapter = function _ReceivedInvoiceAdapter(listValueMap) {
    TAF.ES.Adapter.ESTransactionAdapter.apply(this, arguments);
    this.Name = 'ReceivedInvoiceAdapter';
};
TAF.ES.Adapter.ReceivedInvoiceAdapter.prototype = Object.create(TAF.ES.Adapter.ESTransactionAdapter.prototype);

TAF.ES.Adapter.ReceivedInvoiceAdapter.prototype.createTxnObject = function _createTxnObject(rawLine, companyInfo, resourceMgr) {
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
    var isRetroactive = nlapiStringToDate(rawLine.tranDate) < new Date(2017, 6, 1);
    var subsidiaryName = '';
    var companyName = '';

    
    if(rawLine.isOneWorld)
    {
        var subsidiaryRecord = nlapiLoadRecord('subsidiary', rawLine.subsidiaryId)
        if(subsidiaryRecord)
        {
            var legalName = subsidiaryRecord.getFieldValue('legalname');
            subsidiaryName = legalName ? legalName : subsidiaryRecord.getFieldValue('name');
        }
    }
    else
    {
        companyName = companyInfo.companyName;
    }

    var txnObject = {
        internalId: rawLine.internalId,
        vatNo: this.getVATNo(companyInfo.vatNo),
        tranId: rawLine.tranId,
        month: date.month,
        year: date.year,
        tranDate: rawLine.tranDate,
        description: (isRetroactive ? rawLine.memo || resourceMgr.GetString('SII_RETROACTIVE_DESCRIPTION') : rawLine.memo) || '',
        invoiceType: this.getListValueCode(rawLine.invoiceType) || TAF.SII.CONSTANTS.TRANSACTION.INVOICE, // default to F1 if null/empty
        specialSchemeCode: isRetroactive ? this.getListValueCode(rawLine.specialSchemeCode) || TAF.SII.CONSTANTS.TRANSACTION.SPCL_SCHEME_CODE_RETROACTIVE_RECEIVED : this.getListValueCode(rawLine.specialSchemeCode),
        invoiceDate: rawLine.invoiceDate || '',
        operationDate: rawLine.operationDate || '',
        accountingDate: rawLine.accountingDate || '',
        vendorName: vendorName,
        vendorVatNo: this.getVATNo(rawLine.vendorVatRegNo, vendorIdType === TAF.SII.CONSTANTS.ENTITY.ID_TYPE_NIF_VAT),
        vendorCountryCode: rawLine.billingCountryCode || rawLine.defaultBillingCountryCode || '',
        vendorIdType: vendorIdType,
        vendorId: rawLine.vendorId || '',
        total: 0,
        taxableAmount: 0,
        totalTax: 0,
        lines: [],
        reverseChargeLines: [],
        externalReference: rawLine.externalReference,
        isArticle72_73: rawLine.isArticle72_73 === 'T' ? TAF.SII.CONSTANTS.TRANSACTION.FLAG_YES : TAF.SII.CONSTANTS.TRANSACTION.FLAG_NO,
        isNotReportedInTime: rawLine.isNotReportedInTime === 'T' ? TAF.SII.CONSTANTS.TRANSACTION.FLAG_YES : TAF.SII.CONSTANTS.TRANSACTION.FLAG_NO,
        isMacroData: TAF.SII.CONSTANTS.TRANSACTION.FLAG_NO,
        subsidiaryName: subsidiaryName,
        isOneWorld: rawLine.isOneWorld,
        companyName: companyName

    };

    return txnObject;
};

TAF.ES.Adapter.ReceivedInvoiceAdapter.prototype.createTxnLineObject = function _createTxnLineObject(rawLine) {
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

    var txnLineObject = {
        signedAmount: parseFloat(rawLine.signedAmount) || 0,
        taxAmount: -parseFloat(rawLine.taxAmount) || 0,
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