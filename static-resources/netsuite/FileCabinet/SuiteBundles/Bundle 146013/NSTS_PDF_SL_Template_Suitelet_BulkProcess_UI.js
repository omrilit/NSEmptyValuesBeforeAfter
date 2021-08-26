/**
* Copyright (c) 1998-2016 NetSuite, Inc.
* 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
* All Rights Reserved.
*
* This software is the confidential and proprietary information of
* NetSuite, Inc. ("Confidential Information"). You shall not
* disclose such Confidential Information and shall use it only in
* accordance with the terms of the license agreement you entered into
* with NetSuite.
* 
* Bulk printing UI
* 
* Version   Date            Author      Remarks
* 1.00                      APAC Team   initial version
* 2.00      1 Feb 2016      dgeronimo
*/

/**
 * Template_BulkProcess_UI(request, response) as entry to the all scripts 
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function Template_BulkProcess_UI(request, response){
	setFormController(request, response);
}

/*
 * NOTE: indicate which step needs to be taken next
 * TODO: All actions stored in global variables, so that all name changing can be done in one place 
 */
function setAction(psForm,psAction){
	psForm.addField('custpage_ps_action', 'text', 'Action Taken').setDisplayType('hidden').setDefaultValue(psAction);
}

function setFormController(request, response){
	var actionTaken = request.getParameter('custpage_ps_action');
	switch(actionTaken){
		case 'printAction':
			createPrintActionPage(request, response);
			break;
		case 'sendEmailAction':
			createSendEmailActionPage(request, response);
			break;
		case 'displaySearchResult':
			createDefaultPage(request, response);
			break;
	    default: createInitPage(request, response);
	}
}

/**
 * Init Page after suitelet is called. Include filters based on business requirement, submit button, reset button
 */
