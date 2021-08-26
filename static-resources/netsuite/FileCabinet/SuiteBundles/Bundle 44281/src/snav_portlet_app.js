/**
 * @NApiVersion 2.x
 * @NScriptType Portlet
 * @NModuleScope SameAccount
 */
define(['N/url'],

function(url) {
   
    /**
     * Definition of the Portlet script trigger point.
     * 
     * @param {Object} params
     * @param {Portlet} params.portlet - The portlet object used for rendering
     * @param {number} params.column - Specifies whether portlet is placed in left (1), center (2) or right (3) column of the dashboard
     * @param {string} params.entity - (For custom portlets only) references the customer ID for the selected customer
     * @Since 2015.2
     */
    function render(params) {        
        // get suitelet url
        var slUrl = url.resolveScript({
            scriptId : 'customscript_snav_suitelet',
            deploymentId : 'customdeploy_snav_suitelet'
        });
        slUrl = slUrl + '&popup=T';
        slUrl = slUrl + '&ifrmcntnr=T';
        // set iframe as inline html of portlet
        var html = '<iframe id="snavPortlet" style="height: 250px; width: 99%" frameborder="0" src="' + slUrl + '"></iframe>';
        params.portlet.title = 'Subsidiary Navigator';
        params.portlet.html = html;
    }

    return {
        render: render
    };
    
});
