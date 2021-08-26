/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

function DateField(name) {
    return {
        name: name,
        type: 'date',
        dateFormat: nsDateFormat,
        convert: function (v, j) {
            if (!v) {
                return null;
            }

            if (v instanceof Date) {
                return v;
            }

            return Ext4.Date.clearTime(new Date(Ext4.Date.parse(v, nsDateFormat)));
        }
    }
};

Ext4.define('PRM.Model.SimpleList', {
    extend : 'Ext4.data.Model',
    fields : [
        {
            name : 'id',
            type : 'int',
            defaultValue: 0
        }, {
            name : 'name',
            type : 'string'
        }
    ]
});

Ext4.define('PRM.Model.Settings', {
    extend : 'Ext4.data.Model',
    clientIdProperty : 'clientId',
    fields : [
        {
            name : 'id',
            type : 'int',
            defaultValue: 1
        }, {
            name : 'clientId',
            type : 'int',
            defaultValue: 1
        }, {
            name : 'settingsId',
            type : 'int',
            defaultValue: 0
        }, {
            name : 'owner',
            type : 'int'
        }, {
            name : 'lastUsedFilter',
            type : 'int',
            defaultValue: 0
        }, {
            name : 'currentPage',
            type : 'int',
            defaultValue: 1
        }, {
            name : 'projectsPerPage',
            type : 'int',
            defaultValue: 10
        }, {
            name : 'showRejectedAllocations',
            type : 'boolean',
            defaultValue: true
        }, {
            name : 'showHovers',
            type : 'boolean',
            defaultValue: true
        }, {
            name : 'showAllocations',
            type : 'boolean',
            defaultValue: true
        }, {
            name : 'showAssignments',
            type : 'boolean',
            defaultValue: true
        }, {
            name : 'includeAllProjects',
            type : 'boolean',
            defaultValue: true
        }, {
            name : 'showHovers',
            type : 'boolean',
            defaultValue: true
        }, {
            name : 'checkNonWorkingDays',
            type : 'boolean',
            defaultValue: true
        }, {
            name : 'checkOverlap',
            type : 'boolean',
            defaultValue: true
        }
    ]
});

Ext4.define('PRM.Model.Holiday', {
    extend : 'Ext4.data.Model',
    fields : [
        DateField('exceptiondate'),
        {
            name : 'exceptiondescription',
            type : 'string'
        } 
    ],
    belongsTo : 'PRM.Model.WorkCalendar'
});

Ext4.define('PRM.Model.WorkCalendar', {
    extend : 'PRM.Model.SimpleList',
    fields : [
        {
            name : 'startHour',
            type : 'string'
        }, {
            name : 'hoursPerDay',
            type : 'int'
        }, {
            name : 'sunday',
            type : 'boolean'
        }, {
            name : 'monday',
            type : 'boolean'
        }, {
            name : 'tuesday',
            type : 'boolean'
        }, {
            name : 'wednesday',
            type : 'boolean'
        }, {
            name : 'thursday',
            type : 'boolean'
        }, {
            name : 'friday',
            type : 'boolean'
        }, {
            name : 'saturday',
            type : 'boolean'
        }
    ],
    belongsTo : 'PRM.Model.ResourceList',
    hasMany: [
        {
            model: 'PRM.Model.Holiday',
            name: 'nonWork'
        }
    ]
});

Ext4.define('PRM.Model.ProjectDetails', {
    extend : 'Ext4.data.Model',
    fields : [
        {
            name : 'actualTime',
            type : 'string'
        }, {
            name : 'timeRemaining',
            type : 'string'
        },
        DateField('calculatedEndDate')
    ],
    belongsTo : [ 'PRM.Model.Grid', 'PRM.Model.ProjectList' ]
});

