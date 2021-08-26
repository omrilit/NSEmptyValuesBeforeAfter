/**
 * Copyright 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
 
if (!TAF) { var TAF = {}; }
TAF.DAO = TAF.DAO || {};

TAF.DAO.EnhancedTrialBalanceDAO = function EnhancedTrialBalanceDAO() {
    TAF.DAO.SavedReportDAO.call(this);
    this.name = 'EnhancedTrialBalanceDao';
    this.reportName = 'TAF Enhanced Trial Balance';
};

TAF.DAO.EnhancedTrialBalanceDAO.prototype = Object.create(TAF.DAO.SavedReportDAO.prototype);

TAF.DAO.EnhancedTrialBalanceDAO.prototype.getColumnMetadata = function getColumnMetadata(report) {
    var columns = this.getColumns(report);
    
    return {
        internalId: columns[0],
        account: columns[1],
        isLeftSide: columns[2],
        lastDebit: columns[3],
        lastCredit: columns[4],
        currentDebit: columns[5],
        currentCredit: columns[6],
        closingDebit: columns[7],
        closingCredit: columns[8]
    };
};
