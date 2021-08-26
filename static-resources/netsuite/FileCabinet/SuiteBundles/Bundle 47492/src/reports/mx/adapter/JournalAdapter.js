/**
 * Copyright � 2015, 2017, 2019 Oracle and/or its affiliates. All rights reserved.
 */ 

var TAF = TAF || {};
TAF.MX = TAF.MX || {};
TAF.MX.Adapter = TAF.MX.Adapter || {};

TAF.MX.Adapter.JournalType = {
    CHECK          : 'CHECK',
    TRANSFER       : 'TRANSFER',
    OTHER_PAYMENTS : 'OTHER_PAYMENTS',
    STANDARD       : 'STANDARD',
    SKIPPED        : 'SKIPPED',
    VENDOR_PAYMENTS : 'VENDOR_PAYMENTS'
};

TAF.MX.Adapter.JournalHeader = function() {
    return {
        RFC : '',
        month : '',
        year : '',
        submissionType : '',
        ordenNumber : '',
        tramiteNumber : ''
    };
};

TAF.MX.Adapter.JournalInfo = function() {
    return {
        hasPreviousTxn : false,
        isNewPolicy : false,
        journalType : TAF.MX.Adapter.JournalType.STANDARD,
   };
};

TAF.MX.Adapter.JournalPolicy = function() {
    return {
        referenceNumber : '',
        date : '',
        concept : '',
   };
};

TAF.MX.Adapter.JournalTransaction = function() {
    return {
        accountNumber : '',
        accountName : '',
        debit : 0,
        credit : 0,
        checkNumber : '',
        bankID : '',
        bankAccountNumber : '',
        payee : '',
        RFC : '',
        amount : 0,
        toBankAccountNumber : '',
        toBankID : '',
        paymentMethod : '',
        date : '',
        concept : '',
        currency: '',
        exchangeRate: ''
   };
};

TAF.MX.Adapter.JournalAdapter = function(state) {
    this.JOURNAL_TYPE_MAP = {
        'Check'    : TAF.MX.Adapter.JournalType.CHECK,
        'Transfer' : TAF.MX.Adapter.JournalType.TRANSFER,
        'VendPymt' : TAF.MX.Adapter.JournalType.VENDOR_PAYMENTS,
        'CustPymt' : TAF.MX.Adapter.JournalType.OTHER_PAYMENTS
    };
    this.DEFAULT_PAYMENT_METHOD = {
        'VendPymt' : 98,
        'CustPymt' : 1
    };
    this.PAYMENT_METHOD_TYPE = {
        '02': 'CHECK',
        '03': 'TRANSFER'
    };

    if (!state) {
        throw nlapiCreateError('DATA_ERROR', 'TAF.MX.Adapter.JournalAdapter: Parameter is invalid');
    }

    this.state = state;
    if (this.state.isOneWorld) {
        this.state.payee = this.state.subsidiary.name;
        this.state.RFC = this.state.subsidiary.vatNumber;
    } else {
        this.state.payee = this.state.company.companyName;
        this.state.RFC = this.state.company.employerId || this.state.company.taxNumber || this.state.company.taxId;
    }
};

TAF.MX.Adapter.JournalAdapter.prototype.getHeaderData = function(rawHeader) {
    if (!rawHeader) {
        throw nlapiCreateError('DATA_ERROR', 'TAF.MX.Adapter.JournalAdapter.getHeaderData: Parameter is invalid');
    }

    var header = new TAF.MX.Adapter.JournalHeader();

    try {
        header.RFC = this.state.RFC;
        var period = nlapiStringToDate(rawHeader.period.endDate);
        header.year = period.getFullYear().toString();
        header.month = (period.getMonth() + 1).toString();
        header.submissionType = rawHeader.config.tipoSolicitud;
        header.ordenNumber = rawHeader.config.numOrden;
        header.tramiteNumber = rawHeader.config.numTramite;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.MX.Adapter.JournalAdapter.getHeaderData', ex.toString());
        throw nlapiCreateError('DATA_ERROR', 'TAF.MX.Adapter.JournalAdapter.getHeaderData');
    }

    return header;
};

TAF.MX.Adapter.JournalAdapter.prototype.getJournalLine = function(rawData) {
    var type = this.getTransactionType(rawData.mxPaymentMethod) || rawData.type;
    if (type.toUpperCase() === 'TRANSFER') {
        return this.getTransferJournalLine(rawData);
    } else {
        return this.getNonTransferJournalLine(rawData);
    }
};

TAF.MX.Adapter.JournalAdapter.prototype.getTransactionType = function(mxPaymentMethod) {
    if (!mxPaymentMethod) {
        return;
    }
    var paymentMethod = this.state.paymentMap[mxPaymentMethod] ? this.state.paymentMap[mxPaymentMethod].value_text : '';
    var transactionType = this.PAYMENT_METHOD_TYPE[paymentMethod];
    return transactionType;
};

