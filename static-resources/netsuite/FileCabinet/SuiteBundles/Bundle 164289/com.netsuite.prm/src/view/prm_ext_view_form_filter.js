/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

Ext4.define('PRM.Cmp.FilterForm', {
    extend : 'PRM.Cmp.Form',
    initComponent : function (args) {
        var window    = this,
            formPanel = window.items;
        
        window.setItems(formPanel);
        
        this.callParent(args); //Call after Ext4.applyIf to create items and call before accessing items/dockedItems applied
        
        var saveBtn                    = window.down('#' + window.id + '-panel-save');
        
        this.deleteBtn                 = window.down('#' + window.id + '-panel-delete');
        this.viewNameTxt               = window.down('#' + window.id + '-name');
        this.dateTypeCmb               = window.down('#' + window.id + '-date-type');
        this.startDateFld              = window.down('#' + window.id + '-start-date'); 
        this.resourceTypeEmpChk        = window.down('#' + window.id + '-resource-type-employee');
        this.resourceTypeGenChk        = window.down('#' + window.id + '-resource-type-generic-resource');
        this.resourceTypeVenChk        = window.down('#' + window.id + '-resource-type-vendor');
        this.billingClassCmb           = window.down('#' + window.id + '-billing-class');
        this.resourceCmb               = window.down('#' + window.id + '-resource');
        this.projectsOnlyChk           = window.down('#' + window.id + '-projects-only');
        this.tasksOnlyChk              = window.down('#' + window.id + '-tasks-only');
        this.subsidiaryCmb             = window.down('#' + window.id + '-subsidiary');
        this.includeSubSubsidiaryChk   = window.down('#' + window.id + '-include-sub-subsidiaries');
        this.customerCmb               = window.down('#' + window.id + '-customer');
        this.projectCmb                = window.down('#' + window.id + '-project');
        this.taskCmb                   = window.down('#' + window.id + '-task');
            
        saveBtn.setHandler(function () {
            var window         = PRM.App.Forms.filter,
                filterId       = window.selectedFilterId,
                viewName       = window.viewNameTxt.getValue(),
                dateType       = window.dateTypeCmb.getValue(),
                startDate      = window.startDateFld.getValue(),
                
                resourceTypeEmp        = window.resourceTypeEmpChk.getValue(),
                resourceTypeGen        = window.resourceTypeGenChk.getValue(),
                resourceTypeVen        = window.resourceTypeVenChk.getValue(),
                billingClassIds        = window.billingClassCmb.getValue(),
                billingClassNames      = window.billingClassCmb.getRawValue(),
                resourceIds            = window.resourceCmb.getValue(),
                resourceNames          = window.resourceCmb.getRawValue(),
                projectsOnly           = window.projectsOnlyChk.getValue(),
                tasksOnly              = window.tasksOnlyChk.getValue(),
                subsidiaryIds          = window.subsidiaryCmb.getValue(),
                includeSubSubsidiary   = window.includeSubSubsidiaryChk.getValue(),
                customerIds            = window.customerCmb.getValue(),
                customerNames          = window.customerCmb.getRawValue(),
                projectIds             = window.projectCmb.getValue(),
                projectNames           = window.projectCmb.getRawValue(),
                taskIds                = window.taskCmb.getValue(),
                taskNames              = window.taskCmb.getRawValue(),
                dTypeText              = '',
                isAdd                  = false;

            if (filterId == 0) {
                isAdd = true;
            }

            var filterStore = PRM.App.Stores.filter,
                match = filterStore.isNameExists(viewName, isAdd, filterId);
            if (match) {
                alert(PRM.Translation.getText('ALERT.FILTER_NAME_EXISTS_ERROR'));
                return false;
            }
                
            if (dateType) {
                var dType = PRM.App.Stores.startDateTypeFilter.findRecord('id', dateType);
                if (dType) {
                    dTypeText = dType.get('name');
                }
            }
    
            var store = PRM.App.Stores.filter;
            
            var record = {};
            if (isAdd) {
                record = Ext4.create('PRM.Model.Filter');
            } else { 
                record = filterStore.getSelectedRecord(filterId);
                record.beginEdit();
            } 

            record.set('filterId', filterId);
            record.set('name', viewName);
            record.set('startDateType', dTypeText);
            record.set('startDate', startDate);
            record.set('resourceTypeEmployee', resourceTypeEmp);
            record.set('resourceTypeGeneric', resourceTypeGen);
            record.set('resourceTypeVendor', resourceTypeVen);
            record.set('billingClasses', window.valToString(billingClassIds));
            record.set('billingClassNames', billingClassNames);
            record.set('resources', window.valToString(resourceIds));
            record.set('resourceNames', resourceNames);
            record.set('projectsOnly', projectsOnly);
            record.set('tasksOnly', tasksOnly);
            record.set('subsidiaries', window.valToString(subsidiaryIds));
            record.set('includeSubSubsidiary', includeSubSubsidiary);
            record.set('customers', window.valToString(customerIds));
            record.set('customerNames', customerNames);
            record.set('projects', window.valToString(projectIds));
            record.set('projectNames', projectNames);
            record.set('tasks', window.valToString(taskIds));
            record.set('taskNames', taskNames);
            
            if (isAdd) {
                store.add(record);
            } else { 
                record.endEdit();
            } 
            
            store.sync({
                  success : function(batch) {
                      var response = JSON.parse(batch.operations[0].response.responseText);
                      if (!response.error) {
                        var id = record.get('id');
                        
                        PRM.App.Filter.down('#prm-cmb-saved-filters').setValue(id);
                        
                        if (!isAdd) {
                            PRM.App.Stores.filter.applyFiltersToStores(id);
                        }
                        
                        window.hide(null, window.resetFormFields);
                      }
                  },
                  failure : function (batch) {
                      var response = batch.operations[0].error;
                      console.log('Error: ' + response);
                  }
            });
        });
        window.deleteBtn.setVisible(true);
        window.deleteBtn.setHandler(function () {
            var filterId       = window.selectedFilterId,
                store          = PRM.App.Stores.filter,
                record         = store.getSelectedRecord(filterId);
            record.beginEdit();
            record.set('filterId', filterId);
            record.set('isDelete', true);
            record.endEdit();
            
            store.sync({
                  success : function(batch) {
                      var response = JSON.parse(batch.operations[0].response.responseText);
                      if (!response.error) {
                        PRM.App.Settings.lastUsedFilter = 0;
                        PRM.App.Stores.filter.load();
                        window.hide(null, window.resetFormFields);
                      }
                  },
                  failure : function (batch) {
                      var response = batch.operations[0].error;
                      console.log('Error: ' + response);
                  }
            });
        });
    },
    componentIdList : [
        'name', 'date-type', 'start-date', 'resource-type-employee', 'resource-type-generic-resource', 'resource-type-vendor',
        'billing-class', 'resource', 'projects-only', 'tasks-only', 'subsidiary', 'include-sub-subsidiaries', 'customer', 'project', 'task'
    ],
    listeners : {
        beforeshow : function (window) {
            var id = '#' + window.id + '-resource',
                combo = window.down(id);
//            console.log(id)
//            console.log(combo.getValue());
//            console.log(combo.selectedRecords)
        }
    },
    setItems : function (formPanel) {
        var window = this;
            
        Ext4.apply(formPanel, {
            defaults : {
                padding: '0 0 10 0'
            },
            items : [
                {
                    xtype: 'prm-text',
                    id: window.id + '-name',
                    fieldLabel: PRM.Translation.getText('FIELD.VIEW_NAME'),
                    allowBlank: false
                },
                {
                  xtype : 'prm-field-container',
                  layout : 'hbox',
                  items : [
                      {
                          xtype: 'prm-filter-combobox',
                          id: window.id + '-date-type',
                          fieldLabel: PRM.Translation.getText('FIELD.START_DATE'),
                          multiSelect: false,
                          emptyText: '',
                          store: PRM.App.Stores.startDateTypeFilter,
                          listeners: {
                            change : function(combo, newValue, oldValue, eOpts) {
                                window.startDateFld.setDisabled(false);
                                window.startDateFld.allowBlank = false;
                                window.startDateFld.focus();
                                window.startDateFld.blur();
                            }
                          }
                      },
                      {
                          xtype: 'prm-date',
                          id: window.id + '-start-date',
                          fieldLabel: '',
                          allowBlank: true,
                          editable: false,
                          margin: '23 0 0 5',
                          value: new Date(new Date().setYear(new Date().getFullYear() - 1))
                      }
                  ]
                },
                /* Resource Properties */
                {
                    xtype: 'prm-display',
                    id: window.id + '-resource-properties',
                    value: PRM.Translation.getText('FIELD.RESOURCE_PROPERTIES'),
                },
                {
                    xtype: 'prm-checkbox-group',
                    id: window.id + '-resource-type',
                    fieldLabel: PRM.Translation.getText('FIELD.RESOURCE_TYPE'),
                    allowBlank: false,
                    items: [
                        { 
                            id: window.id + '-resource-type-employee',
                            boxLabel: PRM.Translation.getText('TEXT.EMPLOYEES'),
                            checked: true
                        },
                        { 
                            id: window.id + '-resource-type-generic-resource',
                            boxLabel: PRM.Translation.getText('TEXT.GENERIC_RESOURCE'),
                            checked: true
                        },
                        { 
                            id: window.id + '-resource-type-vendor',
                            boxLabel: PRM.Translation.getText('TEXT.VENDORS'),
                            checked: true
                        }
                    ]
                },
                {
                    xtype: 'prm-combobox-dynamic',
                    id: window.id + '-billing-class',
                    fieldLabel: PRM.Translation.getText('FIELD.BILLING_CLASS'),
                    store: PRM.App.Stores.billingClassForm,
                    multiSelect: true,
                    allowBlank: true,
                    searchWindow : 'viewBillingClassData'
                },
                //TODO: Replace resource combobox with large data component
                {
                    xtype: 'prm-combobox-dynamic',
                    id: window.id + '-resource',
                    fieldLabel : PRM.Translation.getText('FIELD.RESOURCE'),
                    emptyText: PRM.Translation.getText('TEXT.ALL-'),
                    store : PRM.App.Stores.resourceForm,
                    multiSelect: true,
                    allowBlank: true,
                    searchWindow : 'viewResourceData'
                },
                {
                    xtype: 'prm-checkbox',
                    id: window.id + '-projects-only',
                    disabled: true, // out of scope for now
                    boxLabel: PRM.Translation.getText('FIELD.ALLOCATED_TO_PROJECTS_ONLY'),
                    listeners: {
                        change : function(chkbox, newValue, oldValue, eOpts ) {
                            if (newValue) 
                                window.tasksOnlyChk.setDisabled(true);
                            else
                                window.tasksOnlyChk.setDisabled(false);
                        }
                    }
                },
                {
                    xtype: 'prm-checkbox',
                    id: window.id + '-tasks-only',
                    disabled: true, // out of scope for now
                    boxLabel: PRM.Translation.getText('FIELD.ASSIGNED_TO_TASKS_ONLY'),
                    listeners: {
                        change : function(chkbox, newValue, oldValue, eOpts ) {
                            if (newValue) 
                                window.projectsOnlyChk.setDisabled(true);
                            else
                                window.projectsOnlyChk.setDisabled(false);
                        }
                    }
                },
                {
                    xtype: 'prm-filter-combobox',
                    id: window.id + '-subsidiary',
                    fieldLabel: PRM.Translation.getText('FIELD.SUBSIDIARY'),
                    store: PRM.App.Stores.subsidiaryFilter,
                    hasSelectedValue : function () {
                        var selected = this.getRawValue();
                        return !(selected === PRM.Translation.getText('TEXT.ALL-') || selected === '');
                    },
                    listeners : {
                        change: function (_this, newValue, oldValue) {
                            var includeSubSubsidiariesCheckBox = Ext4.getCmp(window.id + '-include-sub-subsidiaries');
                            if (_this.hasSelectedValue()) {
                                includeSubSubsidiariesCheckBox.enable();
                            } else {
                                includeSubSubsidiariesCheckBox.setValue(false);
                                includeSubSubsidiariesCheckBox.disable();
                            }
                        }
                    }
                },
                {
                    xtype: 'prm-checkbox',
                    id: window.id + '-include-sub-subsidiaries',
                    boxLabel: PRM.Translation.getText('FIELD.INCLUDE_SUB-SUBSIDIARIES'),
                    initComponent: function () {
                        if (Ext4.getCmp(window.id + '-subsidiary').hasSelectedValue()) {
                            this.enable();
                        } else {
                            this.disable();
                        }
                    }
                },
                /* Project Properties */
                {
                    xtype: 'prm-display',
                    id: window.id + '-project-properties',
                    value: PRM.Translation.getText('FIELD.PROJECT_PROPERTIES')
                },
                {
                    xtype: 'prm-combobox-dynamic',
                    id: window.id + '-customer',
                    fieldLabel: PRM.Translation.getText('FIELD.CUSTOMER'),
                    store: PRM.App.Stores.customerFilter,
                    emptyText: PRM.Translation.getText('TEXT.ALL-'),
                    multiSelect: true,
                    allowBlank: true,
                    searchWindow : 'viewCustomerData'
                },
                {
                    xtype: 'prm-combobox-dynamic',
                    id: window.id + '-project',
                    fieldLabel: PRM.Translation.getText('TEXT.PROJECT'),
                    store: PRM.App.Stores.projectFilter,
                    emptyText: PRM.Translation.getText('TEXT.ALL-'),
                    multiSelect: true,
                    allowBlank: true,
                    searchWindow : 'viewProjectData'
                },
                {
                    xtype: 'prm-combobox-dynamic',
                    id: window.id + '-task',
                    fieldLabel: PRM.Translation.getText('FIELD.TASK'),
                    store: PRM.App.Stores.projectTaskFilter,
                    emptyText: PRM.Translation.getText('TEXT.ALL-'),
                    multiSelect: true,
                    allowBlank: true,
                    searchWindow : 'viewTaskData'
                }
            ]
        });
    },
    valToString : function(someObject) {
        return someObject == null ? '' : someObject.toString();
    },
    splitString : function(someString) {
        if (someString) {
            var isCommaSeparated = someString.indexOf(',') > 0; 
            return isCommaSeparated ? someString.split(',').map(Number) : parseInt(someString);
        }
        return '';
    },
    populateFormFields : function (filterId) {
        var window = PRM.App.Forms.filter,
            filterStore = PRM.App.Stores.filter,
            selectedFilter = filterStore.getSelectedRecord(filterId),
            name = selectedFilter.get('name'),
            startDateType = selectedFilter.get('startDateType'),
            startDate = selectedFilter.get('startDate'),
            resourceTypeEmployee = selectedFilter.get('resourceTypeEmployee'),
            resourceTypeGeneric = selectedFilter.get('resourceTypeGeneric'),
            resourceTypeVendor = selectedFilter.get('resourceTypeVendor'),
            isProjectsOnly =  selectedFilter.get('projectsOnly'),
            isTasksOnly = selectedFilter.get('tasksOnly'),
            isIncludeSubSubsidiaries = selectedFilter.get('includeSubSubsidiary'),
            billingClassIds = window.splitString(selectedFilter.get('billingClasses')),
            billingClassNames = selectedFilter.get('billingClassNames'),
            customerIds = window.splitString(selectedFilter.get('customers')),
            customerNames = selectedFilter.get('customerNames'),
            projectIds = window.splitString(selectedFilter.get('projects')),
            projectNames = selectedFilter.get('projectNames'),
            resourceIds = window.splitString(selectedFilter.get('resources')),
            resourceNames = selectedFilter.get('resourceNames'),
            subsidiaryIds = window.splitString(selectedFilter.get('subsidiaries')),
            taskIds = window.splitString(selectedFilter.get('tasks')),
            taskNames = selectedFilter.get('taskNames');
        
        window.setTitle(PRM.Translation.getText('WINDOW.EDIT_VIEW'));
        window.viewNameTxt.setValue(name);
        window.startDateFld.setValue(startDate);
        window.customerCmb.setValue(customerIds, customerNames);
        window.projectCmb.setValue(projectIds, projectNames);
        window.taskCmb.setValue(taskIds, taskNames);
        window.resourceTypeEmpChk.setValue(resourceTypeEmployee);
        window.resourceTypeGenChk.setValue(resourceTypeGeneric);
        window.resourceTypeVenChk.setValue(resourceTypeVendor);
        window.billingClassCmb.setValue(billingClassIds, billingClassNames);
        window.resourceCmb.setValue(resourceIds, resourceNames);
        window.projectsOnlyChk.setValue(isProjectsOnly);
        window.tasksOnlyChk.setValue(isTasksOnly);
        window.subsidiaryCmb.setValue(subsidiaryIds);
        window.includeSubSubsidiaryChk.setValue(isIncludeSubSubsidiaries);
        
        if (startDateType) {
            var dType = PRM.App.Stores.startDateTypeFilter.findRecord('name', startDateType);
            if (dType) {
                var dTypeId = dType.get('id');
                if (dTypeId)
                    window.dateTypeCmb.setValue(dTypeId);
            }
        } else {
            window.dateTypeCmb.setValue(2);
        }
    }
});