function createInitPage(request, response){
	var psInitForm = nlapiCreateForm('Bulk Printing/Emailing');
	psInitForm.setScript('customscript_template_html_action_trig');
	var objList = psInitForm.addField('custpage_ps_record_type', 'select', 'Record Type').setMandatory(true);
	Function.addSelectOptions(objList);
	psInitForm.addField('custpage_ps_entity', 'select', 'Vendor','vendor');
	psInitForm.addField('custpage_ps_subsidiary', 'select', 'Subsidiary','subsidiary');
	psInitForm.addField('custpage_ps_period', 'select', 'Accounting Period','accounting​p​e​r​i​o​d').setDefaultValue('');
	/*psInitForm.addField('custpage_ps_payment_start_date', 'date', 'Payment Start Date');
	psInitForm.addField('custpage_ps_payment_end_date', 'date', 'Payment End Date');*/
	
	var statusList = psInitForm.addField('custpage_ps_status', 'select', 'Status');
	statusList.addSelectOption('', '');
	statusList.addSelectOption('VendBill:A', 'Bill:Open');
	statusList.addSelectOption('VendBill:B', 'Bill:Paid In Full');
	
	statusList.addSelectOption('VendPymt:V', 'Bill Payment:Voided ');
	statusList.addSelectOption('VendPymt:Z', 'Bill Payment:Online Bill Pay Pending Accounting Approval');
	statusList.addSelectOption('CashSale:A', 'Cash Sale:Unapproved Payment');
    statusList.addSelectOption('CashSale:B', 'Cash Sale:Not Deposited');
    statusList.addSelectOption('CashSale:C', 'Cash Sale:Deposited');
    
    statusList.addSelectOption('Check:V', 'Check:Voided');
    statusList.addSelectOption('Check:Z', 'Check:Online Bill Pay Pending Accounting Approval');
    
    statusList.addSelectOption('Commissn:A', 'Commission:Pending Payment');
    statusList.addSelectOption('Commissn:O', 'Commission:Overpaid');
    statusList.addSelectOption('Commissn:P', 'Commission:Pending Accounting Approval');
    statusList.addSelectOption('Commissn:R', 'Commission:Rejected by Accounting');
    statusList.addSelectOption('Commissn:X', 'Commission:Paid in Full');
    
    statusList.addSelectOption('CustCred:A', 'Credit Memo:Open');
    statusList.addSelectOption('CustCred:B', 'Credit Memo:Fully Applied');
    statusList.addSelectOption('CustDep:A', 'Customer Deposit:Not Deposited ');
    statusList.addSelectOption('CustDep:B', 'Customer Deposit:Deposited');
    statusList.addSelectOption('CustDep:C', 'Customer Deposit:Fully Applied');
    statusList.addSelectOption('CustRfnd:V', 'Customer Refund:Voided');
    
    statusList.addSelectOption('ExpRept:A', 'Expense Report:In Progress');
    statusList.addSelectOption('ExpRept:B', 'Expense Report:Pending Supervisor Approval');
    statusList.addSelectOption('ExpRept:C', 'Expense Report:Pending Accounting Approval');
    statusList.addSelectOption('ExpRept:D', 'Expense Report:Rejected by Supervisor');
    statusList.addSelectOption('ExpRept:E', 'Expense Report:Rejected by Accounting');
    statusList.addSelectOption('ExpRept:F', 'Expense Report:Approved by Accounting');
    statusList.addSelectOption('ExpRept:G', 'Expense Report:Approved (Overridden) by Accounting');
    statusList.addSelectOption('ExpRept:H', 'Expense Report:Rejected (Overridden) by Accounting');
    statusList.addSelectOption('ExpRept:I', 'Expense Report:Paid In Full');
    
    statusList.addSelectOption('CustInvc:A', 'Invoice:Open');
    statusList.addSelectOption('CustInvc:B', 'Invoice:Paid In Full');
    
    statusList.addSelectOption('ItemShip:A', 'Item Fulfillment:Picked');
    statusList.addSelectOption('ItemShip:B', 'Item Fulfillment:Packed');
    statusList.addSelectOption('ItemShip:C', 'Item Fulfillment:Shipped ');
    
    statusList.addSelectOption('Journal:A', 'Journal:Pending Approval');
    statusList.addSelectOption('Journal:B', 'Journal:Approved for Posting ');
    
    statusList.addSelectOption('Opprtnty:A', 'Opportunity:In Progress');
    statusList.addSelectOption('Opprtnty:B', 'Opportunity:Issued Estimate');
    statusList.addSelectOption('Opprtnty:C', 'Opportunity:Closed – Won');
    statusList.addSelectOption('Opprtnty:D', 'Opportunity:Closed – Lost');
    
    statusList.addSelectOption('Paycheck:A', 'Paycheck:Undefined');
    statusList.addSelectOption('Paycheck:C', 'Paycheck:Pending Tax Calculation');
    statusList.addSelectOption('Paycheck:D', 'Paycheck:Pending Commitment');
    statusList.addSelectOption('Paycheck:F', 'Paycheck:Committed');
    statusList.addSelectOption('Paycheck:P', 'Paycheck:Preview');
    statusList.addSelectOption('Paycheck:R', 'Paycheck:Reversed');
    
    statusList.addSelectOption('CustPymt:A', 'Payment:Unapproved Payment');
    statusList.addSelectOption('CustPymt:B', 'Payment:Not Deposited');
    statusList.addSelectOption('CustPymt:C', 'Payment:Deposited');
    
    statusList.addSelectOption('LiabPymt:V', 'Payroll Liability Check:Voided');
    
    statusList.addSelectOption('PurchOrd:A', 'Purchase Order:Pending Supervisor Approval ');
    statusList.addSelectOption('PurchOrd:B', 'Purchase Order:Pending Receipt');
    statusList.addSelectOption('PurchOrd:C', 'Purchase Order:Rejected by Supervisor');
    statusList.addSelectOption('PurchOrd:D', 'Purchase Order:Partially Received ');
    statusList.addSelectOption('PurchOrd:E', 'Purchase Order:Pending Billing/Partially Received');
    statusList.addSelectOption('PurchOrd:F', 'Purchase Order:Pending Bill');
    statusList.addSelectOption('PurchOrd:G', 'Purchase Order:Fully Billed');
    statusList.addSelectOption('PurchOrd:H', 'Purchase Order:Closed ');
    
    statusList.addSelectOption('Estimate:A', 'Quote:Open');
    statusList.addSelectOption('Estimate:B', 'Quote:Processed');
    statusList.addSelectOption('Estimate:C', 'Quote:Closed');
    statusList.addSelectOption('Estimate:V', 'Quote:Voided');
    statusList.addSelectOption('Estimate:X', 'Quote:Expired');
    
    statusList.addSelectOption('RtnAuth:A', 'Return Authorization:Pending Approval');
    statusList.addSelectOption('RtnAuth:B', 'Return Authorization:Pending Receipt');
    statusList.addSelectOption('RtnAuth:C', 'Return Authorization:Cancelled');
    statusList.addSelectOption('RtnAuth:D', 'Return Authorization:Partially Received');
    statusList.addSelectOption('RtnAuth:E', 'Return Authorization:Pending Refund/Partially Received');
    statusList.addSelectOption('RtnAuth:F', 'Return Authorization:Pending Refund');
    statusList.addSelectOption('RtnAuth:G', 'Return Authorization:Refunded');
    statusList.addSelectOption('RtnAuth:H', 'Return Authorization:Closed');
    
    statusList.addSelectOption('SalesOrd:A', 'Sales Order:Pending Approval');
    statusList.addSelectOption('SalesOrd:B', 'Sales Order:Pending Fulfillment');
    statusList.addSelectOption('SalesOrd:C', 'Sales Order:Cancelled');
    statusList.addSelectOption('SalesOrd:D', 'Sales Order:Partially Fulfilled');
    statusList.addSelectOption('SalesOrd:E', 'Sales Order:Pending Billing/Partially Fulfilled');
    statusList.addSelectOption('SalesOrd:F', 'Sales Order:Pending Billing');
    statusList.addSelectOption('SalesOrd:G', 'Sales Order:Billed');
    statusList.addSelectOption('SalesOrd:H', 'Sales Order:Closed');
    
    statusList.addSelectOption('TaxPymt:V', 'Sales Tax Payment:Voided ');
    statusList.addSelectOption('TaxPymt:Z', 'Sales Tax Payment:Online Bill Pay Pending Accounting Approval ');
    statusList.addSelectOption('CustChrg:A', 'Statement Charge:Open');
    statusList.addSelectOption('CustChrg:B', 'Statement Charge:Paid In Full');
    statusList.addSelectOption('TaxLiab:V', 'Tax Liability Cheque:Voided');
    
    statusList.addSelectOption('TegPybl:E', 'Tegata Payable:Endorsed');
    statusList.addSelectOption('TegPybl:I', 'Tegata Payable:Issued');
    statusList.addSelectOption('TegPybl:P', 'Tegata Payable:Paid');
    
    statusList.addSelectOption('TegRcvbl:C', 'Tegata Receivables:Collected ');
    statusList.addSelectOption('TegRcvbl:D', 'Tegata Receivables:Discounted ');
    statusList.addSelectOption('TegRcvbl:E', 'Tegata Receivables:Endorsed');
    statusList.addSelectOption('TegRcvbl:H', 'Tegata Receivables:Holding');
    statusList.addSelectOption('TrnfrOrd:A', 'Transfer Order:Pending Approval');
    statusList.addSelectOption('TrnfrOrd:B', 'Transfer Order:Pending Fulfillment');
    statusList.addSelectOption('TrnfrOrd:C', 'Transfer Order:Rejected');
    statusList.addSelectOption('TrnfrOrd:D', 'Transfer Order:Partially Fulfilled');
    statusList.addSelectOption('TrnfrOrd:E', 'Transfer Order:Pending Receipt/Partially Fulfilled');
    statusList.addSelectOption('TrnfrOrd:F', 'Transfer Order:Pending Receipt');
    statusList.addSelectOption('TrnfrOrd:G', 'Transfer Order:Received');
    statusList.addSelectOption('TrnfrOrd:H', 'Transfer Order:Closed');
    
    statusList.addSelectOption('VendAuth:A', 'Vendor Return Authorization:Pending Approval');
    statusList.addSelectOption('VendAuth:B', 'Vendor Return Authorization:Pending Return');
    statusList.addSelectOption('VendAuth:C', 'Vendor Return Authorization:Cancelled');
    statusList.addSelectOption('VendAuth:D', 'Vendor Return Authorization:Partially Returned');
    statusList.addSelectOption('VendAuth:E', 'Vendor Return Authorization:Pending Credit/Partially Returned');
    statusList.addSelectOption('VendAuth:F', 'Vendor Return Authorization:Pending Credit');
    statusList.addSelectOption('VendAuth:G', 'Vendor Return Authorization:Credited');
    statusList.addSelectOption('VendAuth:H', 'Vendor Return Authorization:Closed ');
    
    statusList.addSelectOption('WorkOrd:B', 'Work Order:Pending Build');
    statusList.addSelectOption('WorkOrd:C', 'Work Order:Cancelled');
    statusList.addSelectOption('WorkOrd:D', 'Work Order:Partially Built');
    statusList.addSelectOption('WorkOrd:G', 'Work Order:Built');
    statusList.addSelectOption('WorkOrd:H', 'Work Order:Closed');


	psInitForm.addField('custpage_ps_transaction_start_date', 'date', 'Transaction From Date');
	psInitForm.addField('custpage_ps_transaction_end_date', 'date', 'Transaction End Date');
	setAction(psInitForm,'displaySearchResult');
	psInitForm.addSubmitButton('Submit');
	psInitForm.addResetButton('Reset');
    response.writePage(psInitForm);
}

