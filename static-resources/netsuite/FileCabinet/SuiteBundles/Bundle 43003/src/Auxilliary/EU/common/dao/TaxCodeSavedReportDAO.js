/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.DAO = VAT.EU.DAO || {};

VAT.EU.DAO.TaxCodeSavedReportDAO = function TaxCodeSavedReportDAO() {
    VAT.EU.DAO.SavedReportDAO.call(this);
    this.daoName = 'TaxCodeSavedReportDAO';
    this.reportName = "EC Sales Summary by Tax Code [4873]";
};

VAT.EU.DAO.TaxCodeSavedReportDAO.prototype = Object.create(VAT.EU.DAO.SavedReportDAO.prototype);

VAT.EU.DAO.TaxCodeSavedReportDAO.prototype.ListObject = function ListObject() {
    return {
        'customer': '',
        'vatNo': '',
        'billingCountry': '',
        'shippingCountry': '',
        'taxCode': '',
        'netAmount': '',
        'transactionType': '',
        'projectVatNo': '',
        'euTriangulation': '',
        'transactionNumber': '',
        'trandate': ''
    };
};

VAT.EU.DAO.TaxCodeSavedReportDAO.prototype.rowToObject = function rowToObject(pivotReport) {
    try {
        var rows = this.getPivotRows(pivotReport).getChildren();
        var columns = this.getColumnMetadata(pivotReport);
        
        for (var i = 0; rows && i < rows.length; i++) {
            this.extractRows(rows[i], columns);
        }
    } catch(e) {
        throw e;
    }
    
    return this.list;
};

VAT.EU.DAO.TaxCodeSavedReportDAO.prototype.extractRows = function extractRows(node, columns) {
    var children = node.getChildren();
    var rowObject = null;
    var customer = node.getValue();
    
    for (var i = 0; i < children.length; i++) {
        if (children[i].getChildren()) {
            this.extractRows(children[i], columns);
        } else {
            rowObject = new this.ListObject();
            rowObject.customer = customer;
            
            for (col in columns) {
                rowObject[col] = this.getValue(children[i].getValue(columns[col])).toString();
            }
            
            this.list.push(rowObject);
        }
    }
};

VAT.EU.DAO.TaxCodeSavedReportDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
    var pivotReportColumns = this.getColumns(pivotReport);
    return {
        'vatNo': pivotReportColumns[0],
        'billingCountry': pivotReportColumns[1],
        'shippingCountry': pivotReportColumns[2],
        'taxCode': pivotReportColumns[3],
        'netAmount': pivotReportColumns[4],
        'transactionType': pivotReportColumns[5],
        'projectVatNo': pivotReportColumns[6],
        'euTriangulation': pivotReportColumns[7]
    };
};

VAT.EU.DAO.TaxCodeSavedReportDAO.prototype.getValue = function getValue(value) {
    if (value === null || value === undefined) {
        return '';
    }
    
    return value;
};
