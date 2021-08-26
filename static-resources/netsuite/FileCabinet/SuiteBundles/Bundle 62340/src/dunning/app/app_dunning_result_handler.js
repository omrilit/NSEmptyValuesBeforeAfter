/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningResultHandler = function DunningResultHandler (task) {
  var ProcessResult = suite_l10n.process.ProcessResult;

  function updateSourceSendDate () {
    var taskObjects = task.objects;
    var source = taskObjects.source;
    var sourceDAO = taskObjects.sourceDAO;

    // retrieve the model since we expect source to be a view.
    var dunningSourceModel = sourceDAO.retrieve(source.id);

    var taskData = task.data;
    dunningSourceModel.lastSentDate = taskData.sendDate;

    sourceDAO.updateRecord(dunningSourceModel);
  }

  function processResult (result) {
    if (result.success) {
      updateSourceSendDate();
    }
  }

  /**
   * @deprecated
   */
  function processResults (results) {
    var isSuccess = true;
    var messages = [];

    for (var i = 0; i < results.length; i++) {
      var result = results[i];
      isSuccess = isSuccess && result.success;
      if (result.message) {
        messages.push(result.message);
      }
    }

    var consolidatedResult = new ProcessResult(isSuccess, messages.join('\n'));

    processResult(consolidatedResult);
    return consolidatedResult;
  }

  return {
    processResult: processResult,
    processResults: processResults
  };
};
