/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.AutoAssignProcedureSearch = function AutoAssignProcedureSearch () {
  function searchDpList (autoAssignInput) {
    var searchDp = new dunning.app.ProcedureSearch(autoAssignInput);
    var searchDpIterator = searchDp.searchDpList();

    return createDpList(searchDpIterator);
  }

  function createDpList (searchWithSavedSearchIterator) {
    var dpList = [];

    // Expecting zero to many here
    if (searchWithSavedSearchIterator) {
      while (searchWithSavedSearchIterator.hasNext()) {
        var dp = convertNlobjDpToView(searchWithSavedSearchIterator.next());
        dpList.push(dp);
      }
    }

    return dpList;
  }

  // Once again, the deadly conversion of nlobj to view... which shouldn't be here BTW
  function convertNlobjDpToView (nlobjDp) {
    var dunningProcedure = new dunning.view.DunningProcedure();

    // Right now, we are only putting in the properties we need.
    var dpId = nlobjDp.getId();
    dunningProcedure.id = dpId || -1;

    dunningProcedure.name = nlobjDp.getValue('name');

    var priority = nlobjDp.getValue(dunning.view.DUNNING_PROCEDURE_PRIORITY);
    dunningProcedure.weighting = priority || 0;

    dunningProcedure.savedSearchCustomer =
      nlobjDp.getValue(dunning.view.DUNNING_PROCEDURE_SAVED_SEARCH_CUSTOMER);
    dunningProcedure.savedSearchInvoice =
      nlobjDp.getValue(dunning.view.DUNNING_PROCEDURE_SAVED_SEARCH_INVOICE);
    dunningProcedure.dunningManager = nlobjDp.getValue(dunning.view.DUNNING_PROCEDURE_DEFAULT_DUNNING_MANAGER);

    return dunningProcedure;
  }

  return {
    searchDpList: searchDpList
  };
};
