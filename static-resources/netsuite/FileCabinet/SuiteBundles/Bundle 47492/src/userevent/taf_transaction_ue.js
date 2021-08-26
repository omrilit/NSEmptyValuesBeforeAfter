/**
 * Copyright © 2017, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.SII = TAF.SII || {};
TAF.UE = TAF.UE || {};
TAF.UE.ES_NEXUS = 'ES';

TAF.UE.BeforeLoad = function _BeforeLoad(type, form, request) {
    if (nlapiGetContext().getExecutionContext() !== 'userinterface') {
        return;
    }

    var recordType = nlapiGetRecordType();
    var nexus = TAF.UE.BeforeLoad.getNexus(recordType);
    var fieldView = new TAF.FieldView();
    
    // hide/display ES SII columns and fields
    TAF.UE.BeforeLoad.setFieldsDisplay(form, fieldView, nexus, recordType);

    if (nexus === TAF.UE.ES_NEXUS) {
        var params = request.getAllParameters();
        TAF.UE.BeforeLoad.setFieldValues(type.toString(), recordType, params, form);
    }
};

TAF.UE.BeforeLoad.setFieldsDisplay = function setFieldsDisplay(form, fieldView, nexus, recordType) {
    var properties = [
        { id: 'nexus', value: [ nexus ] },
        { id: 'recordType', value: [recordType] }
    ];

    // hide/display ES SII columns and fields
    fieldView.displayFields(TAF.CONSTANTS.FIELD_MAP.TRANSACTION_COLUMN, properties);
    fieldView.displayFields(TAF.CONSTANTS.FIELD_MAP.TRANSACTION, properties);

    if (nlapiGetFieldValue('createdfrom')) {
        TAF.UE.BeforeLoad.hideOrignalTxnField(form);        
    }
    fieldView.arrangeFieldOrder(form, TAF.CONSTANTS.FIELD_MAP.TRANSACTION);
};

TAF.UE.BeforeLoad.setFieldValues = function setFieldValues(action, recordType, params, form) {
    switch (action) {
        case 'create':
            TAF.UE.BeforeLoad.hideRegistrationFields();
            if (!params || !params.transform) {
                break;
            }
        case 'copy':
            TAF.UE.BeforeLoad.resetRegistrationFields();
            break;
        case 'edit':
            if (recordType === ' journalentry') {
                break;
            }
        case 'view':
            var receviedInvoiceType = nlapiGetFieldValue(TAF.CONSTANTS.FIELD_MAP.TRANSACTION.receivedInvoiceType.id);
            var receivedInvoiceTypeRecordTypes = TAF.CONSTANTS.FIELD_MAP.TRANSACTION.receivedInvoiceType.recordType || [];

            if (!receviedInvoiceType && receivedInvoiceTypeRecordTypes.indexOf(recordType) > -1) {
                TAF.UE.BeforeLoad.createDefaultInvoiceTypeField(form, type);
            }

            break;
        default: // do nothing
    }
};

/**
 * Creates a temporary 'Invoice Type' field with 'Invoice' as the value. This field is for transactions with no
 * selected 'Invoice Type' (custbody_sii_received_inv_type) field
 * If 'Invoice Type' (custbody_sii_received_inv_type) has no value, 
 *  - type is view: this field is displayed; custbody_sii_received_inv_type is hidden
 *  - type is edit: this field is used as the default value; custpage_sii_temp_received_inv_type is hidden
 */
