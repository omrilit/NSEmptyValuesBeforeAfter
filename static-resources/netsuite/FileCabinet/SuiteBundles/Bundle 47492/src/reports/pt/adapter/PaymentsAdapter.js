/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.PT = TAF.PT || {};
TAF.PT.Payments = TAF.PT.Payments || {};

TAF.PT.Payments.Summary = function _Summary() {
    var summary = {
        numberOfEntries : 0,
        totalDebit : 0,
        totalCredit : 0
    };
    return summary;
};

TAF.PT.Payments.Payment = function _Payment() {
    // Used for header, footer, line
    var payment = {
        paymentRefNo : '',
        transactionDate : '',
        paymentType : '',
        paymentStatus : '',
        paymentStatusDate : '',
        sourceIdDocumentStatus : '',
        sourcePayment : '',
        sourceId : '',
        systemEntryDate : '',
        customerId : '',
        lineNumber : '',
        originatingOn : '',
        invoiceDate : '',
        debitAmount : '',
        creditAmount : '',
        taxPayable : '',
        netTotal : '',
        grossTotal : '',
    };
    return payment;
};

TAF.PT.Payments.NodeAdapter = function _NodeAdapter(state) {
    // Constants
    this.DEFAULT_VALUES = {
        UNKNOWN : 'Desconhecido',
        PAYMENT_TYPE : 'RG',
        SOURCE_PAYMENT : 'P'
    };
    this.PAYMENT_STATUS = {
        CANCELLED : 'A',
        NORMAL : 'N'
    };

    this.state = state;
};

TAF.PT.Payments.NodeAdapter.prototype.getSummary = function _getSummary(paymentSummary) {
    var summary = new TAF.PT.Payments.Summary();
    summary.numberOfEntries = paymentSummary.internalIdCount;

    summary.totalCredit = parseFloat(paymentSummary.unappliedTotal) > 0 ?
        parseFloat(paymentSummary.creditTotal) + parseFloat(paymentSummary.unappliedTotal) :
        paymentSummary.creditTotal;
    summary.totalDebit = paymentSummary.debitTotal;

    return summary;
};



TAF.PT.Payments.NodeAdapter.prototype.getPayment = function _getPayment(paymentLine, invoice) {
    var payment = new TAF.PT.Payments.Payment();

    // Set Payment fields from Payment Line
    payment.paymentRefNo = paymentLine.ptTranId;
    payment.transactionDate = paymentLine.tranDate;
    payment.paymentType = this.DEFAULT_VALUES.PAYMENT_TYPE;
    payment.paymentStatus = (paymentLine.amount == 0) ? this.PAYMENT_STATUS.CANCELLED : this.PAYMENT_STATUS.NORMAL;
    payment.paymentStatusDate = paymentLine.dateCreated;
    payment.sourceIdDocumentStatus = paymentLine.createdBy;
    payment.sourcePayment = this.DEFAULT_VALUES.SOURCE_PAYMENT;
    payment.sourceId = paymentLine.createdBy;
    payment.systemEntryDate = paymentLine.ptSystemEntryDate;
    payment.customerId = paymentLine.customerId;

    if (!paymentLine.appliedToType) { //unapplied or voided payments
        paymentLine.amount = paymentLine.amount || 0;
        payment.creditAmount = paymentLine.amount <= 0 ? Math.abs(paymentLine.amount) : 0;
        payment.debitAmount = paymentLine.amount > 0 ? paymentLine.amount : 0;
    } else {
        paymentLine.paidAmount = paymentLine.paidAmount || 0;
        payment.creditAmount = paymentLine.paidAmount >= 0 ? paymentLine.paidAmount : 0;
        payment.debitAmount = paymentLine.paidAmount < 0 ? Math.abs(paymentLine.paidAmount) : 0;
    }

    // Set Payment fields related to Invoice
    payment.invoiceDate = paymentLine.invoiceDate || paymentLine.tranDate;
    payment.originatingOn = invoice.tranId || this.DEFAULT_VALUES.UNKNOWN;

    // Set payment totals
    var lineAmount = paymentLine.appliedToType ? paymentLine.paidAmount : -paymentLine.amount;
    if (paymentLine.id == this.state.id) {
        payment.lineNumber = ++this.state.lineNo;
        payment.taxPayable = parseFloat(paymentLine.taxAmount || 0) + parseFloat(this.state.taxPayable);
        payment.netTotal   = parseFloat(lineAmount) + parseFloat(this.state.netTotal);
        payment.grossTotal = parseFloat(lineAmount) + parseFloat(this.state.grossTotal);
    } else {
        payment.lineNumber = 1;
        payment.taxPayable = paymentLine.taxAmount || 0;
        payment.netTotal   = lineAmount;
        payment.grossTotal = lineAmount;
    }

    // Update state
    this.state.id = paymentLine.id;
    this.state.lineNo = payment.lineNumber;
    this.state.taxPayable = payment.taxPayable;
    this.state.netTotal   = payment.netTotal;
    this.state.grossTotal = payment.grossTotal;

    return payment;
};


TAF.PT.Payments.NodeAdapter.prototype.getPaymentTotals = function _getPaymentTotals() {
    var payment = new TAF.PT.Payments.Payment();

    payment.taxPayable = Math.abs(this.state.taxPayable);
    payment.netTotal = Math.abs(this.state.netTotal);
    payment.grossTotal = Math.abs(this.state.grossTotal);

    return payment;
};


