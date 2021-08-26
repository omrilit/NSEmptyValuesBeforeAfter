/**
 * Copyright 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }

TAF.Filter = function _Filter(params) {
    var context = nlapiGetContext();
    this.isOneWorld = context.getFeature('SUBSIDIARIES');
    this.isMultiBook = context.getFeature('MULTIBOOK');
    this.params = params;
};

TAF.Filter.prototype.getFilters = function _getFilters() {
    var filter = {};

    try {
        if (this.isOneWorld) {
            filter[TAF.CONSTANTS.FIELDS.SUBSIDIARIES] = this.getSubsidiaries();
        }
        if (this.isMultiBook) {
            var subsidiary = null;

            if (this.params && this.params.subsidiary) {
                subsidiary = this.params.subsidiary;
            } else if (filter[TAF.CONSTANTS.FIELDS.SUBSIDIARIES]) {
                subsidiary = filter[TAF.CONSTANTS.FIELDS.SUBSIDIARIES][0];
            }

            filter[TAF.CONSTANTS.FIELDS.ACCOUNTING_BOOKS] = this.getAccountingBooks(subsidiary);
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.Filter.getFilters', ex.toString());
        throw ex;
    }

    return filter;
};

TAF.Filter.prototype.getSubsidiaries = function _getSubsidiaries() {
    var subsidiaryIds = [];

    try {
        var dao = new TAF.SubsidiaryDao();
        var subsidiaries = dao.getList({
            iselimination: ['is', 'F'],
            isinactive: ['is', 'F']
        });
        subsidiaryIds = Object.keys(subsidiaries);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.Filter.getSubsidiaries', ex.toString());
        throw ex;
    }

    return subsidiaryIds;
};

TAF.Filter.prototype.getAccountingBooks = function _getAccountingBooks(subsidiaryId) {
    if(!subsidiaryId) {
        throw nlapiCreateError('MISSING_PARAMETER', 'subsidiaryId is required');
    }

    var accountingBookIds = [];

    try {
        var accountingBookDao = new TAF.DAO.AccountingBookDao();

        accountingBookDao.search({
            subsidiary: subsidiaryId,
            status: 'ACTIVE'
        });

        var accountingBooks = accountingBookDao.getList();

        accountingBookIds = accountingBooks.map(function(book) {
            return book.id;
        });
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.Filter.getAccountingBooks', ex.toString());
        throw ex;
    }

    return accountingBookIds;
};
