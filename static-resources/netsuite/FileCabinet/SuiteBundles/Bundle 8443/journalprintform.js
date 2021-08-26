/**
 * @author afaelga
 * 
PRINTING OPTION : 1 - Print Journal number - single 
PRINTING OPTION : 2 - Print Journal numbers 'From' and 'To'
PRINTING OPTION : 3 - Print Journals between certain dates (one report) *
 */
var jpns;
if (!jpns){ jpns = {}; }
jpns.Class = {};

//*** SECTION FOR THE GLOBAL FUNCTIONS - starts here *** //
function main(request, response)
{
    var form = nlapiCreateForm('Print Option for Journal', false);
	form.setScript('customscript_journal_print_range_client');
    
    /*
    var fromJrnl = [];
    var journalNbrFrom = form.addField('jenbrfrom', 'select', 'Jnl No. From' );
    journalNbrFrom.addSelectOption("", "");
		
    var journalNbrTo = form.addField('jenbrto', 'select', 'Jnl No. To' );
    journalNbrTo.addSelectOption("", "");
    
	var arrJournals = getJournalsList(); // 
    for (var jnbr in arrJournals) { journalNbrFrom.addSelectOption( arrJournals[jnbr].getValue('number', null, 'group'), arrJournals[jnbr].getValue('number', null, 'group') ); }
    for (var jnbr in arrJournals) { journalNbrTo.addSelectOption( arrJournals[jnbr].getValue('number', null, 'group'), arrJournals[jnbr].getValue('number', null, 'group') ); }
    //journalNbrFrom.setDefaultValue('- None -');
    //journalNbrTo.setDefaultValue('- None -');

*/
    var dateFrom = form.addField('datefrom', 'date', 'Date From' );
    var dateTo = form.addField('dateto', 'date', 'Date To' );
    dateFrom.setDefaultValue( nlapiDateToString(new Date()));
    dateTo.setDefaultValue( nlapiDateToString(new Date()));

	form.addButton('custpage_printbutton', 'Print Preview', "redirectToJePrinting");
    response.writePage( form );
}

function getJournalsList()
{
	var searchFilters = [];
	var searchResults = [];
	var searchColumns = [];

	searchFilters[searchFilters.length] = new nlobjSearchFilter('type', null, 'anyof', 'Journal');
	var sortedJeNbr =  new nlobjSearchColumn('number', null, 'group');
	//sortedJeNbr.setSort(true);
	searchColumns[searchColumns.length] = sortedJeNbr; 
    searchResults = nlapiSearchRecord('transaction', null, searchFilters, searchColumns);

    return searchResults;
}

function redirectToJePrinting()
{
    var jrnlrange = [];

    if ( !isNaN( parseInt( nlapiGetFieldValue('jenbrfrom'))) ) { jrnlrange[0] = nlapiGetFieldValue('jenbrfrom'); }
    if ( !isNaN(parseInt(nlapiGetFieldValue('jenbrto')))) 
    { 
    	jrnlrange[1] = nlapiGetFieldValue('jenbrto');
    	if ( isNaN(parseInt(nlapiGetFieldValue('jenbrfrom')))) { jrnlrange[0] = nlapiGetFieldValue('jenbrto'); }
    }
    else 
    {
    	if ( !isNaN(parseInt(nlapiGetFieldValue('jenbrfrom')))) { jrnlrange[1] = nlapiGetFieldValue('jenbrfrom'); }
    }

    // je date range...
    var daterange = [];
    if ( nlapiGetFieldValue('datefrom') != "" ) { daterange[0] = formatdate(nlapiGetFieldValue('datefrom')); }
    if ( nlapiGetFieldValue('dateto') != "" )
    {
    	daterange[1] = formatdate(nlapiGetFieldValue('dateto'));
    	 if ( nlapiGetFieldValue('datefrom') == "" ){ daterange[0] = formatdate(nlapiGetFieldValue('dateto')); }
    }
    else
    {
   	 	if ( nlapiGetFieldValue('datefrom') != "" ){ daterange[1] = formatdate(nlapiGetFieldValue('datefrom')); }
    }

	var suiteletUrl = nlapiResolveURL('SUITELET', 'customscript_journal_print_option', 'customdeploy_journal_print_option');
	if(jrnlrange.length > 0) { suiteletUrl += "&custscript_jenbrfrom="+jrnlrange[0]+"&custscript_jenbrto="+jrnlrange[1]; }
	else if(daterange.length > 0) 	{	suiteletUrl += "&custscript_jedatefrom="+daterange[0]+"&custscript_jedateto="+daterange[1];	}
	window.open(suiteletUrl, '', 'height=600,width=1000,scrollbars, resizable');
	
}
function padleft (stringToTrim, delimiter) 
{ 
    var paddedstr = stringToTrim+'';
    if ( paddedstr.length < 2){ paddedstr = delimiter + paddedstr.replace(/^\s+/,"");}
    return paddedstr
}
function formatdate(datefld)
{
    datefld = nlapiStringToDate(datefld);
    var yyyy = datefld.getFullYear();
    var mm = padleft(""+datefld.getMonth(), '0');
    var dd = padleft(""+datefld.getDate(), '0');;
    return yyyy+mm+dd;
}
// *** SECTION FOR THE GLOBAL FUNCTIONS - ends here ***//