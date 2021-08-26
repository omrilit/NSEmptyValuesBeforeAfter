// sullivansoftware.js
// Author: Harish Mohan
// Date: 07/11/2005
//
// 


//GLOBAL VARS

var lineChanged = 1;

/*
function sampleValidateLine(type)
{


if (lineChanged == 0)
{
	lineChanged = 1;
	return true;
}


if (lineChanged == 1)
{
		var revrecTerms = nlapiGetCurrentLineItemValue('item', 'custcol1');
		//alert(revrecTerms);
		var start_date_str = nlapiGetFieldValue('custbody3');
		var end_date_str = nlapiAddDays(nlapiAddMonths(nlapiStringToDate(start_date_str), parseInt(revrecTerms)), -1);
		
		nlapiSetCurrentLineItemValue('item', 'revrecstartdate', start_date_str);
		nlapiSetCurrentLineItemValue('item', 'revrecenddate', nlapiDateToString(end_date_str));
		
	
			lineChanged = 0;
			return true;

}
		


}

*/

//NEW STUFF//

function pageInit()
{

var numLines = nlapiGetLineItemCount('item');
alert (numLines);

var stuff = nlapiGetRole();
alert(stuff);

if (numLines > 0){
for (i=0; i < numLines; i++)
	{
		var currentlinecount = i+1;
		nlapiSelectLineItem('item', currentlinecount);
		//alert("here");
		//nlapiRemoveLineItem('item');
		//nlapiInsertLineItem('item');
		//nlapiCommitLineItem('item');
		
			var revrecTerms = nlapiGetCurrentLineItemValue('item', 'custcol1');
			//alert(revrecTerms);
			var start_date_str = nlapiGetFieldValue('custbody3');
			var end_date_str = nlapiAddDays(nlapiAddMonths(nlapiStringToDate(start_date_str), parseInt(revrecTerms)), -1);
			
			nlapiSetCurrentLineItemValue('item', 'revrecstartdate', start_date_str);
			nlapiSetCurrentLineItemValue('item', 'revrecenddate', nlapiDateToString(end_date_str));
	
	}

}

}

