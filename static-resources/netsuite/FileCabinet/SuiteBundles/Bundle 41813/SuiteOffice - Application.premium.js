//** Initialize QSDefines
var QSDefines = QSDefines || {};

/**
 * 	- This function load data to compare products
 * functionality.
 * 
 * @param   [Object data, Int sitecategoryid]
 * @returns [JSON.stringify()]
 * @author  Alfonso Terron
 * 
 **/
function compareProducts(){
	
	try{
		
		var items  = request.getParameter('data'),
		siteCatID = request.getParameter('cat');
		
		items = (items && items != 'undefined')? JSON.parse(items):null;
		 
		if(items){
			
			var filters = [ new nlobjSearchFilter('custrecord_category', null, 'anyof', siteCatID) ],			
			result      = nlapiSearchRecord( 'customrecord_wd_compare', 'customsearch_wd_compare_products', filters);

			if(result && result.length){

				result              = JSON.parse(JSON.stringify(result[0])),
				jsonResponse.fields = [];
				filters             = siteid ? [ new nlobjSearchFilter('website', null, 'is', siteid) ] : [];
				
				//nlapiLogExecution('ERROR', 'compareFields', JSON.stringify(result));
				
				var columnsSearch   = [];
				jsonResponse.fields = JSON.parse(result.columns['custrecord_hash_fields'] || "[]");

				filters.push( new nlobjSearchFilter('internalid', null, 'is', items) );
				
				//* Defaults Columns.
				columnsSearch.push(new nlobjSearchColumn( 'storedisplaythumbnail' ));
				columnsSearch.push(new nlobjSearchColumn( 'storedisplayname' ));				
				columnsSearch.push(new nlobjSearchColumn( 'itemurl' ));
				
				jsonResponse.fields.push( { id:'storedescription', name:'Description', position: -1 } );
				
				
				for(var i=0; i < jsonResponse.fields.length; i++){
					var field  = jsonResponse.fields[i];					
					columnsSearch.push(new nlobjSearchColumn( field.id ));
				}
				
				//** Field Not Loading.
				//jsonResponse.fields.push( { id:'quantityprice', name:'Price', position: -2 } );
				
				//** Sort Compare Fields
				jsonResponse.fields.sort(function(a,b){ return parseInt(a.position)>parseInt(b.position);});
				
				var items = nlapiSearchRecord( 'item', null, filters, columnsSearch);
				response.write(retrieveObj(items,true));

			}else{ modelError('compareProducts: Compare Category is empty.'); }
		}
	}catch(e){ modelError('compareProducts: ' + e); }
}

/**
 * 	This function implement Lead Time functionality. 
 * 
 * @param   [params]
 * @returns [JSON.stringify()]
 * @author Alfonso Terron
 * 
 **/
