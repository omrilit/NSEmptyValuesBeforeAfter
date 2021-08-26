/** SuiteScript for NetSuite/OpenAir real-time synchronization
 * @author OpenAir system integration
 */

// called after Submit
function afterSubmitSendToOpenAir (type)
{
	// get the record type 
	var recordType = nlapiGetRecordType(); 

	// is this record supposed to export to OpenAir?
	var exportToOpenAir = isRecordMarkedExportToOpenAir(recordType);	
		
	// is this from a UI triggered event?
	var ctx = nlapiGetContext();
	var executionContext = ctx.getExecutionContext();
	var errorEmail = ctx.getPreference('custscript_oa_realtime_email');
	var realtimeEnabled = ctx.getPreference('custscript_oa_realtime_enable');
	var ssoRecord = ctx.getPreference('custscript_oa_realtime_sso_record');

	// check if realtime enabled
	if (realtimeEnabled != 'T') 
	{
		return;
	}

	// get the custom record that indicates what else needs to be synched
	var recordSynch = nlapiLoadRecord('customrecord_oa_record_type_synch',1);
	
	// Leads and prospects that should be synched in realtime should be treated as customer records
	if (recordType == 'lead' || recordType == 'prospect')
	{	
		recordType = checkLeadProspectSynch(recordType);
	}
			
	/* Limit the callout to synchronize with OpenAir to the following:
	 * supported record types
	 * record was either created or edited
	 * record is flagged 'Export to OpenAir'
	 * the record change occurred in the UI
	*/

	if ( (realtimeEnabled == 'T') && 
		 (isRecordTypeExportAble(recordType)) && 
		 (type == 'create' || type == 'edit' || type == 'xedit') &&
		 (exportToOpenAir == 'T') && 
		 (executionContext == 'userinterface') ) 
	{
		
		// log the request to audit
		var auditLogMessage = 'Send ' + recordType + ' ' + nlapiGetFieldValue('id') + ' to OpenAir';
		nlapiLogExecution('AUDIT', 'Send to OpenAir', auditLogMessage);
		
		// check what else needs to be synched
		var recordTypes = ssoRecordTypeMap('ALL'); 

		// We test two things here 
		// 1) are there other record types to be sync'd? 
		// 2) are there records related to this record that are supposed to export to OpenAir? 		
		// Note: currently related records is limited only to customer payments on allows credits and deposits 
		// to be applied when the customer payment is created 
		var otherTypesToSynch = getOtherTypesToSynch(recordType);		
		var otherTypeArray = new Array ();
		for (var i = 0; i < recordTypes.length; i++) 
		{
			var fieldName = 'custrecord_oa_synch_' + recordTypes[i].toLowerCase();
			if (recordSynch.getFieldValue(fieldName) === 'T' || otherTypesToSynch[fieldName] === 'T')
			{	
				otherTypeArray.push(mapTerminology(recordTypes[i]));	
			}
		}
		var other_types = otherTypeArray.join('%2C');
	
		// get the SuiteSignOn URL
	    var ssoURL = nlapiOutboundSSO(ssoRecord); 	

		// get information about this current record
		var recordId = nlapiGetRecordId();
		var userId = nlapiGetUser();

		// map NS record type to OA record type if type names are different
		oaRecordType = mapTerminology(recordType);

	  	// add the above params to the link
		ssoURL = ssoURL + '&record_type=' + oaRecordType + '&ns_id=' + recordId + '&netsuite_user_id=' + userId + '&other_types=' +  other_types;
		nlapiLogExecution('AUDIT', 'Link for ' + auditLogMessage, ssoURL);
	
		// header array 
		var a = new Array();
	    a['User-Agent-x'] = 'SuiteScript-Call';
		
		// send request to OpenAir to synch
	    var response = nlapiRequestURL( ssoURL, null, a, null); 	
		var responseBody = response.getBody();
		
		/* Parse the response 
		 * 1. Was the call successful 
		 * 2. Which types did not synch properly?
		 * 3. Reset the custom record that holds the state based on the response
		 */
		var responseMessage = '\n';
		var sendEmail = 0;

		if (responseBody.match(/(Error:.*)/) )
		{
			responseMessage = responseMessage + RegExp.$1 + '<br>\n';
			nlapiLogExecution('ERROR', 'Error from OpenAir', responseMessage);
			sendEmail = 1;
		}
			 
		// parse the response received from NetSuite OpenAir
		var responseStatus = responseMessageHandler(responseBody, recordType);

        // set custom record field and value 
		for (var k = 0; k < responseStatus.custrecord.length; k++)
		{
			var custRecordTemp = responseStatus.custrecord[k];
			recordSynch.setFieldValue(custRecordTemp['field'], custRecordTemp['value']);
		}
		
		      
        // setup response message and also email 
        responseMessage = responseMessage + responseStatus.responseText;
        sendEmail = responseStatus.sendEmail;
        
		// save the custom record
		nlapiSubmitRecord(recordSynch);	
		
		// send email notification if there is an error
		if (sendEmail === 1)
		{
			responseMessage = responseMessage + '<br><br>\n\n';			
			nlapiSendEmail(userId, errorEmail, 'OpenAir synchronization request', responseMessage);    
		}
	}
}

