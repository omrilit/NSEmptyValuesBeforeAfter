/**
 * Module Description
 * 
 * Version    Date               Author                Remarks
 * 1.00       23 Oct 2014     mdeasis
 * 1.1         29 Jul 2015	  mdeasis		    Fixing subsidiary
 * 1.2         18 Dec 2015     fteves                Fixed Opportunity, SO and PO status to process
 */

{
	var CONFIG={
		title: 'Order to Cash Management',
		//Custom Fields
		fld_date_start: 'custfld_date_start',
		fld_date_end: 'custfld_date_end',
		fld_record_status: 'custfld_record_status',
		fld_record_subsidiary: 'custfld_record_subsidiary',
		fld_cb_quote: 'custfld_cb_quote',
		fld_cb_sales_order: 'custfld_cb_sales_order',
		fld_cb_item_fulfillment: 'custfld_cd_item_fulfillment',
		fld_cb_invoice: 'custfld_cb_invoice',
		fld_cb_payment: 'custfld_cd_payment',
		fld_adj_days_quote: 'custfld_day_quote',
		fld_adj_days_sales_order: 'custfld_day_sales_order',
		fld_adj_days_item_fulfillment: 'custfld_day_item_fulfillment',
		fld_adj_days_invoice: 'custfld_day_invoice',
		fld_adj_days_payment: 'custfld_day_payment',
		//Scripts
		script_client: 'customscript_order_cash_validator',
		ajax_server_id: 'customscript_rec_automation_ajax_server',
		ajax_deploy_id: 'customdeploy_rec_automation_ajax_server',
		o2c_suitelet: 'customscript_order_cash_management',
		o2c_deploy: 'customdeploy_order_cash_management',
		//Param Fields
		proceed_flag: 'custfld_proceed_flag',
		//Images
		icon_check: 11709,
		icon_loader: 11814,
		//Sublist
		fld_sublist_ops: 'custfld_sublist_op',
		fld_ship_method: 'trans_ship_method',
		fld_ship_id: 'trans_ship_id',
		fld_opp_rec: 'custfld_opp_rec',
		fld_so_rec: 'custfld_so_rec',
		fld_sublist_so: 'custfld_sublist_so',
	};

        //[Start] Kiko - 12/18/2015
        FLD_SPACE_1 = 'custpage_space_1';
	FLD_SPACE_2 = 'custpage_space_2';
	FLD_SPACE_3 = 'custpage_space_3';
	FLD_SPACE_4 = 'custpage_space_4';
	FLD_SPACE_5 = 'custpage_space_5';
	FLD_SPACE_6 = 'custpage_space_6';
        FLD_SPACE_7 = 'custpage_space_7';
	FLD_SPACE_8 = 'custpage_space_8';
        FLD_SPACE_9 = 'custpage_space_9';
	FLD_SPACE_10 = 'custpage_space_10';
        FLD_SPACE_11 = 'custpage_space_11';
	FLD_SPACE_12 = 'custpage_space_12';

        //Search - Opportunity  with Correct Status
        OPPORTUNITY_SEARCH = 'customsearch_fmt_opp_statuses';

        //Search - Sales Orders with Correct Status
        SALES_ORDERS_SEARCH = 'customsearch_fmt_so_statuses';
       //[End] Kiko - 12/18/2015
}

