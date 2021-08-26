/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Oct 2014     mdeasis
 *
 */
{
	var CONFIG={
		//AJAX Server
		suitelet_id: 'customscript_rec_automation_ajax_server',
		suitelet_deployment: 'customdeploy_rec_automation_ajax_server',
		//Table Headers
		//Order to Cash
		row_quote: 'tran_quote_link',
		row_sales_order: 'tran_sales_order_link',
		row_item_fulfillment: 'tran_item_fmt_link',
		row_invoice: 'tran_invoice_link',
		row_payment: 'tran_payment_link',
		row_status: 'tran_status',
		//Procure to Payment
		row_ir: 'trans_ir',
		row_vb: 'trans_vb',
		row_vp: 'trans_vp',
		//Images
		icon_success: 'ns_check.png',
		icon_error: 'ns_error.gif',
		icon_loader: 'ajax-loader.gif',
		//URL Parameters
		//Order to Cash
		order_to_cash: 'o2c',
		cb_quote: 'cb_q',
		day_quote: 'day_q',
		cb_sales_order: 'cb_so',
		day_sales_order: 'day_so',
		cb_item_fmt: 'cb_ifmt',
		day_item_fmt: 'day_ifmt',
		cb_invoice: 'cb_inv',
		day_invoice: 'day_inv',
		cb_payment: 'cb_pay',
		day_payment: 'day_pay',
		ship_method: 'ship_m',
		//Procure to Payment
		procure_to_pay: 'p2p',
		cb_ir: 'cb_ir',
		day_ir: 'day_ir',
		cb_vb: 'cb_vb',
		day_vb: 'day_vb',
		cb_vp: 'cb_vp',
		day_vp: 'day_vp',
		//UI Elements
		msg_dashboard: 'custfld_label_note_val',
		home_btn: 'custfld_home_btn',
		home_btn_2: 'secondarycustfld_home_btn',
		commit_btn: 'custfld_commit_btn',
		commit_btn_2: 'secondarycustfld_commit_btn',
		//O2C Automation Suitelet
		o2c_suitelet: 'customscript_order_cash_management',
		o2c_deployment: 'customdeploy_order_cash_management',
		//P2P Automation Suitelet
		p2p_suitelet: 'customscript_trans_creation_automation',
		p2p_deployment: 'customdeploy_trans_creation_automation',
		//Shipping Method Sourcing
		ship_method_ajax: 'ship_m',
		ship_method_so: 's_ship',
		ship_carrier: 'ship_c',
		//Sales to Cash
		sales_to_cash: 's2c',
        //Constants
        MAX_RETRIES: 5,
	};
	var ajax_server=null, ajax_url;
	var record_ctr=0, record_size=0, success_ctr=0;
	var img_loader=null, img_success=null, img_error=null;
	var op_rec_list=null;
}

