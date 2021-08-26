
/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       29 Apr 2015     mdeasis
 *
 */

{
	var CONFIG={
		title: 'Item Update Manager',
		//Fields
		fld_csv_mode: 'custfld_csv_mode',
		fld_mode_create_template: 'custfld_create_template',
		fld_mode_execute_template: 'custfld_execute_template',
		fld_update_dashboard: 'custfld_update_dashboard_val',
		list_item_update: 'custlst_item_update',
		fld_update_ctr: 'custfld_update_ctr',
		fld_item_list: 'custfld_item_list',
		fld_selector_fields: 'custfld_select_all',
		fld_item_fields: 'custfld_item_fields',
		//AJAX
		ajax_script: 'customscript_item_mass_updater_ajax',
		ajax_deploy: 'customdeploy_item_mass_updater_ajax',
		//Buttons
		commit_1: 'custbtn_commit',
		commit_2: 'secondarycustbtn_commit',
		back_1: 'custbtn_back',
		back_2: 'secondarycustbtn_back',
		//Script
		script_id: 'customscript_item_mass_updater_sl',
		scrip_deploy: 'customdeploy_item_mass_updater_sl',
		//Images
		icon_success: 'ns_check.png',
		icon_error: 'ns_error.gif',
		icon_loader: 'ajax-loader.gif',
		//Matrix
		fld_matrix_count: 'custfld_matrix_count',
		//Backup
		//Backup
		fld_backup_flag: 'custfld_backup_flag',
		fld_backup_is_public: 'custfld_backup_is_public',
		fld_backup_title: 'custfld_backup_title',
		fld_backup_description: 'custfld_backup_description',
		//CSV
		csv_suitelet: 'customscript_item_mass_csv_generator',
		csv_deploy: 'customdeploy_item_mass_csv_generator',
		//Backup Manager
		backup_script: 'customscript_backup_manager',
		backup_deploy: 'customdeploy_backup_manager',
		//Backup Record
		backup_rec_type: 'customrecord_item_backup',
		backup_fld_user: 'custrecord_item_backup_user',
		backup_fld_name: 'custrecord_item_backup_title',
		backup_fld_desc: 'custrecord_item_backup_desc',
		backup_fld_public: 'custrecord_item_backup_is_public',
		backup_fld_date: 'custrecord_item_backup_date',
		//Custom Record
		rec_type: 'customrecord_csv_importer',
		rec_fld_id: 'custrecord_csv_import_fld_id',
		rec_fld_label: 'custrecord_csv_import_fld_label',
		//Item Field Selector
		item_selector_script: 'customscript_item_mass_field_selector',
		item_selector_deploy: 'customdeploy_item_mass_field_selector',
		//Item Dynamic Selector
		item_dynamic_selector_script: 'customscript_item_mass_dynamic_selector',
		item_dynamic_selector_deploy: 'customdeploy_item_mass_dynamic_selector',
		//Options
		delimiter: '%lim%',
		MAX_LIST_LIMIT: 1000,
		elem_list_counter: 'custfld_list_counter',
	};
	var ajax_server=null, ajax_url='';
	var success_ctr=0, record_ctr=0, record_size=0;
	var img_loader=null, img_success=null;
	var list_counter=0;
	
}

function itemMassField_saveRecord() {
	var rs=nlapiSearchRecord(CONFIG.rec_type, null, [new nlobjSearchFilter(CONFIG.rec_fld_id, null, 'is', nlapiGetFieldValue(CONFIG.rec_fld_id))], []);
	if (rs!=null) {
		alert('There is already a record of the same id.');
		return false;
	}
	return true;
}

function itemMass_saveRecord() {
	if (nlapiGetFieldValue(CONFIG.fld_csv_mode)=='100' &&
		nlapiGetFieldValue(CONFIG.fld_mode_create_template)=='F' &&
		nlapiGetFieldValue(CONFIG.fld_mode_execute_template)=='F') {
		alert('Please select action to perform.');
		return false;
	}
	else if (nlapiGetFieldValue(CONFIG.fld_csv_mode)=='102') {
		if (nlapiGetFieldValue(CONFIG.fld_item_fields)=='') {
			alert('Please select at least one item field.');
			return false;
		}
		return true;
	}
	else if (nlapiGetFieldValue(CONFIG.fld_csv_mode)=='103') {
		var lst_count=nlapiGetLineItemCount(CONFIG.fld_item_list);
		var counter=0;
		for (var i=1;i<=lst_count;i++) {
			if (nlapiGetLineItemValue(CONFIG.fld_item_list, 'item_select', i)=='T') {
				counter++;
			}
		}
		if (counter==0) {
			alert('Please select an item to update.');
			return false;
		}
		else if (counter>CONFIG.MAX_LIST_LIMIT) {
			alert('This tool currently support about '+CONFIG.MAX_LIST_LIMIT+' of records only.');
			return false;
		}
		return true;
	}
	else if (nlapiGetFieldValue(CONFIG.fld_csv_mode)=='202') {
		if (nlapiGetFieldValue('custfld_use_file')=='T') {
			var csv_file=nlapiGetFieldValue('custfld_csv_file');
			if (csv_file.length==0) {
				alert("Please select a csv file.");
				return false;
			}
			else if (nlapiGetFieldValue(CONFIG.fld_backup_flag)=='T' && nlapiGetFieldValue(CONFIG.fld_backup_title)=='') {
				alert("Please enter a backup name.");
				return false;
			}
		}
		else {
			var b_personal=nlapiGetFieldValue('custfld_backup_personal');
			var b_public=nlapiGetFieldValue('custfld_backup_public');
			//<<--Nov12 Bug Fix
			var backup_id=b_personal=='T'?nlapiGetFieldValue('custlist_backup_personal'):nlapiGetFieldValue('custlist_backup_public');
			if ((b_personal=='F' && b_public=='F') || backup_id=='') {
				alert("Please select a backup file.");
			}
			else {
				var backup=searchBackup(backup_id);
				if (backup!=null) {
					var backup_url=nlapiResolveURL('SUITELET', CONFIG.script_id, CONFIG.scrip_deploy)+'&custfld_csv_file='+backup.file+'&custfld_use_backup=T&custfld_csv_mode=202';
					window.location.href=backup_url;
				}
				else {
					alert("Backup file does not exist.");
				}
			}
			//Nov12 Bug Fix-->>
			return false;
		}
		//if (confirm('Do you wish to backup your existing records?')) {
		//	nlapiSetFieldValue(CONFIG.fld_csv_mode, '202');
		//}
	}
	//else if (nlapiGetFieldValue(CONFIG.fld_csv_mode)=='202') {
	//	var backup_enable=nlapiGetFieldValue(CONFIG.fld_backup_flag);
	//	if (backup_enable && backup_enable=='T') {
	//		if (nlapiGetFieldValue(CONFIG.fld_backup_title)=='') {
	//			alert('Please enter a name for the backup file.');
	//			return false;
	//		}
	//	}
	//}
	return true;
}

