/**
 * Copyright 2015 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.MX = TAF.MX || {};
TAF.MX.Formatter = TAF.MX.Formatter || {};

TAF.MX.Formatter.FieldDefinitions = function _FieldDefinitions() {
};
TAF.MX.Formatter.FieldDefinitions.prototype.getFields = function _getFields() {
    var fields = {
        version: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 100
        },
        RFC: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 13
        },
        totalAccounts: {
            type: TAF.Formatter.FieldTypes.INTEGER,
            width: 100
        },
        month: {
            type: TAF.Formatter.FieldTypes.INTEGER_PADDED,
            width: 2
        },
        year: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 4
        },
        accountType: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 1
        },
        accountLevel: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 2
        },
        description: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 200
        },
        accountNumber: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 100
        },
        groupCode: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 12
        },
        debit: {
            type: TAF.Formatter.FieldTypes.DECIMAL,
            width: 26
        },
        credit: {
            type: TAF.Formatter.FieldTypes.DECIMAL,
            width: 26
        },
        openingBalance: {
            type: TAF.Formatter.FieldTypes.DECIMAL,
            width: 26
        },
        closingBalance: {
            type: TAF.Formatter.FieldTypes.DECIMAL,
            width: 26
        },
        submissionType: {
            type: TAF.Formatter.FieldTypes.TEXT
        },
        ordenNumber: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 13
        },
        tramiteNumber: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 14
        },
        referenceNumber: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 50
        },
        concept: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 300
        },
        accountNumber: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 100
        },
        accountName: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 100
        },
        checkNumber: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 20
        },
        bankID: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 3
        },
        bankAccountNumber: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 50
        },
        payee: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 300
        },
        amount: {
            type: TAF.Formatter.FieldTypes.UNSIGNED_DECIMAL,
            width: 26
        },
        toBankAccountNumber: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 50
        },
        toBankID: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 3
        },
        paymentMethod: {
            type: TAF.Formatter.FieldTypes.INTEGER_PADDED,
            width: 2
        },
        UUID: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 36
        },
        date: {
            type: TAF.Formatter.FieldTypes.DATE
        },
        vendorType: {
        	type: TAF.Formatter.FieldTypes.TEXT,
            width: 2
        },
        operationType: {
        	type: TAF.Formatter.FieldTypes.TEXT,
            width: 2
        },
        nonMXVendorTaxID: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 13
        },
        vendorName: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 100
        },
        nonMXCountry: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 2
        },
        nonMXNationality: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 100
        },
        currency: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 3
        },
        exchangeRate: {
            type: TAF.Formatter.FieldTypes.DECIMAL,
            width: 26,
            defaultValue: ''
        },
        dateCreated: {
            type: TAF.Formatter.FieldTypes.DATE,
            dateFormat: 'yyyy-MM-dd'
        }
//        S_net: {
//            type: TAF.Formatter.FieldTypes.TEXT,
//            width: 18
//        },
//        DS_net: {
//            type: TAF.Formatter.FieldTypes.TEXT,
//            width: 18
//        },
//        S_tax: {
//            type: TAF.Formatter.FieldTypes.TEXT,
//            width: 18
//        },
//        R_net: {
//            type: TAF.Formatter.FieldTypes.TEXT,
//            width: 18
//        },
//        DR_net: {
//            type: TAF.Formatter.FieldTypes.TEXT,
//            width: 18
//        },
//        R_tax: {
//            type: TAF.Formatter.FieldTypes.TEXT,
//            width: 18
//        },
//        IS_net: {
//            type: TAF.Formatter.FieldTypes.TEXT,
//            width: 18
//        },
//        IS_tax: {
//            type: TAF.Formatter.FieldTypes.TEXT,
//            width: 18
//        },
//        IR_net: {
//            type: TAF.Formatter.FieldTypes.TEXT,
//            width: 18
//        },
//        IR_tax: {
//            type: TAF.Formatter.FieldTypes.TEXT,
//            width: 18
//        },
//        IE_net: {
//            type: TAF.Formatter.FieldTypes.TEXT,
//            width: 18
//        },
//        Z_IZ_net: {
//            type: TAF.Formatter.FieldTypes.TEXT,
//            width: 18
//        },
//        E_net: {
//            type: TAF.Formatter.FieldTypes.TEXT,
//            width: 18
//        },
//        wtax: {
//            type: TAF.Formatter.FieldTypes.TEXT,
//            width: 18
//        },
//        paidDiscount: {
//            type: TAF.Formatter.FieldTypes.TEXT,
//            width: 18
//        }
    };	
    return fields;
};

TAF.MX.Formatter.SAT = function _SAT() {
    TAF.Formatter.ReportFormatter.call(this);
    this.fields = new TAF.MX.Formatter.FieldDefinitions().getFields();
    
    this.TEMPLATE = {};
    this.TEMPLATE.COA_HEADER = '';
    this.TEMPLATE.COA_BODY = '';
    this.TEMPLATE.COA_FOOTER = '';
    
    this.TEMPLATE.AUX_HEADER_TRAMITE = '';
    this.TEMPLATE.AUX_HEADER_ORDEN = '';
    this.TEMPLATE.AUX_ACCOUNT_HEADER = '';
    this.TEMPLATE.AUX_LINE = '';
    this.TEMPLATE.AUX_ACCOUNT_FOOTER = '';
    this.TEMPLATE.AUX_FOOTER = '';
    
    this.TEMPLATE.BALANCE_HEADER = '';
    this.TEMPLATE.BALANCE_BODY = '';
    this.TEMPLATE.BALANCE_FOOTER = '';
    
    this.TEMPLATE.JOURNAL_HEADER = '';
    this.TEMPLATE.JOURNAL_POLICY_HEADER = '';
    this.TEMPLATE.JOURNAL_TRANSACTION = '';
    this.TEMPLATE.JOURNAL_TRANSFER = '';
    this.TEMPLATE.JOURNAL_COMPNAL = '';
    this.TEMPLATE.JOURNAL_COMPEXT = '';
    this.TEMPLATE.JOURNAL_CHECK = '';
    this.TEMPLATE.JOURNAL_OTHERS = '';
    this.TEMPLATE.JOURNAL_POLICY_FOOTER = '';
    this.TEMPLATE.JOURNAL_FOOTER = '';
    
    this.TEMPLATE.DIOT_LINE = '';
    
    this.FILENAME_COA = '';
    this.FILENAME_JOURNAL = '';
    this.FILENAME_TRIALBALANCE = '';
    this.FILENAME_AUX = '';
    
    this.isXML = true;
};
TAF.MX.Formatter.SAT.prototype = Object
    .create(TAF.Formatter.ReportFormatter.prototype);

TAF.MX.Formatter.SAT.prototype.formatHeader = function _formatCOAHeader(data) {
    return this.TEMPLATE.HEADER;
};

TAF.MX.Formatter.SAT.prototype.formatCOAHeader = function _formatCOAHeader(data) {
    return this.formatElement(data, this.TEMPLATE.COA_HEADER);
};

TAF.MX.Formatter.SAT.prototype.formatCOABody = function _formatCOABody(data) {
    return this.formatElement(data, this.TEMPLATE.COA_BODY);
};

TAF.MX.Formatter.SAT.prototype.formatCOAFooter = function _formatCOAFooter() {
    return this.TEMPLATE.COA_FOOTER;
};

TAF.MX.Formatter.SAT.prototype.formatAuxiliaryHeaderTramite = function _formatAuxiliaryHeaderTramite(data) {
    return this.formatElement(data, this.TEMPLATE.AUX_HEADER_TRAMITE);
};

TAF.MX.Formatter.SAT.prototype.formatAuxiliaryHeaderOrden = function _formatAuxiliaryHeaderOrden(data) {
    return this.formatElement(data, this.TEMPLATE.AUX_HEADER_ORDEN);
};


TAF.MX.Formatter.SAT.prototype.formatAuxiliaryAccountHeader = function _formatAuxiliaryAccountHeader(data) {
    return this.formatElement(data, this.TEMPLATE.AUX_ACCOUNT_HEADER);
};


TAF.MX.Formatter.SAT.prototype.formatAuxiliaryLine = function _formatAuxiliaryLine(data) {
    return this.formatElement(data, this.TEMPLATE.AUX_LINE);
};


TAF.MX.Formatter.SAT.prototype.formatAuxiliaryAccountFooter = function _formatAuxiliaryAccountFooter() {
    return this.TEMPLATE.AUX_ACCOUNT_FOOTER;
};


TAF.MX.Formatter.SAT.prototype.formatAuxiliaryFooter = function _formatAuxiliaryFooter() {
    return this.TEMPLATE.AUX_FOOTER;
};


TAF.MX.Formatter.SAT.prototype.formatBalanceHeader = function _formatBalanceHeader(data) {
    return this.formatElement(data, this.TEMPLATE.BALANCE_HEADER);
};

TAF.MX.Formatter.SAT.prototype.formatComplementaryBalanceHeader = function _formatComplementaryBalanceHeader(data) {
    return this.formatElement(data, this.TEMPLATE.COMPLEMENTARY_BALANCE_HEADER);
};

TAF.MX.Formatter.SAT.prototype.formatBalanceBody = function _formatBalanceBody(data) {
    return this.formatElement(data, this.TEMPLATE.BALANCE_BODY);
};

TAF.MX.Formatter.SAT.prototype.formatBalanceFooter = function _formatBalanceFooter() {
    return this.TEMPLATE.BALANCE_FOOTER;
};

TAF.MX.Formatter.SAT.prototype.formatJournalHeaderTramite = function _formatJournalHeaderTramite(data) {
    return this.formatElement(data, this.TEMPLATE.JOURNAL_HEADER_TRAMITE);
};

TAF.MX.Formatter.SAT.prototype.formatJournalHeaderOrden = function _formatJournalHeaderOrden(data) {
    return this.formatElement(data, this.TEMPLATE.JOURNAL_HEADER_ORDEN);
};

TAF.MX.Formatter.SAT.prototype.formatJournalPolicyHeader = function _formatJournalPolicyHeader(data) {
    return this.formatElement(data, this.TEMPLATE.JOURNAL_POLICY_HEADER);
};

TAF.MX.Formatter.SAT.prototype.formatJournalTransaction = function _formatJournalTransaction(data) {
    return this.formatElement(data, this.TEMPLATE.JOURNAL_TRANSACTION);
};

TAF.MX.Formatter.SAT.prototype.formatJournalTransfer = function _formatJournalTransfer(data) {
    return this.formatElement(data, this.TEMPLATE.JOURNAL_TRANSFER);
};

TAF.MX.Formatter.SAT.prototype.formatJournalCheck = function _formatJournalCheck(data) {
    return this.formatElement(data, this.TEMPLATE.JOURNAL_CHECK);
};

TAF.MX.Formatter.SAT.prototype.formatJournalCompNal = function _formatJournalCompNal(data) {
    return this.formatElement(data, this.TEMPLATE.JOURNAL_COMPNAL);
};

TAF.MX.Formatter.SAT.prototype.formatJournalCompExt = function _formatJournalCompExt(data) {
    return this.formatElement(data, this.TEMPLATE.JOURNAL_COMPEXT);
};

TAF.MX.Formatter.SAT.prototype.formatJournalOthers = function _formatJournalOthers(data) {
    return this.formatElement(data, this.TEMPLATE.JOURNAL_OTHERS);
};

TAF.MX.Formatter.SAT.prototype.formatVendorPayments = function _formatVendorPayments(data) {
    return this.formatElement(data, this.TEMPLATE.VENDOR_PAYMENTS);
};

TAF.MX.Formatter.SAT.prototype.formatJournalPolicyFooter = function _formatJournalPolicyFooter() {
    return this.TEMPLATE.JOURNAL_POLICY_FOOTER;
};

TAF.MX.Formatter.SAT.prototype.formatJournalFooter = function _formatJournalFooter() {
    return this.TEMPLATE.JOURNAL_FOOTER;
};

TAF.MX.Formatter.SAT.prototype.formatCOAFilename = function _formatCOAFilename(data) {
    return this.formatElement(data, this.FILENAME_COA);
};

TAF.MX.Formatter.SAT.prototype.formatJournalFilename = function _formatformatJournalFilename(data) {
	return this.formatElement(data, this.FILENAME_JOURNAL);
};

TAF.MX.Formatter.SAT.prototype.formatTrialBalanceFilename = function _formatTrialBalanceFilename(data) {
	return this.formatElement(data, this.FILENAME_TRIALBALANCE);
};

TAF.MX.Formatter.SAT.prototype.formatAuxiliaryFilename = function _formatCOAFilename(data) {
    return this.formatElement(data, this.FILENAME_AUX);
};

TAF.MX.Formatter.SAT.prototype.formatDIOTLine = function _formatDIOTLine(data) {
    return this.formatElement(data, this.TEMPLATE.DIOT_LINE);
};
