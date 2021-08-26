/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.DAO = TAF.DAO || {};

TAF.DAO.Currency = function() {
	
	return {
		exchangeRate : '',
		externalId : '',
		internalId : '',
		isInactive : '',
		name : '',
		symbol : ''
	};
};

TAF.DAO.CurrencyDao = function() {
	this.currencyList = this.createCurrencyList();
	this.currencyMap = this.createCurrencyMap(); 
	this.symbolMap = this.createSymbolMap();
};

TAF.DAO.CurrencyDao.prototype.getCurrencyList = function _getCurrencyList() {
	return this.currencyList;
};

TAF.DAO.CurrencyDao.prototype.getCurrencyMap = function _getCurrencyMap() {
	return this.currencyMap;
};

TAF.DAO.CurrencyDao.prototype.getSymbolMap = function _getSymbolMap() {
	return this.symbolMap;
};

TAF.DAO.CurrencyDao.prototype.createCurrencyList = function _createCurrencyList() {
	
	var list = [];
	try {
	    var searchResult = nlapiSearchRecord('currency', null, null, this.getSearchColumns());
	    
	    for (var i = 0; i < searchResult.length; i++) {
	        var currency = this.convertToCurrencyObject(searchResult[i]);
	        list.push(currency);
	    }
	} catch (ex) {
		nlapiLogExecution('DEBUG', 'TAF.DAO.CurrencyDao.prototype.createCurrencyList() exception: ' + ex.toString());
	}
    return list;
};

TAF.DAO.CurrencyDao.prototype.createCurrencyMap = function _createCurrencyMap() {
   
	var currencyMap = {};
	try {
		var search = nlapiSearchRecord('currency', null, null, this.getSearchColumns());
		
		for (var i = 0; i < search.length; i++)
		{
			var currencyObj = this.convertToCurrencyObject(search[i]);
			currencyMap[search[i].getValue('internalid')] = currencyObj;	
		}
	} catch (ex) {
		nlapiLogExecution('DEBUG', 'TAF.DAO.CurrencyDao.prototype.createCurrencyMap() exception: ' + ex.toString());
	}
    return currencyMap;
};

TAF.DAO.CurrencyDao.prototype.createSymbolMap = function _createSymbolMap() {
	
    var symbolMap = {};
    try {
	    var list = this.currencyList;
	    
	    for (var i = 0; i < list.length; i++) {
	        var currency = list[i];
	        symbolMap[currency.internalId] = currency.symbol;
	    }
	} catch (ex) {
		nlapiLogExecution('DEBUG', 'TAF.DAO.CurrencyDao.prototype.createSymbolMap() exception: ' + ex.toString());
	}
    return symbolMap;    
};

TAF.DAO.CurrencyDao.prototype.getSearchColumns = function _getSearchColumns() {
	var columns = [new nlobjSearchColumn('exchangerate'),
	               new nlobjSearchColumn('externalid'),
	               new nlobjSearchColumn('internalid').setSort(),
	               new nlobjSearchColumn('isinactive'),
	               new nlobjSearchColumn('name'),
	               new nlobjSearchColumn('symbol')];
	return columns;
};

TAF.DAO.CurrencyDao.prototype.convertToCurrencyObject = function _convertToCurrencyObject(raw) {
    var currency = new TAF.DAO.Currency();    
	currency.exchangeRate = raw.getValue('exchangerate');
	currency.externalId = raw.getValue('externalid');
	currency.internalId = raw.getValue('internalid');
	currency.isInactive = raw.getValue('isinactive');
	currency.name = raw.getValue('name');
	currency.symbol = raw.getValue('symbol');
    return currency;
};

