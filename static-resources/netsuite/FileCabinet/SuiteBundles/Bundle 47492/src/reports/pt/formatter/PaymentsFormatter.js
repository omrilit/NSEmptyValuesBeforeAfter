/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.PT = TAF.PT || {};
TAF.PT.Payments = TAF.PT.Payments || {};

TAF.PT.Payments.FieldTypes = {
    INTEGER: 'Integer',
    MONETARY: 'Monetary',
    TEXT: 'Text',
    DATE: 'Date',
    DATE_TIME: 'DateTime'
};

TAF.PT.Payments.FieldDefinitions = function _FieldDefinitions() {
};

TAF.PT.Payments.FieldDefinitions.prototype.getFields = function _getFields() {
    var paymentFields = {
        numberOfEntries: {
            type: TAF.PT.Payments.FieldTypes.INTEGER
        },
        totalDebit: {
            type: TAF.PT.Payments.FieldTypes.MONETARY
        },
        totalCredit: {
            type: TAF.PT.Payments.FieldTypes.MONETARY
        },        
        paymentRefNo: {
            type: TAF.PT.Payments.FieldTypes.TEXT,
            maxLength: 60
        },
        transactionDate: {
            type: TAF.PT.Payments.FieldTypes.DATE
        },
        paymentType: {
            type: TAF.PT.Payments.FieldTypes.TEXT,
            maxLength: 2
        },
        paymentStatus: {
            type: TAF.PT.Payments.FieldTypes.TEXT,
            maxLength: 1
        },
        paymentStatusDate: {
            type: TAF.PT.Payments.FieldTypes.DATE_TIME
        },
        sourceIdDocumentStatus: {
            type: TAF.PT.Payments.FieldTypes.TEXT,
            maxLength: 30
        },
        sourcePayment: {
            type: TAF.PT.Payments.FieldTypes.TEXT,
            maxLength: 1
        },
        sourceId: {
            type: TAF.PT.Payments.FieldTypes.TEXT,
            maxLength: 30
        },
        systemEntryDate: {
            type: TAF.PT.Payments.FieldTypes.TEXT
        },
        customerId: {
            type: TAF.PT.Payments.FieldTypes.TEXT,
            maxLength: 30
        },
        lineNumber: {
            type: TAF.PT.Payments.FieldTypes.INTEGER
        },
        originatingOn: {
            type: TAF.PT.Payments.FieldTypes.TEXT,
            maxLength: 60
        },
        invoiceDate: {
            type: TAF.PT.Payments.FieldTypes.DATE
        },
        debitAmount: {
            type: TAF.PT.Payments.FieldTypes.MONETARY
        },
        creditAmount: {
            type: TAF.PT.Payments.FieldTypes.MONETARY
        },
        taxPayable: {
            type: TAF.PT.Payments.FieldTypes.MONETARY
        },
        netTotal: {
            type: TAF.PT.Payments.FieldTypes.MONETARY
        },
        grossTotal: {
            type: TAF.PT.Payments.FieldTypes.MONETARY
        },
    };
    return paymentFields;
};


