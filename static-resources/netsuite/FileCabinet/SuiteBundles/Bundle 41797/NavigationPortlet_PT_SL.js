/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Jul 2014     mdeasis
 *
 */
{
	var CONFIG={
		//Labels
		title_label_id: '1',
		category_label_id: '2',
		//Lists
		label_list: 'customlist_nav_portlet_labels',
		portlet_list: 'customlist_nav_portlet_list',
		category_name: 'customlist_nav_category_name',
		shortcut_name: 'customlist_nav_shortcut_name',
		shortcut_alt_text: 'customlist_nav_shortcut_alt_txt',
		//Navigation Categories
		portlet_categories: 'customrecord_nav_por_categories',
		portlet_cat_id: 'custrecord_nav_por_cat_nav_por',
		portlet_cat_name: 'custrecord_nav_por_cat_cat_name',
		portlet_cat_image: 'custrecord_nav_por_cat_img',
		portlet_cat_order: 'custrecord_nav_por_cat_dis_ord',
		//Navigation Shortcuts
		portlet_shortcuts: 'customrecord_nav_por_shortcuts',
		portlet_short_category: 'custrecord_nav_por_sho_nav_por_cat',
		portlet_short_name: 'custrecord_nav_por_sho_shortcut_name',
		portlet_short_order: 'custrecord_nav_por_sho_dis_ord',
		portlet_short_link: 'custrecord_nav_por_sho_link',
		portlet_short_alt_text: 'custrecord_nav_por_sho_alt_text',
		//Custom record type for configuration
		config_record: 'customrecord_nav_por_config',
		suitelet_id: 'custrecord_nav_por_suitelet_id',
		suitelet_deployment: 'custrecord_nav_por_deployment',
		jquery_library: 'custrecord_nav_por_jquery',
		js_plugin: 'custrecord_nav_por_js',
		arrow_image: 'custrecord_nav_por_arrow_img'
	};
}
/**
 * @param {nlobjPortlet} portlet Current portlet object
 * @param {Number} col Column position index: 1 = left, 2 = middle, 3 = right
 * @returns {Void}
 */
function navigation_portlet(portlet, col) {
	portlet.setTitle(getTitleLabel());
	var portlet_config=getPortletConfig();
	var url=nlapiResolveURL('SUITELET', portlet_config.suitelet_id, portlet_config.suitelet_deployment);
	//Item Display Count
/*
	var def_count1=nlapiGetContext().getSetting('SCRIPT', 'custscript_nav_default_count');
    nlapiLogExecution('DEBUG', 'def_count1', def_count1);
   	var def_count;
	 	if(def_count1){
   		var columnResult = nlapiSearchRecord('customlist_nav_portlet_column',null, new nlobjSearchFilter('internalid', null, 'is', def_count1), new nlobjSearchColumn('name'));
   	    if(columnResult){
   	    	   def_count = columnResult[0].getValue('name');
   	    	   nlapiLogExecution('DEBUG', 'name', def_count);
   	    }
   	}else{
   		def_count = 4;
   	}
    
	//if (def_count && def_count=='3') {
	if (def_count && def_count==3) {
*/

        var def_count=nlapiGetContext().getSetting('SCRIPT', 'custscript_nav_default_count');
	nlapiLogExecution('DEBUG', 'def_count', def_count);
	
	if(def_count == 1){
		def_count = '3';
	}else{
		def_count = '4';
	}

        if (def_count && def_count=='3') {
		url+='&nav_count='+def_count;
	}
	//Iframe's Height
	var def_category=nlapiGetContext().getSetting('SCRIPT', 'custscript_nav_default_category');
	var page_height=240;
	if (def_category) {
		url+='&nav_default_category='+def_category;
		comp_count=navigation_getSubCategory(def_category).length;
		if (def_count) {
			page_height=getPageHeight(comp_count, parseInt(def_count));
		}
		else {
			page_height=getPageHeight(comp_count, 4);
		}
	}
	url+='&nav_id=';
	portlet.setHtml('<script type="text/javascript">'+
					//'function getIFrameCount() {'+
					//'	var count=0, ctr=0;'+
					//'	while (window.parent.document.getElementById("nav_frame_"+ctr)!=null) {'+
					//'		ctr++;'+
					//'		count++;'+
					//'	}'+
					//'	return count;'+
					//'}'+
					'function getRandom() {'+
					'	  var ctr=Math.floor(Math.random()*1000);'+
					'	  while(document.getElementById("nav_frame_"+ctr)!=null) {'+
					'	    ctr=Math.floor(Math.random()*10000);'+
					'	  }'+
					'	  return ctr;'+
					'}'+
					'var iframe_count=getRandom();'+
					'document.write("<iframe id=\'nav_frame_"+iframe_count+"\' src=\''+url+'"+iframe_count+"\' width=\'100%\' height=\''+page_height+'px\' align=\'center\' scrolling=\'no\' style=\'margin: 0; padding: 0; border: 0;\'></iframe>");'+
					'</script>');
	
}

