/**
 * Copyright © 2015, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.FR = TAF.FR || {};
TAF.FR.DAO = TAF.FR.DAO || {};

TAF.FR.DAO.CompanyInfoDao = function _CompanyInfoDao(subsidiaryId) {
	this.isOneWorld = nlapiGetContext().getFeature('SUBSIDIARIES');
	if (this.isOneWorld) {
		this.subsidiary = nlapiLoadRecord('subsidiary', subsidiaryId);
	} else {
		this.companyInfo = new TAF.DAO.CompanyDao().getInfo();
	}
};

TAF.FR.DAO.CompanyInfoDao.prototype.getTaxNumber = function _getTaxNumber() {
    var taxNumber = '';
    
    if (this.isOneWorld) {
        taxNumber = this.subsidiary.getFieldValue('federalidnumber') || this.subsidiary.getFieldValue('state1taxnumber')  || this.subsidiary.getFieldValue('ssnortin');
    } else {
        taxNumber = this.companyInfo.taxNumber || this.companyInfo.taxId || this.companyInfo.employerId;
    }

    return taxNumber;
};

TAF.FR.DAO.CompanyInfoDao.prototype.getName = function _getName() {
	var subName = '';
	if (this.isOneWorld) {
		subName = this.subsidiary.getFieldValue('name');
	} else {
		subName = this.companyInfo.legalName;
	}

	return subName;
};

TAF.FR.DAO.GLNumberingDao = function _GLNumberingDao(params) {
	var GL_REQUIRED_YEAR = 2014;
	
	this.params = params;
	this.isGLSupportedInPeriod = (params.startDate.getFullYear() >= GL_REQUIRED_YEAR);
	var context = nlapiGetContext();
	this.isGLEnabled = context.getFeature('GLAUDITNUMBERING');
	this.isMultiBook = context.getFeature('MULTIBOOK');
};

TAF.FR.DAO.GLNumberingDao.prototype.validateGlNumberingFeature = function _ValidateGlNumberingFeature() {
	if (!this.isGLSupportedInPeriod) {
		return true;
	} 
	return this.isGLEnabled;
};

TAF.FR.DAO.GLNumberingDao.prototype.validateGlNumbers = function _ValidateGlNumbers(periodId) {
	if (!this.isGLSupportedInPeriod) {
		return true;
	}
	if (!this.isGLEnabled) {
		return false;
	}
	
	var multiBookJoinColumn = null;
	var isValid = true;
	var columns = [];
	var filters = [new nlobjSearchFilter('postingperiod', null, 'is', periodId)];
	if (this.params.subsidiaryIdList) {
		filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', this.params.subsidiaryIdList));
	}
    if (this.isMultiBook && this.params.bookId) {
        multiBookJoinColumn = 'accountingtransaction';
        filters.push(new nlobjSearchFilter('accountingbook', multiBookJoinColumn, 'is', this.params.bookId));
    }
    columns.push(new nlobjSearchColumn('glsequenceid', multiBookJoinColumn, 'GROUP'));
    var sr = nlapiSearchRecord('transaction', 'customsearch_taf_glaudit_numbering', filters, columns);
	for (var isr = 0; sr && isr < sr.length; isr++) {
		var result = sr[isr];
		if (!result.getValue('glsequenceid', multiBookJoinColumn, 'GROUP') && result.getValue('posting', null, 'GROUP') == 'T') {
			isValid = false;
			break;
		}
	}
	return isValid;
};

TAF.FR.DAO.SAFTLine = function _SAFTLine(id) {
	return {
		id: id,
		internalId: '',
		type: '',
		typeCode: '',
		date: '',
		account: '',
		tranId: '',
		memo: '',
		memoMain: '',
		debit: '',
		credit: '',
		amount: '',
		entityName: '',
		entityId: '',
		vendorName: '',
		vendorId: '',
		fxAmount: '',
		currency: '',
		glNumber: '',
		transactionNumber: '',
		customerName: '',
		customerId: '',
		posting: '',
		accountName: '',
        documentDate: '',
        subsidiaryLegalName: '',
        glNumDate: '',
        vendorCompanyName: '',
        vendorFirstName: '',
        vendorLastName: '',
        vendorLineCompanyName: '',
        vendorLineFirstName: '',
        vendorLineLastName: '',
        customerCompanyName: '',
        customerFirstName: '',
        customerLastName: '',
        employeeFirstName: '',
        employeeLastName: '',
        establishmentCode: ''
	};
};

TAF.FR.DAO.SAFTDao = function _SAFTDao() {
    TAF.DAO.SearchDAO.call(this);
	
	this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_taf_fr_saft_transaction';

    this.isMulticurrencyEnabled = this.context.getFeature('MULTICURRENCY');
    this.isGLNumberingEnabled = this.context.getFeature('GLAUDITNUMBERING');
    this.isProjectsEnabled = this.context.getFeature('JOBS');
    this.isTranNumberAvailable = (this.context.getVersion() >= 2014.1);
    
    if (!this.isOneWorld) {
    	this.companyInfo = new TAF.DAO.CompanyDao().getInfo();
    }
};

TAF.FR.DAO.SAFTDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.FR.DAO.SAFTDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    if (this.isMulticurrencyEnabled) {
        this.columns.push(new nlobjSearchColumn('currency'));
        this.columns.push(new nlobjSearchColumn('fxamount'));
    }
    if (this.isGLNumberingEnabled) {
        this.columns.push(new nlobjSearchColumn('glnumber', this.multiBookJoinColumn));
        this.columns.push(new nlobjSearchColumn('glnumberdate', this.multiBookJoinColumn));
    }
    if (this.isTranNumberAvailable) {
        this.columns.push(new nlobjSearchColumn('transactionnumber'));
    }
    if (this.isProjectsEnabled) {
        this.columns.push(new nlobjSearchColumn('entityid', 'customermain'));
        this.columns.push(new nlobjSearchColumn('internalid', 'customermain'));
    } else {
        this.columns.push(new nlobjSearchColumn('entityid', 'customer'));
        this.columns.push(new nlobjSearchColumn('internalid', 'customer'));
    }
    if (this.isOneWorld) {
    	this.columns.push(new nlobjSearchColumn('legalname', 'subsidiary'));
    }
	
    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('amount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('posting', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('custcol_establishment_code', null));
    this.columns.push(new nlobjSearchColumn('custbody_establishment_code', null));
};

TAF.FR.DAO.SAFTDao.prototype.createSearchFilters = function _createSearchFilters(params) {
	if(!params) {
		throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
	}
	
	if(!params.periodId) {
		throw nlapiCreateError('MISSING_PARAMETER', 'params.periodIds is required');
	}

	this.filters.push(new nlobjSearchFilter('postingperiod', null, 'is', params.periodId));
	this.filters.push(new nlobjSearchFilter('accounttype', this.multiBookJoinColumn, 'noneof', '@NONE@'));
	this.filters.push(new nlobjSearchFilter('voided', null, 'is', 'F', null, 1, 0, false, true));
	this.filters.push(new nlobjSearchFilter('debitamount', this.multiBookJoinColumn, 'isempty', null, null, 0, 0, false));
	this.filters.push(new nlobjSearchFilter('creditamount', this.multiBookJoinColumn, 'isempty', null, null, 0, 1, false));

    if (this.isOneWorld) {
        this.filters.push(new nlobjSearchFilter('subsidiary', this.multiBookJoinColumn, 'anyof', params.subIds));
	}
	
    if (this.isMultiBook && params.bookId) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
	}
};

TAF.FR.DAO.SAFTDao.prototype.rowToObject = function _rowToObject(row) {
	if (!row) {
		throw nlapiCreateError('MISSING_PARAMETER', 'row is required');
	}
	
	var saftLine = new TAF.FR.DAO.SAFTLine(row.getId());
	saftLine.internalId = row.getValue('internalid');
	saftLine.date = row.getValue('trandate');
	saftLine.tranId = row.getValue('tranid');
	saftLine.memo = row.getValue('memo');
	saftLine.memoMain = row.getValue('memomain');
	saftLine.entityName = row.getText('entity');
	saftLine.entityId = row.getValue('entity');
	saftLine.vendorName = row.getValue('entityid', 'vendor');
	saftLine.vendorId = row.getValue('internalid', 'vendor');

    saftLine.vendorCompanyName = row.getValue('companyname', 'vendor');
    saftLine.vendorFirstName = row.getValue('firstname', 'vendor');
    saftLine.vendorLastName = row.getValue('lastname', 'vendor');
    saftLine.customerCompanyName = row.getValue('companyname', 'customer');
    saftLine.customerFirstName = row.getValue('firstname', 'customer');
    saftLine.customerLastName = row.getValue('lastname', 'customer');
    // employee does not work on journal transactions
    saftLine.employeeFirstName = row.getValue('firstname', 'employee');
    saftLine.employeeLastName = row.getValue('lastname', 'employee');
    // vendorLine is for journal transactions
    saftLine.vendorLineCompanyName = row.getValue('companyname', 'vendorLine');
    saftLine.vendorLineFirstName = row.getValue('firstname', 'vendorLine');
    saftLine.vendorLineLastName = row.getValue('lastname', 'vendorLine');

	saftLine.documentDate = row.getValue('custbody_document_date');
    saftLine.type = row.getText('type');
    saftLine.typeCode = row.getValue('type');
    
    saftLine.account = row.getValue('account', this.multiBookJoinColumn);
    saftLine.debit = row.getValue('debitamount', this.multiBookJoinColumn);
    saftLine.credit = row.getValue('creditamount', this.multiBookJoinColumn);
    saftLine.amount = row.getValue('amount', this.multiBookJoinColumn);
    saftLine.posting = row.getValue('posting', this.multiBookJoinColumn);
    saftLine.accountName = row.getText('account', this.multiBookJoinColumn);
    saftLine.establishmentCode = row.getValue('custcol_establishment_code') ? row.getValue('custcol_establishment_code') : row.getValue('custbody_establishment_code');

	if (this.isMulticurrencyEnabled) {
        saftLine.currency = row.getText('currency');
		saftLine.fxAmount = row.getValue('fxamount');
	}
	if (this.isGLNumberingEnabled) {
		saftLine.glNumber = row.getValue('glnumber', this.multiBookJoinColumn);
		saftLine.glNumDate = row.getValue('glnumberdate', this.multiBookJoinColumn);
	}
	if (this.isTranNumberAvailable) {
		saftLine.transactionNumber = row.getValue('transactionnumber');
	}
	if (this.isProjectsEnabled) {
		saftLine.customerName = row.getValue('entityid', 'customermain');
		saftLine.customerId = row.getValue('internalid', 'customermain');
	} else {
		saftLine.customerName = row.getValue('entityid', 'customer');
		saftLine.customerId = row.getValue('internalid', 'customer');
	}
	if (this.isOneWorld) {
		saftLine.subsidiaryLegalName = row.getValue('legalname', 'subsidiary') || '';
	} else {
		saftLine.subsidiaryLegalName = this.companyInfo.legalName || '';
	}
	
	return saftLine;
};

TAF.FR.DAO.AccountingPeriodDao = function _AccountingPeriodDao() {
    TAF.DAO.SearchDAO.call(this);
    this.name = 'FRAccountingPeriodDao';
    this.recordType = 'accountingperiod';
};
TAF.FR.DAO.AccountingPeriodDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.FR.DAO.AccountingPeriodDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('periodname'));
    this.columns.push(new nlobjSearchColumn('parent'));
    this.columns.push(new nlobjSearchColumn('startdate'));
    this.columns.push(new nlobjSearchColumn('enddate'));
};

TAF.FR.DAO.AccountingPeriodDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    if (params) {
        if (params.parent) {
            this.filters.push(new nlobjSearchFilter('parent', null, 'anyof', params.parent));
        }

        if (params.date) {
            this.filters.push(new nlobjSearchFilter('startdate', null, 'onorbefore', params.date));
            this.filters.push(new nlobjSearchFilter('enddate', null, 'onorafter', params.date));
        } else {
            if (params.startDate) {
                this.filters.push(new nlobjSearchFilter('startdate', null, 'onorbefore', params.startDate));
            }
            if (params.endDate) {
                this.filters.push(new nlobjSearchFilter('enddate', null, 'onorafter', params.endDate));
            }
        }

        if (params.fiscalCalendar) {
            this.filters.push(new nlobjSearchFilter('fiscalcalendar', null, 'is', params.fiscalCalendar));
        }
    }
};

TAF.FR.DAO.AccountingPeriodDao.prototype.rowToObject = function _rowToObject(row) {
    if (!row) {
        throw nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }

    var obj = {};

    obj.id = row.getId();
    obj.name = row.getValue('periodname');
    obj.parent = row.getValue('parent');
    obj.startDate = row.getValue('startdate');
    obj.endDate = row.getValue('enddate');

    return obj;
};