function searchBackup(backup_id) {
	if (backup_id==null) {
		return null;
	}
	var rs=nlapiSearchRecord(CONFIG.backup_rec_type, null, [new nlobjSearchFilter('internalid', null, 'is', backup_id)],
	                                                       [new nlobjSearchColumn(CONFIG.backup_fld_name), new nlobjSearchColumn(CONFIG.backup_fld_date),
	                                            			new nlobjSearchColumn(CONFIG.backup_fld_desc), new nlobjSearchColumn(CONFIG.backup_fld_public),
	                                            			new nlobjSearchColumn('internalid', 'file'), new nlobjSearchColumn(CONFIG.backup_fld_user)]);
	if (rs!=null && rs.length>0) {
			var result_item=[];
			result_item['id']=rs[0].getId();
			result_item['date']=rs[0].getValue(CONFIG.backup_fld_date);
			result_item['desc']=rs[0].getValue(CONFIG.backup_fld_desc);
			result_item['name']=rs[0].getValue(CONFIG.backup_fld_name);
			result_item['is_public']=rs[0].getValue(CONFIG.backup_fld_public);
			result_item['file']=rs[0].getValue('internalid', 'file');
			if (result_item['file']!=null) {
				result_item['file_link']=nlapiLookupField('file', result_item['file'], 'url');
			}
			result_item['user']=nlapiLookupField('employee', rs[0].getValue(CONFIG.backup_fld_user), 'entityid');
			return result_item;
	}
	return null;
}

function itemMass_commit() {
	var matrix_count=parseInt(nlapiGetFieldValue(CONFIG.fld_matrix_count));
	record_size=nlapiGetLineItemCount(CONFIG.list_item_update);
	if (record_size==0) {
		alert('No record to process.');
		return;
	}
	if (confirm('This action is irreversible. Are you sure you want to continue?')) {
		if (matrix_count>1) {
			var overlay=document.getElementById('overlay_matrix');
			if (overlay) {
				overlay.style.display='block';
			}
		}
		else {
			ajax_url=nlapiResolveURL('SUITELET', CONFIG.ajax_script, CONFIG.ajax_deploy);
			record_ctr=nlapiGetFieldValue(CONFIG.fld_update_ctr);
			img_loader=getFileURL(CONFIG.icon_loader);
			img_success=getFileURL(CONFIG.icon_success);
			displayWarning();
			commit_ajax(record_ctr, record_size);
		}
	}
}

//<<--
//function itemMass_commit() {
//	if (confirm('This action is irreversible. Are you sure you want to continue?')) {
//		ajax_url=nlapiResolveURL('SUITELET', CONFIG.ajax_script, CONFIG.ajax_deploy);
//		record_ctr=nlapiGetFieldValue(CONFIG.fld_update_ctr);
//		record_size=nlapiGetLineItemCount(CONFIG.list_item_update);
//		img_loader=getFileURL(CONFIG.icon_loader);
//		img_success=getFileURL(CONFIG.icon_success);
//		displayWarning();
//		commit_ajax(record_ctr, record_size);
//	}
//}
//-->>

function commit_ajax(record_ctr, record_size) {
	var elem=document.getElementById('item_status_'+record_ctr);
	if (elem) {
		elem.innerHTML='<img width="20px" height="20px" src="'+img_loader+'" title="In progress."/>';
		if (window.XMLHttpRequest) {
			ajax_server=new XMLHttpRequest();
		}
		else {
			ajax_server=new ActiveXObject('Microsoft.XMLHTTP');
		}
		ajax_server.open('POST', ajax_url, true);
		ajax_server.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		ajax_server.setRequestHeader('Content-length', elem.getAttribute('value').length);
		ajax_server.setRequestHeader('Connection', 'close');
		ajax_server.send(elem.getAttribute('value'));
		ajax_server.onreadystatechange=function() {
			if (ajax_server.readyState==4 && ajax_server.status==200) {
				record_ctr++;
				nlapiSetFieldValue(CONFIG.fld_update_ctr, record_ctr);
				var data_json=JSON.parse(ajax_server.responseText);
				ajax_server.abort();
				if (data_json.status==1) {
					elem.innerHTML='<img width="20px" height="20px" src="'+img_success+'" title="Updated successfully."/>';
					success_ctr++;
					if (data_json.is_matrix=="true" && (data_json.item_name!='' || data_json.display_name!='')) {
						var item=data_json.item_name!=''?data_json.item_name:data_json.display_name;
						if (confirm(decodeHTMLEntities(item)+" is a matrix item. Do you also want to update its matrix subitems?")) {
							if (data_json.child_item!=null) {
								var child_item=data_json.child_item.split(',');
								//No child items
								if (child_item.length<1) {
									return;
								}
								itemMass_ChildUpdate(elem, ajax_url, child_item, 0, record_ctr, record_size, data_json.field_list, data_json.id, data_json.item_name, data_json.display_name);
								return;
							}
						}
					}
				}
				else {
					elem.innerHTML='<span style="color: red;">Error: '+data_json.error+'</span>';
				}
				if (record_ctr<record_size) {
					commit_ajax(record_ctr, record_size);
				}
				else {
					showResult();
				}
			}
		};
	}
}

