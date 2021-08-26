/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.AutoAssignProcedureTopPriority = function AutoAssignProcedureTopPriority () {
  function handleResult (input) {
    var dpList = input.dunningProcedureList;
    var dpListLength = dpList.length;
    var dpFirst = dpList[0];

    var requestDetails = input.requestDetails;
    var type = requestDetails.type;

    // Initial checking if there is no DP found
    if (!dpList || dpListLength == 0) { return null; }

    var savedSearch = (type == dunning.view.CUSTOMER)
      ? dpFirst.savedSearchCustomer
      : dpFirst.savedSearchInvoice;

    // Return first DP's weighting == 1 and there is no saved search in the first priority
    if ((dpListLength == 1 || dpFirst.weighting == 1) && !savedSearch) {
      return dpFirst;
    }

    // If you are here, that means, the remaining DP with saved searches must be scrutinized
    // Loop thru them DP's
    for (var i = 0; i < dpListLength; i++) { // We start at the first DP with saved search
      var dp = dpList[i];
      savedSearch = (type == dunning.view.CUSTOMER)
        ? dp.savedSearchCustomer
        : dp.savedSearchInvoice;

      if (savedSearch) {
        var rs = recordSearch(requestDetails, savedSearch);

        // And check for the results if
        if (rs.hasNext()) { return dp; }
      } else {
        return dp;
      }
    }

    // No dp to return
    return null;
  }

  function recordSearch (requestDetails, savedSearch) {
    var recSearch = new dunning.app.RecordSearch();
    return recSearch.searchRecord(requestDetails, savedSearch);
  }

  return {
    handleResult: handleResult
  };
};
