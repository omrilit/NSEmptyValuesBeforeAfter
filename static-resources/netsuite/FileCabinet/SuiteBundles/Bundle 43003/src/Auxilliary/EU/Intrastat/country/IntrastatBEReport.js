/**
 * Copyright (c) 2017, 2019, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};
Tax.EU.Intrastat.BE = Tax.EU.Intrastat.BE || {};

//-------------------ReportDAO-------------------
Tax.EU.Intrastat.BE.ReportDAO = function IntrastatBEReportDAO() {
    Tax.DAO.ReportDAO.call(this);
    this.Name = 'BEReportDAO';
    this.reportName = '';
};

Tax.EU.Intrastat.BE.ReportDAO.prototype = Object.create(Tax.DAO.ReportDAO.prototype);

Tax.EU.Intrastat.BE.ReportDAO.prototype.ListObject = function ListObject() {
    return {
        itemDescription: '',
        itemText: '',
        shipCountry: '',
        region: '',
        notcCode: '',
        notc: '',
        commodityCode: '',
        quantity: '',
        netAmount: '',
        deliveryTerms: '',
        transactionType: '',
        taxCode: '',
        weightLbs: '',
        grossWeight: '',
        modeOfTransport: '',
        statisticalValue: '',
        transactionId: '',
        transactionLineId: '',
        itemId: '',
        itemType: '',
        vatNo: '',
        projectVatNo: ''
    };
};

Tax.EU.Intrastat.BE.ReportDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
    try {
        var pivotReportColumns = this.getColumns(pivotReport);
        var line = new this.ListObject();
        line.itemDescription = pivotReportColumns[0];
        line.itemText = pivotReportColumns[1];
        line.shipCountry = pivotReportColumns[2];
        line.region = pivotReportColumns[3];
        line.notcCode = pivotReportColumns[4];
        line.notc = pivotReportColumns[5];
        line.commodityCode = pivotReportColumns[6];
        line.quantity = pivotReportColumns[7];
        line.netAmount = pivotReportColumns[8];
        line.deliveryTerms = pivotReportColumns[9];
        line.transactionType = pivotReportColumns[10];
        line.taxCode = pivotReportColumns[11];
        line.weightLbs = pivotReportColumns[12];
        line.grossWeight = pivotReportColumns[13];
        line.modeOfTransport = pivotReportColumns[14];
        line.statisticalValue = pivotReportColumns[15];
        line.transactionId = pivotReportColumns[16];
        line.transactionLineId = pivotReportColumns[17];
        line.itemId = pivotReportColumns[18];
        line.itemType = pivotReportColumns[19];
        line.vatNo = pivotReportColumns[20];
        line.projectVatNo = pivotReportColumns[21];
        return line;
    } catch (ex) {
        logException(ex, 'IntrastatBEReportDAO.getColumnMetadata');
        throw ex;
    }
};

//-------------------DAO-------------------
Tax.EU.Intrastat.BE.SalesReportDAO = function IntrastatBESalesReportDAO() {
    Tax.EU.Intrastat.BE.ReportDAO.call(this);
    this.Name = 'BESalesReportDAO';
    this.reportName = 'Intrastat BE Sales Report[11208]';
};

Tax.EU.Intrastat.BE.SalesReportDAO.prototype = Object.create(Tax.EU.Intrastat.BE.ReportDAO.prototype);

Tax.EU.Intrastat.BE.SalesReportDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
    try {
        var pivotReportColumns = this.getColumns(pivotReport);
        var line = new this.ListObject();
        line.itemDescription = pivotReportColumns[0];
        line.itemText = pivotReportColumns[1];
        line.shipCountry = pivotReportColumns[2];
        line.region = pivotReportColumns[3];
        line.notcCode = pivotReportColumns[4];
        line.notc = pivotReportColumns[5];
        line.commodityCode = pivotReportColumns[6];
        line.quantity = pivotReportColumns[7];
        line.netAmount = pivotReportColumns[8];
        line.deliveryTerms = pivotReportColumns[9];
        line.transactionType = pivotReportColumns[10];
        line.taxCode = pivotReportColumns[11];
        line.weightLbs = pivotReportColumns[12];
        line.grossWeight = pivotReportColumns[13];
        line.modeOfTransport = pivotReportColumns[14];
        line.statisticalValue = pivotReportColumns[15];
        line.transactionId = pivotReportColumns[16];
        line.transactionLineId = pivotReportColumns[17];
        line.itemId = pivotReportColumns[18];
        line.itemType = pivotReportColumns[19];
        line.vatNo = pivotReportColumns[20];
        line.projectVatNo = pivotReportColumns[21];
        line.lineCountryOfOrigin = pivotReportColumns[22];
        line.lineCounterpartyVAT = pivotReportColumns[23];
        line.countryOfOrigin = pivotReportColumns[24];
        line.counterpartyVAT = pivotReportColumns[25];
        return line;
    } catch (ex) {
        logException(ex, 'IntrastatBEReportDAO.getColumnMetadata');
        throw ex;
    }
};


Tax.EU.Intrastat.BE.PurchaseReportDAO = function IntrastatBEPurchaseReportDAO() {
    Tax.EU.Intrastat.BE.ReportDAO.call(this);
    this.Name = 'BEPurchaseReportDAO';
    this.reportName = 'Intrastat BE Purchase Report[11208]';
};

Tax.EU.Intrastat.BE.PurchaseReportDAO.prototype = Object.create(Tax.EU.Intrastat.BE.ReportDAO.prototype);

//-------------------DataAdapter-------------------
Tax.EU.Intrastat.BE.IntrastatLine = function _IntrastatLine() {
    return {
        lineNumber: -1,
        exclude: false,
        commodityCode: '',
        value: 0,
        descriptionOfGoods: '',
        item: '',
        itemUrl: '',
        destinationCountry: '',
        supplementaryUnit: '',
        netMass: '',
        origValue: '',
        origSupplementaryUnit: '',
        origNetMass: '',
        region: '',
        natureOfTransaction: '',
        deliveryTerms: '',
        modeOfTransport: '',
        entityVatNo: '',
        isExtended: false,
        transactionType: '',
        counterpartyVAT: '',
        countryOfOrigin: ''
    };
};

Tax.EU.Intrastat.BE.DataAdapter = function _DataAdapter() {
    Tax.EU.Intrastat.IntrastatDataAdapter.call(this);
    this.Name = 'BEDataAdapter';
};

Tax.EU.Intrastat.BE.DataAdapter.prototype = Object.create(Tax.EU.Intrastat.IntrastatDataAdapter.prototype);

Tax.EU.Intrastat.BE.DataAdapter.prototype.convertToLine = function convertToLine(row) {
    if (!row) {
        throw nlapiCreateError('INVALID_PARAMETER', 'A row object is required.');
    }
    
    if (!row.taxCode ||
        !this.taxCodeMap ||
        !this.taxCodeMap[row.taxCode] || 
        (this.taxCodeMap[row.taxCode].isService == 'T')) {
        return null;
    }
    
    try {
        var line = new Tax.EU.Intrastat.BE.IntrastatLine();
        var computedNetMass;
        
        line.destinationCountry = row.shipCountry || '';
        line.region = row.region || '';
        line.natureOfTransaction = row.notcCode || row.notc || this.notcMap[row.transactionType] || '';
        line.commodityCode = row.commodityCode || '';
        
        line.deliveryTerms = row.deliveryTerms || '';
        line.modeOfTransport = row.modeOfTransport || '';
        if(line.modeOfTransport || line.deliveryTerms) {
            line.isExtended = true;
        }

        line.entityVatNo = row.vatNo || row.projectVatNo;
        line.origValue = Math.abs(row.netAmount);
        line.origSupplementaryUnit = Math.abs(row.quantity);
        line.origNetMass = ((parseFloat(row.weightLbs || 0) / this.POUNDS_TO_KILOS_FACTOR).toFixed(5)) * line.origSupplementaryUnit;
        line.transactionType = row.transactionType;

        line.counterpartyVAT = row.lineCounterpartyVAT || row.counterpartyVAT || CONSTANTS.DEFAULT.BE.COUNTERPARTY_VATNO;
        line.countryOfOrigin = row.lineCountryOfOrigin || row.countryOfOrigin || CONSTANTS.DEFAULT.BE.COUNTRY_OF_ORIGIN;
        return line;
    } catch(ex) {
        logException(ex, 'Tax.EU.Intrastat.BE.DataAdapter.convertToLine');
        return null;
    }
};

//-------------------DataAggregator-------------------
Tax.EU.Intrastat.BE.IntrastatDataAggregator = function _IntrastatDataAggregator(aggregator) {
    Tax.EU.Intrastat.IntrastatDataAggregator.call(this);
    this.daoName = 'IntrastatBEDataAggregator';
    this.RETURN_TXNS = ['BILLCRED', 'CREDMEM', 'RETURN'];
};
Tax.EU.Intrastat.BE.IntrastatDataAggregator.prototype = Object.create(Tax.EU.Intrastat.IntrastatDataAggregator.prototype);

Tax.EU.Intrastat.BE.IntrastatDataAggregator.prototype.getConsolidationKey = function _getConsolidationKey(obj) {
    if (!obj) {
        var error = nlapiCreateError('MISSING_PARAMETER', 'obj argument is required.');
        logException(error, 'Tax.EU.Intrastat.BE.IntrastatDataAggregator.getConsolidationKey');
        throw error;
    }

    var key = [
        obj.commodityCode,
        obj.destinationCountry,
        obj.natureOfTransaction,
        obj.region,
        obj.modeOfTransport,
        obj.deliveryTerms
    ];
    var tranType = obj.transactionType ? obj.transactionType.toUpperCase() : '';

    if (this.RETURN_TXNS.indexOf(tranType) > -1) {
        key.push('RETURN_TXN');
    }

    return key.join('-');
};

Tax.EU.Intrastat.BE.IntrastatDataAggregator.prototype.add = function add(obj) {
    if (!obj) {
        return;
    }

    Tax.EU.Intrastat.IntrastatDataAggregator.prototype.add.call(this, obj);

    try {
        var key = this.getConsolidationKey(obj);
        var listItem = this.list[this.keyToListMap[key]];

        if (listItem) {
            listItem.entityVatNo = listItem.entityVatNo === obj.entityVatNo ? listItem.entityVatNo : '';
        }
    } catch(e) {
        logException(e, 'Tax.EU.Intrastat.BE.IntrastatDataAggregator.add');
    }
};

Tax.EU.Intrastat.BE.IntrastatDataAggregator.prototype.setDisplayAmounts = function setDisplayAmounts(obj) {
    obj.value = obj.origValue;
    obj.supplementaryUnit = obj.origSupplementaryUnit;
    obj.netMass = Math.max(obj.origNetMass, 0.01);
};


// 2019 Version
Tax.EU.Intrastat.BE.IntrastatDataAggregator_2019 = function _IntrastatDataAggregator(aggregator) {
    Tax.EU.Intrastat.BE.IntrastatDataAggregator.call(this);
    this.daoName = 'IntrastatBEDataAggregator_2019';
};
Tax.EU.Intrastat.BE.IntrastatDataAggregator_2019.prototype = Object.create(Tax.EU.Intrastat.BE.IntrastatDataAggregator.prototype);

Tax.EU.Intrastat.BE.IntrastatDataAggregator_2019.prototype.getConsolidationKey = function _getConsolidationKey(obj) {
    if (!obj) {
        var error = nlapiCreateError('MISSING_PARAMETER', 'obj argument is required.');
        logException(error, 'Tax.EU.Intrastat.BE.IntrastatDataAggregator_2019.getConsolidationKey');
        throw error;
    }

    var key = [
        obj.commodityCode,
        obj.destinationCountry,
        obj.natureOfTransaction,
        obj.region,
        obj.modeOfTransport,
        obj.deliveryTerms,
        obj.counterpartyVAT,
        obj.countryOfOrigin
    ];
    var tranType = obj.transactionType ? obj.transactionType.toUpperCase() : '';

    if (this.RETURN_TXNS.indexOf(tranType) > -1) {
        key.push('RETURN_TXN');
    }

    return key.join('-');
};


//-------------------ExportAdapter-------------------
Tax.EU.Intrastat.BE.ExportAdapter = function _ExportAdapter() {
    Tax.EU.Intrastat.ExportAdapter.call(this);
    this.Name = 'ExportAdapter';
};

Tax.EU.Intrastat.BE.ExportAdapter.prototype = Object.create(Tax.EU.Intrastat.ExportAdapter.prototype);

Tax.EU.Intrastat.BE.ExportAdapter.prototype.transform = function _transform(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params argument is required');
    }

    var excludeCache = JSON.parse(params.excludeCache || '{}');
    var standardExportData = [];
    var extendedExportData = [];
    var lineNumber = -1;

    for (var i = 0; i < this.data.length; i++) {
        lineNumber = this.data[i].lineNumber;
        
        if ((excludeCache[lineNumber] == undefined && !this.data[i].exclude) || (excludeCache[lineNumber] != undefined && !excludeCache[lineNumber])) {
            var line = this.getLineData(this.data[i]);
            if(line.isExtended) {
                extendedExportData.push(line);
            } else {
                standardExportData.push(line);
            }
        }
    }
    
    var result = {};
    result['ExtendedExportData'] = extendedExportData;
    result['StandardExportData'] = standardExportData;
    
    return result;
};

//-------------------CSV & XML Formatter-------------------
Tax.EU.Intrastat.BE.ReportFormatter = function _ReportFormatter() {
    Tax.EU.Intrastat.IntrastatFormatter.call(this);
    this.Name = 'BEReportFormatter';
};

Tax.EU.Intrastat.BE.ReportFormatter.prototype = Object.create(Tax.EU.Intrastat.IntrastatFormatter.prototype);

Tax.EU.Intrastat.BE.ReportFormatter.prototype.format = function _format(value, columnMeta) {
    if (!columnMeta) {
        return value;
    }
    if (((value == 0) && 
            (columnMeta.type == 'numeric' || columnMeta.type == 'floornumeric' || columnMeta.type == 'roundwholenumber' || columnMeta.type == 'roundnumeric') &&
            (!columnMeta.noblank)) ||
        (value === '' || value == null || value == undefined)) {
        return '';
    }
    
    if(columnMeta.type == 'numeric'){
    	// this forces the value to not have separators (e.g. ,) and have 2 decimal places
    	return nlapiFormatCurrency(value);
    }
   
	return this.formatter.format(value, columnMeta.type, columnMeta.format);
};

Tax.EU.Intrastat.BE.ReportFormatter.prototype.getColumnDefinition = function _getColumnDefinition(params) {
    if (!params || !params.meta || !params.meta.columns) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.meta.columns argument is required');
    }
    return params.meta.columns['FilingReportAdapter'];
};

//-------------------XML CompanyAdapter-------------------
Tax.EU.Intrastat.BE.XMLCompanyAdapter = function _XMLCompanyAdapter() {
    Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.call(this);
    this.Name = 'CompanyInfoAdapter';
    this.SEPARATOR = ', ';
};

Tax.EU.Intrastat.BE.XMLCompanyAdapter.prototype = Object.create(Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.prototype);

Tax.EU.Intrastat.BE.XMLCompanyAdapter.prototype.getTaxPeriod = function _getTaxPeriod(params) {
    try {
        var fromPeriod = new SFC.System.TaxPeriod(params.fromperiod || this.onlineDAO.fromTaxPeriod);
        var toPeriod = new SFC.System.TaxPeriod(params.toperiod || this.onlineDAO.toTaxPeriod);
        var xmlPeriod = new SFC.System.TaxPeriod(params.fromperiod || this.onlineDAO.fromTaxPeriod);
        var taxPeriod = {};

        taxPeriod.fromPeriod = fromPeriod.GetStartDate().toString('MM/dd/yyyy');
        taxPeriod.toPeriod = fromPeriod.GetStartDate() > toPeriod.GetStartDate() ? taxPeriod.fromPeriod : toPeriod.GetEndDate().toString('MM/dd/yyyy');
        taxPeriod.xmlPeriod = fromPeriod.GetStartDate().toString('MM/dd/yyyy');
        
        return taxPeriod;
    } catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.NL.ASCIICompanyAdapter.getTaxPeriod');
        throw ex;
    }
};