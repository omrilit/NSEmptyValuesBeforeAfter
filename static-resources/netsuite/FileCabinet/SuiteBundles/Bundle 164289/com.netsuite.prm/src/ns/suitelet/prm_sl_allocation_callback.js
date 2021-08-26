/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var psa_prm;
if (!psa_prm) psa_prm = {};

psa_prm.AllocCallbackSl = new function AllocCallbackSl() {
    
    this.init = function() {
        this.context = nlapiGetContext();
        this.lib = psa_prm.serverlibrary;
        
        this.params = {
            id          : request.getParameter('id'),
            prevProject : request.getParameter('prevProject')
        };
    };
    
    this.suiteletEntry = function(request, response){
        this.init();
        
        nlapiLogExecution('DEBUG', 'allocation', JSON.stringify(this.params));
        
        try {
            var returnData = JSON.stringify({
                allocation : this.getAllocationData()
            });
            nlapiLogExecution('DEBUG', 'returnData', returnData);
            response.write(returnData);
        } catch(ex) {
            var errorCode    = ex.name || ex.getCode(),
                errorMessage = ex.message || ex.getDetails();

            nlapiLogExecution('ERROR', errorCode, errorMessage);
            
            response.write(JSON.stringify({
                message : errorCode + ' : '  + errorMessage
            }));
        }
        
        nlapiLogExecution('DEBUG', 'remaining usage points', this.context.getRemainingUsage());
    };
    
    this.getPrevTimeEntries = function(allocation) {
        return this.params.prevProject != allocation.getFieldValue('projecttask') ? this.lib.getTimeEntriesByProject(this.params.prevProject) : null;
    };
    
    this.getAllocationData = function() {
        var allocation = null;
        
        try {
            allocation = nlapiLoadRecord('resourceallocation', this.params.id);
        } catch(err) {
            
        }
        
        if (allocation) {
            return {
                resource         : allocation.getFieldValue('allocationresource'),
                resourceName     : allocation.getFieldValue('entityname'),
                project          : allocation.getFieldValue('project'),
                projectname      : allocation.getFieldValue('projectname'),
                projectTask      : allocation.getFieldValue('projecttask'),     // not yet supported :C
                projectTaskName  : allocation.getFieldValue('projecttaskname'), // not yet supported :C
                notes            : allocation.getFieldValue('notes'),
                startDate        : allocation.getFieldValue('startdate'),
                endDate          : allocation.getFieldValue('enddate'),
                percentOfTime    : allocation.getFieldValue('percentoftime'),
                numberHours      : allocation.getFieldValue('numberhours'),
                allocationUnit   : allocation.getFieldValue('allocationunit'),
                allocationType   : allocation.getFieldValue('allocationtype'),
                approvalStatus   : allocation.getFieldValue('approvalstatus'),
                nextApprover     : allocation.getFieldValue('nextapprover'),
                nextApproverName : nlapiLookupField('employee', allocation.getFieldValue('nextapprover'), 'entityid'),
                workCalendar     : this.lib.getResourceWorkCalendarId(allocation.getFieldValue('allocationresource')),
                timeEntries      : this.lib.getTimeEntriesByProject(allocation.getFieldValue('project')),
                prevTimeEntries  : this.getPrevTimeEntries(allocation),
                
                // for recurring allocations
                frequency        : allocation.getFieldValue('frequency'),
                period           : allocation.getFieldValue('period'),
                dayOfWeek        : allocation.getFieldValue('recurrencedow'),
                dayOfWeekMask    : allocation.getFieldValue('recurrencedowmask'),
                dayOfWeekInMonth : allocation.getFieldValue('recurrencedowim'),
                seriesStartDate  : allocation.getFieldValue('seriesstartdate'),
                seriesEndDate    : allocation.getFieldValue('endbydate')
            };
        } else {
            return {
                timeEntries : this.lib.getTimeEntriesByProject(this.params.prevProject),
            };
        }
    };
    
};