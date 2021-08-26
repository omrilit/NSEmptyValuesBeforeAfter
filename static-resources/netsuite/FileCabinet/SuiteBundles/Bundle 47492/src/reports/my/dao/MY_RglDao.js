/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.MY = TAF.MY || {};
TAF.MY.DAO = TAF.MY.DAO || {};

TAF.MY.DAO.GAFRglDAO = function GAFRglDAO() {
    TAF.DAO.RglDao.call(this);
    this.name = 'GAFRglDAO';
    this.reportName = 'TAF MY GAF RGL';
};

TAF.MY.DAO.GAFRglDAO.prototype = Object.create(TAF.DAO.RglDao.prototype);

TAF.MY.DAO.GAFRglDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
    var columns = this.getColumns(pivotReport);
    
    return {
        entity: columns[0],
        entityId: columns[1],
        entityBrn: columns[2],
        date: columns[3],
        sourceTranNo: columns[4],
        memo: columns[5],
        rglAmount: columns[6],
        shipTo: columns[7],
        billTo: columns[8],
        currency: columns[9]
    };
};
