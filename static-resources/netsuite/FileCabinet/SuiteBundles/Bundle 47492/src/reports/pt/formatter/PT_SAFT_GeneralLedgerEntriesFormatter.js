/**
 * Copyright © 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.PT = TAF.PT || {};
TAF.PT.Formatter = TAF.PT.Formatter || {};
TAF.PT.Formatter.SAFT = TAF.PT.Formatter.SAFT || {};

TAF.PT.Formatter.SAFT.GeneralLedgerEntriesFormatter = function GeneralLedgerEntriesFormatter() {
    TAF.PT.Formatter.SAFT.BaseFormatter.call(this);

    this.fields = {
        tranDate: {type: TAF.Formatter.FieldTypes.DATE},
        companyId: {type: TAF.Formatter.FieldTypes.TEXT},
        count: {type: TAF.Formatter.FieldTypes.INTEGER},
        journalDescription: {type: TAF.Formatter.FieldTypes.TEXT, width: 60},
        totalDebit: {type: TAF.Formatter.FieldTypes.DECIMAL},
        totalCredit: {type: TAF.Formatter.FieldTypes.DECIMAL},
        internalId: {type: TAF.Formatter.FieldTypes.TEXT},
        fiscalPeriod: {type: TAF.Formatter.FieldTypes.INTEGER},
        createdBy: {type: TAF.Formatter.FieldTypes.TEXT, width: 30},
        transactionDescription: {type: TAF.Formatter.FieldTypes.TEXT, width: 60},
        entityTag: {type: TAF.Formatter.FieldTypes.TEXT},
        entityId: {type: TAF.Formatter.FieldTypes.TEXT},
        lineId: {type: TAF.Formatter.FieldTypes.TEXT, width: 10},
        accountNumber: {type: TAF.Formatter.FieldTypes.TEXT, width: 30},
        entryDate: {type: TAF.Formatter.FieldTypes.TEXT},
        memo: {type: TAF.Formatter.FieldTypes.TEXT, width: 60},
        amountTag: {type: TAF.Formatter.FieldTypes.TEXT},
        amount: {type: TAF.Formatter.FieldTypes.DECIMAL}
    };

    this.templates = {
        SUMMARY: [
            '<GeneralLedgerEntries>',
                '<NumberOfEntries>{count}</NumberOfEntries>',
                '<TotalDebit>{totalDebit}</TotalDebit>',
                '<TotalCredit>{totalCredit}</TotalCredit>',
                '<Journal>',
                    '<JournalID>{companyId}</JournalID>',
                    '<Description>{journalDescription}</Description>'
        ].join(''),

	    TRANSACTION_HEADER: [
                    '<Transaction>',
                        '<TransactionID>{tranDate} {companyId} {internalId}</TransactionID>',
                        '<Period>{fiscalPeriod}</Period>',
                        '<TransactionDate>{tranDate}</TransactionDate>',
                        '<SourceID>{createdBy}</SourceID>',
                        '<Description>{transactionDescription}</Description>',
                        '<DocArchivalNumber>{internalId}</DocArchivalNumber>',
                        '<TransactionType>N</TransactionType>',
                        '<GLPostingDate>{tranDate}</GLPostingDate>'
    	].join(''),

	    TRANSACTION_HEADER_ENTITY_TAG: '<{entityTag}>{entityId}</{entityTag}>',
	    
	    JOURNAL_LINE: {
	        HEADER: '<Lines>',
	        FOOTER: '</Lines>'
	    },

	    TRANSACTION_LINE: [
                        '<{lineTag}>',
                            '<RecordID>{lineId}</RecordID>',
                            '<AccountID>{accountNumber}</AccountID>',
                            '<SystemEntryDate>{entryDate}</SystemEntryDate>',
                            '<Description>{memo}</Description>',
                            '<{amountTag}>{amount}</{amountTag}>',
                        '</{lineTag}>'
    	].join(''),

    	TRANSACTION_FOOTER:
	                '</Transaction>',

        FOOTER: [
                '</Journal>',
            '</GeneralLedgerEntries>'
        ].join('')
    };
};

TAF.PT.Formatter.SAFT.GeneralLedgerEntriesFormatter.prototype = Object.create(TAF.PT.Formatter.SAFT.BaseFormatter.prototype);

TAF.PT.Formatter.SAFT.GeneralLedgerEntriesFormatter.prototype.formatSummary = function formatSummary(data) {
    return this.formatElement(data, this.templates.SUMMARY);
};

TAF.PT.Formatter.SAFT.GeneralLedgerEntriesFormatter.prototype.formatTransactionHeader = function formatTransactionHeader(data) {
    return this.formatElement(data, this.templates.TRANSACTION_HEADER);
};

TAF.PT.Formatter.SAFT.GeneralLedgerEntriesFormatter.prototype.formatTransactionHeaderEntityTag = function formatTransactionHeaderEntityTag(data) {
    return this.formatElement(data, this.templates.TRANSACTION_HEADER_ENTITY_TAG);
};

TAF.PT.Formatter.SAFT.GeneralLedgerEntriesFormatter.prototype.formatJournalLineHeader = function formatJournalLineHeader() {
    return this.formatElement({}, this.templates.JOURNAL_LINE.HEADER);
};

TAF.PT.Formatter.SAFT.GeneralLedgerEntriesFormatter.prototype.formatTransactionLine = function formatTransactionLine(data) {
    return this.formatElement(data, this.templates.TRANSACTION_LINE);
};

TAF.PT.Formatter.SAFT.GeneralLedgerEntriesFormatter.prototype.formatJournalLineFooter = function formatJournalLineFooter() {
    return this.formatElement({}, this.templates.JOURNAL_LINE.FOOTER);
};

TAF.PT.Formatter.SAFT.GeneralLedgerEntriesFormatter.prototype.formatTransactionFooter = function formatTransactionFooter() {
    return this.formatElement({}, this.templates.TRANSACTION_FOOTER);
};

TAF.PT.Formatter.SAFT.GeneralLedgerEntriesFormatter.prototype.formatFooter = function formatFooter() {
    return this.formatElement({}, this.templates.FOOTER);
};
