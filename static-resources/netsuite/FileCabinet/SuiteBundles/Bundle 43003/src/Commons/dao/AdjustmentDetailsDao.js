/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax = Tax || {};
Tax.DAO = Tax.DAO || {};

Tax.DAO.AdjustmentDetailsDAO = function AdjustmentDetailsDAO() {
	Tax.DAO.RecordDAO.call(this);
	this.Name = 'AdjustmentDetailsDAO';
	this.recordType = 'transaction';

	var context = nlapiGetContext();
	this.isOneWorld = context.getFeature('subsidiaries');
	this.isMultiBook = context.getFeature('multibook');
	this.isMultiCurrency = context.getFeature('multicurrency');

	this.source = null;
	this.amountJoinColumn = null;
	this.amountColumn = this.isMultiCurrency ? 'fxamount' : 'amount';
};
Tax.DAO.AdjustmentDetailsDAO.prototype = Object.create(Tax.DAO.RecordDAO.prototype);

Tax.DAO.AdjustmentDetailsDAO.prototype.prepareSearch = function prepareSearch(params) {
	try {
		this.filters = [
			new nlobjSearchFilter('posting', null, 'is', 'T'),
			new nlobjSearchFilter('type', null, 'is', 'Journal'),
			new nlobjSearchFilter('mainline', null, 'is', 'T'),
			new nlobjSearchFilter('custbody_adjustment_journal', null, 'is', 'T'),
			new nlobjSearchFilter('custcol_adjustment_tax_code', null, 'noneof', '@NONE@'),
		];

		for (var iperiod = params.periodfrom; iperiod <= params.periodto; iperiod++) {
			var isor = iperiod < params.periodto ? 1 : 0;
			var leftParens = iperiod == params.periodfrom ? 1 : 0;
			var rightParens = iperiod == params.periodto ? 1 : 0;
			this.filters.push(new nlobjSearchFilter('taxperiod', null, 'is', iperiod, null, leftParens, rightParens, isor));
		}


		this.source = params.transactionType == 'PURCHASE' ? 'vendor' : 'customer';
		this.filters.push(new nlobjSearchFilter('accounttype', null, 'anyof', params.transactionType == 'PURCHASE'?'OthCurrAsset':'OthCurrLiab'));

		if (this.isOneWorld && params.subsidiary) {
			this.filters.push(new nlobjSearchFilter("subsidiary", null, "is", params.subsidiary));
		}

		if (this.isMultiBook && params.bookid) {
			this.filters.push(new nlobjSearchFilter('accountingbook', 'accountingtransaction', 'is', params.bookid));
			amountJoinColumn = 'accountingtransaction';
			amountColumn = 'amount';
		}

		this.columns = [
			new nlobjSearchColumn('internalid', null, 'group'),
			new nlobjSearchColumn('custcol_adjustment_tax_code', null, 'group'),
			new nlobjSearchColumn('entity', null, 'group'),
			new nlobjSearchColumn('vatregnumber', this.source, 'group'),
			new nlobjSearchColumn('transactionnumber', null, 'group'),
			new nlobjSearchColumn('tranid', null, 'group'),
			new nlobjSearchColumn('trandate', null, 'group'),
			new nlobjSearchColumn(this.amountColumn, this.amountJoinColumn, 'sum'),
			new nlobjSearchColumn('type', null, 'group')
		];
	} catch (ex) {
		logException(ex, 'Tax.DAO.AdjustmentDetailsDAO.prepareSearch');
		throw ex;
	}
};

Tax.DAO.AdjustmentDetailsDAO.prototype.ListObject = function(id) {
	return {
		id: id,
		taxCode: '',
		entityName: '',
		entityTaxNumber: '',
		transactionId: '',
		documentNumber: '',
		transactionDate: '',
		netAmount: 0,
		taxAmount: 0,
		notionalAmount: 0,
		totalGrossAmount: 0,
		transactionType: ''
	};
};

Tax.DAO.AdjustmentDetailsDAO.prototype.rowToObject = function(row) {
	var id = row.getValue('internalid', null, 'group');
	var rowObject = {internalId: id, lines: []};
	var line = new this.ListObject(id);
	line.taxCode = row.getText("custcol_adjustment_tax_code", null, "group");
	line.entityName = row.getText("entity", null, "group");
	line.entityTaxNumber = row.getValue('vatregnumber', this.source, 'group');
	line.transactionId = row.getValue("tranid", null, "group");
	line.documentNumber = row.getValue("transactionnumber", null, "group");
	line.transactionDate = row.getValue("trandate", null, "group");
	line.taxAmount = row.getValue(this.amountColumn, this.amountJoinColumn, "sum");
	line.totalGrossAmount = line.taxAmount;
	line.transactionType = row.getText("type", null, "group");
	rowObject.lines.push(line);
	return rowObject;
};

Tax.DAO.SaleAdjustmentDetailsDAO = function SaleAdjustmentDetailsDAO() {
	Tax.DAO.AdjustmentDetailsDAO.call(this);
	this.Name = 'SaleAdjustmentDetailsDAO';
};
Tax.DAO.SaleAdjustmentDetailsDAO.prototype = Object.create(Tax.DAO.AdjustmentDetailsDAO.prototype);

Tax.DAO.SaleAdjustmentDetailsDAO.prototype.process = function(result, params) {
	params.transactionType = 'SALE';
	return Tax.DAO.BaseDAO.prototype.process.apply(this, [result, params]);
};

Tax.DAO.PurchaseAdjustmentDetailsDAO = function PurchaseAdjustmentDetailsDAO() {
	Tax.DAO.AdjustmentDetailsDAO.call(this);
	this.Name = 'PurchaseAdjustmentDetailsDAO';
};
Tax.DAO.PurchaseAdjustmentDetailsDAO.prototype = Object.create(Tax.DAO.AdjustmentDetailsDAO.prototype);

Tax.DAO.PurchaseAdjustmentDetailsDAO.prototype.process = function(result, params) {
	params.transactionType = 'PURCHASE';
	return Tax.DAO.BaseDAO.prototype.process.apply(this, [result, params]);
};
