/**
 * Copyright © 2016, 2018, Oracle and/or its affiliates. All rights reserved.
 */
var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};
Tax.EU.Intrastat.DE = Tax.EU.Intrastat.DE || {};

//-------------------ReportDAO-------------------
Tax.EU.Intrastat.DE.ReportDAO = function IntrastatDEReportDAO() {
    Tax.DAO.ReportDAO.call(this);
    this.Name = 'DEReportDAO';
    this.reportName = '';
};

Tax.EU.Intrastat.DE.ReportDAO.prototype = Object.create(Tax.DAO.ReportDAO.prototype);

Tax.EU.Intrastat.DE.ReportDAO.prototype.ListObject = function ListObject() {
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
        itemType: ''
    };
};

Tax.EU.Intrastat.DE.ReportDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
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
        return line;
    } catch (ex) {
        logException(ex, 'IntrastatDEReportDAO.getColumnMetadata');
        throw ex;
    }
};

//-------------------DAO-------------------

Tax.EU.Intrastat.DE.SalesReportDAO = function IntrastatDESalesReportDAO() {
    Tax.EU.Intrastat.DE.ReportDAO.call(this);
    this.Name = 'DESalesReportDAO';
    this.reportName = 'Intrastat DE Sales Report[4873]';
};

Tax.EU.Intrastat.DE.SalesReportDAO.prototype = Object.create(Tax.EU.Intrastat.DE.ReportDAO.prototype);


Tax.EU.Intrastat.DE.PurchaseReportDAO = function IntrastatDEPurchaseReportDAO() {
    Tax.EU.Intrastat.DE.ReportDAO.call(this);
    this.Name = 'DEPurchaseReportDAO';
    this.reportName = 'Intrastat DE Purchase Report[4873]';
};

Tax.EU.Intrastat.DE.PurchaseReportDAO.prototype = Object.create(Tax.EU.Intrastat.DE.ReportDAO.prototype);


Tax.EU.Intrastat.DE.SalesRefundsReportDAO = function IntrastatDESalesRefundsReportDAO() {
    Tax.EU.Intrastat.DE.ReportDAO.call(this);
    this.Name = 'DESalesRefundsReportDAO';
    this.reportName = 'Intrastat DE Sales Refunds Report[4873]';
};

Tax.EU.Intrastat.DE.SalesRefundsReportDAO.prototype = Object.create(Tax.EU.Intrastat.DE.ReportDAO.prototype);

Tax.EU.Intrastat.DE.PurchasesRefundsReportDAO = function IntrastatDEPurchasesRefundsReportDAO() {
    Tax.EU.Intrastat.DE.ReportDAO.call(this);
    this.Name = 'DEPurchasesRefundsReportDAO';
    this.reportName = 'Intrastat DE Purchase Refunds Report[4873]';
};

Tax.EU.Intrastat.DE.PurchasesRefundsReportDAO.prototype = Object.create(Tax.EU.Intrastat.DE.ReportDAO.prototype);

Tax.EU.Intrastat.DE.RefundsReportDAOProcess = function process(result, params) {
	var cache = this.getCache(this.Name);
	
	if (cache) {
		return {dao: cache};
	}

	var list = [];
	if(params.taxperiodlist){
		var periodList = (params.taxperiodlist).split(',');
		for(var i=0; i < periodList.length; i++){
			var temp = Object.create(params);
			temp.periodfrom = periodList[i];
			temp.periodto = periodList[i];
			list = this.getList(temp);
		}
	}
	else
	{
		list = this.getList(params);
	}

	this.cache(this.Name, list);

	return {dao: result.dao.concat(list)};
};

Tax.EU.Intrastat.DE.SalesRefundsReportDAO.prototype.process = Tax.EU.Intrastat.DE.RefundsReportDAOProcess;
Tax.EU.Intrastat.DE.PurchasesRefundsReportDAO.prototype.process = Tax.EU.Intrastat.DE.RefundsReportDAOProcess;


Tax.EU.Intrastat.DE.RefundsReportDAOExtractRows = function extractRows(node, columns) {
    var rowObject = new this.ListObject();

    for (col in columns) {
	//blank Value field for refund transactions
    	rowObject[col] = (col!="netAmount")?this.getValue(node.getValue(columns[col])).toString():"0";
    }

    this.list.push(rowObject);

};

Tax.EU.Intrastat.DE.SalesRefundsReportDAO.prototype.extractRows = Tax.EU.Intrastat.DE.RefundsReportDAOExtractRows;
Tax.EU.Intrastat.DE.PurchasesRefundsReportDAO.prototype.extractRows = Tax.EU.Intrastat.DE.RefundsReportDAOExtractRows;