function navigation_suitelet(request, response) {
	//Configuration
	var portlet_config=getPortletConfig();
	//Portlet Item Display Count
	var nav_count=request.getParameter('nav_count');
	if (nav_count && nav_count=='3') {
		response.write('<input type="hidden" value="'+nav_count+'" name="nav_count" id="nav_count"/>');
	}
	//var form=nlapiCreateForm(CONFIG.title, true);
	//var fld=form.addField('suitelet_dom', 'inlinehtml');
	//fld.setDefaultValue(getCSS()+getHTML());
	//form.setScript(CONFIG.script_id);
	//response.writePage(form);
	//var response=new nlobjResponse();
	response.write('<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">');
	response.write('<html>');
	response.write('<meta http-equiv="X-UA-Compatible" content="IE=8" />');
	response.write('<head>');
	response.write('<link rel="stylesheet" type="text/css" href="/uirefresh/css/fonts.css" />');
	response.write(getCSS(nav_count!=null?nav_count:4));
	response.write('<script type="text/javascript" src="'+nlapiLoadFile(portlet_config.jquery_library).getURL()+'"></script>');
	//response.write('<script type="text/javascript" src="'+CONFIG.slimscroll_library+'"></script>');
	response.write('<script type="text/javascript" src="'+nlapiLoadFile(portlet_config.js_plugin).getURL()+'"></script>');
	response.write('</head>');
	response.write('<body>');
	response.write(getHTML(portlet_config.arrow_image, nav_count!=null?nav_count:4));
	var def_category=request.getParameter('nav_default_category');
	if (def_category) {
		response.write('<input type="hidden" value="'+def_category+'" name="nav_default_category" id="nav_default_category"/>');
	}
	//Iframe Portlet Unique Identifier
	var nav_id=request.getParameter('nav_id');
	if (nav_id) {
		response.write('<input type="hidden" value="'+nav_id+'" name="nav_id" id="nav_id"/>');
	}
	response.write('</body>');
	response.write('</html>');
}

