/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

Ext4.define('PRM.Cmp.Editor.Plugin', {
    extend : 'Ext4.grid.plugin.CellEditing',
    singleton : true,
    clicksToEdit : 1,
    listeners : {
        beforeEdit : function(me, event) {
            var rowType            = event.record.get('type'),
                colType            = PRM.App.Grid.getColType(event.colIdx),
                isNonWorking       = Ext4.Array.contains(event.row.children[event.colIdx].classList, 'prm-non-working-day'),
                isResourceInactive = event.record.get('isResourceInactive'),
                periodCmp          = PRM.App.Grid.getPeriodCmp(event.colIdx),
                isWithRecurring    = rowType == 'resource-summary' ? PRM.App.Grid.isWithRecurring(event.record.getAllocations(periodCmp.startDate, periodCmp.endDate)) : false,
                noResultsFound     = event.record.get('name') === PRM.Translation.getText('ERROR.NO_RESULTS_FOUND') ||
                                     event.record.get('name') === PRM.Translation.getText('ERROR.NO_RESULTS_FOUND_SIMPLE');

            if ((noResultsFound) ||                                                            // no results
                (rowType == 'project') ||                                                      // all project level cells
                (rowType == 'resource-summary' && colType != 'hours-allocated') ||             // for resource summary level, all cells except those under Hours Allocated
                (rowType == 'task') ||                                                         // all task level cells
                (rowType == 'resource' && colType != 'hours-assigned') ||                      // for task assignment level, all cells except those under Hours Assigned
                (rowType == 'resource' && parseInt(event.record.get('pctComplete')) == 100) || // and 100% complete cells ?
                (isNonWorking) ||                                                              // all nont-working days
                (isWithRecurring) ||                                                           // all cells with recurring allocations
                (isResourceInactive)) {                                                        // all inactive resources
                
                return false;
            }
            
            return true;
        },
        edit : function(me, event) {
            PRM.Util.PerfLogs.start('CELL_EDIT');
            
            var rowType = event.record.get('type'),
                colType = PRM.App.Grid.getColType(event.colIdx);
            /*
             * cell editing for resource allocations
             */
            if(rowType == 'resource-summary' && colType == 'hours-allocated') {
                var params   = PRM.App.Grid.getComputationParams(event.record, event.colIdx),
                    newValue = Number(event.value) || 0;
                    
                // skip if user did not change existing cell value
                if (PRM.App.Grid.getHrsAllocated(params) == newValue){
                    return;
                }
                
                PRM.App.Grid.addMask();
                
                /*
                 * setup values for computations
                 */
                var period               = PRM.App.Grid.down('#prm-grid-period' + (Math.floor(event.colIdx / 4) + 1)),
                    utilWC               = PRM.Util.WorkCalendar,
                    workCalendar         = JSON.parse(event.record.data.workCalendar),
                    periodStart          = new Date(period.startDate).getTime(),
                    workingPeriodStart   = utilWC.getEarliestWorkDayAfter(workCalendar, new Date(periodStart)).getTime(),
                    periodEnd            = new Date(period.endDate).getTime(),
                    workingPeriodEnd     = utilWC.getLatestWorkDayBefore(workCalendar, new Date(periodEnd)).getTime(),
                    allocations          = JSON.parse(event.record.data.allocations),
                    periodStartDayBefore = Ext4.Date.format(utilWC.getLatestWorkDayBefore(workCalendar, new Date(periodStart - utilWC.dayInMilliseconds)), nsDateFormat),
                    periodEndDayAfter    = Ext4.Date.format(utilWC.getEarliestWorkDayAfter(workCalendar, new Date(periodEnd + utilWC.dayInMilliseconds)), nsDateFormat),
                    allocStore           = PRM.App.Stores.allocation,
                    newAllocations       = new Array(), // affected and unaffected by changes
                    allocsForSaving      = new Array(); // only allocs with changes.
                
                /*
                 * search for affected/unaffected allocations and push everything into a new array of allocations
                 */
                for (var i = 0; i < allocations.length; i++) {
                    var alloc = allocations[i],
                        allocStart = new Date(alloc.startDate).getTime(),
                        allocEnd = new Date(alloc.endDate).getTime();
                    
                    if ((allocStart < workingPeriodStart && allocEnd < workingPeriodStart) || (allocStart > workingPeriodEnd && allocEnd > workingPeriodEnd)) { // search for unaffected allocations]
                        newAllocations.push(alloc);
                    }
                    /*
                     *  allocation  |-----------|
                     *  period          |---|
                     */
                    else if (allocStart < workingPeriodStart && allocEnd > workingPeriodEnd) { // search for the allocation that will be split into three
                        // create the "left" allocation from a duplicate of the current allocation
                        var newAlloc = JSON.parse(JSON.stringify(alloc));
                        newAlloc.id = 0;
                        newAlloc.clientId = allocStore.clientId++;
                        newAlloc.hrsAllocated = utilWC.getAdjustedAllocation(workCalendar, newAlloc.hrsAllocated, newAlloc.startDate, newAlloc.endDate, periodEndDayAfter, newAlloc.endDate);
                        newAlloc.startDate = periodEndDayAfter;
                        
                        newAllocations.push(newAlloc);
                        allocsForSaving.push(newAlloc);
                        
                        // adjust the current allocation into the "right" allocation
                        alloc.hrsAllocated = utilWC.getAdjustedAllocation(workCalendar, alloc.hrsAllocated, alloc.startDate, alloc.endDate, alloc.startDate, periodStartDayBefore);
                        alloc.endDate = periodStartDayBefore;
                        
                        newAllocations.push(alloc);
                        allocsForSaving.push(alloc);
                    }
                    /*
                     *  allocation      |---|
                     *  period      |-----------|
                     */
                    else if (allocStart >= workingPeriodStart && allocEnd <= workingPeriodEnd) { // search for the allocation/s that will be deleted/edited
                        // just delete these allocations
                        alloc.isDelete = true;
                        allocsForSaving.push(alloc);
                    }
                    /*
                     *  allocation  |-----------|
                     *  period      |---|
                     */
                    else if(allocStart == workingPeriodStart && allocEnd > workingPeriodEnd) { // search for the allocation whose start date needs to be adjusted
                        alloc.hrsAllocated = PRM.Util.WorkCalendar.getAdjustedAllocation(workCalendar, alloc.hrsAllocated, alloc.startDate, alloc.endDate, periodEndDayAfter, alloc.endDate);
                        alloc.startDate = periodEndDayAfter;
                        
                        newAllocations.push(alloc);
                        allocsForSaving.push(alloc);
                    }
                    /*
                     *  allocation  |-----------|
                     *  period              |---|
                     */
                    else if (allocEnd == workingPeriodEnd && allocStart < workingPeriodStart) { // search for the allocation whose end date needs to be adjusted
                        alloc.hrsAllocated = PRM.Util.WorkCalendar.getAdjustedAllocation(workCalendar, alloc.hrsAllocated, alloc.startDate, alloc.endDate, alloc.startDate, periodStartDayBefore);
                        alloc.endDate = periodStartDayBefore;
                        
                        newAllocations.push(alloc);
                        allocsForSaving.push(alloc);
                    }   
                }
                
                if(newValue > 0) {
                    /*
                     * push new allocation for edited period
                     */
                    var resourceId = event.record.data.id.split('~')[3],
                        supervisor = null;
                    
                    if (PRM.App.Stores.feature.isApprovalEnabled()) {
                        supervisor = PRM.App.Stores.resourceForm.getById(Number(resourceId)).get('supervisor');
                    }
                    
                    newAllocations.push({
                        endDate      : Ext4.Date.format(utilWC.getLatestWorkDayBefore(workCalendar, new Date(period.endDate)), nsDateFormat),
                        hrsAllocated : newValue,
                        id           : 0,
                        pctComplete  : '0%', 
                        projectId    : event.record.data.id.split('~')[0],
                        resourceId   : event.record.data.id.split('~')[3],
                        resourceName : event.record.data.name,
                        approver     : supervisor,
                        startDate    : Ext4.Date.format(utilWC.getEarliestWorkDayAfter(workCalendar, new Date(period.startDate)), nsDateFormat),
                        workCalendar : workCalendar.id,
                        clientId     : allocStore.clientId++
                    });
                    allocsForSaving.push(newAllocations[newAllocations.length-1]);
                }
                /*
                 * TODO: trigger allocation saving here
                 */
                for (var i = 0; i < allocsForSaving.length; i++) {
                    var allocObj = allocsForSaving[i],
                        allocation = Ext4.create('PRM.Model.Allocation', {
                            id : allocStore.clientId++,
                            clientId : allocObj.clientId || allocStore.clientId++,
                            allocationId : allocObj.id,
                            resourceId : allocObj.resourceId,
                            projectId : allocObj.projectId,
                            startDate : allocObj.startDate,
                            endDate : allocObj.endDate,
                            allocationNumber : allocObj.hrsAllocated,
                            unit : 'H', // Hours 
                            type : allocObj.allocationType || 1, // hard is the default
                            comment : allocObj.notes || '',
                            nextApprover : allocObj.approver || 0,
                            isDelete : allocObj.id && (!allocObj.hrsAllocated || allocObj.hrsAllocated == 0 || allocObj.isDelete) 
                        });
                    allocation.setDirty();
                    allocStore.add(allocation);
                }
                
                if (allocsForSaving.length) {
                    allocStore.sync({
                        success : function(batch) {
                            var data = batch.proxy.reader.rawData.data;
                            /*
                             * override store allocation value
                             */
                            for (var i = 0, ii = data.length; i < ii; i++){
                                for (var j = 0; j < newAllocations.length; j++) {
                                    if ((newAllocations[j].clientId && newAllocations[j].clientId == data[i].clientId) 
                                        || (newAllocations[j].id + '' == data[i].allocationId)) {
                                        newAllocations[j].id = data[i].allocationId;
                                        newAllocations[j].pctComplete = data[i].percent;
                                        newAllocations[j].notes = data[i].comment;
                                        newAllocations[j].allocationType = data[i].type;
                                        
                                    }
                                }
                            }
                            
                            event.record.set('allocations', JSON.stringify(newAllocations));
    
                            event.record.parentNode.set('timeBills', JSON.stringify(batch.proxy.reader.rawData.updatedTimeBills));
                            
                            // TODO: refresh single node only
                            PRM.App.Grid.view.refresh();
                            PRM.App.Grid.removeMask();
                            PRM.Util.PerfLogs.stop('CELL_EDIT');
                        },
                        failure : function(batch) {
                            var response = batch.operations[0].error;
                            alert(PRM.Translation.getText(response));
                            PRM.App.Grid.removeMask();
                            PRM.Util.PerfLogs.stop('CELL_EDIT');
                        }
                    });
                } else {
                    PRM.App.Grid.removeMask();
                    PRM.Util.PerfLogs.stop('CELL_EDIT');
                }
            }
            /*
             * cell editing for task assignments
             */            
            else if (rowType == 'resource' && colType == 'hours-assigned') {
                var store           = PRM.App.Stores.assignment,
                    assignmentNode  = event.record,
                    taskNode        = assignmentNode.parentNode,
                    projectNode     = taskNode.parentNode,
                    colIdx          = event.colIdx,
                    params          = PRM.App.Grid.getComputationParams(assignmentNode, colIdx),
                    originalValue   = PRM.App.Grid.getHrsAssigned(params),
                    newValue        = Number(event.value) || 0,
                    difference      = newValue - originalValue,
                    newEstimatedHrs = Number(assignmentNode.get('hrsEstimated')) + difference,
                    hrsWorked       = Number(assignmentNode.get('hrsWorked')),
                    assignment      = Ext4.create('PRM.Model.Assignment', {
                                        id : store.clientId++,
                                        clientId : store.clientId++,
                                        assignmentId : assignmentNode.getAssignmentId(),
                                        resourceId : assignmentNode.getResourceId(),
                                        projectId : assignmentNode.getProjectId(),
                                        projectTaskId : assignmentNode.getTaskId(),
                                        unitPercent : assignmentNode.get('unitPct'),
                                        billingClassId : assignmentNode.get('billingClassId'),
                                        unitCost : assignmentNode.get('unitCost'),
                                        unitPrice : assignmentNode.get('unitPrice'),
                                        estimatedWork : newEstimatedHrs,
                                        serviceItemId : assignmentNode.get('serviceItemId')
                                    });
                
                // skip if no change was made
                if (newValue == originalValue) {
                    return;
                }
                
                // revert if less than 0
                if (newValue < 0) {
                    alert(PRM.Translation.getText('ALERT.INVALID_LESS_THAN_ZERO'));
                    return;
                }
                
                // revert if less than worked hours
                if (newEstimatedHrs < hrsWorked) {
                    alert(PRM.Translation.getText('ALERT.INVALID_LESS_THAN_HOURS_WORKED'));
                    return;
                }
                
                // setup mask
                PRM.App.Grid.addMask();
                
                assignment.setDirty();
                store.add(assignment);
                
                store.sync({
                    success : function(batch) {
                        var rawData = batch.proxy.reader.rawData,
                            data    = rawData.data;
                        for (var i = 0, ii = data.length; i < ii; i++) {
                            var resourceId = assignmentNode.getResourceId();
                            if (data[i].resourceId == resourceId){

                                // update assignment node
                                assignmentNode.set('id', data[i].gridId);
                                assignmentNode.set('hrsEstimated', newEstimatedHrs);
                                assignmentNode.set('pctComplete', Ext4.util.Format.round(hrsWorked / newEstimatedHrs * 100, 2));
                                // order matters, for some reason there is an error when start date is set first
                                assignmentNode.set('assignEndDate', data[i].assignEndDate);
                                assignmentNode.set('assignStartDate', data[i].assignStartDate);
                                
                                // update task node
                                var taskEstimate    = Number(taskNode.get('hrsEstimated')) + difference,
                                    taskHrsWorked   = Ext4.util.Format.round(taskNode.getHoursWorkedOfChildNodes(), 2),
                                    taskPctComplete = Ext4.util.Format.round((taskHrsWorked / taskEstimate * 100), 2) + '%';
                                
                                taskNode.set('hrsEstimated', taskEstimate);
                                taskNode.set('pctComplete', taskPctComplete);

                                // update project node
                                var projectEstimate = projectNode.get('hrsEstimated');
                                projectEstimate = parseFloat(projectEstimate) + difference;
                                projectNode.set('hrsEstimated', projectEstimate);
                                
                                // add resource summary row if not yet present
                                if (!projectNode.getResourceSummary(resourceId)){
                                    projectNode.insertChild(0, Ext4.create('PRM.Model.Grid', {
                                        id           : assignmentNode.getProjectId() + '~0~0~' + resourceId,
                                        type         : 'resource-summary',
                                        name         : assignmentNode.get('name'),
                                        //role       : assignmentNode.get('role'),
                                        allocations  : '[]',
                                        timeBills    : '[]',
                                        workCalendar : assignmentNode.get('workCalendar'),
                                        leaf         : true
                                    }));
                                }
                                
                                break;
                            }
                        }

                        projectNode.set('timeBills', JSON.stringify(rawData.updates.project.timeBills));
                        
                        // TODO: refresh single node only
                        PRM.App.Grid.view.refresh();
                        PRM.App.Grid.removeMask();
                        PRM.Util.PerfLogs.stop('CELL_EDIT');
                    },
                    failure : function(batch) {
                        var response = batch.operations[0].error;
                        alert(PRM.Translation.getText(response));
                        PRM.App.Grid.removeMask();
                        PRM.Util.PerfLogs.stop('CELL_EDIT');
                    }
                });   
                
            }
        }
    }
});