TAF.UE.BeforeLoad.createDefaultInvoiceTypeField = function createDefaultInvoiceTypeField(form, type) {
    var invoiceTypeField;
    var invoiceTypeTempField;
    var listValues;

    try {
        listValues = new TAF.ES.DAO.ListValuesDAO().search({ code: TAF.CONSTANTS.TRANSACTION.INVOICE }).getList();
        if (!listValues || listValues.length === 0) {
            return;
        }
        if (type == 'view') {
            invoiceTypeField = nlapiGetField(TAF.CONSTANTS.FIELD_MAP.TRANSACTION.receivedInvoiceType.id);
            if (invoiceTypeField) {
                invoiceTypeField.setDisplayType('hidden');
                invoiceTypeTempField = form.addField(TAF.CONSTANTS.FIELD_MAP.TRANSACTION.receivedInvoiceTypeTemp.id,
                    'select', invoiceTypeField.getLabel());
                invoiceTypeTempField.addSelectOption(listValues[0].id, listValues[0].name, true);
                form.insertField(invoiceTypeTempField, invoiceTypeField.getName());
            }
        } else if (type == 'edit') {
            form.addField(TAF.CONSTANTS.FIELD_MAP.TRANSACTION.receivedInvoiceTypeTemp.id, 'text', '')
                .setDisplayType('hidden')
                .setDefaultValue(listValues[0].id);
        }
    } catch (ex) {
        nlapiLogExecution('AUDIT', 'TAF.UE.BeforeLoad.createDefaultInvoiceTypeField', 'Unable to set default value for Received Invoice Type');
    }
};

TAF.UE.BeforeLoad.hideOrignalTxnField = function hideOrignalTxnField(form) {
    if (form.getField(TAF.CONSTANTS.FIELD_MAP.TRANSACTION.originalInvoice.id)) {
        form.getField(TAF.CONSTANTS.FIELD_MAP.TRANSACTION.originalInvoice.id).setDisplayType('hidden');
    }
    if (form.getField(TAF.CONSTANTS.FIELD_MAP.TRANSACTION.originalBill.id)) {
        form.getField(TAF.CONSTANTS.FIELD_MAP.TRANSACTION.originalBill.id).setDisplayType('hidden');
    }
};

TAF.UE.BeforeLoad.resetRegistrationFields = function resetRegistrationFields() {
    nlapiLogExecution('AUDIT', 'TAF.UE.BeforeLoad.resetRegistrationFields', 'Resetting values for registration fields');
    var regFields = [
        TAF.CONSTANTS.FIELD_MAP.TRANSACTION.registrationStatus.id,
        TAF.CONSTANTS.FIELD_MAP.TRANSACTION.registrationCode.id,
        TAF.CONSTANTS.FIELD_MAP.TRANSACTION.registrationMsg.id
    ];

    try {
        for (var i = 0; i < regFields.length; i++) {
            if (nlapiGetField(regFields[i])) {
                nlapiSetFieldValue(regFields[i], '');
            }
        }
    } catch (ex) {
        nlapiLogExecution('AUDIT', 'TAF.UE.BeforeLoad.resetRegistrationFields', 'Unable to reset values');
    }
};

TAF.UE.BeforeLoad.hideRegistrationFields = function hideRegistrationFields() {
    var regFields = [
        TAF.CONSTANTS.FIELD_MAP.TRANSACTION.registrationStatus.id,
        TAF.CONSTANTS.FIELD_MAP.TRANSACTION.registrationCode.id,
        TAF.CONSTANTS.FIELD_MAP.TRANSACTION.registrationMsg.id
    ];
    var regField;

    try {
        for (var i = 0; i < regFields.length; i++) {
            regField = nlapiGetField(regFields[i]);
            if (regField) {
                regField.setDisplayType('hidden');
            }
        }
    } catch (ex) {
        nlapiLogExecution('AUDIT', 'TAF.UE.BeforeLoad.resetRegistrationFields', 'Unable to reset values');
    }
};

TAF.UE.BeforeLoad.getNexus = function getNexus(recordType) {
    var nexus = nlapiGetFieldValue('nexus_country');

    try {
        if (recordType === 'journalentry') {
            var taxCodeDao = TAF.DAO.TaxCodeDaoSingleton.getInstance({ countryCode: TAF.UE.ES_NEXUS });
            if (taxCodeDao.taxCodeCache.length > 0) {
                nexus = TAF.UE.ES_NEXUS;
            }
        }
    } catch (ex) {
        nlapiLogExecution('AUDIT', 'TAF.UE.BeforeLoad.getNexus', 'Unable to load nexus for Journal Entry');
    }

    return nexus;
};
