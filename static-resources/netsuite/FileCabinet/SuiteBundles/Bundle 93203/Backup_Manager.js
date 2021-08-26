/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 Jun 2015     mdeasis
 *
 */

{
	var CONFIG={
		title: 'Backup Manager',
		//Images
		img_cloud_logo: 'cloudbackup.png',
		img_search_bar: 'search_icon.png',
		img_personal_icon: 'personal_icon.png',
		img_public_icon: 'public_icon.png',
		img_list_view: 'list_view.png',
		img_icon_view: 'list_view_inactive.png',
		img_file_icon: 'file_icon.png',
		//Backup Record
		backup_rec_type: 'customrecord_item_backup',
		backup_fld_user: 'custrecord_item_backup_user',
		backup_fld_name: 'custrecord_item_backup_title',
		backup_fld_desc: 'custrecord_item_backup_desc',
		backup_fld_public: 'custrecord_item_backup_is_public',
		backup_fld_date: 'custrecord_item_backup_date',
		//Param
		param_user_mode: 'custfld_user_mode',
		param_file_view: 'custfld_file_view',
		param_search_keyword: 'custfld_search_keyword',
		param_minified: 'custfld_is_minified',
		param_backup_type: 'custfld_backup_type',
		//Suitelet and Deployment
		backup_suitelet: 'customscript_backup_manager',
		backup_deploy: 'customdeploy_backup_manager',
		//AJAX
		ajax_backup_id: 'custfld_backup_id',
		ajax_file_id: 'custfld_file_id',
		ajax_suitelet: 'customscript_backup_manager_ajax',
		ajax_deploy: 'customdeploy_backup_manager_ajax',
		//Data Wizard
		data_wizard_script: 'customscript_fmt_data_wizard_sl',
		data_wizard_deploy: 'customdeploy_fmt_data_wizard_sl',
		//Item Manager
		item_manager_script: 'customscript_item_mass_updater_sl',
		item_manager_deploy: 'customdeploy_item_mass_updater_sl',
		backup_client_id: 'customscript_backup_manager_client',
	};
}

