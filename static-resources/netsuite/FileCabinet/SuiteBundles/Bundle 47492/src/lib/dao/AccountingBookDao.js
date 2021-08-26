/**
 * Copyright 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.DAO = TAF.DAO || {};

TAF.DAO.AccountingBook = function _AccountingBook(id) {
    return {
        id: id,
        internalId: '',
        name: '',
        status: '',
        subsidiary: '',
        currencyId: '',
        currencyName: '',
        isPrimary: false
    };
};

TAF.DAO.AccountingBookDao = function _AccountBookDao() {
    TAF.DAO.SearchDAO.call(this);
    this.recordType = 'accountingbook';
    this.fields = {
        name: 'name',
        status: 'status',
        isPrimary: 'isprimary',
        subsidiary: 'subsidiary',
        internalId: 'internalid',
        currency: 'currency'
    };
    
    this.isForeignCurrency = this.context.getFeature('FOREIGNCURRENCYMANAGEMENT');
};

TAF.DAO.AccountingBookDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.DAO.AccountingBookDao.prototype.createSearchColumns = function createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('name'));
    this.columns.push(new nlobjSearchColumn('status'));
    this.columns.push(new nlobjSearchColumn('isprimary'));
    this.columns.push(new nlobjSearchColumn('subsidiary'));
    this.columns.push(new nlobjSearchColumn('internalid'));
    
    if (this.isForeignCurrency) {
        this.columns.push(new nlobjSearchColumn('currency'));
    }
    
    this.columns[0].setSort(); // sort by name
};

TAF.DAO.AccountingBookDao.prototype.getList = function _getList(startIndex, endIndex) {
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
        nlapiLogExecution('ERROR', 'TAF.DAO.AccountingBookDao.getList', ex.toString());
        throw ex;
    }
    return list;
};

TAF.DAO.AccountingBookDao.prototype.rowToObject = function _rowToObject(row) {
    var obj = new TAF.DAO.AccountingBook(row.getId());

    try {
        obj.name = row.getValue(this.fields.name);
        obj.status = row.getValue(this.fields.status);
        obj.subsidiary = row.getValue(this.fields.subsidiary);
        obj.isPrimary = row.getValue(this.fields.isPrimary) === 'T';

        if (this.isForeignCurrency) {
            obj.currencyId = row.getValue(this.fields.currency);
            obj.currencyName = row.getText(this.fields.currency);
        }

        return obj;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DAO.AccountingBookDao.rowToObject', ex.toString());
        throw ex;
    }
};