function automation_suitelet(request, response){
	var form=nlapiCreateForm(CONFIG.title, false);
	//URL-Passed Parameters via GET Form
	var op_date_start=request.getParameter(CONFIG.fld_date_start);
	var op_date_end=request.getParameter(CONFIG.fld_date_end);
	var op_status=request.getParameterValues(CONFIG.fld_record_status);
	var op_subsidiary=request.getParameterValues(CONFIG.fld_record_subsidiary);
	var cb_quote=request.getParameter(CONFIG.fld_cb_quote);
	var day_quote=request.getParameter(CONFIG.fld_adj_days_quote);
	var cb_sales_order=request.getParameter(CONFIG.fld_cb_sales_order);
	var day_sales_order=request.getParameter(CONFIG.fld_adj_days_sales_order);
	var cb_item_fmt=request.getParameter(CONFIG.fld_cb_item_fulfillment);
	var day_item_fmt=request.getParameter(CONFIG.fld_adj_days_item_fulfillment);
	var cb_invoice=request.getParameter(CONFIG.fld_cb_invoice);
	var day_invoice=request.getParameter(CONFIG.fld_adj_days_invoice);
	var cb_payment=request.getParameter(CONFIG.fld_cb_payment);
	var day_payment=request.getParameter(CONFIG.fld_adj_days_payment);
	//URL-Passed Parameters via Record Selection Form
	var proceed_flag=request.getParameter(CONFIG.proceed_flag);
	var base_rec_type=request.getParameter('base_rec');
	
	if (!isNullOrEmpty(proceed_flag)) {
		//**
		//Base Record: Opp
		//**
		if (isNullOrEmpty(base_rec_type) || base_rec_type=='opp') {
			//Label Note
			var lbl_note=form.addField('custfld_label_note', 'inlinehtml');
			//SUblist
			var sublist_update=form.addSubList('custfld_sublist_update', 'list', 'Affected records');
			sublist_update.addField('update_trans_status', 'text', 'Status');
			sublist_update.addField('update_trans_date', 'date', 'Date');
			sublist_update.addField('update_trans_entity', 'text', 'Customer');
			sublist_update.addField('update_trans_id', 'text', 'Opportunity');
			if (cb_quote=='T') {
				sublist_update.addField('update_trans_quote', 'text', 'Quote');
			}
			if (cb_sales_order=='T') {
				sublist_update.addField('update_trans_sales_order', 'text', 'Sales Order');
			}
			if (cb_item_fmt=='T') {
				sublist_update.addField('update_trans_item_fmt', 'text', 'Item Fulfillment');
			}
			if (cb_invoice=='T') {
				sublist_update.addField('update_trans_invoice', 'text', 'Invoice');
			}
			if (cb_payment=='T') {
				sublist_update.addField('update_trans_payment', 'text', 'Payment');
			}
			var selected_rec=getSelectedRecord(request, 'custfld_sublist_op');
			lbl_note.setDefaultValue('<p style="margin-top: 15px; font-size: 14px; text-align: right;">Total records: '+selected_rec.length+'</p>');
			sublist_update.setLineItemValues(selected_rec);
			form.addButton('custfld_commit_btn', 'Commit', "callAJAXServer("+array_stringify(selected_rec, 'record_id')+", '"+cb_quote+"', "+day_quote+", '"+
																			cb_sales_order+"', "+day_sales_order+", '"+
																			cb_item_fmt+"', "+day_item_fmt+", '"+
																			cb_invoice+"', "+day_invoice+", '"+
																			cb_payment+"', "+day_payment+", "+array_stringify(selected_rec, CONFIG.fld_ship_id)+");");
			form.addButton('custfld_home_btn', 'Back', "window.history.back();");
			form.setScript(CONFIG.ajax_server_id);
		}
		//**
		//Base Record: Opp
		//**
		
		//**
		//Base Record: Sales Order
		//**
		else {
			//Label Note
			var lbl_note=form.addField('custfld_label_note', 'inlinehtml');
			//Sublist
			var sublist_update=form.addSubList('custfld_sublist_update', 'list', 'Affected records');
			sublist_update.addField('update_trans_status', 'text', 'Status');
			sublist_update.addField('update_trans_date', 'date', 'Date');
			sublist_update.addField('update_trans_entity', 'text', 'Customer');
			sublist_update.addField('update_trans_id', 'text', 'Sales Order');
			if (cb_item_fmt=='T') {
				sublist_update.addField('update_trans_item_fmt', 'text', 'Item Fulfillment');
			}
			if (cb_invoice=='T') {
				sublist_update.addField('update_trans_invoice', 'text', 'Invoice');
			}
			if (cb_payment=='T') {
				sublist_update.addField('update_trans_payment', 'text', 'Payment');
			}
			var selected_rec=getSelectedRecord(request, CONFIG.fld_sublist_so);
			lbl_note.setDefaultValue('<p style="margin-top: 15px; font-size: 14px; text-align: right;">Total records: '+selected_rec.length+'</p>');
			sublist_update.setLineItemValues(selected_rec);
			form.addButton('custfld_commit_btn', 'Commit', "callSalesServer("+array_stringify(selected_rec, 'record_id')+"," +
					"'"+cb_item_fmt+"', "+day_item_fmt+", '"+cb_invoice+"', "+day_invoice+", '"+cb_payment+"', "+day_payment+", "+array_stringify(selected_rec, CONFIG.fld_ship_id)+");");
			form.addButton('custfld_home_btn', 'Back', 'window.history.back();');
			form.setScript(CONFIG.ajax_server_id);
		}
	}
	else if (!isNullOrEmpty(op_date_start) && !isNullOrEmpty(op_date_end) &&
		!isNullOrEmpty(op_status) /**&& !isNullOrEmpty(op_subsidiary)**/) {
		//**
		//Base Record: OPP
		//**
		if (isNullOrEmpty(base_rec_type) || base_rec_type=='opp') {
			//Record Selection FORM
			var op_list=getOpportunities(op_date_start, op_date_end, op_status, op_subsidiary);
			//Total records
			form.addField('custfld_total_rec', 'inlinehtml').setDefaultValue('<p style="font-size: 14px; text-align: right; margin-top: 15px;">Total records: '+(isNullOrEmpty(op_list)?0:op_list.length)+'</p>')
			//Sublist
			var op_sublist=form.addSubList(CONFIG.fld_sublist_ops, 'list', 'Opportunities');
			op_sublist.addMarkAllButtons();
			op_sublist.addField('trans_rec_select', 'checkbox', 'Select');
			op_sublist.addField('trans_id', 'text', 'Opportunity #');
			op_sublist.addField('trans_date', 'date', 'Date');
			op_sublist.addField('trans_entity', 'text', 'Customer');
			op_sublist.addField('trans_total', 'currency', 'Amount');
			op_sublist.addField('trans_status', 'text', 'Status');
			if (cb_sales_order=='T' || cb_invoice=='T' || cb_item_fmt=='T') {
				op_sublist.addField(CONFIG.fld_ship_method, 'text', 'Shipping Method');
				op_sublist.addField(CONFIG.fld_ship_id, 'integer').setDisplayType('hidden');
				op_list=automation_appendSelector(op_list, CONFIG.fld_ship_method);
			}
			op_sublist.addField('record_id', 'integer').setDisplayType('hidden');
			op_sublist.setLineItemValues(op_list);
			form.addSubmitButton('Apply');
			form.addButton('custfld_back_btn', 'Back', "window.history.back();");
			//URL Parameters to be passed
			form.addField(CONFIG.proceed_flag, 'text').setDisplayType('hidden').setDefaultValue('true');
			//Records Flags
			if (cb_quote=='T') {
				form.addField(CONFIG.fld_cb_quote, 'text').setDisplayType('hidden').setDefaultValue(cb_quote);
			}
			if (cb_sales_order=='T') {
				form.addField(CONFIG.fld_cb_sales_order, 'text').setDisplayType('hidden').setDefaultValue(cb_sales_order);
			}
			if (cb_item_fmt=='T') {
				form.addField(CONFIG.fld_cb_item_fulfillment, 'text').setDisplayType('hidden').setDefaultValue(cb_item_fmt);
			}
			if (cb_invoice=='T') {
				form.addField(CONFIG.fld_cb_invoice, 'text').setDisplayType('hidden').setDefaultValue(cb_invoice);
			}
			if (cb_payment=='T') {
				form.addField(CONFIG.fld_cb_payment, 'text').setDisplayType('hidden').setDefaultValue(cb_payment);
			}
			//Days Adjustment Flags
			if (day_quote) {
				form.addField(CONFIG.fld_adj_days_quote, 'integer').setDisplayType('hidden').setDefaultValue(day_quote);
			}
			if (day_sales_order) {
				form.addField(CONFIG.fld_adj_days_sales_order, 'integer').setDisplayType('hidden').setDefaultValue(day_sales_order);
			}
			if (day_item_fmt) {
				form.addField(CONFIG.fld_adj_days_item_fulfillment, 'integer').setDisplayType('hidden').setDefaultValue(day_item_fmt);
			}
			if (day_invoice) {
				form.addField(CONFIG.fld_adj_days_invoice, 'integer').setDisplayType('hidden').setDefaultValue(day_invoice);
			}
			if (day_payment) {
				form.addField(CONFIG.fld_adj_days_payment, 'integer').setDisplayType('hidden').setDefaultValue(day_payment);
			}
			form.setScript(CONFIG.script_client);
		}
		//**
		//Base Record: Opp
		//**
		
		//**
		//Base Record: Sales Order
		//**
		else {
			var so_list=getSalesOrders(op_date_start, op_date_end, op_status, op_subsidiary);
			form.addField('custfld_total_rec', 'inlinehtml').setDefaultValue('<p style="font-size: 14px; text-align: right; margin-top: 15px;">Total records: '+(isNullOrEmpty(so_list)?0:so_list.length)+'</p>');
			//Sublist
			var so_sublist=form.addSubList(CONFIG.fld_sublist_so, 'list', 'Sales Orders');
			so_sublist.addMarkAllButtons();
			so_sublist.addField('trans_rec_select', 'checkbox', 'Select');
			so_sublist.addField('trans_id', 'text', 'Sales Order #');
			so_sublist.addField('trans_date', 'date', 'Date');
			so_sublist.addField('trans_entity', 'text', 'Customer');
			so_sublist.addField('trans_total', 'currency', 'Amount');
			so_sublist.addField('trans_status', 'text', 'Status');
			if (cb_invoice=='T' || cb_item_fmt=='T') {
				so_sublist.addField(CONFIG.fld_ship_method, 'text', 'Shipping Method');
				so_sublist.addField(CONFIG.fld_ship_id, 'integer').setDisplayType('hidden');
				so_list=automation_appendSelector(so_list, CONFIG.fld_ship_method);
			}
			so_sublist.addField('record_id', 'integer').setDisplayType('hidden');
			so_sublist.setLineItemValues(so_list);
			form.addSubmitButton('Apply');
			form.addButton('custfld_back_btn', 'Back', "window.history.back();");
			//URL Parameters to be passed
			form.addField(CONFIG.proceed_flag, 'text').setDisplayType('hidden').setDefaultValue('true');
			//Records Flag
			if (cb_item_fmt=='T') {
				form.addField(CONFIG.fld_cb_item_fulfillment, 'text').setDisplayType('hidden').setDefaultValue(cb_item_fmt);
			}
			if (cb_invoice=='T') {
				form.addField(CONFIG.fld_cb_invoice, 'text').setDisplayType('hidden').setDefaultValue(cb_invoice);
			}
			if (cb_payment=='T') {
				form.addField(CONFIG.fld_cb_payment, 'text').setDisplayType('hidden').setDefaultValue(cb_payment);
			}
			//Days Adjustment Flags
			if (day_item_fmt) {
				form.addField(CONFIG.fld_adj_days_item_fulfillment, 'integer').setDisplayType('hidden').setDefaultValue(day_item_fmt);
			}
			if (day_invoice) {
				form.addField(CONFIG.fld_adj_days_invoice, 'integer').setDisplayType('hidden').setDefaultValue(day_invoice);
			}
			if (day_payment) {
				form.addField(CONFIG.fld_adj_days_payment, 'integer').setDisplayType('hidden').setDefaultValue(day_payment);
			}
			form.setScript(CONFIG.script_client);
		}
		//**
		//Base Record: Sales Order
		//**
		form.addField('base_rec', 'text').setDisplayType('hidden').setDefaultValue(base_rec_type);
	}
	else {
		//GET Form
		//Record Mode
		form.addField('custfld_base_rec_label', 'label', 'Base record');
		var cb_opp=form.addField(CONFIG.fld_opp_rec, 'checkbox', 'Opportunity');
		var cb_so=form.addField(CONFIG.fld_so_rec, 'checkbox', 'Sales Order');
		if (!isNullOrEmpty(base_rec_type) && base_rec_type=='so') {
			cb_so.setDefaultValue('T');
		}
		//Fields
		form.addField(CONFIG.fld_date_start, 'date', 'Start Date').setMandatory(true).setDefaultValue(nlapiDateToString(new Date()));
		form.addField(CONFIG.fld_date_end, 'date', 'End Date').setMandatory(true).setDefaultValue(nlapiDateToString(new Date()));
		var status_list=form.addField(CONFIG.fld_record_status, 'multiselect', 'Status').setMandatory(true);
		//**
		if (nlapiGetContext().getFeature('SUBSIDIARIES')) {
			form.addField(CONFIG.fld_record_subsidiary, 'multiselect', 'Subsidiary', 'subsidiary').setMandatory(true);
		}
		//**
		if (isNullOrEmpty(base_rec_type) || base_rec_type=='opp') {
			var op_status_list=nlapiCreateRecord('opportunity').getField('entitystatus').getSelectOptions();
			for (var i=0;op_status_list && i<op_status_list.length;i++) {
				status_list.addSelectOption(op_status_list[i].getId(), op_status_list[i].getText());
			}
			//status_list.addSelectOption('Opprtnty:A', 'In Progress', false);
			//status_list.addSelectOption('Opprtnty:B', 'Issued Estimate', false);
			//status_list.addSelectOption('Opprtnty:C', 'Closed - Won', false);
			cb_opp.setDefaultValue('T');
			form.addField(CONFIG.fld_cb_quote, 'checkbox', 'Quote').setBreakType('startcol').setMandatory(true);
			form.addField(CONFIG.fld_adj_days_quote, 'integer', 'Quote Date Adjustment').setMandatory(true).setDisplayType('disabled').setDefaultValue(0);
			form.addField(CONFIG.fld_cb_sales_order, 'checkbox', 'Sales Order').setMandatory(true);
			form.addField(CONFIG.fld_adj_days_sales_order, 'integer', 'Sales Order Date Adjustment').setMandatory(true).setDisplayType('disabled').setDefaultValue(0);
		}
		else {
			status_list.addSelectOption('SalesOrd:A', 'Pending Approval', false);
			status_list.addSelectOption('SalesOrd:B', 'Pending Fulfillment', false);
			status_list.addSelectOption('SalesOrd:D', 'Partially Fulfilled', false);
			status_list.addSelectOption('SalesOrd:E', 'Partially Billing/Partially Fulfilled', false);
			status_list.addSelectOption('SalesOrd:F', 'Pending Billing', false);
			status_list.addSelectOption('SalesOrd:G', 'Billed', false);
		}
		
		var itmf=form.addField(CONFIG.fld_cb_item_fulfillment, 'checkbox', 'Item Fulfillment').setMandatory(true);
		if (!nlapiGetContext().getFeature('SUBSIDIARIES') && base_rec_type=='so') {
			itmf.setBreakType('startcol');
		}
		form.addField(CONFIG.fld_adj_days_item_fulfillment, 'integer', 'Item Fulfillment').setMandatory(true).setDisplayType('disabled').setDefaultValue(0);
		form.addField(CONFIG.fld_cb_invoice, 'checkbox', 'Invoice').setMandatory(true);
		form.addField(CONFIG.fld_adj_days_invoice, 'integer', 'Invoice Date Adjusment').setMandatory(true).setDisplayType('disabled').setDefaultValue(0);
		form.addField(CONFIG.fld_cb_payment, 'checkbox', 'Payment').setMandatory(true);
		form.addField(CONFIG.fld_adj_days_payment, 'integer', 'Payment Date Adjustment').setMandatory(true).setDisplayType('disabled').setDefaultValue(0);

                //[Start] Kiko - 12/18/2015
                form.addField(FLD_SPACE_1, 'label', '');
	        form.addField(FLD_SPACE_2, 'label', '');
	        form.addField(FLD_SPACE_3, 'label', '');
	        form.addField(FLD_SPACE_4, 'label', '');
	        form.addField(FLD_SPACE_5, 'label', '');
	        form.addField(FLD_SPACE_6, 'label', '');
                form.addField(FLD_SPACE_7, 'label', '');
	        form.addField(FLD_SPACE_8, 'label', '');
                form.addField(FLD_SPACE_9, 'label', '');
	        form.addField(FLD_SPACE_10, 'label', '');
                form.addField(FLD_SPACE_11, 'label', '');
	        form.addField(FLD_SPACE_12, 'label', '');
                //[End] Kiko - 12/18/2015

		form.addSubmitButton('Submit');
		form.addResetButton('Reset');
		form.addField('base_rec', 'text').setDisplayType('hidden').setDefaultValue(base_rec_type);
		form.setScript(CONFIG.script_client);
	}
	response.writePage(form);
}

