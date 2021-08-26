/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.PT = TAF.PT || {};


TAF.PT.WorkingDocuments.FieldDefinition = function _FieldDefinition() {
    var fields = {
        NumberOfEntries: {type: 'integer'},
        TotalDebit: {type: 'decimal'},
        TotalCredit: {type: 'decimal'},
        DocumentNumber: {type: 'string', maxLength: 60},
        ATCUD: {type: 'string', maxLength: 100},
        WorkStatus: {type: 'string', maxLength: 1},
        WorkStatusDate: {type: 'datetime'},
        DocumentStatus_SourceID: {type: 'string', maxLength: 30},
        SourceBilling: {type: 'string', maxLength: 1},
        Hash: {type: 'string', maxLength: 172},
        WorkDate: {type: 'date'},
        WorkType: {type: 'string', maxLength: 2},
        SourceID: {type: 'string', maxLength: 30},
        SystemEntryDate: {type: 'datetime'},
        CustomerID: {type: 'string', maxLength: 30},
        LineNumber: {type: 'integer'},
        ProductCode: {type: 'string', maxLength: 60},
        ProductDescription: {type: 'string', maxLength: 200},
        Quantity: {type: 'decimal'},
        UnitOfMeasure: {type: 'string', maxLength: 20},
        UnitPrice: {type: 'actualamount'},
//        TaxBase: {type: 'decimal'},   -- excluded pending clarification
        TaxPointDate: {type: 'date'},
        Description: {type: 'string', maxLength: 60},
        TaxPayable: {type: 'decimal'},
        NetTotal: {type: 'decimal'},
        GrossTotal: {type: 'decimal'},
        CreditAmount: {type: 'decimal'},
        SerialNumber: {type: 'string', maxLength: 100}
    };
    
    this.load = function _Load() {
        return fields;
    };
};


TAF.PT.WorkingDocuments.XmlFormatter = function _XmlFormatter(SAFTformatter) {
    this.SAFT = SAFTformatter;
    this.fieldDefinitions = new TAF.PT.WorkingDocuments.FieldDefinition().load();
};


TAF.PT.WorkingDocuments.XmlFormatter.prototype.formatData = function _FormatData(field, data) {
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
            break;
        default:
            result = data;
    }
    
    return result;
};


TAF.PT.WorkingDocuments.XmlFormatter.prototype.formatSummary = function _FormatSummary(data) {
    
    var xml = [
        ['<NumberOfEntries>', this.formatData('NumberOfEntries', data.numberOfEntries), '</NumberOfEntries>'].join(''),
        ['<TotalDebit>', this.formatData('TotalDebit', data.totalDebit), '</TotalDebit>'].join(''),
        ['<TotalCredit>', this.formatData('TotalCredit', data.totalCredit), '</TotalCredit>'].join('')
    ].join('\n');
    
    return xml;
};


TAF.PT.WorkingDocuments.XmlFormatter.prototype.formatHeader = function _FormatHeader(data) {
    
    var xml = [
        '<WorkDocument>',
            ['<DocumentNumber>', this.formatData('DocumentNumber', data.documentNumber), '</DocumentNumber>'].join(''),
            ['<ATCUD>', this.formatData('ATCUD', data.ATCUD), '</ATCUD>'].join(''),
            '<DocumentStatus>',
                ['<WorkStatus>', this.formatData('WorkStatus', data.workStatus), '</WorkStatus>'].join(''),
                ['<WorkStatusDate>', this.formatData('WorkStatusDate', data.workStatusDate), '</WorkStatusDate>'].join(''),
                ['<SourceID>', this.formatData('DocumentStatus_SourceID', data.sourceIdDocumentStatus), '</SourceID>'].join(''),
                ['<SourceBilling>', this.formatData('SourceBilling', data.sourceBilling), '</SourceBilling>'].join(''),
            '</DocumentStatus>',
            ['<Hash>', this.formatData('Hash', data.hash), '</Hash>'].join(''),
            ['<HashControl>2</HashControl>'],
            ['<WorkDate>', this.formatData('WorkDate', data.workDate), '</WorkDate>'].join(''),
            ['<WorkType>', this.formatData('WorkType', data.workType), '</WorkType>'].join(''),
            ['<SourceID>', this.formatData('SourceID', data.sourceId), '</SourceID>'].join(''),
            ['<SystemEntryDate>', this.formatData('SystemEntryDate', data.systemEntryDate), '</SystemEntryDate>'].join(''),
            ['<CustomerID>', this.formatData('CustomerID', data.customerId), '</CustomerID>'].join('')
    ].join('\n');
    
    return xml;
};


TAF.PT.WorkingDocuments.XmlFormatter.prototype.formatLine = function _FormatLine(data) {
    var xml = [
        '<Line>',
            ['<LineNumber>', this.formatData('LineNumber', data.lineNumber), '</LineNumber>'].join(''),
            ['<ProductCode>', this.formatData('ProductCode', data.productCode), '</ProductCode>'].join(''),
            ['<ProductDescription>', this.formatData('ProductDescription', data.productDescription), '</ProductDescription>'].join(''),
            ['<Quantity>', this.formatData('Quantity', data.quantity), '</Quantity>'].join(''),
            ['<UnitOfMeasure>', this.formatData('UnitOfMeasure', data.unitOfMeasure), '</UnitOfMeasure>'].join(''),
            ['<UnitPrice>', this.formatData('UnitPrice', data.unitPrice), '</UnitPrice>'].join(''),
//            ['<TaxBase>', this.formatData('TaxBase', data.taxBase), '</TaxBase>'].join(''),   -- excluded pending clarification
            ['<TaxPointDate>', this.formatData('TaxPointDate', data.taxPointDate), '</TaxPointDate>'].join(''),
            ['<Description>', this.formatData('Description', data.description), '</Description>'].join('')
      ];

    if(data.serialNumber){
        var serialNumberTag = ['<ProductSerialNumber>'];
        var serialNumbers = data.serialNumber.split('\n');
        for(var i = 0 ; i < serialNumbers.length; i++){
            serialNumberTag.push('<SerialNumber>' + this.formatData('SerialNumber', serialNumbers[i]) + '</SerialNumber>');
        }
        serialNumberTag.push('</ProductSerialNumber>');
        xml.push(serialNumberTag.join(''));
    }
    
    xml.push(['<CreditAmount>', this.formatData('CreditAmount', data.creditAmount), '</CreditAmount>'].join(''));
    xml.push('</Line>');
    
    return xml.join('\n');
};


TAF.PT.WorkingDocuments.XmlFormatter.prototype.formatFooter = function _FormatFooter(data) {
    var xml = [
            '<DocumentTotals>',
                ['<TaxPayable>', this.formatData('TaxPayable', data.taxPayable), '</TaxPayable>'].join(''),
                ['<NetTotal>', this.formatData('NetTotal', data.netTotal), '</NetTotal>'].join(''),
                ['<GrossTotal>', this.formatData('GrossTotal', data.grossTotal), '</GrossTotal>'].join(''),
            '</DocumentTotals>',
        '</WorkDocument>'
    ].join('\n');
    
    return xml;
};
