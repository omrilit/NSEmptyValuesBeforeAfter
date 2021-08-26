/**
 * © 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

Ext4.define('PSA.RA.Forms.TaskAssignment', {
    id : 'ra-form-taskAssignment',
    extend : 'PSA.RA.UIComponent.Window',
    width : 460,
    title : translatedStrings.getText('WINDOW.EDIT_TASK_ASSIGNMENT'),
    listeners : {
        beforeShow : function() {
            var form = Ext4.getCmp('ra-form-taskAssignment');
            var selectedEvent = PSA.RA.App.selectedEvent;
            var resourceId = parseInt(selectedEvent.getPTMResourceID());
            var resourceFld = Ext4.getCmp('taskAssignment-resource');
            var chartDensity = PTM.Settings.get('chartDensity');
            
            form.chartDensity = chartDensity;
            
            resourceFld.isGenericResource = selectedEvent.raw.isProjectTemplate;

            resourceFld.init('projectresource');

            var oldId = resourceFld.getValue();
            if (oldId != resourceId) {
                resourceFld.forAutoCompute = true;
            } 
            resourceFld.setSelectedValue(resourceId, selectedEvent.resourceName);
            Ext4.getCmp('taskAssignment-customer').setValue(selectedEvent.get('projectName'));
            Ext4.getCmp('taskAssignment-task').setValue(selectedEvent.get('Name'));
            Ext4.getCmp('taskAssignment-startDate').forAutoCompute = true;
            Ext4.getCmp('taskAssignment-startDate').setValue(selectedEvent.get('StartDate'));
            Ext4.getCmp('taskAssignment-startDate').forAutoCompute = false; //reset forAutoCompute in case no change from previous value
            Ext4.getCmp('taskAssignment-endDate').forAutoCompute = true;
            Ext4.getCmp('taskAssignment-endDate').setValue(selectedEvent.get('trueEndDate'));
            Ext4.getCmp('taskAssignment-endDate').forAutoCompute = false; //reset forAutoCompute in case no change from previous value
            Ext4.getCmp('taskAssignment-estimatedWork').forAutoCompute = true;
            Ext4.getCmp('taskAssignment-estimatedWork').setValue(selectedEvent.get('estimatedHours'));
            Ext4.getCmp('taskAssignment-estimatedWork').forAutoCompute = false; //reset forAutoCompute in case no change from previous value
            Ext4.getCmp('taskAssignment-actualWork').setValue(selectedEvent.get('actualHours'));
            Ext4.getCmp('taskAssignment-unitCost').setValue(selectedEvent.get('unitCost'));
            Ext4.getCmp('taskAssignment-unitPrice').setValue(selectedEvent.get('unitPrice'));
            Ext4.getCmp('taskAssignment-serviceItem').init('serviceitem');
            Ext4.getCmp('chartDensity' + chartDensity).setValue(true);
            if (selectedEvent.get('serviceItem') == '') Ext4.getCmp('taskAssignment-serviceItem').setRawValue(translatedStrings.getText('MESSAGE.EMPTYTEXT.NONE'));
            else Ext4.getCmp('taskAssignment-serviceItem').setRawValue(selectedEvent.get('serviceItem'));
            Ext4.getCmp('taskAssignment-unitsPercent').forAutoCompute = true;
            Ext4.getCmp('taskAssignment-unitsPercent').setValue(selectedEvent.get('units'));
            Ext4.getCmp('taskAssignment-unitsPercent').forAutoCompute = false; //reset forAutoCompute in case no change from previous value
            if (!PSA.RA.dataStores.permissionStore.editTask()) {
                Ext4.getCmp('taskAssignment-resource').setReadOnly(true);
                Ext4.getCmp('taskAssignment-startDate').setReadOnly(true);
                Ext4.getCmp('taskAssignment-endDate').setReadOnly(true);
                Ext4.getCmp('taskAssignment-estimatedWork').setReadOnly(true);
                Ext4.getCmp('taskAssignment-unitCost').setReadOnly(true);
                Ext4.getCmp('taskAssignment-unitPrice').setReadOnly(true);
                Ext4.getCmp('taskAssignment-serviceItem').setReadOnly(true);
                Ext4.getCmp('taskAssignment-unitsPercent').setReadOnly(true);
                Ext4.getCmp('taskAssignment-saveBtn').hide();
                Ext4.getCmp('taskAssignment-deleteBtn').hide();
                Ext4.getCmp('taskAssignment-separator').hide();
                return;
            }

            var startDate = Ext4.getCmp('taskAssignment-startDate').getValue();
            var endDate = Ext4.getCmp('taskAssignment-endDate').getValue();
            var finishByDate = selectedEvent.get('finishByDate');
            Ext4.getCmp('taskAssignment-endDate').setMinValue(startDate);
            Ext4.getCmp('taskAssignment-endDate').setMaxValue(finishByDate);
            Ext4.getCmp('taskAssignment-startDate').setMaxValue(endDate);
            /*
             * Constraints
             */
            Ext4.getCmp('taskAssignment-deleteBtn').enable();
            Ext4.getCmp('taskAssignment-startDate').enable();

            var constraintType = selectedEvent.get('constraintType'); //either 'FIXEDSTART' or 'ASAP'
            if (constraintType == 'ASAP') {
                Ext4.getCmp('taskAssignment-startDate').disable();
            }

            var actualHours = selectedEvent.get('actualHours');
            if (actualHours > 0) {
                Ext4.getCmp('taskAssignment-deleteBtn').disable();
                Ext4.getCmp('taskAssignment-startDate').disable();
            }
            var POS_MAX_LIM = 9999999999999.99;
            var NEG_MAX_LIM_UC = -999999999999999000;
            var NEG_MAX_LIM_UP = -999999999999999.90;
            var estimatedWork = Ext4.getCmp('taskAssignment-estimatedWork').getValue();
            var unitCost = Ext4.getCmp('taskAssignment-unitCost').getValue();
            var unitPrice = Ext4.getCmp('taskAssignment-estimatedWork').getValue();
            Ext4.getCmp('taskAssignment-estimatedWork').setMinValue(selectedEvent.get('actualHours'));
            var maxEWfromUC;
            if (!unitCost) maxEWfromUC = Number.MAX_VALUE;
            else maxEWfromUC = (unitCost > 0) ? POS_MAX_LIM / unitCost : NEG_MAX_LIM_UC / unitCost;
            var maxEWfromUP;
            if (!unitPrice) maxEWfromUP = Number.MAX_VALUE;
            else maxEWfromUP = (unitPrice > 0) ? POS_MAX_LIM / unitPrice : NEG_MAX_LIM_UP / unitPrice;
            var maxEW = (maxEWfromUC < maxEWfromUP) ? maxEWfromUC : maxEWfromUP;
            maxEW = (maxEW < 2080) ? maxEW : 2080; //default max for estimatedwork
            Ext4.getCmp('taskAssignment-estimatedWork').setMaxValue(maxEW.toFixed(2));
            if ((estimatedWork) && (estimatedWork > 0)) {
                var minUC = NEG_MAX_LIM_UC / estimatedWork;
                Ext4.getCmp('taskAssignment-unitCost').setMinValue(minUC.toFixed(2));
                var maxUC = POS_MAX_LIM / estimatedWork;
                Ext4.getCmp('taskAssignment-unitCost').setMaxValue(maxUC.toFixed(2));
                var minUP = NEG_MAX_LIM_UP / estimatedWork;
                Ext4.getCmp('taskAssignment-unitPrice').setMinValue(minUP.toFixed(2));
                var maxUP = POS_MAX_LIM / estimatedWork;
                Ext4.getCmp('taskAssignment-unitPrice').setMaxValue(maxUP.toFixed(2));
            } else {
                Ext4.getCmp('taskAssignment-unitCost').setMinValue(NEG_MAX_LIM_UC);
                Ext4.getCmp('taskAssignment-unitCost').setMaxValue(POS_MAX_LIM);
                Ext4.getCmp('taskAssignment-unitPrice').setMinValue(NEG_MAX_LIM_UP);
                Ext4.getCmp('taskAssignment-unitPrice').setMaxValue(POS_MAX_LIM);
            }
        },
        show : function() {
            Ext4.getCmp('taskAssignment-startDate').validate();
            Ext4.getCmp('taskAssignment-endDate').validate();
            Ext4.getCmp('taskAssignment-estimatedWork').validate();
            Ext4.getCmp('taskAssignment-unitCost').validate();
            Ext4.getCmp('taskAssignment-unitPrice').validate();
        },
        hide : function() {
            Ext4.getCmp('taskAssignment-estimatedWork').setMinValue(0);
            Ext4.getCmp('taskAssignment-resource').setReadOnly(false);
            Ext4.getCmp('taskAssignment-startDate').setReadOnly(false);
            Ext4.getCmp('taskAssignment-endDate').setReadOnly(false);
            Ext4.getCmp('taskAssignment-estimatedWork').setReadOnly(false);
            Ext4.getCmp('taskAssignment-unitCost').setReadOnly(false);
            Ext4.getCmp('taskAssignment-unitPrice').setReadOnly(false);
            Ext4.getCmp('taskAssignment-serviceItem').setReadOnly(false);
            Ext4.getCmp('taskAssignment-unitsPercent').setReadOnly(false);
            Ext4.getCmp('taskAssignment-saveBtn').show();
            Ext4.getCmp('taskAssignment-deleteBtn').show();
            Ext4.getCmp('taskAssignment-separator').show();
        }
    },
    items : [
        Ext4.create('Ext4.form.Panel', {
            id : 'ra-viewTaskDetailPanel',
            layout : 'form',
            border : false,
            padding : 10,
            autoHeight : true,
            dockedItems : [
                {
                    xtype : 'toolbar',
                    dock : 'top',
                    ui : 'footer',
                    padding : '0 0 10 0',
                    items : [
                        Ext4.create('PSA.RA.UIComponent.BlueButton', {
                            id : 'taskAssignment-saveBtn',
                            text : translatedStrings.getText('BUTTON.SAVE'),
                            formBind : true,
                            handler : function() {
                                perfTestLogger.start('Save Task Assignment');
                                var event = PSA.RA.App.selectedEvent;
                                //Get current values
                                var currAssigneeId = event.getPTMResourceID();
                                var currProjectId = event.getPTMProjectID();
                                var currTaskId = event.getPTMTaskID();
                                var currStartDate = Ext4.Date.clearTime(event.get('StartDate'));
                                var currTrueEndDate = Ext4.Date.clearTime(event.get('trueEndDate'));
                                var currEstimatedWork = event.get('estimatedHours');
                                var currActualWork = event.get('actualHours');
                                var currUnitCost = event.get('unitCost');
                                var currUnitPrice = event.get('unitPrice');
                                var currUnits = event.get('units');
                                var currServiceItem = event.get('serviceItem');
                                var updAssigneeId = Ext4.getCmp('taskAssignment-resource').getValue();
                                                                
                                var updStartDate = Ext4.getCmp('taskAssignment-startDate').getValue();
                                var updTrueEndDate = Ext4.getCmp('taskAssignment-endDate').getValue();
                                var updEstimatedWork = Ext4.getCmp('taskAssignment-estimatedWork').getValue();
                                var updUnitCost = parseFloat(Ext4.getCmp('taskAssignment-unitCost').getValue());
                                var updUnitPrice = parseFloat(Ext4.getCmp('taskAssignment-unitPrice').getValue());
                                var updUnits = parseFloat(Ext4.getCmp('taskAssignment-unitsPercent').getValue());
                                var updServiceItem = Ext4.getCmp('taskAssignment-serviceItem').getRawValue();
                                //check if task assignment is edited
                                var edited = false;
                                if (currStartDate.getTime() != updStartDate.getTime()) edited = true;
                                if (currTrueEndDate.getTime() != updTrueEndDate.getTime()) edited = true;
                                if (currEstimatedWork != updEstimatedWork) edited = true;
                                if (currUnitCost != updUnitCost) edited = true;
                                if (currUnitPrice != updUnitPrice) edited = true;
                                if (currUnits != updUnits) edited = true;
                                if (currAssigneeId != updAssigneeId) edited = true;
                                if (currServiceItem != updServiceItem) edited = true;
                                if (edited) {
                                    event.beginEdit();
                                    event.set('estimatedHours', updEstimatedWork);
                                    event.set('unitCost', updUnitCost);
                                    event.set('unitPrice', updUnitPrice);
                                    event.set('units', updUnits);
                                    event.set('serviceItem', updServiceItem);
                                    event.setResourceId(updAssigneeId + '~' + currProjectId + '~' + currTaskId);
                                    event.set('StartDate', updStartDate);
                                    event.set('trueEndDate', updTrueEndDate);
                                    event.set('EndDate', updTrueEndDate.setDate(updTrueEndDate.getDate() + 1));
                                    event.endEdit();
                                    var chartSaver = PSA.RA.dataStores.chartEventSaver;
                                    chartSaver.transferModifiedRecords();
                                    chartSaver.sync({
                                        success : function(batch) {
                                            PSA.RA.dataStores.chartResource.loadWithFilters('edittask');
                                            PSA.RA.App.formTaskAssignment.hide();
                                        },
                                        failure : function(batch) {
                                            var message = batch.proxy.reader.jsonData.message;
                                            PSA.RA.App.formTaskAssignment.hide();
                                            alert(translatedStrings.getText('MESSAGE.ERROR.SAVE_ASSIGNMENT') + '\n' + message);
                                        }
                                    });
                                } else {
                                    PSA.RA.App.formTaskAssignment.hide();
                                }
                            }
                        }), Ext4.create('PSA.RA.UIComponent.GrayButton', {
                            id : 'taskAssignment-cancelBtn',
                            text : translatedStrings.getText('BUTTON.CANCEL'),
                            handler : function() {
                                PSA.RA.App.formTaskAssignment.hide();
                            }
                        }), Ext4.create('PSA.RA.UIComponent.MenuSeparator', {
                            id : 'taskAssignment-separator'
                        }), Ext4.create('PSA.RA.UIComponent.GrayButton', {
                            text : translatedStrings.getText('BUTTON.DELETE'),
                            id : 'taskAssignment-deleteBtn',
                            handler : function() {
                                perfTestLogger.start('Delete Task Assignment');
                                if (confirm(translatedStrings.getText('MESSAGE.WARNING.DELETE_ASSIGNMENT'))) {
                                    var event = PSA.RA.App.selectedEvent;
                                    event.set('isDelete', true);
                                    var chartSaver = PSA.RA.dataStores.chartEventSaver;
                                    chartSaver.transferModifiedRecords();
                                    chartSaver.sync({
                                        success : function(batch) {
                                            PSA.RA.dataStores.chartResource.loadWithFilters('edittask');
                                            PSA.RA.App.formTaskAssignment.hide();
                                        },
                                        failure : function(batch) {
                                            var message = batch.proxy.reader.jsonData.message;
                                            alert(translatedStrings.getText('MESSAGE.ERROR.DELETE_ASSIGNMENT') + '\n' + + message);
                                            PSA.RA.App.formTaskAssignment.hide();
                                        }
                                    });
                                }
                            }
                        })
                    ]
                }
            ],
            items : [
                Ext4.create('Ext4.form.FieldSet', {
                    layout : 'vbox',
                    border : false,
                    style: 'margin: 0',
                    defaults : {
                        width : 400
                    },
                    items : [
                        Ext4.create('PSA.RA.UIComponent.ComboOrLargeDataField', { 
                            id: 'taskAssignment-resource',
                            fLabel: translatedStrings.getText('COMBOBOX.RESOURCE'),
                            eText: '',
                            forAutoCompute: true,
                            workCalendar : null,
                            setSelectedValue : function(resourceId, resourceName) {
                                var me = this;
                                var form = Ext4.getCmp('ra-form-taskAssignment');
                                var store = me.getStore();
                                var resource = form.addMissingResource(resourceId, store);
                                me.setValue(store, parseInt(resource.Id), resource.Name);
                                Ext4.getCmp('ra-form-taskAssignment').setDisabledDates(resource.details.workcalendar);
                            }
                        }),
                        Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                            layout : 'hbox',
                            items : [
                                Ext4.create('PSA.RA.UIComponent.Display', {
                                    id : 'taskAssignment-customer',
                                    fieldLabel : translatedStrings.getText('COMBOBOX.CUSTOMER_PROJECT'),
                                    labelWidth : 110,
                                    labelAlign : 'top'
                                }), 
                            ]
                        }),
                        Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                            layout : 'hbox',
                            items : [
                                Ext4.create('PSA.RA.UIComponent.Display', {
                                    id : 'taskAssignment-task',
                                    fieldLabel : translatedStrings.getText('DISPLAY.TASK'),
                                    labelWidth : 110,
                                    labelAlign : 'top'
                                }),
                            ]
                        }),
                        Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                            layout : 'hbox',
                            items : [
                                Ext4.create('PSA.RA.UIComponent.Date', {
                                    id : 'taskAssignment-startDate',
                                    fieldLabel : translatedStrings.getText('DATE.START_DATE'),
                                    flex : 0.5,
                                    allowBlank : true,
                                    labelWidth : 110,
                                    editable : false,
                                    forAutoCompute : false,
                                    labelAlign : 'top',
                                    listeners : {
                                        'change' : function(d, newV, oldV) {
                                            if (this.forAutoCompute) {
                                                this.forAutoCompute = false;
                                                return;
                                            }
                                            Ext4.getCmp('taskAssignment-endDate').setMinValue(newV);
                                            var event = PSA.RA.App.selectedEvent;
                                            var startDate = event.get('StartDate');
                                            var trueEndDate = Ext4.getCmp('taskAssignment-endDate').getValue();
                                            var estimatedHours = event.get('estimatedHours');
                                            var unitPercent = Ext4.getCmp('taskAssignment-unitsPercent').getValue();
                                            var workCalendar = Ext4.getCmp('taskAssignment-resource').getWorkCalendar();
                                            /*
                                             * Auto Compute
                                             */
                                            if (!workCalendar) return;
                                            var hoursPerDay = workCalendar.hoursperday;
                                            var workingDays = Ext4.getCmp('ra-form-taskAssignment').getWorkingDays(workCalendar, newV.getTime(), trueEndDate.getTime());
                                            var newEstimatedHours = workingDays * hoursPerDay * parseFloat(unitPercent) / 100;
                                            Ext4.getCmp('taskAssignment-estimatedWork').forAutoCompute = true;
                                            Ext4.getCmp('taskAssignment-estimatedWork').setValue(newEstimatedHours);
                                        }
                                    }
                                })
                            ]
                        }),
                        Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                            layout : 'hbox',
                            items : [
                                Ext4.create('PSA.RA.UIComponent.Date', {
                                    id : 'taskAssignment-endDate',
                                    fieldLabel : translatedStrings.getText('DATE.END_DATE'),
                                    flex : 0.5,
                                    allowBlank : true,
                                    labelWidth : 110,
                                    editable : false,
                                    forAutoCompute : false,
                                    labelAlign : 'top',
                                    listeners : {
                                        'change' : function(d, newV, oldV) {
                                            Ext4.getCmp('taskAssignment-startDate').setMaxValue(newV);
                                            if (this.forAutoCompute) {
                                                this.forAutoCompute = false;
                                                return;
                                            }
                                            /*
                                             * Constraints
                                             */
                                            var event = PSA.RA.App.selectedEvent;
                                            var lastActualDate = event.get('lastActualDate');
                                            var endDate = event.get('trueEndDate');
                                            var startDate = Ext4.getCmp('taskAssignment-startDate').getValue();
                                            var estimatedHours = event.get('estimatedHours');
                                            var unitPercent = Ext4.getCmp('taskAssignment-unitsPercent').getValue();
                                            var actualHours = event.get('actualHours');
                                            var workCalendar = Ext4.getCmp('taskAssignment-resource').getWorkCalendar();
                                            if (Number(actualHours) && (newV < lastActualDate)) {//only check lastActualDate if actualHours > 0
                                                alert(translatedStrings.getText('MESSAGE.ERROR.EARLIER_THAN_TIME_WORKED'));
                                                this.forAutoCompute = true;
                                                this.setValue(endDate);
                                                return;
                                            }
                                            /*
                                             * Auto Compute
                                             */
                                            var newEstimatedHours;
                                            if (!workCalendar) return;
                                            var hoursPerDay = workCalendar.hoursperday;
                                            if ((actualHours > 0) && (lastActualDate) && (newV.getTime() == lastActualDate.getTime())) {
                                                //if new date is same as last equal date
                                                newEstimatedHours = actualHours;
                                            } else if ((actualHours > 0) && (lastActualDate) && (newV.getTime() > lastActualDate.getTime())) {
                                                //if new date is not same as last equal date
                                                var OffsetDate = new Date(lastActualDate.getTime());
                                                OffsetDate.setDate(OffsetDate.getDate() + 1);
                                                var workingDaysAfterLastActual = Ext4.getCmp('ra-form-taskAssignment').getWorkingDays(workCalendar, OffsetDate.getTime(), newV.getTime());
                                                var OffsetEstimatedHours = workingDaysAfterLastActual * hoursPerDay * parseFloat(unitPercent) / 100;
                                                newEstimatedHours = parseFloat(actualHours) + parseFloat(OffsetEstimatedHours);
                                            } else {
                                                //if there are no tracked hours
                                                var workingDays = Ext4.getCmp('ra-form-taskAssignment').getWorkingDays(workCalendar, startDate.getTime(), newV.getTime());
                                                newEstimatedHours = workingDays * hoursPerDay * parseFloat(unitPercent) / 100;
                                            }
                                            Ext4.getCmp('taskAssignment-estimatedWork').forAutoCompute = true;
                                            Ext4.getCmp('taskAssignment-estimatedWork').setValue(newEstimatedHours);
                                        }
                                    }
                                })
                            ]
                        }),
                        Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                            layout : 'hbox',
                            items : [
                                Ext4.create('PSA.RA.UIComponent.Number', {
                                    id : 'taskAssignment-estimatedWork',
                                    flex : 0.5,
                                    fieldLabel : translatedStrings.getText('NUMBER.ESTIMATED_WORK'),
                                    //emptyText : translatedStrings.getText('MESSAGE.EMPTYTEXT.BLANK'),
                                    labelWidth : 110,
                                    allowBlank : false,
                                    minValue : 0,
                                    maxValue : 2080,
                                    forAutoCompute : false,
                                    labelAlign : 'top',
                                    listeners : {
                                        change : function(field, newValue, oldValue, eOpts) {
                                            /*
                                             * compute for unit cost and unit price limits
                                             */
                                            var POS_MAX_LIM = 9999999999999.99;
                                            var NEG_MAX_LIM_UC = -999999999999999000;
                                            var NEG_MAX_LIM_UP = -999999999999999.90;
                                            var estimatedWork = newValue;
                                            if ((estimatedWork) && (estimatedWork > 0)) {
                                                var minUC = NEG_MAX_LIM_UC / estimatedWork;
                                                Ext4.getCmp('taskAssignment-unitCost').setMinValue(minUC.toFixed(2));
                                                var maxUC = POS_MAX_LIM / estimatedWork;
                                                Ext4.getCmp('taskAssignment-unitCost').setMaxValue(maxUC.toFixed(2));
                                                var minUP = NEG_MAX_LIM_UP / estimatedWork;
                                                Ext4.getCmp('taskAssignment-unitPrice').setMinValue(minUP.toFixed(2));
                                                var maxUP = POS_MAX_LIM / estimatedWork;
                                                Ext4.getCmp('taskAssignment-unitPrice').setMaxValue(maxUP.toFixed(2));
                                            } else {
                                                Ext4.getCmp('taskAssignment-unitCost').setMinValue(NEG_MAX_LIM_UC);
                                                Ext4.getCmp('taskAssignment-unitCost').setMaxValue(POS_MAX_LIM);
                                                Ext4.getCmp('taskAssignment-unitPrice').setMinValue(NEG_MAX_LIM_UP);
                                                Ext4.getCmp('taskAssignment-unitPrice').setMaxValue(POS_MAX_LIM);
                                            }
                                            Ext4.getCmp('taskAssignment-unitCost').validate();
                                            Ext4.getCmp('taskAssignment-unitPrice').validate();
                                            /*
                                             * Auto-compute
                                             */
                                            if (this.forAutoCompute) {
                                                this.forAutoCompute = false;
                                                return;
                                            }
                                            var event = PSA.RA.App.selectedEvent;
                                            var endDate = Ext4.getCmp('taskAssignment-endDate').getValue();
                                            var startDate = Ext4.getCmp('taskAssignment-startDate').getValue();
                                            var estimatedHours = event.get('estimatedHours');
                                            var unitPercent = Ext4.getCmp('taskAssignment-unitsPercent').getValue();
                                            var actualHours = event.get('actualHours');
                                            var lastActualDate = event.get('lastActualDate');
                                            var workCalendar = Ext4.getCmp('taskAssignment-resource').getWorkCalendar();
                                            if (!workCalendar) return;
                                            var newEndDate = new Date();
                                            var hoursPerDay = workCalendar.hoursperday;
                                            if ((actualHours > 0) && (lastActualDate) && (newValue <= actualHours)) {
                                                //set to last actual date
                                                newEndDate = new Date(lastActualDate.getTime());
                                            } else if ((actualHours > 0) && (lastActualDate) && (newValue > actualHours)) {
                                                newValue = (newValue > 2080) ? 2080 : newValue;
                                                var OffsetDate = new Date(lastActualDate.getTime());
                                                OffsetDate.setDate(OffsetDate.getDate() + 1);
                                                var diffDaysAfterLastActual = Math.ceil((newValue - actualHours) / (hoursPerDay * parseFloat(unitPercent) / 100));
                                                newEndDate = Ext4.getCmp('ra-form-taskAssignment').getNewEndDate(OffsetDate.getTime(), diffDaysAfterLastActual, workCalendar);
                                            } else {
                                                newValue = (newValue > 2080) ? 2080 : newValue;
                                                var diffDays = Math.ceil(newValue / (hoursPerDay * parseFloat(unitPercent) / 100));
                                                newEndDate = Ext4.getCmp('ra-form-taskAssignment').getNewEndDate(startDate.getTime(), diffDays, workCalendar);
                                                if (!newValue) newEndDate = startDate;
                                            }
                                            Ext4.getCmp('taskAssignment-endDate').forAutoCompute = true;
                                            Ext4.getCmp('taskAssignment-endDate').setValue(newEndDate);
                                        }
                                    }
                                })
                            ]
                        }),
                        Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                            layout : 'hbox',
                            items : [
                                Ext4.create('PSA.RA.UIComponent.Display', {
                                    id : 'taskAssignment-actualWork',
                                    flex : 0.5,
                                    fieldLabel : translatedStrings.getText('DISPLAY.ACTUAL_WORK'),
                                    labelWidth : 110,
                                    labelAlign : 'top'
                                })
                            ]
                        }),
                        Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                            layout : 'hbox',
                            items : [
                                Ext4.create('PSA.RA.UIComponent.Number', {
                                    id : 'taskAssignment-unitCost',
                                    fieldLabel : translatedStrings.getText('NUMBER.UNIT_COST'),
                                    flex : 0.5,
                                    //emptyText : translatedStrings.getText('MESSAGE.EMPTYTEXT.BLANK'),
                                    labelWidth : 110,
                                    minValue : -(this.MAX_VALUE),
                                    maxValue : this.MAX_VALUE,
                                    decimalPrecision : 2,
                                    allowBlank : false,
                                    labelAlign : 'top',
                                    listeners : {
                                        change : function(field, newValue, oldValue, eOpts) {
                                            var POS_MAX_LIM = 9999999999999.99;
                                            var NEG_MAX_LIM_UC = -999999999999999000;
                                            var NEG_MAX_LIM_UP = -999999999999999.90;
                                            var unitCost = newValue;
                                            var unitPrice = Ext4.getCmp('taskAssignment-estimatedWork').getValue();
                                            var maxEWfromUC;
                                            if (!unitCost) maxEWfromUC = Number.MAX_VALUE;
                                            else maxEWfromUC = (unitCost > 0) ? POS_MAX_LIM / unitCost : NEG_MAX_LIM_UC / unitCost;
                                            var maxEWfromUP;
                                            if (!unitPrice) maxEWfromUP = Number.MAX_VALUE;
                                            else maxEWfromUP = (unitPrice > 0) ? POS_MAX_LIM / unitPrice : NEG_MAX_LIM_UP / unitPrice;
                                            var maxEW = (maxEWfromUC < maxEWfromUP) ? maxEWfromUC : maxEWfromUP;
                                            maxEW = (maxEW < 2080) ? maxEW : 2080; //default max for estimatedwork
                                            Ext4.getCmp('taskAssignment-estimatedWork').setMaxValue(maxEW.toFixed(2));
                                            Ext4.getCmp('taskAssignment-estimatedWork').validate();
                                        }
                                    }
                                })
                            ]
                        }),
                        Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                            layout : 'hbox',
                            items : [
                                Ext4.create('PSA.RA.UIComponent.Number', {
                                    id : 'taskAssignment-unitPrice',
                                    fieldLabel : translatedStrings.getText('NUMBER.UNIT_PRICE'),
                                    flex : 0.5,
                                    //emptyText : translatedStrings.getText('MESSAGE.EMPTYTEXT.BLANK'),
                                    labelWidth : 110,
                                    minValue : -(this.MAX_VALUE),
                                    maxValue : this.MAX_VALUE,
                                    decimalPrecision : 2,
                                    labelAlign : 'top',
                                    listeners : {
                                        change : function(field, newValue, oldValue, eOpts) {
                                            var POS_MAX_LIM = 9999999999999.99;
                                            var NEG_MAX_LIM_UC = -999999999999999000;
                                            var NEG_MAX_LIM_UP = -999999999999999.90;
                                            var unitCost = Ext4.getCmp('taskAssignment-unitCost').getValue();
                                            var unitPrice = newValue;
                                            var maxEWfromUC;
                                            if (!unitCost) maxEWfromUC = Number.MAX_VALUE;
                                            else maxEWfromUC = (unitCost > 0) ? POS_MAX_LIM / unitCost : NEG_MAX_LIM_UC / unitCost;
                                            var maxEWfromUP;
                                            if (!unitPrice) maxEWfromUP = Number.MAX_VALUE;
                                            else maxEWfromUP = (unitPrice > 0) ? POS_MAX_LIM / unitPrice : NEG_MAX_LIM_UP / unitPrice;
                                            var maxEW = (maxEWfromUC < maxEWfromUP) ? maxEWfromUC : maxEWfromUP;
                                            maxEW = (maxEW < 2080) ? maxEW : 2080; //default max for estimatedwork
                                            Ext4.getCmp('taskAssignment-estimatedWork').setMaxValue(maxEW.toFixed(2));
                                            Ext4.getCmp('taskAssignment-estimatedWork').validate();
                                        }
                                    }
                                })
                            ]
                        }),
                        Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                            layout : 'hbox',
                            items : [
                                Ext4.create('PSA.RA.UIComponent.ComboOrLargeDataField', { 
                                    id: 'taskAssignment-serviceItem',
                                    comboStore: PSA.RA.dataStores.popupServiceItemStore,
                                    fLabel: translatedStrings.getText('COMBOBOX.SERVICE_ITEM'),
                                    eText: '',
                                    flex : 0.5
                                })
                            ]
                        }),
                        Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                            layout : 'hbox',
                            items : [
                                Ext4.create('PSA.RA.UIComponent.Number', {
                                    id : 'taskAssignment-unitsPercent',
                                    fieldLabel : translatedStrings.getText('NUMBER.UNITS_PERCENT'),
                                    flex : 0.5,
                                    labelWidth : 110,
                                    minValue : 5,
                                    maxValue : 500,
                                    allowBlank : false,
                                    forAutoCompute : false,
                                    labelAlign : 'top',
                                    listeners : {
                                        change : function(field, newValue, oldValue, eOpts) {
                                            if (this.forAutoCompute) {
                                                this.forAutoCompute = false;
                                                return;
                                            }
                                            if (!newValue) return; //prevents division by zero
                                            var event = PSA.RA.App.selectedEvent;
                                            var endDate = Ext4.getCmp('taskAssignment-endDate').getValue();
                                            var startDate = Ext4.getCmp('taskAssignment-startDate').getValue();
                                            var estimatedHours = Ext4.getCmp('taskAssignment-estimatedWork').getValue();
                                            var unitPercent = event.get('units');
                                            var actualHours = event.get('actualHours');
                                            var lastActualDate = event.get('lastActualDate');
                                            var workCalendar = Ext4.getCmp('taskAssignment-resource').getWorkCalendar();
                                            if (!workCalendar) return;
                                            /*
                                            
                                             * Auto-compute
                                             */
                                            var newEndDate = new Date();
                                            var hoursPerDay = workCalendar.hoursperday;
                                            if ((actualHours > 0) && (lastActualDate)) {
                                                var OffsetDate = new Date(lastActualDate.getTime());
                                                OffsetDate.setDate(OffsetDate.getDate() + 1);
                                                var diffDaysAfterLastActual = Math.ceil((estimatedHours - actualHours) / (hoursPerDay * newValue / 100));
                                                newEndDate = Ext4.getCmp('ra-form-taskAssignment').getNewEndDate(OffsetDate.getTime(), diffDaysAfterLastActual, workCalendar);
                                            } else {
                                                var diffDays = Math.ceil(estimatedHours / (hoursPerDay * newValue / 100));
                                                newEndDate = Ext4.getCmp('ra-form-taskAssignment').getNewEndDate(startDate.getTime(), diffDays, workCalendar);
                                            }
                                            Ext4.getCmp('taskAssignment-endDate').forAutoCompute = true;
                                            Ext4.getCmp('taskAssignment-endDate').setValue(newEndDate);
                                        }
                                    }
                                })
                            ]
                        })
                    ]
                })
            ]
        })
    ],
    getDiffDays : function(endDate, newValue) {
        var timeDiff = Math.abs(endDate.getTime() - newValue.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays;
    },
    getNonWorkingDays : function(workCalendar) {
        var week = new Array();
        week.push(workCalendar.sunday);
        week.push(workCalendar.monday);
        week.push(workCalendar.tuesday); 
        week.push(workCalendar.wednesday); 
        week.push(workCalendar.thursday); 
        week.push(workCalendar.friday); 
        week.push(workCalendar.saturday); 
        var nonWorkingDays = new Array();
        for ( var i = 0; i < week.length; i++) {
            if (week[i] == 'F') {
                nonWorkingDays.push(i);
            }
        }
        return nonWorkingDays;
    },
    getExceptionDays : function(workCalendar) {
        var exceptionDays = new Array();
        if (workCalendar.nonWork) {
            for (i in workCalendar.nonWork) {
                var expDate = PSA.RA.App.nonWorkStringToDate(workCalendar.nonWork[i].exceptiondate);
                //expDate.setHours(0,0,0,0);
                exceptionDays.push(expDate.getTime());
            }
        }
        return exceptionDays;
    },
    getWorkingDays : function(workCalendar, startDateTime, newValueTime) {
        /*
         * Get non working days
         */
        var nonWorkingDays = this.getNonWorkingDays(workCalendar);
        /*
         * Get exception dates
         */
        var exceptionDays = this.getExceptionDays(workCalendar);
        //console.log(exceptionDays);
        /*
        
         * Compute for working days
         */
        var numWorkingDays;
        var toDate = new Date(newValueTime);
        var fromDate = new Date(startDateTime);
        //console.log(fromDate + ' ' + toDate);
        //console.log(nonWorkingDays);
        for (numWorkingDays = 0; fromDate <= toDate; fromDate.setDate(fromDate.getDate() + 1)) {
            //console.log(fromDate.getDay() + ' ' + fromDate);
            //console.log(fromDate.getTime());
            if ((Ext4.Array.indexOf(nonWorkingDays, fromDate.getDay()) == -1) && (Ext4.Array.indexOf(exceptionDays, fromDate.getTime()) == -1)) {
                numWorkingDays++;
            }
            //console.log(numWorkingDays);
        }
        return numWorkingDays;
    },
    getNewEndDate : function(startDateTime, days, workCalendar) {
        var nonWorkingDays = this.getNonWorkingDays(workCalendar);
        var exceptionDays = this.getExceptionDays(workCalendar);
        /*
         * Compute for End Date
         */
        var newEndDate = new Date(startDateTime);
        for ( var countDays = 0; countDays < days; newEndDate.setDate(newEndDate.getDate() + 1)) {
            if ((Ext4.Array.indexOf(nonWorkingDays, newEndDate.getDay()) == -1) && (Ext4.Array.indexOf(exceptionDays, newEndDate.getTime()) == -1)) {
                countDays++;
            }
        }
        return new Date(newEndDate.setDate(newEndDate.getDate() - 1));
    },
    setDisabledDates : function (workcalendar) {
        var none = new Array();
        none.push('~'); // use a character not used in a dateFormat... example : comma, space or dash
        Ext4.getCmp('taskAssignment-startDate').setDisabledDates(none);
        Ext4.getCmp('taskAssignment-endDate').setDisabledDates(none);
        var week = new Array();
        var nonWorkingDays = new Array();
        if (workcalendar) {
            week.push(workcalendar.sunday);
            week.push(workcalendar.monday);
            week.push(workcalendar.tuesday); 
            week.push(workcalendar.wednesday); 
            week.push(workcalendar.thursday); 
            week.push(workcalendar.friday); 
            week.push(workcalendar.saturday); 
            for ( var i = 0; i < week.length; i++) {
                if (week[i] == 'F') {
                    nonWorkingDays.push(i);
                }
            }
            Ext4.getCmp('taskAssignment-startDate').setDisabledDays(nonWorkingDays);
            Ext4.getCmp('taskAssignment-endDate').setDisabledDays(nonWorkingDays);
            var nonWork = workcalendar.nonWork;
            if (nonWork.length > 0) {
                var holidays = new Array();
                for ( var j = 0; j < nonWork.length; j++) {
                    var holiday = PSA.RA.App.nonWorkStringToDate(nonWork[j].exceptiondate);
                    holidays.push(holiday);
                }
                Ext4.getCmp('taskAssignment-startDate').setDisabledDates(holidays);
                Ext4.getCmp('taskAssignment-endDate').setDisabledDates(holidays);
            }
        }
    },
    addMissingResource : function(resourceId, store) {
        var resourceObj, resource;
        resourceObj = PSA.RA.App.resourceStore.getResourceObjByRow(resourceId +'');
         
        if (resourceObj) {
            resource = resourceObj.raw;
            if (store.find('id', resourceId, 0, false, false, true) < 0) {
                var resourceModel = Ext4.create('PSA.RA.Model.ResourcePopup', {
                    id : resource.Id,
                    name : resource.Name,
                    details : {
                        type : 'resource',
                        laborcost : resource.details.laborcost,
                        workcalendar : {
                            sunday : resource.details.workcalendar.sunday,
                            monday : resource.details.workcalendar.monday,
                            tuesday : resource.details.workcalendar.tuesday,
                            wednesday : resource.details.workcalendar.wednesday,
                            thursday : resource.details.workcalendar.thursday,
                            friday : resource.details.workcalendar.friday,
                            saturday : resource.details.workcalendar.saturday,
                            nonWork : resource.details.workcalendar.nonWork,
                            hoursperday : resource.details.workcalendar.hoursperday
                        }
                    }
                });
                store.add(resourceModel);
            }
        }
        
        return resource;
    },
    resourceChange : function (cb, newValue) {
        var store = cb.getStore();
        var record = store.getById(newValue);
        if (record) {
            var recDetails = record.get('details');
            cb.workCalendar = recDetails.workcalendar;
            
            Ext4.getCmp('ra-form-taskAssignment').setDisabledDates(cb.workCalendar);
            if (cb.forAutoCompute) {
                cb.forAutoCompute = false;
                return;
            }
            var event = PSA.RA.App.selectedEvent;
            var endDate = Ext4.getCmp('taskAssignment-endDate').getValue();
            var startDate = Ext4.getCmp('taskAssignment-startDate').getValue();
            var estimatedHours = Ext4.getCmp('taskAssignment-estimatedWork').getValue();
            var unitPercent = Ext4.getCmp('taskAssignment-unitsPercent').getValue();
            var actualHours = event.get('actualHours');
            var lastActualDate = event.get('lastActualDate');
            var workCalendar = cb.workCalendar;
            var newEndDate = new Date();
            var hoursPerDay = workCalendar.hoursperday;
            if ((actualHours > 0) && (lastActualDate)) {
                var OffsetDate = new Date(lastActualDate.getTime());
                OffsetDate.setDate(OffsetDate.getDate() + 1);
                var diffDaysAfterLastActual = Math.ceil((estimatedHours - actualHours) / (hoursPerDay * unitPercent / 100));
                newEndDate = Ext4.getCmp('ra-form-taskAssignment').getNewEndDate(OffsetDate.getTime(), diffDaysAfterLastActual, workCalendar);
            } else {
                var diffDays = Math.ceil(estimatedHours / (hoursPerDay * unitPercent / 100));
                newEndDate = Ext4.getCmp('ra-form-taskAssignment').getNewEndDate(startDate.getTime(), diffDays, workCalendar);
            }
            Ext4.getCmp('taskAssignment-endDate').forAutoCompute = true;
            Ext4.getCmp('taskAssignment-endDate').setValue(newEndDate);
        }
    }
});

