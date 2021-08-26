/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

Ext4.define('PRM.Cmp.AllocationForm', {
    extend : 'PRM.Cmp.Form',
    store : PRM.App.Stores.allocation,
    initComponent : function (args) {
        var window = this,
            formPanel = window.items,
            windowId = '#' + window.id + '-';
        
        window.setItems(formPanel);
        
        this.callParent(args); // call after Ext4.applyIf to create items and call before accessing items/dockedItems applied
        
        var saveBtn     = window.down(windowId + 'panel-save'),
            resourceCmb = window.down(windowId + 'resource'),
            projectCmb  = window.down(windowId + 'job'),
            approverCmb = window.down(windowId + 'approver');
        
        saveBtn.setHandler(function (button, event) {
            var resourceId   = Ext4.isArray(resourceCmb.getValue()) ? resourceCmb.getValue()[0] : resourceCmb.getValue(),
                projectId    = Ext4.isArray(projectCmb.getValue()) ? projectCmb.getValue()[0] : projectCmb.getValue(),
                resourceObj  = resourceCmb.getStore().getSelectedRecord(resourceId),
                projectObj   = projectCmb.getStore().getSelectedRecord(projectId),
                startDate    = Ext4.Date.clearTime(window.down(windowId +'startDate').getValue()),
                endDate      = Ext4.Date.clearTime(window.down(windowId +'endDate').getValue()),
                approver     = Ext4.isArray(approverCmb.getValue()) ? approverCmb.getValue()[0] : approverCmb.getValue(),
                approverName = approverCmb.getRawValue(),
                allocation   = Ext4.create('PRM.Model.Allocation', {
                    id : window.store.clientId++,
                    clientId : window.store.clientId++,
                    allocationId : window.recordId || 0,
                    resourceId : resourceId,
                    projectId : projectId,
                    startDate : startDate,
                    endDate : endDate,
                    allocationNumber : window.down(windowId +'allocationNumber').getValue(),
//                    unit : window.down( +'unit').getValue(), // TODO source from settings for UNIT
                    type : window.down(windowId +'allocationType').getValue(),
                    comment : window.down(windowId +'notes').getValue(),
                    nextApprover : approver,
                    nextApproverName : approverName
                });

            if (window.type == 'edit'){
                // when saving an allocation into a new project, check that previous allocation can be deleted
                var oldProjectId = window.record.projectId;
                if (projectId != oldProjectId){
                    allocation.set('prevProjectId', oldProjectId);
                    if (!window.isDeletable){
                        alert(PRM.Translation.getText('ALERT.REALLOCATION_ERROR_TASK_ASSIGNMENT'));
                        return false;
                    }
                }
            }
            
            allocation.setDirty();
            
            if (PRM.App.Settings.checkNonWorkingDays) {
                var workCalendarStore = PRM.App.Stores.workCalendar,
                    resourceCalendar  = workCalendarStore.getSelectedRecord(resourceObj.get('workCalendarId')).raw,
                    isStartWorkDay    = PRM.Util.WorkCalendar.isWorkDay(resourceCalendar, startDate),
                    isEndWorkDay      = PRM.Util.WorkCalendar.isWorkDay(resourceCalendar, endDate);
                
                if (!(isStartWorkDay && isEndWorkDay)) {
                    if (window.type == 'new')
                        alert(PRM.Translation.getText('ALERT.ALLOCATION_ERROR_NON_WORKING'));
                    else
                        alert(PRM.Translation.getText('ALERT.REALLOCATION_ERROR_NON_WORKING'));
                    return false;
                }
            }
            
            var projectNode = PRM.App.Grid.store.getRootNode().findChildBy(function (node) {
                return node.getId() == projectId;
            });
            
            //projectNode is in the page
            if (projectNode) {
                projectNode.expand(null, function () {
                    var hasOverlap = window.validateOverlaps(startDate, endDate, window, projectId, resourceId);
                    if (!hasOverlap) {
                        window.saveToStore(window, allocation, resourceObj, projectObj);
                    }
                });
            } else {
                var hasOverlap = window.validateOverlaps(startDate, endDate, window, projectId, resourceId);
                if (!hasOverlap) {
                    window.saveToStore(window, allocation, resourceObj, projectObj);
                }
            }
        });
    },
    componentIdList : [
        'resource', 'job', 'startDate', 'endDate', 'allocationNumber', 'allocationType', 'notes', 'approver'
    ],
    applyToGrid : function (window, allocation, resourceObj, projectObj, rawData) {
        var allocationId         = Number(allocation.get('allocationId')),
            resourceId           = Number(allocation.get('resourceId')),
            projectId            = Number(allocation.get('projectId')),
            allocationStartDate  = allocation.get('startDate'),
            allocationEndDate    = allocation.get('endDate'),
            workCalendarStore    = PRM.App.Stores.workCalendar,
            resourceCalendar     = workCalendarStore.getSelectedRecord(resourceObj.get('workCalendarId')),
            gridStore            = PRM.App.Stores.gridStore,
            summaryRow           = gridStore.getRowById(projectId + '~0~0~' + resourceId),
            projectRow           = gridStore.getRowById(projectId),
            prevSummaryRow       = window.record && (Number(window.record.resourceId) != resourceId || (window.record && Number(window.record.projectId) != projectId)) ? gridStore.getRowById(window.record.projectId + '~0~0~' + window.record.resourceId) : null,
            prevProjectRow       = prevSummaryRow ? prevSummaryRow.parentNode : ((window.record && Number(window.record.projectId) != projectId) ? gridStore.getRowById(window.record.projectId) : null),
            gridAllocation       = {
                    id              : allocationId,
                    resourceId      : resourceId,
                    resourceName    : resourceObj.get('name'),
                    projectId       : projectId,
                    projectName     : projectObj.get('name'),
                    //role            : resourceObj.get('role'),
                    workCalendar    : resourceCalendar.get('id'),
                    hrsAllocated    : allocation.get('hour'),
                    pctComplete     : allocation.get('percent'),
                    startDate       : allocationStartDate.format(nsDateFormat),
                    endDate         : allocationEndDate.format(nsDateFormat),
                    allocationType  : allocation.get('type'),
                    approver        : allocation.get('nextApprover'),
                    approverName    : allocation.get('nextApproverName'),
                    notes           : allocation.get('comment')
                };
            
        if (summaryRow) {
            var allocationList = JSON.parse(summaryRow.get('allocations')),
                found = false;
            
            if (Array.isArray(allocationList)) {
                // search/update existing.
                for (var i = 0; window.recordId && i < allocationList.length; i++) {
                    if (window.recordId && window.recordId == allocationList[i].id) {
                        allocationList[i] = gridAllocation;
                        found = true;
                        break;
                    }
                }
                // add if new
                if (!found) {
                    allocationList.push(gridAllocation);
                } 
            }
            summaryRow.set('allocations', JSON.stringify(allocationList));
        } else {
            summaryRow = {
                id : projectId + '~0~0~' + resourceId,
                type: 'resource-summary',
                name: resourceObj.get('name'),
                //role: resourceObj.get('role'),
                workCalendar: JSON.stringify(resourceCalendar.raw),
                allocations: JSON.stringify([gridAllocation]),
                timeBills: '[]',
                leaf: true,
                expanded: true
            };
            
            if (projectRow) {
                projectRow.insertChild(0, summaryRow);
            } else {
//                // if total pages == 1 and pageSize < densitySetting, add to page
//                projectRow = Ext4.create('PRM.Model.Grid', {
//                    id : projectId,
//                    type: 'project',
//                    name: projectObj.get('name'),
//                    hrsEstimated: projectObj.get('hrsEstimated'),
//                    pctComplete: projectObj.get('pctComplete'),
//                    leaf: false,
//                    expanded: true,
//                    children: [summaryRow]
//                })
//                   gridStore.getRootNode().insertChild(0, projectRow);
//                // else do nothing? assumed added to other pages.
            }
        };
        window.removeFromGrid(prevSummaryRow, window.recordId);
        
        projectRow.set('timeBills', JSON.stringify(rawData.updatedTimeBills));
        if (rawData.prevUpdatedTimeBills) {
            prevProjectRow.set('timeBills', JSON.stringify(rawData.prevUpdatedTimeBills));
        }
    },
    removeFromGrid : function (summaryRow, allocationId) {
        if (summaryRow) { 
            // from edit form, resource edited. remove allocation from summary
            var allocationList = JSON.parse(summaryRow.get('allocations')),
                retainedAllocs = [];
            
            for (var i = 0; i < allocationList.length; i++) {
                if (allocationId != allocationList[i].id) {
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
    },
    setItems : function (formPanel) {
        var window = this;
            
        Ext4.apply(formPanel, {
            defaults : {
                allowBlank : false
            },
            items : [
                {
                    xtype : 'panel',
                    layout : 'hbox',
                    border : false,
                    items : [
                        {
                            xtype: 'prm-combobox-dynamic',
                            id: window.id + '-resource',
                            fieldLabel : PRM.Translation.getText('FIELD.RESOURCE'),
                            emptyText: PRM.Translation.getText('TITLE.SELECT_RESOURCES'),
                            store : PRM.App.Stores.resourceForm,
                            multiSelect: false,
                            width: 355,
                            allowBlank: false,
                            searchWindow : 'raResourceData',
                            
                            _onChange : function(resourceId) {
                                if (resourceId && !isApprovalDisabled) { // do not trigger on reset & if approval is disabled
                                    var resourceObj    = this.getStore().getById(resourceId),
                                        supervisorId   = resourceObj.get('supervisor'),
                                        supervisorName = resourceObj.get('supervisorName'),
                                        approverCmb    = Ext4.getCmp(window.id + '-approver');
                                    
                                    if (supervisorId) {
                                        approverCmb.setValue(supervisorId, supervisorName);
                                    } else {
                                        approverCmb.setValue('', '');
                                    }
                                }
                            }
                        }, {
                            xtype : 'prm-resource-search-btn',
                            id : window.id + '-search-resource-btn',
                            handler: function() {
                                PRM.App.Forms.resourceSearch.triggerFormId = window.id;
                                PRM.App.Forms.resourceSearch.show();
                            }
                        }
                    ]
                },
                {
                    xtype: 'prm-combobox-dynamic',
                    id: window.id + '-job',
                    fieldLabel : PRM.Translation.getText('FIELD.CUSTOMER_PROJECT'),
                    emptyText: PRM.Translation.getText('TITLE.SELECT_PROJECT'),
                    store : PRM.App.Stores.projectForm,
                    multiSelect: false,
                    allowBlank: false,
                    searchWindow : 'raProjectData',
                },
                {
                    xtype : 'prm-date',
                    id : window.id + '-startDate',
                    allowBlank : false,
                    fieldLabel : PRM.Translation.getText('FIELD.START_DATE'),
                    listeners : {
                        blur : function(dateField, blurEvent, e) {
                            var startDate  = dateField.getValue(),
                                endDateCmp = window.down('#' + window.id + '-endDate');
                            if (dateField.isValid() && endDateCmp.isValid() && startDate > endDateCmp.getValue()) {
                                endDateCmp.setValue(startDate);
                            }
                        }
                    }
                },
                {
                    xtype : 'prm-date',
                    id : window.id + '-endDate',
                    allowBlank : false,
                    fieldLabel : PRM.Translation.getText('FIELD.END_DATE'),
                    listeners : {
                        blur : function(dateField, blurEvent, e) {
                            var endDate      = dateField.getValue(),
                                startDateCmp = window.down('#' + window.id + '-startDate');
                            
                            if (dateField.isValid() && startDateCmp.isValid() && startDateCmp.getValue() > endDate) {
                                startDateCmp.setValue(endDate);
                            }
                        }
                    }
                },
                {
                    xtype : 'prm-field-container',
                    layout : 'hbox',
                    items : [
                        {
                            xtype : 'prm-number',
                            id : window.id + '-allocationNumber',
                            allowBlank : false,
                            fieldLabel : PRM.Translation.getText('FIELD.ALLOCATE')
                        }, {
                            xtype : 'prm-display',
                            id : window.id + '-unit-label',
                            value : 'Hours', // TODO Source from Settings
                            cls : 'prm-form-label',
                            margin : '18 0 0 10',
                        }
                    ]
                },
                {
                    xtype : 'prm-combobox',
                    id : window.id + '-allocationType',
                    fieldLabel : PRM.Translation.getText('FIELD.ALLOCATION_TYPE'),
                    allowBlank : false,
                    store : PRM.App.Stores.allocationType
                        
                },
                {
                    xtype : 'prm-display',
                    id : window.id + '-status',
                    fieldLabel : PRM.Translation.getText('FIELD.APPROVAL_STATUS'),
                    hidden : isApprovalDisabled,
                    value : 'Pending Approval'
                },
                {
                    xtype: 'prm-combobox-dynamic',
                    id: window.id + '-approver',
                    fieldLabel : PRM.Translation.getText('FIELD.NEXT_APPROVER'),
                    emptyText: PRM.Translation.getText('TITLE.SELECT_APPROVER'),
                    store : PRM.App.Stores.approver,
                    multiSelect: false,
                    allowBlank: isApprovalDisabled,
                    searchWindow : 'raApproverData',
                    hidden : isApprovalDisabled
                },
                {
                    xtype : 'textarea',
                    id : window.id + '-notes',
                    fieldLabel : PRM.Translation.getText('FIELD.COMMENTS'),
                    allowBlank : true,
                    grow : true,
                    width : 350,
                    labelSeparator : '',
                    labelAlign : 'top'
                }
            ]
        });
    },
    validateOverlaps : function (startDate, endDate, window, projectId, resourceId) {
        if (PRM.App.Settings.checkOverlap) {
            var periodStart  = startDate.getTime(),
                periodEnd    = endDate.getTime(),
                gridStore    = PRM.App.Stores.gridStore,
                summaryRow   = window.gridRow || gridStore.getRowById(projectId + '~0~0~' + resourceId),
                allocations  = summaryRow ? summaryRow.getAllocations(periodStart, periodEnd) : [],
                allocations2 = [];
            
            if (window.recordId && allocations) {
                var id = Number(window.recordId);
                for (var i = 0; i < allocations.length; i++) {
                    var allocId = Number(allocations[i].id);
                    if (id == allocId) {
                        continue;
                    }
                    
                    allocations2.push(allocations[i]);
                }
            } else allocations2 = allocations;
            
            if (allocations2 && allocations2.length) {
                alert(PRM.Translation.getText('ALERT.ALLOCATION_ERROR_OVERLAP'));
                
                //has overlap
                return true;
            }
        }
    },
    saveToStore : function (window, allocation, resourceObj, projectObj) {
        window.store.add(allocation);
        window.store.sync({
            success : function(batch) {
                var newRecord = batch.operations[0].resultSet.records[0];
                
                window.applyToGrid(window, allocation, resourceObj, projectObj, batch.proxy.reader.rawData);
                window.hide(null, window.resetFormFields);
            },
            failure : function(batch) {
                console.log('allocation save failed');
                console.log(batch);
                alert(batch.proxy.getReader().jsonData.message);
                window.hide(null, window.resetFormFields);
            }
        });
    },
    listeners : {
        boxready : function (window, width, height, eOpts ) {
            if (window.type == 'edit') {
                var windowId    = '#' + window.id + '-',
                    deleteBtn   = window.down(windowId +'panel-delete'),
                    resourceCmb = window.down(window.id + 'resource');
                
    //                resourceCmb.searchWindow = 'editAllocResourceData';
                
                deleteBtn.show();
                deleteBtn.setHandler(function (button, event) {
                
                    var gridStore    = PRM.App.Stores.gridStore,
                        record       = window.record,
                        summaryRow   = gridStore.getRowById(record.projectId + '~0~0~' + record.resourceId);
    
                    if (!window.isDeletable){
                        alert(PRM.Translation.getText('ALERT.DELETE_ERROR_TASK_ASSIGNMENT'));
                    }
                    else {
                        var allocation  = Ext4.create('PRM.Model.Allocation', {
                                id           : window.store.clientId++,
                                clientId     : window.store.clientId++,
                                allocationId : record.id,
                                resourceId   : record.resourceId,
                                projectId    : record.projectId,
                                isDelete     : true
                            });
                        allocation.setDirty();
                        
                        window.store.add(allocation);
                        window.store.sync({
                            success : function(batch) {
                                alert(PRM.Translation.getText('ALERT.DELETE_ALLOCATION_SUCCESS'));
                                window.removeFromGrid(summaryRow, record.id);
                                window.hide(null, window.resetFormFields);
                            },
                            failure : function(batch) {
                                alert(batch.proxy.getReader().jsonData.message);
                                window.hide(null, window.resetFormFields);
                            }
                        });
                    }
                });
            }
        },
        beforeShow : function (window) {
            if (window.type == 'edit') {
                // set values of items from selected record.
                if (!window.record) {
                    return false;
                }
                
                var windowId        = '#' + window.id + '-',
                    componentIdList = window.componentIdList,
                    gridRow         = window.gridRow,
                    record          = window.record,
                    resourceId      = record.resourceId,
                    projectId       = record.projectId,
                    resourceFld     = window.down(windowId + 'resource'),
                    projectFld      = window.down(windowId + 'job'),
                    approverFld     = window.down(windowId + 'approver'),
                    allocAmtFld     = window.down(windowId + 'allocationNumber');
                
                for (var i = 0; i < componentIdList.length; i++) {
                    var value = isNaN(record[componentIdList[i]]) ? record[componentIdList[i]] : Number(record[componentIdList[i]]), // allocationType, approver, notes, startDate, endDate
                        fld = window.down(windowId + componentIdList[i]); 
                    if (value && fld) {
                        fld.setValue(value);
                    }
                }
                
                resourceFld.setValue(Number(record.resourceId), record.resourceName);
                projectFld.setValue(Number(record.projectId), record.projectName);
                approverFld.setValue(Number(record.approver), record.approverName);
                allocAmtFld.setValue(record.hrsAllocated);
                
                resourceFld.setReadOnly(true);
                
                Ext4.getCmp(window.id + '-search-resource-btn').hide();
                Ext4.getCmp(window.id + '-resource').setWidth(375);
                
                // set business rules before allowing deletion of allocation
                window.setDeletionRules(gridRow, record);
            }
        }
    },
    setDeletionRules : function(gridRow, record){
        var window = this,
            resourceAllocations = JSON.parse(gridRow.get('allocations'));
        
        window.isDeletable = true;
        if (resourceAllocations && resourceAllocations.length > 0) {
            if (resourceAllocations.length === 1) {
                // should not delete only remaining allocation if there is at least one task assignment for the resource
                var taskAssignments = gridRow.getAssignments(record.projectId, record.resourceId);
                if (taskAssignments.length > 0) {
                    window.isDeletable = false;
                }
            } 
            else {
                // should not delete allocation if it coincides with at least one of the task assignments
                var assignmentsUnderAllocation = gridRow.getAssignments(record.projectId, record.resourceId, new Date(record.startDate).getTime(), new Date(record.endDate).getTime());
                if (assignmentsUnderAllocation && assignmentsUnderAllocation.length > 0){
                    window.isDeletable = false;
                }
            }
        }
    }
});