/**
 * Default action page,display the content from save search
 */
function createDefaultPage(request, response){
	var scriptParamRecordType = request.getParameter('custpage_ps_record_type');
	var scriptParamEntity = request.getParameter('custpage_ps_entity');
	var scriptParamSubsidiary = request.getParameter('custpage_ps_subsidiary');
	var scriptParamPeriod = request.getParameter('custpage_ps_period');
	var scriptParamStartDate = request.getParameter('custpage_ps_payment_start_date');
	var scriptParamEndDate = request.getParameter('custpage_ps_payment_end_date');
	var scriptParamStatus = request.getParameter('custpage_ps_status');
	var scriptParamTransactionStartDate = request.getParameter('custpage_ps_transaction_start_date');
	var scriptParamTransactionEndtDate = request.getParameter('custpage_ps_transaction_end_date');
	var psDefaultForm = nlapiCreateForm('Saved Search Result');
	var psObjectArray = [];
		
	var arrSearchResult = getSaveSearchResult(scriptParamRecordType,scriptParamSubsidiary,scriptParamPeriod,scriptParamStartDate,scriptParamEndDate,scriptParamEntity,scriptParamStatus,scriptParamTransactionStartDate,scriptParamTransactionEndtDate);
	generateSaveSearchObject(arrSearchResult,psObjectArray);
	//displaySaveSearchResult(psObjectArray,psDefaultForm);
	displaySaveSearchResult(arrSearchResult,psDefaultForm);
	
	if(!Function.isUndefinedNullOrEmpty(arrSearchResult)){
		psDefaultForm.addButton('custpage_ps_send_email', 'Print', 'sendEmailAction()');
		var stringJason = JSON.stringify(psObjectArray);
		
		setAction(psDefaultForm,'printAction');
		//Store value in a hidden field, so that step after can still read it

		var stringLeng = 100000;
		if(stringJason.length > stringLeng){
			var indexLength = 1;
			while(stringJason.length > stringLeng){
				psDefaultForm.addField('custpage_ps_hiddenfield_jason' + indexLength, 'longtext', 'Hidden Field').setDisplayType('hidden').setDefaultValue(stringJason.substring(0,stringLeng));
				stringJason = stringJason.substring(stringLeng);
				indexLength = parseInt(indexLength) + 1;
			}
			psDefaultForm.addField('custpage_ps_hiddenfield_jason' + indexLength, 'longtext', 'Hidden Field').setDisplayType('hidden').setDefaultValue(stringJason);
			psDefaultForm.addField('custpage_ps_hiddenfield_length', 'longtext', 'Hidden Field').setDisplayType('hidden').setDefaultValue(indexLength);
		}else{
			psDefaultForm.addField('custpage_ps_hiddenfield_jason', 'longtext', 'Hidden Field').setDisplayType('hidden').setDefaultValue(stringJason);
		}
		
		psDefaultForm.addField('custpage_ps_hiddenfield_checkindex', 'text', 'Hidden Field').setDisplayType('hidden');
		psDefaultForm.addField('custpage_ps_hiddenfield_input_recordtype', 'text', 'Hidden Field').setDisplayType('hidden').setDefaultValue(scriptParamRecordType);
	}else{
		psDefaultForm.addField('custpage_ps_no_result', 'label','No Result shown.');
		setAction(psDefaultForm,'');
	}
	
	psDefaultForm.addButton('custpage_ps_action_reset', 'Reset', 'goToDefaultPage()');
	psDefaultForm.setScript('customscript_template_html_action_trig');
	response.writePage(psDefaultForm);			
}



