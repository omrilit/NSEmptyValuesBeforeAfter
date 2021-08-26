/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

Ext4.define('PRM.Cmp.FieldContainer', {
    extend : 'Ext4.form.FieldContainer',
    alias : 'widget.prm-field-container',
    labelSeparator : '',
    labelAlign : 'top',
    defaults : {
        flex : 1
    }
});

Ext4.define('PRM.Cmp.ComboBox', {
    extend : 'Ext4.form.field.ComboBox',
    alias : 'widget.prm-combobox',
    forceSelection : true,
    selectOnFocus : true,
    emptyText : PRM.Translation.getText('TEXT.SELECT_ONE'),
    valueField : 'id',
    displayField : 'name',
    labelAlign : 'top',
    labelWidth : 110,
    maxSelections : 25,
    labelSeparator : '',
    queryMode : 'local',
    afterLabelTextTpl : [
        '<tpl if="allowBlank === false">', '<label class="prm-required-field">*</label>', '</tpl>'
    ],
    getSelectedRecord : function () {
        var value = this.getValue();
        if (this.store) {
            if (Array.isArray(value)) {
                return this.getSelectedRecords();
            } 
            else {
                return this.store.getById(value);
            }
        }
    },
    getSelectedRecords : function () {
        var values = this.getValue(),
            records = [];
        for (var value in values) {
            record.push(this.store.getById(values[value]));
        }
        
        return records;
    }
});

Ext4.define('PRM.Cmp.DisplayText', {
    extend : 'Ext4.form.field.Display',
    alias : 'widget.prm-display-text',
    labelAlign : 'top',
    labelWidth : 110,
    labelSeparator : ''
});

Ext4.define('PRM.Cmp.FilterComboBox', {
    extend : 'PRM.Cmp.ComboBox',
    alias : 'widget.prm-filter-combobox',
    emptyText : PRM.Translation.getText('TEXT.ALL-'),
    multiSelect : true,
    allowBlank : true
});

Ext4.define('PRM.Cmp.Display', {
    extend : 'Ext4.form.field.Display',
    alias : 'widget.prm-display',
    labelAlign : 'top',
    labelSeparator : '',
    height : 35,
    fieldStyle : {
        'overflow' : 'hidden',
        'display' : 'block',
        'white-space' : 'nowrap',
        'text-overflow' : 'ellipsis',
        'font-weight' : 'bold',
        'color' : '#545454'
    },
    value : PRM.Translation.getText('TEXT.ALL-'), 
    isEnabled : function() {
        return true;
    }
});

Ext4.define('PRM.Cmp.FilterHeaderDisplay', {
    extend : 'PRM.Cmp.Display',
    alias : 'widget.prm-filter-headers-display',
    labelAlign : 'right',
    labelSeparator : ':',
    hidden : true,
    height : 24,
    shrinkWrap : true,
    labelStyle : 'font-size: 12px; margin-top: 2px;',
    fieldStyle : {
        'font-size' : '12px !important',
        'overflow' : 'hidden',
        'display' : 'block',
        'white-space' : 'nowrap',
        'text-overflow' : 'ellipsis',
        'font-weight' : 'bold',
        'color' : '#666666',
        'margin-top' : '2px'
    }
});

Ext4.define('PRM.Cmp.Date', {
    extend : 'Ext4.form.field.Date',
    alias : 'widget.prm-date',
    labelAlign : 'top',
    labelWidth : 110,
    format : nsDateFormat,
    labelSeparator : '',
    afterLabelTextTpl : [
        '<tpl if="allowBlank === false">', '<label class="prm-required-field">*</label>', '</tpl>'
    ],
});

Ext4.define('PRM.Cmp.Text', {
    extend : 'Ext4.form.field.Text',
    alias : 'widget.prm-text',
    labelSeparator : '',
    labelAlign : 'top',
    afterLabelTextTpl : [
        '<tpl if="allowBlank === false">', '<label class="prm-required-field">*</label>', '</tpl>'
    ]
});

Ext4.define('PRM.Cmp.Number', {
    extend : 'Ext4.form.field.Number',
    alias : 'widget.prm-number',
    labelSeparator : '',
    labelAlign : 'top',
    labelWidth : 110,
    minValue : 0.01, //prevents negative numbers
    allowDecimal : true,
    decimalPrecision : 2,
    // Remove spinner buttons, and arrow key and mouse wheel listeners
    hideTrigger : true,
    keyNavEnabled : false,
    mouseWheelEnabled : false,
    afterLabelTextTpl : [
        '<tpl if="allowBlank === false">', '<label class="prm-required-field">*</label>', '</tpl>'
    ]
});

Ext4.define('PRM.Cmp.CheckboxGroup', {
    extend : 'Ext4.form.CheckboxGroup',
    alias : 'widget.prm-checkbox-group',
    labelSeparator : '',
    labelAlign : 'top',
    labelWidth : 110,
    vertical : true,
    columns : 1,
    afterLabelTextTpl : [
        '<tpl if="allowBlank === false">', '<label class="prm-required-field">*</label>', '</tpl>'
    ]
});