function getOpportunities(date_1, date_2, status, subsidiary) {
	nlapiLogExecution('DEBUG', 'Params', 'Start Date: '+date_1+'; End Date: '+date_2+'; Status: '+status+'; SUbsidiary: '+subsidiary);
	var col_id=new nlobjSearchColumn('tranid');
	col_id.setSort(true);

       //[Start] Kiko - 12/18/2015
        /*
	var filter=[['trandate', 'within', date_1, date_2], 'AND',
	                                                       [['status', 'anyof', status], 'OR', ['entitystatus', 'anyof', status]], 'AND',
	                                                       //[['status', 'anyof', splitArray(status)], 'OR', ['entitystatus', 'anyof', splitArray(status)]], 'AND', 
	                                                       //['subsidiary', 'anyof', splitArray(subsidiary)], 'AND',
	                                                       ['mainline', 'is', 'T']];
        */
        var filter=[['trandate', 'within', date_1, date_2], 'AND', [['status', 'anyof', status], 'OR', ['entitystatus', 'anyof', status]]];
        //[End] Kiko - 12/18/2015

	if (!isNullOrEmpty(subsidiary)) {
		filter.push('AND');
		filter.push(['subsidiary', 'anyof', subsidiary]);
	}

        //[Start] Kiko - 12/18/2015
        /*
	var result_set=nlapiSearchRecord('transaction', null, filter,
	                                                       [col_id, new nlobjSearchColumn('trandate'),
	                                                        new nlobjSearchColumn('entity'), new nlobjSearchColumn('status'),
	                                                        new nlobjSearchColumn('total')]);
        */
        var result_set=nlapiSearchRecord('transaction', OPPORTUNITY_SEARCH, filter,
	                                                       [col_id, new nlobjSearchColumn('trandate'),
	                                                        new nlobjSearchColumn('entity'), new nlobjSearchColumn('status'),
	                                                        new nlobjSearchColumn('total')]);
        //[End] Kiko - 12/18/2015

	if (isNullOrEmpty(result_set)) {
		return null;
	}
	else {
		var result_arr=new Array();
		for (var i=0; result_set && i<result_set.length;i++) {
			var result_item=new Array();
			result_item['record_id']=result_set[i].getId();
			result_item['trans_id']='<a target="_blank" href="'+nlapiResolveURL('RECORD', 'opportunity', result_item['record_id'])+'">'+result_set[i].getValue('tranid')+'</a>';
			result_item['trans_date']=result_set[i].getValue('trandate');
			result_item['trans_entity']='<a target="_blank" href="'+nlapiResolveURL('RECORD', 'customer', result_set[i].getValue('entity'))+'">'+result_set[i].getText('entity')+'</a>';
			result_item['trans_status']=result_set[i].getText('status');
			result_item['trans_total']=result_set[i].getValue('total');
			result_arr.push(result_item);
		}
		return result_arr;
	}
}

