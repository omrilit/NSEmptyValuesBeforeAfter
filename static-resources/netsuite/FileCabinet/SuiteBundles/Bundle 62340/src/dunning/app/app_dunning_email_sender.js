/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

/**
 * @deprecated
 */
dunning.app.EmailSender = function EmailSender (params) {
  this.sendEmail = function sendEmail () {
    var input = prepareInput(params);

    var mail = new suite_l10n.communication.Mail(input);
    mail.send();
  };

  function prepareInput (params) {
    var input = {};
    input.sender = params.dunningManager;
    input.recipients = params.recipient;
    input.subject = params.subject;
    input.body = params.message;
    input.attachments = params.attachments;

    return params;
  }
};
