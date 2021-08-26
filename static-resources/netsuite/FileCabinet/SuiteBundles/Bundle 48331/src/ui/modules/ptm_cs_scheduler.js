/**
 * © 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * Bryntum scheduler
 */

Ext4.define('PSA.RA.Scheduler', {
    id : 'psa-ptm-app',
    cls : 'psa-ptm-app',
    extend : 'Sch.panel.SchedulerTree',
    initComponent : function(args) {
        var permission = PSA.RA.dataStores.permissionStore;
        
        /*
         * Bryntum config
         */
          this.tooltipTpl = new Ext4.Template(
                '<table class="ra-tooltip">', 
                '<tr class="header">', '<td><div>', translatedStrings.getText('TOOLTIP.PROJECT_TASK_ASSIGNMENT'), '</div></td>', '</tr>',
                '<tr>', '<td>&nbsp;</td>', '</tr>', 
                '<tr>', '<td>', 
                '<table style="width: 80%; margin: auto;">', 
                '<tr>', '<td class="label">', translatedStrings.getText('DISPLAY.TASK'), '</td>', '<td class="value">{Name}</td>', '</tr>',
                '<tr>', '<td class="label">', translatedStrings.getText('TOOLTIP.WORK_UNITS'), '</td>', '<td class="value">{tipUnits}</td>', '</tr>',
                '<tr>', '<td class="label">', translatedStrings.getText('TOOLTIP.ESTIMATED_HOURS'), '</td>', '<td class="value">{estimatedHours}</td>', '</tr>',
                '<tr>', '<td class="label">', translatedStrings.getText('TOOLTIP.WORKED_HOURS'), '</td>', '<td class="value">{actualHours}</td>', '</tr>',
                '<tr>', '<td class="label">', translatedStrings.getText('DATE.START_DATE'), '</td>', '<td class="value">{tipStartDate}</td>', '</tr>',
                '<tr>', '<td class="label">', translatedStrings.getText('DATE.END_DATE'), '</td>', '<td class="value">{tipEndDate}</td>', '</tr>',
                '<tr>', '<td class="label">', translatedStrings.getText('TOOLTIP.CONSTRAINT_TYPE'), '</td>', '<td class="value">{tipConstraintType}</td>', '</tr>',
                '<tr>', '<td class="label">', translatedStrings.getText('TOOLTIP.FINISH_NO_LATER_THAN'), '</td>', '<td class="value">{tipFinishByDate}</td>', '</tr>',
                '</table>', 
                '</td>', '</tr>', 
                '<tr>', '<td>&nbsp;</td>', '</tr>', '</table>');
        this.resourceStore = PSA.RA.dataStores.chartResource;
        this.eventStore = PSA.RA.dataStores.chartEvent;
        this.viewPreset = 'PSA.RA.ViewPreset.Weekly';
        this.enableDragCreation = false;
        this.renderTo = Ext4.get('main_form');
        this.snapToIncrement = true;
        this.allowOverlap = true;
        this.weekStartDay = 0;
        this.loadMask = true;
        this.chartDensity = this.getChartDensity();
        this.rowHeight = this.getDensityHeight(this.chartDensity);//TODO: if we will implement density options, get rid of refreshChartDensity and load the value here directly. also, scheduler must be re-initialized everytime the density option is updated.
        this.startDate = new Date();// In Bryntum 2.2.16, if startDate is not specified, it will always be sourced from the earliest start date of all events loaded in the eventStore
        
        if (!permission.editTask()) {
            this.readOnly = true;
        }
        
        this.eventBodyTemplate = new Ext4.XTemplate('<div style="width: 100%; height: 100%;">', '<div style="background-color: {legend}; left: 0; width: {width}%; height: 100%"></div>', '<div class="ptm-event-label">{label}</div>', '</div>');

        this.dateFormat = convertNSDateFormat();

        /*
         * Forms
         */
        this.formFilter = Ext4.create('PSA.RA.Forms.AdvFilters');
        this.formTaskAssignment = Ext4.create('PSA.RA.Forms.TaskAssignment');
        this.viewTaskAssignment = Ext4.create('PSA.RA.Forms.TaskAssignmentView');
        this.formLargeData = Ext4.create('PSA.RA.Forms.LargeData');
        this.formSettings = Ext4.create('PSA.PTM.Forms.SettingsForm');
        
        /*
         * Actual initialization
         */
        this.callParent(args);

    },
    columns : [
        Ext4.create('Ext4.tree.Column', {
            text : '<div id="ra-expand-collapse-container"></div>',//'Resource Projects',
            width : 325,
            sortable : false,
            dataIndex : 'Name',
            id : 'resourceColumn',
            listeners : {
                resize : function(column, width, height, oldwidth, oldheight, eopts){
                    var width = Ext4.getCmp('ra-resource-search').getWidth() + 75;
                    this.setWidth(width);
                    Ext4.getCmp('ra-chartResourceColumn').setWidth(width);
                    this.doLayout();
                }
            }
        })
    ],
    resourceZones : Ext4.create('Sch.data.EventStore'),
    plugins : [
        'bufferedrenderer', Ext4.create('Sch.plugin.Lines', {
            showTip : false,
            store : Ext4.create('Ext4.data.Store', {
                model : 'PSA.RA.Model.WeekendLine',
                id : 'ra-lines-store',
                data : [
                    {
                        Date : '1987/06/29',
                        Cls : 'important'
                    }
                ]
            })
        }),
        Ext4.create('Sch.plugin.Printable', {
            autoPrintAndClose : true,
            fakeBackgroundColor : false
        })        
    ],
    eventRenderer : function(event, resource, templateData) {
        var styleString = "width:{0}%;left:{1}%";
        var legendToolbar = Ext4.getCmp('ptm-toolbar-legend');
        if (event.get('isRollUp')) {
            var legend = event.get('units') > 100 ? 'legend-over' : 'legend-staffed';
            templateData.style = Ext4.String.format('width: {0}px; background-color: {1};', templateData.width, legendToolbar.typeBgMap[legend]);
            return {
                width : 100
            };
        } else {
            var toShowNumbers = PTM.Settings.get('showNumbers');
            var actualHours = Number(String(event.get('actualHours')).replace(",", "."));
            var plannedHours = Number(String(event.get('estimatedHours')).replace(",", "."));
            var width = plannedHours ? (100 * actualHours / plannedHours) : 0;
            templateData.cls = 'event-tooltip ' + (event.get('Draggable') && !event.get('isDateDraggable') ? 'ptm-vertical-drag-only' : '');
            templateData.style = Ext4.String.format('width: {0}px; background-color: {1};', templateData.width, legendToolbar.typeBgMap['legend-assigned']);
            return {
                legend : legendToolbar.typeBgMap['legend-worked'],
                width : width,
                label : toShowNumbers ? (event.get('units') + '%') : ''
            };
        }
    },
    refreshChartDensity : function(forceDensity) {
        var density = forceDensity ? forceDensity : this.getChartDensity();
        this.chartDensity = density;
        this.getSchedulingView().setRowHeight(this.getDensityHeight(density));
    },
    getChartDensity : function() {
        if (this.chartDensity == undefined) this.chartDensity = PTM.Settings.get('chartDensity');
        return this.chartDensity;
    },
    getDensityHeight : function(density) {
        var densityHeightMap = {
            1 : 29,
            2 : 35,
            3 : 41
        };
        return densityHeightMap[density];
    },
    viewConfig : {
        getRowClass : function(resource) {
            return 'ra-density-' + PSA.RA.App.getChartDensity() + (resource.get('details').type == 'resource' ? '-resource ra-resource-row' : '');
        }
    },
    dndValidatorFn : function(dragRecords, target, startDate, duration, e) {
        var record = dragRecords[0];
        var isDateDraggable = record.get('isDateDraggable');
        var endDate = new Date(startDate.getTime() + duration);
        var trueEndDate = new Date(endDate.getTime() - 86400000);
        var finishByDate = record.get('finishByDate');
        /*
         * Determine if the new x-coordinate is valid (horizontal drag)
         */
        var isStartEndValid = PSA.RA.App.isStartEndValid(startDate, endDate, target.getPTMResourceID());
        var isEndingOnOrBeforeFinishByDate = finishByDate ? trueEndDate.getTime() <= finishByDate.getTime() : true;
        var isSameDateRange = this.previousStartDate.getTime() == startDate.getTime();
        var validHorizontalDrag = ((isDateDraggable && isStartEndValid && isEndingOnOrBeforeFinishByDate) || (!isDateDraggable && isSameDateRange));
        /*
         * Determine if the new y-coordinate is valid (vertical drag)
         */
        var isSameRow = record.get('ResourceId') == target.get('Id');
        var isResourceRow = target.isResourceRow();
        var isSameResource = record.getPTMResourceID() == target.getPTMResourceID();
        var isResourceAssignedToProject = PSA.RA.App.isResourceAssignedToProject(target.getPTMResourceID(), record);
        var isResourceAssignedToTask = PSA.RA.App.isResourceAssignedToTask(target.getPTMResourceID(), this.resourceStore.getById(record.get('ResourceId')).get('details').taskId);
        var validVerticalDrag = (isSameRow || (isResourceRow && !isSameResource && isResourceAssignedToProject && !isResourceAssignedToTask));
        return validHorizontalDrag && validVerticalDrag;
    },
    resizeValidatorFn : function(resourceRecord, eventRecord, startDate, endDate, e) {
        var recStartDate = eventRecord.get('StartDate');
        var recEndDate = eventRecord.get('EndDate');
        var recTrueEndDate = eventRecord.get('trueEndDate');
        var uiTrueEndDate = new Date(endDate.getTime() - 86400000);
        var finishByDate = eventRecord.get('finishByDate');
        var lastActualDate = eventRecord.get('lastActualDate');
        /*
         * If a bar is only partially displayed then we'll need to get the real start/end dates from the record and use those for validation
         * Otherwise we'll just use startDate/endDate
         */
        var validationStart = recStartDate.getTime() < PSA.RA.App.getStart().getTime() ? recStartDate : startDate;
        var validationEnd = recEndDate.getTime() > PSA.RA.App.getEnd().getTime() ? recEndDate : endDate;
        var validationTrueEnd = recEndDate.getTime() > PSA.RA.App.getEnd().getTime() ? recTrueEndDate : uiTrueEndDate;
        /*
         * Determine if resizing is valid
         */
        var isStartEndValid = PSA.RA.App.isStartEndValid(validationStart, validationEnd, resourceRecord.getPTMResourceID());
        var isEndingOnOrBeforeFinishByDate = finishByDate ? validationTrueEnd.getTime() <= finishByDate.getTime() : true;
        var isEndingOnOrAfterLastTimeWorked = lastActualDate ? lastActualDate.getTime() <= validationTrueEnd.getTime() : true;
        //console.debug('=========================================');
        //console.debug('resizeValidatorFn');
        //console.debug('isStartEndValid: ' + isStartEndValid);
        //console.debug('isEndingOnOrBeforeFinishByDate: ' + isEndingOnOrBeforeFinishByDate);
        //console.debug('isEndingOnOrAfterLastTimeWorked: ' + isEndingOnOrAfterLastTimeWorked);
        return isStartEndValid && isEndingOnOrBeforeFinishByDate && isEndingOnOrAfterLastTimeWorked;
    },
    tipCfg : {
        showDelay : 0,
        autoHide : true,
        hideDelay : 0,
        width : 350,
        delegate : '.event-tooltip',
        trackMouse : true,
        dismissDelay : 0,
        id : 'ra-allocation-hover'
    },
    tbar : Ext4.create('PSA.PTM.ToolBar.Main'),
    bbar : Ext4.create('PSA.PTM.ToolBar.Legend'),
    listeners : {
        afterrender : function() {
            var columnHeader = Ext4.get('ra-expand-collapse-container');
            Ext4.create('Ext4.panel.Panel', {
                id : 'ra-chartResourceColumn',
                renderTo : columnHeader,
                layout : 'hbox',
                border : false,
                defaults : {
                    margin : '0 5 0 0'
                },
                items : [
                    Ext4.create('PSA.RA.UI.SearchResource', {
                        id : 'ra-resource-search',
                        emptyText : translatedStrings.getText('MESSAGE.EMPTYTEXT.SEARCH_RESOURCE'),
                        listeners : {
                            specialkey: function(field, e){
                                // e.HOME, e.END, e.PAGE_UP, e.PAGE_DOWN,
                                // e.TAB, e.ESC, arrow keys: e.LEFT, e.RIGHT, e.UP, e.DOWN
                                if (e.getKey() == e.ENTER) {
                                    field.triggerEl.elements[0].dom.click();
                                }
                            }
                        },
                        onTriggerClick : function() {
                            perfTestLogger.start('Resource Search');
                            var searchString = Ext4.String.trim(this.getValue());
                            if ((searchString.length < 3) && (searchString.length > 0)) {
                                alert(translatedStrings.getText('MESSAGE.ERROR.SEARCH_TOO_SHORT'));
                            } else {
                                PSA.RA.dataStores.chartResource.loadWithFilters('resourceSearch');
                            }
                        }
                    })
                ]
            });
            this.autofit();
            Ext4.EventManager.onWindowResize(function() {
                PSA.RA.App.autofit();
            });
            /*
             * Modify loading mask messages
             */
            this.view.loadMask.msg = translatedStrings.getText('MESSAGE.MASK.LOADING_RESOURCES');
            this.getSchedulingView().loadMask.msg = translatedStrings.getText('MESSAGE.MASK.LOADING_TASK_ASSIGNMENTS');
            
            /*
             * Instantiate tooltips for locked columns & date columns
             */
            Ext4.create('PSA.RA.UIComponent.ToolTip2', {
                delegate: '.x4-tree-node-text'
            });
            Ext4.create('PSA.RA.UIComponent.ToolTip2', {
                delegate: '.sch-simple-timeheader'
            });
        },
        beforeeventresize : function ( scheduler, record, e, eOpts ) {
            scheduler.previousStartDate = record.getStartDate();
            scheduler.previousEndDate = record.getEndDate();
        },
        beforeeventdrag : function(scheduler, record) {
            scheduler.previousResourceId = record.getResourceId();
            scheduler.previousStartDate = record.getStartDate();
            scheduler.previousEndDate = record.getEndDate();
            
//            console.debug('====================');
//            console.debug('beforeeventdrag');
//            console.debug('previousResourceId: ' + scheduler.previousResourceId);
//            console.debug('previousStartDate: ' + scheduler.previousStartDate);
//            console.debug('previousEndDate: ' + scheduler.previousEndDate);
        },
        eventdragstart : function (scheduler, records, eOpts) {
            var record = records[0];
            var resource = parseInt(record.getPTMResourceID());
            var project = parseInt(record.getPTMProjectID());
            var projectTask = record.get('taskId');
            var isProjectTemplate = record.raw.isProjectTemplate;
            var popupResourceStore = PSA.RA.dataStores.popupResourceStore;
            
            if (record.allowedResources == null) {
                popupResourceStore.loadWithFilters(resource, project, projectTask, null, isProjectTemplate);
                record.allowedResources = popupResourceStore.data.keys;
            }
            
//          console.debug('scheduler.allowedResources');
//          console.debug(scheduler.allowedResources);
        },
        eventdrop : function(scheduler, records, isCopy, eOpts) {
            perfTestLogger.start('Reassign');
            var record = records[0];
            /*
             * Check if there was an update; mask the chart if true
             */
            if (record.getResourceId() == scheduler.previousResourceId && record.getStartDate().getTime() == scheduler.previousStartDate.getTime()) {
                return;
            } else {
                PSA.RA.App.view.loadMask.show();
            }
            var newResourceId = record.getPTMResourceID();
            var newResource = scheduler.resourceStore.getResourceObjByRow(newResourceId).raw;
            var startDate = record.get('StartDate');
            record.beginEdit();
            record.set('StartDate', record.get('StartDate'));
            record.set('ResourceId', record.get('ResourceId'));
            if (record.getResourceId() != scheduler.previousResourceId) record.set('unitCost', newResource.details.laborcost);
            record.endEdit();
            var chartSaver = PSA.RA.dataStores.chartEventSaver;
            chartSaver.transferModifiedRecords();
            chartSaver.sync({
                success : function(batch) {
                    PSA.RA.dataStores.chartResource.loadWithFilters('edittask');
                },
                failure : function(batch) {
                    var message = batch.proxy.reader.jsonData.message;
                    
                    alert(message + '\n' + translatedStrings.getText('MESSAGE.ERROR.RELOAD_CHART'));
                    PSA.RA.dataStores.chartResource.loadWithFilters('reloadChart');
                }
            });
        },
        eventresizeend : function(scheduler, record) {
            perfTestLogger.start('Resize');
            var resourceId = record.getPTMResourceID();
            var startDate = record.get('StartDate');
            var uiEndDate = record.get('EndDate');
            /*
             * Mask the chart immediately if there is an update
             * Determine which date was updated, and if update will add or subtract to estimated work
             */
            var startChanged = startDate.getTime() < scheduler.previousStartDate.getTime() ? 'add' : (startDate.getTime() > scheduler.previousStartDate.getTime() ? 'subtract' : false);
            var endChanged = uiEndDate.getTime() < scheduler.previousEndDate.getTime() ? 'subtract' : (uiEndDate.getTime() > scheduler.previousEndDate.getTime() ? 'add' : false);
            if (startChanged || endChanged) {
                PSA.RA.App.view.loadMask.show();
            } else {
                return;
            }
            /*
             * Compute how much time will be added/subtracted to estimated work
             */
            if(startChanged){
                if(startDate.getTime() < scheduler.previousStartDate.getTime()) {
                    var s = startDate;
                    var e = scheduler.previousStartDate;
            } else {
                    var s = scheduler.previousStartDate;
                    var e = startDate;
            }
            }else{
            var trueEndDate = new Date(uiEndDate.getTime() - 86400000);
                var truePreviousEndDate = new Date(scheduler.previousEndDate.getTime() - 86400000);
                if(uiEndDate.getTime() < scheduler.previousEndDate.getTime()) {
                    var s = trueEndDate;
                    var e = truePreviousEndDate;
                } else {
                    var s = truePreviousEndDate;
                    var e = trueEndDate;
                }
            }
            var validDiffDays = PSA.RA.App.getValidWorkDaysInRange(s, e, resourceId) - 1;
            var hoursPerDay = scheduler.resourceStore.getById(resourceId).get('details').workcalendar.hoursperday * record.get('units') / 100;
            var totalDiffHours = hoursPerDay * validDiffDays;
            var newEstimatedHours = (startChanged == 'add' || endChanged == 'add') ? record.get('estimatedHours') + totalDiffHours : record.get('estimatedHours') - totalDiffHours;
            /*
             * Apply changes to record
             */
            record.beginEdit();
            record.set('StartDate', record.get('StartDate'));
            record.set('estimatedHours', newEstimatedHours);
            record.endEdit();
            var chartSaver = PSA.RA.dataStores.chartEventSaver;
            chartSaver.transferModifiedRecords();
            chartSaver.sync({
                success : function(batch) {
                    PSA.RA.dataStores.chartResource.loadWithFilters('reloadChart');
                },
                failure : function(batch) {
                    var message = batch.proxy.reader.jsonData.message;
                    alert(message + '\n' + translatedStrings.getText('MESSAGE.ERROR.RELOAD_CHART'));
                    PSA.RA.dataStores.chartResource.loadWithFilters('reloadChart');
                }
            });
        },
        eventclick : function(view, record, event, eOpts) {
            this.selectedEvent = record;
            if (record.get('isRollUp') != true) {
                if (PSA.RA.dataStores.permissionStore.editTask()) {
                    var resourceId = parseInt(record.getPTMResourceID());
                    var projectId = parseInt(record.getPTMProjectID());
                    var projectTaskId = record.get('taskId');
                    var assigneesFilter = this.resourceStore.allDataParams.assigneesFilter;
                    if (record.raw.isProjectTemplate) {
                        PSA.RA.dataStores.popupGenericStore.loadWithFilters(resourceId, projectId, projectTaskId, assigneesFilter);
                    }
                    else {
                        PSA.RA.dataStores.popupResourceStore.loadWithFilters(resourceId, projectId, projectTaskId, assigneesFilter);
                    }
                    this.formTaskAssignment.show();
                }
                else {
                    this.viewTaskAssignment.show();
                }
            }
        },
        beforetooltipshow : function(scheduler, eventRecord) {
            return PTM.Settings.get("showHovers");
        },
        viewchange : function(scheduler, eOpts) {
            this.updateRangeField();
            this.refreshNonWorking();
        }
    },
    nonWorkStringToDate : function(date) {
        var tok = date.split('/');
        return new Date(tok[0], tok[1] - 1, tok[2]);
    },
    getValidWorkDaysInRange : function(startDate, endDate, resourceId) {
        var workCal = PSA.RA.dataStores.chartResource.getNodeById(resourceId).get('details').workcalendar;
        var hrsPerDay = workCal.hoursperday;
        // Compute total days, total work weeks, and remaining days after the last work week
        var totalDays = (Ext4.Date.getElapsed(startDate, endDate) / 86400000) + 1;
        var workWeeks = Math.floor(totalDays / 7);
        var remainDays = totalDays % 7;
        //console.log('startDate: ' + startDate);
        //console.log('endDate: ' + endDate);
        //console.log('totalDays: ' + totalDays);
        //console.log('workWeeks: ' + workWeeks);
        //console.log('remainDays: ' + remainDays);
        // Compute total working days for the full weeks
        var workDays = new Array();
        if (workCal.sunday == 'T') workDays.push(0);
        if (workCal.monday == 'T') workDays.push(1);
        if (workCal.tuesday == 'T') workDays.push(2);
        if (workCal.wednesday == 'T') workDays.push(3);
        if (workCal.thursday == 'T') workDays.push(4);
        if (workCal.friday == 'T') workDays.push(5);
        if (workCal.saturday == 'T') workDays.push(6);
        var weekWorkDays = workWeeks * workDays.length;
        //console.log('weekWorkDays: ' + weekWorkDays);
        //console.log('workDays: ' + workDays.join(', '));
        // Compute total working days for remaining days after last full week
        var remainWorkDays = 0;
        var startDateIndex = Number(Ext4.Date.format(startDate, 'w'));
        for ( var i = 0, j = startDateIndex; i < remainDays; i++, j = ++j % 7) {
            if (Ext4.Array.indexOf(workDays, j) != -1) remainWorkDays++;
            //console.log('j: ' + j)
            //console.log('remainWorkDays: ' + remainWorkDays);
        }
        //console.log('startDateIndex: ' + startDateIndex);
        //console.log('remainWorkDays: ' + remainWorkDays);
        // Count excepted days, check each exception date if between (inclusive) of start and end dates
        var exceptions = workCal.nonWork;
        var exceptDays = 0;
        if (exceptions) {
            for ( var i = 0; i < exceptions.length; i++) {
                var date = this.nonWorkStringToDate(exceptions[i].exceptiondate);
                if (Ext4.Date.between(date, startDate, endDate)) exceptDays++;
            }
        }
        //console.log('exceptDays: ' + exceptDays);
        // Compute total work days within range, then distribute hours to derive percentage
        var totalWorkDays = weekWorkDays + remainWorkDays - exceptDays;
        //console.log('totalWorkDays: ' + totalWorkDays);
        return totalWorkDays;
    },
    isStartEndValid : function(startDate, uiEndDate, resourceId) {
        var trueEndDate = new Date(uiEndDate.getTime() - 86400000);
        var workCalendar = PSA.RA.dataStores.chartResource.getNodeById(resourceId).get('details').workcalendar;
        var startIndex = startDate.getDay();
        var endIndex = trueEndDate.getDay();
        var workDays = new Array();
        workDays.push(workCalendar.sunday == 'T');
        workDays.push(workCalendar.monday == 'T');
        workDays.push(workCalendar.tuesday == 'T');
        workDays.push(workCalendar.wednesday == 'T');
        workDays.push(workCalendar.thursday == 'T');
        workDays.push(workCalendar.friday == 'T');
        workDays.push(workCalendar.saturday == 'T');
        if (!workDays[startIndex] || !workDays[endIndex]) return false;
        var nonWorkDays = workCalendar.nonWork;
        if (nonWorkDays) {
            for ( var i = 0; i < nonWorkDays.length; i++) {
                var nonWorkDay = this.nonWorkStringToDate(nonWorkDays[i].exceptiondate).getTime();
                if (startDate.getTime() == nonWorkDay || trueEndDate.getTime() == nonWorkDay) return false;
            }
        }
        return true;
    },
    /*
     * Check if targetResourceId is assigned to taskAssignment (project); always return true if allResources == 'T'
     */
    isResourceAssignedToProject : function(targetResourceId, taskAssignment) {
        var isAssignedToProject = (taskAssignment.allowedResources && Ext4.Array.indexOf(taskAssignment.allowedResources, targetResourceId) >= 0);
        return isAssignedToProject;
    },
    /*
     * Check if targetResourceId is already assigned to taskId
     */
    isResourceAssignedToTask : function(targetResourceId, taskId) {
        //var searchTaskId = targetResourceId + '-' + taskAssignment.getPTMProjectID() + '-' + taskAssignment.getPTMTaskID();
        var chartResource = PSA.RA.dataStores.chartResource;
        var isAssigned = false;
        chartResource.getRootNode().cascadeBy(function(node) {
            if(targetResourceId == node.getPTMResourceID() && node.get('details').taskId == taskId) isAssigned = true;
        });
        return isAssigned;
    },
    // Refresh resourceZones / re-render non-working days
    refreshNonWorking : function(forceReload) {
        var procStart = new Date().getTime();
        var linesStore = Ext4.StoreManager.get('ra-lines-store');
        if (forceReload || (this.prevViewPreset && this.prevViewPreset != this.viewPreset)) {
            this.resourceZones.removeAll();
            linesStore.removeAll();
        }
        this.prevViewPreset = this.viewPreset;
        if (this.viewPreset == 'PSA.RA.ViewPreset.Monthly') return;
        var resources = this.resourceStore.getRootNode().childNodes;
        var nonWorkingCells = new Array();
        //var weekendLines = new Array();
        var s = this.getStart();
        var e = this.getEnd();
        var dayInMillis = 86400000;
        var tempId = this.resourceZones.getCount();
        var append = tempId > 1;
        if (append) {
            var offset = 0;
            offset = this.viewPreset == 'PSA.RA.ViewPreset.Daily' ? dayInMillis : offset;
            offset = this.viewPreset == 'PSA.RA.ViewPreset.Weekly' ? dayInMillis * 7 : offset;
            switch (this.movement) {
                case 'left':
                    var tmp = s.getTime();
                    if (tmp < this.nwRangeStart) {
                        this.nwRangeStart = tmp;
                    } else {
                        offset = 0;
                    }
                    e.setTime(tmp + offset);
                    break;
                case 'right':
                    var tmp = e.getTime();
                    if (tmp > this.nwRangeEnd) {
                        this.nwRangeEnd = tmp;
                    } else {
                        offset = 0;
                    }
                    s.setTime(tmp - offset);
                    break;
            }
        } else {
            this.nwRangeStart = s.getTime();
            this.nwRangeEnd = e.getTime();
        }
        for ( var i = 0; i < resources.length; i++) {
            var node = resources[i];
            if (node.get('details').type == 'resource') {
                var resourceId = node.get('Id');
                var rows = this.resourceStore.getRowsByResourceId(resourceId);
                var workDays = new Array();
                var resourceData = this.resourceStore.getById(resourceId).get('details').workcalendar;
                workDays.push(resourceData.sunday);
                workDays.push(resourceData.monday);
                workDays.push(resourceData.tuesday);
                workDays.push(resourceData.wednesday);
                workDays.push(resourceData.thursday);
                workDays.push(resourceData.friday);
                workDays.push(resourceData.saturday);
                for ( var j = s.getTime(), dayIndex = s.getDay(); j < e.getTime(); j += dayInMillis, dayIndex = ++dayIndex % 7) {
                    /*if (dayIndex == 0) {
                        weekendLines.push(Ext4.create('PSA.RA.Model.WeekendLine', {
                            Date : new Date(j),
                            Cls : 'important'
                        }));
                    }*/
                    if (workDays[dayIndex] == 'F') {
                        var nonWorkStart = new Date(j);
                        var nonWorkEnd = new Date(j + dayInMillis);
                        for ( var l = 0; l < rows.length; l++) {
                            nonWorkingCells.push(Ext4.create('Sch.model.Event', {
                                Id : tempId++,
                                StartDate : nonWorkStart,
                                EndDate : nonWorkEnd,
                                ResourceId : rows[l]
                            }));
                        }
                    }
                }
                if (!append) {
                    var nonWorkDays = resourceData.nonWork;
                    if (nonWorkDays) {
                        for ( var j = 0; j < nonWorkDays.length; j++) {
                            var nonWorkStart = this.nonWorkStringToDate(nonWorkDays[j].exceptiondate);
                            var nonWorkEnd = new Date(nonWorkStart.getTime() + dayInMillis);
                            for ( var k = 0; k < rows.length; k++) {
                                nonWorkingCells.push(Ext4.create('Sch.model.Event', {
                                    Id : tempId++,
                                    StartDate : nonWorkStart,
                                    EndDate : nonWorkEnd,
                                    ResourceId : rows[k]
                                }));
                            }
                        }
                    }
                }
            }
        }
        this.resourceZones.loadData(nonWorkingCells, append);
        //linesStore.loadData(weekendLines, append);
    },
    // Update displayed date range
    updateRangeField : function() {
        var startDate = this.getStart();
        var endDate = this.getEnd();
        endDate.setDate(endDate.getDate() - 1); // End date is always set to a day after the displayed last day
        var from = {
            month : startDate.getMonth(),
            date : startDate.getDate(),
            year : startDate.getFullYear()
        };
        var to = {
            month : endDate.getMonth(),
            date : endDate.getDate(),
            year : endDate.getFullYear()
        };
        var text;
        var months = [
            translatedStrings.getText('MONTH.JANUARY'), translatedStrings.getText('MONTH.FEBRUARY'), translatedStrings.getText('MONTH.MARCH'), translatedStrings.getText('MONTH.APRIL')
, translatedStrings.getText('MONTH.MAY'), translatedStrings.getText('MONTH.JUNE'), translatedStrings.getText('MONTH.JULY'), translatedStrings.getText('MONTH.AUGUST'), translatedStrings.getText('MONTH.SEPTEMBER'), translatedStrings.getText('MONTH.OCTOBER'), translatedStrings.getText('MONTH.NOVEMBER'), translatedStrings.getText('MONTH.DECEMBER')
        ];
        if (this.viewPreset == 'PSA.RA.ViewPreset.Daily' || this.viewPreset == 'PSA.RA.ViewPreset.Weekly') {
            if (from.year == to.year) {
                if (from.month == to.month) text = months[from.month] + ' ' + from.date + ' - ' + to.date + ', ' + from.year;
                else text = months[from.month] + ' ' + from.date + ' - ' + months[to.month] + ' ' + to.date + ', ' + from.year;
            } else text = months[from.month] + ' ' + from.date + ' ' + from.year + ' - ' + months[to.month] + ' ' + to.date + ', ' + to.year;
        } else if (this.viewPreset == 'PSA.RA.ViewPreset.Monthly') {
            text = months[from.month] + ' ' + from.year + ' - ' + months[to.month] + ' ' + to.year;
        }
        Ext4.getCmp('rangefield').setText(text);
    },
    autofit : function() {
        var totalViewHeight = Ext4.getBody().getViewSize().height - Ext4.getBody().getPadding('t'); //padding only for 14.1
        var schedulerTop = Ext4.getCmp('psa-ptm-app').getBox().top;
        var standardMargin = 15;
        this.setHeight(totalViewHeight - schedulerTop - standardMargin);
        /*
         * autofit paging toolbar
         */
        Ext4.getCmp('ra-page-toolbar').doLayout();
    },
    /*
     * Limits the start and end dates where a task can be reassigned or resized
     * Reassign & resize have different end date constraints so we need to use an optional parameter: isResize
     */
    getDateConstraints: function (resourceRecord, eventRecord, isResize) {
        if (eventRecord) {
            //console.debug('==========');
            //console.debug('isResize: ' + isResize);
            //console.debug('StartDate: ' + eventRecord.get('StartDate'));
            //console.debug('EndDate: ' + eventRecord.get('EndDate'));
            //console.debug('Range Start: ' + PSA.RA.App.getStart());
            //console.debug('Range End: ' + PSA.RA.App.getEnd());
            //console.debug('isDateDraggable: ' + eventRecord.get('isDateDraggable'));
            //console.debug('finishByDate: ' + eventRecord.get('finishByDate'));
            var reassignEndConstraint = eventRecord.get('isDateDraggable') ? (eventRecord.get('finishByDate') ? new Date(eventRecord.get('finishByDate').getTime() + 86400000) : PSA.RA.App.getEnd()) : eventRecord.get('EndDate');
            var resizeEndConstraint = PSA.RA.App.getEnd();
            var tmpStart = startConstraint = eventRecord.get('isDateDraggable') ? PSA.RA.App.getStart() : eventRecord.get('StartDate');
            var tmpEnd = isResize ? resizeEndConstraint : reassignEndConstraint;
            return {
                start : tmpStart.getTime() < PSA.RA.App.getStart().getTime() ? PSA.RA.App.getStart() : tmpStart,
                end : tmpEnd.getTime() > PSA.RA.App.getEnd().getTime() ? PSA.RA.App.getEnd() : tmpEnd
            };
        }
    },
    expandAll : function() {
        PSA.RA.App.getRootNode().childNodes.forEach(function(child) {
            if(child.hasChildNodes()) child.expand();
        });
    },
    collapseAll : function() {
        PSA.RA.App.getRootNode().childNodes.forEach(function(child) {
            if(child.hasChildNodes()) child.collapse();
        });
    },
    mask : function() {
        this.view.loadMask.msg = translatedStrings.getText('MESSAGE.MASK.WORKING');
        this.view.loadMask.show();
    },
    unmask : function() {
        this.view.loadMask.hide();
        this.view.loadMask.msg = translatedStrings.getText('MESSAGE.MASK.LOADING_RESOURCES');
    },
    loadExportData : function(format) {
        perfTestLogger.start('Export - ' + format);
        this.exportFormat = format;
        this.resourceStore = PSA.RA.dataStores.chartResource;
        
        this.resourceStore.allDataParams.limit = 4000;
        var tmpStart = this.resourceStore.allDataParams.start;
        this.resourceStore.allDataParams.start = 0;
        var tmpSelected = this.resourceStore.allDataParams.selectedResources;
        this.resourceStore.allDataParams.selectedResources = null;
        PSA.RA.dataStores.expResourceStore.load({
            params : PSA.RA.dataStores.chartResource.allDataParams
        });
        PSA.RA.dataStores.expAllocStore.load({
            params : PSA.RA.dataStores.chartResource.allDataParams
        });
        
        this.resourceStore.allDataParams.limit = PSA.RA.dataStores.settingStore.getLimit();
        this.resourceStore.allDataParams.selectedResources = tmpSelected;
        this.resourceStore.allDataParams.start = tmpStart;
        perfTestLogger.stop();
    },
    exportFile : function() {
        if (!(PSA.RA.dataStores.expResourceStore.isLoaded && PSA.RA.dataStores.expAllocStore.isLoaded)) return;
        var data = {
            exportFormat: this.exportFormat,
            rows : []
        };
        var resource = PSA.RA.dataStores.expResourceStore.getRootNode().getChildAt(0);
        while (resource) {
            var project = resource.getChildAt(0);
            while (project) {
                var events = PSA.RA.dataStores.expAllocStore.query('ResourceId', project.get('Id'));
                for (var i = 0; i < events.getCount(); i++) {
                    var event = events.getAt(i);
                    data.rows.push({
                        name : resource.get('Name'),
                        customerProject : project.get('Name'),
                        task : event.get('Name'),
                        startdate : event.get('tipStartDate'),
                        enddate : event.get('tipEndDate'),
                        estimatedWork : event.get('estimatedHours'),
                        actualWork : event.get('actualHours'),
                        unitCost : event.get('unitCost'),
                        unitPrice : event.get('unitPrice'),
                        units : event.get('tipUnits'),
                        serviceItem : event.get('serviceItem')
                    });
                }
                project = project.nextSibling;
            }
            resource = resource.nextSibling;
        }
        
        this.submitHiddenForm(nlapiResolveURL('SUITELET', 'customscript_ptm_sl_data_exporter', 'customdeploy_ptm_sl_data_exporter'), data);
    },
    submitHiddenForm : function(url, params) {
        if (!this.tempInput) {
            this.tempInput = document.createElement("input");
            this.tempInput.type = "text";
            this.tempInput.name = "params";
        }
        if (!this.tempForm) {
            this.tempForm = document.createElement("form");
            this.tempForm.method = "POST";
            this.tempForm.style.display = "none";
            this.tempForm.appendChild(this.tempInput);
            document.body.appendChild(this.tempForm);
        }
        this.tempInput.value = JSON.stringify(params);
        this.tempForm.action = url;
        this.tempForm.submit();
        perfTestLogger.stop();
    }
});
