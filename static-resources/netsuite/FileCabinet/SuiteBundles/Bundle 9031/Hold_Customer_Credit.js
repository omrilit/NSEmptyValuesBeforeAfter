/**
 * Copyright NetSuite, Inc. 2010 All rights reserved. 
 * 
 * Version	Date 			Author 			Remarks
 * 1.00		13 May 2010     August Li       Update customer credit on hold
 * 
 */
function holdCustomerCredit(){
    var idCustomer = nlapiGetContext().getSetting('SCRIPT','custscript_inv_col_cust');
    nlapiLogExecution('DEBUG','Customer Id = '+idCustomer,'');    
    nlapiSubmitField('customer',idCustomer,'custentity_fmt_customer_credit_on_hold','T');
}
