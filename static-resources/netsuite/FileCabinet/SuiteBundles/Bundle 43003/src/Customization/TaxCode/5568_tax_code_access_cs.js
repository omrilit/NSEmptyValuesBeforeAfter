<!-- Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.-->
 

<script language="javascript">
function maintainNonDeductible() {
	try {
		if(nlapiGetFieldValue("custrecord_4110_non_deductible") == "T") {
			nlapiSetFieldValue("custpage_4110_nondeductible_parent", "-1");
			nlapiSetFieldValue("custrecord_4110_nondeductible_account", "");
		}
	} catch(ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "maintainNonDeductible", errorMsg);		
	}		
}

function attachListener(name, listenertype) {
	try {
		var element = document.getElementsByName(name)[0];
		
		if (element) {
			if (element.addEventListener){
				element.addEventListener(listenertype, maintainNonDeductible, false);
			} else if (element.attachEvent){
				element.attachEvent("on" + listenertype, maintainNonDeductible);
			}
		} 
	} catch(ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "ratechanged", errorMsg);		
	}
}

function overrideOnclick(name) {
	try {
		var element = document.getElementsByName(name)[0];
		
		if (element) {
			element.onclick = function() {
				maintainNonDeductible(); 
				setEventCancelBubble(event); 
				setWindowChanged(window, true);
			}
		} 
	} catch(ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "overrideOnclick", errorMsg);		
	}
}

try {
	//attachListener("rate_formattedValue", "keyup");
	attachListener("inpt_custrecord_4110_nondeductible_account", "select");
	attachListener("inpt_custpage_4110_nondeductible_parent", "select");
	overrideOnclick("custrecord_4110_non_deductible");
} catch(ex) {
	alert(ex);
}
</script>