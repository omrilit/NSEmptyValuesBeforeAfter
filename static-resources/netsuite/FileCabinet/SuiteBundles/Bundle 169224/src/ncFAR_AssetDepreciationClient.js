/**
 * � 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/* *************************************************
 * Fixed Assets Management, Netsuite Inc.
 *
 * Client code for FAM
 * ScriptId = customscript_ncfar_assetdepreciation_c
 *
 * Version History
 * 		16 August 2011 Jasmin Baladad Initial version created
 ***************************************************/

function AssetDepreciationPageInit() {
	window.onbeforeunload = '';
}

function AssetDepreciationOnSave() {

	nlapiSetFieldValue( 'custpage_reportstatus', 'Generating Report . . . . . . ' );
	nlapiSetFieldValue( 'custpage_subsidiarylist', getSubsidiary() );

	return true;
}

//Fetch the subsidiary by parsing the selected entries from the form
function getSubsidiary(){
	var SubsParam = nlapiGetFieldValue('custpage_filtermssubsid');
	var Slist = '';
	var Sarray;
	if( (SubsParam != '') && (SubsParam != null) )
	{
		Sarray = SubsParam.split('');
		if(nlapiGetFieldValue('custpage_filtercbincchild')=='T') // include child subs?
		{
			//for correct building of subsidiary list for non-admin role
			var allowedSarray = nlapiGetFieldValue('custpage_allowedsubsidiaries').split(',');
			for(var l=0; l< Sarray.length; ++l)
			{
				var childSubsids = Library.Records.GetChildrenOfSubsid(Sarray[l]); //20 units each call

				for(var m=0; m<childSubsids.length; ++m) // for each child returned, add to Subsids array if not already there but allowed for the role
				{
					var index1 = Library.Objects.IndexOfArray(Sarray, childSubsids[m]); //check against selected subsidiaries: we want only -1
					var index2 = Library.Objects.IndexOfArray(allowedSarray, childSubsids[m]); //check against allowed subsidiaries: we do NOT want -1
					if((index1 == -1) && (index2 != -1))
					{
						Sarray[Sarray.length] = childSubsids[m];
					}
				}
			}
		}
		Slist = Sarray.join(':');
	}	
	return Slist;
}