Ext4.define('PRM.Model.Grid', {
    extend: 'Ext4.data.TreeModel',
    fields: [
        { name: 'id',                  type: 'string' }, // project = <project internal id>; resource-summary = <project internal id>~<resource internal id>; project
        { name: 'name',                type: 'string' },
        { name: 'projectName',         type: 'string' }, // type = project task assignment
        { name: 'taskName',            type: 'string' }, // type = project task assignment
        { name: 'type',                type: 'string' },
        { name: 'role',                type: 'string' },
        { name: 'pctComplete',         type: 'string' },
        { name: 'hrsEstimated',        type: 'string' },
        { name: 'hrsWorked',           type: 'string' },
        { name: 'workCalendar',        type: 'string' },
        { name: 'allocations',         type: 'string' }, 
        { name: 'timeBills',           type: 'string' },
        DateField('taskStartDate'),
        DateField('taskEndDate'),
        DateField('assignStartDate'),
        DateField('assignEndDate'),
        { name: 'hover',               type: 'string' },
        { name: 'unitPct',             type: 'string' },
        { name: 'billingClassId',      type: 'int' },
        { name: 'unitCost',            type: 'int' },
        { name: 'unitPrice',           type: 'int' },
        { name: 'serviceItemId',       type: 'int' },
        { name: 'isHidden',            type: 'boolean', defaultValue: false },
        { name: 'isResourceInactive',  type: 'boolean', defaultValue: false },
        { name: 'startDateType',       type: 'string' },
        DateField('startDate'),
        { name: 'customers',           type: 'string' },
        { name: 'projects',            type: 'string' },
        { name: 'tasks',               type: 'string' },
        { name: 'displayAllResources', type: 'boolean', defaultValue: false },
        { name: 'constraintType',      type: 'string' }, // ASAP | FIXEDSTART
        { name: 'withAllocations',     type: 'boolean', defaultValue: false },
        { name: 'withAssignments',     type: 'boolean', defaultValue: false },
        { name: 'withRecurring',       type: 'boolean', defaultValue: false }
    ],
    getAssignments : function (projectId, resourceId, periodStart, periodEnd) {
        var me         = this,
            ids        = me.get('id').split('~');
            projId     = projectId ? projectId : me.getProjectId(),
            resId      = resourceId ? resourceId : (me.getResourceId() ? me.getResourceId() : 0),
            parentNode = null,
            assignments = [];
    
            if (me.isProject()) {
                parentNode = me;
            }
            else if (me.isSummary() || me.isTask()) {
                parentNode = me.parentNode;
            }
            else parentNode = me.parentNode.parentNode;
        
        parentNode.cascadeBy(function(node) {
            var ids = node.get('id').split('~'),
                assignStartDate = new Date(node.get('assignStartDate')).getTime(),
                assignEndDate = new Date(node.get('assignEndDate')).getTime();
            
            if (node.isResource()) {
                if (ids.length == 4 
                        && node.getProjectId() == projId 
                        && node.getTaskId() > 0 
                        && node.getAssignmentId() > 0 
                        && node.getResourceId() == resId) {
                    if (periodStart && periodEnd){
                        // get assignments with respect to period dates
                        if ((   assignStartDate <= periodStart && assignEndDate >= periodEnd) 
                                || (assignStartDate <= periodStart && assignEndDate >= periodStart && assignEndDate <= periodEnd)
                                || (assignStartDate >= periodStart && assignEndDate <= periodEnd)
                                || (assignStartDate >= periodStart && assignStartDate <= periodEnd)
                                || (assignStartDate <= periodStart && assignEndDate >= periodStart)) {
                            assignments.push(node);
                        }
                    }
                    else {
                        // get assignments regardless of period dates
                        assignments.push(node);
                    }
                    
                }
            }
        });
        return assignments;
    },
    getResourceSummary : function (resourceId){
        var me          = this,
            parentNode  = null,
            summaryNode = null;
        
        if (me.isProject()) {
            parentNode = me;
        }
        else if (me.isSummary() || me.isTask()) {
            parentNode = me.parentNode;
        }
        else parentNode = me.parentNode.parentNode;
            
        parentNode.cascadeBy(function(node) {
            if (node.isSummary()) {
                if (node.getResourceId() == resourceId) {
                    summaryNode = node;
                    return false;
                }
            }
        });
        
        return summaryNode;
    },
    hasAssignments : function (projectId, resourceId) {
        var me         = this,
            ids        = me.get('id').split('~');
            projId     = projectId ? projectId : me.getProjectId(),
            resId      = resourceId ? resourceId : (me.getResourceId() ? me.getResourceId() : 0),
            parentNode = null;
            found      = false;
        
        if (me.isTask()) {
            found = me.childNodes.length > 0;
        }
        else {
            if (me.isProject()) {
                parentNode = me;
            }
            else if (me.isSummary()) {
                parentNode = me.parentNode;
            }
            else parentNode = me.parentNode.parentNode;
            
            parentNode.cascadeBy(function(node) {
                var ids = node.get('id').split('~');
                if (ids.length == 4 
                    && node.getProjectId() == projId 
                    && node.getTaskId() > 0 
                    && node.getAssignmentId() > 0 
                    && ( (resId && node.getResourceId() == resId) ||
                         (node.getResourceId() > 0 || node.getResourceId() == -5) ) ) {
                    found = true;
                    return false;
                }
            });
        }
        
        return found;
    },
    hasAssignment : function (projectId, resourceId) {
        var me         = this,
            projId     = projectId ? projectId : me.getProjectId(),
            resId      = resourceId ? resourceId : (me.getResourceId() ? me.getResourceId() : 0),
            parentNode = null;
            found      = false;
        
        if (me.isProject()) {
            parentNode = me;
        }
        else if (me.isSummary() || me.isTask()) {
            parentNode = me.parentNode;
        }
        else parentNode = me.parentNode.parentNode;
        
        parentNode.cascadeBy(function(node) {
            var ids = node.get('id').split('~');
            if (ids.length == 4 
                && node.getProjectId() == projId 
                && node.getTaskId() > 0 
                && node.getAssignmentId() > 0 
                && node.getResourceId() == resId) {
                found = true;
                return false;
            }
        });
        return found;
    },
    hasActualWork : function () {
        var me = this,
            found = false;
        
        me.cascadeBy(function(node) {
            var timeBills = Ext4.isEmpty(node.get('timeBills')) ? [] : JSON.parse(node.get('timeBills')); 
            if (timeBills.length) {
            	for (var i = 0; i < timeBills.length; i++) {
            		var timeBill = timeBills[i];
            		if (timeBill.type == PRM.App.Constants.TIMEBILL_TYPE.ACTUAL) {
            			found = true;
            			return false;
            		}
            	}
            } 
        });
        
        return found;
    },
    getLastActualWork : function() {
        var lastActualWork = 0;
        var timeBills = JSON.parse(this.data.timeBills);
        for (var i = 0; i < timeBills.length; i++) {
            var date = new Date(timeBills[i].date).getTime();
            if (date > lastActualWork) lastActualWork = date;
        }
        return new Date(lastActualWork);
    },
    getNextWorkDayAfterActualWork : function() {
        var nextDay = new Date(this.getLastActualWork().getTime() + PRM.Util.WorkCalendar.dayInMilliseconds);
        return PRM.Util.WorkCalendar.getEarliestWorkDayAfter(JSON.parse(this.data.workCalendar), nextDay);
    },
    hasAllocations : function (resourceId) {
        var me         = this,
            resId      = resourceId ? resourceId : (me.getResourceId() ? me.getResourceId() : 0),
            type       = me.get('type'),
            parentNode = null;
            found      = false;
        
        if (me.isProject()) {
            parentNode = me;
        }
        else if (me.isSummary() || me.isTask()) {
            parentNode = me.parentNode;
        }
        else parentNode = me.parentNode.parentNode;
        
        if (resId) {
            parentNode.cascadeBy(function(node) {
                if (node.isSummary() 
                    && resId == node.getResourceId()) {
                    var allocations = JSON.parse(node.get('allocations'));
                    
                    found = allocations.length > 0;
                    return false;
                }
            });
        }
        else {
            parentNode.cascadeBy(function(node) {
                if (node.isSummary()) {
                    var allocations = JSON.parse(node.get('allocations'));
                    
                    if (allocations.length > 0) {
                        found = true; 
                        return false;
                    }
                }
            });
        }
        
        return found;
    },
    getAllocations : function (periodStart, periodEnd) {
        var me = this,
            allocRecords = JSON.parse(me.get('allocations')),
            allocations = [];
    
        if (periodStart > 0 && periodEnd > 0) {
            for (var i = 0; i < allocRecords.length; i++) {
                var alloc = allocRecords[i],
                    allocStart = new Date(alloc.startDate).getTime(),
                    allocEnd = new Date(alloc.endDate).getTime();
                
                if ((   allocStart <= periodStart && allocEnd >= periodEnd) 
                    || (allocStart <= periodStart && allocEnd >= periodStart && allocEnd <= periodEnd)
                    || (allocStart >= periodStart && allocEnd <= periodEnd)
                    || (allocStart >= periodStart && allocStart <= periodEnd)
                    || (allocStart <= periodStart && allocEnd >= periodStart)) {
                    allocations.push(alloc);
                }
            }
        }
        else {
            allocations = allocRecords;
        }
        
        return allocations;
    },
    getHoursWorkedOfChildNodes : function () {
        if (this.childNodes && this.childNodes.length) {
            var hrsWorked = 0;
            for (i in this.childNodes) {
                hrsWorked += Number(this.childNodes[i].data.hrsWorked);
            }
            return hrsWorked;
        }
        return 0;
    },
    getProjectId : function() {
        var me = this;
        
        if (me.get('id')) {
            return Number(me.get('id').split('~')[0]);
        }
        
        return 0;
    },
    getTaskId : function() {
        var me = this;
        
        if (me.get('id')) {
            return Number(me.get('id').split('~')[1]);
        }
        
        return 0;
    },
    getAssignmentId : function() {
        var me = this;
        
        if (me.get('id')) {
            return Number(me.get('id').split('~')[2]);
        }
        
        return 0;
    },
    getResourceId : function() {
        var me = this;
        
        if (me.get('id')) {
            return Number(me.get('id').split('~')[3]);
        }
        
        return 0;
    },
    typeList : {
        project  : 'project',
        summary  : 'resource-summary',
        task     : 'task',
        resource : 'resource'
    },
    isProject : function () {
        return this.get('type') == this.typeList.project;
    },
    isSummary : function () {
        return this.get('type') == this.typeList.summary;
    },
    isTask : function () {
        return this.get('type') == this.typeList.task;
    },
    isResource : function () {
        return this.get('type') == this.typeList.resource;
    }
});

