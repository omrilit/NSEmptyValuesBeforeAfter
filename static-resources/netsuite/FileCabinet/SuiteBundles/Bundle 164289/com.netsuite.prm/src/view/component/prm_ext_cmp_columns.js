/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

Ext4.define('PRM.Cmp.Column', {
    extend: 'Ext4.grid.column.Column',
    alias: 'widget.prm-grid-column',
    cls: 'prm-grid-header',
    menuDisabled: true,
    hideable: false, 
    lockable: false,
    resizable: false,
    align: 'right',
    width: 90,
    editor: PRM.Cmp.Editor.Number,
    renderer: function(value, metaData, record, row, col, store, view) {
        if (record.get('type') == 'project') {
            metaData.tdCls = 'prm-project';
        }

        return value;
    }
});

Ext4.define('PRM.Cmp.LockedColumn', {
    extend: 'PRM.Cmp.Column',
    alias: 'widget.prm-grid-locked-column',
    resizable: false,
    align: 'left',
    editor: null
});

Ext4.define('PRM.Cmp.ActionColumn', {
    extend : 'Ext4.grid.column.Action',
    alias: 'widget.prm-grid-action-column',
    cls: 'prm-grid-header',
    menuDisabled: true,
    hideable: false, 
    lockable: false,
    resizable: false,
    width : 50,
    align: 'center',
    renderer : function(value, metaData, record, row, col, store, view) {
        var recordType = record.get('type'),
            addClasses = [];
        
        if (recordType == 'project') {
            addClasses.push('prm-project');
        } else if (recordType == 'task') {
            addClasses.push('prm-task');
        }
        
        PRM.App.Grid.addTestAutomationHook('left', addClasses, row, col);
        metaData.tdCls = [metaData.tdCls, addClasses.join(' ')].join(' ');
        
        return '';
    }
});

Ext4.define('PRM.Cmp.Menu', {
    extend : 'Ext4.menu.Menu',
    alias : 'widget.prm-grid-menu',
    margin : '0 0 10 0',
    floating : true,
    plain : true,
    defaults : {
        cls : 'prm-no-icon-menu'
    },
    initComponent : function (args) {
        this.callParent(args);
        
        this.on('hide', function (menu) { 
            // put in the "on" function because it will not trigger when instance also defined some listeners
            // reset disabled items on hide. 
            var items = menu.items;
            var tooltipClasses = [
                'prm-tooltip-read-only-worked-hours',
                'prm-tooltip-read-only-has-assignments',
                'prm-tooltip-no-records-to-delete'
            ];
            for (var i = 0; i < items.length; i++) {
                items.getAt(i).enable();
                for (var j = 0; j < tooltipClasses.length; j++) {
                    items.getAt(i).removeCls(tooltipClasses[j]);
                }
            }
        });
    }
});