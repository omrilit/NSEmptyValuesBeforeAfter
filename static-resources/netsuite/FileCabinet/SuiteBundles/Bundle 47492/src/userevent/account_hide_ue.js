/**
 * Copyright 2019 Oracle NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
 
var TAF = TAF || {};
TAF.UserEvent = TAF.UserEvent || {};
TAF.UE = TAF.UserEvent || {};
TAF.UE.Account = TAF.UE.Account || {};

TAF.UE.Account.onBeforeLoad = function _OnBeforeLoad(type, form) {
	nlapiSetFieldValue('custrecord_has_mx_localization', (TAF.UE.Account.hasMXLocalization()) ? 'T' : 'F');
}

TAF.UE.Account.hasMXLocalization = function _HasMXLocalization() {
	var MEXICO_LOCALIZATION_BUNDLE = 'cd476cab-e846-474e-9f11-e213e69c420b';
	return TAF.UE.Account.isInstalled(MEXICO_LOCALIZATION_BUNDLE);
};

TAF.UE.Account.isInstalled = function _IsInstalled(guid) {
	var filters = [
			new nlobjSearchFilter("name", null, "is", guid)
		];
    var columns = null;
    var rs = nlapiSearchRecord("file", null, filters, columns);
    return (rs != null);
};
