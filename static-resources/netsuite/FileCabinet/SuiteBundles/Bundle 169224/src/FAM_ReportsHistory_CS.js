/**
 * © 2015 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
**/

var FAM;
if (!FAM) { FAM = {}; }

FAM.ReportsHistory_CS = new function () {   
    this.deleteReport = function (bgpId) {
        this.alertMessage = FAM.Util_CS.fetchMessageObj({
            CONFIRM_DELETE     : 'client_report_confirm_delete' });
        
        if (confirm(this.alertMessage.CONFIRM_DELETE)) {
            var url = nlapiResolveURL('SUITELET', 'customscript_fam_pdfreport_su','customdeploy_fam_pdfreport_su') 
                      +'&del='+bgpId;
            nlapiRequestURL(url);
            reloadPage();
        }
    };
    
    this.saveRecord = function () {
        var showAllVal = nlapiGetFieldValue('custpage_showall')=='T';
        var url = nlapiResolveURL('SUITELET', 'customscript_fam_reportshistory_su','customdeploy_fam_reportshistory_su');
        if(!showAllVal){
            url += '&showall=T';
        }
        setWindowChanged(window, false);
        window.location.href = url;
    };
};
