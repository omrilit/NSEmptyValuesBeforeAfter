/**
 * Copyright © 2016, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};
Tax.EU.Intrastat.GB = Tax.EU.Intrastat.GB || {};
Tax.EU.Intrastat.GB.Csv = Tax.EU.Intrastat.GB.Csv || {};

Tax.EU.Intrastat.GB.Csv.CompanyInfoAdapter = function _CompanyInfoAdapter() {
	Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.call(this);
    this.Name = 'CompanyInfoAdapter';
    this.daos = ['CompanyInformationDAO'];
};
Tax.EU.Intrastat.GB.Csv.CompanyInfoAdapter.prototype = Object.create(Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.prototype);

Tax.EU.Intrastat.GB.Csv.CompanyInfoAdapter.prototype.transform = function _transform(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params argument is required');
    }

    try {
        var companyInfoDAO = this.rawdata[0];
        
        this.companyInfo = companyInfoDAO.company[0];
        this.onlineDAO = Tax.Cache.MemoryCache.getInstance().load('OnlineDAO');
        this.configList = companyInfoDAO.vatConfig;

        var headerData = this.getHeaderData(params);

        var result = {};
        result[this.Name] = [headerData];

        return result;
    } catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.GB.Csv.CompanyInfoAdapter.transform');
        throw ex;
    }
};

Tax.EU.Intrastat.GB.Csv.CompanyInfoAdapter.prototype.getHeaderData = function _getHeaderData(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params argument is required');
    }

    try {
        var headerData = this.getTaxPeriod(params);
        headerData.company = this.companyInfo.nameNoHierarchy;
        headerData.vatNo = this.getCompanyVrn();
        headerData.intrastatBranchId = this.getVATConfigData('IntrastatBranchNo') || '';
        headerData.timeStamp = new Date().toString('MM/dd/yyyy');
        headerData.lineIndicator = this.getLineIndicator();

        return headerData;
    } catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.GB.Csv.CompanyInfoAdapter.getHeaderData');
        throw ex;
    }
};

Tax.EU.Intrastat.GB.Csv.CompanyInfoAdapter.prototype.getLineIndicator = function _getLineIndicator() {
	try {
		var cachedResult = Tax.Cache.MemoryCache.getInstance().load('Collector');

		for (var i = 0; i < cachedResult.length; i++) {
			if (cachedResult[i]['ExportAdapter']) {
				return cachedResult[i]['ExportAdapter'].length > 0 ? 'X' : 'N';
			}
		}

		return 'N';
	} catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.GB.Csv.CompanyInfoAdapter.getLineIndicator');
        throw ex;
	}
};

//-------------------DataAdapter-------------------
Tax.EU.Intrastat.GB.IntrastatLine = function _IntrastatLine() {
    return {
        lineNumber: -1,
        commodityCode: '',
        value: 0,
        origValue: 0,
        deliveryTerm: '',
        natureOfTransaction: '',
        origNetMass: '',
        netMass: '',
        origSupplementaryUnit: '',
        supplementaryUnit: '',
        countryCode: '',
        entityName: '',
        referenceNo: ''
    };
};

Tax.EU.Intrastat.GB.DataAdapter = function _DataAdapter() {
    Tax.EU.Intrastat.IntrastatDataAdapter.call(this);
    this.Name = 'GBDataAdapter';
};

Tax.EU.Intrastat.GB.DataAdapter.prototype = Object.create(Tax.EU.Intrastat.IntrastatDataAdapter.prototype);

Tax.EU.Intrastat.GB.DataAdapter.prototype.convertToLine = function convertToLine(row) {
    if (!row) {
        throw nlapiCreateError('INVALID_PARAMETER', 'A row object is required.');
    }
    
    if (!this.taxCodeMap || !this.taxCodeMap[row.taxCode] || this.taxCodeMap[row.taxCode].isService == 'T') {
        return null;
    }
    
    try {
    	var line = new Tax.EU.Intrastat.GB.IntrastatLine();
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
        line.referenceNo = row.transactionNumber;
        line.tranType = (this.tranTypeMap[row.transactionType] && this.tranTypeMap[row.transactionType].internalId) || '';
        
        line.entityNameUrl = this.constructUrl(row.entityType, row.entityId);
        line.referenceNoUrl = this.constructUrl(line.tranType, row.transactionId);
        
        line.origValue = Math.ceil(Math.abs(row.netAmount)) || 0;
        line.origSupplementaryUnit = Math.abs(row.quantity);
        line.origNetMass = ((parseFloat(row.weightLbs || 0) / this.POUNDS_TO_KILOS_FACTOR).toFixed(5)) * line.origSupplementaryUnit;
        return line;
    } catch(e) {
        logException(e, 'Tax.EU.Intrastat.GB.DataAdapter.prototype.convertToLine');
        return null;
    }
};

//-------------------Formatters-------------------
Tax.EU.Intrastat.GB.DataFormatter = function _DataFormatter() {
    Tax.EU.Intrastat.IntrastatFormatter.call(this);
    this.Name = 'GBDataFormatter';
};

Tax.EU.Intrastat.GB.DataFormatter.prototype = Object.create(Tax.EU.Intrastat.IntrastatFormatter.prototype);

Tax.EU.Intrastat.GB.DataFormatter.prototype.format = function _format(value, columnMeta) {
    if (!columnMeta) {
        return value;
    }
   
	return this.formatter.format(value, columnMeta.type, columnMeta.format);
};


Tax.EU.Intrastat.GB.OnlineDataFormatter = function _DataFormatter() {
	Tax.EU.Intrastat.IntrastatOnlineDataFormatter.call(this);
    this.Name = 'GBOnlineDataFormatter';
};

Tax.EU.Intrastat.GB.OnlineDataFormatter.prototype = Object.create(Tax.EU.Intrastat.IntrastatOnlineDataFormatter.prototype);

Tax.EU.Intrastat.GB.OnlineDataFormatter.prototype.format = function _format(value, columnMeta) {
    if (!columnMeta) {
        return value;
    }
   
	return this.formatter.format(value, columnMeta.type, columnMeta.format);
};