function getCSS(row_count) {
	var css_code='<style>'+
				 '* {font-family: Open Sans,Arial,Tahoma,sans-serif;}'+
				 'root {'+
				 '	font-family: Open Sans,Arial,Tahoma,sans-serif;'+
				 '	font-size: 12px;'+
				 '}'+
				 'body {'+
				 '	margin: 0;'+
				 '	padding: 0;'+
				 '}'+
				 '.nav_wrapper {'+
				 //'	display: block;'+
				 //'	position: relative;'+
				 //'	min-width: 100%;'+
				 //'	width: 1360px;'+
				 //'	box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);'+
				 '}'+
				 '.nav_category {'+
				 '	display: block;'+
				 '	position: relative;'+
				 //'	width: 100%;'+
				 '	height: 44px;'+
				 //'	background-color: #F7F7F7;'+
				 //'	background-color: #5c7499;'+
				 //'background-color: #DFE4EB;'+
				 '}'+
				 '.nav_category a {'+
				 '	text-decoration: none;'+
				 '}'+
				 '.nav_menu {'+
				 '	display: block;'+
				 '	position: relative;'+
				 '	width: 28px;'+
				 //'	padding: 10px 5px 6px;'+
'margin: 10px 5px 6px;'+
				 '	float: left;'+
				 '}'+
				 '.nav_bar {'+
				 '	display: block;'+
				 '	position: relative;'+
				 //'	box-shadow: 1px 1px 1px #CCC;'+
				 '	height: 3px;'+
				 '	width: 22px;'+
				 '	background-color: #255599;'+
				 //'	background-color: #f5f5f5;'+
				 '	border-radius: 1px;'+
				 '	margin: 0 3px 5px;'+
				 '	font-size: 0;'+//IE tricks
				 '}'+
				 '.nav_category_list {'+
				 '	display: block;'+
				 //'	position: relative;'+
				 '	position: absolute;'+
				 '	width: 240px;'+
				 '	overflow: hidden;'+
				 '	background-color: #F7F7F7;'+
				 //'	background-color: #5c7499;'+
				 //'	top: 40px;'+
				 //'	left: 0;'+
				 'top: 30px;'+
				 'left: 8px;'+
				 '	z-index: 99;'+
				 '}'+
				 '.nav_category_list ul {'+
				 '	list-style: none;'+
				 '	padding: 0;'+
				 '	margin: 0;'+
				 '	display: block;'+
				 '	position: relative;'+
				 '}'+
				 '.nav_category_list li {'+
				 '	display: block;'+
				 '	position: relative;'+
				 '	margin: 0 10px;'+
				 '	padding: 10px 0;'+
				 '	border-top: 1px solid rgba(36,56,91,0.15);'+
				 '	border-bottom: 1px solid rgba(36,56,91,0.15);'+
				 //'	border-top: 1px solid #FFF;'+
				 //'	border-bottom: 1px solid #FFF;'+
				 '	margin-top: -1px;'+
				 '	height: 21px;'+
				 '}'+
				 '.nav_category_list a {'+
				 '	color: #607998;'+
				 //'	color: #FFF;'+
				 '	font-size: 14px;'+
				 '	text-decoration: none;'+
				 '}'+
				 '.nav_label {'+
				 '	float: left;'+
				 '	font-size: 14px;'+
				 '	font-weight: 700;'+
				 //'	height: 40px;'+
				 'height: 14px;'+
'line-height: 14px;'+
'margin-top: 13px;'+
//'	line-height: 40px;'+
				 '	color: #255599;'+
				 //'	color: #FFF;'+
				 //'	text-shadow: 1px 1px 1px #CCC;'+
				 //'	text-shadow: 1px 1px 1px #333;'+
				 //'	letter-spacing: 0.5px;'+
				 '}'+
				 '.nav_active_category {'+
				 '	float: left;'+
				 '	font-size: 14px;'+
				 '	color: #255599;'+
				 //'	color: #FFF;'+
				 '	height: 40px;'+
				 '	line-height: 40px;'+
				 '	font-weight: 700;'+
				 //'	letter-spacing: 0.5px;'+
				 //'	text-shadow: 1px 1px 1px #CCC;'+
				 //'	text-shadow: 1px 1px 1px #333;'+
				 '}'+
				 '.nav_active_arrow {'+
				 '	width: 24px;'+
				 '	height: 24px;'+
				 '	float: left;'+
				 '	margin: 8px 3px 0;'+
				 '}'+
				 '.nav_subcategory{'+
				 '	display: block;'+
				 '	position: relative;'+
				 '	width: 100%;'+
				 //'	height: 180px;'+
				 '}'+
				 '.nav_item img {width: 60px; height: 63px; margin-right: 5px;}'+
			 	 '.nav_item {';
			 //	 '	display: block;'+
			 	 //'	position: absolute;'+
			 //	 '	position: relative;'+
			 	// '	float: left;'+
			 //	 '	padding: 10px;';
			//if (row_count==3||row_count=='3') {
			// 	 css_code+='	width: 400px;';
			//}
			//else {
			//	css_code+='	width: 300px;';
			//}
	   css_code+='	height: auto;'+
			 	 '	min-height: 85px;'+
			 	 '	background-color: #FFF;'+
			 	 '	padding-left: 5px;'+
				 '}'+
				 '.nav_item h2 {'+
				 '	color: #255599;'+
				 '	font-size: 14px;'+
				 '	margin: 0 0 10px;'+
				 '}'+
				 '.nav_img, .nav_link {'+
				 '	display: block;'+
				 '	position: relative;'+
				 '	float: left;'+
				 '}'+
				 '.nav_link ul {'+
				 '	list-style: none;'+
				 '	margin: 0 0 0 5px;'+
				 '	padding: 0;'+
				 '}'+
				 '.nav_link a {'+
				 '	font-size: 14px;'+
				 '	color: #255599;'+
				 '	text-decoration: none;'+
				 '}'+
				 '.nav_link a:hover {'+
				 '	text-decoration: underline;'+
				 '}'+
				 '.nav_item_holder {'+
				 //'	display: block;'+
				 //'	position: relative;'+
				 //'	width: 100%;'+
				 //'	height: 100%;'+
				 '}'+
				 '.nav_scroller_up, .nav_scroller_down {'+
				 '	display: block;'+
				 '	position: relative;'+
				 '	text-align: center;'+
				 '	height: 20px;'+
				 '	margin: 0 10px;'+
				 '	background-color: #F7F7F7;'+
				 //'	background-color: #5c7499;'+
				 '	z-index: 100;'+
				 '}'+
				 '.nav_scroller_up {'+
				 '	border-bottom: 1px solid rgba(36,56,91,0.15);'+
				 //'	border-bottom: 1px solid #FFF;'+
				 '}'+
				 '.nav_scroller_down {'+
				 '	border-top: 1px solid rgba(36,56,91,0.15);'+
				 //'	border-top: 1px solid #FFF;'+
				 '}'+
				 '.nav_scroller_up a, .nav_scroller_down a{'+
				 '	vertical-align: top;'+
				 '}'+
				 '.borderNone, .nav_category_list .borderNone {'+
				 '	border: none;'+
				 '}'+
				 '.displayNone {'+
				 '	display: none;'+
				 '}'+
				 '.clearB {'+
				 '	clear: both;'+
				 '}'+
				 '</style>';
	return css_code;
}

