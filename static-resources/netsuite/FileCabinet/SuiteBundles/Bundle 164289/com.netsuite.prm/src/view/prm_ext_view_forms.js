/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

PRM.App.Forms = {
    /*
     * NS Forms
     */
    resourceSearchNS : Ext4.create('PRM.Cmp.ResourceSearchNSForm'),
    allocationNS : Ext4.create('PRM.Cmp.AllocationNSForm'),
    filterNS : Ext4.create('PRM.Cmp.FilterNSForm'),
    taskAssignment : Ext4.create('PRM.Cmp.TaskAssignmentForm', {
        updateAssignmentNodes : function(responseData) {
            console.log('responseData', responseData);

            var projectId = responseData.projectId;
            var projectTaskId = responseData.projectTaskId;
            var resourceId = responseData.resourceId;

            PRM.App.Grid.suspendLayouts();

            var nodeIndex = null;
            if (responseData.gridId || responseData.isDelete) {
                var assignmentNode = PRM.App.Grid.store.getRowById(responseData.gridId);
                nodeIndex = assignmentNode.parentNode.indexOf(assignmentNode);
                assignmentNode.parentNode.removeChild(assignmentNode);
            }
            
            responseData.data.forEach(function (assignmentData) {
                var assignmentNode = PRM.App.Grid.store.getRowById(assignmentData.gridId);
                if (!assignmentNode) {
                    PRM.App.Stores.gridStore.addAssignment(assignmentData, projectId, projectTaskId, nodeIndex);
                    var summaryNode = PRM.App.Stores.gridStore.getSummaryNode(projectId, resourceId);
                    if (!summaryNode) {
                        PRM.App.Stores.gridStore.addSummary(assignmentData, projectId, resourceId);
                    }
                }
            });
            
            PRM.App.Grid.resumeLayouts();
            PRM.App.Grid.view.refresh();
        },
        updateRollups : function(responseData, projectNode, taskNode) {
            projectNode.set({
                timeBills : JSON.stringify(responseData.updates.project.timeBills),
                hrsEstimated : responseData.updates.project.hrsEstimated,
                pctComplete : responseData.updates.project.pctComplete
            });

            taskNode.set(responseData.updates.task);
        },
        listeners : {
            beforeSave : function () {
                PRM.Util.PerfLogs.start('SAVE_OR_DELETE_ASSIGNMENT');
            },
            afterSave : function(responseData) {
                var projectId = responseData.projectId;
                var projectTaskId = responseData.projectTaskId;
                var projectNode = PRM.App.Stores.gridStore.getRowById(projectId);
                PRM.App.Grid.addNodeMask(projectNode);
                if (projectNode) {
                    PRM.App.Stores.gridStore.load({
                        node : projectNode,
                        callback : function() {
                            var taskNode = PRM.App.Stores.gridStore.getRowById(projectId + '~' + projectTaskId);
                            if (taskNode) {
                                taskNode.expand();
                            }
                            projectNode.set({
                                timeBills : responseData.updates.project.timeBills,
                                hrsEstimated : responseData.updates.project.hrsEstimated,
                                pctComplete : responseData.updates.project.pctComplete
                            });
                            PRM.App.Grid.removeNodeMask(projectNode);
                            PRM.Util.PerfLogs.stop('SAVE_OR_DELETE_ASSIGNMENT');
                        }
                    });
                } else {
                    PRM.Util.PerfLogs.stop('SAVE_OR_DELETE_ASSIGNMENT');
                }
                
                //keeping this piece of code as a reference
                /*if (projectNode) {
                    
                    var isProjectNodeLoaded = projectNode.isLoaded();
                    
                    projectNode.expand(false, function() {
                        var taskNode = PRM.App.Stores.gridStore.getRowById([ projectId, projectTaskId ].join('~'));
                        if (taskNode) {
                            taskNode.expand(false, function() {
                                if (isProjectNodeLoaded) {
                                    this.updateAssignmentNodes(responseData);
                                    this.updateRollups(responseData, projectNode, taskNode);
                                }
                            }, this);
                        }
                    }, this);
                }*/
            }
        }
    }),
    /*
     * ExtJS Forms
     */
    settings : Ext4.create('PRM.Cmp.SettingsForm', {
        id : 'prm-form-settings',
        title : PRM.Translation.getText('WINDOW.SETTINGS')
    }),
    newAllocation : Ext4.create('PRM.Cmp.AllocationForm', {
        id : 'prm-form-new-allocation',
        title : PRM.Translation.getText('WINDOW.NEW_ALLOCATION'),
        type : 'new',
        listeners : {
            boxready : function (window, event) {
//                window.down('#' + window.id + '-resource').searchWindow = 'newAllocResourceData';
            }
        }
    }),
    editAllocation : Ext4.create('PRM.Cmp.AllocationForm', {
        id : 'prm-form-edit-allocation',
        title : PRM.Translation.getText('WINDOW.EDIT_ALLOCATION'),
        type : 'edit',
        isDeletable : true
    }),
    newAssignment : Ext4.create('PRM.Cmp.AssignmentForm', {
        id : 'prm-form-new-assignment',
        title : PRM.Translation.getText('WINDOW.NEW_ASSIGNMENT'),
        type : 'new'
    }),
    editAssignment : Ext4.create('PRM.Cmp.AssignmentForm', {
        id : 'prm-form-edit-assignment',
        title : PRM.Translation.getText('WINDOW.EDIT_ASSIGNMENT'),
        type : 'edit'
    }),
    filter : Ext4.create('PRM.Cmp.FilterForm', {
        id : 'prm-form-filter',
        title : ''
    }),
    allocationSummary : Ext4.create('PRM.Cmp.AllocationSummary'),
    assignmentSearch : Ext4.create('PRM.Cmp.AssignmentSearchForm', {
        id : 'prm-form-assignment-search-resource'
    }),
    assignmentResult : Ext4.create('PRM.Cmp.AssignmentResultForm', {
        id : 'prm-form-assignment-search-results'
    }),
    /*
     * LDC Forms for View Form view<FieldType>Data
     */
    viewBillingClassData : Ext4.create('PRM.Cmp.LargeDataForm', {
        id : 'prm-form-view-billing-class',
        title : PRM.Translation.getText('TITLE.SELECT_BILLING_CLASS'),
        rangeStore : PRM.App.Stores.billingClassFilterDataRange,
        selectorStore : PRM.App.Stores.billingClassFilterSelectedStore
    }),
    viewResourceData : Ext4.create('PRM.Cmp.LargeDataForm', {
        id : 'prm-form-view-resource',
        title : PRM.Translation.getText('TITLE.SELECT_RESOURCES'),
        rangeStore : PRM.App.Stores.resourceFilterDataRange,
        selectorStore : PRM.App.Stores.resourceFilterSelectedStore
    }),
    viewCustomerData : Ext4.create('PRM.Cmp.LargeDataForm', {
        id : 'prm-form-view-customer',
        title : PRM.Translation.getText('TITLE.SELECT_CUSTOMERS'),
        rangeStore : PRM.App.Stores.customerFilterDataRange,
        selectorStore : PRM.App.Stores.customerFilterSelectedStore
    }),
    viewProjectData : Ext4.create('PRM.Cmp.LargeDataForm', {
        id : 'prm-form-view-project',
        title : PRM.Translation.getText('TITLE.SELECT_PROJECTS'),
        rangeStore : PRM.App.Stores.projectFilterDataRange,
        selectorStore : PRM.App.Stores.projectFilterSelectedStore
    }),
    viewTaskData : Ext4.create('PRM.Cmp.LargeDataForm', {
        id : 'prm-form-view-task',
        title : PRM.Translation.getText('TITLE.SELECT_TASKS'),
        rangeStore : PRM.App.Stores.taskFilterDataRange,
        selectorStore : PRM.App.Stores.taskFilterSelectedStore
    }),
    /*
     * LDC Forms for Resource Allocations Form ra<FieldType>Data
     */
    raResourceData : Ext4.create('PRM.Cmp.LargeDataForm', {
        id : 'prm-form-ra-resource',
        title : PRM.Translation.getText('TITLE.SELECT_RESOURCES'),
        rangeStore : PRM.App.Stores.resourceDataRange,
        selectorStore : PRM.App.Stores.resourceSelectedStore
    }),
    raProjectData : Ext4.create('PRM.Cmp.LargeDataForm', {
        id : 'prm-form-ra-project',
        title : PRM.Translation.getText('TITLE.SELECT_PROJECT'),
        rangeStore : PRM.App.Stores.projectDataRange,
        selectorStore : PRM.App.Stores.projectSelectedStore
    }),
    raApproverData : Ext4.create('PRM.Cmp.LargeDataForm', {
        id : 'prm-form-ra-approver',
        title : PRM.Translation.getText('TITLE.SELECT_APPROVER'),
        rangeStore : PRM.App.Stores.approverDataRange,
        selectorStore : PRM.App.Stores.approverSelectedStore
    }),
    /*
     * LDC Forms for Task Assignment Form ta<FieldType>Data
     */
    taTaskData : Ext4.create('PRM.Cmp.LargeDataForm', {
        id : 'prm-form-ta-task',
        title : PRM.Translation.getText('TITLE.SELECT_TASK'),
        rangeStore : PRM.App.Stores.taskDataRange,
        selectorStore : PRM.App.Stores.taskSelectedStore
    }),
    taProjectData : Ext4.create('PRM.Cmp.LargeDataForm', {
        id : 'prm-form-ta-project',
        title : PRM.Translation.getText('TITLE.SELECT_PROJECT'),
        rangeStore : PRM.App.Stores.projectDataRange,
        selectorStore : PRM.App.Stores.projectSelectedStore
    }),
    taResourceData : Ext4.create('PRM.Cmp.LargeDataForm', {
        id : 'prm-form-ta-resource',
        title : PRM.Translation.getText('TITLE.SELECT_RESOURCE'),
        rangeStore : PRM.App.Stores.resourceDataRange,
        selectorStore : PRM.App.Stores.resourceSelectedStore
    }),
    resourceSearch : Ext4.create('PRM.Cmp.ResourceSearchForm', {
        id : 'prm-form-allocation-search-resource'
    }),
    resourceResult : Ext4.create('PRM.Cmp.ResourceResultForm', {
        id : 'prm-form-allocation-search-results'
    }),
};