/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 */
var Tax = Tax || {};
Tax.DAO = Tax.DAO || {};

Tax.DAO.OnlineFilingDAO =  function OnlineFilingDAO() {
	Tax.DAO.RecordDAO.call(this);
	var context = nlapiGetContext();
    this.isOneWorld = context.getFeature('SUBSIDIARIES');
    this.isMultiBook = context.getFeature('MULTIBOOK');
	this.Name = 'OnlineFilingDAO';
	this.recordType = 'customrecord_online_filing';
	this.columns = [];
	this.filters = [];
	this.fields = {
		id: 'internalid',
		dateCreated: 'created',
		user: 'custrecord_online_filing_user',
		nexus: 'custrecord_online_filing_nexus',
		vrn: 'custrecord_online_filing_vrn',
        coveredPeriods: 'custrecord_online_filing_covered_periods',
		status: 'custrecord_online_filing_status',
		action: 'custrecord_online_filing_action',
		data: 'custrecord_online_filing_data',
		result: 'custrecord_online_filing_result'
	};
    if (this.isOneWorld) {
        this.fields['subsidiary'] = 'custrecord_online_filing_subsidiary';
    }
    if (this.isMultiBook) {
        this.fields['accountingBook'] = 'custrecord_online_filing_acct_book';
    }
};
Tax.DAO.OnlineFilingDAO.prototype = Object.create(Tax.DAO.RecordDAO.prototype);

Tax.DAO.OnlineFilingDAO.prototype.prepareSearch = function prepareSearch(params) {
	for (var field in this.fields) {
		this.columns.push(new nlobjSearchColumn(this.fields[field]));
	}

	if (params.id) {
		this.filters.push(new nlobjSearchFilter(this.fields.id, null, 'is', params.id));
	}

    if (params.nexus) {
        this.filters.push(new nlobjSearchFilter(this.fields.nexus, null, 'is', params.nexus));
    }

    if (params.subsidiary) {
        this.filters.push(new nlobjSearchFilter(this.fields.subsidiary, null, 'is', params.subsidiary));
    }

    if (params.status) {
        this.filters.push(new nlobjSearchFilter(this.fields.status, null, 'is', params.status));
    }

    if (params.periods) {
        this.filters.push(new nlobjSearchFilter(this.fields.coveredPeriods, null, 'anyof', params.periods));
    }

    if (params.action) {
        this.filters.push(new nlobjSearchFilter(this.fields.action, null, 'is', params.action));
    }

    if (params.vrn) {
        this.filters.push(new nlobjSearchFilter(this.fields.vrn, null, 'is', params.vrn));
    }
	
	this.filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
};

Tax.DAO.OnlineFilingDAO.prototype.ListObject = function listObject(row) {
    var obj = {
        id: row.getValue('internalId'),
        dateCreated: row.getValue('created'),
        user: row.getValue('custrecord_online_filing_user'),
        nexus: row.getValue('custrecord_online_filing_nexus'),
        vrn: row.getValue('custrecord_online_filing_vrn'),
        coveredPeriods: row.getValue('custrecord_online_filing_covered_periods'),
        status: row.getValue('custrecord_online_filing_status'),
        action: row.getValue('custrecord_online_filing_action'),
        data: row.getValue('custrecord_online_filing_data'),
        result: row.getValue('custrecord_online_filing_result'),
    };

    if (this.isOneWorld) {
        obj.subsidiary = row.getValue('custrecord_online_filing_subsidiary');
    }
    if (this.isMultiBook) {
        obj.accountingBook = row.getValue('custrecord_online_filing_acct_book');
    }

    return obj;
};