function getHTML(arrow_img, row_count) {
	//Portlet List
	var portlet_list=navigation_getPortletList();
	//Category List
	var category_list=navigation_getUniqueKey(portlet_list, CONFIG.portlet_cat_id+'-txt', CONFIG.portlet_cat_id);
	var html_code='<table width="100%" cellpadding="0" cellspacing="0" class="nav_wrapper">'+
				 '		<tr>'+
				 '			<td width="100%" class="nav_category">'+
				 '				<a href="#">'+
				 '					<div class="nav_menu">'+
				 '						<span class="nav_bar"></span>'+
				 '						<span class="nav_bar"></span>'+
				 '						<span class="nav_bar"></span>'+
				 '					</div>'+
				 '					<span class="nav_label">'+getCategoryLabel()+'</span>'+
				 '				</a>'+
				 '				<div class="nav_category_list displayNone">'+
				 '					<ul>';
	//Category List
	for (var i=0;category_list && i<category_list.length;i++) {
	  //html_code+='				<li'+(((i==0)||(i==category_list.length-1))?' class="borderNone"':'')+' id="nav_category_'+category_list[i]['id']+'">'+
		html_code+='					<li id="nav_category_'+category_list[i]['id']+'">'+
				 '							<a href="#">'+category_list[i]['name']+'</a>'+
				 '						</li>';
	}
	  html_code+='					</ul>'+
				 '				</div>'+
				 '				<img class="nav_active_arrow" src="'+nlapiLoadFile(arrow_img).getURL()+'" />'+
				 '				<span class="nav_active_category">&#160;</span>'+
				 '				<div class="clearB"></div>'+
				 '			</td>'+
				 '		</tr>'+
	//Category List
				 '		<tr>'+
				 '			<td width="100%" class="nav_subcategory">'+
				 '				<table width="100%" cellspacing="0" cellpadding="0">';
	//Sub category List
	for (var i=0;category_list && i<category_list.length;i++) {
	  var sub_category=navigation_getSubCategory(category_list[i]['id']);
          //<<--
          //CASE 3: NO ACTIVE SUBCATEGORY
          //-->>
          if (sub_category && sub_category.length==0) {
                        html_code+=     '<tr class="nav_item_holder'+(i>0?' displayNone':'')+'">'+
                                                                        '               <td class="nav_item" align="center" valign="middle" id="no_active_category_flag" style="height: 85px !important;">There is no active categories to display in this portlet.</td>'+
                                                                        '</tr>';
          }
          //<<--
          //CASE 3: NO ACTIVE SUBCATEGORY
          //-->>

	  //<<--
	  //CASE 1: NORMAL SIZE
	  //-->>
	  if (sub_category && sub_category.length<=row_count) {
		  for (var j=0;sub_category && j<sub_category.length;j++) {
			  if (j%row_count==0) {
				  if (j>0) {
					  html_code+='<tr><td colspan="'+row_count+'" height="20px"></td></tr>';
				  }
				  html_code+='		<tr class="nav_item_holder'+(i>0?' displayNone':'')+'">';
			  }
			  html_code+='			<td valign="top" width="'+(100.00/row_count)+'%" class="nav_item">'+
						 '				<h2>'+sub_category[j][CONFIG.portlet_cat_name+'-txt']+'</h2>'+
						 '				<div class="nav_img">'+
						 '					<img src="'+sub_category[j]['url']+'" />'+
						 '				</div>'+
						 '				<div class="nav_link">'+
						 '					<ul>';
			  var shortcut=navigation_getPortletShortcut(sub_category[j]['id']);
			  for (var k=0;shortcut && k<shortcut.length;k++) {
			  html_code+='						<li><a target="_blank" title="'+shortcut[k][CONFIG.portlet_short_alt_text]+'" href="'+shortcut[k][CONFIG.portlet_short_link]+'">'+shortcut[k][CONFIG.portlet_short_name+'-txt']+'</a></li>';
			  }
			  html_code+='					</ul>'+
						 '				</div>'+
						 '				<div class="clearB"></div>'+
						 '			</td>';
			  if (j%row_count==row_count-1) {
				  html_code+='		</tr>';
			  }
		  }
	  }
	  //<<--
	  //CASE 1: NORMAL SIZE
	  //-->>
	  
	  //<<--
	  //CASE 2: ABNORMAL SIZE 
	  //-->>
	  else if (sub_category && sub_category.length>row_count) {
		  html_code+='		<tr class="nav_item_holder'+(i>0?' displayNone':'')+'">'+
		  			 '			<td width="100%" colspan="'+row_count+'">'+
		  			 '				<table width="100%" cellspacing="0" cellpadding="0">';
		  for (var j=0;sub_category && j<sub_category.length;j++) {
			  if (j%row_count==0) {
				  if (j>0) {
					  html_code+='<tr><td colspan="'+row_count+'" height="20px"></td></tr>';
				  }
				  html_code+='		<tr>';
			  }
			  html_code+='			<td valign="top" width="'+(100.00/row_count)+'%" class="nav_item">'+
						 '				<h2>'+sub_category[j][CONFIG.portlet_cat_name+'-txt']+'</h2>'+
						 '				<div class="nav_img">'+
						 '					<img src="'+sub_category[j]['url']+'" />'+
						 '				</div>'+
						 '				<div class="nav_link">'+
						 '					<ul>';
			  var shortcut=navigation_getPortletShortcut(sub_category[j]['id']);
			  for (var k=0;shortcut && k<shortcut.length;k++) {
			  html_code+='						<li><a target="_blank" title="'+shortcut[k][CONFIG.portlet_short_alt_text]+'" href="'+shortcut[k][CONFIG.portlet_short_link]+'">'+shortcut[k][CONFIG.portlet_short_name+'-txt']+'</a></li>';
			  }
			  html_code+='					</ul>'+
						 '				</div>'+
						 '				<div class="clearB"></div>'+
						 '			</td>';
			  if (j%row_count==row_count-1) {
				  html_code+='		</tr>';
			  }
		  }
		  html_code+='				</table>'+
		  			 '			</td>'+
		  			 '		</tr>';
	  }
	  //<<--
	  //CASE 2: ABNORMAL SIZE 
	  //-->>
	}
	  html_code+='				</table>'+
				 '			</td>'+
				 '		</tr>'+
	  			 '</table>';
	return html_code;
}