Ext4.define('PRM.Cmp.Editor.Number', {
    extend : 'Ext4.form.field.Number',
    id : 'prm-editor-number',
    singleton : true,
    hideTrigger : true,
    keyNavEnabled : false,
    mouseWheelEnabled : false
});

// used when entering edit mode, upon clicking "Add Resource" and "Edit Resource" action items
Ext4.define('PRM.Cmp.Editor.ResourceSummary', {
    extend: 'Ext4.form.field.ComboBox',
    id: 'prm-editor-resource-summary',
    singleton: true,
    store: PRM.App.Stores.resourceForm,
    queryMode: 'local',
    displayField: 'name',
    valueField: 'name',
    forceSelection : true,
    selectOnFocus : true,
    listeners: {
        change: function(combo, newValue, oldValue) {
            if (this.projectParams) {
                /*
                 * Project Level > Add Resource
                 */
                var resourceRow = combo.findRecordByValue(newValue);
                
                if (resourceRow) {
                    // store locally the resources under the current project
                    var projectRow = this.projectParams.record,
                        projectId = projectRow.getId();
                    if (!combo.mapProjectResource[projectId]){
                        combo.mapProjectResource[projectId] = this.getResourcesUnderProject(projectRow);
                    }
                   
                    // check that resource to be added is not already present under the project
                    if (this.isResourceUnderProject(resourceRow, projectRow)){
                        alert(PRM.Translation.getText('ALERT.RESOURCE_DUPLICATE'));
                    }
                    else {
                        // proceed with adding resource row
                        var workCalendarId = resourceRow.get('workCalendarId'),
                            workCalendarStore    = PRM.App.Stores.workCalendar,
                            resourceCalendar     = workCalendarStore.getSelectedRecord(workCalendarId),
                            summaryRow = {
                                id : projectId + '~0~0~' + resourceRow.getId(),
                                type: 'resource-summary',
                                name: resourceRow.get('name'),
                                //role: resourceRow.get('role') || '',
                                workCalendar: JSON.stringify(resourceCalendar.raw),
                                allocations: JSON.stringify([]),
                                timeBills: '[]',
                                leaf: true
                            };
                        
                        // add resource to project resource map
                        this.mapProjectResource[projectId].push(resourceRow.get('name'));
                        
                        // replace the initially added blank resource row
                        projectRow.insertChild(1, summaryRow);
                        this.projectParams.record.getChildAt(0).remove(true);
                    }
                    
                    // exit edit mode for the row
                    PRM.Cmp.Editor.Plugin.completeEdit();
                    
                }
            } else {
                /*
                 * Resource Summary Level > Edit Resource
                 */
                var resourceObj = combo.findRecordByValue(newValue).data;
                
                if (!resourceObj) {
                    return;
                }
                
                var oldResourceRow = this.resourceNode,
                    projectId      = oldResourceRow.data.id.split('~')[0],
                    newRowId       = projectId + '~0~0~' + resourceObj.id,
                    newResourceRow = PRM.App.Grid.store.getById(newRowId);
                
                if (oldResourceRow != newResourceRow) {
                    var oldAllocs = JSON.parse(oldResourceRow.data.allocations),
                        newAllocs = newResourceRow ? JSON.parse(newResourceRow.data.allocations) : [],
                        store     = PRM.App.Stores.allocation;
                        
                    // check for overlaps; abort move if at least one is found (including recurrences)
                    for (j in newAllocs) {
                        var aStart = new Date(newAllocs[j].startDate).getTime(),
                            aEnd   = new Date(newAllocs[j].endDate).getTime() + 86400;
                        
                        for (i in oldAllocs) {
                            var bStart = new Date(oldAllocs[i].startDate).getTime(),
                                bEnd   = new Date(oldAllocs[i].endDate).getTime() + 86400;
                            
                            if (PRM.App.Grid.isDateRangeOverlap(aStart, aEnd, bStart, bEnd)) {
                                alert(PRM.Translation.getText('ALERT.ALLOCATION_BULK_MOVE_OVERLAP'));
                                combo.setValue(oldResourceRow.data.name);
                                return;
                            }
                        }
                    }
                    
                    // add mask if all checks passed
                    PRM.App.Grid.addMask();
                    
                    // update all resource-related attributes of all the allocations being moved
                    for (i in oldAllocs) {
                        var alloc = oldAllocs[i];
                        
                        // update ui
                        Ext4.apply(alloc, {
                            approvalStatus : 4,
                            approver       : resourceObj.supervisor,
                            approverName   : resourceObj.supervisorName,
                            resourceId     : resourceObj.id,
                            resourceName   : resourceObj.name,
                            workCalendar   : resourceObj.workCalendarId
                        });
                        
                        // update backend
                        var allocModel = Ext4.create('PRM.Model.Allocation', {
                            id               : store.clientId++,
                            clientId         : store.clientId,
                            allocationId     : alloc.id,
                            resourceId       : alloc.resourceId,
                            projectId        : alloc.projectId,
                            startDate        : alloc.startDate,
                            endDate          : alloc.endDate,
                            allocationNumber : alloc.hrsAllocated,
                            unit             : 'H', // Hours 
                            type             : alloc.allocationType || 1, // hard is the default
                            comment          : alloc.notes || '',
                            nextApprover     : alloc.approver || 0,
                            isDelete         : false
                        });
                        allocModel.setDirty();
                        store.add(allocModel);
                    }
                    
                    store.sync({
                        success : function(batch) {
                            var timeBills = JSON.stringify(batch.proxy.reader.rawData.updatedTimeBills);
                            
                            if (newResourceRow) {
                                // move allocations to the new existing row, then remove current row
                                newResourceRow.set('allocations', JSON.stringify(newAllocs.concat(oldAllocs)));
                                newResourceRow.set('id', newRowId);
                                newResourceRow.set('withAllocations', newResourceRow.data.withAllocations || oldResourceRow.data.withAllocations);
                                newResourceRow.set('withAssignments', newResourceRow.data.withAssignments || oldResourceRow.data.withAssignments);
                                newResourceRow.set('withRecurring', newResourceRow.data.withRecurring || oldResourceRow.data.withRecurring);
                                
                                oldResourceRow.parentNode.removeChild(oldResourceRow);
                            } else {
                                // or change all resource-related values in the current row
                                oldResourceRow.set('allocations', JSON.stringify(oldAllocs));
                                oldResourceRow.set('id', newRowId);
                                oldResourceRow.set('name', resourceObj.name);
                                oldResourceRow.set('workCalendar', JSON.stringify(PRM.App.Stores.workCalendar.getById(resourceObj.workCalendarId).raw));
                            }
                            
                            PRM.App.Grid.view.refresh();
                            PRM.App.Grid.removeMask();
                        },
                        failure : function(batch) {
                            alert('Error updating.');
                            PRM.App.Grid.removeMask();
                        }
                    });

                    PRM.Cmp.Editor.Plugin.completeEdit();
                }
            }
        },
        blur: function(combo){
            if (combo.projectParams) {
                // remove row if user did not select a valid resource
                var firstResourceRow = combo.projectParams.record.getChildAt(0);
                var isValidSelection = (firstResourceRow.raw.id != null);
                if (!isValidSelection){
                    firstResourceRow.remove(true);
                }
            }
            
            // disable editor
            PRM.App.Grid.rowNameEditor = null;
        }
    },
    /*
     * Custom PRM methods and properties
     */
    mapProjectResource: {},
    getResourcesUnderProject: function(projectRow){
        // create list of resources under the current project
        var children = projectRow.get('children'),
            ctr = 0,
            nextChild = (children && children[ctr]) ? children[ctr] : {},
            resources = [];
        while (nextChild.type == 'resource-summary'){
            resources.push(nextChild.name);
            nextChild = children[++ctr];
        }
        return resources;
    },
    isResourceUnderProject: function(resourceRow, projectRow){
        var resourceName = resourceRow.get('name'),
            projectId = projectRow.getId(),
            resources = this.mapProjectResource[projectId];
            
        return Ext4.Array.contains(resources, resourceName);
    }
    
});

