/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

Ext4.define('PRM.Cmp.AllocationSummary', {
    extend : 'PRM.Cmp.Window',
    title : 'Resource Allocation Summary',
    width : 600,
    height : 350,
    items : [
        {
            xtype : 'grid',
            id : 'prm-allocation-summary',
            cls : 'prm-allocation-summary-table',
            store : PRM.App.Stores.allocationSummary,
            height : 260,
            maxHeight : 260,
            padding : 20,
            invalidateScrollerOnRefresh : false,
            disableSelection : true,
            viewConfig : {
                loadMask : false
            },
            columns : [
                {
                    id : 'prm-allocation-summary-resource-name',
                    text : PRM.Translation.getText('HEADER.RESOURCE'),
                    dataIndex : 'resourceName',
                    menuDisabled : true,
                    resizeable : false,
                    width : 311
                }, {
                    id : 'prm-allocation-summary-hours',
                    text : PRM.Translation.getText('HEADER.HOURS_ALLOCATED'),
                    dataIndex : 'hours',
                    menuDisabled : true,
                    resizeable : false,
                    width : 103
                }, {
                    id : 'prm-allocation-summary-percent',
                    text : PRM.Translation.getText('HEADER.PERCENT_ALLOCATED'),
                    dataIndex : 'percent',
                    menuDisabled : true,
                    resizeable : false,
                    width : 103,
                    renderer : function(value, metaData) {
                        if (Number(value.split('%')[0]) > 100) {
                            metaData.tdCls = 'prm-allocation-summary-overbooked';
                        }
                        return value;
                    }
                }
            ]
        }, {
            xtype : 'panel',
            border : false,
            layout : {
                type : 'hbox',
                pack : 'center'
            },
            items : [
                {
                    xtype : 'prm-button-link',
                    id : 'prm-load-more',
                    cls : 'prm-load-more',
                    hidden : true,
                    text : PRM.Translation.getText('BUTTON.LOAD_MORE'),
                    handler : function() {
                        PRM.App.Forms.allocationSummary.loadSummary({
                            pageNum : ++PRM.App.Stores.allocationSummary.params.pageNum
                        });
                    }
                }
            ]
        }
    ],
    loadSummary : function(params) {
        var store = PRM.App.Stores.allocationSummary;
        
        if (store.hasOwnProperty('params')) {
            Ext4.apply(store.params, params);
        } else {
            store.params = params;
        }
        console.log(store.params);
        store.load({
            params     : store.params,
            addRecords : store.params.pageNum > 1
        });
    }
});