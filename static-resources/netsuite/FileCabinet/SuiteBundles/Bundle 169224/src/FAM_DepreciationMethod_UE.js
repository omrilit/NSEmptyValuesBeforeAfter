/**
 * � 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var FAM;
if (!FAM) { FAM = {}; }

FAM.DepreciationMethod_UE = new function () {
    /**
     * beforeLoad event type of user event scripts
    **/
    this.beforeLoad = function (type, form, request) {
        var screenName = 'depreciationmethodformula';
        
        nlapiSetFieldValue('custrecord_deprmethodinlinehelp', '<br>' +
            FAM.resourceManager.GetString('custpage_html_formulainstruction', screenName) +
            '<UL><LI>' + FAM.resourceManager.GetString('custpage_html_formulahelp1', screenName) +
            '<LI>' + FAM.resourceManager.GetString('custpage_html_formulahelp2', screenName) +
            '<LI>' + FAM.resourceManager.GetString('custpage_html_formulahelp3', screenName) +
            '<LI>' + FAM.resourceManager.GetString('custpage_html_formulahelp4', screenName) +
            '<LI>' + FAM.resourceManager.GetString('custpage_html_formulahelp5', screenName) +
            '<LI>' + FAM.resourceManager.GetString('custpage_html_formulahelp6', screenName) +
            '<LI>' + FAM.resourceManager.GetString('custpage_html_formulahelp7', screenName) +
            '<LI>' + FAM.resourceManager.GetString('custpage_html_formulahelp8', screenName) +
            '<LI>' + FAM.resourceManager.GetString('custpage_html_formulahelp9', screenName) +
            '<LI>' + FAM.resourceManager.GetString('custpage_html_formulahelp10', screenName) +
            '<LI>' + FAM.resourceManager.GetString('custpage_html_formulahelp11', screenName) +
            '<LI>' + FAM.resourceManager.GetString('custpage_html_formulahelp12', screenName) +
            '<LI>' + FAM.resourceManager.GetString('custpage_html_formulahelp13', screenName) +
            '<LI>' + FAM.resourceManager.GetString('custpage_html_formulahelp14', screenName) +
            '<LI>' + FAM.resourceManager.GetString('custpage_html_formulahelp15', screenName) +
            '<LI>' + FAM.resourceManager.GetString('custpage_html_formulahelp16', screenName) +
            '<LI>' + FAM.resourceManager.GetString('custpage_html_formulahelp17', screenName) +
            '<LI>' + FAM.resourceManager.GetString('custpage_html_formulahelp18', screenName) +
            '</UL>');
        
        form.getField('custrecord_deprmethodinlinehelp').setBreakType('startcol');
    };
};