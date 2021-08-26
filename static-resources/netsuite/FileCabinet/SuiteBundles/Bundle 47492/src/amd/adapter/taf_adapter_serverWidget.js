/**
 * Copyright 2017 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 * 
 */

define(['N/ui/serverWidget'],
    adapterServerWidget);

function adapterServerWidget(ui) {
    return {
        createForm: function(options) {
            return ui.createForm(options);
        },
        getFieldType: function(fieldType) {
            return ui.FieldType[fieldType];
        },
        getFieldDisplayType: function(displayType) {
            return ui.FieldDisplayType[displayType];
        },
        getFieldBreakType: function(breakType) {
            return ui.FieldBreakType[breakType];
        },
        getFieldLayoutType: function(layoutType) {
            return ui.FieldLayoutType[layoutType];
        }
    };
}