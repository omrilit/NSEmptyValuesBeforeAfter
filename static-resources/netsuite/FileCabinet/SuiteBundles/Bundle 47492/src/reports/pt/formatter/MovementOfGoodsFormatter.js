/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.PT = TAF.PT || {};


TAF.PT.MovementOfGoodsFieldDefinition = function _MovementOfGoodsFieldDefinition() {
    var fields = {
        NumberOfMovementLines: {type: 'integer'},
        TotalQuantityIssued: {type: 'decimal'},
        DocumentNumber: {type: 'string', maxLength: 60},
        MovementStatus: {type: 'string', maxLength: 1},
        MovementStatusDate: {type: 'datetime'}, 
        DocumentStatus_SourceID: {type: 'string', maxLength: 30},
        SourceBilling: {type: 'string', maxLength: 1},
        Hash: {type: 'string', maxLength: 172},
        Period: {type: 'integer'},
        MovementDate: {type: 'date'},
        MovementType: {type: 'string', maxLength: 2},
        SystemEntryDate: {type: 'string'},
        SourceID: {type: 'string', maxLength: 30},
        ShipTo_AddressDetail: {type: 'string', maxLength: 210},
        ShipTo_City: {type: 'string', maxLength: 50},
        ShipTo_PostalCode: {type: 'string', maxLength: 20},
        ShipTo_Region: {type: 'string', maxLength: 50},
        ShipTo_Country: {type: 'string', maxLength: 2},
        ShipFrom_AddressDetail: {type: 'string', maxLength: 210},
        ShipFrom_City: {type: 'string', maxLength: 50},
        ShipFrom_PostalCode: {type: 'string', maxLength: 20},
        ShipFrom_Region: {type: 'string', maxLength: 50},
        ShipFrom_Country: {type: 'string', maxLength: 2},
        MovementStartTime: {type: 'datetime'},
        LineNumber: {type: 'integer'},
        ProductCode: {type: 'string', maxLength: 60},
        ProductDescription: {type: 'string', maxLength: 200},
        ProductSerialNumber: {type: 'string', maxLength: 100},
        Quantity: {type: 'decimal'},
        UnitOfMeasure: {type: 'string', maxLength: 20},
        UnitPrice: {type: 'actualamount'},
        Description: {type: 'string', maxLength: 60},
        TaxPayable: {type: 'amount'},
        NetTotal: {type: 'amount'},
        GrossTotal: {type: 'amount'},
        CustomerID: {type: 'string', maxLength: 30},
        CreditAmount: {type: 'amount'}
    };
    
    this.load = function _Load() {
        return fields;
    };
};


TAF.PT.MovementOfGoodsFormatter = function _MovementOfGoodsFormatter(SAFTformatter) {
    this.SAFT = SAFTformatter;
    this.fieldDefinitions = new TAF.PT.MovementOfGoodsFieldDefinition().load();
};


TAF.PT.MovementOfGoodsFormatter.prototype.formatData = function _FormatData(field, data) {
    var fieldDefinition = this.fieldDefinitions[field];
    var result = '';
    
    switch (fieldDefinition.type) {
        case 'string':
            result = this.SAFT.STRING(data, fieldDefinition.maxLength, fieldDefinition.defaultValue);
            break;
        case 'amount':
            result = this.SAFT.AMOUNT(data);
            break;
        case 'date':
            result = this.SAFT.DATE(nlapiStringToDate(data));
            break;
        case 'datetime':
            result = this.SAFT.DATETIME(nlapiStringToDate(data));
            break;
        case 'integer':
            result = parseInt(data, 10);
            break;
        case 'decimal':
            result = parseFloat(data).toFixed(2);
            break;
        case 'actualamount':
            result = this.SAFT.ACTUALAMOUNT(data);
        default:
            result = data;
    }
    
    return result;
};


TAF.PT.MovementOfGoodsFormatter.prototype.formatSummary = function _FormatSummary(data) {
    var xml = [
    '<NumberOfMovementLines>', this.formatData('NumberOfMovementLines', data.numberOfMovementLines), '</NumberOfMovementLines>',
    '<TotalQuantityIssued>', this.formatData('TotalQuantityIssued', data.totalQuantityIssued), '</TotalQuantityIssued>'
    ].join('');
    
    return xml;
};


