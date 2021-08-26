/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       13 Mar 2013     pmiller
 * 2.00		  26 Mar 2013	  pbtan				added validate field function, added cs library, moved upload and validate field function to library
 * 3.00		  02 Apr 2013	  pbtan				fixed param name of cv upload. delete unused function.
 * 4.00		  27 May 2013	  pbtan				fixed error in upload. needed the recordtype parameter.
 * 5.00       24 Jun 2014     pbtan             removed unused code and comments
 * 
 */

function upload(resourceId, recordType){
	psa_rss.clientlibrary.upload(resourceId, recordType);
}

/**
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort value change
 */
function rssEmployeeValidateField(type, name, linenum){
	return psa_rss.clientlibrary.rssEmployeeValidateField(type, name, linenum);
};

/**
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){

	var skillsets = new Array();
	for(var i = 0; ; i++){
		
		// check if this sublist is existing, break out of loop if not
		var sublistId = 'custpage_rss_sublist_' + i;
		var lineCount = nlapiGetLineItemCount(sublistId);
		if(lineCount == -1) break;
		
		// get all line items for this sublist and push to skillsets array
		for(var j = 0; j < lineCount; j++){
			var skillset = {};
			skillset['id'] = nlapiGetLineItemValue(sublistId, 'rss_id_' + i, j + 1);
			skillset['skill'] = nlapiGetLineItemValue(sublistId, 'rss_skill_' + i, j + 1);
			skillset['level'] = nlapiGetLineItemValue(sublistId, 'rss_level_' + i, j + 1);
			
			skillsets.push(skillset);
		}
	}
	
	nlapiSetFieldValue('custpage_rss_skillsets', JSON.stringify(skillsets), false);
	
    return true;
}