/* Maps the NetSuite record type to the OpenAir record terminology
 * @param string recordType, NetSuite record type of what is being operated on 
 * @return string recordType, the corresponding OpenAir record terminology
 */
function mapTerminology (recordType) 
{
	switch (recordType)
	{
		case 'employee':
			recordType = 'user';
			break;
		case 'lead':
			recordType = 'customer';
			break;
		case 'prospect':
			recordType = 'customer';
			break;
		case 'job':
			recordType = 'project';
			break;
        case 'customrecord_oa_project_rate_card':
            recordType = 'rate_card';
            break;
        case 'projectTask':
        case 'projecttask':
            recordType = 'project_task';
            break;
        case 'assemblyitem': 
        case 'descriptionitem': 
        case 'discountitem': 
        case 'inventoryitem': 
        case 'kititem': 
        case 'markupitem':     
        case 'otherchargeitem': 
        case 'serviceitem': 
        case 'serializedassemblyitem': 
        case 'serializedinventoryitem': 
        case 'shipitem': 
        case 'subtotalitem': 
        	var subType = nlapiGetFieldValue('subtype');
        	if (subType === 'Purchase')
        	{
        		recordType = 'product';		
        	}
        	else 
        	{
        		recordType = 'category';		
        	}
        	
        	break; 
        case 'expensecategory': 
        	recordType = 'item';
        	break; 
        case 'salesorder': 
        	recordType = 'customerpo';
        	break; 
        case 'creditmemo': 
        	recordType = 'credit';
        	break; 
        case 'customerpayment': 
        	recordType = 'payment';
        	break; 
        case 'depositapplication': 
        	recordType = 'retainer';
        	break; 
        case 'vendorpayment': 
        	recordType = 'reimbursement';
        	break;
        case 'customrecord_oa_cost_center':
        	recordType = 'cost_center';
        	break; 
	}	
	return recordType;
}

/* Construct a JavaScript object of the metadata needed for this sync
 * @param string recordType, NetSuite record type of what is being operated on 
 * @return object or undefined, object = the JS object of metadata corresponding to our NetSuite record type
 */
