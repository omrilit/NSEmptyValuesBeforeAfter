/**
 * Copyright © 2016, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};
Tax.EU.Intrastat.IT = Tax.EU.Intrastat.IT || {};

/**
 * Sales DAO
 */
Tax.EU.Intrastat.IT.IntrastatSalesDAO = function _IntrastatSalesDAO() {
	Tax.EU.Intrastat.DAO.IntrastatGenericSalesDAO.call(this);
	this.daoName = 'IntrastatITSalesDAO';
	this.reportName = 'Intrastat IT Sales Report[4873]';
};
Tax.EU.Intrastat.IT.IntrastatSalesDAO.prototype = Object.create(Tax.EU.Intrastat.DAO.IntrastatGenericSalesDAO.prototype);

Tax.EU.Intrastat.IT.IntrastatSalesDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
    var pivotReportColumns = this.getColumns(pivotReport);
    return {
        shippingCountry: pivotReportColumns[0],
        vatNo: pivotReportColumns[1],
        projectVatNo: pivotReportColumns[2],
        notcCode: pivotReportColumns[3],
        notc: pivotReportColumns[4],
        commodityCode: pivotReportColumns[5],
        quantity: pivotReportColumns[6],
        netAmount: pivotReportColumns[7],
        deliveryTerms: pivotReportColumns[8],
        taxCode: pivotReportColumns[9],
        transactionType: pivotReportColumns[10],
        weightLbs: pivotReportColumns[11],
        grossWeight: pivotReportColumns[12],
        entityId: pivotReportColumns[13],
        entityType: pivotReportColumns[14]
    };
};

/**
 * Purchase DAO
 */
Tax.EU.Intrastat.IT.IntrastatPurchaseDAO = function _IntrastatPurchaseDAO() {
	Tax.EU.Intrastat.DAO.IntrastatGenericPurchaseDAO.call(this);
	this.daoName = 'IntrastatITPurchaseDAO';
	this.reportName = 'Intrastat IT Purchase Report[4873]';
};
Tax.EU.Intrastat.IT.IntrastatPurchaseDAO.prototype = Object.create(Tax.EU.Intrastat.DAO.IntrastatGenericPurchaseDAO.prototype);

Tax.EU.Intrastat.IT.IntrastatPurchaseDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
    var pivotReportColumns = this.getColumns(pivotReport);
    return {
        shippingCountry: pivotReportColumns[0],
        vatNo: pivotReportColumns[1],
        projectVatNo: pivotReportColumns[2],
        notcCode: pivotReportColumns[3],
        notc: pivotReportColumns[4],
        commodityCode: pivotReportColumns[5],
        quantity: pivotReportColumns[6],
        netAmount: pivotReportColumns[7],
        deliveryTerms: pivotReportColumns[8],
        taxCode: pivotReportColumns[9],
        transactionType: pivotReportColumns[10],
        weightLbs: pivotReportColumns[11],
        grossWeight: pivotReportColumns[12],
        entityId: pivotReportColumns[13],
        entityType: pivotReportColumns[14]
    };
};

/**
 * Data Aggregator
 */
Tax.EU.Intrastat.IT.IntrastatDataAggregator = function _IntrastatDataAggregator(aggregator) {
	Tax.EU.Intrastat.IntrastatDataAggregator.call(this);
	this.daoName = 'IntrastatITDataAggregator';
};
Tax.EU.Intrastat.IT.IntrastatDataAggregator.prototype = Object.create(Tax.EU.Intrastat.IntrastatDataAggregator.prototype);

Tax.EU.Intrastat.IT.IntrastatDataAggregator.prototype.getConsolidationKey = function _getConsolidationKey(obj) {
    if (!obj) {
        var error = nlapiCreateError('MISSING_PARAMETER', 'obj argument is required.');
        logException(error, 'Tax.EU.Intrastat.IT.IntrastatDataAggregator.getConsolidationKey');
        throw error;
    }

    return [
        obj.commodityCode,
        obj.natureOfTransaction,
        obj.deliveryTerm,
        obj.countryCode,
        obj.entityVatNo
    ].join('-');
};

/**
 * Data Adapter
 */
Tax.EU.Intrastat.IT.IntrastatDataAdapter = function _IntrastatDataAdapter() {
	Tax.EU.Intrastat.IntrastatDataAdapter.call(this);
	this.daoName = 'IntrastatITDataAdapter';
};
Tax.EU.Intrastat.IT.IntrastatDataAdapter.prototype = Object.create(Tax.EU.Intrastat.IntrastatDataAdapter.prototype);

Tax.EU.Intrastat.IT.IntrastatDataAdapter.prototype.convertToLine = function _convertToLine(row) {
    if (!row) {
        throw nlapiCreateError('MISSING_PARAMETER', 'row argument is required.');
    }

    if (!this.taxCodeMap[row.taxCode] || this.taxCodeMap[row.taxCode].isService == 'T') {
        return null;
    }

    var line = new Tax.EU.Intrastat.IntrastatLine();

    try {
        line.exclude = false;
        line.entityVatNo = this.formatVatNo(row.vatNo || row.projectVatNo, row.shippingCountry);

        if (line.entityVatNo) {
            this.vatNoToEntityMap[line.entityVatNo] = this.vatNoToEntityMap[line.entityVatNo] || row.entity;
        }

        line.entityName = this.vatNoToEntityMap[line.entityVatNo] || row.entity;
        line.commodityCode = row.commodityCode;
        line.natureOfTransaction = row.notcCode || row.notc || this.notcMap[row.transactionType] || '';
        line.deliveryTerm = row.deliveryTerms;
        line.countryCode = row.shippingCountry;
        line.tranType = (this.tranTypeMap[row.transactionType] && this.tranTypeMap[row.transactionType].internalId) || '';
        line.entityType = this.getEntityType(row.entityType);

        line.entityNameUrl = this.constructUrl(line.entityType, row.entityId);

        line.origValue = Math.abs(row.netAmount);
        line.origSupplementaryUnit = Math.abs(row.quantity);
        line.origNetMass = ((parseFloat(row.weightLbs || 0) / this.POUNDS_TO_KILOS_FACTOR).toFixed(5)) * line.origSupplementaryUnit;
    } catch(e) {
        logException(e, 'Tax.EU.Intrastat.IT.IntrastatDataAdapter.convertToLine');
        return null;
    }

    return line;
};
