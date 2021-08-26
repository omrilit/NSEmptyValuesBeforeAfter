/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
/**
 * @param {record} record
 * @param {search} search
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
    	
    	var sdguEmployee, sdguEmployeeRole;
    	var searchEmployeeSDGU = search.load({
    		id: 'customsearch_fmt_sdg_uruguay_employee'
    	});
    		
    	searchEmployeeSDGU.run().each(function(result) {
    		sdguEmployee = result.getValue('internalid');
    		sdguEmployeeRole = result.getValue('role');
    		return true;
    	});
    		    		    		
    	var currentEmployeeRecord = scriptContext.currentRecord;
    	var employeeId = currentEmployeeRecord.id;
    	var sGiveAccess = currentEmployeeRecord.getValue('giveaccess');
    	
    	if(employeeId == sdguEmployee){
    		alert('Make sure Administrator access is assigned to the employee before saving the record.');
    		if(sGiveAccess == false){
				currentEmployeeRecord.setValue('giveaccess', true);
			}
    		
    		if(sdguEmployeeRole == null || sdguEmployeeRole != 3){
    			currentEmployeeRecord.setCurrentSublistValue('roles', 'selectedrole', '3');
    		}
    	}
    }

    return {
        pageInit: pageInit,
    };
    
});