function getSalesOrders(date_1, date_2, status, subsidiary) {
	nlapiLogExecution('DEBUG', 'Params', 'Start Date: '+date_1+'; End Date: '+date_2+'; Status: '+status+'; SUbsidiary: '+subsidiary);
	var col_id=new nlobjSearchColumn('tranid');
	col_id.setSort(true);

        //[Start] Kiko - 12/18/2015
        /*
	var filter=[new nlobjSearchFilter('trandate', null, 'within', date_1, date_2),
	                                                      new nlobjSearchFilter('status', null, 'anyof', status), 
	                                                      //new nlobjSearchFilter('status', null, 'anyof', splitArray(status)),
	                                                       //new nlobjSearchFilter('subsidiary', null, 'anyof', splitArray(subsidiary)),
	                                                       new nlobjSearchFilter('mainline', null, 'is', 'T')];
        */
        var filter=[new nlobjSearchFilter('trandate', null, 'within', date_1, date_2), new nlobjSearchFilter('status', null, 'anyof', status)];
        //[End] Kiko - 12/18/2015

	if (!isNullOrEmpty(subsidiary)) {
		filter.push(new nlobjSearchFilter('subsidiary', null, 'anyof', subsidiary));
	}

        //[Start] Kiko - 12/18/2015
        /*
	var result_set=nlapiSearchRecord('salesorder', null, filter,
	                                                       [col_id, new nlobjSearchColumn('trandate'),
	                                                        new nlobjSearchColumn('entity'), new nlobjSearchColumn('status'),
	                                                        new nlobjSearchColumn('total')]);
        */
        var result_set=nlapiSearchRecord('transaction', SALES_ORDERS_SEARCH, filter,
	                                                       [col_id, new nlobjSearchColumn('trandate'),
	                                                        new nlobjSearchColumn('entity'), new nlobjSearchColumn('status'),
	                                                        new nlobjSearchColumn('total')]);
        //[End] Kiko - 12/18/2015

	if (isNullOrEmpty(result_set)) {
		return null;
	}
	else {
		var result_arr=new Array();
		for (var i=0; result_set && i<result_set.length;i++) {
			var result_item=new Array();
			result_item['record_id']=result_set[i].getId();
			result_item['trans_id']='<a target="_blank" href="'+nlapiResolveURL('RECORD', 'salesorder', result_item['record_id'])+'">'+result_set[i].getValue('tranid')+'</a>';
			result_item['trans_date']=result_set[i].getValue('trandate');
			result_item['trans_entity']='<a target="_blank" href="'+nlapiResolveURL('RECORD', 'customer', result_set[i].getValue('entity'))+'">'+result_set[i].getText('entity')+'</a>';
			result_item['trans_status']=result_set[i].getText('status');
			result_item['trans_total']=result_set[i].getValue('total');
			result_arr.push(result_item);
		}
		return result_arr;
	}
}

