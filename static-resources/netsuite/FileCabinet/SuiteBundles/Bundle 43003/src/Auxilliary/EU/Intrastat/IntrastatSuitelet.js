/**
 * Copyright © 2016, Oracle and/or its affiliates. All rights reserved.
 */

function intrastatMain(request, response) {
	if (!request || !response) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Invalid parameter');
	}

	try {
		var params = request.getAllParameters();

		nlapiLogExecution('DEBUG', 'intrastatMain : actiontype', params.actiontype);

		switch (params.actiontype) {
			case CONSTANTS.ACTION_TYPE.GET_DATA :
			case CONSTANTS.ACTION_TYPE.EXPORT :
				var controller = new Tax.EU.Intrastat.IntrastatController();
				var sequenceData = controller.runSequence(params);
				response.write(JSON.stringify(sequenceData));
				break;
			case CONSTANTS.ACTION_TYPE.SETUP:
				new VAT.OnlineFiling(request, response).Run(params);
				break;
			default :
				var controller = new Tax.EU.Intrastat.IntrastatController();
				var sequenceData = controller.runSequence(params);
				response.writePage(sequenceData);
				break;
		}
	} catch (ex) {
		logException(ex, 'intrastatMain');
		throw ex;
	}
}

