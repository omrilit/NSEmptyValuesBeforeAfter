/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Mar 2015     fteves
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
{
	REC_ITEM = 'item';
	ITEM_SEARCH = 'customsearch_fmt_data_wizard_item_list';	
}

function dataWizard_suitelet(request, response){
	if(request.getMethod() == 'POST') {
		
		//Company
		var recCompanyInformation = nlapiLoadConfiguration('companyinformation');
		if(request.getParameter('custpage_company_name') != recCompanyInformation.getFieldValue('companyname')) {
			recCompanyInformation.setFieldValue('companyname',request.getParameter('custpage_company_name'));
		} 
		
		//Company Logo(Pages)
		if(request.getFile('custpage_logo_pages')) {
			var recFile_pageLogo = request.getFile('custpage_logo_pages');
			recFile_pageLogo.setName('account_logo_pages.jpg');
			recFile_pageLogo.setIsOnline(true);
			recFile_pageLogo.setFolder(-4); //Images folder - this is present to all dataset with the same folder internalid
			
			var idFile_pageLogo = nlapiSubmitFile(recFile_pageLogo);
			recCompanyInformation.setFieldValue('pagelogo',idFile_pageLogo);
		}
		
		//Company Logo(Forms)
		if(request.getFile('custpage_logo_forms')) {
			var recFile_formLogo = request.getFile('custpage_logo_forms');
			recFile_formLogo.setName('account_logo_forms.jpg');
			recFile_formLogo.setIsOnline(true);
			recFile_formLogo.setFolder(-4); //Images folder - this is present to all dataset with the same folder internalid
			
			var idFile_formLogo = nlapiSubmitFile(recFile_formLogo);
			recCompanyInformation.setFieldValue('formlogo', idFile_formLogo);
		}	
		
		//Customer is company
		var sCustomer = request.getParameter('custpage_customer');
		if(sCustomer){
			var sCustomerName = request.getParameter('custpage_customer_name');
			
			//Customer is individual
			var sCustomerFirstName = request.getParameter('custpage_customer_firstname');			
			var sCustomerMiddleName = request.getParameter('custpage_customer_middlename');
			var sCustomerLastName = request.getParameter('custpage_customer_lastname');
			
			var idCustomer = nlapiLookupField('customer', sCustomer, 'entityid');
			
			var firstNameCustomer = nlapiLookupField('customer', sCustomer, 'firstname');
			var middleNameCustomer = nlapiLookupField('customer', sCustomer, 'middlename');
			var lastNameCustomer = nlapiLookupField('customer', sCustomer, 'lastname');
					
			var sCustomerTypeIndividual = nlapiLookupField('customer', sCustomer, 'isperson');
			if(sCustomerTypeIndividual == 'F'){
				if(sCustomerName){
					if(sCustomerName != idCustomer) {
						nlapiLogExecution('DEBUG', '-----Company-----', 'Customer is of type  company');
						nlapiSubmitField('customer', sCustomer, 'entityid', sCustomerName);
						nlapiSubmitField('customer', sCustomer, 'companyname', sCustomerName);
					}
				}
				
			}else{
				nlapiLogExecution('DEBUG', '-----Individual-----', 'Customer is of type  individual');
				if(sCustomerFirstName){
					if(sCustomerFirstName != firstNameCustomer){
						nlapiSubmitField('customer', sCustomer, 'firstname', sCustomerFirstName);
					}
				}else{
					sCustomerFirstName = firstNameCustomer;
				}
				
				if(sCustomerMiddleName){
					if(sCustomerMiddleName != middleNameCustomer){
						nlapiSubmitField('customer', sCustomer, 'middlename', sCustomerMiddleName);
					}
				}else{
					sCustomerMiddleName = middleNameCustomer;
				}
				
				if(sCustomerLastName){
					if(sCustomerLastName != lastNameCustomer){
						nlapiSubmitField('customer', sCustomer, 'lastname', sCustomerLastName);
					}
				}else{
					sCustomerLastName = lastNameCustomer;
				}
				nlapiSubmitField('customer', sCustomer, 'entityid', sCustomerFirstName + ' ' + sCustomerMiddleName + ' ' + sCustomerLastName);
			}
			
			var sCustomerInactive = request.getParameter('custpage_customer_inactive');
			nlapiSubmitField('customer', sCustomer, 'isinactive', sCustomerInactive);
		}
		
		//Item
		var sItem = request.getParameter('custpage_item');
		if(sItem){
			var itemType = nlapiLookupField('item', sItem, 'type');
			if(itemType != null){
				if(request.getParameter('custpage_item') && (request.getParameter('custpage_item_name') != nlapiLookupField('item', request.getParameter('custpage_item'), 'itemid'))) {
					nlapiSubmitField(getItemType(request.getParameter('custpage_item')), request.getParameter('custpage_item'), 'itemid', request.getParameter('custpage_item_name'));
					nlapiSubmitField(getItemType(request.getParameter('custpage_item')), request.getParameter('custpage_item'), 'salesdescription', request.getParameter('custpage_item_description'));
					nlapiSubmitField(getItemType(request.getParameter('custpage_item')), request.getParameter('custpage_item'), 'displayname', request.getParameter('custpage_item_displayname'));
				}
				
				nlapiSubmitField(getItemType(request.getParameter('custpage_item')), request.getParameter('custpage_item'), 'isinactive', request.getParameter('custpage_item_inactive'));
			}
			
			
		}
				
		//Employee
		var sEmployee = request.getParameter('custpage_employee');
		nlapiLogExecution('DEBUG', 'sEmployee', 'sEmployee=' + sEmployee);
		if(sEmployee){
			var sEmployeeFirstName = request.getParameter('custpage_employee_firstname');
			var sEmployeeMiddleName = request.getParameter('custpage_employee_middlename');
			var sEmployeeLastName = request.getParameter('custpage_employee_lastname');
			nlapiLogExecution('DEBUG', 'sEmployeeLastName', sEmployeeLastName);
			
			var idEmployee = nlapiLookupField('employee', sEmployee, 'entityid');
			
			var firstNameEmployee = nlapiLookupField('employee', sEmployee, 'firstname');
			var middleNameEmployee = nlapiLookupField('employee', sEmployee, 'middlename');
			var lastNameEmployee = nlapiLookupField('employee', sEmployee, 'lastname');
			nlapiLogExecution('DEBUG', 'lastNameEmployee', lastNameEmployee);
			
			if(sEmployeeFirstName){
				if(sEmployeeFirstName != firstNameEmployee){
					nlapiSubmitField('employee', sEmployee, 'firstname', sEmployeeFirstName);
				}
			}else{
				sEmployeeFirstName = firstNameEmployee;
			}
			
			if(sEmployeeMiddleName){
				if(sEmployeeMiddleName != middleNameEmployee){
					nlapiSubmitField('employee', sEmployee, 'middlename', sEmployeeMiddleName);
				}
			}else{
				sEmployeeMiddleName = middleNameEmployee;
			}
			
			if(sEmployeeLastName){
				if(sEmployeeLastName != lastNameEmployee){
					nlapiSubmitField('employee', sEmployee, 'lastname', sEmployeeLastName);
				}
			}else{
				sEmployeeLastName = lastNameEmployee;
			}
			nlapiSubmitField('employee', sEmployee, 'entityid', sEmployeeFirstName + ' ' + sEmployeeMiddleName + ' ' + sEmployeeLastName);
			
			var sEmployeeInactive = request.getParameter('custpage_employee_inactive');
			nlapiSubmitField('employee', sEmployee, 'isinactive', sEmployeeInactive);
		}		
		
		//Vendor
		//Vendor is company
		var sVendor = request.getParameter('custpage_vendor');
		nlapiLogExecution('DEBUG', 'sVendor', sVendor);
		if(sVendor){
			var sVendorName = request.getParameter('custpage_vendor_name');
					
			//Vendor is individual
			var sVendorFirstName = request.getParameter('custpage_vendor_firstname');
			var sVendorMiddleName = request.getParameter('custpage_vendor_middlename');
			var sVendorLastName = request.getParameter('custpage_vendor_lastname');
			
			var idVendor = nlapiLookupField('vendor', sVendor, 'entityid');
			
			var firstNameVendor = nlapiLookupField('vendor', sVendor, 'firstname');
			var middleNameVendor = nlapiLookupField('vendor', sVendor, 'middlename');
			var lastNameVendor = nlapiLookupField('vendor', sVendor, 'lastname');
					
			var sVendorTypeIndividual = nlapiLookupField('vendor', sVendor, 'isperson');
			if(sVendorTypeIndividual == 'F'){
				if(sVendorName){
					if(sVendorName != idVendor) {
						nlapiLogExecution('DEBUG', '-----Company-----', 'Vendor is of type  company');
						nlapiSubmitField('vendor', sVendor, 'entityid', sVendorName);
						nlapiSubmitField('vendor', sVendor, 'companyname', sVendorName);
					}
				}
			}else{
				nlapiLogExecution('DEBUG', '-----Individual-----', 'Vendor is of type  individual');
				if(sVendorFirstName){
					if(sVendorFirstName != firstNameVendor){
						nlapiSubmitField('vendor', sVendor, 'firstname', sVendorFirstName);
					}
				}else{
					sVendorFirstName = firstNameVendor;
				}
				
				if(sVendorMiddleName){
					if(sVendorMiddleName != middleNameVendor){
						nlapiSubmitField('vendor', sVendor, 'middlename', sVendorMiddleName);
					}
				}else{
					sVendorMiddleName = middleNameVendor;
				}
				
				if(sVendorLastName){
					if(sVendorLastName != lastNameVendor){
						nlapiSubmitField('vendor', sVendor, 'lastname', sVendorLastName);
					}
				}else{
					sVendorLastName = lastNameVendor;
				}
				nlapiSubmitField('vendor', sVendor, 'entityid', sVendorFirstName + ' ' + sVendorMiddleName + ' ' + sVendorLastName);
			}
			
			var sVendorInactive = request.getParameter('custpage_vendor_inactive');
			nlapiSubmitField('vendor', sVendor, 'isinactive', sVendorInactive);
		}
				
		//Subsidiary
		var ctxSubsidiary = nlapiGetContext().getFeature('SUBSIDIARIES');   
		nlapiLogExecution('DEBUG', '-----ctxSubsidiary_POST-----', 'ctxSubsidiary=' + ctxSubsidiary);
		if(ctxSubsidiary != false){
			var sSubsidiary =  request.getParameter('custpage_subsidiary');
			nlapiLogExecution('DEBUG', '-----sSubsidiary-----', sSubsidiary);
			if(sSubsidiary){
				var sSubsidiaryName = request.getParameter('custpage_subsidiary_name');
				nlapiLogExecution('DEBUG', '-----sSubsidiaryName-----', sSubsidiaryName);
				
				if(sSubsidiaryName){
					var nameSubsidiary = nlapiLookupField('subsidiary', sSubsidiary, 'name');
					nlapiLogExecution('DEBUG', '-----nameSubsidiary-----', nameSubsidiary);
					if(sSubsidiaryName != nameSubsidiary){
						nlapiSubmitField('subsidiary', sSubsidiary, 'name', sSubsidiaryName);
					}
				}
							
				var oSubsidiaryName, resSubsidiaryName;
				if(sSubsidiaryName){
					nlapiLogExecution('DEBUG', '-----sSubsidiaryName-----', 'IF');
					resSubsidiaryName = sSubsidiaryName.toLowerCase();
				}else{
					nlapiLogExecution('DEBUG', '-----sSubsidiaryName-----', 'ELSE');
					oSubsidiaryName = getName(nlapiLookupField('subsidiary', sSubsidiary, 'name'));
					resSubsidiaryName = oSubsidiaryName.toLowerCase();
				}
				
							
				//Subsidiary Logo(Forms)
				if(request.getFile('custpage_subsidiary_logo_forms')) {
					var recFile_subsidiaryFormLogo = request.getFile('custpage_subsidiary_logo_forms');
										
					//recFile_subsidiaryFormLogo.setName('subsidiary_logo_forms.jpg');
					recFile_subsidiaryFormLogo.setName('subsidiary_' + resSubsidiaryName + '_logo_forms.jpg');
					recFile_subsidiaryFormLogo.setIsOnline(true);
					recFile_subsidiaryFormLogo.setFolder(-4); //Images folder - this is present to all dataset with the same folder internalid
					
					var idFile_subsidiaryFormLogo = nlapiSubmitFile(recFile_subsidiaryFormLogo);
					nlapiSubmitField('subsidiary', sSubsidiary, 'logo', idFile_subsidiaryFormLogo);
				}
				
				//Subsidiary Logo(Pages)
				if(request.getFile('custpage_subsidiary_logo_pages')) {
					var recFile_subsidiaryPageLogo = request.getFile('custpage_subsidiary_logo_pages');
										
					recFile_subsidiaryPageLogo.setName('subsidiary_' + resSubsidiaryName + '_logo_pages.jpg');
					//recFile_subsidiaryPageLogo.setName('subsidiary_logo_pages.jpg');
					recFile_subsidiaryPageLogo.setIsOnline(true);
					recFile_subsidiaryPageLogo.setFolder(-4); //Images folder - this is present to all dataset with the same folder internalid
					
					var idFile_subsidiaryPageLogo = nlapiSubmitFile(recFile_subsidiaryPageLogo);
					nlapiSubmitField('subsidiary', sSubsidiary, 'pagelogo', idFile_subsidiaryPageLogo);
				}
				
				var sSubsidiaryInactive = request.getParameter('custpage_subsidiary_inactive');
				nlapiLogExecution('DEBUG', '-----sSubsidiaryInactive-----', sSubsidiaryInactive);
				nlapiSubmitField('subsidiary', sSubsidiary, 'isinactive', sSubsidiaryInactive);
				
			}
		}

		 
		//Location
		var sLocation = request.getParameter('custpage_location');
		nlapiLogExecution('DEBUG', '-----sLocation-----', sLocation);
		if(sLocation){
			var sLocationName = request.getParameter('custpage_location_name');
			nlapiLogExecution('DEBUG', '-----sLocationName-----', sLocationName);
			if(sLocationName){
				var nameLocation = nlapiLookupField('location', sLocation, 'name');
				nlapiLogExecution('DEBUG', '-----nameLocation-----', nameLocation);
				if(sLocationName != nameLocation){
					nlapiSubmitField('location', sLocation, 'name', sLocationName);
				}
			}
			
			var sLocationInactive = request.getParameter('custpage_location_inactive');
			nlapiLogExecution('DEBUG', '-----sLocationInactive-----', sLocationInactive);
			nlapiSubmitField('location', sLocation, 'isinactive', sLocationInactive);
		}
		
		/*Not supported by scripting
		//Project Template
		var sProjectTemplate = request.getParameter('custpage_project_template');
		nlapiLogExecution('DEBUG', '-----sProjectTemplate-----', sProjectTemplate);
		if(sProjectTemplate){
			var sProjectTemplateName = request.getParameter('custpage_project_template_name');
			nlapiLogExecution('DEBUG', '-----sProjectTemplateName-----', sProjectTemplateName);
			if(sProjectTemplateName){
				var nameProjectTemplate = nlapiLookupField('projecttemplate', sProjectTemplate, 'entityid');
				nlapiLogExecution('DEBUG', '-----nameProjectTemplate-----', nameProjectTemplate);
				if(sProjectTemplateName != nameProjectTemplate){
					nlapiSubmitField('projecttemplate', sProjectTemplate, 'entityid', sProjectTemplateName);
				}
			}
		}
		*/

                //Class
		var sClass = request.getParameter('custpage_class');
		nlapiLogExecution('DEBUG', '-----sClass-----', sClass);
		if(sClass){
			var sClassName = request.getParameter('custpage_class_name');
			nlapiLogExecution('DEBUG', '-----sClassName-----', sClassName);
			if(sClassName){
				var nameClass = nlapiLookupField('classification', sClass, 'name');
				nlapiLogExecution('DEBUG', '-----nameClass-----', nameClass);
				if(sClassName != nameClass){
					nlapiSubmitField('classification', sClass, 'name', sClassName);
				}
			}
			
			var sClassInactive = request.getParameter('custpage_class_inactive');
			nlapiLogExecution('DEBUG', '-----sClassInactive-----', sClassInactive);
			nlapiSubmitField('classification', sClass, 'isinactive', sClassInactive);
		}
		
		nlapiSubmitConfiguration(recCompanyInformation);
		nlapiSetRedirectURL('SUITELET', 'customscript_fmt_data_wizard_sl', 'customdeploy_fmt_data_wizard_sl');
		
	} else {
		
		var form = nlapiCreateForm('Data Wizard', false);
		form.setScript('customscript_fmt_data_wizard_cs');
	
				
		//-------------------------------------------------------------------------------------------------------Company
		var fldCompanyData = form.addField('custpage_cdata_hdr', 'inlinehtml', '');
		var companyDataHdr = "<br /><h2 style=\"font-size:14px;\">Company</h2>";    
		fldCompanyData.setDefaultValue(companyDataHdr);    
		    
		var fldCompanyName = form.addField('custpage_company_name', 'text', 'Company Name').setBreakType('startrow').setLayoutType('startrow');
		fldCompanyName.setDisplaySize(50);
		fldCompanyName.setMaxLength(80);
		var recCompanyInformation = nlapiLoadConfiguration('companyinformation');
		fldCompanyName.setDefaultValue(recCompanyInformation.getFieldValue('companyname'));
	    
		//Select your company logo to show on printed and emailed transaction forms.
		var fldLogoForms = form.addField('custpage_logo_forms', 'file', 'New Company Logo(Forms)').setBreakType('startrow').setLayoutType('startrow');
		
		//Select a company logo to show on the pages of your Customer, Partner, and Vendor Centers.
		var fldLogoPages = form.addField('custpage_logo_pages', 'file', 'New Company Logo(Pages)').setBreakType('startrow').setLayoutType('startrow');
	
		var fldSpace1 = form.addField('custpage_space1', 'inlinehtml', '').setBreakType('startrow').setLayoutType('startrow');
		var fldSpace2 = form.addField('custpage_space2', 'inlinehtml', '').setBreakType('startrow').setLayoutType('startrow');
		
		//-------------------------------------------------------------------------------------------------------Subsidiary
		 var ctxSubsidiary = nlapiGetContext().getFeature('SUBSIDIARIES');   
		 nlapiLogExecution('DEBUG', '-----ctxSubsidiary_GET-----', 'ctxSubsidiary=' + ctxSubsidiary);
		 if(ctxSubsidiary == true){
			
			 var fldSubsidiaryData = form.addField('custpage_sdata_hdr', 'inlinehtml', '');
			 var subsidiaryDataHdr = "<br /><h2 style=\"font-size:14px;\">Subsidiary</h2>";    
			 fldSubsidiaryData.setDefaultValue(subsidiaryDataHdr);    
								
			 var fldSubsidiary = form.addField('custpage_subsidiary', 'select', 'Select subsidiary to update', 'subsidiary').setBreakType('startrow').setLayoutType('startrow');
			 //fldSubsidiary.setDisplaySize(40);
			 var fldSubsidiaryName = form.addField('custpage_subsidiary_name', 'text', 'Subsidiary Name').setBreakType('startrow').setLayoutType('startrow');
			 fldSubsidiaryName.setDisplaySize(40);
			 fldSubsidiaryName.setMaxLength(80);
			
			 //Select a subsidiary logo(Forms)
			 var fldSubsidiaryLogoForms = form.addField('custpage_subsidiary_logo_forms', 'file', 'New Subsidiary Logo(Forms)').setBreakType('startrow').setLayoutType('startrow');
			 
			 //Select a subsidiary logo(Pages)
			 var fldSubsidiaryLogoPages = form.addField('custpage_subsidiary_logo_pages', 'file', 'New Subsidiary Logo(Pages)').setBreakType('startrow').setLayoutType('startrow');
			 
			 //Set Subsidiary to Inactive
			 var fldSubsidiaryInactive = form.addField('custpage_subsidiary_inactive', 'checkbox', 'Set Subsidiary to Inactive').setBreakType('startrow').setLayoutType('startrow');
			 
			 var fldSpace3 = form.addField('custpage_space3', 'inlinehtml', '').setBreakType('startrow').setLayoutType('startrow');
			 var fldSpace4 = form.addField('custpage_space4', 'inlinehtml', '').setBreakType('startrow').setLayoutType('startrow');
			 var fldSpace5 = form.addField('custpage_space5', 'inlinehtml', '').setBreakType('startrow').setLayoutType('startrow');
			 var fldSpace6 = form.addField('custpage_space6', 'inlinehtml', '').setBreakType('startrow').setLayoutType('startrow');
			 var fldSpace7 = form.addField('custpage_space7', 'inlinehtml', '').setBreakType('startrow').setLayoutType('startrow');
		 }
	
		 
		 //<<--
		 //Moded by: Mark J.
		 //-->>
		 form.addField('cstfld_dw_banner', 'inlinehtml').setLayoutType('outsideabove', 'startcol').setDefaultValue('<div id="data_wizard_banner"></div>');
		 form.addField('custfld_reload_flag', 'text').setDisplayType('hidden').setDefaultValue('100');
		 //<<--
		 //Moded by: Mark J.
		 //-->>
		        
		//-------------------------------------------------------------------------------------------------------Customer
		//Add customer tab.
		var customerTab = form.addTab('customertab', 'Customer');
		
		//Add a field group to the customer tab and align all field group fields in a single column
		var fieldGroupCustomer = form.addFieldGroup('customerinfo', 'Customer', 'customertab').setCollapsible(true, false);
		fieldGroupCustomer.setSingleColumn(true);
			
		//Add fields to the customer field group.
		var fldCustomer = form.addField('custpage_customer', 'select', 'Select customer to update', 'customer', 'customerinfo').setBreakType('startrow').setLayoutType('startrow');
		//fldCustomer.setDisplaySize(38);
		
		var fldCustomerTypeLabel = form.addField('custpage_customer_type_label', 'label', 'Type', null, 'customerinfo').setBreakType('startrow').setLayoutType('startrow');
		var fldCustomerType = form.addField('custpage_customer_type', 'text', '', null, 'customerinfo').setBreakType('startrow').setLayoutType('startrow');
		fldCustomerType.setDisplaySize(45);
		fldCustomerType.setDisplayType('inline');
					
		//Customer type is company
		var fldCustomerName = form.addField('custpage_customer_name', 'text', 'Company Name', null, 'customerinfo').setBreakType('startrow').setLayoutType('startrow');
		fldCustomerName.setDisplaySize(45);
		fldCustomerName.setMaxLength(80);
		
		//Customer type is individual
		var fldCustomerFirstName = form.addField('custpage_customer_firstname', 'text', 'First Name', null, 'customerinfo').setBreakType('startrow').setLayoutType('startrow');
		fldCustomerFirstName.setDisplaySize(45);
		fldCustomerFirstName.setMaxLength(30);
		var fldCustomerMiddleName = form.addField('custpage_customer_middlename', 'text', 'Middle Name', null, 'customerinfo').setBreakType('startrow').setLayoutType('startrow');
		fldCustomerMiddleName.setDisplaySize(45);
		fldCustomerMiddleName.setMaxLength(20);
		var fldCustomerLastName = form.addField('custpage_customer_lastname', 'text', 'Last Name', null, 'customerinfo').setBreakType('startrow').setLayoutType('startrow');
		fldCustomerLastName.setDisplaySize(45);
		fldCustomerLastName.setMaxLength(30);
	      
		var fldCustomerInactive = form.addField('custpage_customer_inactive', 'checkbox', 'Set Customer to Inactive', null, 'customerinfo').setBreakType('startrow').setLayoutType('startrow');
		
		//-------------------------------------------------------------------------------------------------------Item
		var itemTab = form.addTab('itemtab', 'Item');
	    
		var fieldGroupItem = form.addFieldGroup("iteminfo", 'Item','itemtab');
		fieldGroupItem.setSingleColumn(true);
	
		var fldBack = form.addField('custpage_back_cash_sale', 'inlinehtml', '', null, 'iteminfo');  
		var stBack = '<p style="font-size: 14px; margin: 5px 0;">If you wish to update more than one item, please click <a target="_blank" href=https://system.na1.netsuite.com//app/site/hosting/scriptlet.nl?script=customscript_item_mass_updater_sl&deploy=customdeploy_item_mass_updater_sl style="color: #2d29b6"><b>here</b></a>.</p>';
		fldBack.setDefaultValue(stBack);
	
		var fldItem =  form.addField('custpage_item', 'select', 'Select item to update', 'item', 'iteminfo').setBreakType('startrow').setLayoutType('startrow');
				
		var fldItemName = form.addField('custpage_item_name', 'text', 'Item Name', null, 'iteminfo').setBreakType('startrow').setLayoutType('startrow');
		fldItemName.setDisplaySize(45);
		fldItemName.setMaxLength(60);
		var fldItemDescription = form.addField('custpage_item_description', 'textarea', 'Item Description', null, 'iteminfo').setBreakType('startrow').setLayoutType('startrow');
		fldItemDescription.setDisplaySize(45);
		var fldItemDisplayName = form.addField('custpage_item_displayname', 'text', 'Item Display Name', null, 'iteminfo').setBreakType('startrow').setLayoutType('startrow');
		fldItemDisplayName.setDisplaySize(45);
		fldItemDisplayName.setMaxLength(60);
		
		var fldItemInactive = form.addField('custpage_item_inactive', 'checkbox', 'Set Item to Inactive', null, 'iteminfo').setBreakType('startrow').setLayoutType('startrow');
		
		
		//-------------------------------------------------------------------------------------------------------Employee
		var employeeTab = form.addTab('employeetab', 'Employee');
		    
		var fieldGroupEmployee = form.addFieldGroup('employeeinfo', 'Employee','employeetab');
		fieldGroupEmployee.setSingleColumn(true);
			
		var fldEmployee = form.addField('custpage_employee','select', 'Select employee to update', 'employee', 'employeeinfo').setBreakType('startrow').setLayoutType('startrow');
		var fldEmployeeFirstname = form.addField('custpage_employee_firstname', 'text', 'First Name', null, 'employeeinfo').setBreakType('startrow').setLayoutType('startrow');
		fldEmployeeFirstname.setDisplaySize(45);
		fldEmployeeFirstname.setMaxLength(30);
		var fldEmployeeMiddlename = form.addField('custpage_employee_middlename', 'text', 'Middle Name', null, 'employeeinfo').setBreakType('startrow').setLayoutType('startrow');
		fldEmployeeMiddlename.setDisplaySize(45);
		fldEmployeeMiddlename.setMaxLength(20);
		var fldEmployeeLastname = form.addField('custpage_employee_lastname', 'text', 'Last Name', null, 'employeeinfo').setBreakType('startrow').setLayoutType('startrow');
		fldEmployeeLastname.setDisplaySize(45);	
		fldEmployeeLastname.setMaxLength(30);
		
		var fldEmployeeInactive = form.addField('custpage_employee_inactive', 'checkbox', 'Set Employee to Inactive', null, 'employeeinfo').setBreakType('startrow').setLayoutType('startrow');
	
		//-------------------------------------------------------------------------------------------------------Vendor
		var vendorTab = form.addTab('vendortab', 'Vendor');
	   
		var fieldGroupVendor = form.addFieldGroup('vendorinfo', 'Vendor','vendortab');
		fieldGroupVendor.setSingleColumn(true);
			
		var fldVendor = form.addField('custpage_vendor', 'select', 'Select vendor to update', 'vendor', 'vendorinfo').setBreakType('startrow').setLayoutType('startrow');
		
		var fldVendorTypeLabel = form.addField('custpage_vendor_type_label', 'label', 'Type', null, 'vendorinfo').setBreakType('startrow').setLayoutType('startrow');
		var fldVendorType = form.addField('custpage_vendor_type', 'text', '', null, 'vendorinfo').setBreakType('startrow').setLayoutType('startrow');
		fldVendorType.setDisplaySize(45);
		fldVendorType.setDisplayType('inline');
		
		//Vendor type is company
		var fldVendorName = form.addField('custpage_vendor_name', 'text', 'Vendor Name', null, 'vendorinfo').setBreakType('startrow').setLayoutType('startrow');
		fldVendorName.setDisplaySize(45);
		fldVendorName.setMaxLength(80);
	    
	    //Vendor type is individual
	    var fldVendorFirstName = form.addField('custpage_vendor_firstname', 'text', 'First Name', null, 'vendorinfo').setBreakType('startrow').setLayoutType('startrow');
	    fldVendorFirstName.setDisplaySize(45);
	    fldVendorFirstName.setMaxLength(30);
	    var fldVendorMiddleName = form.addField('custpage_vendor_middlename', 'text', 'Middle Name', null, 'vendorinfo').setBreakType('startrow').setLayoutType('startrow');
	    fldVendorMiddleName.setDisplaySize(45);
	    fldVendorMiddleName.setMaxLength(20);
	    var fldVendorLastName = form.addField('custpage_vendor_lastname', 'text', 'Last Name', null, 'vendorinfo').setBreakType('startrow').setLayoutType('startrow');
	    fldVendorLastName.setDisplaySize(45);
	    fldVendorLastName.setMaxLength(30);
	    
	    //Set Vendor to Inactive
		 var fldVendorInactive = form.addField('custpage_vendor_inactive', 'checkbox', 'Set Vendor to Inactive', null, 'vendorinfo').setBreakType('startrow').setLayoutType('startrow');
	    
		//-------------------------------------------------------------------------------------------------------Subsidiary
	    /*
		var subsidiaryTab = form.addTab('subsidiarytab', 'Subsidiary');
	    
		var fieldGroupSubsidiary = form.addFieldGroup('subsidiaryinfo', 'Subsidiary', 'subsidiarytab');
		fieldGroupSubsidiary.setSingleColumn(true);
		
		var fldSubsidiary = form.addField('custpage_subsidiary', 'select', 'Select subsidiary to update', 'subsidiary', 'subsidiaryinfo').setBreakType('startrow').setLayoutType('startrow');
		//fldSubsidiary.setDisplaySize(40);
		var fldSubsidiaryName = form.addField('custpage_subsidiary_name', 'text', 'Subsidiary Name', null, 'subsidiaryinfo').setBreakType('startrow').setLayoutType('startrow');
		fldSubsidiaryName.setDisplaySize(40);
		fldSubsidiaryName.setMaxLength(80);
		
		//Select a subsidiary logo(Pages)
		//var fldSubsidiaryLogoPages = form.addField('custpage_subsidiary_logo_pages', 'file', 'New Subsidiary Logo(Pages)', null, 'subsidiaryinfo');
		
		//Select a subsidiary logo(Forms)
		//var fldSubsidiaryLogoForms = form.addField('custpage_subsidiary_logo_forms', 'file', 'New Subsidiary Logo(Forms)', null, 'subsidiaryinfo').setBreakType('startrow').setLayoutType('startrow');
		*/
	 
		
		//-------------------------------------------------------------------------------------------------------Location
		var locationTab = form.addTab('locationtab', 'Location');
	    
		var fieldGroupLocation = form.addFieldGroup('locationinfo', 'Location', 'locationtab');
		fieldGroupLocation.setSingleColumn(true);
		
		var fldLocation = form.addField('custpage_location', 'select', 'Select location to update', 'location', 'locationinfo').setBreakType('startrow').setLayoutType('startrow');
		//fldLocation.setDisplaySize(40);
		var fldLocationName = form.addField('custpage_location_name', 'text', 'Location Name', null, 'locationinfo').setBreakType('startrow').setLayoutType('startrow');
		fldLocationName.setDisplaySize(30);
		fldLocationName.setMaxLength(30);
		
		 //Set Location to Inactive
		 var fldLocationInactive = form.addField('custpage_location_inactive', 'checkbox', 'Set Location to Inactive', null, 'locationinfo').setBreakType('startrow').setLayoutType('startrow');
		 
		/*Not yet supported by scripting
		//-------------------------------------------------------------------------------------------------------Project Template
		var ProjectTemplateTab = form.addTab('projecttemplatetab', 'Project Template');
	    
		var fieldGroupProjectTemplate = form.addFieldGroup('projecttemplateinfo', 'Project Template', 'projecttemplatetab');
		fieldGroupProjectTemplate.setSingleColumn(true);
		
		var fldProjectTemplate = form.addField('custpage_project_template', 'select', 'Select project template to update', 'projecttemplate', 'projecttemplateinfo').setBreakType('startrow').setLayoutType('startrow');
		var fldProjectTemplateName = form.addField('custpage_project_template_name', 'text', 'Project Template Name', null, 'projecttemplateinfo').setBreakType('startrow').setLayoutType('startrow');
		fldProjectTemplateName.setDisplaySize(21);
		*/

	        //-------------------------------------------------------------------------------------------------------Class
		 var classTab = form.addTab('classtab', 'Class');
		 
		 var fieldGroupClass = form.addFieldGroup('classinfo', 'Class', 'classtab');
		 fieldGroupClass.setSingleColumn(true);
			
		 var fldClass = form.addField('custpage_class', 'select', 'Select class to update', 'classification', 'classinfo').setBreakType('startrow').setLayoutType('startrow');
		 var fldClassName = form.addField('custpage_class_name', 'text', 'Class Name', null, 'classinfo').setBreakType('startrow').setLayoutType('startrow');
		 fldClassName.setDisplaySize(30);
		 fldClassName.setMaxLength(30);
			
		 //Set Class to Inactive
		 var fldClassInactive = form.addField('custpage_class_inactive', 'checkbox', 'Set Class to Inactive', null, 'classinfo').setBreakType('startrow').setLayoutType('startrow');
		
	    form.addSubmitButton('Update');
	    response.writePage(form);
	}
}

function getItemType(idItem) {
	var aFilter = new Array();
	aFilter.push(new nlobjSearchFilter('internalid',null,'is',idItem));
	var aResult = nlapiSearchRecord('item',null,aFilter,[new nlobjSearchColumn('externalid')]);
	
	if(aResult != null) {
		return aResult[0].getRecordType();
	}
	
	return null;
}

function getName(strItemName) {       
    var indxColon = strItemName.lastIndexOf(':');
    //alert('indxColon=' + indxColon);
    var strName;
    if(indxColon != '-1'){
    	 strName = strItemName.substring(indxColon + 2);  
    	 nlapiLogExecution('DEBUG', '@ getName', strName);
    }else{
    	 strName = strItemName;
    }
    return strName;
}