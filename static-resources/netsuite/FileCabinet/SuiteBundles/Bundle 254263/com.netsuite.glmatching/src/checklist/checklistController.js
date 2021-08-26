/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../common/fn", "../common/Maybe", "../dashboard/request-parsers"], function (_exports, _fn, _Maybe, _requestParsers) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.checklistControllerConstructor = checklistControllerConstructor;

  function checklistControllerConstructor(deps) {
    var createError = function createError(e) {
      if ((0, _fn.isSuiteScriptError)(e)) {
        return {
          message: e.message + ("<!--\n" + JSON.stringify(e.stack) + "\n-->"),
          title: e.name
        };
      } else {
        return {
          message: String(e) + (e instanceof Error && typeof e.stack === "string" ? "<!--\n" + JSON.stringify(e.stack) + "\n-->" : ""),
          title: deps.translate("unknown_error")
        };
      }
    };

    return function (request, response) {
      if (deps.runtime.checkMandatoryPermissions()) {
        deps.checklistFormBuilder.addError({
          title: deps.translate("mandatory_per_title"),
          message: deps.translate("mandatory_per_message")
        });
        return response.writePage(deps.checklistFormBuilder.buildEmpty());
      }

      var parameters = (0, _requestParsers.parseFilterParameters)(request);
      var accountResult = [];

      if ((0, _Maybe.isNothing)(parameters.action)) {
        parameters = parameters.set({
          dateMax: (0, _Maybe.maybe)(deps.format.getCurrentDate()),
          dateMin: (0, _Maybe.maybe)(deps.dateMinSession.getOrSearch("date_from", deps.checklistSearch.fetchDateFrom.bind(deps.checklistSearch)))
        });
      } else {
        try {
          accountResult = deps.checklistSearch.fetchTotalAccountAmount(parameters);
        } catch (e) {
          deps.checklistFormBuilder.addError(createError(e));
        }
      }

      deps.getAndClearFlashMessages().forEach(function (error) {
        return deps.checklistFormBuilder.addError(error);
      });
      var form = deps.checklistFormBuilder.build(parameters);
      deps.checklistResultTabBuilder.build(accountResult, form, parameters);
      response.writePage(form);
    };
  }
});