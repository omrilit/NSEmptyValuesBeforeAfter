/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * @author mcadano
 */

/**
 * Revision History:
 * 
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2013/03/04  244623         2.01.1                  Initial version
 * 2013/11/26                 3.00.00				  Add field for email templates
 * 2013/11/26                 3.00.00				  Add field for email subject
 * 													  Add fields email recipients, cc, and bcc for sublist
 * 2013/12/06  271895         3.01.0.2013.12.10.4     Added hidden email field to store sourced email
 * 2013/12/06  272063         3.01.0.2013.12.10.4     Add email recipient info on sublist marked data
 * 2014/02/03  272731         3.01.2.2014.02.04.4     Added email for payment notification in columns to avoid governance limit exceeded
 *
 */

var psg_ep;

if (!psg_ep)
    psg_ep = {};

/**
 * Loads Notification form
 *
 * @param {Object} request
 * @param {Object} response
 */
function main(request, response){
    psg_ep.PaymentSelectionFormMain_Notification(request, response);
}

/**
 * Main function to load Notification form
 * 
 * @param {nlobjRequest} request
 * @param {nlobjResponse} response
 */
psg_ep.PaymentSelectionFormMain_Notification = function(request, response) {
    var crUIObj = new psg_ep.PaymentSelectionForm_Notification();
    nlapiLogExecution('debug', '[ep] PaymentSelectionFormMain_Notification', 'Building UI...');
    crUIObj.BuildUI();
    nlapiLogExecution('debug', '[ep] PaymentSelectionFormMain_Notification', 'Initializing request parameters...');
    crUIObj.InitializeRequestParameters(request);
    nlapiLogExecution('debug', '[ep] PaymentSelectionFormMain_Notification', 'Populating form fields...');
    crUIObj.InitializeFieldData();
    nlapiLogExecution('debug', '[ep] PaymentSelectionFormMain_Notification', 'Loading sublist...');
    crUIObj.LoadSublist(request);
    nlapiLogExecution('debug', '[ep] PaymentSelectionFormMain_Notification', 'Writing page...');
    response.writePage(crUIObj._uiObj.Form);
    nlapiLogExecution('debug', '[ep] PaymentSelectionFormMain_Notification', 'Done.');
};

/**
 * Class that handles Notification form creation
 * 
 * @returns {psg_ep.PaymentSelectionForm_Notification}
 */