function backupManager_suitelet(request, response){
	//Params
	var param_minified=request.getParameter(CONFIG.param_minified);
	var param_backup_type=request.getParameter(CONFIG.param_backup_type);
	if (!isNullOrEmpty(param_minified)) {
		if (param_minified=='CSV') {
			var form=nlapiCreateForm(CONFIG.title, true);
			form.addField('custfld_csv_border', 'inlinehtml').setBreakType('startcol').setDefaultValue('<div style="background-color: #dfe4eb; padding: 5px; color: #607998; font-size: 13px; font-weight: 700;">CSV File</div>');
			form.addField('custfld_csv_file', 'file', 'Select CSV File');
			form.addField('custfld_backup_flag', 'checkbox', 'Create backup');
			form.addField('custfld_backup_public', 'checkbox', 'Share CSV within the account').setDisplayType('disabled');
			form.addField('custfld_backup_name', 'text', 'Backup Name').setDisplayType('disabled');
			form.addField('custfld_backup_desc', 'textarea', 'Backup Description').setDisplayType('disabled');
			form.addField('custfld_title_remover', 'inlinehtml').setDefaultValue('<script>document.getElementsByClassName("uir-page-title")[0].remove();</script>');
			form.setScript(CONFIG.backup_client_id);
			response.writePage(form);
		}
		else if (param_minified=='BACKUP' && !isNullOrEmpty(param_backup_type)) {
			var backup=null;
			if (param_backup_type=='PERSONAL') {
				backup=getPersonalBackup();
			}
			else {
				backup=getPublicBackup();
			}
			var form=nlapiCreateForm(CONFIG.title, true);
			form.addField('custfld_backup_border', 'inlinehtml').setBreakType('startcol').setDefaultValue('<div style="background-color: #dfe4eb; padding: 5px; color: #607998; font-size: 13px; font-weight: 700;">Backup File</div>');
			form.addField('custfld_backup_personal', 'checkbox', 'Personal backup').setDefaultValue(param_backup_type=='PERSONAL'?'T':'F');
			form.addField('custfld_backup_public', 'checkbox', 'Shared backup').setDefaultValue(param_backup_type=='PUBLIC'?'T':'F');
			var back_list=form.addField('custfld_backup_list', 'select', 'Backup');
			for (var i=0;backup && i<backup.length;i++) {
				back_list.addSelectOption(backup[i]['id'], backup[i]['name']);
			}
			form.addField('custfld_title_remover', 'inlinehtml').setDefaultValue('<script>document.getElementsByClassName("uir-page-title")[0].remove();</script>');
			form.setScript(CONFIG.backup_client_id);
			response.writePage(form);
		}
		else if (param_minified=='BACKUP') {
			var form=nlapiCreateForm(CONFIG.title, true);
			form.addField('custfld_backup_border', 'inlinehtml').setBreakType('startcol').setDefaultValue('<div style="background-color: #dfe4eb; padding: 5px; color: #607998; font-size: 13px; font-weight: 700;">Backup File</div>');
			form.addField('custfld_backup_personal', 'checkbox', 'Personal backup');
			form.addField('custfld_backup_public', 'checkbox', 'Shared backup');
			form.addField('custfld_backup_list', 'select', 'Backup').setDisplayType('disabled');
			form.addField('custfld_title_remover', 'inlinehtml').setDefaultValue('<script>document.getElementsByClassName("uir-page-title")[0].remove();</script>');
			form.setScript(CONFIG.backup_client_id);
			response.writePage(form);
		}
	}
	else {
		var param_user_mode=request.getParameter(CONFIG.param_user_mode);
		if (isNullOrEmpty(param_user_mode)) {
			param_user_mode='PERSONAL';
		}
		var param_file_view=request.getParameter(CONFIG.param_file_view);
		if (isNullOrEmpty(param_file_view)) {
			param_file_view='ICON_MODE';
		}
		var param_keyword=request.getParameter(CONFIG.param_search_keyword);
		var html_code='';
		html_code=	'<html>'+
					'	<head>'+
					'		<style>'+
					'			* {'+
					'				font-family: Open Sans,​Helvetica,​sans-serif;'+
					'				margin: 0;'+
					'				pading: 0;'+
					'				border: 0;'+
					'			}'+
					'			a {'+
					'				text-decoration: none;'+
					'			}'+
					'			.backup_wrapper {'+
					'				display: block;'+
					'				position: relative;'+
					//'				width: 720px;'+
					'				margin: 20px auto;'+
					'				background-color: #DFE4EB;'+
					'				padding: 10px;'+
					'			}'+
					'			.backup_boxer {'+
					'				display: block;'+
					'				position: relative;'+
					'				width: 100%;'+
					'				border: solid 1px #24566D;'+
					'				background: #FFF;'+
					'			}'+
					'			.backup_nav {'+
					'				display: block;'+
					'				position: relative;'+
					'				width: 100%;'+
					'				line-height: 36px;'+
					'				background-color: #24566D;'+
					'			}'+
					'			.backup_container, .backup_con_left, .backup_con_right {'+
					'				display: block;'+
					'				position: relative;'+
					'				width: 100%;'+
					'			}'+
					'			.backup_con_left {'+
					'				width: 220px;'+
					//'				float: left;'+
					'				display: block;'+
					'				position: absolute;'+
					'				top: 0;'+
					'				left: 0;'+
					'				border-right: solid 1px #24566D;'+
					'				height: 100%;'+
					'				z-index: 100;'+
					'			}'+
					'			.backup_con_left ul {'+
					'				list-style: none;'+
					'				padding-left: 20px;'+
					'				margin: 0;'+
					'			}'+
					'			.backup_con_left li {'+
					'				padding: 5px 0;'+
					'			}'+
					'			.backup_con_left img {'+
					'				display: block;'+
					'				position: relative;'+
					'				float: left;'+
					'				width: 40px;'+
					'				height: 40px;'+
					'			}'+
					'			.backup_con_left span {'+
					'				display: block;'+
					'				position: relative;'+
					'				height: 40px;'+
					'				line-height: 45px;'+
					'				float: left;'+
					'				margin-left: 10px;'+
					'				font-size: 15px;'+
					'				text-decoration: underline;'+
					'			}'+
					'			.backup_con_right {'+
					//'				min-width: 499px;'+
					'				float: left;'+
					//'				margin-left: 220px;'+
					'				min-height: 320px;'+
					'			}'+
					'			.backup_file {'+
					'				display: block;'+
					'				position: relative;'+
					'				width: 140px;'+
					'				height: 140px;'+
					'				float: left;'+
					'				margin: 10px;'+
					'			}'+
					'			.backup_file img {'+
					'				display: block;'+
					'				width: 120px;'+
					'				height: 120px;'+
					'				position: relative;'+
					'			}'+
					'			.file_caption {'+
					'				display: block;'+
					'				position: absolute;'+
					'				width: 92px;'+
					'				height: 30px;'+
					'				line-height: 25px;'+
					'				font-size: 12px;'+
					'				z-index: 10;'+
					'				border-radius: 10px;'+
					'				border: solid 2px #24566D;'+
					'				top : 65px;'+
					'				left: 40px;'+
					'				background-color: #FFF;'+
					'				text-align: center;'+
					'				font-weight: 600;'+
					'				box-shadow: 0 0 0 2px #FFF;'+
					'				overflow: hidden;'+
					'				text-overflow: ellipsis;'+
					'			}'+
					'			.backup_file:hover .file_caption {'+
					'				background-color: #24566D;'+
					'				color: #FFF;'+
					'			}'+
					'			.file_footer {'+
					'				display: block;'+
					'				position: absolute;'+
					'				width: 140px;'+
					'				left: 0;'+
					'				bottom: 0;'+
					'			}'+
					'			.file_footer a {'+
					'				display: inline-block;'+
					'				width: 60px;'+
					'				font-size: 13px;'+
					'				text-align: center;'+
					'				margin: 3px 0;'+
					'				color: #24566D;'+
					'				text-align: center;'+
					'			}'+
					'			.file_row {'+
					'				display: block;'+
					'				position: relative;'+
					'				width: 100%;'+
					'				padding-left: 220px;'+					
					'				min-height: 500px;'+
					'			}'+
					'			.backup_search {'+
					'				display: block;'+
					'				position: absolute;'+
					'				z-index: 100;'+
					'				right: 5px;'+
					'				bottom: 10px;'+
					'				margin: 6px 5px;'+
					'			}'+
					'			.backup_search input {'+
					'				display: block;'+
					'				position: relative;'+
					'				width: 180px;'+
					'				height: 25px;'+
					'				border-radius: 10px;'+
					'				border: solid 1px transparent;'+
					'				padding: 3px 30px 3px 10px;'+
					'				font-style: italic;'+
					'			}'+
					'			.backup_search img {'+
					'				display: block;'+
					'				position: absolute;'+
					'				top: 0;'+
					'				right: 5px;'+
					'				width: 24px;'+
					'				height: 24px;'+
					'				z-index: 120;'+
					'			}'+
					'			.backup_header {'+
					'				display: block;'+
					'				position: relative;'+
					'				padding: 5px;'+
					'			}'+
					'			.backup_header img{'+
					'				display: block;'+
					'				position: relative;'+
					'				width: 50px;'+
					'				height: 50px;'+
					'				border: solid 2px transparent;'+					
					'				box-shadow: 1px 1px 1px 2px #CCC;'+
					'				border-radius: 25px;'+
					'				float: left;'+
					'				box-shadow: 0 0 15px 2px rgba(200,200,200, 0.1);'+
					'			}'+
					'			.backup_title {'+
					'				display: block;'+
					'				position: relative;'+
					'				height: 40px;'+
					'				line-height: 45px;'+
					'				float: left;'+
					'				margin-left: 10px;'+
					'				color: #FFF;'+
					'				font-size: 32px;'+
					'				width: 450px;'+
					'				border-bottom: solid 1px #FFF;'+
					'			}'+
					'			.backup_view {'+
					'				display: block;'+
					'				position: absolute;'+
					'				width: 40px;'+
					'				height: 40px;'+
					'				top: 0;'+
					'				right: 0;'+
					'				z-index: 200;'+
					'			}'+
					'			.backup_view img {'+
					'				width: 30px;'+
					'				height: 30px'+
					'			}'+
					'			.file_tabler {'+
					'				margin: 5px auto;'+
					'				font-size: 13px;'+
					'			}'+
					'			.file_tabler_header {'+
					'				background-color: #e5e5e5;'+
					'			}'+
					'			.file_tabler_header th {'+
					'				text-align: center;'+
					'				padding: 3px 0;'+
					'				font-weight: bold;'+
					'			}'+
					'			.clearB{'+
					'				clear: both;'+
					'			}'+
					'		</style>'+
					'		<script type="text/javascript" src="//code.jquery.com/jquery-migrate-1.2.1.min.js"></script>'+
					'		<script type="text/javascript">'+
					'			function remove_backup(elem) {'+
					'				if (confirm("This action is irreversible. Are you sure you want to proceed?")) {'+
					'					var ajax_server=null;'+
					'					if (window.XMLHttpRequest) {'+
				  	'						ajax_server=new XMLHttpRequest();'+
					'					}'+
					'					else {'+
					'						ajax_server=new ActiveXObject("Microsoft.XMLHTTP");'+
					'					}'+
					'					ajax_server.open("POST", "'+nlapiResolveURL('SUITELET', CONFIG.ajax_suitelet, CONFIG.ajax_deploy)+'&'+CONFIG.ajax_file_id+'="+elem.getAttribute("file_id")+"'+'&'+CONFIG.ajax_backup_id+'="+elem.getAttribute("backup_id"), true);'+
					'					ajax_server.send();'+
					'					ajax_server.onreadystatechange=function() {'+
					'						if (ajax_server.readyState==4 && ajax_server.status==200) {'+
					'							var data_json=JSON.parse(ajax_server.responseText);'+
					'							if (data_json.status==1) {'+
					'								elem.parentNode.parentNode.remove();'+
					'							}'+
					'							else {'+
					'								alert("Error: "+data_json.error);'+
					'							}'+
					'  						}'+
					'					};'+
					'				}'+
					'			}'+
					'			function search_backup() {'+
					'				var keyword=document.getElementById("backup_keyword");'+
					'				if (keyword.value.length==0) {'+
					'					alert("Search keyword cannot be empty. Please try again.");'+
					'				}'+
					'				else {'+
					'					window.location.href="'+nlapiResolveURL('SUITELET', CONFIG.backup_suitelet, CONFIG.backup_deploy)+'&'+CONFIG.param_search_keyword+'="+keyword.value;'+
					'				}'+
					'			}'+
					'	</script>'+
					'	</head>'+
					'	<body>'+
					'		<div class="backup_wrapper">'+
					'			<div class="backup_boxer">'+
					'				<div class="backup_nav">'+
					'					<div class="backup_header">'+
					'						<img src="'+getFileURL(CONFIG.img_cloud_logo)+'" />'+
					'						<span class="backup_title">Backup Manager</span>'+
					'						<div class="clearB"></div>'+
					'					</div>'+
					'					<form method="POST">'+
					'						<div class="backup_search">'+				
					'							<input type="text" placeholder="Search" id="backup_keyword" name="'+CONFIG.param_search_keyword+'">'+
				'								<a href="#" id="backup_search" onclick="search_backup(); return false;">'+
					'								<img src="'+getFileURL(CONFIG.img_search_bar)+'" />'+
					'							</a>'+
					'						</div>'+
					'					</form>'+
					'				</div>'+
					'				<div class="backup_container">'+
					'					<div class="backup_con_left">'+
					'						<ul>'+
					'							<li>'+
					'								<a href="'+nlapiResolveURL('SUITELET', CONFIG.backup_suitelet, CONFIG.backup_deploy)+'&'+CONFIG.param_user_mode+'=PERSONAL">'+
					'									<img src="'+getFileURL(CONFIG.img_personal_icon)+'" />'+
					'									<span>My personal backup</span>'+
					'									<div class="clearB"></div>'+
					'								</a>'+
					'							</li>'+
					'							<li>'+
					'								<a href="'+nlapiResolveURL('SUITELET', CONFIG.backup_suitelet, CONFIG.backup_deploy)+'&'+CONFIG.param_user_mode+'=PUBLIC">'+
					'									<img src="'+getFileURL(CONFIG.img_public_icon)+'" />'+
					'									<span>Public backup</span>'+
					'									<div class="clearB"></div>'+
					'								</a>'+
					'							</li>'+
					'						</ul>'+
					'					</div>'+
					'					<div class="backup_con_right">';
		 var backup=null;
		 //<<---
		 //DISPLAY MODE
		 if (isNullOrEmpty(param_keyword)) {
			 if (param_user_mode=='PERSONAL')  {
				 if (isNullOrEmpty(param_keyword)) {
					 backup=getPersonalBackup();
				 }
				 else {
					 backup=searchBackup(param_keyword);
				 }
				 
			 }
			 else {
				 backup=getPublicBackup();
			 }
		 }
		 //DISPLAY MODE
		 //--->>
		 //<<---
		 //SEARCH MODE
		 else {
			 backup=searchBackup(param_keyword);
			 param_user_mode='PUBLIC';
		 }
		 //SEARCH MODE
		 //--->>
		 if (backup && backup.length>0) {
			 html_code+='						<div class="backup_view">';
			 if (param_file_view=='ICON_MODE') {
				 html_code+='							<a href="'+nlapiResolveURL('SUITELET', CONFIG.backup_suitelet, CONFIG.backup_deploy)+'&'+CONFIG.param_user_mode+'='+param_user_mode+'&'+CONFIG.param_file_view+'=LIST_MODE">'+
							'								<img src="'+getFileURL(CONFIG.img_list_view)+'" />';
			 }
			 else {
				 html_code+='							<a href="'+nlapiResolveURL('SUITELET', CONFIG.backup_suitelet, CONFIG.backup_deploy)+'&'+CONFIG.param_user_mode+'='+param_user_mode+'&'+CONFIG.param_file_view+'=ICON_MODE">'+
					'								<img src="'+getFileURL(CONFIG.img_icon_view)+'" />';
			 }
			html_code+= '							</a>'+
						'						</div>'+
						'						<!--- ROW 1 -->'+
						'						<div class="file_row">';
			 //<<---
			 //ICON MODE
			 if (param_file_view=='ICON_MODE') {
				 if (param_user_mode=='PERSONAL') {
					 for (var i=0;backup && i<backup.length;i++) {
					 html_code+='							<div class="backup_file">'+
								'								<img src="'+getFileURL(CONFIG.img_file_icon)+'" title="'+backup[i]['desc']+'"/>'+
								'								<div class="file_caption">'+
								'									<span>'+backup[i]['name']+'</span>'+
								'								</div>'+
								'								<div class="file_footer">'+
								'									<a href="'+backup[i]['file_link']+'" target="_blank">Download</a><a file_id="'+backup[i]['file']+'" backup_id="'+backup[i]['id']+'" onclick="remove_backup(this);return false;" href="#">Remove</a>'+
								'								</div>'+
								'							</div>';
					 }
				 }
				 else {
					 for (var i=0;backup && i<backup.length;i++) {
						 html_code+='							<div class="backup_file" style="height: 160px;">'+
									'								<img src="'+getFileURL(CONFIG.img_file_icon)+'" title="'+backup[i]['desc']+'"/>'+
									'								<div class="file_caption">'+
									'									<span>'+backup[i]['name']+'</span>'+
									'								</div>'+
									'								<div class="file_footer">'+
									'									<div style="display: block; position: relative; text-align: center; font-size: 12px;" class="file_author">Owner: '+backup[i]['user']+'</div>'+
									'									<a style="width: 120px;" href="'+backup[i]['file_link']+'" target="_blank">Download</a>'+
									'								</div>'+
									'							</div>';
						 }
				 }
			 }
			 else {
				 html_code+='<table width="90%" cellspacing="0" cellpadding="5" border="1" style="margin: 5px auto;" class="file_tabler">'+
					    	'	<tr class="file_tabler_header">'+
					    	'		<th>Date</th>'+
					    	'		<th>Name</th>'+
					    	'		<th>Description</th>'+
					    	'		<th>Download</th>'+
					    	'	</tr>';
				 for (var i=0; backup && i<backup.length;i++) {
					 html_code+='<tr '+(i%2==1?'style="background-color: #FAFAFA;"':'')+'>'+
					 			'	<td align="center">'+backup[i]['date']+'</td>'+
					 			'	<td align="center">'+backup[i]['name']+'</td>'+
					 			'	<td align="center">'+backup[i]['desc']+'</td>'+
					 			'	<td align="center"><a style="color: #255599;" href="'+backup[i]['file_link']+'" target="_blank">Download</a></td>'+
					 			'</tr>';
				 }
				html_code+= '</table>';
			 }
			 //ICON MODE
			 //--->>
			html_code+= '							<div class="clearB"></div>'+
						'						</div>';
		 }
		 else {
			 html_code+='<img src="'+getFileURL('no_file.svg')+'" style="display: block; position: relative; width: 90px; height: 90px; margin: 10px auto 0;"/>'+
	 			'<div style="display: block; position: relative; margin: auto; text-align: center; font-weight: bold; font-size: 18px;">THERE ISN\'T ANY BACKUP FILE YET</div>'+
	 			'<div style="display: block; position: relative; margin: auto; text-align: center; font-size: 13px;">Updating item records using Item Update Manager is being saved here.</div>';
		 }
				 
			 html_code+='					</div>'+
						'					<div class="clearB"></div>'+
						'				</div>'+
						'			</div>'+
						'		</div>'+
						'	</body>'+
						'</html>';
		//response.write(html_code);
		var form=nlapiCreateForm(CONFIG.title, false);
		form.addPageLink('crosslink', 'Data Wizard', nlapiResolveURL('SUITELET', CONFIG.data_wizard_script, CONFIG.data_wizard_deploy));
		form.addField('custfld_test', 'inlinehtml').setDefaultValue(html_code);
		response.writePage(form);
	}
}

