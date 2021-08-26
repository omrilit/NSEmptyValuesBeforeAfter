/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningQueueRemove = function DunningQueueRemove () {
  this.performAction = function (dunningQueueActionInput) {
    var REMOVED = 'removed';

    var dunningEvalResultStatus = loadEvaluationStatus();
    var removed = dunningEvalResultStatus.getIdByValue(REMOVED);

    var derIdList = dunningQueueActionInput.derIdList;
    for (var i = 0; i < derIdList.length; i++) {
      var derId = derIdList[i];
      ns_wrapper.api.field.submitField(
        dunning.view.DUNNING_EVAL_RESULT_CUSTOM_RECORD
        , derId
        , dunning.view.DUNNING_EVAL_RESULT_STATUS
        , removed);
    }
  };

  function loadEvaluationStatus () {
    return new suite_l10n.variable.LocalizationVariableList('dunning_eval_result_status');
  }
};
