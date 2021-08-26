/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
var psa_prm;
if (!psa_prm) psa_prm = {};

psa_prm.FilterSL = new function FilterSL() {

    this.context; 
    this.stringLiterals;
    
    this.init = function() {
        this.context = nlapiGetContext();
        this.stringLiterals = psa_prm.serverlibrary.getStringLiterals();
    };
    
    this.suiteletEntry = function (request, response) {
        try {
            this.init();
            
            nlapiLogExecution('DEBUG', 'Governance start', this.context.getRemainingUsage());
            
            var dataIn = request.getBody();
            
            if (request.getMethod() == 'GET') {
                returnData = this.getFilters(this.context);
            }
            else {
                returnData = this.saveFilter(dataIn);
            }

            nlapiLogExecution('DEBUG', 'Governance end', this.context.getRemainingUsage());
            nlapiLogExecution('DEBUG', 'returnData', JSON.stringify(returnData));
            
            response.write(JSON.stringify(returnData));
        }
        catch(ex) {
            var errorCode = ex.name || ex.getCode(),
                errorMessage = ex.message || ex.getDetails();

            nlapiLogExecution('ERROR', errorCode, errorMessage);
            
            response.write(JSON.stringify({
                success : false,
                message : errorCode + ' : '  + errorMessage
            }));
        }
    };
    
    this.getFilters = function(context) {
        var returnData = {
            success : true,
            message : 'Filters Loaded',
            total : 0,
            data : []
        };
            
        returnData.data.push({
            id : 0,
            name : this.stringLiterals['TEXT.DEFAULT'],
            resourceTypeEmployee : true,
            resourceTypeGeneric : true,
            resourceTypeVendor : true
        });
        
        var search = new psa_prm.serverlibrary.Search(null, 'customsearch_prm_filters_list'),
            user   = context.getUser();
        
        search.setFilterExpression([
            ['owner.internalid', 'is', user],
            'OR',
            ['custrecord_prm_share_view', 'is', 'T']
        ]);
        
        var results = search.getAllResults();
        
        for (i in results) {
            var viewName = results[i].getValue('internalid', 'owner') != user ? results[i].getValue('name') + ' [' + results[i].getValue('entityid', 'owner') + ']' : results[i].getValue('name');
            
            returnData.data.push({
                id                   : results[i].getValue('internalid'),
                filterId             : results[i].getValue('internalid'),
                name                 : viewName,
                startDateType        : results[i].getValue('custrecord_prm_filter_start_date_type'),
                startDate            : results[i].getValue('custrecord_prm_filter_start_date'),
                resourceTypeEmployee : results[i].getValue('custrecord_prm_filter_restype_employee') == 'T',
                resourceTypeVendor   : results[i].getValue('custrecord_prm_filter_restype_vendor') == 'T',
                resourceTypeGeneric  : results[i].getValue('custrecord_prm_filter_restype_generic') == 'T',
                employees            : results[i].getValue('custrecord_prm_filter_employee'),
                employeeNames        : psa_prm.serverlibrary.padSpacesBetweenCommaSeparatedStrings(results[i].getText('custrecord_prm_filter_employee')),
                vendors              : results[i].getValue('custrecord_prm_filter_vendor'),
                vendorNames          : psa_prm.serverlibrary.padSpacesBetweenCommaSeparatedStrings(results[i].getText('custrecord_prm_filter_vendor')),
                genericResources     : results[i].getValue('custrecord_prm_filter_generic_resource'),
                genericResourceNames : psa_prm.serverlibrary.padSpacesBetweenCommaSeparatedStrings(results[i].getText('custrecord_prm_filter_generic_resource')),
                billingClasses       : results[i].getValue('custrecord_prm_filter_billing_class'),
                billingClassNames    : psa_prm.serverlibrary.padSpacesBetweenCommaSeparatedStrings(results[i].getText('custrecord_prm_filter_billing_class')),
                subsidiaries         : results[i].getValue('custrecord_prm_filter_subsidiary'),
                subsidiaryNames      : psa_prm.serverlibrary.padSpacesBetweenCommaSeparatedStrings(results[i].getText('custrecord_prm_filter_subsidiary')),
                includeSubSubsidiary : results[i].getValue('custrecord_prm_filter_sub_subsidiary') == 'T',
                customers            : results[i].getValue('custrecord_prm_filter_customer'),
                customerNames        : psa_prm.serverlibrary.padSpacesBetweenCommaSeparatedStrings(results[i].getText('custrecord_prm_filter_customer')),
                projects             : results[i].getValue('custrecord_prm_filter_project'),
                projectNames         : psa_prm.serverlibrary.padSpacesBetweenCommaSeparatedStrings(results[i].getText('custrecord_prm_filter_project')),
                tasks                : results[i].getValue('custrecord_prm_filter_task'),
                taskNames            : psa_prm.serverlibrary.padSpacesBetweenCommaSeparatedStrings(results[i].getText('custrecord_prm_filter_task')),
                isOwnedByCurrentUser : results[i].getValue('internalid', 'owner') == user
            });
        }
        
        returnData.total = results.length;
        
        return returnData;
    }; 
    
    this.saveFilter = function (dataIn) {
        var returnData  = new Object(),
            dataInput   = psa_prm.serverlibrary.toJson(dataIn),
            filterId    = dataInput.filterId;
        
        returnData.success = true;
        returnData.message = (filterId == 0) ? 'Data Added' : 'Data Updated';
        
        if (filterId == 0) {
            record = nlapiCreateRecord('customrecord_prm_filters');
        }
        else {
            record = nlapiLoadRecord('customrecord_prm_filters', dataInput.filterId);
        }
        
        if (dataInput.isDelete) {
            nlapiDeleteRecord('customrecord_prm_filters', dataInput.filterId);
        }
        else {
            var customers      = this.splitString(dataInput.customers);
            var projects       = this.splitString(dataInput.projects);
            var tasks          = this.splitString(dataInput.tasks);
            var billingClasses = this.splitString(dataInput.billingClasses);
            var resources      = this.splitString(dataInput.resources);
            var subsidiaries   = this.splitString(dataInput.subsidiaries);
            
            record.setFieldValue('name', dataInput.name);
            record.setFieldValue('custrecord_prm_filter_start_date_type', dataInput.startDateType);
            record.setFieldValue('custrecord_prm_filter_start_date', dataInput.startDate);
            record.setFieldValue('custrecord_prm_filter_customer', customers);
            record.setFieldValue('custrecord_prm_filter_project', projects);
            record.setFieldValue('custrecord_prm_filter_task', tasks);
            record.setFieldValue('custrecord_prm_filter_restype_employee', dataInput.resourceTypeEmployee ? 'T' : 'F');
            record.setFieldValue('custrecord_prm_filter_restype_generic', dataInput.resourceTypeGeneric ? 'T' : 'F');
            record.setFieldValue('custrecord_prm_filter_restype_vendor', dataInput.resourceTypeVendor ? 'T' : 'F');
            record.setFieldValue('custrecord_prm_filter_billing_class', billingClasses);
            record.setFieldValue('custrecord_prm_filter_resource', resources);
            record.setFieldValue('custrecord_prm_filter_projects_only', dataInput.projectsOnly ? 'T' : 'F');
            record.setFieldValue('custrecord_prm_filter_tasks_only', dataInput.tasksOnly ? 'T' : 'F');
            record.setFieldValue('custrecord_prm_filter_subsidiary', subsidiaries);
            record.setFieldValue('custrecord_prm_filter_sub_subsidiary', dataInput.includeSubSubsidiary ? 'T' : 'F');
            
            dataInput.id = nlapiSubmitRecord(record);
        }
            
        returnData.data = new Array();
        returnData.data.push(dataInput);
        
        return returnData;
    }; 
    
    this.splitString = function(someString) {
        if (someString != null && someString != '') {
            if (someString.indexOf(',') > 0) {
                return someString.split(',');
            }
            else {
                return someString;
            }
        }
        return '';
    };
};
