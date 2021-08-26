/*
 * OpenAir: Single sign-on
 * Bundle 13512
 * Version 4.0
 * Last Update: 04.13.2012
 * Managed by Tony Wong and Ryan Morrissey
 * Contact customer support for questions
 */
 
// Build the tab for projects
function buildSuiteletOAProjects(request, response)
{
   if ( request.getMethod() == 'GET' )
   {	
		// get SuiteSignOn ID from custom preference
		var ctx = nlapiGetContext();
		var ssoRecord = ctx.getPreference('custscript_oa_suitesignon_record');

		// get SuiteSignOn generic link
		var url = nlapiOutboundSSO(ssoRecord);
		
   	    //creates the project form
		var form;
		var formName = ctx.getPreference('custscript_oa_term_projects');
		
		if (formName != null && formName.length > 0) {
			// use terminology override
			form = nlapiCreateForm(formName);
		} else {
			// use default terminology
			form = nlapiCreateForm('Projects');
		}
		
		// get height and width and set style attribute
		var contentHeight = ctx.getPreference('custscript_oa_content_height');
		var contentWidth = ctx.getPreference('custscript_oa_content_width');
		var contentStyle = "width: "+contentWidth+"; height: "+contentHeight+"; margin:0; border:0; padding:0";
		
		// projects module
		var url_pm = url + '&app=pm';
		var content_pm = '<iframe src="'+url_pm+'" align="center" style="'+contentStyle+'"></iframe>';

        var iFramePM = form.addField('projects_sso', 'inlinehtml', 'SSO', null);
        iFramePM.setDefaultValue(content_pm);
        iFramePM.setLayoutType('outsidebelow', 'startcol');
        response.writePage( form );
   }
   else
        dumpResponse(request,response);
}

// Build the tab for resources
function buildSuiteletOAResources(request, response)
{
   if ( request.getMethod() == 'GET' )
   {	
		// get SuiteSignOn ID from custom preference
		var ctx = nlapiGetContext();
		var ssoRecord = ctx.getPreference('custscript_oa_suitesignon_record');

		// get SuiteSignOn generic link
		var url = nlapiOutboundSSO(ssoRecord);
		
		//creates the resources form
		var form;
		var formName = ctx.getPreference('custscript_oa_term_resources');
		
		if (formName != null && formName.length > 0) {
			// use terminology override
			form = nlapiCreateForm(formName);
		} else {
			// use default terminology
			form = nlapiCreateForm('Resources');
		}
		
		// get height and width and set style attribute
		var contentHeight = ctx.getPreference('custscript_oa_content_height');
		var contentWidth = ctx.getPreference('custscript_oa_content_width');
		var contentStyle = "width: "+contentWidth+"; height: "+contentHeight+"; margin:0; border:0; padding:0";
		
		// resources module
		var url_rm = url + '&app=rm';
		var content_rm = '<iframe src="'+url_rm+'" align="center" style="'+contentStyle+'"></iframe>';

        var iFrameRM = form.addField('resources_sso', 'inlinehtml', 'SSO', null);
        iFrameRM.setDefaultValue(content_rm);
        iFrameRM.setLayoutType('outsidebelow', 'startcol');
        response.writePage( form );
   }
   else
        dumpResponse(request,response);
}

// Build the tab for timesheets
function buildSuiteletOATimesheets(request, response)
{
   if ( request.getMethod() == 'GET' )
   {
		// get SuiteSignOn ID from custom preference
		var ctx = nlapiGetContext();
		var ssoRecord = ctx.getPreference('custscript_oa_suitesignon_record');

		// get SuiteSignOn generic link
		var url = nlapiOutboundSSO(ssoRecord);
		
		//creates the timesheets form
		var form;
		var formName = ctx.getPreference('custscript_oa_term_timesheets');
		
		if (formName != null && formName.length > 0) {
			// use terminology override
			form = nlapiCreateForm(formName);
		} else {
			// use default terminology
			form = nlapiCreateForm('Timesheets');
		}
		
		// get height and width and set style attribute
		var contentHeight = ctx.getPreference('custscript_oa_content_height');
		var contentWidth = ctx.getPreference('custscript_oa_content_width');
		var contentStyle = "width: "+contentWidth+"; height: "+contentHeight+"; margin:0; border:0; padding:0";
		
		// timesheets module
		var url_rm = url + '&app=ta';
		var content_ta = '<iframe src="'+url_rm+'" align="center" style="'+contentStyle+'"></iframe>';

		var iFrameTA = form.addField('timesheets_sso', 'inlinehtml', 'SSO', null);
        iFrameTA.setDefaultValue (content_ta);
        iFrameTA.setLayoutType('outsidebelow', 'startcol');
        response.writePage( form );
   }
   else
        dumpResponse(request,response);
}

