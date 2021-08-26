/**
 * Copyright © 2016, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.DAO = Tax.DAO || {};

Tax.DAO.RealizedGainLossDetailsDAO = function RealizedGainLossDetailsDAO() {
    Tax.DAO.SearchDAO.call(this);
    this.Name = 'RealizedGainLossDetailsDAO';
	this.searchId = 'customsearch_itr_rgl_details';
	this.searchType = 'transaction';
	this.filters = [];
	this.columns = [];

	this.fields = {
		date: {name: 'trandate'},
		entity: {name: 'entity'},
		transactionNumber: {name:'transactionnumber'},
		transactionType: {name: 'type'},
		amount: {name: 'amount'},
		mbaAmount: {name: 'amount', join:'accountingtransaction'},
		memo: {name: 'memo'},
		quantity: {name: 'quantity'},
		customRegNum: {name: 'custbody_4110_customregnum'},
		timestamp: {name: 'custbody_report_timestamp'},
		shipCountry: {name: 'shipcountry'}
	};
};
Tax.DAO.RealizedGainLossDetailsDAO.prototype = Object.create(Tax.DAO.SearchDAO.prototype);

Tax.DAO.RealizedGainLossDetailsDAO.prototype.prepareSearch = function prepareSearch(params) {
    try {
        if (params && params.subsidiary) {
            this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subsidiary)); //consolidation is not supported
        }

        if (params && params.nexus) {
            this.filters.push(new nlobjSearchFilter('nexus', null, 'anyof', params.nexus, null, 1, 0, true));
            this.filters.push(new nlobjSearchFilter('nexus', 'appliedtotransaction', 'anyof', params.nexus, null, 1, 2, false));
        }
        
        if (params && (params.book || params.bookid) && nlapiGetContext().getFeature('MULTIBOOK')) {
            this.filters.push(new nlobjSearchFilter('accountingbook', 'accountingtransaction', 'is', params.bookid));
        }

        if (params && params.periodFrom && params.periodTo) {
            this.filters.push(new nlobjSearchFilter('trandate', null, 'within', params.periodFrom, params.periodTo));
        }

        if (!params.bookid) {
            delete this.fields.mbaAmount;
        }
    } catch (ex) {
        logException(ex, 'Tax.DAO.RealizedGainLossDetailsDAO.prepareSearch');
    }
};

Tax.DAO.RealizedGainLossDetailsDAO.prototype.ListObject = function ListObject() {
    var obj = {};
    for (var f in this.fields) {
        obj[f] = '';
    }
    return obj;
};

Tax.DAO.RealizedGainLossDetailsDAO.prototype.rowToObject = function rowToObject(row) {
	var obj = new this.ListObject();
	for (var f in this.fields) {
		var column = this.fields[f];
		if (f === 'entity' || f === 'transactionType') {
			obj[f] = row.getText(column.name, column.join ? column.join : null, column.summary ? column.summary : null);
		} else {
			obj[f] = row.getValue(column.name, column.join ? column.join : null, column.summary ? column.summary : null);
		}
	}
	return obj;
};

var Tax = Tax || {};
Tax.Adapter = Tax.Adapter || {};

Tax.Adapter.RealizedGainLossDetail = function RealizedGainLossDetail(id) {
	return { //same order with drilldown details
		taxcode: '',
		date: '',
		name: '',
		number: '',
		transactionType: '',
		netAmount: 0,
		taxAmount: 0,
		grossAmount: 0,
		typeId: '',
		taxType: '',
		timestamp: '',
		typeInternalId: '',
		tranDateNumber: '',
		transactionNumber: '',
		memo: '',
		quantity: '',
		customsRegNo: '',
		shipCountry: '',
		toArray: function() {
			var array = [];
			for (var obj in this) {
				if (typeof this[obj] != 'function') {
					array.push(this[obj]);
				}
			}
			return array;
		}
	};
};

Tax.Adapter.RealizedGainLossDetailsAdapter = function RealizedGainLossDetailsAdapter() {
    Tax.Adapter.BaseAdapter.call(this);
	this.Name = 'RealizedGainLossDetailsAdapter';
	this.dateCache = {};
	this.tranTypes = this.loadTranTypes();
};
Tax.Adapter.RealizedGainLossDetailsAdapter.prototype = Object.create(Tax.Adapter.BaseAdapter.prototype);

Tax.Adapter.RealizedGainLossDetailsAdapter.prototype.transform = function _transform(params) {
	if (!this.rawdata) {
		throw nlapiCreateError('MISSING_REQ_PARAM', 'rawdata is required');
	}
	try {
		var result = [];
		var data = this.rawdata;

		for (var idata = 0; data && idata < data.length; idata++) {
			var currentData = data[idata];
			var rgl = new Tax.Adapter.RealizedGainLossDetail();

			for (var field in currentData) {
			    if (rgl.hasOwnProperty(field)) {
			        rgl[field] = currentData[field];
			    }
			}

			var date = currentData.date;
			if (!this.dateCache[date]) {
				this.dateCache[date] = {};
				this.dateCache[date].value = nlapiStringToDate(date);
				this.dateCache[date].valueOf = this.dateCache[date].value.valueOf();
				this.dateCache[date].text = this.dateCache[date].value.toString(params.dateFormat);
			}
			rgl.date = this.dateCache[date].text;
			rgl.tranDateNumber = this.dateCache[date].valueOf;
			rgl.name = currentData.entity;
			rgl.number = currentData.transactionNumber;
			rgl.typeId = this.tranTypes[currentData.transactionType] ? this.tranTypes[currentData.transactionType].id : '';
			rgl.typeInternalId = this.tranTypes[currentData.transactionType] ? this.tranTypes[currentData.transactionType].internalid : '';
			rgl.netAmount = this.mbaEnabled ? parseFloat(currentData.mbaAmount) : parseFloat(currentData.amount);
			rgl.taxcode = params.defaults.taxCode;
			rgl.taxType = params.defaults.taxType;
			result.push(rgl.toArray());
		}
		return result;
	} catch (ex) {
		throw ex;
	}
};

Tax.Adapter.RealizedGainLossDetailsAdapter.prototype.loadTranTypes = function() {
	var tranTypes = {};
	try {
		var filters = [new nlobjSearchFilter("custrecord_map_type", null, "is", "TXN")];
		var columns = [
			new nlobjSearchColumn("name"),
			new nlobjSearchColumn("custrecord_internal_id"),
			new nlobjSearchColumn("custrecord_transaction_name")
		];

		var rs = nlapiSearchRecord("customrecord_tax_report_map", null, filters, columns);

		for(var irow = 0; irow < (rs && rs.length); irow++) {
			tranTypes[rs[irow].getText('custrecord_transaction_name')] = {id: rs[irow].getValue('name'), internalid:rs[irow].getValue('custrecord_internal_id')};
		}
	} catch (ex) {
		logException(ex, 'Tax.Adapter.RealizedGainLossDetailsAdapter.loadTranTypes');
	}
	return tranTypes;
};






Tax.RealizedGainLoss = function() {
    this.details = null;
    this.summary = null;
};

Tax.RealizedGainLoss.prototype.run = function(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'The reporting parameters are required.');
    }
    
    params.periodStartDate = new SFC.System.TaxPeriod(params.periodFrom).GetStartDate();
    params.periodEndDate = new SFC.System.TaxPeriod(params.periodTo).GetEndDate();
    
    var rawData = new Tax.DAO.RealizedGainLossDetailsDAO().getList({
    	nexus: params.nexus,
        subsidiary: params.subId,
        bookid: params.bookId,
        periodFrom: params.periodStartDate,
        periodTo: params.periodEndDate
    });
    
    var adapter = new Tax.Adapter.RealizedGainLossDetailsAdapter();
    adapter.rawdata = rawData;
    
    this.details = adapter.transform(params);
    this.summary = this.summarize(this.details);
    
    return this;
};

Tax.RealizedGainLoss.prototype.summarize = function(data) {
    var summary = {netAmount: 0};
    
    for (var i = 0; i < data.length; i++) {
        summary.netAmount += parseFloat(data[i][5]);
    }
    
    return summary;
};

Tax.RealizedGainLoss.prototype.getSummary = function(params) {
    if (this.summary === null) {
        this.run(params);
    }
    
    return this.summary;
};

Tax.RealizedGainLoss.prototype.getDetails = function(params) {
    if (this.details === null) {
        this.run(params);
    }
    
    return this.details;
};
