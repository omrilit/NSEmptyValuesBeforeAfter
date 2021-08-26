/****************************************************************
 * Description: Suitlet Applications run functions to WD.
 * 
 * @author: Alfonso Terron
 * @Email : aterron@netsuite.com
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @version 1.0                                 @Date: 12/05/2014 
 * 
 ****************************************************************/

/**
 * This function response data from function.
 * 
 * @param  [req, res] - required
 * @author Alfonso Terron
 * 
 **/

/** Gloabals Varials. **/

var QSDefines = {}, request, response, siteid, wdconfigid, jsonResponse = { results : [], status_error : { error : false, msg : '' } }; 

function action(request, response){
	try{
			
		this.request    = request,
		this.response   = response;
		this.siteid     = request.getParameter('site');
		this.wdconfigid = request.getParameter('wdconfig');
		var method	    = request.getParameter('method');	
		
		/*
		try{
			QSDefines[method]();
		}catch(e){ modelError('Method not match'); }
		*/
		
		//Services Zone.---------------------------------------------
		switch(method){

			case 'marketingzone'      : marketingZone();	  	  break; 
			case 'sliderzone'         : sliderZone();		  	  break;
			case 'searchitemkeywords' : searchitemkeywords(); 	  break;
			case 'createaquote'       : createAQuote();       	  break;
			case 'wishlist'           : wishList();		      	  break;
			case 'leadtime'           : getLeadTime();	     	  break;
			case 'compareproducts'    : compareProducts();	  	  break;
			case 'newsletterregister' : newsletterRegister(); 	  break;			 
			case 'createquotetemplate': getCreateQuoteTemplate(); break;
			
			default 			      : modelError('Method not match');
		}
		
	}catch(e){ modelError('action: ' + e); }
}

function modelError(error){	
	nlapiLogExecution('ERROR', 'e', error);	
	jsonResponse.status_error.error = true,
	jsonResponse.status_error.msg   = error,	
	response.write( JSON.stringify(jsonResponse) );	
}

/**
 * 	- This function get WD Site Configuration.
 * 
 * @param   [id int, arrFields[]]
 * @returns [JSON]
 * @author Alfonso Terron
 * 
 **/
function nlapiGetWDConfiguration(id, fields){	
	try{				
		filters_array = [ new nlobjSearchFilter('internalid', null, 'is', id) ],		
		columns_array = [];
		
		for(i in fields)
			columns_array.push( new nlobjSearchColumn( fields[i]) );	
		
		var results	= nlapiSearchRecord('customrecord_wd_configuration', null, filters_array, columns_array);
		
		if(results != null)
			return retrieveObj(results, false, 'JSON').results[0];

	} catch(e){ modelError('nlapiGetWDConfiguration: ' + e); } return null;
}

/**
 * 	Extract object columns from search result 
 * 
 * @param   [Array searchResult, boolean fixNoImage]
 * @returns [JSON.stringify()]
 * @author Alfonso Terron
 * 
 **/
function retrieveObj(r, fixNoImage, typeRet) {
	try{
		
		var its = JSON.parse(JSON.stringify(r));
			
	    for ( var i = 0, limit = its.length; i < limit; i++) {
		       	
	    	var cIt = its[i].columns;	   
	    	
	    	cIt.internalid = its[i].id;
	    	cIt.type = its[i].recordtype;
		   	
		   // Fix name issue (if the item display name is not set, show the item id)
		   if (!cIt.storedisplayname)
			   cIt.storedisplayname = cIt.itemid;
		   
		   if(cIt.storedescription)
			   cIt.storedescription = escape( cIt.storedescription );
			   
		   if(cIt.storedetaileddescription)
			   cIt.storedetaileddescription = escape( cIt.storedetaileddescription );
				   
		   if(cIt.featureddescription)
			   cIt.featureddescription = escape( cIt.featureddescription );

		   if (fixNoImage && !cIt.storedisplaythumbnail) {
			   cIt.storedisplaythumbnail            = {};
			   cIt.storedisplaythumbnail.name       = '/site/suiteoffice/img/noimage.jpg';
			   cIt.storedisplaythumbnail.internalid = 'x1';
		   }		   
		 
		   delete cIt.itemid;
		   
		   jsonResponse.results[i] = cIt;
	    }
	    
	    if(typeRet === 'JSON')
	    	return jsonResponse;
	    
	    return JSON.stringify(jsonResponse);
		
	}catch(e){ nlapiLogExecution('ERROR', 'retrieveObj', e); }
}

function calculateDate(sumDyas){	
	date  = new Date(); 
    time  = date.getTime();
    ms    = parseInt(sumDyas*24*60*60*1000);
    r     = date.setTime(time+ms);
    day   = date.getDate();
    month = date.getMonth()+1;
    year  = date.getFullYear();
    
    return month+"/"+day+"/"+year;
}