// Build the tab for expenses
function buildSuiteletOAExpenses(request, response)
{
   if ( request.getMethod() == 'GET' )
   {
		// get SuiteSignOn ID from custom preference
		var ctx = nlapiGetContext();
		var ssoRecord = ctx.getPreference('custscript_oa_suitesignon_record');

		// get SuiteSignOn generic link
		var url = nlapiOutboundSSO(ssoRecord);
		
		//creates the expenses form
		var form;
		var formName = ctx.getPreference('custscript_oa_term_expenses');
		
		if (formName != null && formName.length > 0) {
			// use terminology override
			form = nlapiCreateForm(formName);
		} else {
			// use default terminology
			form = nlapiCreateForm('Expenses');
		}
		
		// get height and width and set style attribute
		var contentHeight = ctx.getPreference('custscript_oa_content_height');
		var contentWidth = ctx.getPreference('custscript_oa_content_width');
		var contentStyle = "width: "+contentWidth+"; height: "+contentHeight+"; margin:0; border:0; padding:0";
		
		// expenses module
		var url_te = url + '&app=te';
		var content_te = '<iframe src="'+url_te+'" align="center" style="'+contentStyle+'"></iframe>';

        var iFrameTE = form.addField('expenses_sso', 'inlinehtml', 'SSO', null);
        iFrameTE.setDefaultValue(content_te);
        iFrameTE.setLayoutType('outsidebelow', 'startcol');
        response.writePage( form );
   }
   else
        dumpResponse(request,response);
}

// Build the tab for purchases
function buildSuiteletOAPurchases(request, response)
{
   if ( request.getMethod() == 'GET' )
   {
		// get SuiteSignOn ID from custom preference
		var ctx = nlapiGetContext();
		var ssoRecord = ctx.getPreference('custscript_oa_suitesignon_record');

		// get SuiteSignOn generic link
		var url = nlapiOutboundSSO(ssoRecord);
		
		//creates the purchases form
		var form;
		var formName = ctx.getPreference('custscript_oa_term_purchases');
		
		if (formName != null && formName.length > 0) {
			// use terminology override
			form = nlapiCreateForm(formName);
		} else {
			// use default terminology
			form = nlapiCreateForm('Purchases');
		}
		
		// get height and width and set style attribute
		var contentHeight = ctx.getPreference('custscript_oa_content_height');
		var contentWidth = ctx.getPreference('custscript_oa_content_width');
		var contentStyle = "width: "+contentWidth+"; height: "+contentHeight+"; margin:0; border:0; padding:0";
		
		// purchases module
		var url_po = url + '&app=po';
		var content_po = '<iframe src="'+url_po+'" align="center" style="'+contentStyle+'"></iframe>';

        var iFramePurchases = form.addField('purchases_sso', 'inlinehtml', 'SSO', null);
        iFramePurchases.setDefaultValue(content_po);
        iFramePurchases.setLayoutType('outsidebelow', 'startcol');
        response.writePage( form );
   }
   else
        dumpResponse(request,response);
}

// Build the tab for invoices
function buildSuiteletOAInvoices(request, response)
{
   if ( request.getMethod() == 'GET' )
   {
		// get SuiteSignOn ID from custom preference
		var ctx = nlapiGetContext();
		var ssoRecord = ctx.getPreference('custscript_oa_suitesignon_record');

		// get SuiteSignOn generic link
		var url = nlapiOutboundSSO(ssoRecord);
		
		//creates the invoices form
		var form;
		var formName = ctx.getPreference('custscript_oa_term_invoices');
		
		if (formName != null && formName.length > 0) {
			// use terminology override
			form = nlapiCreateForm(formName);
		} else {
			// use default terminology
			form = nlapiCreateForm('Invoices');
		}
		
		// get height and width and set style attribute
		var contentHeight = ctx.getPreference('custscript_oa_content_height');
		var contentWidth = ctx.getPreference('custscript_oa_content_width');
		var contentStyle = "width: "+contentWidth+"; height: "+contentHeight+"; margin:0; border:0; padding:0";
		
		// invoices module
		var url_tb = url + '&app=tb';
		var content_tb = '<iframe src="'+url_tb+'" align="center" style="'+contentStyle+'"></iframe>';

        var iFrameTB = form.addField('invoices_sso', 'inlinehtml', 'SSO', null);
        iFrameTB.setDefaultValue(content_tb);
        iFrameTB.setLayoutType('outsidebelow', 'startcol');
        response.writePage( form );
   }
   else
        dumpResponse(request,response);
}

