/**
 * Copyright © 2017, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};
Tax.EU.Intrastat.NL = Tax.EU.Intrastat.NL || {};

//-------------------ReportDAO-------------------
Tax.EU.Intrastat.NL.ReportDAO = function IntrastatNLReportDAO() {
    Tax.DAO.ReportDAO.call(this);
    this.Name = 'NLReportDAO';
    this.reportName = '';
};

Tax.EU.Intrastat.NL.ReportDAO.prototype = Object.create(Tax.DAO.ReportDAO.prototype);

Tax.EU.Intrastat.NL.ReportDAO.prototype.ListObject = function ListObject() {
    return {
        taxCode: '',
        itemName : '',
        itemCommodityCode : '',
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
        transactionType : '',
        transactionId: '',
        transactionLineId: '',
        taxRegNo: '',
        transactionDate: ''
    };
};

Tax.EU.Intrastat.NL.ReportDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
    try {
        var pivotReportColumns = this.getColumns(pivotReport);
        var line = new this.ListObject();
        line.taxCode = pivotReportColumns[0];
        line.itemName = pivotReportColumns[1];
        line.itemCommodityCode = pivotReportColumns[2];
        line.itemId = pivotReportColumns[3];
        line.itemUnit = pivotReportColumns[4];
        line.shipCountry = pivotReportColumns[5];
        line.notcCode = pivotReportColumns[6];
        line.notc = pivotReportColumns[7];
        line.modeOfTransport = pivotReportColumns[8];
        line.statisticalProcedure = pivotReportColumns[9];
        line.weightLbs = pivotReportColumns[10];
        line.quantity = pivotReportColumns[11];
        line.netAmount = pivotReportColumns[12];
        line.transactionType = pivotReportColumns[13];
        line.transactionId = pivotReportColumns[14];
        line.transactionLineId = pivotReportColumns[15];
        line.vatRegNo = pivotReportColumns[16];
        line.taxRegNo = pivotReportColumns[17]; 
        line.transactionDate = pivotReportColumns[18];
        return line;
    } catch (ex) {
        logException(ex, 'IntrastatNLReportDAO.getColumnMetadata');
        throw ex;
    }
};

//-------------------DAO-------------------

Tax.EU.Intrastat.NL.SalesReportDAO = function IntrastatNLSalesReportDAO() {
    Tax.EU.Intrastat.NL.ReportDAO.call(this);
    this.Name = 'NLSalesReportDAO';
    this.reportName = 'Intrastat NL Sales Report[11209]';
};

Tax.EU.Intrastat.NL.SalesReportDAO.prototype = Object.create(Tax.EU.Intrastat.NL.ReportDAO.prototype);

Tax.EU.Intrastat.NL.PurchaseReportDAO = function IntrastatNLPurchaseReportDAO() {
    Tax.EU.Intrastat.NL.ReportDAO.call(this);
    this.Name = 'NLPurchaseReportDAO';
    this.reportName = 'Intrastat NL Purchase Report[11209]';
};

Tax.EU.Intrastat.NL.PurchaseReportDAO.prototype = Object.create(Tax.EU.Intrastat.NL.ReportDAO.prototype);

//-------------------DataAggregator----------------
Tax.EU.Intrastat.NL.IntrastatDataAggregator = function _IntrastatDataAggregator(aggregator) {
	Tax.EU.Intrastat.IntrastatDataAggregator.call(this);
	this.daoName = 'IntrastatNLDataAggregator';
	this.ConsolidationItemCode = '99500000'; //commodity code for consolidated lines
	this.ConsolidationAmount = 200;	//assumes that amounts will be in EURO
	this.NegativeTransactionTypes = ['RETURN', 'CREDMEM', 'BILLCRED'];
};
Tax.EU.Intrastat.NL.IntrastatDataAggregator.prototype = Object.create(Tax.EU.Intrastat.IntrastatDataAggregator.prototype);

Tax.EU.Intrastat.NL.IntrastatDataAggregator.prototype.getConsolidationKey = function _getConsolidationKey(obj) {
    if (!obj) {
        var error = nlapiCreateError('MISSING_PARAMETER', 'obj argument is required.');
        logException(error, 'Tax.EU.Intrastat.NL.IntrastatDataAggregator.getConsolidationKey');
        throw error;
    }
    
    var key = '';
    
    if (this.NegativeTransactionTypes.indexOf(obj.transactionType.toUpperCase()) == -1 && 
		Number(obj.value) < this.ConsolidationAmount) {
    	key = obj.destinationCountry + '-Below200';
    }
   
    return key;
};

Tax.EU.Intrastat.NL.IntrastatDataAggregator.prototype.add = function _add(obj) {
    if (!obj) {
        return;
    }
    
    try {
        var key = this.getConsolidationKey(obj);
        var listItem = this.list[this.keyToListMap[key]];
        if (key == '' || listItem == undefined) {
        	obj.lineNumber = this.list.length + 1;
            
            this.list.push(obj);
            this.keyToListMap[key] = obj.lineNumber - 1;
        } else {
        	listItem.value += obj.value;
            listItem.commodityCode = this.ConsolidationItemCode;
            listItem.taxRegNo = '';
            listItem.netMass = '';
            listItem.supplementaryUnit = '';
            listItem.quantity = '';
            listItem.natureOfTransaction = '';
            listItem.modeOfTransport = '';
			listItem.statisticalProcedure = '';
			listItem.transactionId = '';
        }
    } catch(e) {
        logException(e, 'Tax.EU.Intrastat.NL.IntrastatDataAggregator.add');
    }
};

//-------------------DataAdapter-------------------

Tax.EU.Intrastat.NL.IntrastatLine = function _IntrastatLine() {
    return {
        lineNumber: -1,
        exclude: false,
        destinationCountry: '',
        natureOfTransaction: '',
        modeOfTransport: '',
        commodityCode: '',
        statisticalProcedure: '',
        netMass: '',
        supplementaryUnit: '',
        value: '',
        taxRegNo: '',
        transactionDate: '',
        transactionType: '',
        transactionId: ''
    };
};

Tax.EU.Intrastat.NL.DataAdapter = function _DataAdapter() {
    Tax.EU.Intrastat.IntrastatDataAdapter.call(this);
    this.Name = 'NLDataAdapter';
    this.NegativeTransactionTypes = ['RETURN', 'CREDMEM', 'BILLCRED'];
};

Tax.EU.Intrastat.NL.DataAdapter.prototype = Object.create(Tax.EU.Intrastat.IntrastatDataAdapter.prototype);

Tax.EU.Intrastat.NL.DataAdapter.prototype.convertToLine = function convertToLine(row) {
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
        var line = new Tax.EU.Intrastat.NL.IntrastatLine();
        
        line.destinationCountry = row.shipCountry || '';
        line.natureOfTransaction = row.notcCode || row.notc || this.notcMap[row.transactionType] || '';
        line.natureOfTransaction = line.natureOfTransaction.substring(0, 1);
        line.modeOfTransport = row.modeOfTransport || '';
        line.commodityCode = row.itemCommodityCode || '';
        line.statisticalProcedure = row.statisticalProcedure || '';
        
        line.netMass = (parseFloat(row.weightLbs || 0).toFixed(4) / this.POUNDS_TO_KILOS_FACTOR) * Math.abs(row.quantity);
        line.netMass = this.roundToWholeNumber(Math.abs(line.netMass));
        line.value = this.roundUp(row.netAmount);
        
        line.supplementaryUnit = Math.abs(row.quantity) || '';

        line.taxRegNo = row.taxRegNo || row.vatRegNo || '';
        line.transactionDate = row.transactionDate;
        line.transactionType = row.transactionType;
        line.transactionId = row.transactionId || '';
        return line;
    } catch(ex) {
        logException(ex, 'Tax.EU.Intrastat.NL.DataAdapter.convertToLine');
        return null;
    }
};

Tax.EU.Intrastat.NL.DataAdapter.prototype.roundToWholeNumber = function roundToWholeNumber(value) {
    return Math.round(value);
};

Tax.EU.Intrastat.NL.DataAdapter.prototype.roundUp = function roundUp(value) {
    return Math.ceil(value);
};

//-------------------PDFCompanyAdapter-------------------
Tax.EU.Intrastat.NL.PDFCompanyAdapter = function _PDFCompanyAdapter() {
    Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.call(this);
    this.Name = 'CompanyInfoAdapter';
    this.SEPARATOR = ', ';
};

Tax.EU.Intrastat.NL.PDFCompanyAdapter.prototype = Object.create(Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.prototype);

Tax.EU.Intrastat.NL.PDFCompanyAdapter.prototype.getHeaderData = function _getHeaderData(params) {
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
        headerData.exportReportName = params.meta.headerData.exportReportName;
        
        return headerData;
    } catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.getHeaderData');
        throw ex;
    }
};

Tax.EU.Intrastat.NL.PDFCompanyAdapter.prototype.getDeclarantAddress = function _getDeclarantAddress() {
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

Tax.EU.Intrastat.NL.PDFCompanyAdapter.prototype.getCompanyAddress = function _getCompanyAddress(companyInfo) {
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

Tax.EU.Intrastat.NL.PDFCompanyAdapter.prototype.getCompanyVrn = function _getCompanyVrn() {
    var vrn = this.getVATConfigData('VATRegistration') || this.companyInfo.vrn || '';
    vrn = vrn ? vrn.replace(/[^A-Za-z0-9]/g, '').replace(/^[A-Za-z]{2}/, '') : '';
    
    return vrn; 
};

Tax.EU.Intrastat.NL.PDFCompanyAdapter.prototype.formatVatNo = function _formatVatNo(vatNo) {
    return vatNo ? vatNo.replace(/[^A-Za-z0-9]/g, '') : '';
};

//-------------------ASCIICompanyAdapter-------------------
Tax.EU.Intrastat.NL.ASCIICompanyAdapter = function _ASCIICompanyAdapter() {
    Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.call(this);
    this.Name = 'CompanyInfoAdapter';
    this.SoftwareRegistrationNumber = '';
    this.PAD_VALUE = {SPACE : '                                        '};
};

Tax.EU.Intrastat.NL.ASCIICompanyAdapter.prototype = Object.create(Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.prototype);

Tax.EU.Intrastat.NL.ASCIICompanyAdapter.prototype.getHeaderData = function _getHeaderData(params) {
    if (!params || !params.meta || !params.meta.headerData) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.meta.headerData argument is required');
    }

    try {
        var headerData = this.getTaxPeriod(params);
        headerData.vatNo = this.getCompanyVrn();
        Tax.Cache.MemoryCache.getInstance().save('AsciiCompanyVATNo', headerData.vatNo);
        
        headerData.createDate = new Date().toString('yyyyMMddHHmmss');
        
        headerData.companyName = this.getCompanyName();
        
        headerData.contactNumber = (this.companyInfo.telephone);
        headerData.contactNumber = headerData.contactNumber.replace(/[^A-Za-z0-9]/g, '') + this.PAD_VALUE.SPACE;
        headerData.contactNumber = headerData.contactNumber.substring(0,15);
        
        headerData.softwareRegNumber = this.SoftwareRegistrationNumber + this.PAD_VALUE.SPACE;
        headerData.softwareRegNumber = headerData.softwareRegNumber.substring(0,6);
        
        headerData.endblock = '9899                                                                                                               '; 
        return headerData;
    } catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.NL.ASCIICompanyAdapter.getHeaderData');
        throw ex;
    }
};

Tax.EU.Intrastat.NL.ASCIICompanyAdapter.prototype.getCompanyVrn = function _getCompanyVrn() {
    var vrn = this.getVATConfigData('VATRegistration') || this.companyInfo.vrn || '';
    vrn = vrn ? vrn.replace(/[^A-Za-z0-9]/g, '').replace(/^[A-Za-z]{2}/, '') : '';
    
    vrn = '000000000000' + vrn;	//pad
    vrn = vrn.slice(-12);
    
    return vrn; 
};

Tax.EU.Intrastat.NL.ASCIICompanyAdapter.prototype.getCompanyName = function _getCompanyName() {
	
	var companyName = this.companyInfo.nameNoHierarchy || '';
	companyName = companyName.replace(/&lt;/g,'');
	companyName = companyName.replace(/&gt;/g,'');
	companyName = companyName.replace(/&/g,' ');
	companyName = companyName.replace(/[^\x00-\x7F]/g, '');	//remove non-ASCII
	companyName = companyName + this.PAD_VALUE.SPACE;
	companyName = companyName.substring(0, 40);
	
	return companyName;
};

Tax.EU.Intrastat.NL.ASCIICompanyAdapter.prototype.getTaxPeriod = function _getTaxPeriod(params) {
	try {
	    var fromPeriod = new SFC.System.TaxPeriod(params.fromperiod || this.onlineDAO.fromTaxPeriod);
	    var toPeriod = new SFC.System.TaxPeriod(params.toperiod || this.onlineDAO.toTaxPeriod);
	    var taxPeriod = {};

	    taxPeriod.fromPeriod = fromPeriod.GetStartDate().toString('yyyyMM');
	    taxPeriod.toPeriod = fromPeriod.GetStartDate() > toPeriod.GetStartDate() ? taxPeriod.fromPeriod : toPeriod.GetEndDate().toString('yyyyMM');
	    return taxPeriod;
	} catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.NL.ASCIICompanyAdapter.getTaxPeriod');
        throw ex;
	}
};

//-------------------ASCIIDataAdapter-------------------
Tax.EU.Intrastat.NL.ASCIIDataAdapter = function _ASCIIDataAdapter() {
	Tax.EU.Intrastat.ExportAdapter.call(this);
    this.Name = 'ExportAdapter';
    this.LineNumber = 1;
    this.NegativeTransactionTypes = ['RETURN', 'CREDMEM', 'BILLCRED'];
    this.CompanyVATNo = '';
};

Tax.EU.Intrastat.NL.ASCIIDataAdapter.prototype = Object.create(Tax.EU.Intrastat.ExportAdapter.prototype);

Tax.EU.Intrastat.NL.ASCIIDataAdapter.prototype.transform = function _transform(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params argument is required');
    }
    
    this.CompanyVATNo = Tax.Cache.MemoryCache.getInstance().load('AsciiCompanyVATNo');
    
	var excludeCache = JSON.parse(params.excludeCache || '{}');
	var exportData = [];
	var lineNumber = -1;
	
	for (var i = 0; i < this.data.length; i++) {
		lineNumber = this.data[i].lineNumber;
		
		if ((excludeCache[lineNumber] == undefined && !this.data[i].exclude) || (excludeCache[lineNumber] != undefined && !excludeCache[lineNumber])) {
		    var line = this.getLineData(this.data[i]);
			exportData.push(line);
		}
	}
	
	var result = {};
	result[this.Name] = exportData;
	
	return result;
};

Tax.EU.Intrastat.NL.ASCIIDataAdapter.prototype.getLineData = function _getLineData(line) {
	line.lineNumber = this.LineNumber;
	this.LineNumber++;
	
	line.commodityCode = line.commodityCode.substring(0,8);
	
	line.taxRegNo = this.CompanyVATNo ? this.CompanyVATNo : '';
	
	if (line.transactionDate && line.transactionDate != null && line.transactionDate != '') {
		var dates = line.transactionDate.split('-');
		line.transactionDate = dates[0] + dates[1];
	}
	
	line.value = Math.abs(line.value);
	
	if (this.NegativeTransactionTypes.indexOf(line.transactionType) != -1) {
		line.transactionType = '-'; 
	} else {
		line.transactionType = '+'; 
	}
	
    return line;
};

//-------------------ASCIIFormatter-------------------
Tax.EU.Intrastat.NL.AsciiFormatter = function _AsciiFormatter() {
    Tax.EU.Intrastat.IntrastatFormatter.call(this);
    this.Name = 'NLAsciiFormatter';
    this.PAD_VALUE = {
        ZERO:  '00000000000000000000000000000',
        SPACE: '                             '
    };
};

Tax.EU.Intrastat.NL.AsciiFormatter.prototype = Object.create(Tax.EU.Intrastat.IntrastatFormatter.prototype);

Tax.EU.Intrastat.NL.AsciiFormatter.prototype.getColumnDefinition = function _getColumnDefinition(params) {
    if (!params || !params.meta || !params.meta.columns) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.meta.columns argument is required');
    }
    return params.meta.columns['AsciiAdapter'];
};

Tax.EU.Intrastat.NL.AsciiFormatter.prototype.format = function _format(value, columnMeta) {
    if (!columnMeta) {
        return value;
    }
    var padValue = this.PAD_VALUE[columnMeta.padValue] || this.PAD_VALUE.SPACE;
    var formatted = (value || '').toString();
    var padWidth = columnMeta.padWidth;
    
    if (columnMeta.align == 'RIGHT') {
    	formatted = padValue + formatted;
    	formatted = formatted.slice(-padWidth);
	} else {
		formatted = formatted + padValue;
		formatted = formatted.slice(0,padWidth);
	}
    
    return formatted;
};