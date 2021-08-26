/* before Save trigger:	test discount rate on new orders against cutoff rate and if it exceeds it then change the status to Pending approval. Also update memo */
function beforeSaveSalesOrder(type)
{
    var newRecord = nlapiGetNewRecord();
	var cutoffRate = custscript_maximumdiscountlevel;
	var discountRate = newRecord.getFieldValue('discountrate');
    if ( type == 'Create' && discountRate != null && discountRate.length > 0  && cutoffRate != null && cutoffRate.length > 0 )
    {
		discountRate = Math.abs( parseFloat( discountRate ) );		
		cutoffRate = Math.abs( parseFloat( cutoffRate ) );
		if ( discountRate > cutoffRate )
		{
			newRecord.setFieldValue('orderstatus','A' /* Pending Approval */);
			newRecord.setFieldValue('memo','Changed status to pending approval because discount exceeded '+custscript_maximumdiscountlevel );
		}
        else
		{
			newRecord.setFieldValue('orderstatus','B' /* Pending Fulfillment */);
			newRecord.setFieldValue('memo','Changed status to pending fulfillment since it did not exceed cutoff' );
		}
    }
}
/* after Save trigger: test discount rate on new orders against cutoff rate and if it exceeds it then send an email to a predefined list of addresses. */
function afterSaveSalesOrder(type)
{
    var newRecord = nlapiGetNewRecord();
	var cutoffRate = custscript_maximumdiscountlevel;
	var discountRate = newRecord.getFieldValue('discountrate');
    if ( type == 'Create' && discountRate != null && discountRate.length > 0  && cutoffRate != null && cutoffRate.length > 0 )
    {
		discountRate = Math.abs( parseFloat( discountRate ) );		
		cutoffRate = Math.abs( parseFloat( cutoffRate ) );
		if ( discountRate > cutoffRate )
			sendDiscountWarningEmail( );
    }
}
/* Lookup customer name by internalId */ 
function queryCustomerName( customer )
{
    var filters = new Array();
    filters[0] = new nlobjSearchFilter( 'internalid', null, 'equalTo', customer, null );
    var columns = new Array();
    columns[0] = new nlobjSearchColumn( 'entityid' );
    
    var searchresults = nlapiSearchRecord( 'customer', null, filters, columns );
    var entityid = searchresults[ 0 ].getValue( 'entityid' );
    return entityid;
}
/* Lookup salesrep name by internalId */ 
function querySalesRepName( salesrep )
{
    var filters = new Array();
    filters[0] = new nlobjSearchFilter( 'internalid', null, 'equalTo', salesrep, null );
    var columns = new Array();
    columns[0] = new nlobjSearchColumn( 'entityid' );
    
    var searchresults = nlapiSearchRecord( 'contact', null, filters, columns );
    var entityid = searchresults[ 0 ].getValue( 'entityid' );
    return entityid;
}
/* Send pre-formatted email to predefined list of recipients */
function sendDiscountWarningEmail()
{
    var newRecord = nlapiGetNewRecord();
    var customerName = queryCustomerName(newRecord.getFieldValue('entity'));
    var salesrepName = querySalesRepName(newRecord.getFieldValue('salesrep'));
	var orderName = custscript_salesordername != null ? custscript_salesordername : 'Sales Order';
 
    var str = salesrepName+' has entered a '+orderName+' for '+customerName+' that exceeds '+custscript_maximumdiscountlevel+'.\n\n';
    str += 'Your approval is required before it can be fulfilled.\n\n';
    str += 'Please log in to your NetSuite solution to approve the discount and order.\n';
 
    var adminsToEmail = custscript_salesorderapproveremail;
	if ( custscript_salesorderapproveremail2 != null )
		adminsToEmail += ';'+custscript_salesorderapproveremail2; 
 
    nlapiSendEmail( -5 /* Brian Sullivan (admin)*/, adminsToEmail, 'Discount Warning', str );
    
   
   /* logging a note in the execution log to indicate success */
   //     nlapiLogExecutionNote ('DEBUG', 'Discount Warning ' );

}