psg_ep.PaymentSelectionForm_Notification = function() {
    // parent class for framework
    this._uiBuilderInterface = new psg_ep.FormUIBuilderInterface();
    this._uiObj = new psg_ep.PaymentSelectionForm(this._uiBuilderInterface);

    ////////////////////////////////////////////////////////////////////////////////////
    // Framework Functions - Start
    /**
     * Builds the basic form UI
     */
    function buildUI() {
        // set the field groups
        var fieldGroups = this._uiObj.FieldGroups;
        fieldGroups.push('none');

        this._uiBuilderInterface.GetFieldsForFieldGroup = getFieldsForFieldGroup_Notification;
        
        // set the sublist class
        this._uiBuilderInterface.SublistClass = psg_ep.Sublist_Notification;
        
        // add the buttons
        this._uiObj.ButtonIds.push('custpage_submitter');
        this._uiObj.ButtonIds.push('custpage_cancel');
        
        // build the form
        this._uiObj._buildUI('Payment Notification', 'customscript_ep_selection_cs');
        
    }
    
    /**
     * Returns the fields based on field group
     * 
     * @returns {}
     */
    function getFieldsForFieldGroup_Notification(fieldGroup) {
        var fieldGroupObjects = {};
    	if (fieldGroup == 'none') {
    		var paymentTypeObj = psg_ep.CommonFormFields['custpage_2663_paymenttype'];
            paymentTypeObj.defaultValue = 'notification';
            fieldGroupObjects['custpage_2663_paymenttype'] = paymentTypeObj;
            
            fieldGroupObjects['custpage_2663_refresh_page'] = psg_ep.CommonFormFields['custpage_2663_refresh_page'];
            fieldGroupObjects['custpage_2663_trans_marked'] = psg_ep.CommonFormFields['custpage_2663_trans_marked'];
            fieldGroupObjects['custpage_2663_file_id'] = psg_ep.CommonFormFields['custpage_2663_file_id'];
            fieldGroupObjects['custpage_2663_file_name'] = psg_ep.CommonFormFields['custpage_2663_file_name'];
            fieldGroupObjects['custpage_2663_subject'] = psg_ep.CommonFormFields['custpage_2663_subject'];
            fieldGroupObjects['custpage_2663_email_body_def'] = psg_ep.NotificationFormFields['custpage_2663_email_body_def'];
            fieldGroupObjects['custpage_2663_email_templates'] = psg_ep.NotificationFormFields['custpage_2663_email_templates'];
            fieldGroupObjects['custpage_2663_total_lines'] = psg_ep.CommonFormFields['custpage_2663_total_lines'];
            
            var paymentLinesObj = psg_ep.CommonFormFields['custpage_2663_payment_lines'];
            paymentLinesObj.label = 'Lines Selected';
            paymentLinesObj.layoutType = '';
            paymentLinesObj.breakType = '';
            fieldGroupObjects['custpage_2663_payment_lines'] = paymentLinesObj;
        }
        return fieldGroupObjects;
    }
    
    /**
     * Initializes the request parameters based from last refresh
     * 
     * @param {nlobjRequest} request
     */
    function initializeRequestParameters(request) {
        if (request) {
            for (var i in this._uiObj.Fields) {
                if (request.getParameter(i)) {
                    this._uiObj.RequestParams[i] = request.getParameter(i);
                }
            }
            
            // initialize sublist parameters
            this._uiObj.Sublist.InitializeRequestParameters(request);
        }
    }
    
    /**
     * Prepare select fields data
     */
    function initializeFieldData() {
    	// prepare data for fields
    	if (this._uiObj.RequestParams['custpage_2663_file_id'] && !this._uiObj.RequestParams['custpage_2663_file_name']) {
    		this._uiObj.RequestParams['custpage_2663_file_name'] = nlapiLookupField('customrecord_2663_file_admin', this._uiObj.RequestParams['custpage_2663_file_id'], 'name');
        }
    	
        // set the field values
        this._uiObj._setFieldValuesFromParams();
        this._uiObj.FieldInitializer.PrepareEmailTemplates();
    }
    
    /**
     * Loads the sublist based on request parameters
     * 
     * @param {nlobjRequest} 
     */
    function loadSublist(request) {
        if (this._uiObj.RequestParams['custpage_2663_file_id']) {
            // set max selected
            this._uiObj.Sublist._sublist._maxSelect = this._uiObj.RequestParams['custpage_2663_max_lines_sel'] || 5000;
            
            // set mark all flag if bank mark transaction flag is true
            var markAllFlag = this._uiObj.Sublist._sublist._requestParams[this._uiObj.Sublist._sublist._sublistId + '_mark_all'] || 'undefined';
            if (this._uiObj.RequestParams['custpage_2663_trans_marked'] == 'T' && markAllFlag == 'undefined') {
                this._uiObj.Sublist._sublist._requestParams[this._uiObj.Sublist._sublist._sublistId + '_mark_all'] = 'T';
            }
            
            // perform transaction search based on entities
            var transactionListData = new psg_ep.TransactionData_Notification(this._uiObj.RequestParams, this._uiObj.StartTime);
            var sublistData = transactionListData.GetTransactions();
            
            // set sublist data
            this._uiObj._setSublistData(sublistData, true);
            
            //set total lines and amount
            setTotals(this._uiObj.Form, sublistData);
        }
    }
    
    /**
     * Set constant total values
     * 
     * @param {nlobjForm} form
     * @param {Object} sublistData 
     */
    function setTotals(form, sublistData) {
    	if (sublistData && sublistData.transactionList) {
    		// set the total fields
    		var totalLines = sublistData.transactionList.length || 0;
            var totalAmtPaid = 0.0;
            for (var i = 0; i < totalLines; i++) {
            	var transactionObj = sublistData.transactionList[i];
                totalAmtPaid += parseFloat(transactionObj['custpage_amount']);
            }
            // set the line count and amount paid
            form.getField('custpage_2663_total_lines').setDefaultValue(totalLines);
    	}
    }
    
    // Framework Functions - End
    ////////////////////////////////////////////////////////////////////////////////////
    
    this.BuildUI = buildUI;
    this.InitializeRequestParameters = initializeRequestParameters;
    this.InitializeFieldData = initializeFieldData;
    this.LoadSublist = loadSublist;
};

