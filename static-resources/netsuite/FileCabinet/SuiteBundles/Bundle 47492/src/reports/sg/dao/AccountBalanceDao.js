/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.SG = TAF.SG || {};
TAF.SG.DAO = TAF.SG.DAO || {};

TAF.SG.DAO.AccountBalance = function _AccountBalance(id) {
	return {
		id: id,
		number: '',
		name: '',
		balance: 0
	};
};

TAF.SG.DAO.AccountBalanceDao = function _AccountBalanceDao(params) {
	this.accounts = {};
	this.params = params;
	this.hasAccountNumbering = nlapiLoadConfiguration('accountingpreferences').getFieldValue('ACCOUNTNUMBERS') == 'T';
};

TAF.SG.DAO.AccountBalanceDao.prototype.getById = function _getById(id) {
	if (this.accounts[id] && this.accounts[id].name) {
		return this.accounts[id];
	}

	this.accounts[id] = this.getAccountBalance(id);
	return this.accounts[id];
};

TAF.SG.DAO.AccountBalanceDao.prototype.getAccountBalance = function _getAccountBalance(id) {
	var accountBalance = new TAF.SG.DAO.AccountBalance(id);
	try {
	        var lookupFields = ['name'];
			if (this.hasAccountNumbering) {
			    lookupFields.push('number');
			}

			var account = nlapiLookupField('account', id, lookupFields);
			accountBalance.name = account.name;
			accountBalance.number = this.hasAccountNumbering ? account.number : '';

			var filters = [
				new nlobjSearchFilter('trandate', null, 'before', this.params.startDate),
				new nlobjSearchFilter('internalid', 'account', 'is', id)
			];
			var sr = nlapiSearchRecord('transaction', 'customsearch_sg_iaf_accountbalance', filters);
			if (sr && sr.length > 0) {
				accountBalance.balance = sr[0].getValue('formulanumeric', null, 'SUM');
			}
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.SG.DAO.AccountBalanceDao.getAccountBalance exception: ' + ex.toString());
	}
	return accountBalance;
};