function ssoRecordTypeMap (recordType)
{
	var recordTypeMap = 
	{
		"employee" : { "custrecord_field" : "custrecord_oa_synch_employee",
					   "export_oa_field" : "custentity_oa_export_to_openair", 
					   "record_text" : "employee", 
					 },
					 
		"lead" :     { "custrecord_field" : "custrecord_oa_synch_lead",
					   "export_oa_field" : "custentity_oa_export_to_openair", 
					   "record_text" : "lead", 
					  },					 
		"prospect" :     { "custrecord_field" : "custrecord_oa_synch_lead",
						   "export_oa_field" : "custentity_oa_export_to_openair", 
						   "record_text" : "prospect", 
						  },					 					 
		"customer" : { "custrecord_field" : "custrecord_oa_synch_customer",
					   "export_oa_field" : "custentity_oa_export_to_openair", 
					   "record_text" : "customer", 
					  },
		"job" : 	{ "custrecord_field" : "custrecord_oa_synch_project",
					   "export_oa_field" : "custentity_oa_export_to_openair", 
					   "record_text" : "project", 
					 },							 
		"expensecategory" : 	{ "custrecord_field" : "custrecord_oa_synch_expensecategory",
					  			  "export_oa_field" : "ALWAYS", 
					  			  "record_text" : "expense item", 
					 		    },	
		"supportcase" : { "custrecord_field" : "custrecord_oa_synch_supportcase",
						  "export_oa_field" : "custevent_oa_export_to_openair",
						  "record_text" : "support case", 
						},		
		"projecttask" : { "custrecord_field" : "custrecord_oa_synch_projecttask",
						  "export_oa_field" : "custevent_oa_export_to_openair",
						  "record_text" : "project task", 
						},							
		"serviceitem" : { "custrecord_field" : "custrecord_oa_synch_item",
						  "export_oa_field" : "custitem_oa_export_to_openair",
						  "record_text" : "item", 
						},	
		"serviceitem_purchase" : { "custrecord_field" : "custrecord_oa_synch_item",
						  	       "export_oa_field" : "custitem_oa_export_to_openair_product",
						           "record_text" : "item", 
						         },	
		"customrecord_oa_project_rate_card" : { "custrecord_field" : "custrecord_oa_synch_rate_card",
			  									"export_oa_field" : "ALWAYS",
			  									"record_text" : "rate card", 
											  },	
		"vendor" : { "custrecord_field" : "custrecord_oa_synch_vendor",
			  		 "export_oa_field" : "custentity_oa_export_to_openair",
			  		 "record_text" : "vendor", 
				   },	
		"vendorbill" : { "custrecord_field" : "custrecord_oa_synch_vendorbill",
			  		     "export_oa_field" : "custbody_oa_export_to_openair",
			  		     "record_text" : "vendor bill", 
				       },	
		"purchaseorder" : { "custrecord_field" : "custrecord_oa_synch_purchaseorder",
			  		        "export_oa_field" : "custbody_oa_export_to_openair",
			  		        "record_text" : "purchase order", 
				          },	
		"salesorder" : { "custrecord_field" : "custrecord_oa_synch_salesorder",
			  		     "export_oa_field" : "CUSTOM",
			  		     "record_text" : "sales order", 
				       },	
		"creditmemo" : { "custrecord_field" : "custrecord_oa_synch_creditmemo",
			  		     "export_oa_field" : "CUSTOM",
			  		     "record_text" : "credit memo", 
				       },	
		"customerpayment" : { "custrecord_field" : "custrecord_oa_synch_customerpayment",
			  		          "export_oa_field" : "CUSTOM",
			  		          "record_text" : "invoice payment", 
			  		          "other_synch_types" : ['creditmemo', 'depositapplication'], 
				            },	
   		"depositapplication" : { "custrecord_field" : "custrecord_oa_synch_customerdeposit",
			  		          "export_oa_field" : "CUSTOM",
			  		          "record_text" : "customer deposit", 
				            },	
    	"vendorpayment" : { "custrecord_field" : "custrecord_oa_synch_vendorpayment",
		 	  		        "export_oa_field" : "CUSTOM",
				  		    "record_text" : "expense reimbursement", 
					      },	
    	"customrecord_oa_cost_center" : { "custrecord_field" : "custrecord_oa_synch_cost_center",
		 	  		        			  "export_oa_field" : "ALWAYS",
		 	  		        			  "record_text" : "cost center", 
					      				},	
	};
	
	var recordTypeMapProperty = recordType.toLowerCase();
	
	if (recordType === 'ALL') 
	{
		return Object.keys(recordTypeMap);
	}
	else if (recordType.match(/item$/))
	{
		
		// some items can be brought over as products, others as services
		var subType = nlapiGetFieldValue('subtype');
		if (subType === 'Purchase')
		{
			return recordTypeMap['serviceitem_purchase'];	
		}
		else 
		{
			return recordTypeMap['serviceitem'];	
		}
	}
	else if (recordTypeMap.hasOwnProperty(recordTypeMapProperty))
	{
		return recordTypeMap[recordTypeMapProperty]; 
	}
	else 
	{
		return undefined; 
	}
	
}