Ext4.define('PSA.RA.Forms.TaskAssignmentView', {
    id : 'ra-view-taskAssignment',
    extend : 'PSA.RA.UIComponent.Window',
    width : 500,
    title : translatedStrings.getText('WINDOW.VIEW_TASK_ASSIGNMENT'),
    listeners : {
        beforeShow : function() {
            var selectedEvent = PSA.RA.App.selectedEvent;
            var resourceId = parseInt(selectedEvent.getPTMResourceID());
            var resource = PSA.RA.dataStores.chartResource.getResourceObjByRow(resourceId).data.Name;
            var startDate = Ext4.Date.format(selectedEvent.get('StartDate'), convertNSDateFormat());
            var endDate = Ext4.Date.format(selectedEvent.get('trueEndDate'), convertNSDateFormat());
            Ext4.getCmp('taskAssignment-view-resource').setValue(resource);
            Ext4.getCmp('taskAssignment-view-customer').setValue(selectedEvent.get('projectName'));
            Ext4.getCmp('taskAssignment-view-task').setValue(selectedEvent.get('Name'));
            Ext4.getCmp('taskAssignment-view-startDate').setValue(startDate);
            Ext4.getCmp('taskAssignment-view-endDate').setValue(endDate);
            Ext4.getCmp('taskAssignment-view-estimatedWork').setValue(selectedEvent.get('estimatedHours'));
            Ext4.getCmp('taskAssignment-view-actualWork').setValue(selectedEvent.get('actualHours'));
            Ext4.getCmp('taskAssignment-view-unitCost').setValue(selectedEvent.get('unitCost'));
            Ext4.getCmp('taskAssignment-view-unitPrice').setValue(selectedEvent.get('unitPrice'));
            Ext4.getCmp('taskAssignment-view-serviceItem').setRawValue(selectedEvent.get('serviceItem'));
            Ext4.getCmp('taskAssignment-view-unitsPercent').setValue(selectedEvent.get('units'));
        }
    },
    items : [
        Ext4.create('Ext4.form.Panel', {
            id : 'ra-view-taskDetailPanel',
            layout : 'form',
            border : false,
            padding : 10,
            autoHeight : true,
            dockedItems : [
                {
                    xtype : 'toolbar',
                    dock : 'top',
                    ui : 'footer',
                    padding : '0 0 10 0',
                    items : [
                        Ext4.create('PSA.RA.UIComponent.GrayButton', {
                            text : translatedStrings.getText('BUTTON.CANCEL'),
                            handler : function() {
                                PSA.RA.App.viewTaskAssignment.hide();
                            }
                        })
                    ]
                }
            ],
            items : [
                Ext4.create('PSA.RA.UIComponent.Display', {
                    id : 'taskAssignment-view-resource',
                    fieldLabel : translatedStrings.getText('COMBOBOX.RESOURCE'),
                    //emptyText : translatedStrings.getText('MESSAGE.EMPTYTEXT.BLANK'),
                    labelWidth : 110
                }), Ext4.create('PSA.RA.UIComponent.Display', {
                    id : 'taskAssignment-view-customer',
                    fieldLabel : translatedStrings.getText('COMBOBOX.CUSTOMER_PROJECT'),
                    labelWidth : 110
                }), Ext4.create('PSA.RA.UIComponent.Display', {
                    id : 'taskAssignment-view-task',
                    fieldLabel : translatedStrings.getText('DISPLAY.TASK'),
                    labelWidth : 110
                }), Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                    layout : 'hbox',
                    items : [
                        Ext4.create('PSA.RA.UIComponent.Display', {
                            id : 'taskAssignment-view-startDate',
                            fieldLabel : translatedStrings.getText('DATE.START_DATE'),
                            flex : 0.5,
                            labelWidth : 110,
                            labelAlign : 'right'
                        }), Ext4.create('PSA.RA.UIComponent.Display', {
                            id : 'taskAssignment-view-endDate',
                            fieldLabel : translatedStrings.getText('DATE.END_DATE'),
                            flex : 0.5,
                            labelWidth : 110
                        })
                    ]
                }), Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                    layout : 'hbox',
                    items : [
                        Ext4.create('PSA.RA.UIComponent.Display', {
                            id : 'taskAssignment-view-estimatedWork',
                            flex : 0.5,
                            fieldLabel : translatedStrings.getText('NUMBER.ESTIMATED_WORK'),
                            //emptyText : translatedStrings.getText('MESSAGE.EMPTYTEXT.BLANK'),
                            labelWidth : 110
                        }), Ext4.create('PSA.RA.UIComponent.Display', {
                            id : 'taskAssignment-view-actualWork',
                            flex : 0.5,
                            fieldLabel : translatedStrings.getText('DISPLAY.ACTUAL_WORK'),
                            labelWidth : 110
                        })
                    ]
                }), Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                    layout : 'hbox',
                    items : [
                        Ext4.create('PSA.RA.UIComponent.Display', {
                            id : 'taskAssignment-view-unitCost',
                            fieldLabel : translatedStrings.getText('NUMBER.UNIT_COST'),
                            flex : 0.5,
                            emptyText : translatedStrings.getText('MESSAGE.EMPTYTEXT.BLANK'),
                            labelWidth : 110,
                            labelAlign : 'right'
                        }), Ext4.create('PSA.RA.UIComponent.Display', {
                            id : 'taskAssignment-view-unitPrice',
                            fieldLabel : translatedStrings.getText('NUMBER.UNIT_PRICE'),
                            flex : 0.5,
                            emptyText : translatedStrings.getText('MESSAGE.EMPTYTEXT.BLANK'),
                            labelWidth : 110
                        })
                    ]
                }), Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                    layout : 'hbox',
                    items : [
                        Ext4.create('PSA.RA.UIComponent.Display', {
                            id : 'taskAssignment-view-serviceItem',
                            fieldLabel : translatedStrings.getText('COMBOBOX.SERVICE_ITEM'),
                            flex : 0.5,
                            labelWidth : 110,
                            emptyText : translatedStrings.getText('MESSAGE.EMPTYTEXT.NONE')
                        }), Ext4.create('PSA.RA.UIComponent.Display', {
                            id : 'taskAssignment-view-unitsPercent',
                            fieldLabel : translatedStrings.getText('NUMBER.UNITS_PERCENT'),
                            flex : 0.5,
                            labelWidth : 110
                        })
                    ]
                })
            ]
        })
    ]
});

