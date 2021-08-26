
/**
 * @author afaelga
 * 
PRINTING OPTION : 1 - Print Journal number - single 
PRINTING OPTION : 2 - Print Journal numbers 'From' and 'To'
PRINTING OPTION : 3 - Print Journals between certain dates (one report) *
 */
// *** SECTION FOR THE GLOBAL FUNCTIONS - starts here *** //
// START HERE!!!!
var jpns;
if (!jpns){ jpns = {}; }
jpns.Class = {};


// userevent function that handles the loading...
function addPrintButtonOnLoad(type, form, request)
{
	if ( type == 'view')
	{ 
		form.setScript('customscript_journal_print_client');
		var tranid = form.addField('custpage_jetranid', 'text');
		tranid.setDefaultValue(nlapiGetFieldValue('tranid'));
		tranid.setDisplayType('hidden');
		var trandate = form.addField('custpage_jetrandate', 'text');
		trandate.setDefaultValue(nlapiGetFieldValue('trandate'));
		trandate.setDisplayType('hidden');

		var internalid = form.addField('custpage_id', 'text');
		internalid.setDefaultValue(nlapiGetFieldValue('id'));
		internalid.setDisplayType('hidden');

		form.addButton('custpage_printbutton', 'Print', "redirectToJePrinting");
	}
	else 
	{
		var printButton = form.getButton('custpage_printbutton');
		if (printButton != null) {form.removeButton('custpage_printbutton');}
	}
}

function redirectToJePrinting()
{
	var jeinternalid = nlapiGetFieldValue('custpage_id');
	var suiteletUrl = nlapiResolveURL('SUITELET', 'customscript_journal_print_option', 'customdeploy_journal_print_option');
	suiteletUrl += "&custscript_id="+jeinternalid;
    window.open(suiteletUrl, '', 'height=600,width=1000,scrollbars,resizable');
}

//*** SECTION FOR THE GLOBAL FUNCTIONS - starts here *** //
function main(request, response)
{
	// for single journal transaction...
    var jenid = request.getParameter('custscript_id')==''?'':request.getParameter('custscript_id');
        
    // je number range...
    var jenbrarr = [];
    if ( !isNaN( parseInt( request.getParameter('custscript_jenbrfrom')))) { jenbrarr[0] = request.getParameter('custscript_jenbrfrom'); }
    if ( !isNaN(parseInt(request.getParameter('custscript_jenbrto')))) 
    { 
    	jenbrarr[1] = request.getParameter('custscript_jenbrto');
    	if ( isNaN(parseInt( request.getParameter('custscript_jenbrfrom')))) { jenbrarr[0] = request.getParameter('custscript_jenbrto'); }
    }
    else 
    {
    	if ( !isNaN(parseInt(request.getParameter('custscript_jenbrfrom')))) { jenbrarr[1] = request.getParameter('custscript_jenbrfrom'); }
    }

    // je date range...
    var jedatearr = [];
    if ( request.getParameter('custscript_jedatefrom') != null && request.getParameter('custscript_jedatefrom') != "" ) { jedatearr[0] = jpns.Class.Utility.getJrnlDate(request.getParameter('custscript_jedatefrom')); }
    if ( request.getParameter('custscript_jedateto') != null && request.getParameter('custscript_jedateto') != "" )
    {
    	 jedatearr[1] = jpns.Class.Utility.getJrnlDate(request.getParameter('custscript_jedateto'));
    	 if ( request.getParameter('custscript_jedatefrom') == null || request.getParameter('custscript_jedatefrom') == "" ){ jedatearr[0] = jpns.Class.Utility.getJrnlDate(request.getParameter('custscript_jedateto')); }
    }
    else
    {
   	 	if ( request.getParameter('custscript_jedatefrom') != null && request.getParameter('custscript_jedatefrom') != "" ){ jedatearr[1] = jpns.Class.Utility.getJrnlDate(request.getParameter('custscript_jedatefrom')); }
    }

	var jpreport = new jpns.Class.JournalReport(jenid, jenbrarr, jedatearr);
    jpreport.getJournals();
    jpreport.printJournals();
    
    var jhtmlPage = new jpns.Class.HtmlPage(jpreport);
    response.write(jhtmlPage.printOut);
	
}
// *** SECTION FOR THE GLOBAL FUNCTIONS - ends here ***//