function ajax_suitelet(request, response) {
	//Order To Cash Passed Parameters
	var order_to_cash=request.getParameter(CONFIG.order_to_cash);
	//Procure to Pay Passed Parameters
	var procure_to_pay=request.getParameter(CONFIG.procure_to_pay);
	//Shipping Msthod Sourcer
	var ship_method_ajax=request.getParameter(CONFIG.ship_method_ajax);
	//SO Shipping Method
	var ship_method_so=request.getParameter(CONFIG.ship_method_so);
	//Sales to Cash
	var sales_to_cash=request.getParameter(CONFIG.sales_to_cash);
    //Date Format
    var date_format=nlapiGetContext().getPreference('dateformat');
    //Retries counter and flag
    var num_retries=0, all_processed=false;
	//**
	//Order to Cash
	//**
	if (order_to_cash) {
		var cb_quote=request.getParameter(CONFIG.cb_quote);
		var day_quote=request.getParameter(CONFIG.day_quote);
		var cb_sales_order=request.getParameter(CONFIG.cb_sales_order);
		var day_sales_order=request.getParameter(CONFIG.day_sales_order);
		var cb_item_fmt=request.getParameter(CONFIG.cb_item_fmt);
		var day_item_fmt=request.getParameter(CONFIG.day_item_fmt);
		var cb_invoice=request.getParameter(CONFIG.cb_invoice);
		var day_invoice=request.getParameter(CONFIG.day_invoice);
		var cb_payment=request.getParameter(CONFIG.cb_payment);
		var day_payment=request.getParameter(CONFIG.day_payment);
		var ship_method=request.getParameter(CONFIG.ship_method);
		//Flags
		var quote_status=0;
		var sales_order_status=0;
		var item_fmt_status=0;
		var invoice_status=0;
		var payment_status=0;
		//Links
		var quote_link='';
		var sales_order_link='';
		var item_fmt_link='';
		var invoice_link='';
		var payment_link='';
		//Error Msgs
		var quote_error='';
		var sales_order_error='';
		var item_fmt_error='';
		var invoice_error='';
		var payment_error='';
        
        var opp_date=nlapiLookupField('opportunity', order_to_cash, 'trandate');
        
        while (!all_processed && num_retries<CONFIG.MAX_RETRIES) {
            //**
            //Quote Generation
            //**
            if (cb_quote) {
                try {
                    var temp_rec=getExistingQuoteByOppID(order_to_cash);
                    if (temp_rec==null) {
                        temp_rec=createQuoteByOppID(order_to_cash, day_quote, date_format, opp_date);
                    }
                    quote_status=1;
                    quote_link=temp_rec.link;
                }
                catch (err) {
                    quote_status=-1;
                    quote_error=err.message;
                }
            }
            //**
            //Sales Order Generation
            //**
            if (cb_sales_order) {
                try {
                    var temp_rec=getExistingSOByOppID(order_to_cash);
                    if (temp_rec==null) {
                        temp_rec=createSalesOrderByOppID(order_to_cash, day_sales_order, ship_method, date_format, opp_date);
                    }
                    //nlapiSubmitField('salesorder', temp_rec.id, 'orderstatus', 'B');
                    sales_order_status=1;
                    sales_order_link=temp_rec.link;
                }
                catch (err) {
                    sales_order_status=-1;
                    sales_order_error=err.message;
                }
            }
            //**
            //Item Fulfillment Generation
            //**
            if (cb_item_fmt) {
                try {
                    var temp1_rec=getExistingSOByOppID(order_to_cash);
                    if (temp1_rec==null) {
                        temp1_rec=createSalesOrderByOppID(order_to_cash, day_sales_order==null?0:day_sales_order, ship_method, date_format, opp_date);
                    }
                    var temp_rec=getExistingItemFulfillmentBySOID(temp1_rec.id);
                    if (isFulfilledPartially(temp1_rec.id) || (temp_rec==null)) {
                        temp_rec=createItemFulfillmentBySOID(temp1_rec.id, day_item_fmt, ship_method, date_format, opp_date);
                    }
                    //nlapiSubmitField('itemfulfillment', temp_rec.id, 'shipstatus', 'C');
                    item_fmt_status=1;
                    item_fmt_link=temp_rec.link;
                }
                catch (err) {
                    item_fmt_status=-1;
                    item_fmt_error=err.message;
                }
            }
            //**
            //Invoice Generation
            //**
            if (cb_invoice) {
                try {
                    //Generate necessary sales order first
                    var so_rec=getExistingSOByOppID(order_to_cash);
                    if (so_rec==null) {
                        so_rec=createSalesOrderByOppID(order_to_cash, day_sales_order==null?0:day_sales_order, ship_method, date_format, opp_date);
                    }
                    //Invoice creation
                    var temp_rec=getExistingInvoiceByOppID(order_to_cash);
                    if (isBilledPartially(so_rec.id) || (temp_rec==null)) {
                        temp_rec=createInvoiceBySOID(so_rec.id, day_invoice, ship_method, date_format, opp_date);
                    }
                    invoice_status=1;
                    invoice_link=temp_rec.link;
                }
                catch (err) {
                    invoice_status=-1;
                    invoice_error=err.message;
                }
            }
            //**
            //Payment Generation
            //**
            if (cb_payment) {
                try {
                    var invoice_rec=getExistingInvoiceByOppID(order_to_cash);
                    if (invoice_rec==null) {
                        var so_rec=getExistingSOByOppID(order_to_cash);
                        if (so_rec==null) {
                            so_rec=createSalesOrderByOppID(order_to_cash, day_sales_order==null?0:day_sales_order, date_format, opp_date);
                        }
                        invoice_rec=createInvoiceBySOID(so_rec.id, day_invoice==null?0:day_invoice, ship_method, date_format, opp_date);
                    }
                    var temp_rec=getExistingPaymentByInvoiceID(invoice_rec.id);
                    if (!isPaid(invoice_rec.id) || temp_rec==null) {
                        temp_rec=createPaymentByInvoiceID(invoice_rec.id, day_payment, date_format, opp_date);
                    }
                    payment_status=1;
                    payment_link=temp_rec.link;
                }
                catch (err) {
                    payment_status=-1;
                    payment_error=err.message;
                }
            }
            //Increased retry counter
            //nlapiLogExecution('DEBUG', all_processed, num_retries<CONFIG.MAX_RETRIES);
            //nlapiLogExecution('DEBUG', num_retries);
            num_retries++;
            if (quote_status==1 && sales_order_status==1 && item_fmt_status==1 && invoice_status==1 && payment_status==1) {
                all_processed=true;
            }
        }
		response.setContentType('JAVASCRIPT', 'project_report.json');
		response.write(JSON.stringify({
			"quote_status" : nlapiEscapeXML(quote_status),
			"quote_link" : nlapiEscapeXML(quote_link),
			"quote_error" : nlapiEscapeXML(quote_error),
			"sales_order_status" : nlapiEscapeXML(sales_order_status),
			"sales_order_link" : nlapiEscapeXML(sales_order_link),
			"sales_order_error" : nlapiEscapeXML(sales_order_error),
			"item_fmt_status" : nlapiEscapeXML(item_fmt_status),
			"item_fmt_link" : nlapiEscapeXML(item_fmt_link),
			"item_fmt_error" : nlapiEscapeXML(item_fmt_error),
			"invoice_status" : nlapiEscapeXML(invoice_status),
			"invoice_link" : nlapiEscapeXML(invoice_link),
			"invoice_error" : nlapiEscapeXML(invoice_error),
			"payment_status" : nlapiEscapeXML(payment_status),
			"payment_link" : nlapiEscapeXML(payment_link),
			"payment_error" : nlapiEscapeXML(payment_error),
		}));
	}
	//**
	//Sales to Cash
	//**
	else if (sales_to_cash) {
		var cb_item_fmt=request.getParameter(CONFIG.cb_item_fmt);
		var day_item_fmt=request.getParameter(CONFIG.day_item_fmt);
		var cb_invoice=request.getParameter(CONFIG.cb_invoice);
		var day_invoice=request.getParameter(CONFIG.day_invoice);
		var cb_payment=request.getParameter(CONFIG.cb_payment);
		var day_payment=request.getParameter(CONFIG.day_payment);
		var ship_method=request.getParameter(CONFIG.ship_method);
		//Flags
		var item_fmt_status=0;
		var invoice_status=0;
		var payment_status=0;
		//Links
		var item_fmt_link='';
		var invoice_link='';
		var payment_link='';
		//Error Msgs
		var item_fmt_error='';
		var invoice_error='';
		var payment_error='';
        //Base date
        var so_date=nlapiLookupField('salesorder', sales_to_cash, 'trandate');
		//Sales Order set to Approved
		nlapiSubmitField('salesorder', sales_to_cash, 'orderstatus', 'B');
        while (!all_processed && num_retries<CONFIG.MAX_RETRIES) {
            //**
            //Item Fulfillment Generation
            //**
            if (cb_item_fmt) {
                try {
                    var temp_rec=getExistingItemFulfillmentBySOID(sales_to_cash);
                    if (isFulfilledPartially(sales_to_cash) || (temp_rec==null)) {
                        temp_rec=createItemFulfillmentBySOID(sales_to_cash, day_item_fmt, ship_method, date_format, so_date);
                    }
                    nlapiSubmitField('itemfulfillment', temp_rec.id, 'shipstatus', 'C');
                    item_fmt_status=1;
                    item_fmt_link=temp_rec.link;
                }
                catch (err) {
                    item_fmt_status=-1;
                    item_fmt_error=err.message;
                }
            }
            //**
            //Invoice Generation
            //**
            if (cb_invoice) {
                try {
                    var temp_rec=getExistingInvoiceBySOID(sales_to_cash);
                    if (isBilledPartially(sales_to_cash) || (temp_rec==null)) {
                        temp_rec=createInvoiceBySOID(sales_to_cash, day_invoice, ship_method, date_format, so_date);
                    }
                    invoice_status=1;
                    invoice_link=temp_rec.link;
                }
                catch (err) {
                    invoice_status=-1;
                    invoice_error=err.message;
                }
            }
            //**
            //Payment Generation
            //**
            if (cb_payment) {
                try {
                    var invoice_rec=getExistingInvoiceBySOID(sales_to_cash);
                    if (invoice_rec==null) {
                        invoice_rec=createInvoiceBySOID(sales_to_cash, day_invoice==null?0:day_invoice, ship_method, date_format, so_date);
                    }
                    var temp_rec=getExistingPaymentByInvoiceID(invoice_rec.id);
                    if (!isPaid(invoice_rec.id) || temp_rec==null) {
                        temp_rec=createPaymentByInvoiceID(invoice_rec.id, day_payment, date_format, so_date);
                    }
                    payment_status=1;
                    payment_link=temp_rec.link;
                }
                catch (err) {
                    payment_status=-1;
                    payment_error=err.message;
                }
            }
            //Increased retry counter
            //nlapiLogExecution('DEBUG', all_processed, num_retries<CONFIG.MAX_RETRIES);
            //nlapiLogExecution('DEBUG', num_retries);
            num_retries++;
            if (item_fmt_status==1 && invoice_status==1 && payment_status==1) {
                all_processed=true;
            }
        }
		response.setContentType('JAVASCRIPT', 'project_report.json');
		response.write(JSON.stringify({
			"quote_status" : 0,
			"quote_link" : '',
			"quote_error" : '',
			"sales_order_status" : 0,
			"sales_order_link" : '',
			"sales_order_error" : '',
			"item_fmt_status" : nlapiEscapeXML(item_fmt_status),
			"item_fmt_link" : nlapiEscapeXML(item_fmt_link),
			"item_fmt_error" : nlapiEscapeXML(item_fmt_error),
			"invoice_status" : nlapiEscapeXML(invoice_status),
			"invoice_link" : nlapiEscapeXML(invoice_link),
			"invoice_error" : nlapiEscapeXML(invoice_error),
			"payment_status" : nlapiEscapeXML(payment_status),
			"payment_link" : nlapiEscapeXML(payment_link),
			"payment_error" : nlapiEscapeXML(payment_error),
		}));
	}
	//**
	//Procure to Pay
	//**
	else if (procure_to_pay) {
		var cb_ir=request.getParameter(CONFIG.cb_ir);
		var day_ir=request.getParameter(CONFIG.day_ir);
		var cb_vb=request.getParameter(CONFIG.cb_vb);
		var day_vb=request.getParameter(CONFIG.day_vb);
		var cb_vp=request.getParameter(CONFIG.cb_vp);
		var day_vp=request.getParameter(CONFIG.day_vp);
		//Flags
		var ir_status=0;
		var vb_status=0;
		var vp_status=0;
		//Links
		var ir_link='';
		var vb_link='';
		var vp_link='';
		//Error Msgs
		var ir_error='';
		var vb_error='';
		var vp_error='';
        while (!all_processed && num_retries<CONFIG.MAX_RETRIES) {
            //Item Receipt
            if (cb_ir) {
                try {
                    var temp_rec=hasExistingIR(procure_to_pay);
                    if (temp_rec==null || isReceivedPartially(procure_to_pay)) {
                        temp_rec=createIRByPOId(procure_to_pay, day_ir, date_format);
                    }
                    ir_status=1;
                    ir_link=temp_rec.link;
                }
                catch (err) {
                    ir_status=-1;
                    ir_error=err.message;
                }
            }
            //Vendor Bill
            if (cb_vb) {
                try {
                    var temp_rec=hasExistingVB(procure_to_pay);
                    if (temp_rec==null) {
                        temp_rec=createVBByPOId(procure_to_pay, day_vb, date_format);
                    }
                    vb_status=1;
                    vb_link=temp_rec.link;
                }
                catch (err) {
                    vb_status=-1;
                    vb_error=err.message;
                }
            }
            //Vendor Payment
            if (cb_vp) {
                try {
                    var vp_rec=getExistingVB(procure_to_pay);
                    if (vp_rec==null) {
                        vp_rec=createVBByPOId(procure_to_pay, day_vb==null?0:day_vb, date_format);
                        vp_rec=getExistingVB(procure_to_pay);
                    }
                    var temp_rec=hasExistingVP(vp_rec);
                    if (temp_rec==null || !isBilled(vp_rec)) {
                        temp_rec=createVPByBillId(procure_to_pay, vp_rec, day_vp, date_format);
                    }
                    vp_status=1;
                    vp_link=temp_rec.link;
                }
                catch (err) {
                    vp_status=-1;
                    vp_error=err.message;
                }
            }
            //Increased retry counter
            //nlapiLogExecution('DEBUG', all_processed, num_retries<CONFIG.MAX_RETRIES);
            //nlapiLogExecution('DEBUG', num_retries);
            num_retries++;
            if (ir_status==1 && vb_status==1 && vp_status==1) {
                all_processed=true;
            }
        }
		response.setContentType('JAVASCRIPT', 'project_report.json');
		response.write(JSON.stringify({
			"ir_status": nlapiEscapeXML(ir_status),
			"ir_link": nlapiEscapeXML(ir_link),
			"ir_error": nlapiEscapeXML(ir_error),
			"vb_status": nlapiEscapeXML(vb_status),
			"vb_link": nlapiEscapeXML(vb_link),
			"vb_error": nlapiEscapeXML(vb_error),
			"vp_status": nlapiEscapeXML(vp_status),
			"vp_link": nlapiEscapeXML(vp_link),
			"vp_error": nlapiEscapeXML(vp_error),
		}));
	}
	//**
	//Shipping Method Sourcing
	//**
	else if (ship_method_ajax) {
		var rec_temp=nlapiTransformRecord('opportunity', ship_method_ajax, 'salesorder', {recordmode: 'dynamic'});
		var method_list=rec_temp.getField('shipmethod').getSelectOptions();
		var method_arr={"id":[], "text": []};
		for (var i=0;method_list && i<method_list.length;i++) {
			method_arr['id'].push(method_list[i].getId());
			method_arr['text'].push(method_list[i].getText());
		}
		response.setContentType('JAVASCRIPT', 'ship_method.json');
		response.write(JSON.stringify(method_arr));
	}
	//**
	//Shipping Method Sourcing
	//**
	else if (ship_method_so) {
		var rec_temp=nlapiLoadRecord('salesorder', ship_method_so, {recordmode: 'dynamic'});
		var method_list=rec_temp.getField('shipmethod').getSelectOptions();
		var method_arr={"id":[], "text": []};
		for (var i=0;method_list && i<method_list.length;i++) {
			method_arr['id'].push(method_list[i].getId());
			method_arr['text'].push(method_list[i].getText());
		}
		response.setContentType('JAVASCRIPT', 'ship_method.json');
		response.write(JSON.stringify(method_arr));
	}
}


