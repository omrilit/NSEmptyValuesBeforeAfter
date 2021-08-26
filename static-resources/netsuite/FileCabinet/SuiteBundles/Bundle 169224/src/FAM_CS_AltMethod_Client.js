/**
 * � 2015 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var alertMessage = {};
var ALERT_SUBSIDIARYREQUIRED = 'client_altmethod_subsidiaryrequired';
var ALERT_IMPROPER_CONVENTION = 'client_altmethod_improperconvention';
	
function AltMethod_PageInit(type) {
	alertMessage = FetchMessageList([ALERT_IMPROPER_CONVENTION, ALERT_SUBSIDIARYREQUIRED]);
}

function AltMethod_ValidateField(type, name) {
	if (name == 'custrecord_altmethoddepmethod' || name == 'custrecord_altmethodconvention') {
		if (!FAM_Util.checkConvention(nlapiGetFieldValue('custrecord_altmethoddepmethod'),
            nlapiGetFieldValue('custrecord_altmethodconvention'))) {

			alert(alertMessage[ALERT_IMPROPER_CONVENTION]);
			return false;
		}
	}
	return true;
}

function AltMethod_SaveRecord() {
	var subsidiariesEnabled = Library.Context.IsFeatureEnabled( 'SUBSIDIARIES' );
	
	if (subsidiariesEnabled) {
		var subsidiaryId = nlapiGetFieldValue('custrecord_altmethodsubsidiary');

		if (Library.Objects.isUndefinedNullOrEmpty( subsidiaryId )) {
			alert(alertMessage[ALERT_SUBSIDIARYREQUIRED]);
			return false;
		}
	}
	
	return true;
}