TAF.PT.MovementOfGoodsFormatter.prototype.formatHeader = function _FormatHeader(data) {
    var xml = [];
    
    var documentStatus = [ 
    '<DocumentStatus>',
        '<MovementStatus>', this.formatData('MovementStatus', data.movementStatus), '</MovementStatus>',
        '<MovementStatusDate>', this.formatData('MovementStatusDate', data.movementStatusDate), '</MovementStatusDate>',
        '<SourceID>', this.formatData('DocumentStatus_SourceID', data.documentStatus_sourceID), '</SourceID>',
        '<SourceBilling>', this.formatData('SourceBilling', data.sourceBilling), '</SourceBilling>',
    '</DocumentStatus>'].join('');
    
    var shipTo = [
    '<ShipTo>',
        '<Address>',
            '<AddressDetail>', this.formatData('ShipTo_AddressDetail', data.shipTo_addressDetail), '</AddressDetail>',
            '<City>', this.formatData('ShipTo_City', data.shipTo_city), '</City>',
            '<PostalCode>', this.formatData('ShipTo_PostalCode', data.shipTo_postalCode), '</PostalCode>',
            '<Region>', this.formatData('ShipTo_Region', data.shipTo_region), '</Region>',
            '<Country>', this.formatData('ShipTo_Country', data.shipTo_country), '</Country>',
        '</Address>',
    '</ShipTo>'].join('');
    
    var shipFrom = [
    '<ShipFrom>',
        '<Address>',
            '<AddressDetail>', this.formatData('ShipFrom_AddressDetail', data.shipFrom_addressDetail), '</AddressDetail>',
            '<City>', this.formatData('ShipFrom_City', data.shipFrom_city), '</City>',
            '<PostalCode>', this.formatData('ShipFrom_PostalCode', data.shipFrom_postalCode), '</PostalCode>',
            '<Region>', this.formatData('ShipFrom_Region', data.shipFrom_region), '</Region>',
            '<Country>', this.formatData('ShipFrom_Country', data.shipFrom_country), '</Country>',
        '</Address>',
    '</ShipFrom>'].join('');
    
    var xml = [
    '<StockMovement>',
        '<DocumentNumber>', this.formatData('DocumentNumber', data.documentNumber), '</DocumentNumber>',
        '<ATCUD>0</ATCUD>',
        documentStatus,
        '<Hash>', this.formatData('Hash', data.hash), '</Hash>',
        '<HashControl>2</HashControl>',
        '<MovementDate>', this.formatData('MovementDate', data.movementDate), '</MovementDate>',
        '<MovementType>', this.formatData('MovementType', data.movementType), '</MovementType>',
        '<SystemEntryDate>', this.formatData('SystemEntryDate', data.systemEntryDate), '</SystemEntryDate>',
        '<CustomerID>', this.formatData('CustomerID', data.customerID), '</CustomerID>',
        '<SourceID>', this.formatData('SourceID', data.sourceID), '</SourceID>',
        shipTo,
        shipFrom,
        '<MovementStartTime>', this.formatData('MovementStartTime', data.movementStartTime), '</MovementStartTime>',
    ].join('');
    
    return xml;
};


TAF.PT.MovementOfGoodsFormatter.prototype.formatLine = function _FormatLine(data) {
    var serialNumberTag = '';
    if(data.productSerialNumbers) {
        var serialNumbers = data.productSerialNumbers ? data.productSerialNumbers.split('\n') : '';
        
        for(var i = 0; i < serialNumbers.length; i++){
            serialNumberTag += '<SerialNumber>' + this.formatData('ProductSerialNumber', serialNumbers[i]) + '</SerialNumber>';
        }
    }
    
    var xml = [
    '<Line>',
        '<LineNumber>', this.formatData('LineNumber', data.lineNumber), '</LineNumber>',
        '<ProductCode>', this.formatData('ProductCode', data.productCode), '</ProductCode>',
        '<ProductDescription>', this.formatData('ProductDescription', data.productDescription), '</ProductDescription>',
        '<Quantity>', this.formatData('Quantity', data.quantity), '</Quantity>',
        '<UnitOfMeasure>', this.formatData('UnitOfMeasure', data.unitOfMeasure), '</UnitOfMeasure>',
        '<UnitPrice>', this.formatData('UnitPrice', data.unitPrice), '</UnitPrice>',
        '<Description>', this.formatData('Description', data.description), '</Description>',
        data.productSerialNumbers ? '<ProductSerialNumber>' + serialNumberTag + '</ProductSerialNumber>' : '',
        '<CreditAmount>', this.formatData('CreditAmount', data.creditAmount), '</CreditAmount>',
    '</Line>'].join('');
    
    return xml;
};


TAF.PT.MovementOfGoodsFormatter.prototype.formatFooter = function _FormatFooter(data) {
    var documentTotals = [
    '<DocumentTotals>',
        '<TaxPayable>', this.formatData('TaxPayable', data.taxPayable), '</TaxPayable>',
        '<NetTotal>', this.formatData('NetTotal', data.netTotal), '</NetTotal>',
        '<GrossTotal>', this.formatData('GrossTotal', data.grossTotal), '</GrossTotal>',
    '</DocumentTotals>'].join('');
    
    var xml = [documentTotals, '</StockMovement>'].join('');
        
    return xml;
};