/**
 * action = printAction, Print Action Page
 * Pass all the needed data to a schedule script which will store data in NS database
 */
function createPrintActionPage(request, response){
	//var	jasonFormat = request.getParameter('custpage_ps_hiddenfield_jason');	
	var jasonFormat = getStoredJasonData();
	var recordType = request.getParameter('custpage_ps_hiddenfield_input_recordtype');
	var psSubmitResultForm = nlapiCreateForm('Print');
	psSubmitResultForm.addField('custpage_ps_srf_result', 'label','All selections are scheduled to be sent. You will receive an email once the action is finished.');
	callScheduleScript(jasonFormat,request.getParameter('custpage_ps_hiddenfield_checkindex'),'print',recordType);
	response.writePage(psSubmitResultForm);
}

function createSendEmailActionPage(request, response){
	var jasonFormat = getStoredJasonData();
	var recordType = request.getParameter('custpage_ps_hiddenfield_input_recordtype');
	var psSubmitResultForm = nlapiCreateForm('Bulk Print Result');
	
	psSubmitResultForm.addField('custpage_ps_srf_result', 'label','All selections are scheduled to be sent via email. You will receive an email with the output once the action is finished.');
	
	callScheduleScript(jasonFormat,request.getParameter('custpage_ps_hiddenfield_checkindex'),'email',recordType);	

	psSubmitResultForm.setScript('customscript_template_html_action_trig');
	psSubmitResultForm.addButton('custpage_back', 'BACK', 'goBack();');
	response.writePage(psSubmitResultForm);
}

