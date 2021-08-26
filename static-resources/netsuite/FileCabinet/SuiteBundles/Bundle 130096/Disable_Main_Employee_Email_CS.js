/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 May 2016     fteves
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */

{
	FLD_MAIN_EMPLOYEE = 'entityid';
	FLD_MAIN_EMPLOYEE_EMAIL = 'email';
	MAIN_EMPLOYEE_INTERNALID = '-5';
}

function pageInit_disableMainEmployeeEmail(type){
	if (type == 'edit') { 
		var idEmployee = nlapiGetRecordId(); 
		if(idEmployee == MAIN_EMPLOYEE_INTERNALID){
          	nlapiDisableField(FLD_MAIN_EMPLOYEE_EMAIL, true);
			alert('You are trying to edit the main employee record. For security purposes, E-MAIL field is set to disabled. To change it, please go to Home > Settings(portlet) > Change Email.');
			return false;
		}else{
			return true;
		}
	}
}
