/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.DAO = VAT.EU.DAO || {};

VAT.EU.DAO.TaxCodeJournalSavedReportDAO = function TaxCodeJournalSavedReportDAO() {
    VAT.EU.DAO.TaxCodeSavedReportDAO.call(this);
    this.daoName = 'TaxCodeJournalSavedReportDAO';
	this.reportName = 'EC Sales Summary by Tax Code [4873] - JRN';
};

VAT.EU.DAO.TaxCodeJournalSavedReportDAO.prototype = Object.create(VAT.EU.DAO.TaxCodeSavedReportDAO.prototype);

VAT.EU.DAO.TaxCodeJournalSavedReportDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
    var pivotReportColumns = this.getColumns(pivotReport);
    return {
        'vatNo': pivotReportColumns[0],
        'billingCountry': pivotReportColumns[1],
        'shippingCountry': pivotReportColumns[2],
        'taxCode': pivotReportColumns[3],
        'netAmount': pivotReportColumns[4],
        'transactionType': pivotReportColumns[5],
        'projectVatNo': pivotReportColumns[6],
        'transactionNumber': pivotReportColumns[7],
        'trandate': pivotReportColumns[8],
        'euTriangulation': pivotReportColumns[9]
    };
};
