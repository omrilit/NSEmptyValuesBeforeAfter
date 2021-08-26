/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib", "../common/fn", "../common/MatchingStatus", "../common/Maybe", "../scheduler/index", "../../vendor/lodash-4.17.4"], function (_exports, _tslib, _fn, _MatchingStatus, _Maybe, _index, _lodash) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.convertHistoryRow = convertHistoryRow;
  _exports.DashboardHistoryTabBuilder = _exports.HISTORY_POPUP_CLASS_NAME = _exports.HISTORY_LINK_CLASS_NAME = _exports.HistoryColumn = void 0;
  var HistoryColumn = {
    ACCOUNT: "custpage_history_account",
    ACCOUNTING_BOOK: "custpage_history_accounting_book",
    ACTION: "custpage_history_action",
    FORMER_MATCHING_CODE: "custpage_history_former_matching_code",
    FORMER_MATCHING_STATUS: "custpage_history_former_matching_status",
    MATCHING_DATE: "custpage_history_matching_date",
    NEW_MATCHING_CODE: "custpage_history_new_matching_code",
    NEW_MATCHING_STATUS: "custpage_history_new_matching_status",
    SUBSIDIARY: "custpage_history_subsidiary",
    TRANSACTIONS: "custpage_history_transaction",
    USER: "custpage_history_user"
  };
  _exports.HistoryColumn = HistoryColumn;
  var HISTORY_LINK_CLASS_NAME = "glm-history-link";
  _exports.HISTORY_LINK_CLASS_NAME = HISTORY_LINK_CLASS_NAME;
  var HISTORY_POPUP_CLASS_NAME = "glm-history-popup";
  _exports.HISTORY_POPUP_CLASS_NAME = HISTORY_POPUP_CLASS_NAME;

  var beforeEquals = function beforeEquals(x, y) {
    return y && y.before === x;
  };

  var afterEquals = function afterEquals(x, y) {
    return y && y.after === x;
  };

  var extractHistory = function extractHistory(lens, predicate) {
    return function (data) {
      return (0, _lodash.uniq)(data.map(lens).filter(predicate));
    };
  };

  var getOldCodes = extractHistory(function (_a) {
    var code = _a.code;
    return code === null || code === void 0 ? void 0 : code.before;
  }, _lodash.isString);
  var getNewCodes = extractHistory(function (_a) {
    var code = _a.code;
    return code === null || code === void 0 ? void 0 : code.after;
  }, _lodash.isString);
  var getOldStatuses = extractHistory(function (_a) {
    var status = _a.status;
    return status === null || status === void 0 ? void 0 : status.before;
  }, _MatchingStatus.isMatchingStatus);
  var getNewStatuses = extractHistory(function (_a) {
    var status = _a.status;
    return status === null || status === void 0 ? void 0 : status.after;
  }, _MatchingStatus.isMatchingStatus);
  var getOldMatchings = extractHistory(function (_a) {
    var matching = _a.matching;
    return matching === null || matching === void 0 ? void 0 : matching.before;
  }, _fn.isInternalId);
  var getNewMatchings = extractHistory(function (_a) {
    var matching = _a.matching;
    return matching === null || matching === void 0 ? void 0 : matching.after;
  }, _fn.isInternalId);

  var getTransactions = function getTransactions(history) {
    return (0, _lodash.uniq)((0, _lodash.flatten)(history.map(function (x) {
      return x.transactions.map(function (y) {
        return y.transaction;
      });
    })));
  };

  var getSortedIds = function getSortedIds(row) {
    return (0, _lodash.uniq)(row.transactions).sort();
  };

  var getSortedNewCodes = function getSortedNewCodes(row) {
    return (0, _lodash.uniq)(row.newCodes).sort();
  };

  var getSortedOldCodes = function getSortedOldCodes(row) {
    return (0, _lodash.uniq)(row.oldCodes).sort();
  };

  function getJoinComparator(left) {
    if (left.action !== _index.JobType.MATCHING) {
      return function () {
        return false;
      };
    }

    var leftIds = getSortedIds(left);
    var leftCodes = getSortedNewCodes(left);
    return function (right) {
      return right.action === _index.JobType.RECALCULATION && (0, _lodash.isEqual)(leftIds, getSortedIds(right)) && (0, _lodash.isEqual)(leftCodes, getSortedOldCodes(right));
    };
  }

  var findIndexes = function findIndexes(xs, predicate) {
    return Object.keys((0, _lodash.pickBy)(xs, predicate)).map(Number);
  };

  function isInitialMatchingRow(row) {
    return row.action === _index.JobType.MATCHING && row.oldCodes.length === 0 && row.newCodes.length > 0;
  }

  function findIndexPairs(rows) {
    return (0, _lodash.flatten)(findIndexes(rows, isInitialMatchingRow).map(function (matching) {
      return findIndexes(rows, getJoinComparator(rows[matching])).map(function (recalculation) {
        return {
          matching: matching,
          recalculation: recalculation
        };
      });
    }));
  }

  function joinMatchingWithRecalculation(rows) {
    var indexes = findIndexPairs(rows);
    var rowsWithUpdatedCodes = rows.map(function (row, index) {
      var recalculations = indexes.filter(function (x) {
        return x.matching === index;
      }).map(function (x) {
        return rows[x.recalculation];
      });

      if (recalculations.length > 0) {
        return (0, _tslib.__assign)((0, _tslib.__assign)({}, row), {
          action: _index.JobType.MATCHING,
          newCodes: recalculations[0].newCodes,
          newStatuses: recalculations[0].newStatuses
        });
      }

      return row;
    }); // removes every recalculation that was joined with a matching

    return rowsWithUpdatedCodes.filter(function (_, index) {
      return !(0, _lodash.some)(indexes, function (x) {
        return x.recalculation === index;
      });
    });
  }

  function convertHistoryRow(row) {
    var getSublistRow = function getSublistRow(action, data) {
      var _a, _b, _c, _d;

      return {
        account: row.account,
        accountingBook: (0, _Maybe.maybe)((_b = (_a = row.history) === null || _a === void 0 ? void 0 : _a[0].transactions) === null || _b === void 0 ? void 0 : _b[0].accountingBook),
        action: action,
        matchingDate: row.job.matchingDate,
        newCodes: getNewCodes(data),
        newStatuses: getNewStatuses(data),
        oldCodes: getOldCodes(data),
        oldStatuses: getOldStatuses(data),
        subsidiary: (0, _Maybe.maybe)((_d = (_c = row.history) === null || _c === void 0 ? void 0 : _c[0].transactions) === null || _d === void 0 ? void 0 : _d[0].subsidiary),
        transactions: getTransactions(data),
        user: row.user
      };
    };

    var sublistRows = [];
    var actions = (0, _lodash.uniq)(row.history.map(function (x) {
      return x.comment;
    })).filter(_lodash.isString);

    var _loop_1 = function _loop_1(action) {
      var commandGroup = row.history.filter(function (x) {
        return x.comment === action;
      });

      if (action === _index.JobType.MATCHING) {
        var _loop_2 = function _loop_2(matching) {
          var hasEqualNewMatching = function hasEqualNewMatching(x) {
            return afterEquals(matching, x.matching);
          };

          sublistRows.push(getSublistRow(action, commandGroup.filter(hasEqualNewMatching)));
        };

        for (var _i = 0, _a = getNewMatchings(commandGroup); _i < _a.length; _i++) {
          var matching = _a[_i];

          _loop_2(matching);
        }
      } else if (action === _index.JobType.UNMATCHING) {
        var _loop_3 = function _loop_3(matching) {
          var hasEqualOldMatching = function hasEqualOldMatching(x) {
            return beforeEquals(matching, x.matching);
          };

          sublistRows.push(getSublistRow(action, commandGroup.filter(hasEqualOldMatching)));
        };

        for (var _b = 0, _c = getOldMatchings(commandGroup); _b < _c.length; _b++) {
          var matching = _c[_b];

          _loop_3(matching);
        }
      } else if (action === _index.JobType.RECALCULATION) {
        var _loop_4 = function _loop_4(code) {
          var hasEqualOldCode = function hasEqualOldCode(x) {
            return beforeEquals(code, x.code);
          };

          sublistRows.push(getSublistRow(action, commandGroup.filter(hasEqualOldCode)));
        };

        for (var _d = 0, _e = getOldCodes(commandGroup); _d < _e.length; _d++) {
          var code = _e[_d];

          _loop_4(code);
        }
      }
    };

    for (var _i = 0, actions_1 = actions; _i < actions_1.length; _i++) {
      var action = actions_1[_i];

      _loop_1(action);
    }

    return joinMatchingWithRecalculation(sublistRows);
  }

  var DashboardHistoryTabBuilder =
  /** @class */
  function () {
    function DashboardHistoryTabBuilder(format, ui, url, translate, runtime) {
      this.format = format;
      this.ui = ui;
      this.url = url;
      this.translate = translate;
      this.runtime = runtime;
      this.transactions = {};
    }

    DashboardHistoryTabBuilder.prototype.build = function (rows, nameCollection, form) {
      var _this = this;

      form.addTab({
        id: "custpage_tab_history",
        label: this.translate("sublist_history_title")
      });
      var sublist = form.addSublist({
        id: "custpage_sublist_history",
        label: this.translate("sublist_history_title"),
        tab: "custpage_tab_history",
        type: this.ui.SublistType.LIST
      });
      sublist.addButton({
        functionName: "refresh",
        id: "custpage_refresh_history"
        /* REFRESH_HISTORY */
        ,
        label: this.translate("refresh_button")
      });
      sublist.addField({
        id: HistoryColumn.ACCOUNT,
        label: this.translate("edit_group_account"),
        type: this.ui.FieldType.TEXT
      });
      sublist.addField({
        id: HistoryColumn.TRANSACTIONS,
        label: this.translate("transaction_column"),
        type: this.ui.FieldType.TEXT
      });
      sublist.addField({
        id: HistoryColumn.ACTION,
        label: this.translate("action_column"),
        type: this.ui.FieldType.TEXT
      });

      if (this.runtime.isMultiBookEnabled()) {
        sublist.addField({
          id: HistoryColumn.ACCOUNTING_BOOK,
          label: this.translate("accounting_book_column"),
          type: this.ui.FieldType.TEXT
        });
      }

      if (this.runtime.isOneWorld()) {
        sublist.addField({
          id: HistoryColumn.SUBSIDIARY,
          label: this.translate("subsidiary_column"),
          type: this.ui.FieldType.TEXT
        });
      }

      sublist.addField({
        id: HistoryColumn.FORMER_MATCHING_CODE,
        label: this.translate("matching_code_column") + " " + this.translate("edit_former"),
        type: this.ui.FieldType.TEXT
      });
      sublist.addField({
        id: HistoryColumn.NEW_MATCHING_CODE,
        label: this.translate("matching_code_column") + " " + this.translate("edit_new"),
        type: this.ui.FieldType.TEXT
      });
      sublist.addField({
        id: HistoryColumn.FORMER_MATCHING_STATUS,
        label: this.translate("matching_status_column") + " " + this.translate("edit_former"),
        type: this.ui.FieldType.TEXT
      });
      sublist.addField({
        id: HistoryColumn.NEW_MATCHING_STATUS,
        label: this.translate("matching_status_column") + " " + this.translate("edit_new"),
        type: this.ui.FieldType.TEXT
      });
      sublist.addField({
        id: HistoryColumn.MATCHING_DATE,
        label: this.translate("matching_date_column"),
        type: this.ui.FieldType.DATETIMETZ
      });
      sublist.addField({
        id: HistoryColumn.USER,
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

        row.account.bind(function (id) {
          return nameCollection.account(id);
        })["do"]({
          just: setSublistValue(HistoryColumn.ACCOUNT)
        });
        row.accountingBook.bind(function (id) {
          return nameCollection.accountingBook(id);
        })["do"]({
          just: setSublistValue(HistoryColumn.ACCOUNTING_BOOK)
        });
        row.subsidiary.bind(function (id) {
          return nameCollection.subsidiary(id);
        })["do"]({
          just: setSublistValue(HistoryColumn.SUBSIDIARY)
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
          just: setSublistValue(HistoryColumn.USER)
        });
        setSublistValue(HistoryColumn.ACTION)(this.translate(row.action));
        setSublistValue(HistoryColumn.FORMER_MATCHING_CODE)(row.oldCodes.join(", "));
        setSublistValue(HistoryColumn.FORMER_MATCHING_STATUS)(row.oldStatuses.map(function (x) {
          return _this.translate(x);
        }).join(", "));
        setSublistValue(HistoryColumn.MATCHING_DATE)(this.format.formatDateTime(row.matchingDate));
        setSublistValue(HistoryColumn.NEW_MATCHING_CODE)(row.newCodes.join(", "));
        setSublistValue(HistoryColumn.NEW_MATCHING_STATUS)(row.newStatuses.map(function (x) {
          return _this.translate(x);
        }).join(", "));
        setSublistValue(HistoryColumn.TRANSACTIONS)(this.getGroupOfLinks(row.transactions, line));
        line++;
      }

      this.hide(form.addField({
        id: "custpage_history_data"
        /* HISTORY_DATA */
        ,
        label: "custpage_history_data"
        /* HISTORY_DATA */
        ,
        type: this.ui.FieldType.INLINEHTML
      })).defaultValue = JSON.stringify(this.transactions);
    };

    DashboardHistoryTabBuilder.prototype.hide = function (field) {
      return field.updateDisplayType({
        displayType: this.ui.FieldDisplayType.HIDDEN
      });
    };

    DashboardHistoryTabBuilder.prototype.getGroupOfLinks = function (transactions, line) {
      if (transactions.length === 0) {
        return "";
      }

      this.transactions[line] = transactions;

      if (transactions.length === 1) {
        return "<span class=\"" + HISTORY_LINK_CLASS_NAME + "\" data-id=\"" + transactions[0] + "\">&#8987;</span>";
      }

      return "<a class=\"" + HISTORY_POPUP_CLASS_NAME + "\" data-line=\"" + line + "\" href=\"javascript:void(0)\">" + this.translate("show_history_list") + "</a>";
    };

    return DashboardHistoryTabBuilder;
  }();

  _exports.DashboardHistoryTabBuilder = DashboardHistoryTabBuilder;
});