function callAJAXServer(op_list, cb_quote, day_quote, cb_sales_order, day_sales_order,
								 cb_item_fmt, day_item_fmt, cb_invoice, day_invoice,
								 cb_payment, day_payment, ship_list) {
	if (op_list==null || op_list.length==0) {
		alert('There is no selected records to commit. Please try again.');
		return;
	}
	if (confirm('This action is irreversible. Are you sure you want to continue?')) {
		ajax_url=nlapiResolveURL('SUITELET', CONFIG.suitelet_id, CONFIG.suitelet_deployment);
		if (cb_quote!=null && cb_quote=='T') {
			ajax_url+='&'+CONFIG.cb_quote+'=T&'+CONFIG.day_quote+'='+day_quote;
		}
		if (cb_sales_order!=null && cb_sales_order=='T') {
			ajax_url+='&'+CONFIG.cb_sales_order+'=T&'+CONFIG.day_sales_order+'='+day_sales_order;
		}
		if (cb_item_fmt!=null && cb_item_fmt=='T') {
			ajax_url+='&'+CONFIG.cb_item_fmt+'=T&'+CONFIG.day_item_fmt+'='+day_item_fmt;
		}
		if (cb_invoice!=null && cb_invoice=='T') {
			ajax_url+='&'+CONFIG.cb_invoice+'=T&'+CONFIG.day_invoice+'='+day_invoice;
		}
		if (cb_payment!=null && cb_payment=='T') {
			ajax_url+='&'+CONFIG.cb_payment+'=T&'+CONFIG.day_payment+'='+day_payment;
		}
		record_ctr=0;
		record_size=op_list.length;
		success_ctr=0;
		img_loader=getFileURL(CONFIG.icon_loader);
		showWarningMessage();
		commenceAJAXCall(ajax_url, op_list, ship_list);
		img_success=getFileURL(CONFIG.icon_success);
		img_error=getFileURL(CONFIG.icon_error);
		op_rec_list=op_list;
	}
}