function backup_ajax(request, response) {
	var backup_id=request.getParameter(CONFIG.ajax_backup_id);
	var file_id=request.getParameter(CONFIG.ajax_file_id);
	var DELETE_STATUS=-1;
	var DELETE_REC_ID=backup_id;
	var DELETE_ERROR='';
	if (!isNullOrEmpty(backup_id)) {
		try {
			nlapiDetachRecord('file', file_id, CONFIG.backup_rec_type, backup_id);
			nlapiDeleteFile(file_id);
			nlapiDeleteRecord(CONFIG.backup_rec_type, backup_id);
			DELETE_STATUS=1;
		}
		catch (err) {
			nlapiLogExecution('DEBUG', 'Error', err.message);
			DELETE_ERROR=err.message;
		}
	}
	response.setContentType('JAVASCRIPT', 'backup_delete.json');
	response.write(JSON.stringify({
		"status": nlapiEscapeXML(DELETE_STATUS),
		"record_id": nlapiEscapeXML(DELETE_REC_ID),
		"error": nlapiEscapeXML(DELETE_ERROR),
	}));
}

function getPersonalBackup() {
	var rs=nlapiSearchRecord(CONFIG.backup_rec_type, null, [new nlobjSearchFilter(CONFIG.backup_fld_user, null,'is', nlapiGetUser())],
														   [new nlobjSearchColumn(CONFIG.backup_fld_name), new nlobjSearchColumn(CONFIG.backup_fld_date),
															new nlobjSearchColumn(CONFIG.backup_fld_desc), new nlobjSearchColumn(CONFIG.backup_fld_public),
															new nlobjSearchColumn('internalid', 'file')]);
	if (!isNullOrEmpty(rs)) {
		var result_arr=[];
		for (var i=0;rs && i<rs.length;i++) {
			var result_item=[];
			result_item['id']=rs[i].getId();
			result_item['date']=rs[i].getValue(CONFIG.backup_fld_date);
			result_item['desc']=rs[i].getValue(CONFIG.backup_fld_desc);
			result_item['name']=rs[i].getValue(CONFIG.backup_fld_name);
			result_item['is_public']=rs[i].getValue(CONFIG.backup_fld_public);
			result_item['file']=rs[i].getValue('internalid', 'file');
			if (!isNullOrEmpty(result_item['file'])) {
				result_item['file_link']=nlapiLookupField('file', result_item['file'], 'url');
			}
			result_arr.push(result_item);
		}
		return result_arr;
	}
	return null;
}

