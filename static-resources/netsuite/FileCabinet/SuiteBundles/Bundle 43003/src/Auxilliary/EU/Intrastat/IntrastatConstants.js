/**
 * Copyright (c) 2016, 2019 Oracle and/or its affiliates. All rights reserved.
 */

var CONSTANTS = CONSTANTS || {};

CONSTANTS.INTRASTAT = 'intrastat';

CONSTANTS.ACTION_TYPE = {
	GET_FORM : 'form',
	GET_DATA : 'data',
	EXPORT : 'export',
	REFRESH: 'refresh',
	CACHE : 'cache',
	SETUP : 'setup',
};

CONSTANTS.SCRIPT = {
	INTRASTAT : 'customscript_itr_intrastat',
	CLIENT : 'customscript_itr_intrastat_cs'
};

CONSTANTS.DEPLOYMENT = {
	INTRASTAT : 'customdeploy_itr_intrastat'
};

CONSTANTS.REPORT_TYPE = {
	SALE:     { id: 'SALE', text: 'Sale', report:  'Tax.EU.Intrastat.Generic.Sales.ENG'},
	PURCHASE: { id: 'PURCHASE', text: 'Purchase', report:  'Tax.EU.Intrastat.Generic.Purchase.ENG'}
};
// TODO: Consolidate both constants
CONSTANTS.LIST_DATA = {
	REPORT_TYPE: [
		{ id: 'SALE', text: 'Sale' },
		{ id: 'PURCHASE', text: 'Purchase' },
	]
};

// TODO: should be synced with mapper details
CONSTANTS.INDICATOR = {
	GOODS: 0,
	EU_TRIANGULATION: 2,
	SERVICES: 3
};

CONSTANTS.MAP_DETAILS = {
	GENERIC_REPORT: 'Tax.EU.Intrastat.Generic.Sales.ENG'
};

CONSTANTS.FIELD = {
	SUB_ID: 'subsidiary',
	REPORT_TYPE: 'reporttype',
	COUNTRY_FORM: 'countryform',
	FROM_DATE: 'fromperiod',
	TO_DATE: 'toperiod',
	CACHE_NAME: 'cachename',
	ACTION_TYPE:'actiontype',
	FILE_TYPE: 'filetype',
	RELOAD_CACHE: 'reloadcache',
	COUNTRY_CODE: 'countrycode',
	LANGUAGE_CODE: 'languagecode',
	BOOK_ID: 'bookid'
};

CONSTANTS.DATE = {
    MIN: 0,
    MAX: 8640000000000000
};

CONSTANTS.DEFAULT = {
	BE: {
		COUNTERPARTY_VATNO: 'QV999999999999',
		COUNTRY_OF_ORIGIN: 'QU'
	}
}