/**
 * Class for Notification sublist
 *
 * @param {nlobjForm} form
 * @param {String} name
 * @param {String} type
 * @param {String} label
 * @param {String} tab
 * @returns {psg_ep.Sublist_Notification}
 */
psg_ep.Sublist_Notification = function(form, name, type, label, tab) {
    this._sublistInterface = new psg_ep.SublistInterface();
    this._sublist = new psg_ep.Sublist(form, name, type, label, tab, this._sublistInterface);
    
    /**
     * Builds the sublist UI
     */
    function buildUI() {
        this._sublistInterface.GetColumns = getColumns_Notification;
        this._sublist._buildUI();
    }
    
    /**
     * Returns the columns for the sublist
     */
    function getColumns_Notification() {
        var sublistColumns = {};
        sublistColumns['custpage_internalid'] = new psg_ep.SublistColumn('custpage_internalid', 'integer', 'ID', 'hidden');
        sublistColumns['custpage_mark_key'] = new psg_ep.SublistColumn('custpage_mark_key', 'text', 'Mark ID', 'hidden', null, null, true);
        sublistColumns['custpage_pay'] = new psg_ep.SublistColumn('custpage_pay', 'checkbox', 'Select', null, 'F', true);
        sublistColumns['custpage_entity'] = new psg_ep.SublistColumn('custpage_entity', 'text', 'Payee');
        sublistColumns['custpage_email_notif'] = new psg_ep.SublistColumn('custpage_email_notif', 'text', 'Email Address', 'entry', '', null, null, null, true);
        sublistColumns['custpage_email_notif_hidden'] = new psg_ep.SublistColumn('custpage_email_notif_hidden', 'text', 'Email Address', 'hidden', null, null, true);
        sublistColumns['custpage_email_cc'] = new psg_ep.SublistColumn('custpage_email_cc', 'text', 'CC', 'entry', '', null, null, null, true);
        sublistColumns['custpage_email_bcc'] = new psg_ep.SublistColumn('custpage_email_bcc', 'text', 'BCC', 'entry', '', null, null, null, true);
        sublistColumns['custpage_trandate'] = new psg_ep.SublistColumn('custpage_trandate', 'date', 'Date');
        sublistColumns['custpage_tranid'] = new psg_ep.SublistColumn('custpage_tranid', 'text', 'Reference Number');
        sublistColumns['custpage_postingperiod'] = new psg_ep.SublistColumn('custpage_postingperiod', 'text', 'Period');
        if (isMultiCurrency()) {
            sublistColumns['custpage_currency'] = new psg_ep.SublistColumn('custpage_currency', 'text', 'Currency');
            sublistColumns['custpage_fxamount'] = new psg_ep.SublistColumn('custpage_fxamount', 'currency', 'Amount (Foreign Currency)');
        }
        sublistColumns['custpage_amount'] = new psg_ep.SublistColumn('custpage_amount', 'currency', 'Amount');
        sublistColumns['custpage_linemarkdata'] = new psg_ep.SublistColumn('custpage_linemarkdata', 'text', 'Mark Column', 'hidden', null, null, null, true);
        sublistColumns['custpage_note'] = new psg_ep.SublistColumn('custpage_note', 'textarea', 'Custom E-mail Notes', 'entry', '', null, null, null, true);
        
        return sublistColumns;
    }
    
    /**
     * Initializes the request parameters
     */
    function initializeRequestParameters(request) {
        this._sublist._initializeRequestParameters(request);
    }
  
    /**
     * Sets the sublist data
     */
    function setSublistData(data) {
        this._sublist._setSublistData(data);
    }
    
    /**
     * Adds the button to the sublist tab
     */
    function addButton(buttonId, label, func) {
        this._sublist._addButton(buttonId, label, func);
    }
    
    /**
     * Sets the error message
     */
    function setErrorMessage(source, errorMessage) {
        this._sublist._setErrorMessage(source, errorMessage);
    }
    
    this.BuildUI = buildUI;
    this.InitializeRequestParameters = initializeRequestParameters;
    this.SetSublistData = setSublistData;
    this.AddButton = addButton;
    this.SetErrorMessage = setErrorMessage;
};