/**
 * Saved search result example
 */
function getSaveSearchResult(recordType,subsidiary,period,dateFrom,dateTo,entity,transactionStatus,transactionStartDate,transactionEndDate){
	try{
	    transactionStatus = isEmpty(transactionStatus)? '': transactionStatus.trim();
	    
		Function.debug('getSaveSearchResult', recordType + ':' + subsidiary + ':' + period + ':' + dateFrom + ':' + dateTo + ':' + transactionStatus);
		var search = new Library.Search();
		search.setType('transaction');
		search.addColumn('internalid',null,null,'Internal ID');
		search.addColumn('transactionnumber',null,null,'Transaction Number');
		search.addColumn('trandate',null,null,'Date');
	    search.addColumn('entity',null,null,'Entity');
	    search.addColumn('subsidiary',null,null,'Subsidiary');
	    search.addColumn('postingperiod',null,null,'Accounting Period');
	    search.addColumn('amount',null,null,'amount');
	    search.addColumn('status',null,null,'Status');
        search.addColumn('memo',null,null,'Memo');		
		search.addColumn('recordtype',null,null,'Type');
		
		search.addFilter('type', null, 'anyof', Function.getTransactionTypeId(recordType));
		//search.addFilter('trandate', 'payingtransaction', 'within', dateFrom, dateTo);
		search.addFilter('mainline', null, 'is', 'T');
		search.addFilter('taxline', null, 'is', 'F');

		if(!Function.isUndefinedNullOrEmpty(period)){
			search.addFilter('postingperiod', null, 'is', period);
		}
		if(!Function.isUndefinedNullOrEmpty(subsidiary)){
			search.addFilter('subsidiary', null, 'anyof', subsidiary);
		}
		if(!Function.isUndefinedNullOrEmpty(entity)){
			search.addFilter('entity', null, 'anyof', entity);
		}
		if(!Function.isUndefinedNullOrEmpty(transactionStatus)){
			search.addFilter('status', null, 'anyof', [transactionStatus]);
		}
		if(!Function.isUndefinedNullOrEmpty(transactionStartDate) && !Function.isUndefinedNullOrEmpty(transactionEndDate)){
			search.addFilter('trandate', null, 'within', transactionStartDate,transactionEndDate);
		}else{
		    if(!Function.isUndefinedNullOrEmpty(transactionStartDate)){
		        search.addFilter('trandate', null, 'onorafter', transactionStartDate);
		    }else if(!Function.isUndefinedNullOrEmpty(transactionEndDate)){
		        search.addFilter('trandate', null, 'onorbefore', transactionEndDate);
		    }
		}
		
		var arResults = search.execute();
		if(!Function.isUndefinedNullOrEmpty(arResults)){
			return arResults;
		}
		
		
		
		return null;
	}catch(ex){
		var strError = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace().join('\n') : ex.toString();
		Function.debug('Save Search Result', strError);
	}
}


