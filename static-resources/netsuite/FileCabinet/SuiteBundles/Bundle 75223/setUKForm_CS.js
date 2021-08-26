/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Apr 2015     fteves
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
{
	FLD_LEAD_COUNTRY = 'country';
	FLD_LEAD_CURRENCY = 'currency';
	FLD_LEAD_SALES_REP = 'salesrep';
	
	COUNTRY_GB = 'GB';
	CURRENCY_GBP = '2';
}

function pageInit_setUKForm(type){
	if (type == "create" || type == "edit") { 
		nlapiSetFieldValue(FLD_LEAD_COUNTRY, COUNTRY_GB); 
		nlapiDisableField(FLD_LEAD_COUNTRY,'T');
		nlapiSetFieldValue(FLD_LEAD_CURRENCY, CURRENCY_GBP); 
		nlapiDisableField(FLD_LEAD_CURRENCY,'T');
	}
}