function navigation_getPortletList() {
	var category_id=new nlobjSearchColumn(CONFIG.portlet_cat_id);
	category_id.setSort();
	var result_set=nlapiSearchRecord(CONFIG.portlet_categories, null, null, [category_id,
	                                                          new nlobjSearchColumn(CONFIG.portlet_cat_name),
	                                                          new nlobjSearchColumn(CONFIG.portlet_cat_image),
	                                                          new nlobjSearchColumn(CONFIG.portlet_cat_order)]);
	if (result_set==null) {
		return null;
	}
	else {
		var result_arr=new Array();
		for (var i=0;i<result_set.length;i++) {
			var result_item=new Array();
			result_item['id']=result_set[i].getId();
			result_item[CONFIG.portlet_cat_id]=result_set[i].getValue(CONFIG.portlet_cat_id);
			result_item[CONFIG.portlet_cat_id+'-txt']=result_set[i].getText(CONFIG.portlet_cat_id);
			result_item[CONFIG.portlet_cat_name]=result_set[i].getValue(CONFIG.portlet_cat_name);
			result_item[CONFIG.portlet_cat_name+'-txt']=result_set[i].getText(CONFIG.portlet_cat_name);
			result_item[CONFIG.portlet_cat_image]=result_set[i].getValue(CONFIG.portlet_cat_image);
			result_item[CONFIG.portlet_cat_order]=result_set[i].getValue(CONFIG.portlet_cat_order);
			result_arr.push(result_item);
		}
		return result_arr;
	}
}