//*** SECTION FOR THE CLASS DEFINITION - starts here *** //
jpns.Class.HtmlPage = function(jePrintObject)
{
	// set the css definitions here...
	var finalHtmlOutput = '';
	var cssDefinition =	"<HEAD>"+
	 "<STYLE type='text/css'>"+
	   "table.jetable {font-family:verdana; border-width: 0; border: none; text-align:center;}"+
	   "th {padding-left: 10px;} "+
	   "th.jerephdr {font-size:12; font-weight: bold; text-align:center;} " +	 
	   "th.jecolhdr {font-size:11; font-weight: bold; text-align:center; } " +	 
	   "tr.jerow {font-size:11; } " +
	   "td {padding-left: 10px;} "+
	   "td.jetdtext {border-width: 0; border: none; text-align: left; font-size:11;}"+
	   "td.jetdamt{border-width: 0; border: none; text-align: right; font-size:11;}"+
	   "td.jeftr {font-size:11; font-weight: bold; text-align:right;} " +	 
	 "</STYLE>"+
	"</HEAD>";
	
	// border-spacing: 5px; 
	
	var htmlOutString = jePrintObject.getHtmlOutput();
	htmlOutString = htmlOutString.replace(/<table>/gi,"<table class='jetable'>");
	htmlOutString = htmlOutString.replace(/<tr>/gi,"<tr class='jerow'>");
	htmlOutString = htmlOutString.replace(/<td>/gi,"<td class='jetdtext'>"); 
	htmlOutString = htmlOutString.replace(/<td id='number'>/gi,"<td class='jetdamt'>");
	htmlOutString = htmlOutString.replace(/<th>/gi,"<th class='jecolhdr'>");
	htmlOutString = htmlOutString.replace(/<th id='rephdr'>/gi,"<th colspan=14 class='jerephdr'>"); 
	htmlOutString = htmlOutString.replace(/<td id='repftr'>/gi,"<td class='jeftr'>"); 
	finalHtmlOutput = cssDefinition + htmlOutString;
	this.printOut = finalHtmlOutput;
	
}

// define the utility class
jpns.Class.Utility = function (){}
jpns.Class.Utility.isSubsidiarySettingOn = function () { return jpns.Class.Utility.isAcctFeatureOn('FEATURE', 'SUBSIDIARIES'); }
jpns.Class.Utility.isMultiCurrencySettingOn = function () { return jpns.Class.Utility.isAcctFeatureOn('FEATURE', 'MULTICURRENCY'); }
jpns.Class.Utility.isAcctFeatureOn = function (featureType, featureName) 
{ 
    var isFeatureOn = true;
    var featureStatus = nlapiGetContext().getSetting(featureType, featureName);
    if( featureStatus == 'F' ) {  isFeatureOn = false; }
    return isFeatureOn;
}

jpns.Class.Utility.getSearchRecordValue = function ( searchRecordLine, columnName, columnJoin, columnSummary, strValue)
{
	var data = '';
	if (strValue == 'value'){ data = searchRecordLine.getValue(columnName,columnJoin,columnSummary); }
	else{ data = searchRecordLine.getText(columnName,columnJoin,columnSummary); }
	return data;    
}

jpns.Class.Utility.getSubsidiary = function(psubs)
{
	var subsidiary = '--none--';
	var searchFilters = [];
	var searchColumns = [];
	var searchResults = [];

    var subsfilter = psubs != null? psubs:nlapiGetContext().getSubsidiary();
    searchFilters[searchFilters.length] = new nlobjSearchFilter('internalid', null, 'is', subsfilter);
    
	searchColumns[searchColumns.length] = new nlobjSearchColumn('name');
	searchResults = nlapiSearchRecord('subsidiary', null, searchFilters, searchColumns);
	if ( searchResults != null ) { subsidiary = searchResults[0].getValue('name'); } 
	return subsidiary;
}

