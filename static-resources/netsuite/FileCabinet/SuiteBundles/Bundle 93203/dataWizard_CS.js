/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Mar 2015     fteves
 *
 */
{
	var CONFIG={
		ITEM_UPDATE_MANAGER_AJAX_SCRIPT: 'customscript_item_mass_updater_ajax',
		ITEM_UPDATE_MANAGER_AJAX_DEPLOY: 'customdeploy_item_mass_updater_ajax',
		banner: 'data_wizard_banner',
		img_loader: 'ajax-loader.gif',
		btn_submit: 'submitter',
		reload_flag: 'custfld_reload_flag',
	};
}
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */

function dataWizard_FieldChanged(type, name, linenum){
	//Customer
	if(name == 'custpage_customer') {
		if(nlapiGetFieldValue('custpage_customer')) {
			var sCustomerType = nlapiLookupField('customer', nlapiGetFieldValue('custpage_customer'), 'isperson');
			if(sCustomerType == 'T'){
				nlapiSetFieldValue('custpage_customer_type', 'Individual');
							
				nlapiDisableField('custpage_customer_firstname', false);
				nlapiDisableField('custpage_customer_middlename', false);
				nlapiDisableField('custpage_customer_lastname', false);
				nlapiDisableField('custpage_customer_name', true);
				
				var sFirstName = nlapiLookupField('customer', nlapiGetFieldValue('custpage_customer'), 'firstname');
				var sMiddleName = nlapiLookupField('customer', nlapiGetFieldValue('custpage_customer'), 'middlename');
				var sLastName = nlapiLookupField('customer', nlapiGetFieldValue('custpage_customer'), 'lastname');
				nlapiSetFieldValue('custpage_customer_firstname',sFirstName);
				nlapiSetFieldValue('custpage_customer_middlename',sMiddleName);
				nlapiSetFieldValue('custpage_customer_lastname',sLastName);
				nlapiSetFieldValue('custpage_customer_name', '');
			}else{
				nlapiSetFieldValue('custpage_customer_type', 'Company');
								
				nlapiDisableField('custpage_customer_firstname', true);
				nlapiDisableField('custpage_customer_middlename', true);
				nlapiDisableField('custpage_customer_lastname', true);
				nlapiDisableField('custpage_customer_name', false);
				
				var sName = nlapiLookupField('customer', nlapiGetFieldValue('custpage_customer'), 'companyname');
				nlapiSetFieldValue('custpage_customer_name', sName);
			}
		}
	}
	
	//Item
	if(name == 'custpage_item') {
		//alert('custpage_item=' + nlapiGetFieldValue('custpage_item'));
		var idItem = nlapiGetFieldValue('custpage_item');
		if(idItem){
			var itemType = nlapiLookupField('item', idItem, 'type');
			//alert('itemType=' + itemType);
			if(itemType != null){
				nlapiDisableField('custpage_item_name', false);
				nlapiDisableField('custpage_item_description', false);
				nlapiDisableField('custpage_item_displayname', false);
				//if(idItem != '-1'){
					var sItemName = nlapiLookupField('item', nlapiGetFieldValue('custpage_item'), 'itemid');
					if(sItemName){
						nlapiSetFieldValue('custpage_item_name', getName(sItemName));
					}else{
						nlapiSetFieldValue('custpage_item_name', '');
					}
					
					var sItemDescription = nlapiLookupField('item', nlapiGetFieldValue('custpage_item'), 'salesdescription');
					if(sItemDescription){
						nlapiSetFieldValue('custpage_item_description', sItemDescription);
					}else{
						nlapiSetFieldValue('custpage_item_description', '');
					}
						    		
					var sItemDisplayName = nlapiLookupField('item', nlapiGetFieldValue('custpage_item'), 'displayname');
					if(sItemDisplayName){
						nlapiSetFieldValue('custpage_item_displayname', getName(sItemDisplayName));
					}else{
						nlapiSetFieldValue('custpage_item_displayname', '');
					}
				//}else{
				//	nlapiSetFieldValue('custpage_item_name', '');
				//	nlapiSetFieldValue('custpage_item_description', '');
				//	nlapiSetFieldValue('custpage_item_displayname', '');
				//}
			}else{
				alert('The item is not available to update.');
				
				nlapiSetFieldValue('custpage_item_name', '');
				nlapiSetFieldValue('custpage_item_description', '');
				nlapiSetFieldValue('custpage_item_displayname', '');
				
				nlapiDisableField('custpage_item_name', true);
				nlapiDisableField('custpage_item_description', true);
				nlapiDisableField('custpage_item_displayname', true);
			
			}
		}
		
	} 
	
	//Vendor
	if(name == 'custpage_vendor') {
		if(nlapiGetFieldValue('custpage_vendor')) {
			var sVendorType = nlapiLookupField('vendor', nlapiGetFieldValue('custpage_vendor'), 'isperson');
			if(sVendorType == 'T'){
				nlapiSetFieldValue('custpage_vendor_type', 'Individual');
							
				nlapiDisableField('custpage_vendor_firstname', false);
				nlapiDisableField('custpage_vendor_middlename', false);
				nlapiDisableField('custpage_vendor_lastname', false);
				nlapiDisableField('custpage_vendor_name', true);
				
				var sFirstName = nlapiLookupField('vendor', nlapiGetFieldValue('custpage_vendor'), 'firstname');
				var sMiddleName = nlapiLookupField('vendor', nlapiGetFieldValue('custpage_vendor'), 'middlename');
				var sLastName = nlapiLookupField('vendor', nlapiGetFieldValue('custpage_vendor'), 'lastname');
				nlapiSetFieldValue('custpage_vendor_firstname',sFirstName);
				nlapiSetFieldValue('custpage_vendor_middlename',sMiddleName);
				nlapiSetFieldValue('custpage_vendor_lastname',sLastName);
				nlapiSetFieldValue('custpage_vendor_name', '');
			}else{
				nlapiSetFieldValue('custpage_vendor_type', 'Company');
								
				nlapiDisableField('custpage_vendor_firstname', true);
				nlapiDisableField('custpage_vendor_middlename', true);
				nlapiDisableField('custpage_vendor_lastname', true);
				nlapiDisableField('custpage_vendor_name', false);
				
				var sName = nlapiLookupField('vendor', nlapiGetFieldValue('custpage_vendor'), 'companyname');
				nlapiSetFieldValue('custpage_vendor_name', sName);
			}
		}
	}
	 
	//Employee
	if(name == 'custpage_employee') {
		if(nlapiGetFieldValue('custpage_employee')) {
			var sFirstName = nlapiLookupField('employee', nlapiGetFieldValue('custpage_employee'), 'firstname');
			nlapiSetFieldValue('custpage_employee_firstname', sFirstName);
	    		
			var sMiddleName = nlapiLookupField('employee', nlapiGetFieldValue('custpage_employee'), 'middlename');
			nlapiSetFieldValue('custpage_employee_middlename', sMiddleName);
	    		
			var sLastName = nlapiLookupField('employee', nlapiGetFieldValue('custpage_employee'), 'lastname');
			nlapiSetFieldValue('custpage_employee_lastname', sLastName);
		}
	}   
	
	//Subsidiary
	if(name == 'custpage_subsidiary'){
		if(nlapiGetFieldValue('custpage_subsidiary')) {
			var sSubsidiaryName = nlapiLookupField('subsidiary', nlapiGetFieldValue('custpage_subsidiary'), 'name');
			//alert('sSubsidiaryName=' + sSubsidiaryName);
			nlapiSetFieldValue('custpage_subsidiary_name', getName(sSubsidiaryName));
			
			//var sSubsidiaryInactive = nlapiLookupField('subsidiary', nlapiGetFieldValue('custpage_subsidiary'), 'isinactive');
			//nlapiSetFieldValue('custpage_subsidiary_inactive', sSubsidiaryInactive);
		}
	}
	
	//Location
	if(name == 'custpage_location'){
		if(nlapiGetFieldValue('custpage_location')) {
			var sLocationName = nlapiLookupField('location', nlapiGetFieldValue('custpage_location'), 'name');
			nlapiSetFieldValue('custpage_location_name', getName(sLocationName));
		}
	}
	
	/*Not yet supported by scripting
	//Project template
	if(name == 'custpage_project_template'){
		if(nlapiGetFieldValue('custpage_project_template')) {
			var sProjectTemplateName = nlapiLookupField('projecttemplate', nlapiGetFieldValue('custpage_project_template'), 'entityid');
			nlapiSetFieldValue('custpage_project_template_name', sProjectTemplateName);
		}
	}
	*/

        //Class
	if(name == 'custpage_class'){
		if(nlapiGetFieldValue('custpage_class')) {
			var sClassName = nlapiLookupField('classification', nlapiGetFieldValue('custpage_class'), 'name');
			nlapiSetFieldValue('custpage_class_name', getName(sClassName));
		}
	}
	
}

