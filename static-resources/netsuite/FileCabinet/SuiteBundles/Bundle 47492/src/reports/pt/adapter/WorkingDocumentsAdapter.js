/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.PT = TAF.PT || {};
TAF.PT.WorkingDocuments = TAF.PT.WorkingDocuments || {};

TAF.PT.WorkingDocuments.Summary = function _Summary() {
    var summary = {
        numberOfEntries : 0,
        totalDebit : 0,
        totalCredit : 0
    };
    return summary;
};

TAF.PT.WorkingDocuments.WorkDocument = function _WorkDocument() {
    // Used for header, footer, line
    var workDoc = {
        documentNumber : '',
        ATCUD : '',
        workStatus : '',
        workStatusDate : '',
        sourceIdDocumentStatus : '',
        sourceBilling: '',
        hash : '',
        workDate : '',
        workType : '',
        sourceId : '',
        systemEntryDate : '',
        customerId : '',
        lineNumber : '',
        productCode : '',
        productDescription : '',
        quantity : '',
        unitOfMeasure : '',
        unitPrice : '',
        taxPointDate : '',
        description : '',
        taxPayable : '',
        netTotal : '',
        grossTotal : '',
        creditAmount : '',
        serialNumber : ''
    };
    return workDoc;
};

TAF.PT.WorkingDocuments.NodeAdapter = function _NodeAdapter(state) {
    // Constants
    this.PRODUCT_CODE_SEPARATOR = ' - ';
    this.WORK_STATUS = {
        'cancelled' : 'A',
        'closed'    : 'A',
        DEFAULT     : 'N'
    };
    this.DEFAULT_VALUES = {
        WORK_TYPE : 'DC',
        ATCUD : '0',
        UNIT : 'unit',
        SOURCE_BILLING : 'P'
    };

    // Set the converter state
    if (state) {
        this.state = state;
    } else {
        this.state = {
            id: -1,
            taxPayable: 0,
            netTotal: 0,
            grossTotal: 0
        };
    }
};

TAF.PT.WorkingDocuments.NodeAdapter.prototype.getSummary = function _getSummary(salesOrderSummary) {
    salesOrderSummary = salesOrderSummary || {};

    var summary = new TAF.PT.WorkingDocuments.Summary();
    summary.numberOfEntries = salesOrderSummary.tranCount || 0;
    summary.totalDebit = salesOrderSummary.debitTotal || 0;
    summary.totalCredit = salesOrderSummary.creditTotal || 0;
    return summary;
};

TAF.PT.WorkingDocuments.NodeAdapter.prototype.getWorkDocument = function _getWorkDocument(salesOrder) {
    var workDoc = new TAF.PT.WorkingDocuments.WorkDocument();

    if (!salesOrder) {
        workDoc.taxPayable = this.state.taxPayable;
        workDoc.netTotal   = this.state.netTotal;
        workDoc.grossTotal = this.state.grossTotal;
        return workDoc;
    }

    // Set Work doc fields
    workDoc.documentNumber = salesOrder.ptTranId;
    workDoc.ATCUD = this.DEFAULT_VALUES.ATCUD;
    workDoc.workStatus = this.WORK_STATUS[salesOrder.status] || this.WORK_STATUS.DEFAULT;
    workDoc.workStatusDate = salesOrder.dateCreated;
    workDoc.sourceIdDocumentStatus = salesOrder.setBy || salesOrder.createdBy || '';
    workDoc.sourceBilling = this.DEFAULT_VALUES.SOURCE_BILLING;
    workDoc.hash = salesOrder.ptSignature;
    workDoc.workDate = salesOrder.date;
    workDoc.sourceId = salesOrder.createdBy;
    workDoc.systemEntryDate = salesOrder.date;
    workDoc.customerId = salesOrder.customerId;
    workDoc.lineNumber = salesOrder.line;
    workDoc.productCode = salesOrder.itemInternalId + this.PRODUCT_CODE_SEPARATOR + salesOrder.itemId;
    workDoc.productDescription = salesOrder.itemName || 'Desconhecido';
    workDoc.quantity = salesOrder.quantity;
    workDoc.unitOfMeasure = salesOrder.unitOfMeasure || this.DEFAULT_VALUES.UNIT;
    workDoc.unitPrice = Number(salesOrder.rate) || (Number(salesOrder.amount || 0) / Number(salesOrder.quantity || 1)) || 0;
//    workDoc.taxBase = Number(salesOrder.amount) || 0; -- excluded pending clarification
    workDoc.taxPointDate = salesOrder.shipDate;
    workDoc.description = salesOrder.memo || salesOrder.itemId || '';
    workDoc.workType = this.DEFAULT_VALUES.WORK_TYPE;
    workDoc.serialNumber = salesOrder.serialNumber || '';
    workDoc.creditAmount = salesOrder.creditAmount || 0;

    // Set totals
    if (salesOrder.id == this.state.id) {
        workDoc.taxPayable = Number(salesOrder.taxAmount || 0) + Number(this.state.taxPayable);
        workDoc.netTotal   = Number(salesOrder.netAmount || 0) + Number(this.state.netTotal);
        workDoc.grossTotal = Number(salesOrder.grossAmount || 0) + Number(this.state.grossTotal);
    } else {
        workDoc.taxPayable = Number(salesOrder.taxAmount || 0);
        workDoc.netTotal   = Number(salesOrder.netAmount || 0);
        workDoc.grossTotal = Number(salesOrder.grossAmount || 0);
    }

    // Update state
    this.state.taxPayable = workDoc.taxPayable;
    this.state.netTotal   = workDoc.netTotal;
    this.state.grossTotal = workDoc.grossTotal;
    this.state.id = salesOrder.id;

    return workDoc;
};
