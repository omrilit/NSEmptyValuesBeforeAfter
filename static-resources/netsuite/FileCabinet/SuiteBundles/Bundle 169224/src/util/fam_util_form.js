/**
 * © 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or
 * otherwise make available this code.
 *
 * @NScriptName FAM Form Utility
 * @NScriptId _fam_util_form
 * @NApiVersion 2.0
*/

define(['../adapter/fam_adapter_config',
        '../adapter/fam_adapter_ui_serverWidget'],
        
function (config, ui){
    var fieldTypeMap  = {},
        layoutTypeMap = {},
        breakTypeMap  = {},
        displayType   = {},
        subListType   = {},
        propertyMap   = {};
    
    var createField = function(form, objFld){
        objFld.options.type = fieldTypeMap[objFld.options.type]; //convert to serverWidget fieldtype enum
        var element = form.addField(objFld.options);
        for(var p in objFld){
            if(objFld && propertyMap[p]){
                element[propertyMap[p]] = objFld[p];
            }
        }
        if(objFld.help){
            element.setHelpText({help : objFld.help});
        }
        if(objFld.breakType){
            element.updateBreakType({breakType : breakTypeMap[objFld.breakType]});
        }
        if(objFld.displayType){
            element.updateDisplayType({displayType: displayType[objFld.displayType]});
        }
        if(objFld.layoutType){
            element.updateLayoutType({layoutType : layoutTypeMap[objFld.layoutType]});
        }
    };
    
    function insertLink(msg, link){
        if(!msg || !link) return null;
        var linkLabel   = msg.slice((msg.indexOf('(') + 1),+msg.indexOf(')')),
            linkHtml    = '<a href=' + link + '>' + linkLabel + '</a>';
        return msg.replace('(','').replace(')','').replace(linkLabel, linkHtml);
    }
    
    function addPageField(options) {
        var totalRows = options.totalRows || 0;
        var pageSize = options.pageSize || config.load(config.getType().USER_PREFERENCES).getValue('LISTSEGMENTSIZE');
        var maxPage = Math.ceil(totalRows / pageSize);
        var currentPage = options.currentPage || 1;
        var id = options.id || 'custpage_page';
        var label = options.label || ' ';
        
        if ((maxPage > 1) &&
            (maxPage >= currentPage)) {
            var fldPage = options.form.addField({
                id: id,
                type: ui.getFieldType().SELECT,
                label: label,
                container: options.container});
            var startRow = 1;

            for (var i = 1; i <= maxPage; i++) {
                fldPage.addSelectOption({
                    value: i,
                    text: startRow + ' - ' + Math.min(totalRows, i * pageSize) + ' of ' + totalRows,
                    isSelected: i === currentPage});
                startRow += pageSize;
            }
        }
    }
    
    function addSelectField(options) {
        var fld = options.form.addField({
            id: options.id,
            type: ui.getFieldType('SELECT'),
            label: options.label,
            source : options.source
        });
        if (options.defaultValue){
            fld.defaultValue = options.defaultValue;
        }
        return fld;
    }
        
    function insertNewField(options) {
        var newField = options.form.addField({
            id: 'custpage_' + options.name,
            type: options.type,
            label: options.label
        });        
        var helpText = (options.helpText || '') + 
                       '<br /><span style=\'color:#666666\'>Field ID: custrecord_' + options.name + '</span>'; 
        newField.defaultValue = options.defaultValue;
        newField.setHelpText({help: helpText});
        options.form.insertField({
            field: newField,
            nextfield: 'custrecord_' + options.name
        });    
    }
    
    return {        
        /**
         * Creates UI form
         * Parameters:
         *     objForm {obj} - Object collection of form entitities
         *     
         * Returns:
         *     form {serverWidget.Form}
         */
        createForm : function (objForm){
            var form;
            this.assignMapValues();
            form = ui.createForm(objForm.form);
            for(var grp in objForm.groups){
                form.addFieldGroup(objForm.groups[grp]);
            }
            for(var tab in objForm.tabs){
                form.addTab(objForm.tabs[tab]);
            }
            for(var fld in objForm.fields){
                createField(form, objForm.fields[fld]);
            }
            for(var sl in objForm.sublists){
                var sub;
                objForm.sublists[sl].type = subListType[objForm.sublists[sl].type];
                sub = form.addSublist(objForm.sublists[sl]);
                for(col in objForm.sublists[sl].cols){
                    createField(sub, objForm.sublists[sl].cols[col]);
                }
            }
            for(var btn in objForm.buttons){
                form.addButton(objForm.buttons[btn]);
            }
            for(var subBtn in objForm.submits){
                form.addSubmitButton(objForm.submits[subBtn]);
            }
            
            if (objForm.csPath)
                form.clientScriptModulePath = objForm.csPath;
            else if (objForm.csscript)
                form.clientScriptFileId = objForm.csscript;
            
            return form;
        },
        
        insertLink: insertLink,
        
        addPageField: addPageField,
        
        addSelectField: addSelectField,
        
        assignMapValues : function(){
            fieldTypeMap = {
                checkbox    : ui.getFieldType().CHECKBOX,
                currency    : ui.getFieldType().CURRENCY,
                date        : ui.getFieldType().DATE,
                datetimetz  : ui.getFieldType().DATETIMETZ,
                email       : ui.getFieldType().EMAIL,
                file        : ui.getFieldType().FILE,
                float       : ui.getFieldType().FLOAT,
                help        : ui.getFieldType().HELP,
                inlinehtml  : ui.getFieldType().INLINEHTML,
                integer     : ui.getFieldType().INTEGER,
                image       : ui.getFieldType().IMAGE,
                label       : ui.getFieldType().LABEL,
                longtext    : ui.getFieldType().LONGTEXT,
                multiselect : ui.getFieldType().MULTISELECT,
                passport    : ui.getFieldType().PASSPORT,
                percent     : ui.getFieldType().PERCENT,
                phone       : ui.getFieldType().PHONE,
                select      : ui.getFieldType().SELECT,
                radio       : ui.getFieldType().RADIO,
                richtext    : ui.getFieldType().RICHTEXT,
                text        : ui.getFieldType().TEXT,
                textarea    : ui.getFieldType().TEXTAREA,
                timeofday   : ui.getFieldType().TIMEOFDAY,
                url         : ui.getFieldType().URL
            };
            layoutTypeMap = {
                endrow          : ui.getFieldLayoutType().ENDROW,
                normal          : ui.getFieldLayoutType().NORMAL,
                midrow          : ui.getFieldLayoutType().MIDROW,
                outside         : ui.getFieldLayoutType().OUTSIDE,
                outsidebelow    : ui.getFieldLayoutType().OUTSIDEBELOW,
                outsideabove    : ui.getFieldLayoutType().OUTSIDEABOVE,
                startrow        : ui.getFieldLayoutType().STARTROW,

            };
            breakTypeMap = {
                none        : ui.getFieldBreakType().NONE,
                startcol    : ui.getFieldBreakType().STARTCOL,
                startrow    : ui.getFieldBreakType().STARTROW
            };
            displayType = {
                disabled    : ui.getFieldDisplayType().DISABLED,
                entry       : ui.getFieldDisplayType().ENTRY,
                hidden      : ui.getFieldDisplayType().HIDDEN,
                inline      : ui.getFieldDisplayType().INLINE,
                normal      : ui.getFieldDisplayType().NORMAL,
                readonly    : ui.getFieldDisplayType().READONLY
            };
            subListType = ui.getSublistType();
            propertyMap = {
                value       : 'defaultValue',
                mandatory   : 'isMandatory',
                linkText    : 'linkText'
            };
        },
        
        insertNewField: insertNewField
    };
});