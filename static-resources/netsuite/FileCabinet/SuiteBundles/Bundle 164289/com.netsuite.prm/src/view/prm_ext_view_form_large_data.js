/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

Ext4.define('PRM.Cmp.SearchPanel', {
    extend : 'Ext4.form.Panel',
    alias : 'widget.prm-panel-search',
    layout : 'form',
    border : false,
    padding : 20,
    initComponent : function(args) {
        var panel = this;
        Ext4.apply(panel, {
            defaults : {
                padding : 15,
                flex : 1
            },
            dockedItems : {
                xtype : 'prm-form-toolbar',
                items : [
                    {
                        xtype : 'prm-btn-blue',
                        id : panel.id + '-ok',
                        text : PRM.Translation.getText('BUTTON.OK'),
                        formBind : true
                    },
                    {
                        xtype : 'prm-btn-gray',
                        id : panel.id + '-cancel',
                        text : PRM.Translation.getText('BUTTON.CANCEL')
                    }
                ]
            },
            items : [
                 {
                     xtype : 'prm-combobox',
                     id : panel.id + '-data-range',
                     width : 450
                 },
                 {
                     xtype : 'prm-field-container',
                     layout : 'hbox',
                     width : 450,
                     items : [
                         {
                             xtype : 'prm-text',
                             id : panel.id + '-search-text',
                             flex : 4
                         },
                         {
                             xtype : 'prm-btn-gray',
                             id : panel.id + '-search-button',
                             text : PRM.Translation.getText('BUTTON.SEARCH'),
                             margin : '0 0 0 10',
                             flex : 1
                         },
                     ]
                },
                {
                     xtype : 'prm-itemselector',
                     id : panel.id + '-item-selector',
                     store : Ext4.create('Ext4.data.Store', {
                         model : 'PRM.Model.SimpleList'
                     })
                }
            ]
        });
        
        panel.callParent(args); // call last - does nothing
    }
});

