/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../common/MatchingStatus", "../common/Maybe", "../dashboard/index"], function (_exports, _MatchingStatus, _Maybe, _index) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.ChecklistResultTabBuilder = void 0;

  var toDefaultMoney = function toDefaultMoney(value) {
    return value || "0";
  };

  var ChecklistResultTabBuilder =
  /** @class */
  function () {
    function ChecklistResultTabBuilder(format, ui, translate, resolveDashboard, runtime, currencyRepository) {
      this.format = format;
      this.ui = ui;
      this.translate = translate;
      this.resolveDashboard = resolveDashboard;
      this.runtime = runtime;
      this.currencyRepository = currencyRepository;
    }

    ChecklistResultTabBuilder.prototype.build = function (page, form, parameters) {
      var _this = this;

      var isOW = this.runtime.isOneWorld();
      var isMB = this.runtime.isMultiBookEnabled();
      var currencies = [];
      form.addTab({
        id: "custpage_tab_results"
        /* RESULTS */
        ,
        label: this.translate("sublist_results_title")
      });
      var sublist = form.addSublist({
        id: "custpage_sublist_results"
        /* RESULTS */
        ,
        label: this.translate("sublist_results_title"),
        tab: "custpage_tab_results"
        /* RESULTS */
        ,
        type: this.ui.SublistType.LIST
      });
      sublist.addField({
        id: "custpage_results_link"
        /* LINK */
        ,
        label: this.translate("action_column"),
        type: this.ui.FieldType.URL
      }).linkText = this.translate("match_account");
      sublist.addField({
        id: "custpage_results_account"
        /* ACCOUNT */
        ,
        label: this.translate("account_field"),
        type: this.ui.FieldType.TEXT
      });

      if (isMB) {
        sublist.addField({
          id: "custpage_results_accounting_book"
          /* ACCOUNTING_BOOK */
          ,
          label: this.translate("accounting_book_field"),
          type: this.ui.FieldType.TEXT
        });
      }

      if (isOW) {
        sublist.addField({
          id: "custpage_results_subsidiary"
          /* SUBSIDIARY */
          ,
          label: this.translate("subsidiary_field"),
          type: this.ui.FieldType.TEXT
        });
        sublist.addField({
          id: "custpage_results_currency"
          /* CURRENCY */
          ,
          label: this.translate("currency_column_checklist"),
          type: this.ui.FieldType.TEXT
        });
        currencies = this.currencyRepository.fetchCurrencyBySubsidiaries(page.map(function (o) {
          return o.subsidiaryId;
        }));
      }

      sublist.addField({
        id: "custpage_results_unmatched_debit"
        /* UNMATCHED_DEBIT */
        ,
        label: this.translate("unmached_debit"),
        type: this.ui.FieldType.CURRENCY
      });
      sublist.addField({
        id: "custpage_results_unmatched_credit"
        /* UNMATCHED_CREDIT */
        ,
        label: this.translate("unmached_credit"),
        type: this.ui.FieldType.CURRENCY
      });
      sublist.addField({
        id: "custpage_results_matching_date"
        /* MATCHING_DATE */
        ,
        label: this.translate("last_matched_date"),
        type: this.ui.FieldType.DATETIMETZ
      });
      page.forEach(function (result, line) {
        try {
          var getGroupUrl = _this.resolveDashboard(new _index.FilterParameters({
            account: (0, _Maybe.maybe)(result.accountId),
            accountingBook: (0, _Maybe.maybe)(result.accountingBookId),
            action: (0, _Maybe.maybe)("search"
            /* SEARCH */
            ),
            dateMax: parameters.dateMax,
            dateMin: parameters.dateMin,
            matchingStatus: _MatchingStatus.MatchingStatusOptions.fromArray(["paired"
            /* PAIRED */
            , "none"
            /* NONE */
            ]),
            subsidiary: (0, _Maybe.maybe)(result.subsidiaryId)
          }));

          var filteredCurrencies = currencies.filter(function (o) {
            return o.id === result.subsidiaryId;
          });
          var fields = [["custpage_results_account"
          /* ACCOUNT */
          , result.accountName], ["custpage_results_accounting_book"
          /* ACCOUNTING_BOOK */
          , result.accountingBookName], ["custpage_results_subsidiary"
          /* SUBSIDIARY */
          , result.subsidiaryName], ["custpage_results_currency"
          /* CURRENCY */
          , filteredCurrencies.length > 0 ? filteredCurrencies[0].currency : ""], ["custpage_results_unmatched_debit"
          /* UNMATCHED_DEBIT */
          , toDefaultMoney(result.debitTotal)], ["custpage_results_unmatched_credit"
          /* UNMATCHED_CREDIT */
          , toDefaultMoney(result.creditTotal)], ["custpage_results_matching_date"
          /* MATCHING_DATE */
          , _this.format.formatDateTime(result.lastMatchingDate)], ["custpage_results_link"
          /* LINK */
          , getGroupUrl]];

          for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
            var _a = fields_1[_i],
                id = _a[0],
                value = _a[1];

            if (value != null && value !== "") {
              sublist.setSublistValue({
                id: id,
                line: line,
                value: value
              });
            }
          }
        } catch (_b) {// intentionally swallowed
        }
      });
    };

    return ChecklistResultTabBuilder;
  }();

  _exports.ChecklistResultTabBuilder = ChecklistResultTabBuilder;
});