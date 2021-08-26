/**
 * Copyright © 2016, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};
Tax.EU.Intrastat.DAO = Tax.EU.Intrastat.DAO || {};

Tax.EU.Intrastat.DAO.IntrastatGenericSalesDAO = function IntrastatGenericSalesDAO() {
    VAT.EU.DAO.SavedReportDAO.call(this);
    this.daoName = 'IntrastatGenericSalesDAO';
    this.reportName = 'Intrastat Generic Sales Report[4873]';
};

Tax.EU.Intrastat.DAO.IntrastatGenericSalesDAO.prototype = Object.create(VAT.EU.DAO.SavedReportDAO.prototype);

Tax.EU.Intrastat.DAO.IntrastatGenericSalesDAO.prototype.ListObject = function ListObject() {
    return {
        entity:'',
        vatNo:'',
        projectVatNo:'',
        commodityCode:'',
        notcCode:'',
        notc:'',
        deliveryTerms:'',
        shippingCountry:'',
        transactionNumber:'',
        transactionType:'',
        taxCode:'',
        netAmount:'',
        quantity:'',
        weightLbs:'',
        grossWeight: '',
        transactionId: '',
        entityId: '',
        entityType: ''
    };
};

Tax.EU.Intrastat.DAO.IntrastatGenericSalesDAO.prototype.rowToObject = function rowToObject(pivotReport) {
    try {
        var rows = this.getPivotRows(pivotReport).getChildren();
        var columns = this.getColumnMetadata(pivotReport);
        
        for (var i = 0; rows && i < rows.length; i++) {
            this.extractRows(rows[i], columns);
        }
    } catch(ex) {
        logException(ex, 'Tax.EU.Intrastat.DAO.IntrastatGenericSalesDAO.rowToObject');
        throw ex;
    }
    
    return this.list;
};

Tax.EU.Intrastat.DAO.IntrastatGenericSalesDAO.prototype.extractRows = function extractRows(node, columns) {
    var children = node.getChildren();
    var rowObject = null;
    var entity = node.getValue();
    
    for (var i = 0; i < children.length; i++) {
        if (children[i].getChildren()) {
            this.extractRows(children[i], columns);
        } else {
            rowObject = new this.ListObject();
            rowObject.entity = entity;
            
            for (col in columns) {
                rowObject[col] = (children[i].getValue(columns[col]) || '').toString();
            }
            
            this.list.push(rowObject);
        }
    }
};

Tax.EU.Intrastat.DAO.IntrastatGenericSalesDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
    var pivotReportColumns = this.getColumns(pivotReport);
    return {
        vatNo: pivotReportColumns[0],
        projectVatNo: pivotReportColumns[1],
        commodityCode: pivotReportColumns[2],
        notcCode: pivotReportColumns[3],
        notc: pivotReportColumns[4],
        deliveryTerms: pivotReportColumns[5],
        shippingCountry: pivotReportColumns[6],
        transactionNumber: pivotReportColumns[7],
        transactionType: pivotReportColumns[8],
        taxCode: pivotReportColumns[9],
        netAmount: pivotReportColumns[10],
        quantity: pivotReportColumns[11],
        weightLbs: pivotReportColumns[12],
        grossWeight: pivotReportColumns[13],
        transactionId: pivotReportColumns[14],
        entityId: pivotReportColumns[15],
        entityType: pivotReportColumns[16]
    };
};
