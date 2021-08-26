/**
 * Copyright 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 * 
 * DAO classes for Chart of Account Balances (opening and closing).
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 May 2016     isalen
 */
 
if (!TAF) { var TAF = {}; }
TAF.DAO = TAF.DAO || {};

TAF.DAO.AccountBalance = function AccountBalance() {
    return {
        internalId: -1,
        debit: 0,
        credit: 0,
        isLeftSide: ''
    };
};

TAF.DAO.AccountBalanceDAO = function AccountBalanceDAO() {
    TAF.DAO.SavedReportDAO.call(this);
    this.name = 'AccountBalanceDAO';
};

TAF.DAO.AccountBalanceDAO.prototype = Object.create(TAF.DAO.SavedReportDAO.prototype);

TAF.DAO.AccountBalanceDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
    var columns = this.getColumns(pivotReport);
    
    return {
        internalId: columns[1],
        debit: columns[2],
        credit: columns[3],
        isLeftSide: columns[4]
    };
};

TAF.DAO.AccountBalanceDAO.prototype.extractValues = function extractValues(row, columns) {
    var object = new TAF.DAO.AccountBalance();
    
    for (var col in columns) {
        object[col] = this.getValue(row.getValue(columns[col])).toString();
    }
    
    this.list.push(object);
};



TAF.DAO.OpeningBalanceDAO = function OpeningBalanceDAO() {
    TAF.DAO.AccountBalanceDAO.call(this);
    this.name = 'OpeningBalanceDAO';
    this.reportName = 'TAF Opening Balances';
};

TAF.DAO.OpeningBalanceDAO.prototype = Object.create(TAF.DAO.AccountBalanceDAO.prototype);
