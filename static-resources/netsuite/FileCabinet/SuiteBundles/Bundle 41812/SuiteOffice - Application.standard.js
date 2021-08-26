//** Initialize QSDefines
var QSDefines = QSDefines || {};

/**
 * 	- This function Search as you type (part number).
 * 
 * @param   [String keywords]
 * @returns [JSON.stringify()]
 * @author Alfonso Terron
 * 
 **/
function searchitemkeywords(){
	
	try{
		
		var keywords  = request.getParameter('keywords') || '',
		limit         = request.getParameter('limit') || 10,
		results       = [];
		
		var filters_array = [
			new nlobjSearchFilter('isinactive', null, 'is', 'F'),
			new nlobjSearchFilter('isonline', null, 'is', 'T'),
			new nlobjSearchFilter('custitem_wd_cust_keywords', null, 'startswith', keywords).setOr(true),
			new nlobjSearchFilter('custitem_wd_cust_keywords', null, 'contains', keywords).setOr(true),
			new nlobjSearchFilter('custitem_wd_cust_keywords', null, 'haskeywords', keywords)
		],
		
		columns_array = [		         
			new nlobjSearchColumn( 'storedisplayname' ),
			new nlobjSearchColumn( 'storedisplaythumbnail' ),
			new nlobjSearchColumn( 'itemurl' ),
			new nlobjSearchColumn( 'onlinecustomerprice' )
		];
				
		if (siteid) filters_array.push(new nlobjSearchFilter('website', null, 'is', siteid), new nlobjSearchFilter('website', null, 'isnotEmpty', '@NONE@'));
		
		results	= nlapiSearchRecord('item', 'customsearch_wd_all_items', filters_array, columns_array);	
		
		if(!results || !results.length > 0){ modelError('Items not found'); return;	}
		
		response.write( retrieveObj( results.slice(0,limit), true) );
		
	}catch(e){ modelError('searchItemKeyeords: ' + e); }	
};

/**
 * 	- This function create a quote record to customer.
 * 
 * @param   [Object info]
 * @returns [JSON.stringify()]
 * @author Alfonso Terron
 * 
 **/
function createAQuote(){

	try {

		var info = request.getParameter('info') || null,
		wdconfig = request.getParameter('wdconfig');
		
		if(info && wdconfig){
			
			info = JSON.parse(info);
						
			/** Load Configuration **/			
			var arrAttributes = [ "custrecord_wd_config_cq_sender", "custrecord_wd_config_internalrecive", "custrecord_wd_config_cq_subjectemail", "custrecord_wd_config_cq_templateemail", "custrecord_wd_config_cq_confirmmsg"],			
			config = nlapiGetWDConfiguration(wdconfig, arrAttributes);
			
			sender         = config.custrecord_wd_config_cq_sender.internalid,
			internalrecive = config.custrecord_wd_config_internalrecive.internalid,
			subject        = config.custrecord_wd_config_cq_subjectemail,
			emailTemp      = config.custrecord_wd_config_cq_templateemail.internalid,			
			cusEmail       = nlapiLookupField('customer', info.customer, 'email');
			
			estimate = nlapiCreateRecord('estimate');			
			estimate.setFieldValue('entity', info.customer);
			estimate.setFieldValue('message', info.message);
			
			shipaddress = estimate.getFieldValue('shipaddress');
			
			if(!shipaddress) {
				estimate.setFieldValue('shipmethod', '');
				estimate.setFieldValue('shippingcost', '0.00');
				estimate.setFieldValue('shippingcostoverridden', 'T');
			}
			
			var content = "";
			for(i in info.items){
				estimate.selectNewLineItem('item');
				estimate.setCurrentLineItemValue('item', 'item'    , info.items[i].internalid);
				estimate.setCurrentLineItemValue('item', 'quantity', info.items[i].qty);
				estimate.commitLineItem('item');
				
				content += '<tr>';
					content += '<td valign="top" class="lined" align="right" nowrap="nowrap">'+info.items[i].qty+'</td>';
					content += '<td valign="top" class="lined">'+ nlapiLookupField('item', info.items[i].internalid, 'itemid') +'</td>';
					content += '<td valign="top" class="lined">'+ nlapiLookupField('item', info.items[i].internalid, 'displayname') +'</td>';
				content += '</tr>';				
			}
			
			esid = nlapiSubmitRecord(estimate);
			
			var emailBody = getCreateQuoteTemplate( emailTemp, esid);
			customerName  = nlapiLookupField('customer', info.customer, 'companyname');
			customerName  = (customerName && customerName != '' )? customerName : nlapiLookupField('customer', info.customer, 'firstname')+' '+nlapiLookupField('customer', info.customer, 'lastname');
									
			emailBody = emailBody.replace(/{{itemlist}}/ig,content).replace(/{{customername}}/ig, customerName);
			
			var records = new Object();
			records['transaction'] = esid;
			
			nlapiSendEmail(sender, internalrecive, subject, emailBody, null, null, records);
						
			nlapiSendEmail(sender, cusEmail, subject, emailBody, null, null, records);
		
			jsonResponse.results[0] = {htmlText: encodeURI(config.custrecord_wd_config_cq_confirmmsg)};
			
		}
				
		response.write(JSON.stringify(jsonResponse));
	
	} catch(e){ modelError('createAQuote: ' + e); }
}

/**
 * 	- Get create quote template.
 * 
 * @param   []
 * @returns [String]
 * @author Alfonso Terron
 * 
 **/
function getCreateQuoteTemplate(emailTemp, esid){
	try{

		var EstimateId = esid || request.getParameter('estID'),
		tempID         = emailTemp || request.getParameter('tempID'),
		value,
		//** Load Estimate to read tranid and duedate LookupFied not run **/
		estimate       = nlapiLoadRecord('estimate', EstimateId),
		dueDate        = estimate.getFieldValue('duedate'),
		tranid         = estimate.getFieldValue('tranid');
		
		nlapiLogExecution('ERROR', 'estimate', JSON.stringify(estimate));
		
		value = (nlapiMergeRecord( tempID, 'estimate', EstimateId ).getValue() || '').replace(/{{tranid}}/ig, tranid)
		 																		     .replace(/{{duedate}}/ig, dueDate);		
		if(emailTemp)
			return value;
		else
			response.write(value);
		
	}catch(e){ modelError('getCreateQuoteTemplate: ' + e); }	
}