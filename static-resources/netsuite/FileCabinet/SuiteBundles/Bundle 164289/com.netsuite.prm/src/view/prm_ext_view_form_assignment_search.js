/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

Ext4.define('PRM.Cmp.AssignmentSearchForm', {
    extend : 'PRM.Cmp.Form',
    title : PRM.Translation.getText('WINDOW.SEARCH_RESOURCE'),
    initComponent : function (args) {
        var me    = this,
            items = me.items;
        
        me.setItems(items);
        me.callParent(args);
        
        me.searchBtn = me.down('#' + me.id + '-panel-save');
        me.billingClass = me.down('#' + me.id + '-billing-class-cmb');
        me.laborCost = me.down('#' + me.id + '-max-labor-cost');
        
        me.searchBtn.setText(PRM.Translation.getText('BUTTON.SUBMIT'));
        me.searchBtn.setHandler(function () {
            var billingClass = me.billingClass.getValue(),
                laborCost    = me.laborCost.getValue(),
                viewFilters  = JSON.stringify(Ext4.getCmp('prm-cmb-saved-filters').getSelectedRecord().data),
                resultForm   = PRM.App.Forms.assignmentResult;
            
            resultForm.show();
            resultForm.loadResults({
                billingClass : billingClass,
                laborCost    : laborCost,
                viewFilters  : viewFilters
            });
            
            me.hide();
        });
    },
    componentIdList : [
        'billing-class-cmb', 'max-labor-cost'
    ],
    setItems : function (formPanel) {
        var window = this;
            
        Ext4.apply(formPanel, {
            defaults : {
                padding: '0 0 10 0'
            },
            items : [
                {
                    xtype : 'prm-combobox',
                    id : window.id + '-billing-class-cmb',
                    fieldLabel : PRM.Translation.getText('FIELD.BILLING_CLASS'),
                    allowBlank : true,
                    emptyText : PRM.Translation.getText('TEXT.ALL-'),
                    forceSelection : false,
                    store : PRM.App.Stores.billingClassForm
                },
                {
                    xtype : 'prm-number',
                    id : window.id + '-max-labor-cost',
                    fieldLabel : PRM.Translation.getText('FIELD.MAX_LABOR_COST'),
                    allowBlank : true
                }
            ]
        });
    },
    listeners : {
        hide : function(me) {
            me.resetFormFields();
        }
    }
});

Ext4.define('PRM.Cmp.AssignmentResultForm', {
    extend : 'PRM.Cmp.Window',
    title : PRM.Translation.getText('WINDOW.SELECT_RESOURCE'),
    width : 800,
    height : 375,
    defaults : {
        margin : '20 0 0 20'
    },
    layout : 'vbox',
    items : [
        {
            xtype : 'panel',
            layout : 'hbox',
            border : false,
            defaults : {
                margin : '0 15 0 0'
            },
            items : [
                {
                    xtype : 'prm-btn-blue',
                    id : 'prm-form-assignment-search-result-return',
                    text : PRM.Translation.getText('BUTTON.RETURN_TO_CRITERIA'),
                    handler : function() {
                        var searchForm  = PRM.App.Forms.assignmentSearch,
                            storeParams = PRM.App.Stores.assignmentSearch.params;
                        
                        PRM.App.Forms.assignmentResult.hide();
                        
                        searchForm.show();
                        searchForm.billingClass.setValue(storeParams.billingClass);
                        searchForm.laborCost.setValue(storeParams.laborCost);
                    }
                },
                {
                    xtype : 'prm-btn-gray',
                    id : 'prm-form-assignment-search-result-close',
                    text : PRM.Translation.getText('BUTTON.CLOSE'),
                    handler : function() {
                        PRM.App.Forms.assignmentResult.hide();
                        PRM.App.Forms.assignmentSearch.hide();
                    }
                }
            ]
        },
        {
            xtype : 'grid',
            id : 'prm-assignment-search-results-grid',
            cls : 'prm-assignment-search-results',
            store : PRM.App.Stores.assignmentSearch,
            width : 737,
            height : 240,
            autoScroll : true,
            invalidateScrollerOnRefresh : false,
            disableSelection : true,
            viewConfig : {
                loadMask : false
            },
            hidden : true,
            columns : [
                {
                    xtype : 'actioncolumn',
                    id : 'prm-form-assignment-search-result-column-select',
                    text : PRM.Translation.getText('HEADER.SELECT'),
                    dataIndex : 'resourceId',
                    menuDisabled : true,
                    resizeable : false,
                    iconCls : 'prm-icon-select',
                    width : 58,
                    handler : function(grid, row, col, column, event, rec) {
                        var resourceField = Ext4.getCmp(PRM.App.Forms.assignmentSearch.triggerFormId + '-resource');
                        resourceField.setValue(rec.get('resourceId'));
                        PRM.App.Forms.assignmentResult.hide();
                        PRM.App.Forms.assignmentSearch.hide();
                    }
                }, {
                    id : 'prm-form-assignment-search-result-column-name',
                    text : PRM.Translation.getText('HEADER.RESOURCE'),
                    dataIndex : 'resourceName',
                    menuDisabled : true,
                    resizeable : false,
                    width : 250
                }, {
                    id : 'prm-form-assignment-search-result-column-type',
                    text : PRM.Translation.getText('HEADER.TYPE'),
                    dataIndex : 'resourceType',
                    menuDisabled : true,
                    resizeable : false,
                    width : 130
                }, {
                    id : 'prm-form-assignment-search-result-column-billing-class',
                    text : PRM.Translation.getText('HEADER.BILLING_CLASS'),
                    dataIndex : 'billingClass',
                    menuDisabled : true,
                    resizeable : false,
                    width : 170
                }, {
                    id : 'prm-form-assignment-search-result-column-labor-cost',
                    text : PRM.Translation.getText('HEADER.LABOR_COST'),
                    dataIndex : 'laborCost',
                    menuDisabled : true,
                    resizeable : false,
                    width : 110
                }
            ]
        },
        {
            xtype : 'text',
            id : 'prm-form-assignment-search-result-empty',
            text : PRM.Translation.getText('TEXT.NO_SEARCH_RESULTS'),
            layout : 'block',
            hidden : true
        }
    ],
    loadResults : function(params) {
        var store = PRM.App.Stores.assignmentSearch;
        
        if (store.hasOwnProperty('params')) {
            Ext4.apply(store.params, params);
        } else {
            store.params = params;
        }
        
        store.load({
            params      : store.params
        });
    },
    listeners : {
        hide : function() {
            Ext4.getCmp('prm-form-assignment-search-result-empty').hide();
            Ext4.getCmp('prm-assignment-search-results-grid').hide();
        }
    }
});