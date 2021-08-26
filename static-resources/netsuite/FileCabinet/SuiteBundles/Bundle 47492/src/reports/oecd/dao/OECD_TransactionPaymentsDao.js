/**
 * Copyright 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
 
var TAF = TAF || {};
TAF.OECD = TAF.OECD || {};
TAF.OECD.DAO = TAF.OECD.DAO || {};

TAF.OECD.DAO.TransactionPaymentsDAO = function TransactionPaymentsDAO(params) {
    TAF.DAO.SearchDAO.call(this, params);
    this.name = 'OECD_TransactionPaymentsDAO';
    this.savedSearchId = 'customsearch_taf_oecd_transaction_pymnts';
    this.recordType = 'transaction';
    this.hasForeignCurrencyManagement = this.context.getFeature('FOREIGNCURRENCYMANAGEMENT');
};

TAF.OECD.DAO.TransactionPaymentsDAO.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.OECD.DAO.TransactionPaymentsDAO.prototype.createSearchFilters = function createSearchFilters(params) {
    this.filters.push(new nlobjSearchFilter('posting', this.multiBookJoinColumn, 'is', 'T'));
    this.filters.push(new nlobjSearchFilter('accounttype', this.multiBookJoinColumn, 'noneof', ['AcctRec', 'AcctPay']));
    
    if (this.isOneWorld && params && params.subsidiary) {
        this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subsidiary));
    }
    
    if (params && params.period) {
        this.filters.push(new nlobjSearchFilter('internalid', 'accountingperiod', 'anyof', params.period));
    }
    
    if (params && params.bookId && this.isMultiBook) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
};

TAF.OECD.DAO.TransactionPaymentsDAO.prototype.createSearchColumns = function createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn));
    
    this.totalAmountColumn = params && params.bookId && this.hasForeignCurrencyManagement ?
        new nlobjSearchColumn('formulacurrency').setFormula('({totalamount} * {accountingtransaction.exchangerate}) / {exchangerate}') :
        new nlobjSearchColumn('totalamount');
    
    this.taxTotalColumn = params && params.bookId && this.hasForeignCurrencyManagement ?
        new nlobjSearchColumn('formulacurrency').setFormula('({taxtotal} * {accountingtransaction.exchangerate}) / {exchangerate}') :
        new nlobjSearchColumn('taxtotal');
    
    this.columns.push(this.totalAmountColumn, this.taxTotalColumn);
};

TAF.OECD.DAO.TransactionPaymentsDAO.prototype.rowToObject = function rowToObject(row) {
    if (!row || !row.getValue) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'A valid search result row is required.');
    }
    
    return {
        id: row.getId(),
        type: row.getValue('type'),
        tranId: row.getValue('tranid'),
        tranDate: row.getValue('trandate'),
        memoMain: row.getValue('memomain'),
        lineId: row.getValue('line'),
        memo: row.getValue('memo'),
        quantity: row.getValue('quantity'),
        account: row.getValue('account', this.multiBookJoinColumn),
        debit: row.getValue('debitamount', this.multiBookJoinColumn),
        credit: row.getValue('creditamount', this.multiBookJoinColumn),
        totalAmount: row.getValue(this.totalAmountColumn),
        taxTotal: row.getValue(this.taxTotalColumn)
    };
};
