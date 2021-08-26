/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.DAO = TAF.DAO || {};

TAF.DAO.AccountingPeriod = function _AccountingPeriod(id) {
    return {
        id: id,
        name: '',
        startDate: '',
        endDate: '',
        isQuarter: false,
        isYear: false,
        isAdjustment: false,
        parent: ''
    };
};

TAF.DAO.AccountingPeriodDao = function _AccountingPeriodDao() {
};

TAF.DAO.AccountingPeriodDao.prototype.getPeriodRangeBeforePeriod = function _getPeriodRangeBeforePeriod(period, fiscalCalendar) {
    var periodRange = {};
    
    try {
        var date = nlapiLookupField('accountingperiod', period, 'startdate');
        var filters = [
                       new nlobjSearchFilter('startdate', null, 'before', date),
                       new nlobjSearchFilter('isquarter', null, 'is', 'F'),
                       new nlobjSearchFilter('isyear',    null, 'is', 'F'),
                       new nlobjSearchFilter('isadjust',  null, 'is', 'F')
        ];
        
        if (fiscalCalendar) {
            filters.push(new nlobjSearchFilter('fiscalcalendar', null, 'is', fiscalCalendar));
        }
        
        var columns = [
                       new nlobjSearchColumn('startdate').setSort(),
                       new nlobjSearchColumn('periodname'),
                       new nlobjSearchColumn('isquarter'),
                       new nlobjSearchColumn('isyear'),
                       new nlobjSearchColumn('isadjust')
           ];
        var results = this.searchRecords(filters, columns);
        periodRange.from = results[0];
        periodRange.to = results[results.length - 1];
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DAO.AccountingPeriodDao.getPeriodRangeBeforePeriod', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error in TAF.DAO.AccountingPeriodDao.getPeriodRangeBeforePeriod');
    }
    
    return periodRange;
};

TAF.DAO.AccountingPeriodDao.prototype.getPostingPeriodsBeforePeriod = function _getPostingPeriodsBeforePeriod(period, fiscalCalendar) {
    return this.getPriorPostingPeriods(period, fiscalCalendar, false);
};

TAF.DAO.AccountingPeriodDao.prototype.getPostingPeriodsOnOrBeforePeriod = function _getPostingPeriodsOnOrBeforePeriod(period, fiscalCalendar) {
    return this.getPriorPostingPeriods(period, fiscalCalendar, true);
};

TAF.DAO.AccountingPeriodDao.prototype.getPriorPostingPeriods = function _getPriorPostingPeriods(period, fiscalCalendar, inclusive) {
    var periodsList = [];
    try {
        var date = nlapiLookupField('accountingperiod', period, 'startdate');
        var filters = [new nlobjSearchFilter('startdate', null, inclusive ? 'onorbefore' : 'before', date),
                       new nlobjSearchFilter('isquarter', null, 'is', 'F'),
                       new nlobjSearchFilter('isyear',    null, 'is', 'F'),
                       new nlobjSearchFilter('isinactive', null, 'is', 'F')];
        
        if (fiscalCalendar) {
            filters.push(new nlobjSearchFilter('fiscalcalendar', null, 'is', fiscalCalendar));
        }
        
        var columns = [new nlobjSearchColumn('internalid', null, 'GROUP'),
                       new nlobjSearchColumn('startdate', null, 'GROUP'),
                       new nlobjSearchColumn('periodname', null, 'GROUP'),
                       new nlobjSearchColumn('isquarter', null, 'GROUP'),
                       new nlobjSearchColumn('isyear', null, 'GROUP'),
                       new nlobjSearchColumn('isadjust', null, 'GROUP')];
        columns[0].setSort();
        columns[2].setSort(true);
        periodsList = this.searchGroupedRecords(filters, columns);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DAO.AccountingPeriodDao.getPriorPostingPeriods', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error in TAF.DAO.AccountingPeriodDao.getPriorPostingPeriods');
    }
    
    return periodsList;
};

TAF.DAO.AccountingPeriodDao.prototype.getCoveredPostingPeriods = function _getCoveredPostingPeriods(periodFromId, periodToId, fiscalCalendar) {
    var periodsList = [];
    try {
        var periodFrom = this.getPeriodById(periodFromId);
        var periodTo = periodFrom;
        if (periodFromId != periodToId) {
        	periodTo = this.getPeriodById(periodToId);
        }
        
        var filters = [new nlobjSearchFilter('isinactive', null, 'is', 'F'),
                       new nlobjSearchFilter('isquarter', null, 'is', 'F'),
                       new nlobjSearchFilter('isyear',    null, 'is', 'F'),
                       new nlobjSearchFilter('startdate', null, 'onorafter', periodFrom.startDate),
                       new nlobjSearchFilter('enddate', null, 'onorbefore', periodTo.endDate)];
        
        if (fiscalCalendar) {
            filters.push(new nlobjSearchFilter('fiscalcalendar', null, 'is', fiscalCalendar));
        }
        
        var columns = [new nlobjSearchColumn('internalid', null, 'GROUP'),
                       new nlobjSearchColumn('startdate', null, 'GROUP'),
                       new nlobjSearchColumn('periodname', null, 'GROUP'),
                       new nlobjSearchColumn('isquarter', null, 'GROUP'),
                       new nlobjSearchColumn('isyear', null, 'GROUP'),
                       new nlobjSearchColumn('isadjust', null, 'GROUP')];
        columns[0].setSort();
        columns[2].setSort(true);
        periodsList = this.searchGroupedRecords(filters, columns);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DAO.AccountingPeriodDao.getCoveredPostingPeriods', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error in TAF.DAO.AccountingPeriodDao.getCoveredPostingPeriods');
    }
    return periodsList;
};