/* Determines if the NetSuite record type is supposed in this synchronization. 
 * @param string recordType, NetSuite record type of what is being operated on 
 * @return boolean 
 */
function isRecordTypeExportAble (recordType)
{
	
	var ssoTypesAndCustomFields = ssoRecordTypeMap(recordType); 
	if (typeof ssoTypesAndCustomFields === 'object') 
	{
		return ssoTypesAndCustomFields.hasOwnProperty('export_oa_field');		
	}
	else 
	{
		return false; 
	}

}

/* Determines if the NetSuite record type is flagged 'Export to OpenAir' 
 * @param string recordType, NetSuite record type of what is being operated on 
 * @return string, 'T' or 'F'
 */
function isRecordMarkedExportToOpenAir (recordType)
{

	var exportToOpenAirCF = getrecordTypeConfigOption(recordType,'export_oa_field');
		
	if (exportToOpenAirCF === 'ALWAYS')
	{
		return 'T'; 
	}
	else if (exportToOpenAirCF === 'CUSTOM')
	{
		if (recordType === 'salesorder')
		{
			return isSalesOrderExportable();
		}
		if (recordType === 'creditmemo' || recordType === 'customerpayment' || recordType === 'depositapplication' || recordType === 'vendorpayment')
		{
			return isRelatedTransactionExportable(recordType);
		}
	}
	else 
	{
		return nlapiGetFieldValue(exportToOpenAirCF);	
	}
	
}

/* Determine if a sales order should be exported to NetSuite based on the line items 
 * @param null
 * @return string, 'T' or 'F'
 */

function isSalesOrderExportable () 
{
	var lineItemCount = nlapiGetLineItemCount('item');
	var isExportable = 'F';
	for (var linenum = 1; linenum <= lineItemCount; linenum++) 
	{
		var oaBillingRule = nlapiGetLineItemValue('item', 'custcol_oa_billing_rule_type', linenum);		
		if (oaBillingRule === '1' || oaBillingRule === '2' || oaBillingRule === '3')
		{
			isExportable = 'T';
			break;
		}
	}
	
	return isExportable; 
}

/* Is there a transaction related to this record type that came from OpenAir? 
 * Check the "apply" sublist
 * @param null
 * @return string, 'T' or 'F'
 */
function isRelatedTransactionExportable(recordType)
{
	var isExportable = 'F';
	var lineItemCount = nlapiGetLineItemCount('apply');

	// default to invoice for invoice payments
	var lookupTrans = 'invoice';
	var lookupTransCF = 'custbody_oa_invoice_number';
	
	// if this is a vendor payment, check expense reports, then vendor bills 
	if (recordType === 'vendorpayment')
	{
		lookupTrans = 'expensereport';
		lookupTransCF = 'custbody_oa_expense_report_number';
	}
	
	
	// iterate over each line of the apply sublist
	// if the line has been applied to an OA record, then this recordType is exportable to OA
	for (var linenum = 1; linenum <= lineItemCount; linenum++) 
	{
		var transInternalID = nlapiGetLineItemValue('apply', 'doc', linenum);	
		var appliedToTransaction = nlapiGetLineItemValue('apply', 'apply', linenum);	
		var oaTransNumber = '';
		if (appliedToTransaction === 'T')
		{
			oaTransNumber = nlapiLookupField(lookupTrans, transInternalID, lookupTransCF);	
			
			if (oaTransNumber === null && recordType === 'vendorpayment')
			{
				lookupTrans = 'vendorbill';
				oaTransNumber = nlapiLookupField(lookupTrans, transInternalID, lookupTransCF);
			}
		}

		if (oaTransNumber === null)
		{
			oaTransNumber = ''; 
		}
		
		// if something is exportable, no need to check rest of the list
		// because we have at least one transaction from OA that this recordType has been applied to
		// check the OA invoice number custom field for a value; if there is one, it came from OA
		if (oaTransNumber.length > 0)
		{
			isExportable = 'T';
			break; 
		}
	}		

	return isExportable; 
}

