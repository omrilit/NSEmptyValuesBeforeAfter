// authentium.js
// Author: Harish Mohan
// Date: 06/11/2005
// The following scripts in part of the POC from Autentium around the Revenue Recognition funtionality
// in their Test Account.
//
// 


//GLOBAL VARS

var lineChanged = 1;



// FIELD CHANGE




function sampleFieldChange(type, fld)
{


	if (fld == "custbody4")
	{
		var line_count     = nlapiGetLineItemCount('item');
		var start_date_str = nlapiGetFieldValue('custbody4');
		var i;

			for (i = 1; i <= line_count; i++)
			{

					setEncodedValue('item', i, 'revrecstartdate', start_date_str);

			}

	}

}



// VALIDATE LINE
function sampleValidateLine(type)
{


if (lineChanged == 0)
{
	lineChanged = 1;
	return true;
}


if (lineChanged == 1)
{

RevRecTermList = new Array(5)
RevRecTermList [0] = "12"
RevRecTermList [1] = "18"
RevRecTermList [2] = "24"
RevRecTermList [3] = "30"
RevRecTermList [4] = "36"


RevRecTermSch = new Array(5)
RevRecTermSch [0] = "12 Periods 40-60"
RevRecTermSch [1] = "18 Periods 40-60"
RevRecTermSch [2] = "24 Periods 28-72"
RevRecTermSch [3] = "30 Periods 28-72"
RevRecTermSch [4] = "36 Periods 23-77"


		var revrecTerms = parseFloat(nlapiGetFieldValue('custbody3'));
		var start_date_str = nlapiGetFieldValue('custbody4');
		var end_date_str = nlapiAddDays(nlapiAddMonths(nlapiStringToDate(start_date_str), parseInt(revrecTerms)), -1);
		
		var TermSelect = 0;
		//alert(revrecTerms);
		
		for(i=0; i < 5; i++)
		{
		
			if (RevRecTermList[i] == revrecTerms)
			{
				TermSelect = i;
				i = 6; //BREAK
			}
		}
		

			
			nlapiSetCurrentLineItemText('item', 'revrecschedule', RevRecTermSch[TermSelect]);
			
			alert ("Rev Rec Scedule Set Based on Terms:" + RevRecTermSch[TermSelect]);
			alert ("Setting Contract Start Date on Line Item: " + start_date_str);
			alert ("Calculated End Date Based on Terms: " + nlapiDateToString(end_date_str));

			nlapiSetCurrentLineItemValue('item', 'revrecstartdate', start_date_str);
			nlapiSetCurrentLineItemValue('item', 'revrecenddate', nlapiDateToString(end_date_str));


			lineChanged = 0;
			return true;

}





}

