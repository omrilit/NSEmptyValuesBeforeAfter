/**
 * Copyright © 2016, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};
Tax.EU.Intrastat.FR = Tax.EU.Intrastat.FR || {};

/**
 * Sales DAO
 */
Tax.EU.Intrastat.FR.IntrastatSalesDAO = function _IntrastatSalesDAO() {
    Tax.EU.Intrastat.DAO.IntrastatGenericSalesDAO.call(this);
    this.daoName = 'IntrastatFRSalesDAO';
    this.reportName = 'Intrastat FR Sales Report[4873]';
};
Tax.EU.Intrastat.FR.IntrastatSalesDAO.prototype = Object.create(Tax.EU.Intrastat.DAO.IntrastatGenericSalesDAO.prototype);

Tax.EU.Intrastat.FR.IntrastatSalesDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
    var pivotReportColumns = this.getColumns(pivotReport);
    return {
        vatNo: pivotReportColumns[0],
        projectVatNo: pivotReportColumns[1],
        transactionDate: pivotReportColumns[2],
        transactionNumber: pivotReportColumns[3],
        shippingCountry: pivotReportColumns[4],
        netAmount: pivotReportColumns[5],
        commodityCode: pivotReportColumns[6],
        deliveryTerms: pivotReportColumns[7],
        notcCode: pivotReportColumns[8],
        notc: pivotReportColumns[9],
        quantity: pivotReportColumns[10],
        transactionType: pivotReportColumns[11],
        taxCode: pivotReportColumns[12],
        weightLbs: pivotReportColumns[13],
        grossWeight: pivotReportColumns[14],
        euTriangulation: pivotReportColumns[15],
        transactionId: pivotReportColumns[16],
        entityId: pivotReportColumns[17],
        entityType: pivotReportColumns[18],
        regimeCode: pivotReportColumns[19],
        modeOfTransport: pivotReportColumns[20],
        regionOfOrigin: pivotReportColumns[21],

    };
};

/**
 * Purchase DAO
 */
Tax.EU.Intrastat.FR.IntrastatPurchaseDAO = function _IntrastatPurchaseDAO() {
    Tax.EU.Intrastat.DAO.IntrastatGenericPurchaseDAO.call(this);
    this.daoName = 'IntrastatFRPurchaseDAO';
    this.reportName = 'Intrastat FR Purchase Report[4873]';
};
Tax.EU.Intrastat.FR.IntrastatPurchaseDAO.prototype = Object.create(Tax.EU.Intrastat.DAO.IntrastatGenericPurchaseDAO.prototype);

Tax.EU.Intrastat.FR.IntrastatPurchaseDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
    var pivotReportColumns = this.getColumns(pivotReport);
    return {
        vatNo: pivotReportColumns[0],
        projectVatNo: pivotReportColumns[1],
        transactionDate: pivotReportColumns[2],
        transactionNumber: pivotReportColumns[3],
        shippingCountry: pivotReportColumns[4],
        netAmount: pivotReportColumns[5],
        commodityCode: pivotReportColumns[6],
        deliveryTerms: pivotReportColumns[7],
        notcCode: pivotReportColumns[8],
        notc: pivotReportColumns[9],
        quantity: pivotReportColumns[10],
        transactionType: pivotReportColumns[11],
        taxCode: pivotReportColumns[12],
        weightLbs: pivotReportColumns[13],
        grossWeight: pivotReportColumns[14],
        transactionId: pivotReportColumns[15],
        entityId: pivotReportColumns[16],
        entityType: pivotReportColumns[17],
        regimeCode: pivotReportColumns[18],
        modeOfTransport: pivotReportColumns[19],
        regionOfOrigin: pivotReportColumns[20],
        lineCountryOfOrigin: pivotReportColumns[21],
        countryOfOrigin: pivotReportColumns[22],
    };
};

/**
 * Data Aggregator
 */