/**
 * Transaction search object for Notification
 * 
 * @param {Array} requestParams
 * @param {Date} startTime
 * @returns {psg_ep.TransactionData_Notification}
 */
psg_ep.TransactionData_Notification = function(requestParams, startTime) {
    if (!requestParams) {
        throw nlapiCreateError('EP_REQUEST_PARAMS_NULL', 'Cannot create data object without request params', true);
    }
    if (!startTime) {
        throw nlapiCreateError('EP_START_TIME_NULL', 'Cannot create data object without start time', true);
    }
        
    this._tranDataInterface = new psg_ep.TransactionDataInterface(); 
    this._tranDataInterface.StartTime = startTime;
    this._tranDataInterface.RequestParams = requestParams;
//    this._tranDataInterface.Entities = entities;
    this._tranDataObj = new psg_ep.TransactionData(this._tranDataInterface);
    
    /**
     * Returns transactions for sublist
     * 
     * @returns {Array}
     */
    function getTransactions() {
        this._tranDataInterface.BuildFilters = buildFilters_Notification;
        this._tranDataInterface.BuildColumns = buildColumns_Notification;
        this._tranDataInterface.ConvertTransactionSearchResultToObjectArray = convertTransactionSearchResultToObjectArray_Notification;
        return this._tranDataObj._getTransactions();
    }
    
    ////////////////////////////////////////////////////////////////////////////////////
    // Data Framework Functions - Start
    
    /**
     * Get non entity filters
     *
     * @param requestParams
     * @returns {Array}
     */
    function buildFilters_Notification(requestParams) {
        // get request parameter filters
        var fileId = requestParams['custpage_2663_file_id'];
        
        // Filter for payments related to the file id
        var filters = [new nlobjSearchFilter('mainline', null, 'is', 'T')];
        
        if (fileId) {
        	filters.push(new nlobjSearchFilter('custrecord_2663_eft_file_id', 'custrecord_2663_parent_payment', 'anyof', fileId));	
        }
        
        return filters;
    }

    /**
     * Builds columns for search
     * 
     * @returns {Array}
     */
    function buildColumns_Notification() {
        var columns = [];
        columns.push(new nlobjSearchColumn('internalid'));
        columns.push(new nlobjSearchColumn('custrecord_2663_eft_file_id', 'custrecord_2663_parent_payment'));
        columns.push(new nlobjSearchColumn('name'));
        columns.push(new nlobjSearchColumn('trandate'));
        columns.push(new nlobjSearchColumn('memo'));
        columns.push(new nlobjSearchColumn('postingperiod'));
        columns.push(new nlobjSearchColumn('amount'));
        columns.push(new nlobjSearchColumn('internalid', 'employee'));
        columns.push(new nlobjSearchColumn('internalid', 'customer'));
        columns.push(new nlobjSearchColumn('internalid', 'vendor'));
        columns.push(new nlobjSearchColumn('custentity_2663_email_address_notif', 'employee'));
        columns.push(new nlobjSearchColumn('custentity_2663_email_address_notif', 'customer'));
        columns.push(new nlobjSearchColumn('custentity_2663_email_address_notif', 'vendor'));
        columns.push(new nlobjSearchColumn('email', 'employee'));
        columns.push(new nlobjSearchColumn('email', 'customer'));
        columns.push(new nlobjSearchColumn('email', 'vendor'));
        if(nlapiGetContext().getFeature('PRM')){
        	columns.push(new nlobjSearchColumn('internalid', 'partner'));
            columns.push(new nlobjSearchColumn('custentity_2663_email_address_notif', 'partner'));
            columns.push(new nlobjSearchColumn('email', 'partner'));
        }
        // Display currency only for multi-currency clients. 
        if (isMultiCurrency()) {
            columns.push(new nlobjSearchColumn('currency'));
            columns.push(new nlobjSearchColumn('fxamount'));
            var formulaCurrency = new nlobjSearchColumn('formulacurrency');
            formulaCurrency.setFormula('{fxamount} * {exchangerate}');
            columns.push(formulaCurrency);
        }
        return columns;
    }
    
    /**
     * Convert the search result array to object array
     * 
     * @param {Array} transactions
     * @returns {Array}
     */
    function convertTransactionSearchResultToObjectArray_Notification(transactions) {
        var sublistLines = [];
        
        var amtColumn = 'amount';
        
        var currencyFlag = false;
        if (isMultiCurrency()) {
            amtColumn = 'formulacurrency';
            currencyFlag = true;
        }

        for (var i = 0; i < transactions.length; i++) {
        	
        	var entityType = '';
        	var email_notif  = '';
        	
        	if(transactions[i].getValue('internalid', 'employee')){
        		entityType = 'employee';
        	} else if(transactions[i].getValue('internalid', 'customer')){
        		entityType = 'customer';
        	} else if(transactions[i].getValue('internalid', 'vendor')){
        		entityType = 'vendor';
        	} else if(transactions[i].getValue('internalid', 'partner')){
        		entityType = 'partner';
        	}
        	
        	if(entityType){
        		email_notif = transactions[i].getValue('custentity_2663_email_address_notif', entityType) || transactions[i].getValue('email', entityType);
        	}
        	
            var sublistLineObj = {
                custpage_internalid: transactions[i].getValue('internalid'),
                custpage_mark_key: transactions[i].getValue('internalid'),
                custpage_entity: transactions[i].getText('name'),
                custpage_trandate: transactions[i].getValue('trandate'),
                custpage_tranid: transactions[i].getValue('memo'),
                custpage_postingperiod: transactions[i].getText('postingperiod'),
                custpage_amount: nlapiFormatCurrency(Math.abs(transactions[i].getValue(amtColumn))),
                custpage_email_notif: email_notif,
                custpage_email_notif_hidden: email_notif
            };
            
            if (currencyFlag == true) {
                sublistLineObj.custpage_fxamount = nlapiFormatCurrency(Math.abs(transactions[i].getValue('fxamount')));
                sublistLineObj.custpage_currency = transactions[i].getText('currency');
            }
            
            sublistLineObj.custpage_linemarkdata = JSON.stringify({custpage_amount: sublistLineObj.custpage_amount, custpage_email_notif: sublistLineObj.custpage_email_notif});
            
            sublistLines.push(sublistLineObj);
        }
        
        nlapiLogExecution('debug', 'convertTransactionSearchResultToObjectArray_Notification', 'sublistLines:' + sublistLines.length);
        
        return sublistLines;
    }
    
    // Data Framework Functions - End
    
    this.GetTransactions = getTransactions;
};