// Build the tab for reports
function buildSuiteletOAReports(request, response)
{
   if ( request.getMethod() == 'GET' )
   {
   	    //creates the form
		var form = nlapiCreateForm('Reports');		
	
		// get SuiteSignOn ID from custom preference
		var ctx = nlapiGetContext();
		var ssoRecord = ctx.getPreference('custscript_oa_suitesignon_record');

		// get SuiteSignOn generic link
		var url = nlapiOutboundSSO(ssoRecord);
				
		// get height and width and set style attribute
		var contentHeight = ctx.getPreference('custscript_oa_content_height');
		var contentWidth = ctx.getPreference('custscript_oa_content_width');
		var contentStyle = "width: "+contentWidth+"; height: "+contentHeight+"; margin:0; border:0; padding:0";
		
		// reports module
		var url_reports = url + '&app=ma&reports=1';
		var content_reports = '<iframe src="'+url_reports+'" align="center" style="'+contentStyle+'"></iframe>';

        var iFrameReports = form.addField('reports_sso', 'inlinehtml', 'SSO', null);
        iFrameReports.setDefaultValue(content_reports);
        iFrameReports.setLayoutType('outsidebelow', 'startcol');
        response.writePage( form );
   }
   else
        dumpResponse(request,response);
}

// Build the tab for workspaces
function buildSuiteletOAWorkspaces(request, response)
{
   if ( request.getMethod() == 'GET' )
   {
		// get SuiteSignOn ID from custom preference
		var ctx = nlapiGetContext();
		var ssoRecord = ctx.getPreference('custscript_oa_suitesignon_record');

		// get SuiteSignOn generic link
		var url = nlapiOutboundSSO(ssoRecord);
		
		//creates the workspaces form
		var form;
		var formName = ctx.getPreference('custscript_oa_term_workspaces');
		
		if (formName != null && formName.length > 0) {
			// use terminology override
			form = nlapiCreateForm(formName);
		} else {
			// use default terminology
			form = nlapiCreateForm('Workspaces');
		}
		
		// get height and width and set style attribute
		var contentHeight = ctx.getPreference('custscript_oa_content_height');
		var contentWidth = ctx.getPreference('custscript_oa_content_width');
		var contentStyle = "width: "+contentWidth+"; height: "+contentHeight+"; margin:0; border:0; padding:0";
		
		// workspaces module
		var url_km = url + '&app=km';
		var content_km = '<iframe src="'+url_km+'" align="center" style="'+contentStyle+'"></iframe>';

        var iFrameWorkspaces = form.addField('workspaces_sso', 'inlinehtml', 'SSO', null);
        iFrameWorkspaces.setDefaultValue(content_km);
        iFrameWorkspaces.setLayoutType('outsidebelow', 'startcol');
        response.writePage( form );
   }
   else
        dumpResponse(request,response);
}

// Build the tab for home
function buildSuiteletOAHome(request, response)
{
   if ( request.getMethod() == 'GET' )
   {
		// get SuiteSignOn ID from custom preference
		var ctx = nlapiGetContext();
		var ssoRecord = ctx.getPreference('custscript_oa_suitesignon_record');

		// get SuiteSignOn generic link
		var url = nlapiOutboundSSO(ssoRecord);
		
		//creates the home form
		var form;
		var formName = ctx.getPreference('custscript_oa_term_home');
		
		if (formName != null && formName.length > 0) {
			// use terminology override
			form = nlapiCreateForm(formName);
		} else {
			// use default terminology
			form = nlapiCreateForm('Home');
		}
		
		// get height and width and set style attribute
		var contentHeight = ctx.getPreference('custscript_oa_content_height');
		var contentWidth = ctx.getPreference('custscript_oa_content_width');
		var contentStyle = "width: "+contentWidth+"; height: "+contentHeight+"; margin:0; border:0; padding:0";
		
		// home module
		var url_ma = url + '&app=ma';
		var content_ma = '<iframe src="'+url_ma+'" align="center" style="'+contentStyle+'"></iframe>';

        var iFrameHome = form.addField('home_sso', 'inlinehtml', 'SSO', null);
        iFrameHome.setDefaultValue(content_ma);
        iFrameHome.setLayoutType('outsidebelow', 'startcol');
        response.writePage( form );
   }
   else
        dumpResponse(request,response);
}