function callSalesServer(op_list, cb_item_fmt, day_item_fmt,
						cb_invoice, day_invoice, cb_payment,
						day_payment, ship_list) {
	if (op_list==null || op_list.length==0) {
		alert('There is no selected records to commit. Please try again.');
		return;
	}
	if (confirm('This action is irreversible. Are you sure you want to continue?')) {
		ajax_url=nlapiResolveURL('SUITELET', CONFIG.suitelet_id, CONFIG.suitelet_deployment);
		if (cb_item_fmt!=null && cb_item_fmt=='T') {
			ajax_url+='&'+CONFIG.cb_item_fmt+'=T&'+CONFIG.day_item_fmt+'='+day_item_fmt;
		}
		if (cb_invoice!=null && cb_invoice=='T') {
			ajax_url+='&'+CONFIG.cb_invoice+'=T&'+CONFIG.day_invoice+'='+day_invoice;
		}
		if (cb_payment!=null && cb_payment=='T') {
			ajax_url+='&'+CONFIG.cb_payment+'=T&'+CONFIG.day_payment+'='+day_payment;
		}
		record_ctr=0;
		record_size=op_list.length;
		success_ctr=0;
		img_loader=getFileURL(CONFIG.icon_loader);
		showWarningMessage();
		commenceSalesCall(ajax_url, op_list, ship_list);
		img_success=getFileURL(CONFIG.icon_success);
		img_error=getFileURL(CONFIG.icon_error);
		op_rec_list=op_list;
	}
}

function commenceAJAXCall(ajax_url, rec_list, ship_list) {
	updateRowStatus(record_ctr);
	if (window.XMLHttpRequest) {
		ajax_server=new XMLHttpRequest();
	}
	else {
		ajax_server=new ActiveXObject('Microsoft.XMLHTTP');
	}
	ajax_server.open('POST', ajax_url+'&'+CONFIG.order_to_cash+'='+rec_list[record_ctr]+
							((isNullOrEmpty(ship_list)||isNullOrEmpty(ship_list[record_ctr]))?'':'&'+CONFIG.ship_method+'='+ship_list[record_ctr]), true);
	ajax_server.send();
	ajax_server.onreadystatechange=function() {
		if (ajax_server.readyState==4 && ajax_server.status==200) {
			updateRow(ajax_server.responseText, record_ctr);
			record_ctr++;
			ajax_server.abort();
			if (record_ctr<rec_list.length) {
				commenceAJAXCall(ajax_url, rec_list, ship_list);
			}
			else {
				showResult();
			}
		}
	};
}

function commenceSalesCall(ajax_url, rec_list, ship_list) {
	updateRowStatus(record_ctr);
	if (window.XMLHttpRequest) {
		ajax_server=new XMLHttpRequest();
	}
	else {
		ajax_server=new ActiveXObject('Microsoft.XMLHTTP');
	}
	ajax_server.open('POST', ajax_url+'&'+CONFIG.sales_to_cash+'='+rec_list[record_ctr]+
							((isNullOrEmpty(ship_list)||isNullOrEmpty(ship_list[record_ctr]))?'':'&'+CONFIG.ship_method+'='+ship_list[record_ctr]), true);
	ajax_server.send();
	ajax_server.onreadystatechange=function() {
		if (ajax_server.readyState==4 && ajax_server.status==200) {
			updateRow(ajax_server.responseText, record_ctr);
			record_ctr++;
			ajax_server.abort();
			if (record_ctr<rec_list.length) {
				commenceSalesCall(ajax_url, rec_list, ship_list);
			}
			else {
				showResult();
			}
		}
	};
}

function updateRowStatus(index) {
	var status_txt=document.getElementById('tran_status_'+index);
	if (status_txt) {
		status_txt.innerHTML='<img title="In progress" src="'+img_loader+'" />';
	}
}