function getSelectedRecord(request, trans_sublist) {
	var selected_rec=new Array(), ctr=0;
	for (var i=1;i<=request.getLineItemCount(trans_sublist); i++) {
		if (request.getLineItemValue(trans_sublist, 'trans_rec_select', i)=='T') {
			var select_item=new Array();
			select_item['record_id']=request.getLineItemValue(trans_sublist, 'record_id', i);
			select_item['update_trans_id']=request.getLineItemValue(trans_sublist, 'trans_id', i);
			select_item['update_trans_date']=request.getLineItemValue(trans_sublist, 'trans_date', i);
			select_item['update_trans_entity']=request.getLineItemValue(trans_sublist, 'trans_entity', i);
			select_item[CONFIG.fld_ship_id]=request.getLineItemValue(trans_sublist, CONFIG.fld_ship_id, i);
			//Generated Fields
			select_item['update_trans_status']='<span id="tran_status_'+ctr+'">Not started</span>';
			select_item['update_trans_quote']='<span id="tran_quote_link_'+ctr+'">---</span>';
			select_item['update_trans_sales_order']='<span id="tran_sales_order_link_'+ctr+'">---</span>';
			select_item['update_trans_item_fmt']='<span id="tran_item_fmt_link_'+ctr+'">---</span>';
			select_item['update_trans_invoice']='<span id="tran_invoice_link_'+ctr+'">---</span>';
			select_item['update_trans_payment']='<span id="tran_payment_link_'+ctr+'">---</span>';
			selected_rec.push(select_item);
			ctr++;
		}
	}
	return selected_rec;
}

function array_stringify(data_arr, data_id) {
	var data_str='';
	for (var i=0;data_arr && i<data_arr.length;i++) {
		if (data_arr[i][data_id]=='') {
			data_str+='null,';
		}
		else {
			data_str+=data_arr[i][data_id]+',';
		}
	}
	data_str=data_str.substring(0, data_str.length-1);
	return '['+data_str+']';
}

function isNullOrEmpty(data) {
	return (data==null||data=='');
}

function splitArray(arr_data) {
	if (!arr_data||((arr_data instanceof Array) && (arr_data.length==0)))
		return '';
	else if (arr_data.length==1) {
		return arr_data;
	}
	else {
		return arr_data.split(String.fromCharCode(5));
	}
}

