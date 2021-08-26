/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

Ext4.define('PRM.Cmp.AllocationNSForm', {
    extend : 'PRM.Cmp.NSForm',
    
    config : {
        urlType    : 'record',
        identifier : 'resourceallocation',
        formName   : 'allocationPopup',
        returnData : 'allocation',
        callback : {
            script : 'customscript_prm_sl_allocation_callback',
            deploy : 'customdeploy_prm_sl_allocation_callback'
        }
    },
    
    callbackFunction : function(me, eventType, recordId) {
        var response = nlapiRequestURL(me.getCallbackURL());
        
        if (response.code == 200) {
            var returnData = JSON.parse(response.body);
            
            Ext4.apply(me.record, returnData[me.config.returnData]);
            me.applyToGrid(eventType);
        } else {
            // HANDLE
            return;
        }
    },
    
    applyToGrid : function(eventType) {
        PRM.Util.PerfLogs.start('ALLOCATION_FORM');
        
        var allocationId   = this.record.id,
            gridStore      = PRM.App.Stores.gridStore;
            resourceId     = this.record.resource || this.record.prevResource,
            projectId      = this.record.project || this.record.prevProject,
            summaryRowId   = projectId + '~0~0~' + resourceId,
            summaryRow     = gridStore.getRowById(summaryRowId),
            projectRow     = gridStore.getRowById(projectId);
            
        if (eventType == 'delete') {
            projectRow.set('timeBills', JSON.stringify(this.record.timeEntries));
            this.removeAllocationFromSummary(summaryRow, allocationId);
        } else {
            // update project rollup before anything else
            if (projectRow) {
                projectRow.set('timeBills', JSON.stringify(this.record.timeEntries));
            } else {
                // ideally, we only reload if the new project row belongs to the current page...
                // for now, reload regardless of new project's positioning
                PRM.App.Stores.pageList.loadWithFilters(Ext4.getCmp('prm-page-combo-box').getValue(), projectId);
                return;
            }
            
            // update previous resouce summary & project rows
            var prevResource   = this.record.prevResource,
                prevProject    = this.record.prevProject,
                prevSummaryRow = (prevProject && prevProject != projectId) || (prevResource && prevResource != resourceId) ? gridStore.getRowById(prevProject + '~0~0~' + prevResource) : null,
                prevProjectRow = prevProject && prevProject != projectId ? gridStore.getRowById(prevProject) : null;
            
            if (prevSummaryRow) {
                this.removeAllocationFromSummary(prevSummaryRow, allocationId);
            }
            if (prevProjectRow) {
                prevProjectRow.set('timeBills', JSON.stringify(this.record.previousProjectTimeEntries));
            }
            
            // always expand project row, but first remember if already loaded
            var isPreviouslyLoaded = projectRow.isLoaded();
            projectRow.expand();
            
            // no need to do anything if project row was previously not loaded before expanding
            if (!isPreviouslyLoaded) {
                return;
            }
            
            // otherwise create/update new summary row
            var gridAllocation = {
                id                 : allocationId,
                resourceId         : resourceId,
                resourceName       : this.record.resourceName,
                projectId          : projectId,
                projectName        : this.record.projectName,
                workCalendar       : this.record.workCalendar,
                hrsAllocated       : Number(this.record.numberHours),
                pctComplete        : this.record.percentOfTime,
                startDate          : this.record.startDate,
                endDate            : this.record.endDate,
                allocationType     : this.record.allocationType,
                approver           : this.record.nextApprover,
                approverName       : this.record.nextApproverName,
                approvalStatus     : this.record.approvalStatus,
                notes              : this.record.notes,
                isResourceInactive : 'F', // not sure where this comes from; hardcode from now...
                
                // for recurring allocations
                frequency          : this.record.frequency,
                period             : this.record.period,
                dayOfWeek          : this.record.dayOfWeek,
                dayOfWeekMask      : this.record.dayOfWeekMask,
                dayOfWeekInMonth   : this.record.dayOfWeekInMonth,
                seriesStartDate    : this.record.seriesStartDate,
                seriesEndDate      : this.record.seriesEndDate
            };
            
            if (summaryRow) {
                var allocationList = JSON.parse(summaryRow.get('allocations'));
                
                if (Array.isArray(allocationList)) {
                    // update existing
                    for (var i = 0; allocationId && i < allocationList.length; i++) {
                        if (allocationId && allocationId == allocationList[i].id) {
                            allocationList[i] = gridAllocation;
                            break;
                        }
                    }
                    // or add new
                    if (i == allocationList.length) {
                        allocationList.push(gridAllocation);
                    } 
                }
                summaryRow.set('allocations', JSON.stringify(allocationList));
            } else {
                summaryRow = Ext4.create('PRM.Model.Grid', {
                    id          : summaryRowId,
                    type        : 'resource-summary',
                    name        : this.record.resourceName,
                    workCalendar: JSON.stringify(PRM.App.Stores.workCalendar.getById(Number(this.record.workCalendar)).raw),
                    allocations : JSON.stringify([gridAllocation]),
                    timeBills   : '[]',
                    leaf        : true,
                    expanded    : true
                });
                
                var position = 0;
                // TODO: correct position
                projectRow.insertChild(position, summaryRow);
            }
            
            PRM.App.Stores.gridStore.createRecurrencesByNode(summaryRow);
            PRM.App.Grid.view.refresh();
        }
        
        PRM.Util.PerfLogs.stop('ALLOCATION_FORM');
    },
    
    removeAllocationFromSummary : function (summaryRow, allocationId) {
        var allocationList = JSON.parse(summaryRow.get('allocations')),
            retainedAllocs = [];
        
        for (var i = 0; i < allocationList.length; i++) {
            if (allocationId != allocationList[i].id && !(allocationList[i].id.indexOf('recurrence') != -1 && allocationList[i].id.split('~')[1] == allocationId)) {
                retainedAllocs.push(allocationList[i]);
            }
        }
        
        if (retainedAllocs.length == 0) {
            var p = summaryRow.parentNode;
            if (p.childNodes.length == 1) { // there is a bug where the parent is also removed when using removeChild, if the summaryRow is the last child
                p.removeAll();
            } else {
                p.removeChild(summaryRow);
            }
        } else {
            summaryRow.set('allocations', JSON.stringify(retainedAllocs));
        }
    }
});