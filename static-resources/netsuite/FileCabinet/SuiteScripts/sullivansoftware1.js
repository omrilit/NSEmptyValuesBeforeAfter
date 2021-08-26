// sullivansoftware.js
// Author: Harish Mohan
// Date: 07/11/2005
//
// 


//GLOBAL VARS

var lineChanged = 1;


function sampleValidateLine(type)
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
			
			
			//--------------------------
			var revrecTerms = nlapiGetCurrentLineItemValue('item', 'custcol1');
			//alert(revrecTerms);
			var start_date_str = nlapiGetFieldValue('custbody3');
			var end_date_str = nlapiAddDays(nlapiAddMonths(nlapiStringToDate(start_date_str), parseInt(revrecTerms)), -1);
			
			nlapiSetCurrentLineItemValue('item', 'revrecstartdate', start_date_str);
			nlapiSetCurrentLineItemValue('item', 'revrecenddate', nlapiDateToString(end_date_str));
		
			
			
			//---------------------------
			
			
			
			return true;

}



//NEW STUFF//

function pageInit(type, name)
{
if (name == "custbody3")
{


var numLines = nlapiGetLineItemCount('item');
//alert ("outside");


if (numLines > 0){
for (i=1; i <= numLines; i++)
	{

		nlapiSelectLineItem('item', i);
		//alert(i);
		//nlapiRemoveLineItem('item');
		//nlapiInsertLineItem('item');
		//nlapiCommitLineItem('item');
		
			var revrecTerms = nlapiGetCurrentLineItemValue('item', 'custcol1');
			//alert(revrecTerms);
			var start_date_str = nlapiGetFieldValue('custbody3');
			var end_date_str = nlapiAddDays(nlapiAddMonths(nlapiStringToDate(start_date_str), parseInt(revrecTerms)), -1);
			
			nlapiSetCurrentLineItemValue('item', 'revrecstartdate', start_date_str, false);
			nlapiSetCurrentLineItemValue('item', 'revrecenddate', nlapiDateToString(end_date_str), false);
	
			nlapiCommitLineItem('item');
	}

}

}
}

