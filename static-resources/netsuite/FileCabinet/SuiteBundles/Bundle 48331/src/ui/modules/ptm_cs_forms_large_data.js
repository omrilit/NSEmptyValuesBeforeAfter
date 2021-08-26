/**
 * © 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

Ext4.define('PSA.RA.Forms.LargeData', {
    extend        : 'PSA.RA.UIComponent.Window',
    width         : 500,
    height        : 480,
    type          : null,
    selection     : [],
    selectionIDs  : [],
    selectionName : null,
    listeners : {
        beforeShow : function(me, eOpts) { 
            perfTestLogger.start('Load datarange content');
            me.getStoreAndTitle(me.type);

            var itemSelectorStore = PSA.RA.dataStores.largeDataSelectedStore;
            itemSelectorStore.loadData([],false);
            me.selection.length = 0;
            me.selectionIDs.length = 0;
            me.selectionName = '';
            Ext4.getCmp('ptm-largedata-range').show();
            Ext4.getCmp('ptm-largedata-range-space').show();
            Ext4.getCmp('ptm-largedata-range').setValue(0);
            Ext4.getCmp('ptm-largedata-searchtext').reset();
            Ext4.getCmp('ptm-largedata-itemselector').bindStore(itemSelectorStore);
            Ext4.getCmp('ptm-largedata-itemselector').setValue(0);       
            perfTestLogger.stop();
            Ext4.getCmp('ptm-largedata-range').fireEvent('select');
        }
    },
    items : [
        Ext4.create('Ext4.form.Panel', {
            id         : 'ptm-largedata-panel',
            layout     : 'form',
            border     : false,
            padding    : '10 30 10 30',
            items      : [
                Ext4.create('PSA.RA.UIComponent.ComboBox', {
                    id         : 'ptm-largedata-range',
                    fieldLabel : '',
                    listeners  : {
                        select : function(combo, record, eOpts) {
                            var form = PSA.RA.App.formLargeData;
                            var range  = this.getSelectedRecord();
                            if(range){
                                var startIndex = range.get('startIndex');
                                var endIndex = range.get('endIndex');
                                var params = { startIndex: startIndex, endIndex: endIndex };
                                var url = form.getURL(form.type);
                                form.loadItemSelectorContent(url, params);
                            }
                        }
                    }
                }),
                Ext4.create('PSA.RA.UIComponent.HSpace', { id: 'ptm-largedata-range-space' }),
                Ext4.create('PSA.RA.UIComponent.form.flex.FieldContainer', {
                    id       : 'ptm-largedata-search',
                    layout   : 'hbox',
                    items    : [
                        Ext4.create('Ext4.form.field.Text', {
                            id         : 'ptm-largedata-searchtext',
                            fieldLabel : '',
                            flex       : 4.15
                        }),
                        Ext4.create('PSA.RA.UIComponent.HSpace', { flex: 0.25 } ),
                        Ext4.create('PSA.RA.UIComponent.GrayButton', {
                            id        : 'ptn-largedata-searchbutton',
                            text      : 'Search',
                            flex      : 2.50,
                            handler : function() {
                                var form = PSA.RA.App.formLargeData;
                                var searchText = Ext4.getCmp('ptm-largedata-searchtext').getValue();
                                if (searchText == '' && !Ext4.getCmp('ptm-largedata-range').isVisible()) {
                                    Ext4.getCmp('ptm-largedata-range-space').show();
                                    Ext4.getCmp('ptm-largedata-range').show();
                                    Ext4.getCmp('ptm-largedata-range').fireEvent('select');
                                }
                                else if (searchText != '') {
                                    Ext4.getCmp('ptm-largedata-range-space').hide();
                                    Ext4.getCmp('ptm-largedata-range').hide();
                                    var params = { nameContains: searchText };
                                    var url = form.getURL(form.type);
                                    form.loadItemSelectorContent(url, params);
                                }
                            }
                        })
                    ]
                }),
                Ext4.create('PSA.RA.UIComponent.Space'),
                Ext4.create('PSA.RA.UIComponent.LargeDataItemSelector', {
                    id: 'ptm-largedata-itemselector',
                    height: 250,
                    store: PSA.RA.dataStores.largeDataSelectedStore,
                    listeners  : {
                        change : function(me) {
                            var form = PSA.RA.App.formLargeData;
                            var itemSelectorStore = me.store;
                            var ids = me.getValue();
                            form.selection.length = 0;
                            form.selectionIDs.length = 0;
                            form.selectionName = '';

                            if (ids[0] == 0) 
                                ids.splice(0, 1);
                            for (var i = 0; i < ids.length; i++){   
                                if (ids[i] != 0) {
                                    var record = itemSelectorStore.findRecord('id', ids[i]);
                                    form.selection.push(record);
                                    form.selectionIDs.push(ids[i]);
                                    if (i == 0)
                                        form.selectionName = record.get('name');
                                    else
                                        form.selectionName = form.selectionName + ', ' + record.get('name');
                                }
                            }
                        }
                    }                    
                })
            ],
            dockedItems : [{
                xtype    : 'toolbar',
                dock     : 'top',
                ui       : 'footer',
                padding  : '0 0 10 0',
                items : [
                    Ext4.create('PSA.RA.UIComponent.BlueButton', {
                        text : 'OK',
                        handler : function() {
                            var form = PSA.RA.App.formLargeData;
                            var itemSelectorStore = PSA.RA.dataStores.largeDataSelectedStore;;
                            var selection = form.selection;
                            var tempStore, component = null;
                            var singleSelect = false;

                            if (form.type == 'projectresource' || form.type == 'serviceitem')
                                singleSelect = true;
                            
                            component = form.getComponent(form.type);
                            tempStore = component.getTempStore(form.type);
                            
                            if(singleSelect && selection.length > 1)    {
                                alert('Only 1 selected item allowed');
                            }
                            else if(selection.length < 1 && form.type == 'projectresource'){
                                alert('Minimum 1 selected item allowed');
                            }
                            else {
                                tempStore.loadData(selection, false);
                                component.setValue(tempStore, form.selectionIDs, form.selectionName);
                                PSA.RA.App.formLargeData.hide();
                            }
                        }
                    }),
                    Ext4.create('PSA.RA.UIComponent.GrayButton', {
                        text : translatedStrings.getText('BUTTON.CANCEL'),
                        handler : function() {
                            PSA.RA.App.formLargeData.hide();
                        }
                    })
                ]
            }]
        })
    ],
    loadItemSelectorContent : function(url, params) {
        var itemSelectorStore = PSA.RA.dataStores.largeDataSelectedStore;
        perfTestLogger.start('Load itemselector content');
        itemSelectorStore.loadData([], false);
        Ext4.getCmp('ptm-largedata-itemselector').bindStore(itemSelectorStore);
        
        itemSelectorStore.getProxy().url = url;
        itemSelectorStore.load({
            scope: this,
            params: params,
            callback: function(records, operation, success) {
                if (success) {
                    var form = PSA.RA.App.formLargeData;
                    if (form.selection.length != 0) {
                        itemSelectorStore.loadData(form.selection, true);
                        Ext4.getCmp('ptm-largedata-itemselector').setValue(form.selectionIDs);
                    }
                    else {
                        var component = form.getComponent(form.type);
                        var selectedItem = component.getValue();
                        var tempStore = component.tempStore;    
                        if (selectedItem) {
                            if(form.type != 'projectresource' || form.type != 'serviceitem') {
                                for(var i = 0; i < selectedItem.length; i++){
                                    var record = tempStore.findRecord('id', selectedItem[i]);
                                    if (!itemSelectorStore.findRecord('id', selectedItem[i])) {
                                        itemSelectorStore.loadData([record], true);
                                    }
                                }
                                Ext4.getCmp('ptm-largedata-itemselector').bindStore(itemSelectorStore);
                                Ext4.getCmp('ptm-largedata-itemselector').setValue(selectedItem);
                            }
                            else {
                                if (!itemSelectorStore.findRecord('id', selectedItem.get('id'))) {
                                    itemSelectorStore.loadData([selectedItem], true);
                                }
                                Ext4.getCmp('ptm-largedata-itemselector').bindStore(itemSelectorStore);
                                Ext4.getCmp('ptm-largedata-itemselector').setValue([selectedItem.get('id')]);
                            }
                        }
                    }
                    perfTestLogger.stop();
                }
            }
        });
    },
    getStoreAndTitle : function(type) {
        var title = 'Choose ';
        var me = this;
        var component = Ext4.getCmp('ptm-largedata-range');
        switch (type) {
            case 'projectresource':
                if (!me.isGenericResource)
                    component.bindStore(PSA.RA.dataStores.largeDataRangeResourceStore);
                else
                    component.bindStore(PSA.RA.dataStores.largeDataRangeGenericResourceStore);
                title = title + 'Resource';
                break;
            case 'serviceitem':
                component.bindStore(PSA.RA.dataStores.largeDataRangeServiceItemStore);
                title = title + 'Service Item';
                break;
            case 'assignee':
                component.bindStore(PSA.RA.dataStores.largeDataRangeAssigneeStore);
                title = title + 'Assignee';
                break;
            case 'customer':
                component.bindStore(PSA.RA.dataStores.largeDataRangeCustomerStore);
                title = title + 'Customer';
                break;
            case 'project':
                component.bindStore(PSA.RA.dataStores.largeDataRangeProjectStore);
                title = title + 'Project';
                break;
            case 'projecttask':
                component.bindStore(PSA.RA.dataStores.largeDataRangeTaskStore);
                title = title + 'Task';
                break;
            case 'parenttask':
                component.bindStore(PSA.RA.dataStores.largeDataRangeParentTaskStore);
                title = title + 'Parent Task';
                break;
        }
        this.setTitle(title);
    },
    getURL : function(type) {
        var me = this;
        var url;
        if (!me.isGenericResource)
            url = '/app/site/hosting/restlet.nl?script=customscript_ptm_ss_list_data&deploy=customdeploy_ptm_ss_list_data&is_json=F&&searchType=' + type;
        else
            url = '/app/site/hosting/restlet.nl?script=customscript_ptm_ss_list_data&deploy=customdeploy_ptm_ss_list_data&is_json=F&&searchType=genericresource';
        return url;
    },
    getComponent : function(type){
        var component;
        switch (type) {
            case 'projectresource'  : component = Ext4.getCmp('taskAssignment-resource');             break;
            case 'serviceitem'      : component = Ext4.getCmp('taskAssignment-serviceItem');          break;
            case 'assignee'         : component = Ext4.getCmp('advfilter-assignees');                 break;
            case 'customer'         : component = Ext4.getCmp('advfilter-customers');                 break;
            case 'project'          : component = Ext4.getCmp('advfilter-projects');                  break;
            case 'projecttask'      : component = Ext4.getCmp('advfilter-tasks');                     break;
            case 'parenttask'       : component = Ext4.getCmp('advfilter-parenttasks');               break;
        }
        return component;
    }
});