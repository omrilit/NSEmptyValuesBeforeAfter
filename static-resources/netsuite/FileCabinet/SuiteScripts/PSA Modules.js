function buildSuitelet(request, response, module, tab_name)
{
   if ( request.getMethod() == 'GET' )
   {
    // creates the form
	var form = nlapiCreateForm('PSA Modules');		
	
	// get SuiteSignOn generic link
	var url = nlapiOutboundSSO('customsso_oa_sso');

	// create iframe URLs by module
	// projects module
	var url_pm = url + '&app=pm';
	var content_pm = '<iframe src="'+url_pm+'" align="center" style="width: 1200px; height: 570px; margin:0; border:0; padding:0"></iframe>';

	// resources module
	var url_rm = url + '&app=rm';
	var content_rm = '<iframe src="'+url_rm+'" align="center" style="width: 1200px; height: 570px; margin:0; border:0; padding:0"></iframe>';

	// timesheets module
	var url_ta = url + '&app=ta';
	var content_ta = '<iframe src="'+url_ta+'" align="center" style="width: 1200px; height: 570px; margin:0; border:0; padding:0"></iframe>';

	// expenses module	
	var url_te = url + '&app=te';
	var content_te = '<iframe src="'+url_te+'" align="center" style="width: 1200px; height: 570px; margin:0; border:0; padding:0"></iframe>';
	
	// purchases module	
	var url_po = url + '&app=po';
	var content_po = '<iframe src="'+url_po+'" align="center" style="width: 1200px; height: 570px; margin:0; border:0; padding:0"></iframe>';
	
	// invoices module	
	var url_tb = url + '&app=tb';
	var content_tb = '<iframe src="'+url_tb+'" align="center" style="width: 1200px; height: 570px; margin:0; border:0; padding:0"></iframe>';

	// workspaces module
	var url_km = url + '&app=km';
	var content_km = '<iframe src="'+url_km+'" align="center" style="width: 1200px; height: 570px; margin:0; border:0; padding:0"></iframe>';

	// dashboard module
	var url_ma = url + '&app=ma';
	var content_ma = '<iframe src="'+url_ma+'" align="center" style="width: 1200px; height: 570px; margin:0; border:0; padding:0"></iframe>';

	// reports module	
	var url_reports = url + '&app=ma&reports=1';
	var content_reports = '<iframe src="'+url_reports+'" align="center" style="width: 1200px; height: 570px; margin:0; border:0; padding:0"></iframe>';

	// administration module
	var url_admin = url + '&app=ma&accounts=1';
	var content_admin = '<iframe src="'+url_admin+'" align="center" style="width: 1200px; height: 570px; margin:0; border:0; padding:0"></iframe>';
	
	// CODE BREAK -- THIS PAINTS THE MODULES AS TABS

	//add iframe and projects tab
	form.addTab('oa_projects', 'Projects');
        var iFramePM = form.addField('projects_sso', 'inlinehtml', 'SSO', null, 'oa_projects');
        iFramePM.setDefaultValue(content_pm);
        iFramePM.setLayoutType('outsidebelow', 'startcol');

	//add iframe and resources tab
	form.addTab('oa_resources', 'Resources');
        var iFrameRM = form.addField('resources_sso', 'inlinehtml', 'SSO', null, 'oa_resources');
        iFrameRM.setDefaultValue(content_rm);
        iFrameRM.setLayoutType('outsidebelow', 'startcol');

	//add iframe and timesheets tab
    form.addTab('oa_timesheets', 'Timesheets');
		var iFrameTA = form.addField('timesheets_sso', 'inlinehtml', 'SSO', null, 'oa_timesheets');
        iFrameTA.setDefaultValue (content_ta);
        iFrameTA.setLayoutType('outsidebelow', 'startcol');
		
	//add iframe and expenses tab
	form.addTab('oa_expenses', 'Expenses');
        var iFrameTE = form.addField('expenses_sso', 'inlinehtml', 'SSO', null, 'oa_expenses');
        iFrameTE.setDefaultValue(content_te);
        iFrameTE.setLayoutType('outsidebelow', 'startcol');

	//add iframe and purchases tab
	form.addTab('oa_purchases', 'Purchases');
        var iFramePO = form.addField('purchases_sso', 'inlinehtml', 'SSO', null, 'oa_purchases');
        iFramePO.setDefaultValue(content_po);
        iFramePO.setLayoutType('outsidebelow', 'startcol');
		
	//add iframe and invoices tab
	form.addTab('oa_invoices', 'Invoices');
        var iFrameTB = form.addField('invoices_sso', 'inlinehtml', 'SSO', null, 'oa_invoices');
        iFrameTB.setDefaultValue(content_tb);
        iFrameTB.setLayoutType('outsidebelow', 'startcol');

	//add iframe and workspaces tab
	form.addTab('oa_wksp', 'Workspaces');
        var iFrameDash = form.addField('wksp_sso', 'inlinehtml', 'SSO', null, 'oa_wksp');
        iFrameDash.setDefaultValue(content_km);
        iFrameDash.setLayoutType('outsidebelow', 'startcol');
		
	//add iframe and dashboard tab
	form.addTab('oa_dash', 'Dashboard');
        var iFrameDash = form.addField('dash_sso', 'inlinehtml', 'SSO', null, 'oa_dash');
        iFrameDash.setDefaultValue(content_ma);
        iFrameDash.setLayoutType('outsidebelow', 'startcol');
			
	//add iframe and reports tab
	form.addTab('oa_reports', 'Reports');
        var iFrameReports = form.addField('reports_sso', 'inlinehtml', 'SSO', null, 'oa_reports');
        iFrameReports.setDefaultValue(content_reports);
        iFrameReports.setLayoutType('outsidebelow', 'startcol');

	//add iframe and administration tab
	form.addTab('oa_admin', 'Administration');
        var iFrameAdmin = form.addField('admin_sso', 'inlinehtml', 'SSO', null, 'oa_admin');
        iFrameAdmin.setDefaultValue(content_admin);
        iFrameAdmin.setLayoutType('outsidebelow', 'startcol');
	

        response.writePage( form );
   }
   else
        dumpResponse(request,response);
}