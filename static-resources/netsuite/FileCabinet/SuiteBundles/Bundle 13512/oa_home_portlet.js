/*
 * OpenAir: Home module portlet
 * Version 2.0
 * Created by Tony Wong and Ryan Morrissey
 */
 
function buildPortletOAHome(portlet, column)
{
    // set title of portlet
	var title = 'PSA Metrics';
    portlet.setTitle(title);
	
	// get SuiteSignOn ID from custom preference
	var ctx = nlapiGetContext();
	var ssoRecord = ctx.getPreference('custscript_oa_suitesignon_record');
		
    // get SuiteSignOn generic link
	var url = nlapiOutboundSSO(ssoRecord);
	
	// 
    var content = '<iframe src="'+url+'" align="center" style="width: 100%; height: 650px; margin:0; border:0; padding:0"></iframe>';
    portlet.setHtml( content );
}