jpns.Class.Utility.formatAmount = function(amount, absolute)
{
	var formattedAmount = 0;
	if ( amount == null || isNaN(parseFloat(amount)) || parseFloat(amount) == 0.00) { formattedAmount = ''; }
	else 
	{
	    if (absolute){formattedAmount = parseFloat( Math.abs(amount) ); }
		else { formattedAmount = parseFloat( amount ); }
	    formattedAmount.toFixed(2);
	    formattedAmount = jpns.Class.Utility.formatCurrency(formattedAmount, 2);
	    //formattedAmount = nlapiFormatCurrency(formattedAmount);
		//if ( formattedAmount < 0) { formattedAmount = formattedAmount.replace('-','(') + ')'; }
	}
	return formattedAmount;
	 
} 

jpns.Class.Utility.formatCurrency = function(value, precision)
{
    var value = (parseFloat(value)).toFixed(precision);
    var wholePart = precision > 0 ? (value.substr(0, (value.length - precision) - 1)) : value;
    var decimalPart = value.substr(value.length - precision, precision);
    var decimalSymbol = value.substr( (value.length - precision) - 1, 1);  // get the decimal symbol...
    var thousandsSeparator = (decimalSymbol == '.')?',':'.';  					  // provide the thousand separator...

    var formatted = "";
    for (var i = 0; i < wholePart.length; ++i) {
        formatted += (formatted != "" && (wholePart.length - i) % 3 == 0) ? thousandsSeparator : "";
        formatted += wholePart.charAt(i);
    }
    //return formatted;
    return formatted + (precision > 0 ? (decimalSymbol + decimalPart) : "");
}

jpns.Class.Utility.getJrnlDate = function (datefld) 
{ 
    var yyyy = datefld.substring(0,4);
    var mm = datefld.substring(4,6);
    var dd = datefld.substring(6);
    var jrnldate = new Date();
    jrnldate.setFullYear(yyyy);
    jrnldate.setMonth(mm);
    jrnldate.setDate(dd);
    return nlapiDateToString(jrnldate);
 }
 
