/**
 * Copyright © 2016, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};
Tax.EU.Intrastat.AT = Tax.EU.Intrastat.AT || {};

//-------------------ReportDAO-------------------
Tax.EU.Intrastat.AT.ReportDAO = function IntrastatATReportDAO() {
    Tax.DAO.ReportDAO.call(this);
    this.Name = 'ATReportDAO';
    this.reportName = '';
};

Tax.EU.Intrastat.AT.ReportDAO.prototype = Object.create(Tax.DAO.ReportDAO.prototype);

Tax.EU.Intrastat.AT.ReportDAO.prototype.ListObject = function ListObject() {
    return {
        taxCode: '',
        itemName : '',
        itemCommodityCode : '',
        itemDescription : '',
        itemId : '',
        itemUnit : '',
        shipCountry : '',
        notcCode : '',
        notc : '',
        modeOfTransport : '',
        statisticalProcedure : '',
        weightLbs : '',
        quantity : '',
        netAmount : '',
        statisticalValue : '',
        transactionType : '',
        transactionId: '',
        transactionLineId: ''
    };
};

Tax.EU.Intrastat.AT.ReportDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
    try {
        var pivotReportColumns = this.getColumns(pivotReport);
        var line = new this.ListObject();
        line.taxCode = pivotReportColumns[0];
        line.itemName = pivotReportColumns[1];
        line.itemCommodityCode = pivotReportColumns[2];
        line.itemDescription = pivotReportColumns[3];
        line.itemId = pivotReportColumns[4];
        line.itemUnit = pivotReportColumns[5];
        line.shipCountry = pivotReportColumns[6];
        line.notcCode = pivotReportColumns[7];
        line.notc = pivotReportColumns[8];
        line.modeOfTransport = pivotReportColumns[9];
        line.statisticalProcedure = pivotReportColumns[10];
        line.weightLbs = pivotReportColumns[11];
        line.quantity = pivotReportColumns[12];
        line.netAmount = pivotReportColumns[13];
        line.statisticalValue = pivotReportColumns[14];
        line.transactionType = pivotReportColumns[15];
        line.transactionId = pivotReportColumns[16];
        line.transactionLineId = pivotReportColumns[17];
        return line;
    } catch (ex) {
        logException(ex, 'IntrastatATReportDAO.getColumnMetadata');
        throw ex;
    }
};

//-------------------DAO-------------------

Tax.EU.Intrastat.AT.SalesReportDAO = function IntrastatATSalesReportDAO() {
    Tax.EU.Intrastat.AT.ReportDAO.call(this);
    this.Name = 'ATSalesReportDAO';
    this.reportName = 'Intrastat AT Sales Report[4873]';
};

Tax.EU.Intrastat.AT.SalesReportDAO.prototype = Object.create(Tax.EU.Intrastat.AT.ReportDAO.prototype);


Tax.EU.Intrastat.AT.PurchaseReportDAO = function IntrastatATPurchaseReportDAO() {
    Tax.EU.Intrastat.AT.ReportDAO.call(this);
    this.Name = 'ATPurchaseReportDAO';
    this.reportName = 'Intrastat AT Purchase Report[4873]';
};

Tax.EU.Intrastat.AT.PurchaseReportDAO.prototype = Object.create(Tax.EU.Intrastat.AT.ReportDAO.prototype);

//-------------------DataAdapter-------------------
Tax.EU.Intrastat.AT.IntrastatLine = function _IntrastatLine() {
    return {
        lineNumber: -1,
        exclude: false,
        descriptionOfGoods: '',
        descriptionOfGoodsUrl: '',
        destinationCountry: '',
        natureOfTransaction: '',
        modeOfTransport: '',
        commodityCode: '',
        statisticalProcedure: '',
        statisticalValue: '',
        netMass: '',
        supplementaryUnit: '',
        value: ''
    };
};

Tax.EU.Intrastat.AT.DataAdapter = function _DataAdapter() {
    Tax.EU.Intrastat.IntrastatDataAdapter.call(this);
    this.Name = 'ATDataAdapter';
};

Tax.EU.Intrastat.AT.DataAdapter.prototype = Object.create(Tax.EU.Intrastat.IntrastatDataAdapter.prototype);

Tax.EU.Intrastat.AT.DataAdapter.prototype.process = function process(result, params) {
    if (!result) {
        throw nlapiCreateError('INVALID_PARAMETER', 'A result object is required.');
    }
    
    try {
        var data = {adapter: []};
        this.loadMaps();
        var raw = result.dao;
        
        for (var i = 0, lineNumber = 0; i < raw.length; i++) {
            var line = this.convertToLine(raw[i]);
            if (!line) {
                continue;
            }
            
            line.lineNumber = ++lineNumber;
            data.adapter.push(line);
        }
        
        return data;
    } catch(ex) {
        logException(ex, 'Tax.EU.Intrastat.AT.DataAdapter.process');
        throw ex;
    }
};

Tax.EU.Intrastat.AT.DataAdapter.prototype.convertToLine = function convertToLine(row) {
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
        var line = new Tax.EU.Intrastat.AT.IntrastatLine();
        
        line.descriptionOfGoods = this.getDescriptionOfGoods(row);
        line.descriptionOfGoodsUrl = this.constructUrl('inventoryitem', row.itemId);
        line.destinationCountry = row.shipCountry || '';
        line.natureOfTransaction = row.notcCode || row.notc || this.notcMap[row.transactionType] || '';
        line.modeOfTransport = row.modeOfTransport || '';
        line.commodityCode = row.itemCommodityCode || '';
        line.statisticalProcedure = row.statisticalProcedure || '';
        
        line.netMass = (parseFloat(row.weightLbs || 0).toFixed(4) / this.POUNDS_TO_KILOS_FACTOR) * Math.abs(row.quantity);
        line.netMass = this.roundToWholeNumber(Math.abs(line.netMass));
        line.statisticalValue = row.statisticalValue ? this.roundUp(row.statisticalValue) : '';
        line.value = this.roundUp(Math.abs(row.netAmount));
        
        line.supplementaryUnit = row.itemUnit || '';

        return line;
    } catch(ex) {
        logException(ex, 'Tax.EU.Intrastat.AT.DataAdapter.convertToLine');
        return null;
    }
};

Tax.EU.Intrastat.AT.DataAdapter.prototype.roundToWholeNumber = function roundToWholeNumber(value) {
    return Math.round(value);
};

Tax.EU.Intrastat.AT.DataAdapter.prototype.roundUp = function roundUp(value) {
    return Math.ceil(value);
};

Tax.EU.Intrastat.AT.DataAdapter.prototype.getDescriptionOfGoods = function convertToLine(row) {
    if (!row) {
        throw nlapiCreateError('INVALID_PARAMETER', 'A row object is required.');
    }
    
    var descriptionOfGoods = [row.itemName];
    if (row.itemCommodityCode) {
        descriptionOfGoods.push(row.itemCommodityCode);
    }
    if (row.itemDescription) {
        descriptionOfGoods.push(row.itemDescription);
    }
    return descriptionOfGoods.join(', ');
};

//-------------------PDFCompanyAdapter-------------------
Tax.EU.Intrastat.AT.PDFCompanyAdapter = function _PDFCompanyAdapter() {
    Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.call(this);
    this.Name = 'CompanyInfoAdapter';
    this.SEPARATOR = ', ';
};

Tax.EU.Intrastat.AT.PDFCompanyAdapter.prototype = Object.create(Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.prototype);

Tax.EU.Intrastat.AT.PDFCompanyAdapter.prototype.getHeaderData = function _getHeaderData(params) {
    if (!params || !params.meta || !params.meta.headerData) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.meta.headerData argument is required');
    }

    try {
        var headerData = this.getTaxPeriod(params);
        
        headerData.vatNo = this.getCompanyVrn();
        headerData.branchCode = this.getVATConfigData('IntrastatBranchNo') || '';
        headerData.company = this.getCompanyAddress(this.companyInfo);
        headerData.declarantVatNo = this.formatVatNo(this.getVATConfigData('DeclarantVATRegistration')) || '';
        headerData.declarantBranchCode = this.getVATConfigData('DeclarantBranchNo') || '';
        headerData.declarantAddress = this.getDeclarantAddress();
        
        headerData.printMessage = this.getPrintMsg(params);
        
        return headerData;
    } catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.getHeaderData');
        throw ex;
    }
};

Tax.EU.Intrastat.AT.PDFCompanyAdapter.prototype.getDeclarantAddress = function _getDeclarantAddress() {
    var declarant = [];
    var declarantName = this.getVATConfigData('DeclarantName') || '';
    if (declarantName) {
        declarant.push(declarantName);
    }
    var declarantAddress = this.getVATConfigData('DeclarantAddress') || '';
    if (declarantAddress) {
        declarant.push(declarantAddress);
    }
    return declarant.join(this.SEPARATOR);  
};

Tax.EU.Intrastat.AT.PDFCompanyAdapter.prototype.getCompanyAddress = function _getCompanyAddress(companyInfo) {
    var address = [companyInfo.nameNoHierarchy];
    if (companyInfo.address1) {
        address.push(companyInfo.address1);
    }
    if (companyInfo.address2) {
        address.push(companyInfo.address2);
    }
    if (companyInfo.city) {
        address.push(companyInfo.city);
    }
    if (companyInfo.zip) {
        address.push(companyInfo.zip);
    }
    return address.join(this.SEPARATOR);
};

Tax.EU.Intrastat.AT.PDFCompanyAdapter.prototype.getCompanyVrn = function _getCompanyVrn() {
    var vrn = this.getVATConfigData('VATRegistration') || this.companyInfo.vrn || '';
    return this.formatVatNo(vrn);
};

Tax.EU.Intrastat.AT.PDFCompanyAdapter.prototype.formatVatNo = function _formatVatNo(vatNo) {
    return vatNo ? vatNo.replace(/[^A-Za-z0-9]/g, '') : '';
};

Tax.EU.Intrastat.AT.PDFCompanyAdapter.prototype.getTaxPeriod = function _getTaxPeriod(params) {
    try {
        var fromPeriod = new SFC.System.TaxPeriod(params.fromperiod || this.onlineDAO.fromTaxPeriod);
        var startPeriod = fromPeriod.GetStartDate();
        
        var taxPeriod = {};
        taxPeriod.year = startPeriod.getFullYear().toString().slice(-2),
        taxPeriod.month = startPeriod.getMonth() + 1;
        taxPeriod.month = ('00' + taxPeriod.month).slice(-2); 
        
        return taxPeriod;
    } catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.AT.PDFCompanyAdapter.getTaxPeriod');
        throw ex;
    }
};

//-------------------PDFPageConverter-------------------
Tax.EU.Intrastat.AT.PDFPageConverter = function _PDFPageConverter() {
    Tax.Processor.call(this);
    this.Name = 'ATPDFPageConverter';
    this.PAGE_SIZE = 4;
};

Tax.EU.Intrastat.AT.PDFPageConverter.prototype = Object.create(Tax.Processor.prototype);

Tax.EU.Intrastat.AT.PDFPageConverter.prototype.process = function process(result, params) {
    if (!result || !result.formatter || !result.formatter.ExportAdapter) {
        throw nlapiCreateError('INVALID_PARAMETER', 'result.formatter.ExportAdapter argument is required');
    }
    
    try {
        var pageList = [];
        var origList = result.formatter.ExportAdapter;
        
        for (var i = 0; i < origList.length; i += this.PAGE_SIZE) {
            var page = this.createPage(origList, i);
            pageList.push(page);
        }
        
        if (pageList.length > 0) {
            pageList[pageList.length - 1].lastPageMarker = 'X';
        }
        
        if (pageList.length == 0) {
            var emptyPage = {
                item1 : {},
                item2 : {},
                item3 : {},
                item4 : {},
                lastPageMarker : 'X'
            };
            pageList.push(emptyPage);
        }
        
        result.formatter.ExportAdapter = pageList;
        result.formatter.hasPageBreak = (pageList.length > 0);
        
        return result;
    } catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.AT.PDFPageConverter.process');
        throw ex;
    }
};

Tax.EU.Intrastat.AT.PDFPageConverter.prototype.createPage = function createPage(origList, startIndex) {
    if (!origList) {
        throw nlapiCreateError('INVALID_PARAMETER', 'origList argument is required');
    }
    if (startIndex >= origList.length) {
        throw nlapiCreateError('INVALID_PARAMETER', 'origList argument is required');
    }
    
    try {
        var page = { lastPageMarker : '' };
        var origListLength = origList.length;
        
        for (var j = 0; j < this.PAGE_SIZE; j++) {
            var pageIndex = startIndex + j;
            var pageKey = 'item' + (j + 1);
            
            if (pageIndex >= origListLength) {
                page[pageKey] = {};
                continue;
            }
            
            page[pageKey] = origList[pageIndex];
        }
        
        return page;
    } catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.AT.PDFPageConverter.createPage');
        throw ex;
    }
};