Ext4.define('PSA.RA.Forms.AdvFilters', {
    id : 'ra-viewWindow',
    extend : 'PSA.RA.UIComponent.Window',
    width : 460,
    openWindow : function() {
        this.isAdd = (Ext4.getCmp('savedFilters').getValue() <= 0);
        this.isClone = false;
        this.show();
    },
    cloneWindow : function() {
        this.isClone = true;
        this.isAdd = true;
        this.show();
    },
    prefix : translatedStrings.getText('TEXT.CUSTOM_VIEW') + ' ',
    listeners : {
        beforeShow : function(window, eOpts) {
            var me = this;
            me.nameSuffix = '';
            var savedFilterCombo = Ext4.getCmp('savedFilters');
            var savedFilterStore = savedFilterCombo.getStore();
            var record = null;
            
            var assigneesField = Ext4.getCmp('advfilter-assignees');
            assigneesField.init('assignee');
            var customersField = Ext4.getCmp('advfilter-customers');
            customersField.init('customer');
            var projectsField = Ext4.getCmp('advfilter-projects');
            projectsField.init('project');
            var tasksField = Ext4.getCmp('advfilter-tasks');
            tasksField.init('projecttask');
            var ptasksField = Ext4.getCmp('advfilter-parenttasks');
            ptasksField.init('parenttask');
            
            if (me.isClone) {
                me.setTitle(translatedStrings.getText('WINDOW.CLONE_VIEW'));
                Ext4.getCmp('advfilter-delete').hide();
                Ext4.getCmp('advfilter-separator').hide();
                me.nameSuffix = ' ' + translatedStrings.getText('TEXT.COPY');
            } else if (me.isAdd) {
                me.setTitle(translatedStrings.getText('WINDOW.ADD_VIEW'));
                Ext4.getCmp('advfilter-delete').hide();
                Ext4.getCmp('advfilter-separator').hide();
                //                Ext4.getCmp('advfilter-filtername').setValue(me.prefix + PSA.RA.App.globalSettings.data.filterNameCounter);
                return;
            } else {
                me.setTitle(translatedStrings.getText('WINDOW.EDIT_VIEW'));
                Ext4.getCmp('advfilter-delete').show();
                Ext4.getCmp('advfilter-separator').show();
            }
            function eachToInt(array) {
                for ( var i = 0; i < array.length; i++) {
                    if (array[i] != null && array[i] != '') {
                        array[i] = parseInt(array[i]);
                    }
                }
            }
            
            record = savedFilterCombo.getSelectedRecord();
            var filterName = record.get('filterName') + me.nameSuffix;
            var shared = record.get('shared');
            var owner = record.get('owner');
            var taskDate = this.getDateRangeString(record.get('taskDateOperator'), record.get('taskDateValue1'), record.get('taskDateValue2'));
            var assignmentDate = this.getDateRangeString(record.get('assignDateOperator'), record.get('assignDateValue1'), record.get('assignDateValue2'));
            var includeAllResources = record.get('includeAllResources');
            var includeInactive = record.get('includeInactive');
            
            var assignees = record.get('assignees');
            var customers = record.get('customers');
            var projects = record.get('projects');
            var projectTasks = record.get('projectTasks');
            var parentTasks = record.get('parentTasks');
            assignees = assignees != null && assignees != '' ? assignees.split(',') : '';
            customers = customers != null && customers != '' ? customers.split(',') : '';
            projects = projects != null && projects != '' ? projects.split(',') : '';
            projectTasks = projectTasks != null && projectTasks != '' ? projectTasks.split(',') : '';
            parentTasks = parentTasks != null && parentTasks != '' ? parentTasks.split(',') : '';

            var assigneeNames = record.get('assigneeNames');
            var customerNames = record.get('customerNames');
            var projectNames = record.get('projectNames');
            var taskNames = record.get('projectTaskNames');
            var ptaskNames = record.get('parentTaskNames');
            
            eachToInt(assignees);
            eachToInt(customers);
            eachToInt(projects);
            eachToInt(projectTasks);
            eachToInt(parentTasks);
            
            Ext4.getCmp('advfilter-filtername').setValue(filterName);
            Ext4.getCmp('advfilter-sharefilter').setValue(shared);
            Ext4.getCmp('advfilter-projTaskDate').setValue(taskDate);
            Ext4.getCmp('advfilter-taskAssignmentDate').setValue(assignmentDate);
            Ext4.getCmp('advfilter-includeAll').setValue(includeAllResources);
            Ext4.getCmp('advfilter-showInactive').setValue(includeInactive);
            Ext4.getCmp('advfilter-assignees').setRecord(assigneesField.getStore(), assignees, assigneeNames);
            Ext4.getCmp('advfilter-customers').setRecord(customersField.getStore(), customers, customerNames);
            Ext4.getCmp('advfilter-projects').setRecord(projectsField.getStore(), projects, projectNames);
            Ext4.getCmp('advfilter-tasks').setRecord(tasksField.getStore(), projectTasks, taskNames);
            Ext4.getCmp('advfilter-parenttasks').setRecord(ptasksField.getStore(), parentTasks, ptaskNames);
            if (!me.isClone && shared && owner != nlapiGetContext().user) {
                me.setTitle(translatedStrings.getText('WINDOW.VIEW_DETAILS'));
                Ext4.getCmp('advfilter-saveFilter').hide();
                Ext4.getCmp('advfilter-delete').hide();
                Ext4.getCmp('advfilter-separator').hide();
                Ext4.getCmp('advfilter-filtername').setReadOnly(true);
                Ext4.getCmp('advfilter-sharefilter').setReadOnly(true);
                Ext4.getCmp('advfilter-projTaskDate').setReadOnly(true);
                Ext4.getCmp('advfilter-taskAssignmentDate').setReadOnly(true);
                Ext4.getCmp('advfilter-includeAll').setReadOnly(true);
                Ext4.getCmp('advfilter-showInactive').setReadOnly(true);
                Ext4.getCmp('advfilter-assignees').setReadOnly(true);
                Ext4.getCmp('advfilter-customers').setReadOnly(true);
                Ext4.getCmp('advfilter-projects').setReadOnly(true);
                Ext4.getCmp('advfilter-tasks').setReadOnly(true);
                Ext4.getCmp('advfilter-parenttasks').setReadOnly(true);
            }
        },
        hide : function(window, eOpts) {
            this.nameSuffix = '';
            Ext4.getCmp('advfilter-filtername').reset();
            Ext4.getCmp('advfilter-sharefilter').reset();
            Ext4.getCmp('advfilter-projTaskDate').reset();
            Ext4.getCmp('advfilter-taskAssignmentDate').reset();
            Ext4.getCmp('advfilter-includeAll').reset();
            Ext4.getCmp('advfilter-showInactive').reset();
            Ext4.getCmp('advfilter-assignees').close();
            Ext4.getCmp('advfilter-customers').close();
            Ext4.getCmp('advfilter-projects').close();
            Ext4.getCmp('advfilter-tasks').close();
            Ext4.getCmp('advfilter-parenttasks').close();
            Ext4.getCmp('advfilter-filtername').setReadOnly(false);
            Ext4.getCmp('advfilter-sharefilter').setReadOnly(false);
            Ext4.getCmp('advfilter-projTaskDate').setReadOnly(false);
            Ext4.getCmp('advfilter-taskAssignmentDate').setReadOnly(false);
            Ext4.getCmp('advfilter-includeAll').setReadOnly(false);
            Ext4.getCmp('advfilter-showInactive').setReadOnly(false);
            Ext4.getCmp('advfilter-assignees').setReadOnly(false);
            Ext4.getCmp('advfilter-customers').setReadOnly(false);
            Ext4.getCmp('advfilter-projects').setReadOnly(false);
            Ext4.getCmp('advfilter-tasks').setReadOnly(false);
            Ext4.getCmp('advfilter-parenttasks').setReadOnly(false);
            Ext4.getCmp('advfilter-saveFilter').show();
            Ext4.getCmp('advfilter-delete').show();
            Ext4.getCmp('advfilter-separator').show();
            Ext4.getCmp('savedFilters').getStore().sort('name', 'ASC');
        }
    },
    items : [
        Ext4.create('Ext4.form.Panel', {
            id : 'ra-viewWindowPanel',
            layout : 'form',
            border : false,
            padding : 10,
            autoHeight : true,
            items : [
                Ext4.create('Ext4.form.FieldSet', {
                    layout : 'vbox',
                    border : false,
                    style: 'margin: 0',
                    items : [
                        Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                            layout : 'hbox',
                            items : [
                                Ext4.create('PSA.RA.UIComponent.CheckBox', {
                                    id : 'advfilter-sharefilter',
                                    labelWidth : 124,
                                    boxLabel : translatedStrings.getText('CHECKBOX.SHARE_THIS_VIEW'),
                                    width : 400
                                })
                            ]
                        }),
                        Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                            layout : 'hbox',
                            items : [
                                Ext4.create('PSA.RA.UIComponent.Text', {
                                    id : 'advfilter-filtername',
                                    fieldLabel : translatedStrings.getText('TEXT.VIEW_NAME'),
                                    allowBlank : false,
                                    labelWidth : 124,
                                    width : 400,
                                    listeners : {
                                        blur : function(textbox, event) {
                                            var value = textbox.getValue().trim();
                                            textbox.setValue(value);
                                        }
                                    }
                                }) 
                            ]
                        }),
                    ]
                }),
                Ext4.create('Ext4.form.FieldSet', {
                    title : translatedStrings.getText('FIELDSET.DATE_CRITERIA'),
                    layout : 'anchor',
                    border : false,
                    items : [
                        Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                            layout : 'hbox',
                            items : [
                                Ext4.create('PSA.RA.UIComponent.DateRange', {
                                    id : 'advfilter-projTaskDate',
                                    fieldLabel : translatedStrings.getText('DATERANGE.PROJECT_TASK_DATE'),
                                    labelWidth : 124,
                                    labelAlign : 'top',
                                    width : 400,
                                })
                            ]
                        }), Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                            layout : 'hbox',
                            items : [
                                Ext4.create('PSA.RA.UIComponent.DateRange', {
                                    id : 'advfilter-taskAssignmentDate',
                                    fieldLabel : translatedStrings.getText('DATERANGE.TASK_ASSIGNMENT_DATE'),
                                    labelWidth : 124,
                                    labelAlign : 'top',
                                    width : 400,
                                })
                            ]
                        })
                    ]
                }),
                Ext4.create('Ext4.form.FieldSet', {
                    title : translatedStrings.getText('FIELDSET.ASSIGNMENT_CRITERIA'),
                    layout : 'anchor',
                    border : false,
                    items : [
                        Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                            layout : 'hbox',
                            items : [
                                Ext4.create('PSA.RA.UIComponent.CheckBox', {
                                    id : 'advfilter-includeAll',
                                    boxLabel : translatedStrings.getText('CHECKBOX.INCLUDE_ALL_RESOURCES'),
                                    labelWidth : 124,
                                })
                            ]
                        }), Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                            layout : 'hbox',
                            items : [
                                Ext4.create('PSA.RA.UIComponent.CheckBox', {
                                    id : 'advfilter-showInactive',
                                    boxLabel : translatedStrings.getText('CHECKBOX.SHOW_INACTIVE'),
                                    labelWidth : 124,
                                })
                            ]
                        }), Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                            layout : 'hbox',
                            items : [
                                Ext4.create('PSA.RA.UIComponent.ComboOrLargeDataField', { 
                                    id: 'advfilter-assignees',
                                    width : 400,
                                    comboStore: PSA.RA.dataStores.filterAssignee,
                                    fLabel: translatedStrings.getText('COMBOBOX.ASSIGNEES'),
                                    eText: translatedStrings.getText('MESSAGE.EMPTYTEXT.ASSIGNEES')
                                })
                            ]
                        }), Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                            layout : 'hbox',
                            items : [
                                Ext4.create('PSA.RA.UIComponent.ComboOrLargeDataField', { 
                                    id: 'advfilter-customers',
                                    width : 400,
                                    comboStore: PSA.RA.dataStores.filterCustomer,
                                    fLabel: translatedStrings.getText('COMBOBOX.CUSTOMERS'),
                                    eText: translatedStrings.getText('MESSAGE.EMPTYTEXT.CUSTOMERS')
                                })
                            ]
                        }), Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                            layout : 'hbox',
                            items : [
                                Ext4.create('PSA.RA.UIComponent.ComboOrLargeDataField', { 
                                    id: 'advfilter-projects',
                                    width : 400,
                                    comboStore: PSA.RA.dataStores.filterProject,
                                    fLabel: translatedStrings.getText('COMBOBOX.PROJECTS'),
                                    eText: translatedStrings.getText('MESSAGE.EMPTYTEXT.PROJECTS')
                                })
                            ]
                        }), Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                            layout : 'hbox',
                            items : [
                                Ext4.create('PSA.RA.UIComponent.ComboOrLargeDataField', { 
                                    id: 'advfilter-tasks',
                                    width : 400,
                                    comboStore: PSA.RA.dataStores.filterProjectTask,
                                    fLabel: translatedStrings.getText('COMBOBOX.TASKS'),
                                    eText: translatedStrings.getText('MESSAGE.EMPTYTEXT.TASKS')
                                })
                            ]
                        }), Ext4.create('PSA.RA.UIComponent.form.FieldContainer', {
                            layout : 'hbox',
                            items : [
                                Ext4.create('PSA.RA.UIComponent.ComboOrLargeDataField', { 
                                    id: 'advfilter-parenttasks',
                                    width : 400,
                                    comboStore: PSA.RA.dataStores.filterParentTask,
                                    fLabel: translatedStrings.getText('COMBOBOX.PARENT_TASKS'),
                                    eText: translatedStrings.getText('MESSAGE.EMPTYTEXT.PARENT_TASKS')
                                })
                            ]
                        })
                    ]
                })
            ],
            dockedItems : [
                {
                    xtype : 'toolbar',
                    dock : 'top',
                    ui : 'footer',
                    padding : '0 0 10 0',
                    items : [
                        Ext4.create('PSA.RA.UIComponent.BlueButton', {
                            text : translatedStrings.getText('BUTTON.SAVE'),
                            id : 'advfilter-saveFilter',
                            formBind : true,
                            handler : function() {
                                perfTestLogger.start('Save View');
                                var savedFilterCombo = Ext4.getCmp('savedFilters');
                                var savedFilterStore = savedFilterCombo.getStore();
                                var form = PSA.RA.App.formFilter;
                                var filterRecord = null;
                                var filterName = Ext4.getCmp('advfilter-filtername').getValue().trim();
                                if (filterName == translatedStrings.getText('TEXT.UNFILTERED')) {
                                    alert(translatedStrings.getText('MESSAGE.ERROR.CHANGE_FILTER_NAME'));
                                    return;
                                }
                                var shared = Ext4.getCmp('advfilter-sharefilter').getValue();
                                var taskDate = Ext4.getCmp('advfilter-projTaskDate').getValue();
                                var assignmentDate = Ext4.getCmp('advfilter-taskAssignmentDate').getValue();
                                var taskDateOperator = '';
                                var taskDateValue1 = '';
                                var taskDateValue2 = '';
                                var assignDateOperator = '';
                                var assignDateValue1 = '';
                                var assignDateValue2 = '';
                                var dateFormat = convertNSDateFormat();
                                if (taskDate) {
                                    //Get search operator
                                    if (taskDate.search(translatedStrings.getText('DATERANGE.ON_OR_BEFORE')) != -1) {
                                        taskDateOperator = 'onorbefore';
                                        taskDate = this.removeDateOperator(taskDate, translatedStrings.getText('DATERANGE.ON_OR_BEFORE'));
                                    }
                                    else if (taskDate.search(translatedStrings.getText('DATERANGE.WITHIN')) != -1) {
                                        taskDateOperator = 'within';
                                        taskDate = this.removeDateOperator(taskDate, translatedStrings.getText('DATERANGE.WITHIN'));
                                    }
                                    else if (taskDate.search(translatedStrings.getText('DATERANGE.AFTER')) != -1) {
                                        taskDateOperator = 'after';
                                        taskDate = this.removeDateOperator(taskDate, translatedStrings.getText('DATERANGE.AFTER'));
                                    }
                                    else {
                                        taskDateOperator = 'on';
                                        taskDate = this.removeDateOperator(taskDate, translatedStrings.getText('DATERANGE.ON'));
                                    }
                                    //Get date/s
                                    if (taskDate.search(translatedStrings.getText('DATERANGE.TODAY')) != -1) taskDateValue1 = 'today';
                                    else if (taskDate.search(translatedStrings.getText('DATERANGE.YESTERDAY')) != -1) taskDateValue1 = 'yesterday';
                                    else if (taskDate.search(translatedStrings.getText('DATERANGE.TOMORROW')) != -1) taskDateValue1 = 'tomorrow';
                                    else if (taskDate.search(translatedStrings.getText('DATERANGE.THIS_WEEK')) != -1) taskDateValue1 = 'thisweek';
                                    else if (taskDate.search(translatedStrings.getText('DATERANGE.THIS_MONTH')) != -1) taskDateValue1 = 'thismonth';
                                    else if (taskDate.search(translatedStrings.getText('DATERANGE.THIS_YEAR')) != -1) taskDateValue1 = 'thisyear';
                                    else if (taskDate.search(translatedStrings.getText('DATERANGE.THIS_FISCAL_QUARTER')) != -1) taskDateValue1 = 'thisfiscalquarter';
                                    else if (taskDate.search(translatedStrings.getText('DATERANGE.LAST_WEEK')) != -1) taskDateValue1 = 'lastweek';
                                    else if (taskDate.search(translatedStrings.getText('DATERANGE.LAST_MONTH')) != -1) taskDateValue1 = 'lastmonth';
                                    else if (taskDate.search(translatedStrings.getText('DATERANGE.LAST_FISCAL_QUARTER')) != -1) taskDateValue1 = 'lastfiscalquarter';
                                    else if (taskDate.search(translatedStrings.getText('DATERANGE.NEXT_WEEK')) != -1) taskDateValue1 = 'nextweek';
                                    else if (taskDate.search(translatedStrings.getText('DATERANGE.NEXT_ONE_MONTH')) != -1) taskDateValue1 = 'nextonemonth';
                                    else if (taskDate.search(translatedStrings.getText('DATERANGE.NEXT_MONTH')) != -1) taskDateValue1 = 'nextmonth';
                                    else if (taskDate.search(translatedStrings.getText('DATERANGE.NEXT_FISCAL_QUARTER')) != -1) taskDateValue1 = 'nextfiscalquarter';
                                    else if (taskDateOperator == 'within') {
                                        var result = taskDate.split(translatedStrings.getText('DATERANGE.TO'));
                                        taskDateValue1 = result[0].trim(); //first date
                                        taskDateValue2 = result[1].trim(); //second date
                                    } else {
                                        taskDateValue1 = taskDate;
                                    }
                                }
                                if (assignmentDate) {
                                    //Get search operator
                                    if (assignmentDate.search(translatedStrings.getText('DATERANGE.ON_OR_BEFORE')) != -1) {
                                        assignDateOperator = 'onorbefore';
                                        assignmentDate = this.removeDateOperator(assignmentDate, translatedStrings.getText('DATERANGE.ON_OR_BEFORE'));
                                    }
                                    else if (assignmentDate.search(translatedStrings.getText('DATERANGE.WITHIN')) != -1) {
                                        assignDateOperator = 'within';
                                        assignmentDate = this.removeDateOperator(assignmentDate, translatedStrings.getText('DATERANGE.WITHIN'));
                                    }
                                    else if (assignmentDate.search(translatedStrings.getText('DATERANGE.AFTER')) != -1) {
                                        assignDateOperator = 'after';
                                        assignmentDate = this.removeDateOperator(assignmentDate, translatedStrings.getText('DATERANGE.AFTER'));
                                    }
                                    else {
                                        assignDateOperator = 'on';
                                        assignmentDate = this.removeDateOperator(assignmentDate, translatedStrings.getText('DATERANGE.ON'));
                                    }
                                    //Get date/s
                                    if (assignmentDate.search(translatedStrings.getText('DATERANGE.TODAY')) != -1) assignDateValue1 = 'today';
                                    else if (assignmentDate.search(translatedStrings.getText('DATERANGE.YESTERDAY')) != -1) assignDateValue1 = 'yesterday';
                                    else if (assignmentDate.search(translatedStrings.getText('DATERANGE.TOMORROW')) != -1) assignDateValue1 = 'tomorrow';
                                    else if (assignmentDate.search(translatedStrings.getText('DATERANGE.THIS_WEEK')) != -1) assignDateValue1 = 'thisweek';
                                    else if (assignmentDate.search(translatedStrings.getText('DATERANGE.THIS_MONTH')) != -1) assignDateValue1 = 'thismonth';
                                    else if (assignmentDate.search(translatedStrings.getText('DATERANGE.THIS_YEAR')) != -1) assignDateValue1 = 'thisyear';
                                    else if (assignmentDate.search(translatedStrings.getText('DATERANGE.THIS_FISCAL_QUARTER')) != -1) assignDateValue1 = 'thisfiscalquarter';
                                    else if (assignmentDate.search(translatedStrings.getText('DATERANGE.LAST_WEEK')) != -1) assignDateValue1 = 'lastweek';
                                    else if (assignmentDate.search(translatedStrings.getText('DATERANGE.LAST_MONTH')) != -1) assignDateValue1 = 'lastmonth';
                                    else if (assignmentDate.search(translatedStrings.getText('DATERANGE.LAST_FISCAL_QUARTER')) != -1) assignDateValue1 = 'lastfiscalquarter';
                                    else if (assignmentDate.search(translatedStrings.getText('DATERANGE.NEXT_WEEK')) != -1) assignDateValue1 = 'nextweek';
                                    else if (assignmentDate.search(translatedStrings.getText('DATERANGE.NEXT_ONE_MONTH')) != -1) assignDateValue1 = 'nextonemonth';
                                    else if (assignmentDate.search(translatedStrings.getText('DATERANGE.NEXT_MONTH')) != -1) assignDateValue1 = 'nextmonth';
                                    else if (assignmentDate.search(translatedStrings.getText('DATERANGE.NEXT_FISCAL_QUARTER')) != -1) assignDateValue1 = 'nextfiscalquarter';
                                    else if (assignDateOperator == 'within') {
                                        var result = assignmentDate.split(translatedStrings.getText('DATERANGE.TO'));
                                        assignDateValue1 = result[0].trim(); //first date
                                        assignDateValue2 = result[1].trim(); //second date
                                    } else {
                                        assignDateValue1 = assignmentDate;
                                    }
                                }
                                var includeAllResources = Ext4.getCmp('advfilter-includeAll').getValue();
                                var includeInactive = Ext4.getCmp('advfilter-showInactive').getValue();
                                
                                var assigneeFld = Ext4.getCmp('advfilter-assignees');
                                var customerFld = Ext4.getCmp('advfilter-customers');
                                var projectFld = Ext4.getCmp('advfilter-projects');
                                var projectTasksFld = Ext4.getCmp('advfilter-tasks');
                                var parentTasksFld = Ext4.getCmp('advfilter-parenttasks');
                                var assignees = assigneeFld.getValue();
                                var customers = customerFld.getValue();
                                var projects = projectFld.getValue();
                                var projectTasks = projectTasksFld.getValue();
                                var parentTasks = parentTasksFld.getValue();
                                var assigneeNames = assigneeFld.getLargeDataText();
                                var customerNames = customerFld.getLargeDataText();
                                var projectNames = projectFld.getLargeDataText();
                                var projectTaskNames = projectTasksFld.getLargeDataText();
                                var parentTaskNames = parentTasksFld.getLargeDataText();
                                
                                function valToString(someObject) {
                                    return someObject == null ? '' : someObject.toString();
                                }
                                var match = savedFilterStore.isNameExists(filterName, form.isAdd, savedFilterCombo.getValue());
                                if (match) {
                                    alert(translatedStrings.getText('MESSAGE.ERROR.VIEW_NAME_DUPLICATE'));
                                    return;
                                }
                                assignees = valToString(assignees);
                                customers = valToString(customers);
                                projects = valToString(projects);
                                projectTasks = valToString(projectTasks);
                                parentTasks = valToString(parentTasks);
                                
                                if (form.isAdd) {
                                    filterRecord = Ext4.create('PSA.RA.Model.SavedFilter');
                                } else {
                                    filterRecord = savedFilterCombo.getSelectedRecord();
                                    //check if filter is edited
                                    var edited = false;
                                    if (filterRecord.get('name') != filterName) edited = true;
                                    if (filterRecord.get('filterName') != filterName) edited = true;
                                    if (filterRecord.get('shared') != shared) edited = true;
                                    if (filterRecord.get('taskDateOperator') != taskDateOperator) edited = true;
                                    if (filterRecord.get('taskDateValue1') != taskDateValue1) edited = true;
                                    if (filterRecord.get('taskDateValue2') != taskDateValue2) edited = true;
                                    if (filterRecord.get('assignDateOperator') != assignDateOperator) edited = true;
                                    if (filterRecord.get('assignDateValue1') != assignDateValue1) edited = true;
                                    if (filterRecord.get('assignDateValue2') != assignDateValue2) edited = true;
                                    if (filterRecord.get('includeAllResources') != includeAllResources) edited = true;
                                    if (filterRecord.get('includeInactive') != includeInactive) edited = true;
                                    if (filterRecord.get('assignees') != assignees) edited = true;
                                    if (filterRecord.get('customers') != customers) edited = true;
                                    if (filterRecord.get('projects') != projects) edited = true;
                                    if (filterRecord.get('projectTasks') != projectTasks) edited = true;
                                    if (filterRecord.get('parentTasks') != parentTasks) edited = true;
                                    //if (filterRecord.get('owner') != nlapiGetContext().user) edited = true;
                                    if (!edited) {
                                        form.hide();
                                        return;
                                    };
                                    filterRecord.beginEdit();
                                }
                                filterRecord.set('name', filterName);
                                filterRecord.set('filterName', filterName);
                                filterRecord.set('shared', shared);
                                filterRecord.set('taskDateOperator', taskDateOperator);
                                filterRecord.set('taskDateValue1', taskDateValue1);
                                filterRecord.set('taskDateValue2', taskDateValue2);
                                filterRecord.set('assignDateOperator', assignDateOperator);
                                filterRecord.set('assignDateValue1', assignDateValue1);
                                filterRecord.set('assignDateValue2', assignDateValue2);
                                filterRecord.set('includeAllResources', includeAllResources);
                                filterRecord.set('includeInactive', includeInactive);
                                filterRecord.set('assignees', assignees);
                                filterRecord.set('customers', customers);
                                filterRecord.set('projects', projects);
                                filterRecord.set('projectTasks', projectTasks);
                                filterRecord.set('parentTasks', parentTasks);
                                filterRecord.set('assigneeNames', assigneeNames);
                                filterRecord.set('customerNames', customerNames);
                                filterRecord.set('projectNames', projectNames);
                                filterRecord.set('projectTaskNames', projectTaskNames);
                                filterRecord.set('parentTaskNames', parentTaskNames);
                                filterRecord.set('owner', nlapiGetContext().user);
                                if (!form.isAdd) {
                                    filterRecord.endEdit();
                                } else {
                                    savedFilterStore.add(filterRecord);
                                }
                                // check if used the counter
                                //                                if (filterName == form.prefix + PSA.RA.App.globalSettings.get('filterNameCounter')) {
                                //                                    var settingRecord = PSA.RA.App.globalSettings;
                                //                                    settingRecord.beginEdit();
                                //                                    settingRecord.set('filterNameCounter', settingRecord.get('filterNameCounter') + 1);
                                //                                    settingRecord.endEdit();
                                //                                    settingRecord.setDirty(true);
                                //                                    PSA.RA.App.settingStore.sync();
                                //                                }
                                savedFilterStore.sync({
                                    success : function(batch) {
                                        var savedFilterCombo = Ext4.getCmp('savedFilters');
                                        //                                        console.log('batch');
                                        //                                        console.log(batch);
                                        savedFilterCombo.select(filterRecord);
                                        savedFilterCombo.getStore().getLoadParameters(filterRecord);
                                        PSA.RA.dataStores.chartResource.loadWithFilters();
                                        savedFilterCombo.saveSettings(filterRecord.get('id'));
                                        form.hide();
                                    },
                                    failure : function() {
                                        if (PSA.RA.App.formFilter.isAdd) {
                                            savedFilterStore.remove(filterRecord);
                                        } else {
                                            filterRecord.reject();
                                        }
                                    }
                                });
                            },
                            removeDateOperator : function (dateRangeString, dateOperator) {
                                var returnString = dateRangeString.substr(dateOperator.length).trim();
                                return returnString;
                            }
                        }), Ext4.create('PSA.RA.UIComponent.GrayButton', {
                            id : 'advFilter-cancel',
                            text : translatedStrings.getText('BUTTON.CANCEL'),
                            handler : function() {
                                PSA.RA.App.formFilter.hide();
                            }
                        }), Ext4.create('PSA.RA.UIComponent.MenuSeparator', {
                            id : 'advfilter-separator'
                        }), Ext4.create('PSA.RA.UIComponent.GrayButton', {
                            id : 'advfilter-delete',
                            text : translatedStrings.getText('BUTTON.DELETE'),
                            handler : function() {
                                perfTestLogger.start('Delete View');
                                if (confirm(translatedStrings.getText('MESSAGE.WARNING.DELETE_VIEW'))) {
                                    var resetValue = 0;
                                    var savedFilterCombo = Ext4.getCmp('savedFilters');
                                    var savedFilterStore = savedFilterCombo.getStore();
                                    var filterRecord = savedFilterCombo.getSelectedRecord();
                                    // update settings to remove reference to filter record
                                    //                                    console.log('reset');
                                    savedFilterCombo.setValue(resetValue);
                                    savedFilterCombo.saveSettings(resetValue);
                                    // reload chart
                                    //                                    console.log('reload');
                                    savedFilterStore.getLoadParameters();
                                    PSA.RA.dataStores.chartResource.loadWithFilters();
                                    // delete savedfilter record
                                    //                                    console.log('delete');
                                    var sleep = setTimeout(function() {
                                        filterRecord.beginEdit();
                                        filterRecord.set('isDelete', true);
                                        filterRecord.endEdit();
                                        savedFilterStore.sync();
                                        savedFilterStore.remove(filterRecord);
                                    }, 500);
                                    PSA.RA.App.formFilter.hide();
                                }
                            }
                        })
                    ]
                }
            ]
        })
    ],
    getDateRangeString : function(operator, date1, date2) {
        var result = '';
        switch (operator) {
            case 'onorbefore' : result = translatedStrings.getText('DATERANGE.ON_OR_BEFORE') + ' '; break;
            case 'within'     : result = translatedStrings.getText('DATERANGE.WITHIN') + ' '; break;
            case 'after'      : result = translatedStrings.getText('DATERANGE.AFTER') + ' '; break;
            case 'on'         : result = translatedStrings.getText('DATERANGE.ON') + ' '; break;
        }
        switch (date1) {
            case 'today'             : result = result + translatedStrings.getText('DATERANGE.TODAY'); break;
            case 'yesterday'         : result = result + translatedStrings.getText('DATERANGE.YESTERDAY'); break;
            case 'tomorrow'          : result = result + translatedStrings.getText('DATERANGE.TOMORROW'); break;
            case 'thisweek'          : result = result + translatedStrings.getText('DATERANGE.THIS_WEEK'); break;
            case 'thismonth'         : result = result + translatedStrings.getText('DATERANGE.THIS_MONTH'); break;
            case 'thisyear'          : result = result + translatedStrings.getText('DATERANGE.THIS_YEAR'); break;
            case 'thisfiscalquarter' : result = result + translatedStrings.getText('DATERANGE.THIS_FISCAL_QUARTER'); break;
            case 'lastweek'          : result = result + translatedStrings.getText('DATERANGE.LAST_WEEK'); break;
            case 'lastmonth'         : result = result + translatedStrings.getText('DATERANGE.LAST_MONTH'); break;
            case 'lastfiscalquarter' : result = result + translatedStrings.getText('DATERANGE.LAST_FISCAL_QUARTER'); break;
            case 'nextweek'          : result = result + translatedStrings.getText('DATERANGE.NEXT_WEEK'); break;
            case 'nextonemonth'      : result = result + translatedStrings.getText('DATERANGE.NEXT_ONE_MONTH'); break;
            case 'nextmonth'         : result = result + translatedStrings.getText('DATERANGE.NEXT_MONTH'); break;
            case 'nextyear'          : result = result + translatedStrings.getText('DATERANGE.NEXT_YEAR'); break;
            case 'nextfiscalquarter' : result = result + translatedStrings.getText('DATERANGE.NEXT_FISCAL_QUARTER'); break;
            default                  : result = result + date1; break;
        }
        if (date2) result = result + ' ' + translatedStrings.getText('DATERANGE.TO') + ' ' + date2;
        return result;
    }
});


