
/**
 * 
 * @author afaelga
 * 
 * 250617 - Australia Potato Grower (AU non-One World, single currency)
 * 018844 - Rock Castle Construction (US non-One World, multiple currencies)
 * 064630 - Sullivan Consulting Ltd (UK non-One World, multiple currencies)
 * 578997 - Thailand Coffee (International Edition non-One World, multiple currencies)
 * 578996 - Global Mining (US One World, multiple currencies)
 * 1018013 - NS Germany OneWorld (Germany One World, multiple currencies)
 * 
 */

    // 10.21.2009 - trying to add the translation resource...
    var dens;
    if (!dens){ dens = {}; }
    dens.Class= {};
    
    // making the needed arrays global for now....
    var taxCodeArray = [];
    var origTotalArAmt = [];
    var invoiceTxOrigAmtArray = [];
    var invoiceTxVatCodesArray = [];
    var invoiceTxVatRateArray = [];
    var discAmtArray = [];
    var appDiscRateArray = [];
    var netDiscAmtArray = [];
    var newNetAmtArray = [];
    var newVatAmtArray = [];    
    var newGrossAmtArray = [];
    var invoiceArray = [];
    var invoiceArrayDesc = [];

    // for client side scripting only...
    var createMode = 'create';
    var editMode = 'edit';
    var viewMode = 'view';

    // these variables are for display as default/carry over values from Customer Payment form
    var gpostingperiod = '';
    var gcurrency = 0;
    var gsubsidiary = 0;
    var gfxamount = 0;
    var gnotfxamount = 0;
    var gexchangerate = 0;
    var gbanktotal = 0;
    var gcreditTerms = ''; 
    var gsalesAcctId = 0;         
    var gtaxAcctId = 0;
    var gPayee = 0;

     function buildLinesOnLoad(type, form, request)
     {
            // NOTE: The thing with scripts that are used as Before Load Functions of forms per recordtype is, they
            // are always executed when the form for that recordtype is loaded. Now whether that form is a standard form
            // or customized form, the codes in the before load function will be executed...always...
            // Therefore, if the beforeload function is specific to a customized form, make sure that the codes are only
            // executed for that custom form otherwise, it might cause problems to the normal loading of
            // the standrd form.
            //
            // this payment id was passed by the forwarding page! which is a script called in an afterSubmit function of the Customer Payment form
            // the said parameter will have a value if coming from the customer payment form, otherwise the form is re-loaded for view and/or edit
            // purposes...
            //
            // the codes below will always be executed whenever a journal form is loaded...standard or custom
            /*
                    -- EXECUTION CONTEXT --
                    userinterface - Client SuiteScript or user event triggers invoked from the UI 
                    webservices - User event triggers invoked from webservice calls 
                    csvimport - User event triggers invoked during CSV imports 
                    offlineclient - User event triggers invoked during offlineclient 
                    smbxml - User event triggers invoked during SMBXML calls 
                    portlet - Portlet script or user event triggers invoked via portlet scripts 
                    scheduled - Scheduled script or user event triggers invoked via scheduled scripts 
                    suitelet - Suitelet or user event triggers invoked via suitelets 
                    custommassupdate - Mass update script triggers invoked via custom Mass Update scripts 
                    workflow - Workflow action script triggers invoked via Workflow Action scripts 
                    webstore - User event triggers invoked from the web store (for example to determine if sales orders or customers were created in the web store).
            
                    // limit the execution of this user event script for 'userinterface' triggered events
                    // 'type' here is view or edit
                    
                    _form = form;
                    _request = request;
                    _viewmode = (type == 'view')?true:false;     
                
            */             
            // only applicable for 'userinterface' context
            // Fix for issue # 188767 - start
            var execContext = nlapiGetContext().getExecutionContext();
            if (execContext != 'userinterface' || request == null || form == null) { return true; }
            // Fix for issue # 188767 - end

            var _RM = dens.Class.Utility.getResourceFile(); 
            var termsdisplay = form.getField('custbody_credit_terms');   // Set the Label of this to German if necessary...
            var reminderdisp = form.getField('custbody_reminder');       // Set the content of this field to German if necessary...

            if (termsdisplay != null ) { termsdisplay.setLabel(_RM.GetString("Terms")); }
            if (reminderdisp != null ) { reminderdisp.setDefaultValue(_RM.GetString("Reminder")); }
            if (type == createMode)
            {
                // getting the 'custparam_tranid' ensures that the codes below are executed only 
                // when forwarded from the Customer Payment form.
                var paymentid = request.getParameter('custparam_tranid');
                gPayee = request.getParameter('custparam_payee');
                if (paymentid != null && paymentid != '')  { computeForValues(form, paymentid); }
            }
            else 
            {  
                // by checking the existence of the custom fields 'custbody_reminder' and/or 'custbody_credit_terms'
                // in the form, this will ensure that the code below is called only when the journal custom form is loaded.
                if ( reminderdisp != null) { setFormFieldsDisplayTypes(form, type); }
                
            }
            
     }
     
     function computeForValues(form, paymentid)
     {
            buildInvoiceFromPaymentId(paymentid); // build the global arrays: invoiceArray, invoiceArrayDesc, discAmtArray arrays...  
            buildTaxCodeArray();                            // build the global array; taxCodeArray 
            buildArAmtArrayFromTaxlines();             // build the global array; origTotalArAmt, from tax lines...
            buildNonTaxlineTxArray();                      // build the global arrays; invoiceTxOrigAmtArray, invoiceTxVatCodesArray, invoiceTxVatRateArray  
            buildMainDisplayValues(paymentid);       // retrieve and build the global variables that will be display in the upper part of the custom form...
            buildSublistData();                                // build the arrays neede for the sublist 
            populateForm( form, paymentid);          // prepare the custom form with the values built from the above functions...

     }
      
     function setFormFieldsDisplayTypes(form, type)
     {
            // IF ACCOUNT HAS SUBSIDIARY, SET AND DISPLAY THE SUBSIDIARY FIELD...
            if (isSubsidiarySettingOn()) 
            { 
                var subsdisplay = form.getField('subsidiary'); 
                subsdisplay.setDisplayType('inline');
                if (type == createMode){ subsdisplay.setDefaultValue(gsubsidiary); }
            }
            
            // IF MULTI CURRENCY IS ON, SET AND DISPLAY CURRENCY FIELD...
            if (isMultiCurrencySettingOn())
            {
                var currdisplay = form.getField('currency');
                currdisplay.setDisplayType('inline');
                if (type == createMode) { currdisplay.setDefaultValue(gcurrency); }
            }

            // the 'gfxamount' and 'gnotfxamount' always has values...
            var fxamount = form.addField('custpage_fxamount', 'text');
            fxamount.setDefaultValue(gfxamount);
            fxamount.setDisplayType('hidden');
            
            var notfxamount = form.addField('custpage_notfxamount', 'text');
            notfxamount.setDefaultValue(gnotfxamount);
            notfxamount.setDisplayType('hidden');
            
            var payee = form.addField('custpage_payee', 'text');
            payee.setDefaultValue(gPayee);
            payee.setDisplayType('hidden');

            var exratedisplay = form.getField('exchangerate');
            exratedisplay.setDisplayType('inline');

            var postdisplay = form.getField('postingperiod');
            var termsdisplay = form.getField('custbody_credit_terms');   // Set the Label of this to German if necessary...
            var reminderdisp = form.getField('custbody_reminder');       // Set the content of this field to German if necessary...
            var reventrydisp = form.getField('reversalentry');

            if (type != viewMode)
            {
                // the customform variable is available only for non-view mode
                var custformdisplay = form.getField('customform'); 
                custformdisplay.setDisplayType('inline');
            }
            else
            {
                if (reminderdisp != null ) { reminderdisp.setDisplayType('hidden'); }
                if (reventrydisp != null ) { reventrydisp.setDisplayType('hidden'); }
            }

            // fromcreate is true, if coming from CustomerPayment Form...
            if (type == createMode)
            {
                var haslines = form.getField('haslines');
                haslines.setDefaultValue(true);

                if (postdisplay != null ) { postdisplay.setDefaultValue(gpostingperiod); }
                if (termsdisplay != null ) { termsdisplay.setDefaultValue(gcreditTerms); }
            }
            
     }
     
     function populateForm(form, paymentid)
     {
            setFormFieldsDisplayTypes(form, type);  // SET THE NON-SUBLIST PART OF THE FORM
            
            // SET THE SUBLIST PART OF THE FORM     
            var lineSL = form.getSubList('line');
            var linectr = 1;


            for (var invoiceline in invoiceTxOrigAmtArray )
            {
                
                var discountlinesArrayX = invoiceTxOrigAmtArray[invoiceline];
                var netDiscAmtArrayX = netDiscAmtArray[invoiceline];
                var invoiceTxVatCodesArrayX = invoiceTxVatCodesArray[invoiceline];
                var invoiceTxVatRateArrayX = invoiceTxVatRateArray[invoiceline];
                var newGrossAmtArrayX = newGrossAmtArray[invoiceline];

                // disable the 'entity' column 
                var payeeName = nlapiGetLineItemField ('line', 'entity', linectr); // disable this field...
                payeeName.setDisplayType('disabled');

                // if the values below are equal, there is no discount... 
                if (parseFloat(netDiscAmtArrayX) == parseFloat(discountlinesArrayX) ) { continue; }
                
                // provide the payee account 
                lineSL.setLineItemValue('entity', linectr, gPayee );
                
                lineSL.setLineItemValue('account', linectr, gsalesAcctId );
                lineSL.setLineItemValue('credit', linectr, setPrecision(discAmtArray[invoiceline]));
                lineSL.setLineItemValue('memo', linectr++, invoiceArrayDesc[invoiceline]);
                
                var debittotal = 0;
                var credittotal = 0;
                credittotal = setPrecision(discAmtArray[invoiceline]) - 0; //  subtract 0 to make sure returned value is numeric
                
                for (var discountline in discountlinesArrayX)
                {
                    lineSL.setLineItemValue('entity', linectr, gPayee );

                    lineSL.setLineItemValue('account', linectr, gsalesAcctId );
                    lineSL.setLineItemValue('debit', linectr, setPrecision(netDiscAmtArrayX[discountline]));
                    lineSL.setLineItemValue('memo', linectr, invoiceArrayDesc[invoiceline]);
                
                    lineSL.setLineItemValue('taxcode', linectr, invoiceTxVatCodesArrayX[discountline]);
                    lineSL.setLineItemValue('taxrate1', linectr, invoiceTxVatRateArrayX[discountline]);
                
                    // compute the displayed net vat amount instead of retrieving the amount from the saved array...
                    var grossvatShown = setPrecision(newGrossAmtArrayX[discountline]);
                    var netvatShown = setPrecision(netDiscAmtArrayX[discountline]);
                    var vatamtShown = grossvatShown - netvatShown;
                    var vattaxrate = invoiceTxVatRateArrayX[discountline];
                
                    lineSL.setLineItemValue('grossamt', linectr, setPrecision(newGrossAmtArrayX[discountline]));
                    lineSL.setLineItemValue('tax1amt', linectr, setPrecision(vatamtShown));
                    lineSL.setLineItemValue('tax1acct', linectr++, gtaxAcctId);
                
                    debittotal += setPrecision(newGrossAmtArrayX[discountline]) - 0;
                }
                
                // check for imbalance...
                var unbalancedAmt = setPrecision(credittotal - debittotal) - 0;  // credittotal - debittotal = unbalanced
                
                // unbalance is > 0, add the absolute value of the difference to the debit of the last tax account line...
                // unbalance is < 0, subtract the absolute value of the difference to the debit of the last tax account line...
                if (unbalancedAmt != 0) 
                {
                    var fixedGrossAmt = parseFloat(grossvatShown,2) + parseFloat(unbalancedAmt,2);
                    var fixedNetAmt = fixedGrossAmt / (1 + parseFloat(vattaxrate));
                    var fixedVatAmt = fixedGrossAmt - fixedNetAmt;
                    
                    // update the gross, vat and net amounts...
                    lineSL.setLineItemValue('grossamt', linectr - 1, setPrecision(fixedGrossAmt));
                    lineSL.setLineItemValue('debit', linectr - 1, setPrecision(fixedNetAmt));
                    lineSL.setLineItemValue('tax1amt', linectr - 1, setPrecision(fixedVatAmt));
                }
            }
     }

     function buildSublistData()
    {
        
        // NOTE : invoiceTxOrigAmtArray is array of arrays
        for (var invoiceline in invoiceTxOrigAmtArray)
        {
            var invoicelineSubArray = invoiceTxOrigAmtArray[invoiceline];
            var invoicevatrate = invoiceTxVatRateArray[invoiceline];
            
            var netDiscAmtArraySubArray = [];
            var newNetAmtArraySubArray = [];
            var newVatAmtArraySubArray = [];
            var newGrossAmtArraySubArray = [];
            
            for ( invoicelineSubArrayItem in  invoicelineSubArray )
            {

                netDiscAmtArraySubArray[netDiscAmtArraySubArray.length] =  invoicelineSubArray[invoicelineSubArrayItem] * appDiscRateArray[invoiceline];
                newNetAmtArraySubArray[newNetAmtArraySubArray.length] =  invoicelineSubArray[invoicelineSubArrayItem] - netDiscAmtArraySubArray[invoicelineSubArrayItem];

                var rate = parseFloat(invoicevatrate[invoicelineSubArrayItem]); // compute the new vat amount & gross amount of each tx...
                
                rate = isNaN(rate)?1:(rate/100);
                newVatAmtArraySubArray[newVatAmtArraySubArray.length] = netDiscAmtArraySubArray[invoicelineSubArrayItem] * rate; 
                newGrossAmtArraySubArray[newGrossAmtArraySubArray.length] = netDiscAmtArraySubArray[invoicelineSubArrayItem] + newVatAmtArraySubArray[invoicelineSubArrayItem]  
            }
            
            //  save the array to an element of the array... 
            netDiscAmtArray[invoiceline] = netDiscAmtArraySubArray;
            newNetAmtArray[invoiceline] = newNetAmtArraySubArray;
            newVatAmtArray[invoiceline] = newVatAmtArraySubArray;      
            newGrossAmtArray[invoiceline] = newGrossAmtArraySubArray;
        }    
    }

     function buildMainDisplayValues(paymentRecId)
    {
        // set the discount's applicable discount rate...
        for (var discline in discAmtArray ) { appDiscRateArray[discline] = discAmtArray[discline] / origTotalArAmt[discline]; }

        // use the following search to simply retrieve the account ids for 'other income' & 'other asset'
        // also retrieve some default values like postingperiod, currency, subsidiary...       
        var arrayPaymentSC = new Array();
        var arrayPaymentSR = new Array();
        var arrayPaymentSF = new Array();

        // filter the search...
        var fxAmountFilter = new nlobjSearchFilter('formulanumeric', null, 'greaterthan', 0);
        if (isMultiCurrencySettingOn()){fxAmountFilter.setFormula('ABS({fxamount})');}
        else{fxAmountFilter.setFormula('ABS({amount})');}
        arrayPaymentSF[arrayPaymentSF.length] = fxAmountFilter;
        
        arrayPaymentSF[arrayPaymentSF.length] = new nlobjSearchFilter('debitamount', null, 'greaterthan', 0.00); // if with value, indicates 'Other Current Asset' and 'Other Income'
        arrayPaymentSF[arrayPaymentSF.length] = new nlobjSearchFilter('internalid', null, 'is', paymentRecId);
        arrayPaymentSF[arrayPaymentSF.length] = new nlobjSearchFilter('type', null, 'anyof', 'CustPymt');
        
        // specify the return columns...
        var computedFxAmt = new nlobjSearchColumn('formulanumeric');
        if (isMultiCurrencySettingOn())
        {
            computedFxAmt.setFormula('{exchangerate} * {fxamount}');
            
            // 'currency' search column field is available only when MULTICURRENCY is on!
            arrayPaymentSC[arrayPaymentSC.length] = new nlobjSearchColumn('currency');
        }
        else{computedFxAmt.setFormula('{exchangerate} * {amount}');}
        arrayPaymentSC[arrayPaymentSC.length] = computedFxAmt;       // computed fx amount...
         
        arrayPaymentSC[arrayPaymentSC.length] = new nlobjSearchColumn('netamountnotax');  // just needed for account code retrieval, not value related use...
        arrayPaymentSC[arrayPaymentSC.length] = new nlobjSearchColumn('account');
        arrayPaymentSC[arrayPaymentSC.length] = new nlobjSearchColumn('postingperiod');
        arrayPaymentSC[arrayPaymentSC.length] = new nlobjSearchColumn('amount');  // sometimes this is negative...

        if (isSubsidiarySettingOn()) { arrayPaymentSC[arrayPaymentSC.length] = new nlobjSearchColumn('subsidiary'); }
        arrayPaymentSR = nlapiSearchRecord('transaction', null, arrayPaymentSF, arrayPaymentSC);

        for( var pline in arrayPaymentSR)
        {
            // set the global fields one time only...
            if ( gpostingperiod == '') 
            {
                gpostingperiod = arrayPaymentSR[pline].getValue('postingperiod');
                gfxamount = Math.abs(parseFloat(arrayPaymentSR[pline].getValue('formulanumeric')));
                gnotfxamount = Math.abs(parseFloat(arrayPaymentSR[pline].getValue('amount')));
                
                if (isSubsidiarySettingOn()) { gsubsidiary = arrayPaymentSR[pline].getValue('subsidiary'); }
                if (isMultiCurrencySettingOn()) { gcurrency = arrayPaymentSR[pline].getValue('currency'); }
            }

            //NOTE: we are only displaying the Sales Discount accounts
            var netamtnotax = parseFloat(arrayPaymentSR[pline].getValue('netamountnotax'));
            netamtnotax = isNaN(netamtnotax) || netamtnotax == null?0: netamtnotax;
            if (Math.abs(netamtnotax) > 0)
            {
                gsalesAcctId = arrayPaymentSR[pline].getValue('account'); // netamountnotax if NOT empty, this is the other income account
            }
            //nlapiLogExecution('DEBUG', "arrayPaymentSR[pline].getValue('account') => #"+arrayPaymentSR[pline].getValue('account')+"#");
            
        }
    }

     function buildNonTaxlineTxArray()
    {
        
        // this function retrieves the original A/R amount
        var arrayNonTaxlineSC = new Array();
        var arrayNonTaxlineSR = new Array();
        var arrayNonTaxlineSF = new Array();
        
        arrayNonTaxlineSF[arrayNonTaxlineSF.length] = new nlobjSearchFilter('internalid', null, 'anyof',invoiceArray);       // with the specified invoiceid
        arrayNonTaxlineSF[arrayNonTaxlineSF.length] = new nlobjSearchFilter('type', null, 'is', 'CustInvc');             // transaction is invoice (maybe we can remove this filter later on)
        arrayNonTaxlineSF[arrayNonTaxlineSF.length] = new nlobjSearchFilter('taxline', null, 'is', 'F');  // get the non-tax lines 
        arrayNonTaxlineSF[arrayNonTaxlineSF.length] = new nlobjSearchFilter('taxitem', null, 'noneof', '@NONE@');  // lines with taxcode means this is the line item...not the accounts receivable line

        // added the filter for the amount/fxamount... get only non-zero amount... added. 05.26.2009 
        var fxAmountFilter = new nlobjSearchFilter('formulanumeric', null, 'greaterthan', 0);
        if (isMultiCurrencySettingOn()){fxAmountFilter.setFormula('ABS({fxamount})');}
        else{fxAmountFilter.setFormula('ABS({amount})');}
        arrayNonTaxlineSF[arrayNonTaxlineSF.length] = fxAmountFilter;
        
        var amountColumn;
        if (isMultiCurrencySettingOn()){amountColumn = new nlobjSearchColumn('fxamount');}
        else{amountColumn = new nlobjSearchColumn('amount');}
        
        arrayNonTaxlineSC[arrayNonTaxlineSC.length] = amountColumn; 
        arrayNonTaxlineSC[arrayNonTaxlineSC.length] = new nlobjSearchColumn('taxitem');      // to get the rate, use the taxcode here and find it in the taxCodeArray (this is safer...)

        // sort the search result by internalid...ascending...
        var sortedInternalId = new nlobjSearchColumn('internalid'); // include the filter field in the search column for order purposes later...
        sortedInternalId.setSort(false);
        arrayNonTaxlineSC[arrayNonTaxlineSC.length] = sortedInternalId; 
        arrayNonTaxlineSR = nlapiSearchRecord('transaction', null, arrayNonTaxlineSF, arrayNonTaxlineSC);

        // since taxamount filtering is not possible, (see above), the returned search includes non net sales lines...so, retrieve only net sales lines...
        // ALSO, this ordered by invoice internal id...
        var currentInvoiceId = '';
        var arrayindex = -1;
        var origamtvaluearr = [];
        var vatcodearr = [];
        var vatratearr = [];
        
        for (var searchline in arrayNonTaxlineSR)
        {
            var searchRecord = arrayNonTaxlineSR[searchline];
            var vattaxitem = searchRecord.getValue('taxitem');

            if ( currentInvoiceId != searchRecord.getValue('internalid')) 
            {
                currentInvoiceId = searchRecord.getValue('internalid'); 
                origamtvaluearr = [];
                vatcodearr = [];
                vatratearr = [];
                arrayindex++; 
            }
            
            if (isMultiCurrencySettingOn()){origamtvaluearr[origamtvaluearr.length] = searchRecord.getValue('fxamount');}
            else{ origamtvaluearr[origamtvaluearr.length] = searchRecord.getValue('amount');}
            
            vatcodearr[vatcodearr.length] = vattaxitem;
            
            invoiceTxOrigAmtArray[arrayindex] = origamtvaluearr;
            invoiceTxVatCodesArray[arrayindex] = vatcodearr;

            // get the rate from the 'taxCodeArray' global array...
            var vatrate = 0;
            for (var i = 0; i < taxCodeArray.length; i++)
            {
                if (vattaxitem == taxCodeArray[i].getId() ) 
                { 
                    vatrate = parseFloat(taxCodeArray[i].getValue('rate')); 
                    vatrate = isNaN(vatrate)? 1 : vatrate;
                    vatratearr[vatratearr.length] = vatrate;
                    break;
                } 
            }
            invoiceTxVatRateArray[arrayindex] = vatratearr;
        }
    } 
      
     function buildArAmtArrayFromTaxlines()
    {
        var arrayTaxlineSC = new Array();
        var arrayTaxlineSR = new Array();
        var arrayTaxlineSF = new Array();
        
        arrayTaxlineSF[arrayTaxlineSF.length] = new nlobjSearchFilter('internalid', null, 'anyof', invoiceArray);
        arrayTaxlineSF[arrayTaxlineSF.length] = new nlobjSearchFilter('taxline', null, 'is', 'T');

        var arFxAmount = new nlobjSearchColumn('formulanumeric', null, 'max');
        arFxAmount.setFormula('{totalamount} / {exchangerate}');
        arFxAmount.setLabel('arfxamount');
        
        var sortedInternalId = new nlobjSearchColumn('internalid', null, 'group'); // include the filter field in the search column for order purposes later...
        sortedInternalId.setSort(false); // sort the search result by internalid...ascending...

        arrayTaxlineSC[arrayTaxlineSC.length] = arFxAmount;
        arrayTaxlineSC[arrayTaxlineSC.length] = sortedInternalId; 
        arrayTaxlineSC[arrayTaxlineSC.length] = new nlobjSearchColumn('account', null, 'group');    // account for the tax line...
        arrayTaxlineSC[arrayTaxlineSC.length] = new nlobjSearchColumn('terms', null, 'group');
        arrayTaxlineSC[arrayTaxlineSC.length] = new nlobjSearchColumn('number', null, 'group');
        
        // run the search...    
        arrayTaxlineSR = nlapiSearchRecord('transaction', null, arrayTaxlineSF, arrayTaxlineSC);

        for (var currenttaxline in arrayTaxlineSR)
        {
            // for tax account id and credit terms, just retrieve the first occurrence...
            if (currenttaxline == 0 ) 
            {
                gtaxAcctId = arrayTaxlineSR[currenttaxline].getValue('account', null, 'group');
                gcreditTerms = arrayTaxlineSR[currenttaxline].getText('terms', null, 'group');
            }

            // formula numeric here refers to the ar amount in forex
            var arAmount = arrayTaxlineSR[currenttaxline].getValue('formulanumeric', null, 'max');
            origTotalArAmt[origTotalArAmt.length] = parseFloat(arAmount);
        }    
     }
     
     function buildTaxCodeArray()
    {
        var arrayTaxlineSC = new Array();
        var arrayTaxlineSR = new Array();
        var arrayTaxlineSF = new Array();
        
        // WHEN AN ACCOUNT HAS A SUBSIDIARY SETTING TO ON, INCLUDE 'COUNTRY' FILTER WHEN RETRIEVING TAX CODES...
        if (isSubsidiarySettingOn()) { arrayTaxlineSF[arrayTaxlineSF.length] = new nlobjSearchFilter('country', null, 'is','DE'); }
        
        arrayTaxlineSC[arrayTaxlineSC.length] = new nlobjSearchColumn('itemid');   // tax code
        arrayTaxlineSC[arrayTaxlineSC.length] = new nlobjSearchColumn('rate');      // tax rate
        arrayTaxlineSC[arrayTaxlineSC.length] = new nlobjSearchColumn('name');    // tax description  // iwan muna natin...
        arrayTaxlineSR = nlapiSearchRecord('salestaxitem', null, arrayTaxlineSF, arrayTaxlineSC);
        
        taxCodeArray = arrayTaxlineSR;  // the value of the global variable...
    }
     
     function buildInvoiceFromPaymentId(paymentrefno)
    {
        var arrayInvoiceSC = new Array();
        var arrayInvoiceSR = new Array();
        var arrayInvoiceF = new Array();
        
        // filter columns...
        var fxAmountFilter = new nlobjSearchFilter('formulanumeric', null, 'greaterthan', 0);
        if (isMultiCurrencySettingOn()){fxAmountFilter.setFormula('ABS({fxamount})'); }
        else{fxAmountFilter.setFormula('ABS({amount})');}
        arrayInvoiceF[arrayInvoiceF.length] = fxAmountFilter;
        arrayInvoiceF[arrayInvoiceF.length] = new nlobjSearchFilter('internalid', null, 'is', paymentrefno);
        arrayInvoiceF[arrayInvoiceF.length] = new nlobjSearchFilter('appliedtotransaction', null, 'noneof', '@NONE@');

        // search columns...
        var currency =  new nlobjSearchColumn('formulanumeric', null, 'max');
        currency.setFormula('{exchangerate}');
        currency.setLabel('exchangerate');
        
        var sumOfFxAmount =  new nlobjSearchColumn('formulanumeric', null, 'sum');
        if (isMultiCurrencySettingOn()){sumOfFxAmount.setFormula('ABS({fxamount})'); }
        else{sumOfFxAmount.setFormula('ABS({amount})');}
        sumOfFxAmount.setLabel('totalfxamt'); 
        
        var maxOfFxAmount =  new nlobjSearchColumn('formulanumeric', null, 'max');
        if (isMultiCurrencySettingOn()){maxOfFxAmount.setFormula('ABS({fxamount})'); }
        else{maxOfFxAmount.setFormula('ABS({amount})');}
        maxOfFxAmount.setLabel('arfxamt'); 

        var sortedInvoiceNbr = new nlobjSearchColumn('appliedtotransaction',null, 'group');
        sortedInvoiceNbr.setSort(false);
        sortedInvoiceNbr.setLabel('invoice');

        // applied to link is the actual discount per invoice...BUT in base currency...
        var discountFxAmount =  new nlobjSearchColumn('formulanumeric', null, 'min');
        discountFxAmount.setFormula('ABS({appliedtolinkamount} / {exchangerate})');
        discountFxAmount.setLabel('discountapplied');

        // set the search columns...    
        //arrayInvoiceSC[arrayInvoiceSC.length] = totalamount            // <- amount in base currency... 
        arrayInvoiceSC[arrayInvoiceSC.length] = currency;               // <- this returns the exchangerate, not rounded!
        arrayInvoiceSC[arrayInvoiceSC.length] = sumOfFxAmount;    // <- this holds the foreign amount of the A/R and the discount lines....
        arrayInvoiceSC[arrayInvoiceSC.length] = maxOfFxAmount;   // <- this holds the foreign amount of the A/R.
        arrayInvoiceSC[arrayInvoiceSC.length] = sortedInvoiceNbr;   
        arrayInvoiceSC[arrayInvoiceSC.length] = discountFxAmount;  // discount amount per invoice   

        arrayInvoiceSR = nlapiSearchRecord('transaction', null, arrayInvoiceF, arrayInvoiceSC);  // run the search...

        for (var invoiceline in arrayInvoiceSR)
        {
            var currinvoiceln = arrayInvoiceSR[invoiceline];
            var allcolumns = currinvoiceln.getAllColumns();
            var fxamtwithdiscount = 0;
            var fxamtwithnodiscount = 0;
            
            // traversing the columns is needed because, i used multiple search columns with the same name 'formulanumeric'...
            for ( var col = 0; col < allcolumns.length; col++)
            {
                var column = allcolumns[col];    
                var value = currinvoiceln.getValue(column);      // get the value of the invoice line...
                var valuetext = currinvoiceln.getText(column);  // get the text value of the invoice line, if any...
                var label = column.getLabel();
                
                if(label == 'totalfxamt'){ fxamtwithdiscount = value; }
                else if (label == 'exchangerate')
                { 
                    if (gexchangerate <= 0) { gexchangerate = value; }
                }
                else if(label == 'arfxamt')
                {   
                    if (gbanktotal <= 0) { gbanktotal = value; }
                 }
                else if(label == 'invoice')
                {
                    invoiceArray[invoiceArray.length] = value;
                    invoiceArrayDesc[invoiceArrayDesc.length] = valuetext;
                }
                else if(label == 'discountapplied')
                {
                    discAmtArray[discAmtArray.length] = value;
                }
            }
        }
    }

     function setPrecision(value, precision)
    {
        if (precision == null ) { precision = 2; }
        return parseFloat(value).toFixed(precision);
    }

     function isSubsidiarySettingOn() { return isAcctFeatureOn('FEATURE', 'SUBSIDIARIES'); } 
     
    function isMultiCurrencySettingOn() { return isAcctFeatureOn('FEATURE', 'MULTICURRENCY'); }

    function isAcctFeatureOn(featureType, featureName)
    {
        var isFeatureOn = true;
        var featureStatus = nlapiGetContext().getSetting(featureType, featureName);
        if( featureStatus == 'F' ) {  isFeatureOn = false; }
        return isFeatureOn;
    }
     
     /** 
      * THE FOLLOWING CODES ARE USED WHEN FORWARDING TO THE CUSTOMIZED JOURNAL FORM  FROM THE CUSTOMER PAYMENT FORM
      * This was setup in the User Event deployment. The .js file has the same name used by the beforeLoad function of the custom Journal Entry form.     
      */
     function forwardToJE(type)
     {
        if( type == 'create' )
        { 
            var rec = nlapiGetNewRecord();
            var recordType = rec.getRecordType(); 
            var recId = rec.getId();
            var payee = rec.getFieldValue('customer');
            var params= new Array();


            //nlapiLogExecution("DEBUG", "inside [forwardToJE] recordType => "+recordType+" : recId => "+recId+" : payee => "+payee);
            // record type would always be 'customerpayment'
            // recId should not be 0 [zero] if straight forward payment is used instead of using credits...
            // for fix to case # 1127440. Forwarding to the journal entry page will happen when there is an actual
            // payment record created
            if (recId > 0)
            {
                //nlapiLogExecution("DEBUG", "inside [forwardToJE] recordType => "+recordType+" : recId => "+recId+" : payee => "+payee);
                if (validForRedirect(params, recordType, recId) ) 
                {
                    params['custparam_tranid'] = recId;
                    params['custparam_payee'] = payee;
                    nlapiSetRedirectURL("TASKLINK", 'EDIT_TRAN_JOURNAL', null, null, params); 
                }
            }
            
        }
     }
     
     function validForRedirect(params, recordType, paymentId)
     {
        var goodToGo = false;
        var paymentRecord = nlapiLoadRecord(recordType, paymentId);
        
        if (isSubsidiarySettingOn())
        {
            var subsidiary = paymentRecord.getFieldValue('subsidiary');
            goodToGo = isGermanSubsidiary(subsidiary);
        }
        return goodToGo;
     } 
     
     function isGermanSubsidiary(txsubsidiary)
    {
        var arraySubsidiarySC = new Array();
        var arraySubsidiarySR = new Array();
        var arraySubsidiarySF = new Array();
        
        arraySubsidiarySF[arraySubsidiarySF.length] = new nlobjSearchFilter('country', null, 'is','DE');
        arraySubsidiarySC[arraySubsidiarySC.length] = new nlobjSearchColumn('internalid');
        arraySubsidiarySR = nlapiSearchRecord('subsidiary', null, arraySubsidiarySF, arraySubsidiarySC);

        var isGermanSub = false; 
        for (var searchline in arraySubsidiarySR)
        {
            if (arraySubsidiarySR[searchline].getValue('internalid') == txsubsidiary) {
                isGermanSub = true;
                break;
            }
        }
        
        return isGermanSub;
    }
     
     /** 
      * THE FOLLOWING CODES ARE USED WHEN SETTING UP THE CUSTOMIZED JOURNAL FORM  UPON LOADING
      * This was setup in the Client Event deployment. The .js file has the same name used by the beforeLoad function of the custom Journal Entry form.     
      * THE SCRIPT SETTING HAS BEEN ASSOCIATED TO THE CUSTOMIZED FORM. SO, TO SEE THE SETTING, GO TO THE CUSTOMIZED FORM...
      */
      
     function checkSettings(type)
     {
            if (type != viewMode) 
            {
                if (isMultiCurrencySettingOn()){ Synccurrency(true,false); }
                
                /*
                if (isSubsidiarySettingOn())
                {
                    if (document.getElementById('custpage_notfxamount') != null || document.getElementById('custpage_notfxamount') == '')
                    {
                        var notfxamount = document.getElementById('custpage_notfxamount').value;
                        var fxamount = document.getElementById('custpage_fxamount').value;
                        var warningMsg = "The correct subsidiary is not properly set in the Restrict View!\n\n" +
                        "After clicking the 'OK' button of this alert window, please follow the instructions below:\n" +
                        "1. Open a new browser window by selecting File->New Window on this browser page.\n" +
                        "2. On the new window, navigate to 'Home->Set Preferences'.\n" +
                        "3. Select the 'Restrict View' tab. \n" +
                        "4. On the 'Subsidiary' dropdown, select the appropriate 'German Subsidiary'. \n" +
                        "5. Click 'Save'.\n" +
                        "6. On the 'Journal' page, press F5 to refresh it, displaying the correct values.\n\n" +
                        "NOTE: When you open a new window, this alert message will be shown again. \n" +
                        "You can follow the steps above by using the previous window and keep this one as your guide.";

                        if (parseFloat(notfxamount) != parseFloat(fxamount)) { alert(warningMsg); }
                    }
                }
                */ 
            }
     }
     

     function setPayeeValue(type)
     {
        var payeE = document.getElementById('custpage_payee');
        
        if ( payeE != null ){ nlapiSetCurrentLineItemValue(type, 'entity', payeE.value, false, true); }
        return true;
     }
     

    dens.Class.Utility = function (){}
    dens.Class.Utility.isAcctFeatureOn = function (featureType, featureName) 
    { 
        var isFeatureOn = true;
        var featureStatus = nlapiGetContext().getSetting(featureType, featureName);
        if( featureStatus == 'F' ) {  isFeatureOn = false; }
        return isFeatureOn;
    }

    dens.Class.Utility.getResourceFile = function()
    {
        return new ns.Resources.ResourceManager("de_resfile", nlapiGetContext().getPreference('LANGUAGE'));
    }