// define the JournalReport class
jpns.Class.JournalReport = function (jeId, jeNbrArray, jeDateArray)
{

	// member variables
	var htmlOutput = '';

	// public getter... Available externally...
	this.getHtmlOutput = function(){ return htmlOutput; } 
	function setHtmlOutput(htmlContent){ htmlOutput = htmlContent; }  // private setter... ONLY this class is allowed to set the value of the content

	// define the report header...
	var generalJournal = '';
	var reportDate = '';

	var journalDetails = [];  // array of Journal class instances...
	
    // variables for footer totals...
	var totalDebit = 0;
	var totalCredit = 0;
	var totalDebitTaxAmt = 0;
	var totalCreditTaxAmt = 0;

	// define the report parameters passed...
	var journalNumber = [];
	var journalMonth = [];
	var journalFiscalYear = [];

	this.getJournals = function()
	{
           var jeSearch = new jpns.Class.JournalSearch(jeId, jeNbrArray, jeDateArray);
           journalDetails = jeSearch.getArrJournal();
	}

	// define the re
	this.printJournals = function ()
	{
		
		var outputStr = "<table>";
		outputStr += buildReportHdr();
		outputStr += buildReportColHdr();
		outputStr += buildReportDtl();
		//outputStr += buildReportFtr();
		outputStr += "</table>";
		setHtmlOutput(outputStr);
	}
	
	//private methods/functions
	function buildReportHdr()
	{
		var companyName = '';
		//var companyName = nlapiGetContext().getCompany();
		var headerStr = "<tr>";
		
		headerStr += "<th id='rephdr'>"+companyName+"</th>";
		headerStr += "</tr>";
		
		if ( jpns.Class.Utility.isSubsidiarySettingOn() ) 
		{ 
            var subsidiary = journalDetails.length > 0 ? journalDetails[0].getSubsidiary() : null;
                     
			headerStr += "<tr>";
			headerStr += "<th id='rephdr'>"+jpns.Class.Utility.getSubsidiary(subsidiary)+"</th>"; 
            //headerStr += "<th id='rephdr'>"+"Subsidiary: "+jpns.Class.Utility.getSubsidiary()+"</th>"; 
			headerStr += "</tr>";
		}
		headerStr += "<tr>";
		headerStr += "<th id='rephdr'>"+"General Journal"+"</th>";
		headerStr += "</tr>";
		headerStr += "<tr></tr>";
		
		return headerStr;
	}

	function buildReportColHdr()
	{
		var strThStartTag = '<th>';
		var strThEndTag = '</th>';
		var strTrStartTag = '<tr>';
		var strTrEndTag = '</tr>';
		var strHrTag = '<hr>';

		var arrColHdr1 = [];
		arrColHdr1[arrColHdr1.length] = "User";
		arrColHdr1[arrColHdr1.length] = "Jnl";
		arrColHdr1[arrColHdr1.length] = "System";
		if ( jpns.Class.Utility.isMultiCurrencySettingOn()) { arrColHdr1[arrColHdr1.length] = "&nbsp;"; }
		
		arrColHdr1[arrColHdr1.length] = "Posting";
		arrColHdr1[arrColHdr1.length] = "&nbsp;";
		arrColHdr1[arrColHdr1.length] = "&nbsp;";
		arrColHdr1[arrColHdr1.length] = "&nbsp;";
		arrColHdr1[arrColHdr1.length] = "&nbsp;";
		arrColHdr1[arrColHdr1.length] = "Tax";
		arrColHdr1[arrColHdr1.length] = "Tax Amount";
		arrColHdr1[arrColHdr1.length] = "&nbsp;";
		arrColHdr1[arrColHdr1.length] = "&nbsp;";

		var arrColHdr2 = [];
		arrColHdr2[arrColHdr2.length] = "Name";
		arrColHdr2[arrColHdr2.length] = "No";
		arrColHdr2[arrColHdr2.length] = "ID";
		if ( jpns.Class.Utility.isMultiCurrencySettingOn()) { arrColHdr2[arrColHdr2.length] = "Currency"; }
		arrColHdr2[arrColHdr2.length] = "Period";
		arrColHdr2[arrColHdr2.length] = "Date";
		arrColHdr2[arrColHdr2.length] = "Account";
		arrColHdr2[arrColHdr2.length] = "Debit";
		arrColHdr2[arrColHdr2.length] = "Credit";
		arrColHdr2[arrColHdr2.length] = "Code";
		arrColHdr2[arrColHdr2.length] = "Debit";
		arrColHdr2[arrColHdr2.length] = "Credit";
		arrColHdr2[arrColHdr2.length] = "Name";
		arrColHdr2[arrColHdr2.length] = "Memo";
		
		var columnHdrStr = strTrStartTag; // start of 1st line, column header
		
		// build the 1st line of the column header
		for (var cols = 0; cols < arrColHdr1.length; cols++) { columnHdrStr += strThStartTag+ arrColHdr1[cols] +strThEndTag; }
		var oldTaxAmtString =  /<th>Tax Amount/gi;
		var newTaxAmtString =  "<th colspan='2'>Tax Amount";
		columnHdrStr = columnHdrStr.replace(oldTaxAmtString, newTaxAmtString); // find the default heading of Tax Amount and replace it with a specific tag setting...
		columnHdrStr += strTrEndTag;

		// build the 2nd line of the column header
		columnHdrStr += strTrStartTag;
		for (var cols = 0; cols < arrColHdr2.length; cols++) { columnHdrStr += strThStartTag+ arrColHdr2[cols] +strThEndTag; }
		columnHdrStr += strTrEndTag;
		
		// build the 3rd line of the column header
		columnHdrStr += strTrStartTag;
		for (var cols = 0; cols < arrColHdr2.length; cols++) { columnHdrStr += strThStartTag+ strHrTag+ strThEndTag; }
		columnHdrStr += strTrEndTag;
		
		return columnHdrStr;
	}

	function buildReportDtl()
	{
		var userName = nlapiGetContext().getName();
		var detailStr = '';
	    for (var jeLine = 0; jeLine < journalDetails.length; jeLine++)
	    {
	    	detailStr += "<tr>";	    	
	    	detailStr += "<td>"+userName+"</td>";
	    	detailStr += "<td id='number'>"+journalDetails[jeLine].getJournalNbr()+"</td>";
	    	detailStr += "<td id='number'>"+journalDetails[jeLine].getSystemId()+"</td>";
	    	
	    	if ( jpns.Class.Utility.isMultiCurrencySettingOn()) { detailStr += "<td>"+journalDetails[jeLine].getCurrency()+"</td>"; }
	    	
            var debitamtcol = journalDetails[jeLine].getDebitAmount(); 
            var creditamtcol = journalDetails[jeLine].getCreditAmount();
            var taxdebitamtcol = journalDetails[jeLine].getDebitTaxAmt();
            var taxcreditamtcol = journalDetails[jeLine].getCreditTaxAmt();
            
            detailStr += "<td>"+journalDetails[jeLine].getPostingPeriod()+"</td>";
            detailStr += "<td>"+journalDetails[jeLine].getTranDate()+"</td>";
            detailStr += "<td>"+journalDetails[jeLine].getAccount()+"</td>";
            detailStr += "<td id='number'>"+jpns.Class.Utility.formatAmount( debitamtcol, true)+"</td>";
            detailStr += "<td id='number'>"+jpns.Class.Utility.formatAmount( creditamtcol, true)+"</td>";
            detailStr += "<td>"+journalDetails[jeLine].getTaxCode()+"</td>";
            detailStr += "<td id='number'>"+jpns.Class.Utility.formatAmount( taxdebitamtcol, true)+"</td>";
            detailStr += "<td id='number'>"+jpns.Class.Utility.formatAmount( taxcreditamtcol, true)+"</td>";
            detailStr += "<td>"+journalDetails[jeLine].getName()+"</td>";
            detailStr += "<td>"+journalDetails[jeLine].getMemo()+"</td>";
            detailStr += "</tr>";


            totalDebit += !isNaN(parseFloat(debitamtcol)) ? Math.abs(parseFloat(debitamtcol)) : 0;
            totalCredit += !isNaN(parseFloat(creditamtcol)) ? Math.abs(parseFloat(creditamtcol)) : 0;
            totalDebitTaxAmt += !isNaN(parseFloat(taxdebitamtcol)) ? Math.abs(parseFloat(taxdebitamtcol)) : 0;
            totalCreditTaxAmt += !isNaN(parseFloat(taxcreditamtcol)) ? Math.abs(parseFloat(taxcreditamtcol)) : 0;

            
            /*
	    	detailStr += "<td>"+journalDetails[jeLine].getPostingPeriod()+"</td>";
	    	detailStr += "<td>"+journalDetails[jeLine].getTranDate()+"</td>";
	    	detailStr += "<td>"+journalDetails[jeLine].getAccount()+"</td>";
	    	detailStr += "<td id='number'>"+jpns.Class.Utility.formatAmount( journalDetails[jeLine].getDebitAmount(), true )+"</td>";
	    	detailStr += "<td id='number'>"+jpns.Class.Utility.formatAmount( journalDetails[jeLine].getCreditAmount(), true )+"</td>";
	    	detailStr += "<td>"+journalDetails[jeLine].getTaxCode()+"</td>";
	    	detailStr += "<td id='number'>"+jpns.Class.Utility.formatAmount( journalDetails[jeLine].getDebitTaxAmt(), true )+"</td>";
	    	detailStr += "<td id='number'>"+jpns.Class.Utility.formatAmount( journalDetails[jeLine].getCreditTaxAmt(), true )+"</td>";
	    	detailStr += "<td>"+journalDetails[jeLine].getName()+"</td>";
	    	detailStr += "<td>"+journalDetails[jeLine].getMemo()+"</td>";
	    	detailStr += "</tr>";

	    	totalDebit += !isNaN(parseFloat(journalDetails[jeLine].getDebitAmount())) ? Math.abs(parseFloat(journalDetails[jeLine].getDebitAmount())) : 0;
	    	totalCredit += !isNaN(parseFloat(journalDetails[jeLine].getCreditAmount())) ? Math.abs(parseFloat(journalDetails[jeLine].getCreditAmount())) : 0;
	    	totalDebitTaxAmt += !isNaN(parseFloat(journalDetails[jeLine].getDebitTaxAmt())) ? Math.abs(parseFloat(journalDetails[jeLine].getDebitTaxAmt())) : 0;
	    	totalCreditTaxAmt += !isNaN(parseFloat(journalDetails[jeLine].getCreditTaxAmt())) ? Math.abs(parseFloat(journalDetails[jeLine].getCreditTaxAmt())) : 0;
            */
	    	
	    }
		return detailStr;
	}
	
    /*
	function buildReportFtr()
	{
		var footerStr = '';
		
		// print the lines..
		footerStr += "<tr>";
		if ( jpns.Class.Utility.isMultiCurrencySettingOn()) { footerStr += "<td colspan='7'>&nbsp;</td>"; }
		else { footerStr += "<td colspan='6'>&nbsp;</td>"; }
				
		
		footerStr += "<td id='repftr'><hr></td>";
		footerStr += "<td id='repftr'><hr></td>";
		footerStr += "<td>&nbsp;</td>";
		if ( totalDebitTaxAmt != 0 ) {	footerStr += "<td id='repftr'><hr></td>"; }
		else 	{ footerStr += "<td>&nbsp;</td>"; }

		if ( totalCreditTaxAmt != 0 ) {	footerStr += "<td id='repftr'><hr></td>"; }
		else 	{ footerStr += "<td>&nbsp;</td>"; }
		footerStr += "</tr>";
		
		// print the totals...
		footerStr += "<tr>";

		if ( jpns.Class.Utility.isMultiCurrencySettingOn()) { footerStr += "<td colspan='7'>&nbsp;</td>"; }
		else { footerStr += "<td colspan='6'>&nbsp;</td>"; }

		footerStr += "<td id='repftr'>"+ jpns.Class.Utility.formatAmount( totalDebit, true  )+"</td>";
		footerStr += "<td id='repftr'>"+ jpns.Class.Utility.formatAmount( totalCredit, true  )+"</td>";
		footerStr += "<td>&nbsp;</td>";
		footerStr += "<td id='repftr'>"+ jpns.Class.Utility.formatAmount( totalDebitTaxAmt, true)+"</td>";
		footerStr += "<td id='repftr'>"+ jpns.Class.Utility.formatAmount( totalCreditTaxAmt, true)+"</td>";
		footerStr += "</tr>";
		return footerStr;
	}
	*/

	
}