Ext4.define('PRM.Cmp.Editor.Project', {
    extend: 'Ext4.form.field.ComboBox',
    id: 'prm-editor-project',
    editorId: 'prm-editor-project',
    store : PRM.App.Stores.assignableProject,
    singleton : true,
    queryMode: 'local',
    displayField: 'name',
    valueField: 'name',
    listeners: {
        change: function(combo, newValue, oldValue) {
            var projectRow = combo.findRecordByValue(newValue);
            if (projectRow){
                var isExisting = PRM.App.Grid.store.getRootNode().findChild('id', projectRow.getId());
                if (isExisting) {
                    alert(PRM.Translation.getText('ALERT.PROJECT_DUPLICATE'));
                    var node = PRM.App.Grid.store.getRootNode().getChildAt(0);
                    if (node.hasChildNodes()) {
                        node.removeAll();
                    }
                    node.remove(true);
                } else {
                    var node = PRM.App.Grid.store.getRootNode().getChildAt(0);
                    if (node.hasChildNodes()) {
                        node.removeAll();
                    }
                    node.set('type', 'project');
                    node.set('id', projectRow.getId());
                    node.set('name', projectRow.get('name'));
                    node.set('hrsEstimated', projectRow.get('hrsEstimated'));
                    node.set('pctComplete', projectRow.get('pctComplete'));
                    node.set('leaf', false);
                    
                    var projTasks = projectRow.get('children');
                    node.set('expanded', projTasks ? true : false);
                    
                    for (var i = 0, length = projTasks.length; i < length; i++) {
                        var projTask = projTasks[i];
                        var newNode = Ext4.create('PRM.Model.Grid', { 
                            id : projectRow.getId() + '~' + projTask.id,
                            type: 'task',
                            name: projTask.name,
                            hrsEstimated: projTask.hrsEstimated,
                            pctComplete: projTask.pctComplete,
                            taskStartDate: projTask.taskStartDate,
                            taskEndDate: projTask.taskEndDate,
                            leaf: projTask.leaf,
                            expanded: true
                        });
                        node.appendChild(newNode);
                    }
                }
                PRM.Cmp.Editor.Plugin.completeEdit();
            }
        },
        blur: function(combo){
         // remove row if user did not select a valid resource
            var projRow = PRM.App.Grid.store.getRootNode().getChildAt(0);
            if (!projRow.getId()){
                if (projRow.hasChildNodes()) {
                    projRow.removeAll();
                }
                projRow.remove(true);
            }
            PRM.App.Grid.rowNameEditor = null;
        }
    }
});

