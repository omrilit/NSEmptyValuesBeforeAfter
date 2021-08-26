/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
 
Ext4.define('PRM.View.Grid', {
    extend: 'Ext4.tree.Panel',
    id: 'prm-grid',
    autoLoad : false,
    store: PRM.App.Stores.gridStore,
    title: '',
    renderTo: Ext4.get('main_form'),
    rootVisible: false,
    columnLines: true,
    rowLines: true,
    plugins: [ PRM.Cmp.Editor.Plugin
               /*, {
                ptype: 'bufferedrenderer',
                trailingBufferZone: 20,
                leadingBufferZone: 20,
                variableRowHeight : true
               }*/
    ],
    selModel: { selType: 'cellmodel' },
    hidden : true,
    loadMask : false,
    viewConfig: {
        markDirty : false,
        getRowClass: function (record, index, rowParams, store){
            var cls               = [],
                nextRecord        = store.getAt(index + 1), // set divider line after last resource row
                isResourceSummary = (record.isSummary()),
                isNextRecTask     = (nextRecord && nextRecord.isTask()),
                isLastResourceRow = isResourceSummary && isNextRecTask;
            cls.push('prm-type-' + record.get('type'));
            if (isLastResourceRow){
                cls.push('prm-last-resource');
            }
            if (record.data.isHidden) {
                cls.push('prm-display-none');
            }
            return cls.join(' ');
        }
    },
    initComponent: function(args){
        
        var menuId = 'prm-grid-menu-',
            menuProject = menuId + 'project',
            menuSummary = menuId + 'summary',
            menuTask = menuId + 'task',
            menuTaskResource = menuId + 'resource',
            menus = [
                Ext4.create('PRM.Cmp.Menu', {
                    xtype : 'prm-grid-menu',
                    id : menuProject,
                    renderTo : Ext4.getBody(),
                    items : [
                        {
                            id : menuProject + '-1',
                            text : PRM.Translation.getText('MENU.ADD_RESOURCE'),
                            handler : function(item, event) {
                                PRM.App.Forms.allocationNS.openForm(null, '&prm_project_id=' + item.parentMenu.params.record.get('id'));
                            }
                        },
                        {
                            id : menuProject + '-2',
                            text : PRM.Translation.getText('MENU.REMOVE_ALLOCATIONS'),
                            handler : function(item, event) {
                                
                                if (!confirm(PRM.Translation.getText('CONFIRM.DELETE_ALLOCATION'))) {
                                    return;
                                }
                                
                                PRM.App.Grid.addMask();
                                
                                var params = item.up().params,
                                    projectNode = params.record,
                                    childNodes = projectNode.childNodes,
                                    allocationStore = PRM.App.Stores.allocation,
                                    summaryToRemove = [];
                                    
                                for (var i = 0; i < childNodes.length; i++) {
                                    var childNode = childNodes[i];
                                    
                                    if (!childNode.isSummary()) {
                                        continue;
                                    }
                                    
                                    if (!childNode.hasAssignment()) {
                                        summaryToRemove.push(childNode);
                                    }

                                    item.parentMenu.removeAllocations(childNode, allocationStore);
                                }
                                
                                allocationStore.sync({
                                    success : function(batch) {
                                        for (var i = 0; i < summaryToRemove.length; i++) {
                                            summaryToRemove[i].remove();
                                        }
                                        
                                        for (var i = 0; i < childNodes.length; i++) {
                                            childNodes[i].set('allocations', '[]');
                                        }
                                        
                                        PRM.App.Grid.getView().refresh();
                                        PRM.App.Grid.removeMask();
                                        alert(PRM.Translation.getText('ALERT.DELETE_ALLOCATIONS_SUCCESS'));
                                    },
                                    failure : function (batch) {
                                        PRM.App.Grid.removeMask();
                                        alert(batch.proxy.getReader().jsonData.message);
                                    }
                                });
                            }
                        },
                        {
                            id : menuProject + '-3',
                            text : PRM.Translation.getText('MENU.REMOVE_PROJECT'),
                            handler : function(item, event) {
                                
                                if (!confirm(PRM.Translation.getText('CONFIRM.DELETE_PROJECT'))) {
                                    return;
                                }
                                
                                PRM.App.Grid.addMask();
                                
                                var assignmentStore = PRM.App.Stores.assignment,
                                    allocationStore = PRM.App.Stores.allocation,
                                    params = item.up().params,
                                    record = params.record,
                                    hasAllocations = record.hasAllocations(),
                                    hasAssignments = record.hasAssignments(),
                                    children = record.childNodes;

                                for (var i = 0; i < children.length; i++) {
                                    var childNode = children[i];
                                    
                                    if (hasAssignments && childNode.isTask()) {
                                        var assignments = childNode.childNodes;
                                        for (var j = 0; j < assignments.length; j++) {
                                            var assignment = Ext4.create('PRM.Model.Assignment', {
                                                    id            : assignmentStore.clientId++,
                                                    clientId      : assignmentStore.clientId++,
                                                    assignmentId  : assignments[j].getAssignmentId(),
                                                    resourceId    : assignments[j].getResourceId(),
                                                    projectId     : assignments[j].getProjectId(),
                                                    projectTaskId : assignments[j].getTaskId(),
                                                    isDelete      : true
                                                });
                                            assignment.setDirty();
                                            assignmentStore.add(assignment);
                                        }
                                    }
                                    
                                    if (hasAllocations && childNode.isSummary()) {
                                        item.parentMenu.removeAllocations(childNode, allocationStore);
                                    }
                                }
                                
                                if (hasAssignments && hasAllocations) {
                                	allocationStore.sync({
                                        callback : function (batch) {
                                        	if (batch.proxy.reader.rawData.success) {
                                        		assignmentStore.sync({
                                        			callback : function (batch) {
                                        				var response = batch.proxy.reader.rawData;
                                        				item.parentMenu.removeProjectCallback(response.success, record);
                                        			}
                                        		});
                                        	} else {
                                        		item.parentMenu.removeProjectCallback(false);
                                        	}
                                        }
                                    });
                                } else if (hasAssignments) {
                                    assignmentStore.sync({
                                        callback : function (batch) {
                                            var response = batch.proxy.reader.rawData;
                                            item.parentMenu.removeProjectCallback(response.success, record);
                                        }
                                    });
                                } else if (hasAllocations) {
                                    allocationStore.sync({
                                        callback : function (batch) {
                                            var response = batch.proxy.reader.rawData;
                                            item.parentMenu.removeProjectCallback(response.success, record);
                                        }
                                    });
                                } else {
                                	PRM.App.Grid.store.getRootNode().removeChild(record);
                                	PRM.App.Grid.removeMask();
                                }
                                
                            }
                        }
                    ],
                    removeProjectCallback : function (completeSuccess, record) {
                        if (completeSuccess) {
                        	PRM.App.Stores.assignableProject.reload();
                            alert(PRM.Translation.getText('ALERT.DELETE_PROJECT_SUCCESS'));
                            PRM.App.Stores.pageList.loadWithFilters();
                        } else {
                            alert(PRM.Translation.getText('ALERT.DELETE_PROJECT_FAIL'));
                        }
                        PRM.App.Grid.removeMask();
                    },
                    removeAllocations : function (summaryNode, allocationStore) {
                        var allocations = summaryNode.getAllocations();
                        for (var j = 0; j < allocations.length; j++) {
                            var allocRecord = allocations[j],
                                allocModel = Ext4.create('PRM.Model.Allocation', {
                                    id           : allocRecord.id,
                                    clientId     : allocationStore.clientId++,
                                    allocationId : allocRecord.id,
                                    resourceId   : allocRecord.resourceId,
                                    projectId    : allocRecord.projectId,
                                    isDelete     : true
                                });
                            allocModel.setDirty();
                            allocationStore.add(allocModel);
                        }
                    },
                    initializeMenuItems : function (callBackFn) {
                    	var params = this.params,
	                        record = params.record, 
	                    	removeAllocationItem = this.items.getAt(1), // Remove Resource Allocations
	                    	removeProjectItem = this.items.getAt(2); // Remove Project
                    	
                    	if (!record.get('displayAllResources') && record.hasAssignments()) {
                    		removeAllocationItem.disable();
                    		removeAllocationItem.addCls('prm-tooltip-read-only-has-assignments');
                    	} else if (!record.hasAllocations()) {
                    		removeAllocationItem.disable();
                    		removeAllocationItem.addCls('prm-tooltip-no-records-to-delete');
                    	}
                    	
                    	if (record.hasActualWork()) {
                    		removeProjectItem.disable();
                    		removeProjectItem.addCls('prm-tooltip-read-only-worked-hours');
                    	}
                    	
                    	/*if (!record.hasAssignments() && !record.hasAllocations()) {
                    		removeProjectItem.disable();
                    		removeProjectItem.addCls('prm-tooltip-no-records-to-delete');
                    	}*/
                    	
                    	return this;
                    },
                    listeners : {
                        beforeshow : function (menu, opts) {
                            var params = menu.params,
                                record = params.record;
                            if (record.isExpanded()) {
                            	menu.initializeMenuItems();
                            } else {
                            	record.expand(false, function () {
                            		menu.initializeMenuItems().show();
                            	});
                            	return false;
                            }
                        }
                    }
                }),
                Ext4.create('PRM.Cmp.Menu', {
                    xtype : 'prm-grid-menu',
                    id : menuSummary,
                    items : [
                        {
                            id : menuSummary + '-1',
                            text : PRM.Translation.getText('MENU.ASSIGN_RESOURCE_TO_TASK'),
                            handler : function (item, event) {
                                var record = item.up().params.record.data;
                                PRM.App.Forms.taskAssignment.open(false, {
                                    project :  record.id.split('~')[0],
                                    resource :  record.id.split('~')[3],
                                });
                            }
                        },
                         {
                             id : menuSummary + '-2',
                             text : PRM.Translation.getText('MENU.EDIT_RESOURCE'),
                             handler : function (item, event) {
                                 PRM.App.Grid.rowNameEditor = PRM.Cmp.Editor.ResourceSummary;
                                 PRM.Cmp.Editor.ResourceSummary.resourceNode = item.parentMenu.params.record;
                                 delete PRM.Cmp.Editor.ResourceSummary.projectParams;
                                 
                                 PRM.Cmp.Editor.Plugin.init(PRM.App.Grid.view.lockedView.up());
                                 PRM.Cmp.Editor.Plugin.startEdit(item.parentMenu.params.record, PRM.App.Grid.view.lockedView.up().ownerCt.columnManager.getHeaderAtIndex(1));
                             }
                         },
                         {
                             id : menuSummary + '-3',
                             text : PRM.Translation.getText('MENU.REMOVE_RESOURCE_FROM_PROJECT'),
                             handler : function (item, event) {
                                 var resourceSummaryNode = item.up().params.record;
                                 var allocations = resourceSummaryNode.getAllocations();
                                 if (allocations && allocations.length) {
                                     PRM.App.Grid.addMask();
                                     for (var j = 0; j < allocations.length; j++) {
                                         var allocRecord = allocations[j],
                                             allocModel = Ext4.create('PRM.Model.Allocation', {
                                                 id           : allocRecord.id,
                                                 clientId     : PRM.App.Stores.allocation.clientId++,
                                                 allocationId : allocRecord.id,
                                                 resourceId   : allocRecord.resourceId,
                                                 projectId    : allocRecord.projectId,
                                                 isDelete     : true
                                             });
                                         allocModel.setDirty();
                                         PRM.App.Stores.allocation.add(allocModel);
                                     }
                                     PRM.App.Stores.allocation.sync({
                                         success : function(batch) {
                                             alert(PRM.Translation.getText('ALERT.DELETE_ALLOCATIONS_SUCCESS'));
                                             var responseData = batch.proxy.getReader().jsonData;
                                             var projectNode = PRM.App.Stores.gridStore.getRowById(responseData.data[0].projectId);
                                             projectNode.removeChild(resourceSummaryNode);
                                             var timeBillsString = responseData.updatedTimeBills && responseData.updatedTimeBills.length ? JSON.stringify(responseData.updatedTimeBills) : "[]";
                                             projectNode.set('timeBills', timeBillsString);
                                             PRM.App.Grid.removeMask();
                                             PRM.App.Grid.getView().refresh();
                                         },
                                         failure : function (batch) {
                                             PRM.App.Grid.removeMask();
                                             alert(batch.proxy.getReader().jsonData.message);
                                         }
                                     });
                                 }
                             }
                         }
                     ],
                     listeners : {
                         beforeshow : function (menu, opts) {
                             var resourceRecord = menu.params.record,
                                 projectRecord  = menu.params.record.parentNode,
                                 editRsrcMenu   = this.items.getAt(1),
                                 removeRsrcMenu = this.items.getAt(2);
                             
                             var tasks = projectRecord.childNodes.filter(function (e) { return e.get('type') == 'task'; });
                             if (Ext4.isEmpty(tasks)) {
                                 this.items.getAt(0).disable();
                             }
                             
                             if (!projectRecord.get('displayAllResources') && resourceRecord.get('withAssignments')) {
                                 editRsrcMenu.disable();
                                 removeRsrcMenu.disable();
                             }
                             
                             var allocs = JSON.parse(resourceRecord.get('allocations'));
                             if (!(allocs && allocs.length)) {
                                 editRsrcMenu.disable();
                                 removeRsrcMenu.disable();
                             }
                         }
                     }
                }),
                Ext4.create('PRM.Cmp.Menu', {
                    xtype : 'prm-grid-menu',
                    id : menuTask,
                    items : [
                        {
                            id : menuTask + '-1',
                            text : PRM.Translation.getText('MENU.ASSIGN_RESOURCE'),
                            handler : function (item, event) {
                                var record = item.up().params.record.data;
                                PRM.App.Forms.taskAssignment.open(false, {
                                    project :  record.id.split('~')[0],
                                    projectTask :  record.id.split('~')[1],
                                 });
                            }
                        },
                        {
                            id : menuTask + '-2',
                            text : PRM.Translation.getText('MENU.REASSIGN_RESOURCES'),
                            handler : function (item, event) {
                                // set parameters
                                var taskNode = item.parentMenu.params.record,
                                    projectId = taskNode.getProjectId();
                                
                                // load into combobox store the project tasks under the current project
                                PRM.Cmp.Editor.Task.taskParams = item.parentMenu.params;
                                PRM.Cmp.Editor.Task.store.load({ 
                                    params: { projectId: projectId },
                                    callback: function(records, operations, success){
                                        if (success){
                                            // enable editing
                                            PRM.App.Grid.rowNameEditor = PRM.Cmp.Editor.Task;

                                            // start edit mode for the project task row
                                            PRM.Cmp.Editor.Plugin.init(PRM.App.Grid.view.lockedView.up());
                                            PRM.Cmp.Editor.Plugin.startEdit(taskNode, PRM.App.Grid.view.lockedView.up().ownerCt.columnManager.getHeaderAtIndex(1));                                            
                                        }
                                        else {
                                            alert('Failed to retrieve project tasks'); // TODO Translate
                                        }
                                    }
                                });
                            }
                        }, 
                        {
                            id : menuTask + '-3',
                            text : PRM.Translation.getText('MENU.REMOVE_TASK'),
                            handler : function (item, event) {
                                var store = PRM.App.Stores.assignment,
                                    params = item.up().params,
                                    record = params.record,
                                    children = record.get('children');
                                
                                for (var i = 0; i < children.length; i++) {
                                    var assignmentNode = record.getChildAt(i),
                                        assignment  = Ext4.create('PRM.Model.Assignment', {
                                            id            : store.clientId++,
                                            clientId      : store.clientId++,
                                            assignmentId  : assignmentNode.getAssignmentId(),
                                            resourceId    : assignmentNode.getResourceId(),
                                            projectId     : assignmentNode.getProjectId(),
                                            projectTaskId : assignmentNode.getTaskId(),
                                            isDelete : true
                                        });
                                    assignment.setDirty();
                                    store.add(assignment);
                                }
                                
                                // remove from NS Record
                                store.sync({
                                    success : function(batch) {
                                        var operations = batch.operations,
                                            response = JSON.parse(operations[0].response.responseText); 
                                        
                                        alert(PRM.Translation.getText(response.message));

                                        record.remove();
                                        PRM.App.Stores.pageList.loadWithFilters();
                                    },
                                    failure : function (batch) {
                                        var operations = batch.operations,
                                            response = null;
                                        
                                        for (var i = 0; i < operations.length; i++) {
                                            response = batch.proxy.getReader().jsonData.message;
                                        }
                                        alert(PRM.Translation.getText(response));
                                    }
                                });
                            }
                        }
                    ],
                    listeners : {
                        beforeshow : function (menu, opts) {
                            var params = menu.params,
                                record = params.record,
                                reassignResourcesItem = menu.items.getAt(1),
                                removeTaskItem = menu.items.getAt(2);

                            if (record.hasActualWork()){
                                // task with work started cannot be removed
                                removeTaskItem.disable();
                                removeTaskItem.addCls('prm-tooltip-read-only-worked-hours');
                                
                                // resources with hours worked cannot be re-assigned to another task
                                reassignResourcesItem.disable();
                                reassignResourcesItem.addCls('prm-tooltip-read-only-worked-hours');
                            }
                        }
                    }
                }),
                Ext4.create('PRM.Cmp.Menu', {
                    xtype : 'prm-grid-menu',
                    id : menuTaskResource,
                    items : [
                        {
                            id : menuTaskResource + '-1',
                            text : PRM.Translation.getText('MENU.EDIT_TASK_ASSIGNMENT'),
                            handler: function (item, event) {
                                PRM.App.Forms.editAssignment.record = item.parentMenu.params.record;
                                var data = PRM.App.Forms.editAssignment.record.data;
                                PRM.App.Forms.taskAssignment.openAsEdit(JSON.stringify({
                                    id              : data.id,
                                    resourceName    : data.name,
                                    hrsWorked       : data.hrsWorked,
                                    assignStartDate : data.assignStartDate,
                                    assignEndDate   : data.assignEndDate,
                                    unitPct         : data.unitPct,
                                    billingClassId  : data.billingClassId,
                                    unitCost        : data.unitCost,
                                    unitPrice       : data.unitPrice,
                                    hrsEstimated    : data.hrsEstimated,
                                    hrsWorked       : data.hrsWorked,
                                    serviceItemId   : data.serviceItemId
                                }));
                            }
                        },
                        {
                            id : menuTaskResource + '-2',
                            text : PRM.Translation.getText('MENU.REMOVE_TASK_RESOURCE'),
                            handler: function(item, event){
                                // confirmation from user
                                if (!confirm(PRM.Translation.getText('CONFIRM.DELETE_ASSIGNMENT'))) {
                                    return;
                                }
                                
                                // setup mask
                                PRM.App.Grid.addMask();

                                // setup task assignment deletion
                                var assignmentStore = PRM.App.Stores.assignment,
                                    params = item.up().params,
                                    resourceNode = params.record,
                                    taskNode = resourceNode.parentNode,
                                    projectNode = taskNode.parentNode,
                                    assignment  = Ext4.create('PRM.Model.Assignment', {
                                        id            : assignmentStore.clientId++,
                                        clientId      : assignmentStore.clientId++,
                                        assignmentId  : resourceNode.getAssignmentId(),
                                        resourceId    : resourceNode.getResourceId(),
                                        projectId     : resourceNode.getProjectId(),
                                        projectTaskId : resourceNode.getTaskId(),
                                        isDelete      : true
                                    });
                                assignment.setDirty();
                                assignmentStore.add(assignment);

                                // apply to NS record
                                assignmentStore.sync({
                                    success : function (batch) {
                                        var updates = batch.proxy.reader.rawData.updates;
                                        
                                        // remove resource row from grid
                                        resourceNode.remove();
                                      
                                        // case when there are no more assignments left for the task
                                        if (taskNode.childNodes.length == 0){
                                            // remove task row
                                            taskNode.remove();
                                        }
                                        // case when there are remaining task assignments
                                        else {
                                            taskNode.set('hrsEstimated', updates.task.hrsEstimated);
                                            taskNode.set('pctComplete', updates.task.pctComplete);
                                        }

                                        // get allocations for the removed resource
                                        var resourceSummaryNode = null;
                                        for (var i = 0, ii = projectNode.childNodes.length; i < ii; i++){
                                            var child = projectNode.childNodes[i];
                                            if (child.isSummary() && child.get('name') == resourceNode.get('name')){
                                                resourceSummaryNode = child;
                                                break;
                                            }
                                        }
                                        var allocations = resourceSummaryNode ? resourceSummaryNode.getAllocations(): [],
                                            allocationCount = allocations.length;
                                        
                                        // get remaining hours for the removed resource
                                        var hrsEstimated = 0;
                                        var taskNodes = [];
                                        for (var i = 0, ii = projectNode.childNodes.length; i < ii; i++){
                                            var child = projectNode.childNodes[i];
                                            if (child.isTask()){
                                                taskNodes.push(child);
                                            }
                                        }
                                        for (var i = 0, ii = taskNodes.length; i < ii; i++){
                                            var curTaskNode = taskNodes[i];
                                            for (var j = 0, jj = curTaskNode.childNodes.length; j < jj; j++){
                                                var child = curTaskNode.childNodes[j];
                                                if (child.get('name') == resourceNode.get('name')){
                                                    hrsEstimated += parseFloat(child.get('hrsEstimated'));
                                                }
                                            }
                                        }
                                        
                                        if (updates.project.timeBills) {
                                            projectNode.set('timeBills', JSON.stringify(updates.project.timeBills));
                                            projectNode.set('hrsEstimated', JSON.stringify(updates.project.hrsEstimated));
                                            projectNode.set('pctComplete', JSON.stringify(updates.project.pctComplete));
                                        }
                                        
                                        // remove resource summary row if there are no more assignments and allocations left for the removed resource                                            
                                        if (allocationCount == 0 && hrsEstimated == 0){
                                            resourceSummaryNode.remove();
                                        }
                                        else {
                                            // refresh resource summary values
                                            PRM.App.Grid.getView().refresh();
                                        }

                                        PRM.App.Grid.removeMask();
                                        alert(PRM.Translation.getText('ALERT.DELETE_ASSIGNMENT_SUCCESS'));                                        
                                    },
                                    failure : function (batch) {
                                        PRM.App.Grid.removeMask();
                                        alert(PRM.Translation.getText('ALERT.DELETE_ASSIGNMENT_FAIL'));
                                    }
                                });
                            }
                        }
                    ],
                    listeners : {
                        beforeshow : function (menu, opts) {
                            var params = menu.params,
                                record = params.record,
                                editResourceItem = menu.items.getAt(0),
                                removeResourceItem = menu.items.getAt(1);
                            
                            if (record.hasActualWork()){
                                // resources with hours worked cannot be edited
                                editResourceItem.disable();
                                editResourceItem.addCls('prm-tooltip-read-only-worked-hours');

                                // resources with hours worked cannot be removed
                                removeResourceItem.disable();
                                removeResourceItem.addCls('prm-tooltip-read-only-worked-hours');
                            }
                        }
                    }
                })
            ];
        
        var mainColumns = [];
        
        // add left pane columns
        mainColumns.push({
            xtype : 'treecolumn',
            cls: 'prm-grid-group-header',
            menuDisabled: true,
            locked: true,
            resizable: true,
            text : '<div id="prm-project-search-container"></div>',
            columns: [
                {
                    xtype : 'prm-grid-action-column',
                    id : 'prm-grid-action',
                    text : '<div id="prm-grid-action-container"></div>',
                    dataIndex : 'hover',
                    width : 50,
                    items : [
                        {
                            iconCls : 'prm-action-cell-icon',
                            handler : function(grid, rowIndex, colIndex, item, event, record) {
                                // prevent action menu on Project Template
                                if (record.get('status') == 'template' 
                                    || record.get('name') == 'Search Resource' 
                                        || record.get('name') == 'No Results Found.') {
                                    return;
                                }
                                
                                // position menu to the righmost edge of the target cell
                                var xy = Ext4.get(event.target).parent().getXY();
                                xy[0] += this.width;
                                
                                var params = {
                                		rowIndex : rowIndex,
                                		colIndex : colIndex,
                                		record : record
                                };
                                
                                if (record.get('type') === 'project') {
                                	menus[0].params = params;
                                	menus[0].showAt(xy);
                                }
                                else if (record.get('type') === 'resource-summary') {
                                	menus[1].params = params;
                                	menus[1].showAt(xy);
                                }
                                else if (record.get('type') === 'task') {
                                	menus[2].params = params;
                                	menus[2].showAt(xy);
                                }
                                else if (record.get('type') === 'resource') {
                                	menus[3].params = params;
                                	menus[3].showAt(xy);
                                }
                                else {
                                	//do nothing
                                }
                            }
                        }
                    ]
                },
                {
                    xtype: 'treecolumn',
                    id: 'prm-grid-name',
                    cls: 'prm-grid-header',
                    dataIndex: 'name',
                    text: PRM.Translation.getText('HEADER.PROJECT_TASK_RESOURCE'),
                    menuDisabled: true,
                    width: 400,
                    getEditor: function(record, defaultField) {
                        return PRM.App.Grid.rowNameEditor;
                    },
                    renderer: function(value, metaData, record, row, col, store, view) {
                        var recordType  = record.get('type'),
                            addClasses  = [];
        
                        if (recordType == 'project') {
                            addClasses.push('prm-project');
                            if (!record.childNodes.length) {
                                //addClasses.push('prm-project-no-children');
                            }
                        } else if(recordType == 'resource-summary') {
                            if (!record.get('withAssignments')) {
                                addClasses.push('prm-color-code-resource-no-assignment');
                            }
                            if (record.get('isResourceInactive')) {
                                addClasses.push('prm-color-code-inactive-resource');
                            }
                        } else if (recordType == 'task') {
                            addClasses.push('prm-task');
                        } else if (recordType == 'resource') {
                            if (record.get('isResourceInactive')) {
                                addClasses.push('prm-color-code-inactive-resource');
                            }
                        }
                        
                        PRM.App.Grid.addTestAutomationHook('left', addClasses, row, col);
                        metaData.tdCls = [metaData.tdCls, addClasses.join(' ')].join(' ');
                        
                        return value;
                    }
                },
//                {
//                    xtype: 'prm-grid-locked-column',
//                    id: 'prm-grid-role',
//                    dataIndex: 'role',
//                    text: PRM.Translation.getText('HEADER.ROLE'),
//                    width: 100,
//                    renderer: function(value, metaData, record, row, col, store, view) {
//                        var recordType  = record.get('type'),
//                            addClasses  = [];
//                        
//                        if (recordType == 'project' || recordType == 'task') {
//                            // specify record specific css class
//                            addClasses.push('prm-' + recordType);
//                        }
//                        
//                        PRM.App.Grid.addTestAutomationHook('left', addClasses, row, col);
//                        metaData.tdCls = [metaData.tdCls, addClasses.join(' ')].join(' ');
//                        
//                        return value;
//                    }                    
//                },
                {
                    xtype: 'prm-grid-locked-column',
                    id: 'prm-grid-hours-estimated',
                    text: PRM.Translation.getText('HEADER.HOURS_ESTIMATED'),
                    align: 'right',
                    dataIndex : 'hrsEstimated',
                    renderer: function(value, metaData, record, row, col, store, view) {
                        var recordType  = record.get('type'),
                            addClasses  = ['prm-color-code-read-only-value'];
                        
                        if (recordType == 'project' || recordType == 'task') {
                            addClasses.push('prm-' + recordType);
                        }
                        
                        PRM.App.Grid.addTestAutomationHook('left', addClasses, row, col);
                        metaData.tdCls = [metaData.tdCls, addClasses.join(' ')].join(' ');
                        
                        return value;
                    }
                },
                {
                    xtype: 'prm-grid-locked-column',
                    id: 'prm-grid-percent-complete',
                    text: PRM.Translation.getText('HEADER.PERCENT_COMPLETE'),
                    align: 'right',
                    dataIndex : 'pctComplete',
                    renderer: function(value, metaData, record, row, col, store, view) {
                        var recordType  = record.get('type'),
                            addClasses  = ['prm-color-code-read-only-value'];
                        
                        if (recordType == 'project' || recordType == 'task') {
                            addClasses.push('prm-' + recordType);
                        }
                        
                        PRM.App.Grid.addTestAutomationHook('left', addClasses, row, col);
                        metaData.tdCls = [metaData.tdCls, addClasses.join(' ')].join(' ');
                        
                        if (recordType == 'resource-summary') {
                            return '';
                        }
                        
                        return Ext4.util.Format.round(Number(value.split('%')[0]), 2) + '%';
                    }
                }
            ]
        });
        
        // add right pane columns
        var dateToday = Ext4.Date.clearTime(new Date());
        
        // set period start date to be the previous Sunday
        var daysAfterSunday = dayOfWeek = dateToday.getDay();        
        var periodStartDate = Ext4.Date.subtract(dateToday, Ext4.Date.DAY, daysAfterSunday);
        
        // set date range label in toolbar
        var lastPeriodStartDate = Ext4.Date.add(periodStartDate, Ext4.Date.DAY, 14);
        PRM.App.Toolbar.setDateRange(periodStartDate, lastPeriodStartDate, 'Weekly');
        
        // compute column width
        var gridColumnWidth = this.getGridColumnWidth();
        
        // construct 3 main columns, representing 3 period groups
        for (var i = 1; i <= 3 ; i++){
            // set current period configs (default is weekly preset)
            var periodStartMonth = Ext4.Date.monthNames[periodStartDate.getMonth()];
            var periodStartDay = periodStartDate.getDate();
            var periodId = 'period' + i;
            var periodEndDate = Ext4.Date.add(periodStartDate, Ext4.Date.DAY, 6);
            
            mainColumns.push({
                // -- start PRM specific -- //
                startDate: periodStartDate,
                endDate: periodEndDate,
                // -- end PRM specific -- //
                id: 'prm-grid-' + periodId,
                cls: 'prm-grid-group-header',
                menuDisabled: true,
                text: 'Week of ' + periodStartMonth + ' ' + periodStartDay,
                listeners : {
                    headerclick : function(ct, col) {
                        var form  = PRM.App.Forms.allocationSummary;
                        
                        form.setTitle([PRM.Translation.getText('WINDOW.ALLOCATION_SUMMARY'), ': ', col.text].join(''));
                        form.show();
                        form.loadSummary({
                            startDate : Ext4.util.Format.date(col.startDate, nsDateFormat),
                            endDate   : Ext4.util.Format.date(col.endDate, nsDateFormat),
                            pageNum   : 1
                        });
                    }
                },
                columns: [
                    {
                        xtype: 'prm-grid-column',
                        id: 'prm-grid-' + periodId + '-allocation-percent',
                        text: PRM.Translation.getText('HEADER.PERCENT_ALLOCATED'),
                        hidden : !PRM.App.Settings.showAllocations,
                        width : gridColumnWidth,
                        renderer: function(value, metaData, record, row, col, store, view) {
                            var recordType  = record.get('type'),
                                renderValue = '-',
                                addClasses  = ['prm-color-code-read-only-value'];
                            
                            if (recordType == 'project') {
                                addClasses.push('prm-project');
                                renderValue = '';
                            } else if (record.get('allocations')){
                                var params = PRM.App.Grid.getComputationParams(record, col);
                                if (params.isWorking){
                                    renderValue = PRM.App.Grid.getPctAllocated(params);
                                } else {
                                    addClasses.push('prm-non-working-day');
                                }
                            }
                            
                            PRM.App.Grid.addTestAutomationHook('right', addClasses, row, col);
                            metaData.tdCls = [metaData.tdCls, addClasses.join(' ')].join(' ');
                            
                            return PRM.App.showZeroes ? renderValue : (renderValue == '0%' ? '' : renderValue);
                        }
                    },
                    {
                        xtype: 'prm-grid-column',
                        id: 'prm-grid-' + periodId + '-allocation-hours',
                        text: PRM.Translation.getText('HEADER.HOURS_ALLOCATED'),
                        hidden : !PRM.App.Settings.showAllocations,
                        width : gridColumnWidth,
                        renderer: function(value, metaData, record, row, col, store, view) {
                            var recordType  = record.get('type'),
                                renderValue = '-',
                                addClasses  = ['prm-color-code-editable-value'],
                                params      = PRM.App.Grid.getComputationParams(record, col);
                            
                            if (recordType == 'project') {
                                addClasses.push('prm-project');
                                renderValue = PRM.App.Grid.getTimeBillSummary(params, 'B');
                            } else if (record.get('allocations')) {
                                if (params.isWorking){
                                    // add css class indicating multiple allocation records under the current period
                                    var periodCmp       = PRM.App.Grid.getPeriodCmp(col),
                                        periodAlloc     = record.getAllocations(periodCmp.startDate, periodCmp.endDate),
                                        allocationCount = periodAlloc.length;
                                    
                                    if (allocationCount > 1) {
                                        addClasses.push('prm-multiple-allocation');
                                    } else if (allocationCount == 1) {
                                        metaData.tdAttr += ' allocId="' + periodAlloc[0].id + '"';
                                        addClasses.push((Number(periodAlloc[0].approvalStatus) == 6) ? 'prm-rejected-allocation' : 'prm-allocation');
                                    }
                                    
                                    renderValue = PRM.App.Grid.getHrsAllocated(params);
                                    
                                    if (Number(renderValue) && PRM.App.Grid.isWithRecurring(periodAlloc)) {
                                        addClasses.push('prm-recurrence-icon');
                                    }
                                } else {
                                    addClasses.push('prm-non-working-day');
                                }
                            }
                            
                            PRM.App.Grid.addTestAutomationHook('right', addClasses, row, col);
                            metaData.tdCls = [metaData.tdCls, addClasses.join(' ')].join(' ');
                            
                            return PRM.App.showZeroes ? renderValue : (renderValue ? renderValue : '');
                        }
                    },
                    {
                        xtype: 'prm-grid-column',
                        id: 'prm-grid-' + periodId + '-assigned-hours',
                        text: PRM.Translation.getText('HEADER.HOURS_ASSIGNED'),
                        hidden : !PRM.App.Settings.showAssignments,
                        width : gridColumnWidth,
                        renderer: function(value, metaData, record, row, col, store, view) {
                            var recordType  = record.get('type'),
                                renderValue = '',
                                addClasses  = ['prm-color-code-read-only-value'],
                                params      = PRM.App.Grid.getComputationParams(record, col);
                            
                            if (recordType == 'project') {
                                addClasses.push('prm-project');
                                renderValue = PRM.App.Grid.getTimeBillSummary(params, 'PA');
                            } else if (recordType == 'resource-summary' || recordType == 'task') {
                                renderValue = PRM.App.Grid.summarizeAssignments('assigned', col, record);
                            } else if (!params.isWorking){
                                addClasses.push('prm-non-working-day');
                            } else if (recordType == 'resource'){
                                var hours = PRM.App.Grid.getHrsAssigned(params);
                                if (hours != 0 && parseInt(record.get('pctComplete')) !== 100) {
                                    addClasses.push('prm-assignment');
                                }
                                renderValue = hours;
                            }
                            
                            PRM.App.Grid.addTestAutomationHook('right', addClasses, row, col);
                            metaData.tdCls = [metaData.tdCls, addClasses.join(' ')].join(' ');
                            
                            return PRM.App.showZeroes ? renderValue : (renderValue ? renderValue : '');
                        }
                    },
                    {
                        xtype: 'prm-grid-column',
                        id: 'prm-grid-' + periodId + '-worked-hours',
                        text: PRM.Translation.getText('HEADER.HOURS_WORKED'),
                        width : gridColumnWidth,
                        renderer: function(value, metaData, record, row, col, store, view) {
                            var recordType  = record.get('type'),
                                renderValue = '',
                                addClasses  = ['prm-color-code-read-only-value', 'prm-column-border-right'],
                                params      = PRM.App.Grid.getComputationParams(record, col);
                            
                            if (recordType == 'project') {
                                addClasses.push('prm-project');
                                renderValue = PRM.App.Grid.getTimeBillSummary(params, 'A');
                            } else if (recordType == 'resource-summary' || recordType == 'task') {
                                renderValue = PRM.App.Grid.summarizeAssignments('worked', col, record);
                            } else if (!params.isWorking){
                                addClasses.push('prm-non-working-day');
                            } else if (recordType == 'resource'){
                                renderValue = PRM.App.Grid.getHrsWorked(params);
                            }
                            
                            PRM.App.Grid.addTestAutomationHook('right', addClasses, row, col);
                            metaData.tdCls = [metaData.tdCls, addClasses.join(' ')].join(' ');
                            
                            return PRM.App.showZeroes ? renderValue : (renderValue ? renderValue : '');
                        }
                    }
                ]
            });
            
            // move period startDate to next week (default is weekly preset)
            periodStartDate = Ext4.Date.add(periodStartDate, Ext4.Date.DAY, 7);
        }
        
        Ext4.applyIf(this, {columns: mainColumns});
        
        this.callParent(args);
    },
    listeners: {
        boxReady: function(me){
            me.autofit();
            
            var projectSearchContainer = Ext4.get('prm-project-search-container');
            Ext4.create('Ext4.panel.Panel', {
                id : 'prm-project-search-panel',
                renderTo : projectSearchContainer,
                layout : {
                    type : 'hbox',
                    align : 'middle'
                },
                border : false,
                defaults : {
                    margin : '0 0 0 15'
                },
                items : [{
                    id : 'prm-search-project-textbox',
                    xtype: 'searchProjectTrigger',
                    emptyText: PRM.Translation.getText('TEXT.SEARCH_PROJECT')
                }]
            });
            
            var actionColumnHeader = Ext4.get('prm-grid-action-container');
            Ext4.create('Ext4.panel.Panel', {
                id : 'prm-gridActionColumnHeader',
                renderTo : actionColumnHeader,
                height : 30,
                layout : {
                    type : 'hbox',
                    align : 'middle'
                },
                border : false,
                defaults : {
                    margin : '0 0 0 0'
                },
                items : [
                    {
                        xtype : 'prm-button-icon',
                        cls : 'prm-action-header-icon',
                        menu : {
                            xtype : 'prm-grid-menu',
                            items : [
                                {
                                    id: 'prm-grid-axn-hdr-menu-addproj',
                                    text: PRM.Translation.getText('MENU.ADD_PROJECT'),
                                    handler : function () {
                                        PRM.App.Grid.rowNameEditor = PRM.Cmp.Editor.Project;
                                        
                                        var newNode = Ext4.create('PRM.Model.Grid',{
                                            type: 'project',
                                            leaf: false,
                                            expanded : true
                                        });
                                        
                                        PRM.App.Grid.store.getRootNode().insertChild(0, newNode);
    
                                        PRM.Cmp.Editor.Plugin.init(PRM.App.Grid.view.lockedView.up());
                                        
                                        PRM.Cmp.Editor.Plugin.startEdit(newNode, 
                                        PRM.App.Grid.view.lockedView.up().ownerCt.columnManager.getHeaderAtIndex(1));
                                    }
                                }
                            ],
                            listeners : {
                                beforeshow : function(me) {
                                    var addProjectItem     = me.items.getAt(0),
                                        includeAllProjects = PRM.App.Settings.includeAllProjects;
                                    
                                    if (includeAllProjects) {
                                        addProjectItem.disable();
                                        addProjectItem.addCls('prm-tooltip-read-only-include-all-projects');
                                    } else {
                                        addProjectItem.enable();
                                        addProjectItem.removeCls('prm-tooltip-read-only-include-all-projects');
                                    }
                                }
                            }
                        }
                    }
                ]
            });
        },
        cellcontextmenu: function(tableView, td, cellIndex, record, tr, rowIndex, event, eOpts) {
            event.preventDefault(); 
            var menuId        = 'prm-context-menu',
                rowType       = record.get('type'),
                colType       = PRM.App.Grid.getColType(cellIndex),
                period        = PRM.App.Grid.down('#prm-grid-period' + (Math.floor(cellIndex / 4) + 1)),
                periodStart   = new Date(period.startDate).getTime(),
                periodEnd     = new Date(period.endDate).getTime(),
                params        = {
                                    rowType : rowType,
                                    colType : colType,
                                    periodStart : periodStart,
                                    periodEnd : periodEnd,
                                    record : record
                                };
        
            if (!PRM.App.cellContextMenu) {
                PRM.App.cellContextMenu = Ext4.create('PRM.Cmp.Menu', {
                    xtype : 'prm-grid-menu',
                    id : menuId,
                    items : [
                        {
                            id : menuId + '-edit-allocation',
                            text : PRM.Translation.getText('MENU.EDIT_ALLOCATION'), 
                            handler : function (item, event) {
                                /*
                                 * find 
                                 */
                                var params      = item.up().params,
                                    periodStart = params.periodStart || 0,
                                    periodEnd   = params.periodEnd || 0,
                                    record      = params.record,
                                    allocations = record.getAllocations(periodStart, periodEnd);
                                
                                if (allocations.length == 1) {
                                    var allocation = allocations[0],
                                        allocId    = allocation.id;
                                    
                                    if (allocId.indexOf('~') != -1) {
                                        allocId = allocation.id.split('~')[1];
                                    }
                                    
                                    PRM.App.Forms.allocationNS.openForm({
                                        id           : allocId,
                                        prevResource : allocation.resourceId,
                                        prevProject  : allocation.projectId
                                    });
                                } else {
                                    // alert that multiple allocations are affected?
                                }
                            }
                        },
                        {
                            id : menuId + '-edit-assignment',
                            text : PRM.Translation.getText('MENU.EDIT_ASSIGNMENT'),
                            handler : function (item, event) {
                                PRM.App.Forms.editAssignment.record = item.up().params.record;
                                var assignmentData = item.up().params.record.data;
                                var params = {
                                        id : assignmentData.id,
                                        resourceName : assignmentData.name,
                                        hrsWorked : assignmentData.hrsWorked,
                                        assignStartDate : assignmentData.assignStartDate,
                                        assignEndDate : assignmentData.assignEndDate,
                                        unitPct : assignmentData.unitPct,
                                        billingClassId : assignmentData.billingClassId,
                                        unitCost : assignmentData.unitCost,
                                        unitPrice : assignmentData.unitPrice,
                                        hrsEstimated : assignmentData.hrsEstimated,
                                        hrsWorked : assignmentData.hrsWorked,
                                        serviceItemId : assignmentData.serviceItemId
                                };
                                PRM.App.Forms.taskAssignment.openAsEdit(JSON.stringify(params));
                            }
                        }
                    ],
                    listeners : {
                        beforeshow : function (menu, opts) {
                            var params = menu.params,
                                record = params.record,
                                periodStart = params.periodStart || 0,
                                periodEnd = params.periodEnd || 0,
                                allocation = menu.items.getAt(0),
                                assignment = menu.items.getAt(1);
                            
                            if ('resource' == record.get('type') && 100 == parseInt(record.get('pctComplete'))) {
                                return false;
                            }
                            
                            if (menu.isAllocation(params) && record.getAllocations(periodStart, periodEnd).length == 1) {
                                allocation.show();
                                assignment.hide();
                            }
                            else if (menu.isAssignment(params)) {
                                allocation.hide();
                                assignment.show();
                            }
                            else {
                                return false;
                            }
                        }
                    },
                    isAllocation : function (params) {
                        return (params.rowType == 'resource-summary' && params.colType == 'hours-allocated');
                    },
                    isAssignment : function (params) {
                        return (params.rowType == 'resource' && params.colType == 'hours-assigned');
                    }
                });
            }
            
            PRM.App.cellContextMenu.params = params;
            PRM.App.cellContextMenu.showAt(event.getXY());
        },
        afterrender : function () {
            Ext4.create('PRM.Cmp.MainToolTip', {
                delegate: '.x4-tree-node-text'
            });
            
            Ext4.create('PRM.Cmp.AssignmentToolTip', {
                delegate : '.prm-assignment'
            });
            
            Ext4.create('PRM.Cmp.ResourceAllocationToolTip', {
                delegate : '.prm-allocation'
            });
        },
        cellclick: function(me, td, cellIndex, record, tr, rowIndex, e, eOpts) {
            // allow drill down when ctrl key is pressed, under resource summary row, hours allocatd column
            var periodColumn = PRM.App.Grid.getColType(cellIndex);
            if(e.ctrlKey
                && record.isSummary()
                && periodColumn == 'hours-allocated'){
                
                // TODO: Find a way to avoid drill down when in left pane
                
                // cancel the editor since it is also triggered when single click
                PRM.Cmp.Editor.Number.triggerBlur();
                
                // prevent drill down if preset is already daily
                if (PRM.App.Grid.preset != 'Daily'){
                    PRM.App.Grid.drillDown(record, cellIndex);
                }
            }
        }
    },
    tipCfg : {
        showDelay : 0,
        autoHide : true,
        hideDelay : 0,
        delegate : '.event-tooltip',
        trackMouse : true,
        dismissDelay : 0,
        id : 'prm-project-details-hover'
    },
    colTypeMap : {
        4 : {
            1 : 'percent-allocated',
            2 : 'hours-allocated',
            3 : 'hours-assigned',
            4 : 'hours-worked'
        },
        3 : {
            1 : 'percent-allocated',
            2 : 'hours-allocated',
            3 : 'hours-worked'
        },
        2 : {
            1 : 'hours-assigned',
            2 : 'hours-worked'
        }
    },
    getColsPerPeriod : function() {
        return !PRM.App.Settings.showAllocations ? 2 : !PRM.App.Settings.showAssignments ? 3 : 4;
    },
    getColType : function(colNum) {
        var cpp = this.getColsPerPeriod();
        
        return this.colTypeMap[cpp][(colNum % cpp) + 1];
    },
    /*
     * PRM Specific Methods and Properties
     */
    preset: 'Weekly', // recognized presets are Daily, Weekly, and Monthly
    rowNameEditor: null, // used for identifying editor for an entry under "Project / Task / Resource" column 
    /*
     *  Updates grid values and affected labels when preset is changed
     *
     *  @param {String} newPreset    - newly selected preset (can be Daily, Weekly, or Monthly)
     *  @param {Date}   newStartDate - (optional) date where the resulting range starts; if not provided, current start date will be used
     */
    updatePreset: function(newPreset, newStartDate){
        // validate
        if (this.preset == newPreset && this.getStartDate() == newStartDate) {
            return;
        }
        
        // get period components
        var periodCmp1 = this.down('#prm-grid-period1');
        var periodCmp2 = periodCmp1.nextSibling();
        var periodCmp3 = periodCmp2.nextSibling();

        // set base start date
        var startDate = newStartDate ? newStartDate : periodCmp1.startDate;
        startDate = Ext4.Date.clearTime(startDate);

        // update period dates
        switch (newPreset) {
            case 'Daily':
                periodCmp1.startDate = periodCmp1.endDate = startDate;
                periodCmp2.startDate = periodCmp2.endDate = Ext4.Date.add(startDate, Ext4.Date.DAY, 1);
                periodCmp3.startDate = periodCmp3.endDate = Ext4.Date.add(startDate, Ext4.Date.DAY, 2);
                break;
            case 'Weekly':
                // set first day of the week to be a Sunday
                startDate = Ext4.Date.subtract(startDate, Ext4.Date.DAY, startDate.getDay());
                
                periodCmp1.startDate = startDate;
                periodCmp1.endDate = Ext4.Date.add(startDate, Ext4.Date.DAY, 6);
                
                periodCmp2.startDate = Ext4.Date.add(startDate, Ext4.Date.DAY, 7);
                periodCmp2.endDate = Ext4.Date.add(startDate, Ext4.Date.DAY, 13);                
                
                periodCmp3.startDate = Ext4.Date.add(startDate, Ext4.Date.DAY, 14);
                periodCmp3.endDate = Ext4.Date.add(startDate, Ext4.Date.DAY, 20);
                break;
            case 'Monthly':
                startDate = startDate.getFirstDateOfMonth();
                
                periodCmp1.startDate = startDate;
                periodCmp1.endDate = startDate.getLastDateOfMonth();
                
                periodCmp2.startDate = Ext4.Date.add(startDate, Ext4.Date.MONTH, 1);
                periodCmp2.endDate = periodCmp2.startDate.getLastDateOfMonth();

                periodCmp3.startDate = Ext4.Date.add(startDate, Ext4.Date.MONTH, 2);
                periodCmp3.endDate = periodCmp3.startDate.getLastDateOfMonth();
                break;
            default:
                alert('ERROR: New preset parameter is invalid');
                break;
        }
        
        // update period labels
        this.setPeriodLabels(periodCmp1, newPreset);
        this.setPeriodLabels(periodCmp2, newPreset);
        this.setPeriodLabels(periodCmp3, newPreset);
        
        // update toolbar date range
        PRM.App.Toolbar.setDateRange(periodCmp1.startDate, periodCmp3.startDate, newPreset);
        
        // update preset property
        this.preset = newPreset;
        
        // update grid values
        this.getView().refresh();
        
        PRM.Util.PerfLogs.stop('PRESET');
    },
    /*
     *  Sets the main column headers on the right pane, associated with periods
     *
     *  @param {Object} periodCmp - Ext JS column component for the period
     *  @param {String} preset - grid preset (can be Daily, Weekly, or Monthly)
     */    
    setPeriodLabels: function(periodCmp, preset){
        var weekDayNum = periodCmp.startDate.getDay(),
            monthDayNum = periodCmp.startDate.getDate(),
            monthNum = periodCmp.startDate.getMonth(),
            dayLabel = '',
            monthLabel = '',
            yearLabel = periodCmp.startDate.getFullYear();
            
        switch (preset) {
            case 'Daily':
                dayLabel = Ext4.Date.dayNames[weekDayNum].substring(0,3);
                monthLabel = Ext4.Date.monthNames[monthNum].substring(0,3);
                periodCmp.setText(dayLabel + ' ' + monthLabel + ' ' + monthDayNum);
                break;
            case 'Weekly':
                monthLabel = Ext4.Date.monthNames[monthNum];
                periodCmp.setText(text = 'Week of ' +  monthLabel + ' ' + monthDayNum);
                break;
            case 'Monthly':
                monthLabel = Ext4.Date.monthNames[monthNum].substring(0,3);
                periodCmp.setText(monthLabel + ' ' + yearLabel);
                break;
            default:
                alert('ERROR: Preset parameter is invalid');
                break;
        }
    },
    getPeriodLabels : function() {
        return [
            this.down('#prm-grid-period1').text,
            this.down('#prm-grid-period2').text,
            this.down('#prm-grid-period3').text
        ];
    },
    /*
     * Get start date of the current date range
     * 
     * @returns {Date}
     */
    getStartDate : function() {
        return this.down('#prm-grid-period1').startDate;
    },
    /*
     * This is a map of each preset and the corresponding span of time a single column represents.
     * Used for grid panning.
     */
    presetIncrements : {
        'Daily' : {
            unit : Ext4.Date.DAY,
            count : 1
        },
        'Weekly' : {
            unit : Ext4.Date.DAY,
            count : 7
        },
        'Monthly' : {
            unit : Ext4.Date.MONTH,
            count : 1
        }
    },
    /*
     * Pans the grid to the left/right by 1 column.
     * 
     * @param {string} direction - direction of panning (left or right)
     */
    pan : function(direction) {
        var unit = this.presetIncrements[this.preset].unit;
        var count = (direction == 'left' ? -1 : 1) * this.presetIncrements[this.preset].count;
        this.updatePreset(this.preset, Ext4.Date.add(this.getStartDate(), unit, count));
    },
    autofit: function() {
        /*
         * get total visible height then offset grid's y-coord. offset standard margin as well.
         */
        var totalViewHeight = Ext4.getBody().getViewSize().height - Ext4.getBody().getPadding('t'); //padding only for 14.1
        var gridTop = this.getBox().top;
        var standardMargin = 20;
        var finalHeight = totalViewHeight - gridTop - standardMargin;
        /*
         * set height
         */
        if (this.getHeight() != finalHeight) this.setHeight(finalHeight);
    },
    /*
     * Get parameters needed to compute the period specific values (pctAllocated, hrsAllocated, hrsAssigned, hrsWorked)
     *
     * @param {Object}  record  - Ext JS model of the row
     * @param {Integer} col     - column index on the right pane
     *
     * @returns {Object}
     */    
    getComputationParams : function(record, col){
        var periodCmp = this.getPeriodCmp(col);
        var params = {};
        params.allocations      = record.get('allocations') ? JSON.parse(record.get('allocations')) : '';
        params.timeBills        = record.get('timeBills') ? JSON.parse(record.get('timeBills')) : [];
        params.workCalendar     = record.get('workCalendar') ? JSON.parse(record.get('workCalendar')) : '';
        params.hrsEstimated     = record.get('hrsEstimated') ? record.get('hrsEstimated') : '';
        params.hrsWorked        = record.get('hrsWorked') ? record.get('hrsWorked') : '';
        params.taskStartDate    = record.get('taskStartDate') ? new Date(record.get('taskStartDate')) : '';
        params.taskEndDate      = record.get('taskEndDate') ? new Date(record.get('taskEndDate')) : '';
        params.assignStartDate  = record.get('assignStartDate') ? new Date(record.get('assignStartDate')) : '';
        params.assignEndDate    = record.get('assignEndDate') ? new Date(record.get('assignEndDate')) : '';
        params.unitPct          = record.get('unitPct') ? parseFloat(record.get('unitPct')) : '';
        params.periodStartDate  = periodCmp.startDate;
        params.periodEndDate    = periodCmp.endDate;
        params.isWorking        = (PRM.Util.WorkCalendar.getWorkDays(params.workCalendar, params.periodStartDate, params.periodEndDate) > 0);
        return params;
    },
    /*
     * Summarize assignment values, including both Hours Assigned and Hours Worked.
     *    1) Resource Summary - summarizes all assignments for all tasks under the Resource being rendered
     *    2) Task Summary - summarizes all assignments
     *
     * @param {String}  type   - summary type (can be 'assigned' for hours assigned, or 'worked' for hours worked)
     * @param {Integer} col    - column index on the right pane
     * @param {Object}  record - record being rendered
     *
     * @returns {Integer}
     */    
    summarizeAssignments : function(type, col, record) {
        var total       = 0,
            cascadeFrom = record.get('type') == 'resource-summary' ? record.parentNode : record,
            resourceId  = record.getResourceId(),
            grid        = PRM.App.Grid;
        
        cascadeFrom.cascadeBy(function(node) {
            if (node.get('type') == 'resource') {
                if (!resourceId || resourceId == node.getResourceId()) {
                    if (type == 'assigned') {
                        total += grid.getHrsAssigned(grid.getComputationParams(node, col));
                    } else if (type == 'worked') {
                        total += grid.getHrsWorked(grid.getComputationParams(node, col));
                    }
                }
            }
        });
        
        return Ext4.util.Format.round(total, 2);
    },
    getHrsAllocated: function(params){
        var totalHrsAllocated = 0;
        params.allocations.forEach(function(allocation){
            var allocStartDate          = new Date(allocation.startDate),
                allocEndDate            = new Date(allocation.endDate),
                allocatedWorkDays       = PRM.Util.WorkCalendar.getWorkDays(params.workCalendar, allocStartDate, allocEndDate),
                allocatedHrsPerDay      = (allocatedWorkDays > 0) ? allocation.hrsAllocated / allocatedWorkDays : 0,
                netStartDate            = (allocStartDate > params.periodStartDate) ? allocStartDate : params.periodStartDate,
                netEndDate              = (allocEndDate < params.periodEndDate) ? allocEndDate : params.periodEndDate,
                isWithinPeriod          = Ext4.Date.between(netStartDate, params.periodStartDate, params.periodEndDate) && 
                                          Ext4.Date.between(netEndDate, params.periodStartDate, params.periodEndDate),
                allocatedPeriodWorkDays = isWithinPeriod ? PRM.Util.WorkCalendar.getWorkDays(params.workCalendar, netStartDate, netEndDate) : 0;
                
            totalHrsAllocated = totalHrsAllocated + (allocatedHrsPerDay * allocatedPeriodWorkDays);
        });
        return Ext4.util.Format.round(totalHrsAllocated, 2);
    },
    getPctAllocated: function(params){
        var periodWorkDays   = PRM.Util.WorkCalendar.getWorkDays(params.workCalendar, params.periodStartDate, params.periodEndDate),
            availableWorkHrs = params.workCalendar.hoursPerDay * periodWorkDays,
            allocatedHrs     = this.getHrsAllocated(params),
            percentAllocated = Ext4.util.Format.round((allocatedHrs / availableWorkHrs * 100), 2) + '%';
        return percentAllocated;
    },
    getHrsAssigned: function(params){
        
        if (params.timeBills.length || (params.assignStartDate && this.checkDatesForIntersection(params.assignStartDate, params.assignEndDate, params.periodStartDate, params.periodEndDate))) {

            var assignRemaining = Number(params.hrsEstimated) - Number(params.hrsWorked),
                periodWorked    = this.getHrsWorked(params),
                periodEstimated = periodWorked;
            
            if (assignRemaining) {

                var lastWorkedDay = params.timeBills.length ? new Date(params.timeBills[params.timeBills.length - 1].date) : null;
                    
                if (!lastWorkedDay || lastWorkedDay <= params.periodEndDate) {

                    var nextAssignDay     = lastWorkedDay ? Ext4.Date.add(lastWorkedDay, Ext4.Date.DAY, 1) : params.assignStartDate,
                        periodAssignStart = nextAssignDay.getTime() > params.periodStartDate.getTime() ? nextAssignDay : params.periodStartDate,
                        periodAssignEnd   = params.assignEndDate.getTime() < params.periodEndDate.getTime() ? params.assignEndDate : params.periodEndDate,
                        periodAssignDays  = periodAssignStart > periodAssignEnd ? 0 : PRM.Util.WorkCalendar.getWorkDays(params.workCalendar, periodAssignStart, periodAssignEnd);
                    
                    if (periodAssignDays) {
                    
                        var assignmentPerDay  = params.workCalendar.hoursPerDay * params.unitPct / 100;
                        
                        // deduct any assigned hours to the left of the current period
                        if (nextAssignDay.getTime() < params.periodStartDate.getTime()) {
                            
                            var pastAssignedHours = PRM.Util.WorkCalendar.getWorkDays(params.workCalendar, nextAssignDay, Ext4.Date.add(params.periodStartDate, Ext4.Date.DAY, -1)) * assignmentPerDay;
                            assignRemaining = pastAssignedHours >= assignRemaining ? 0 : assignRemaining - pastAssignedHours;
                        }
                        
                        // ensure that hours assigned is never greater than the remaining hours, before adding worked hours
                        periodEstimated = periodAssignDays * assignmentPerDay;
                        periodEstimated = (periodEstimated > assignRemaining ? assignRemaining : periodEstimated) + periodWorked;
                    }
                }
            }
            
            var periodEstimatedInMinutes = Ext4.util.Format.round(periodEstimated * 60, 0);
            return Ext4.util.Format.round(periodEstimatedInMinutes / 60, 2);
        }
        
        return 0;
    },
    getHrsWorked: function(params){
        var totalHrsWorked = 0;
        params.timeBills.forEach(function(timeBill){
            var isWithinPeriod = Ext4.Date.between(new Date(timeBill.date), params.periodStartDate, params.periodEndDate);
            if (isWithinPeriod){
                totalHrsWorked += PRM.App.Grid.getTimeBillHrs(timeBill.duration);
            }
        });
        return Ext4.util.Format.round(totalHrsWorked, 2);
    },
    getTimeBillSummary : function(params, type) {
        var total = 0;
        params.timeBills.forEach(function(timeBill) {
            if (type.indexOf(timeBill.type) > -1 && Ext4.Date.between(new Date(timeBill.date), params.periodStartDate, params.periodEndDate)) {
                total += Number(timeBill.duration);
            }
        });
        return Ext4.util.Format.round(total, 2);
    },
    getTotalHrsWorked : function(timeBills) {
        var totalHrsWorked = 0;
        timeBills.forEach(function(timeBill){
            totalHrsWorked += PRM.App.Grid.getTimeBillHrs(timeBill.duration);
        });
        return Ext4.util.Format.round(totalHrsWorked, 2);
    },
    getPeriodCmp: function(rightPaneCol){
        var periodId = this.getPeriodId(rightPaneCol);
        return Ext4.getCmp(periodId);
    },
    getPeriodId: function(rightPaneCol){
        // period id depends on right pane column
        var rightPanePeriod = 'period',
            colsPerPeriod    = this.getColsPerPeriod();
        
        if (rightPaneCol < (1 * colsPerPeriod)) (rightPanePeriod += '1');
        else if (rightPaneCol < (2 * colsPerPeriod)) (rightPanePeriod += '2');
        else (rightPanePeriod += '3');
        
        return 'prm-grid-' + rightPanePeriod;
    },
    addTestAutomationHook: function(side, addClasses, row, col){
        // add 1 in rows and columns to convert from indeces to numbers
        if (side == 'left'){
            addClasses.push('prm-grid-lpane-' + (row + 1) + '-' + (col + 1));
        } else if (side == 'right'){
            addClasses.push('prm-grid-rpane-' + (row + 1) + '-' + (col + 1));
        }
    },
    getTimeBillHrs: function(duration){
        var hours = parseInt(duration.substring(0,duration.indexOf(':'))),
            minutes = parseInt(duration.substring(duration.indexOf(':') + 1)),
            totalHours = hours + (minutes / 60);
        return totalHours;
    },
    checkDatesForIntersection : function(aStart, aEnd, bStart, bEnd) {
        return Ext4.Date.between(aStart, bStart, bEnd) ||
               Ext4.Date.between(bStart, aStart, aEnd);
    },
    print : function () {
        /*
         * build html
         */
        var html        = [],
            lockedCols  = 3,
            showAlloc   = PRM.App.Settings.showAllocations,
            showAssign  = PRM.App.Settings.showAssignments,
            headerCSpan = showAlloc && showAssign ? 4 : showAlloc ? 3 : 2;
        
        html.push('<html>');
            html.push('<head>');
                html.push('<title>' + Ext4.query('.uir-record-type')[0].innerHTML + '</title>');
                html.push('<style>');
                    html.push('table, td { border: 1px solid #E5E5E5; text-align: center; border-collapse: collapse; width: 100%; font-family: "' + nsFont + '"; padding: 10px; font-size: 15px; }');
                    html.push('table { border: 2px solid #CCCCCC; }');
                    html.push('.header { font-size: 12px; color: #000000; text-transform: uppercase; padding: 15px; }');
                    html.push('.header-1, .prm-non-working-day { background-color: #CCC7C7; }');
                    html.push('.header-2 { background-color: #EAEAEA; }');
                    html.push('.project { border-top: 2px solid #CCCCCC; }');
                    html.push('.project .x4-tree-node-text { font-weight: bold; text-transform: uppercase; }');
                    html.push('.border-right { border-right: 2px solid #CCCCCC; }');
                    html.push('.border-left { border-left: 2px solid #CCCCCC; }');
                html.push('</style>');
            html.push('</head>');
            html.push('<body><table class="prm-print-table">');
                /*
                 * add headers; 1st level then 2nd level
                 */
                var periodLabels = PRM.App.Grid.getPeriodLabels();
                var columnHeaders = PRM.App.Grid.columns;
                html.push('<tr>');
                    html.push('<td colspan="' + lockedCols + '" class="header header-1 border-right">&nbsp;</td>');
                    for (var i = 0; i < periodLabels.length; i++) {
                        html.push('<td colspan="' + headerCSpan + '" class="header header-1 border-right">' + periodLabels[i] + '</td>');
                    }
                html.push('</tr><tr>');
                    for (var i = 1; i < columnHeaders.length; i++) {
                        var tmpIdx = i - lockedCols;
                        
                        if (i <= lockedCols || // always show locked columns
                            tmpIdx % 4 == 0 || // always show Hours Worked columns
                            (showAlloc && (tmpIdx % 4 == 1 || tmpIdx % 4 == 2)) || // only show Percent Allocated and Hours Allocted columns if Show Allocations is checked
                            (showAssign && tmpIdx % 4 == 3)) { // only show Hours Assigned column if Show Assignments is checked
                            html.push('<td class="header header-2 ' + (i >= lockedCols && (tmpIdx % 4 == 0) ? 'border-right' : '' ) + '">' + columnHeaders[i].text + '</td>');
                        }
                    }
                html.push('</tr>');
                /*
                 * add all grid data
                 */
                html.push(this.printRowData(PRM.App.Grid.getRootNode(), headerCSpan));
            html.push('</table></body>');
        html.push('</html>');
        /*
         * open window and call browser print
         */
        var win = window.open('', 'Project Resource Management');
        win.document.open();
        win.document.write(html.join('\n'));
        win.document.close();
        win.print();
    },
    /*
     * returns html as str for printing, traverses all nodes recursively
     * ignores root node
     */
    printRowData : function(node, headerCSpan) {
        var rowStr = '';
        if (node.data.id != 'root') {
            rowStr += '<tr class="' + node.data.type + '">';
            /*
             * left pane
             */
            var leftPane = Ext4.query('.x4-grid-cell-inner', PRM.App.Grid.lockedGrid.getView().getNode(node));
            for (var i = 1; i < leftPane.length; i++) {
                rowStr += '<td>' + leftPane[i].innerHTML + '</td>';
            }
            /*
             * right pane
             */
            var rightPane = Ext4.query('.x4-grid-cell', PRM.App.Grid.getView().getNode(node));
            for (var i = 0; i < rightPane.length; i++) {
                rowStr += '<td class="' + rightPane[i].className + ' ' + (i % headerCSpan == 0 ? 'border-left' : '') + '">' + rightPane[i].innerHTML + '</td>';
            }
            rowStr += '</tr>';
        }
        if (node.data.expanded) {
            for(var i = 0; i < node.childNodes.length; i++ ) {
                rowStr += this.printRowData(node.childNodes[i], headerCSpan);
            }
        }
        return rowStr;
    },
    /*
     * for pagination
     */
    shiftPage : function(opt) {
        var newPage = PRM.App.Settings.currentPage;
        var message = "";
        switch (opt) {
            case 'right':
                if (newPage == PRM.App.Settings.totalPages) message = PRM.Translation.getText('ALERT.PAGING_LAST_PAGE');
                newPage++;
                break;
            case 'left':
                if (newPage == 1) message = PRM.Translation.getText('ALERT.PAGING_FIRST_PAGE');
                newPage--;
                break;
        }
        if (message) {
            alert(message);
        } else {
            Ext4.getCmp('prm-page-combo-box').select(newPage);
        }
    },
    setPage : function(pageNumber) {
        PRM.Util.PerfLogs.start('GRID_LOAD');
        this.store.loadWithFilters(pageNumber);
    },
    enablePagingControls : function() {
        this.showPagingControls();
        Ext4.getCmp('prm-page-combo-box').setDisabled(false);
        Ext4.getCmp('prm-btn-page-left').setDisabled(false);
        Ext4.getCmp('prm-btn-page-right').setDisabled(false);
    },
    disablePagingControls : function() {
        Ext4.getCmp('prm-page-combo-box').setDisabled(true);
        Ext4.getCmp('prm-btn-page-left').setDisabled(true);
        Ext4.getCmp('prm-btn-page-right').setDisabled(true);
    },
    hidePagingControls : function() {
        Ext4.getCmp('prm-page-combo-box').hide();
        Ext4.getCmp('prm-btn-page-left').hide();
        Ext4.getCmp('prm-btn-page-right').hide();
    },
    showPagingControls : function() {
        Ext4.getCmp('prm-page-combo-box').show();
        Ext4.getCmp('prm-btn-page-left').show();
        Ext4.getCmp('prm-btn-page-right').show();
    },
    computeTotalHoursEstimated : function(node) {
        if (node.childNodes.length) {
            var hrsEstimated = 0;
            for (var i = 0; i < node.childNodes.length; i++) {
                hrsEstimated += this.computeTotalHoursEstimated(node.childNodes[i]);
            }
            return hrsEstimated;
        } else {
            return Number(node.data.hrsEstimated);
        }
    },
    computeTotalPercentComplete : function(node) {
        var tmp = this.getTotalHoursEstimatedAndWorked(node);
        return tmp[1] ? (tmp[0] / tmp[1] * 100) : 0;
    },
    getTotalHoursEstimatedAndWorked : function(node) {
        if (node.childNodes.length) {
            var total = [0, 0];
            for (var i = 0; i < node.childNodes.length; i++) {
                var tmp = this.getTotalHoursEstimatedAndWorked(node.childNodes[i]);
                total[0] += tmp[0];
                total[1] += tmp[1];
            }
            return total;
        } else {
            return [ (Ext4.isEmpty(node.data.timeBills) ? 0 : this.getTotalHrsWorked(JSON.parse(node.data.timeBills))), Number(node.data.hrsEstimated) ];
        }
    },
    drillDown: function(record, cellIndex){
        var periodCmp = this.getPeriodCmp(cellIndex),
            btnDaily = Ext4.getCmp('prm-btn-daily'),
            btnWeekly = Ext4.getCmp('prm-btn-weekly'),
            btnMonthly = Ext4.getCmp('prm-btn-monthly');
        switch (this.preset) {
            case 'Weekly':
                btnWeekly.switchOff();
                btnDaily.switchOn();
                PRM.App.Grid.updatePreset('Daily', periodCmp.startDate);
                break;
            case 'Monthly':
                btnMonthly.switchOff();
                btnWeekly.switchOn();
                PRM.App.Grid.updatePreset('Weekly', periodCmp.startDate);
                break;
        }
    },
    reload: function(){
        var currentFilterId = Ext4.getCmp('prm-cmb-saved-filters').getValue();
        PRM.App.Stores.filter.applyFiltersToStores(currentFilterId);
    },
    addMask: function() {
        PRM.App.Grid.el.mask(PRM.Translation.getText('MASK.LOADING'));
    },
    removeMask: function() {
        PRM.App.Grid.el.unmask();
    },
    nodeMask : function(node, show) {
        var child = node.firstChild;
        
        while (child) {
            Ext4.get(child).el[show ? 'mask' : 'unmask']();
            child = child.nextSibling;
        }
    },
    addNodeMask : function(node) {
        this.nodeMask(PRM.App.Grid.view.lockedView.getNode(node), true);
        this.nodeMask(PRM.App.Grid.view.normalView.getNode(node), true);
    },
    removeNodeMask : function(node) {
        this.nodeMask(PRM.App.Grid.view.lockedView.getNode(node), false);
        this.nodeMask(PRM.App.Grid.view.normalView.getNode(node), false);
    },
    isDateRangeOverlap : function(aStart, aEnd, bStart, bEnd) {
        return !((aStart <= bStart && aEnd <= bStart) || (aStart >= bEnd && aEnd >= bEnd));
    },
    toggleColumns : function () {
        var me = this;
        
        me.computeGridColumnWidth();
        
        Ext4.dom.Query.select('.prm-grid-header').map(function (el) { //maps each DOM element to Ext components    
            return Ext4.getCmp(el.id);
        }).forEach(function (component) { //hide show columns depending on settings
            if (/^prm-grid-period[0-9]-allocation-percent/g.test(component.id) || /^prm-grid-period[0-9]-allocation-hours/g.test(component.id)) {
                component.setWidth(me.getGridColumnWidth());
                if (PRM.App.Settings.showAllocations) {
                    component.show();
                } else {
                    component.hide();
                }
            }
            if (/^prm-grid-period[0-9]-assigned-hours/g.test(component.id)) {
                component.setWidth(me.getGridColumnWidth());
                if (PRM.App.Settings.showAssignments) {
                    component.show();
                } else {
                    component.hide();
                }
            }
            if (/^prm-grid-period[0-9]-worked-hours/g.test(component.id)) {
                component.setWidth(me.getGridColumnWidth());
            }
        });
    },
    computeGridColumnWidth : function() {
        this.gridColumnWidth = 100;
        
        if (PRM.App.Settings.showAllocations && !PRM.App.Settings.showAssignments) { // show allocations only
            this.gridColumnWidth = 133;
        } else if (!PRM.App.Settings.showAllocations && PRM.App.Settings.showAssignments) { // show assignments only
            this.gridColumnWidth = 200;
        }
    },
    getGridColumnWidth : function() {
        if (!this.hasOwnProperty('gridColumnWidth')) {
            this.computeGridColumnWidth();
        }
        
        return this.gridColumnWidth;
    },
    isWithRecurring : function(allAllocs) {
        for (i in allAllocs) {
            if(allAllocs[i].frequency && allAllocs[i].frequency != 'NONE') {
                return true;
            }
        }
        
        return false;
    }
});