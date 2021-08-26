/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
/**
 * @param {record} record
 */
function(record, search) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
	function pageInit(scriptContext) {
		if (scriptContext.mode !== 'edit')
			return;
		
		var deEmployee, deEmployeeRole;
		var searchEmployeeDE = search.load({
			id: 'customsearch_fmt_de_employee'
		});
    		
		searchEmployeeDE.run().each(function(result) {
			deEmployee = result.getValue('internalid');
			deEmployeeRole = result.getValue('role');
			return true;
		});
    		    		    		
		var currentEmployeeRecord = scriptContext.currentRecord;
		var employeeId = currentEmployeeRecord.id;
		var sGiveAccess = currentEmployeeRecord.getValue('giveaccess');
		
		if(employeeId == deEmployee){
			alert('Make sure Administrator access is assigned to the employee before saving the record.');
			if(sGiveAccess == false){
				currentEmployeeRecord.setValue('giveaccess', true);
			}
			
			if(deEmployeeRole == null || deEmployeeRole != 3){
				currentEmployeeRecord.setCurrentSublistValue('roles', 'selectedrole', '3');
			}
		}
    }

    return {
        pageInit: pageInit,
    };
    
});