/* Set related record types that should also be integrated with recordType 
 * @param string recordType, NetSuite record type of what is being operated on 
 * @return object, object = the JS object of the synch custom record fields that should also be synched
 */
function getOtherTypesToSynch(recordType) 
{
	
	var otherTypesToSynch = {}; 
	var allRecordTypes = ssoRecordTypeMap('ALL'); 
	for (var i = 0; i < allRecordTypes.length; i++) 
	{
		var fieldname = getrecordTypeConfigOption(allRecordTypes[i], 'custrecord_field');
		otherTypesToSynch[fieldname] = 'F';
	}

	// limit this only to customerpayment type for now
	if (recordType === 'customerpayment')
	{
		var otherRecTypes = getrecordTypeConfigOption(recordType, 'other_synch_types'); 
		for (var recTypesNum = 0; recTypesNum < otherRecTypes.length; recTypesNum++)
		{
			var otherRec = otherRecTypes[recTypesNum];
			var oaSyncCustRecordField = getrecordTypeConfigOption(otherRec, 'custrecord_field'); 
			otherTypesToSynch[oaSyncCustRecordField] = 'T'; 
		}
	}
		
	return otherTypesToSynch;
}

/* Get the correct metadata value from the JavaScript configuration object. 
 * @param string recordType, NetSuite record type of what is being operated on
 * @param string configKey, the configuration option key that we need  
 * @return string or undefined 
 */
function getrecordTypeConfigOption (recordType, configKey) 
{

	var recordTypeConfig = ssoRecordTypeMap(recordType); 
	if (typeof recordTypeConfig === 'object' && recordTypeConfig.hasOwnProperty(configKey)) 
	{
		return recordTypeConfig[configKey]; 
	}
	else 
	{
		return undefined; 
	}
	
}


/* Leads and prospects can also be sync'd and determine what is the correct synchronization record type to use. 
 * @param string recordType, NetSuite record type of what is being operated on 
 * @return string recordType, to use with the integration 
 */
function checkLeadProspectSynch (recordType) 
{
	var ctx = nlapiGetContext();	
	
	// are leads and/or prospects realtime?
	var leadEnabled = ctx.getPreference('custscript_oa_realtime_include_lead');	
    var prospectEnabled = ctx.getPreference('custscript_oa_realtime_include_prospect');			

	// is the status changing?
    var entityStatus = nlapiGetFieldValue('entitystatus');
    var entityStatusFld = nlapiGetField('entitystatus');
	var selectOptions = entityStatusFld.getSelectOptions();

	if (leadEnabled == 'T' && recordType == 'lead')
	{
		recordType = 'customer';
	} 
	else if (prospectEnabled == 'T')
	{
		if (recordType == 'prospect')
		{
			recordType = 'customer';
		}
		else if (recordType == 'lead')
		{
			// is the status going from lead to prospect and we are synching prospects?
	        for (var cnt = 0; cnt < selectOptions.length; cnt++) 
			{			
				if (selectOptions[cnt].getId() == entityStatus && selectOptions[cnt].getText().substring(0,1) == 'P') 
				{
					recordType = 'customer';
					break;
				}
	        }
		}
	}
	
	// is this a lead or prospect changing status to customer?
	if (recordType != 'customer') 
	{
        for (var cnt = 0; cnt < selectOptions.length; cnt++) 
		{					
			if (selectOptions[cnt].getId() == entityStatus && selectOptions[cnt].getText().substring(0,1) == 'C') 
			{
				recordType = 'customer';
				break;
			}
        }
	}

	return recordType;
}

