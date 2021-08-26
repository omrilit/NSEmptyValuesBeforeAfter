/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.MY = TAF.MY || {};
TAF.MY.DAO = TAF.MY.DAO || {};

TAF.MY.DAO.JournalEntry = function() {
    return {
        internalId: '',
        lineNumber: '',
        account: '',
        debit: 0,
        credit: 0,
        taxCode: '',
        taxAmount: 0,
        taxAccount: ''
    };
};

TAF.MY.DAO.JournalEntryDao = function JournalEntryDao() {
    this.lines = [];
    this.internalId = '';
};

TAF.MY.DAO.JournalEntryDao.prototype.getLine = function getLine(internalId, lineNumber, recordType) {
    if (!internalId) {
        throw nlapiCreateError('MISSING_REQ_PARAM', 'An Internal ID is required.');
    }
    
    if (!lineNumber && lineNumber !== 0) {
        throw nlapiCreateError('MISSING_REQ_PARAM', 'A Line Number is required.');
    }

    if (!recordType) {
        throw nlapiCreateError('MISSING_REQ_PARAM', 'Record Type is required');
    }
    
    if (internalId != this.internalId) {
        this.internalId = internalId;
        this.lines = [];
        
        try {
            var je = nlapiLoadRecord(recordType, internalId, {recordmode: 'dynamic'});
            var lineCount = je.getLineItemCount('line');
            
            for (var i = 1; lineCount && i <= lineCount; i++) {
                this.lines.push(this.convertToJournalEntry(je, i));
            }
        } catch(e) {
            nlapiLogExecution('ERROR', 'TAF.MY.DAO.JournalEntryDao.getLine', e.toString());
            throw e;
        }
    }
        
    return this.lines[lineNumber] || null;
};

TAF.MY.DAO.JournalEntryDao.prototype.convertToJournalEntry = function convertToJournalEntry(record, lineNumber) {
    var line = new TAF.MY.DAO.JournalEntry();
    line.internalId = record.getId();
    line.lineNumber = lineNumber;
    line.account = record.getLineItemValue('line', 'account', lineNumber);
    line.debit = record.getLineItemValue('line', 'debit', lineNumber);
    line.credit = record.getLineItemValue('line', 'credit', lineNumber);
    line.taxCode = record.getLineItemValue('line', 'taxcode', lineNumber);
    line.taxAmount = record.getLineItemValue('line', 'tax1amt', lineNumber);
    line.taxAccount = record.getLineItemValue('line', 'tax1acct', lineNumber);
    
    return line;
};
