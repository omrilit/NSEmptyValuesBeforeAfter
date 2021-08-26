/**
 * Copyright © 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.DE = TAF.DE || {};
TAF.DE.DAO = TAF.DE.DAO || {};

TAF.DE.DAO.GeneralLedgerLine = function _GeneralLedgerLine(id){
    return {
        id: id,
        posting: '',
        type: '',
        date: '',
        lineId: '',
        number: '',
        memo: '',
        debitAmount: '',
        creditAmount:'',
        accountId: ''
    };
};

TAF.DE.DAO.GeneralLedgerLineDao = function _GeneralLedgerLineDao() {
    TAF.DAO.SearchDAO.call(this);
    
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_de_taf_glline';
};
TAF.DE.DAO.GeneralLedgerLineDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.DE.DAO.GeneralLedgerLineDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    if(!params || !params.periodIds) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }
    
    this.filters.push(new nlobjSearchFilter('postingperiod', null, 'is', params.periodIds));
    this.filters.push(new nlobjSearchFilter('accounttype', null, 'noneof', '@NONE@'));
    this.filters.push(new nlobjSearchFilter('voided', null, 'is', 'F', null, 1, 0, false, true));
    this.filters.push(new nlobjSearchFilter('debitamount', this.multiBookJoinColumn, 'isempty', null, null, 0, 0, false));
    this.filters.push(new nlobjSearchFilter('creditamount', this.multiBookJoinColumn, 'isempty', null, null, 0, 1, false));
    
    if (this.isOneWorld) {
        this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subIds));
    }
    if (this.isMultiBook) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
};

TAF.DE.DAO.GeneralLedgerLineDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn));
};

TAF.DE.DAO.GeneralLedgerLineDao.prototype.rowToObject = function _rowToObject(row) {
    if(!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }
    
    var glLine = new TAF.DE.DAO.GeneralLedgerLine();
    glLine.id = row.getId();
    glLine.posting = row.getValue('posting');
    glLine.type = row.getText('type');
    glLine.date = row.getValue('trandate');
    glLine.lineId = row.getValue('line');
    glLine.number = row.getValue('tranid') || '';
    glLine.memo = row.getValue('memo') || '';
    glLine.debitAmount = row.getValue('debitamount', this.multiBookJoinColumn) || '';
    glLine.creditAmount = row.getValue('creditamount', this.multiBookJoinColumn) || '';
    glLine.accountId = row.getValue('account', this.multiBookJoinColumn);
    
    return glLine;
};

TAF.DE.DAO.TrialBalanceSummary = function _TrialBalanceSummary() {
    return {
        debitAmount: '',
        creditAmount: '',
        amount: ''
    };
};

TAF.DE.DAO.TrialBalanceType = {
    'AccountsPayable': 'TAF Accounts Payable Trial Balance',
    'AccountsReceivable': 'TAF Accounts Receivable Trial Balance',
    'All': 'TAF Trial Balance'
};

TAF.DE.DAO.TrialBalanceDao = function _TrialBalanceDao(type) {
    TAF.DAO.SavedReportDAO.call(this);
    
    if (!type || !TAF.DE.DAO.TrialBalanceType[type]) {
        type = 'All';
    }
    this.name = 'TrialBalanceDao';
    this.reportName = TAF.DE.DAO.TrialBalanceType[type];
};
TAF.DE.DAO.TrialBalanceDao.prototype = Object.create(TAF.DAO.SavedReportDAO.prototype);

TAF.DE.DAO.TrialBalanceDao.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
    var columns = this.getColumns(pivotReport);

    return {
        debitAmount: columns[1],
        creditAmount: columns[2],
        amount: columns[3]
    };
};

TAF.DE.DAO.TrialBalanceDao.prototype.extractValues = function extractValues(row, columns) {
    if(!row) {
        throw nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }
    if(!columns) {
        throw nlapiCreateError('MISSING_PARAMETER', 'columns is required');
    }

    var object = new TAF.DE.DAO.TrialBalanceSummary();
    
    for (var col in columns) {
        object[col] = this.getValue(row.getValue(columns[col])).toString();
    }
    
    return object;
};

TAF.DE.DAO.TrialBalanceDao.prototype.getSummary = function getSummary(params) {
    try {
        this.initialize(params);

        var report = this.search();
        var summaryLine = this.getSummaryLine(report);
        var columns = this.getColumnMetadata(report);

        return this.extractValues(summaryLine, columns);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DE.DAO.TrialBalanceDao.getSummary', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error getting summary in search');
    }
};

TAF.DE.DAO.TrialBalanceDao.prototype.getSummaryLine = function getSummaryLine(pivotReport) {
    return pivotReport.getRowHierarchy().getSummaryLine();
};


TAF.DE.DAO.AccountsPayableLine = function _AccountsPayableLine(id){
    return {
        id: id,
        posting: '',
        number: '',
        date: '',
        memo: '',
        debitAmount: '',
        creditAmount:'',
        type: '',
        employeeEntityId: '',
        employeeFirstName: '',
        employeeLastName: '',
        vendorEntityId: '',
        vendorIsPerson: '',
        vendorFirstName: '',
        vendorLastName: '',
        vendorCompanyName: '',
    };
};

TAF.DE.DAO.AccountsPayableLineDao = function _AccountsPayableLineDao() {
    TAF.DAO.SearchDAO.call(this);
    
    this.name = 'AccountsPayableLineDao';
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_taf_de_acctpay_line';
};
TAF.DE.DAO.AccountsPayableLineDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.DE.DAO.AccountsPayableLineDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn));
};

TAF.DE.DAO.AccountsPayableLineDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }

    if (!params.periodIds) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.periodIds is required');
    }

    this.filters.push(new nlobjSearchFilter('postingperiod', null, 'is', params.periodIds));
    this.filters.push(new nlobjSearchFilter('accounttype', this.multiBookJoinColumn, 'is', 'AcctPay'));
    this.filters.push(new nlobjSearchFilter('voided', null, 'is', 'F', null, 1, 0, false, true));
    this.filters.push(new nlobjSearchFilter('debitamount', this.multiBookJoinColumn, 'isempty', null, null, 0, 0, false));
    this.filters.push(new nlobjSearchFilter('creditamount', this.multiBookJoinColumn, 'isempty', null, null, 0, 1, false));
    
    if (this.isOneWorld) {
        this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subIds));
    }
    
    if (params.bookId) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
};

TAF.DE.DAO.AccountsPayableLineDao.prototype.rowToObject = function _rowToObject(row) {
    if (!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }
    
    var apLine = new TAF.DE.DAO.AccountsPayableLine(row.getId());
    apLine.posting = row.getValue('posting');
    apLine.date = row.getValue('trandate');
    apLine.number = row.getValue('tranid') || '';
    apLine.memo = row.getValue('memo') || '';
    apLine.debitAmount = row.getValue('debitamount', this.multiBookJoinColumn) || '';
    apLine.creditAmount = row.getValue('creditamount', this.multiBookJoinColumn) || '';
    apLine.type = row.getText('type');
    apLine.employeeEntityId = row.getValue('entityid', 'employee') || '';
    apLine.employeeFirstName = row.getValue('firstname', 'employee') || '';
    apLine.employeeLastName = row.getValue('lastname', 'employee') || '';
    apLine.vendorEntityId = row.getValue('entityid', 'vendor') || '';
    apLine.vendorIsPerson = row.getValue('isperson', 'vendor');
    apLine.vendorFirstName = row.getValue('firstname', 'vendor') || '';
    apLine.vendorLastName = row.getValue('lastname', 'vendor') || '';
    apLine.vendorCompanyName = row.getValue('companyname', 'vendor') || '';
    return apLine;
};

TAF.DE.DAO.AccountsReceivableLine = function _AccountsReceivableLine(id) {
    return {
        id: id,
        number: '',
        date: '',
        memo: '',
        debitAmount: '',
        creditAmount:'',
        type: '',
        customerEntityId: '',
        customerIsPerson: '',
        customerFirstName: '',
        customerLastName: '',
        customerCompanyName: ''
    };
};

TAF.DE.DAO.AccountsReceivableLineDao = function _AccountsReceivableLineDao() {
    TAF.DAO.SearchDAO.call(this);
    
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_taf_de_acctrec_line';
};
TAF.DE.DAO.AccountsReceivableLineDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.DE.DAO.AccountsReceivableLineDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn));
};

TAF.DE.DAO.AccountsReceivableLineDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    if(!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }

    if(!params.periodIds) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.periodIds is required');
    }

    this.filters.push(new nlobjSearchFilter('postingperiod', null, 'is', params.periodIds));
    this.filters.push(new nlobjSearchFilter('accounttype', this.multiBookJoinColumn, 'is', 'AcctRec'));
    this.filters.push(new nlobjSearchFilter('voided', null, 'is', 'F', null, 1, 0, false, true));
    this.filters.push(new nlobjSearchFilter('debitamount', this.multiBookJoinColumn, 'isempty', null, null, 0, 0, false));
    this.filters.push(new nlobjSearchFilter('creditamount', this.multiBookJoinColumn, 'isempty', null, null, 0, 1, false));
    
    if (this.isOneWorld) {
        this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subIds));
    }
    
    if (this.isMultiBook && params.bookId) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
};

TAF.DE.DAO.AccountsReceivableLineDao.prototype.rowToObject = function _rowToObject(row) {
    if (!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }
    
    var arLine = new TAF.DE.DAO.AccountsReceivableLine(row.getId());
    arLine.date = row.getValue('trandate');
    arLine.number = row.getValue('tranid') || '';
    arLine.memo = row.getValue('memo') || '';
    arLine.debitAmount = row.getValue('debitamount', this.multiBookJoinColumn) || '';
    arLine.creditAmount = row.getValue('creditamount', this.multiBookJoinColumn) || '';
    arLine.type = row.getText('type');
    arLine.customerEntityId = row.getValue('entityid', 'customer') || '';
    arLine.customerIsPerson = row.getValue('isperson', 'customer');
    arLine.customerFirstName = row.getValue('firstname', 'customer') || '';
    arLine.customerLastName = row.getValue('lastname', 'customer') || '';
    arLine.customerCompanyName = row.getValue('companyname', 'customer') || '';
    return arLine;
};

TAF.DE.DAO.GeneralJournal = function _GeneralJournal(id) {
    return {
        id: id,
        posting: '',
        accountId: '',
        type: '',
        debitAmount: '',
        creditAmount: '',
        date: '',
        period: '',
        taxcode: '',
        taxline: '',
        number: '',
        memo: ''
    };
};

TAF.DE.DAO.GeneralJournalDao = function _generalJournalDao() {
    TAF.DAO.SearchDAO.call(this);
    
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_de_taf_generaljournal';
};
TAF.DE.DAO.GeneralJournalDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.DE.DAO.GeneralJournalDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    if(!params || !params.periodIds) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }    
    this.filters.push(new nlobjSearchFilter('postingperiod', null, 'is', params.periodIds));	
    if (this.isMultiBook) {
        this.filters.push(new nlobjSearchFilter('accounttype', this.multiBookJoinColumn, 'noneof', '@NONE@'));
    }
	else {
    this.filters.push(new nlobjSearchFilter('accounttype', null, 'noneof', '@NONE@'));
	}
    this.filters.push(new nlobjSearchFilter('voided', null, 'is', 'F', null, 1, 0, false, true));
    this.filters.push(new nlobjSearchFilter('debitamount', this.multiBookJoinColumn, 'isempty', null, null, 0, 0, false));
    this.filters.push(new nlobjSearchFilter('creditamount', this.multiBookJoinColumn, 'isempty', null, null, 0, 1, false));
    
    if (this.isOneWorld) {
        this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subIds));
    }
    if (this.isMultiBook) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
};

TAF.DE.DAO.GeneralJournalDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn, 'GROUP'));
    this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn, 'SUM'));
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn, 'SUM'));
};

TAF.DE.DAO.GeneralJournalDao.prototype.rowToObject = function _rowToObject(row) {
    if (!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }
    
    var gjLine = new TAF.DE.DAO.GeneralJournal();
    gjLine.id = row.getValue('internalid', null, 'GROUP');
    gjLine.posting = row.getValue('posting', null, 'GROUP');
    gjLine.accountId = row.getValue('account', this.multiBookJoinColumn, 'GROUP');
    gjLine.type = row.getText('type', null, 'GROUP');
    gjLine.debitAmount = row.getValue('debitamount', this.multiBookJoinColumn, 'SUM') || '';
    gjLine.creditAmount = row.getValue('creditamount', this.multiBookJoinColumn, 'SUM') || '';
    gjLine.date = row.getValue('trandate', null, 'MIN');
    gjLine.period = row.getValue('postingperiod', null, 'MIN');
    gjLine.taxcode = row.getText('taxitem', null, 'GROUP') || '';
    gjLine.taxline = row.getValue('taxline', null, 'MIN') || '';
    gjLine.number = row.getValue('tranid', null, 'MAX') || '';
    gjLine.memo = row.getValue('memo', null, 'MAX') || '';

    return gjLine;
};

TAF.DE.DAO.AnnualVat = function _AnnualVat() {
    return {
        period: '',
        posting: '',
        taxCode: '',
        taxLine: '',
        adjTaxCode: '',
        debitAmount: '',
        creditAmount: '',
        adjJournal: '',
        taxCodeId: '',
        adjTaxCodeId: ''
    };
};

TAF.DE.DAO.AnnualVatDao = function _annualVatDao() {
    TAF.DAO.SearchDAO.call(this);
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_de_taf_annualvat';
    this.isITRInstalled = SFC.Registry.IsInstalled('e5775970-8e28-40ff-ad4a-956e88304834');
};
TAF.DE.DAO.AnnualVatDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.DE.DAO.AnnualVatDao.prototype.createSearchColumns = function createSearchColumns(params) {
	this.columns = [];
	this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn, 'SUM'));
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn, 'SUM'));
    
    if (this.isITRInstalled) {
        //(taxitem noneof -NONE- OR custcol_adjustment_tax_code noneof -NONE-)
    	this.columns.push(new nlobjSearchColumn('custcol_adjustment_tax_code', null, 'GROUP').setSort());
    	this.columns.push(new nlobjSearchColumn('custbody_adjustment_journal', null, 'GROUP'));
    }
};

TAF.DE.DAO.AnnualVatDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    if(!params || !params.periodIds) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }
    this.filters = [];
    this.filters.push(new nlobjSearchFilter('postingperiod', null, 'is', params.periodIds));
    this.filters.push(new nlobjSearchFilter('debitamount', this.multiBookJoinColumn, 'isempty', null, null, 1, 0, true));
    this.filters.push(new nlobjSearchFilter('creditamount', this.multiBookJoinColumn, 'isempty', null, null, 0, 1));
    
    if (this.isOneWorld) {
        this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subIds));
    }
    
    if (this.isMultiBook && params.bookId) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
    
    if (this.isITRInstalled) {
        //(taxitem noneof -NONE- OR custcol_adjustment_tax_code noneof -NONE-)
    	this.filters.push(new nlobjSearchFilter('taxitem', null, 'noneof', '@NONE@', null, 1, 0, true));
    	this.filters.push(new nlobjSearchFilter('custcol_adjustment_tax_code', null, 'noneof', '@NONE@', null, 0, 1));
    } else {
    	this.filters.push(new nlobjSearchFilter('taxitem', null, 'noneof', '@NONE@'));
    }
};

TAF.DE.DAO.AnnualVatDao.prototype.rowToObject = function _rowToObject(row) {
    if (!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }

    var avLine = new TAF.DE.DAO.AnnualVat();
    avLine.period = row.getText('postingperiod', null, 'GROUP');
    avLine.posting = row.getValue('posting', null, 'GROUP');
    avLine.taxLine = row.getValue('taxline', null, 'GROUP');
    avLine.taxCode = row.getText('taxitem', null, 'GROUP');
    avLine.adjTaxCode = this.isITRInstalled ? row.getText('custcol_adjustment_tax_code', null, 'GROUP') : '';
    avLine.adjJournal = this.isITRInstalled ? row.getValue('custbody_adjustment_journal', null, 'GROUP') : '';
    avLine.taxCodeId = row.getValue('taxitem', null, 'GROUP');
    avLine.adjTaxCodeId = this.isITRInstalled ? row.getValue('custcol_adjustment_tax_code', null, 'GROUP') : '';
    avLine.debitAmount = row.getValue('debitamount', this.multiBookJoinColumn, 'SUM') || 0;
    avLine.creditAmount = row.getValue('creditamount', this.multiBookJoinColumn, 'SUM') || 0;
    return avLine;
};

TAF.DE.DAO.TaxCode = function _TaxCode() {
    return {
        id: '',
        name: '',
        description: ''
    };
};

TAF.DE.DAO.TaxCodeDao = function _TaxCodeDao() {
    TAF.DAO.ParentDao.call(this);
    this.recordType = 'salestaxitem';
};
TAF.DE.DAO.TaxCodeDao.prototype = Object.create(TAF.DAO.ParentDao.prototype);

TAF.DE.DAO.TaxCodeDao.prototype.find = function _find(params) {
    if(!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }

    var filters = [];
    if (this.IS_ADVANCEDTAXES) {
        filters.push(new nlobjSearchFilter('country', null, 'is', 'DE'));
    }
    var columns = [new nlobjSearchColumn('itemid').setSort(), new nlobjSearchColumn('description'), new nlobjSearchColumn('internalid')];
    return TAF.DAO.ParentDao.prototype.find.call(this, filters, columns);
};

TAF.DE.DAO.TaxCodeDao.prototype.convertRowToObject = function _convertRowToObject(row) {
    if (!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }

    var taxCode = new TAF.DE.DAO.TaxCode();
    taxCode.id = row.getValue('internalid');
    taxCode.name = row.getValue('itemid');
    taxCode.description = row.getValue('description');
    return taxCode;
};

TAF.DE.DAO.SumsAndBalances = function _SumsAndBalances(id) {
    return {
        accountId: '',
        lastPostingDate: '',
        debitAmount: '',
        creditAmount: '',
        posting: ''
    };
};

TAF.DE.DAO.SumsAndBalancesDao = function _sumsAndBalancesDao() {
    TAF.DAO.SearchDAO.call(this);
    
    this.name = 'SumsAndBalancesDao';
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_de_taf_sort_by_acct_intl_id';
};
TAF.DE.DAO.SumsAndBalancesDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.DE.DAO.SumsAndBalancesDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn, 'GROUP').setSort());
    this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn, 'SUM'));
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn, 'SUM'));
    this.columns.push(new nlobjSearchColumn('posting', this.multiBookJoinColumn, 'GROUP'));
};

TAF.DE.DAO.SumsAndBalancesDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    if(!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }

    if(!params.periodIds) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.periodIds is required');
    }

    this.filters.push(new nlobjSearchFilter('postingperiod', null, 'is', params.periodIds));
    this.filters.push(new nlobjSearchFilter('accounttype', this.multiBookJoinColumn, 'noneof', '@NONE@'));

    if (params.accountIds) {
        this.filters.push(new nlobjSearchFilter('internalid', 'account', 'anyof', params.accountIds));
    }

    if (this.isOneWorld) {
        this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subIds));
    }

    if (this.isMultiBook && params.bookId) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
};

TAF.DE.DAO.SumsAndBalancesDao.prototype.rowToObject = function(row) {
    if (!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }

    try {
        var sabLine = new TAF.DE.DAO.SumsAndBalances();
        sabLine.accountId = row.getValue('account', this.multiBookJoinColumn, 'GROUP');
        sabLine.lastPostingDate = row.getValue('trandate', null, 'MAX');
        sabLine.debitAmount = row.getValue('debitamount', this.multiBookJoinColumn, 'SUM') || '';
        sabLine.creditAmount = row.getValue('creditamount', this.multiBookJoinColumn, 'SUM') || '';
        sabLine.posting = row.getValue('posting', this.multiBookJoinColumn, 'GROUP');
        return sabLine;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DE.DAO.SumsAndBalancesDao.convertRowToObject', ex.toString());
        throw ex;
    }
};


TAF.DE.DAO.Entity = function _Entity(id) {
    return {
        internalId: id,
        entityId: '',
        companyName: '',
        firstName: '',
        lastName: '',
        isIndividual: '',
        address1: '',
        address2: '',
        zipCode: '',
        city: '',
        country: '',
        vatRegistrationNumber: '',
        taxNumber: ''
    };
};

// Common dao for customers and vendors
TAF.DE.DAO.EntityDao = function _CustomerDao() {
    TAF.DAO.SearchDAO.call(this);
    
    this.name = 'EntityDao';
};
TAF.DE.DAO.EntityDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.DE.DAO.EntityDao.prototype.createSearchColumns = function _createSearchColumns(params) {};

TAF.DE.DAO.EntityDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    if(!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }
    if(!params.periodIds) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.periodIds is required');
    }

    this.filters.push(new nlobjSearchFilter('postingperiod', null, 'is', params.periodIds));
    this.filters.push(new nlobjSearchFilter('accounttype', this.multiBookJoinColumn, 'noneof', '@NONE@'));

    if (this.isOneWorld) {
        this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subIds));
    }

    if (this.isMultiBook && params.bookId) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
};

TAF.DE.DAO.EntityDao.prototype.rowToObject = function(row) {
    if (!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }

    try {
        var entity = new TAF.DE.DAO.Entity(row.getValue('internalid', this.entityType, 'GROUP'));
        entity.entityId = row.getValue('entityid', this.entityType, 'GROUP');
        entity.companyName = row.getValue('companyname', this.entityType, 'GROUP');
        entity.firstName = row.getValue('firstname', this.entityType, 'GROUP');
        entity.lastName = row.getValue('lastname', this.entityType, 'GROUP');
        entity.isIndividual = row.getValue('isperson', this.entityType, 'GROUP');
        entity.address1 = row.getValue('billaddress1', this.entityType, 'GROUP');
        entity.address2 = row.getValue('billaddress2', this.entityType, 'GROUP');
        entity.zipCode = row.getValue('billzipcode', this.entityType, 'GROUP');
        entity.city = row.getValue('billcity', this.entityType, 'GROUP');
        entity.country = row.getValue('billcountry', this.entityType, 'GROUP');
        entity.vatRegistrationNumber = row.getValue('vatregnumber', this.entityType, 'GROUP');
        entity.taxNumber = row.getValue('custentity_tax_reg_no', this.entityType, 'GROUP');
        return entity;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DE.DAO.EntityDao.rowToObject', ex.toString());
        throw ex;
    }
};

TAF.DE.DAO.CustomerDao = function _CustomerDao() {
    TAF.DE.DAO.EntityDao.call(this);
    
    this.name = 'Customer';
    this.recordType = 'transaction';
    this.entityType = 'customer';
    this.savedSearchId = 'customsearch_de_taf_txn_customer';
};
TAF.DE.DAO.CustomerDao.prototype = Object.create(TAF.DE.DAO.EntityDao.prototype);

TAF.DE.DAO.VendorDao = function _VendorDao() {
    TAF.DE.DAO.EntityDao.call(this);
    
    this.name = 'Vendor';
    this.recordType = 'transaction';
    this.entityType = 'vendor';
    this.savedSearchId = 'customsearch_de_taf_txn_vendor';
};
TAF.DE.DAO.VendorDao.prototype = Object.create(TAF.DE.DAO.EntityDao.prototype);

TAF.DE.DAO.VendorDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('entityid', this.entityType, 'GROUP').setSort());
};