function createQuoteByOppID(op_id, date_adj) {
	if (op_id) {
		var quote_rec=nlapiTransformRecord('opportunity', op_id, 'estimate');
		var date_delta=adjustDateByDay(new Date(nlapiLookupField('opportunity', op_id, 'trandate')), date_adj);
		quote_rec.setFieldValue('trandate', date_delta);
		var quote_trans=quote_rec.getFieldValue('tranid');
		if ((quote_rec=nlapiSubmitRecord(quote_rec, true, true))) {
			return {
				id: quote_rec,
				link: '<a target="_blank" href="'+nlapiResolveURL('RECORD', 'estimate', quote_rec)+'">'+quote_trans+'</a>'
			};
		}
	}
	return null;
}

function getExistingQuoteByOppID(op_id) {
	if (isNullOrEmpty(op_id)) {
		return null;
	}
	var result_set=nlapiSearchRecord('estimate', null, [new nlobjSearchFilter('opportunity', null, 'is', op_id), new nlobjSearchFilter('mainline', null, 'is', 'T')],
	                                                    [new nlobjSearchColumn('tranid'), new nlobjSearchColumn('trandate')]);
	if (isNullOrEmpty(result_set)) {
		return null;
	}
	else {
		return {
			id: result_set[0].getId(),
			tran_id: result_set[0].getValue('tranid'),
			date: result_set[0].getValue('trandate'),
			link: '<a target="_blank" href="'+nlapiResolveURL('RECORD', 'estimate', result_set[0].getId())+'">'+result_set[0].getValue('tranid')+'</a>'
		};
	}
}

function createSalesOrderByOppID(op_id, date_adj) {
	if (op_id) {
		var est_id=getExistingQuoteByOppID(op_id);
		if (isNullOrEmpty(est_id)) {
			est_id=createQuoteByOppID(op_id, date_adj);
		}
		var so_rec=nlapiTransformRecord('estimate', est_id.id, 'salesorder');
		var date_delta=adjustDateByDay(new Date(nlapiLookupField('opportunity', op_id, 'trandate')), date_adj);
		so_rec.setFieldValue('trandate', date_delta);
		var so_trans=so_rec.getFieldValue('tranid');
		if ((so_rec=nlapiSubmitRecord(so_rec, true, true))) {
			return {
				id: so_rec,
				link: '<a target="_blank" href="'+nlapiResolveURL('RECORD', 'salesorder', so_rec)+'">'+so_trans+'</a>'
			};
		}
	}
	return null;
}

function getExistingSOByOppID(op_id) {
	if (isNullOrEmpty(op_id)) {
		return null;
	}
	var result_set=nlapiSearchRecord('salesorder', null, [new nlobjSearchFilter('opportunity', null, 'is', op_id),
	                                                      new nlobjSearchFilter('mainline', null, 'is', 'T')],
	                                                      [new nlobjSearchColumn('tranid'), new nlobjSearchColumn('trandate')]);
	if (isNullOrEmpty(result_set)) {
		return null;
	}
	else {
		return {
			id: result_set[0].getId(),
			tran_id: result_set[0].getValue('tranid'),
			date: result_set[0].getValue('trandate'),
			link: '<a target="_blank" href="'+nlapiResolveURL('RECORD', 'salesorder', result_set[0].getId())+'">'+result_set[0].getValue('tranid')+'</a>'
		};
	}
}

function createItemFulfillmentBySOID(so_id, date_adj) {
	if (so_id) {
		var item_rec=nlapiTransformRecord('salesorder', so_id, 'itemfulfillment');
		var date_delta=adjustDateByDay(new Date(nlapiLookupField('salesorder', so_id, 'trandate')), date_adj);
		item_rec.setFieldValue('trandate', date_delta);
		var item_trans=item_rec.getFieldValue('tranid');
		if ((item_rec=nlapiSubmitRecord(item_rec, true, true))) {
			return {
				id: item_rec,
				link: '<a target="_blank" href="'+nlapiResolveURL('RECORD', 'itemfulfillment',item_rec)+'">'+item_trans+'</a>'
			};
		}
	}
	return null;
}

function getExistingItemFulfillmentBySOID(so_id, date_adj) {
	if (isNullOrEmpty(so_id)) {
		return null;
	}
	var result_set=nlapiSearchRecord('itemfulfillment', null, [new nlobjSearchFilter('createdfrom', null, 'anyof', so_id),
	                                                           new nlobjSearchFilter('mainline', null, 'is', 'T')],
	                                                           [new nlobjSearchColumn('tranid'), new nlobjSearchColumn('trandate')]);
	if (isNullOrEmpty(result_set)) {
		return null;
	}
	else {
		return {
			id: result_set[0].getId(),
			tran_id: result_set[0].getValue('tranid'),
			tran_date: result_set[0].getValue('trandate'),
			link: '<a target="_blank" href="'+nlapiResolveURL('RECORD', 'itemfulfillment', result_set[0].getId())+'">'+result_set[0].getValue('tranid')+'</a>'
		};
	}
}

function createInvoiceBySOID(so_id, date_adj) {
	if (so_id) {
		var invoice_rec=nlapiTransformRecord('salesorder', so_id, 'invoice');
		var date_delta=adjustDateByDay(new Date(nlapiLookupField('salesorder', so_id, 'trandate')), date_adj);
		invoice_rec.setFieldValue('trandate', date_delta);
		var invoice_trans=invoice_rec.getFieldValue('tranid');
		if ((invoice_rec=nlapiSubmitRecord(invoice_rec, true, true))) {
			return {
				id: invoice_rec,
				link: '<a target="_blank" href="'+nlapiResolveURL('RECORD', 'invoice', invoice_rec)+'">'+invoice_trans+'</a>'
			};
		}
	}
	return null;
}

function getExistingInvoiceByOppID(op_id) {
	if (isNullOrEmpty(op_id)) {
		return null;
	}
	var result_set=nlapiSearchRecord('invoice', null, [['createdfrom', 'is', op_id], 'OR', ['opportunity', 'is', op_id],
	                                                   'AND', ['recordtype', 'is', 'invoice']],
													  [new nlobjSearchColumn('tranid'), new nlobjSearchColumn('trandate')]);
	if (isNullOrEmpty(result_set)) {
		return null;
	}
	else {
		return {
			id: result_set[0].getId(),
			tran_id: result_set[0].getValue('tranid'),
			date: result_set[0].getValue('trandate'),
			link: '<a target="_blank" href="'+nlapiResolveURL('RECORD', 'invoice', result_set[0].getId())+'">'+result_set[0].getValue('tranid')+'</a>'
		};
	}
}

