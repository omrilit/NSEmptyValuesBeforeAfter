/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

Ext4.define('PRM.Cmp.AssignmentForm', {
    extend : 'PRM.Cmp.Form',
    store : PRM.App.Stores.assignment,
    initComponent : function (args) {
        var window    = this,
            formPanel = window.items;
        
        window.setItems(formPanel);
        
        this.callParent(args); // call after Ext4.applyIf to create items and call before accessing items/dockedItems applied

        var windowId         = '#'+window.id + '-',
            saveBtn          = window.down(windowId +'panel-save'),
            resourceCmb      = window.down(windowId +'resource'),
            resourceHidden   = window.down(windowId +'resource-hidden'),
            projectCmb       = window.down(windowId +'job'),
            projectTaskCmb   = window.down(windowId +'project-task'),
            unitPercentTxt   = window.down(windowId +'unit-percent'),
            billingClassCmb  = window.down(windowId +'billing-class'),
            unitCostTxt      = window.down(windowId +'unit-cost'),
            estimatedWorkTxt = window.down(windowId +'estimated-work'),
            unitPriceTxt     = window.down(windowId +'unit-price'),
            serviceItemCmb   = window.down(windowId +'service-item'),
            startDateFld     = window.down(windowId +'start-date'),
            endDateFld       = window.down(windowId +'end-date');
            
        saveBtn.setHandler(function () {
            window.el.mask(PRM.Translation.getText('MASK.SAVING'));
            var resourceId     = resourceCmb.getValue(),
                prevResourceId = resourceHidden.getValue(),
                projectId      = projectCmb.getValue(),
                projectTaskId  = projectTaskCmb.getValue(),
                unitPercent    = unitPercentTxt.getValue(),
                billingClassId = billingClassCmb.getValue(),
                unitCost       = unitCostTxt.getValue(),
                estimatedWork  = estimatedWorkTxt.getValue(),
                unitPrice      = unitPriceTxt.getValue(),
                serviceItemId  = serviceItemCmb.getValue(),
                startDate      = startDateFld.getValue(),
                endDate        = endDateFld.getValue();
            
            var assignment  = Ext4.create('PRM.Model.Assignment', {
                id             : window.store.clientId++,
                clientId       : window.store.clientId++,
                assignmentId   : window.recordId || 0,
                resourceId     : resourceId,
                prevResourceId : prevResourceId,
                projectId      : projectId,
                projectTaskId  : projectTaskId,
                unitPercent    : unitPercent,
                billingClassId : billingClassId,
                unitCost       : unitCost,
                estimatedWork  : estimatedWork,
                unitPrice      : unitPrice,
                startDate      : startDate,
                endDate        : endDate,
                serviceItemId  : serviceItemId
            });
                
            assignment.setDirty();
            
            window.store.add(assignment);
            
            window.store.sync({
                success : function(batch) {
                    var response = batch.proxy.reader.rawData;
                    window.applyToGrid(response.data);
                    window.el.unmask();
                    window.hide(null, window.resetFormFields);
                    alert(PRM.Translation.getText(response.message));
                },
                failure : function (batch) {
                    window.el.unmask();
                    var response = batch.proxy.reader.rawData;
                    alert(PRM.Translation.getText(response.message));
                }
            });
        });
    },
    applyToGrid : function(responseData) {
        PRM.App.Grid.suspendLayouts();
        
        /*
         * first, update grid data from form
         */
        var window           = this,
            windowId         = '#'+window.id + '-',
            resourceCmb      = window.down(windowId +'resource'),
            resourceHidden   = window.down(windowId +'resource-hidden'),
            projectCmb       = window.down(windowId +'job'),
            projectTaskCmb   = window.down(windowId +'project-task'),
            billingClassCmb  = window.down(windowId +'billing-class'),
            unitCostTxt      = window.down(windowId +'unit-cost'),
            estimatedWorkTxt = window.down(windowId +'estimated-work'),
            unitPriceTxt     = window.down(windowId +'unit-price'),
            serviceItemCmb   = window.down(windowId +'service-item');

        var _resourceId    = resourceCmb.getValue(),
            resourceId     = Ext4.isArray(_resourceId) ? _resourceId[0] : _resourceId,
            resource       = resourceCmb.store.getById(resourceId),
            resourceName   = resource.get('name'),
            workCalendarId = resource.get('workCalendarId'),
            //role         = (resource.get('role') == '-' || '') ? '' : resource.get('role')
            workCalendar   = JSON.stringify(PRM.App.Stores.workCalendar.getById(workCalendarId).data),
            billingClassId = billingClassCmb.getValue() || 0,
            unitCost       = unitCostTxt.getValue(), // format to 1.00
            unitPrice      = unitPriceTxt.getValue(), // format to 1.00
            serviceItemId  = serviceItemCmb.getValue() || 0,
            estimatedWork  = estimatedWorkTxt.getValue(),
            projectId      = projectCmb.getValue(),
            projectTaskId  = projectTaskCmb.getValue(),
            gridStore      = PRM.App.Stores.gridStore;
        
        /*
         * then update grid data from callback
         * callback includes sibling task assignments as well
         */        
        for (var i = 0; i < responseData.length; i++) {
            var data = responseData[i],
                node = PRM.App.Grid.store.getRowById(data.gridId);
            
            if (!node || window.recordId == data.assignmentId) {
                var newSummaryId   = [projectId, 0, 0, resourceId].join('~'),
                    projectRow     = gridStore.getRowById(projectId),
                    newSummaryRow  = gridStore.getRowById(newSummaryId),
                    taskNode       = null;
                
                if (window.recordId) { // update assignment edited via form
                    node = window.record;
    
                    // check for old resource summary if needs replacement / has allocation
                    var oldResourceId  = node.getResourceId(),
                        oldSummaryId   = [projectId, 0, 0, oldResourceId].join('~'),
                        oldSummaryRow  = gridStore.getRowById(oldSummaryId);
                    
                    // update the node.
                    node.set('id', data.gridId);
                    
                    // check the resource summary row
                    if (oldSummaryRow 
                        && oldSummaryRow.getAllocations().length == 0 
                        && !oldSummaryRow.hasAssignment() ) {
                        oldSummaryRow.remove();
                    }
                }
                else { 
                    taskNode = gridStore.getRowById([projectId, projectTaskId].join('~'));
                    node = Ext4.create('PRM.Model.Grid', {
                        id : data.gridId,
                        type : 'resource',
                        name : resourceName,
                        workCalendar : workCalendar,
                        hrsEstimated : estimatedWork,
                        allocations : '[]',
                        timeBills : '[]',
                        leaf : true
                    });
                    // not sure why console errors when the taskNode.insertChild is placed here.
                }
                
                node.set('name', resourceName);
                node.set('workCalendar', workCalendar);
                node.set('billingClassId', billingClassId);
                node.set('unitCost', unitCost);
                node.set('unitPrice', unitPrice);
                node.set('serviceItemId', serviceItemId);
                node.set('hrsEstimated', estimatedWork);
                
                // add summary row if not yet present
                if (!newSummaryRow) {
                    newSummaryRow = {
                        id : newSummaryId,
                        type: 'resource-summary',
                        name: resourceName,
                        //role: role,
                        workCalendar: workCalendar,
                        allocations: '[]',
                        timeBills: '[]',
                        leaf: true,
                        expanded: true
                    };
                    projectRow.insertChild(0, newSummaryRow);
                }
                
                if (taskNode) {
                    taskNode.insertChild(0, node);
                }
            }
            
            node.set('assignEndDate', data.assignEndDate);
            node.set('assignStartDate', data.assignStartDate);
            node.set('unitPct', data.unitPct);
        }
        
        PRM.App.Grid.resumeLayouts();
        PRM.App.Grid.view.refresh();
    },
    listeners : {
        boxready : function (window, width, height, eOpts ) {
            if (window.type == 'edit') {
                var windowId = '#' + window.id + '-', deleteBtn = window.down(windowId + 'panel-delete');
                deleteBtn.show();
                deleteBtn.setHandler(function (button, event) {
                    window.el.mask(PRM.Translation.getText('MASK.LOADING'));
                    
                    var assignmentStore = window.store,
                        record = window.record;
                    
                    var assignment  = Ext4.create('PRM.Model.Assignment', {
                        id : assignmentStore.clientId++,
                        clientId : assignmentStore.clientId++,
                        assignmentId : record.getAssignmentId(),
                        resourceId : record.getResourceId(),
                        projectId : record.getProjectId(),
                        projectTaskId : record.getTaskId(),
                        isDelete : true
                    });
                    assignment.setDirty();
                    assignmentStore.add(assignment);
                    
                    window.store.sync({
                        success : function(batch) {
                            var response = batch.proxy.reader.rawData;
                            window.record.remove();
                            PRM.App.Grid.getView().refresh();
                            window.hide(null, window.resetFormFields);
                            window.el.unmask();
                            alert(PRM.Translation.getText(response.message));
                        },
                        failure : function (batch) {
                            window.el.unmask();
                            var response = batch.proxy.reader.rawData;
                            alert(PRM.Translation.getText(response.message));
                        }
                    });
                });
            }
        },
        beforeShow : function (window) {
            if (window.type == 'edit') {
                if (!window.record) {
                    return false;
                }
                
                var windowId    = '#' + window.id + '-',
                    record      = window.record,
                    data        = record.data,
                    resourceFld = window.down(windowId + 'resource'),
                    resourceSch = window.down(windowId + 'search-resource-btn'),
                    projectFld  = window.down(windowId + 'job'),
                    taskFld     = window.down(windowId + 'project-task'),
                    fieldValues = {
//                        'resource'        : record.getResourceId(),
                        'resource-hidden' : record.getResourceId(),
//                        'job'             : record.getProjectId(),
//                        'project-task'    : record.getTaskId(),
                        'unit-percent'    : Number(data.unitPct.replace('%','')),
                        'billing-class'   : Number(data.billingClassId) || null,
                        'unit-cost'       : Number(data.unitCost),
                        'unit-price'      : Number(data.unitPrice),
                        'estimated-work'  : Number(data.hrsEstimated),
                        'actual-work'     : PRM.App.Grid.getTotalHrsWorked(JSON.parse(data.timeBills)),
                        'service-item'    : Number(data.serviceItemId) || null,
                        'start-date'      : data.assignStartDate,
                        'end-date'        : data.assignEndDate
                    };
                
                // update resource field first since its onchange will update unit cost & billing class
                resourceFld.setValue(record.getResourceId(), record.get('name'));
                
                for (_field in fieldValues) {
                    var field = window.down(windowId + _field);
                    field.suspendEvents();
                    field.setValue(fieldValues[_field]);
                    field.resumeEvents();
                }
                
                projectFld.setValue(record.getProjectId(), record.get('projectName'));
                taskFld.setValue(record.getTaskId(), record.get('taskName'));
                
                window.recordId = record.getAssignmentId();
                /*
                 * set readonly / disabled / other constraints
                 */
                var deleteBtn     = window.down(windowId + 'panel-delete'),
                    startDate     = window.down(windowId + 'start-date'),
                    estimatedWork = window.down(windowId + 'estimated-work'),
                    hasActualWork = window.record.hasActualWork(),
                    isASAP        = window.record.parentNode.data.constraintType == 'ASAP';
                
                deleteBtn.setDisabled(hasActualWork);
                startDate.setReadOnly(isASAP || hasActualWork);
                estimatedWork.setMinValue(fieldValues['actual-work']);
                
                resourceFld.setReadOnly(hasActualWork);
                projectFld.setReadOnly(true);
                taskFld.setReadOnly(true);
                
                /*
                 * set tooltips
                 */
                if (hasActualWork) {
                    deleteBtn.addCls('prm-tooltip-cannot-delete-with-worked-hours');
                    resourceFld.addCls('prm-tooltip-cannot-reassign-with-worked-hours');
                    startDate.addCls('prm-tooltip-cannot-modify-start-with-worked-hours');
                    resourceFld.setWidth(376);
                    resourceSch.hide();
                } else {
                    deleteBtn.removeCls('prm-tooltip-cannot-delete-with-worked-hours');
                    resourceFld.removeCls('prm-tooltip-cannot-reassign-with-worked-hours');
                    startDate.removeCls('prm-tooltip-cannot-modify-start-with-worked-hours');
                    resourceFld.setWidth(355);
                    resourceSch.show();
                }
            }
        }
    },
    autoComputeEstimatedWork : function() {
        if (!this.record) return;
        
        var startDate        = this.down('#' + this.id + '-start-date').getValue(),
            endDate          = this.down('#' + this.id + '-end-date').getValue(),
            unitPercent      = this.down('#' + this.id + '-unit-percent').getValue(),
            estimatedWorkTxt = this.down('#' + this.id + '-estimated-work'),
            workCalendar     = JSON.parse(this.record.data.workCalendar),
            timeBills        = JSON.parse(this.record.data.timeBills),
            actualWork       = PRM.Util.WorkCalendar.getActualWorkDetails(workCalendar, timeBills),
            plannedStart     = actualWork.actualHours ? actualWork.nextWorkDay : new Date(startDate),
            plannedEnd       = new Date(endDate),
            plannedWorkDays  = plannedStart.getTime() <= plannedEnd.getTime() ? PRM.Util.WorkCalendar.getWorkDays(workCalendar, plannedStart, plannedEnd) : 0;
        estimatedWorkTxt.setValue((plannedWorkDays * (unitPercent / 100) * workCalendar.hoursPerDay) + actualWork.actualHours);
    },
    autoComputeEndDate : function() {
        /*
         * auto-compute end date based from work calendar
         * TODO: consider actual work
         */
//        var startDate        = this.down('#' + this.id + '-start-date').getValue(),
//            endDateFld       = this.down('#' + this.id + '-end-date'),
//            unitPercent      = this.down('#' + this.id + '-unit-percent').getValue(),
//            estimatedWork    = this.down('#' + this.id + '-estimated-work').getValue(),
//            workCalendar     = JSON.parse(this.record.data.workCalendar),
//            requiredWorkDays = Math.ceil(estimatedWork / workCalendar.hoursPerDay);
//        console.log('requiredWorkDays: ' + requiredWorkDays);
//        endDateFld.setValue();
    },
    autoComputeUnitPrice : function(type, value) {
        if (!this.record) return;
        
        var window = this,
            assignmentStore = window.store,
            record = window.record;
        
        var assignment  = Ext4.create('PRM.Model.Assignment', {
            id : assignmentStore.clientId++,
            clientId : assignmentStore.clientId++,
            assignmentId : record.getAssignmentId(),
            projectId : record.getProjectId(),
            projectTaskId : record.getTaskId(),
            prevResourceId : record.getResourceId(),
            isLookup: true,
            lookupType: type
        });
        
        if (type == 'resource') {
            assignment.data.resourceId = value;
            assignment.data.unitCost = window.down('#' + window.id + '-unit-cost').getValue();
        }
        else if (type == 'billingclass' || type == 'serviceitem') {
            assignment.data.billingClassId = window.down('#' + window.id + '-billing-class').getValue();
            assignment.data.serviceItemId = window.down('#' + window.id + '-service-item').getValue();
        }

        assignment.setDirty();
        assignmentStore.add(assignment);
                 
        assignmentStore.sync({
            success : function(batch) {
                var response = batch.proxy.reader.rawData;
                window.down('#' + window.id + '-unit-price').setValue(response.unitPrice);
            },
            failure : function (batch) {
                var response = batch.proxy.reader.rawData;
                if (!response.success) {
                    alert(response.message);
                    assignmentStore.rejectChanges();
                    window.down('#' + window.id + '-resource').setValue(record.getResourceId());
                }
            }
        });
    },
    componentIdList : [
        'resource', 'job', 'project-task', 'start-date', 'end-date', 'unit-percent', 'billing-class', 'unit-cost', 'unit-price', 'estimated-work', 'service-item'
    ],
    setItems : function (formPanel) {
        var window = this;
            
        Ext4.apply(formPanel, {
            defaults : {
                allowBlank : false,
                padding : '0 0 10 0'
            },
            items : [
                {
                    xtype : 'prm-combobox-dynamic',
                    id : window.id + '-project-task',
                    fieldLabel : PRM.Translation.getText('FIELD.PROJECT_TASK'),
                    store : PRM.App.Stores.projectTaskForm,
                    searchWindow : 'taTaskData'
                },
                {
                    xtype : 'prm-combobox-dynamic',
                    id : window.id + '-job',
                    fieldLabel : PRM.Translation.getText('FIELD.CUSTOMER_PROJECT'),
                    store : PRM.App.Stores.projectForm,
                    searchWindow : 'taProjectData'
                },
                {
                    xtype : 'panel',
                    layout : 'hbox',
                    border : false,
                    items : [
                        {
                            xtype: 'prm-combobox-dynamic',
                            id: window.id + '-resource',
                            fieldLabel : PRM.Translation.getText('FIELD.RESOURCE'),
                            store : PRM.App.Stores.resourceForm,
                            searchWindow : 'taResourceData',
                            onCmbChange : function(me, newVal, oldVal) {
                                if (!newVal) return false; // handle reset.
                                
                                var idPrefix        = '#' + window.id + '-',
                                    record          = me.store.getById(newVal) || me.up().selectedRecords[0],
                                    laborCost       = record.get('laborCost'),
                                    billingClass    = record.get('billingClass'),
                                    laborCostFld    = window.down(idPrefix+'unit-cost'),
                                    billingClassFld = window.down(idPrefix + 'billing-class');
                                    
                                if (laborCost) {
                                    laborCostFld.setValue(laborCost);
                                } else {
                                    laborCostFld.setValue(0);
                                }
                                
                                if (billingClass) {
                                    billingClassFld.setValue(billingClass);
                                } else {
                                    billingClassFld.reset();
                                }
        
                                window.autoComputeUnitPrice('resource', newVal);
                            },
                            width : 355
                        },
                        {
                            xtype : 'prm-button-icon',
                            id: window.id + '-search-resource-btn',
                            iconCls : 'prm-icon-search',
                            margin : '22 0 0 5',
                            tooltip : PRM.Translation.getText('BUTTON.SEARCH'),
                            handler : function(button, event) {
                                PRM.App.Forms.assignmentSearch.triggerFormId = window.id;
                                PRM.App.Forms.assignmentSearch.show();
                            }
                        }
                    ]
                },
                {
                    xtype : 'textfield',
                    id : window.id + '-resource-hidden',
                    allowBlank : true,
                    hidden : true
                },
                {
                    xtype : 'prm-date',
                    id : window.id + '-start-date',
                    fieldLabel : PRM.Translation.getText('FIELD.START_DATE'),
                    allowBlank : true,
                    listeners : {
                        change : function(startDateFld, newValue, oldValue) {
                            var endDateFld = window.down('#' + window.id + '-end-date'),
                                endDate    = endDateFld.getValue();
                            
                            // check if later than end date
                            if (newValue.getTime() > endDate.getTime()) {
                                alert(PRM.Translation.getText('ALERT.INVALID_START_DATE_GREATER_THAN_END_DATE'));
                                startDateFld.setValue(oldValue);
                                return;
                            }
                            
                            // check if non-working day
                            if (!PRM.Util.WorkCalendar.isWorkDay(JSON.parse(window.record.data.workCalendar), newValue)) {
                                alert(PRM.Translation.getText('ALERT.INVALID_DATE_NON_WORKING'));
                                startDateFld.setValue(oldValue);
                                return;
                            }
                            
                            window.autoComputeEstimatedWork();
                        }
                    },
                    hidden : window.type == 'new'
                },
                {
                    xtype : 'prm-date',
                    id : window.id + '-end-date',
                    fieldLabel : PRM.Translation.getText('FIELD.END_DATE'),
                    allowBlank : true,
                    listeners : {
                        change : function(endDateFld, newValue, oldValue) {
                            var startDateFld = window.down('#' + window.id + '-start-date'),
                                startDate    = startDateFld.getValue();
                            
                            // check if earlier than start date
                            if (newValue.getTime() < startDate.getTime()) {
                                alert(PRM.Translation.getText('ALERT.INVALID_END_DATE_LESS_THAN_START_DATE'));
                                endDateFld.setValue(oldValue);
                                return;
                            }
                            
                            // check if non-working day
                            if (!PRM.Util.WorkCalendar.isWorkDay(JSON.parse(window.record.data.workCalendar), newValue)) {
                                alert(PRM.Translation.getText('ALERT.INVALID_DATE_NON_WORKING'));
                                endDateFld.setValue(oldValue);
                                return;
                            }
                            
                            // check if less than min end date (last actual work)
                            if (window.record.hasActualWork()) {
                                var minEndDate = window.record.getLastActualWork();
                                if (newValue.getTime() < minEndDate.getTime()) {
                                    alert(PRM.Translation.getText('ALERT.INVALID_END_DATE_WITH_ACTUAL_WORK'));
                                    endDateFld.setValue(minEndDate);
                                    return;
                                }
                            }
                            window.autoComputeEstimatedWork();
                        }
                    },
                    hidden : window.type == 'new'
                },
                {
                    xtype : 'prm-number',
                    id : window.id + '-unit-percent',
                    fieldLabel : PRM.Translation.getText('FIELD.UNIT_PERCENT'),
                    minValue : 5,
                    maxValue : 500
                },
                {
                    xtype : 'prm-combobox',
                    id : window.id + '-billing-class',
                    fieldLabel : PRM.Translation.getText('FIELD.BILLING_CLASS'),
                    allowBlank : true,
                    forceSelection : false,
                    store : PRM.App.Stores.billingClassForm,
                    listeners : {
                        change : function(me, newVal, oldVal) {
                            window.autoComputeUnitPrice('billingclass', newVal);
                        }
                    }
                },
                {
                    xtype : 'prm-number',
                    id : window.id + '-unit-cost',
                    fieldLabel : PRM.Translation.getText('FIELD.UNIT_COST'),
                    minValue : 0,
                    maxValue : 99999999999.99
                },
                {
                    xtype : 'prm-number',
                    id : window.id + '-unit-price',
                    allowBlank : true,
                    fieldLabel : PRM.Translation.getText('FIELD.UNIT_PRICE'),
                    minValue : 0,
                    hidden : window.type == 'new'
                },
                {
                    xtype : 'prm-number',
                    id : window.id + '-estimated-work',
                    fieldLabel : PRM.Translation.getText('FIELD.ESTIMATED_WORK'),
                    minValue : 0,
                    maxValue : 2080,
                    listeners : {
                        blur : function(field, event) {
                            window.autoComputeEndDate();
                        }
                    }
                },
                {
                    xtype : 'prm-display-text',
                    id : window.id + '-actual-work',
                    fieldLabel : PRM.Translation.getText('FIELD.ACTUAL_WORK'),
                    allowBlank : true,
                    hidden : window.type == 'new'
                },
                {
                    xtype : 'prm-combobox',
                    id : window.id + '-service-item',
                    fieldLabel : PRM.Translation.getText('FIELD.SERVICE_ITEM'),
                    allowBlank : true,
                    forceSelection : false,
                    store : PRM.App.Stores.serviceItemForm,
                    listeners : {
                        change : function(me, newVal, oldVal) {
                            window.autoComputeUnitPrice('serviceitem', newVal);
                        }
                    }
                }
            ]
        });
    }
});