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

function validateLine(type)
{

//var numLines = nlapiGetLineItemCount('item');
var GAAPAmount = 0;

//alert (numLines);




		//var currentlinecount = i+1;
		//nlapiSelectLineItem('item', currentlinecount);
		//alert("here");
		//nlapiRemoveLineItem('item');
		//nlapiInsertLineItem('item');
		//nlapiCommitLineItem('item');
			var revrecTerms = nlapiGetCurrentLineItemValue('item', 'custcol1');
			if(revrecTerms > 0)
			{
				//alert ("Before GAAPAmount");
				var lineTotal =  parseFloat(nlapiGetCurrentLineItemValue('item', 'amount'));
				//alert (amount);
				//alert (lineTotal);
				GAAPAmount = ((lineTotal/revrecTerms)*12);
				//alert (GAAPAmount);
			}
			
			//alert(revrecTerms);
			//var start_date_str = nlapiGetFieldValue('custbody3');
			//var end_date_str = nlapiAddDays(nlapiAddMonths(nlapiStringToDate(start_date_str), parseInt(revrecTerms)), -1);
			
			nlapiSetCurrentLineItemValue('item', 'altsalesamt', GAAPAmount);
			
			return true;
	


}
