/**
 * © 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
 
/**
 * Data stores
 */
 
Ext4.define('PSA.RA.Store.Resource', {
    extend : 'Sch.data.ResourceTreeStore',
    model : 'PSA.RA.Model.GridResource',
    folderSort : true,
    nextId : 0,
    isLoaded : false,
    loadWithFilters : function(mode) {
        
        this.allDataParams.editable = PSA.RA.dataStores.permissionStore.editTask();
        
        this.mode = mode == undefined ? 'reloadChart' : mode;
        var resourceSearch = Ext4.getCmp('ra-resource-search');
        switch (this.mode) {
            case 'reloadChart':
                if (resourceSearch) resourceSearch.setValue();
            case 'resourceSearch':
                this.allDataParams.resourceSearch = resourceSearch ? resourceSearch.getValue() : '';
                this.allDataParams.start = 0;
                this.allDataParams.limit = PSA.RA.dataStores.settingStore.getLimit();
                break;
            case 'pagination':
                break;
            case 'edittask':
                break;
            default:
                break;
        }
        if (this.getRootNode()) {
            this.getRootNode().removeAll();
        }
        this.allDataParams.selectedResources = '';
        this.load({
            params : this.getParams()
        });
    },
    getTaskIdByRow : function(rowNum) {
        var rnode = null;
        this.getRootNode().cascadeBy(function(node) {
            if (node.get('Id') == rowNum) {
                rnode = node;
            }
        });
        
        return rnode.data.details.taskId;
    },
    listeners : {
        load : function(store, rootNode, childNodes, success) {
            if (success) {
                store.isLoaded = true;
                
                var details = PSA.RA.dataStores.chartResource.getProxy().getReader().jsonData.details || new Object();
                
                if (store.mode != 'pagination') {
                    var total = details.total || 0;
                    PSA.RA.dataStores.pageStore.load({
                        params : store.getParams()
                    });
                    Ext4.getCmp('ptm-total-page').setValue(total);
                }
                if (childNodes && childNodes.length) {
                    if (PSA.RA.App) {
                        PSA.RA.App.refreshNonWorking(true);
                    }
                    store.allDataParams.selectedResources = details.selectedResources || '';
                    PSA.RA.dataStores.chartEvent.removeAll();
                    PSA.RA.dataStores.chartEvent.load({
                        params : store.getParams()
                    });
                }
                if ((store.mode == 'pagination') || (store.mode == 'edittask')) {
                    var combo = Ext4.getCmp('ra-page-combo-box');
                    combo.isProcessing = false;
                }
            }
        }
    },
    isRowExists : function(rowNum) {
        var isExists = false;
        this.getRootNode().cascadeBy(function(node) {
            if (node.get('Id') == rowNum) {
                isExists = true;
            }
        });
        return isExists;
    },
    getResourceObjByRow : function(rowNum) {
        var rnode = null;
        this.getRootNode().cascadeBy(function(node) {
            if (node.get('Id') == rowNum) {
                rnode = node;
            }
        });
        return rnode;
    },
    getRowsByResourceId : function(resourceId) {
        var rows = new Array();
        this.getRootNode().cascadeBy(function(node) {
            if (Ext4.Array.indexOf(node.get('Id').split('~'), resourceId) == 0) {
                rows.push(node.get('Id'));
            }
        });
        return rows;
    },
    addNewResourceProjectRow : function(newResourceId, newProjectId) {
        var projectData = PSA.RA.dataStores.projectStore.data.get(newProjectId).raw;
        var resourceData = PSA.RA.dataStores.resourceStore.data.get(newResourceId).raw;
        // Project or Resource does not exist
        var resourceNode;
        if (!this.isRowExists(newResourceId + '')) {
            // Resource does not exists.
            resourceNode = Ext4.create('PSA.RA.Model.GridResource', {
                Id : newResourceId + '',
                Name : resourceData.name,
                resourceId : newResourceId,
                resourceName : resourceData.name,
                projectId : 0,
                projectName : 0,
                comment : null,
                expanded : true,
                children : new Array()
            });
            this.getRootNode().appendChild(resourceNode);
        } else {
            // Insert new row for project
            resourceNode = this.getResourceObjByRow(newResourceId + '');
        }
        var projectRow = Ext4.create('PSA.RA.Model.GridResource', {
            Id : newResourceId + '~' + newProjectId,
            Name : projectData.name,
            resourceId : newResourceId,
            resourceName : resourceData.name,
            projectId : newProjectId,
            projectName : projectData.name,
            comment : null,
            expandable : false,
            children : new Array()
        });
        resourceNode.appendChild(projectRow);
    },
    allDataParams : {
        showAllResources : 'F', // T or F
        assigneesFilter : '', // comma separated ids
        customersFilter : '', // comma separated ids
        projectsFilter : '', // comma separated ids
        tasksFilter : '', // comma separated ids
        parentsFilter : '', // comma separated ids
        taskDateOperator : '', 
        taskDateValue1 : '', 
        taskDateValue2 : '', 
        assignDateOperator : '', 
        assignDateValue1 : '', 
        assignDateValue2 : '', 
        includeInactive : 'F',
        selectedResources : '',
        limit : 20,
        start : 0
    },
    getParams : function() {
        return this.allDataParams;
    },
    cloneParams : function() {
        return JSON.parse(JSON.stringify(this.allDataParams));
    }
});
Ext4.define('PSA.RA.Store.Allocation', {
    extend : 'Sch.data.EventStore',
    model : 'PSA.RA.Model.GridAllocation',
    nextId : 0,
    nextAllocId : -1,
    isLoaded : false,
    listeners : {
        load : function(store, records, success) {
            if (success) store.isLoaded = true;
        }
    },
    proxy : {
        type : 'memory',
        reader : {
            type : 'json',
            root : 'data',
            idProperty : 'allocationId'
        }
    },
    isRollUpOverlap : function(aStart, aEnd, bStart, bEnd) {
        return (aStart == bStart || aEnd == bEnd || (aStart < bStart && aEnd > bEnd));
    },
    isOverlap : function(aStart, aEnd, bStart, bEnd) {
        return !((aStart <= bStart && aEnd <= bStart) || (aStart >= bEnd && aEnd >= bEnd));
    },
    refreshAllRollUps : function() {
        var allIds = new Array();
        PSA.RA.dataStores.chartResource.getRootNode().cascadeBy(function(node) {
            var resourceId = node.get('Id');
            if (node.get('details').type == 'resource' && Ext4.Array.indexOf(allIds, resourceId) == -1) allIds.push(resourceId);
        });
        var allRollUps = new Array();
        for ( var i = 0; i < allIds.length; i++) {
            allRollUps = allRollUps.concat(this.refreshRollUpsByResource(allIds[i], true));
        };
        this.loadData(allRollUps, true);
    },
    refreshRollUpsByResource : function(resourceId, bulk) {
        //        var resource = PSA.RA.dataStores.chartResource.getResourceObjById(resourceId);
        var events = new Array();
        var endPts = new Array();
        var rollups = new Array();
        var forDelete = new Array();
        // Prepare data; indices for deletion, event (allocation) objects, end points (start and end dates from event objects) 
        for ( var i = 0; i < this.getCount(); i++) {
            var event = this.getAt(i);
            if (Ext4.Array.indexOf(event.get('ResourceId').split('~'), resourceId) == 0) {
                if (event.get('isRollUp')) { // If this is a roll-up, then delete this event xxx
                    forDelete.push(i);
                    //} else if (event.get('approvalStatus') == 6) {
                    // ignore rejected allocations
                } else {
                    events.push(event);
                    var start = event.get('StartDate').getTime(); // Convert to milliseconds format
                    var end = event.get('EndDate').getTime(); // Convert to milliseconds format
                    if (Ext4.Array.indexOf(endPts, start) == -1) endPts.push(start); // Insert start date, prevent duplicates
                    if (Ext4.Array.indexOf(endPts, end) == -1) endPts.push(end); // Insert end date, prevent duplicates
                }
            }
        };
        // Delete old roll-ups from store
        for ( var i = forDelete.length - 1; i >= 0; i--) {
            this.removeAt(forDelete[i]);
        }
        // Sort end points; important for next process
        endPts.sort();
        // Create new roll-ups; for each end point interval, create a roll-up object, find matching events and add up to total percentage & hours
        for ( var i = 0; i < endPts.length - 1; i++) {
            var total = 0;
            for ( var j = 0; j < events.length; j++) {
                var event = events[j];
                var start = event.get('StartDate').getTime();
                var end = event.get('EndDate').getTime();
                if (this.isRollUpOverlap(start, end, endPts[i], endPts[i + 1])) {
                    total += Number(event.get('units'));
                }
            }
            if (total) {
                var rollup = Ext4.create('PSA.RA.Model.GridAllocation', {
                    Id : 'rollup' + this.nextId++,
                    Name : '',
                    StartDate : Ext4.Date.clearTime(new Date(endPts[i])),
                    EndDate : Ext4.Date.clearTime(new Date(endPts[i + 1])),
                    trueEndDate : Ext4.Date.clearTime(new Date(endPts[i + 1] - 86400000)),
                    ResourceId : resourceId,
                    units : total,
                    isRollUp : true,
                    Draggable : false,
                    Resizable : false
                });
                rollups.push(rollup);
            }
        }
        //Traverse roll-ups and merge adjacent events that are both staffed, or both overbooked
        for ( var i = 0; i < rollups.length - 1; i++) {
            var a = rollups[i];
            var b = rollups[i + 1];
            var compRowNumber = a.get('ResourceId') == b.get('ResourceId');
            var compEndStart = a.get('EndDate').getTime() == b.get('StartDate').getTime();
            var compValue = (a.get('units') <= 100 && b.get('units') <= 100) || (a.get('units') > 100 && b.get('units') > 100);
            if (compRowNumber && compEndStart && compValue) {
                a.set('EndDate', b.get('EndDate'));
                rollups.splice(i + 1, 1);
                i--;
            }
        }
        if (bulk) {
            var b = new Date().getTime();
            return rollups;
        } else {
            this.add(rollups, true);
        }
    },
    moveAllAllocations : function(prevResourceId, prevProjectId, newResourceId, newProjectId) {
        var resourceStore = PSA.RA.App.resourceStore;
        var oldRow = prevResourceId + '~' + prevProjectId;
        var newRow = newResourceId + '~' + newProjectId;
        var indicesFrom = new Array();
        var indicesTo = new Array();
        var projectData = PSA.RA.dataStores.projectStore.data.get(newProjectId).raw;
        var resourceData = PSA.RA.dataStores.resourceStore.data.get(newResourceId).raw;
        // Collect indices of affected nodes from both previous and new rows
        for ( var i = 0; i < this.getCount(); i++) {
            var rowId = this.getAt(i).get('ResourceId');
            if (rowId == oldRow) indicesFrom.push(i);
            if (rowId == newRow) indicesTo.push(i);
        }
        if (!resourceStore.isRowExists(newRow)) {
            resourceStore.addNewResourceProjectRow(newResourceId, newProjectId);
        } else {
            // Find overlap; if at least 1 overlap is encountered, then do not proceed with moving
            for ( var i = 0; i < indicesFrom.length; i++) {
                var eventFrom = this.getAt(indicesFrom[i]);
                var fromStart = eventFrom.get('StartDate').getTime();
                var fromEnd = eventFrom.get('EndDate').getTime();
                for ( var j = 0; j < indicesTo.length; j++) {
                    var eventTo = this.getAt(indicesTo[j]);
                    var toStart = eventTo.get('StartDate').getTime();
                    var toEnd = eventTo.get('EndDate').getTime();
                    if (this.isOverlap(fromStart, fromEnd, toStart, toEnd)) return 'overlap';
                }
                // Also check for overlap in non-working days
                if (!PSA.RA.App.isStartEndValid(new Date(fromStart), new Date(fromEnd), newResourceId)) return 'nonworking';
            }
        }
        // Proceed to moving nodes
        for ( var i = 0; i < indicesFrom.length; i++) {
            // Update EventStore
            var event = this.getAt(indicesFrom[i]);
            event.set('ResourceId', newRow);
            event.set('resourceId', newResourceId);
            event.set('projectId', newProjectId);
            event.set('tipResource', resourceData.name);
            event.set('tipProject', projectData.name);
            if (PSA.RA.dataStores.featureStore.getById('approvalWorkFlow').get('isEnabled')) {
                event.set('approvalStatus', PSA.RA.App.pendingApproval); // always set to Pending
                event.set('tipAppStatus', PSA.RA.dataStores.appStatusStore.getById(PSA.RA.App.pendingApproval).get('name'));
            }
        }
        // Refresh rollups for previous resource
        this.refreshRollUpsByResource(prevResourceId);
        // If new resource is different from previous, then refresh rollups for the new resource, too
        if (prevResourceId != newResourceId) {
            this.refreshRollUpsByResource(newResourceId);
        }
        this.modCounter();
        return 'success';
    },
    createNewAllocation : function(newAllocUiObj) {
        var resourceStore = PSA.RA.App.resourceStore;
        var eventStore = PSA.RA.App.eventStore;
        var isValid = eventStore.validateRowAndOverlaps(newAllocUiObj.newResourceId, newAllocUiObj.newProjectId, newAllocUiObj.newStartDate.getTime(), newAllocUiObj.uiEndDate.getTime());
        if (!isValid) {
            alert(translatedStrings.getText('MESSAGE.ERROR.ALLOCATION_OVERLAP'));
            return false;
        }
        if (this.dateFormat == null) {
            this.dateFormat = convertNSDateFormat();
        }
        var projectData = PSA.RA.dataStores.projectStore.data.get(newAllocUiObj.newProjectId).raw;
        var resourceData = PSA.RA.dataStores.resourceStore.data.get(newAllocUiObj.newResourceId).raw;
        var type = PSA.RA.dataStores.allocTypeStore.data.get(newAllocUiObj.newAllocType).raw.name;
        // create event data model
        //        console.log('creating the event record. --> ');
        var allocation = Ext4.create('PSA.RA.Model.GridAllocation', {
            Id : eventStore.nextId++,
            Name : newAllocUiObj.newAllocateNum,
            StartDate : Ext4.Date.clearTime(newAllocUiObj.newStartDate),
            EndDate : Ext4.Date.clearTime(new Date(newAllocUiObj.newEndDate.getTime() + 86400000)),
            ResourceId : newAllocUiObj.newResourceId + '~' + newAllocUiObj.newProjectId,
            allocId : this.nextAllocId--,
            resourceId : newAllocUiObj.newResourceId,
            projectId : newAllocUiObj.newProjectId,
            hour : newAllocUiObj.newAllocateNum,
            percent : newAllocUiObj.newAllocateNum,
            unit : newAllocUiObj.newAllocBy,
            type : type,
            comment : newAllocUiObj.newComment,
            trueEndDate : newAllocUiObj.newEndDate.format('Y-m-d'),
            tipResource : resourceData.name,
            tipProject : projectData.name,
            tipStart : newAllocUiObj.newStartDate.format(this.dateFormat),
            tipEnd : newAllocUiObj.newEndDate.format(this.dateFormat)
        });
        if (PSA.RA.dataStores.featureStore.getById('approvalWorkFlow').get('isEnabled')) {
            //            console.log('approvalWorkFlow --> enabled');
            var approver = parseInt(newAllocUiObj.newApprover);
            var appstatus = newAllocUiObj.newAppStatus;
            allocation.set('approvalStatus', appstatus);
            allocation.set('tipAppStatus', PSA.RA.dataStores.appStatusStore.getById(appstatus).get('name'));
            if (approver != null && approver != 0 && PSA.RA.dataStores.approverStore.getById(approver) != null) {
                allocation.set('nextApprover', approver);
                allocation.set('tipApprover', PSA.RA.dataStores.approverStore.getById(approver).get('name'));
            }
        }
        //        console.log('allocation.Id --> ' + allocation.get('Id'));
        //        console.log('allocation.Name --> ' + allocation.get('Name'));
        //        console.log('allocation.StartDate --> ' + allocation.get('StartDate'));
        //        console.log('allocation.EndDate --> ' + allocation.get('EndDate'));
        //        console.log('allocation.ResourceId --> ' + allocation.get('ResourceId'));
        //        console.log('allocation.allocId --> ' + allocation.get('allocId'));
        if (newAllocUiObj.newAllocBy == 1) {
            //TODO: create function to convert percentage to hours
        } else {
            allocation.computePercentage();
        }
        // add RA to grid.
        eventStore.add(allocation);
        // refresh roll up
        eventStore.refreshRollUpsByResource(allocation.get('resourceId'));
        eventStore.modCounter();
        return true;
    },
    getAllocsByResourceAndProject : function(resourceId, projectId) {
        var result = new Array();
        for ( var i = 0; i < this.getCount(); i++) {
            var alloc = this.getAt(i);
            if (alloc.get('resourceId') == resourceId && alloc.get('projectId') == projectId) {
                result.push(alloc);
            }
        }
        return result;
    },
    validateRowAndOverlaps : function(newResourceId, newProjectId, fromStart, fromEnd, allocId) {
        var resourceStore = PSA.RA.App.resourceStore;
        var newRow = newResourceId + '~' + newProjectId;
        //        console.log('validateRowAndOverlaps : newRow --> ' + newRow);
        // add to row
        if (!resourceStore.isRowExists(newRow)) {
            resourceStore.addNewResourceProjectRow(newResourceId, newProjectId);
        } else {
            // Project/Resource exists
            // check for overlap
            var indicesTo = new Array();
            // Collect indices of affected nodes from both previous and new rows
            for ( var i = 0; i < this.getCount(); i++) {
                var event = this.getAt(i);
                var rowId = event.get('ResourceId');
                if (allocId != null && event.get('allocId') == allocId) {
                    continue;
                }
                if (rowId == newRow) indicesTo.push(i);
            }
            for ( var j = 0; j < indicesTo.length; j++) {
                var eventTo = this.getAt(indicesTo[j]);
                var toStart = eventTo.get('StartDate').getTime();
                var toEnd = eventTo.get('EndDate').getTime();
                //                console.log(indicesTo.length + ' - Possible Overlaps - ' + new Date(fromStart) + ':' + new Date(fromEnd));    
                //                console.log(j + ' > Possible Overlaps - ' + new Date(toStart) + ':' + new Date(toEnd));
                //                console.log(' ');
                if (this.isOverlap(fromStart, fromEnd, toStart, toEnd)) { return false; }
            }
        }
        return true;
    },
    areThereChanges : function() {
        if (PSA.RA.App.eventStore.getModifiedRecords().filter(function(element, index, array) { // new and updated
            return element.get('allocId') != 0;
        }).length == 0 && PSA.RA.App.eventStore.getRemovedRecords().filter(function(element, index, array) {
            return element.get('allocId') != 0;
        }).length == 0) { return false; }
        return true;
    }
});
Ext4.define('PSA.RA.Store.Settings', {
    extend : 'Ext4.data.JsonStore',
    model: 'PSA.RA.Model.Settings',
    autoLoad : true,
    listeners : {
        load : function(store, records, success) {
            if (success) {
                store.isLoaded = true;
                PTM.Settings = store.getAt(0);
            }
        }
    },
    getLimit : function() {
        var chartDensity = this.getAt(0).get('chartDensity');
        var resPerPage;
        switch (chartDensity) {
            case 1:
                resPerPage = 25;
                break;
            case 2:
                resPerPage = 20;
                break;
            case 3:
                resPerPage = 15;
                break;
        }
        return resPerPage;
    }
});
Ext4.define('PSA.RA.Store.GenericDropDown', {
    extend : 'Ext4.data.JsonStore',
    autoLoad : true,
    idProperty : 'id',
    root : 'data',
    constructor : function(config) {
        Ext4.apply(config, {
            proxy : {
                type : 'rest',
                url : config.url,
                reader : {
                    type : 'json',
                    root : 'data',
                    idProperty : 'id'
                },
                appendId : false
            }
        });
        this.callParent([
            config
        ]);
    }
});
Ext4.define('PSA.RA.Store.DropDown', {
    extend : 'PSA.RA.Store.GenericDropDown',
    model : 'PSA.RA.Model.DropDown'
});
Ext4.define('PSA.RA.Store.PageDropDown', {
    extend : 'PSA.RA.Store.DropDown',
    model : 'PSA.RA.Model.PageDropDown'
});
Ext4.define('PSA.RA.Store.Permissions', {
    extend : 'Ext4.data.JsonStore',
    model : 'PSA.RA.Model.Permission',
    autoLoad : true,
    restful : true,
    idProperty : 'name',
    root : 'data',
    constructor : function(config) {
        Ext4.apply(config, {
            proxy : {
                type : 'rest',
                url : config.url,
                reader : {
                    type : 'json',
                    root : 'data'
                }
            }
        });
        this.callParent([
            config
        ]);
    }
});
Ext4.define('PSA.RA.Store.ExportResource', {
    extend : 'Sch.data.ResourceTreeStore',
    model : 'PSA.RA.Model.GridResource',
    folderSort : true,
    proxy : {
        type : 'rest',
        url : '/app/site/hosting/restlet.nl?script=customscript_ptm_project_task_data&deploy=customdeploy_ptm_project_task_data&isResource=T&is_json=F&',
        reader : {
            type : 'json'
        }
    },
    listeners : {
        beforeload : function(store) {
            store.isLoaded = false;
        },
        load : function(store, root, childNodes, success) {
            if (success) {
                store.isLoaded = true;
                PSA.RA.App.exportFile();
            }
        }
    }
});
Ext4.define('PSA.RA.Store.ExportAllocations', {
    extend : 'Sch.data.EventStore',
    model : 'PSA.RA.Model.GridAllocation',
    proxy : {
        type : 'rest',
        url : '/app/site/hosting/restlet.nl?script=customscript_ptm_project_task_data&deploy=customdeploy_ptm_project_task_data&isResource=F&is_json=F&',
        reader : {
            type : 'json',
            root : 'data'
        }
    },
    listeners : {
        beforeload : function(store) {
            store.isLoaded = false;
        },
        load : function(store, childNodes, success) {
            if (success) {
                store.isLoaded = true;
                PSA.RA.App.exportFile();
            }
        }
    }
});
PSA.RA.dataStores = {
    isLoaded : function() {
        var ready = true;
        
        var requiredStores = [
              'settingStore', 'savedFiltersStore'
//              , 'filterCustomer', 'filterProject' , 'filterProjectTask', 'filterParentTask'
        ];
        for ( var i = 0; i < requiredStores.length; i++) {
            if (!Ext4.StoreManager.get(requiredStores[i]).isLoaded) {
                // console.log(requiredStores[i] + ' still loading');
                ready = false;
            }
        }
        
        return ready;
    },
    permissionStore : Ext4.create('PSA.RA.Store.Permissions', {
        id : 'permissionStore',
        url : '/app/site/hosting/restlet.nl?script=customscript_ptm_permissions&deploy=customdeploy_ptm_permissions&is_json=F',
        editTask : function () {
            return this.getById('editTask').get('allowed');
        },
        viewChart : function () {
            return this.getById('viewChart').get('allowed');
        },
        featureCheck : function () {
            var text = new Array();
            
            var ap = this.getById('advancedProjects').get('allowed');
            var cr = this.getById('customRecords').get('allowed');
            var cs = this.getById('clientScript').get('allowed');
            var ss = this.getById('serverScript').get('allowed');
            
            if (!ap) text.push(translatedStrings.getText('FEATURE.ADVANCED_PROJECTS'));
            if (!cr) text.push(translatedStrings.getText('FEATURE.CUSTOM_RECORDS'));
            if (!cs) text.push(translatedStrings.getText('FEATURE.CLIENT_SUITESCRIPTS'));
            if (!ss) text.push(translatedStrings.getText('FEATURE.SERVER_SUITESCRIPTS'));
            
            return text;
        }
    }),
    settingStore : Ext4.create('PSA.RA.Store.Settings', {
        id : 'settingStore',
        model : 'PSA.RA.Model.Settings',
        proxy : {
            type : 'rest',
            url : '/app/site/hosting/restlet.nl?script=customscript_ptm_settings&deploy=customdeploy_ptm_settings',
            reader : {
                type : 'json',
                root : 'data'
            },
            appendId : false
        },
        listeners : {
            load : function(store, records, success) {
                if (success) {
                    // set global setting model
                    store.isLoaded = true;
                    PTM.Settings = store.getAt(0);
                }
            }
        }
    }),
    savedFilters : Ext4.create('PSA.RA.Store.GenericDropDown', {
        id : 'savedFiltersStore',
        url : '/app/site/hosting/restlet.nl?script=customscript_ptm_saved_filters&deploy=customdeploy_ptm_saved_filters',
        model : 'PSA.RA.Model.SavedFilter',
        getLoadParameters : function(filterRecord, settingData) {
            var me = this, 
                allDataParams = PSA.RA.dataStores.chartResource.allDataParams;
            
            if (filterRecord) {
                allDataParams.showAllResources = filterRecord.get('includeAllResources') ? 'T' : 'F';
                allDataParams.includeInactive = filterRecord.get('includeInactive') ? 'T' : 'F';
                
                allDataParams.assigneesFilter = filterRecord.get('assignees') || '';
                allDataParams.customersFilter = filterRecord.get('customers') || '';
                allDataParams.projectsFilter = filterRecord.get('projects') || '';
                allDataParams.tasksFilter = filterRecord.get('projectTasks') || '';
                allDataParams.parentsFilter = filterRecord.get('parentTasks') || '';
                allDataParams.taskDateOperator = filterRecord.get('taskDateOperator') || null;
                allDataParams.taskDateValue1 = filterRecord.get('taskDateValue1') || null;
                allDataParams.taskDateValue2 = filterRecord.get('taskDateValue2') || null;
                allDataParams.assignDateOperator = filterRecord.get('assignDateOperator') || null;
                allDataParams.assignDateValue1 = filterRecord.get('assignDateValue1') || null;
                allDataParams.assignDateValue2 = filterRecord.get('assignDateValue2') || null;
            }
            else {
                allDataParams.showAllResources = 'F';
                allDataParams.includeInactive = 'F';
                
                allDataParams.assigneesFilter = '';
                allDataParams.customersFilter = '';
                allDataParams.projectsFilter = '';
                allDataParams.tasksFilter = '';
                allDataParams.parentsFilter = '';
                allDataParams.taskDateOperator = null;
                allDataParams.taskDateValue1 = null;
                allDataParams.taskDateValue2 = null;
                allDataParams.assignDateOperator = null;
                allDataParams.assignDateValue1 = null;
                allDataParams.assignDateValue2 = null;
            }
            
            return allDataParams;
        },
        isNameExists : function(name, isAdd, selectedId) {
            var store = this, 
                defaultName = store.getById(0).get('name'); // - Default -
            if (name.toUpperCase() == defaultName.toUpperCase()) { return true; }
            var record = store.findRecord('filterName', name);
            if (record && record.get('filterName').toUpperCase() == name.toUpperCase() && record.get('owner') == nlapiGetContext().user) {
                if (isAdd) {
                    // name exists!
                    return true;
                }
                if (record.get('id') != selectedId) { return true; }
            }
            return false;
        }
    }),
    filterAssignee : Ext4.create('PSA.RA.Store.DropDown', {
        id : 'filterAssignee',
        url : '/app/site/hosting/restlet.nl?script=customscript_ptm_ss_list_data&deploy=customdeploy_ptm_ss_list_data&is_json=F&searchType=assignee'
    }),
    filterCustomer : Ext4.create('PSA.RA.Store.DropDown', {
        id : 'filterCustomer',
        url : '/app/site/hosting/restlet.nl?script=customscript_ptm_ss_list_data&deploy=customdeploy_ptm_ss_list_data&is_json=F&searchType=customer'
    }),
    filterProject : Ext4.create('PSA.RA.Store.DropDown', {
        id : 'filterProject',
        url : '/app/site/hosting/restlet.nl?script=customscript_ptm_ss_list_data&deploy=customdeploy_ptm_ss_list_data&is_json=F&searchType=project',
        listeners : {
            load : function(store, childNodes, success) {
                store.data.sort();
            }
        }
    }),
    filterProjectTask : Ext4.create('PSA.RA.Store.DropDown', {
        id : 'filterProjectTask',
        url : '/app/site/hosting/restlet.nl?script=customscript_ptm_ss_list_data&deploy=customdeploy_ptm_ss_list_data&is_json=F&searchType=projecttask'
    }),
    filterParentTask : Ext4.create('PSA.RA.Store.DropDown', {
        id : 'filterParentTask',
        url : '/app/site/hosting/restlet.nl?script=customscript_ptm_ss_list_data&deploy=customdeploy_ptm_ss_list_data&is_json=F&searchType=parenttask'
    }),
    chartResource : Ext4.create('PSA.RA.Store.Resource', {
        id : 'chartResource',
        model : 'PSA.RA.Model.GridResource',
        folderSort : true,
        proxy : {
            type : 'rest',
            url : '/app/site/hosting/restlet.nl?script=customscript_ptm_project_task_data&deploy=customdeploy_ptm_project_task_data&isResource=T&is_json=F&',
            reader : {
                type : 'json'
            },
            listeners : {
                exception : function (proxy, response, operation, eOpts) {
                    if (response.request.timedout) {
                        alert(translatedStrings.getText('MESSAGE.ERROR.REFINE_FILTER'));
                    }
                }
            }
        }
    }),
    chartEvent : Ext4.create('PSA.RA.Store.Allocation', {
        id : 'chartEvents',
        model : 'PSA.RA.Model.GridAllocation',
        proxy : {
            type : 'rest',
            url : '/app/site/hosting/restlet.nl?script=customscript_ptm_project_task_data&deploy=customdeploy_ptm_project_task_data&isResource=F&is_json=F',
            reader : {
                type : 'json',
                root : 'data'
            },
            listeners : {
                exception : function (proxy, response, operation, eOpts) {
                    if (response.request.timedout) {
                        alert(translatedStrings.getText('MESSAGE.ERROR.REFINE_VIEW'));
                    }
                }
            }
        },
        modCounter : function() {
            var modCount = PSA.RA.App.eventStore.getModifiedRecords().filter(function(element, index, array) {
                return element.get('allocId') != 0;
            }).length + PSA.RA.App.eventStore.getRemovedRecords().filter(function(element, index, array) {
                return element.get('allocId') != 0;
            }).length;
            if (modCount >= PSA.RA.App.maxUpdatesToSave) {
                alert(translatedStrings.getText('MESSAGE.WARNING.NUMBER_OF_UPDATES') + ' ' + modCount + ' ' + translatedStrings.getText('MESSAGE.WARNING.PLEASE_SAVE_CHANGES'));
            }
            //Ext4.getCmp('advFilterMain').disableFilter();
        },
        listeners : {
            load : function(store, records, success) {
                store.refreshAllRollUps();
                Ext4.getCmp('ra-page-combo-box').setDisabled(false);
                Ext4.getCmp('ra-prevPage').setDisabled(false);
                Ext4.getCmp('ra-nextPage').setDisabled(false);
                perfTestLogger.stop();
            },
            remove : function(store, record, index, eOpts) {
                record.set('Id', 0);
            }
        }
    }),
    chartEventSaver : Ext4.create('PSA.RA.Store.Allocation', {
        id : 'chartEventSaver',
        model : 'PSA.RA.Model.GridAllocation',
        proxy : {
            type : 'rest',
            url : '/app/site/hosting/restlet.nl?script=customscript_ptm_project_task_data&deploy=customdeploy_ptm_project_task_data&isResource=F&is_json=F',
            reader : {
                type : 'json',
                root : 'data'
            },
            appendId : false
        },
        transferModifiedRecords : function() {
            var me = this, store = PSA.RA.App.eventStore, updated = store.getModifiedRecords().filter(function(element, index, array) {
                return (!element.get('isRollUp'));
            }), deleted = store.getRemovedRecords().filter(function(element, index, array) {
                return (!element.get('isRollUp'));
            });
            me.loadData(updated, false);
            me.loadData(deleted, true);
        }
    }),
    popupResourceStore : Ext4.create('PSA.RA.Store.DropDown', {
        id : 'resourceStore',
        autoLoad : true,
        model : 'PSA.RA.Model.ResourcePopup',
        url : '/app/site/hosting/restlet.nl?script=customscript_ptm_ss_list_data&deploy=customdeploy_ptm_ss_list_data&is_json=F&&searchType=projectresource',
        prevProjectId : 0,
        loadWithFilters : function(resourceId, projectId, taskId, assigneesFilter, isProjectTemplate) {
            var params = PSA.RA.dataStores.chartResource.cloneParams();
            params.selectedResource = resourceId;
            params.selectedProject = projectId;
            params.selectedTask = taskId;
            params.assigneesFilter = assigneesFilter;
            params.isProjectTemplate = isProjectTemplate;
            
            this.prevProjectId = projectId;
            
            this.load({
                params : params
            });
        }
    }),
    popupGenericStore : Ext4.create('PSA.RA.Store.DropDown', {
        id : 'genericStore',
        autoLoad : false,
        model : 'PSA.RA.Model.ResourcePopup',
        url : '/app/site/hosting/restlet.nl?script=customscript_ptm_ss_list_data&deploy=customdeploy_ptm_ss_list_data&is_json=F&&searchType=genericresource',
        prevProjectId : 0,
        loadWithFilters : function(resourceId, projectId, taskId, assigneesFilter, isProjectTemplate) {
            var params = {};
            params.selectedResource = resourceId;
            params.selectedProject = projectId;
            params.selectedTask = taskId;
            params.assigneesFilter = assigneesFilter;
            params.isProjectTemplate = isProjectTemplate;
            
            this.prevProjectId = projectId;
            
            this.load({
                params : params
            });
        }
    }),
    popupServiceItemStore : Ext4.create('PSA.RA.Store.DropDown', {
        id : 'serviceItemStore',
        url : '/app/site/hosting/restlet.nl?script=customscript_ptm_ss_list_data&deploy=customdeploy_ptm_ss_list_data&is_json=F&&searchType=serviceitem'
    }),
    pageStore : Ext4.create('PSA.RA.Store.PageDropDown', {
        //TODO: For performance gain, find a way to get the dropdown values using the resource search, rather than calling another restlet and performing another search
        id : 'pageStore',
        autoLoad : false,
        url : '/app/site/hosting/restlet.nl?script=customscript_ptm_project_task_data&deploy=customdeploy_ptm_project_task_data&isResource=T&isPaging=T&is_json=F&',
        listeners : {
            load : function (store, records) {
                var combo = Ext4.getCmp('ra-page-combo-box');
                if (combo && combo.getValue() == null) {
                    // set default value
                    combo.setValue(0);
                    
                    // find longest option
                    var maxWidth = 0;
                    records.forEach(function(option) {
                        var width = PSA.RA.TextMetrics12px.getSize(option.data.name).width;
                        if(width > maxWidth) maxWidth = width;
                    });
                    // set combobox width (should respect maxWidth 500px)
                    combo.setWidth(maxWidth);
                }
            }
        }
    }),
    largeDataRangeResourceStore : Ext4.create('PSA.RA.Store.GenericDropDown', {
        id : 'largeDataRangeResourceStore',
        model : 'PSA.RA.Model.LargeDataDropdownRange',
        autoLoad : true,
        url : '/app/site/hosting/restlet.nl?script=customscript_ptm_ss_list_data&deploy=customdeploy_ptm_ss_list_data&is_json=F&range=T&&searchType=projectresource'
    }),
    largeDataRangeGenericResourceStore : Ext4.create('PSA.RA.Store.GenericDropDown', {
        id : 'largeDataRangeResourceStore',
        model : 'PSA.RA.Model.LargeDataDropdownRange',
        autoLoad : true,
        url : '/app/site/hosting/restlet.nl?script=customscript_ptm_ss_list_data&deploy=customdeploy_ptm_ss_list_data&is_json=F&range=T&&searchType=genericresource'
    }),
    largeDataRangeServiceItemStore : Ext4.create('PSA.RA.Store.GenericDropDown', {
        id : 'largeDataRangeServiceItemStore',
        model : 'PSA.RA.Model.LargeDataDropdownRange',
        autoLoad : true,
        url : '/app/site/hosting/restlet.nl?script=customscript_ptm_ss_list_data&deploy=customdeploy_ptm_ss_list_data&is_json=F&range=T&&searchType=serviceitem'
    }),
    largeDataRangeAssigneeStore : Ext4.create('PSA.RA.Store.GenericDropDown', {
        id : 'largeDataRangeAssigneeStore',
        model : 'PSA.RA.Model.LargeDataDropdownRange',
        autoLoad : true,
        url : '/app/site/hosting/restlet.nl?script=customscript_ptm_ss_list_data&deploy=customdeploy_ptm_ss_list_data&is_json=F&range=T&searchType=assignee'
    }),
    largeDataRangeCustomerStore : Ext4.create('PSA.RA.Store.GenericDropDown', {
        id : 'largeDataRangeCustomerStore',
        model : 'PSA.RA.Model.LargeDataDropdownRange',
        autoLoad : true,
        url : '/app/site/hosting/restlet.nl?script=customscript_ptm_ss_list_data&deploy=customdeploy_ptm_ss_list_data&is_json=F&range=T&searchType=customer'
    }),
    largeDataRangeProjectStore : Ext4.create('PSA.RA.Store.GenericDropDown', {
        id : 'largeDataRangeProjectStore',
        model : 'PSA.RA.Model.LargeDataDropdownRange',
        autoLoad : true,
        url : '/app/site/hosting/restlet.nl?script=customscript_ptm_ss_list_data&deploy=customdeploy_ptm_ss_list_data&is_json=F&range=T&searchType=project'
    }),
    largeDataRangeTaskStore : Ext4.create('PSA.RA.Store.GenericDropDown', {
        id : 'largeDataRangeTaskStore',
        model : 'PSA.RA.Model.LargeDataDropdownRange',
        autoLoad : true,
        url : '/app/site/hosting/restlet.nl?script=customscript_ptm_ss_list_data&deploy=customdeploy_ptm_ss_list_data&is_json=F&range=T&searchType=projecttask'
    }),
    largeDataRangeParentTaskStore : Ext4.create('PSA.RA.Store.GenericDropDown', {
        id : 'largeDataRangeParentTaskStore',
        model : 'PSA.RA.Model.LargeDataDropdownRange',
        autoLoad : true,
        url : '/app/site/hosting/restlet.nl?script=customscript_ptm_ss_list_data&deploy=customdeploy_ptm_ss_list_data&is_json=F&range=T&searchType=parenttask'
    }),
    largeDataSelectedStore : Ext4.create('Ext4.data.ArrayStore', {
        storeId : 'largeDataSelectedStore',
        model : 'PSA.RA.Model.DropDown',
        autoLoad : false,
        idProperty : 'id',
        root : 'data',
        proxy : {
            type: 'ajax',
            reader: {
                type: 'json',
                root: 'data'
            }
        }
    }),
    largeDataResourceTempStore : Ext4.create('Ext4.data.ArrayStore', {
        storeId : 'largeDataResourceTempStore',
        model : 'PSA.RA.Model.ResourcePopup',
        idProperty : 'id',
        autoLoad : false
    }),
    largeDataGenericResourceTempStore : Ext4.create('Ext4.data.ArrayStore', {
        storeId : 'largeDataGenericResourceTempStore',
        model : 'PSA.RA.Model.ResourcePopup',
        idProperty : 'id',
        autoLoad : false
    }),
    largeDataServiceItemTempStore : Ext4.create('Ext4.data.ArrayStore', {
        storeId : 'largeDataServiceItemTempStore',
        model : 'PSA.RA.Model.DropDown',
        idProperty : 'id',
        autoLoad : false
    }),
    largeDataAssigneeTempStore : Ext4.create('Ext4.data.ArrayStore', {
        storeId : 'largeDataAssigneeTempStore',
        model : 'PSA.RA.Model.DropDown',
        idProperty : 'id',
        autoLoad : false
    }),
    largeDataCustomerTempStore : Ext4.create('Ext4.data.ArrayStore', {
        storeId : 'largeDataCustomerTempStore',
        model : 'PSA.RA.Model.DropDown',
        idProperty : 'id',
        autoLoad : false
    }),
    largeDataProjectTempStore : Ext4.create('Ext4.data.ArrayStore', {
        storeId : 'largeDataProjectTempStore',
        model : 'PSA.RA.Model.DropDown',
        idProperty : 'id',
        autoLoad : false
    }),
    largeDataTaskTempStore : Ext4.create('Ext4.data.ArrayStore', {
        storeId : 'largeDataTaskTempStore',
        model : 'PSA.RA.Model.DropDown',
        idProperty : 'id',
        autoLoad : false
    }),
    largeDataParentTaskTempStore : Ext4.create('Ext4.data.ArrayStore', {
        storeId : 'largeDataParentTaskTempStore',
        model : 'PSA.RA.Model.DropDown',
        idProperty : 'id',
        autoLoad : false
    }),
    expResourceStore : Ext4.create('PSA.RA.Store.ExportResource'),
    expAllocStore : Ext4.create('PSA.RA.Store.ExportAllocations')
};