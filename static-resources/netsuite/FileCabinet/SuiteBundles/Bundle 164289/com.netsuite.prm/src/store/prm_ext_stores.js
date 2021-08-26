/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
 
Ext4.define('PRM.Store.Base', {
    extend : 'Ext4.data.JsonStore',
    clientId : 1,
    autoLoad : false,
    constructor : function(config) {
        Ext4.apply(config, {
            proxy : {
                type : 'rest',
                url : config.url,
                reader : {
                    type : 'json',
                    root : 'data',
                    idProperty : 'id',
                    messageProperty : 'message'
                },
                appendId : false
            }
        });
        this.callParent([
            config
        ]);
    },
    getSelectedRecord : function (recordId) {
        return this.getById(recordId);
    },
    getSelectedRecordByName : function (name) {
        return this.findRecord('name', name);
    },
    loadWithFilters : function() {
        this.load({
            params : this.filterParams
        });
    },
    updateAndSyncRecord : function(record, values) {
        try {
            record.beginEdit();
            for (i in values) {
                record.set(i, values[i]);
            }
            record.endEdit();
            this.sync();
        } catch(err) {
            console.log('error in updateAndSyncRecord');
        }
    }
});

Ext4.define('PRM.Store.Grid', {
    extend: 'Ext4.data.TreeStore',
    model: 'PRM.Model.Grid',
    autoLoad: false,
    proxy: {
        type: 'ajax',
        api: {
            read: nlapiResolveURL('SUITELET', 'customscript_prm_sl_get_project_data', 'customdeploy_prm_sl_get_project_data')
        },
        reader : {
            type : 'json',
            successProperty : 'success'
        }
    },
    root : {
        expanded : false
    },
    getRowById : function(rowNum) {
        var rnode = null;
        this.getRootNode().cascadeBy(function(node) {
            if (node.get('id') == rowNum) {
                rnode = node;
                return false;
            }
        });
        return rnode;
    },
    filterParams : {},
    loadWithFilters : function(pageNum, projectId) {
        this.projectId = projectId;
        
        PRM.App.Grid.addMask();
        
        if (PRM.App.Grid.isHidden()) {
            PRM.App.Filter.show();
            PRM.App.Toolbar.show();
            PRM.App.Grid.show();
        }
        
        PRM.App.Stores.pageList.updatePage(pageNum);
        
        Ext4.apply(this.filterParams, PRM.App.Settings);
        this.load();
        
        if (!PRM.App.Settings.projectSearch) {
            Ext4.getCmp('prm-search-project-textbox').setValue('');
        }
    },
    getTaskNode : function (projectId, projectTaskId) {
        return this.getRowById([projectId, projectTaskId].join('~'));
    },
    getSummaryNode : function (projectId, resourceId) {
        return this.getRowById([projectId, 0, 0, resourceId].join('~'));
    },
    createAssignmentNode : function (assignmentData) {
        var workCalendarString = PRM.App.Stores.workCalendar.getByIdAsString(assignmentData.workCalendar);
        return Ext4.create('PRM.Model.Grid', {
            id: assignmentData.gridId,
            type: 'resource',
            leaf : true,
            name : assignmentData.resourceName,
            projectName : assignmentData.projectName,
            taskName : assignmentData.taskName,
            workCalendar : workCalendarString,
            hrsEstimated : assignmentData.estimatedWork,
            hrsWorked : assignmentData.hrsWorked,
            billingClassId : assignmentData.billingClassId,
            unitCost : assignmentData.unitCost,
            unitPrice : assignmentData.unitPrice,
            serviceItemId : assignmentData.serviceItemId,
            assignStartDate : assignmentData.assignStartDate,
            assignEndDate : assignmentData.assignEndDate,
            taskStartDate : assignmentData.taskStartDate,
            taskEndDate : assignmentData.taskEndDate,
            unitPct : assignmentData.unitPct,
            pctComplete : assignmentData.pctComplete,
            timeBills : assignmentData.timeBills
        });
    },
    addAssignment : function (assignmentData, projectId, projectTaskId, nodeIndex) {
        var taskNode = this.getTaskNode(projectId, projectTaskId);
        var assignmentNode = this.createAssignmentNode(assignmentData);
        taskNode.insertChild(nodeIndex || 0, assignmentNode);
    },
    removeAssignment : function (assignmentNode) {
        assignmentNode.parentNode.removeChild(assignmentNode);
    },
    addSummary : function (assignmentData, projectId, resourceId) {
        var summaryNode = {
                id : [ projectId, 0, 0, resourceId ].join('~'),
                type : 'resource-summary',
                name : assignmentData.resourceName,
                workCalendar : assignmentData.workCalendar,
                allocations : '[]',
                timeBills : '[]',
                leaf : true,
                expanded : true
        };
        this.getRowById(projectId).insertChild(0, summaryNode);
    },
    createRecurrencesByNode : function(node) {
        if (node) {
            if (node.data.type == 'resource-summary') {
                var allocations = null,
                    recurrences = [];
                
                try {
                    allocations = JSON.parse(node.data.allocations);
                } catch (err) {
                    allocations = [];
                }
                
                node.set('withRecurring', false);
                
                if (allocations.length) {
                    allocations = this.cleanRecurrences(allocations);
                    
                    for (i in allocations) {
                        var allocation = allocations[i];
                        
                        if (allocation.frequency && allocation.frequency != 'NONE') {
                            this.createAllocationRecurrences(allocation, recurrences);
                            node.set('withRecurring', true);
                        }
                    }
                    node.data.allocations = JSON.stringify(allocations.concat(recurrences));
                }
            }
            
            for (i in node.childNodes) {
                this.createRecurrencesByNode(node.childNodes[i]);
            }
        }
    },
    
    cleanRecurrences : function(allocations) {
        for (i in allocations) {
            if (allocations[i].isDummy) {
                delete allocations[i]; 
            }
        }
        
        return Ext4.Array.clean(allocations);
    },
    
    createAllocationRecurrences : function(alloc, recurrs) {
        var frequency        = alloc.frequency,
            period           = alloc.period,
            dayOfWeek        = alloc.dayOfWeek || '',
            dayOfWeekMask    = alloc.dayOfWeekMask || '',
            dayOfWeekInMonth = alloc.dayOfWeekInMonth || '',
            seriesStart      = new Date(alloc.seriesStartDate),
            seriesEnd        = new Date(alloc.seriesEndDate),
            allocStart       = new Date(alloc.startDate),
            allocDuration    = Ext4.Date.getElapsed(allocStart, new Date(alloc.endDate)) / 86400000,
            idIterator       = 0;
        
        switch (alloc.frequency) {
            case 'DAY':
                var baseAllocStart = seriesStart.getTime() > allocStart.getTime() ? seriesStart : allocStart;
                if (seriesStart.getTime() == allocStart.getTime()) {
                    baseAllocStart = Ext4.Date.add(baseAllocStart, Ext4.Date.DAY, period);
                } 
                while (baseAllocStart.getTime() <= seriesEnd.getTime()) {
                    if (baseAllocStart.getTime() == allocStart.getTime()) {
                        baseAllocStart = Ext4.Date.add(baseAllocStart, Ext4.Date.DAY, period);
                        continue;
                    }
                    var trueEndDate = Ext4.Date.add(baseAllocStart, Ext4.Date.DAY, allocDuration);
                    var r = this.createRecurrenceObject(alloc, idIterator++, baseAllocStart, trueEndDate);
                    recurrs.push(r);
                    baseAllocStart = Ext4.Date.add(baseAllocStart, Ext4.Date.DAY, period);
                }
                break;
            case 'WEEK':
                var baseAllocStart = seriesStart.getTime() > allocStart.getTime() ? seriesStart : allocStart,
                    currWeekSun    = Ext4.Date.subtract(baseAllocStart, Ext4.Date.DAY, Number(Ext4.Date.format(baseAllocStart, 'w'))),
                    seriesEndSun   = Ext4.Date.subtract(seriesEnd, Ext4.Date.DAY, Number(Ext4.Date.format(seriesEnd, 'w'))),
                    recurrFlags    = dayOfWeekMask.split('');
                
                do {
                    for (day in recurrFlags) {
                        var dayOfWeek = Ext4.Date.add(currWeekSun, Ext4.Date.DAY, day);
                        
                        if (dayOfWeek.getTime() < baseAllocStart.getTime()) continue;
                        if (dayOfWeek.getTime() == allocStart.getTime()) continue;
                        if (dayOfWeek.getTime() > seriesEnd.getTime()) break;
                        
                        if (recurrFlags[day] == 'T') {
                            var trueEndDate = Ext4.Date.add(dayOfWeek, Ext4.Date.DAY, allocDuration);
                            var r = this.createRecurrenceObject(alloc, idIterator++, dayOfWeek, trueEndDate);
                            recurrs.push(r);
                        }
                    }
                    currWeekSun = Ext4.Date.add(currWeekSun, Ext4.Date.DAY, 7 * period);
                    
                } while (currWeekSun.getTime() <= seriesEndSun.getTime());
                break;
            case 'MONTH':
                var baseAllocStart = seriesStart.getTime() > allocStart.getTime() ? seriesStart : allocStart,
                    currMonth      = baseAllocStart == allocStart ? Ext4.Date.add(baseAllocStart, Ext4.Date.MONTH, period) : baseAllocStart,
                    startDay       = baseAllocStart.getDate();
                
                if (dayOfWeekInMonth == -1) {
                    dayOfWeekInMonth = 5;
                }
                
                while (currMonth.getTime() <= seriesEnd.getTime()) {
                    if (dayOfWeek && dayOfWeekInMonth) {
                        var firstDay = (7 - (Ext4.Date.getFirstDayOfMonth(currMonth) - (dayOfWeek - 1))) % 7 + 1;
                        
                        startDay  = firstDay + (dayOfWeekInMonth - 1) * 7;
                        if (startDay > Ext4.Date.getDaysInMonth(currMonth)) { // adjustment for "last" (can be either 4th or 5th)
                            startDay -= 7;
                        }
                    }
                    
                    var startDate   = new Date([currMonth.getMonth() + 1, startDay, currMonth.getFullYear()].join('/')),
                        endDate     = Ext4.Date.add(startDate, Ext4.Date.DAY, allocDuration),
                        recurrAlloc = this.createRecurrenceObject(alloc, idIterator++, startDate, endDate);
                    
                    recurrs.push(recurrAlloc);
                    
                    currMonth = Ext4.Date.add(currMonth, Ext4.Date.MONTH, period);
                }
                break;
            case 'YEAR':
                var baseAllocStart = new Date(seriesStart.getTime() > allocStart.getTime() ? seriesStart : allocStart);
                if (dayOfWeek != '' && dayOfWeekInMonth != '') {
                    var month = seriesStart.getMonth(),
                        currentMonth = baseAllocStart.getMonth(),
                        nthDayMap = [];
                    baseAllocStart.setDate(1);
                    while (baseAllocStart.getTime() <= seriesEnd.getTime()) {
                        if (month == baseAllocStart.getMonth() && dayOfWeek == baseAllocStart.getDay() + 1) {
                            var nthDayArray = nthDayMap[baseAllocStart.getFullYear()] || [];
                            nthDayArray.push(baseAllocStart);
                            nthDayMap[baseAllocStart.getFullYear()] = nthDayArray;
                        }
                        if (currentMonth != baseAllocStart.getMonth()) {
                            baseAllocStart = Ext4.Date.subtract(baseAllocStart, Ext4.Date.DAY, period);
                            baseAllocStart.setDate(1);
                            baseAllocStart = Ext4.Date.add(baseAllocStart, Ext4.Date.YEAR, period);
                            currentMonth = baseAllocStart.getMonth();
                        } else {
                            baseAllocStart = Ext4.Date.add(baseAllocStart, Ext4.Date.DAY, period);
                        }
                    }
                    var r = {};
                    for (var yearKey in nthDayMap) {
                        var yearMap = nthDayMap[yearKey];
                        var dowim = dayOfWeekInMonth;
                        if (dayOfWeekInMonth == -1 || dayOfWeekInMonth == 5) {
                            dowim = yearMap.length;
                        }
                        var recurrenceStartDate = yearMap[dowim - 1];
                        if (recurrenceStartDate.getTime() > allocStart.getTime()) {
                            var trueEndDate = Ext4.Date.add(recurrenceStartDate, Ext4.Date.DAY, allocDuration);
                            r = this.createRecurrenceObject(alloc, idIterator++, recurrenceStartDate, trueEndDate);
                            recurrs.push(r);
                        }
                    }
                } else {
                    while (baseAllocStart.getTime() <= seriesEnd.getTime()) {
                        if (baseAllocStart.getTime() == allocStart.getTime()) {
                            baseAllocStart = Ext4.Date.add(baseAllocStart, Ext4.Date.DAY, period);
                            continue;
                        }
                        var trueEndDate = Ext4.Date.add(baseAllocStart, Ext4.Date.DAY, allocDuration);
                        var r = {};
                        if (baseAllocStart.getMonth() == seriesStart.getMonth() && baseAllocStart.getDate() == seriesStart.getDate()) {
                            r = this.createRecurrenceObject(alloc, idIterator++, baseAllocStart, trueEndDate);
                            recurrs.push(r);
                        }
                        baseAllocStart = Ext4.Date.add(baseAllocStart, Ext4.Date.DAY, period);
                    }
                }
                break;
            default:
                console.log('ERROR: Invalid frequency: ' + frequency);
                break;
        }
    },
    createRecurrenceObject : function(alloc, idIterator, startDate, endDate) {
        var clone = JSON.parse(JSON.stringify(alloc))
        
        clone.id = ['recurrence', clone.id, idIterator].join('~');
        clone.startDate = Ext4.Date.format(startDate, nsDateFormat);
        clone.endDate = Ext4.Date.format(endDate, nsDateFormat);
        clone.isDummy = true;
       
        return clone;
    },
    listeners : {
        beforeload : function(store, operation) {
            var node       = operation.node.raw;
                nodeParams = {
                    nodeId   : node.id,
                    nodeName : node.name,
                    nodeType : node.type
                };
            if (nodeParams.id == 'root') {
                PRM.App.Grid.addMask();
            }
            Ext4.apply(store.filterParams, nodeParams);
            Ext4.apply(operation.params, store.filterParams);
        },
        load : function(store, node, successful) {
            var root = store.getRootNode(),
                firstChildNode = (root && root.childNodes.length > 0) ? root.childNodes[0] : null,
                isNoResults = (!firstChildNode || firstChildNode.get('id') == '0');
            if (isNoResults){
                PRM.App.Grid.hidePagingControls();
            } else {
                PRM.App.Grid.enablePagingControls();
            }
            
            // create dummy allocation records for recurring allocations before expanding the root
            store.createRecurrencesByNode(node);
            
            root.expand();
            
            if (store.projectId) {
                var projectRow = PRM.App.Stores.gridStore.getRowById(store.projectId);
                delete store.projectId; // delete to prevent this code block from executing unnecessarily
                
                if (projectRow) { // it is possible that the new project row is in a different page, so check this before expanding
                    projectRow.expand();
                }
            }
            
            PRM.App.Grid.removeMask();
            
            PRM.Util.PerfLogs.stop('GRID_LOAD');
            
            PRM.App.Stores.loadRemaining();
        },
        remove : function(parentNode, removedNode, isMove) {
            var store = this;
            if (removedNode.isTask()) {
                /*
                 * Remove resource-summary counterparts
                 */
                var resourceNodes = removedNode.childNodes;
                
                if (resourceNodes) {
                    for (var i = 0; i < resourceNodes.length; i++) {
                        try {
                            var resourceNode = resourceNodes[i],
                                //throws an extjs bug when trying to remove a child node when the parent of that child node was already loaded and expanded
                                //hence, the try-catch
                                summaryNode = store.getRowById(resourceNode.getProjectId() + '~0~0~' + resourceNode.getResourceId()),
                                allocations = summaryNode ? JSON.parse(summaryNode.get('allocations')) : '',
                                        timeBills = summaryNode ? JSON.parse(summaryNode.get('timeBills')) : '';
                                    
                            if (summaryNode && allocations.length == 0 && timeBills.length == 0) {
                                summaryNode.remove();
                            }
                        } catch (e) {}
                    }
                }
            }
            
            if (parentNode.isProject() && parentNode.childNodes.length == 0) {
                parentNode.remove();
            }
            
        },
        beforeexpand : function(me) {
            PRM.App.Grid.suspendLayouts();
            if (!me.isLoaded() && me.get('type') == 'project') {
                new Ext4.util.DelayedTask(function() {
                    PRM.App.Grid.addNodeMask(me);
                }).delay(10);
            }
        },
        expand : function(me) {
            // for now it looks like the expanded node unmasks on its own, but keeping this code here just in case it stops working somehow...
            //if (!me.isLoaded() && me.get('type') == 'project') {
                //PRM.App.Grid.removeNodeMask(me);
            //}
            PRM.App.Grid.resumeLayouts(true);
        }
    }
});