/* define the Journal class */
jpns.Class.Journal = function ()
{
	// define private member variables...
	var journalNbr;
	var systemId;
	var currency;
	var subsidiary;
	var postingPeriod;
	var tranDate;
	var account;
	var debitAmount;
	var creditAmount;
	var taxCode;
	var debitTaxAmt;
	var creditTaxAmt;
	var name;
	var memo;

	// setters/getters are available externally...
	this.setJournalNbr = function(pJournalNbr){ journalNbr = pJournalNbr; }
	this.getJournalNbr = function(){return journalNbr; }
	
	this.setSystemId = function(pSystemId){ systemId = pSystemId; }
	this.getSystemId = function(){return systemId; }

	this.setCurrency = function(pCurrency){ currency = pCurrency; }
	this.getCurrency = function(){return currency; }

	this.setSubsidiary = function(pSubsidiary){ subsidiary = pSubsidiary; }
	this.getSubsidiary = function(){return subsidiary; }

	this.setPostingPeriod = function(pPostingPeriod){ postingPeriod = pPostingPeriod; }
	this.getPostingPeriod = function(){return postingPeriod; }

	this.setTranDate = function(pTranDate){ tranDate = pTranDate; }
	this.getTranDate = function(){return tranDate; }
	
	this.setAccount = function(pAccount){ account = pAccount; }
	this.getAccount = function(){return account; }

	this.setDebitAmount = function(pDebitAmount){ debitAmount = pDebitAmount; }
	this.getDebitAmount = function(){return debitAmount; }

	this.setCreditAmount = function(pCreditAmount){ creditAmount = pCreditAmount; }
	this.getCreditAmount = function(){return creditAmount; }

	this.setTaxCode = function(pTaxCode){ taxCode = pTaxCode; }
	this.getTaxCode = function(){return taxCode; }

	this.setDebitTaxAmt = function(pDebitTaxAmt){ debitTaxAmt = pDebitTaxAmt; }
	this.getDebitTaxAmt = function(){return debitTaxAmt; }

	this.setCreditTaxAmt = function(pCreditTaxAmt){ creditTaxAmt = pCreditTaxAmt; }
	this.getCreditTaxAmt = function(){return creditTaxAmt; }

	this.setName = function(pName){ name = pName; }
	this.getName = function(){return name; }

	this.setMemo = function(pMemo){ memo = pMemo; }
	this.getMemo = function(){return memo; }
	
} /* end of 'dcNS.JournalClass.JournalPrint = function JournalPrint(request, response)' */

