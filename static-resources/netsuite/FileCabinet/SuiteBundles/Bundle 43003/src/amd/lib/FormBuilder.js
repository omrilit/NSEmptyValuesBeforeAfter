/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define([
    'N/ui/serverWidget',
    'N/xml',
],
function(
    ui,
    xml
) {

    var FormBuilder = function(config) {
        this.name = 'FormBuilder';
        this.ui = ui;
        this.xml = xml;
    };

    FormBuilder.prototype.init = function(config) {
        this.form = this.ui.createForm({
            title: config.title
        });
        if (config.clientScriptModulePath) {
            this.form.clientScriptModulePath = config.clientScriptModulePath;
        }
        if (config.submit) {
            this.addSubmitButton(config.submit);
        }
        for (var i = 0; config.fields && i < config.fields.length; i++) {
            this.addField(config.fields[i]);
        }
    };

    FormBuilder.prototype.addField = function(fieldConfig) {
        if (fieldConfig.type === 'submit') {
            this.addSubmitButton(fieldConfig.label);
        } else {
            var field = this.form.addField({
                id: fieldConfig.id,
                label: fieldConfig.label,
                type: fieldConfig.type
            });
            field.isMandatory = !!fieldConfig.isMandatory;
            if (fieldConfig.displayType) {
                field.updateDisplayType({ displayType: fieldConfig.displayType });
            }
            if (fieldConfig.value) {
                field.defaultValue = fieldConfig.type === this.ui.FieldType.INLINEHTML ?
                        fieldConfig.value :
                        this.xml.escape({ xmlText: fieldConfig.value });
            }
            if (fieldConfig.layoutType) {
                field.updateLayoutType({
                    layoutType: fieldConfig.layoutType
                });
            }
            if (fieldConfig.breakType) {
                field.updateBreakType({
                	breakType: fieldConfig.breakType
                });
            }
        }
    };

    FormBuilder.prototype.addSubmitButton = function(label) {
        this.form.addSubmitButton({
            label: label || 'Submit'
        });
    };

    FormBuilder.prototype.addMessage = function(message) {
        var msgFieldConfig = {
            id: 'custpage_message',
            label: 'Message',
            type: this.ui.FieldType.LONGTEXT,
            displayType: this.ui.FieldDisplayType.HIDDEN,
            value: JSON.stringify(message)
        };
        this.addField(msgFieldConfig);
    };

    FormBuilder.prototype.addSuccessMessage = function(messageText) {
        this.addMessage({
            type: 'CONFIRMATION',
            title: 'Confirmation',
            message: messageText
        });
    };

    FormBuilder.prototype.addErrorMessage = function (messageText) {
        this.addMessage({
            type: 'ERROR',
            title: 'Error',
            message: messageText
        });
    };

    return FormBuilder;
});
