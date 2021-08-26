/* Used for OpenAir exchange rate integration 
 * This will copy the exchange rates with effectiveDate today to the custom record customrecord_oa_xrate_daily
 * In the UI, this is Lists > Accounting > Currency Exchange Rates
 * 1) Get a list of active currencies in the account: listCurrency object 
 * 2) Get a list of all active base currencies in the account: listBaseCurrency object
 *    - For OneWorld accounts, this is pulled from the subsidiaries
 *    - For non-OneWorld accounts, this is the currency with internalId = 1
 * 3) Iterate over listBaseCurrency and listCurrency and use with nlapiExchangeRate to get 
 *    the exchange rate for today
 * 4) Populate customrecord_oa_forex_daily. Everything goes into the name field which is 200 chars. 
 *    OpenAir will parse out the name field. It is in the format: 
 *    base currency:foreign currency:effective date in YYYY-MM-DD format:exchange rate
 *    For example - USD:EUR:2010-11-18:2.456789
 */


function copyExchangeRates () {
	// get the context
	var context = nlapiGetContext();
	
	// get all the active currencies in the account 
    var colCurrency = new Array();
    colCurrency[0] = new nlobjSearchColumn('internalId');
    colCurrency[1] = new nlobjSearchColumn('symbol');
    
	var filterCurrency = new Array();
	filterCurrency[0] = new nlobjSearchFilter('isInactive', null, 'is', 'F');
	
	// list of active currencies in the account
	var listCurrency = nlapiSearchRecord('currency', null, filterCurrency, colCurrency);	
	
	// lookupCurrency hash for lookup of currency symbols
	var lookupCurrency = new Object(); 
	for (var i = 0; listCurrency != null && i < listCurrency.length; i++) 
	{
		var cur = listCurrency[i];
		var curID = cur.getValue('internalId');
		var curSymbol = cur.getValue('symbol');	
		lookupCurrency[curID] = curSymbol;
	}

	/* get the unique base currencies in the account and store in hash
	 * key = base currency internal Id
	 * value = subsidiary internal Id
	 */
	var listSubsidiaryBaseCurrency = new Object(); 
	var listBaseCurrency = new Array(); 
	
	/* is this an OW account with subsidiaries?
	 * is there a better way to get this than from a custom preference? 
	 */
	var nlobjContext = nlapiGetContext();
   	var ow_account = nlobjContext.getSetting('SCRIPT', 'custscript_oa_forex_integration');
	var previousDayRun = nlobjContext.getSetting('SCRIPT', 'custscript_oa_forex_prev_day');

   	if (ow_account == 'F') 
	{
		// base currency is the one with internalId = 1 in non-OW account
		listBaseCurrency['1'] = 1;
	}
	else 
	{
		// get all the active subsidiaries in the account and figure out all the base currencies
		var colSubsidiary = new Array(); 
    	colSubsidiary[0] = new nlobjSearchColumn('currency');
		colSubsidiary[1] = new nlobjSearchColumn('internalId');
		
		var filterSubsidiary = new Array();
		filterSubsidiary[0] = new nlobjSearchFilter('isInactive', null, 'is', 'F');
		
		var listSubsidiary = nlapiSearchRecord('subsidiary', null, filterSubsidiary, colSubsidiary);	
		for (var i = 0; listSubsidiary != null && i < listSubsidiary.length; i++) 
		{
			var sub = listSubsidiary[i];
			var subBaseCurrency = sub.getValue('currency');	
			
			// do we already have this base currency?
			if (listSubsidiaryBaseCurrency.hasOwnProperty(subBaseCurrency) == false)
			{
				listBaseCurrency.push(subBaseCurrency);
			}
			
        	listSubsidiaryBaseCurrency[subBaseCurrency] = 1;
		}		
	}

	// sort the currencies in internal id order
	listBaseCurrency.sort(sortCurrencyIds);

	/* 
	 * Figure out which currency to start with
	 * if the currency is 0, we're starting at the beginning
	 * else, this script was rescheduled to get the rates starting from a different base currency so that 
	 * we can get all the other rates
	 * This is to handle usage limit of 10000 units
	 */
	var fxSetting = nlapiLoadRecord('customrecord_oa_forex_setting',1);
    var startBaseCurrency = fxSetting.getFieldValue('custrecord_oa_forex_current_currency'); 

	nlapiLogExecution('AUDIT', 'Starting base currency', startBaseCurrency);		

	/*
	 * Find all the cross rates
	 * 1) loop through the account base currencies
	 * 2) for each base currency, find all the cross rates by looping through the account currencies 
	 *    and use nlapiExchangeRate to get the rate
	 * 3) populate the forex custom record
	 */
	
	var effectiveDate = new Date(); 
	if (previousDayRun == 'T')
	{
		effectiveDate.setDate(effectiveDate.getDate()+1);
	}
	var day = effectiveDate.getDate();
	var year = effectiveDate.getFullYear();
	var month = effectiveDate.getMonth() + 1;
	if (month < 10)
	{ 
		month = "0" + month;
	}	
	if (day < 10)
	{ 
		day = "0" + day;
	}	

	var oaDate = year + "-" + month + "-" + day;		
	var effectiveDateExchangeRate = nlapiDateToString(effectiveDate, "date")

    for (var j = 0; listBaseCurrency != null && j < listBaseCurrency.length; j++) 
	{
		var baseCurrency = listBaseCurrency[j];
		
		/*
		 * If the script was rescheduled because we have too many forex records, then skip
		 * the base currency cross rates we have already calculated
		 */
		if (parseInt(baseCurrency) < parseInt(startBaseCurrency))
		{
			nlapiLogExecution('AUDIT', 'This is a restart of forex script', 'Skipping currency with ID ' + baseCurrency + ' and startBaseCurrency = ' . startBaseCurrency);
			continue;
		}	
		
		// write out the currently processed base currency to the custom record
		startBaseCurrency = baseCurrency;
		fxSetting.setFieldValue('custrecord_oa_forex_current_currency', startBaseCurrency);
		nlapiSubmitRecord(fxSetting);
		
		for (var i = 0; listCurrency != null && i < listCurrency.length; i++) 
		{
			try {
				var cur = listCurrency[i];
				var foreignCurrency = cur.getValue('internalId');
				var foreignCurrencySymbol = cur.getValue('symbol');
				var baseCurrencySymbol = lookupCurrency[baseCurrency];
				
				// if the foreignCurrency == baseCurrency, just set exchangeRate=1
				var exchangeRate = 0;
				if (foreignCurrency == baseCurrency)
				{ 
					exchangeRate = 1;
				}
				else 
				{
					exchangeRate = nlapiExchangeRate(foreignCurrency, baseCurrency, effectiveDateExchangeRate);
				}
				
				if (exchangeRate == null)
					throw baseCurrencySymbol + "/" + foreignCurrencySymbol + " rate returned null.";
				
				// create the record 
				var customForexRecord = nlapiCreateRecord('customrecord_oa_forex_daily');
				customForexRecord.setFieldValue('name', baseCurrencySymbol + ":" + foreignCurrencySymbol + ":" + oaDate + ":" + exchangeRate);
				var newRecordId = nlapiSubmitRecord(customForexRecord);
				
				if (newRecordId == null)
					throw baseCurrencySymbol + "/" + foreignCurrencySymbol + " was not saved.";
				
				// log this 
				var logName = "Exchange rate: " + baseCurrencySymbol + "-" + foreignCurrencySymbol;
				var logMessage = baseCurrencySymbol + "-" + foreignCurrencySymbol + "-" + nlapiDateToString(effectiveDate, "datetime") + "-" + exchangeRate;
				nlapiLogExecution('AUDIT', logName, logMessage);
			}
			catch (error)
			{
				nlapiLogExecution('ERROR', 'Exchange rate calculation error', error);				
			}

			// now look at how much usage is left? 
			// do we need to reschedule?			
			if ( context.getRemainingUsage() <= 50 )
			{
				// log that we rescheduled 
				var remainingUsage = context.getRemainingUsage(); 
				nlapiLogExecution('AUDIT', 'Remaining usage for this run before before rescheduling: ', remainingUsage);

				// actually reschedule
				var status = nlapiScheduleScript(context.getScriptId(), context.getDeploymentId());		
				if (status != 'QUEUED') 
				{
					nlapiLogExecution('ERROR', 'Unable to requeue', 'requeue error for effective date:' + nlapiDateToString(effectiveDate,"date"));
				}

				return;
			}
		}
		// finished the cross rates for baseCurrency	
	}
	// finished all cross rates for this effective Date
	startBaseCurrency = '0';
    fxSetting.setFieldValue('custrecord_oa_forex_current_currency', startBaseCurrency);
	nlapiSubmitRecord(fxSetting);
}

function sortCurrencyIds (a,b)
{
	return a - b;
}