Tax.EU.Intrastat.FR.IntrastatDataAggregator = function _IntrastatDataAggregator(aggregator) {
    Tax.EU.Intrastat.IntrastatDataAggregator.call(this);
    this.daoName = 'IntrastatFRDataAggregator';
};
Tax.EU.Intrastat.FR.IntrastatDataAggregator.prototype = Object.create(Tax.EU.Intrastat.IntrastatDataAggregator.prototype);

Tax.EU.Intrastat.FR.IntrastatDataAggregator.prototype.getConsolidationKey = function _getConsolidationKey(obj) {
    if (!obj) {
        var error = nlapiCreateError('MISSING_PARAMETER', 'obj argument is required.');
        logException(error, 'Tax.EU.Intrastat.FR.IntrastatDataAggregator.getConsolidationKey');
        throw error;
    }

    return [
        obj.transactionDate,
        obj.referenceNo,
        obj.entityVatNo,
        obj.countryCode,
        obj.commodityCode,
        obj.deliveryTerm,
        obj.natureOfTransaction,
        obj.indicator
    ].join('-');
};

/* 2019 Version */
Tax.EU.Intrastat.FR.IntrastatDataAggregator_2019 = function _IntrastatDataAggregator(aggregator) {
    Tax.EU.Intrastat.IntrastatDataAggregator.call(this);
    this.daoName = 'IntrastatFRDataAggregator_2019';
};
Tax.EU.Intrastat.FR.IntrastatDataAggregator_2019.prototype = Object.create(Tax.EU.Intrastat.IntrastatDataAggregator.prototype);

Tax.EU.Intrastat.FR.IntrastatDataAggregator_2019.prototype.getConsolidationKey = function _getConsolidationKey(obj) {
    if (!obj) {
        var error = nlapiCreateError('MISSING_PARAMETER', 'obj argument is required.');
        logException(error, 'Tax.EU.Intrastat.FR.IntrastatDataAggregator.getConsolidationKey');
        throw error;
    }

    return [
        obj.transactionDate,
        obj.referenceNo,
        obj.entityVatNo,
        obj.countryCode,
        obj.commodityCode,
        obj.natureOfTransaction,
        obj.indicator,
        obj.regionOfOrigin,
        obj.countryOfOrigin,
    ].join('-');
};

Tax.EU.Intrastat.FR.IntrastatLine = function _IntrastatLine() {
    return {
        lineNumber: -1,
        exclude: '',
        commodityCode: '',
        value: 0,
        deliveryTerm: '',
        natureOfTransaction: '',
        netMass: 0,
        supplementaryUnit: '',
        countryCode: '',
        referenceNo: '',
        entityName: '',
        entityVatNo: '',
        origValue: '',
        origSupplementaryUnit: '',
        origNetMass: '',
        transactionDate: '',
        indicator: '',
        tranType: '',
        entityType: '',
        entityNameUrl: '',
        referenceNoUrl: '',
        regimeCode: '',
        modeOfTransport: '',
        regionOfOrigin: '',
        countryOfOrigin: '',
    };
};

/**
 * Data Adapter
 */
Tax.EU.Intrastat.FR.IntrastatDataAdapter = function _IntrastatDataAdapter() {
    Tax.EU.Intrastat.IntrastatDataAdapter.call(this);
    this.daoName = 'IntrastatFRDataAdapter';
};
Tax.EU.Intrastat.FR.IntrastatDataAdapter.prototype = Object.create(Tax.EU.Intrastat.IntrastatDataAdapter.prototype);