TAF.PT.Payments.XmlTemplate = function _XmlTemplate() {
    var templates = {
        summary: [
            ' <NumberOfEntries>{numberOfEntries}</NumberOfEntries>',
            ' <TotalDebit>{totalDebit}</TotalDebit>',
            ' <TotalCredit>{totalCredit}</TotalCredit>'
        ].join('\n'),
        
        header: [
            ' <Payment>',
            '  <PaymentRefNo>{paymentRefNo}</PaymentRefNo>',
            '  <ATCUD>0</ATCUD>',
            '  <TransactionDate>{transactionDate}</TransactionDate>',
            '  <PaymentType>{paymentType}</PaymentType>',
            '  <DocumentStatus>',
            '   <PaymentStatus>{paymentStatus}</PaymentStatus>',
            '   <PaymentStatusDate>{paymentStatusDate}</PaymentStatusDate>',
            '   <SourceID>{sourceIdDocumentStatus}</SourceID>',
            '   <SourcePayment>{sourcePayment}</SourcePayment>',
            '  </DocumentStatus>',
            '  <SourceID>{sourceId}</SourceID>',
            '  <SystemEntryDate>{systemEntryDate}</SystemEntryDate>',
            '  <CustomerID>{customerId}</CustomerID>'
        ].join('\n'),
        
        line: [
            '  <Line>',
            '   <LineNumber>{lineNumber}</LineNumber>',
            '   <SourceDocumentID>',
            '    <OriginatingON>{originatingOn}</OriginatingON>',
            '    <InvoiceDate>{invoiceDate}</InvoiceDate>',
            '   </SourceDocumentID>',
            '  </Line>'
        ], //should be an array, need to insert an additional element later
        
        lineDebit: '   <DebitAmount>{debitAmount}</DebitAmount>',
        
        lineCredit: '   <CreditAmount>{creditAmount}</CreditAmount>',
        
        footer: [
            '  <DocumentTotals>',
            '   <TaxPayable>{taxPayable}</TaxPayable>',
            '   <NetTotal>{netTotal}</NetTotal>',
            '   <GrossTotal>{grossTotal}</GrossTotal>',
            '  </DocumentTotals>',
            ' </Payment>'
        ].join('\n')
    };
    
    this.loadTemplates = function _LoadTemplates() {
        return templates;
    };
};


TAF.PT.Payments.XmlFormatter = function _XmlFormatter(SAFTformatter) {
    this.SAFT = SAFTformatter;
    var fieldDef = new TAF.PT.Payments.FieldDefinitions();
    this.fields = fieldDef.getFields();
    this.templates = new TAF.PT.Payments.XmlTemplate().loadTemplates();
};

TAF.PT.Payments.XmlFormatter.prototype.formatSummary = function _formatSummary(summary) {
    return this.formatTemplate(summary, this.templates.summary);
};

TAF.PT.Payments.XmlFormatter.prototype.formatHeader = function _formatHeader(payment) {
    return this.formatTemplate(payment, this.templates.header);
};

TAF.PT.Payments.XmlFormatter.prototype.formatLine = function _formatLine(payment) {
    var template = this.templates.line.slice();
    
    if (payment) {
        if (payment.debitAmount) {
            template.splice(6, 0, this.templates.lineDebit);
        } else {
            template.splice(6, 0, this.templates.lineCredit);
        }
    }
    
    return this.formatTemplate(payment, template.join('\n'));
};


TAF.PT.Payments.XmlFormatter.prototype.formatFooter = function _formatFooter(payment) {
    return this.formatTemplate(payment, this.templates.footer);
};

TAF.PT.Payments.XmlFormatter.prototype.formatTemplate = function _formatTemplate(obj, template) {
    var formattedObj = this.formatDataObject(obj);
    return SFC.Utilities.RenderTemplate(template, formattedObj);
};

TAF.PT.Payments.XmlFormatter.prototype.formatDataObject = function _formatDataObject(raw) {
    var formatted = {};
    
    for (var f in raw) {
        var rawField = raw[f];
        var fieldDef = this.fields[f];        
        formatted[f] = fieldDef ? this.formatField(rawField, fieldDef) : rawField;    }
    
    return formatted;
};

TAF.PT.Payments.XmlFormatter.prototype.formatField = function _formatField(data, fieldDefinition) {
    var result = '';
    
    switch (fieldDefinition.type) {
        case TAF.PT.Payments.FieldTypes.TEXT:
            result = this.SAFT.STRING(data, fieldDefinition.maxLength);
            break;
        case TAF.PT.Payments.FieldTypes.MONETARY:
            result = this.SAFT.AMOUNT(data);
            break;
        case TAF.PT.Payments.FieldTypes.DATE:
            result = this.SAFT.DATE(nlapiStringToDate(data));
            break;
        case TAF.PT.Payments.FieldTypes.DATE_TIME:        	result = this.SAFT.DATETIME(nlapiStringToDate(data));
            break;
        case TAF.PT.Payments.FieldTypes.INTEGER:
            result = parseInt(data, 10).toFixed(0);
            break;
        case TAF.PT.Payments.FieldTypes.DECIMAL:
            result = parseFloat(data).toFixed(2);
            break;
        default:
            result = data;
    }
    
    return result;
};


