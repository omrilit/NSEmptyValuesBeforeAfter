/**
 * © 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
 
/**
 * UI components
 * 
 */

PSA.RA.TextMetrics14px = new Ext4.util.TextMetrics('ptm-bind-14px');
PSA.RA.TextMetrics13px = new Ext4.util.TextMetrics('ptm-bind-13px');
PSA.RA.TextMetrics12px = new Ext4.util.TextMetrics('ptm-bind-12px');

Ext4.define('PSA.RA.UIComponent.ComboBox', {
    extend : 'Ext4.form.field.ComboBox',
    forceSelection : true,
    selectOnFocus : true,
    emptyText : translatedStrings.getText('MESSAGE.EMPTYTEXT.ALL2'),
    valueField : 'id',
    displayField : 'name',
    labelAlign : 'top',
    labelWidth : 110,
    maxSelections : 25,
    labelSeparator : '',
    queryMode : 'local',
    isEnabled : function() {
        return true;
    },
    listeners : {
        beforeshow : function(combobox) {
            return this.isEnabled();
        },
        boxready : function(combobox, width, height) {
            var isEnabled = this.isEnabled();
            if (!isEnabled) {
                this.hide();
            }
        }
    },
    getSelectedRecord : function() {
        return this.getStore().getById(this.getValue());
    }
});
Ext4.define('PSA.RA.UIComponent.AdvFilterComboBox', {
    extend : 'PSA.RA.UIComponent.ComboBox',
    allowBlank : true,
    forceSelection : true,
    emptyText : translatedStrings.getText('MESSAGE.EMPTYTEXT.ALL'),
    multiSelect : true,
    typeAhead : true,
    editable : false,
    width : 400,
    getSelectedRecord : function() {
        return this.getStore().getById(this.getValue());
    }
});
Ext4.define('PSA.RA.UIComponent.PagingComboBox', {
    extend : 'Ext4.form.field.ComboBox',
    editable : false,
    forceSelection : true,
    valueField : 'id',
    displayField : 'name',
    isProcessing : false,
    value : 0,
    minWidth : 250,
    maxWidth : 500,
    listConfig : {
        id : 'ra-paging-bound-list',
        baseCls : 'ra-paging-bound-list',
        minWidth : 248,
        maxWidth : 498,
        listeners : {
            afterrender : function(me, a) {
                var box = Ext4.getCmp('ra-page-combo-box');
                
                me.el.on('mouseover', function(event, el) {
                    if (!box.isExpanded) {
                        box.expand();
                    }
                });

                me.el.on('mouseleave', function(event, el) {
                    box.collapse();
                });
            }
        }
    },
    listeners : {
        afterrender : function(me) {
            me.el.on('mouseover', function() {
                if (!me.isExpanded) me.expand();
            });
            me.triggerEl.on('mouseover', function() {
                if (!me.isExpanded) me.expand();
            });
            me.el.on('mouseout', function() {
                me.collapse();
            });
            me.triggerEl.on('mouseout', function() {
                me.collapse();
            });
        },
        change : function(combo, newValue, oldValue) {
            perfTestLogger.start('Change Page');
            this.isProcessing = true;
            combo.setWidth(PSA.RA.TextMetrics14px.getSize(combo.getRawValue()).width * 1.5);//TODO: not covered in performance runtime?
            
            if ((oldValue == null && newValue == 0) || (oldValue == 0 && newValue == null)) return;

            this.setDisabled(true);
            Ext4.getCmp('ra-prevPage').setDisabled(true);
            Ext4.getCmp('ra-nextPage').setDisabled(true);
            var start = combo.findRecordByValue(newValue) == false ? 0 : combo.findRecordByValue(newValue).get('start');
            PSA.RA.dataStores.chartResource.allDataParams.start = start;
            PSA.RA.dataStores.chartResource.loadWithFilters('pagination');
        }
    }
});
Ext4.define('PSA.RA.UIComponent.CheckBox', {
    extend : 'Ext4.form.field.Checkbox',
    style : 'margin-top : 0px', // make checkboxes vertically aligned to center
    labelSeparator : '',
    isEnabled : function() {
//        var fn = this.featureName;
//        if (fn != null && fn != '' && PSA.RA.dataStores.featureStore.getById(fn)) { return PSA.RA.dataStores.featureStore.getById(fn).get('isEnabled'); }
        return true;
    },
    listeners : {
        change : function(checkbox, newValue, oldValue) {
//            var value = 'F';
//            if (newValue == true) {
//                value = 'T';
//            }
//            var record = PSA.RA.App.globalSettings;
//            record.beginEdit();
//            record.set(checkbox.getName(), value);
//            record.endEdit();
        }
    }
});
Ext4.define('PSA.RA.UIComponent.ChartDensityRadio', {
    extend : 'Ext4.form.field.Radio',
    listeners : {
        change : function(radio, newValue, oldValue) {
            if (newValue) {
                var record = PTM.Settings;
                record.beginEdit();
                record.set('chartDensity', radio.inputValue);
                record.endEdit();
            }
        }
    }
});
Ext4.define('PSA.RA.UIComponent.Column', {
    extend : 'Ext4.grid.column.Column',
    locked : true, // locked columns are rendered on the left-most side of the grid
    editable : false, // no inline editing; edit items via pop-up form
    fixed : true
// do not allow resizing of columns ??
});
Ext4.define('PSA.RA.UIComponent.Window', {
    extend : 'Ext4.window.Window',
    padding : 10,
    layout : 'form',
    closeAction : 'hide',
    autoHeight : true,
    plain : true,
    modal : true,
    resizable : false,
    cls : 'ra-form-window',
    defaults : {
        labelSeparator : ''
    }
});
Ext4.define('PSA.RA.UIComponent.ToolTip', {
    extend : 'Ext4.tip.ToolTip',
    autoHide : false,
    dismissDelay : 5000,
    hideDelay : 5000,
    trackMouse : true,
    showDelay : 0,
    renderTo : document.body,
    target : document.body,
    anchor : 'bottom',
    anchorOffset : 0,
    anchorToTarget : true,
    closable : true
});
Ext4.define('PSA.RA.UIComponent.ShortSpacer', {
    extend : 'Ext4.toolbar.Spacer',
    width : 5
});
Ext4.define('PSA.RA.UIComponent.LongSpacer', {
    extend : 'Ext4.toolbar.Spacer',
    width : 20
});
Ext4.define('PSA.RA.UIComponent.Separator', {
    extend : 'Ext4.toolbar.Separator',
    width : 3
});
Ext4.define('PSA.RA.UIComponent.FormSpacer', {
    extend : 'Ext4.Component',
    height : 22,
    autoEl : 'div'
});
Ext4.define('PSA.RA.UIComponent.Date', {
    extend : 'Ext4.form.field.Date',
    labelAlign : 'right',
    labelWidth : 110,
    allowBlank : false,
    format : convertNSDateFormat(),
    labelSeparator : '',
    submit : convertNSDateFormat()
});
Ext4.define('PSA.RA.UIComponent.Text', {
    extend : 'Ext4.form.field.Text',
    labelSeparator : '',
    labelAlign : 'top'
});
Ext4.define('PSA.RA.UIComponent.Number', {
    extend : 'Ext4.form.field.Number',
    labelSeparator : '',
    labelAlign : 'right',
    labelWidth : 110,
    minValue : 0.0001, //prevents negative numbers
    allowDecimal : true,
    decimalPrecision : 4,
    // Remove spinner buttons, and arrow key and mouse wheel listeners
    hideTrigger : true,
    keyNavEnabled : false,
    mouseWheelEnabled : false,
    isEnabled : function() {
//        var fn = this.featureName;
//        if (fn != null && fn != '' && PSA.RA.dataStores.featureStore.getById(fn)) { return PSA.RA.dataStores.featureStore.getById(fn).get('isEnabled'); }
        return true;
    },
    listeners : {
        beforeshow : function(numberbox) {
            return this.isEnabled();
        },
        boxready : function(numberbox, width, height) {
            var isEnabled = this.isEnabled();
            if (!isEnabled) {
                this.hide();
            }
        }
    }
});
Ext4.define('PSA.RA.UI.SearchResource', {
    extend : 'Ext.form.field.Trigger',
    cls : 'ra-resource-search',
    triggerCls : 'ra-search-resource-trigger',
    triggerWrapCls : 'ra-search-resource-trigger'
});
Ext4.define('PSA.RA.UIComponent.LinkButton', {
    extend : 'Ext4.Component',
    alias : 'widget.linkbutton',
    renderTpl : new Ext4.XTemplate('<a id="{id}-linkEl" href="#" role="link" class="toggle-link-a">', '<span id="{id}-linkInnerEl" class="toggle-link">', '{text}', '</span>', '</a>'),
    renderSelectors : {
        linkEl : 'a'
    },
    initComponent : function() {
        this.callParent(arguments);
        this.renderData = {
            text : this.text
        };
    },
    listeners : {
        render : function(c) {
            c.el.on('click', c.handler);
            if (c.pressed) c.addCls('toggle-link-pressed');
        }
    }
});
Ext4.define('PSA.RA.UIComponent.ToggleLink', {
    extend : 'Ext4.Component',
    pressed : false,
    toggleGroup : 'allToggleGroup',
    renderTpl : new Ext4.XTemplate('<a id="{id}-linkEl" href="#" role="link" class="toggle-link-a">', '<span id="{id}-linkInnerEl" class="toggle-link">', '{text}', '</span>', '</a>'),
    renderSelectors : {
        linkEl : 'a'
    },
    initComponent : function() {
        this.callParent(arguments);
        this.renderData = {
            text : this.text
        };
        if (!PSA.RA.ToggleManager) PSA.RA.ToggleManager = {};
        if (!PSA.RA.ToggleManager[this.toggleGroup]) PSA.RA.ToggleManager[this.toggleGroup] = new Array();
        PSA.RA.ToggleManager[this.toggleGroup].push(this);
    },
    listeners : {
        render : function(c) {
            c.el.on('click', c.handler);
            if (c.pressed) c.addCls('toggle-link-pressed');
        }
    },
    toggle : function() {
        for ( var i = 0; i < PSA.RA.ToggleManager[this.toggleGroup].length; i++) {
            var node = PSA.RA.ToggleManager[this.toggleGroup][i];
            if (this == node) {
                node.pressed = true;
                node.addCls('toggle-link-pressed');
            } else {
                node.pressed = false;
                node.removeCls('toggle-link-pressed');
            }
        }
    }
});
Ext4.define('PSA.RA.UIComponent.ViewPresetToggleLink', {
    extend : 'PSA.RA.UIComponent.ToggleLink',
    toggleGroup : 'presets',
    presetClassName : {},
    handler : function() {
        var me = Ext4.getCmp(this.id);
        perfTestLogger.start(me.text);
        me.toggle();
        PSA.RA.App.switchViewPreset(me.presetClassName);
        //PSA.RA.App.refreshChartDensity();
        perfTestLogger.stop();
    }
});
Ext4.define('PSA.RA.UIComponent.RoundButton', {
    extend : 'Ext4.button.Button',
    cls : 'ra-round-btn',
    scale : 'medium',
    width : 40
});
Ext4.define('PSA.RA.UIComponent.RoundButtonStart', {
    extend : 'PSA.RA.UIComponent.RoundButton',
    cls : 'ra-round-btn ra-round-btn-start',
    width : 35
});
Ext4.define('PSA.RA.UIComponent.RoundButtonEnd', {
    extend : 'PSA.RA.UIComponent.RoundButtonStart',
    cls : 'ra-round-btn ra-round-btn-end'
});
Ext4.define('PSA.RA.UIComponent.RoundButtonIcon', {
    extend : 'PSA.RA.UIComponent.RoundButton',
    cls : 'ra-round-btn ra-round-btn-icon'
});
Ext4.define('PSA.RA.UIComponent.RectButton', {
    extend : 'Ext4.button.Button',
    cls : 'ptm-rect-btn',
    initComponent : function(args) {
        if (this.text) {
            this.width = PSA.RA.TextMetrics14px.getSize(this.text).width + 40;
        }
        this.callParent(args);
    }
});
Ext4.define('PSA.RA.UIComponent.GrayButton', {
    extend : 'PSA.RA.UIComponent.RectButton',
    cls : 'ptm-rect-btn ptm-rect-btn-gray'
});
Ext4.define('PSA.RA.UIComponent.BlueButton', {
    extend : 'PSA.RA.UIComponent.RectButton',
    cls : 'ptm-rect-btn ptm-rect-btn-blue'
});
Ext4.define('PSA.RA.UIComponent.ArrowButton', {
    extend : 'PSA.RA.UIComponent.RectButton',
    cls : 'ptm-rect-btn-arrow'
});
Ext4.define('PSA.PTM.UIComponent.IconButton', {
    extend : 'Ext4.button.Button',
    cls : 'ra-icon-btn',
    scale : 'medium',
    width : 20,
    height : 24
});
Ext4.define('PSA.RA.UIComponent.ExportButton', {
    extend  : 'Ext4.button.Button',
    cls     : 'ra-export-btn',
    scale   : 'medium',
    width   : 16,
    height  : 24,
    hidden  : !(parseFloat(nlapiGetContext().getVersion()) > 2014.1)
});
Ext4.define('PSA.PTM.UIComponent.form.Panel', {
    extend : 'Ext4.form.Panel',
    alias: 'widget.ptmform',
    layout : 'form',
    border : false,
    padding : 20
});
Ext4.define('PSA.PTM.UIComponent.form.Menu', {
    extend : 'Ext4.toolbar.Toolbar',
    alias : 'widget.ptmformmenu',
    dock : 'top',
    ui : 'footer',
    padding : '0 0 10 0',
    defaults : {
        margin : '0 15 0 0'
    }
});
Ext4.define('PSA.RA.UIComponent.form.FieldContainer', {
    extend : 'Ext4.form.FieldContainer',
    defaults : {
        afterLabelTextTpl : [
            '<tpl if="allowBlank === false">', '<label class="ptm-required-field">*</label>', '</tpl>'
        ]
    }
});
Ext4.define('PSA.RA.UIComponent.form.flex.FieldContainer', {
    extend : 'Ext4.form.FieldContainer',
    defaults : {
        flex : 1,
        afterLabelTextTpl : [
            '<tpl if="allowBlank === false">', '<label class="ptm-required-field">*</label>', '</tpl>'
        ]
    }
});
Ext4.define('PSA.RA.UIComponent.MenuSeparator', {
    extend : 'Ext4.Component',
    renderTpl : new Ext4.XTemplate('<div class="ptm-menu-separator"></div>')
});
Ext4.define('PSA.RA.UIComponent.MenuSeparatorSmall', {
    extend : 'Ext4.Component',
    renderTpl : new Ext4.XTemplate('<div class="ptm-menu-separator-small"></div>')
});
Ext4.define('PSA.RA.UIComponent.Display', {
    extend : 'Ext4.form.field.Display',
    labelSeparator : '',
    labelAlign : 'right'
});
Ext4.define('PSA.RA.UIComponent.DateRange', {
    extend : 'Ext4.date.RangeField',
    labelSeparator : '',
    labelAlign : 'right',
    emptyText : translatedStrings.getText('MESSAGE.EMPTYTEXT.ALL'),
    editable : false,
    listeners : {
        focus : function(rangeField, event) {
            rangeField.setEditable(true);
            rangeField.setEditable(false);
            return false;
        }
    }
});
/*
 * Use this to create a tooltip where the content is simply the same as its trigger element's
 */