Ext4.define('PRM.Cmp.RadioGroup', {
    extend : 'Ext4.form.RadioGroup',
    alias : 'widget.prm-radio-group',
    labelSeparator : '',
    labelAlign : 'top',
    labelWidth : 110,
    vertical : true,
    columns : 1,
    afterLabelTextTpl : [
        '<tpl if="allowBlank === false">', '<label class="prm-required-field">*</label>', '</tpl>'
    ]
});

Ext4.define('PRM.Cmp.Checkbox', {
    extend : 'Ext4.form.field.Checkbox',
    alias : 'widget.prm-checkbox',
    labelSeparator : '',
    labelAlign : 'top',
    labelWidth : 110
});

Ext4.define('PRM.Cmp.PagingComboBox', {
    extend : 'Ext4.form.field.ComboBox',
    alias : 'widget.prm-page-combo-box',
    editable : false,
    forceSelection : true,
    valueField : 'id',
    displayField : 'name',
    emptyText : PRM.Translation.getText('TEXT.LOADING_PAGES'),
    width : 350,
    queryMode : 'local',
    lastQuery : '',
    listConfig : {
        id : 'prm-paging-bound-list',
        baseCls : 'prm-paging-bound-list',
        listeners : {
            afterrender : function(me, a) {
                var box = me.getRefOwner();
                
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
            if (newValue == null || oldValue == null){
                // skip if coming to or from a 'No Results' scenario, page update is handled by other methods in that case
                return;
            }
            PRM.App.Grid.setPage(newValue);
        }
    }
});

Ext4.define('PRM.Cmp.ComboBox2', {
    extend : 'PRM.Cmp.FieldContainer',
    alias : 'widget.prm-combobox-dynamic',
    layout : 'hbox',
    multiSelect : false,
    initComponent : function(args) {
        var container = this,
            idCmb = container.id + '-cmb',
            idTxt = container.id + '-txt',
            idBtn = container.id + '-btn',
            isMultiSelect = container.multiSelect || false;
        
        var selectorWindowAttributes = {
            id : container.id + '-form'
        }
        
        Ext4.apply(container, {
            selectedRecords : [], // moved here to prevent it from being static.
            items : [
                {
                    xtype : 'prm-combobox',
                    id    : idCmb,
                    fieldLabel : '',
                    hidden : false,
                    store : container.store,
                    multiSelect : isMultiSelect,
                    flex : 1,
                    emptyText : isMultiSelect ? PRM.Translation.getText('TEXT.ALL-') : PRM.Translation.getText('TEXT.SELECT_ONE'),
                    allowBlank : container.allowBlank,
                    listeners : {
                        change : function(me, newValue) {
                            if (Ext4.isArray(newValue)) {
                                container.selectedRecords = [];
                                for (i in newValue) {
                                    container.selectedRecords.push(Ext4.create('PRM.Model.ProjectList', {
                                        id : newValue[i]
                                    }));
                                }
                            } else {
                                container.selectedRecords = newValue;
                                
                                if (container._onChange) {
                                    container._onChange(newValue);
                                }
                            }
                        }
                    }
                },
                {
                    xtype : 'prm-text',
                    id    : idTxt,
                    fieldLabel : '',
                    hidden : true,
                    flex : 9.5,
                    readOnly : true
                },
                {
                    xtype : 'prm-more-button',
                    id    : idBtn,
                    hidden : true,
                    flex : 0.5,
                    readOnly : true,
                    handler : function(button) {
                        var searchWindow = container.searchWindow,
                            window = PRM.App.Forms[searchWindow];
                        
                        if (searchWindow && window) {
                            window.comboId = container.id;
                            window.isMultiSelect = container.multiSelect || false;
                            window.allowBlank = container.allowBlank;
                            window.show();
                        }
                    }
                }
            ]
        });
        
        container.callParent(args); // call to finish instantiation of other parts of the component.

        container.on('afterlayout', function (container) {
            container.updateDisplay();
        });
        
        if (container.onCmbChange) container.items.getAt(0).on('change', container.onCmbChange);
    },
    updateDisplay : function () {
        var container = this,
            store = container.store,
            combo = container.items.getAt(0),
            text  = container.items.getAt(1),
            btn   = container.items.getAt(2);
        
        combo.setVisible(container.isBasicCombo())
        text.setVisible(!container.isBasicCombo())
        btn.setVisible(!container.isBasicCombo())
        
        if (!container.isBasicCombo()) {
        }
        else {
        }
    },
    afterLabelTextTpl : [
        '<tpl if="allowBlank === false">', '<label class="prm-required-field">*</label>', '</tpl>'
    ],
    setSelectedRecords : function (selectedRecords) {
        this.setFieldValue(selectedRecords);
    },
    setValue : function(value, rawValue) {
        this.setFieldValue(null, value, rawValue);
    },
    setFieldValue : function (selectedRecords, value, rawValue) {
        var container = this,
            cmb = container.items.getAt(0),
            store = container.store,
            rawVals = rawValue || cmb.getRawValue() || '',
            values = value || [],
            selected = [];
        
        if (selectedRecords && selectedRecords.length > 0) {
            var names = [];
            for (var i = 0; i < selectedRecords.length; i++) {
                var record = selectedRecords[i];
                values.push(record.get('id'));
                names.push(record.get('name'));
            }
            rawVals = names.join(', ');
            selected = selectedRecords
        }
        else if (value) {

            if (container.multiSelect) { 
                var remainingIds = [], remainingNames = [];
                
                if (!Array.isArray(value)) value = [value];

                // handler for custom record multiselect field core issue --> data sorting of record.getValue is not the same as record.getText
                for (var i = 0; i < value.length; i++) {
                    var id = value[i],
                        record = container.store.getById(id);
                    
                    if (record) selected.push(record);
                    else remainingIds.push(id);
                }
                
                if (selected.length < value.length) {
                    remainingNames = rawValue.split(',').filter(function (element, index, array) {
                        var used = false;
                        for (var i = 0; i < selected.length; i++) {
                            console.log(element + ' == ' + selected.get('name') + ' >> ' + (element == selected.get('name')))
                            if (element == selected.get('name')) {
                                used = true;
                                break;
                            }
                        }
                        return !used;
                    });
                    
                    for (var i = 0; i < remainingIds.length; i++) {
                        selected.push(Ext4.create(store.model.modelName, {
                            id : remainingIds[i],
                            name : remainingNames[i]
                        }));
                    }
                }
            }
            else {
                var record = store.getById('id', value);
                if (record) {
                    selected.push(record)
                }
                else {
                    selected.push(Ext4.create(store.model.modelName, {
                        id : value,
                        name : rawValue
                    }));
                }
            }
            
        }
        else {
            // no value or selected record -- set display to blank
            rawVals = '';
        }
        
        cmb.setValue(values);
        container.setRawValue(rawVals);
        container.selectedRecords = selected;
    },
    setRawValue : function (rawValue) {
        // TODO check if rawValue is Array or Comma-Delimited String before setting
        this.items.getAt(1).setValue(rawValue);
    },
    getValue : function () {
        var container = this,
            selected = container.selectedRecords,
            ids = [];
        if (selected && selected.length) {
            for (var i = 0; i < selected.length; i++) {
                ids.push(selected[i].get('id'));
            }
        }
        else {
            ids = container.items.getAt(0).getValue();
        }
        
        return ids;
    },
    getRawValue : function () {
        return this.items.getAt(0).getRawValue();
    },
    setReadOnly : function (bool) {
        this.items.getAt(0).setReadOnly(bool);
        this.items.getAt(1).setReadOnly(bool);
        if (bool){
            this.items.getAt(2).disable();
            this.addClass('prm-ldc-read-only');
        } else {
            this.items.getAt(2).enable();
            this.removeCls('prm-ldc-read-only');
        }
    },
    reset : function () {
        this.selectedRecords = [];
        this.items.getAt(0).reset();
        this.items.getAt(1).reset();
    },
    getStore : function () {
        return this.store;
    },
    getStoreTotal : function() {
        if (!this.storeTotal) this.storeTotal == 0;
        if (this.store && this.store.proxy.reader.jsonData) this.storeTotal = this.store.proxy.reader.jsonData.total;
        return this.storeTotal;
    },
    isBasicCombo : function () {
        var isBasicCombo = this.getStoreTotal() <= this.getStoreLimit();
        return isBasicCombo;
    },
    // for testing purposes only.
    getStoreLimit : function() {
        if (!this.storeLimit) this.storeLimit = PRM.App.Constants.MAX_LIST_SIZE;
        return this.storeLimit;
    },
    setStoreLimit : function(limit) {
        this.storeLimit = limit;
    }
});

Ext4.define('PRM.Cmp.ItemSelector', {
    extend : 'Ext4.ux.form.ItemSelector',
    alias : 'widget.prm-itemselector',
    height : 250,
    width : 450,
    fromTitle: PRM.Translation.getText('ITEMSELECTOR.TO_ADD'),
    toTitle: PRM.Translation.getText('ITEMSELECTOR.SELECTION'),
    displayField: 'name',
    valueField: 'id',
    fromButtons : [
        'add', 'remove'
    ],
    toButtons : [
        'up', 'down'
    ],
    fromButtonsText : {
//        up : PRM.Translation.getText('TOOLTIP.MOVE_UP'),
        add : PRM.Translation.getText('TOOLTIP.ADD_TO_SELECTED'),
        remove : PRM.Translation.getText('TOOLTIP.REMOVE_FROM_SELECTED'),
//        down : PRM.Translation.getText('TOOLTIP.MOVE_DOWN')
    },
    toButtonsText : {
        up : PRM.Translation.getText('TOOLTIP.MOVE_UP'),
//        add : PRM.Translation.getText('TOOLTIP.ADD_TO_SELECTED'),
//        remove : PRM.Translation.getText('TOOLTIP.REMOVE_FROM_SELECTED'),
        down : PRM.Translation.getText('TOOLTIP.MOVE_DOWN')
    }
});