/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.PT = TAF.PT || {};
TAF.PT.DAO = TAF.PT.DAO || {};

TAF.PT.DAO.ItemFulfillmentSummary = function _ItemFulfillmentSummary() {
	return {
		noOfMovementLines:0,
		totalQuantity:0
	};
};

TAF.PT.DAO.ItemFulfillmentSummaryDao = function _ItemFulfillmentSummaryDao() {};

TAF.PT.DAO.ItemFulfillmentSummaryDao.prototype.getSummary = function _getSummary(params) {
	var itemFulfillmentSummary = new TAF.PT.DAO.ItemFulfillmentSummary();

	try {
		var filters = this.getFilters(params);
		var columns = [new nlobjSearchColumn('internalid', 'applyingtransaction', 'count').setSort(true),
		               new nlobjSearchColumn('quantity', 'applyingtransaction', 'sum')];

		var sr = nlapiSearchRecord('transaction', null, filters, columns);

		if (!sr || sr.length == 0) {
			return itemFulfillmentSummary;
		}

		itemFulfillmentSummary.noOfMovementLines = sr[0].getValue('internalid', 'applyingtransaction', 'count') || 0;
		itemFulfillmentSummary.totalQuantity = sr[0].getValue('quantity', 'applyingtransaction', 'sum') || 0;
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.PT.DAO.ItemFulfillmentSummaryDao().getSummary() exception: ' + ex.toString());
	}

	return itemFulfillmentSummary;
};

TAF.PT.DAO.ItemFulfillmentSummaryDao.prototype.getFilters = function _getFilters(params) {
	var filters = [];
	filters.push(new nlobjSearchFilter('memorized', null, 'is', 'F'));
	filters.push(new nlobjSearchFilter('type', null, 'is', 'SalesOrd', null, 1, 0, false));
	filters.push(new nlobjSearchFilter('shipcountry', 'applyingtransaction', 'is', 'PT'));
	filters.push(new nlobjSearchFilter('type', 'item', 'anyof', ['Assembly', 'InvtPart', 'NonInvtPart', 'Kit']));

	if (nlapiGetContext().getFeature('SUBSIDIARIES')) {
		filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subIds));
	}

	filters.push(new nlobjSearchFilter('applyinglinktype', null, 'anyof', ['PickPack', 'ShipRcpt'], null, 0, 1, false));
	filters = filters.concat(this.getPeriodFilter(params.periodIds));
	return filters;
};

TAF.PT.DAO.ItemFulfillmentSummaryDao.prototype.getPeriodFilter = function _getPeriodFilter(periodIds) {

	var filters = [];
	for ( var iperiod = 0; iperiod < periodIds.length; iperiod++) {

		if (periodIds.length > 1) {
			var leftparens = (iperiod == 0) ? 1 : 0;
			var rightparens = ((iperiod + 1) == periodIds.length) ? 1 : 0;
			var isor = ((iperiod + 1) == periodIds.length) ? false : true;
			filters.push(new nlobjSearchFilter('postingperiod', 'applyingtransaction', 'is', periodIds[iperiod], null, leftparens, rightparens, isor));
		} else {
			filters.push(new nlobjSearchFilter('postingperiod', 'applyingtransaction', 'is', periodIds[iperiod], null, 0, 0, false));
		}
	}
	return filters;
};
