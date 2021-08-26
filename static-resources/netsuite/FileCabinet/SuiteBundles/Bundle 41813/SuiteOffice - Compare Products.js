/**
 * Module Description
 * 
 *  Version        Date            Author           Remarks
 *   1.00       sep 23 2014     Alfonso Terron
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type){
	renderForm(type);	
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){
	
	var i         = 0,
	currentFields = getCurrentFields();
	
	jQuery('#sortFields li').each(function(){		
		jQuery(this).data('index', i++);		
	}); 
		
	if(currentFields && currentFields.length){
	
		for(i in currentFields)			
			currentFields[i].position = jQuery('#sortFields .' + currentFields[i].id).data('index');	
			
		saveFields(currentFields);
	}

	loading('show');
	
	nlapiSetFieldValue('custrecord_order_fields', getFieldContent().html());
	
    return true;
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
function clientFieldChanged(type, name, linenum){ 
	
	try{
		
		showError('type = ' + type + ' name = ' + name + ' linenum = ' + linenum, 'clientFieldChanged');
		
		if(name == 'custrecord_compare_fields'){
			
			var fieldsIDS = nlapiGetFieldValues('custrecord_compare_fields') || null,
			fieldsNames   = nlapiGetFieldTexts('custrecord_compare_fields') || null,
			arrFields     = [];			
						
			showError(fieldsIDS, 'FoeldsID');
			showError(fieldsNames, 'FieldsNames');
						
			if(fieldsIDS){
				
				for(f in fieldsIDS){
					var field  = {};
					
					field.recID    = fieldsIDS[f];
					field.id       = nlapiLookupField('customrecord_wd_compare_fields', fieldsIDS[f],'custrecord_internalid_2');				
					field.name     = fieldsNames[f];
					field.position = '';
					
					arrFields.push( field );
					
				}
				
				saveFields(arrFields);
				refreshTable(arrFields);
				
			}
						
		}	
	
	}catch(e){ showError(e, 'clientFieldChanged'); }
}

function saveFields(arrFields){
	
	nlapiSetFieldValue('custrecord_hash_fields',
		JSON.stringify(
			arrFields.sort(function(a,b){ return parseInt(a.position)>parseInt(b.position);})
		)	
	);
}

function getCurrentFields(){
	arrFields = nlapiGetFieldValue('custrecord_hash_fields') || null;	
	return arrFields ? JSON.parse(nlapiGetFieldValue('custrecord_hash_fields')) : [];
}

function existCurrentSort(currentFields, id){
	var textSearch = '"'+id+'"';	
	return JSON.stringify(currentFields).match(textSearch);	
}

function renderForm(type){
	
	getFieldContent().html(getTemplatesTableFields());		
	
	//** Render to edit new compare record
	if(type == 'edit')		
		loadCurrentDataSort();
	
	jQuery(function  () { jQuery("ul#sortFields").sortable(); });
	
}

function loadCurrentDataSort(){
	
	try{
	
		var currentConfig = nlapiGetFieldValue('custrecord_hash_fields') || null;			
		if(currentConfig){
			currentConfig = JSON.parse(currentConfig);
			refreshTable(currentConfig);		
		}		
	
	}catch(e){ showError(e, 'loadCurrentDataSort'); }
}

function refreshTable(fieldsList){
	
	try{	
				
		var tableConfig = jQuery('#sortFields');		
		tableConfig.empty();		
		for(i in fieldsList){
			var field = fieldsList[i];		
			tableConfig.append(
					getTemplateField().replace(/{{fieldName}}/ig, field.name)
					    			  .replace(/{{fieldid}}/ig, field.id)					
			);
		}
	
	}catch(e){ showError(e, 'refreshTable'); }
	
}

function getTemplatesTableFields(){
	return '<link href="/site/suiteoffice/css/jq.sortable.css" rel="stylesheet">'+
		   '<ul id="sortFields" class="vertical simple_with_animation"></ul><script src="/site/suiteoffice/js/jquery-sortable.js"></script>';
}

function getTemplateField(){
	return '<li class="{{fieldid}}">{{fieldName}}</li>';
}

function getFieldContent(){
	return jQuery('#custrecord_order_fields_fs').length ? jQuery('#custrecord_order_fields_fs') : jQuery('#custrecord_order_fields_val'); 
}

function loading(acction){
	if(acction == 'show')
		getFieldContent().parent().prepend('<img id="orderloading" src="/site/suiteoffice/img/loader-48.gif"/>');
	else
		jQuery('#orderloading').remove();
}

function showError(e, title){
	console.log(title||'Show Error: ', e);
}