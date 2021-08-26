/**
 * Module Description
 * 
 * Version    Date                Author               Remarks
 * 1.00       21 Oct 2014      mdeasis
 * 1.1	 29 Jul 2015	   mdeasis
 * 1.2         18 Dec 2015     fteves                Fixed Opportunity, SO and PO status to process
 */
{
	var CONFIG={
		title: 'Procure to Pay Management',
		//Fields
		date_start: 'custfld_date_start',
		date_end: 'custfld_date_end',
		po_sublist: 'custfld_po_sublist',
		update_sublist: 'custfld_update_sublist',
		sublist_flag: 'custfld_sublist_flag',
		ir_date_adj: 'custfld_ir_date_adj',
		vb_date_adj: 'custfld_vb_date_adj',
		vp_date_adj: 'custfld_vp_date_adj',
		subsidiary: 'custfld_subsidiary',
		ir_check: 'custfld_ir_check',
		vb_check: 'custfld_vb_check',
		vp_check: 'custfld_vp_check',
		record_status: 'custfld_rec_status', 
		//Suitelet
		suitelet_id: 'customscript_trans_creation_automation',
		suitelet_deployment: 'customdeploy_trans_creation_automation',
		validator: 'customscript_po_rec_validator',
		ajax_server_id: 'customscript_rec_automation_ajax_server',
	};

        //[Start] Kiko - 12/18/2015
        //Search - Purchase Order Status
        PURCHASE_ORDER_SEARCH = 'customsearch_fmt_po_statuses';

        FLD_SPACE_1 = 'custpage_space_1';
        FLD_SPACE_2 = 'custpage_space_2';
        FLD_SPACE_3 = 'custpage_space_3';
        FLD_SPACE_4 = 'custpage_space_4';
        FLD_SPACE_5 = 'custpage_space_5';
        FLD_SPACE_6 = 'custpage_space_6';
        //[End] Kiko - 12/18/2015
}

