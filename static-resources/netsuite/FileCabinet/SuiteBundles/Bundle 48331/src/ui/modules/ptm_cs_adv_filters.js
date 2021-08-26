﻿/** * © 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code. */ /** * Filters & pagination *  * Version  Date            Author      Remarks */Ext4.define('PSA.RA.AdvFilters', {    extend : 'Ext4.panel.Panel',    renderTo : Ext4.get('main_form'),    border : false,    id : 'advFilterMain',    items : [        Ext4.create('Ext4.toolbar.Toolbar', {            id : 'ra-page-toolbar',            border : false,            items : [                Ext4.create('PSA.RA.UIComponent.ComboBox', {                    id : 'savedFilters',                    fieldLabel : translatedStrings.getText('COMBOBOX.VIEW'),                    emptyText : translatedStrings.getText('MESSAGE.EMPTYTEXT.DEFAULT'),                    labelAlign : 'left',                    store : PSA.RA.dataStores.savedFilters,                    prevValue : 0,                    width : 250,                    labelWidth : Ext4.create(Ext4.util.TextMetrics).getWidth(translatedStrings.getText('COMBOBOX.VIEW')) + 15,                    getSelectedRecord : function() {//                    	return true;                        return this.getStore().getById(this.getValue());                    },                    listeners : {                        select : function(combobox, record, index) {                            perfTestLogger.start('Change View');                            var selectedRecord = record[0].data;                            //console.log('select');                            //console.log(selectedRecord);                            if (combobox.prevValue == selectedRecord.id) {                                return; // do nothing                            } else {                                this.saveSettings(selectedRecord.id);                                                                combobox.getStore().getLoadParameters(combobox.getSelectedRecord());                                PSA.RA.dataStores.chartResource.loadWithFilters();                            }                        },                        change : function(combobox, newValue, oldValue) {                            combobox.prevValue = oldValue;                            var button = Ext4.getCmp('btnEditFilter');                            var cloneBtn = Ext4.getCmp('btnCloneFilter');                                                        if (newValue > 0) {                                cloneBtn.setDisabled(false);                                button.buttonAsEdit();                                var savedFilterStore = combobox.getStore();                                var record = savedFilterStore.getById(newValue);                                var shared = record.get('shared');                                var owner = record.get('owner');                                if (shared && owner != nlapiGetContext().user) {                                    button.buttonAsView();                                }                            } else {                                button.buttonAsAdd();                                cloneBtn.setDisabled(true);                            }                        }                    },                    saveSettings : function (selectedRecordId) {                        var setting = PSA.RA.dataStores.settingStore.data.getAt(0);                        setting.beginEdit();                        setting.set('selectedFilter', selectedRecordId);                        setting.endEdit();                        PSA.RA.dataStores.settingStore.sync();                    }                }), Ext4.create('PSA.RA.UIComponent.ShortSpacer'),                 Ext4.create('PSA.RA.UIComponent.GrayButton', {                    text : translatedStrings.getText('BUTTON.CUSTOMIZE_VIEW'),                    id : 'btnEditFilter',                    buttonAsAdd : function() {                        this.setText(translatedStrings.getText('BUTTON.CUSTOMIZE_VIEW'));                    },                    buttonAsEdit : function() {                        this.setText(translatedStrings.getText('BUTTON.EDIT_VIEW'));                    },                    buttonAsView : function() {                        this.setText(translatedStrings.getText('BUTTON.VIEW_DETAILS'));                    },                    handler : function() {                        PSA.RA.App.formFilter.openWindow();                    }                }),                 Ext4.create('PSA.RA.UIComponent.ShortSpacer'),                Ext4.create('PSA.RA.UIComponent.GrayButton', {                    text : translatedStrings.getText('BUTTON.CLONE_VIEW'),                    id : 'btnCloneFilter',                    handler : function() {                        PSA.RA.App.formFilter.cloneWindow();                    }                })            ]        })    ]//    ,//    enableFilter : function() {//        var filterCombo = Ext4.getCmp('savedFilters');//        var filterButton = Ext4.getCmp('btnEditFilter');//        filterCombo.enable();//        filterButton.enable();//    },//    disableFilter : function() {//        var filterCombo = Ext4.getCmp('savedFilters');//        var filterButton = Ext4.getCmp('btnEditFilter');//        filterCombo.disable();//        filterButton.disable();//    }});