function getPublicBackup() {
	var rs=nlapiSearchRecord(CONFIG.backup_rec_type, null, [new nlobjSearchFilter(CONFIG.backup_fld_public, null, 'is', 'T')],
			[new nlobjSearchColumn(CONFIG.backup_fld_name), new nlobjSearchColumn(CONFIG.backup_fld_date),
			 new nlobjSearchColumn(CONFIG.backup_fld_desc), new nlobjSearchColumn(CONFIG.backup_fld_public),
			 new nlobjSearchColumn('internalid', 'file'), new nlobjSearchColumn(CONFIG.backup_fld_user)]);
	if (!isNullOrEmpty(rs)) {
		var result_arr=[];
		for (var i=0;rs && i<rs.length;i++) {
			var result_item=[];
			result_item['id']=rs[i].getId();
			result_item['date']=rs[i].getValue(CONFIG.backup_fld_date);
			result_item['desc']=rs[i].getValue(CONFIG.backup_fld_desc);
			result_item['name']=rs[i].getValue(CONFIG.backup_fld_name);
			result_item['is_public']=rs[i].getValue(CONFIG.backup_fld_public);
			result_item['file']=rs[i].getValue('internalid', 'file');
			if (!isNullOrEmpty(result_item['file'])) {
				result_item['file_link']=nlapiLookupField('file', result_item['file'], 'url');
			}
			result_item['user']=nlapiLookupField('employee', rs[i].getValue(CONFIG.backup_fld_user), 'entityid');
			result_arr.push(result_item);
		}	
		return result_arr;
	}
	return null;
}

