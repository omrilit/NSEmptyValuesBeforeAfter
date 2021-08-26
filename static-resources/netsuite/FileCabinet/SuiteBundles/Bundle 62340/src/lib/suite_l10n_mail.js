/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var suite_l10n = suite_l10n || {};
suite_l10n.communication = suite_l10n.communication || {};

suite_l10n.communication.Mail = function Mail (object) {
  var ProcessResult = suite_l10n.process.ProcessResult;

  var container = object;

  function setSender (newSender) {
    container.sender = newSender;
  }

  /** Replaces the recipient list */
  function setRecipients (newRecipients) {
    container.recipients = newRecipients;
  }

  function setSubject (newSubject) {
    container.subject = newSubject;
  }

  function setBody (newBody) {
    container.body = newBody;
  }

  /** Replaces the cc list */
  function setCC (newCC) {
    container.cc = newCC;
  }

  /** Replaces the BCC list */
  function setBCC (newBCC) {
    container.bcc = newBCC;
  }

  /** Replaces the list of attached records */
  function setRecordIDs (newRecordIDs) {
    container.recordAttachments = newRecordIDs;
  }

  /** Replaces the list of attachments */
  function setAttachments (newAttachments) {
    container.attachments = newAttachments;
  }

  function send () {
    var isSuccess = false;
    var message;

    try {
      var recipientList = (container.recipients instanceof Array) ? container.recipients.join() : container.recipients;
      var ccList = container.cc || [];
      var cc = ccList.length > 1 ? ccList.join() : null;
      var bccList = container.bcc || [];
      var bcc = bccList.length > 1 ? bccList.join() : null;

      nlapiLogExecution('DEBUG', 'Mail Contents', [
        ['sender', container.sender].join(': '),
        ['recipientList', recipientList].join(': '),
        ['Attachment Types', JSON.stringify(container.recordAttachments)].join(': ')].join('\n'));

      nlapiSendEmail(container.sender, recipientList, container.subject, container.body, cc, bcc, container.recordAttachments, container.attachments);

      isSuccess = true;
    } catch (e) {
      // just get the full error for now.
      message = e;
      nlapiLogExecution('ERROR', 'DUNNING_MAILER_ERROR', 'An error has occurred in sending email. Details: ' + JSON.stringify(e));
    }

    return new ProcessResult(isSuccess, message);
  }

  return {
    send: send,
    setSender: setSender,
    setRecipients: setRecipients,
    setSubject: setSubject,
    setBody: setBody,
    setCC: setCC,
    setBCC: setBCC,
    setRecordIDs: setRecordIDs,
    setAttachments: setAttachments
  };
};