//-------------------DataAdapter-------------------
Tax.EU.Intrastat.DE.IntrastatLine = function _IntrastatLine() {
    return {
        lineNumber: -1,
        exclude: false,
        descriptionOfGoods: '',
        item: '',
        itemUrl: '',
        destinationCountry: '',
        regionOfOrigin: '',
        natureOfTransaction: '',
        commodityCode: '',
        quantity: '',
        netAmount: '',
        deliveryTerms: '',
        transactionType: '',
        taxCode: '',
        weightLbs: '',
        grossWeight: '',
        modeOfTransport: ''
    };
};

Tax.EU.Intrastat.DE.DataAdapter = function _DataAdapter() {
    Tax.EU.Intrastat.IntrastatDataAdapter.call(this);
    this.Name = 'DEDataAdapter';
};

Tax.EU.Intrastat.DE.DataAdapter.prototype = Object.create(Tax.EU.Intrastat.IntrastatDataAdapter.prototype);

Tax.EU.Intrastat.DE.DataAdapter.prototype.process = function process(result, params) {
    if (!result) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'A result object is required.');
    }
    
    try {
        var data = {adapter: []};
        this.loadMaps();
        var raw = result.dao;
        var lineNumber = 1;

        for (var i = 0; i < raw.length; i++) {
            var line = this.convertToLine(raw[i]);
            if (!line) {
                continue;
            }

            line.lineNumber = lineNumber++;
            data.adapter.push(line);
        }

        return data;
    } catch(ex) {
        logException(ex, 'Tax.EU.Intrastat.DE.DataAdapter.process');
        throw ex;
    }
};

Tax.EU.Intrastat.DE.DataAdapter.prototype.convertToLine = function convertToLine(row) {
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
        var line = new Tax.EU.Intrastat.DE.IntrastatLine();
        
        line.descriptionOfGoods = row.itemDescription || '';
        line.item = row.itemText || '';
        
        line.itemUrl = this.constructUrl('inventoryitem', row.itemId);
        
        line.destinationCountry = row.shipCountry || '';
        line.regionOfOrigin = row.region || '';
        line.natureOfTransaction = row.notcCode || row.notc || this.notcMap[row.transactionType] || '';
        line.commodityCode = row.commodityCode || '';
        
        line.statisticalValue = parseInt(row.statisticalValue) || '';
        line.deliveryTerm = row.deliveryTerms || '';
        line.modeOfTransport = row.modeOfTransport || '';

        line.value = parseInt(Math.abs(row.netAmount));
        line.supplementaryUnit = Math.ceil(Math.abs(row.quantity));
        line.netMass = (parseFloat(row.weightLbs || 0).toFixed(4) / this.POUNDS_TO_KILOS_FACTOR) * line.supplementaryUnit;
        line.netMass = Math.max(Math.ceil(line.netMass), 1);

        return line;
    } catch(ex) {
        logException(ex, 'Tax.EU.Intrastat.DE.DataAdapter.convertToLine');
        return null;
    }
};

//-------------------AsciiCompanyAdapter-------------------
Tax.EU.Intrastat.DE.AsciiCompanyAdapter = function _AsciiCompanyAdapter() {
    Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.call(this);
    this.Name = 'CompanyInfoAdapter';
};

Tax.EU.Intrastat.DE.AsciiCompanyAdapter.prototype = Object.create(Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.prototype);

Tax.EU.Intrastat.DE.AsciiCompanyAdapter.prototype.getHeaderData = function _getHeaderData(params) {
    if (!params || !params.meta || !params.meta.headerData) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.meta.headerData argument is required');
    }

    try {
        var headerData = this.getTaxPeriod(params);
        headerData.vatNo = this.getCompanyVrn();
        headerData.region = this.getVATConfigData('Region') || '';
        headerData.participantNo = this.getVATConfigData('ParticipantNo') || '000';
        headerData.participantNo = headerData.participantNo.slice(-3);
       
        return headerData;
    } catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.getHeaderData');
        throw ex;
    }
};

Tax.EU.Intrastat.DE.AsciiCompanyAdapter.prototype.getCompanyVrn = function _getCompanyVrn() {
    var vrn = this.getVATConfigData('VATRegistration') || this.companyInfo.vrn || '';
    return vrn.replace(/[^A-Za-z0-9]/g, '');
};

Tax.EU.Intrastat.DE.AsciiCompanyAdapter.prototype.getTaxPeriod = function _getTaxPeriod(params) {
    try {
        var toPeriod = new SFC.System.TaxPeriod(params.toperiod || this.onlineDAO.toTaxPeriod);
        var endPeriod = toPeriod.GetEndDate();
        
        var taxPeriod = {};
        taxPeriod.endYear = endPeriod.getFullYear();
        taxPeriod.endMonth = endPeriod.getMonth() + 1;
        
        return taxPeriod;
    } catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.DE.AsciiCompanyAdapter.getTaxPeriod');
        throw ex;
    }
};

