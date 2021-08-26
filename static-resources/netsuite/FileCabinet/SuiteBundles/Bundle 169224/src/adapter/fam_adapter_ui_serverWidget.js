/**
 * © 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 *
 */

define(['N/ui/serverWidget'],

function famAdapterUIServerWidget(ui) {
    return {
        createForm : function(options){
            return ui.createForm(options);
        },
        createList : function(options){
            return ui.createList(options);
        },
        getFieldType : function(param){
            return param ? ui.FieldType[param] : ui.FieldType;
        },
        getFieldLayoutType : function(param){
            return param ? ui.FieldLayoutType[param] : ui.FieldLayoutType;
        },
        getFieldBreakType : function(param){
            return param ? ui.FieldBreakType[param] : ui.FieldBreakType;
        },
        getFieldDisplayType : function(param){
            return param ? ui.FieldDisplayType[param] : ui.FieldDisplayType;
        },
        getSublistType : function(param){
            return param ? ui.SublistType[param] : ui.SublistType;
        },
        getFormPageLinkType : function(param){
            return param ? ui.FormPageLinkType[param] : ui.FormPageLinkType;
        },
        getLayoutJustification : function(param){
            return param ? ui.LayoutJustification[param] : ui.LayoutJustification;
        }
    };
});