/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

Ext4.define('PRM.Cmp.Panel', {
    extend : 'Ext4.panel.Panel',
    alias : 'widget.prm-panel-hbox',
    border : false,
    layout : {
        type : 'hbox',
        align : 'middle'
    },
    defaults : {
        margin : '0 15 0 0'
    }
});

Ext4.define('PRM.Cmp.FormPanel', {
    extend : 'Ext4.form.Panel',
    alias : 'widget.prm-panel-form',
    layout : 'form',
    border : false,
    padding : 20,
    initComponent : function(args) {
        var panel = this;
        Ext4.apply(panel, {
            dockedItems : {
                xtype : 'prm-form-toolbar',
                items : [
                    {
                        xtype : 'prm-btn-blue',
                        id : panel.id + '-save',
                        text : PRM.Translation.getText('BUTTON.SAVE'),
                        formBind : true
                    },
                    {
                        xtype : 'prm-btn-gray',
                        id : panel.id + '-cancel',
                        text : PRM.Translation.getText('BUTTON.CANCEL')
                    },
                    {
                        xtype : 'prm-btn-gray',
                        id : panel.id + '-delete',
                        text : PRM.Translation.getText('BUTTON.DELETE'),
                        hidden : true
                    },
                    {
                        xtype : 'prm-btn-gray',
                        id : panel.id + '-restore-default',
                        text : PRM.Translation.getText('BUTTON.RESTORE_DEFAULT'),
                        hidden : true
                    }
                ]
            }
        });
        
        panel.callParent(args); // call last - does nothing
    }
});

Ext4.define('PRM.Cmp.Window', {
    extend : 'Ext4.window.Window',
    autoHeight : true,
    closeAction : 'hide',
    closable : true,
    cls : 'prm-form-window',
    ghost : false,
    modal : true,
    padding : 10,
    plain : true,
    resizable : false,
    width : 440
});

Ext4.define('PRM.Cmp.Form', {
    extend : 'PRM.Cmp.Window',
    recordId : 0, // allocationId or taskAssignmentId 
    items : {
        xtype : 'prm-panel-form'
    },
    initComponent : function (args) {
        var window = this,
            formPanel = window.items;
        
        Ext4.apply(formPanel, {
            id : window.id + '-panel'
        });
        
        window.callParent(args);
        
        var closeButton = window.down('#' + window.id + '-panel-cancel');
        
        closeButton.setHandler(function() {
            window.hide(null, window.resetFormFields);
        });
    },
    resetFormFields : function () {
        var window = this;
        
        if (window.recordId) window.recordId = 0;
        if (window.record) window.record = {};
        if (window.gridRow) window.gridRow = {};
        
        if (window.componentIdList) {
            for (var i = 0; i < window.componentIdList.length; i++) {
                var item = window.down('#' + window.id + '-' + window.componentIdList[i]);
                
                if (item instanceof Ext4.Component) {
                    item.suspendEvents();
                    item.reset();
                    item.resumeEvents();
                }
            };
        }
    },
    listners : {
        hide : function (window, eOpts) {
            if (PRM.App.Grid) PRM.App.Grid.getView().refresh();
        }
    },
    componentIdList : [], // component/fields' ID list to be reset on hide
    applyToGrid : Ext4.emptyFn, // override this 
    setItems : Ext4.emptyFn // called on initComponent to add fields to the window.
});