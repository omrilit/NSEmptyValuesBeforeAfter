/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.AutoAssignProcedure = function AutoAssignProcedure () {
  var AutoAssignProcedureSearch = dunning.app.AutoAssignProcedureSearch;
  var AutoAssignProcedureSearchHandler = dunning.app.AutoAssignProcedureSearchHandler;
  var DunningAssignResultHandlerInput = dunning.view.DunningAssignResultHandlerInput;

  function performAutoAssign (autoAssignInput) {
    var result = doSearch(autoAssignInput);
    return handleResult(result);
  }

  function doSearch (autoAssignInput) {
    var search = new AutoAssignProcedureSearch();

    var handlerInput = new DunningAssignResultHandlerInput();
    handlerInput.recordId = autoAssignInput.recordId;
    handlerInput.dunningProcedureList = search.searchDpList(autoAssignInput);
    handlerInput.requestDetails = autoAssignInput;

    return handlerInput;
  }

  function handleResult (result) {
    var handlerImpl = new dunning.app.AutoAssignProcedureTopPriority();

    var handler = new AutoAssignProcedureSearchHandler(handlerImpl);
    return handler.handleResult(result);
  }

  return {
    performAutoAssign: performAutoAssign
  };
};
