/**
 * Copyright 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.PH = TAF.PH || {};
TAF.PH.DAO = TAF.PH.DAO || {};

TAF.PH.DAO.SalesJournalDao = function _SalesJournalDao() {
    TAF.DAO.SearchDAO.call(this);

    this.name = 'SalesJournalDao';
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_taf_ph_salesjournal'; // TAF PH Sales Journal Search

    this.isProjectsEnabled = this.context.getFeature('JOBS');
    this.customerJoinTable = this.isProjectsEnabled ? 'customermain' : 'customer';
};
TAF.PH.DAO.SalesJournalDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.PH.DAO.SalesJournalDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('entityid', this.customerJoinTable));
    this.columns.push(new nlobjSearchColumn('firstname', this.customerJoinTable));
    this.columns.push(new nlobjSearchColumn('lastname', this.customerJoinTable));
    this.columns.push(new nlobjSearchColumn('companyname', this.customerJoinTable));
    this.columns.push(new nlobjSearchColumn('billaddress', this.customerJoinTable));
    this.columns.push(new nlobjSearchColumn('vatregnumber', this.customerJoinTable));
    this.columns.push(new nlobjSearchColumn('isperson', this.customerJoinTable));
};

TAF.PH.DAO.SalesJournalDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    if(!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }

    if(!params.periodIds) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.periodIds is required');
    }

    this.filters.push(new nlobjSearchFilter('posting', this.multiBookJoinColumn, 'is', 'T'));
    this.filters.push(new nlobjSearchFilter('internalid', 'accountingperiod', 'anyof', params.periodIds));

    if (this.isOneWorld && params.subIds) {
        this.filters.push(new nlobjSearchFilter('subsidiary', this.multiBookJoinColumn, 'anyof', params.subIds));
    }

    if (this.isMultiBook && params.bookId) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
};

TAF.PH.DAO.SalesJournalDao.prototype.rowToObject = function(row) {
    if (!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }

    try {
        var object = {};
        object.internalId = row.getValue('internalid');
        object.entityId = row.getValue('entityid', this.customerJoinTable);
        object.isPerson = row.getValue('isperson', this.customerJoinTable);
        object.firstName = row.getValue('firstname', this.customerJoinTable);
        object.lastName = row.getValue('lastname', this.customerJoinTable);
        object.companyName = row.getValue('companyname', this.customerJoinTable);
        object.billAddress = row.getValue('billaddress', this.customerJoinTable);
        object.vatRegNumber = row.getValue('vatregnumber', this.customerJoinTable);
        return object;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.PH.DAO.SalesJournalDao.convertRowToObject', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error converting row to object');
    }
};


TAF.PH.DAO.SalesJournalDetailsDao = function SalesJournalDetailsDao() {
    TAF.DAO.SearchDAO.call(this);

    this.name = 'SalesJournalDetailsDao';
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_taf_ph_salesjournal_detail'; // TAF PH Sales Journal Details Search
};
TAF.PH.DAO.SalesJournalDetailsDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.PH.DAO.SalesJournalDetailsDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    if(!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }

    if (this.isMultiBook && params.bookId) {
        this.discount = new nlobjSearchColumn('formulacurrency', null, 'SUM').setFormula('NVL(ABS(({discountamount}*{accountingtransaction.exchangerate}) / {exchangerate}) / 2, 0)');
        this.gross = new nlobjSearchColumn('formulacurrency', null, 'SUM').setFormula("CASE WHEN {mainline}='*' THEN ABS(({grossamount}*{accountingtransaction.exchangerate}) / {exchangerate}) ELSE 0 END");
        this.taxTotal = new nlobjSearchColumn('formulacurrency', null, 'SUM').setFormula("CASE WHEN {mainline}='*' THEN ABS(({taxtotal}*{accountingtransaction.exchangerate}) / {exchangerate}) ELSE 0 END");
        this.discountCount = new nlobjSearchColumn('formulacurrency', null, 'COUNT').setFormula('{discountamount}');
    } else {
        this.discount = new nlobjSearchColumn('formulacurrency', null, 'SUM').setFormula('NVL(ABS({discountamount}) / 2, 0)');
        this.gross = new nlobjSearchColumn('formulacurrency', null, 'SUM').setFormula("CASE WHEN {mainline}='*' THEN ABS({grossamount}) ELSE 0 END");
        this.taxTotal = new nlobjSearchColumn('formulacurrency', null, 'SUM').setFormula("CASE WHEN {mainline}='*' THEN ABS({taxtotal}) ELSE 0 END");
        this.discountCount = new nlobjSearchColumn('formulacurrency', null, 'COUNT').setFormula('{discountamount}');
    }
    this.columns.push(this.discount);
    this.columns.push(this.gross);
    this.columns.push(this.taxTotal);
    this.columns.push(this.discountCount);
};

TAF.PH.DAO.SalesJournalDetailsDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    if(!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }
    if(!params.internalId) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.internalId is required');
    }

    this.filters.push(new nlobjSearchFilter('internalid', null, 'is', params.internalId));

    if (this.isMultiBook && params.bookId) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
};

TAF.PH.DAO.SalesJournalDetailsDao.prototype.rowToObject = function(row) {
    if (!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }

    try {
        var object = {};

        object.transactionId = row.getValue('tranid', null, 'GROUP');
        object.date = row.getValue('trandate', null, 'GROUP');
        object.memoMain = row.getValue('memomain', null, 'GROUP');
        object.type = row.getText('type', null, 'GROUP');
        object.typeCode = row.getValue('type', null, 'GROUP');
        object.discount = row.getValue(this.discount);
        object.taxTotal = row.getValue(this.taxTotal);
        object.gross = row.getValue(this.gross);
        object.discountCount = row.getValue(this.discountCount);

        return object;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.PH.DAO.SalesJournalDetailsDao.convertRowToObject', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error converting row to object');
    }
};