/* Parse and handle the response from OpenAir  
 * @param string responseBody, the response from OpenAir 
 * @param string recordType, NetSuite record type of what is being operated on 
 * @return string or undefined 
 */
function responseMessageHandler (responseBody, recordType)
{

	// default object to return 
	var responseStatus = 
	{
		"responseText" : "",
		"sendEmail" : 0,
		"custrecord" : [], 
	};	
		
	// get the OA record type terminology for this NS record type 
	var oaRecordType = mapTerminology(recordType);
	
	// look for oaRecordType in the response body 
	var oaRecordTypeTrue = oaRecordType + "=T";
	var oaRecordTypeFalse = oaRecordType + "=F";

	// what is the field name on the custom record? 	
	var syncCustField = getrecordTypeConfigOption(recordType,'custrecord_field');
		
	// look at the response for each record type and set values
	 if (responseBody.match(oaRecordTypeTrue))
     {
                 
  	 	   var setCustRecord = { 'field' : syncCustField, 
						         'value' : 'F'
						       };
  	 	   responseStatus.custrecord.push(setCustRecord);
     }           
	 else if (responseBody.match(oaRecordTypeFalse))
     {

		   	// custom record field to set and value and send an email  
	 		var setCustRecord = { 'field' : syncCustField, 
			                      'value' : 'T'
			                    };
	
	 		responseStatus.custrecord.push(setCustRecord);
	 		responseStatus.sendEmail = 1;
           
           // terminology for this record type           
           var recordTerm = getrecordTypeConfigOption(recordType, 'record_text'); 
           
           // response message 
           responseStatus.responseText = 'Requests to synchronize NetSuite ' + recordTerm + ' records with OpenAir are currently not allowed by the integration.<br>\n';
           nlapiLogExecution('ERROR', 'Error with ' + recordTerm + ' synch from OpenAir', responseStatus.responseText);
     }   
	
	 // Since all record types that were sync'd are in the response, not just recordType, 
	 // look at the other record types that might also have been possibly sync'd and 
	 // determine if these were successful or not 
     // add other record types that need to be synched 
     var otherTypes = ssoRecordTypeMap('ALL'); 
     for (var j = 0; j < otherTypes.length; j++)
     {
  	   var otherRecTypeCompare = otherTypes[j];
  
  	   // we already looked at our record 
  	   if (recordType != otherRecTypeCompare)
  	   {
  		   var otherRecTypeTerm = getrecordTypeConfigOption(otherRecTypeCompare, 'record_text'); 
  		   var otherSyncCustField = getrecordTypeConfigOption(otherRecTypeCompare,'custrecord_field');
  		   var oaOtherRecordType = mapTerminology(otherRecTypeCompare);
             		   
  			// look for oaOtherRecordType in the response body 
  			var oaOtherRecordTypeTrue = oaOtherRecordType + "=T";
  			var oaOtherRecordTypeFalse = oaOtherRecordType + "=F";
  		   
  			if (responseBody.match(oaOtherRecordTypeTrue))
  		    {
  	  	 	   var setCustRecord = { 'field' : otherSyncCustField, 
				                     'value' : 'F'
				                   };
  	  	 	   responseStatus.custrecord.push(setCustRecord);
  		    }
  			else if (responseBody.match(oaOtherRecordTypeFalse))
  			{
   	  	 	   var setCustRecord = { 'field' : otherSyncCustField, 
   	  	 			                 'value' : 'T'
	                               };
   	  	 	   responseStatus.custrecord.push(setCustRecord);
   	  	 	   responseStatus.sendEmail = 1;   				
   	  	 	   
   	  	 	   // set the response message 
               otherRecTypeTerm = otherRecTypeTerm.charAt(0).toUpperCase() + otherRecTypeTerm.slice(1);
      		   responseStatus.responseText = responseStatus.responseText + ' ' + otherRecTypeTerm + ' records are also queued to be synchronized with NetSuite OpenAir. ';  	  	 	   
  			}
  	   }
     }
	 
	 return responseStatus; 
}




