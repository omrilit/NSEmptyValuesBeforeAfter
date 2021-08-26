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
 * 2013/03/11  245306         2.00.10                 Add field custpage_2663_ppclosed
 * 2013/03/11  245309         2.00.10                 Set maxLength of field custpage_note to 1000
 * 2013/03/18  246362         2.00.10                 Update field helps of new fields
 * 2013/03/19  245309         2.00.10                 Set maxLength of field custpage_note to 999
 *
 */

var psg_ep;

if (!psg_ep)
    psg_ep = {};

/**
 * Loads Reversal form
 *
 * @param {Object} request
 * @param {Object} response
 */
function main(request, response){
    psg_ep.PaymentSelectionFormMain_Reversal(request, response);
}

/**
 * Main function to load Reversal form
 * 
 * @param {nlobjRequest} request
 * @param {nlobjResponse} response
 */
psg_ep.PaymentSelectionFormMain_Reversal = function(request, response) {
    var crUIObj = new psg_ep.PaymentSelectionForm_Reversal();
    nlapiLogExecution('debug', '[ep] PaymentSelectionFormMain_Reversal', 'Building UI...');
    crUIObj.BuildUI();
    nlapiLogExecution('debug', '[ep] PaymentSelectionFormMain_Reversal', 'Initializing request parameters...');
    crUIObj.InitializeRequestParameters(request);
    nlapiLogExecution('debug', '[ep] PaymentSelectionFormMain_Reversal', 'Populating form fields...');
    crUIObj.InitializeFieldData();
    nlapiLogExecution('debug', '[ep] PaymentSelectionFormMain_Reversal', 'Loading sublist...');
    crUIObj.LoadSublist(request);
    nlapiLogExecution('debug', '[ep] PaymentSelectionFormMain_Reversal', 'Writing page...');
    response.writePage(crUIObj._uiObj.Form);
    nlapiLogExecution('debug', '[ep] PaymentSelectionFormMain_Reversal', 'Done.');
};

/**
 * Class that handles Reversal form creation
 * 
 * @returns {psg_ep.PaymentSelectionForm_Reversal}
 */