TAF.DAO.AccountingPeriodDao.prototype.searchGroupedRecords = function _searchGroupedRecords(filters, columns) {
    var periodList = [];
    
    try {
        var searchResults = nlapiSearchRecord('accountingperiod', null, filters, columns);
        if (!searchResults) {
            return periodList;
        }
        
        for (var i = 0; i < searchResults.length; i++) {
            var period = this.convertGroupedRowToObject(searchResults[i]);
            periodList.push(period);
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DAO.AccountingPeriodDao.searchRecords', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error in TAF.DAO.AccountingPeriodDao.searchRecords');
    }
    
    return periodList;
};

TAF.DAO.AccountingPeriodDao.prototype.convertGroupedRowToObject = function _convertGroupedRowToObject(searchObject) {
    var period = {};
    try {
        period = new TAF.DAO.AccountingPeriod(searchObject.getValue('internalid', null, 'GROUP') || '');
        period.name = searchObject.getValue('periodname', null, 'GROUP') || '';
        period.startDate = searchObject.getValue('startdate', null, 'GROUP') || '';
        period.endDate = searchObject.getValue('enddate', null, 'GROUP') || '';
        period.isQuarter = (searchObject.getValue('isquarter', null, 'GROUP') === 'T');
        period.isYear = (searchObject.getValue('isyear', null, 'GROUP') === 'T');
        period.isAdjustment = (searchObject.getValue('isadjust', null, 'GROUP') === 'T');
        
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DAO.AccountingPeriodDao.convertRowToObject', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'TAF.DAO.AccountingPeriodDao.convertRowToObject');
    }
    return period;
};

TAF.DAO.AccountingPeriodDao.prototype.searchRecords = function _searchRecords(filters, columns) {
    var periodList = [];
    
    try {
        var searchResults = nlapiSearchRecord('accountingperiod', null, filters, columns);
        if (!searchResults) {
            return periodList;
        }
        
        for (var i = 0; i < searchResults.length; i++) {
            var period = this.convertRowToObject(searchResults[i]);
            periodList.push(period);
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DAO.AccountingPeriodDao.searchRecords', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error in TAF.DAO.AccountingPeriodDao.searchRecords');
    }
    
    return periodList;
};

TAF.DAO.AccountingPeriodDao.prototype.convertRowToObject = function _convertRowToObject(searchObject) {
    var period = {};
    try {
        period = new TAF.DAO.AccountingPeriod(searchObject.getId() || '');
        period.name = searchObject.getValue('periodname') || '';
        period.startDate = searchObject.getValue('startdate') || '';
        period.endDate = searchObject.getValue('enddate') || '';
        period.isQuarter = (searchObject.getValue('isquarter') === 'T');
        period.isYear = (searchObject.getValue('isyear') === 'T');
        period.isAdjustment = (searchObject.getValue('isadjust') === 'T');
        
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DAO.AccountingPeriodDao.convertRowToObject', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'TAF.DAO.AccountingPeriodDao.convertRowToObject');
    }
    return period;
};

TAF.DAO.AccountingPeriodDao.prototype.convertRecordToObject = function _convertRecordToObject(searchObject) {    
    var period = {};
    try {
        period = new TAF.DAO.AccountingPeriod(searchObject.getId() || '');
        period.name         = searchObject.getFieldValue('periodname') || '';
        period.startDate    = searchObject.getFieldValue('startdate')  || '';
        period.endDate      = searchObject.getFieldValue('enddate')    || '';
        period.isQuarter    = (searchObject.getFieldValue('isquarter') === 'T');
        period.isYear       = (searchObject.getFieldValue('isyear')    === 'T');
        period.isAdjustment = (searchObject.getFieldValue('isadjust')  === 'T');
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DAO.AccountingPeriodDao.convertRecordToObject', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'TAF.DAO.AccountingPeriodDao.convertRecordToObject');
    }
    return period;
};

TAF.DAO.AccountingPeriodDao.prototype.getPeriodById = function _getPeriodById(id) {
    var period = {};
    
    try {
        var searchObject = nlapiLoadRecord('accountingperiod', id);
        period = this.convertRecordToObject(searchObject);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DAO.AccountingPeriodDao.getPeriodById', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error in TAF.DAO.AccountingPeriodDao.getPeriodById');
    } 
    
    return period;
};

TAF.DAO.AccountingPeriodDao.prototype.getCoveredPeriodIds = function _getCoveredPeriodIds(periodFromId, periodToId, fiscalCalendar) {
    var ids = [];
    try {
        var periodFrom = this.getPeriodById(periodFromId);
        var periodTo = this.getPeriodById(periodToId);
        
        var filters = [
                       new nlobjSearchFilter('isinactive', null, 'is', 'F'),
                       new nlobjSearchFilter('startdate', null, 'onorafter', periodFrom.startDate),
                       new nlobjSearchFilter('enddate', null, 'onorbefore', periodTo.endDate)
                   ];
        
        if (fiscalCalendar) {
            filters.push(new nlobjSearchFilter('fiscalcalendar', null, 'is', fiscalCalendar));
        }
        
        var results = this.searchRecords(filters, null);
        ids = this.extractIds(results);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DAO.AccountingPeriodDao.getCoveredPeriodIds', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error in TAF.DAO.AccountingPeriodDao.getCoveredPeriodIds');
    }
    return ids;
};

TAF.DAO.AccountingPeriodDao.prototype.extractIds = function _extractIds(list) {
    var ids = [];
    
    for (var i = 0; i < list.length; i++) {
        ids.push(list[i].id);
    };
    
    var reduceFunction = function (list, entry) {
        if (list.slice(-1)[0] !== entry) {
            list.push(entry);
        }
        return list;
    };
    ids = ids.sort().reduce(reduceFunction, []);
    
    return ids;
};
