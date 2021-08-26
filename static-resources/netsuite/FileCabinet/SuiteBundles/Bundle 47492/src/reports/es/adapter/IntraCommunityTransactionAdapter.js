/**
 * Copyright © 2017, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Adapter = TAF.ES.Adapter || {};

TAF.ES.Adapter.IntraCommunityTransactionAdapter = function _IntraCommunityTransactionAdapter(listValueMap) {
    TAF.ES.Adapter.ESTransactionAdapter.apply(this, arguments);
    this.Name = 'IntraCommunityTransactionAdapter';
};
TAF.ES.Adapter.IntraCommunityTransactionAdapter.prototype = Object.create(TAF.ES.Adapter.ESTransactionAdapter.prototype);

TAF.ES.Adapter.IntraCommunityTransactionAdapter.prototype.createTxnObject = function _createTxnObject(rawLine, companyInfo) {
    if (!rawLine) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'rawLine is required.');
    }
    if (!companyInfo) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'companyInfo is required.');
    }

    var isSales = this.isSalesTxn(rawLine);
    var date = this.getTxnPeriod(rawLine.accountingDate || rawLine.tranDate);
    var filer = this.getFiler(rawLine, companyInfo);
    var sender = this.getSender(rawLine, companyInfo);
    var countryCode = '';
    var address = '';
    var isSalesTxn = this.isSalesTxn(rawLine);
    var defaultShipping = false;
    var defaultBilling = false;
    var type = rawLine.type.toLowerCase();

    if(type != 'check' && isSalesTxn && rawLine.customerInternalId){
        var customerRec = nlapiLoadRecord('customer', rawLine.customerInternalId);
        var lineCount = customerRec.getLineItemCount('addressbook'); 
        for(var lineNo = 1; lineNo <= lineCount; lineNo++)
        {
            defaultShipping = customerRec.getLineItemValue('addressbook','defaultshipping', lineNo);
            if(defaultShipping === 'T'){
                countryCode = customerRec.getLineItemValue('addressbook', 'country', lineNo);
                var isOverridden = customerRec.getLineItemValue('addressbook', 'override', lineNo);
                if(isOverridden == 'T'){
                    address = customerRec.getLineItemValue('addressbook', 'addrtext', lineNo);
                }
                else{
                    address = this.getEntityAddress(customerRec, lineNo);
                }
                break;
            }
        } 
        
        if(!defaultShipping || defaultShipping === 'F')
		{
            countryCode = customerRec.getLineItemValue('addressbook', 'country', 1) || countryCode;
            var isOverridden = customerRec.getLineItemValue('addressbook', 'override', 1);
            if(isOverridden == 'T'){
                address = customerRec.getLineItemValue('addressbook', 'addrtext', 1);
            }
            else{
                address = this.getEntityAddress(customerRec, 1);
            }
        }
    }

    if(type != 'check' && !isSalesTxn && rawLine.vendorInternalId){
        var vendorRec = nlapiLoadRecord('vendor', rawLine.vendorInternalId);   
        var lineCount = vendorRec.getLineItemCount('addressbook'); 
        for(var lineNo = 1; lineNo <= lineCount; lineNo++)
        {
            defaultBilling = vendorRec.getLineItemValue('addressbook','defaultbilling', lineNo);
            if(defaultBilling === 'T'){
                countryCode = vendorRec.getLineItemValue('addressbook', 'country', lineNo);
                var isOverridden = vendorRec.getLineItemValue('addressbook', 'override', lineNo);
                if(isOverridden == 'T'){
                    address = vendorRec.getLineItemValue('addressbook', 'addrtext', lineNo);
                }
                else{
                    address = this.getEntityAddress(vendorRec, lineNo);
                }
                break;
            }
        } 

        if(!defaultBilling || defaultBilling === 'F'){ 
            countryCode = vendorRec.getLineItemValue('addressbook', 'country', 1) || countryCode;
            var isOverridden = vendorRec.getLineItemValue('addressbook', 'override', 1);
            if(isOverridden == 'T'){
                address = vendorRec.getLineItemValue('addressbook', 'addrtext', 1);
            }
            else{
                address = this.getEntityAddress(vendorRec, 1);
            }
        }
    }
    if(type == 'check')
    {
        var rec = nlapiLoadRecord('check', rawLine.internalId);
        var payaddrRec = rec.viewSubrecord('payeeaddress');
		if(payaddrRec){
			var isOverridden = payaddrRec.getFieldValue('override');
			countryCode = payaddrRec.getFieldValue('country') || countryCode;
			if(isOverridden == 'T'){
				address = payaddrRec.getFieldValue('addrtext');
			}
			else{        
				address = this.getPayeeAddress(payaddrRec);
			}
		}
    }
  
    var txnObject = {
        internalId: rawLine.internalId,
        vatNo: companyInfo.vatNo || '',
        address: address,
        tranId: rawLine.tranId,
        month: date.month,
        year: date.year,
        tranDate: rawLine.tranDate,
        description: rawLine.memo || '',
        submissionType: this.getListValueCode(rawLine.intraCommunityTxnType),
        intraCommunityCode: isSales ? 'D' : 'R',
        countryCode: countryCode,
        invoiceDate: rawLine.invoiceDate || '',
        filerName: filer.companyName,
        filerVatNo: filer.vatNo,
        filerCountryCode: filer.billingCountryCode || filer.countryCode || '',
        filerIdType: filer.idType,
        filerId: filer.id || '',
        senderName: sender.companyName,
        senderVatNo: sender.vatNo,
        senderCountryCode: sender.billingCountryCode || sender.countryCode || '',
        senderIdType: sender.idType,
        senderId: sender.id || '',
        externalReference: rawLine.externalReference,
        isNotReportedInTime: rawLine.isNotReportedInTime === 'T' ? TAF.SII.CONSTANTS.TRANSACTION.FLAG_YES : TAF.SII.CONSTANTS.TRANSACTION.FLAG_NO,
    };

    return txnObject;
};

TAF.ES.Adapter.IntraCommunityTransactionAdapter.prototype.isSalesTxn = function _isSalesTxn(rawLine) {
    if (!rawLine) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'rawLine is required.');
    }
    if (!rawLine.type) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'rawLine.type is required.');
    }

    var type = rawLine.type.toLowerCase();
    return type === 'custinvc' || type === 'cashsale';
};

TAF.ES.Adapter.IntraCommunityTransactionAdapter.prototype.getFiler = function _getFiler(rawLine, companyInfo) {
    var filer;
    var isSalesTxn = this.isSalesTxn(rawLine);
    
    if (isSalesTxn) {
        // Filer is company/subsidiary
        filer = {
            companyName: companyInfo.companyName,
            vatNo: companyInfo.vatNo
        };
    } else {
        // Filer is vendor
        filer = this.getEntity(rawLine, 'vendor');
    }

    return filer;
};

TAF.ES.Adapter.IntraCommunityTransactionAdapter.prototype.getSender = function _getSender(rawLine, companyInfo) {
    var sender;
    var isSalesTxn = this.isSalesTxn(rawLine);
    
    if (isSalesTxn) {
        // Sender is customer
        sender = this.getEntity(rawLine, 'customer');
    } else {
        // Sender is company/subsidiary
        sender = {
            companyName: companyInfo.companyName,
            vatNo: companyInfo.vatNo
        };
    }

    return sender;
};

TAF.ES.Adapter.IntraCommunityTransactionAdapter.prototype.getPayeeAddress = function _getPayeeAddress(rec) {
    if (!rec) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'Payee address record is required.');
    }

    var address = '';

    if (rec.getFieldValue('addr1')) {
        address += rec.getFieldValue('addr1') + ' ';
    }
    if (rec.getFieldValue('addr2')) {
        address += rec.getFieldValue('addr2') + ' ';
    }
    if (rec.getFieldValue('city')) {
        address += rec.getFieldValue('city') + ' ';
    }
    if (rec.getFieldValue('state')) {
        address += rec.getFieldValue('state') + ' ';
    }
    if (rec.getFieldValue('zip')) {
        address += rec.getFieldValue('zip') + ' ';
    }
    if (rec.getFieldText('country')) {
        address += rec.getFieldText('country') + ' ';
    }

    return address;
};

TAF.ES.Adapter.IntraCommunityTransactionAdapter.prototype.getEntityAddress = function _getEntityAddress(rec, lineNo) {
    if (!rec) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'Entity record is required.');
    }

    if (!lineNo) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'Line number is required.');
    }

    var address = '';

    if (rec.getLineItemValue('addressbook', 'addr1', lineNo)) {
        address += rec.getLineItemValue('addressbook', 'addr1', lineNo) + ' ';
    }
    if (rec.getLineItemValue('addressbook', 'addr2', lineNo)) {
        address += rec.getLineItemValue('addressbook', 'addr2', lineNo) + ' ';
    }
    if (rec.getLineItemValue('addressbook', 'city', lineNo)) {
        address += rec.getLineItemValue('addressbook', 'city', lineNo) + ' ';
    }
    if (rec.getLineItemValue('addressbook', 'state', lineNo)) {
        address += rec.getLineItemValue('addressbook', 'state', lineNo) + ' ';
    }
    if (rec.getLineItemValue('addressbook', 'zip', lineNo)) {
        address += rec.getLineItemValue('addressbook', 'zip', lineNo) + ' ';
    }
    var payaddrRec = rec.viewLineItemSubrecord('addressbook','addressbookaddress', lineNo);
    if(payaddrRec){
        if (payaddrRec.getFieldText('country')) {
            address += payaddrRec.getFieldText('country');
        }
    }

    return address;
};

TAF.ES.Adapter.IntraCommunityTransactionAdapter.prototype.getAddress = function _getAddress(companyInfo) {
    if (!companyInfo) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'companyInfo is required.');
    }

    var address = '';

    if (companyInfo.address1) {
        address += companyInfo.address1 + ' ';
    }
    if (companyInfo.address2) {
        address += companyInfo.address2 + ' ';
    }
    if (companyInfo.city) {
        address += companyInfo.city + ' ';
    }
    if (companyInfo.state) {
        address += companyInfo.state + ' ';
    }
    if (companyInfo.zip) {
        address += companyInfo.zip + ' ';
    }
    if (companyInfo.country) {
        address += companyInfo.country;
    }

    return address;
};

TAF.ES.Adapter.IntraCommunityTransactionAdapter.prototype.getEntity = function _getEntity(rawLine, entityType) {
    if (!rawLine) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'rawLine is required.');
    }

    if (!entityType) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'entityType is required.');
    }

    var entity = {};
    var isPerson = rawLine['is' + entityType.charAt(0).toUpperCase() + entityType.slice(1) + 'Person'] === 'T';

    if (isPerson) {
        entity.companyName = rawLine[entityType + 'FirstName'] + ' ' + rawLine[entityType + 'LastName'];
    } else {
        entity.companyName = rawLine[entityType + 'CompanyName'];
    }

    var idType = this.getListValueCode(rawLine[entityType + 'IdType']);
    if (idType) {
        entity.idType = idType;

        // NOTE:
        // If idType is '02', country code is not required. Therefore, skip.
        // If idType is '07', country code must be 'ES'.
        if (entity.idType !== TAF.SII.CONSTANTS.ENTITY.ID_TYPE_NIF_VAT) {
            entity.billingCountryCode = rawLine[entityType + 'DefaultBillingCountryCode'];
            entity.id = rawLine[entityType + 'Id'];
        } else {
            entity.id = this.getVATNo(rawLine[entityType + 'Id']);
        }
    } else {
        entity.vatNo = this.getVATNo(rawLine[entityType + 'VatRegNo'], true);
    }
    

    return entity;
};