/* define the Journal Search class */
//jpns.Class.JournalSearch = function(jeNumber, jeTranDate, arrJeNumber, arrJeDate)
jpns.Class.JournalSearch = function(jeInternalId, arrJeNumber, arrJeDate)
{
	var searchFilters = [];
	var searchResults = [];
	var searchColumns = [];
	var arrjournals = [];

	/* provide getter method... */
	this.getArrJournal = function(){ return arrjournals; }

	if ( jeInternalId != null && jeInternalId != 0 && jeInternalId != "")	{ searchFilters[searchFilters.length] = new nlobjSearchFilter('internalid', null, 'is', jeInternalId);	} 
	else
	{
		if (arrJeNumber.length > 0 ) { searchFilters[searchFilters.length] = new nlobjSearchFilter('number', null, 'between', arrJeNumber); }
		else if (arrJeDate.length > 0 ) { searchFilters[searchFilters.length] = new nlobjSearchFilter('trandate', null, 'within', arrJeDate[0], arrJeDate[1] ); }
	}
	searchFilters[searchFilters.length] = new nlobjSearchFilter('type', null, 'anyof', 'Journal');
	searchFilters[searchFilters.length] = new nlobjSearchFilter('taxline', null, 'is', 'F');

	// set the search columns
	if ( jpns.Class.Utility.isSubsidiarySettingOn() ){ searchColumns[searchColumns.length] =  new nlobjSearchColumn('subsidiary'); }
	if ( jpns.Class.Utility.isMultiCurrencySettingOn() ) 
	{ 
		searchColumns[searchColumns.length] = new nlobjSearchColumn('currency'); 
		searchColumns[searchColumns.length] = new nlobjSearchColumn('fxamount'); 
	}

	searchColumns[searchColumns.length] = new nlobjSearchColumn('internalid');
	searchColumns[searchColumns.length] = new nlobjSearchColumn('account');
    searchColumns[searchColumns.length] = new nlobjSearchColumn('postingperiod');
    searchColumns[searchColumns.length] = new nlobjSearchColumn('trandate');
    searchColumns[searchColumns.length] = new nlobjSearchColumn('debitamount');
    searchColumns[searchColumns.length] = new nlobjSearchColumn('creditamount');
    searchColumns[searchColumns.length] = new nlobjSearchColumn('taxitem');  		// tax code...
    searchColumns[searchColumns.length] = new nlobjSearchColumn('taxamount');  	// tax amount
    searchColumns[searchColumns.length] = new nlobjSearchColumn('name');  			// client name...
    searchColumns[searchColumns.length] = new nlobjSearchColumn('memo');
	searchColumns[searchColumns.length] = new nlobjSearchColumn('exchangerate'); 
	searchColumns[searchColumns.length] = new nlobjSearchColumn('number'); 
	searchColumns[searchColumns.length] = new nlobjSearchColumn('amount');   // could be in base currency...

    searchResults = nlapiSearchRecord('transaction', null, searchFilters, searchColumns);

	for (var jeLine in searchResults)
	{
		var journalClass  = new jpns.Class.Journal();
		var journalLine = searchResults[jeLine];

		if ( jpns.Class.Utility.isSubsidiarySettingOn() ) { journalClass.setSubsidiary( jpns.Class.Utility.getSearchRecordValue(journalLine, 'subsidiary', null, null, 'value' ) ); } 

		/* set up the amounts...consider multi-currency and foreign currency amount... */
	    var debitAmount = jpns.Class.Utility.getSearchRecordValue(journalLine, 'debitamount', null, null, 'value' );
	    var creditAmount = jpns.Class.Utility.getSearchRecordValue(journalLine, 'creditamount', null, null, 'value' );
	    var exchangeRate = jpns.Class.Utility.getSearchRecordValue(journalLine, 'exchangerate', null, null, 'value' );

		if ( jpns.Class.Utility.isMultiCurrencySettingOn() )	
		{ 
			/* save the currency... */
			journalClass.setCurrency( jpns.Class.Utility.getSearchRecordValue(journalLine, 'currency', null, null, 'text' ) );
			
			var foreignCurrencyAmount = jpns.Class.Utility.getSearchRecordValue(journalLine, 'fxamount', null, null, 'value' );
			if (debitAmount != null && debitAmount != 0 ) { debitAmount = exchangeRate * foreignCurrencyAmount; }
			else { debitAmount = exchangeRate * debitAmount; }
			
			if (creditAmount != null && creditAmount != 0 ) { creditAmount = exchangeRate * foreignCurrencyAmount; }
			else { creditAmount = exchangeRate * creditAmount; }

		}
		else 
		{
			if (debitAmount != null && debitAmount != 0 ) { debitAmount = exchangeRate * debitAmount; }
			if (creditAmount != null && creditAmount != 0 ) { creditAmount = exchangeRate * creditAmount; }
		}

	    var tranAmount =  jpns.Class.Utility.getSearchRecordValue(journalLine, 'amount', null, null, 'value' );   // this could be in base currency...
	    var taxAmount = jpns.Class.Utility.getSearchRecordValue(journalLine, 'taxamount', null, null, 'value' ); // this could be in base currency...
	    var taxPercent = 0;
	    
	    // make sure the class fields are set to zero
		journalClass.setDebitAmount(0);
		journalClass.setCreditAmount(0);
		journalClass.setDebitTaxAmt(0); 
		journalClass.setCreditTaxAmt(0); 

	    // compute the percentage of tax based on the given amount...
	    if (taxAmount != 0 ) 
	    {
	    	taxPercent = Math.abs(taxAmount / tranAmount);

	    	// Note : if tax amount is negative, put value in debit side otherwise put in credit side...
	    	if (taxAmount < 0) { journalClass.setDebitTaxAmt( taxPercent * debitAmount); }
	    	else { journalClass.setCreditTaxAmt( taxPercent * creditAmount); }
	    }

		journalClass.setDebitAmount( debitAmount );
		journalClass.setCreditAmount( creditAmount );
		journalClass.setSystemId( jpns.Class.Utility.getSearchRecordValue(journalLine, 'internalid', null, null, 'value' ) );
		journalClass.setJournalNbr( jpns.Class.Utility.getSearchRecordValue(journalLine, 'number', null, null, 'value' ) );
		journalClass.setAccount( jpns.Class.Utility.getSearchRecordValue(journalLine, 'account', null, null, 'text' ) );
		journalClass.setPostingPeriod( jpns.Class.Utility.getSearchRecordValue(journalLine, 'postingperiod', null, null, 'text' ) );
		journalClass.setTranDate( jpns.Class.Utility.getSearchRecordValue(journalLine, 'trandate', null, null, 'value' ) );
		journalClass.setTaxCode( jpns.Class.Utility.getSearchRecordValue(journalLine, 'taxitem', null, null, 'text' ) );
		
		journalClass.setName( jpns.Class.Utility.getSearchRecordValue(journalLine, 'name', null, null, 'text' ) );
		journalClass.setMemo( jpns.Class.Utility.getSearchRecordValue(journalLine, 'memo', null, null, 'value' ) );

		// save the class to the array of journal classes... 
		arrjournals[arrjournals.length] = journalClass;
	}
	
}
//*** SECTION FOR THE CLASS DEFINITION - ends here ***//