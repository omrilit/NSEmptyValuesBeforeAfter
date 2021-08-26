/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 Aug 2015     fteves
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
{
	FLD_EMPLOYEE = 'entityid';
	MAIN_EMPLOYEE = '-5';
	
	SUBLIST_ROLES = 'roles';
	FLD_COL_ROLE = 'selectedrole';
	ADMIN_ROLE = '3'; //Administrator
}

function setAdminAccess_SaveRecord(){
	var idEmployee = nlapiGetRecordId(); 
	var sFlag = false;
	if(idEmployee == MAIN_EMPLOYEE){
		var nRoleCount = nlapiGetLineItemCount(SUBLIST_ROLES);
		if(nRoleCount > 0) {
			for(var i = 1; i <= nRoleCount; i++) {
				var idRole = nlapiGetLineItemValue(SUBLIST_ROLES, FLD_COL_ROLE, i);
				if(idRole == ADMIN_ROLE){
					sFlag = true;
					break;
				}
			}
		}
		//alert('sFlag=' + sFlag);
		if(sFlag == true){
			return true;
		}else{
			alert('Please add administrator role to this user.');
			return false;
		}	
	}else{
		return true;
	}
}