Ext4.define('PRM.Model.AllocationUnit', {
    extend : 'Ext4.data.Model',
    fields : [
        {
            name : 'id',
            type : 'string',
            defaultValue: 'P'
        }, {
            name : 'name',
            type : 'string'
        }
    ],
    validations: [
        {type: 'inclusion', field: 'id',   list: ['P', 'H']}, // P for Percentage, H for Hours
    ]
});

Ext4.define('PRM.Model.Feature', {
    extend : 'Ext4.data.Model',
    idProperty : 'name',
    fields : [
        {
            name : 'name',
            type : 'string'
        }, {
            name : 'isEnabled',
            type : 'boolean',
            defaultValue : false
        }
    ]
});

Ext4.define('PRM.Model.ResourceList', {
    extend : 'PRM.Model.SimpleList',
    fields : [
        {
            name : 'type',
            type : 'string'
//        }, {
//            name : 'role',
//            type : 'string'
        }, {
            name : 'supervisor',
            type : 'int'
        }, {
            name : 'supervisorName',
            type : 'string'
        }, {
            name : 'workCalendarId',
            type : 'int'
        }, {
            name : 'workCalendar',
            type : 'string'
        }, {
            name : 'laborCost',
            type : 'number'
        }, {
            name : 'billingClass',
            type : 'number'
        }, {
        	name : 'email',
        	type : 'string'
        }
    ]
});

