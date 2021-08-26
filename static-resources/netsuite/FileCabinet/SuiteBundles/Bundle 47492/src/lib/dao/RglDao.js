/**
 * Copyright 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

 
if (!TAF) { var TAF = {}; }
TAF.DAO = TAF.DAO || {};

TAF.DAO.RglDao = function RglDao() {
    TAF.DAO.SavedReportDAO.call(this);
    this.name = 'RglDao';
    this.reportName = '';
};

TAF.DAO.RglDao.prototype = Object.create(TAF.DAO.SavedReportDAO.prototype);

TAF.DAO.RglDao.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
    var columns = this.getColumns(pivotReport);
    
    return {
        entity: columns[0],
        entityId: columns[1],
        entityUen: columns[2],
        date: columns[3],
        sourceTranNo: columns[4],
        rglAmount: columns[5],
        currency: columns[6]
    };
};

TAF.DAO.RglDao.prototype.getSummary = function getSummary(params) {
    try {
        this.initialize(params);
        var report = this.search();
        var summaryLine = this.getSummaryLine(report);
        var columns = this.getColumnMetadata(report);
        this.extractValues(summaryLine, columns);
        
        if (this.list && this.list.length > 0) {
            return this.list[0];
        }
        
        return {};
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DAO.RglDao.getSummary', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error getting summary in search');
    }
};

TAF.DAO.RglDao.prototype.getSummaryLine = function getSummaryLine(pivotReport) {
    return pivotReport.getRowHierarchy().getSummaryLine();
};

