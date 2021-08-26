/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.model = dunning.model || {};

/**
 * Encapsulates a dunning letter. Other objects may call functions to send email
 * or simply retrieve the message
 */
dunning.model.DunningMessage = function DunningMessage (input) {
  var message;

  /**
   * Loads the template, if applicable and replaces the data on the template's
   * body
   */
  function getBody (body, source) {
    // message = message || TemplateToText(body, source)
    message = message || body;
    return message;
  }

  /**
   * Prepares an email object. This object contains information for making a
   * call to nlapiSendEmail via the mail.send function
   */
  function getEmail () {
    return new suite_l10n.communication.Mail({
      sender: input.dunningManager,
      recipients: input.email,
      subject: input.subject,
      body: getBody(input.body, input.source),
      recordAttachments: input.recordAttachments
    });
  }

  return {
    getEmail: getEmail,
    getBody: getBody
  };
};
