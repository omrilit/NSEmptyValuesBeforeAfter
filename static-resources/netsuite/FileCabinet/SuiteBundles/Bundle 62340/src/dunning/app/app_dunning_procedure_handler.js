/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningProcedureHandler = function () {
  /**
   * @param {Array.<suite_l10n.communication.Mail>} mailList
   * @returns {Array.<suite_l10n.process.ProcessResult>}
   */
  this.sendDunningLetters = function (mailList) {
    return (mailList || []).map(function (mail) {
      return mail.send();
    });
  };

  /**
   * @param {view.Task} task
   * @returns {suite_l10n.process.ProcessResult}
   */
  this.processDunning = function (task) {
    var results = [];

    if (task.objects.source && task.objects.source.sendByEmail === 'T') {
      var dunningProcessor = new dunning.app.DunningProcessor(task);
      results = this.sendDunningLetters(dunningProcessor.getEmailList());
    }

    return suite_l10n.process.ProcessResult.consolidateResults(results);
  };
};
