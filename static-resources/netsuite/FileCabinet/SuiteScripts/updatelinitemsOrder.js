/*
	Script:	update all line items test.js
	Author:	Harish Mohan
	Date:	2006-03-06
*/



//
// GLOBAL VARS
//

var debugMode		= false;
var FFC			= false;
var ccChangedLine 	= false;






function pageInit()

{
	var today = new Date();
	 nlapiSetFieldValue('custbody3', nlapiDateToString(today), true);

}





// BEGIN VALIDATE LINE ================================================

function validateLine(type)
{
	
	/*	
		- Set GAAP Amount
          
          - Set Rev Rec Start and End Dates
		
		
		
          FIELDS USED:
		
          --Field Name--				--ID--
		Item Machine				item
          Amount					amount
          Contract Start Date			custbody_contract_start_date
          Rev. Rec. Term	 in Months	revrecterminmonths
          Rev. Rec. Start Date		revrecstartdate
          Rev. Rec. End Date			revrecenddate
	*/
	
	
	
	//
	//  LOCAL VARIABLES
	//
	
	var GAAPAmount		= 0;
	var term		= nlapiGetCurrentLineItemValue('item', 'custcol1');
	var lineTotal		= parseFloat(nlapiGetCurrentLineItemValue('item', 'amount'));
	var lineRate		= parseFloat(nlapiGetCurrentLineItemValue('item', 'rate'));
	var lineQty		= parseFloat(nlapiGetCurrentLineItemValue('item', 'quantity'));
	var itemType		= nlapiGetCurrentLineItemValue('item', 'itemtype');
	
	
	var start_date_str	= nlapiGetFieldValue('custbody3');
	
	
	
	
	
	//
	//  CODE BODY
	//
	
	
	
	//
	// Set GAAP Amount
	//
	
	if (!ccChangedLine)
	{
		if (debugMode) alert ("Set GAAPAmount" + "\n\n" +
						  "Item Type: " + itemType + "\n" +
						  "Term: " + term + "\n\n" +
						  "Line Total: " + lineTotal + "\n" +
						  "GAAP Amount: " + GAAPAmount
						  );
		
		if( (term > 0) && (nlapiGetCurrentLineItemText('item', 'item').search(/(^Subscriptions)|(^Product)/)!= -1))
		{
			lineTotal = lineRate * lineQty * term;
			
			if (term > 12)
			{
				GAAPAmount = ( (lineTotal / term) * 12 );
			}
			else{
				GAAPAmount = lineTotal;
			}
			
		}
		
		else {
		
		term = 12;
		lineTotal = lineRate * lineQty * term;
		GAAPAmount = lineTotal;
		
		}
		
		nlapiSetCurrentLineItemValue('item', 'altsalesamt', GAAPAmount);
		nlapiSetCurrentLineItemValue('item', 'amount', lineTotal);
		nlapiSetCurrentLineItemValue('item', 'custcol1', term);


		
		
		
		//
		// Set Rev Rec Start and End Dates
		//
		
		//if (debugMode) alert ("Set Rev. Rec. Dates" + "\n\n" +
		//				  "Rev. Rec. Start Date: " + start_date_str + "\n\n" +
		//				  "Term: " + term + "\n\n" +
		//				  "Rev. Rec. End Date: " + end_date_str
		//				  );
		//
		
		var end_date_str	= nlapiAddDays(nlapiAddMonths(nlapiStringToDate(start_date_str), parseInt(term)), -1);
		
		nlapiSetCurrentLineItemValue('item', 'revrecstartdate', start_date_str);
		nlapiSetCurrentLineItemValue('item', 'revrecenddate', nlapiDateToString(end_date_str));
		
	}
	else
	{
		if (debugMode) alert ("ccChangedLine, so do nothing and set ccChangedLine to false.");
		ccChangedLine = false;
	};	
	
	
	// Validate the line...
	return true;
	
	
}

// END VALIDATE LINE ==================================================







// BEGIN FIELD CHANGED ================================================

function fieldChanged(type, name)
{
	/*	
		
          - If Contract Start Date changes, set Rev Rec Start and End Dates
		
		
		
          FIELDS USED:
		
          --Field Name--				--ID--
		Item Machine				item
          Contract Start Date			custbody_contract_start_date
          Rev. Rec. Term	 in Months	revrecterminmonths
          Rev. Rec. Start Date		revrecstartdate
          Rev. Rec. End Date			revrecenddate
	*/
	
	
	
	//
	//  LOCAL VARIABLES
	//
	
	var numLines = nlapiGetLineItemCount('item');
	var term;
	var i;

	var start_date_str	= nlapiGetFieldValue('custbody3');
	var end_date_str;
	
	
	
	
	//
	//  CODE BODY
	//
	
	
	if (name == "custbody3")
	{
		
		// numLines > 0
		if (debugMode) alert("Number of lines: " + numLines);
		
		if (numLines > 0)
		{
			
			for (i=1; i <= numLines; i++)
			{
				// processing line i
				if (debugMode) alert("processing line " + i);
				
				// set line i variables
				term	= nlapiGetLineItemValue('item', 'custcol1', i);
				if (term < 0)
				{
					term = 12;
				}
				
				if (debugMode) alert("term " + term);
				
				end_date_str = nlapiAddDays(nlapiAddMonths(nlapiStringToDate(start_date_str), parseInt(term)), -1);
					
					
				if (debugMode) alert("end date " + end_date_str);
				setEncodedValue('item', i, 'revrecstartdate', start_date_str);
				setEncodedValue('item', i, 'revrecenddate', nlapiDateToString(end_date_str));
				
				
			};
			
				item_machine.buildtable();
			
		};
		
	};
	

}

// END FIELD CHANGED ==================================================