Ext4.define('PRM.Store.List', {
    extend : 'PRM.Store.Base',
    model : 'PRM.Model.SimpleList'
});

Ext4.define('PRM.Store.Allocation', {
    extend : 'PRM.Store.Base',
    model : 'PRM.Model.Allocation'
});

Ext4.define('PRM.Store.Assignment', {
    extend : 'PRM.Store.Base',
    model : 'PRM.Model.Assignment'
});

PRM.App.Stores = {
    isRequiredLoaded : function() {
        var requiredStores = [ 'settings' ];
        for ( var i = 0; i < requiredStores.length; i++) {
            // use data.items and check the length since we knew these stores cannot be empty after loading
            if (!this[requiredStores[i]].data.items.length) {
                return false;
            }
        }
        return true;
    },
    loadRemaining : function() {
        var exclude = ['allocation', 'assignment', 'allocationSummary', 'assignmentSearch', 'resourceSearch'],
            rangeStores = ['resourceFilterDataRange', 'customerFilterDataRange', 
                           'projectFilterDataRange', 'taskFilterDataRange', 
                           'billingClassFilterDataRange', 'resourceDataRange', 
                           'projectDataRange', 'approverDataRange', 
                           'taskDataRange',
                           'resourceFilterSeletedStore', 'customerFilterSelectedStore', 
                           'projectFilterSelectedStore', 'taskFilterSelectedStore', 
                           'billingClassFilterSelectedStore', 'resourceSelectedStore', 
                           'projectSelectedStore', 'approverSelectedStore', 
                           'taskSelectedStore' ];
        
        for (store in PRM.App.Stores) {
            // use lastOptions for checking if store has already started loading (not necessarily completed loading)
            
            if (exclude.indexOf(store) > -1 || rangeStores.indexOf(store) > -1) continue;
            
            if (PRM.App.Stores[store].url && !PRM.App.Stores[store].lastOptions) {
                try {
                    PRM.App.Stores[store].load();
                } catch (err) {
                    console.log('=== error loading store: ' + store);
                }
            }
        }
    },
    reloadAll : function () {
        for (store in PRM.App.Stores) {
            if (store == 'allocation' || store == 'assignment') continue;
            if (PRM.App.Stores[store].url) {
                PRM.App.Stores[store].reload();
            }
        }
    },
    settings : Ext4.create('PRM.Store.List', {
        storeId: 'prm-store-settings',
        model : 'PRM.Model.Settings',
        autoLoad : true,
        url : nlapiResolveURL('SUITELET', 'customscript_prm_sl_settings', 'customdeploy_prm_sl_settings'),
        listeners : {
            load : function(store, records, successful) {
                var data = store.data.items[0];
                PRM.App.Settings = {};
                
                if (data) {
                    Ext4.apply(PRM.App.Settings, data.raw);
                }
                
                if (!PRM.App.Settings.lastUsedFilter) {
                    PRM.App.Settings.forceLoad = true;
                }
            }
        }
    }),
    feature :  Ext4.create('PRM.Store.List', {
        storeId: 'prm-store-feature',
        model : 'PRM.Model.Feature',
        autoLoad : true,
        url : nlapiResolveURL('SUITELET', 'customscript_prm_sl_feature_list', 'customdeploy_prm_sl_feature_list'),
        mapRequiredFeatures : {
            'projectManagement' : PRM.Translation.getText('FEATURE.PROJECT_MANAGEMENT'),
            'resourceAllocations' : PRM.Translation.getText('FEATURE.RESOURCE_ALLOCATION'),
            'customRecord' : PRM.Translation.getText('FEATURE.CUSTOM_RECORD'),
            'clientScript' : PRM.Translation.getText('FEATURE.CLIENT_SCRIPT'),
            'serverScript' : PRM.Translation.getText('FEATURE.SERVER_SCRIPT')
        },
        mapTimeFeatures : {
            'timeTracking' : PRM.Translation.getText('FEATURE.TIME_TRACKING'),
            'timesheets' : PRM.Translation.getText('FEATURE.TIMESHEETS')
        },
        createErrorMessage : function () {
            var message = '',
                disabledRequiredFeatures = [],
                disabledTimeFeatures = [];

            // loop through the feature list to check for disabled features
            for (var i = 0, ii = this.data.items.length; i < ii; i++){
                var featureObj  = this.data.items[i].data,
                    featureName = featureObj.name;
                if (this.mapTimeFeatures[featureName] && !featureObj.isEnabled)
                    disabledTimeFeatures.push(this.mapTimeFeatures[featureName]);
                else if (this.mapRequiredFeatures[featureName] && !featureObj.isEnabled)
                    disabledRequiredFeatures.push(this.mapRequiredFeatures[featureName]);
            }
            
            if (disabledTimeFeatures.length == Object.keys(this.mapTimeFeatures).length){
                // at least one time feature should be enabled
                disabledRequiredFeatures.push(disabledTimeFeatures.join(' or '));
            }            
            
            if (disabledRequiredFeatures.length > 0) {
                message =  PRM.Translation.getText('MESSAGE.ERROR.REQUIRED_FEATURES', disabledRequiredFeatures.join(', '));
            }
            
            return message;
        },
        isApprovalEnabled : function () {
            return this.getById('approvalWorkflow') && this.getById('approvalWorkflow').get('isEnabled');
        },
        isBillingClassEnabled : function () {
            return this.getById('billingClass').get('isEnabled');
        },
        isSubsidiaryEnabled : function () {
            return this.getById('subsidiary').get('isEnabled');
        },
        isJobCostingEnabled : function () {
            return this.getById('jobCosting').get('isEnabled');
        },
        disabledPrerequisiteFeatures : function () {
            return this.createErrorMessage();
        },
        isLoaded : function () {
            return this.data.length > 0;
        }
    }),
    workCalendar : Ext4.create('PRM.Store.List', {
        storeId: 'prm-store-calendar',
        model : 'PRM.Model.WorkCalendar',
        url : PRM.App.Constants.LIST_URL + '&searchType=calendar',
        getByIdAsString : function (id) {
            if (Ext4.isNumeric(id)) {
                id = Ext4.isNumber(id) ? id : parseInt(id);
            }
            var workCalendarObj = PRM.App.Stores.workCalendar.getById(id);
            return workCalendarObj ? JSON.stringify(workCalendarObj.data) : '';
        }
    }),
    gridStore : Ext4.create('PRM.Store.Grid', {
        storeId: 'prm-grid-store'
    }),
    pageList : Ext4.create('PRM.Store.List', {
        storeId : 'prm-page-list',
        model : 'PRM.Model.SimpleList',
        url : nlapiResolveURL('SUITELET', 'customscript_prm_sl_get_project_data', 'customdeploy_prm_sl_get_project_data') + '&isPageList=T',
        filterParams : {},
        updatePage : function(pageNum) {
            if (pageNum) {
                PRM.App.Settings.currentPage = pageNum;
            } else {
                // for now, always set currentPage to 1
                // TODO: add option to keep the currentPage. when implemented, also handle case when the currentPage results to 0 (e.g. when sole project in last page is deleted), currentPage should be set to the previous page
                PRM.App.Settings.currentPage = 1;
            }
        },
        loadWithFilters : function(pageNum, projectId) {
            this.updatePage(pageNum);
            
            // disable paging controls; enable in gridStore callback
            PRM.App.Grid.disablePagingControls();
            
            // always import settings before load
            Ext4.apply(this.filterParams, PRM.App.Settings);
            
            this.load({
                params : this.filterParams,
                callback : function(records, options, success) {
                    if (success) {
                        Ext4.apply(PRM.App.Settings, {
                            totalPages : this.getProxy().reader.rawData.totalPages,
                            totalProjects : this.getProxy().reader.rawData.totalProjects
                        });
                        
                        Ext4.getCmp('prm-total-page').setValue(PRM.App.Settings.totalProjects);
                        if (PRM.App.Settings.totalProjects > 0){
                            var pageCmb = Ext4.getCmp('prm-page-combo-box');
                            pageCmb.suspendEvents();
                            pageCmb.select(1);
                            pageCmb.resumeEvents();
                        }
                        PRM.App.Stores.gridStore.loadWithFilters(null, projectId);
                    }
                }
            });
        }
    }),
    allocation : Ext4.create('PRM.Store.Allocation', {
        storeId: 'prm-allocation-store',
        url : nlapiResolveURL('SUITELET', 'customscript_prm_sl_allocation_data', 'customdeploy_prm_sl_allocation_data')
    }),
    assignment : Ext4.create('PRM.Store.Assignment', {
        storeId: 'prm-assignment-store',
        url : nlapiResolveURL('SUITELET', 'customscript_prm_sl_assignment_data', 'customdeploy_prm_sl_assignment_data')
    }),
    resourceForm : Ext4.create('PRM.Store.List', {
        storeId: 'prm-store-resource-form',
        model : 'PRM.Model.ResourceList',
        url : PRM.App.Constants.LIST_URL + '&searchType=resources'
    }),
    assignableResource : Ext4.create('PRM.Store.List', {
        storeId: 'prm-store-assignable-resource',
        model : 'PRM.Model.ResourceList',
        url : PRM.App.Constants.LIST_URL + '&searchType=assign_resource'
    }),  
    projectForm : Ext4.create('PRM.Store.List', {
        storeId: 'prm-store-project-form',
        model : 'PRM.Model.ProjectList',
        url : PRM.App.Constants.LIST_URL + '&searchType=projects'
    }),
    assignableProject : Ext4.create('PRM.Store.List', {
        storeId: 'prm-store-assignable-project',
        model : 'PRM.Model.ProjectList',
        url : PRM.App.Constants.LIST_URL + '&searchType=project_no_ra_pta'
    }),
    projectTaskForm : Ext4.create('PRM.Store.List', {
        storeId: 'prm-store-project-task-form',
        model : 'PRM.Model.SimpleList',
        url : PRM.App.Constants.LIST_URL + '&searchType=project_tasks'
    }),
    billingClassForm : Ext4.create('PRM.Store.List', {
        storeId: 'prm-store-billing-class-form',
        model : 'PRM.Model.SimpleList',
        url : PRM.App.Constants.LIST_URL + '&searchType=billing_classes'
    }),
    serviceItemForm : Ext4.create('PRM.Store.List', {
        storeId: 'prm-store-service-item-form',
        model : 'PRM.Model.SimpleList',
        url : PRM.App.Constants.LIST_URL + '&searchType=service_items'
    }),
    allocationType : Ext4.create('PRM.Store.List', {
        storeId : 'prm-store-allocation-type-form',
        data : [
            {
                'id' : 1,
                'name' : 'Hard' //translatedStrings.getText('STORE.HARD')
            }, {
                'id' : 2,
                'name' : 'Soft' //translatedStrings.getText('STORE.SOFT')
            }
        ]
    }),
    allocationUnit : Ext4.create('PRM.Store.List', {
        storeId : 'prm-store-allocation-unit-form',
        model : 'PRM.Model.AllocationUnit',
        data : [
            {
                'id' : 'P',
                'name' : 'Percent of Time' 
            }, {
                'id' : 'H',
                'name' : 'Hour' 
            }
        ]
    }),
    approver : Ext4.create('PRM.Store.List', {
        storeId: 'prm-store-approvers',
        url : PRM.App.Constants.LIST_URL + '&searchType=approvers'
    }),
    filter : Ext4.create('PRM.Store.List', {
        storeId: 'prm-store-filters',
        model : 'PRM.Model.Filter',
        url : nlapiResolveURL('SUITELET', 'customscript_prm_sl_filter_list', 'customdeploy_prm_sl_filter_list'),
        listeners : {
            load : function(store) {
                PRM.Util.PerfLogs.start('GRID_LOAD');
                
                var filterId  = Number(PRM.App.Settings.lastUsedFilter) || 0,
                    filterCmb = Ext4.getCmp('prm-cmb-saved-filters');
                
                try {
                    filterCmb.select(filterId);
                } catch (err) {
                    filterCmb.select(0);
                }
                
                if (PRM.App.Settings.forceLoad) {
                    /* 
                     * forceLoad flag currently supports exactly 2 scenarios:
                     * 1) when a filter is edited
                     * 2) or during initial load where the lastUsedFilter is default
                     * 
                     * creating or deleting a filter, as well as during initial load where lastUsedFilter is not default,
                     * will trigger the filter combo's change event, which then triggers applyFiltersToStores
                     */
                    delete PRM.App.Settings.forceLoad;
                    store.applyFiltersToStores(filterId);
                }
            }
        },
        isNameDuplicate : function(name, id) {
            try {
                if (name == PRM.Translation.getText('TEXT.DEFAULT')) {
                    return true;
                }
                
                var record = this.findRecord('name', name, 0, false, false, true);
                if (record) {
                    if (!id || record.get('id') != id) {
                        return true;
                    }
                }
            } catch (err) {
                console.log('error in isNameDuplicate');
            }
            return false;
        },
        applyFiltersToStores : function(filterId) {
            PRM.App.Grid.addMask();
            
            // retrieve filter values
            var filterRecord = this.getSelectedRecord(filterId);
            
            var filters = {
                startDateType        : filterRecord.get('startDateType'),
                startDate            : Ext4.Date.format(filterRecord.get('startDate'), nsDateFormat),
                resourceTypeEmployee : filterRecord.get('resourceTypeEmployee'),
                resourceTypeGeneric  : filterRecord.get('resourceTypeGeneric'),
                resourceTypeVendor   : filterRecord.get('resourceTypeVendor'),
                customers            : filterRecord.get('customers'),
                projects             : filterRecord.get('projects'),
                tasks                : filterRecord.get('tasks'),
                billingClasses       : filterRecord.get('billingClasses'),
                employees            : filterRecord.get('employees'),
                vendors              : filterRecord.get('vendors'),
                genericResources     : filterRecord.get('genericResources'),
                projectsOnly         : filterRecord.get('projectsOnly'),
                tasksOnly            : filterRecord.get('tasksOnly'),
                subsidiaries         : filterRecord.get('subsidiaries'),
                includeSubSubsidiary : filterRecord.get('includeSubSubsidiary')
            };
            
            // update filter summary
            PRM.App.Filter.setFormAndHeaderValues(filterRecord);
            
            // apply filters to app settings then reload pageList
            Ext4.apply(PRM.App.Settings, filters);
            PRM.App.Stores.pageList.loadWithFilters();
        }
    }),
    startDateTypeFilter : Ext4.create('PRM.Store.List', {
        storeId: 'prm-store-customer-filter',
        model : 'PRM.Model.SimpleList',
        //autoLoad : true,
        data : [
            {
                'id' : 1,
                'name' : PRM.Translation.getText('TEXT.ALL')
            }, {
                'id' : 2,
                'name' : PRM.Translation.getText('TEXT.PROJECT')
            }, {
                'id' : 3,
                'name' : PRM.Translation.getText('FIELD.PROJECT_TASK')
            }, {
                'id': 4,
                'name' : PRM.Translation.getText('TEXT.TASK_ASSIGNMENT')
            }, {
                'id': 5,
                'name' : PRM.Translation.getText('TEXT.RESOURCE_ALLOCATION')
            }
        ]
    }),
    subsidiaryFilter: Ext4.create('PRM.Store.List', {
        storeId: 'prm-store-subsidiary-filter',
        model : 'PRM.Model.SimpleList',
        url : PRM.App.Constants.LIST_URL + '&searchType=subsidiaries'
    }),    
    customerFilter : Ext4.create('PRM.Store.List', {
        storeId: 'prm-store-customer-filter',
        model : 'PRM.Model.SimpleList',
        url : PRM.App.Constants.LIST_URL + '&searchType=customers'
    }),
    projectFilter : Ext4.create('PRM.Store.List', {
        storeId: 'prm-store-project-filter',
        model : 'PRM.Model.ProjectList',
        url : PRM.App.Constants.LIST_URL + '&searchType=projects'
    }),
    projectTaskFilter : Ext4.create('PRM.Store.List', {
        storeId: 'prm-store-project-task-filter',
        model : 'PRM.Model.SimpleList',
        url : PRM.App.Constants.LIST_URL + '&searchType=project_tasks'
    }),
    projectTaskGrid : Ext4.create('PRM.Store.List', {
        storeId: 'prm-store-project-task-grid',
        model: 'PRM.Model.SimpleList',
        url: PRM.App.Constants.LIST_URL + '&searchType=project_tasks&excludeMilestones=T'
    }),
    allocationSummary : Ext4.create('PRM.Store.Base', {
        storeId : 'prm-store-allocation-summary',
        model : 'PRM.Model.AllocatedTimeSummary',
        url : nlapiResolveURL('SUITELET', 'customscript_prm_sl_allocation_summary', 'customdeploy_prm_sl_allocation_summary'),
        autoLoad : false,
        sortOnLoad : true,
        sorters : [
            {
                property : 'percent',
                direction : 'DESC'
            }, {
                property : 'hours',
                direction : 'DESC'
            }, {
                property : 'resourceName',
                direction : 'ASC'
            }
        ],
        listeners : {
            beforeLoad : function(me, op) {
                if (op.params.pageNum == 1) {
                    me.removeAll();
                }
                PRM.App.Forms.allocationSummary.setLoading();
            },
            load : function(me) {
                PRM.App.Forms.allocationSummary.setLoading(false);
                
                var loadMore = Ext4.getCmp('prm-load-more');
                if (me.proxy.reader.rawData.totalResources == me.getCount()) {
                    loadMore.hide();
                } else {
                    loadMore.show();
                }
            }
        }
    }),
    assignmentSearch : Ext4.create('PRM.Store.Base', {
        storeId : 'prm-store-assignment-search',
        model : 'PRM.Model.AssignmentSearchResult',
        url : nlapiResolveURL('SUITELET', 'customscript_prm_assignment_search', 'customdeploy_prm_assignment_search'),
        autoLoad : false,
        sortOnLoad : true,
        sorters : [
            {
                property : 'resourceName',
                direction : 'ASC'
            }, {
                property : 'billingClass',
                direction : 'ASC'
            }, {
                property : 'laborCost',
                direction : 'ASC'
            }
        ],
        listeners : {
            beforeLoad : function(me) {
                me.removeAll();
                PRM.App.Forms.assignmentResult.setLoading();
            },
            load : function(me) {
                PRM.App.Forms.assignmentResult.setLoading(false);
                
                if (me.getCount()) {
                    Ext4.getCmp('prm-assignment-search-results-grid').show();
                } else {
                    Ext4.getCmp('prm-form-assignment-search-result-empty').show();
                }
            }
        }
    }),
    resourceSearch : Ext4.create('PRM.Store.Base', {
        storeId : 'prm-store-resource-search',
        model : 'PRM.Model.ResourceSearchResult',
        url : nlapiResolveURL('SUITELET', 'customscript_prm_sl_resource_search', 'customdeploy_prm_sl_resource_search'),
        autoLoad : false,
        sortOnLoad : true,
        sorters : [
            {
                property : 'resourceName',
                direction : 'ASC'
            }, {
                property : 'billingClass',
                direction : 'ASC'
            }, {
                property : 'laborCost',
                direction : 'ASC'
            }, {
                property : 'percentAvailable',
                direction : 'ASC'
            }
        ],
        listeners : {
            beforeLoad : function(me) {
                me.removeAll();
                PRM.App.Forms.resourceResult.setLoading();
            },
            load : function(me) {
            	PRM.App.Forms.resourceResult.setLoading(false);
                
                if (me.getCount()) {
                    Ext4.getCmp('prm-allocation-search-results-grid').show();
                } else {
                    Ext4.getCmp('prm-form-allocation-search-result-empty').show();
                }
            }
        }
    }),
    /*
     * LDC stores for View Form <field>FilterSelectedStore <field>FilterDataRange
     */
    resourceFilterSelectedStore : Ext4.create('PRM.Store.List', {
        model : 'PRM.Model.SimpleList',
        url : PRM.App.Constants.LIST_URL + '&searchType=resources'
    }),
    resourceFilterDataRange : Ext4.create('PRM.Store.List', {
        model : 'PRM.Model.LargeDataDropdownRange',
        url : PRM.App.Constants.LIST_URL + '&searchType=resources&range=T',
        autoLoad : true
    }),
    customerFilterSelectedStore : Ext4.create('PRM.Store.List', {
        model : 'PRM.Model.SimpleList',
        url : PRM.App.Constants.LIST_URL + '&searchType=customers'
    }),
    customerFilterDataRange : Ext4.create('PRM.Store.List', {
        model : 'PRM.Model.LargeDataDropdownRange',
        url : PRM.App.Constants.LIST_URL + '&searchType=customers&range=T',
        autoLoad : true
    }),
    projectFilterSelectedStore : Ext4.create('PRM.Store.List', {
        model : 'PRM.Model.SimpleList',
        url : PRM.App.Constants.LIST_URL + '&searchType=projects'
    }),
    projectFilterDataRange : Ext4.create('PRM.Store.List', {
        model : 'PRM.Model.LargeDataDropdownRange',
        url : PRM.App.Constants.LIST_URL + '&searchType=projects&range=T',
        autoLoad : true
    }),
    taskFilterSelectedStore : Ext4.create('PRM.Store.List', {
        model : 'PRM.Model.SimpleList',
        url : PRM.App.Constants.LIST_URL + '&searchType=project_tasks'
    }),
    taskFilterDataRange : Ext4.create('PRM.Store.List', {
        model : 'PRM.Model.LargeDataDropdownRange',
        url : PRM.App.Constants.LIST_URL + '&searchType=project_tasks&range=T',
        autoLoad : true
    }),
    billingClassFilterSelectedStore : Ext4.create('PRM.Store.List', {
        model : 'PRM.Model.SimpleList',
        url : PRM.App.Constants.LIST_URL + '&searchType=billing_classes'
    }),
    billingClassFilterDataRange : Ext4.create('PRM.Store.List', {
        model : 'PRM.Model.LargeDataDropdownRange',
        url : PRM.App.Constants.LIST_URL + '&searchType=billing_classes&range=T',
        autoLoad : true
    }),
    /*
     * LDC stores for Resource Allocations Form <field>AllocationSelectedStore <field>AllocationDataRange
     */
    resourceSelectedStore : Ext4.create('PRM.Store.List', {
        model : 'PRM.Model.SimpleList',
        url : PRM.App.Constants.LIST_URL + '&searchType=resources'
    }),
    resourceDataRange : Ext4.create('PRM.Store.List', {
        model : 'PRM.Model.LargeDataDropdownRange',
        url : PRM.App.Constants.LIST_URL + '&searchType=resources&range=T',
        autoLoad : true
    }),
    projectSelectedStore : Ext4.create('PRM.Store.List', {
        model : 'PRM.Model.ProjectList',
        url : PRM.App.Constants.LIST_URL + '&searchType=projects'
    }),
    projectDataRange : Ext4.create('PRM.Store.List', {
        model : 'PRM.Model.LargeDataDropdownRange',
        url : PRM.App.Constants.LIST_URL + '&searchType=projects&range=T',
        autoLoad : true
    }),
    approverSelectedStore : Ext4.create('PRM.Store.List', {
        model : 'PRM.Model.SimpleList',
        url : PRM.App.Constants.LIST_URL + '&searchType=approvers'
    }),
    approverDataRange : Ext4.create('PRM.Store.List', {
        model : 'PRM.Model.LargeDataDropdownRange',
        url : PRM.App.Constants.LIST_URL + '&searchType=approvers&range=T',
        autoLoad : true
    }),
    /*
     * LDC stores for Task Assignments Form <field>AssignmentSelectedStore <field>AssignmentDataRange
     */
    taskSelectedStore : Ext4.create('PRM.Store.List', {
        model : 'PRM.Model.SimpleList',
        url : PRM.App.Constants.LIST_URL + '&searchType=project_tasks'
    }),
    taskDataRange : Ext4.create('PRM.Store.List', {
        model : 'PRM.Model.LargeDataDropdownRange',
        url : PRM.App.Constants.LIST_URL + '&searchType=project_tasks&range=T',
        autoLoad : true
    })
};