/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       13 Mar 2013     pbtan				reload employee page, close this page.
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function rssCvDeletePageInit(type){
//	window.opener.location = window.opener.location + '&selectedtab=custpage_skills_tab';
	window.opener.location.reload(true);
	
	window.close();
}
