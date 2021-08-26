/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 May 2015     dgeronimo
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function texValidationclientPageInit(type){
    texValidationclientFieldChanged(type,CUSTRECORD_NSTS_TEX_RECORD_TYPE,0);
    texValidationclientFieldChanged(type,CUSTRECORD_NSTS_TEX_RETURN_TYPE,0);
    texValidationclientFieldChanged(type,CUSTRECORD_NSTS_TEX_DATA_FEED);
}

/**
Check if duplicate record
 */
function checkDupDefault()
{
	var bDefault = false;

		try{
			var id = null;
			try{
				id = nlapiGetRecordId();
			}catch(err){
				
			}
			var filters = new Array();
			
			var recType = nlapiGetFieldValue('custrecord_nsts_tex_record_type');
			var bdef = nlapiGetFieldValue('custrecord_nsts_tex_default_checkbox');
			var inactive = nlapiGetFieldValue('isinactive');
			if(recType && bdef == 'T'){
				filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
				filters.push(new nlobjSearchFilter('custrecord_nsts_tex_record_type', null, 'anyof', recType));
				filters.push(new nlobjSearchFilter('custrecord_nsts_tex_default_checkbox', null, 'is', 'T'));
				var results = nlapiSearchRecord('customrecord_nsts_tex_html_template', null, filters);
				if(results){					
					if(results.length > 1){
						bDefault = true;
					}else{
						if(results[0].getId() != id)
							bDefault= true;
					}
				}
			}

			
		}catch(error){
			
		}
		return bDefault;
	
}
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function texValidationclientSaveRecord(){
    var stError = [];
    var stErrorCount = 0;
    
    var stRectype = nlapiGetFieldValue(CUSTRECORD_NSTS_TEX_RECORD_TYPE);
    var stEntity = nlapiGetFieldValue(CUSTRECORD_NSTS_TEX_ENTITY_TYPE);
    var stCRM = nlapiGetFieldValue(CUSTRECORD_NSTS_TEX_CRM_TYPE);
    
    var intrectypeCount = 0;
    if(!isEmpty(stRectype)){
        intrectypeCount++;
    }
	else if(!isEmpty(stEntity)){
        intrectypeCount++;
    }else if(!isEmpty(stCRM)){
        intrectypeCount++
    }
    
    if(intrectypeCount == 0){
        stErrorCount++;
        stError.push("Please select a record type.");
    }else if (intrectypeCount>1){
        stErrorCount++;
        stError.push("Multiple Record Type is not allowed");
    }
    
    var retType =  nlapiGetFieldValue(CUSTRECORD_NSTS_TEX_RETURN_TYPE);
    if(retType == RETURN_FILE){
        var stfilename = nlapiGetFieldValue(CUSTRECORD_NSTS_TEX_DEFAULT_FILE_NAME);
        var stFolder = nlapiGetFieldValue(CUSTRECORD_NSTS_TEX_TARGET_DIRECTORY);
        
        if(isEmpty(stfilename)){
            stError.push("Default Filename is Required")
            stErrorCount++;
        }
        if(isEmpty(stFolder)){
            stError.push("Target Directory is Required")
            stErrorCount++;
        }
        if(!isEmpty(stFolder)){
            if(!isFolderExist(stFolder)){
                stError.push("Folder not Exist in the file Cabinet")
                stErrorCount++;
            }
        }
        
    }
    if(checkDupDefault() && stErrorCount == 0){

        stError.push("You can only choose one default template on bulk printing for a specific record.")
        stErrorCount++;
    }
    

    
    if(stErrorCount > 0){
        alert(stError.join("\n"));
        return false;
    }
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
function texValidationclientFieldChanged(type, name, linenum){    
    if(name == CUSTRECORD_NSTS_TEX_RECORD_TYPE || name == CUSTRECORD_NSTS_TEX_ENTITY_TYPE || name == CUSTRECORD_NSTS_TEX_CRM_TYPE){
        var stRectype = nlapiGetFieldValue(CUSTRECORD_NSTS_TEX_RECORD_TYPE);
        var stEntity = nlapiGetFieldValue(CUSTRECORD_NSTS_TEX_ENTITY_TYPE);
        var stCRM = nlapiGetFieldValue(CUSTRECORD_NSTS_TEX_CRM_TYPE);
        
        nlapiDisableField(CUSTRECORD_NSTS_TEX_RECORD_TYPE, false);
        nlapiDisableField(CUSTRECORD_NSTS_TEX_ENTITY_TYPE, false);
        nlapiDisableField(CUSTRECORD_NSTS_TEX_CRM_TYPE, false);
        
        if(!isEmpty(stRectype)){
            nlapiDisableField(CUSTRECORD_NSTS_TEX_ENTITY_TYPE, true);
            nlapiDisableField(CUSTRECORD_NSTS_TEX_CRM_TYPE, true);
            
            nlapiDisableField(CUSTRECORD_NSTS_TEX_DEFAULT_CHECKBOX, false);
            nlapiDisableField(CUSTRECORD_NSTS_TEX_EMAIL_SUBJECT, false);
            nlapiDisableField(CUSTRECORD_NSTS_TEX_EMAIL_TEMPLATE, false);
            
        }else if(!isEmpty(stEntity)){
            nlapiDisableField(CUSTRECORD_NSTS_TEX_RECORD_TYPE, true);
            nlapiDisableField(CUSTRECORD_NSTS_TEX_CRM_TYPE, true);
            
            nlapiDisableField(CUSTRECORD_NSTS_TEX_DEFAULT_CHECKBOX, true);
            nlapiSetFieldValue(CUSTRECORD_NSTS_TEX_DEFAULT_CHECKBOX, '');
            nlapiDisableField(CUSTRECORD_NSTS_TEX_EMAIL_SUBJECT, true);
            nlapiSetFieldValue(CUSTRECORD_NSTS_TEX_EMAIL_SUBJECT, '');
            nlapiDisableField(CUSTRECORD_NSTS_TEX_EMAIL_TEMPLATE, true);
            nlapiSetFieldValue(CUSTRECORD_NSTS_TEX_EMAIL_TEMPLATE, '');
            
        }else if(!isEmpty(stCRM)){
            nlapiDisableField(CUSTRECORD_NSTS_TEX_RECORD_TYPE, true);
            nlapiDisableField(CUSTRECORD_NSTS_TEX_ENTITY_TYPE, true);
            
            nlapiDisableField(CUSTRECORD_NSTS_TEX_DEFAULT_CHECKBOX, true);
            nlapiSetFieldValue(CUSTRECORD_NSTS_TEX_DEFAULT_CHECKBOX, '');
            nlapiDisableField(CUSTRECORD_NSTS_TEX_EMAIL_SUBJECT, true);
            nlapiSetFieldValue(CUSTRECORD_NSTS_TEX_EMAIL_SUBJECT, '');
            nlapiDisableField(CUSTRECORD_NSTS_TEX_EMAIL_TEMPLATE, true);
            nlapiSetFieldValue(CUSTRECORD_NSTS_TEX_EMAIL_TEMPLATE, '');
        }
    }
    
    if(name == CUSTRECORD_NSTS_TEX_RETURN_TYPE){
        var retType =  nlapiGetFieldValue(name);
        if(retType == RETURN_FILE){
            nlapiSetFieldMandatory(CUSTRECORD_NSTS_TEX_DEFAULT_FILE_NAME, true);
            nlapiSetFieldMandatory(CUSTRECORD_NSTS_TEX_TARGET_DIRECTORY, true);
            
            nlapiDisableField(CUSTRECORD_NSTS_TEX_DEFAULT_FILE_NAME, false);
            nlapiDisableField(CUSTRECORD_NSTS_TEX_TARGET_DIRECTORY, false);
            nlapiDisableField('custrecord_nsts_tex_record_field_select', false);
        }else{
            nlapiSetFieldMandatory(CUSTRECORD_NSTS_TEX_DEFAULT_FILE_NAME, false);
            nlapiSetFieldMandatory(CUSTRECORD_NSTS_TEX_TARGET_DIRECTORY, false);
            
            nlapiDisableField(CUSTRECORD_NSTS_TEX_DEFAULT_FILE_NAME, true);
            nlapiDisableField(CUSTRECORD_NSTS_TEX_TARGET_DIRECTORY, true);
            nlapiDisableField('custrecord_nsts_tex_record_field_select', true);
            
            nlapiSetFieldValue(CUSTRECORD_NSTS_TEX_DEFAULT_FILE_NAME,'',false);
            nlapiSetFieldValue(CUSTRECORD_NSTS_TEX_TARGET_DIRECTORY,'',false);
            nlapiSetFieldValue('custrecord_nsts_tex_record_field_select','',false);
        }
    }
    
}
