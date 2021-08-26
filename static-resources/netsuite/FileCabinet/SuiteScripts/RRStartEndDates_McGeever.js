// mcgeeversoftware_dataset
// Author: Harish Mohan
// Date: 10/20/2006
//
// 


//GLOBAL VARS

var lineChanged 	= 1;
var degugMode		= false;
var FFC			= false;

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

function fieldChanged(type, name)
{
	if (name == "custbody3")
	{
		
		
		var numLines = nlapiGetLineItemCount('item');
		//alert ("outside");
		
		
		if (numLines > 0)
		{
			// numLines > 0
			if (degugMode) alert("numlines = " + numLines);
			var i = 1;
			
			for (i=1; i <= numLines; i++)
			{
				// processing line i
				if (degugMode) alert("processing line " + i);
				
				
				nlapiSelectLineItem('item', i);
				
				
				var revrecTerms = nlapiGetCurrentLineItemValue('item', 'custcol1');
				//alert(revrecTerms);
				var start_date_str = nlapiGetFieldValue('custbody3');
				var end_date_str = nlapiAddDays(nlapiAddMonths(nlapiStringToDate(start_date_str), parseInt(revrecTerms)), -1);
				
				
				
				// got all values
				if (degugMode) alert("revrecTerms = " + revrecTerms + "\n" +
								 "start_date_str = " + start_date_str + "\n" +
								 "end_date_str = " + nlapiDateToString(end_date_str)
								 );
				
				
				
				// setting revrecstartdate with nlapiSetCurrentLineItemValue and FFC = false
				if (degugMode) alert("setting revrecstartdate with nlapiSetCurrentLineItemValue and FFC = FFC");
				nlapiSetCurrentLineItemValue('item', 'revrecstartdate', start_date_str, FFC);
				
				
				
				// setting revrecenddate with nlapiSetCurrentLineItemValue and FFC = false
				if (degugMode) alert("setting revrecenddate with nlapiSetCurrentLineItemValue and FFC = FFC");
				nlapiSetCurrentLineItemValue('item', 'revrecenddate', nlapiDateToString(end_date_str), FFC);
				
				
				
				// committing line
				if (degugMode) alert("about to commit line");
				nlapiCommitLineItem('item');
				
				
				
				// line committed
				if (degugMode) alert("line committed");
			};
			
		};
		
	};
}

