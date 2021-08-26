/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.MX = TAF.MX || {};
TAF.MX.DAO = TAF.MX.DAO || {};

TAF.MX.DAO.PaymentVendor = function _PaymentVendor(id) {
    var vendor = {
        id: id,
        type: '',
        vatRegNumber: '',
        isPerson: '',
        firstName: '',
        middleName: '',
        lastName: '',
        companyName: '',
        billCountryCode: '',
        vendorId: '',
        entityId: '',
        mxRfc: '',
        subsidiary: '',
        isEmployee: ''
    };

    return vendor;
};


TAF.MX.DAO.PaymentVendorDao = function _PaymentVendorDao(params) {
    if(!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is a required parameter');
    }

    try {
        var columns = [
		    new nlobjSearchColumn('internalid', 'vendor'),
		    new nlobjSearchColumn('internalid', 'employee'),
		    new nlobjSearchColumn('internalid'),
		    new nlobjSearchColumn('type'),
		    new nlobjSearchColumn('entityid', 'vendor'),
		    new nlobjSearchColumn('billcountrycode', 'vendor'),
		    new nlobjSearchColumn('vatregnumber', 'vendor'),
		    new nlobjSearchColumn('isperson', 'vendor'),
		    new nlobjSearchColumn('firstname', 'vendor'),
		    new nlobjSearchColumn('middlename', 'vendor'),
		    new nlobjSearchColumn('lastname', 'vendor'),
		    new nlobjSearchColumn('companyname', 'vendor'),
		    new nlobjSearchColumn('entityid', 'employee'),
		    new nlobjSearchColumn('billcountrycode', 'employee')
        ];
        var filters = [
            new nlobjSearchFilter('cleared', null, 'is', 'T'),
            new nlobjSearchFilter('type', null, 'anyof', [ 'VendPymt' ])
        ];

        if (params.isOneWorld) {
            filters.push(new nlobjSearchFilter('subsidiary', null, 'is', params.subsidiary));
            columns.push(new nlobjSearchColumn('subsidiary', 'vendor'));
            columns.push(new nlobjSearchColumn('subsidiary', 'employee'));
        }

        if (params.startDate) {
            filters.push(new nlobjSearchFilter('trandate', null, 'onorafter', params.startDate));
        }

        if (params.endDate != null) {
            filters.push(new nlobjSearchFilter('trandate', null, 'onorbefore', params.endDate));
        }
        
        if (params.hasMXCompliance) {
            columns.push(new nlobjSearchColumn('custentity_mx_rfc', 'vendor'));
            columns.push(new nlobjSearchColumn('custentity_mx_rfc', 'employee'));
        }

        columns[0].setSort(); // Sort by vendor id
        columns[1].setSort(); //Then sort by employee id
        columns[2].setSort();  //Then sort by transaction id

        this.resultSet = nlapiCreateSearch('transaction', filters, columns).runSearch();
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.MX.DAO.PaymentVendor', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'TAF.MX.DAO.PaymentVendor');
    }
};

TAF.MX.DAO.PaymentVendorDao.prototype.getList = function _getList(startIndex, endIndex) {
    var paymentVendors = [];

    try {
        var sr = this.resultSet.getResults(startIndex, endIndex);

        for (var i = 0; sr && i < sr.length; i++) {
            var paymentVendor = this.convertToObject(sr[i]);
            paymentVendors.push(paymentVendor);
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.MX.DAO.PaymentVendorDao.getList', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'TAF.MX.DAO.PaymentVendorDao.getList');
    }
    
    return paymentVendors;
};

TAF.MX.DAO.PaymentVendorDao.prototype.convertToObject = function _convertToObject(row) {
    var paymentVendor = new TAF.MX.DAO.PaymentVendor();
    
    try {
    	var vendorId = row.getValue('internalid', 'vendor');
    	var isEmployee = vendorId == null || vendorId == '';
    	paymentVendor.id = row.getValue('internalid');
    	paymentVendor.type = row.getValue('type');
    	paymentVendor.vatRegNumber = row.getValue('vatregnumber', 'vendor');
    	paymentVendor.isPerson = row.getValue('isperson', 'vendor');
    	paymentVendor.firstName = row.getValue('firstname', 'vendor');
    	paymentVendor.middleName = row.getValue('middlename', 'vendor');
    	paymentVendor.lastName = row.getValue('lastname', 'vendor');
    	paymentVendor.companyName = row.getValue('companyname', 'vendor');
    	paymentVendor.isEmployee = isEmployee;

    	paymentVendor.billCountryCode = isEmployee ? row.getValue('billcountrycode', 'employee') : row.getValue('billcountrycode', 'vendor');
    	paymentVendor.vendorId = isEmployee ? row.getValue('internalid', 'employee') : row.getValue('internalid', 'vendor');
    	paymentVendor.entityId = isEmployee ? row.getValue('entityid', 'employee') : row.getValue('entityid', 'vendor');
    	paymentVendor.mxRfc = isEmployee ? '' : row.getValue('custentity_mx_rfc', 'vendor');
    	paymentVendor.subsidiary = isEmployee ? row.getValue('subsidiary', 'employee') : row.getValue('subsidiary', 'vendor');
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.MX.DAO.PaymentVendorDao.convertToObject', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'TAF.MX.DAO.PaymentVendorDao.convertToObject');
    }
    
    return paymentVendor;
};