function searchBackup(keyword) {
	var rs=nlapiSearchRecord(CONFIG.backup_rec_type, null, [[[CONFIG.backup_fld_name, 'contains', keyword], 'OR',
	                                                        [CONFIG.backup_fld_desc, 'contains', keyword]], 'AND',
	                                                        [[CONFIG.backup_fld_public, 'is', 'T'], 'OR',
	                                                         [CONFIG.backup_fld_user, 'anyof', nlapiGetUser()]]],
	                                                        [new nlobjSearchColumn(CONFIG.backup_fld_name), new nlobjSearchColumn(CONFIG.backup_fld_date),
	                                            			 new nlobjSearchColumn(CONFIG.backup_fld_desc), new nlobjSearchColumn(CONFIG.backup_fld_public),
	                                            			 new nlobjSearchColumn('internalid', 'file'), new nlobjSearchColumn(CONFIG.backup_fld_user)]);
	if (!isNullOrEmpty(rs)) {
		var result_arr=[];
		for (var i=0;rs && i<rs.length;i++) {
			var result_item=[];
			result_item['id']=rs[i].getId();
			result_item['date']=rs[i].getValue(CONFIG.backup_fld_date);
			result_item['desc']=rs[i].getValue(CONFIG.backup_fld_desc);
			result_item['name']=rs[i].getValue(CONFIG.backup_fld_name);
			result_item['is_public']=rs[i].getValue(CONFIG.backup_fld_public);
			result_item['file']=rs[i].getValue('internalid', 'file');
			if (!isNullOrEmpty(result_item['file'])) {
				result_item['file_link']=nlapiLookupField('file', result_item['file'], 'url');
			}
			result_item['user']=nlapiLookupField('employee', rs[i].getValue(CONFIG.backup_fld_user), 'entityid');
			result_arr.push(result_item);
		}
		return result_arr;
	}
	return null;
}

function isNullOrEmpty(data) {
	return (data==null||data=='');
}

function getFileURL(filename) {
	try {
		var file=nlapiSearchGlobal('file:'+filename);
		if (file!=null && file!='' && filename.length>0) {
			return nlapiLookupField('file', file[0].getId(), 'url');
		}
	}
	catch (err) {
		nlapiLogExecution('DEBUG', 'Image Error', err.message);
	}
	return '';
}