TAF.MX.Adapter.JournalAdapter.prototype.getNonTransferJournalLine = function(rawData) {
    var info = this.getLineInfo(rawData);
    var policy = this.getPolicy(rawData);
    var transaction = this.getTransaction(rawData);

    var journal = {
        info : info,
        policy : policy,
        transaction : transaction
    };

    return journal;
};

TAF.MX.Adapter.JournalAdapter.prototype.getTransferJournalLine = function(rawData) {
    var info = this.getTransferLineInfo(rawData);
    var policy = this.getPolicy(rawData);
    var transaction = this.getTransaction(rawData);
    var journal = {
        info : info,
        policy : policy
    };

    if (rawData.isMainline) {
        this.state.mainTransferLine = transaction;
    } else {
        journal.mainTransfer = this.getMainTransferLine(transaction);
        journal.transaction = transaction;
    }

    return journal;
};

TAF.MX.Adapter.JournalAdapter.prototype.getLineInfo = function(rawData) {
    if (!rawData) {
        throw nlapiCreateError('DATA_ERROR', 'TAF.MX.Adapter.JournalAdapter.getLineInfo: Parameter is invalid');
    }

    var info = new TAF.MX.Adapter.JournalInfo();

    try {
        info.isNewPolicy = this.state.hasPreviousTxn ? (this.state.previousTxnId != rawData.id) : true;
        info.hasPreviousTxn = this.state.hasPreviousTxn;

        if (info.isNewPolicy) {
            info.journalType = this.getTransactionType(rawData.mxPaymentMethod) || this.JOURNAL_TYPE_MAP[rawData.type] || TAF.MX.Adapter.JournalType.STANDARD;
        } else if (rawData.accountId) {
            info.journalType = TAF.MX.Adapter.JournalType.STANDARD;
        } else {
            // Lines with no account should still have the header written
            info.journalType = TAF.MX.Adapter.JournalType.SKIPPED;
        }

        this.state.hasPreviousTxn = true;
        this.state.previousTxnId = rawData.id;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.MX.Adapter.JournalAdapter.getLineInfo', ex.toString());
        throw nlapiCreateError('DATA_ERROR', 'TAF.MX.Adapter.JournalAdapter.getLineInfo');
    }
    return info;
};

TAF.MX.Adapter.JournalAdapter.prototype.getTransferLineInfo = function(rawData) {
    if (!rawData) {
        throw nlapiCreateError('DATA_ERROR', 'TAF.MX.Adapter.JournalAdapter.getTransferLineInfo: Parameter is invalid');
    }

    var info = new TAF.MX.Adapter.JournalInfo();

    try {
        if (rawData.isMainline) {
            info.journalType = TAF.MX.Adapter.JournalType.SKIPPED;
        } else {
            info.isNewPolicy = true;
            info.hasPreviousTxn = this.state.hasPreviousTxn;
            this.state.hasPreviousTxn = true;
            info.journalType = TAF.MX.Adapter.JournalType.TRANSFER;
        }

        this.state.previousTxnId = rawData.id;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.MX.Adapter.JournalAdapter.getTransferLineInfo', ex.toString());
        throw nlapiCreateError('DATA_ERROR', 'TAF.MX.Adapter.JournalAdapter.getTransferLineInfo');
    }

    return info;
};

TAF.MX.Adapter.JournalAdapter.prototype.getPolicy = function(rawData) {
    if (!rawData) {
        throw nlapiCreateError('DATA_ERROR', 'TAF.MX.Adapter.JournalAdapter.getPolicy: Parameter is invalid');
    }

    var policy = new TAF.MX.Adapter.JournalPolicy();

    try {
        policy.referenceNumber = rawData.typeText + ' ' +  rawData.glNumber;
        policy.date = rawData.tranDate;
        policy.concept = this.getConcept(rawData, true);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.MX.Adapter.JournalAdapter.getPolicy', ex.toString());
        throw nlapiCreateError('DATA_ERROR', 'TAF.MX.Adapter.JournalAdapter.getPolicy');
    }

    return policy;
};

TAF.MX.Adapter.JournalAdapter.prototype.getConcept = function(rawData, isHeader) {
    if (!rawData) {
        throw nlapiCreateError('DATA_ERROR', 'TAF.MX.Adapter.JournalAdapter.getConcept: Parameter is invalid');
    }

    var memo = isHeader ? rawData.memoMain : (rawData.memo || rawData.memoMain);
    
    return memo ? rawData.typeText + ' ' + memo : rawData.typeText;
};