function updateRow(data_item, index) {
	var data_json=JSON.parse(data_item);
	//Quote
	var quote_txt=document.getElementById(CONFIG.row_quote+'_'+index);
	if (quote_txt) {
		if (data_json.quote_status==1) {
			quote_txt.innerHTML=decodeHTMLEntities(data_json.quote_link);
		}
		else {
			quote_txt.innerHTML=data_json.quote_error;
			quote_txt.style.color='#FE0000';
		}
	}
	//Sales Order
	var so_txt=document.getElementById(CONFIG.row_sales_order+'_'+index);
	if (so_txt) {
		if (data_json.sales_order_status==1) {
			so_txt.innerHTML=decodeHTMLEntities(data_json.sales_order_link);
		}
		else {
			so_txt.innerHTML=data_json.sales_order_error;
			so_txt.style.color='#FE0000';
		}
	}
	//Item Fulfillment
	var item_fmt=document.getElementById(CONFIG.row_item_fulfillment+'_'+index);
	if (item_fmt) {
		if (data_json.item_fmt_status==1) {
			item_fmt.innerHTML=decodeHTMLEntities(data_json.item_fmt_link);
		}
		else {
			item_fmt.innerHTML=data_json.item_fmt_error;
			item_fmt.style.color='#FE0000';
		}
	}
	//Invoice
	var invoice_txt=document.getElementById(CONFIG.row_invoice+'_'+index);
	if (invoice_txt) {
		if (data_json.invoice_status==1) {
			invoice_txt.innerHTML=decodeHTMLEntities(data_json.invoice_link);
		}
		else {
			invoice_txt.innerHTML=data_json.invoice_error;
			invoice_txt.style.color='#FE0000';
		}
	}
	//Payment
	var payment_txt=document.getElementById(CONFIG.row_payment+'_'+index);
	if (payment_txt) {
		if (data_json.payment_status==1) {
			payment_txt.innerHTML=decodeHTMLEntities(data_json.payment_link);
		}
		else {
			payment_txt.innerHTML=data_json.payment_error;
			payment_txt.style.color='#FE0000';
		}
	}
	//Status
	if (data_json.quote_status>-1 && data_json.sales_order_status>-1 && data_json.item_fmt_status>-1 &&
		data_json.invoice_status>-1 && data_json.payment_status>-1) {
		document.getElementById(CONFIG.row_status+'_'+index).innerHTML='<img title="Record automation success." width="20px" height="20px" src="'+img_success+'"/>';
		success_ctr++;
	}
	else {
		document.getElementById(CONFIG.row_status+'_'+index).innerHTML='<img title="Record automation failed." width="20px" height="20px" src="'+img_error+'"/>';
	}
}

