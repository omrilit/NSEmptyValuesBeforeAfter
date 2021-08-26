/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var ns_wrapper = ns_wrapper || {};

ns_wrapper.EmailSender = function EmailSender () {
  var cc = null;
  var bcc = null;
  var records = null;
  var attachments = null;
  var notifySenderOnBounce = false;
  var internalOnly = false;

  this.setCC = function setCC (val) {
    cc = val;
  };

  this.setBCC = function setBCC (val) {
    bcc = val;
  };

  this.setRecords = function setRecords (val) {
    records = val;
  };

  this.setAttachments = function setAttachments (val) {
    attachments = val;
  };

  this.setNotifySenderOnBounce = function setNotifySenderOnBounce (val) {
    notifySenderOnBounce = val;
  };

  this.setInternalOnly = function setInternalOnly (val) {
    internalOnly = val;
  };

  this.send = function send (author, recipient, subject, body) {
    nlapiSendEmail(author, recipient, subject, body, cc, bcc, records, attachments, notifySenderOnBounce, internalOnly);
  };
};
