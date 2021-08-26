/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

module('modules/saved_report', function (exports) {
	exports.getReportId = function findReportId(reportName) {
        var rs = nlapiSearchGlobal("\"" + reportName + "\"");
        if (rs === null) {
            return null;
        }
        
        for (var i = 0; i < rs.length; ++i) {
			if (rs[i].getValue("name").toLowerCase() == reportName.toLowerCase()) {
                var reportId = rs[i].getId().replace(/REPO_/, "");  //remove "REPO_" prefix
                return parseInt(reportId);
            }
        }

        return null;
    };
	
	exports.loadReportByName = function loadReportByName(reportName, reportSettings, isErrorWhenNotFound) {
        var id = exports.getReportId(reportName);
        
		if (id === null) {
            if (isErrorWhenNotFound) {
                throw new Error("Unable to locate saved report [" + reportName + "]");
            }
            else {
                return null;
            }                
        }

        return nlapiRunReport(id, reportSettings);
    };
});