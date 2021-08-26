/****************************************************************
 * Description: Userevent - This file attache events from customer
 * records.
 *
 * @author: Alfonso Terron
 * @Email : aterron@netsuite.com
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @version 1.0                                 @Date: 19/11/2014
 *
 ****************************************************************/
var Customer = {

    type : null

  , beforeLoad  : function(){}

  , beforeSubmit: function(){}

  , afterSubmit : function(type){
      this.type = type;
      this.viewAsStore();
    }

  , viewAsStore : function(){
      try{

        if(this.type != 'create' && this.type != 'edit') return;

        var store = nlapiGetFieldValue('custentity_wd_view_store') || null,
        checked   = nlapiGetFieldValue('custentity_wd_view_as_store')   || 'F';

        if(checked == 'T' && !store){
          store = nlapiCreateRecord('customrecord_wd_store_locator');

          var customer = {
            name    : (nlapiGetFieldValue('companyname') || nlapiGetFieldValue('altname') || 'NaN'),
            address : {
              address1: nlapiGetFieldValue('shipaddr1'),
              zip     : nlapiGetFieldValue('shipzip'),
              city    : nlapiGetFieldValue('shipcity'),
              state   : nlapiGetFieldValue('shipstate')
            },
            phone   : nlapiGetFieldValue('phone'),
            email   : nlapiGetFieldValue('email'),
            storeURL: nlapiGetFieldValue('url')
          };

          nlapiLogExecution('ERROR', 'test', JSON.stringify(customer));

          store.setFieldValue('name', customer.name);

          store.setFieldValue('custrecord_wd_locator_storeaddress', customer.address.address1);
          store.setFieldValue('custrecord_wd_locator_storecity'   , customer.address.city);
          store.setFieldValue('custrecord_wd_locator_state'       , customer.address.state);
          store.setFieldValue('custrecord_wd_locator_zip_code'    , customer.address.zip);

          store.setFieldValue('custrecord_wd_locator_storephone'   , customer.phone);
          store.setFieldValue('custrecord_wd_locator_mail'         , customer.email);
          store.setFieldValue('custrecord_wd_locator_shop_web_site', customer.storeURL);

          var storeid = nlapiSubmitRecord(store, true);

          this.getLatAndLong('customrecord_wd_store_locator', storeid, customer.address);

          nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(),  'custentity_wd_view_store', storeid+"");

        }

      }catch(e){nlapiLogExecution('ERROR','e viewAsStore',e);}

  }

  , getLatAndLong : function(strRecordType, strStoreId, data){

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

};
