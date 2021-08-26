/**
 * Copyright 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.DAO = TAF.DAO || {};

TAF.DAO.AccountingContext = function _AccountingContext(id) {
    return {
        id: id,
        internalId: '',
        name: ''
    };
};

TAF.DAO.AccountingContextDao = function _AccountContextDao() {
    TAF.DAO.SearchDAO.call(this);
    this.recordType = 'accountingcontext';
    this.fields = {
        name: 'name',
        internalId: 'internalid'
    };
};

TAF.DAO.AccountingContextDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.DAO.AccountingContextDao.prototype.createSearchColumns = function createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('name'));
    this.columns.push(new nlobjSearchColumn('internalid'));
    
    this.columns[0].setSort();
};

TAF.DAO.AccountingContextDao.prototype.getList = function _getList(startIndex, endIndex) {
    if (!this.searchResult) {
        throw nlapiCreateError('INVALID_SEARCH', 'Unable to extract report data');
    }

    try {
        var list = [];
        var start = startIndex || 0;
        var end = endIndex || (start + this.MAX_RESULTS_PER_LINE);
        var sr = this.searchResult.getResults(start, end);

        for (var isr = 0; sr && isr < sr.length; isr++) {
            var object = this.rowToObject(sr[isr]);
            
            if (object.isPrimary) {
                list.unshift(object);
            } else {
                list.push(object);
            }
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DAO.AccountingContextDao.getList', ex.toString());
        throw ex;
    }
    return list;
};

TAF.DAO.AccountingContextDao.prototype.rowToObject = function _rowToObject(row) {
    var obj = new TAF.DAO.AccountingContext(row.getId());

    try {
        obj.name = row.getValue(this.fields.name);

        return obj;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DAO.AccountingContextDao.rowToObject', ex.toString());
        throw ex;
    }
};