/**
 * generateSaveSearchObject(exampleSaveSearch,psObjectArray) converts display result into objects
 */
function generateSaveSearchObject(exampleSaveSearch,psObjectArray){
	Function.debug('generateSaveSearchObject', 'Start');
	
	if(!Function.isUndefinedNullOrEmpty(exampleSaveSearch)){
		for(var i in exampleSaveSearch){
			 var singleSearchResult = exampleSaveSearch[i];
		     var objSearch = new NARTA.BulkTransaction();
		     createSingleSearch(singleSearchResult,objSearch);
		     psObjectArray[psObjectArray.length] = objSearch;
		}
	}
}

/**
 * createSingleSearch(search,objSearch) converts single display result into a object
 * 
 * @param {Object} avenue: one row of search result
 * @param {Object} objInvoice: a object
 * 
 */
function createSingleSearch(search,objSearch){
	var arColumns = search.getAllColumns();
    for ( var r = 0; r < arColumns.length; r++){
		var strFieldLabel = arColumns[r].getLabel();
		var strFieldValue = search.getValue(arColumns[r]);

		switch(strFieldLabel){
			case 'Internal ID':
				objSearch.setInternalID(strFieldValue);
				break;
			case 'ID':
				objSearch.setTranID(strFieldValue);
				break;
			case 'Entity': 
				var strFieldText = search.getText(arColumns[r].getName(), arColumns[r].getJoin(), arColumns[r].getSummary());
				objSearch.setEntityID(strFieldValue); 
				objSearch.setEntityName(strFieldText);
				break;
			case 'Amount': 
				objSearch.setAmount(strFieldValue);
				break;
			case 'Payment Date': 
				objSearch.setPaymentDate(strFieldValue);
				break;
			case 'Date': 
				objSearch.setDate(strFieldValue);
				break;
			case 'Type': 
				var strFieldText = search.getText(arColumns[r].getName(), arColumns[r].getJoin(), arColumns[r].getSummary());
				objSearch.setRecordTypeID(strFieldValue); 
				objSearch.setRecordTypeName(strFieldText);
				break;	
			case 'Status': 
				var strFieldText = search.getText(arColumns[r].getName(), arColumns[r].getJoin(), arColumns[r].getSummary());
				objSearch.setStatusID(strFieldValue); 
				objSearch.setStatusName(strFieldText);
				break;	
			case 'Credit No': 
				objSearch.setCreditNumber(strFieldValue);
				break;
			case 'Memo': 
				objSearch.setMemo(strFieldValue);
				break;
			case 'Comment': 
				objSearch.setComment(strFieldValue);
				break;
			case 'To Email': 
				objSearch.setToEmail(strFieldValue);
				break;
		}
	}
}


/**
 * function displaySaveSearchResult(arrSaveSearch,form) display result
 * 
 * @param {Object Array} arrSaveSearch: array containing all display result objects
 * 
 */
