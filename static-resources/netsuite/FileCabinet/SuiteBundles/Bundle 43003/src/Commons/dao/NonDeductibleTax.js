/**
 * Copyright © 2016, 2018, 2019 Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.DAO = Tax.DAO || {};

Tax.DAO.NonDeductibleTaxDAO = function NonDeductibleTaxDAO() {
	Tax.DAO.SearchDAO.call(this);
	this.Name = 'NonDeductibleTaxDAO';
	this.searchId = 'customsearch_itr_nd_stc_summary';
	this.searchType = 'transaction';
	this.filters = [];
	this.columns = [];
	this.context = nlapiGetContext();

	this.fields = {
		transactionType: {name: 'type', summary:'GROUP'},
		memo: {name: 'memo', summary:'GROUP'},
		debitAmount: {},
		creditAmount: {},
		amount: {}
	};
};
Tax.DAO.NonDeductibleTaxDAO.prototype = Object.create(Tax.DAO.SearchDAO.prototype);

Tax.DAO.NonDeductibleTaxDAO.prototype.prepareSearch = function prepareSearch(params) {
	try {
		if (params && params.subsidiary) {
			this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subsidiary)); //consolidation is not supported
		} else if (params && params.countryCode) {
			this.filters.push(new nlobjSearchFilter('country', 'vendor', 'anyof', params.countryCode)); //single instance
		}

		var bookid = params.book || params.bookid;
		if (params && bookid) {
			this.filters.push(new nlobjSearchFilter('accountingbook', 'accountingtransaction', 'is', bookid));
		}

		if (params.multiCurrency === undefined) {
			params.multiCurrency = this.context.getFeature('MULTICURRENCY');
		}
		
		if (params && params.periodfrom && params.periodto) { //for supplementary
			params.periodFrom = params.periodfrom;
			params.periodTo = params.periodto;
		}

		if (params && params.periodFrom && params.periodTo) {
			if (params.periodFrom === params.periodTo) {
				this.filters.push(new nlobjSearchFilter('taxperiod', null, 'is', params.periodFrom));
			} else {
				for (var iperiod = params.periodFrom; iperiod <= params.periodTo; iperiod++) {
					var leftparens = (iperiod == params.periodFrom) ? 1 : 0;
					var rightparens = (iperiod == params.periodTo) ? 1 : 0;
					this.filters.push(new nlobjSearchFilter('taxperiod', null, 'is', iperiod, null, leftparens, rightparens, true));
				}
			}
		}

		this.fields.amount = {
			name: (params.multiCurrency && bookid != null && !bookid) ? 'fxamount' : 'amount',
			join: bookid ? 'accountingtransaction' : null,
			summary:'SUM'
		};
		this.columns.push(new nlobjSearchColumn(this.fields.amount.name, this.fields.amount.join, this.fields.amount.summary));

		this.fields.debitAmount = {
			name: 'debitamount',
			join: bookid ? 'accountingtransaction' : null,
			summary:'SUM'
		};
		this.columns.push(new nlobjSearchColumn(this.fields.debitAmount.name, this.fields.debitAmount.join, this.fields.debitAmount.summary));

		this.fields.creditAmount = {
			name: 'creditamount',
			join: bookid ? 'accountingtransaction' : null,
			summary:'SUM'
		};
		this.columns.push(new nlobjSearchColumn(this.fields.creditAmount.name, this.fields.creditAmount.join, this.fields.creditAmount.summary));
	} catch (ex) {
		logException(ex, 'Tax.DAO.NonDeductibleTaxDAO.prepareSearch');
	}
};

Tax.DAO.NonDeductibleTaxDAO.prototype.ListObject = function ListObject() {
	var obj = {};
	for (var f in this.fields) {
		obj[f] = '';
	}
	return obj;
};

Tax.DAO.NonDeductibleTaxDAO.prototype.rowToObject = function rowToObject(row) {
	var obj = new this.ListObject();
	for (var f in this.fields) {
		var column = this.fields[f];
		if (f === 'transactionType') {
			obj[f] = row.getText(column.name, column.join ? column.join : null, column.summary);
		} else {
			obj[f] = row.getValue(column.name, column.join ? column.join : null, column.summary);
		}
	}
	return obj;
};

Tax.DAO.NonDeductibleTaxDAO.prototype.processList = function processList(search) {
	if (!this.context.getFeature('CUSTOMGLLINES')) {
		return;
	}
	var results = null;
	var index = 0;

	do {
		results = search.getResults(index, index + this.MAX_RESULTS_PER_PAGE);

		for (var i = 0; results && i < results.length; i++) {
			this.list.push(this.rowToObject(results[i]));
		}

		index += results.length;
	} while (results.length >= this.MAX_RESULTS_PER_PAGE);
};

Tax.DAO.NonDeductibleTaxDetailDAO = function NonDeductibleTaxDetailDAO() {
	Tax.DAO.NonDeductibleTaxDAO.call(this);
	this.Name = 'NonDeductibleTaxDetailDAO';
	this.searchId = 'customsearch_itr_nd_stc_details';
	this.searchType = 'transaction';
	this.filters = [];
	this.columns = [];

	this.fields = {
		transactionType: {name: 'type', summary:'GROUP'},
		entity: {name: 'entityid', join:'vendor', summary:'GROUP'},
		memo: {name: 'memo', summary:'GROUP'},
		date: {name: 'trandate', summary:'GROUP'},
		taxPeriod: {name:'taxperiod', summary:'GROUP'},
		documentNumber: {name:'tranid', summary:'GROUP'},
		id: {name:'internalid', summary:'GROUP'},
		timestamp: {name:'custbody_report_timestamp', summary:'GROUP'},
		lastName: {name:'lastname', join:'vendor', summary:'GROUP'},
		firstName: {name:'firstname', join:'vendor', summary:'GROUP'},
		middleName: {name:'middlename', join:'vendor', summary:'GROUP'},
		companyName: {name:'companyname', join:'vendor', summary:'GROUP'},
		isIndividual: {name:'isperson', join:'vendor', summary:'GROUP'},
		vatno: {name:'vatregnumber', join:'vendor', summary:'GROUP'},
		address: {name:'address', join:'vendor', summary:'GROUP'},
		contactLast: {name:'custentity_tax_contact_last', join:'vendor', summary:'GROUP'},
		contactMiddle: {name:'custentity_tax_contact_middle', join:'vendor', summary:'GROUP'},
		contactFirst: {name:'custentity_tax_contact_first', join:'vendor', summary:'GROUP'},
		debitAmount: {},
		creditAmount: {},
		amount: {},
		transactionNumber: {name:'transactionnumber', summary:'GROUP'}
	};
};
Tax.DAO.NonDeductibleTaxDetailDAO.prototype = Object.create(Tax.DAO.NonDeductibleTaxDAO.prototype);

var Tax = Tax || {};
Tax.Adapter = Tax.Adapter || {};

Tax.Adapter.NonDeductibleTax = function NonDeductibleTax(id) {
	return {
		amount: 0,
		debitAmount: 0,
		creditAmount: 0,
		taxcodeId: '',
		transactionType: ''
	};
};

Tax.Adapter.NonDeductibleTaxAdapter = function NonDeductibleTaxAdapter() {
	Tax.Adapter.BaseAdapter.call(this);
	this.Name = 'NonDeductibleTaxAdapter';
};
Tax.Adapter.NonDeductibleTaxAdapter.prototype = Object.create(Tax.Adapter.BaseAdapter.prototype);

Tax.Adapter.NonDeductibleTaxAdapter.prototype.transform = function _transform(params) {
	if (!this.rawdata) {
		throw nlapiCreateError('MISSING_REQ_PARAM', 'rawdata is required');
	}
	try {
		var result = [];
		var data = this.rawdata;

		for (var idata = 0; data && idata < data.length; idata++) {
			var nd = new Tax.Adapter.NonDeductibleTax();
			nd.amount = data[idata].amount;			
			nd.debitAmount= data[idata].debitAmount;
			nd.creditAmount= data[idata].creditAmount;
			nd.transactionType = data[idata].transactionType;

			nd.taxcodeId = this.getTaxCodeIdFromMemo(data[idata].memo);
			if (!nd.taxcodeId) {
				continue;
			}

			result.push(nd);
		}

		return result;
	} catch (ex) {
		throw ex;
	}
};

Tax.Adapter.NonDeductibleTaxAdapter.prototype.getTaxCodeIdFromMemo = function getTaxCodeIdFromMemo(memo) {
	var strToSplit = '|Tax Code:';
	var splitStr = memo ? memo.split(strToSplit) : [];
	var taxcodeId = splitStr.length > 0 ? splitStr[1] : '';
	return taxcodeId;
};

Tax.Adapter.NonDeductibleTaxDetail = function NonDeductibleTaxDetail(id) {
	return {
		transactionType: '',
		taxcodeId: '',
		memo: '',
		date: '',
		taxPeriod: '',
		documentNumber: '',
		id: '',
		entity: '',
		timestamp: '',
		lastName: '',
		firstName: '',
		middleName: '',
		companyName: '',
		isIndividual: '',
		vatno: '',
		address: '',
		taxContactLast: '',
		taxContactMiddle: '',
		taxContactFirst: '',
		debitAmount: 0,
		creditAmount: 0,
		amount: 0,
		transactionNumber: ''
	};
};

Tax.Adapter.NonDeductibleTaxDetailAdapter = function NonDeductibleTaxDetailAdapter() {
	Tax.Adapter.NonDeductibleTaxAdapter.call(this);
	this.Name = 'NonDeductibleTaxDetailAdapter';
};
Tax.Adapter.NonDeductibleTaxDetailAdapter.prototype = Object.create(Tax.Adapter.NonDeductibleTaxAdapter.prototype);

Tax.Adapter.NonDeductibleTaxDetailAdapter.prototype.transform = function _transform(params) {
	if (!this.rawdata) {
		throw nlapiCreateError('MISSING_REQ_PARAM', 'rawdata is required');
	}
	try {
		var result = [];
		var data = this.rawdata;

		for (var idata = 0; data && idata < data.length; idata++) {
			var nd = new Tax.Adapter.NonDeductibleTaxDetail();

			for (var field in nd) {
				nd[field] = data[idata][field];
			}

			nd.taxcodeId = this.getTaxCodeIdFromMemo(data[idata].memo);
			if (!nd.taxcodeId) {
				continue;
			}
			nd.amount = nd.debitAmount ? -Math.abs(nd.amount) : Math.abs(nd.amount);
			
			nd.documentNumber = nd.documentNumber.match(/NONE/gi) ? '' : nd.documentNumber;

			result.push(nd);
		}
		return result;
	} catch (ex) {
		throw ex;
	}
};