function dataWizard_SaveRecord(){
	var idItem = nlapiGetFieldValue('custpage_item');
	var item_name=nlapiGetFieldValue('custpage_item_name');
	var reload_flag=nlapiGetFieldValue(CONFIG.reload_flag);
	//if(idItem && item_name!=''){
	//<<
	//Reload after ajax requested has been completed.
	//>>
	if (reload_flag=='200') {
		return true;
	}
	nlapiSetFieldValue(CONFIG.reload_flag, '200');
	//Banner
	var elem=document.getElementById(CONFIG.banner);
	if (elem) {
		elem.innerHTML='<p style="margin: 5px 0; font-size: 14px; text-align: left; color: #CD4B4B;"><span style="display: inline-block; width: 20px; height: 20px; text-align: center; font-weight: bold; background-color: #CD4B4B; border-radius: 10px; color: #FFF; margin-right: 5px;">!</span>Warning: Records are being processed. Please do not leave or reload this page until processing is finished.</p>';
	}
	if(idItem && item_name!=''){
		//Item Fields
		var item_desc=nlapiGetFieldValue('custpage_item_description');
		var item_display=nlapiGetFieldValue('custpage_item_displayname');
		//Request URL
		var ajax_url=nlapiResolveURL('SUITELET', CONFIG.ITEM_UPDATE_MANAGER_AJAX_SCRIPT, CONFIG.ITEM_UPDATE_MANAGER_AJAX_DEPLOY);
		ajax_url+='&field_list=itemid,displayname,salesdescription&field_vals='+item_name+','+item_display+','+item_desc;
		//IMAGE URL
		var img_loader=getFileURL(CONFIG.img_loader);
		//SUBMIT BUTTON
		var btn_submit=document.getElementById(CONFIG.btn_submit);
		//AJAX SERVER
		var ajax_server=null;
		if (window.XMLHttpRequest) {
			ajax_server=new XMLHttpRequest();
		}
		else {
			ajax_server=new ActiveXObject('Microsoft.XMLHTTP');
		}
		ajax_server.open('POST', ajax_url+'&item_id='+idItem, true);
		ajax_server.send();
		ajax_server.onreadystatechange=function() {
			if (ajax_server.readyState==4 && ajax_server.status==200) {
				var data_json=JSON.parse(ajax_server.responseText);
				ajax_server.abort();
				if (data_json.status==1) {
					//Record has been updated successfully.
					if (data_json.is_matrix=='true' && data_json.child_item!=null && (data_json.item_name!='' || data_json.display_name!='')) {
						var item=data_json.item_name!=''?data_json.item_name:data_json.display_name;
						if (confirm(item+' is a matrix item. Do you also want to update its matrix subitems?')) {
							var child_item=data_json.child_item.split(',');
							//No child available
							if (child_item.length<1) {
								alert('There is no existing matrix subitems related to this item.');
								return true;
							}
							//Child is available
							var success_ctr=0;
							if (data_json.item_name!='') {
								ajax_url+='&item_name='+data_json.item_name;
							}
							if (data_json.display_name!='') {
								ajax_url+='&display_name='+data_json.display_name;
							}
						
							if (elem) {
								elem.innerHTML='<p style="font-size: 14px; text-align: left; color: #CD4B4B; margin: 5px 0;"><img style="margin-right: 10px;" title="Update is in progress." src="'+img_loader+'" />Updating is in progress. Please do not reload the page.</p>';
							}
							
							updateMatrix(ajax_url, idItem, child_item, 0, btn_submit);
							
						}
						else {
							//Matrix item has only been updated
							//Reloading page
							btn_submit.click();
						}
					}
					else {
						btn_submit.click();
					}
				}
			}
		};
		//var data_obj=nlapiRequestURL(ajax_url+'&item_id='+idItem);
		//var data_json=JSON.parse(data_obj.body);
		//if (data_json.status==1) {
		//	if (data_json.is_matrix=='true' && data_json.child_item!=null) {
		//		if (confirm(item_name+' is a matrix item. Do you also want to update its matrix subitems?')) {
		//			window.status='Updating matrix subitems.';
		//			
		//			var child_item=data_json.child_item.split(',');
		//			if (child_item.length<1) {
		//				alert('There is no existing matrix subitems attached to this item.');
		//				return true;
		//			}
		//			var success_ctr=0;
		//			if (data_json.item_name!='') {
		//				ajax_url+='&item_name='+data_json.item_name;
		//			}
		//			if (data_json.display_name!='') {
		//				ajax_url+='&display_name='+data_json.display_name;
		//			}
		//			
		//			if (elem) {
		//				elem.innerHTML='<p style="margin: 5px 0; font-size: 14px; text-align: left; color: #6D8C1E;"><span style="display: inline-block; width: 20px; height: 20px; text-align: center; font-weight: bold; background-color: #6D8C1E; border-radius: 10px; color: #FFF; margin-right: 5px;">i</span>'+child_item.length+' matrix subitem(s) is updating in progress.</p>';
		//			}
		//			
		//			for (var i=0;child_item && i<child_item.length;i++) {
		//				data_obj=nlapiRequestURL(ajax_url, {"matrix_item_id": child_item[i], "parent_item_id": idItem});
		//				data_json=JSON.parse(data_obj.body);
		//				if (data_json.status==1) {
		//					window.status='Updating '+(i+1)+' of '+child_item.length+' matrix subitems.';
		//					success_ctr++;
		//				}
		//			}
		//			
		//			//alert(success_ctr+' out of '+child_item.length+' matrix subitems have been updated suceessfully.');
		//		}
		//	}
		//}
		//else {
		//	alert('Unable to update item. Please try again.');
		//}
		//return false;
		//<<--
		//Moded by Mark J.
		//-->>
		
		//<<---
		//Moded by Mark J.
		//--->>
		return false;
	}
    return true;
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


function getFileURL(filename) {
	var file=nlapiSearchGlobal('file:'+filename);
	if (file!=null && file!='' && filename.length>0) {
		return nlapiLookupField('file', file[0].getId(), 'url');
	}
	return '';
}

function updateMatrix(url, parent_id, child_id, index, elem) {
	var ajax_server=null;
	if (window.XMLHttpRequest) {
		ajax_server=new XMLHttpRequest();
	}
	else {
		ajax_server=new ActiveXObject('Microsoft.XMLHTTP');
	}
	ajax_server.open('POST', url+'&matrix_item_id='+child_id[index]+'&parent_item_id='+parent_id);
	ajax_server.send();
	ajax_server.onreadystatechange=function() {
		if (ajax_server.readyState==4 && ajax_server.status==200) {
			var data_json=JSON.parse(ajax_server.responseText);
			//Ignore status
			//Just go on :)
			if (index<child_id.length) {
				updateMatrix(url, parent_id, child_id, index+1, elem);
			}
			else {
				elem.click();
			}
		}
	};
}