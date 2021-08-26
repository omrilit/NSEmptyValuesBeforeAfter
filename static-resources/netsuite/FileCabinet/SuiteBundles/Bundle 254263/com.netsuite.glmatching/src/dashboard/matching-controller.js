/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../common/Maybe", "../matching/expectations", "../../vendor/lodash-4.17.4", "./request-parsers"], function (_exports, _Maybe, _expectations, _lodash, _requestParsers) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.catchErrorsConstructor = catchErrorsConstructor;
  _exports.redirectConstructor = redirectConstructor;
  _exports.matchConstructor = matchConstructor;
  _exports.unmatchConstructor = unmatchConstructor;
  _exports.changeReferenceOnMatchedTransactionsConstructor = changeReferenceOnMatchedTransactionsConstructor;
  _exports.changeReferenceOnSingleTransactionConstructor = changeReferenceOnSingleTransactionConstructor;
  _exports.changeReferenceAndUnmatchTransactionConstructor = changeReferenceAndUnmatchTransactionConstructor;

  function catchErrorsConstructor(translate, logError, addFlashMessage) {
    return function (message) {
      return function (handler) {
        return function (request, response) {
          try {
            handler(request, response);
          } catch (e) {
            if (e instanceof Error) {
              logError(message, {
                message: e.message,
                name: e.name,
                stack: e.stack
              });
            } else {
              logError(message, e);
            }

            if (e.name === "GLM_ERROR_PERMISSION") {
              addFlashMessage({
                message: translate("error_permission_message"),
                title: "Error",
                type: "error"
              });
            } else if (e.message === "GLM_ERROR_ASYNC") {
              addFlashMessage({
                message: translate("async_error_message"),
                title: translate("transaction_edit_title"),
                type: "error"
              });
            } else {
              addFlashMessage({
                message: e.message || message,
                title: "Error",
                type: "error"
              });
            }
          }
        };
      };
    };
  }

  function redirectConstructor(redirect) {
    return function (handler) {
      return function (request, response) {
        handler(request, response);
        redirect(response, (0, _requestParsers.parseFilterParameters)(request).set({
          action: (0, _Maybe.maybe)("search"
          /* SEARCH */
          )
        }));
      };
    };
  }

  function matchConstructor(assertThatEntriesAreNotInProgress, createMatchingJob, executeMatchingJob, catchErrors, redirect) {
    return redirect(catchErrors("Matching")((0, _lodash.flow)(_requestParsers.parseActionData, _expectations.expectMatchingRequest, assertThatEntriesAreNotInProgress, createMatchingJob, executeMatchingJob)));
  }

  function unmatchConstructor(assertThatEntriesAreNotInProgress, createUnmatchingJob, executeUnmatchingJob, catchErrors, redirect) {
    return redirect(catchErrors("Unmatching")((0, _lodash.flow)(_requestParsers.parseActionData, _expectations.expectUnmatchingRequest, assertThatEntriesAreNotInProgress, createUnmatchingJob, executeUnmatchingJob)));
  }

  function changeReferenceOnMatchedTransactionsConstructor(assertThatEntriesAreNotInProgress, createReferenceGroupJob, executeReferenceGroupJob, catchErrors, redirect) {
    return redirect(catchErrors("Changing reference on matched transactions")((0, _lodash.flow)(_requestParsers.parseActionData, _expectations.expectReferenceGroupRequest, assertThatEntriesAreNotInProgress, createReferenceGroupJob, executeReferenceGroupJob)));
  }

  function changeReferenceOnSingleTransactionConstructor(assertThatEntriesAreNotInProgress, createReferenceSingleJob, executeReferenceSingleJob, catchErrors, redirect) {
    return redirect(catchErrors("Changing reference on single transaction")((0, _lodash.flow)(_requestParsers.parseActionData, _expectations.expectReferenceSingleRequest, assertThatEntriesAreNotInProgress, createReferenceSingleJob, executeReferenceSingleJob)));
  }

  function changeReferenceAndUnmatchTransactionConstructor(assertThatEntriesAreNotInProgress, createReferenceUnmatchingJob, executeReferenceUnmatchingJob, catchErrors, redirect) {
    return redirect(catchErrors("Changing reference and unmatching transaction")((0, _lodash.flow)(_requestParsers.parseActionData, _expectations.expectReferenceUnmatchingRequest, assertThatEntriesAreNotInProgress, createReferenceUnmatchingJob, executeReferenceUnmatchingJob)));
  }
});