function createPaymentByInvoiceID(invoice_id, date_adj) {
	if (invoice_id) {
		var payment_rec=nlapiTransformRecord('invoice', invoice_id, 'customerpayment');
		var date_delta=adjustDateByDay(new Date(nlapiLookupField('invoice', invoice_id, 'trandate')), date_adj);
		payment_rec.setFieldValue('trandate', date_delta);
		var payment_trans=payment_rec.getFieldValue('tranid');
		if ((payment_rec=nlapiSubmitRecord(payment_rec, true, true))) {
			return {
				id: payment_rec,
				link: '<a target="_blank" href="'+nlapiResolveURL('RECORD', 'customerpayment', payment_rec)+'">'+payment_trans+'</a>'
			};
		}
	}
	return null;
}

function getExistingPaymentByInvoiceID(invoice_id) {
	if (isNullOrEmpty(invoice_id)) {
		return null;
	}
	var result_set=nlapiSearchRecord('customerpayment', null, [new nlobjSearchFilter('internalid', 'appliedtotransaction', 'anyof', invoice_id)],
	                                                           [new nlobjSearchColumn('trandate'), new nlobjSearchColumn('tranid')]);
	if (isNullOrEmpty(result_set)) {
		return null;
	}
	else {
		return {
			id: result_set[0].getId(),
			tran_id: result_set[0].getValue('tranid'),
			date: result_set[0].getValue('trandate'),
			link: '<a target="_blank" href="'+nlapiResolveURL('RECORD', 'customerpayment', result_set[0].getId())+'">'+result_set[0].getValue('tranid')+'</a>'
		};
	}
}

function adjustDateByDay(date_raw, num_days) {
	var date_month=date_raw.getMonth();
	var date_day=date_raw.getDate();
	var date_year=date_raw.getFullYear();
	for (var i=0;i<num_days;i++) {
		switch (date_month) {
	    	case 0://Jan
	    	case 2://Mar
	    	case 4://May
	    	case 6://Jul
	    	case 7://Aug
	    	case 9://Oct
	    	case 11://Dec
	    		if (date_day==31) {
	    			date_day=1;
	    			if (date_month<11) {
	    				date_month++;
	    			}
	    			else {
	    				date_month=0;
	    				date_year++;
	    			}
	    		}
	    		else {
	    			date_day++;
	    		}
	    		break;
		    //Feb
	    	case 1: 
	    		if ((date_day==28 && date_year%4!=0) || (date_day==29 && date_year%4==0)) {
	    			date_day=1;
	    			date_month++;
	    		}
	    		else {
	    			date_day++;
	    		}
	    		break;
	    	//The rest of the months
	    	default:
	    		if (date_day==30) {
	    			date_month++;
	    			date_day=1;
	    		}
	    		else {
	    			date_day++;
	    		}
		    	break;
		}
	}
	return (date_month+1)+'/'+date_day+'/'+date_year;
}

function automation_validateField(type, name, line) {
	if (name==CONFIG.fld_cb_quote) {
		if (nlapiGetFieldValue(name)=='T') {
			document.getElementById('custfld_day_quote_formattedValue').removeAttribute('disabled');
		}
		else {
			document.getElementById('custfld_day_quote_formattedValue').setAttribute('disabled', 'disabled');
		}
	}
	else if (name==CONFIG.fld_cb_sales_order) {
		if (nlapiGetFieldValue(name)=='T') {
			document.getElementById('custfld_day_sales_order_formattedValue').removeAttribute('disabled');
		}
		else {
			document.getElementById('custfld_day_sales_order_formattedValue').setAttribute('disabled', 'disabled');
		}
	}
	else if (name==CONFIG.fld_cb_item_fulfillment) {
		if (nlapiGetFieldValue(name)=='T') {
			document.getElementById('custfld_day_item_fulfillment_formattedValue').removeAttribute('disabled');
		}
		else {
			document.getElementById('custfld_day_item_fulfillment_formattedValue').setAttribute('disabled', 'disabled');
		}
	}
	else if (name==CONFIG.fld_cb_invoice) {
		if (nlapiGetFieldValue(name)=='T') {
			document.getElementById('custfld_day_invoice_formattedValue').removeAttribute('disabled');
		}
		else {
			document.getElementById('custfld_day_invoice_formattedValue').setAttribute('disabled', 'disabled');
		}
	}
	else if (name==CONFIG.fld_cb_payment) {
		if (nlapiGetFieldValue(name)=='T') {
			document.getElementById('custfld_day_payment_formattedValue').removeAttribute('disabled');
		}
		else {
			document.getElementById('custfld_day_payment_formattedValue').setAttribute('disabled', 'disabled');
		}
	}
	//**
	//Shipping Method Selector
	//**
	else if (type==CONFIG.fld_sublist_ops || type==CONFIG.fld_sublist_so) {
		var ship_method=document.getElementById(CONFIG.fld_ship_method+'_'+line);
		if (!isNullOrEmpty(ship_method)) {
			//Select Checkbox
			if (name=='trans_rec_select') {
				if (nlapiGetCurrentLineItemValue(type, name)=='T') {
					if (type==CONFIG.fld_sublist_ops) {
						sourceOutShipping(type, name, ship_method);
					}
					else {
						salesOutShipping(type, name, ship_method);
					}
					ship_method.onchange=function() {
						nlapiSetLineItemValue(type, CONFIG.fld_ship_id, line, ship_method.value);
					};
				}
				else {
					ship_method.value='';
					ship_method.setAttribute('disabled', 'disabled');
					nlapiSetCurrentLineItemValue(type, CONFIG.fld_ship_id, null);
				}
			}
		}
	}
	//**
	//Base Record Selector
	//**
	else if (name==CONFIG.fld_opp_rec && nlapiGetFieldValue(name)=='T') {
		nlapiSetFieldValue(CONFIG.fld_so_rec, 'F');
		window.location.href=nlapiResolveURL('SUITELET', CONFIG.o2c_suitelet, CONFIG.o2c_deploy)+'&base_rec=opp';
	}
	else if (name==CONFIG.fld_so_rec && nlapiGetFieldValue(name)=='T') {
		nlapiSetFieldValue(CONFIG.fld_opp_rec, 'F');
		window.location.href=nlapiResolveURL('SUITELET', CONFIG.o2c_suitelet, CONFIG.o2c_deploy)+'&base_rec=so';
	}
	return true;
}