Ext4.define('PRM.Cmp.Editor.TaskAssignment', {
    extend: 'Ext4.form.field.ComboBox',
    id: 'prm-editor-task-assignment',
    editorId: 'prm-editor-task-assignment',
    store : PRM.App.Stores.assignableResource,
    singleton : true,
    queryMode: 'local',
    displayField: 'name',
    valueField: 'name',
    listeners: {
        change: function(combo, newValue, oldValue) {
            var taskAssignmentRow = combo.findRecordByValue(newValue);
            if (taskAssignmentRow){
                var projectId = combo.taskParams.record.parentNode.getId();
                var taskRecordId = combo.taskParams.record.getId();
                var taskNode = PRM.App.Grid.store.getNodeById(taskRecordId);
                var newNode = taskNode.getChildAt(0);
                
                var taskAssignmentNodeId = projectId + '~' + taskNode.getTaskId() + '~0~' + taskAssignmentRow.getId();
                
                var isExisting = PRM.App.Grid.store.getNodeById(taskRecordId).findChild('name', taskAssignmentRow.data.name);
                if (isExisting) {
                    alert(PRM.Translation.getText('ALERT.TASK_ASSIGNMENT_DUPLICATE'));
                    newNode.remove(true);
                } else {
                    var workCalendar = '';
                    if (PRM.App.Grid.store.getRowById(projectId).data.displayAllResources) {
                        workCalendar = PRM.App.Stores.workCalendar.getSelectedRecord(taskAssignmentRow.get('workCalendarId'));
                    } else {
                        workCalendar = PRM.App.Stores.workCalendar.findRecord('name', taskAssignmentRow.get('workCalendar'));
                    }
                    workCalendar = JSON.stringify(workCalendar.raw);
                
                    newNode = Ext4.create('PRM.Model.Grid', {
                        id: taskAssignmentNodeId,
                        type: 'resource',
                        name: taskAssignmentRow.get('name'),
                        //role: '',
                        hrsEstimated: '0',
                        unitPct: '100.0%',
                        timeBills: '[]',
                        workCalendar: workCalendar,
                        leaf: true
                    });
                    
                    taskNode.insertChild(1, newNode);
                    taskNode.getChildAt(0).remove(true);
                }
                PRM.Cmp.Editor.Plugin.completeEdit();
            }
        },
        blur: function(combo){
            var currentNode = PRM.App.Grid.store.getNodeById(this.taskParams.record.getId()).getChildAt(0);
            if (!currentNode.getId()) {
                currentNode.remove(true);
            }
            PRM.App.Grid.rowNameEditor = null;
        }
    }
});

