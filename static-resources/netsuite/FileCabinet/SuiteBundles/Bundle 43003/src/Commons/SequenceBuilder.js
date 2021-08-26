/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};

Tax.SequenceBuilder = function SequenceBuilder(processorSequence) {
	this.processorSequence = processorSequence;
};

Tax.SequenceBuilder.prototype.initializeSequence = function initializeSequence(errorHandler) {
    if (!this.processorSequence) {
		throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'processorSequence is required');
	}
    
    try {
        var processor = null;
        var chain = [];
        
        for (var i=0; i < this.processorSequence.length; i++) {
            processor = findClass(Tax, this.processorSequence[i]);
            processor.errorHandler = errorHandler;
            chain.push(processor);
        }
        
        var index = 0;
        var nextProcessor = null;
        var currentProcessor = null;
        while (chain[index+1]) {
            nextProcessor = chain[index+1];
            currentProcessor = chain[index];
            currentProcessor.setNext(nextProcessor);
            index++;
        }
        
        return chain.length > 0 ? chain[0] : null;
    } catch (ex) {
        logException(ex, 'SequenceBuilder.initializeSequence');
        throw ex;
    }
};



