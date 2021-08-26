/**
 * Module Description
 * 
 * Version Date Author Remarks
 * 
 * 1.00 28 Feb 2014 mjaurigue
 * 
 */

if (!dunning) {
    var dunning = {};
}

if (!dunning.component) {
    dunning.component = {};
}

if (!dunning.component.su) {
    dunning.component.su = {};
}

dunning.component.su.DunningTemplateSuitelet = function DunningTemplateSuitelet() {
    
    var DunningTemplateForm = dunning.app.DunningTemplateForm;
    var Request = ns_wrapper.Request;
    var Response = ns_wrapper.Response;
    
    var obj = {
        runSuitelet: runSuitelet
    };
    
    function showForm(request, response) {
        var form = new DunningTemplateForm(request, response);
        form.showForm();
    }
    
    function redirectPage(request, response) {
    }
    
    function saveDunningTemplate(request, response) {
    }
    
    function runSuitelet(request, response) {
        var wrRequest = new Request(request);
        var wrResponse = new Response(response);
        
        switch (wrRequest.getMethod()) {
            case "POST":
                saveDunningTemplate();
                redirectPage();
                break;
            case "GET":
            default:
                showForm(wrRequest, wrResponse);
        }
    }
    
    return obj;
};

/**
 * @param {nlobjRequest}
 *            request Request object
 * @param {nlobjResponse}
 *            response Response object
 * @returns {Void} Any output is written via response object
 */
function runSuitelet(request, response) {
    var suitelet = new dunning.component.su.DunningTemplateSuitelet();
    suitelet.runSuitelet(request, response);
}