Ext4.define('PSA.RA.UIComponent.ToolTip2', {
    extend : 'Ext4.tip.ToolTip',
    target: 'psa-ptm-app-targetEl',
    html : 'Loading...',
    showDelay : 0,
    autoHide : true,
    hideDelay : 0,
    trackMouse : true,
    dismissDelay : 0,
    anchor : 'left',
    projectTemplate : new Ext4.XTemplate(
        '<div class="ra-tooltip-padding">',
            '<table class="ra-tooltip">',
                '<tr class="header">',
                    '<td>',
                        '<div>Project Details</div>',
                    '</td>',
                '</tr>',
                '<tr>',
                    '<td>',
                        '<hr style="border: 1px solid #D5D5D5; border-top: none;">',
                    '</td>',
                '</tr>',
                '<tr align="middle">',
                    '<td>',
                        '<table class="project-tooltip-data">',
                            '<tr>',
                                '<td class="label" nowrap="nowrap">Project Name</td>',
                                '<td class="value">{name}</td>',
                            '</tr>',
                            '<tr>',
                                '<td class="label" nowrap="nowrap">Percent Work Complete</td>',
                                '<td class="value">{percent}</td>',
                            '</tr>',
                            '<tr>',
                                '<td class="label" nowrap="nowrap">Estimated Work</td>',
                                '<td class="value">{estimate}</td>',
                            '</tr>',
                            '<tr>',
                                '<td class="label" nowrap="nowrap">Actual Work</td>',
                                '<td class="value">{actual}</td>',
                            '</tr>',
                            '<tr>',
                                '<td class="label" nowrap="nowrap">Remaining Work</td>',
                                '<td class="value">{remaining}</td>',
                            '</tr>',
                            '<tr>',
                                '<td class="label" nowrap="nowrap">Start Date</td>',
                                '<td class="value">{start}</td>',
                            '</tr>',
                            '<tr>',
                                '<td class="label" nowrap="nowrap">Calculated End Date</td>',
                                '<td class="value">{end}</td>',
                            '</tr>',
                        '</table>',
                    '</td>',
                '</tr>',
            '</table>',
        '</div>'
    ),
    listeners: {
        beforeshow: function updateTipBody(tip) {
            if (PTM.Settings.get("showHovers") === false){
                return false;
            }
            else{
                // show details only when show hover setting is set to true
                var recordid = tip.triggerElement.parentNode.parentNode.parentNode.getAttribute('data-recordid');
                if(recordid && recordid.split('~').length == 2) {
                    var tipObj = PSA.RA.App.resourceStore.getResourceObjByRow(recordid).get('details').tip;
                    tip.update(tip.projectTemplate.apply(tipObj));
                } else {
                    tip.update(tip.triggerElement.innerHTML);
                }
            }
        }
    }
});
Ext4.define('PSA.RA.UIComponent.Space', {
    extend : 'Ext4.Component',
    height : 15,
    autoEl : 'div'
});
Ext4.define('PSA.RA.UIComponent.HSpace', {
    extend : 'Ext4.Component',
    width : 15,
    autoEl : 'div'
});
Ext4.define('PSA.RA.UIComponent.LargeDataItemSelector', {
    extend: 'Ext4.ux.form.ItemSelector',
    fromTitle: 'Click Selection to Add',
    toTitle: 'Current Selection',
    displayField: 'name',
    valueField: 'id',
    fromButtons : [
        'add', 'remove'
    ],
    toButtons : [
        'up', 'down'
    ],
    fromButtonsText: {
        up: 'Move up',
        add: 'Add to selected',
        remove: 'Remove from selected',
        down: 'Move down'
    },
    toButtonsText: {
        up: 'Move up',
        add: 'Add to selected',
        remove: 'Remove from selected',
        down: 'Move down'
    }
});
Ext4.define('PSA.RA.UIComponent.LargeDataTextField', {
    extend: 'Ext4.form.field.Text',
    labelAlign: 'top',
    flex: 10,
    readOnly: true,
    labelSeparator: '',
    hidden: true,
    allowBlank: true,
    afterLabelTextTpl: [
        '<tpl if="allowBlank === false">', '<label class="ra-required-field">*</label>', '</tpl>'
    ]
});
Ext4.define('PSA.RA.UIComponent.LargeDataButton', {
    extend  : 'Ext4.button.Button',
    iconCls : 'ptm-largedata-icon',
    cls     : 'ptm-largedata-btn',
    margin  : '20 0 0 5',
    flex    : 0.5,
    hidden  : true
});
Ext4.define('PSA.RA.UIComponent.ComboOrLargeDataField', {
    extend              : 'PSA.RA.UIComponent.form.flex.FieldContainer',
    layout              : 'hbox',
    init : function(type) {
        var me = this;
        me.type = type;
        var isResource = false;
        
        var dropdownMax = Number(nlapiGetContext().getPreference('MAXDROPDOWNSIZE'));//4000;
        var total = me.getTotal();
        me.isMax = (total >= dropdownMax) ? true : false;
        
        me.field.reset();
        me.largedataCombo.reset();
        me.largeDataName.reset();
        me.tempStore = me.getTempStore(type);
        me.tempStore.loadData([], false);
        
        if (type == 'projectresource')
            isResource = true;

        if(!me.isMax) {
            if (isResource)
                me.field.allowBlank = false;
            me.field.show();
        }
        else {
            if (isResource) {
                me.largedataCombo.allowBlank = false;
                me.largeDataName.allowBlank = false;
            }
            me.largeDataName.show();
            me.largeDataBtn.show();
        }
        
        if (isResource)
            me.setResourceStores();
    },
    getTotal : function() {
        var me = this;
        var total = 0;
        if (me.items.items.length == 0)
            me.add(me.getItems());
        if (me.type)
            total = me.field.store.totalCount;
        return total;
    },
    getTempStore : function(type) {
        var me = this;
        var store;
        switch (type) {
            case 'projectresource': store = (me.isGenericResource) ? PSA.RA.dataStores.largeDataGenericResourceTempStore : PSA.RA.dataStores.largeDataResourceTempStore; break;
            case 'serviceitem': store = PSA.RA.dataStores.largeDataServiceItemTempStore; break;
            case 'assignee': store = PSA.RA.dataStores.largeDataAssigneeTempStore; break;
            case 'customer': store = PSA.RA.dataStores.largeDataCustomerTempStore; break;
            case 'project': store = PSA.RA.dataStores.largeDataProjectTempStore; break;
            case 'projecttask': store = PSA.RA.dataStores.largeDataTaskTempStore; break;
            case 'parenttask': store = PSA.RA.dataStores.largeDataParentTaskTempStore; break;
        }
        return store;
    },
    close : function() {
        var me = this;
        me.field.reset();
        me.field.hide();
        me.field.allowBlank = true;
        me.field.setReadOnly(false);
        me.largedataCombo.reset();
        me.largedataCombo.allowBlank = true;
        me.largeDataName.reset();
        me.largeDataName.hide();
        me.largeDataName.allowBlank = true;
        me.largeDataBtn.hide();
    }, 
    setRecord : function(tempStore, ids, names) {
        var me = this;
        var text;
        
        names = names != null && names != '' ? names.split(',') : '';
        
        for(var i = 0; i < ids.length; i++){  
            var x = tempStore.findRecord('id', ids[i]);
            if(!x){   
                var model = Ext4.create('PSA.RA.Model.DropDown', {
                    id : ids[i],
                    name : names[i]
                });
                tempStore.add(model);
                if (i == 0){
                    text = names[0];
                }  
                else {
                    text =  text + ', ' + names[i];
                }
            }
        }

        me.setValue(tempStore, ids, text);
    },
    getValue : function() {
        var me = this;
        var value;
        if(!me.isMax) 
            value = me.field.getValue();
        else
            value = me.largedataCombo.getValue();
            
        return value;
    },
    setValue : function(tempStore, ids, name){
        var me = this;
        
        if(!me.isMax) {
            me.field.setValue(ids);
        }
        else {
            me.largedataCombo.bindStore(tempStore);
            me.largedataCombo.setValue(ids);
            me.largeDataName.setValue(name);
        }
    },
    getItems : function(){
        var me = this;
        if (me.type == 'projectresource') {
            me.field = Ext4.create('PSA.RA.UIComponent.ComboBox', { 
                id : me.id + '-field', 
                store: (me.isGenericResource) ? PSA.RA.dataStores.popupGenericStore : PSA.RA.dataStores.popupResourceStore,
                fieldLabel: me.fLabel, 
                emptyText: me.eText, 
                hidden: true,
                listeners : {
                    select : function(cb, record) {
                        if (record) {
                            var laborCost = record[0].get('details').laborcost || 0;
                            Ext4.getCmp('taskAssignment-unitCost').setValue(laborCost);
                            Ext4.getCmp('ra-form-taskAssignment').setDisabledDates(record[0].get('details').workcalendar);
                        }
                    },
                    change : function(cb, newValue, oldValue, eOpts) {
                        Ext4.getCmp('ra-form-taskAssignment').resourceChange(cb, newValue);
                    }
                }
            });
        }
        else if (me.type == 'serviceitem') {
            me.field = Ext4.create('PSA.RA.UIComponent.ComboBox', 
                { id : me.id + '-field', store: me.comboStore, fieldLabel: me.fLabel, emptyText: me.eText, hidden: true });
        }
        else {
            me.field = Ext4.create('PSA.RA.UIComponent.AdvFilterComboBox', 
                { id : me.id + '-field', store: me.comboStore, fieldLabel: me.fLabel, emptyText: me.eText, hidden: true });
        }
        
        if (me.type == 'projectresource') {
            me.largedataCombo = Ext4.create('PSA.RA.UIComponent.ComboBox', { 
                store: me.getTempStore(me.type), 
                multiSelect: true, 
                hidden: true,
                listeners : {
                    select : function(cb, record) {
                        if (record) {
                            var laborCost = record[0].get('details').laborcost || 0;
                            Ext4.getCmp('taskAssignment-unitCost').setValue(laborCost);
                            Ext4.getCmp('ra-form-taskAssignment').setDisabledDates(record[0].get('details').workcalendar);
                        }
                    },
                    change : function(cb, newValue, oldValue, eOpts) {
                        Ext4.getCmp('ra-form-taskAssignment').resourceChange(cb, newValue);
                    }
                }
            });
        }
        else {
            me.largedataCombo = Ext4.create('PSA.RA.UIComponent.ComboBox', { store: me.getTempStore(me.type), multiSelect: true, hidden: true });
        }
        
        me.largeDataName = Ext4.create('PSA.RA.UIComponent.LargeDataTextField', { fieldLabel: me.fLabel, emptyText: me.eText, editable: false });
        me.largeDataBtn = Ext4.create('PSA.RA.UIComponent.LargeDataButton', {
            handler: function() {
                PSA.RA.App.formLargeData.type = me.type;
                PSA.RA.App.formLargeData.isGenericResource = me.isGenericResource;
                PSA.RA.App.formLargeData.show();
            }
        });
        var items = [ me.field, me.largedataCombo, me.largeDataName, me.largeDataBtn ];
        return items;
    },
    getStore : function() {
        var me = this;
        var store;
        if(!me.isMax)
            store = me.field.store;
        else
            store = me.largedataCombo.store;
        return store;
    },
    getName : function() {
        var me = this;
        var ids, name;
        if(!me.isMax) 
            ids = me.field.getValue();
        else
            ids = me.largedataCombo.getValue();
        
        var store = me.getStore();

        for (var i = 0; i < ids.length; i++){   
            if (ids[i] != 0) {
                var record = store.findRecord('id', ids[i]);
                if (i == 0)
                    name = record.get('name');
                else
                    name = name + ',' + record.get('name');
            }
        }
        
        return name;
    },
    getRawValue : function() {
        var me = this;
        var value;
        if(!me.isMax) 
            value = me.field.getRawValue();
        else
            value = me.largedataCombo.getRawValue();
            
        return value;
    },
    setRawValue : function(value) {
        var me = this;
        var value;
        if(!me.isMax) 
            me.field.setRawValue(value);
        else {
            me.largedataCombo.setRawValue(value);
            me.largeDataName.setValue(value);
        }
            
        return value;
    },
    setReadOnly : function(isReadOnly) {
        var me = this;
        if(!me.isMax) 
            me.field.setReadOnly(isReadOnly);
        else
            me.largeDataName.setReadOnly(isReadOnly);
            
        if (isReadOnly)
            me.largeDataBtn.disable();
        else
            me.largeDataBtn.enable();
    },
    setEditable : function(isEditable) {
        var me = this;
        if(!me.isMax) 
            me.field.setEditable(isEditable);
            
        if (!isEditable)
            me.largeDataBtn.disable();
        else
            me.largeDataBtn.enable();
    },
    setResourceStores : function() {
        var me = this;
        if(!me.isGenericResource) {
            me.field.bindStore(PSA.RA.dataStores.popupResourceStore);
            me.largedataCombo.bindStore(PSA.RA.dataStores.largeDataResourceTempStore);
        }
        else {
            me.field.bindStore(PSA.RA.dataStores.popupGenericStore);
            me.largedataCombo.bindStore(PSA.RA.dataStores.largeDataGenericResourceTempStore);
        }
    },
    getWorkCalendar : function() {
        var me = this;
        var obj, value;
        if(!me.isMax) 
            obj = me.field.getSelectedRecord();
        else
            obj = me.largedataCombo.getSelectedRecord();
        
        value = obj.get('details').workcalendar;
        return value;
    },
    getLargeDataText : function() {
        var me = this;
        var value;
        if(me.isMax) 
            value = me.largeDataName.getValue();
            
        return value;
    }
});
Ext4.define('PSA.RA.UIComponent.ToggleExpandCollapse', {
    extend : 'PSA.RA.UIComponent.ToggleLink',
    handler : function() {
        var me = Ext4.getCmp(this.id);
        perfTestLogger.start(me.mode + ' All');
        switch (me.mode) {
            case 'expand':
                PSA.RA.App.mask();
                new Ext4.util.DelayedTask(function() {
                    PSA.RA.App.expandAll();
                    PSA.RA.App.unmask();
                    perfTestLogger.stop();
                }).delay(500);
                break;
            case 'collapse':
                PSA.RA.App.mask();
                PSA.RA.App.getSchedulingView().scrollVerticallyTo(0, false);
                new Ext4.util.DelayedTask(function() {
                    PSA.RA.App.collapseAll();
                    PSA.RA.App.unmask();
                    perfTestLogger.stop();
                }).delay(500);
                break;
        }
    }
});
Ext4.define('PSA.PTM.UIComponent.LegendLabel', {
    extend : 'Ext4.toolbar.TextItem',
    margin : '0 15 0 -10'
});
Ext4.define('PSA.PTM.UIComponent.Legend', {
    extend : 'Ext4.Component',
    autoEl : {
        tag : 'div',
        cls : 'legend-box'
    },
    initComponent : function(args) {
        if (this.cls) {
            this.autoEl = {
                tag : this.autoEl.tag,
                cls : this.autoEl.cls + ' ' + this.cls
            };
        }
        this.callParent(args);
    }
});
Ext4.define('PSA.PTM.UIComponent.ColorField', {
    extend : 'Ext4.form.field.Trigger',
    value : '',
    editable : false,
    labelSeparator : '',
    labelAlign : 'right',
    hiddenValue : '',
    labelWidth: 100,
    width : 145,
    onTriggerClick : function(event) {
        this.fireEvent('triggerclick', event);
    },
    getValue : function() {
        return this.hiddenValue;
    },
    setValue : function(color) {
        if (color !== this.getValue()) {
            this.fireEvent('change', this, color, this.getValue());
        }
        this.hiddenValue = color;
        this.setFieldStyle('background-color: #' + color + '; background-image: none;');
    },
    initComponent : function() {
        this.hiddenValue = this.value;
        this.value = '';
        var config = {}, me = this;
        Ext4.apply(this, Ext4.apply(this.initialConfig, config));
        this.callParent(arguments);
        me.on('triggerclick', function(event) {
            var oldColourMenu = Ext4.getCmp('ptm-picker-' + me.id);
            if (oldColourMenu) {
                oldColourMenu.destroy();
            }
            var colourMenu = Ext4.create('Ext4.menu.ColorPicker', {
                id : 'ptm-picker-' + me.id,
                cls : 'ptm-color-picker',
                colors : [
                    '000000', '993300', '333300', '003300', '003366', '000080', '333399', '333333', // row 1
                    '800000', 'FF6600', '808000', '008000', '008080', '0000FF', '666699', '808080', // row 2
                    'FF0000', 'FF9900', '99CC00', '339966', '33CCCC', '3366FF', '800080', '969696', // row 3
                    'FF00FF', 'FFCC00', 'FFFF00', '00FF00', '00FFFF', '00CCFF', '993366', 'C0C0C0', // row 4
                    'FF99CC', 'FFCC99', 'FFFF99', 'CCFFCC', 'CCFFFF', '99CCFF', 'CC99FF', 'FFFFFF' // row 5
                ],
                shadow : false,
                listeners : {
                    select : function(picker, color) {
                        me.setValue(color);
                        me.fireEvent('select', me, color);
                    }
                }
            });
            colourMenu.showAt(event.getXY());
        }, this);
    },
    listeners : {
        change : function(trigger, newValue, oldValue) {
            var settings = PTM.Settings;
            settings.beginEdit();
            settings.set(trigger.getName(), newValue);
            settings.endEdit();
        }
    }
});