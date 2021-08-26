/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib", "../common/field", "../../vendor/lodash-4.17.4", "./DashboardFormBuilder", "./types"], function (_exports, _tslib, _field, _lodash, _DashboardFormBuilder, _types) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.repeatString = repeatString;
  _exports.DashboardResultTabBuilder = void 0;

  var toCheckboxValue = function toCheckboxValue(value) {
    return value ? "T" : "F";
  };

  var toDefaultMoney = function toDefaultMoney(value) {
    return value || "0";
  };

  function getPageOptions(count, pageSize) {
    var lastPage = Math.max(1, Math.ceil(count / Math.max(1, pageSize)));
    return (0, _lodash.range)(1, 1 + lastPage).map(function (x) {
      return (0, _DashboardFormBuilder.getOption)(String(x));
    });
  }

  function repeatString(value, count) {
    return new Array(count + 1).join(value);
  }

  function setTotalPages(count, pageSize) {
    var value = pageSize === 0 ? 10 : pageSize;
    return Math.ceil(count / value);
  }

  var DashboardResultTabBuilder =
  /** @class */
  function () {
    function DashboardResultTabBuilder(format, ui, url, translate, currencyRepository) {
      this.format = format;
      this.ui = ui;
      this.url = url;
      this.translate = translate;
      this.currencyRepository = currencyRepository;
    }

    DashboardResultTabBuilder.prototype.build = function (parameters, page, nameCollection, form) {
      var _this = this;

      var addField = (0, _field.createFieldAdder)(form);
      var pageOptions = getPageOptions(page.count, parameters.pageSize || _types.DEFAULT_PAGE_SIZE);
      var isResultValid = page.count !== 0;
      form.addTab({
        id: "custpage_tab_results"
        /* RESULTS */
        ,
        label: this.translate("sublist_results_title")
      });

      if (isResultValid) {
        addField({
          container: "custpage_tab_results"
          /* RESULTS */
          ,
          defaultValue: this.format.formatBalanceFields(0, page.summary.balance),
          displayType: this.ui.FieldDisplayType.INLINE,
          help: this.translate("balance_total_help"),
          id: "custpage_balance_total"
          /* BALANCE_TOTAL */
          ,
          label: this.translate("balance_total_field"),
          layoutType: this.ui.FieldLayoutType.STARTROW,
          type: this.ui.FieldType.TEXT
        });
        addField({
          container: "custpage_tab_results"
          /* RESULTS */
          ,
          defaultValue: this.format.formatBalanceFields(0, page.summary.debit),
          displayType: this.ui.FieldDisplayType.INLINE,
          help: this.translate("debit_balance_help"),
          id: "custpage_debit_checked"
          /* DEBIT_BALANCE */
          ,
          label: this.translate("debit_balance_field"),
          layoutType: this.ui.FieldLayoutType.MIDROW,
          type: this.ui.FieldType.TEXT
        });
        addField({
          container: "custpage_tab_results"
          /* RESULTS */
          ,
          defaultValue: this.format.formatBalanceFields(0, page.summary.credit),
          displayType: this.ui.FieldDisplayType.INLINE,
          help: this.translate("credit_balance_help"),
          id: "custpage_credit_checked"
          /* CREDIT_BALANCE */
          ,
          label: this.translate("credit_balance_field"),
          layoutType: this.ui.FieldLayoutType.MIDROW,
          type: this.ui.FieldType.TEXT
        });
        addField({
          container: "custpage_tab_results"
          /* RESULTS */
          ,
          defaultValue: repeatString("&nbsp;", 40),
          displayType: this.ui.FieldDisplayType.INLINE,
          help: "&nbsp;",
          id: "custpage_empty_1"
          /* EMPTY_1 */
          ,
          label: "&nbsp;",
          layoutType: this.ui.FieldLayoutType.MIDROW,
          type: this.ui.FieldType.TEXT
        });
        addField({
          container: "custpage_tab_results"
          /* RESULTS */
          ,
          defaultValue: String(parameters.pageNumber),
          help: this.translate("page_number_help"),
          id: "custpage_page_number"
          /* PAGE_NUMBER */
          ,
          label: this.translate("page_number"),
          layoutType: this.ui.FieldLayoutType.MIDROW,
          options: pageOptions,
          type: this.ui.FieldType.SELECT,
          width: 100
        });
        addField({
          container: "custpage_tab_results"
          /* RESULTS */
          ,
          defaultValue: this.translate("total_pages") + " " + ("" + setTotalPages(page.count, parameters.pageSize)),
          displayType: this.ui.FieldDisplayType.INLINE,
          help: this.translate("page_number_help"),
          id: "custpage_page_total"
          /* PAGE_TOTAL */
          ,
          label: "&nbsp;",
          layoutType: this.ui.FieldLayoutType.MIDROW,
          type: this.ui.FieldType.TEXT
        });
        addField({
          container: "custpage_tab_results"
          /* RESULTS */
          ,
          defaultValue: repeatString("&nbsp;", 10),
          displayType: this.ui.FieldDisplayType.INLINE,
          help: "&nbsp;",
          id: "custpage_empty_2"
          /* EMPTY_2 */
          ,
          label: "&nbsp;",
          layoutType: this.ui.FieldLayoutType.MIDROW,
          type: this.ui.FieldType.TEXT
        });
        addField({
          container: "custpage_tab_results"
          /* RESULTS */
          ,
          defaultValue: String(parameters.pageSize),
          help: this.translate("results_per_page_help"),
          id: "custpage_results_per_page"
          /* RESULTS_PER_PAGE */
          ,
          label: this.translate("results_per_page"),
          layoutType: this.ui.FieldLayoutType.MIDROW,
          options: [(0, _DashboardFormBuilder.getOption)(String(_types.DEFAULT_PAGE_SIZE)), (0, _DashboardFormBuilder.getOption)("25"), (0, _DashboardFormBuilder.getOption)("50"), (0, _DashboardFormBuilder.getOption)("100"), (0, _DashboardFormBuilder.getOption)("200"), (0, _DashboardFormBuilder.getOption)("500")],
          type: this.ui.FieldType.SELECT,
          width: 100
        });
        addField({
          container: "custpage_tab_results"
          /* RESULTS */
          ,
          defaultValue: String(page.count),
          displayType: this.ui.FieldDisplayType.INLINE,
          help: this.translate("total_results_help"),
          id: "custpage_total_results"
          /* TOTAL_RESULTS */
          ,
          label: this.translate("total_results"),
          layoutType: this.ui.FieldLayoutType.ENDROW,
          type: this.ui.FieldType.TEXT
        });
      }

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

      if (isResultValid) {
        sublist.addButton({
          functionName: "markAll",
          id: "custpage_mark_all"
          /* MARK_ALL */
          ,
          label: this.translate("mark_all_button")
        });
        sublist.addButton({
          functionName: "unMarkAll",
          id: "custpage_unmark_all"
          /* UNMARK_ALL */
          ,
          label: this.translate("unmark_all_button")
        });
        sublist.addButton({
          functionName: "match",
          id: "custpage_match"
          /* MATCH */
          ,
          label: this.translate("match_button")
        });
        sublist.addButton({
          functionName: "unmatch",
          id: "custpage_unmatch"
          /* UNMATCH */
          ,
          label: this.translate("unmatch_button")
        });
        var pageSize = Math.max(parameters.pageSize, _types.DEFAULT_PAGE_SIZE);
        var pageOptionsCount = Math.max(1, Math.ceil(page.count / pageSize));

        if (pageOptionsCount > 1) {
          if (parameters.pageNumber > 1) {
            sublist.addButton({
              functionName: "goToPreviousPage",
              id: "custpage_prev"
              /* PREV */
              ,
              label: this.translate("prev_button")
            });
          }

          if (parameters.pageNumber < pageOptionsCount) {
            sublist.addButton({
              functionName: "goToNextPage",
              id: "custpage_next"
              /* NEXT */
              ,
              label: this.translate("next_button")
            });
          }
        }

        sublist.addButton({
          functionName: "handleExportCsv",
          id: "custpage_export_csv"
          /* EXPORT_CSV */
          ,
          label: this.translate("export_csv")
        });
      }

      sublist.addField({
        id: "custpage_results_selected"
        /* SELECTED */
        ,
        label: this.translate("selected_column"),
        type: this.ui.FieldType.CHECKBOX
      });
      sublist.addField({
        id: "custpage_results_tran_name"
        /* TRAN_NAME */
        ,
        label: this.translate("tran_name_column"),
        type: this.ui.FieldType.TEXT
      });
      sublist.addField({
        id: "custpage_results_tran_number"
        /* TRAN_NUMBER */
        ,
        label: this.translate("number_column"),
        type: this.ui.FieldType.TEXT
      });
      sublist.addField({
        id: "custpage_results_date"
        /* DATE */
        ,
        label: this.translate("date_column"),
        type: this.ui.FieldType.DATE
      });
      sublist.addField({
        id: "custpage_results_entity"
        /* ENTITY */
        ,
        label: this.translate("entity_column"),
        type: this.ui.FieldType.TEXT
      });
      sublist.addField({
        id: "custpage_results_currency"
        /* CURRENCY */
        ,
        label: this.translate("currency_column"),
        type: this.ui.FieldType.TEXT
      });
      sublist.addField({
        id: "custpage_results_debit"
        /* DEBIT */
        ,
        label: this.currencyRepository.getLabelWithCurrency(parameters.subsidiary, this.translate("debit_checked_column")),
        type: this.ui.FieldType.CURRENCY
      });
      sublist.addField({
        id: "custpage_results_credit"
        /* CREDIT */
        ,
        label: this.currencyRepository.getLabelWithCurrency(parameters.subsidiary, this.translate("credit_checked_column")),
        type: this.ui.FieldType.CURRENCY
      });
      sublist.addField({
        id: "custpage_results_debit_fx"
        /* DEBIT_FX */
        ,
        label: this.translate("debit_total_column"),
        type: this.ui.FieldType.CURRENCY
      });
      sublist.addField({
        id: "custpage_results_credit_fx"
        /* CREDIT_FX */
        ,
        label: this.translate("credit_total_column"),
        type: this.ui.FieldType.CURRENCY
      });
      sublist.addField({
        id: "custpage_results_memo_main"
        /* MEMO_MAIN */
        ,
        label: this.translate("memo_column"),
        type: this.ui.FieldType.TEXTAREA
      });
      sublist.addField({
        id: "custpage_results_matching_code"
        /* MATCHING_CODE */
        ,
        label: this.translate("matching_code_column"),
        type: this.ui.FieldType.TEXT
      });
      sublist.addField({
        id: "custpage_results_matching_status"
        /* MATCHING_STATUS */
        ,
        label: this.translate("matching_status_column"),
        type: this.ui.FieldType.TEXT
      });
      sublist.addField({
        id: "custpage_results_matching_datetime"
        /* MATCHING_DATE */
        ,
        label: this.translate("matching_date_column"),
        type: this.ui.FieldType.DATETIMETZ
      });
      sublist.addField({
        id: "custpage_results_matching_reference"
        /* MATCHING_REFERENCE */
        ,
        label: this.translate("matching_reference_column"),
        type: this.ui.FieldType.TEXT
      }).updateDisplayType({
        displayType: this.ui.FieldDisplayType.ENTRY
      });
      this.hide(sublist.addField({
        id: "custpage_results_tran_id"
        /* TRAN_ID */
        ,
        label: "custpage_results_tran_id"
        /* TRAN_ID */
        ,
        type: this.ui.FieldType.INTEGER
      }));
      this.hide(sublist.addField({
        id: "custpage_results_tran_line"
        /* TRAN_LINE */
        ,
        label: "custpage_results_tran_line"
        /* TRAN_LINE */
        ,
        type: this.ui.FieldType.INTEGER
      }));
      this.hide(sublist.addField({
        id: "custpage_results_matching_id"
        /* MATCHING_ID */
        ,
        label: "custpage_results_matching_id"
        /* MATCHING_ID */
        ,
        type: this.ui.FieldType.TEXT
      }));
      this.hide(sublist.addField({
        id: "custpage_results_is_reversal"
        /* IS_REVERSAL */
        ,
        label: "custpage_results_is_reversal"
        /* IS_REVERSAL */
        ,
        type: this.ui.FieldType.TEXT
      }));
      this.hide(sublist.addField({
        id: "custpage_results_is_period_closed"
        /* IS_PERIOD_CLOSED */
        ,
        label: "custpage_results_is_period_closed"
        /* IS_PERIOD_CLOSED */
        ,
        type: this.ui.FieldType.TEXT
      }));
      this.hide(sublist.addField({
        id: "custpage_results_tran_type"
        /* TRAN_TYPE */
        ,
        label: "custpage_results_tran_type"
        /* TRAN_TYPE */
        ,
        type: this.ui.FieldType.TEXT
      }));
      this.hide(sublist.addField({
        id: "custpage_results_accounting_book"
        /* ACCOUNTING_BOOK */
        ,
        label: "custpage_results_accounting_book"
        /* ACCOUNTING_BOOK */
        ,
        type: this.ui.FieldType.TEXT
      }));

      var resolveUrl = function resolveUrl(recordId, recordType, params) {
        return _this.url.resolveRecord({
          params: params,
          recordId: recordId,
          recordType: recordType
        });
      };

      var getTransactionLink = function getTransactionLink(result) {
        if (result.tranNumber === "") {
          return "";
        }

        var url;

        try {
          url = String(resolveUrl(result.tranId, result.tranType, {
            whence: ""
          }));
        } catch (_a) {
          url = "/app/accounting/transactions/" + result.tranType.toLowerCase() + ".nl?id=" + result.tranId + "&amp;whence=";
        }

        return "<a href=\"" + url + "\">" + result.tranNumber + "</a>";
      };

      var getEntityLink = function getEntityLink(result) {
        try {
          return result.entity.bind(function (x) {
            return nameCollection.entity(x.id).fmap(function (name) {
              return (0, _tslib.__assign)((0, _tslib.__assign)({}, x), {
                name: name
              });
            }).fmap(function (_a) {
              var id = _a.id,
                  name = _a.name,
                  type = _a.type;
              return "<a href=\"" + resolveUrl(id, type) + "\">" + name + "</a>";
            });
          }).valueOr("");
        } catch (_a) {
          return "";
        }
      };

      var line = 0;

      for (var _i = 0, _a = page.results; _i < _a.length; _i++) {
        var row = _a[_i];

        var setSublistValue = function setSublistValue(id) {
          return function (value) {
            return value && sublist.setSublistValue({
              id: id,
              line: line,
              value: value
            });
          };
        };

        setSublistValue("custpage_results_accounting_book"
        /* ACCOUNTING_BOOK */
        )(row.accountingBook);
        setSublistValue("custpage_results_debit"
        /* DEBIT */
        )(toDefaultMoney(row.debit));
        setSublistValue("custpage_results_credit"
        /* CREDIT */
        )(toDefaultMoney(row.credit));
        setSublistValue("custpage_results_debit_fx"
        /* DEBIT_FX */
        )(toDefaultMoney(row.debitFx));
        setSublistValue("custpage_results_credit_fx"
        /* CREDIT_FX */
        )(toDefaultMoney(row.creditFx));
        setSublistValue("custpage_results_tran_id"
        /* TRAN_ID */
        )(row.tranId);
        setSublistValue("custpage_results_tran_line"
        /* TRAN_LINE */
        )(row.tranLine);
        setSublistValue("custpage_results_tran_name"
        /* TRAN_NAME */
        )(row.tranName);
        setSublistValue("custpage_results_tran_number"
        /* TRAN_NUMBER */
        )(getTransactionLink(row));
        setSublistValue("custpage_results_is_reversal"
        /* IS_REVERSAL */
        )(toCheckboxValue(row.isReversal));
        setSublistValue("custpage_results_is_period_closed"
        /* IS_PERIOD_CLOSED */
        )(toCheckboxValue(row.isPeriodClosed));
        setSublistValue("custpage_results_entity"
        /* ENTITY */
        )(getEntityLink(row));
        setSublistValue("custpage_results_date"
        /* DATE */
        )(this.format.formatDate(row.date));
        setSublistValue("custpage_results_currency"
        /* CURRENCY */
        )(row.currency);
        setSublistValue("custpage_results_memo_main"
        /* MEMO_MAIN */
        )(row.memoMain);
        setSublistValue("custpage_results_matching_code"
        /* MATCHING_CODE */
        )(row.matchingCode);
        setSublistValue("custpage_results_matching_datetime"
        /* MATCHING_DATE */
        )(this.format.formatDateTime(row.matchingDate));
        setSublistValue("custpage_results_matching_reference"
        /* MATCHING_REFERENCE */
        )(row.matchingReference);
        setSublistValue("custpage_results_matching_status"
        /* MATCHING_STATUS */
        )(row.matchingStatusName);
        setSublistValue("custpage_results_matching_id"
        /* MATCHING_ID */
        )(row.matchingId);
        setSublistValue("custpage_results_tran_type"
        /* TRAN_TYPE */
        )(row.tranType);
        line++;
      }
    };

    DashboardResultTabBuilder.prototype.hide = function (field) {
      return field.updateDisplayType({
        displayType: this.ui.FieldDisplayType.HIDDEN
      });
    };

    return DashboardResultTabBuilder;
  }();

  _exports.DashboardResultTabBuilder = DashboardResultTabBuilder;
});