/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};

VAT.EU.DataCollector = function DataCollector(report, params) {
    if (!report.dataAdapter) {
        throw nlapiCreateError('MISSING_REQ_PARAM', 'A data adapter is required.');
    }
    
    if (!report.dataFormatter) {
        throw nlapiCreateError('MISSING_REQ_PARAM', 'A data formatter is required.');
    }
    
    this.report = report;
    this.params = params;
    
    try {
        this.adapter = findClass(VAT, report.dataAdapter);
        this.formatter = findClass(VAT, report.dataFormatter);
        this.dataSource = [];
        
        for (var i = 0; report.daos && i < report.daos.length; i++) {
            this.dataSource.push(findClass(VAT, report.daos[i]));
        }
    } catch(ex) {
        logException(ex, 'VAT.EU.DataCollector');
        throw ex;
    }
};

VAT.EU.DataCollector.prototype.getData = function getData() {
    var data = {};
    var dao = null;
    
    try {
        for (var i = 0; this.dataSource && i < this.dataSource.length; i++) {
            dao = this.dataSource[i];
            data[dao.daoName] = dao.getList(this.params);
        }
    } catch(ex) {
        logException(ex, 'VAT.EU.DataCollector.getData');
        throw ex;
    }
    
    return data;
};

VAT.EU.DataCollector.prototype.transform = function transform(data) {
    return this.adapter.transform(data, this.report);
};

VAT.EU.DataCollector.prototype.format = function format(data) {
    return this.formatter.format(data, this.report);
};
