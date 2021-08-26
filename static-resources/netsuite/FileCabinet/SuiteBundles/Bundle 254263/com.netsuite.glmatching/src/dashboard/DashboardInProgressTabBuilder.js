/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../common/fn", "../../vendor/lodash-4.17.4"], function (_exports, _fn, _lodash) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.DashboardInProgressTabBuilder = _exports.PROGRESS_POPUP_CLASS_NAME = _exports.PROGRESS_LINK_CLASS_NAME = _exports.InProgressColumn = void 0;
  var InProgressColumn = {
    ACCOUNT: "custpage_in_progress_account",
    ACTION: "custpage_in_progress_action",
    MATCHING_DATE: "custpage_in_progress_matching_date",
    MATCHING_STATUS: "custpage_in_progress_matching_status",
    TRANSACTIONS: "custpage_in_progress_transaction",
    USER: "custpage_in_progress_user"
  };
  _exports.InProgressColumn = InProgressColumn;
  var PROGRESS_LINK_CLASS_NAME = "glm-progress-link";
  _exports.PROGRESS_LINK_CLASS_NAME = PROGRESS_LINK_CLASS_NAME;
  var PROGRESS_POPUP_CLASS_NAME = "glm-progress-popup";
  _exports.PROGRESS_POPUP_CLASS_NAME = PROGRESS_POPUP_CLASS_NAME;

  var DashboardInProgressTabBuilder =
  /** @class */
  function () {
    function DashboardInProgressTabBuilder(format, ui, url, translate) {
      this.format = format;
      this.ui = ui;
      this.url = url;
      this.translate = translate;
      this.transactions = {};
    }

    DashboardInProgressTabBuilder.prototype.build = function (rows, nameCollection, form) {
      var _this = this;

      form.addTab({
        id: "custpage_tab_in_progress",
        label: this.translate("sublist_in_progress_title")
      });
      var sublist = form.addSublist({
        id: "custpage_sublist_in_progress",
        label: this.translate("sublist_in_progress_title"),
        tab: "custpage_tab_in_progress",
        type: this.ui.SublistType.LIST
      });
      sublist.addButton({
        functionName: "refresh",
        id: "custpage_refresh_progress"
        /* REFRESH_PROGRESS */
        ,
        label: this.translate("refresh_button")
      });
      sublist.addField({
        id: InProgressColumn.ACCOUNT,
        label: this.translate("edit_group_account"),
        type: this.ui.FieldType.TEXT
      });
      sublist.addField({
        id: InProgressColumn.TRANSACTIONS,
        label: this.translate("transaction_column"),
        type: this.ui.FieldType.TEXT
      });
      sublist.addField({
        id: InProgressColumn.ACTION,
        label: this.translate("action_column"),
        type: this.ui.FieldType.TEXT
      });
      sublist.addField({
        id: InProgressColumn.MATCHING_STATUS,
        label: this.translate("matching_status_column"),
        type: this.ui.FieldType.TEXT
      });
      sublist.addField({
        id: InProgressColumn.MATCHING_DATE,
        label: this.translate("matching_date_column"),
        type: this.ui.FieldType.DATETIMETZ
      });
      sublist.addField({
        id: InProgressColumn.USER,
        label: this.translate("user_column"),
        type: this.ui.FieldType.TEXT
      });
      var line = 0;

      for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
        var row = rows_1[_i];

        var setSublistValue = function setSublistValue(id) {
          return function (value) {
            return value && sublist.setSublistValue({
              id: id,
              line: line,
              value: value
            });
          };
        };

        var transactionIds = (0, _lodash.uniq)(row.entries.map(function (x) {
          return x.id;
        }));
        setSublistValue(InProgressColumn.ACTION)(this.translate(row.job.type));
        setSublistValue(InProgressColumn.MATCHING_STATUS)(this.translate(row.job.status));
        setSublistValue(InProgressColumn.MATCHING_DATE)(this.format.formatDateTime(row.job.matchingDate));
        setSublistValue(InProgressColumn.TRANSACTIONS)(this.getGroupOfLinks(transactionIds, line));
        row.account.bind(function (id) {
          return nameCollection.account(id);
        })["do"]({
          just: setSublistValue(InProgressColumn.ACCOUNT)
        });
        row.user.bind(function (recordId) {
          return nameCollection.entity(recordId).fmap(function (name) {
            if ((0, _fn.isInternalEntity)(recordId)) {
              return name;
            }

            var url = _this.url.resolveRecord({
              recordId: recordId,
              recordType: "employee"
            });

            return "<a target=\"_blank\" href=\"" + url + "\">" + name + "</a>";
          });
        })["do"]({
          just: setSublistValue(InProgressColumn.USER)
        });
        line++;
      }

      this.hide(form.addField({
        id: "custpage_in_progress_data"
        /* IN_PROGRESS_DATA */
        ,
        label: "custpage_in_progress_data"
        /* IN_PROGRESS_DATA */
        ,
        type: this.ui.FieldType.LONGTEXT
      })).defaultValue = JSON.stringify(this.transactions);
    };

    DashboardInProgressTabBuilder.prototype.hide = function (field) {
      return field.updateDisplayType({
        displayType: this.ui.FieldDisplayType.HIDDEN
      });
    };

    DashboardInProgressTabBuilder.prototype.getGroupOfLinks = function (transactions, line) {
      if (transactions.length === 0) {
        return "";
      }

      this.transactions[line] = transactions;

      if (transactions.length === 1) {
        return "<span class=\"" + PROGRESS_LINK_CLASS_NAME + "\" data-id=\"" + transactions[0] + "\">&#8987;</span>";
      }

      return "<a class=\"" + PROGRESS_POPUP_CLASS_NAME + "\" data-line=\"" + line + "\" href=\"javascript:void(0)\">" + this.translate("show_history_list") + "</a>";
    };

    return DashboardInProgressTabBuilder;
  }();

  _exports.DashboardInProgressTabBuilder = DashboardInProgressTabBuilder;
});