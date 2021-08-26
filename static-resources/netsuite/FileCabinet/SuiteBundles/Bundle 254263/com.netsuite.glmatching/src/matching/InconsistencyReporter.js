/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib", "../common/expectations", "../common/MatchingStatus", "../../vendor/lodash-4.17.4", "./types", "./warning-message"], function (_exports, _tslib, _expectations, _MatchingStatus, _lodash, _types, _warningMessage) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getEntityLanguageConstructor = getEntityLanguageConstructor;
  _exports.InconsistencyReporter = void 0;
  var REGEXP_ACCOUNT = new RegExp("custpage_account"
  /* ACCOUNT */
  + "=[0-9]*");
  var REGEXP_SUBSIDIARY = new RegExp("custpage_subsidiary"
  /* SUBSIDIARY */
  + "=[0-9]*");

  function fixLinkAccount(link, account, subsidiary) {
    if (subsidiary) {
      link = link.replace(REGEXP_SUBSIDIARY, "custpage_subsidiary"
      /* SUBSIDIARY */
      + "=" + subsidiary);
    }

    return link.replace(REGEXP_ACCOUNT, "custpage_account"
    /* ACCOUNT */
    + "=" + account);
  }

  function getEntityLanguageConstructor(search) {
    return function (userIds) {
      return search.create({
        columns: [search.createColumn({
          name: "language"
        })],
        filters: [search.createFilter({
          name: "internalid",
          operator: search.Operator.ANYOF,
          values: (0, _tslib.__spreadArrays)(userIds)
        })],
        type: search.Type.ENTITY
      }).run().getRange({
        end: 1000,
        start: 0
      }).map(function (r) {
        return {
          language: (0, _expectations.expectOptionalString)(r.getValue(r.columns[0])),
          user: (0, _expectations.expectInternalId)(r.id)
        };
      }).filter(function (x) {
        return typeof x.language === "string" && x.language !== "";
      }).map(function (x) {
        return x;
      });
    };
  }

  var InconsistencyReporter =
  /** @class */
  function () {
    function InconsistencyReporter(email, getEntityLanguage, matchingStatusMap, getTranslator, isMultiBookEnabled, isOneWorld, runQuery, translate) {
      this.email = email;
      this.getEntityLanguage = getEntityLanguage;
      this.matchingStatusMap = matchingStatusMap;
      this.getTranslator = getTranslator;
      this.isMultiBookEnabled = isMultiBookEnabled;
      this.isOneWorld = isOneWorld;
      this.runQuery = runQuery;
      this.translate = translate;
    }

    InconsistencyReporter.prototype.sendErrorEmails = function (matchingIds) {
      var _this = this;

      var data = (0, _lodash.groupBy)(this.searchErrorReportingDetails(matchingIds), function (x) {
        return x.lastEdited;
      });
      var userIds = Object.keys(data);
      var entityLanguages = this.getEntityLanguage(userIds).reduce(function (a, x) {
        var _a;

        return (0, _tslib.__assign)((0, _tslib.__assign)({}, a), (_a = {}, _a[x.user] = x.language, _a));
      }, {});
      var translators = (0, _lodash.uniq)((0, _lodash.values)(entityLanguages)).reduce(function (a, language) {
        var _a;

        return (0, _tslib.__assign)((0, _tslib.__assign)({}, a), (_a = {}, _a[language] = _this.getTranslator(language), _a));
      }, {});

      for (var _i = 0, userIds_1 = userIds; _i < userIds_1.length; _i++) {
        var user = userIds_1[_i];
        var translate = user in entityLanguages && entityLanguages[user] in translators ? translators[entityLanguages[user]] : this.translate;
        this.email.send({
          author: -5,
          body: this.renderMessage(translate, data[user], translate("dc_email_part1"), translate("dc_email_part2")),
          recipients: [user],
          subject: translate("dc_email_subject")
        });
      }
    };

    InconsistencyReporter.prototype.renderMessage = function (translate, results, messageBegin, messageEnd) {
      var _this = this;

      var rows = results.map(function (result) {
        return "\n            <tr>\n                " + (result.subsidiaryName ? "<td>" + result.subsidiaryName + "</td>" : "") + "\n                <td>" + result.accountName + "</td>\n                <td>" + result.count + "</td>\n                <td>'" + result.code + "'</td>\n                <td>" + _this.matchingStatusMap.getByStatus(result.status).name + "</td>\n                <td>\n                    <a href=\"" + fixLinkAccount(result.link, result.accountId, result.subsidiaryId) + "\">\n                        " + translate("edit_group_details") + "\n                    </a>\n                </td>\n            </tr>\n        ";
      });
      return "\n            " + _warningMessage.htmlStyle + "\n            <p style=\"font-size: 1.1em\">" + messageBegin + "</p>\n            <br>\n            <table id=\"unmachedResult\">\n               <tr>\n                   " + (this.isOneWorld ? "<th>" + translate("edit_group_subsidiary") + "</th>" : "") + "\n                   <th>" + translate("edit_group_account") + "</th>\n                   <th>" + translate("group_count") + "</th>\n                   <th>" + translate("matching_code_column") + "</th>\n                   <th>" + translate("matching_status_column") + "</th>\n                   <th>" + translate("edit_group_details") + "</th>\n               </tr>\n               " + rows.join("") + "\n            </table>\n            <br>\n            <p style=\"font-size: 1.1em\">" + messageEnd + "</p>\n            <br>\n        ";
    };

    InconsistencyReporter.prototype.searchErrorReportingDetails = function (matchingIds) {
      var _this = this;

      if (matchingIds.length === 0) {
        return [];
      }

      return this.runQuery("\n            SELECT *\n            FROM (\n                SELECT tal.account accountId\n                     , MAX(a.accountsearchdisplayname) accountName\n                     , MAX(gm." + _types.MatchingSchema.fields.code + ") code\n                     , COUNT(*) count\n                     , MAX(gm." + _types.MatchingSchema.fields.lastEdited + ") lastEdited\n                     , MAX(gm." + _types.MatchingSchema.fields.link + ") link\n                     , MAX(gm." + _types.MatchingSchema.fields.statusValue + ") status\n                     " + (this.isOneWorld ? ", s.id subsidiaryId" : "") + "\n                     " + (this.isOneWorld ? ", MAX(s.name) subsidiaryName" : "") + "\n                FROM " + _types.MatchingSchema.type + " gm\n                   , " + _types.TranLineSchema.type + " gl\n                   , transactionline tl\n                   , transactionaccountingline tal\n                   , account a\n                   " + (this.isOneWorld ? ", subsidiary s" : "") + "\n                WHERE gm.id IN (" + matchingIds.join() + ")\n                  AND gm." + _types.MatchingSchema.fields.lastEdited + " is NOT NULL\n                  AND gl." + _types.TranLineSchema.fields.matching + " = gm.id\n                  AND tal.transactionline = gl." + _types.TranLineSchema.fields.line + "\n                  AND tal.transaction = gl." + _types.TranLineSchema.fields.transaction + "\n                  " + (this.isMultiBookEnabled ? "AND tal.accountingbook = gl." + _types.TranLineSchema.fields.accountingBook : "") + "\n                  AND tl.id = tal.transactionline\n                  AND tl.transaction = tal.transaction\n                  AND a.id = tal.account\n                  " + (this.isOneWorld ? "AND s.id = tl.subsidiary" : "") + "\n                GROUP BY tal.account\n                       , gm.id\n                       " + (this.isOneWorld ? ", s.id" : "") + "\n            )\n            ORDER BY lastEdited\n                   , code\n                   " + (this.isOneWorld ? ", subsidiaryId" : "") + "\n                   , accountId\n        ").map(function (result) {
        var accountId = (0, _expectations.expectInternalId)(result[0]);
        var accountName = (0, _expectations.expectString)(result[1]);
        var code = (0, _expectations.expectString)(result[2]);
        var count = parseInt(String(result[3]), 10);
        var lastEdited = (0, _expectations.expectInternalId)(result[4]);
        var link = (0, _expectations.expectString)(result[5]);
        var status = (0, _MatchingStatus.expectMatchingStatus)(result[6]);
        var subsidiaryId = _this.isOneWorld ? (0, _expectations.expectInternalId)(result[7]) : undefined;
        var subsidiaryName = _this.isOneWorld ? (0, _expectations.expectString)(result[8]) : undefined;
        return {
          accountId: accountId,
          accountName: accountName,
          code: code,
          count: count,
          lastEdited: lastEdited,
          link: link,
          status: status,
          subsidiaryId: subsidiaryId,
          subsidiaryName: subsidiaryName
        };
      });
    };

    return InconsistencyReporter;
  }();

  _exports.InconsistencyReporter = InconsistencyReporter;
});