function automation_suitelet(request, response){
	var form=nlapiCreateForm(CONFIG.title, false);
	//Parameters
	var date_start=request.getParameter(CONFIG.date_start);
	var date_end=request.getParameter(CONFIG.date_end);
	var sublist_flag=request.getParameter(CONFIG.sublist_flag);
	var subsidiary=request.getParameterValues(CONFIG.subsidiary);
	var po_status=request.getParameterValues(CONFIG.record_status);
	//Date Adjustments
	var ir_date=request.getParameter(CONFIG.ir_date_adj);
	var vb_date=request.getParameter(CONFIG.vb_date_adj);
	var vp_date=request.getParameter(CONFIG.vp_date_adj);
	//Records Checkbox
	var ir_cb=request.getParameter(CONFIG.ir_check);
	var vb_cb=request.getParameter(CONFIG.vb_check);
	var vp_cb=request.getParameter(CONFIG.vp_check);
	//
	if (!isNullOrEmpty(sublist_flag)) {
		var rec_list=getSelectedRecord(request, CONFIG.po_sublist, 'trans_update_rec', 'id', 'trans_id', 'trans_date', 'trans_entity');
		//Label Note
		var lbl_note=form.addField('custfld_label_note', 'inlinehtml');
		lbl_note.setDefaultValue('<p style="margin-top: 15px; font-size: 14px; text-align: right;">Total records: '+(isNullOrEmpty(rec_list)?0:rec_list.length)+'</p>');
		//Sublist
		var updated_list=form.addSubList(CONFIG.update_sublist, 'list', 'Affected records');
		updated_list.addField('update_status', 'text', 'Status');
		updated_list.addField('update_date', 'date', 'Date');
		updated_list.addField('update_vendor', 'text', 'Vendor');
		updated_list.addField('update_po', 'text', 'Purchase Order');
		if (ir_cb=='T') {
			updated_list.addField('update_ir', 'text', 'Item Receipt');
		}
		if (vb_cb=='T') {
			updated_list.addField('update_vb', 'text', 'Vendor Bill');
		}
		if (vp_cb=='T') {
			updated_list.addField('update_vp', 'text', 'Vendor Payment');
		}
		updated_list.setLineItemValues(rec_list);
		form.addButton("custfld_commit_btn", "Commit", "callP2P_AJAXServer("+array_stringify(rec_list)+", '"+ir_cb+"', "+ir_date+", '"+vb_cb+"', "+vb_date+", '"+vp_cb+"', "+vp_date+");");
		form.addButton("custfld_home_btn", "Back", "window.history.back();");
		form.setScript(CONFIG.ajax_server_id);
	}
	else if (isNullOrEmpty(date_start)&&isNullOrEmpty(date_end)&&isNullOrEmpty(sublist_flag)) {
		form.addField(CONFIG.date_start, 'date', 'Start Date').setMandatory(true).setDefaultValue(nlapiDateToString(new Date()));
		form.addField(CONFIG.date_end, 'date', 'End Date').setMandatory(true).setDefaultValue(nlapiDateToString(new Date()));
/*
		form.addField(CONFIG.ir_check, 'checkbox', 'Item Receipt');
		form.addField(CONFIG.ir_date_adj, 'integer', 'Item Receipt Date Adjustment').setMandatory(true).setDisplayType('disabled').setDefaultValue('0');
		form.addField(CONFIG.vb_check, 'checkbox', 'Vendor Bill');
		form.addField(CONFIG.vb_date_adj, 'integer', 'Vendor Bill Date Adjustment').setMandatory(true).setDisplayType('disabled').setDefaultValue('0');
		form.addField(CONFIG.vp_check, 'checkbox', 'Vendor Payment');
		form.addField(CONFIG.vp_date_adj, 'integer', 'Vendor Payment Date Adjustment').setMandatory(true).setDisplayType('disabled').setDefaultValue('0');

                var status_list=form.addField(CONFIG.record_status, 'multiselect', 'Status', null).setBreakType('startcol').setMandatory(true);
		status_list.addSelectOption('PurchOrd:B', 'Pending Receipt', false);
		status_list.addSelectOption('PurchOrd:F', 'Pending Bill', false);
		status_list.addSelectOption('PurchOrd:G', 'Fully Billed', false);
		if (nlapiGetContext().getFeature('SUBSIDIARIES')) {
			form.addField(CONFIG.subsidiary, 'multiselect', 'Subsidiary', 'subsidiary').setMandatory(true);
		}
*/     

                var status_list=form.addField(CONFIG.record_status, 'multiselect', 'Status', null).setMandatory(true);
		status_list.addSelectOption('PurchOrd:B', 'Pending Receipt', false);
		status_list.addSelectOption('PurchOrd:F', 'Pending Bill', false);
		status_list.addSelectOption('PurchOrd:G', 'Fully Billed', false);
		if (nlapiGetContext().getFeature('SUBSIDIARIES')) {
			form.addField(CONFIG.subsidiary, 'multiselect', 'Subsidiary', 'subsidiary').setMandatory(true);
		}               

                form.addField(CONFIG.ir_check, 'checkbox', 'Item Receipt');
		form.addField(CONFIG.ir_date_adj, 'integer', 'Item Receipt Date Adjustment').setMandatory(true).setDisplayType('disabled').setDefaultValue('0');
		form.addField(CONFIG.vb_check, 'checkbox', 'Vendor Bill');
		form.addField(CONFIG.vb_date_adj, 'integer', 'Vendor Bill Date Adjustment').setMandatory(true).setDisplayType('disabled').setDefaultValue('0');
		form.addField(CONFIG.vp_check, 'checkbox', 'Vendor Payment');
		form.addField(CONFIG.vp_date_adj, 'integer', 'Vendor Payment Date Adjustment').setMandatory(true).setDisplayType('disabled').setDefaultValue('0');

		var fldSpace_1 = form.addField(FLD_SPACE_1, 'label', '');
                var fldSpace_2 = form.addField(FLD_SPACE_2, 'label', '');
                var fldSpace_3 = form.addField(FLD_SPACE_3, 'label', '');
                var fldSpace_4 = form.addField(FLD_SPACE_4, 'label', '');
                var fldSpace_5 = form.addField(FLD_SPACE_5, 'label', '');
                var fldSpace_6 = form.addField(FLD_SPACE_6, 'label', '');

		//form.addField('dummy_1', 'inlinehtml', '', null, rec_grp).setDefaultValue('');
		//form.addField('dummy_2', 'inlinehtml', '', null, rec_grp).setDefaultValue('');
		form.addSubmitButton('Submit');
		form.addResetButton('Reset');
		form.setScript(CONFIG.validator);
	}
	else if (isNullOrEmpty(sublist_flag)) {
		var sublist=form.addSubList(CONFIG.po_sublist, 'list', 'Purchase Orders');
		sublist.addMarkAllButtons();
		var po_recs=getPOByDate(date_start, date_end, subsidiary, po_status);
		form.addField('custfld_total', 'inlinehtml').setDefaultValue('<p style="font-size: 14px; margin-top: 15px; text-align: right;">Total records: '+(isNullOrEmpty(po_recs)?0:po_recs.length)+'</p>');
		sublist.addField('trans_update_rec', 'checkbox', 'Select');
		sublist.addField('trans_id', 'text', 'PO #');
		sublist.addField('trans_date', 'date', 'Date');
		sublist.addField('trans_entity', 'text', 'Vendor');
		sublist.addField('trans_amount', 'currency', 'Amount');
		sublist.addField('trans_status', 'text', 'Status');
		sublist.addField('id', 'text').setDisplayType('hidden');
		sublist.setLineItemValues(po_recs);
		form.addSubmitButton('Apply');
		form.addButton("custfld_back_btn", "Back", 'window.history.back();');
		form.addField(CONFIG.sublist_flag, 'text').setDisplayType('hidden').setDefaultValue('true');
		//Date Adjustment Parameters
		if (ir_date) {
			form.addField(CONFIG.ir_date_adj, 'integer').setDisplayType('hidden').setDefaultValue(ir_date);
		}
		if (vb_date) {
			form.addField(CONFIG.vb_date_adj, 'integer').setDisplayType('hidden').setDefaultValue(vb_date);
		}
		if (vp_date) {
			form.addField(CONFIG.vp_date_adj, 'integer').setDisplayType('hidden').setDefaultValue(vp_date);
		}
		//Record Checkbox
		if (ir_cb) {
			form.addField(CONFIG.ir_check, 'text').setDisplayType('hidden').setDefaultValue(ir_cb);
		}
		if (vb_cb) {
			form.addField(CONFIG.vb_check, 'text').setDisplayType('hidden').setDefaultValue(vb_cb);
		}
		if (vp_cb) {
			form.addField(CONFIG.vp_check, 'text').setDisplayType('hidden').setDefaultValue(vp_cb);
		}
	}
	response.writePage(form);
}

