/**
 * Copyright 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.OECD = TAF.OECD || {};
TAF.OECD.PaymentsAdapter = TAF.OECD.PaymentsAdapter || {};

TAF.OECD.Payment = function _Payment() {
    var payment = {
        invoiceNo: '',
        transactionDate: '',
        description: ''
    };
    return payment;
};

TAF.OECD.PaymentLine = function _PaymentLine() {
    var paymentLine = {
        amountTag: '',
        amount: '',
        lineNumber: '',
        accountId: '',
        description: '',
        isDebit: false
    };
    return paymentLine;
};

TAF.OECD.PaymentsAdapter = function _Payments(accounts) {
    if (!accounts) {
        throw nlapiCreateError('MISSING_PARAMETER', 'accounts is required');
    }
    this.accounts = accounts;
};

TAF.OECD.PaymentsAdapter.prototype.getInvoiceNo = function _getInvoiceNo(line) {
    if (!line) {
        throw nlapiCreateError('MISSING_PARAMETER', 'line is required');
    }
    return line.tranId || [line.type, line.id].join('-');
};

TAF.OECD.PaymentsAdapter.prototype.getPayment = function _getPayment(line) {
    if (!line) {
        throw nlapiCreateError('MISSING_PARAMETER', 'line is required');
    }

    var payment = new TAF.OECD.Payment();

    payment.invoiceNo = this.getInvoiceNo(line);
    payment.transactionDate = nlapiStringToDate(line.date);
    payment.description = line.memoMain || '(NONE)';

    return payment;
};

TAF.OECD.PaymentsAdapter.prototype.getPaymentLine = function _getPaymentLine(line) {
    if (!line) {
        throw nlapiCreateError('MISSING_PARAMETER', 'line is required');
    }

    var paymentLine = new TAF.OECD.PaymentLine();
    var debitAmount = line.debitAmount || 0;
    var creditAmount = line.creditAmount || 0;
    var account = this.accounts[line.account];

    paymentLine.amountTag = debitAmount > 0 ? 'DebitAmount' : 'CreditAmount';
    paymentLine.amount = debitAmount || creditAmount || '';
    paymentLine.description = line.memo || line.memoMain || '(NONE)';
    paymentLine.lineNumber = line.line;
    paymentLine.accountId = account ? account.getAccountNumber() : '';

    return paymentLine;
};