Ext4.define('PRM.Cmp.LargeDataForm', {
    extend : Ext4.window.Window,
    autoHeight : true,
    closeAction : 'hide',
    closable : true,
    cls : 'prm-form-window',
    ghost : false,
    plain : true,
    modal : true,
    padding : 10,
    resizable : false,
    width : 500,
    selected : [],
    selectedIds  : [],
    searchText : '',
    items : {
        xtype : 'prm-panel-search'
    },
    listeners : {
        afterRender : function(window, eOpts){
            // mask for initial loading of selector box
            var selector = window.down('#' + window.id + '-panel-item-selector');
            selector.mask();
        },
        beforeShow : function(window, eOpts) {
            var rangeCmb = window.down('#' + window.id + '-panel-data-range'),
                searchTxt = window.down('#' + window.id + '-panel-search-text'),
                selector = window.down('#' + window.id + '-panel-item-selector'),
                selectorStore = selector.getStore(),
                component = Ext4.getCmp(window.comboId);

            window.selected = component.selectedRecords.slice(0); // copy array

            selectorStore.loadData([],false);
            selector.bindStore(selectorStore);
        
            searchTxt.reset();

            var isDefaultPageRange = (window.searchText == '');
            if (!isDefaultPageRange){
                // load default page range if coming from search
                window.searchText = '';
                window.loadRangeContent({});
            }
            else {
                rangeCmb.select(0);
            }
            
            // load selection box
            window.loadItemSelectorContent({startIndex: 0,endIndex: 1000});             

        }
    },
    initComponent : function (args) {
        var window = this,
            formPanel = window.items;
    
        Ext4.apply(formPanel, {
            id : window.id + '-panel'
        });
        
        window.callParent(args);
        
        var okButton = window.down('#' + window.id + '-panel-ok'),
            closeButton = window.down('#' + window.id + '-panel-cancel'),
            rangeCmb = window.down('#' + window.id + '-panel-data-range'),
            searchTxt = window.down('#' + window.id + '-panel-search-text'),
            searchButton = window.down('#' + window.id + '-panel-search-button'),
            selector = window.down('#' + window.id + '-panel-item-selector');
        
        rangeCmb.bindStore(window.rangeStore);
        rangeCmb.on('select', function(combo) {
            var range = combo.getStore().getById(combo.getValue());
            
            if (range) {
                var params = { 
                    nameContains: window.searchText,
                    startIndex: range.get('startIndex'), 
                    endIndex: range.get('endIndex') 
                };
                window.loadItemSelectorContent(params);
            }
        });
        
        selector.bindStore(window.selectorStore);
        
        selector.on('change', function(selector, newValue, oldValue) {
            var selectorStore = selector.getStore();

            window.selected.length = 0;
            window.selectedIds.length = 0;

            if (newValue[0] == 0) 
                newValue.splice(0, 1);
            for (var i = 0; i < newValue.length; i++){   
                if (newValue[i] != 0) {
                    var record = selectorStore.getById(newValue[i]);
                    window.selected.push(record);
                    window.selectedIds.push(newValue[i]);
                }
            }
        });
        
        okButton.setHandler(function (button) {
            var selector = window.down('#' + window.id + '-panel-item-selector'),
                selectorStore = selector.getStore(),
                selected = window.selected,
                component = Ext4.getCmp(window.comboId);

            if(!window.isMultiSelect && selected.length > 1)    {
                alert('Only 1 selected item allowed');
            }
            else if (selected.length < 1 && !window.allowBlank){
                alert('Minimum 1 selected item allowed');
            }
            else if (selected.length < 1 && window.allowBlank){
                component.setSelectedRecords(window.selected);
                window.hide();
            }
            else {
                component.setSelectedRecords(window.selected.slice(0));
                window.hide();
            }
        });
        
        closeButton.setHandler(function(button) {
            window.selected.length = 0;
            window.selectedIds.length = 0;
            window.hide();
        });

        searchButton.setHandler(function(button){
            window.searchText = searchTxt.getValue();
            window.loadItemSelectorContent({
                nameContains: window.searchText,
                startIndex: 0,
                endIndex: 1000            
            });
            window.loadRangeContent({
                nameContains: window.searchText
            });
            
        });
    },
    loadItemSelectorContent : function(params) {
        var window = this,
            selector = window.down('#' + window.id + '-panel-item-selector'),
            selectorStore = selector.getStore(),
            component = Ext4.getCmp(window.comboId);
        
        if (window.rendered) selector.mask();
        
        selectorStore.loadData([], false);
        selector.bindStore(selectorStore);
        
        selectorStore.load({
            scope: this,
            params: params,
            callback: function(records, operation, success) {
                if (success) {
                    if (window.selected.length == 0) {
                        window.selected = component.selectedRecords.slice(0);
                    } else {
                        selectorStore.loadData(window.selected, true);
                    }
                    
                    for(var i = 0; i < window.selected.length; i++){
                        var selectedRecord = window.selected[i], 
                            id = selectedRecord.get('id'),
                            record = selectorStore.getById(id);
                        
                        window.selectedIds.push(id);
                        
                        if (!record) {
                            console.log('is this ever executed???');
                            selectorStore.insert(0, [selectedRecord]);
                        }
                    }
                    
                    selector.setValue(window.selectedIds);
                    selector.unmask();
                }
            }
        });
    },
    loadRangeContent : function(params) {
        var window = this,
            rangeCmb = window.down('#' + window.id + '-panel-data-range'),
            rangeStore = rangeCmb.getStore();

        if (window.rendered) rangeCmb.mask();
        
        rangeStore.loadData([], false);
        rangeCmb.bindStore(rangeStore);
        
        rangeStore.load({
            scope: this,
            params: params,
            callback: function(records, operation, success) {
                if (success) {
                    rangeCmb.select(0);
                    rangeCmb.unmask();
                }
                
            }
        });
    }
});