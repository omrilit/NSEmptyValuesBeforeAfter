/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.addFlashMessageConstructor = addFlashMessageConstructor;
  _exports.getAndClearFlashMessagesConstructor = getAndClearFlashMessagesConstructor;

  function addFlashMessageConstructor(session, name) {
    return function (flashMessage) {
      var rawValues = session.get({
        name: name
      });
      var content = [];

      try {
        content = JSON.parse(rawValues || "[]");
      } finally {
        content.push(flashMessage);
        session.set({
          name: name,
          value: JSON.stringify(content)
        });
      }
    };
  }

  function getAndClearFlashMessagesConstructor(session, name) {
    return function () {
      var rawValues = session.get({
        name: name
      });

      try {
        return JSON.parse(rawValues || "[]");
      } catch (_a) {
        return [];
      } finally {
        session.set({
          name: name,
          value: ""
        });
      }
    };
  }
});