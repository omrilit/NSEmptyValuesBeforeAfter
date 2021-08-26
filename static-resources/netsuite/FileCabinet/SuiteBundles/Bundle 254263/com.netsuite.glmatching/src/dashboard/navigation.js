/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib", "../common/fn", "./types"], function (_exports, _tslib, _fn, _types) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getQueryString = getQueryString;
  _exports.resolveDashboardConstructor = resolveDashboardConstructor;
  _exports.resolveChecklistConstructor = resolveChecklistConstructor;
  _exports.redirectToDashboardConstructor = redirectToDashboardConstructor;

  var reducer = function reducer(a, item) {
    return item[1].caseOf({
      just: function just(x) {
        var _a;

        return (0, _tslib.__assign)((0, _tslib.__assign)({}, a), (_a = {}, _a[item[0]] = x, _a));
      },
      nothing: function nothing() {
        return a;
      }
    });
  };

  function getQueryString(parameters) {
    var items = [["custpage_account"
    /* ACCOUNT */
    , parameters.account], ["custpage_accounting_book"
    /* ACCOUNTING_BOOK */
    , parameters.accountingBook], ["custpage_accounting_context"
    /* ACCOUNTING_CONTEXT */
    , parameters.accountingContext], ["custpage_action"
    /* ACTION */
    , parameters.action], ["custpage_amount_max"
    /* AMOUNT_MAX */
    , parameters.amountMax], ["custpage_amount_min"
    /* AMOUNT_MIN */
    , parameters.amountMin], ["custpage_customer"
    /* CUSTOMER */
    , parameters.customer], ["custpage_date_max"
    /* DATE_MAX */
    , parameters.dateMax], ["custpage_date_min"
    /* DATE_MIN */
    , parameters.dateMin], ["custpage_matching_code"
    /* MATCHING_CODE */
    , parameters.matchingCode], ["custpage_matching_reference"
    /* MATCHING_REFERENCE */
    , parameters.matchingReference], ["custpage_memo"
    /* MEMO */
    , parameters.memo], ["custpage_line_memo"
    /* LINE_MEMO */
    , parameters.memoLine], ["custpage_subsidiary"
    /* SUBSIDIARY */
    , parameters.subsidiary], ["custpage_vendor"
    /* VENDOR */
    , parameters.vendor], ["custpage_billing_status"
    /* BILLING_STATUS */
    , parameters.billingStatus], ["custpage_employee"
    /* EMPLOYEE */
    , parameters.employee], ["custpage_class"
    /* CLASS */
    , parameters.classification], ["custpage_department"
    /* DEPARTMENT */
    , parameters.department], ["custpage_location"
    /* LOCATION */
    , parameters.location]];
    var object = items.reduce(reducer, {});

    if (!parameters.matchingStatus.isSelectedAll() && parameters.matchingStatus.isSelectedAnything()) {
      object["custpage_matching_status"
      /* MATCHING_STATUS */
      ] = (0, _fn.joinMultiSelectValue)(parameters.matchingStatus.getSelected());
    }

    if (parameters.transactionTypes.length > 0) {
      object["custpage_tran_types"
      /* TRANSACTION_TYPES */
      ] = (0, _fn.joinMultiSelectValue)(parameters.transactionTypes.map(function (x) {
        return JSON.stringify(x);
      }));
    }

    if (parameters.pageNumber > 1) {
      object["custpage_page_number"
      /* PAGE_NUMBER */
      ] = String(parameters.pageNumber);
    }

    if (parameters.pageSize > 0 && parameters.pageSize !== _types.DEFAULT_PAGE_SIZE) {
      object["custpage_results_per_page"
      /* RESULTS_PER_PAGE */
      ] = String(parameters.pageSize);
    }

    return object;
  }

  function resolveDashboardConstructor(resolveScript) {
    return function (parameters) {
      return resolveScript({
        deploymentId: "customdeploy_glm_su_dashboard"
        /* DASHBOARD_DEPLOYMENT_ID */
        ,
        params: getQueryString(parameters),
        scriptId: "customscript_glm_su_dashboard"
        /* DASHBOARD_SCRIPT_ID */

      });
    };
  }

  function resolveChecklistConstructor(resolveScript) {
    return function (parameters) {
      return resolveScript({
        deploymentId: "customdeploy_glm_su_checklist"
        /* CHECKLIST_DEPLOYMENT_ID */
        ,
        params: getQueryString(parameters),
        scriptId: "customscript_glm_su_checklist"
        /* CHECKLIST_SCRIPT_ID */

      });
    };
  }

  function redirectToDashboardConstructor(redirectType) {
    return function (response, parameters) {
      return response.sendRedirect({
        id: "customdeploy_glm_su_dashboard"
        /* DASHBOARD_DEPLOYMENT_ID */
        ,
        identifier: "customscript_glm_su_dashboard"
        /* DASHBOARD_SCRIPT_ID */
        ,
        parameters: getQueryString(parameters),
        type: redirectType.SUITELET
      });
    };
  }
});