function itemMass_ChildUpdate(elem, url, list_arr, counter, rec_ctr, rec_size, item_list, parent_id, item_name, display_name) {
	elem.innerHTML='<img width="20px" height="20px" src="'+img_loader+'" title="In progress."/>';
	if (window.XMLHttpRequest) {
		ajax_server=new XMLHttpRequest();
	}
	else {
		ajax_server=new ActiveXObject('Microsoft.XMLHTTP');
	}
	ajax_server.open('POST', url, true);
	var params=	'matrix_item_id='+list_arr[counter]+
				'&field_list='+item_list+
				'&parent_item_id='+parent_id;
	if (item_name!='') {
		params+='&item_name='+item_name.replace(/'/g, "%27").replace(/&/g, '%26').replace(new RegExp('#', 'g'), "%23").replace(/"/g, "%22");
	}
	if (display_name!='') {
		params+='&display_name='+display_name;
	}
	ajax_server.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	ajax_server.setRequestHeader('Content-length', params.length);
	ajax_server.setRequestHeader('Connection', 'close');
	ajax_server.send(params);
	ajax_server.onreadystatechange=function() {
		if (ajax_server.readyState==4 && ajax_server.status==200) {
			data_json=JSON.parse(ajax_server.responseText);
			ajax_server.abort();
			if (data_json.status==1) {
				elem.innerHTML='<img width="20px" height="20px" src="'+img_success+'" title="Updated successfully."/>';
			}
			else {
				elem.innerHTML='<span style="color: red;">Error: '+data_json.error+'</span>';
			}
			if (counter<list_arr.length-1) {
				itemMass_ChildUpdate(elem, url, list_arr, counter+1, rec_ctr, rec_size, item_list, parent_id, item_name, display_name);
			}
			else if (rec_ctr<rec_size){
				commit_ajax(rec_ctr, rec_size);
			}
			else {
				showResult();
			}
		}
	};
}

function showResult() {
	var elem=document.getElementById(CONFIG.fld_update_dashboard);
	if (elem) {
		if (record_size==success_ctr) {
			elem.innerHTML='<div style="margin-top: 15px; font-size: 14px; color: #286d22; padding: 5px;">'+success_ctr+' of '+record_size+' records has been processed successfully.</div>';
		}
		else {
			elem.innerHTML='<div style="margin-top: 15px; font-size: 14px; color: #286d22; padding: 5px;">'+success_ctr+' of '+record_size+' records has been processed successfully. See status and error message for details.</div>';
		}
		//Back buttons
		var abort_btn_1=document.getElementById(CONFIG.back_1);
		var abort_btn_2=document.getElementById(CONFIG.back_2);
		if (abort_btn_1 && abort_btn_2) {
			abort_btn_1.value=abort_btn_2.value='Back';
			abort_btn_1.onclick=abort_btn_2.onclick=function() {
				window.location.href=nlapiResolveURL('SUITELET', CONFIG.script_id, CONFIG.scrip_deploy);
			};
		}
		var commit_btn_1=document.getElementById(CONFIG.commit_1);
		var commit_btn_2=document.getElementById(CONFIG.commit_2); 
		if (commit_btn_1 && commit_btn_2) {
			commit_btn_1.parentNode.style.display='none';
			commit_btn_2.parentNode.style.display='none';
		}
	}
}

function displayWarning() {
	var elem=document.getElementById(CONFIG.fld_update_dashboard);
	if (elem) {
		elem.innerHTML='<div style="margin-top: 15px; font-size: 14px; color: #FE0000; padding: 5px;">Warning: Records are being generated. Please do not leave or reload this page until processing is finished. While waiting to complete the process, you can work with other stuff provided you open it in a new window.</div>';
		var commit_btn_1=document.getElementById(CONFIG.commit_1);
		var commit_btn_2=document.getElementById(CONFIG.commit_2);
		if (commit_btn_1 && commit_btn_2) {
			commit_btn_1.value=commit_btn_2.value='Resume';
			commit_btn_1.onclick=commit_btn_2.onclick=null;
			commit_btn_1.style.opacity=commit_btn_2.style.opacity=0.25;
		}
		var abort_btn_1=document.getElementById(CONFIG.back_1);
		var abort_btn_2=document.getElementById(CONFIG.back_2);
		if (abort_btn_1 && abort_btn_2) {
			abort_btn_1.value=abort_btn_2.value='Abort';
			abort_btn_1.onclick=abort_btn_2.onclick=function() {
				if (confirm('This will abort the current operation. Are you sure you want to continue?')) {
					ajax_server.abort();
					//Abort Btn
					abort_btn_1.value=abort_btn_2.value='Back';
					abort_btn_1.onclick=abort_btn_2.onclick=function() {
						window.location.href=nlapiResolveURL('SUITELET', CONFIG.script_id, CONFIG.scrip_deploy);
					};
					//Commit btn
					if (commit_btn_1 && commit_btn_2) {
						commit_btn_1.value=commit_btn_2.value='Resume';
						commit_btn_1.style.opacity=commit_btn_2.style.opacity=1.0;
						commit_btn_1.onclick=commit_btn_2.onclick=function() {
							displayWarning();
						};
					}
					//Dashboard
					elem.innerHTML='<div style="margin-top: 15px; font-size: 14px; color: #FE0000; padding: 5px;">'+CONFIG.title+' has been aborted.</div>';
					var status=document.getElementById('item_status_'+record_ctr);
					if (status) {
						status.innerHTML='Aborted';
					}
				}
			};
		}
	}
}


function itemMass_fieldChanged(type, name, line) {
	if (name==CONFIG.fld_selector_fields) {
		if (nlapiGetFieldValue(name)=='T') {
			var opts=nlapiGetFieldValue('custfld_hidden_selector');
			opts=opts.split(',');
			nlapiSetFieldValues(CONFIG.fld_item_fields, opts);
		}
		else {
			nlapiSetFieldValue(CONFIG.fld_item_fields, null);
		}
	}
	else if (name=='custfld_use_file') {
		var elems=['csv_file_border', 'custfld_csv_file_fs', 'custfld_backup_flag_fs', 'custfld_backup_flag_fs_lbl', 'custfld_backup_is_public_fs', 'custfld_backup_is_public_fs_lbl', 'custfld_backup_title_fs_lbl', 'custfld_backup_title', 'custfld_backup_description_fs_lbl', 'custfld_backup_description'];
		var elem=null;
		if (nlapiGetFieldValue(name)=='T') {
			nlapiSetFieldValue('custfld_use_backup', 'F');
			for (var i=0; elems && i<elems.length;i++) {
				elem=document.getElementById(elems[i]);
				if (elem) {
					elem.style.display='inline-block';
				}
			}
			elem=document.getElementById('fg_custgrp_backup').parentNode.parentNode.parentNode;
			if (elem) {
				elem.style.display='none';
			}
		}
		else {
			for (var i=0; elems && i<elems.length;i++) {
				elem=document.getElementById(elems[i]);
				if (elem) {
					elem.style.display='none';
				}
			}
		}
	}
	else if (name=='custfld_use_backup') {
		var elems=['csv_file_border', 'custfld_csv_file_fs', 'custfld_backup_flag_fs', 'custfld_backup_flag_fs_lbl', 'custfld_backup_is_public_fs', 'custfld_backup_is_public_fs_lbl', 'custfld_backup_title_fs_lbl', 'custfld_backup_title', 'custfld_backup_description_fs_lbl', 'custfld_backup_description'];
		var elem=null;
		if (nlapiGetFieldValue(name)=='T') {
			nlapiSetFieldValue('custfld_use_file', 'F');
			elem=document.getElementById('fg_custgrp_backup').parentNode.parentNode.parentNode;
			if (elem) {
				elem.style.display='table';
			}
			for (var i=0; elems && i<elems.length;i++) {
				elem=document.getElementById(elems[i]);
				if (elem) {
					elem.style.display='none';
				}
			}
		}
		else {
			elem=document.getElementById('fg_custgrp_backup').parentNode.parentNode.parentNode;
			if (elem) {
				elem.style.display='none';
			}
		}
	}
	else if (name=='custfld_backup_personal') {
		if (nlapiGetFieldValue(name)=='T') {
			nlapiSetFieldValue('custfld_backup_public', 'F');
			nlapiDisableField('custlist_backup_personal', false);
		}
		else {
			nlapiDisableField('custlist_backup_personal', true);
		}
	}
	else if (name=='custfld_backup_public') {
		if (nlapiGetFieldValue(name)=='T') {
			nlapiSetFieldValue('custfld_backup_personal', 'F');
			nlapiDisableField('custlist_backup_public', false);
		}
		else {
			nlapiDisableField('custlist_backup_public', true);
		}
	}
	else if (name==CONFIG.fld_backup_flag) {
		if (nlapiGetFieldValue(name)=='T') {
			nlapiDisableField(CONFIG.fld_backup_is_public, false);
			nlapiDisableField(CONFIG.fld_backup_title, false);
			nlapiDisableField(CONFIG.fld_backup_description, false);
		}
		else {
			nlapiDisableField(CONFIG.fld_backup_is_public, true);
			nlapiDisableField(CONFIG.fld_backup_title, true);
			nlapiDisableField(CONFIG.fld_backup_description, true);
			nlapiSetFieldValue(CONFIG.fld_backup_is_public, 'F');
			nlapiSetFieldValue(CONFIG.fld_backup_title, '');
			nlapiSetFieldValue(CONFIG.fld_backup_description, '');
		}
	}
	else if (name==CONFIG.fld_mode_execute_template) {
		if (nlapiGetFieldValue(name)=='T') {
			nlapiSetFieldValue(CONFIG.fld_csv_mode, 201);
			nlapiSetFieldValue(CONFIG.fld_mode_create_template, 'F', false);
		}
		else {
			nlapiSetFieldValue(CONFIG.fld_csv_mode, null);
		}
	}
	else if (name==CONFIG.fld_mode_create_template) {
		if (nlapiGetFieldValue(name)=='T') {
			nlapiSetFieldValue(CONFIG.fld_csv_mode, 101);
			nlapiSetFieldValue(CONFIG.fld_mode_execute_template, 'F', false);
		}
		else {
			nlapiSetFieldValue(CONFIG.fld_csv_mode, null);
		}
	}
}

function getFileURL(filename) {
	var file=nlapiSearchGlobal('file:'+filename);
	if (file!=null && file!='' && filename.length>0) {
		return nlapiLookupField('file', file[0].getId(), 'url');
	}
	return '';
}

function decodeHTMLEntities (str) {
    var element = document.createElement('div');
    if(str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = '';
    }
    return str;
 }

function matrix_markAll() {
	var matrix_count=parseInt(nlapiGetFieldValue(CONFIG.fld_matrix_count));
	for (var i=0;i<matrix_count;i++) {
		var elem=document.getElementById('matrix_selector_'+i);
		if (elem) {
			elem.checked=true;
		}
	}
}

function matrix_unmarkAll() {
	var matrix_count=parseInt(nlapiGetFieldValue(CONFIG.fld_matrix_count));
	for (var i=0;i<matrix_count;i++) {
		var elem=document.getElementById('matrix_selector_'+i);
		if (elem) {
			elem.checked=false;
		}
	}
}

function matrix_hidePopup() {
	var elem=document.getElementById('overlay_matrix');
	if (elem) {
		elem.style.display='none';	
	}
}

function matrix_submit() {
	var matrix_count=parseInt(nlapiGetFieldValue(CONFIG.fld_matrix_count));
	for (var i=0; i<matrix_count;i++) {
		var elem=document.getElementById('matrix_selector_'+i);
		if (elem && elem.checked) {
			var controller=document.getElementById(elem.getAttribute('controller'));
			controller.setAttribute('include_child', elem.checked);
		}
	}
	matrix_hidePopup();
	matrix_commit();
}


function matrix_commit() {
	ajax_url=nlapiResolveURL('SUITELET', CONFIG.ajax_script, CONFIG.ajax_deploy);
	record_ctr=nlapiGetFieldValue(CONFIG.fld_update_ctr);
	record_size=nlapiGetLineItemCount(CONFIG.list_item_update);
	img_loader=getFileURL(CONFIG.icon_loader);
	img_success=getFileURL(CONFIG.icon_success);
	displayWarning();
	matrix_ajax(record_ctr, record_size);
}

function matrix_ajax(record_ctr, record_size) {
	var elem=document.getElementById('item_status_'+record_ctr);
	if (elem) {
		elem.innerHTML='<img width="20px" height="20px" src="'+img_loader+'" title="In progress."/>';
		if (window.XMLHttpRequest) {
			ajax_server=new XMLHttpRequest();
		}
		else {
			ajax_server=new ActiveXObject('Microsoft.XMLHTTP');
		}
		ajax_server.open('POST', ajax_url, true);
		ajax_server.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		ajax_server.setRequestHeader('Content-length', elem.getAttribute('value').length);
		ajax_server.setRequestHeader('Connection', 'close');
		ajax_server.send(elem.getAttribute('value'));
		ajax_server.onreadystatechange=function() {
			if (ajax_server.readyState==4 && ajax_server.status==200) {
				record_ctr++;
				nlapiSetFieldValue(CONFIG.fld_update_ctr, record_ctr);
				var data_json=JSON.parse(ajax_server.responseText);
				ajax_server.abort();
				if (data_json.status==1) {
					elem.innerHTML='<img width="20px" height="20px" src="'+img_success+'" title="Upload successfully."/>';
					success_ctr++;
					var controller=document.getElementById('matrix_item_'+(record_ctr-1));
					if ((controller && controller.getAttribute('include_child')=='true') &&
						(data_json.is_matrix=='true' && (data_json.item_name!='' || data_json.display_name!=''))) {
						if (data_json.child_item!=null) {
							var child_item=data_json.child_item.split(',');
							//No child items
							if (child_item.length<1) {
								return;
							}
							matrix_ChildUpdate(elem, ajax_url, child_item, 0, record_ctr, record_size, data_json.field_list, data_json.id, data_json.item_name, data_json.display_name, data_json.backup_file);
							return;
						}
					}
				}
				else {
					elem.innerHTML='<span style="color: red;">Error: '+data_json.error+'</span>';
				}
				if (record_ctr<record_size) {
					matrix_ajax(record_ctr, record_size);
				}
				else {
					showResult();
				}
			}
		};
	}
}

function matrix_ChildUpdate(elem, url, list_arr, counter, rec_ctr, rec_size, item_list, parent_id, item_name, display_name, backup_file) {
	elem.innerHTML='<img width="20px" height="20px" src="'+img_loader+'" title="In progress."/>';
	if (window.XMLHttpRequest) {
		ajax_server=new XMLHttpRequest();
	}
	else {
		ajax_server=new ActiveXObject('Microsoft.XMLHTTP');
	}
	ajax_server.open('POST', url, true);
	var params=	'matrix_item_id='+list_arr[counter]+
				'&field_list='+item_list+
				'&parent_item_id='+parent_id;
	if (item_name!='') {
		params+='&item_name='+item_name.replace(/'/g, "%27").replace(/&/g, '%26').replace(new RegExp('#', 'g'), "%23").replace(/"/g, "%22");
	}
	if (display_name!='') {
		params+='&display_name='+display_name;
	}
	if (backup_file!='') {
		params+='&backup_file='+backup_file;
	}
	ajax_server.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	ajax_server.setRequestHeader('Content-length', params.length);
	ajax_server.setRequestHeader('Connection', 'close');
	ajax_server.send(params);
	ajax_server.onreadystatechange=function() {
		if (ajax_server.readyState==4 && ajax_server.status==200) {
			data_json=JSON.parse(ajax_server.responseText);
			ajax_server.abort();
			if (data_json.status==1) {
				elem.innerHTML='<img width="20px" height="20px" src="'+img_success+'" title="Updated successfully."/>';
			}
			else {
				elem.innerHTML='<span style="color: red;">Error: '+data_json.error+'</span>';
			}
			if (counter<list_arr.length-1) {
				matrix_ChildUpdate(elem, url, list_arr, counter+1, rec_ctr, rec_size, item_list, parent_id, item_name, display_name, backup_file);
			}
			else if (rec_ctr<rec_size){
				matrix_ajax(rec_ctr, rec_size);
			}
			else {
				showResult();
			}
		}
	};
}

function list_checker(parent, child) {
	parent.addEventListener('click', function() {
		if (child.checked) {
			list_counter++;
		}
		else {
			list_counter--;
		}
		var e=document.getElementById(CONFIG.elem_list_counter);
		if (e) {
			e.innerHTML=list_counter;
		}
	});
}

function itemMass_CSVProcessor() {
	var mode=nlapiGetFieldValue(CONFIG.fld_csv_mode);
	if (mode=='103') {
		var checker=document.querySelectorAll('input[type=checkbox]');
		var counter=document.getElementById(CONFIG.elem_list_counter);
		if (checker) {
			for (var i=0; i<checker.length;i++) {
				list_checker(checker[i].parentNode, checker[i]);
			}
		}
		var mark_all=document.getElementById('custfld_item_listmarkall');
		if (mark_all) {
			mark_all.addEventListener('click', function() {
				list_counter=nlapiGetLineItemCount(CONFIG.fld_item_list);
				if (counter) {
					counter.innerHTML=list_counter;
				}
			});
		}
		var unmark_all=document.getElementById('custfld_item_listunmarkall');
		if (unmark_all) {
			unmark_all.addEventListener('click', function() {
				list_counter=0;
				if (counter) {
					counter.innerHTML=list_counter;
				}
			});
		}
	}
	if (mode=='104') {
		var item_list=nlapiGetFieldValue('custfld_item_to_process');
		item_list=item_list.split(',');
		var item_fields=nlapiGetFieldValue(CONFIG.fld_item_fields);
		var csv_file=nlapiGetFieldValue('custfld_csv_file_id');
		var labeler=document.getElementById('csv_loader_progress');
		var downloader=document.getElementById('csv_loader_download');
		var url=nlapiResolveURL('SUITELET', CONFIG.csv_suitelet, CONFIG.csv_deploy);
		var imger=document.getElementById('csv_loader_img');
		itemMass_CSVAppend(item_list, 0, item_fields, csv_file, url, labeler, downloader, imger);
	}
	else if (mode=='203') {
		var submit_btn=document.getElementById('submitter');
		var use_backup=nlapiGetFieldValue('custfld_use_backup');
		if (submit_btn) {
			submit_btn.setAttribute('disabled', 'disabled');
			submit_btn.style.opacity=0.25;
			var form=document.getElementById('main_form');
			//<<--
			//DECODE ME FIRST
			var encoded_csv=nlapiGetFieldValue('custfld_bait_and_switch');
			if (encoded_csv) {
				//console.log('1st case: '+isBase64Encoded(encoded_csv.substring(0, 10)));
				if (navigator.userAgent.indexOf("Firefox")!=-1) { 
					if (isBase64Encoded(encoded_csv.substring(0, 10))) {
						nlapiSetFieldValue('custfld_bait_and_switch', decodeBase64(encoded_csv));
					}
				}
				else {
					if (use_backup=='F') {
						nlapiSetFieldValue('custfld_bait_and_switch', isBase64Encoded(encoded_csv.substring(0, 10))?decodeBase64(encoded_csv):encoded_csv);
					}
				}
				submit_btn.removeAttribute('disabled');
				submit_btn.style.opacity=1.0;					
				if (form) {
					var checker=null;
					checker=setInterval(function() {
						var content=nlapiGetFieldValue('custfld_bait_and_switch');
						if (!isBase64Encoded(content.substring(0, 10))) {
							console.log(content);
							form.submit();
							if (checker) {
								clearInterval(checker);
							}
						}
					}, 500);
				}
			}
			//DECODE ME FIRST
			//-->>
		}
	}
}

function isBase64Encoded(content) {
	var base64Matcher = new RegExp("^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})([=]{1,2})?$");
	if (base64Matcher.test(content)) {
		return true;
	}
	return false;
}

function decodeBase64(s) {
	var e={},i,b=0,c,x,l=0,a,r='',w=String.fromCharCode,L=s.length;
    var A="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for(i=0;i<64;i++){e[A.charAt(i)]=i;}
    for(x=0;x<L;x++){
        c=e[s.charAt(x)];b=(b<<6)+c;l+=6;
        while(l>=8){((a=(b>>>(l-=8))&0xff)||(x<(L-2)))&&(r+=w(a));}
    }
    return r;
}


function itemMass_CSVAppend(list, index, fields, file, url, labeler, downloader, imger) {
	if (window.XMLHttpRequest) {
		ajax_server=new XMLHttpRequest();
	}
	else {
		ajax_server=new ActiveXObject('Microsoft.XMLHTTP');
	}
	ajax_url=url+'&item_id='+list[index]+
				 '&field_list='+fields+
				 '&csv_file='+parseInt(file);
	ajax_server.open('POST', ajax_url, true);
	ajax_server.send();
	ajax_server.onreadystatechange=function() {
		if (ajax_server.readyState==4 && ajax_server.status==200) {
			var data_json=JSON.parse(ajax_server.responseText);
			ajax_server.abort();
			if (data_json.status==1) {
				var percent=(parseInt(index/list.length*100));
				labeler.innerHTML=percent+'%';
				downloader.innerHTML='Your csv is being processed. Please wait.';
			}
			else {
				downloader.innerHTML='<span style="color: red;">Error: '+data_json.error+'</span>';
			}
			if (index<list.length-1) {
				itemMass_CSVAppend(list, index+1, fields, file, url, labeler, downloader, imger);
			}
			else {
				imger.parentNode.innerHTML='<img src="'+getFileURL('cloud_download.png')+'" title="Ready to download :)"/>';
				downloader.innerHTML='<a target="_blank" href="'+data_json.file_url+'">Download your csv file here.</a>';
				var elem=document.getElementById('csv_loader_arrow');
				if (elem) {
					elem.style.display='block';
				}
				elem=document.getElementById('csv_loader_next');
				if (elem) {
					elem.style.display='block';
				}
			}
		}
	};
}

function itemMass_SelectField(label, id) {
	var field_lister=document.getElementById('field_lister');
	if (field_lister) {
		//The sibs
		var sib=document.getElementById('item_deselector_check');
		if (sib) {
			sib.checked=false;
		}
		var no_item=document.getElementById('no_item_flag');
		if (no_item && no_item.parentNode && no_item.parentNode.parentNode) {
			var parent=no_item.parentNode.parentNode;
			parent.removeChild(no_item.parentNode);
			//Insert stylesheet
			var sheet=document.styleSheets[0];
			if (sheet) {
				sheet.insertRule('#field_lister tr:nth-child(even) { background-color: #FAFAFA;}', 1);
			}
		}
		//var hidden_selector=nlapiGetFieldValue('custfld_hidden_selector');
		var item_selector=nlapiGetFieldValue(CONFIG.fld_item_fields);
		if (item_selector==null) {
			item_selector='';
		}
		if (item_selector.indexOf(label+CONFIG.delimiter+id)==-1) {
			var row=field_lister.insertRow(field_lister.rows.length);
			var cell_1=row.insertCell(0);
			var cell_2=row.insertCell(1);
			cell_1.setAttribute('width', '14px');
			cell_1.setAttribute('valign', 'middle');
			cell_1.setAttribute('onclick', 'itemMass_RemoveField(this);');
			cell_1.innerHTML='<a href="#"><img  style="display: inline-block; vertical-align: middle; width: 12px; height: 12px; background: rgba(0, 0, 0, 0) url(\'/images/sprite_machines.png\') no-repeat scroll 0 -854px !important;" width="13" border="0" height="13" src="/images/x.gif" /></a>';
			cell_2.setAttribute('style', 'font-size: 13px');
			cell_2.setAttribute('field_name', id);
			cell_2.setAttribute('field_label', label);
			cell_2.innerHTML=label+' ('+id+')';
			item_selector+=label+CONFIG.delimiter+id+',';
			//nlapiSetFieldValue('custfld_hidden_selector', hidden_selector);
			nlapiSetFieldValue(CONFIG.fld_item_fields, item_selector);
		}
	}
}

function itemMass_RemoveField(elem) {
	if (elem && elem.parentNode && elem.parentNode.parentNode) {
		var sib=elem.parentNode.childNodes[1];
		if (sib) {
			var content=nlapiGetFieldValue(CONFIG.fld_item_fields);
			if (content!=null) {
				content=content.replace(sib.getAttribute('field_label')+CONFIG.delimiter+sib.getAttribute('field_name')+',', '');
				content=content.replace(sib.getAttribute('field_label')+CONFIG.delimiter+sib.getAttribute('field_name'), '');
			}
			nlapiSetFieldValue(CONFIG.fld_item_fields, content);
			var table=elem.parentNode.parentNode;
			table.removeChild(elem.parentNode);
			if (table.rows.length==0) {
				var row=table.insertRow(0);
				row.innerHTML='<td align="center" id="no_item_flag" style="color: #333; font-size: 13px;">No Selections Made</td>';
			}
		}
	}
}

function dismiss_FieldSelector() {
	var elem=document.getElementById('csv_field_selector');
	if (elem) {
		elem.style.display='none';
	}
	elem=document.getElementById('item_selector_check');
	if (elem) {
		elem.checked=false;
	}
}

function display_FieldSelector() {
	var elem=document.getElementById('csv_field_selector');
	if (elem) {
		elem.style.display='block';
	}
	var list_data=nlapiGetFieldValue('custfld_hidden_selector');
	//Remove table's rows
	var table=document.getElementById('field_lister');
	while (table.rows.length>0) {
		table.deleteRow(0);
	}
	//List data
	if (list_data!='') {
		nlapiSetFieldValue(CONFIG.fld_item_fields, '');
		list_data=list_data.split(',');
		for (var i=0; list_data && i<list_data.length; i++) {
			var list_item=list_data[i].split(CONFIG.delimiter);
			itemMass_SelectField(list_item[0], list_item[1]);
		}
		nlapiSetFieldValue(CONFIG.fld_item_fields, list_data.join(','));
	}
	else {
		var row=table.insertRow(0);
		row.innerHTML='<td align="center" id="no_item_flag" style="color: #333; font-size: 13px;">No Selections Made</td>';
	}
}

function refine_FieldSelector() {
	var keyword=document.getElementById('csv_field_keyword');
	var iframe=document.getElementById('iframe_field_selector');
	if (keyword && iframe) {
		if (keyword.value.length>0) {
			iframe.setAttribute('src', nlapiResolveURL('SUITELET', CONFIG.item_selector_script, CONFIG.item_selector_deploy)+'&keyword='+keyword.value);
		}
		else {
			iframe.setAttribute('src', nlapiResolveURL('SUITELET', CONFIG.item_selector_script, CONFIG.item_selector_deploy));
		}
	}
}

function clearSelector() {
	nlapiSetFieldValue('custfld_hidden_selector', '');
	nlapiSetFieldValue(CONFIG.fld_item_fields, '');
	nlapiSetFieldValue('custfld_dynamic_field', selector_generator(null));
	//var dynamic_selector=document.getElementById('iframe_dynamic_selector');
	//if (dynamic_selector) {
	//	dynamic_selector.setAttribute('src', nlapiResolveURL('SUITELET', CONFIG.item_dynamic_selector_script, CONFIG.item_dynamic_selector_deploy));
	//}
}

function updateSelector() {
	var table=document.getElementById('field_lister');
	var item_fields_name_label='';
	var item_fields_name_only='';
	if (table) {
		for (var i=0;table.rows && i<table.rows.length;i++) {
			var cell=table.rows[i].cells[1];
			if (cell) {
				item_fields_name_only+=cell.getAttribute('field_label')+CONFIG.delimiter+cell.getAttribute('field_name')+',';
				item_fields_name_label+=cell.getAttribute('field_label')+'-'+cell.getAttribute('field_name')+',';
			}
		}
		item_fields_name_only=item_fields_name_only.substring(0, item_fields_name_only.length-1);
		item_fields_name_label=item_fields_name_label.substring(0, item_fields_name_label.length-1);
		//var dynamic_selector=document.getElementById('iframe_dynamic_selector');
		//if (dynamic_selector) {
		//	dynamic_selector.setAttribute('src', nlapiResolveURL('SUITELET', CONFIG.item_dynamic_selector_script, CONFIG.item_dynamic_selector_deploy)+'&custfld_list_data='+item_fields_name_label);
		//}
		nlapiSetFieldValue('custfld_dynamic_field', selector_generator(item_fields_name_label==''?null:item_fields_name_label.split(',')));
		//nlapiSetFieldValue('custfld_hidden_selector', item_fields_name_only);
		nlapiSetFieldValue(CONFIG.fld_item_fields, item_fields_name_only);
		nlapiSetFieldValue('custfld_hidden_selector', item_fields_name_only);
		dismiss_FieldSelector();
	}
}

function cancelSelector() {
	var list_data=nlapiGetFieldValue('custfld_hidden_selector');
	nlapiSetFieldValue(CONFIG.fld_item_fields, list_data);
	if (list_data!='') {
		list_data=list_data.split(',');
		for (var i=0; list_data && i<list_data.length; i++) {
			var list_item=list_data[i];
			itemMass_SelectField(list_item[0], list_item[1]);
		}
	}
	else {
		
	}
}

function selector_generator(list_data) {
	var selector_code=	'<div style="display: block; position: realtive; width: 425px;">'+
						'	<div style="display: block; position: relative; font-size: 12px; color: #777;">ITEM FIELDS</div>'+
						'	<table style="display: block; position: relative; width: 418px; height: 118px; border: solid 1px #CCC; white-space: nowrap; overflow-y: scroll;">';
	if (list_data) {
		for (var i=0;i<list_data.length;i++) {
			var list_item=list_data[i].split('-');
			selector_code+='<tr><td style="font-size: 13px; padding: 5px 3px; font-family: Arial,Helvetica,sans-serif;">'+list_item[0]+' ('+list_item[1]+')'+'</td></tr>';
		}
	}
	else {
		selector_code+='<tr><td width="100%" align="center" style="font-size: 12px; padding: 5px 3px;">No CSV Field Selected</td></tr>';
	}
	selector_code+=		'	</table>'+
						'</div>';
	return selector_code;
}

function selector_all(elem) {
	if (elem.checked) {
		clearSelector();
		//Sib
		var sib=document.getElementById('item_deselector_check');
		if (sib) {
			sib.checked=false;
		}
		//Remove table's rows
		var table=document.getElementById('field_lister');
		while (table.rows.length>0) {
			table.deleteRow(0);
		}
		//Iframe
		var iframe=document.getElementById('iframe_field_selector');
		var iframe_doc=iframe.contentDocument || iframe.contentWindow.document;
		var all_ids=iframe_doc.getElementById('all_fields_id');
		var all_labels=iframe_doc.getElementById('all_fields_label');
		if (all_ids && all_labels) {
			all_ids=all_ids.value.split(',');
			all_labels=all_labels.value.split(',');
			for (var i=0; i<all_ids.length;i++) {
				itemMass_SelectField(all_labels[i], all_ids[i]);
			}
		}
	}
}

function deselector_all(elem) {
	if (elem.checked) {
		nlapiSetFieldValue(CONFIG.fld_item_fields, '');
		//Sib
		var sib=document.getElementById('item_selector_check');
		if (sib) {
			sib.checked=false;
		}
		//Remove table's rows
		var table=document.getElementById('field_lister');
		while (table.rows.length>0) {
			table.deleteRow(0);
		}
		var row=table.insertRow(0);
		row.innerHTML='<td align="center" id="no_item_flag" style="color: #333; font-size: 13px;">No Selections Made</td>';
	}
}