// used when entering edit mode, upon clicking "Re-assign Resources" action item
Ext4.define('PRM.Cmp.Editor.Task', {
    extend: 'Ext4.form.field.ComboBox',
    id: 'prm-editor-task',
    singleton: true,
    store: PRM.App.Stores.projectTaskGrid,
    queryMode: 'local',
    displayField: 'name',
    valueField: 'name',
    listeners: {
        change: function(combo, newValue, oldValue) {
            var newTaskRow = combo.findRecordByValue(newValue);
            var oldTaskRow = this.taskParams.record;
            if (newTaskRow && (newTaskRow.get('name') != oldTaskRow.get('name'))){
                if (this.isTaskUnderProject(newTaskRow.get('id'))){
                    // case when project task to be assigned to is already in grid
                    var existingResources = this.getResourcesUnderTask(newTaskRow.get('name')),
                        toBeAddedResources = this.getResourcesUnderTask(oldTaskRow.get('name')),
                        duplicateResources = Ext4.Array.intersect(existingResources, toBeAddedResources);
                    if (duplicateResources.length > 0){ 
                        // check that resource under a task cannot be re-assigned to another task using the same resource
                        alert('Unable to re-assign. At least one of the resources is already assigned to the target project task.'); // TODO Translate
                        combo.select(oldTaskRow.get('name'));
                    }
                    else {
                        // no duplicates found, proceed with update
                        this.updateTaskView(oldTaskRow, newTaskRow);
                        this.updateTaskRecords(newTaskRow);
                    }
                }
                else {
                    // case when project task to be assigned to is not currently in grid
                    this.updateTaskRecords(newTaskRow, oldTaskRow);
                    
                    // exit edit mode for the row
                    PRM.Cmp.Editor.Plugin.completeEdit();
                }

            }
        },        
        blur: function(combo){
            // disable editor
            PRM.App.Grid.rowNameEditor = null;
        }        
    },
    /*
     * Custom PRM methods and properties
     */
    projectId: null,
    projectNode: null,
    getProjectNode: function(){
        // get project node based on passed task record
        if (!this.projectNode){
            var taskNode = this.taskParams.record;
            this.projectNode = taskNode.parentNode;
        }
        return this.projectNode;
    },
    isTaskUnderProject: function(taskId){
        // check if target task is currently present in the grid
        var isTaskUnderProject = false;
            projectNode = this.getProjectNode(),
            projectChildren = projectNode.childNodes;
        for (var i = 0, ii = projectChildren.length; i < ii; i++){
            var child = projectChildren[i];
            if (child.get('type') == 'task'){
                if (child.getTaskId() == taskId){
                    isTaskUnderProject = true;
                    break;
                }
            }
        }
        return isTaskUnderProject;
    },
    updateTaskView: function(oldTaskRow, newTaskRow){
        // move task resource rows from old task row to new task row
        var existingTaskNode = this.getTaskNode(newTaskRow.get('name')),
            taskAssignments = oldTaskRow.childNodes;
        while (taskAssignments.length > 0){
            // array automatically decreases per insertion of child node to a different location
            existingTaskNode.insertChild(0, taskAssignments[0]);
        }
        
        // exit edit mode for the row
        PRM.Cmp.Editor.Plugin.completeEdit();

        // remove row for source task
        oldTaskRow.remove();
    },
    updateTaskRecords: function(newTaskRow, oldTaskRow){
        // setup store records to be added/removed
        var assignmentStore = PRM.App.Stores.assignment,
            newTaskId = newTaskRow.getId();
            
        //setup mask
        PRM.App.Grid.addMask();

        // identify resources who are re-assigned
        var reassignedTaskResources = [];
        if (oldTaskRow){
            var oldTaskNode = this.getTaskNode(oldTaskRow.get('name')),
                taskAssignments = oldTaskRow.childNodes;
            taskAssignments.forEach(function (e){
                reassignedTaskResources.push(e);
            });
        }
        else {
            var newTaskNode = this.getTaskNode(newTaskRow.get('name')),
                taskAssignments = newTaskNode.childNodes;
            for (var i = 0, ii = taskAssignments.length; i < ii; i++){
                var taskAssignment = taskAssignments[i];
                if (taskAssignment.getTaskId() != newTaskId){
                    reassignedTaskResources.push(taskAssignment);
                }
            }
        }
            
        // setup task assignment updates
        for (var i = 0; i < reassignedTaskResources.length; i++) {
            var taskAssignment = reassignedTaskResources[i];
            this.removeTaskAssignment(taskAssignment, assignmentStore);
            this.addTaskAssignment(taskAssignment, assignmentStore, newTaskId);
        }
        
        // proceed with NS record updates
        this.commitTaskUpdates(reassignedTaskResources, assignmentStore, newTaskId);

    },
    removeTaskAssignment: function(taskAssignment, assignmentStore){
        // remove task assignment from old project task
        var assignment  = Ext4.create('PRM.Model.Assignment', {
            id : assignmentStore.clientId++,
            clientId : assignmentStore.clientId++,
            assignmentId : taskAssignment.getAssignmentId(),
            resourceId : taskAssignment.getResourceId(),
            projectId : taskAssignment.getProjectId(),
            projectTaskId : taskAssignment.getTaskId(),
            isDelete : true
        });
        assignment.setDirty();
        assignmentStore.add(assignment);
    },
    addTaskAssignment: function(taskAssignment, assignmentStore, newTaskId){
        // add task assignment to new project task
        var assignment  = Ext4.create('PRM.Model.Assignment', {
            id : assignmentStore.clientId++,
            clientId : assignmentStore.clientId++,
            assignmentId : 0, // no id yet, to be created in sync
            resourceId : taskAssignment.getResourceId(),
            projectId : taskAssignment.getProjectId(),
            projectTaskId : newTaskId,
            unitPercent : taskAssignment.get('unitPct'),
            billingClassId : taskAssignment.get('billingClassId'),
            unitCost : taskAssignment.get('unitCost'),
            unitPrice : taskAssignment.get('unitPrice'),
            estimatedWork : taskAssignment.get('hrsEstimated'),
            serviceItemId : taskAssignment.get('serviceItemId')
        });
        assignment.setDirty();
        assignmentStore.add(assignment);
    },
    commitTaskUpdates: function(taskAssignments, assignmentStore, newTaskId){
        // commit store updates to backend (NS records)
        var _this = this;
        assignmentStore.sync({
            callback : function(batch) {
                var projectNode = _this.getProjectNode();
                
                PRM.App.Grid.suspendLayouts();
                
                PRM.App.Stores.gridStore.load({
                    node : projectNode,
                    callback : function() {
                        var taskNode = PRM.App.Stores.gridStore.getRowById(_this.getProjectNode().getId() + '~' + newTaskId);
                        if (taskNode) {
                            taskNode.expand();
                        }
                        
                        projectNode.set({
                            timeBills : JSON.stringify(batch.proxy.reader.rawData.updates.project.timeBills),
                            hrsEstimated : batch.proxy.reader.rawData.updates.project.hrsEstimated,
                            pctComplete : batch.proxy.reader.rawData.updates.project.pctComplete
                        });
                        
                        // update grid values
                        PRM.App.Grid.getView().refresh();
                        // remove mask
                        PRM.App.Grid.removeMask();
                        
                        PRM.App.Grid.resumeLayouts(true);
                    }
                });
            },
            failure : function (batch) {
                if (batch.exceptions && batch.exceptions.length > 0) {
                    for (var i = 0; i < batch.exceptions.length; i++) {
                        alert(PRM.Translation.getText(batch.exceptions[i].getError()));
                    }
                }
            }
        });
    },
    updateAssignmentFields: function(taskAssignments, updatedTaskAssignments){
        // update fields of re-assigned task assignment records
        for (var i = 0; i < taskAssignments.length; i++) {
            var taskAssignment = taskAssignments[i],
                resourceId = taskAssignment.getResourceId(),
                assignmentIndex = -1;
            for (var j = 0, jj = updatedTaskAssignments.length; j < jj; j++){
                if (updatedTaskAssignments[j].resourceId == resourceId){
                    assignmentIndex = j;
                    break;
                }
            }
            if (assignmentIndex > -1){
                var updatedTaskAssignment = updatedTaskAssignments[assignmentIndex];
                taskAssignment.set('id', updatedTaskAssignment.gridId);
                taskAssignment.set('assignStartDate', updatedTaskAssignment.assignStartDate);
                taskAssignment.set('assignEndDate', updatedTaskAssignment.assignEndDate);
            }
        }    
    },
    getResourcesUnderTask: function(taskName){
        var resources = [],
            taskNode = this.getTaskNode(taskName);

        // loop through task resources
        var taskResources = taskNode.childNodes;
        for (var i = 0, ii = taskResources.length; i < ii; i++){
            var taskResource = taskResources[i];
            resources.push(taskResource.get('name'));
        }
        
        return resources;
    },
    getTaskNode: function(taskName){
        var taskNode = null,
            projectNode = this.getProjectNode(),
            projectChildren = projectNode.childNodes;
        
        // loop through project node children (note that these can be resource-summary rows, and project task rows)
        for (var i = 0, ii = projectChildren.length; i < ii; i++){
            var child = projectChildren[i];
            if (child.get('type') == 'task'){
                if (child.get('name') == taskName){
                    taskNode = child;
                    break;
                }
            }
        }
        return taskNode;
    }
});

