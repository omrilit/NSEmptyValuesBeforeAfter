/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.AutoAssignProcedureSearchHandler = function AutoAssignProcedureSearchHandler (handlerImpl) {
  function handleResult (dunningAssignResultHandlerInput) {
    if (handlerImpl) {
      return handlerImpl.handleResult(dunningAssignResultHandlerInput);
    } else {
      throw nlapiCreateError('DUNNING_AUTO_ASSIGN_PROCEDURE_SEARCH_HANDLER_CLASS_NOT_IMPLEMENTED', 'Please implement a logic for handling the results');
    }
  }

  return {
    handleResult: handleResult
  };
};