Ext4.define('PRM.Model.ProjectList', {
    extend : 'PRM.Model.SimpleList',
    fields : [
        {
            name : 'hrsEstimated',
            type : 'int'
        }, {
            name : 'pctComplete',
            type : 'float'
        }, {
            name : 'children'
        }
    ]
});

Ext4.define('PRM.Model.Allocation', {
    extend : 'Ext4.data.Model',
    clientIdProperty : 'clientId',
    fields : [
        {
            name : 'id', // store id
            type : 'int',
            defaultValue: 0
        }, {
            name : 'allocationId',
            type : 'int',
            defaultValue: 0
        }, {
            name : 'resourceId',
            type : 'int'
        }, {
            name : 'projectId',
            type : 'int'
        },
        DateField('startDate'),
        DateField('endDate'),
        {
            name : 'allocationNumber',
            type : 'number'
        }, {
            name : 'hour',
            type : 'number'
        }, {
            name : 'percent',
            type : 'int'
        }, {
            name : 'unit',
            type : 'string',
            defaultValue: 'H'
        }, {
            name : 'type',
            type : 'int',
            defaultValue: 1
        }, {
            name : 'nextApprover',
            type : 'int',
            defaultValue: 0
        }, {
            name : 'nextApproverName',
            type : 'string'
        }, {
            name : 'comment',
            type : 'string'
        }, {
            name : 'isDelete',
            type : 'boolean',
            defaultValue: false
        }, {
            name : 'clientId',
            type : 'int'
        }, {
            name : 'prevProjectId',
            type : 'int'
        }
    ],
    validations: [
        {type: 'inclusion', field: 'unit',   list: ['P', 'H']}, // P for Percentage, H for Hours
        {type: 'inclusion', field: 'type', list: [1, 2]} // 1 for Hard, 2 for Soft
    ]
});

