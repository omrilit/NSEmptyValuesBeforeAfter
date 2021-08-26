/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

Ext4.define('PRM.View.FiltersPanel', {
    extend : 'Ext4.panel.Panel',
    id : 'prm-pnl-filters',
    renderTo: Ext4.get('main_form'),
    hidden : true,
    listeners : {
       beforerender : function() {
           var panel = this;
           
           if (PRM.App.Stores.feature.isSubsidiaryEnabled()) {
               panel.down('#prm-fltr-display-subsidiary').setVisible(true);
               panel.down('#prm-fltr-display-include-sub-subsidiaries').setVisible(true);
           }
           else {
               panel.down('#prm-fltr-display-subsidiary').setVisible(false);
               panel.down('#prm-fltr-display-include-sub-subsidiaries').setVisible(false);
           }
   
           if (PRM.App.Stores.feature.isBillingClassEnabled())
               panel.down('#prm-fltr-display-billing-class').setVisible(true);
           else
               panel.down('#prm-fltr-display-billing-class').setVisible(false);
        },
        show : function() {
            new Ext4.util.DelayedTask(function() {
                PRM.App.Filter.doLayout();
            }).delay(500);
        }
    },
    items : [
        {
            xtype : 'prm-panel-hbox',
            id : 'prm-view-controls-row',
            hidden : false,
            items : [
                {
                    xtype : 'prm-combobox',
                    id : 'prm-cmb-saved-filters',
                    fieldLabel : PRM.Translation.getText('FIELD.VIEW'),
                    emptyText : PRM.Translation.getText('TEXT.DEFAULT'),
                    labelAlign : 'left',
                    prevValue : 0,
                    width : 250,
                    labelWidth : 35,
                    value : 0,
                    store : PRM.App.Stores.filter,
                    listeners : {
                        change : function(combo, newValue, oldValue, eOpts) {
                            var viewRecord = PRM.App.Stores.filter.getSelectedRecord(newValue);
                            
                            // update buttons
                            PRM.App.Filter.down('#prm-btn-edit-filter')[newValue ? (viewRecord.data.isOwnedByCurrentUser ? 'buttonAsEdit' : 'buttonAsView') : 'buttonAsAdd']();
                            // update lastUsedFilter in NS setting record; this should be the one and only place where this field is updated!
                            PRM.App.Stores.settings.updateAndSyncRecord(PRM.App.Stores.settings.getAt(0), {
                                lastUsedFilter : newValue
                            });
                            // remove inline search parameters
                            delete PRM.App.Settings.projectSearch;
                            // apply new filters
                            PRM.App.Stores.filter.applyFiltersToStores(newValue);
                        }
                    }
                },
                {
                    xtype : 'prm-btn-gray',
                    text : PRM.Translation.getText('WINDOW.CUSTOMIZE_VIEW'),
                    id : 'prm-btn-edit-filter',
                    buttonAsAdd : function() {
                        this.setText(PRM.Translation.getText('WINDOW.CUSTOMIZE_VIEW'));
                    },
                    buttonAsEdit : function() {
                        this.setText(PRM.Translation.getText('WINDOW.EDIT_VIEW'));
                    },
                    buttonAsView : function() {
                        this.setText(PRM.Translation.getText('WINDOW.VIEW_DETAILS'));
                    },
                    handler : function() {
                        if (this.getText() == PRM.Translation.getText('WINDOW.CUSTOMIZE_VIEW')) {
                            PRM.App.Forms.filterNS.openForm();
                        } else {
                            var filterId = Ext4.getCmp('prm-cmb-saved-filters').getValue();
                            
                            PRM.App.Forms.filterNS.openForm({
                                id : filterId
                            });
                        }
                    }
                },
                { xtype : 'prm-separator' },
                {
                    xtype : 'prm-btn-blue',
                    id : 'prm-btn-new-allocation',
                    text :  PRM.Translation.getText('BUTTON.NEW_RESOURCE_ALLOCATION'),
                    handler : function() {
                        PRM.App.Forms.allocationNS.openForm();
                    }
                },
                {
                    xtype : 'prm-btn-blue',
                    id : 'prm-btn-new-task-assignment',
                    text : PRM.Translation.getText('BUTTON.NEW_TASK_ASSSIGNMENT'),
                    handler : function() {
                    	PRM.App.Forms.taskAssignment.openAsNew();
                    }
                }
            ]
        },
        {
            border : true,
            id : 'prm-pnl-filter-summary',
            maxHeight : 100,
            margin : 0,
            items : [
                {
                    xtype : 'prm-panel-hbox',
                    id : 'prm-pnl-fltr-summary-header',
                    height : 26,
                    setToDefaultValue : function (item) {
                        if (item.isCheckBox) {
                            item.setValue(PRM.Translation.getText('TEXT.FALSE'));
                        } else {
                            item.setValue(PRM.Translation.getText('TEXT.ALL-'));
                        }
                    },
                    forEachItem : function (fnCallBack) {
                        this.items.items.forEach(function (item) {
                            if (/^(prm-fltr-display-).*/ig.test(item.id)) {
                                if (fnCallBack) {
                                    fnCallBack(item);
                                }
                            }
                        });
                    },
                    setHeaderValues : function (idValueMap) {
                        this.forEachItem(function (item) {
                            var headerValue = idValueMap[item.id];
                            item.setValue(headerValue);
                        });
                    },
                    items : [
                        {
                            xtype : 'prm-button-toggle-filter',
                            id : 'prm-tgl-filter-icon'
                        },
                        {
                            xtype : 'prm-filter-headers-display',
                            id : 'prm-fltr-display-date-hdr',
                            fieldLabel : PRM.Translation.getText('FIELD.START_DATE')
                        },
                        {
                            xtype : 'prm-filter-headers-display',
                            id : 'prm-fltr-display-employee-hdr',
                            fieldLabel : PRM.Translation.getText('TEXT.EMPLOYEE')
                        },
                        {
                            xtype : 'prm-filter-headers-display',
                            id : 'prm-fltr-display-generic-resource-hdr',
                            fieldLabel : PRM.Translation.getText('TEXT.GENERIC_RESOURCE')
                        },
                        {
                            xtype : 'prm-filter-headers-display',
                            id : 'prm-fltr-display-vendor-hdr',
                            fieldLabel : PRM.Translation.getText('TEXT.VENDOR')
                        },
                        {
                            xtype : 'prm-filter-headers-display',
                            id : 'prm-fltr-display-billing-class-hdr',
                            fieldLabel : PRM.Translation.getText('FIELD.BILLING_CLASS')
                        },
                        {
                            xtype : 'prm-filter-headers-display',
                            id : 'prm-fltr-display-subsidiary-hdr',
                            fieldLabel : PRM.Translation.getText('FIELD.SUBSIDIARY')
                        },
                        {
                            xtype : 'prm-filter-headers-display',
                            id : 'prm-fltr-display-include-sub-subsidiaries-hdr',
                            fieldLabel : PRM.Translation.getText('FIELD.INCLUDE_SUB-SUBSIDIARIES'),
                            value : PRM.Translation.getText('TEXT.FALSE'),
                            isCheckBox : true
                        },
                        /*{
                            xtype : 'prm-filter-headers-display',
                            id : 'prm-fltr-display-allocated-to-projects-only-hdr',
                            fieldLabel : PRM.Translation.getText('FIELD.ALLOCATED_TO_PROJECTS_ONLY'),
                            value : PRM.Translation.getText('TEXT.FALSE'),
                            isCheckBox : true
                        },
                        {
                            xtype : 'prm-filter-headers-display',
                            id : 'prm-fltr-display-assigned-to-tasks-only-hdr',
                            fieldLabel : PRM.Translation.getText('FIELD.ASSIGNED_TO_TASKS_ONLY'),
                            value : PRM.Translation.getText('TEXT.FALSE'),
                            isCheckBox : true
                        },*/
                        {
                            xtype : 'prm-filter-headers-display',
                            id : 'prm-fltr-display-customer-hdr',
                            fieldLabel : PRM.Translation.getText('FIELD.CUSTOMER')
                        },
                        {
                            xtype : 'prm-filter-headers-display',
                            id : 'prm-fltr-display-project-hdr',
                            fieldLabel : PRM.Translation.getText('TEXT.PROJECT')
                        },
                        {
                            xtype : 'prm-filter-headers-display',
                            id : 'prm-fltr-display-task-hdr',
                            fieldLabel : PRM.Translation.getText('FIELD.TASK')
                        }
                    ]
                }, {
                    xtype : 'prm-panel-hbox',
                    id : 'prm-pnl-filter-body',
                    hideMode : 'display',
                    height : 60,
                    style : {
                        'background-color' : 'white',
                    },
                    defaults : {
                        margin : '10 0 10 20',
                        maxWidth : 200
                    },
                    setToDefaultValue : function (item) {
                        if (item.isCheckBox) {
                            item.setValue(PRM.Translation.getText('TEXT.FALSE'));
                        } else if (item.id == 'prm-fltr-display-date') {
                            item.setValue('(' + PRM.Translation.getText('TEXT.PROJECT') + ') ' + Ext4.Date.format(Ext4.Date.add(new Date(), Ext4.Date.YEAR, -1), 'F d, Y'));
                        } else {
                            item.setValue(PRM.Translation.getText('TEXT.ALL-'));
                        }
                    },
                    forEachItem : function (fnCallBack) {
                        this.items.items.forEach(function (item) {
                            if (/^(prm-fltr-display-).*/ig.test(item.id)) {
                                if (fnCallBack) {
                                    fnCallBack(item);
                                }
                            }
                        });
                    },
                    setHeaderValues : function (idValueMap) {
                        this.forEachItem(function (item) {
                            var headerValue = idValueMap[item.id];
                            item.setValue(headerValue);
                        });
                    },
                    items : [
                        {
                            xtype : 'prm-display',
                            id : 'prm-fltr-display-date',
                            fieldLabel : PRM.Translation.getText('FIELD.START_DATE')
                        },
                        {
                            xtype : 'prm-display',
                            id : 'prm-fltr-display-employee',
                            fieldLabel : PRM.Translation.getText('TEXT.EMPLOYEE')
                        },
                        {
                            xtype : 'prm-display',
                            id : 'prm-fltr-display-generic-resource',
                            fieldLabel : PRM.Translation.getText('TEXT.GENERIC_RESOURCE')
                        },
                        {
                            xtype : 'prm-display',
                            id : 'prm-fltr-display-vendor',
                            fieldLabel : PRM.Translation.getText('TEXT.VENDOR')
                        },
                        {
                            xtype : 'prm-display',
                            id : 'prm-fltr-display-billing-class',
                            fieldLabel : PRM.Translation.getText('FIELD.BILLING_CLASS')
                        },
                        {
                            xtype : 'prm-display',
                            id : 'prm-fltr-display-subsidiary',
                            fieldLabel : PRM.Translation.getText('FIELD.SUBSIDIARY')
                        },
                        {
                            xtype : 'prm-display',
                            id : 'prm-fltr-display-include-sub-subsidiaries',
                            fieldLabel : PRM.Translation.getText('FIELD.INCLUDE_SUB-SUBSIDIARIES'),
                            value : PRM.Translation.getText('TEXT.FALSE'),
                            isCheckBox : true
                        },
                        /*{
                            xtype : 'prm-display',
                            id : 'prm-fltr-display-allocated-to-projects-only',
                            fieldLabel : PRM.Translation.getText('FIELD.ALLOCATED_TO_PROJECTS_ONLY'),
                            value : PRM.Translation.getText('TEXT.FALSE'),
                            isCheckBox : true
                        },
                        {
                            xtype : 'prm-display',
                            id : 'prm-fltr-display-assigned-to-tasks-only',
                            fieldLabel : PRM.Translation.getText('FIELD.ASSIGNED_TO_TASKS_ONLY'),
                            value : PRM.Translation.getText('TEXT.FALSE'),
                            isCheckBox : true
                        },*/
                        {
                            xtype : 'prm-display',
                            id : 'prm-fltr-display-customer',
                            fieldLabel : PRM.Translation.getText('FIELD.CUSTOMER')
                        },
                        {
                            xtype : 'prm-display',
                            id : 'prm-fltr-display-project',
                            fieldLabel : PRM.Translation.getText('TEXT.PROJECT')
                        },
                        {
                            xtype : 'prm-display',
                            id : 'prm-fltr-display-task',
                            fieldLabel : PRM.Translation.getText('FIELD.TASK')
                        }
                    ]
                }
            ]
        }
    ],
    setFormAndHeaderValues : function(filterRecord) {
        
        this.filterSummaryHeader = this.filterSummaryHeader || this.down('#prm-pnl-fltr-summary-header');
        this.filterSummaryBody = this.filterSummaryBody || this.down('#prm-pnl-filter-body');
        
        if (filterRecord.get('id')) {
            
            var startDate       = filterRecord.get('startDate'),
                employeeFlag    = filterRecord.get('resourceTypeEmployee'),
                vendorFlag      = filterRecord.get('resourceTypeVendor'),
                genericFlag     = filterRecord.get('resourceTypeGeneric'),
                employee        = employeeFlag && filterRecord.get('employeeNames') ? filterRecord.get('employeeNames') : PRM.Translation.getText('TEXT.ALL-'),
                vendor          = vendorFlag && filterRecord.get('vendorNames') ? filterRecord.get('vendorNames') : PRM.Translation.getText('TEXT.ALL-'),
                genericResource = genericFlag && filterRecord.get('genericResourceNames') ? filterRecord.get('genericResourceNames') : PRM.Translation.getText('TEXT.ALL-'),
                billingClass    = filterRecord.get('billingClassNames') ? filterRecord.get('billingClassNames') : PRM.Translation.getText('TEXT.ALL-'),
                subsidiary      = filterRecord.get('subsidiaryNames') ? filterRecord.get('subsidiaryNames') : PRM.Translation.getText('TEXT.ALL-'),
                subSubsidiary   = filterRecord.get('includeSubSubsidiary') ? PRM.Translation.getText('TEXT.TRUE') : PRM.Translation.getText('TEXT.FALSE'),
                customer        = filterRecord.get('customerNames') ? filterRecord.get('customerNames') : PRM.Translation.getText('TEXT.ALL-'),
                project         = filterRecord.get('projectNames') ? filterRecord.get('projectNames') : PRM.Translation.getText('TEXT.ALL-'),
                task            = filterRecord.get('taskNames') ? filterRecord.get('taskNames') : PRM.Translation.getText('TEXT.ALL-');
            
            var startDateType = nlapiLookupField('customlist_prm_start_date_type', filterRecord.get('startDateType'), 'name');
            startDate = '(' + startDateType + ') ' + Ext4.Date.format(startDate, 'F d, Y');
            
            this.down('#prm-fltr-display-employee').setVisible(employeeFlag);
            this.down('#prm-fltr-display-generic-resource').setVisible(genericFlag);
            this.down('#prm-fltr-display-vendor').setVisible(vendorFlag);
            
            this.filterSummaryBody.setHeaderValues({
                'prm-fltr-display-date'                     : startDate,
                'prm-fltr-display-employee'                 : employee,
                'prm-fltr-display-vendor'                   : vendor,
                'prm-fltr-display-generic-resource'         : genericResource,
                'prm-fltr-display-billing-class'            : billingClass,
                'prm-fltr-display-subsidiary'               : subsidiary,
                'prm-fltr-display-include-sub-subsidiaries' : subSubsidiary,
                'prm-fltr-display-customer'                 : customer,
                'prm-fltr-display-project'                  : project,
                'prm-fltr-display-task'                     : task,
            });
        } else {
            this.filterSummaryHeader.forEachItem(this.filterSummaryHeader.setToDefaultValue);
            this.filterSummaryBody.forEachItem(this.filterSummaryBody.setToDefaultValue);
        }
    }
});