function getDays(date){    
	var dat1 = new Date(),
	d2       = date.split("/"),
	dat2     = new Date(d2[2], parseFloat(d2[0])-1, parseFloat(d2[1])),	
	fin      = dat2.getTime() - dat1.getTime();	 
	return Math.floor(fin / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * 	- This function returns the items to marketing zone.
 * 
 * @param   [Array iids, String zone]
 * @returns [JSON]
 * @author  Alfonso Terron
 * 
 **/
function marketingZone(){
	try{

		var iids      = JSON.parse(request.getParameter('iids'));
		filters_array = [];
		list          = 'customsearch_wd_all_items';
				
		if(!iids){ list = 'customsearch_wd_'+request.getParameter('zone'); }
		else     { filters_array.push(new nlobjSearchFilter('internalid', null, 'is', iids)); }
				
		if(siteid) filters_array.push( new nlobjSearchFilter('website', null, 'is', siteid) ); 
		
		var results = nlapiSearchRecord('item', list, filters_array);
		
		if(!results || !results.length > 0){ modelError('Result is empty in marketingZone'); return; }			
		response.write(retrieveObj(results, true));	
		
	}catch(e){ modelError('marketingZone: ' + e); }
	
};

/**
 * 	This function get image from slide record. 
 * 
 * @param   []
 * @returns [JSON.stringify()]
 * @author Nicolas Pereyra / Alfonso Terron
 * 
 **/
function sliderZone(){

	var categoryID              = request.getParameter('category')
	,	const_slider_internalid = 'internalid'
	,	const_slider_image    = 'custrecord_wd_sliderzone_image'
	,	const_slider_link     = 'custrecord_wd_sliderzone_link'
	,	const_slider_order    = 'custrecord_wd_sliderzone_order'
	,   const_slider_category = 'custrecord_wd_sliderzone_category'
	,   const_slider_title    = 'custrecord_wd_sliderzone_main_title'
	,   const_slider_text     = 'custrecord_wd_sliderzone_text'
	,   const_slider_btn      = 'custrecord_wd_sliderzone_btn_txt'
	,   const_slider_txt_pos  = 'custrecord_wd_sliderzone_txt_position'				
	,	const_slider_zone     = 'customrecord_wd_slider_zone';
	
	if(!categoryID){modelError('sliderZone: category empty.'); return;}
	
	var filters_array = [ 
	    new nlobjSearchFilter('isinactive', null, 'is', 'F'),
	    new nlobjSearchFilter(const_slider_category, null, 'is', categoryID),
	];
	
	var columns_array = [
		new nlobjSearchColumn(const_slider_internalid),
		new nlobjSearchColumn( const_slider_image ),
		new nlobjSearchColumn( const_slider_link ),
		new nlobjSearchColumn( const_slider_order ).setSort(),
		new nlobjSearchColumn( const_slider_category ),
		new nlobjSearchColumn( const_slider_title ),
		new nlobjSearchColumn( const_slider_text ),
		new nlobjSearchColumn( const_slider_btn ),
		new nlobjSearchColumn( const_slider_txt_pos )
	];
	
	try {
		
		slide_results = nlapiSearchRecord( const_slider_zone, null, filters_array, columns_array);
				
		if(slide_results && slide_results.length > 0 ){
		
			var r_length = slide_results.length;
			
			for(var i = 0; i < r_length; i++){
				
				var slide_item = slide_results[i];
				var _item = {};
				
				_item.id       = slide_item.getValue( const_slider_internalid );
				_item.image    = slide_item.getText( const_slider_image );
				_item.link     = slide_item.getValue( const_slider_link );
				_item.order    = slide_item.getValue( const_slider_order );
				_item.category = slide_item.getValue( const_slider_category );
				_item.title    = escape(slide_item.getValue( const_slider_title ));
				_item.text     = escape(slide_item.getValue( const_slider_text ));
				_item.btn      = slide_item.getValue( const_slider_btn );
				_item.txtPos   = slide_item.getText( const_slider_txt_pos ).toLowerCase();
				
				jsonResponse.results.push( _item );
			}
		}				
		response.write(JSON.stringify( jsonResponse ) );
	
	}catch(e){ modelError('sliderZone: ' + e); }	
};

/**
 * 	- This function is to newsletter register.
 * 
 * @param   [{custoer}]
 * @returns [JSON]
 * @author Alfonso Terron
 * 
 **/
function newsletterRegister(){
	     	  	  
  try {
	  
	  	var params = request.getParameter('customer'),
	  	customer   = params ? JSON.parse(params) : null;
	  	
	  	if(!customer.email) throw 'Invalid Email.';
	  	
	  	nlapiLogExecution('ERROR', 'e', JSON.stringify(customer));
	  	
	    var filters   = [ new nlobjSearchFilter('email', null, 'is', customer.email) ],
	    columns       = [ new nlobjSearchColumn('entitystatus') ],	  	
	    searchResults = nlapiSearchRecord('customer', null, filters, columns);
    
	  	if (!searchResults) { // The email address was not used
			var emailComponents   = customer.email.split('@'),			
			DEFAULT_SUBSIDIARY_ID = nlapiLookupField('customrecord_wd_configuration', wdconfigid, 'custrecord_wd_config_def_subsidiary') || null ;	
			
			customer.firstName = emailComponents[0];
			customer.lastName  = emailComponents[1];
			customer.isPerson  = 'T';
			
			leadObject = nlapiCreateRecord('lead');
			leadObject.setFieldValue('isperson', customer.isPerson);
			leadObject.setFieldValue('firstname', customer.firstName);
			leadObject.setFieldValue('lastname', customer.lastName);
			leadObject.setFieldValue('email', customer.email);
			
			leadObject.setFieldValue('companyname', customer.companyname);
			leadObject.setFieldText('globalsubscriptionstatus', customer.globalsubscription);
			
			if(DEFAULT_SUBSIDIARY_ID)
				leadObject.setFieldValue('subsidiary', DEFAULT_SUBSIDIARY_ID);
			
			customerId=nlapiSubmitRecord(leadObject);
			
			nlapiLogExecution('AUDIT', 'Created new lead', customer.email);
			
		} else // The email address was already used
			nlapiLogExecution('AUDIT', 'Attempted to create a new lead with an existing email address', customer.email);	
	  	
	  	response.write(JSON.stringify(jsonResponse));
	  	
	} catch(exception) {modelError('ERROR newsletterRegister : ' + exception.getCode()+ ' ' + exception.getDetails()); }	
	
};