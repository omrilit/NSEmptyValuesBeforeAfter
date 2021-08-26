/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

Ext4.define('PRM.Cmp.SettingsForm', {
    extend : 'PRM.Cmp.Form',
    store : PRM.App.Stores.settings,
    initComponent : function (args) {
        var window    = this,
            formPanel = window.items;
        
        window.setItems(formPanel);
        
        this.callParent(args);

        var windowId              = '#'+window.id + '-',
            saveBtn               = window.down(windowId +'panel-save'),
            defaultBtn            = window.down(windowId +'panel-restore-default'),
            densityRdo            = window.down(windowId +'density'),
            includeAllChk         = window.down(windowId +'include-all-projects'),
            showRejectedChk       = window.down(windowId +'show-rejected-allocations'),
            showDetailsOnHoverChk = window.down(windowId +'show-details-on-hover'),
            showAllocationsChk    = window.down(windowId +'show-resource-allocations'),
            showAssignmentsChk    = window.down(windowId +'show-task-assignments');
            
        saveBtn.setHandler(function (button) {
            window.el.mask(PRM.Translation.getText('MASK.SAVING'));
            
            var settings = window.store.data.items[0];
            
            settings.set('projectsPerPage', densityRdo.getValue().density);
            settings.set('includeAllProjects', includeAllChk.getValue());
            settings.set('showRejectedAllocations', showRejectedChk.getValue());
            settings.set('showHovers', showDetailsOnHoverChk.getValue());
            settings.set('showAllocations', showAllocationsChk.getValue());
            settings.set('showAssignments', showAssignmentsChk.getValue());
            settings.setDirty();
            
            window.store.sync({
                success : function(batch) {
                    var resultObj = batch.operations[0].resultSet.records[0].raw,
                        response = batch.proxy.reader.rawData;
                    
                    window.applyToGrid(resultObj);
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
        
        defaultBtn.show();
        defaultBtn.setHandler(function (button, event) {
            densityRdo.setValue({density : 10});
            includeAllChk.setValue(false);
            showRejectedChk.setValue(true);
            showDetailsOnHoverChk.setValue(true);
            showAllocationsChk.setValue(true);
            showAssignmentsChk.setValue(true);
        });
        
    },
    applyToGrid : function(responseData) {
        Ext4.apply(PRM.App.Settings, responseData);
        PRM.App.Settings.projectSearch = undefined;
        PRM.App.Grid.toggleColumns();
        PRM.App.Stores.pageList.loadWithFilters();
    },
    listeners : {
        boxready : function (window, width, height, eOpts ) {
        },
        beforeShow : function (window) {
            
            var windowId              = '#'+window.id + '-',
                densityRdo            = window.down(windowId +'density'),
                includeAllChk         = window.down(windowId +'include-all-projects'),
                showRejectedChk       = window.down(windowId +'show-rejected-allocations'),
                showDetailsOnHoverChk = window.down(windowId +'show-details-on-hover'),
                showAllocationsChk    = window.down(windowId +'show-resource-allocations'),
                showAssignmentsChk    = window.down(windowId +'show-task-assignments');
            
            densityRdo.setValue({density : PRM.App.Settings.projectsPerPage});
            includeAllChk.setValue(PRM.App.Settings.includeAllProjects);
            showRejectedChk.setValue(PRM.App.Settings.showRejectedAllocations);
            showDetailsOnHoverChk.setValue(PRM.App.Settings.showHovers);
            showAllocationsChk.setValue(PRM.App.Settings.showAllocations);
            showAssignmentsChk.setValue(PRM.App.Settings.showAssignments);
            
            if (!PRM.App.Settings.showAllocations) {
                showRejectedChk.disable();
            }
        }
    },
    componentIdList : [
        'include-all-projects', 'show-rejected-allocations', 'show-details-on-hover', 'density'
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
                    xtype : 'prm-checkbox-group',
                    fieldLabel : 'Appearance',
                    id : window.id + '-appearance',
                    allowBlank : true,
                    items : [
                        { 
                            id : window.id + '-include-all-projects',
                            boxLabel : PRM.Translation.getText('FIELD.INCLUDE_ALL_PROJECTS'),
                            tooltip : 'test tooltip'
                        }, { 
                            id : window.id + '-show-rejected-allocations',
                            boxLabel : PRM.Translation.getText('FIELD.SHOW_REJECTED_ALLOCATIONS')
                        }, { 
                            id : window.id + '-show-details-on-hover',
                            boxLabel : PRM.Translation.getText('FIELD.SHOW_DETAILS_ON_HOVER')
                        }, { 
                            id : window.id + '-show-resource-allocations',
                            boxLabel : PRM.Translation.getText('FIELD.SHOW_RESOURCE_ALLOCATIONS'),
                            listeners : {
                                change : function(me, newValue, oldValue) {
                                    var assignChk = Ext4.getCmp(window.id + '-show-task-assignments'),
                                        rejectChk = Ext4.getCmp(window.id + '-show-rejected-allocations');
                                        
                                    if (!newValue && !assignChk.getValue()) {
                                        assignChk.setValue(true);
                                    }
                                    
                                    newValue ? rejectChk.enable() : rejectChk.disable();
                                }
                            }
                        }, { 
                            id : window.id + '-show-task-assignments',
                            boxLabel : PRM.Translation.getText('FIELD.SHOW_TASK_ASSIGNMENTS'),
                            listeners : {
                                change : function(me, newValue, oldValue) {
                                    var allocChk = Ext4.getCmp(window.id + '-show-resource-allocations');
                                    if (!newValue && !allocChk.getValue()) {
                                        allocChk.setValue(true);
                                    }
                                }
                            }
                        }
                    ]
                },
                {
                    xtype : 'prm-radio-group',
                    id : window.id + '-density',
                    fieldLabel : PRM.Translation.getText('FIELD.DENSITY'),
                    allowBlank : false,
                    items : [
                        { 
                            id : window.id + '-density-dense',
                            name : 'density',
                            boxLabel : PRM.Translation.getText('RADIO.DENSE'),
                            inputValue : 15,
                            tooltip : 'test tooltip'
                        }, { 
                            id : window.id + '-density-standard',
                            name : 'density',
                            boxLabel : PRM.Translation.getText('RADIO.STANDARD'),
                            inputValue : 10,
                        }, { 
                            id : window.id + '-density-relaxed',
                            name : 'density',
                            boxLabel : PRM.Translation.getText('RADIO.RELAXED'),
                            inputValue : 5,
                        }
                    ]
                }
            ]
        });
    }
});