function getSelectedRecord(request, trans_sublist, trans_flag, trans_id, trans_fld, trans_date, trans_vendor) {
	var count=request.getLineItemCount(trans_sublist);
	var rec_arr=new Array(), ctr=0;
	for (var i=1;trans_sublist && i<=count;i++) {
		if (request.getLineItemValue(trans_sublist, trans_flag, i)=='T') {
			var rec_item=new Array();
			rec_item['id']=request.getLineItemValue(trans_sublist, trans_id, i);
			rec_item['update_date']=request.getLineItemValue(trans_sublist, trans_date, i);
			//Generated fields
			rec_item['update_status']='<span id="tran_status_'+ctr+'">Not started</span>';
			rec_item['update_vendor']=request.getLineItemValue(trans_sublist, trans_vendor, i);
			rec_item['update_po']=request.getLineItemValue(trans_sublist, trans_fld, i);
			rec_item['update_ir']='<span id="trans_ir_'+ctr+'">---</span>';
			rec_item['update_vb']='<span id="trans_vb_'+ctr+'">---</span>';
			rec_item['update_vp']='<span id="trans_vp_'+ctr+'">---</span>';
			ctr++;
			rec_arr.push(rec_item);
		}
	}
	return rec_arr;
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

function getPOByDate(date_1, date_2, subsidiary, status) {
	var col_id=new nlobjSearchColumn('tranid');
	col_id.setSort(true);

        //[Start] Kiko - 12/18/2015
        /*
	var filter=[new nlobjSearchFilter('trandate', null, 'within', date_1, date_2),
	                                                         new nlobjSearchFilter('mainline', null, 'is', 'T'),
	                                                         new nlobjSearchFilter('status', null, 'anyof', status)];
        */
        var filter=[new nlobjSearchFilter('trandate', null, 'within', date_1, date_2), new nlobjSearchFilter('status', null, 'anyof', status)];
        //[End] Kiko - 12/18/2015

	if (!isNullOrEmpty(subsidiary)) {
		filter.push(new nlobjSearchFilter('subsidiary', null, 'anyof', subsidiary));
	}

        //[Start] Kiko - 12/18/2015
        /*
	var result_set=nlapiSearchRecord('purchaseorder', null, filter,
	                                                         //new nlobjSearchFilter('subsidiary', null, 'anyof', splitArray(subsidiary)),
	                                                         //new nlobjSearchFilter('status', null, 'anyof', splitArray(status))],
	                                                         [col_id, new nlobjSearchColumn('trandate'),
	                                                          new nlobjSearchColumn('entity'), new nlobjSearchColumn('amount'),
	                                                          new nlobjSearchColumn('status')]);
        */
        var result_set=nlapiSearchRecord('purchaseorder', PURCHASE_ORDER_SEARCH, filter,
	                                                         [col_id, new nlobjSearchColumn('trandate'),
	                                                          new nlobjSearchColumn('entity'), new nlobjSearchColumn('amount'),
	                                                          new nlobjSearchColumn('status')]);
        //[End] Kiko - 12/18/2015

	if (isNullOrEmpty(result_set)) {
		return null;
	}
	else {
		var result_arr=new Array();
		for (var i=0;result_set && i<result_set.length;i++) {
			var result_item=new Array();
			result_item['id']=result_set[i].getId();
			result_item['trans_id']='<a target="_blank" href="'+(nlapiResolveURL('RECORD', 'purchaseorder', result_item['id']))+'">'+result_set[i].getValue('tranid')+'</a>';
			result_item['trans_date']=result_set[i].getValue('trandate');
			result_item['trans_amount']=result_set[i].getValue('amount');
			result_item['trans_entity']='<a target="_blank" href="'+(nlapiResolveURL('RECORD', 'vendor', result_set[i].getValue('entity')))+'">'+result_set[i].getText('entity')+'</a>';
			result_item['trans_status']=result_set[i].getText('status');
			result_arr.push(result_item);
		}
		return result_arr;
	}
}

function createIRByPOId(po_id, date_adj) {
	if (po_id) {
		var ir_id=nlapiTransformRecord('purchaseorder', po_id, 'itemreceipt');
		var date_delta=new Date(nlapiLookupField('purchaseorder', po_id, 'trandate'));
		date_delta=adjustDateByDay(date_delta, date_adj);
		var trans_id=ir_id.getFieldValue('tranid');
		ir_id.setFieldValue('trandate', date_delta);
		if ((ir_id=nlapiSubmitRecord(ir_id, true))) {
			return '<a target="_blank" href="'+nlapiResolveURL('RECORD', 'itemreceipt', ir_id)+'">'+trans_id+'</a>';
		}
	}
	return null;
}

function createVBByPOId(po_id, date_adj) {
	if (po_id) {
		var vb_id=nlapiTransformRecord('purchaseorder', po_id, 'vendorbill');
		var date_delta=new Date(nlapiLookupField('purchaseorder', po_id, 'trandate'));
		date_delta=adjustDateByDay(date_delta, date_adj);
		vb_id.setFieldValue('trandate', date_delta);
		if ((vb_id=nlapiSubmitRecord(vb_id, true))) {
			return '<a target="_blank" href="'+nlapiResolveURL('RECORD', 'vendorbill', vb_id)+'">'+vb_id+'</a>';;
		}
	}
	return null;
}

function createVPByBillId(bill_id, date_adj) {
	if (bill_id) {
		var vp_id=nlapiTransformRecord('vendorbill', bill_id, 'vendorpayment');
		var date_delta=new Date(nlapiLookupField('vendorbill', bill_id, 'trandate'));
		date_delta=adjustDateByDay(date_delta, date_adj);
		var trans_id=vp_id.getFieldValue('tranid');
		vp_id.setFieldValue('trandate', date_delta);
		if ((vp_id=nlapiSubmitRecord(vp_id, true))) {
			return '<a target="_blank" href="'+nlapiResolveURL('RECORD', 'vendorpayment', vp_id)+'">'+trans_id+'</a>';
		}
	}
	return null;
}

function hasExistingIR(po_id) {
	var result_set=nlapiSearchRecord('itemreceipt', null, [new nlobjSearchFilter('createdfrom', null, 'is', po_id),
	                                                       new nlobjSearchFilter('mainline', null, 'is', 'T')],
	                                                       [new nlobjSearchColumn('tranid')]);
	if (isNullOrEmpty(result_set)) {
		return null;
	}
	else {
		return '<a target="_blank" href="'+nlapiResolveURL('RECORD', 'itemreceipt', result_set[0].getId())+'">'+result_set[0].getValue('tranid')+'</a>';
	}
}

function hasExistingVB(po_id) {
	var result_set=nlapiSearchRecord('vendorbill', null, [new nlobjSearchFilter('appliedtotransaction', null, 'is', po_id)],
	                                                       null);
	if (isNullOrEmpty(result_set)) {
		return null;
	}
	else {
		return '<a target="_blank" href="'+nlapiResolveURL('RECORD', 'vendorbill', result_set[0].getId())+'">'+result_set[0].getId()+'</a>';
	}
}

function hasExistingVP(bill_id) {
	var result_set=nlapiSearchRecord('vendorpayment', null, [new nlobjSearchFilter('createdfrom', null, 'anyof', bill_id)],
															[new nlobjSearchColumn('tranid')]);
	if (isNullOrEmpty(result_set)) {
		return null;
	}
	else {
		return '<a target="_blank" href="'+nlapiResolveURL('RECORD', 'vendorpayment', result_set[0].getId())+'">'+result_set[0].getValue('tranid')+'</a>';
	}
}

function getExistingVB(po_id) {
	var result_set=nlapiSearchRecord('vendorbill', null, [new nlobjSearchFilter('appliedtotransaction', null, 'is', po_id)],
															null);
	if (isNullOrEmpty(result_set)) {
		return null;
	}
	else {
		return result_set[0].getId();
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

function automation_fieldChanged(type, name, line) {
	if (name==CONFIG.ir_check) {
		if (nlapiGetFieldValue(name)=='T') {
			document.getElementById('custfld_ir_date_adj_formattedValue').removeAttribute('disabled');
		}
		else {
			document.getElementById('custfld_ir_date_adj_formattedValue').setAttribute('disabled', 'disabled');
		}
	}
	else if (name==CONFIG.vb_check) {
		if (nlapiGetFieldValue(name)=='T') {
			document.getElementById('custfld_vb_date_adj_formattedValue').removeAttribute('disabled');
		}
		else {
			document.getElementById('custfld_vb_date_adj_formattedValue').setAttribute('disabled', 'disabled');
		}
	}
	else if (name==CONFIG.vp_check) {
		if (nlapiGetFieldValue(name)=='T') {
			document.getElementById('custfld_vp_date_adj_formattedValue').removeAttribute('disabled');
		}
		else {
			document.getElementById('custfld_vp_date_adj_formattedValue').setAttribute('disabled', 'disabled');
		}
	}
	return true;
}

function automation_saveRecord() {
	var ir_cb=nlapiGetFieldValue(CONFIG.ir_check);
	var vb_cb=nlapiGetFieldValue(CONFIG.vb_check);
	var vp_cb=nlapiGetFieldValue(CONFIG.vp_check);
	if (isNullOrEmpty(ir_cb) && isNullOrEmpty(vb_cb) && isNullOrEmpty(vp_cb)) {
		return true;
	}
	else {
		if (ir_cb=='T' || vb_cb=='T' || vp_cb=='T') {
			return true;
		}
		else {
			alert('Select at least one record to automate.');
			return false;
		}
	}
	return false;
}

function array_stringify(data_arr) {
	var data_str='';
	for (var i=0;data_arr && i<data_arr.length;i++) {
		data_str+=data_arr[i]['id']+',';
	}
	data_str=data_str.substring(0, data_str.length-1);
	return '['+data_str+']';
}

