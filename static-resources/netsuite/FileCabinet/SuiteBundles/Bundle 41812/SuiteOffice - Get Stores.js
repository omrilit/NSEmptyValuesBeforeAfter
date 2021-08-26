/***********************************************************
 * Description:                               @Date: 05/06/2014
 *
 * @author: Alfonso Terron
 * @Email : aterron@netsuite.com
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @version 1.0
 *
 ************************************************************/

 var folderID = '2521',
 fileID       = '11861',
 jsonResponse = { results : [], status_error : { error : false, msg : '' } };

function getStores(request, response){

	try{

		var action     = request.getParameter('action') || null;
    arrStoresIDs   = request.getParameter('ids')    || null;
    arrStoresIDs   = arrStoresIDs ?  JSON.parse(arrStoresIDs) : null;

    switch(action){

      case 'getHash'   : getHashStores(); break;

      case 'getStores' : getAllStores(request.getParameter('ids')); break;

      default : getAllStores(null);

    }
	}catch(e){ modelError("getStores: "+e); }
}

function getAllStores(ids){
  try{

    var LoadSearch   = nlapiLoadSearch('customrecord_wd_store_locator', 'customsearch_wd_store_locator');
    ids = ids ? JSON.parse(ids) : null;

    if(ids && ids.length)
      LoadSearch.addFilter( new nlobjSearchFilter('internalid', null, 'is', ids));

    var objResultSet = LoadSearch.runSearch()
    ,   results      = [];

    objResultSet.forEachResult(function(result){
      results.push(result); return true;
    });

    response.write(retrieveObj(results, true));

  }catch(e){ modelError("getAllStores: "+e); }
}

function modelError(error){
	nlapiLogExecution('ERROR', 'e', error);
	jsonResponse.status_error.error = true,
	jsonResponse.status_error.msg   = error,
	response.write( JSON.stringify(jsonResponse) );
}

/**
 * 	Generate has Store in file cabinet.
 *
 * @param   [Empty]
 * @returns [Empty] Save in File txt
 * @author Alfonso Terron
 *
 **/
 function generateHasStores(){
   try{

     var Search = nlapiLoadSearch('customrecord_wd_store_locator', 'customsearch_wd_store_locator'),
     hasStores  = {};

     if(!folderID) throw 'Folder id is not set!.';

     var objResultSet = Search.runSearch()
     ,   results      = [];


     objResultSet.forEachResult(function(result){
        hasStores[result.getId()] = result.getValue('custrecord_wd_locator_storelat')+'_'+result.getValue('custrecord_wd_locator_storelong');
        return true;
     });

     file = nlapiCreateFile('hash_stores', 'PLAINTEXT', JSON.stringify(hasStores));
     file.setFolder(folderID);
     nlapiSubmitFile(file);

   }catch(e){ nlapiLogExecution('ERROR', 'e', e); }
 }

/**
 * 	Generate has Store in file cabinet.
 *
 * @param   [Empty]
 * @returns [Empty] Save in File txt
 * @author Alfonso Terron
 *
 **/
  function getHashStores(){
    try{

      if(!fileID) throw 'File id is not set!.';

      var file = nlapiLoadFile(fileID);
      jsonResponse.results = JSON.parse(file.getValue() || {});
      response.write(JSON.stringify(jsonResponse));

    }catch(e){ modelError('getHashStores: ' + e); }
  }

/**
 * 	Calculate Lat and Long from Stores
 *
 * @param   [Empty]
 * @returns [Empty] Save in File txt
 * @author Alfonso Terron
 *
 **/
function calculateLatAndLong(strType) {

  try {

    if (strType == 'create' || strType == 'edit' || strType == 'xedit') {

        var strStoreId    = nlapiGetRecordId()
        ,   strRecordType = nlapiGetRecordType()
        ,   strLat        = nlapiGetFieldValue('custrecord_wd_locator_storelat') || ''
        ,   strLong       = nlapiGetFieldValue('custrecord_wd_locator_storelong') || '';
        //,   objStore      = nlapiLoadRecord(strRecordType, strStoreId)

        if( strLat != '' && strLong != '' ) return;

        data = {
          address1 : nlapiGetFieldValue('custrecord_wd_locator_storeaddress'),
          city     : nlapiGetFieldValue('custrecord_wd_locator_storecity'),
          state    : nlapiGetFieldValue('custrecord_wd_locator_state'),
          zip      : nlapiGetFieldValue('custrecord_wd_locator_zip_code')
        };

        getLatAndLong(strRecordType, strStoreId, data);

    }

  }catch (ex){
    nlapiLogExecution('ERROR', 'e calculateLatAndLong:', e);
  }
}

function getLatAndLong(strRecordType, strStoreId, data){

  try{

      var data = data.address1 + ", " +
                 data.zip      + ", " +
                 data.city     + ", " +
                 data.state;

      data = data.replace(/\s/gi, "+");
      data = data.replace("#", "");
      data = data.replace("&", "");

      var url = "https://maps.googleapis.com/maps/api/geocode/json?v=2&address=" + data + "&sensor=true";

      nlapiLogExecution("ERROR", "url", url);

      /*******************************************/
      var headers                 = new Array();
          headers['User-Agent-x'] = 'SuiteScript-Call';
          headers['Referer']      = 'http://sopackage.production.na1.netsuitestaging.com';
          headers['Host']         = 'sopackage.production.na1.netsuitestaging.com';

      var response      = nlapiRequestURL(url, null, headers);
      var body          = response.getBody();
      var storeLocation = JSON.parse(body);

      if (storeLocation.status == "OK") {

          var lat = storeLocation.results[0].geometry.location.lat;
          var lng = storeLocation.results[0].geometry.location.lng;
          var arrFields = ['custrecord_wd_locator_storelat', 'custrecord_wd_locator_storelong'];
          var arrValues = [lat, lng];

          nlapiSubmitField(strRecordType, strStoreId, arrFields, arrValues);

      }

  }catch(e){ nlapiLogExecution('ERROR', 'e getLatAndLong:', e); }

}

/**
 * 	Extract object columns from search result
 *
 * @param   [Array searchResult, boolean fixNoImage]
 * @returns [JSON.stringify()]
 * @author Alfonso Terron
 *
 **/
function retrieveObj(r, fixNoImage) {
	try{

		var its = JSON.parse(JSON.stringify(r));

	    for ( var i = 0; i < its.length; i++) {

	    	var cIt = its[i].columns;

	    	cIt.internalid = its[i].id;
	    	cIt.type = its[i].recordtype;

		   // Fix name issue (if the item display name is not set, show the item id)
		   if (!cIt.storedisplayname) {
			   cIt.storedisplayname = cIt.itemid;
		   }

		   if (fixNoImage && !cIt.storedisplaythumbnail) {
			   cIt.storedisplaythumbnail            = {};
			   cIt.storedisplaythumbnail.name       = '/site/suiteoffice/images/noimage.jpg';
			   cIt.storedisplaythumbnail.internalid = 'x1';
		   }

		   delete cIt.itemid;

		   jsonResponse.results.push(cIt);

	    }

	    return JSON.stringify(jsonResponse);

	}catch(e){ modelError('retrieveObj: ' + e); }
}
