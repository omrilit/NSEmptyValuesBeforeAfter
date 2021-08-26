/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.MY = TAF.MY || {};
TAF.MY.DAO = TAF.MY.DAO || {};

TAF.MY.DAO.SupplyLine = function _SupplyLine(id) {
    return {
        id: id,
        lineNo : '',
        lineSequenceNo : '',
        isJournal : '',
        internalRecordType: '',
        customerIsPerson: '',
        customerFirstName: '',
        customerMiddleName: '',
        customerLastName: '',
        customerCompanyName: '',
        customerBrn: '',
        tranDate: '',
        tranId: '',
        transactionNumber: '',
        description: '',
        memo: '',
        item: '',
        account: '',
        signedAmount: 0,
        netAmount: 0,
        taxAmount: 0,
        taxCode: '',
        shippingCountry: '',
        billingCountry: '',
        shippingCountry_text: '',
        billingCountry_text: '',
        currency: '',
        exchangeRate: 1,
        bookExchangeRate: 1
    };
};


TAF.MY.DAO.SupplyLinesDao = function _SupplyLinesDao() {
    TAF.DAO.SearchDAO.call(this);

    var hasProjects = this.context.getFeature('JOBS');
    this.customerJoinColumn = hasProjects ? 'customermain' : 'customer';
    this.savedSearchId = 'customsearch_taf_my_gaf_supply_lines';
    this.recordType = 'transaction';
};
TAF.MY.DAO.SupplyLinesDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.MY.DAO.SupplyLinesDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'params is required');
    } else {
        if (!params.periodIds || params.periodIds.length == 0) {
            throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'params.periodIds is required');
        } else if (this.isOneWorld && (!params.subIds || params.subIds.length == 0)) {
            throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'params.subIds is required');
        }
    }

    this.filters = [new nlobjSearchFilter('internalid', 'accountingperiod', 'anyof', params.periodIds)];

    if (this.isOneWorld) {
        this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subIds));
    }
    
    if (this.isMultiBook && params.bookId) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
};

TAF.MY.DAO.SupplyLinesDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'params is required');
    }

    if (this.multicurrency) {
        this.columns.push(new nlobjSearchColumn('currency'));
        this.columns.push(new nlobjSearchColumn('fxamount'));
        this.columns.push(new nlobjSearchColumn('exchangerate'));
        
        if (this.isMultiBook && params.bookId) {
            this.columns.push(new nlobjSearchColumn('exchangerate', this.multiBookJoinColumn));
        }
    }

    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('netamount', this.multiBookJoinColumn));

    this.columns.push(new nlobjSearchColumn('isperson', this.customerJoinColumn));
    this.columns.push(new nlobjSearchColumn('firstname', this.customerJoinColumn));
    this.columns.push(new nlobjSearchColumn('middlename', this.customerJoinColumn));
    this.columns.push(new nlobjSearchColumn('lastname', this.customerJoinColumn));
    this.columns.push(new nlobjSearchColumn('companyname', this.customerJoinColumn));
    this.columns.push(new nlobjSearchColumn('custentity_my_brn', this.customerJoinColumn));
};

TAF.MY.DAO.SupplyLinesDao.prototype.rowToObject = function _rowToObject(row) {
    if (!row) {
        return new TAF.MY.DAO.SupplyLine();
    }
    
    var line = new TAF.MY.DAO.SupplyLine(row.getId());
    line.lineNo = row.getValue('line');
    line.lineSequenceNo = row.getValue('linesequencenumber');
    line.isJournal = row.getValue('type') === 'Journal';
    line.internalRecordType = row.getValue('recordtype');
    line.tranDate = row.getValue('trandate');
    line.tranId = row.getValue('tranid');
    line.transactionNumber = row.getValue('transactionnumber');
    line.description = row.getValue('description', 'item');
    line.memo = row.getValue('memo');
    line.item = row.getText('item');
    line.account = row.getText('account', this.multiBookJoinColumn);
    line.signedAmount = row.getValue('signedamount');
    line.netAmount = row.getValue('netamount', this.multiBookJoinColumn);
    line.taxAmount = row.getValue('taxamount');
    line.taxCode = row.getText('taxcode');
    line.shippingCountry = row.getValue('shipcountry');
    line.billingCountry = row.getValue('billcountry');
    line.shippingCountry_text = row.getText('shipcountry');
    line.billingCountry_text = row.getText('billcountry');
    
    if (this.multicurrency) {
        line.currency = row.getValue('currency');
        line.fxAmount = row.getValue('fxamount');
        line.exchangeRate = row.getValue('exchangerate');

        if (this.multiBookJoinColumn) {
            line.bookExchangeRate = row.getValue('exchangerate', this.multiBookJoinColumn);
        }
    }

    line.customerIsPerson    = (row.getValue('isperson', this.customerJoinColumn) === 'T');
    line.customerFirstName   = row.getValue('firstname', this.customerJoinColumn);
    line.customerMiddleName  = row.getValue('middlename', this.customerJoinColumn);
    line.customerLastName    = row.getValue('lastname', this.customerJoinColumn);
    line.customerCompanyName = row.getValue('companyname', this.customerJoinColumn);
    line.customerBrn         = row.getValue('custentity_my_brn', this.customerJoinColumn);
    
    return line;
};
