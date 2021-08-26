/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var suite_l10n = suite_l10n || {};
suite_l10n.app = suite_l10n.app || {};

suite_l10n.app.ParentMessageLoader = function ParentMessageLoader (messageLoaderContext) {
  var messageMap = {};

  this.setMessageMap = function setMessageMap (msgMap) {
    messageMap = msgMap;
  };

  this.getMessage = function getMessage (messageCode) {
    return messageMap[messageCode];
  };

  this.getMessageMap = function getMessageMap () {
    return messageMap;
  };

  this.getContext = function getContext () {
    return messageLoaderContext;
  };
};