TAF.MX.Adapter.JournalAdapter.prototype.getTransaction = function(rawData) {
    if (!rawData) {
        throw nlapiCreateError('DATA_ERROR', 'TAF.MX.Adapter.JournalAdapter.getTransaction: Parameter is invalid');
    }

    var txn = new TAF.MX.Adapter.JournalTransaction();

    try {
        var account = this.state.accounts[rawData.accountId];
        if (account) {
            txn.accountNumber = account.number;
            txn.accountName = account.name;
            txn.bankAccountNumber = account.bankNumber;
        }

        if(rawData.type === 'CustPymt') {
            rawData.mxPaymentMethod = rawData.paymentMethod;
        }

        txn.isForeign = this.isForeign(rawData);
        txn.concept = this.getConcept(rawData);
        txn.debit = rawData.debitAmount;
        txn.credit = rawData.creditAmount;
        txn.checkNumber = rawData.tranId;
        txn.bankID = this.getBankID(rawData.accountId);
        txn.payee = rawData.entity || this.state.payee;
        txn.RFC = rawData.entityRFC || rawData.entityTaxNumber;
        txn.amount = rawData.amount;
        txn.date = rawData.tranDate;
        txn.paymentMethod = this.getPaymentMethod(rawData.type, rawData.mxPaymentMethod);
        txn.toBankAccountNumber = rawData.mxAccountNumber;
        txn.toBankID = this.getBankID(rawData.mxBankName);

        if (this.state.isMultiCurrency) {
            var txnCurrency = this.state.currency[rawData.currency] ? this.state.currency[rawData.currency].symbol : '';
            txn.currency = txnCurrency && this.state.baseCurrency !== txnCurrency ? txnCurrency : '';
            txn.exchangeRate = txnCurrency && this.state.baseCurrency !== txnCurrency ? rawData.exchangeRate : '';
        } else {
            txn.currency = '';
            txn.exchangeRate = '';
        }

    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.MX.Adapter.JournalAdapter.getTransaction', ex.toString());
        throw nlapiCreateError('DATA_ERROR', 'TAF.MX.Adapter.JournalAdapter.getTransaction');
    }

    return txn;
};

TAF.MX.Adapter.JournalAdapter.prototype.getBankID = function(accountId) {
    return accountId && this.state.bankMap[accountId] ? this.state.bankMap[accountId].value_text || '' : '';
};

TAF.MX.Adapter.JournalAdapter.prototype.getPaymentMethod = function(type, paymentMethod) {
    var defaultPayment = this.DEFAULT_PAYMENT_METHOD[type] || '';
    return paymentMethod && this.state.paymentMap[paymentMethod] ? this.state.paymentMap[paymentMethod].value_text || defaultPayment : defaultPayment;
};

TAF.MX.Adapter.JournalAdapter.prototype.getMainTransferLine = function(txn) {
    var mainTransfer = this.state.mainTransferLine || {};
    mainTransfer.toBankAccountNumber = txn.toBankAccountNumber || txn.bankAccountNumber;
    mainTransfer.toBankID = txn.toBankID || txn.bankID;
    mainTransfer.RFC = txn.RFC || this.state.RFC;
    return mainTransfer;
};

TAF.MX.Adapter.JournalAdapter.prototype.isForeign = function(data) {
    return (data.billingCountry || data.subsidiaryCountry || 'MX') !== 'MX';
};

TAF.MX.Adapter.AccountAdapter = function() {
    // add default implementation here
};

TAF.MX.Adapter.AccountAdapter.prototype.getAccountObj = function(raw, usesAccountingContext) {
    var accounts = {};

    try {
        for (var id in raw) {
            var accountName = null;
            var accountNumber = null;
            var origName = null;
            var origNumber = null;
            
            if(usesAccountingContext) {
                accountName = raw[id].getLocalizedName();
                accountNumber = raw[id].getLocalizedNumber();
            } else {
                accountName = raw[id].getSCOAName();
                accountNumber = raw[id].getSCOANumber();
            }
            
            origName = raw[id].getAccountName();
            origNumber = raw[id].getAccountNumber() || id;
            
            accounts[id] = {
                number : accountNumber || raw[id].getAccountNumber() || id,
                name : accountName || raw[id].getAccountName(),
                bankNumber : raw[id].getBankNumber(),
            };
            //CSVDao use
            if(origName!=accounts[id].name){
                accounts[id].origName = origName;
            }
            
            if(origNumber!=accounts[id].number){
                accounts[id].origNumber = origNumber;
            }
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.MX.Adapter.JournalAdapter.getAccountObj', ex.toString());
        throw nlapiCreateError('DATA_ERROR', 'TAF.MX.Adapter.JournalAdapter.getAccountObj');
    }

    return accounts;
};