Tax.EU.Intrastat.FR.IntrastatDataAdapter.prototype.convertToLine = function _convertToLine(row) {
    if (!row) {
        throw nlapiCreateError('MISSING_PARAMETER', 'row argument is required.');
    }

    var line = new Tax.EU.Intrastat.FR.IntrastatLine();

    try {
        line.exclude = false;
        line.entityVatNo = this.formatVatNo(row.vatNo || row.projectVatNo, row.shippingCountry);
        
        if (line.entityVatNo) {
            this.vatNoToEntityMap[line.entityVatNo] = this.vatNoToEntityMap[line.entityVatNo] || row.entity;
        }
        
        line.transactionDate = row.transactionDate;
        line.referenceNo = row.transactionNumber;
        line.entityName = this.vatNoToEntityMap[line.entityVatNo] || row.entity;
        line.countryCode = row.shippingCountry;
        line.commodityCode = row.commodityCode;
        line.deliveryTerm = row.deliveryTerms;
        line.natureOfTransaction = row.notcCode || row.notc || this.notcMap[row.transactionType] || '';
        line.tranType = (this.tranTypeMap[row.transactionType] && this.tranTypeMap[row.transactionType].internalId) || '';
        line.entityType = this.getEntityType(row.entityType);
        
        line.entityNameUrl = this.constructUrl(line.entityType, row.entityId);
        line.referenceNoUrl = this.constructUrl(line.tranType, row.transactionId);
        line.regimeCode = row.regimeCode;
        line.modeOfTransport = row.modeOfTransport;
        line.regionOfOrigin = row.regionOfOrigin;
        line.countryOfOrigin = row.lineCountryOfOrigin || row.countryOfOrigin;
        
        line.origValue = Math.abs(row.netAmount);
        line.origSupplementaryUnit = Math.abs(row.quantity);
        line.origNetMass = ((parseFloat(row.weightLbs || 0) / this.POUNDS_TO_KILOS_FACTOR).toFixed(5)) * line.origSupplementaryUnit;
        line.indicator = this.getLineIndicator(row);
    } catch(e) {
        logException(e, 'Tax.EU.Intrastat.FR.IntrastatDataAdapter.convertToLine');
        return null;
    }

    return line;
};

Tax.EU.Intrastat.FR.IntrastatDataAdapter.prototype.getLineIndicator = function _getLineIndicator(row) {
    if (!row) {
        throw nlapiCreateError('MISSING_PARAMETER', 'row argument is required.');
    }

    try {
        var taxCodeObj = this.taxCodeMap[row.taxCode];
        var indicator;

        if (row.euTriangulation == 'T') {
            indicator = CONSTANTS.INDICATOR.EU_TRIANGULATION;
        } else if (taxCodeObj.isService == 'T') {
            indicator = CONSTANTS.INDICATOR.SERVICES;
        } else {
            indicator = CONSTANTS.INDICATOR.GOODS;
        }

        return indicator;
    } catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.FR.IntrastatDataAdapter.getLineIndicator');
        throw ex;
    }
};

/**
 * Export adapter
 */
Tax.EU.Intrastat.FR.ExportAdapter = function _ExportAdapter() {
    Tax.EU.Intrastat.ExportAdapter.call(this);
};
Tax.EU.Intrastat.FR.ExportAdapter.prototype = Object.create(Tax.EU.Intrastat.ExportAdapter.prototype);

Tax.EU.Intrastat.FR.ExportAdapter.prototype.transform = function _transform(params) {
    if (!params || !params.meta || !params.meta.columns || !params.meta.columns.ReportAdapter || !params.meta.columns.ReportAdapter.indicator) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.meta.columns.ReportAdapter.indicator argument is required');
    }

    this.indicatorCache = JSON.parse(params.indicatorCache || '{}');
    this.indicatorMap = this.getIndicatorMap(params.meta.columns.ReportAdapter.indicator);

    return Tax.EU.Intrastat.ExportAdapter.prototype.transform.call(this, params);
};

Tax.EU.Intrastat.FR.ExportAdapter.prototype.getLineData = function _getLineData(line) {
    var indicatorValue = this.indicatorCache[line.lineNumber] != undefined ? this.indicatorCache[line.lineNumber] : line.indicator;
    line.indicator = this.indicatorMap[indicatorValue];
    return line;
};

Tax.EU.Intrastat.FR.ExportAdapter.prototype.getIndicatorMap = function _getIndicatorMap(indicatorColumn) {
    if (!indicatorColumn) {
        throw nlapiCreateError('MISSING_PARAMETER', 'indicatorColumn argument is required');
    }

    var map = {};

    for (var j = 0; j < indicatorColumn.data.length; j++) {
        map[indicatorColumn.data[j].id] = indicatorColumn.data[j].text;
    }

    return map;
};
