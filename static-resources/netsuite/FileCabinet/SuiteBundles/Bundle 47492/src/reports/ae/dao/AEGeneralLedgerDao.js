/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.AE = TAF.AE || {};
TAF.AE.DAO = TAF.AE.DAO || {};

TAF.AE.DAO.GeneralLedgerSummary = function _GeneralLedgerSummary() {
    var summary = {
        netAmountSum     : '',
        taxAmountSum     : ''
    };
    return summary;
};

TAF.AE.DAO.GeneralLedgerSummaryDao = function _GeneralLedgerSummaryDao() {
    this.savedSearch = 'customsearch_ae_faf_generalledgersummary';
};

TAF.AE.DAO.GeneralLedgerSummaryDao.prototype.getSummary = function _getSummary(params) {
    try {
        var summary = new TAF.AE.DAO.GeneralLedgerSummary();
        var multiBookJoinColumn = params.bookId ? 'accountingtransaction' : null;
        
        var formula = "CONCAT({account.internalid}, CONCAT('-', CONCAT({internalid}, CONCAT('-',{line}))))";
        if (params.bookId) {
            formula = "CONCAT({accountingtransaction.account}, CONCAT('-', CONCAT({internalid}, CONCAT('-',{line}))))";
        }
        
        var columns = [new nlobjSearchColumn('debitamount', multiBookJoinColumn, 'sum'),
                       new nlobjSearchColumn('creditamount', multiBookJoinColumn, 'sum'),
                       new nlobjSearchColumn('formulatext', null, 'count').setFormula(formula)];
        
        var filters = [new nlobjSearchFilter('internalid', 'accountingperiod', 'anyof', params.periodIds),
                       new nlobjSearchFilter('account', multiBookJoinColumn, 'noneof', '@NONE@')];
        if (params.subIds) {
            filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subIds));
        }
        if (params.bookId) {
            filters.push(new nlobjSearchFilter('accountingbook', multiBookJoinColumn, 'is', params.bookId));
        }
        
        var result = nlapiSearchRecord('transaction', this.savedSearch, filters, columns);
        if (result && (result.length == 1)) {
            summary.debitAmount = result[0].getValue('debitamount', multiBookJoinColumn, 'sum');
            summary.creditAmount = result[0].getValue('creditamount', multiBookJoinColumn, 'sum');
        }
        
        return summary;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.AE.DAO.GeneralLedgerSummaryDao.getSummary', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'GeneralLedgerSummaryDao');
    }
};

TAF.AE.DAO.GeneralLedger = function _GeneralLedger(id) {
    var txn = {
        id                   : id,
        type                 : '',
        entity               : '',
        mainName             : '',
        tranDate             : '',
        aeInvoiceDate        : '',
        aeTrn                : '',
        number               : '',
        aeImportPermitNumber : '',
        line                 : '',
        item                 : '',
        account              : '',
        localizedName        : '',
        localizedNumber      : '',
        netAmount            : '',
        taxAmount            : '',
        taxCode              : '',
        currency             : '',
        fxAmount             : '',
        exchangeRate         : ''
    };
    return txn;
};

TAF.AE.DAO.GeneralLedgerDao = function _GeneralLedgerDao() {
    TAF.DAO.SearchDAO.call(this);
    
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_ae_faf_generalledger';

    this.hasAccountingContext = parseFloat(nlapiGetContext().version) >= 2017.1;
    this.hasAccountNumbering = nlapiLoadConfiguration('accountingpreferences').getFieldValue('ACCOUNTNUMBERS') == 'T';
};
TAF.AE.DAO.GeneralLedgerDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.AE.DAO.GeneralLedgerDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    if(!params || !params.periodIds) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }
    this.filters.push(new nlobjSearchFilter('account', this.multiBookJoinColumn, 'noneof', '@NONE@'));
    this.filters.push(new nlobjSearchFilter('creditamount', this.multiBookJoinColumn, 'greaterthan', 0, null, 1, 0, true));
    this.filters.push(new nlobjSearchFilter('debitamount', this.multiBookJoinColumn, 'greaterthan', 0, null, 0, 1, false));
    this.filters.push(new nlobjSearchFilter('internalid', 'accountingperiod', 'anyof', params.periodIds));
    
    if (this.isOneWorld) {
        this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subIds));
    }
    if (this.isMultiBook) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
    
    params.accountingContext = params.accountingContext || '@NONE@';

    var language = nlapiGetContext().getPreference('LANGUAGE');
    var srchFilter = [ new nlobjSearchFilter('locale', null, 'is', language) ];
    var rs = nlapiSearchRecord('account', null, srchFilter,null);
    if(!rs) {
        language = '@NONE@';
    }
    
    this.filters.push(new nlobjSearchFilter('locale', 'account', 'is', language));
    this.filters.push(new nlobjSearchFilter('accountingcontext', 'account', 'is', params.accountingContext));
};

TAF.AE.DAO.GeneralLedgerDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('localizeddisplayname', 'account'));
    if(this.hasAccountNumbering){
    	this.columns.push(new nlobjSearchColumn('number', 'account').setSort());
    	this.columns.push(new nlobjSearchColumn('localizednumber', 'account').setSort());
    }
    if (this.glAuditNumbering) {
        this.columns.push(new nlobjSearchColumn('glnumber', this.multiBookJoinColumn).setSort());
    }
};

TAF.AE.DAO.GeneralLedgerDao.prototype.rowToObject = function _rowToObject(row) {
    if(!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }
    
    var txn = new TAF.AE.DAO.GeneralLedger(row.getId());
    
    txn.id = row.getId();
    txn.date = row.getValue('trandate');
    txn.accountId = row.getValue('account', this.multiBookJoinColumn);
    txn.accountName = row.getText('account', this.multiBookJoinColumn);
    txn.localizedName = row.getValue('localizeddisplayname', 'account').trim();
    txn.memo = row.getValue('memo');
    txn.memoMain = row.getValue('memomain');
    txn.mainName = row.getText('mainname');
    txn.entity = row.getText('entity');
    txn.tranId = row.getValue('tranid');
    txn.type = row.getValue('type');
    txn.typeText = row.getText('type');
    txn.debitAmount = row.getValue('debitamount', this.multiBookJoinColumn);
    txn.creditAmount = row.getValue('creditamount', this.multiBookJoinColumn);

    if(this.hasAccountNumbering){
    	txn.acctNumber = row.getValue('number', 'account');
    	txn.localizedNumber = row.getValue('localizednumber', 'account');
    }
    if (this.glAuditNumbering) {
        txn.subTranId = row.getValue('glnumber', this.multiBookJoinColumn);
    }

    return txn;
};