function navigation_getSubCategory(category_name) {
	var category_id=new nlobjSearchColumn(CONFIG.portlet_cat_order);
	category_id.setSort();
	var img_url=new nlobjSearchColumn('formulatext');
	img_url.setFormula('{'+CONFIG.portlet_cat_image+'}');
	var result_set=nlapiSearchRecord(CONFIG.portlet_categories, null, [new nlobjSearchFilter(CONFIG.portlet_cat_id, null, 'is', category_name), 
                                                                  new nlobjSearchFilter('isinactive', null, 'is', 'F')], 
                                                                  [category_id,
	                                                          new nlobjSearchColumn(CONFIG.portlet_cat_name),
	                                                          new nlobjSearchColumn(CONFIG.portlet_cat_image),
	                                                          new nlobjSearchColumn(CONFIG.portlet_cat_id),
	                                                          img_url]);
	/*if (result_set==null) {
		return null;
	}
	else {
		var result_arr=new Array();
		for (var i=0;i<result_set.length;i++) {
			var result_item=new Array();
			result_item['id']=result_set[i].getId();
			result_item[CONFIG.portlet_cat_id]=result_set[i].getValue(CONFIG.portlet_cat_id);
			result_item[CONFIG.portlet_cat_id+'-txt']=result_set[i].getText(CONFIG.portlet_cat_id);
			result_item[CONFIG.portlet_cat_name]=result_set[i].getValue(CONFIG.portlet_cat_name);
			result_item[CONFIG.portlet_cat_name+'-txt']=result_set[i].getText(CONFIG.portlet_cat_name);
			result_item[CONFIG.portlet_cat_image]=result_set[i].getValue(CONFIG.portlet_cat_image);
			result_item['url']=result_set[i].getValue('formulatext');
			result_item[CONFIG.portlet_cat_order]=result_set[i].getValue(CONFIG.portlet_cat_order);
			result_arr.push(result_item);
		}
		return result_arr;
	}*/
        var result_arr=new Array();
        if (result_set!=null) {
                        for (var i=0;i<result_set.length;i++) {
                                        var result_item=new Array();
                                        result_item['id']=result_set[i].getId();
                                result_item[CONFIG.portlet_cat_id]=result_set[i].getValue(CONFIG.portlet_cat_id);
                                        result_item[CONFIG.portlet_cat_id+'-txt']=result_set[i].getText(CONFIG.portlet_cat_id);
                                result_item[CONFIG.portlet_cat_name]=result_set[i].getValue(CONFIG.portlet_cat_name);
                                        result_item[CONFIG.portlet_cat_name+'-txt']=result_set[i].getText(CONFIG.portlet_cat_name);
                                result_item[CONFIG.portlet_cat_image]=result_set[i].getValue(CONFIG.portlet_cat_image);
                                        result_item['url']=result_set[i].getValue('formulatext');
                                result_item[CONFIG.portlet_cat_order]=result_set[i].getValue(CONFIG.portlet_cat_order);
                                        result_arr.push(result_item);
                        }
        }
        return result_arr;//To return an array object regardless of the number of active subcategories

}