Ext4.define('PRM.Model.Assignment', {
    extend : 'Ext4.data.Model',
    clientIdProperty : 'clientId',
    fields : [
        {
            name : 'id', // store id
            type : 'int',
            defaultValue: 0
        }, {
            name : 'clientId',
            type : 'int'
        }, {
            name : 'assignmentId',
            type : 'int',
            defaultValue: 0
        }, {
            name : 'resourceId',
            type : 'int'
        }, {
            name : 'prevResourceId',
            type : 'int'
        }, {
            name : 'projectId',
            type : 'int'
        }, {
            name : 'projectTaskId',
            type : 'int'
        }, {
            name : 'unitPercent',
            type : 'number'
        }, {
            name : 'billingClassId',
            type : 'int'
        }, {
            name : 'unitCost',
            type : 'number'
        }, {
            name : 'unitPrice',
            type : 'number'
        }, {
            name : 'estimatedWork',
            type : 'number'
        }, {
            name : 'serviceItemId',
            type : 'int'
        },
        DateField('startDate'),
        DateField('endDate'),
        {
            name : 'isDelete',
            type : 'boolean',
            defaultValue: false
        }, {
            name : 'isLookup',
            type : 'boolean',
            defaultValue: false
        }, {
            name : 'lookupType',
            type : 'string'
        }
    ]
});

Ext4.define('PRM.Model.Filter', {
    extend : 'PRM.Model.SimpleList',
    fields : [
        {
            name : 'filterId',
            type : 'int'
        }, {
            name : 'startDateType',
            type : 'string'
        },
        DateField('startDate'),
        {
            name : 'resourceTypeEmployee',
            type : 'boolean'
        },  {
            name : 'resourceTypeGeneric',
            type : 'boolean'
        },  {
            name : 'resourceTypeVendor',
            type : 'boolean'
        }, {
            name : 'billingClasses',
            type : 'string'
        }, {
            name : 'billingClassNames',
            type : 'string'
        }, {
            name : 'employees',
            type : 'string'
        }, {
            name : 'vendors',
            type : 'string'
        }, {
            name : 'genericResources',
            type : 'string'
        }, {
            name : 'employeeNames',
            type : 'string'
        }, {
            name : 'vendorNames',
            type : 'string'
        }, {
            name : 'genericResourceNames',
            type : 'string'
        }, {
            name : 'projectsOnly',
            type : 'boolean',
            defaultValue: false
        }, {
            name : 'tasksOnly',
            type : 'boolean',
            defaultValue: false
        }, {
            name : 'subsidiaries',
            type : 'string'
        }, {
            name : 'subsidiaryNames',
            type : 'string'
        }, {
            name : 'includeSubSubsidiary',
            type : 'boolean',
            defaultValue: false
        }, {
            name : 'customers',
            type : 'string'
        }, {
            name : 'customerNames',
            type : 'string'
        }, {
            name : 'projects',
            type : 'string'
        }, {
            name : 'projectNames',
            type : 'string'
        }, {
            name : 'tasks',
            type : 'string'
        }, {
            name : 'taskNames',
            type : 'string'
        }, {
            name : 'isDelete',
            type : 'boolean',
            defaultValue: false
        }, {
            name : 'isOwnedByCurrentUser',
            type : 'boolean'
        }
    ],
    getResourceTypeNames : function(filterRecord) {
    	var names = [];
    	if (this.get('resourceTypeEmployee')) {
    		names.push(PRM.Translation.getText('TEXT.EMPLOYEE'));
    	}
    	if (this.get('resourceTypeGeneric')) {
    		names.push(PRM.Translation.getText('TEXT.GENERIC_RESOURCE'));
    	}
    	if (this.get('resourceTypeVendor')) {
    		names.push(PRM.Translation.getText('TEXT.VENDOR'));
    	}
    	return names;
    }
});

Ext4.define('PRM.Model.LargeDataDropdownRange', {
    extend : 'PRM.Model.SimpleList',
    fields : [
        {
            name : 'startIndex',
            type : 'int',
            defaultValue: 0
        }, {
            name : 'endIndex',
            type : 'int',
            defaultValue: 0
        }
    ]
});

Ext4.define('PRM.Model.AllocatedTimeSummary', {
    extend : 'Ext4.data.Model',
    fields : [
        {
            name : 'resourceName',
            type : 'string'
        }, {
            name : 'hours',
            type : 'number'
        }, {
            name : 'percent',
            type : 'string',
            sortType : function(value) {
                try {
                    return Number(value.split('%')[0]);
                } catch(err) {
                    return 0;
                }
            }
        }
    ]
});

Ext4.define('PRM.Model.AssignmentSearchResult', {
    extend : 'Ext4.data.Model',
    fields : [
        {
            name : 'resourceId',
            type : 'number'
        }, {
            name : 'resourceName',
            type : 'string'
        }, {
            name : 'resourceType',
            type : 'string'
        }, {
            name : 'billingClass',
            type : 'string'
        }, {
            name : 'laborCost',
            type : 'number'
        }
    ]
});

Ext4.define('PRM.Model.ResourceSearchResult', {
    extend : 'PRM.Model.AssignmentSearchResult',
    fields : [
        {
        	name : 'percentAvailable',
        	type : 'string'
        }
    ]
});