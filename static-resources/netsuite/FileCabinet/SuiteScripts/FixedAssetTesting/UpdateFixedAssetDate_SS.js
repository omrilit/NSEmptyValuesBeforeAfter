/**
 * Copyright NetSuite, Inc. 2014 All rights reserved. 
 * The following code is a demo prototype. Due to time constraints of a demo,
 * the code may contain bugs, may not accurately reflect user requirements 
 * and may not be the best approach. Actual implementation should not reuse 
 * this code without due verification.
 * 
 * (Module description here. Whole header length should not exceed 
 * 100 characters in width. Use another line if needed.)
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 Dec 2014     gbautista
 * 
 */

var REC_FAM_ASSET = 'customrecord_ncfar_asset';
var REC_UPDATED_FAM = 'customrecord_gb_updated_fam_reference';
var REC_FAM_DEPR_HISTORY = 'customrecord_ncfar_deprhistory';

var FLD_DEPR_START = 'custrecord_assetdeprstartdate';
var FLD_UPDATED_FAM = 'custrecord_gb_updated_fam';
var FLD_ORIG_DATE = 'custrecord_gb_fam_ref_original_date';
var FLD_NEW_DATE = 'custrecord_gb_fam_ref_new_date';	
var FLD_DEPR_ASSET = 'custrecord_deprhistasset';
var FLD_DEPR_DATE = 'custrecord_deprhistdate';
	

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @return {void}
 */
function scheduledUpdateFAMDate(type) {
	var aReference = nlapiSearchRecord(REC_UPDATED_FAM, null, null, [new nlobjSearchColumn(FLD_UPDATED_FAM)]);
	var aFAM = null;
	if(aReference != null) {
		aFAM = new Array();
		for(var i = 0; i < aReference.length; i++) {
			aFAM.push(aReference[i].getValue(FLD_UPDATED_FAM));
		}
		
		nlapiLogExecution('DEBUG', 'reference result', aFAM.length);
	}
	
	aFilter = new Array();
	aFilter.push(new nlobjSearchFilter('isinactive',null,'is','F'));
	//aFilter.push(new nlobjSearchFilter(FLD_DEPR_START,null,'before',new Date('01/31/2014')));
	
	var aResult = null;
	
	
	if(aFAM != null) {
		aFilter.push(new nlobjSearchFilter('internalid',null,'noneof',aFAM));
		aResult = nlapiSearchRecord(REC_FAM_ASSET, null,aFilter,[new nlobjSearchColumn('altname')]);
	} else {
		aResult = nlapiSearchRecord(REC_FAM_ASSET, null,aFilter,[new nlobjSearchColumn('altname')]);
	}
	
	if(aResult != null) {
		nlapiLogExecution('DEBUG', 'retrieve result', aResult.length);
		for(var i = 0; i < aResult.length; i++) {
			var dOrigStart = nlapiStringToDate(nlapiLookupField(REC_FAM_ASSET, aResult[i].getId(), FLD_DEPR_START));

			nlapiLogExecution('DEBUG', 'orig time - ' + aResult[i].getId(), dOrigStart);

			var dNewStart = nlapiAddMonths(dOrigStart, -11);

			nlapiLogExecution('DEBUG', 'updated time - ' + aResult[i].getId(), dNewStart);

			nlapiSubmitField(REC_FAM_ASSET, aResult[i].getId(), FLD_DEPR_START, nlapiDateToString(dNewStart, 'date'), true);
			
			var recFAM = nlapiCreateRecord(REC_UPDATED_FAM);
			recFAM.setFieldValue(FLD_UPDATED_FAM,aResult[i].getId());
			recFAM.setFieldValue(FLD_ORIG_DATE,nlapiDateToString(dOrigStart,'date'));
			recFAM.setFieldValue(FLD_NEW_DATE,nlapiDateToString(dNewStart,'date'));
			
			nlapiSubmitRecord(recFAM);
			
			/*var aDeprFilter = new Array();
			aDeprFilter.push(new nlobjSearchFilter(FLD_DEPR_ASSET,null,'is',aResult[i].getId()));
			var aDepreciation = nlapiSearchRecord(REC_FAM_DEPR_HISTORY, null,aDeprFilter,[new nlobjSearchColumn(FLD_DEPR_DATE)]);
			
			if(aDepreciation != null) {
				for(var o = 0; o < aDepreciation.length; o++) {
					var dOrigDate = aDepreciation[o].getValue(FLD_DEPR_DATE);
					
					var dNewDate = nlapiAddMonths(dOrigDate, -33);
					
					nlapiSubmitField(REC_FAM_DEPR_HISTORY, aDepreciation[o].getId(), FLD_DEPR_DATE, nlapiDateToString(dNewDate, 'date'), true);
				}
			}*/
		}
	}
    
	//for testing only
//	var dStart = nlapiStringToDate(nlapiLookupField(REC_FAM_ASSET, 165, FLD_DEPR_START));
//	
//	nlapiLogExecution('DEBUG', 'orig time', dStart);
//	
//	dStart = nlapiAddMonths(dStart, -11);
//	
//	nlapiLogExecution('DEBUG', 'updated time', dStart);
//	
//	nlapiSubmitField(REC_FAM_ASSET, 165, FLD_DEPR_START, nlapiDateToString(dStart, 'date'), true);
//	
}