function navigation_getUniqueKey(list_arr, arr_key, arr_id) {
	if (list_arr==null)
		return null;
	else {
		var result_arr=new Array();
		for (var i=0;i<list_arr.length;i++) {
			var exists=false;
			for (var j=0;j<result_arr.length;j++) {
				if (list_arr[i][arr_key]==result_arr[j]['name']) {
					exists=true;
				}
			}
			if (!exists) {
				var item=new Array();
				item['name']=list_arr[i][arr_key];
				item['id']=list_arr[i][arr_id];
				result_arr.push(item);
			}
		}
		return result_arr;
	}
}


function navigation_getPortletShortcut(category_id) {
	var shortcut_order=new nlobjSearchColumn(CONFIG.portlet_short_order);
	shortcut_order.setSort();
	var result_set=nlapiSearchRecord(CONFIG.portlet_shortcuts, null, [new nlobjSearchFilter(CONFIG.portlet_short_category, null, 'is', category_id)],
			[shortcut_order,
	         new nlobjSearchColumn(CONFIG.portlet_short_category),
	         new nlobjSearchColumn(CONFIG.portlet_short_name),
	         new nlobjSearchColumn(CONFIG.portlet_short_link), 
	         new nlobjSearchColumn(CONFIG.portlet_short_alt_text)]);
	if (result_set==null) {
		return null;
	}
	else {
		var result_arr=new Array();
		for (var i=0;i<result_set.length;i++) {
			var result_item=new Array();
			result_item['id']=result_set[i].getId();
			result_item[CONFIG.portlet_short_category]=result_set[i].getValue(CONFIG.portlet_short_category);
			result_item[CONFIG.portlet_short_name]=result_set[i].getValue(CONFIG.portlet_short_name);
			result_item[CONFIG.portlet_short_name+'-txt']=result_set[i].getText(CONFIG.portlet_short_name);
			result_item[CONFIG.portlet_short_link]=result_set[i].getValue(CONFIG.portlet_short_link);
			result_item[CONFIG.portlet_short_alt_text]=result_set[i].getText(CONFIG.portlet_short_alt_text);
			result_item[CONFIG.portlet_short_order]=result_set[i].getValue(CONFIG.portlet_short_order);
			result_arr.push(result_item);
		}
		return result_arr;
	} 
}

function getPageHeight(comp_count, row_count) {
	var page_height=0;
	page_height+=40;//nav_category
	page_height+=175*computeNumOfRow(comp_count, row_count);//nav_subcategory
	return page_height;
}

function computeNumOfRow(comp_count, row_count) {
	if (comp_count>row_count)
		return 1+computeNumOfRow(comp_count-row_count, row_count);
	else
		return 1;
}

function getPortletConfig() {
	var config_set=nlapiSearchRecord('customrecord_nav_por_config', null, null, [new nlobjSearchColumn(CONFIG.suitelet_id),
	                                                              new nlobjSearchColumn(CONFIG.suitelet_deployment), 
	                                                              new nlobjSearchColumn(CONFIG.jquery_library), 
	                                                              new nlobjSearchColumn(CONFIG.js_plugin), 
	                                                              new nlobjSearchColumn(CONFIG.arrow_image)]);
	if (config_set==null) {
		return null;
	}
	return {
		suitelet_id: config_set[0].getValue(CONFIG.suitelet_id),
		suitelet_deployment: config_set[0].getValue(CONFIG.suitelet_deployment),
		jquery_library: config_set[0].getValue(CONFIG.jquery_library),
		js_plugin: config_set[0].getValue(CONFIG.js_plugin),
		arrow_image: config_set[0].getValue(CONFIG.arrow_image)
	};
}

function getTitleLabel() {
	var result_set=nlapiSearchRecord(CONFIG.label_list, null, [new nlobjSearchFilter('internalid', null, 'is', CONFIG.title_label_id)],
																			[new nlobjSearchColumn('name')]);
	if (result_set==null) {
		return null;
	}
	else {
		return result_set[0].getValue('name');
	}
}

function getCategoryLabel() {
	var result_set=nlapiSearchRecord(CONFIG.label_list, null, [new nlobjSearchFilter('internalid', null, 'is', CONFIG.category_label_id)],
																			[new nlobjSearchColumn('name')]);
	if (result_set==null) {
		return null;
	}
	else {
		return result_set[0].getValue('name');
	}
}