function sourceOutShipping(type, name, selector) {
	if (isNullOrEmpty(nlapiGetCurrentLineItemValue(type, name))) {
		return;
	}
	else {
		var ship_method_ajax=null;
		if (window.XMLHttpRequest) {
			ship_method_ajax=new XMLHttpRequest();
		}
		else {
			ship_method_ajax=new ActiveXObject('Microsoft.XMLHTTP');
		}
		ship_method_ajax.open('POST', nlapiResolveURL('SUITELET', CONFIG.ajax_server_id, CONFIG.ajax_deploy_id)+
									  '&ship_m='+nlapiGetCurrentLineItemValue(type, 'record_id'), true);
		ship_method_ajax.send();
		ship_method_ajax.onreadystatechange=function() {
			if (ship_method_ajax.readyState==4 && ship_method_ajax.status==200) {
				var data_json=JSON.parse(ship_method_ajax.responseText);
				var opts='<option></option>';
				for (var i=0;data_json && i<data_json['id'].length;i++) {
					opts+='<option value="'+data_json['id'][i]+'">'+data_json['text'][i]+'</option>';
				}
				selector.innerHTML=opts;
				selector.removeAttribute('disabled');
				ship_method_ajax.abort();
			}
		};
	}
	return;
}

function salesOutShipping(type, name, selector) {
	if (isNullOrEmpty(nlapiGetCurrentLineItemValue(type, name))) {
		return;
	}
	else {
		var ship_method_ajax=null;
		if (window.XMLHttpRequest) {
			ship_method_ajax=new XMLHttpRequest();
		}
		else {
			ship_method_ajax=new ActiveXObject('Microsoft.XMLHTTP');
		}
		ship_method_ajax.open('POST', nlapiResolveURL('SUITELET', CONFIG.ajax_server_id, CONFIG.ajax_deploy_id)+
									  '&s_ship='+nlapiGetCurrentLineItemValue(type, 'record_id'), true);
		ship_method_ajax.send();
		ship_method_ajax.onreadystatechange=function() {
			if (ship_method_ajax.readyState==4 && ship_method_ajax.status==200) {
				var data_json=JSON.parse(ship_method_ajax.responseText);
				var opts='<option></option>';
				for (var i=0;data_json && i<data_json['id'].length;i++) {
					opts+='<option value="'+data_json['id'][i]+'">'+data_json['text'][i]+'</option>';
				}
				selector.innerHTML=opts;
				selector.removeAttribute('disabled');
				ship_method_ajax.abort();
			}
		};
	}
	return;
}

function automation_saveRecord() {
	var cb_quote=nlapiGetFieldValue(CONFIG.fld_cb_quote);
	var cb_sales_order=nlapiGetFieldValue(CONFIG.fld_cb_sales_order);
	var cb_item_fulfillment=nlapiGetFieldValue(CONFIG.fld_cb_item_fulfillment);
	var cb_invoice=nlapiGetFieldValue(CONFIG.fld_cb_invoice);
	var cb_payment=nlapiGetFieldValue(CONFIG.fld_cb_payment);
	//Base Record
	var cb_opp=nlapiGetFieldValue(CONFIG.fld_opp_rec);
	var cb_so=nlapiGetFieldValue(CONFIG.fld_so_rec);
	
	console.log(!isNullOrEmpty(cb_opp)+' '+!isNullOrEmpty(cb_so));
	console.log(cb_opp+' '+cb_so);
	
	if (!isNullOrEmpty(cb_quote) && !isNullOrEmpty(cb_sales_order) && !isNullOrEmpty(cb_item_fulfillment) &&
		!isNullOrEmpty(cb_invoice) && !isNullOrEmpty(cb_payment)) {
		if (cb_quote=='F' && cb_sales_order=='F' && cb_item_fulfillment=='F' &&
			cb_invoice=='F' && cb_payment=='F') {
			alert('Select at least one record to automate.');
			return false;
		}
	}
	else if (!isNullOrEmpty(cb_item_fulfillment) && !isNullOrEmpty(cb_invoice) && !isNullOrEmpty(cb_payment)) {
		if (cb_item_fulfillment=='F' && cb_invoice=='F' && cb_payment=='F') {
			alert('Select at least one record to automate.');
			return false;
		}
	}
	//Base record checker
	if (!isNullOrEmpty(cb_opp) && !isNullOrEmpty(cb_so)) {
		if (cb_opp=='F' && cb_so=='F') {
			alert('Select base record.');
			return false;
		}
	}
 	return true;
}

function automation_appendSelector(list_arr, list_id) {
	if (list_arr==null || isNullOrEmpty(list_id)) {
		return list_arr;
	}
	var tmp_list=list_arr.slice(0);
	for (var i=0; list_arr && i<list_arr.length;i++) {
		tmp_list[i][list_id]='<select disabled style="min-width: 120px;" name="'+list_id+'_'+(i+1)+'" id="'+list_id+'_'+(i+1)+'"></select>';
	}
	return tmp_list;
}