//-------------------AsciiAdapter-------------------

Tax.EU.Intrastat.DE.AsciiAdapter = function _AsciiAdapter() {
    Tax.EU.Intrastat.ExportAdapter.call(this);
    this.Name = 'ExportAdapter';
    // TODO: Check why only ExportAdapter is expected when printing
    this.TRANSACTION_REGION_MAP = {
        1:  {name: 'Baden-Württemberg', regionCode: 8},
        2:  {name: 'Bavaria', regionCode: 9},
        3:  {name: 'Berlin', regionCode: 11},
        4:  {name: 'Brandenburg', regionCode: 12},
        5:  {name: 'Bremen', regionCode: 4},
        6:  {name: 'Hamburg', regionCode: 2},
        7:  {name: 'Hesse', regionCode: 6},
        8:  {name: 'Lower Saxony', regionCode: 3},
        9:  {name: 'Rhineland-Palatinate', regionCode: 7},
        10: {name: 'Mecklenburg-Western Pomerania', regionCode: 13},
        11: {name: 'North Rhine-Westphalia', regionCode: 5},
        12: {name: 'Saarland', regionCode: 10},
        13: {name: 'Saxony', regionCode: 14},
        14: {name: 'Saxony-Anhalt', regionCode: 15},
        15: {name: 'Schleswig-Holstein', regionCode: 1},
        16: {name: 'Thuringia', regionCode: 16}
    };
    
};

Tax.EU.Intrastat.DE.AsciiAdapter.prototype = Object.create(Tax.EU.Intrastat.ExportAdapter.prototype);

Tax.EU.Intrastat.DE.AsciiAdapter.prototype.process = function _process(result, params) {
    try {
        var collectorData = Tax.Cache.MemoryCache.getInstance().load('Collector');
        // TODO: Fix data
        this.companyInfo = (collectorData && collectorData[0] && collectorData[0]['CompanyInfoAdapter']) ? 
            collectorData[0]['CompanyInfoAdapter'][0] : {};
            
        var participantNoStr = this.companyInfo.participantNo ?  this.companyInfo.participantNo.slice(-3) : '000';
        
        this.lineState = {
            region : this.getTransactionRegion(this.companyInfo.region),
            endMonth : this.companyInfo.endMonth,
            endYear : this.companyInfo.endYear.toString().slice(-2),
            vatNo : this.companyInfo.vatNo,
            participantNo : participantNoStr
        };
        this.data = result.adapter;
        return {adapter: this.transform(params)};
    } catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.DE.AsciiAdapter.process');
        throw ex;
    }    
};

Tax.EU.Intrastat.DE.AsciiAdapter.prototype.getTransactionRegion = function getTransactionRegion(regionIndex) {
    return regionIndex && this.TRANSACTION_REGION_MAP[regionIndex] ? this.TRANSACTION_REGION_MAP[regionIndex].regionCode : '';
};

Tax.EU.Intrastat.DE.AsciiAdapter.prototype.getLineData = function _getLineData(line) {
    line.region = this.lineState.region;
    line.endMonth = this.lineState.endMonth;
    line.endYear = this.lineState.endYear;
    line.vatNo = this.lineState.vatNo;
    line.participantNo = this.lineState.participantNo;
    return line;
};

//-------------------AsciiFormatter-------------------

Tax.EU.Intrastat.DE.AsciiFormatter = function _AsciiFormatter() {
    Tax.EU.Intrastat.IntrastatFormatter.call(this);
    this.Name = 'DEAsciiFormatter';
    this.PAD_VALUE = {
        ZERO:  '00000000000000000000000000000',
        SPACE: '                             '
    };
};

Tax.EU.Intrastat.DE.AsciiFormatter.prototype = Object.create(Tax.EU.Intrastat.IntrastatFormatter.prototype);

Tax.EU.Intrastat.DE.AsciiFormatter.prototype.getColumnDefinition = function _getColumnDefinition(params) {
    if (!params || !params.meta || !params.meta.columns) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.meta.columns argument is required');
    }
    return params.meta.columns['AsciiAdapter'];
};

Tax.EU.Intrastat.DE.AsciiFormatter.prototype.format = function _format(value, columnMeta) {
    if (!columnMeta) {
        return value;
    }
    var padValue = this.PAD_VALUE[columnMeta.padValue] || this.PAD_VALUE.SPACE;
    var formatted = (value || '').toString();
    formatted = padValue + formatted.slice(0, columnMeta.padWidth);
    formatted = formatted.slice(-columnMeta.padWidth);
    return formatted;
};
