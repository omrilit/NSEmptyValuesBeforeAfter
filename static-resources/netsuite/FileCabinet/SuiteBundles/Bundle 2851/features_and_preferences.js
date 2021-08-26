// This script sets the values of the fields on the custom record for tracking features and preferences for use in the
// OpenAir integration.

function getFeaturesOnLoad()
{
  var nlobjContext = nlapiGetContext();
  nlapiSetFieldValue('custrecord_oa_advanced_projects', getFeature(nlobjContext, 'ADVANCEDJOBS'), false, true);
  nlapiSetFieldValue('custrecord_oa_multiple_prices', getFeature(nlobjContext, 'MULTPRICE'), false, true);
  nlapiSetFieldValue('custrecord_oa_multiple_currencies', getFeature(nlobjContext, 'MULTICURRENCY'), false, true);
  nlapiSetFieldValue('custrecord_oa_consolidate_projects', getPreference(nlobjContext, 'CONSOLINVOICES'), false, true);
  nlapiSetFieldValue('custrecord_oa_revenue_recognition', getFeature(nlobjContext, 'REVENUERECOGNITION'), false, true);
  nlapiSetFieldValue('custrecord_oa_combine_expense_items', getPreference(nlobjContext, 'COMBINEEXPENSEITEMS'), false, true);
  nlapiSetFieldValue('custrecord_oa_session_timezone', nlobjContext.getSetting('PREFERENCE', 'TIMEZONE'), false, true);
  nlapiSetFieldValue('custrecord_oa_advanced_receiving', getFeature(nlobjContext, 'ADVRECEIVING'), false, true);
  nlapiSetFieldValue('custrecord_oa_combine_bill_items_invoice', getPreference(nlobjContext, 'COMBINEINVOICEITEMS'), false, true);
  nlapiSetFieldValue('custrecord_oa_mc_customer', getFeature(nlobjContext, 'MULTICURRENCYCUSTOMER'), false, true);
}

function getFeature(nlobjContext, featurename)
{
  return isTrueAsString(nlobjContext.getSetting('FEATURE', featurename));
}

function getPreference(nlobjContext, preferencename)
{
  return isTrueAsString(nlobjContext.getSetting('PREFERENCE', preferencename));
}

function isTrueAsString(value)
{
  if (value == 'T' || value == 'TRUE' || value == 't' || value == 'true' || value === true)
    return 'T';
  else
    return 'F';
}
