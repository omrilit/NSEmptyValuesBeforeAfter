/*
 * OpenAir: Opportunity SSO subtab
 * Version 1.0
 * Managed by Tony Wong, Ryan Morrissey and Nayeem Mohammed
*/

function buildOppSubTab(type, tab_name) {

if (type != 'create') {

	// get the context 
	var nlobjContext = nlapiGetContext();
	// do we have advanced projects?
	var advancedProjects = isTrueAsString(nlobjContext.getFeature('ADVANCEDJOBS'));
	// do we have consolidate projects on sales transactions? (line-level projects)
	var consolidateSales = isTrueAsString(nlobjContext.getPreference('CONSOLINVOICES'));

		if (consolidateSales == 'F') {				

			// this will overwrite either 
			// 1) project on "project" field of opportunity header
			// 2) project on "entity" field of opportunity header
			
			var projID;

			// do we have a separate "job" field? 
			if (advancedProjects == 'T') {
				projID = nlapiGetFieldValue('job');
			} else {
				projID = nlapiGetFieldValue('entity');					
			}

			// LOG INFORMATION - REMOVE AFTER TESTING
			// nlapiLogExecution('DEBUG', 'projID: ' + projID);

			// get SuiteSignOn ID from custom preference
			var ctx = nlapiGetContext();
			var ssoRecord = ctx.getPreference('custscript_oa_suitesignon_record');
			var url;

			// log errors when SSO is not found or configured incorrectly
			try {
				// get SuiteSignOn generic link
				url = nlapiOutboundSSO(ssoRecord);
			} catch (err) {
				nlapiLogExecution('ERROR', 'System could not find a valid SSO record', err);
			}

			// only execute if valid SSO Is found
			if (url != null) {
			
				// make sure we have a project ID
				if (projID != null && projID > 0) {
					// projects module
					var url_pm = url + '&app=pm;netsuite_project_id=' + projID;
					var content_pm = '<iframe src="'+url_pm+'" align="center" style="width: 1350px; height: 600px; margin:0; border:0; padding:0"></iframe>';

					//add iframe and projects tab
					form.addTab('custpage_view_oa_project', 'View OpenAir Project');
					var iFramePM = form.addField('custpage_new_sso_tab', 'inlinehtml', null, null, 'custpage_view_oa_project');
					iFramePM.setDefaultValue(content_pm);
					iFramePM.setLayoutType('outsidebelow', 'startcol');
				} else {
					return false;
				}
			}
		}
	}
}

 function isTrueAsString(value) {
	if (value == 'T' || value == 'TRUE' || value == 't' || value == 'true' || value === true) {
		return 'T';
	} else {
		return 'F';
	}
}