function getLeadTime(){
	try{
		
		var itemsIDs        = (request.getParameter('iids'))? JSON.parse(request.getParameter('iids')) : '',
		lt_pastdate_msg     = 'Next Available Day',
		lt_currenttdate_msg = 'Currently being received';

		/**
		Load Items requested
		**/
		var arrfilters = [
		                new nlobjSearchFilter('internalid', null, 'is', itemsIDs)
		],
		arrColumns     = [
		                new nlobjSearchColumn( 'name' ),
			   			new nlobjSearchColumn( 'quantityavailable' ),
			   			new nlobjSearchColumn( 'outofstockmessage' ),
			   			new nlobjSearchColumn( 'leadtime' )
		];
		
		if (siteid) arrfilters.push(new nlobjSearchFilter('website', null, 'is', siteid));
		
	    arrItemsResult = nlapiSearchRecord('item', null, arrfilters, arrColumns);
		/**
		END
		**/
			
		if(arrItemsResult != null){
			
			for(var i = 0; i < arrItemsResult.length; i++){
	
				var itemrec       = arrItemsResult[i];			
				item              = {},
				item.id           = itemrec.getId(),
				item.type         = itemrec.getRecordType(),
				item.name         = itemrec.getValue('name'),
				item.qtyAvailable = itemrec.getValue('quantityavailable') || 0,
				item.leadtime     = itemrec.getValue('leadtime') || 30,
				item.msgOutSDef   = itemrec.getValue('outofstockmessage') || '(Out of Stock)',
				item.msgOutStock  = item.msgOutSDef;
				
				//* Get Date from purchace order *
				var po     = nlapiSearchRecord('item',
											   'customsearch_wd_all_purchase_order', 
											   [ new nlobjSearchFilter('internalid', null, 'is', item.id) ]
							 );
				//*            END               *
							
				var datePO = ( po && po.length > 0 )? getDays(JSON.parse(JSON.stringify(po[0])).columns.trandate) : 7;
				
				datePO = ( parseInt(datePO)+parseInt(item.leadtime));			
				
				if( datePO <= 0 ){
					item.msgOutStock =	lt_currenttdate_msg;
					item.date        = calculateDate( 0 );	
				}else{
					item.msgOutStock =	lt_pastdate_msg;
					item.date        = calculateDate( datePO );	
				}																
				
				jsonResponse.results.push(item);
			}
		}
		
		response.write(JSON.stringify(jsonResponse));
		
	}catch(e){ modelError('getLeadTime: ' + e); }
};

/**
 * 	This function implement wishList functionality. 
 * 
 * @param   [params]
 * @returns [JSON.stringify()]
 * @author Alfonso Terron
 * 
 **/
