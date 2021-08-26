/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib", "../common/fn", "../common/Maybe", "../common/NameCollection", "../dashboard/index", "../../vendor/lodash-4.17.4", "./types", "./utils"], function (_exports, _tslib, _fn, _Maybe, _NameCollection, _index, _lodash, _types, _utils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.warningMessageRendererConstructor = warningMessageRendererConstructor;
  _exports.htmlStyle = void 0;

  var parseLineId = function parseLineId(x) {
    return parseInt(x.line, 10) || 0;
  };

  var sortByLineId = function sortByLineId(a, b) {
    return parseLineId(a.transactions[0]) - parseLineId(b.transactions[0]);
  };

  function isValidReason(x) {
    return x === _types.Reason.ACCOUNT_CHANGE || x === _types.Reason.AMOUNT_CHANGE || x === _types.Reason.DELETED || x === _types.Reason.SUBSIDIARY_CHANGE;
  }

  var htmlStyle = "\n    <style>\n        #unmachedResult {\n            margin-top: 14px;\n            border-collapse: collapse;\n        }\n        #unmachedResult td,\n        #unmachedResult th {\n            border: 1px solid black;\n            text-align: center;\n            padding: 5px 10px;\n        }\n        #unmachedResult th {\n            font-weight: bold;\n        }\n        #unmachedResult tr > *:nth-child(1),\n        #unmachedResult tr > *:nth-child(2) {\n            text-align: left;\n        }\n    </style>\n";
  _exports.htmlStyle = htmlStyle;

  function warningMessageRendererConstructor(translate, findNames, format, resolveDashboard) {
    var getGroupUrl = function getGroupUrl(history) {
      return resolveDashboard(new _index.FilterParameters({
        account: (0, _Maybe.maybe)(history.transactions[0].account),
        accountingBook: (0, _Maybe.maybe)(history.transactions[0].accountingBook),
        action: (0, _Maybe.maybe)("search"
        /* SEARCH */
        ),
        matchingCode: (0, _Maybe.maybe)(history.code && history.code.after),
        subsidiary: (0, _Maybe.maybe)(history.transactions[0].subsidiary)
      }));
    };

    var renderReason = function renderReason(_a) {
      var comment = _a.comment,
          transactions = _a.transactions;
      return translate("transaction_line") + " " + transactions[0].line + " - " + translate(comment);
    };

    return function (history) {
      var historyWithMatchingAndReason = (0, _lodash.flatMap)(history, _utils.flattenHistory).filter(function (x) {
        return isValidReason(x.comment);
      }).filter(function (x) {
        return (0, _Maybe.isJust)(x.transactions[0].matching);
      });

      if (historyWithMatchingAndReason.length === 0) {
        return "";
      }

      var groups = (0, _lodash.groupBy)(historyWithMatchingAndReason, function (x) {
        return x.transactions[0].matching.fmap(function (y) {
          return y.id;
        }).valueOrUndefined();
      });
      var nameCollection = findNames(new _NameCollection.IdentifierCollection({
        account: (0, _lodash.compact)(history.map(function (x) {
          return x.account;
        }))
      }));

      var renderGroup = function renderGroup(group) {
        var _a, _b, _c, _d, _e, _f;

        var h = group[0];
        var reasons = (0, _tslib.__spreadArrays)(group).sort(sortByLineId).map(renderReason).join("<br>");
        var accountName = h.transactions[0].account ? nameCollection.account(h.transactions[0].account).valueOr("") : "";
        return "<tr>\n                <td>" + reasons + "</td>\n                <td>" + accountName + "</td>\n                <td>" + (0, _fn.stringOrDefault)((_a = h === null || h === void 0 ? void 0 : h.code) === null || _a === void 0 ? void 0 : _a.before) + "</td>\n                <td>" + (0, _fn.stringOrDefault)((_b = h === null || h === void 0 ? void 0 : h.code) === null || _b === void 0 ? void 0 : _b.after) + "</td>\n                <td>" + (0, _fn.stringOrDefault)(((_c = h === null || h === void 0 ? void 0 : h.status) === null || _c === void 0 ? void 0 : _c.before) && translate(h.status.before)) + "</td>\n                <td>" + (0, _fn.stringOrDefault)(((_d = h === null || h === void 0 ? void 0 : h.status) === null || _d === void 0 ? void 0 : _d.after) && translate(h.status.after)) + "</td>\n                <td>" + (((_e = h === null || h === void 0 ? void 0 : h.balance) === null || _e === void 0 ? void 0 : _e.before) != null ? format.formatCurrency(h.balance.before) : "") + "</td>\n                <td>" + (((_f = h === null || h === void 0 ? void 0 : h.balance) === null || _f === void 0 ? void 0 : _f.after) != null ? format.formatCurrency(h.balance.after) : "") + "</td>\n                <td>\n                    <a target=\"_blank\" href=\"" + getGroupUrl(h) + "\">" + translate("edit_group_details") + "</a>\n                </td>\n            </tr>";
      };

      return htmlStyle + ("\n        <p>" + translate("transaction_edit_warning") + "</p>\n        <table id=\"unmachedResult\">\n            <thead>\n            <tr>\n                <th rowspan=\"2\">" + translate("edit_reason_of_change") + "</th>\n                <th rowspan=\"2\">" + translate("edit_group_account") + "</th>\n                <th colspan=\"2\">" + translate("matching_code_field") + "</th>\n                <th colspan=\"2\">" + translate("matching_status_field") + "</th>\n                <th colspan=\"2\">" + translate("edit_group_balance") + "</th>\n                <th rowspan=\"2\">" + translate("edit_group_details") + "</th>\n            </tr>\n            <tr>\n                <th>" + translate("edit_former") + "</th>\n                <th>" + translate("edit_new") + "</th>\n                <th>" + translate("edit_former") + "</th>\n                <th>" + translate("edit_new") + "</th>\n                <th>" + translate("edit_former") + "</th>\n                <th>" + translate("edit_new") + "</th>\n            </tr>\n            </thead>\n            <tbody>\n            " + (0, _lodash.map)(groups, renderGroup).join("") + "\n            </tbody>\n        </table>");
    };
  }
});