// Build the tab for administration
function buildSuiteletOAAdministration(request, response)
{
   if ( request.getMethod() == 'GET' )
   {
   	    //creates the form
		var form = nlapiCreateForm('Administration');		
		
		// get SuiteSignOn ID from custom preference
		var ctx = nlapiGetContext();
		var ssoRecord = ctx.getPreference('custscript_oa_suitesignon_record');

		// get SuiteSignOn generic link
		var url = nlapiOutboundSSO(ssoRecord);
		
		// get height and width and set style attribute
		var contentHeight = ctx.getPreference('custscript_oa_content_height');
		var contentWidth = ctx.getPreference('custscript_oa_content_width');
		var contentStyle = "width: "+contentWidth+"; height: "+contentHeight+"; margin:0; border:0; padding:0";
		
		// administration module
		var url_admin = url + '&app=ma&accounts=1';
		var content_admin = '<iframe src="'+url_admin+'" align="center" style="'+contentStyle+'"></iframe>';

        var iFrameAdmin = form.addField('admin_sso', 'inlinehtml', 'SSO', null);
        iFrameAdmin.setDefaultValue(content_admin);
        iFrameAdmin.setLayoutType('outsidebelow', 'startcol');
        response.writePage( form );
   }
   else
        dumpResponse(request,response);
}

// Build the tab for support
function buildSuiteletOASupport(request, response)
{
   if ( request.getMethod() == 'GET' )
   {
   	    //creates the form
		var form = nlapiCreateForm('Support');		
	
		// get SuiteSignOn ID from custom preference
		var ctx = nlapiGetContext();
		var ssoRecord = ctx.getPreference('custscript_oa_suitesignon_record');

		// get SuiteSignOn generic link
		var url = nlapiOutboundSSO(ssoRecord);
				
		// get height and width and set style attribute
		var contentHeight = ctx.getPreference('custscript_oa_content_height');
		var contentWidth = ctx.getPreference('custscript_oa_content_width');
		var contentStyle = "width: "+contentWidth+"; height: "+contentHeight+"; margin:0; border:0; padding:0";
		
		// support module
		var url_support = url + '&support=1';
		var content_support = '<iframe src="'+url_support+'" align="center" style="'+contentStyle+'"></iframe>';

        var iFrameHome = form.addField('support_sso', 'inlinehtml', 'SSO', null);
        iFrameHome.setDefaultValue(content_support);
        iFrameHome.setLayoutType('outsidebelow', 'startcol');
        response.writePage( form );
   }
   else
        dumpResponse(request,response);
}

// Build the tab for help
function buildSuiteletOAHelp(request, response)
{
   if ( request.getMethod() == 'GET' )
   {
   	    //creates the form
		var form = nlapiCreateForm('Help');		
	
		// get SuiteSignOn ID from custom preference
		var ctx = nlapiGetContext();
		var ssoRecord = ctx.getPreference('custscript_oa_suitesignon_record');

		// get SuiteSignOn generic link
		var url = nlapiOutboundSSO(ssoRecord);
				
		// get height and width and set style attribute
		var contentHeight = ctx.getPreference('custscript_oa_content_height');
		var contentWidth = ctx.getPreference('custscript_oa_content_width');
		var contentStyle = "width: "+contentWidth+"; height: "+contentHeight+"; margin:0; border:0; padding:0";
		
		// help module
		var url_help = url + '&help=1';
		var content_help = '<iframe src="'+url_help+'" align="center" style="'+contentStyle+'"></iframe>';

        var iFrameHome = form.addField('help_sso', 'inlinehtml', 'SSO', null);
        iFrameHome.setDefaultValue(content_help);
        iFrameHome.setLayoutType('outsidebelow', 'startcol');
        response.writePage( form );
   }
   else
        dumpResponse(request,response);
}