function createQuoteByOppID(op_id, date_adj, date_format, raw_date) {
	if (op_id) {
		var quote_rec=nlapiTransformRecord('opportunity', op_id, 'estimate');
		var date_delta=formatDate(raw_date, date_format, date_adj);
        //var date_delta=adjustDateByDay(new Date(nlapiLookupField('opportunity', op_id, 'trandate')), date_adj);
		quote_rec.setFieldValue('trandate', date_delta);
		if ((quote_rec=nlapiSubmitRecord(quote_rec, true, true))) {
			var quote_trans=nlapiLookupField('estimate', quote_rec, 'tranid');
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

function createSalesOrderByOppID(op_id, date_adj, ship_method, date_format, raw_date) {
	if (op_id) {
		var est_id=getExistingQuoteByOppID(op_id);
		if (isNullOrEmpty(est_id)) {
			est_id=createQuoteByOppID(op_id, date_adj);
		}
		var so_rec=nlapiTransformRecord('estimate', est_id.id, 'salesorder');
		var date_delta=formatDate(raw_date, date_format, date_adj);
        //var date_delta=adjustDateByDay(new Date(nlapiLookupField('opportunity', op_id, 'trandate')), date_adj);
		so_rec.setFieldValue('trandate', date_delta);
        so_rec.setFieldValue('orderstatus', 'B');
		if (!isNullOrEmpty(ship_method)) {
			so_rec.setFieldValue('shipmethod', ship_method);
		}
		if ((so_rec=nlapiSubmitRecord(so_rec, true, true))) {
			var so_trans=nlapiLookupField('salesorder', so_rec, 'tranid');
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

function createItemFulfillmentBySOID(so_id, date_adj, ship_method, date_format, raw_date) {
	if (so_id) {
		var item_rec=nlapiTransformRecord('salesorder', so_id, 'itemfulfillment');
        var date_delta=raw_date || nlapiLookupField('salesorder', so_id, 'trandate');
        date_delta=formatDate(date_delta, date_format, date_adj);
        //var date_delta=adjustDateByDay(new Date(nlapiLookupField('salesorder', so_id, 'trandate')), date_adj);
		item_rec.setFieldValue('trandate', date_delta);
        item_rec.setFieldValue('shipstatus', 'C');
		if (!isNullOrEmpty(ship_method)) {
			item_rec.setFieldValue('shipmethod', ship_method);
		}
		if ((item_rec=nlapiSubmitRecord(item_rec, true, true))) {
			var item_trans=nlapiLookupField('itemfulfillment', item_rec, 'tranid');
			return {
				id: item_rec,
				link: '<a target="_blank" href="'+nlapiResolveURL('RECORD', 'itemfulfillment',item_rec)+'">'+item_trans+'</a>'
			};
		}
	}
	return null;
}

function getExistingItemFulfillmentBySOID(so_id) {
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

function createInvoiceBySOID(so_id, date_adj, ship_method, date_format, raw_date) {
	if (so_id) {
		var invoice_rec=nlapiTransformRecord('salesorder', so_id, 'invoice');
        var date_delta=raw_date || nlapiLookupField('salesorder', so_id, 'trandate');
		date_delta=formatDate(date_delta, date_format, date_adj);
        //var date_delta=adjustDateByDay(new Date(nlapiLookupField('salesorder', so_id, 'trandate')), date_adj);
		invoice_rec.setFieldValue('trandate', date_delta);
		invoice_rec.setFieldValue('approvalstatus', 2);//Open
		if (!isNullOrEmpty(ship_method)) {
			invoice_rec.setFieldValue('shipmethod', ship_method);
		}
		if ((invoice_rec=nlapiSubmitRecord(invoice_rec, true, true))) {
			var invoice_trans=nlapiLookupField('invoice', invoice_rec, 'tranid');
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

function getExistingInvoiceBySOID(so_id) {
	if (isNullOrEmpty(so_id)) {
		return null;
	}
	var result_set=nlapiSearchRecord('invoice', null, [['createdfrom', 'is', so_id], 'AND', ['recordtype', 'is', 'invoice']],
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

function createPaymentByInvoiceID(invoice_id, date_adj, date_format, raw_date) {
    nlapiLogExecution('DEBUG', raw_date);
	if (invoice_id) {
		var payment_rec=nlapiTransformRecord('invoice', invoice_id, 'customerpayment');
        var date_delta=raw_date || nlapiLookupField('invoice', invoice_id, 'trandate');
		date_delta=formatDate(date_delta, date_format, date_adj);
        //var date_delta=adjustDateByDay(new Date(nlapiLookupField('invoice', invoice_id, 'trandate')), date_adj);
		payment_rec.setFieldValue('trandate', date_delta);
		var payment_trans=payment_rec.getFieldValue('tranid');
		if ((payment_rec=nlapiSubmitRecord(payment_rec, true, true))) {
			var payment_trans=nlapiLookupField('customerpayment', payment_rec, 'tranid');
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

function isNullOrEmpty(data) {
	return (data==null||data=='');
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

function decodeHTMLEntities (str) {
    var element = document.createElement('div');
    if(str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = '';
    }
    return str;
 }


function showWarningMessage() {
	var element=document.getElementById(CONFIG.msg_dashboard);
	if (element) {
		element.innerHTML='<div style="margin-top: 15px; font-size: 14px; color: #FE0000; padding: 5px;">Warning: Records are being generated. Please do not leave or reload this page until processing is finished.</div>';
		var commit_btn=document.getElementById(CONFIG.commit_btn);
		var commit_btn_2=document.getElementById(CONFIG.commit_btn_2);
		if (commit_btn && commit_btn_2) {
			commit_btn.value=commit_btn_2.value='Resume';
			commit_btn.onclick=commit_btn_2.onclick=null;
			commit_btn.style.opacity=commit_btn_2.style.opacity=0.25;
		}
		var abort_btn=document.getElementById(CONFIG.home_btn);
		var abort_btn_2=document.getElementById(CONFIG.home_btn_2);
		if (abort_btn && abort_btn_2) {
			abort_btn.value=abort_btn_2.value='Abort';
			abort_btn.onclick=abort_btn_2.onclick=function() {				
				if (confirm("This will abort the current operation. Are you sure you want to continue?")) {
					ajax_server.abort();
					//Abort Btn
					abort_btn.value=abort_btn_2.value='Back';
					abort_btn.onclick=abort_btn_2.onclick=function() {
						window.location.href=nlapiResolveURL('SUITELET', CONFIG.o2c_suitelet, CONFIG.o2c_deployment);
					};
					//Commit Btn
					if (commit_btn && commit_btn_2) {
						commit_btn.value=commit_btn_2.value='Resume';
						commit_btn.style.opacity=commit_btn_2.style.opacity=1.0;
						commit_btn.onclick=commit_btn_2.onclick=function() {
							commenceAJAXCall(ajax_url, op_rec_list);
							showWarningMessage();
						};
					}
					//Message Dashboard
					element.innerHTML='<div style="margin-top: 15px; font-size: 14px; color: #FE0000; padding: 5px;">Automation has been aborted.</div>';
					var status_txt=document.getElementById('tran_status_'+record_ctr);
					if (status_txt) {
						status_txt.innerHTML='Aborted';
					}
				}
			};
		}
	}
}

function showResult() {
	var element=document.getElementById(CONFIG.msg_dashboard);
	if (element) {
		if (success_ctr==record_size) {
			element.innerHTML='<div style="margin-top: 15px; font-size: 14px; color: #286d22; padding: 5px;">'+success_ctr+' of '+record_size+' records has been processed successfully.</div>';
		}
		else {
			element.innerHTML='<div style="margin-top: 15px; font-size: 14px; color: #286d22; padding: 5px;">'+success_ctr+' of '+record_size+' records has been processed successfully. See status and error message for details.</div>';
		}
		//Back buttons
		var home_btn=document.getElementById(CONFIG.home_btn);
		var home_btn_2=document.getElementById(CONFIG.home_btn_2);
		if (home_btn && home_btn_2) {
			home_btn.value=home_btn_2.value='Back';
			home_btn.onclick=home_btn_2.onclick=function() {
				window.location.href=nlapiResolveURL('SUITELET', CONFIG.o2c_suitelet, CONFIG.o2c_deployment);
			};
		}
		//Commit buttons
		var commit_btn=document.getElementById(CONFIG.commit_btn);
		var commit_btn_2=document.getElementById(CONFIG.commit_btn_2);
		if (commit_btn && commit_btn_2) {
			commit_btn.parentNode.style.display='none';
			commit_btn_2.parentNode.style.display='none';
		}
	}
}

//**
//Modules for P2P
//**
function callP2P_AJAXServer(po_list, ir_cb, ir_date, vb_cb, vb_date, vp_cb, vp_date) {
	if (po_list==null || po_list.length==0) {
		alert('There is no selected records to commit. Please try again.');
		return;
	}
	if (confirm('This action is irreversible. Are you sure you want to continue?')) {
		ajax_url=nlapiResolveURL('SUITELET', CONFIG.suitelet_id, CONFIG.suitelet_deployment);
		if (ir_cb!=null && ir_cb=='T') {
			ajax_url+='&'+CONFIG.cb_ir+'=T&'+CONFIG.day_ir+'='+ir_date;
		}
		if (vb_cb!=null && vb_cb=='T') {
			ajax_url+='&'+CONFIG.cb_vb+'=T&'+CONFIG.day_vb+'='+vb_date;
		}
		if (vp_cb!=null && vp_cb=='T') {
			ajax_url+='&'+CONFIG.cb_vp+'=T&'+CONFIG.day_vp+'='+vp_date;
		}
		record_ctr=0;
		record_size=po_list.length;
		success_ctr=0;
		img_loader=getFileURL(CONFIG.icon_loader);
		img_success=getFileURL(CONFIG.icon_success);
		img_error=getFileURL(CONFIG.icon_error);
		showWarning_P2PMessage();
		commenceP2P_AJAXCall(ajax_url, po_list);
		op_rec_list=po_list;
	}
}

function commenceP2P_AJAXCall(ajax_url, rec_list) {
	updateRowStatus(record_ctr);
	if (window.XMLHttpRequest) {
		ajax_server=new XMLHttpRequest();
	}
	else {
		ajax_server=new ActiveXObject('Microsoft.XMLHTTP');
	}
	ajax_server.open('POST', ajax_url+'&'+CONFIG.procure_to_pay+'='+rec_list[record_ctr], true);
	ajax_server.send();
	ajax_server.onreadystatechange=function() {
		if (ajax_server.readyState==4 && ajax_server.status==200) {
			updateP2PRow(ajax_server.responseText, record_ctr);
			record_ctr++;
			ajax_server.abort();
			if (record_ctr<rec_list.length) {
				commenceP2P_AJAXCall(ajax_url, rec_list);
			}
			else {
				showResultP2P();
			}
		}
	};
}

function updateP2PRow(data_item, index) {
	var data_json=JSON.parse(data_item);
	//Item Receipt
	var ir_txt=document.getElementById(CONFIG.row_ir+'_'+index);
	if (ir_txt) {
		if (data_json.ir_status==1) {
			ir_txt.innerHTML=decodeHTMLEntities(data_json.ir_link);
		}
		else {
			ir_txt.innerHTML=data_json.ir_error;
			ir_txt.style.color='#FE0000';
		}
	}
	//Vendor Bill
	var vb_txt=document.getElementById(CONFIG.row_vb+'_'+index);
	if (vb_txt) {
		if (data_json.vb_status==1) {
			vb_txt.innerHTML=decodeHTMLEntities(data_json.vb_link);
		}
		else {
			vb_txt.innerHTML=data_json.vb_error;
			vb_txt.style.color='#FE0000';
		}
	}
	//Vendor Payment
	var vp_txt=document.getElementById(CONFIG.row_vp+'_'+index);
	if (vp_txt) {
		if (data_json.vp_status==1) {
			vp_txt.innerHTML=decodeHTMLEntities(data_json.vp_link);
		}
		else {
			vp_txt.innerHTML=data_json.vp_error;
			vp_txt.style.color='#FE0000';
		}
	}
	if (data_json.ir_status>-1 && data_json.vb_status>-1 && data_json.vp_status>-1) {
		document.getElementById(CONFIG.row_status+'_'+index).innerHTML='<img title="Record automation success." width="20px" height="20px" src="'+img_success+'"/>';
		success_ctr++;
	}
	else {
		document.getElementById(CONFIG.row_status+'_'+index).innerHTML='<img title="Record automation success." width="20px" height="20px" src="'+img_error+'"/>';
	}
}

function showResultP2P() {
	var element=document.getElementById(CONFIG.msg_dashboard);
	if (element) {
		if (success_ctr==record_size) {
			element.innerHTML='<div style="margin-top: 15px; font-size: 14px; color: #286d22; padding: 5px;">'+success_ctr+' of '+record_size+' records has been processed successfully.</div>';
		}
		else {
			element.innerHTML='<div style="margin-top: 15px; font-size: 14px; color: #286d22; padding: 5px;">'+success_ctr+' of '+record_size+' records has been processed successfully. See status and error message for details.</div>';
		}
		//Back buttons
		var home_btn=document.getElementById(CONFIG.home_btn);
		var home_btn_2=document.getElementById(CONFIG.home_btn_2);
		if (home_btn && home_btn_2) {
			home_btn.value=home_btn_2.value='Back';
			home_btn.onclick=home_btn_2.onclick=function() {
				window.location.href=nlapiResolveURL('SUITELET', CONFIG.p2p_suitelet, CONFIG.p2p_deployment);
			};
		}
		//Commit buttons
		var commit_btn=document.getElementById(CONFIG.commit_btn);
		var commit_btn_2=document.getElementById(CONFIG.commit_btn_2);
		if (commit_btn && commit_btn_2) {
			commit_btn.parentNode.style.display='none';
			commit_btn_2.parentNode.style.display='none';
		}
	}
}

function showWarning_P2PMessage() {
	var element=document.getElementById(CONFIG.msg_dashboard);
	if (element) {
		element.innerHTML='<div style="margin-top: 15px; font-size: 14px; color: #FE0000; padding: 5px;">Warning: Records are being generated. Please do not leave or reload this page until processing is finished.</div>';
		var commit_btn=document.getElementById(CONFIG.commit_btn);
		var commit_btn_2=document.getElementById(CONFIG.commit_btn_2);
		if (commit_btn && commit_btn_2) {
			commit_btn.value=commit_btn_2.value='Resume';
			commit_btn.onclick=commit_btn_2.onclick=null;
			commit_btn.style.opacity=commit_btn_2.style.opacity=0.25;
		}
		var abort_btn=document.getElementById(CONFIG.home_btn);
		var abort_btn_2=document.getElementById(CONFIG.home_btn_2);
		if (abort_btn && abort_btn_2) {
			abort_btn.value=abort_btn_2.value='Abort';
			abort_btn.onclick=abort_btn_2.onclick=function() {				
				if (confirm("This will abort the current operation. Are you sure you want to continue?")) {
					ajax_server.abort();
					//Abort Btn
					abort_btn.value=abort_btn_2.value='Back';
					abort_btn.onclick=abort_btn_2.onclick=function() {
						window.location.href=nlapiResolveURL('SUITELET', CONFIG.p2p_suitelet, CONFIG.p2p_deployment);
					};
					//Commit Btn
					if (commit_btn && commit_btn_2) {
						commit_btn.value=commit_btn_2.value='Resume';
						commit_btn.style.opacity=commit_btn_2.style.opacity=1.0;
						commit_btn.onclick=commit_btn_2.onclick=function() {
							commenceP2P_AJAXCall(ajax_url, op_rec_list);
							showWarning_P2PMessage();
						};
					}
					//Message Dashboard
					element.innerHTML='<div style="margin-top: 15px; font-size: 14px; color: #FE0000; padding: 5px;">Automation has been aborted.</div>';
					var status_txt=document.getElementById('tran_status_'+record_ctr);
					if (status_txt) {
						status_txt.innerHTML='Aborted';
					}
				}
			};
		}
	}
}

function createIRByPOId(po_id, date_adj, date_format) {
	if (po_id) {
		var ir_id=nlapiTransformRecord('purchaseorder', po_id, 'itemreceipt');
		var date_delta=formatDate(nlapiLookupField('purchaseorder', po_id, 'trandate'), date_format, date_adj);
        //var date_delta=new Date(nlapiLookupField('purchaseorder', po_id, 'trandate'));
		//date_delta=adjustDateByDay(date_delta, date_adj);
		ir_id.setFieldValue('trandate', date_delta);
		if ((ir_id=nlapiSubmitRecord(ir_id, true))) {
			var trans_id=nlapiLookupField('itemreceipt', ir_id, 'tranid');
			return {
				id: ir_id,
				link: '<a target="_blank" href="'+nlapiResolveURL('RECORD', 'itemreceipt', ir_id)+'">'+trans_id+'</a>',
			};
		}
	}
	return null;
}

function createVBByPOId(po_id, date_adj, date_format) {
	if (po_id) {
		var vb_id=nlapiTransformRecord('purchaseorder', po_id, 'vendorbill');
		var date_delta=formatDate(nlapiLookupField('purchaseorder', po_id, 'trandate'), date_format, date_adj);
        //var date_delta=new Date(nlapiLookupField('purchaseorder', po_id, 'trandate'));
		//date_delta=adjustDateByDay(date_delta, date_adj);
		vb_id.setFieldValue('trandate', date_delta);
		vb_id.setFieldValue('approvalstatus', 2);//Approved
		if ((vb_id=nlapiSubmitRecord(vb_id, true))) {
			return {
				id: vb_id,
				link: '<a target="_blank" href="'+nlapiResolveURL('RECORD', 'vendorbill', vb_id)+'">'+vb_id+'</a>',
			};
		}
	}
	return null;
}

function createVPByBillId(po_id, bill_id, date_adj, date_format) {
	if (bill_id) {
		var vp_id=nlapiTransformRecord('vendorbill', bill_id, 'vendorpayment');
                var date_delta=formatDate(nlapiLookupField('purchaseorder', po_id, 'trandate'), date_format, date_adj);
		//var date_delta=formatDate(nlapiLookupField('vendorbill', bill_id, 'trandate'), date_format, date_adj);
		//date_delta=adjustDateByDay(date_delta, date_adj);
		vp_id.setFieldValue('trandate', date_delta);
		if ((vp_id=nlapiSubmitRecord(vp_id, true))) {
			var trans_id=nlapiLookupField('vendorpayment', vp_id, 'tranid');
			return {
				id: vp_id,
				link: '<a target="_blank" href="'+nlapiResolveURL('RECORD', 'vendorpayment', vp_id)+'">'+trans_id+'</a>',
			};
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
		return {
			id: result_set[0].getId(),
			tranid: result_set[0].getValue('tranid'),
			link: '<a target="_blank" href="'+nlapiResolveURL('RECORD', 'itemreceipt', result_set[0].getId())+'">'+result_set[0].getValue('tranid')+'</a>',
		};
	}
}

function hasExistingVB(po_id) {
	var result_set=nlapiSearchRecord('vendorbill', null, [new nlobjSearchFilter('appliedtotransaction', null, 'is', po_id)],
	                                                       null);
	if (isNullOrEmpty(result_set)) {
		return null;
	}
	else {
		return {
			id: result_set[0].getId(),
			link: '<a target="_blank" href="'+nlapiResolveURL('RECORD', 'vendorbill', result_set[0].getId())+'">'+result_set[0].getId()+'</a>',
		};
	}
}

function hasExistingVP(bill_id) {
	var result_set=nlapiSearchRecord('vendorpayment', null, [new nlobjSearchFilter('createdfrom', null, 'anyof', bill_id)],
															[new nlobjSearchColumn('tranid')]);
	if (isNullOrEmpty(result_set)) {
		return null;
	}
	else {
		return {
			id: result_set[0].getId(),
			link: '<a target="_blank" href="'+nlapiResolveURL('RECORD', 'vendorpayment', result_set[0].getId())+'">'+result_set[0].getValue('tranid')+'</a>',
		};
	}
}

function isBilled(bill_id) {
	var result_set=nlapiSearchRecord('vendorpayment', null, [new nlobjSearchFilter('createdfrom', null, 'anyof', bill_id)],
															[new nlobjSearchColumn('tranid'), new nlobjSearchColumn('total')]);
	var amount=0.0;
	for (var i=0;result_set && i<result_set.length;i++) {
		amount+=parseFloat(result_set[i].getValue('total'));
	}
	var balance=nlapiLookupField('vendorbill', bill_id, 'total');
	balance=isNullOrEmpty(balance)?0.0:parseFloat(balance);
	return (balance+amount==0);
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

function isFulfilledPartially(so_id) {
	var so_rec=nlapiLoadRecord('salesorder', so_id);
	if (so_rec) {
		var so_status=so_rec.getFieldValue('status');
		return (so_status=='Partially Fulfilled' || so_status=='Pending Billing/Partially Fulfilled');
	}
	return false;
}

function isBilledPartially(so_id) {
	var so_rec=nlapiLoadRecord('salesorder', so_id);
	if (so_rec) {
		var so_status=so_rec.getFieldValue('status');
		return (so_status=='Partially Billing/Partially Fulfilled' || so_status=='Pending Billing');
	}
	return false;
}

function isPaid(invoice_id) {
	var amount_to_pay=nlapiLookupField('invoice', invoice_id, 'amountremaining');
	if (!isNullOrEmpty(amount_to_pay) && parseFloat(amount_to_pay)==0.00) {
		return true;
	}
	return false;
}

function isReceivedPartially(po_id) {
	var status=nlapiLookupField('purchaseorder', po_id, 'status', true);
	if (status=='Partially Received') {
		return true;
	}
	return false;
}

function getFileURL(filename) {
	var file=nlapiSearchGlobal('file:'+filename);
	if (file!=null && file!='' && filename.length>0) {
		return nlapiLookupField('file', file[0].getId(), 'url');
	}
	return '';
}

function formatDate(raw_date, date_format, date_adj) {
  var separator=/[^A-Za-z0-9 ]/gi.exec(raw_date);
  if (separator && separator.length>0) {
    var date_parts=raw_date.split(separator);
    var new_date=new Date();
    if (date_format=='MM/DD/YYYY') {
      new_date.setFullYear(date_parts[2], parseInt(date_parts[0])-1, date_parts[1]);
    }
    else if (date_format=='YYYY/MM/DD' || date_format=='YYYY-MM-DD') {
      new_date.setFullYear(date_parts[0], parseInt(date_parts[1])-1, date_parts[2]);
    }
    else if (date_format=='DD-MONTH-YYYY' || date_format=='DD-Mon-YYYY') {
      new_date.setFullYear(date_parts[2], monthToNumber(date_parts[1]), date_parts[0]);
    }
    else if (date_format=='DD MONTH, YYYY') {
      var mon_date_part=date_parts[0].split(' ');
      new_date.setFullYear(date_parts[1], monthToNumber(mon_date_part[1]), mon_date_part[0]);
    }
    else if (date_format=='DD/MM/YYYY' || date_format=='DD.MM.YYYY') {
      new_date.setFullYear(date_parts[2], parseInt(date_parts[1])-1, date_parts[0]);
    }
    return nlapiDateToString(nlapiAddDays(new_date, date_adj), 'date');
  }
  else {
    throw "Invalid date or date format given.";
  }
}

function monthToNumber(month) {
    month=month.substring(0, 3).toLowerCase();
  switch (month) {
    case 'jan':
      return 0;
    case 'feb':
      return 1;
    case 'mar':
      return 2;
    case 'apr':
      return 3;
    case 'may':
      return 4;
    case 'jun':
      return 5;
    case 'jul':
      return 6;
    case 'aug':
      return 7;
    case 'sep':
      return 8;
    case 'oct':
      return 9;
    case 'nov':
      return 10;
    case 'dec':
      return 11;
  }
}