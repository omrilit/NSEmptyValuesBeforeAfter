/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};

Tax.ReportEngine = function ReportEngine() { };

Tax.ReportEngine.prototype.run = function run(sequenceBuilder, params, errorHandler) { //params should include "filterParams" and "metaData"<columns formatting> //supplementary will not follow setup formatting from UI
        if (!sequenceBuilder) {
            throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'sequenceBuilder is required');
        }
        
	try{
        var result = null;
	    var startingProcessor = sequenceBuilder.initializeSequence(errorHandler);
        
        if (startingProcessor) {
            params.result = {};
            result = startingProcessor.runSequence(params);
        }
        
        //check if result contains failed message
        return result;
    } catch (ex) {
        logException(ex, 'ReportEngine.run');
        throw ex;
    }
};
