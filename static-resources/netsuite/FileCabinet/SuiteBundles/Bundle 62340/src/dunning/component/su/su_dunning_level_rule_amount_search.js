/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author ldimayuga
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.su = dunning.component.su || {};

dunning.component.su.DunningLevelRuleAmountSuitelet = function DunningLevelRuleAmountSuitelet () {
  var DERA_CURRENCY = 'custrecord_3805_dera_currency';
  var DERA_AMOUNT = 'custrecord_3805_dera_amount'; // MIA
  var DERA_TOA = 'custrecord_3805_dera_total_overdue_amt';
  var DERA_DEFAULT = 'custrecord_3805_dera_default';
  var DERA_PARENT = 'custrecord_3805_dera_parent';
  var DER_RECORD = 'customrecord_3805_der_amount';
  var INTERNAL_ID = 'internalid';

  function runSuitelet (request, response) {
    var dlrId = request.getParameter('dlrId');
    var dlraDetails = getDunningLevelRuleAmountDetails(dlrId);

    response.write(JSON.stringify(dlraDetails));
  }

  function getDunningLevelRuleAmountDetails (dlrId) {
    if (!dlrId) {
      return [];
    }

    var columns = [
      new nlobjSearchColumn(DERA_DEFAULT),
      new nlobjSearchColumn(DERA_TOA),
      new nlobjSearchColumn(DERA_CURRENCY),
      new nlobjSearchColumn(DERA_AMOUNT),
      new nlobjSearchColumn(INTERNAL_ID)
    ];

    var filters = [
      new nlobjSearchFilter(DERA_PARENT, null, 'anyof', dlrId)
    ];

    var search = new ns_wrapper.Search(DER_RECORD);
    search.addColumns(columns);
    search.addFilters(filters);
    var it = search.getIterator();

    var dlras = [];
    if (it) {
      while (it.hasNext()) {
        var obj = {
          INTERNAL_ID: null,
          DERA_CURRENCY: null,
          DERA_AMOUNT: null,
          DERA_TOA: null,
          DERA_DEFAULT: null
        };

        var r = it.next();
        obj.internalid = r.getValue(INTERNAL_ID);
        obj.currency = r.getValue(DERA_CURRENCY);
        obj.amount = r.getValue(DERA_AMOUNT);
        obj.toa = r.getValue(DERA_TOA);
        obj.defaultflag = r.getValue(DERA_DEFAULT);

        dlras.push(obj);
      }
    }
    return dlras;
  }

  return {
    runSuitelet: runSuitelet
  };
};

/**
 * @param {nlobjRequest} request
 * @param {nlobjResponse} response
 */
function runSuitelet (request, response) { // eslint-disable-line no-unused-vars
  var suitelet = new dunning.component.su.DunningLevelRuleAmountSuitelet();

  suitelet.runSuitelet(request, response);
}