function displaySaveSearchResult(arrSaveSearch,form){
	Function.debug('displayInvoiceList', 'Start');
	
	if(!Function.isUndefinedNullOrEmpty(arrSaveSearch)){
		var resultlist = form.addSubList('custpage_ps_save_search_list', 'list', 'Saved Search List');
		resultlist.addMarkAllButtons();
		resultlist.addField('custpage_ps_check_box','checkbox','Mark');
		
		var res = arrSaveSearch[0];

		var arrCols =   res.getAllColumns();
		
		for (var i = 0; i < arrCols.length;i++){ 
		    var stName = arrCols[i].getName();
		    var stLabel = arrCols[i].getLabel();
		    var stJoin = arrCols[i].getJoin();
		    var stDataType = "text";
		    var stDataSource = null;
		    switch (stName) {
                case "entity":
                    stDataType = "select";
                    stDataSource = 'vendor'
                    break;
                case "subsidiary":
                    stDataType = "select";
                    stDataSource = 'subsidiary'
                    break;
                case "postingperiod":
                    stDataType = "select";
                    stDataSource = 'accounting​p​e​r​i​o​d'
                    break;
                default:
                    var stDataType = "text";
                    var stDataSource = null;
                    break

            }
		    
		    resultlist.addField(stName,stDataType,stLabel,stDataSource).setDisplayType('inline');
		}
		
		resultlist.setLineItemValues(arrSaveSearch);

	}
}


/**
 * callScheduleScript(stringifyJason,indexList, invoiceDate, dateFrom,dateTo) corresponds to "Generate Invoices" button to call schedule script 
 */
function callScheduleScript(stringifyJason,indexList, action,recordType){
	Function.debug('callScheduleScript', stringifyJason);
	var jasonFormat = '';
	var params = new Array();
	
	var arrTrans = JSON.parse(stringifyJason);
	for(var i in arrTrans){
		var lineNumber = parseInt(i) + 1;
		if(indexList.indexOf('|' + lineNumber+':') != -1){
			var tran = arrTrans[i];
			jasonFormat = jasonFormat +  tran.internalId + ',';
		}
		 
	}
	params['param_transaction_id'] = jasonFormat;
	params['param_transaction_record_type'] = Function.getTransactionRecodType(recordType);
	
	if(action == 'email'){

		params['param_bulk_approval'] = 'email';


		var stUrl = nlapiResolveURL('SUITELET', 'customscript_template_generate_pdf', 'customdeploy_template_generate_pdf');
		nlapiLogExecution('DEBUG','callScheduleScript',stUrl);
		try{

			var objResponse = nlapiRequestURL(stUrl, params, null, null );
			nlapiLogExecution('DEBUG','callScheduleScript',objResponse.getBody());
		}catch(error){

			nlapiLogExecution('DEBUG','callScheduleScript',error.toString());
		}
			
		//CALL SCHEDULE SCRIPT
		var arrParam = [];
		arrParam['custscript_nsts_tex_trans_ids'] = jasonFormat;
		arrParam['custscript_nsts_tex_rec_type'] = Function.getTransactionRecodType(recordType);
		var status = nlapiScheduleScript('customscript_nsts_pdf_bulk_process_ss', null,arrParam);
		nlapiLogExecution('DEBUG', 'schedule script', status);	
		
	}else{
		nlapiSetRedirectURL('SUITELET', 'customscript_template_generate_pdf','customdeploy_template_generate_pdf', null, params);
	}
}


function getStoredJasonData(){
	if(!Function.isUndefinedNullOrEmpty(request.getParameter('custpage_ps_hiddenfield_length'))){
		var lengthTotal = request.getParameter('custpage_ps_hiddenfield_length');
		var jasonFormat = '';
		for(var i=1;i<=lengthTotal;i++){
			jasonFormat = jasonFormat.concat(request.getParameter('custpage_ps_hiddenfield_jason' + i));
		}
		return jasonFormat;
	}else{
		 return request.getParameter('custpage_ps_hiddenfield_jason');	
	}
}