psg_ep.PaymentSelectionForm_Reversal = function() {
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
        fieldGroups.push('custpage_2663_payinfogrp');
        fieldGroups.push('custpage_2663_je_info_grp');

        this._uiBuilderInterface.GetFieldsForFieldGroup = getFieldsForFieldGroup_Reversal;
        
        // set the sublist class
        this._uiBuilderInterface.SublistClass = psg_ep.Sublist_Reversal;
        
        // add the buttons
        this._uiObj.ButtonIds.push('custpage_submitter');
        this._uiObj.ButtonIds.push('custpage_cancel');
        
        // build the form
        this._uiObj._buildUI('Payment Reversals', 'customscript_ep_selection_cs');
    }
    
    /**
     * Returns the fields based on field group
     * 
     * @returns {}
     */
    function getFieldsForFieldGroup_Reversal(fieldGroup) {
        var fieldGroupObjects = {};
    	if (fieldGroup == 'custpage_2663_payinfogrp') {
    		var paymentTypeObj = psg_ep.CommonFormFields['custpage_2663_paymenttype'];
            paymentTypeObj.defaultValue = 'reversal';
            fieldGroupObjects['custpage_2663_paymenttype'] = paymentTypeObj;
            fieldGroupObjects['custpage_2663_refresh_page'] = psg_ep.CommonFormFields['custpage_2663_refresh_page'];
            fieldGroupObjects['custpage_2663_trans_marked'] = psg_ep.CommonFormFields['custpage_2663_trans_marked'];
            fieldGroupObjects['custpage_2663_file_id'] = psg_ep.CommonFormFields['custpage_2663_file_id'];
            fieldGroupObjects['custpage_2663_file_name'] = psg_ep.CommonFormFields['custpage_2663_file_name'];
            fieldGroupObjects['custpage_2663_ppstart'] = psg_ep.CommonFormFields['custpage_2663_ppstart'];
            fieldGroupObjects['custpage_2663_ppend'] = psg_ep.CommonFormFields['custpage_2663_ppend'];
            fieldGroupObjects['custpage_2663_ppclosed'] = psg_ep.CommonFormFields['custpage_2663_ppclosed'];
            fieldGroupObjects['custpage_2663_reason'] = psg_ep.ReversalFormFields['custpage_2663_reason'];
            fieldGroupObjects['custpage_2663_total_lines'] = psg_ep.CommonFormFields['custpage_2663_total_lines'];
            
            var paymentLinesObj = psg_ep.CommonFormFields['custpage_2663_payment_lines'];
            paymentLinesObj.label = 'Lines Selected';
            paymentLinesObj.layoutType = '';
            paymentLinesObj.breakType = '';
            fieldGroupObjects['custpage_2663_payment_lines'] = paymentLinesObj;
            
            fieldGroupObjects['custpage_2663_total_amount_paid'] = psg_ep.ReversalFormFields['custpage_2663_total_amount_paid'];
            
            var totalAmountObj = psg_ep.CommonFormFields['custpage_2663_total_amount'];
            totalAmountObj.label = 'Amount Selected';
            fieldGroupObjects['custpage_2663_total_amount'] = totalAmountObj;
            
        } else if ('custpage_2663_je_info_grp') {
        	var processDateObj = psg_ep.CommonFormFields['custpage_2663_process_date'];
            processDateObj.label = 'Reversal Date';
            processDateObj.helpText = [
                'Enter the date of the reversing journal entry that will be created after performing the payment reversal.<br><br>', 
                'Notes:<br>', 
                '<ul><li>If you enter a past date that does not fall within an existing open posting period, the value on the posting period field will change to the earliest posting period.</li>',
                '<li>If you enter a future date that does not fall within an existing open posting period, the value on the posting period field will change to the last  posting period.</li></ul>'	
            ].join('');
            processDateObj.layoutType = '';
            processDateObj.breakType = '';
            fieldGroupObjects['custpage_2663_process_date'] = processDateObj;
            
            var postingPeriod = psg_ep.CommonFormFields['custpage_2663_postingperiod'];
            postingPeriod.label = 'Reversal Posting Period';
            postingPeriod.helpText = 'Select the accounting period to which the reversing journal entry will be posted. Only open posting periods are displayed on this list.';
            fieldGroupObjects['custpage_2663_postingperiod'] = psg_ep.CommonFormFields['custpage_2663_postingperiod'];
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
    	this._uiObj.FieldInitializer.PreparePostingPeriodField();
    	
    	if (this._uiObj.RequestParams['custpage_2663_file_id'] && !this._uiObj.RequestParams['custpage_2663_file_name']) {
    		this._uiObj.RequestParams['custpage_2663_file_name'] = nlapiLookupField('customrecord_2663_file_admin', this._uiObj.RequestParams['custpage_2663_file_id'], 'name');
        }
    	
        // set the field values
        this._uiObj._setFieldValuesFromParams();
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
            var transactionListData = new psg_ep.TransactionData_Reversal(this._uiObj.RequestParams, this._uiObj.StartTime);
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
            form.getField('custpage_2663_total_amount_paid').setDefaultValue(totalAmtPaid);	
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
 * Class for Reversal sublist
 *
 * @param {nlobjForm} form
 * @param {String} name
 * @param {String} type
 * @param {String} label
 * @param {String} tab
 * @returns {psg_ep.Sublist_Reversal}
 */
psg_ep.Sublist_Reversal = function(form, name, type, label, tab) {
    this._sublistInterface = new psg_ep.SublistInterface();
    this._sublist = new psg_ep.Sublist(form, name, type, label, tab, this._sublistInterface);
    
    /**
     * Builds the sublist UI
     */
    function buildUI() {
        this._sublistInterface.GetColumns = getColumns_Reversal;
        this._sublist._buildUI();
    }
    
    /**
     * Returns the columns for the sublist
     */
    function getColumns_Reversal() {
        var sublistColumns = {};
        sublistColumns['custpage_internalid'] = new psg_ep.SublistColumn('custpage_internalid', 'integer', 'ID', 'hidden');
        sublistColumns['custpage_mark_key'] = new psg_ep.SublistColumn('custpage_mark_key', 'text', 'Mark ID', 'hidden', null, null, true);
        sublistColumns['custpage_pay'] = new psg_ep.SublistColumn('custpage_pay', 'checkbox', 'Select', null, 'F', true);
        sublistColumns['custpage_entity'] = new psg_ep.SublistColumn('custpage_entity', 'text', 'Payee');
        sublistColumns['custpage_trandate'] = new psg_ep.SublistColumn('custpage_trandate', 'date', 'Date');
        sublistColumns['custpage_tranid'] = new psg_ep.SublistColumn('custpage_tranid', 'text', 'Reference Number');
        sublistColumns['custpage_postingperiod'] = new psg_ep.SublistColumn('custpage_postingperiod', 'text', 'Period');
        if (isMultiCurrency()) {
            sublistColumns['custpage_currency'] = new psg_ep.SublistColumn('custpage_currency', 'text', 'Currency');
            sublistColumns['custpage_fxamount'] = new psg_ep.SublistColumn('custpage_fxamount', 'currency', 'Amount (Foreign Currency)');
        }
        sublistColumns['custpage_amount'] = new psg_ep.SublistColumn('custpage_amount', 'currency', 'Amount');
        sublistColumns['custpage_linemarkdata'] = new psg_ep.SublistColumn('custpage_linemarkdata', 'text', 'Mark Column', 'hidden', null, null, null, true);
        sublistColumns['custpage_note'] = new psg_ep.SublistColumn('custpage_note', 'text', 'Reversal Reason', 'entry', '', null, null, null, true, 999);
        
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
 * Transaction search object for Reversal
 * 
 * @param {Array} requestParams
 * @param {Date} startTime
 * @returns {psg_ep.TransactionData_Reversal}
 */
psg_ep.TransactionData_Reversal = function(requestParams, startTime) {
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
        this._tranDataInterface.BuildFilters = buildFilters_Reversal;
        this._tranDataInterface.BuildColumns = buildColumns_Reversal;
        this._tranDataInterface.ConvertTransactionSearchResultToObjectArray = convertTransactionSearchResultToObjectArray_Reversal;
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
    function buildFilters_Reversal(requestParams) {
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
    function buildColumns_Reversal() {
        var columns = [];
        columns.push(new nlobjSearchColumn('internalid'));
        columns.push(new nlobjSearchColumn('custrecord_2663_eft_file_id', 'custrecord_2663_parent_payment'));
        columns.push(new nlobjSearchColumn('name'));
        columns.push(new nlobjSearchColumn('trandate'));
        columns.push(new nlobjSearchColumn('memo'));
        columns.push(new nlobjSearchColumn('postingperiod'));
        columns.push(new nlobjSearchColumn('amount'));
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
    function convertTransactionSearchResultToObjectArray_Reversal(transactions) {
        var sublistLines = [];
        
        var amtColumn = 'amount';
        
        var currencyFlag = false;
        if (isMultiCurrency()) {
            amtColumn = 'formulacurrency';
            currencyFlag = true;
        }

        for (var i = 0; i < transactions.length; i++) {
            var sublistLineObj = {
                custpage_internalid: transactions[i].getValue('internalid'),
                custpage_mark_key: transactions[i].getValue('internalid'),
                custpage_entity: transactions[i].getText('name'),
                custpage_trandate: transactions[i].getValue('trandate'),
                custpage_tranid: transactions[i].getValue('memo'),
                custpage_postingperiod: transactions[i].getText('postingperiod'),
                custpage_amount: nlapiFormatCurrency(Math.abs(transactions[i].getValue(amtColumn)))
            };
            if (currencyFlag == true) {
                sublistLineObj.custpage_fxamount = nlapiFormatCurrency(Math.abs(transactions[i].getValue('fxamount')));
                sublistLineObj.custpage_currency = transactions[i].getText('currency');
            }
            sublistLineObj.custpage_linemarkdata = JSON.stringify({custpage_amount: sublistLineObj.custpage_amount});
            
            sublistLines.push(sublistLineObj);
        }
        
        nlapiLogExecution('debug', 'convertTransactionSearchResultToObjectArray_Reversal', 'sublistLines:' + sublistLines.length);
        
        return sublistLines;
    }
    
    // Data Framework Functions - End
    
    this.GetTransactions = getTransactions;
};