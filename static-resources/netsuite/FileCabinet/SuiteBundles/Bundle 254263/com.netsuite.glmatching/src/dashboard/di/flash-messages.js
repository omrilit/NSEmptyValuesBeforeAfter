/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "N/runtime", "../flash-messages"], function (_exports, _runtime, _flashMessages) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getAndClearFlashMessagesForChecklist = _exports.nameForChecklist = _exports.getAndClearFlashMessagesForDashboard = _exports.addFlashMessageForDashboard = _exports.nameforDashboard = void 0;
  var session = (0, _runtime.getCurrentSession)();
  var nameforDashboard = "glm_flash_messages_dashboard";
  _exports.nameforDashboard = nameforDashboard;
  var addFlashMessageForDashboard = (0, _flashMessages.addFlashMessageConstructor)(session, nameforDashboard);
  _exports.addFlashMessageForDashboard = addFlashMessageForDashboard;
  var getAndClearFlashMessagesForDashboard = (0, _flashMessages.getAndClearFlashMessagesConstructor)(session, nameforDashboard);
  _exports.getAndClearFlashMessagesForDashboard = getAndClearFlashMessagesForDashboard;
  var nameForChecklist = "glm_flash_messages_checklist";
  _exports.nameForChecklist = nameForChecklist;
  var getAndClearFlashMessagesForChecklist = (0, _flashMessages.getAndClearFlashMessagesConstructor)(session, nameForChecklist);
  _exports.getAndClearFlashMessagesForChecklist = getAndClearFlashMessagesForChecklist;
});