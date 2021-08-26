/**
 * Copyright © 2017, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Formatter = TAF.ES.Formatter || {};

TAF.ES.Formatter.FieldDefinitions = function _FieldDefinitions() {};

TAF.ES.Formatter.FieldDefinitions.prototype.getFields = function _getFields() {
    var fields = {
        name: { type: TAF.Formatter.FieldTypes.TEXT, width: 120 },
        month: { type: TAF.Formatter.FieldTypes.INTEGER_PADDED, width: 2 },
        year: { type: TAF.Formatter.FieldTypes.INTEGER, width: 4 },
        tranId: { type: TAF.Formatter.FieldTypes.TEXT, width: 60 },
        description: { type: TAF.Formatter.FieldTypes.TEXT, width: 500 },
        externalReference: { type: TAF.Formatter.FieldTypes.TEXT, width: 60 },
        date: { type: TAF.Formatter.FieldTypes.DATE, dateFormat: 'dd-MM-yyyy' },
        operationDate: { type: TAF.Formatter.FieldTypes.DATE, dateFormat: 'dd-MM-yyyy' },
        invoiceDate: { type: TAF.Formatter.FieldTypes.DATE, dateFormat: 'dd-MM-yyyy' },
        landRegistrationNo: { type: TAF.Formatter.FieldTypes.TEXT, width: 25 },
        duaNumber: { type: TAF.Formatter.FieldTypes.TEXT, width: 40 },
        customerId: { type: TAF.Formatter.FieldTypes.TEXT, width: 20 },
        address: { type: TAF.Formatter.FieldTypes.TEXT, width: 120 },
        descriptionOfAssetAcquired: { type: TAF.Formatter.FieldTypes.TEXT, width: 40 },
        itemName: { type: TAF.Formatter.FieldTypes.TEXT, width: 40 },
        amount: { type: TAF.Formatter.FieldTypes.SIGNED_DECIMAL },
        total: { type: TAF.Formatter.FieldTypes.SIGNED_DECIMAL },
        netAmount: { type: TAF.Formatter.FieldTypes.SIGNED_DECIMAL },
        signedAmount: { type: TAF.Formatter.FieldTypes.SIGNED_DECIMAL },
        taxAmount: { type: TAF.Formatter.FieldTypes.SIGNED_DECIMAL }
    };
    return fields;
};
