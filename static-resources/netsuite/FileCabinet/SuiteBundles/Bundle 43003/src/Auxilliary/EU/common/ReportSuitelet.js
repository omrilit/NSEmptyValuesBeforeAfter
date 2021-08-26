/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

function main(request, response) { 
	try {
		var reportController = {};
		var deployment = nlapiGetContext().getDeploymentId();
        nlapiLogExecution('DEBUG', 'main: deploymentId', deployment);
		var params = request.getAllParameters();
		var actiontype = params.actiontype || '';
		nlapiLogExecution('DEBUG', 'main: actiontype', actiontype);
		
		if (deployment != CONSTANTS.DEPLOYMENT.ESL) {
		    throw nlapiCreateError('INVALID_DEPLOYMENT', 'Unrecognised deployment id [' + deployment + ']');
		}
		
        switch (actiontype) {
            case '':
            case CONSTANTS.ACTIONTYPE.ESL_REFRESH_FORM:
                reportController = new VAT.EU.ESL.ReportController(params);
                var eslOnlineView = new VAT.EU.ESL.View.FormView();
                var eslForm = reportController.getForm(eslOnlineView);
                response.writePage(eslForm);
                break;
            case CONSTANTS.ACTIONTYPE.ESL_GET_DATA:
                reportController = new VAT.EU.ESL.ReportController(params);
                var eslData = reportController.getPageData();
                response.write(JSON.stringify(eslData));
                break;
            case CONSTANTS.ACTIONTYPE.ESL_EXPORT:
                reportController = new VAT.EU.ESL.ReportController(params);
                var result = reportController.getExport(request);
                delete result.content; 
                response.write(JSON.stringify(result));
                break;
            case CONSTANTS.ACTIONTYPE.ESL_GB_SUBMIT_HMRC:
				reportController = new VAT.EU.ESL.ReportController(params);
				var result = reportController.submitHMRC(request.getURL());
				response.write(JSON.stringify(result));
				break;
            case CONSTANTS.ACTIONTYPE.ESL_SETUP_TAX_FILING: 
            	new VAT.OnlineFiling(request, response).Run(params);
            	break;
            default:
                throw nlapiCreateError("INVALID_ACTION_TYPE", "Unrecognised actiontype id [" + actiontype + "]");
                break;
        }       
	} catch (ex) {
		logException(ex, 'main');
        throw ex;
    }
}