//Used when entering edit mode, upon clicking "Edit Resource" action item
Ext4.define('PRM.Cmp.Editor.Resource', {
    extend: 'Ext4.form.field.ComboBox',
    id: 'prm-editor-resource',
    editorId: 'prm-editor-resource',
    store : PRM.App.Stores.assignableResource,
    singleton : true,
    queryMode: 'local',
    displayField: 'name',
    valueField: 'name',
    listeners: {
        change: function(combo, newResource, oldResource) {
            var newResourceObj = combo.findRecordByValue(newResource),
                oldResourceRow = combo.resourceParams.record;
            
            if (newResourceObj && (newResourceObj.get('name') != oldResourceRow.get('name'))){
                if (!combo.isResourceUnderTask(oldResourceRow.parentNode, newResourceObj.get('name'))){
                    combo.updateTaskRecords(combo, newResourceObj, oldResourceRow);
                }
                else {
                    alert('Unable to re-assign. Resource already assigned to task.');
                    combo.select(oldResourceRow.get('name'));
                }
            }
            else {
                combo.select(oldResourceRow.get('name'));
            }
            PRM.Cmp.Editor.Plugin.completeEdit();
        },
        blur: function(combo){
            PRM.App.Grid.rowNameEditor = null;
        }
    },
    isResourceUnderTask: function(oldTaskRow, resourceName){
        //Check if target resource is currently present in the grid
        var isResourceUnderTask = false;
            taskChildren = oldTaskRow.childNodes;
        for (var i = 0, ii = taskChildren.length; i < ii; i++){
            var child = taskChildren[i];
            if (child.get('type') == 'resource'){
                if (child.get('name') == resourceName){
                    isResourceUnderTask = true;
                    break;
                }
            }
        }
        return isResourceUnderTask;
    },
    editTaskAssignment: function(newResourceId, resourceNode, assignmentStore){
        var oldAssignment  = Ext4.create('PRM.Model.Assignment', {
            id : assignmentStore.clientId++,
            clientId : assignmentStore.clientId++,
            assignmentId : resourceNode.getAssignmentId(),
            resourceId : resourceNode.getResourceId(),
            projectId : resourceNode.getProjectId(),
            projectTaskId : resourceNode.getTaskId(),
            isDelete : true
        });
        oldAssignment.setDirty();
        assignmentStore.add(oldAssignment);
        
        var newAssignment  = Ext4.create('PRM.Model.Assignment', {
            id : assignmentStore.clientId++,
            clientId : assignmentStore.clientId++,
            assignmentId : -1,
            resourceId : newResourceId,
            projectId : resourceNode.getProjectId(),
            projectTaskId : resourceNode.getTaskId(),
            unitPercent : resourceNode.get('unitPct'),
            unitCost : resourceNode.get('unitCost'),
            estimatedWork : resourceNode.get('hrsEstimated'),
            isDelete : false
        });
        newAssignment.setDirty();
        assignmentStore.add(newAssignment);
    },
    updateAssignmentFields: function(combo, resourceNode, taskAssignment){
        var gridStore = PRM.App.Stores.gridStore;

        // update assignment id, remove summary row if there are no more allocations / assignments left
        var oldResourceId = resourceNode.getResourceId();
        resourceNode.set('id', taskAssignment.gridId);            
        var oldSummaryId = [resourceNode.getProjectId(), 0, 0, oldResourceId].join('~');
        var oldSummaryRow = gridStore.getRowById(oldSummaryId);
        if (oldSummaryRow 
            && oldSummaryRow.getAllocations().length == 0 // JSON.parse(oldSummaryRow.get('allocations')).length == 0
            && !oldSummaryRow.hasAssignment() ) {
            oldSummaryRow.remove();
        }
        
        // add summary row if not yet present
        var resourceObj     = combo.findRecord('id', parseInt(taskAssignment.resourceId)),
            newSummaryId    = [resourceNode.getProjectId(), 0, 0, taskAssignment.resourceId].join('~'),
            projectRow      = gridStore.getRowById(resourceNode.getProjectId()),
            newSummaryRow   = gridStore.getRowById(newSummaryId),
            workCalendarId  = resourceObj.get('workCalendarId'),
            workCalendar    = JSON.stringify(PRM.App.Stores.workCalendar.getById(workCalendarId).data);
            //role            = (resourceObj.get('role') == '-' || '') ? '' : resourceObj.get('role');
        if (!newSummaryRow) {
            newSummaryRow = {
                id : newSummaryId,
                type: 'resource-summary',
                name: resourceObj.get('name'),
                //role: role,
                workCalendar: workCalendar,
                allocations: '[]',
                timeBills: '[]',
                leaf: true,
                expanded: true
            };
            projectRow.insertChild(0, newSummaryRow);
        }
    },
    commitTaskUpdates: function(combo, resourceNode, assignmentStore){
        // commit store updates to backend (NS records)
        assignmentStore.sync({
            success : function(batch) {
                // retrieve updated task assignment
                var taskAssignments = batch.proxy.reader.rawData.data,
                    taskAssignment = taskAssignments[0];

                //Update grid fields
                combo.updateAssignmentFields(combo, resourceNode, taskAssignment);

                PRM.App.Grid.getView().refresh();
                PRM.App.Grid.removeMask();
            },
            failure : function (batch) {
                var operations = batch.operations,
                    response = null;
                
                for (var i = 0; i < operations.length; i++) {
                    response = batch.proxy.getReader().jsonData.message;
                }
                alert(PRM.Translation.getText(response));
                
                PRM.App.Grid.removeMask();
            }
        });
    },
    updateTaskRecords: function(combo, newResourceObj, oldResourceRow){
        var newResourceId  = newResourceObj.getId(),
            assignmentStore = PRM.App.Stores.assignment;
        
        PRM.App.Grid.addMask();
        
        combo.editTaskAssignment(newResourceId, oldResourceRow, assignmentStore);
        combo.commitTaskUpdates(combo, oldResourceRow, assignmentStore);
        
        PRM.Cmp.Editor.Plugin.completeEdit();
    }
});