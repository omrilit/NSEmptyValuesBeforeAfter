/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.filter_results = dunning.filter_results || {};

/**
 * It filters out all ids, which Result Status and Letter Type does not match parameters
 * @param {string[]} ids List of Dunning Evaluation Result internal IDs
 * @param {string} resultStatus The Value of Result Status, ie. "queued"
 * @param {string} letterType The Value of Letter Type, ie. "email"
 * @returns {string[]} List of Dunning Evaluation Result internal IDs
 */
dunning.filter_results.filter = function (ids, resultStatus, letterType) {
  'use strict';

  if (ids.length === 0) {
    return [];
  }

  var resultStatusId = suite_l10n.variables.resultStatus(resultStatus);
  var letterTypeId = suite_l10n.variables.letterType(letterType);

  var search = nlapiSearchRecord('customrecord_3805_dunning_eval_result', null, [
    new nlobjSearchFilter('internalid', null, 'anyof', ids),
    new nlobjSearchFilter('custrecord_3805_eval_result_status', null, 'is', resultStatusId),
    new nlobjSearchFilter('custrecord_3805_eval_result_letter_type', null, 'is', letterTypeId)
  ]);

  return (search || []).map(function (result) {
    return String(result.getId());
  });
};