function wishList(){
	
	var wl = {		
		//** Get Lists **//
		getList  : function(dataobj, applyFilter){
			try{
				
				var filters_array = [
		   	        new nlobjSearchFilter('custrecord_wl_shared_list', null, 'anyof', dataobj.customerid)
				],
		   		columns_array = [			
		   			new nlobjSearchColumn( 'name' ),		   			
		   			new nlobjSearchColumn( 'custrecord_wl_customer' ),
		   			new nlobjSearchColumn( 'lastmodified' ),
		   			new nlobjSearchColumn( 'lastmodifiedby' ),		   			
		   			new nlobjSearchColumn( 'custrecord_wl_description' ),
		   			new nlobjSearchColumn( 'custrecord_wl_shared' )
		   		];
		   		
				// Apply fileter to search pending aproval lists.
				if(applyFilter)
					filters_array = [
					    new nlobjSearchFilter('custrecord_wl_shared', null, 'is', 'T'),
					    new nlobjSearchFilter('custrecord_wl_shared_list', null, 'noneof', dataobj.customerid),
		                new nlobjSearchFilter('custrecord_wl_invitee_list', null, 'anyof', dataobj.customerid)		                
					];

				if(dataobj.sort)
					columns_array.push(new nlobjSearchColumn( dataobj.sort.field ).setSort(dataobj.sort.desc) );

		   		var results	= nlapiSearchRecord('customrecord_wd_wishlist', null, filters_array, columns_array);
		   		
		   		
		   		filters_array = [ 
	               new nlobjSearchFilter('custrecord_wl_invitee_list', null, 'anyof', dataobj.customerid),
	               new nlobjSearchFilter('custrecord_wl_shared_list', null, 'noneof', dataobj.customerid)
		   		];
		   		var pendingApproval = nlapiSearchRecord('customrecord_wd_wishlist', null, filters_array);
		   		jsonResponse.pending = (pendingApproval && pendingApproval.length)? pendingApproval.length : 0;	   		
		   		
		   		if(results)	response.write(retrieveObj(results, false));
		   		else modelError('You have not list.');
			
			}catch(e){ modelError('wishList - wl.getList: '+e); }
		},
		
		joinInList : function(dataobj){
			try{
				
				var self   = this,
				list       = dataobj.lists[0],
				customerid = dataobj.customerid,
				password   = nlapiLookupField('customrecord_wd_wishlist', list.id, 'custrecord_wl_password');
								
				if(password === nlapiEncrypt(list.passw)){
				
					arrCustomerShared = nlapiLookupField('customrecord_wd_wishlist', list.id, 'custrecord_wl_shared_list');

					if(arrCustomerShared != null){
						arrCustomerShared = arrCustomerShared.split(',');
						if(arrCustomerShared.indexOf(customerid) == -1)
							arrCustomerShared.push(customerid);
						
						nlapiSubmitField('customrecord_wd_wishlist', list.id, 'custrecord_wl_shared_list', arrCustomerShared);
					}
					
					//Return list.
					self.getList(dataobj);
					
				}else{
					jsonResponse.status_error.passerror = true;										
					modelError('Invalid password.');				
				}
								
			}catch(e){ modelError('wishList - wl.joinInList: '+e); }
		},
		
		removeUserList : function(dataobj){
			try{
				
				var self   = this,
				list       = dataobj.lists[0],
				customerid = dataobj.customerid;

				var arrUsers_Shared_List = nlapiLookupField('customrecord_wd_wishlist', list.id, 'custrecord_wl_shared_list')  || null,
				arrUsers_Invitee_List    = nlapiLookupField('customrecord_wd_wishlist', list.id, 'custrecord_wl_invitee_list') || null;
				
				arrUsers_Shared_List  = arrUsers_Shared_List  ? arrUsers_Shared_List.split(',')  : [];
				arrUsers_Invitee_List = arrUsers_Invitee_List ? arrUsers_Invitee_List.split(',') : [];
				
				var index = arrUsers_Shared_List.indexOf(customerid);
				
				if( index > -1 )
					arrUsers_Shared_List.splice(index,1);
				
				index = arrUsers_Invitee_List.indexOf(customerid);
				if( index > -1 )
					arrUsers_Invitee_List.splice(index,1);
				
				if(arrUsers_Shared_List.length &&  arrUsers_Shared_List.length == 1)
					arrUsers_Shared_List = arrUsers_Shared_List[0];
				
				if(arrUsers_Invitee_List.length &&  arrUsers_Invitee_List.length == 1)
					arrUsers_Invitee_List = arrUsers_Invitee_List[0];
				
				
				nlapiSubmitField('customrecord_wd_wishlist', list.id, 'custrecord_wl_shared_list', arrUsers_Shared_List);
				nlapiSubmitField('customrecord_wd_wishlist', list.id, 'custrecord_wl_invitee_list', arrUsers_Invitee_List);
								
				//Return list.
				self.getList(dataobj);			
								
			}catch(e){ modelError('wishList - wl.removeUserList: ' + e); }
			
			
		},
		
		sharedList : function(list, dataobj){
			try{
				
				var arrEmails      = list.emails.split(';'),
				wdconfig           = request.getParameter('wdconfig'),
				arrCustomerInvitee = nlapiLookupField('customrecord_wd_wishlist', list.id, 'custrecord_wl_invitee_list') || null;								
				arrCustomerInvitee = arrCustomerInvitee ? arrCustomerInvitee.split(',') : [];
				
				var config   = nlapiGetWDConfiguration(wdconfig, ['custrecord_wd_config_wl_templateemail', 'custrecord_wd_config_wl_subjectemail', 'custrecord_wd_config_wl_notification', 'custrecord_wd_config_wl_sender']),				
				notification = config.custrecord_wd_config_wl_notification,
				emailTemp    = config.custrecord_wd_config_wl_templateemail.internalid,
				subject      = config.custrecord_wd_config_wl_subjectemail,
				sender       = config.custrecord_wd_config_wl_sender.internalid,
				records      = new Object();
				
				//nlapiLogExecution('ERROR', 'arrEmails', JSON.stringify(arrEmails));
				
				//nlapiLogExecution('ERROR', 'arrCustomerInvitee', JSON.stringify(arrCustomerInvitee));
				
				for(e in arrEmails){
									
					var email     = arrEmails[e].trim(),
					filters_array = [ new nlobjSearchFilter('email', null, 'is', email) ],
					columns_array = [ new nlobjSearchColumn( 'email' ) ],
				    results	      = nlapiSearchRecord('customer', null, filters_array, columns_array);
					
					//nlapiLogExecution('ERROR', 'email', email);
					
					if(results && results.length > 0){
						var customer = results[0];
						if(arrCustomerInvitee.indexOf(customer.getId()) == -1){
							arrCustomerInvitee.push(customer.getId());							
							if(notification == true){
								var emailBody = nlapiMergeRecord( emailTemp, 'customer', customer.getId()).getValue();
								emailBody = emailBody.replace(/{{namelist}}/ig,list.name)
													 .replace(/{{customername}}/ig,list.name);
								records['customer'] = customer.getId();
																
								nlapiSendEmail(-5/*sender*/, customer.getValue('email'), subject, emailBody, null, null, records);	
							}
						}
					}
				}
				
				if(arrCustomerInvitee.length && arrCustomerInvitee.length == 1 )
					arrCustomerInvitee = arrCustomerInvitee[0];
				
				nlapiSubmitField('customrecord_wd_wishlist', list.id, 'custrecord_wl_invitee_list', arrCustomerInvitee);
				
			}catch(e){ modelError('wishList - wl.sharedList: '+e); }			
		},
			
		//** Save List **//
		saveList : function(dataobj){
			try{
				
				var self = this,
				wl       = null,
				list     = null;
				
				for(var i = 0; i < dataobj.lists.length; i++){
					list = dataobj.lists[i];
					
					wl   = nlapiCreateRecord('customrecord_wd_wishlist');
							
					wl.setFieldValue('name', list.name);
					wl.setFieldValue('custrecord_wl_customer', dataobj.customerid);
					wl.setFieldValue('custrecord_wl_shared_list', dataobj.customerid);
					wl.setFieldValue('custrecord_wl_description', list.desc);
					wl.setFieldValue('custrecord_wl_shared', (list.shared ? 'T':'F'));
					wl.setFieldValue('custrecord_wl_password', nlapiEncrypt(list.passw));					

					list.id = nlapiSubmitRecord(wl);

					//** Shared list wiht emails. 
					if(list.shared && list.emails)
						self.sharedList(list, dataobj);
					
					//Add line in wishlist.
					if( list.id != null && list.lines && list.lines.length > 0 )
						self.addLines([list]);

					//Return news list or edited list.
					self.getList(dataobj);
					
				}
				
			}catch(e){ modelError('wishList - wl.saveList: ' + e); }			
		},

		//** Remove List **//
		removeList : function(dataobj){
			try{
												
				for(var x = 0; x < dataobj.lists.length; x++){
				
					var list = dataobj.lists[x];
				
					// ** Remove only customer owner. **
					if(dataobj.customerid != nlapiLookupField('customrecord_wd_wishlist', list.id, 'custrecord_wl_customer') ) continue;
					
					var filters_array = [ new nlobjSearchFilter('custrecord_wl_line_parent', null, 'is', list.id) ];	  		   		
	  		   		var results	      = nlapiSearchRecord('customrecord_wishlist_line', null, filters_array);
					
	  		   		//** Remove items from list **
	  		   		if(results && results.length)
	  		   			for(var i = 0; i < results.length; i++)
	  		   				nlapiDeleteRecord(results[i].getRecordType(), results[i].getId());

	     		   	//** Remove list **
	  		   		nlapiDeleteRecord('customrecord_wd_wishlist', list.id);
					
				}			
 		   		
  		   		//Return news list or edited list.
  		   		this.getList(dataobj);
  		   		
			}catch(e){ modelError('wishList - wl.removeList: '+e); }
		},		
		
		editList : function(dataobj){
			try{
				var self = this,
				wl       = null,
				list     = null;
				
				for(var i = 0; i < dataobj.lists.length; i++){
					list = dataobj.lists[i];
				
					wl   = nlapiLoadRecord('customrecord_wd_wishlist', list.id);

					if(list.name)
						wl.setFieldValue('name', list.name);	
					if(list.desc)
						wl.setFieldValue('custrecord_wl_description', list.desc);					
					if(list.passw)
						wl.setFieldValue('custrecord_wl_password', nlapiEncrypt(list.passw));
					
					wl.setFieldValue('custrecord_wl_shared', (list.shared ? 'T':'F'));
					
					// ** Save list
					nlapiSubmitRecord(wl);
					
					//** Shared list wiht emails. 
					if(list.shared && list.emails)
						self.sharedList(list, dataobj);

					//Return news list or edited list.
					self.getList(dataobj);
					
				}
								
			}catch(e){ modelError('wishList - wl.editList: '+e); }
		},
		
		/*************** Items Section ***************/
		
		getItemFromList : function(dataobj){
			try{
				
				var filters_array = siteid ? [ new nlobjSearchFilter('website', 'custrecord_wl_line_item', 'is', siteid) ] : []; 
					
				filters_array.push(new nlobjSearchFilter('custrecord_wl_line_parent', null, 'is', dataobj.lists[0].id));
				
 		   		var columns_array = [
 		   			new nlobjSearchColumn( 'custrecord_wl_line_item' ),
 		   			new nlobjSearchColumn( 'custrecord_wl_line_quantity' ),
 		   			new nlobjSearchColumn( 'custrecord_wl_line_parent' ),
 		   			new nlobjSearchColumn( 'custrecord_wl_line_priority'), 		   			
 		   			new nlobjSearchColumn( 'storedisplayname', 'custrecord_wl_line_item' ), 		   			
 		   			new nlobjSearchColumn( 'onlinecustomerprice', 'custrecord_wl_line_item' ),
 		   			new nlobjSearchColumn( 'itemurl', 'custrecord_wl_line_item' ),
 		   			new nlobjSearchColumn( 'storedisplaythumbnail', 'custrecord_wl_line_item' )
 		   		];
 		   		
 		   		var results	= nlapiSearchRecord('customrecord_wishlist_line', null, filters_array, columns_array);
 		   				   		
 		   		if(results)	response.write(retrieveObj(results,true));
 		   		
 		   		else modelError('You have not items in this list.');
				
			}catch(e){ modelError('wishList - wl.getItemFromList: ' + e); }
		},
		
		addTolist : function(dataobj){	
			try{					
				if(dataobj.lists.length > 0)
					this.addLines(dataobj.lists);
				//Return news list or edited list.			
				this.getList(dataobj);
			}catch(e){ modelError('wishList - wl.addTolist: '+e); }
		},
		
		addLines : function(arrlist, dataobj){
			try{
				
				for(var x = 0; x < arrlist.length; x++){
					var list = arrlist[x];					
					for(var i = 0; i < list.lines.length; i++){						
						var line = list.lines[i]; 						
						if(line.qty > 0 && line.itemid != null ){
							
							var filters_array = [ 
			                     new nlobjSearchFilter('custrecord_wl_line_parent', null, 'is', list.id),
			                     new nlobjSearchFilter('custrecord_wl_line_item', null, 'is', line.itemid)							                     
							],
							columns_array = [ new nlobjSearchColumn( 'custrecord_wl_line_quantity' ) ],
			 		   		results	= nlapiSearchRecord('customrecord_wishlist_line', null, filters_array, columns_array);
							
							if(results && results.length){ //** Update Line in list **								
								var qty = parseFloat(line.qty) + parseFloat(results[0].getValue('custrecord_wl_line_quantity'));
								nlapiSubmitField(results[0].getRecordType(), results[0].getId(), 'custrecord_wl_line_quantity', qty, true);							
							}else{ //** Create Line in list **
								
								var wlline = nlapiCreateRecord('customrecord_wishlist_line');
								wlline.setFieldValue('custrecord_wl_line_parent'    , list.id);
								wlline.setFieldValue('custrecord_wl_line_item'    , line.itemid);
								wlline.setFieldValue('custrecord_wl_line_quantity', line.qty);
								
								nlapiSubmitRecord(wlline);
								
							}
						}
					}					
				}			
				
			}catch(e){ modelError('wishList - wl.addLines: '+e); }
		},
		
		removeFomList: function(dataobj){
			try{				
  		   		//** Remove line **
  		   		nlapiDeleteRecord('customrecord_wishlist_line', dataobj.lists[0].lines[0].id); 
  		   		//Return list lines.
				this.getItemFromList(dataobj);
			}catch(e){ modelError('wishList - wl.removeFomList: '+e); }
		},
		
		editLine : function(dataobj){
			try{	
				for(var i = 0; i < dataobj.lists[0].lines.length; i++){
					
					var line = dataobj.lists[0].lines[i];
					
					if(line.qty > 0){
						var wlline = nlapiLoadRecord('customrecord_wishlist_line', line.id);								
						wlline.setFieldValue('custrecord_wl_line_parent'  , dataobj.lists[0].id);
						wlline.setFieldValue('custrecord_wl_line_quantity', line.qty);
						wlline.setFieldValue('custrecord_wl_line_priority', line.priority);
						nlapiSubmitRecord(wlline);						
					}
				}
				
				//Return list lines.
				this.getItemFromList(dataobj);		
			}catch(e){ modelError('wishList - wl.editLine: '+e); }	
		},
		
		moveToList : function(dataobj){
			try{
								
				for(var i = 0; i < dataobj.lists[0].lines.length; i++){
					var line = dataobj.lists[0].lines[i],
					itemid   = nlapiLookupField('customrecord_wishlist_line', line.id, 'custrecord_wl_line_item'),
					qty      = nlapiLookupField('customrecord_wishlist_line', line.id, 'custrecord_wl_line_quantity'); 
					
					var filters_array = [
	                     new nlobjSearchFilter('custrecord_wl_line_parent', null, 'is', dataobj.lists[0].id),
	                     new nlobjSearchFilter('custrecord_wl_line_item', null, 'is', itemid)            
					],
					columns_array = [ new nlobjSearchColumn( 'custrecord_wl_line_quantity' ) ],
	 		   		results	= nlapiSearchRecord('customrecord_wishlist_line', null, filters_array, columns_array);					
					
					if(results && results.length){ //** Update Line in list **								
						qty = parseFloat(qty) + parseFloat(results[0].getValue('custrecord_wl_line_quantity'));
						nlapiSubmitField(results[0].getRecordType(), results[0].getId(), 'custrecord_wl_line_quantity', qty, true);							
					}else //** Change parent list **
						nlapiSubmitField('customrecord_wishlist_line', line.id, 'custrecord_wl_line_parent', dataobj.lists[0].id);												
				}
				
				//Return list lines.
				this.getItemFromList(dataobj);
				
			}catch(e){ modelError('wishList - wl.moveToList: '+e); }						
		}
		
	},	
	dataobj = JSON.parse(decodeURIComponent(request.getParameter('dataobj'))) || null; 
	
	try{

		if(dataobj){
			switch(dataobj.method){
				
				case 'getlist'           : wl.getList(dataobj);	    	break;
				case 'savelist'          : wl.saveList(dataobj);		break;
				case 'removelist'        : wl.removeList(dataobj);  	break;	
				case 'editlist'          : wl.editList(dataobj);	 	break;
				case 'getlines'          : wl.getItemFromList(dataobj);	break;
				case 'addlines'          : wl.addTolist(dataobj);		break;
				case 'removeline'        : wl.removeFomList(dataobj);	break;
				case 'editline'          : wl.editLine(dataobj);		break;
				case 'moveline'          : wl.moveToList(dataobj);		break;
				case 'searchlistsshared' : wl.getList(dataobj, true);	break;
				case 'joininlist'        : wl.joinInList(dataobj);		break;
				case 'removeuserlist'    : wl.removeUserList(dataobj);	break;
				
										
				default : modelError('Method not find.');
			}		
		}else  modelError('wishList - invalid dataObj: ' + JSON.stringify(dataobj)); 

	}catch(e){
		modelError('wishList - Error: '+ e); 
	}	
};