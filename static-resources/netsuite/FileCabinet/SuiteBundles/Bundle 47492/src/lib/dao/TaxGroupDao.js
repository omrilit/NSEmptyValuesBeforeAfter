/**
 * Copyright 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

TAF = TAF || {};
TAF.DAO = TAF.DAO || {};

TAF.DAO.TaxGroup = function() {
	return {
		id: '',
		rate: '',
		taxCodes: {}
	};
};

TAF.DAO.TaxGroupDaoSingleton = (function() { //singleton
	var _instance = null;
	return {
		getInstance : function(params) {
			if (!_instance) {
				_instance = new TAF.DAO.TaxGroupDao(params);
			}
			return _instance;
		}
	};
})();

TAF.DAO.TaxGroupDao = function() {
	TAF.DAO.BaseDAO.call(this);
	this.recordType = 'taxgroup';
	this.taxGroupCache = {};
	this.fields = {
		id: 'id',
		name: 'itemid',
		country: 'nexuscountry',
		rate: 'rate',
		taxCodes: {
			id: 'taxname',
			name: 'taxname2',
			rate: 'rate',
			basis: 'basis'
		}
	};
};
TAF.DAO.TaxGroupDao.prototype = Object.create(TAF.DAO.BaseDAO.prototype);

TAF.DAO.TaxGroupDao.prototype.search = function(id) {
	try {
		this.record = nlapiLoadRecord('taxgroup', id);
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.DAO.TaxGroupDao.search', ex.toString());
	}
};

TAF.DAO.TaxGroupDao.prototype.getList = function getList(params) {
	try {
		if (this.taxGroupCache[params.id]) {
			return this.taxGroupCache[params.id];
		}

		this.processList(this.search(params.id));
		this.taxGroupCache[params.id] = this.list;
		return this.list;
	} catch (ex) {
		nlapiLogExecution('ERROR', 'BaseDAO.getList', ex.toString());
		throw nlapiCreateError('SEARCH_ERROR', 'Error in running search');
	}
};

TAF.DAO.TaxGroupDao.prototype.processList = function processList() {
	if (!this.record) {
		return;
	}

	var taxGroup = new TAF.DAO.TaxGroup();
	for (var f in this.fields) {
		if (typeof this.fields[f] !== 'object') {
			var value = this.record.getFieldValue(this.fields[f]);
			taxGroup[f] = f === 'rate' ? Number(value.replace(/%/, '')) : value;
			continue;
		}

		var taxItems = this.record.getLineItemCount('taxitem');
		for (var i = 1; i <= taxItems; i++) {
			var id = this.record.getLineItemValue('taxitem', 'taxname', i);
			var taxCode = {};
			for (var c in this.fields[f]) {
				taxCode[c] = this.record.getLineItemValue('taxitem', this.fields[f][c], i);
			}
			taxGroup[f][id] = taxCode;
		}

	}
	this.list = taxGroup;
};

TAF.DAO.TaxGroupDao.prototype.searchById = function(id) {
	return this.getList({id: id});
};