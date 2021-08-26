/**
 * Copyright 2014, 2019 Oracle and/or its affiliates. All rights reserved.
 */

if (!TAF) { var TAF = {}; }
TAF.SCOA = TAF.SCOA || {};


TAF.SCOA.View = function _View(view) {
    var _mode = view.mode;
    var _subsidiaries = view.subsidiaries;
    var _account_types = view.account_types;
    var _accounts = view.accounts;
    var _message = view.message;
    var is_one_world = nlapiGetContext().getSetting('FEATURE', 'SUBSIDIARIES') === 'T';
    
    var culture_id = nlapiGetContext().getPreference("LANGUAGE");
    _resource = new ResourceMgr(culture_id);
    
    
    this.getForm = _GetForm;
    
    
    function _GetForm() {
        var form = nlapiCreateForm(_resource.GetString("SCOA_FORM_TITLE"));
        form.setScript('customscript_scoa_cs');
        

        _AddDeprecationMessage(form);
        addMessage(form);
        addButtons(form);
        
        addHiddenFields(form);
        if (is_one_world) { addSubsidiaryFilter(form); }
        addAccountTypeFilter(form);
        
        addSubList(form);
        
        //add translated strings for CS
        var CSStrIds = ['SCOA_RELOAD_WARNING_MESSAGE'];
        _resource.AddHiddenCSStrings(form, CSStrIds);
        
        return form;
    }
    
    
    function addMessage(form) {
        if (_message) {
            var message_priority = _message.result == "pass" ? "NLAlertDialog.TYPE_LOWEST_PRIORITY" : "NLAlertDialog.TYPE_HIGH_PRIORITY";
            var message_type = _message.result == "pass" ? _resource.GetString('SCOA_CONFIRMATION') : _resource.GetString('SCOA_ERROR');
            var message_code = _message.details;
            
            var message = [
                "<div id='div_message'/><script>showAlertBox('div_message'",
                "'" + message_type + "'",
                "'" + _resource.GetString(message_code) + "'",
                message_priority,
                "'825px', '', '', false);</script>"
            ].join(",");
            
            var field = form.addField("custpage_message", "inlinehtml");
            field.setDefaultValue(message);
            field.setDisplayType("normal");
            field.setLayoutType("outsideabove", "startrow");
        }
    }
    
    
    function addButtons(form) {
        if (_mode == "view") {
            form.addSubmitButton(_resource.GetString("SCOA_EDIT_BUTTON"));
        } else {
            form.addSubmitButton(_resource.GetString("SCOA_SAVE_BUTTON"));
            //form.addResetButton();
            addCancelButton(form);
        }
    }
    
    
    function addCancelButton(form) {
        form.addButton("custpage_cancel_button", _resource.GetString("SCOA_CANCEL_BUTTON"), "TAF.SCOA.ViewClient.cancel()");
    }
    
    
    function addHiddenFields(form) {
        var refresh_url = nlapiResolveURL("SUITELET", 'customscript_scoa_s', 'customdeploy_scoa_s');
        form.addField("custpage_refresh_url", "text").setDisplayType("hidden").setDefaultValue(refresh_url);
        form.addField("custpage_action_type", "text").setDisplayType("hidden").setDefaultValue(_mode);
        form.addField("custpage_changed_accounts", "longtext").setDisplayType("hidden");
        form.addField("custpage_account_type_orig", "text").setDisplayType("hidden");
        is_one_world ? form.addField("custpage_subsidiary_orig", "text").setDisplayType("hidden") : null;
    }
    
    function addSubsidiaryFilter(form) {
        var field = form.addField("custpage_subsidiary", "select", _resource.GetString("SCOA_SUBSIDIARY_FILTER"));
        field.setHelpText(_resource.GetString("SCOA_SUBSIDIARY_FILTER_HELP"));
        
        for (var sub in _subsidiaries) {
            field.addSelectOption(sub, _subsidiaries[sub].name, _subsidiaries[sub].is_selected ? _subsidiaries[sub].is_selected : false);
        }
    }
    
    
    function addAccountTypeFilter(form) {
        var field = form.addField("custpage_account_type", "select", _resource.GetString("SCOA_ACCOUNT_TYPE_FILTER"));
        field.setHelpText(_resource.GetString("SCOA_ACCOUNT_TYPE_FILTER_HELP"));
        
        if (_mode == 'view') {
            field.addSelectOption('ALL', _resource.GetString('SCOA_ACCOUNT_TYPE_ALL'));
        }
        
        for (var type in _account_types) {
            field.addSelectOption(type, _account_types[type].name, _account_types[type].is_selected ? _account_types[type].is_selected : false);
        }
    }
    
    
    function addSubList(form) {
        var display_type = _mode == "edit" ? "entry" : "readonly";
        var sublist = form.addSubList("custpage_sublist", "list", _resource.GetString("SCOA_SUBLIST_NAME"));
        
        sublist.addField("custpage_account_id", "integer", "Internal ID").setDisplayType("hidden");
        sublist.addField("custpage_scoa_id", "integer", "Internal ID").setDisplayType("hidden");
        sublist.addField("custpage_account", "text", _resource.GetString("SCOA_ACCOUNT_COLUMN"));
        
        var number_field = sublist.addField("custpage_number", "textarea", _resource.GetString("SCOA_NUMBER_COLUMN"));
        number_field.setDisplayType(display_type);
        number_field.setDisplaySize(60, 1);
        
        var name_field = sublist.addField("custpage_name", "textarea", _resource.GetString("SCOA_NAME_COLUMN"));
        name_field.setDisplayType(display_type);
        name_field.setDisplaySize(200, 1);
        
        populateSublist(sublist);
    }
    
    
    function populateSublist(sublist) {
        var lines = [];
        
        for (var account in _accounts) {
            lines.push({
                custpage_account_id: account,
                custpage_scoa_id: _accounts[account].scoa_id,
                custpage_account: _accounts[account].account_name,
                custpage_number: escapeQuotes(_accounts[account].scoa_number),
                custpage_name: escapeQuotes(_accounts[account].scoa_name)
            });
        }
        
        sublist.setLineItemValues(lines);
    }
    
    
    function escapeQuotes(string) {
        return string.replace(/"/g, "&quot;");
    }

    

    

    function _AddDeprecationMessage(nsForm)
    {
        var xmlDiv = <div style="color: gray; font-size: 8pt; margin-top: 10px; padding: 5px; border-top: 1pt solid silver">{_resource.GetString("SCOA_DEPRECATION_MESSAGE")}
        <a href="/app/help/helpcenter.nl?fid=section_4640155582.html">{_resource.GetString("SCOA_SETUP_ACCT_CONTEXT_LABEL")}.</a></div>;
        
        
        var lblDisclaimer = nsForm.addField("disclaimer", "help", xmlDiv.toXMLString());
        lblDisclaimer.setLayoutType("outsidebelow", "startrow");
    }
};