Ext4.define('PSA.PTM.Forms.SettingsForm', {
    extend : 'PSA.RA.UIComponent.Window',
    id : 'ptm-settingsWindow',
    title : 'Settings', // TODO: translatedStrings.getText('WINDOW.SETTINGS')
    width : 490,
    listeners : {
        beforeShow : function(window, eOpts) {
            // set form values
            var form = this.down('form');
            form.loadRecord(PTM.Settings);
            var settings = PTM.Settings;
            Ext4.getCmp('settingColor1').setValue(settings.get('availabilityColor1'));
            Ext4.getCmp('settingColor2').setValue(settings.get('availabilityColor2'));
            Ext4.getCmp('settingColor3').setValue(settings.get('availabilityColor3'));
        }
    },
    items : [
        {
            xtype: 'ptmform',
            id : 'ptm-settingsPanel',
            layout : 'column',          
            items : [
                Ext4.create('Ext4.form.FieldSet', {
                    title : 'Appearance', // TODO: translatedStrings.getText('FIELDSET.APPEARANCE'),
                    id : 'fsAppearance',
                    border : false,
                    width : 280,
                    items : [
                        Ext4.create('PSA.RA.UIComponent.CheckBox', {
                            id : 'settingShowNumbers',
                            boxLabel : 'Show numbers on bars', // TODO: translatedStrings.getText('CHECKBOX.SHOW_NUMBERS_ON_BARS'),
                            name : 'showNumbers'
                        }),
                        Ext4.create('PSA.RA.UIComponent.CheckBox', {
                            id : 'settingShowHovers',
                            boxLabel : 'Show details on hover', // TODO: translatedStrings.getText('CHECKBOX.SHOW_DETAILS_ON_HOVER'),
                            name : 'showHovers'
                        })
                    ]
                }),
                Ext4.create('Ext4.form.FieldSet', {
                    title : 'Allocation', // TODO: translatedStrings.getText('FIELDSET.ALLOCATION'),
                    id : 'fsAvailability',
                    border : false,
                    width : 146,
                    items : [
                        Ext4.create('PSA.PTM.UIComponent.ColorField', {
                            id : 'settingColor1',
                            name : 'availabilityColor1',
                            fieldLabel : 'Over', // TODO: translatedStrings.getText('SETTING.OVER'),
                            value : 'CF2B25'
                        }),
                        Ext4.create('PSA.RA.UIComponent.FormSpacer', {
                            height : 10
                        }),
                        Ext4.create('PSA.PTM.UIComponent.ColorField', {
                            id : 'settingColor2',
                            name : 'availabilityColor2',
                            fieldLabel : 'Assigned', // TODO: translatedStrings.getText('SETTING.ASSIGNED'),
                            value : 'FF9500'
                        }),
                        Ext4.create('PSA.RA.UIComponent.FormSpacer', {
                            height : 10
                        }),
                        Ext4.create('PSA.PTM.UIComponent.ColorField', {
                            id : 'settingColor3',
                            name : 'availabilityColor3',
                            fieldLabel : 'Worked', // TODO: translatedStrings.getText('SETTING.WORKED'),
                            value : '2D7BE0'
                        })
                    ]
                }),
                Ext4.create('Ext4.form.FieldSet', {
                    title : 'Chart Density', //TODO translatedStrings.getText('FIELDSET.CHART_DENSITY'),
                    id : 'fsChartDensity',
                    border : false,
                    width : 426,
                    items : [
                        Ext4.create('PSA.RA.UIComponent.ChartDensityRadio', {
                            id : 'chartDensity1',
                            name : 'chartDensity',
                            boxLabel : 'Dense', //TODO translatedStrings.getText('RADIO.DENSE'),
                            inputValue : 1
                        }),
                        Ext4.create('PSA.RA.UIComponent.ChartDensityRadio', {
                            id : 'chartDensity2',
                            name : 'chartDensity',
                            boxLabel : 'Standard', //TODO translatedStrings.getText('RADIO.STANDARD'),
                            inputValue : 2
                        }),
                        Ext4.create('PSA.RA.UIComponent.ChartDensityRadio', {
                            id : 'chartDensity3',
                            name : 'chartDensity',
                            boxLabel : 'Relaxed', //TODO translatedStrings.getText('RADIO.RELAXED'),
                            inputValue : 3
                        })
                    ]
                })
            ],
            dockedItems : [
                {
                    xtype : 'ptmformmenu',
                    items : [
                        Ext4.create('PSA.RA.UIComponent.BlueButton', {
                            id : 'ptm-settingsSaveBtn',
                            text : translatedStrings.getText('BUTTON.SAVE'),
                            handler : function() {
                                var win = this.up('window');
                                var form = win.down('form');                                
                                
                                // update setting model
                                PTM.Settings.beginEdit();
                                PTM.Settings.set('showNumbers', form.down('[id=settingShowNumbers]').getValue());
                                PTM.Settings.set('showHovers', form.down('[id=settingShowHovers]').getValue());
                                PTM.Settings.set('availabilityColor1', form.down('[id=settingColor1]').getValue());
                                PTM.Settings.set('availabilityColor2', form.down('[id=settingColor2]').getValue());
                                PTM.Settings.set('availabilityColor3', form.down('[id=settingColor3]').getValue());
                                PTM.Settings.endEdit();
                                
                                // save in NS record via store sync, reload to reflect changes, hide window
                                PSA.RA.dataStores.settingStore.sync();
                                
                                Ext4.getCmp('psa-ptm-app').refreshChartDensity(PTM.Settings.get('chartDensity'));
                                
                                PSA.RA.dataStores.chartResource.loadWithFilters();
                                
                                Ext4.getCmp('ptm-toolbar-legend').initTypeBgMap();
                                Ext4.getCmp('ptm-toolbar-legend').loadLegendColors();
                                win.hide();
                            }
                        }), Ext4.create('PSA.RA.UIComponent.GrayButton', {
                            id : 'ptm-settingsCancelBtn',
                            text : translatedStrings.getText('BUTTON.CANCEL'),
                            handler : function() {
                                // set initial form values and hide window
                                var win = this.up('window');
                                var form = win.down('form');
                                form.loadRecord(PTM.Settings);
                                win.hide();
                            }
                        }), Ext4.create('PSA.RA.UIComponent.GrayButton', {
                            id : 'ptm-settingsRestoreBtn',
                            text : 'Restore Defaults', // TODO: translatedStrings.getText('BUTTON.RESTORE_DEFAULTS'),
                            width : 'auto',
                            handler : function() {
                                // set default form values
                                var form = this.up('window').down('form');
                                form.down('[id=settingShowNumbers]').setValue(true);
                                form.down('[id=settingShowHovers]').setValue(true);
                                form.down('[id=settingColor1]').setValue('CF2B25');
                                form.down('[id=settingColor2]').setValue('FF9500');
                                form.down('[id=settingColor3]').setValue('2D7BE0');
                            }
                        })
                    ]
                }
            ]
        }
    ]
});

