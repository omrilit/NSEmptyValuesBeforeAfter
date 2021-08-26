/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope Public
 */

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

define(["exports", "../../vendor/tslib", "../common/Maybe", "../matching/expectations", "../scheduler/index", "../../vendor/lodash-4.17.4", "./DashboardHistoryTabBuilder", "./DashboardInProgressTabBuilder", "./FilterParameters"], function (_exports, _tslib, _Maybe, _expectations, _index, _, _DashboardHistoryTabBuilder, _DashboardInProgressTabBuilder, _FilterParameters) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.DashboardClient = void 0;
  _ = _interopRequireWildcard(_);

  function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

  var DashboardClient =
  /** @class */
  function () {
    function DashboardClient(dashboardDOM, dashboardRecord, dialogs, findTransactionNames, resolveDashboard, translate) {
      this.dashboardDOM = dashboardDOM;
      this.dashboardRecord = dashboardRecord;
      this.dialogs = dialogs;
      this.findTransactionNames = findTransactionNames;
      this.resolveDashboard = resolveDashboard;
      this.translate = translate;
    }

    DashboardClient.prototype.pageInit = function (record) {
      return (0, _tslib.__awaiter)(this, void 0, void 0, function () {
        var getSublistField, line, historyData, inProgressData, visibleTransactions, names, err_1;

        var _this = this;

        return (0, _tslib.__generator)(this, function (_a) {
          switch (_a.label) {
            case 0:
              getSublistField = function getSublistField(fieldId, line) {
                return record.getSublistField({
                  sublistId: "custpage_sublist_results"
                  /* RESULTS */
                  ,
                  fieldId: fieldId,
                  line: line
                });
              };

              for (line = 0; line < record.getLineCount({
                sublistId: "custpage_sublist_results"
                /* RESULTS */

              }); line++) {
                if (record.getSublistValue({
                  sublistId: "custpage_sublist_results"
                  /* RESULTS */
                  ,
                  fieldId: "custpage_results_matching_reference"
                  /* MATCHING_REFERENCE */
                  ,
                  line: line
                }) === this.translate(_index.JobStatus.PROCESSING)) {
                  getSublistField("custpage_results_matching_reference"
                  /* MATCHING_REFERENCE */
                  , line).isDisabled = true;
                  getSublistField("custpage_results_selected"
                  /* SELECTED */
                  , line).isDisabled = true;
                }
              }

              historyData = this.dashboardRecord.getHistoryData();
              inProgressData = this.dashboardRecord.getInProgressData();
              this.dashboardDOM.initiateTransactionPopups("custpage_sublist_history_form", _DashboardHistoryTabBuilder.HISTORY_POPUP_CLASS_NAME, function (line) {
                _this.findTransactionNames(historyData[line]).then(function (names) {
                  return _this.dialogs.showTransactionList(_this.translate("title_history"), names);
                })["catch"](function (error) {
                  return console.error(error);
                });
              });
              this.dashboardDOM.initiateTransactionPopups("custpage_sublist_in_progress_form", _DashboardInProgressTabBuilder.PROGRESS_POPUP_CLASS_NAME, function (line) {
                _this.findTransactionNames(inProgressData[line]).then(function (names) {
                  return _this.dialogs.showTransactionList(_this.translate("title_in_progress"), names);
                })["catch"](function (error) {
                  return console.error(error);
                });
              });
              visibleTransactions = _.uniq(_.flatten((0, _tslib.__spreadArrays)(_.values(historyData), _.values(inProgressData)).filter(function (x) {
                return x.length === 1;
              })));

              if (visibleTransactions.length === 0) {
                return [2
                /*return*/
                ];
              }

              _a.label = 1;

            case 1:
              _a.trys.push([1, 3,, 5]);

              return [4
              /*yield*/
              , this.findTransactionNames(visibleTransactions)];

            case 2:
              names = _a.sent();
              this.dashboardDOM.replaceTransactionLinks(names, _DashboardHistoryTabBuilder.HISTORY_LINK_CLASS_NAME);
              this.dashboardDOM.replaceTransactionLinks(names, _DashboardInProgressTabBuilder.PROGRESS_LINK_CLASS_NAME);
              return [3
              /*break*/
              , 5];

            case 3:
              err_1 = _a.sent();
              return [4
              /*yield*/
              , this.dialogs.alertError("<textarea disabled>" + JSON.stringify(err_1) + "</textarea>")];

            case 4:
              _a.sent();

              return [3
              /*break*/
              , 5];

            case 5:
              return [2
              /*return*/
              ];
          }
        });
      });
    };

    DashboardClient.prototype.refresh = function () {
      this.dashboardRecord.setMandatoryFields(false);
      this.submit("search"
      /* SEARCH */
      , {});
    };

    DashboardClient.prototype.markAll = function () {
      this.dashboardRecord.setSelected(true);
    };

    DashboardClient.prototype.unMarkAll = function () {
      this.dashboardRecord.setSelected(false);
    };

    DashboardClient.prototype.fieldChanged = function (context) {
      return (0, _tslib.__awaiter)(this, void 0, void 0, function () {
        var filterParameters, parameters;
        return (0, _tslib.__generator)(this, function (_a) {
          filterParameters = this.dashboardRecord.getFilterParameters();

          switch (context.fieldId) {
            case "custpage_subsidiary"
            /* SUBSIDIARY */
            :
              {
                parameters = new _FilterParameters.FilterParameters();
                this.dashboardDOM.reload(parameters.set({
                  pageNumber: 1,
                  pageSize: filterParameters.pageSize,
                  subsidiary: filterParameters.subsidiary
                }));
                return [2
                /*return*/
                ];
              }

            case "custpage_page_number"
            /* PAGE_NUMBER */
            :
              {
                this.dashboardDOM.reload(filterParameters);
                return [2
                /*return*/
                ];
              }

            case "custpage_results_per_page"
            /* RESULTS_PER_PAGE */
            :
              {
                this.dashboardDOM.reload(filterParameters.set({
                  pageNumber: 1
                }));
                return [2
                /*return*/
                ];
              }

            case "custpage_results_selected"
            /* SELECTED */
            :
              this.dashboardRecord.updateSummary();
              return [2
              /*return*/
              ];

            case "custpage_results_matching_reference"
            /* MATCHING_REFERENCE */
            :
              return [2
              /*return*/
              , this.handleReferenceChange(context)];

            case "custpage_account"
            /* ACCOUNT */
            :
              {
                return [2
                /*return*/
                , this.dashboardRecord.updateAccountFilter()];
              }

            case "custpage_vendor"
            /* VENDOR */
            :
            case "custpage_employee"
            /* EMPLOYEE */
            :
            case "custpage_customer"
            /* CUSTOMER */
            :
              {
                return [2
                /*return*/
                , this.dashboardRecord.updateEntityFilters(context.fieldId)];
              }
          }

          return [2
          /*return*/
          ];
        });
      });
    };

    DashboardClient.prototype.handleReferenceChange = function (context) {
      var _a;

      return (0, _tslib.__awaiter)(this, void 0, void 0, function () {
        var agree, data, action;

        var _this = this;

        return (0, _tslib.__generator)(this, function (_b) {
          switch (_b.label) {
            case 0:
              return [4
              /*yield*/
              , this.dialogs.showFirstReferenceDialog()];

            case 1:
              agree = _b.sent();

              if (!agree) {
                return [2
                /*return*/
                ];
              }

              return [4
              /*yield*/
              , this.getReferenceSingleRequest(context)];

            case 2:
              data = _b.sent();

              if (!((_a = data.entries[0]) === null || _a === void 0 ? void 0 : _a.matching)) {
                return [2
                /*return*/
                , this.submit("ref_single"
                /* CHANGE_REFERENCE_ON_SINGLE_TRANSACTION */
                , data)];
              }

              return [4
              /*yield*/
              , this.dialogs.showSecondReferenceDialog()];

            case 3:
              action = _b.sent();

              switch (action) {
                case "ref_unmatch"
                /* CHANGE_REFERENCE_AND_UNMATCH_TRANSACTION */
                :
                  return [2
                  /*return*/
                  , this.getReferenceUnmatchingRequest(context).then(function (x) {
                    return _this.submit(action, x);
                  })];

                case "ref_all"
                /* CHANGE_REFERENCE_ON_ALL_MATCHED_TRANSACTIONS */
                :
                  return [2
                  /*return*/
                  , this.getReferenceGroupRequest(context).then(function (x) {
                    return _this.submit(action, x);
                  })];

                case "ref_single"
                /* CHANGE_REFERENCE_ON_SINGLE_TRANSACTION */
                :
                  return [2
                  /*return*/
                  , this.getReferenceSingleRequest(context).then(function (x) {
                    return _this.submit(action, x);
                  })];
              }

              return [2
              /*return*/
              ];
          }
        });
      });
    };

    DashboardClient.prototype.goToNextPage = function () {
      var filterParameters = this.dashboardRecord.getFilterParameters();
      this.dashboardDOM.reload(filterParameters.set({
        pageNumber: Math.max(1, filterParameters.pageNumber + 1)
      }));
    };

    DashboardClient.prototype.goToPreviousPage = function () {
      var filterParameters = this.dashboardRecord.getFilterParameters();
      this.dashboardDOM.reload(filterParameters.set({
        pageNumber: Math.max(1, filterParameters.pageNumber - 1)
      }));
    };

    DashboardClient.prototype.handleExportCsv = function () {
      var url = this.resolveDashboard(this.dashboardRecord.getFilterParameters().set({
        action: (0, _Maybe.maybe)("exportCSV"
        /* EXPORT_CSV */
        )
      }));
      this.dashboardDOM.download(url);
    };

    DashboardClient.prototype.match = function () {
      return (0, _tslib.__awaiter)(this, void 0, void 0, function () {
        var entries, codeId, newTransaction, codeCnt, _i, entries_1, entry, agree, agree;

        return (0, _tslib.__generator)(this, function (_a) {
          switch (_a.label) {
            case 0:
              entries = this.dashboardRecord.getSelectedEntries();

              if (entries.length === 0) {
                return [2
                /*return*/
                , this.dialogs.alertNotSelectedTransaction()];
              }

              newTransaction = false;
              codeCnt = 0;
              _i = 0, entries_1 = entries;
              _a.label = 1;

            case 1:
              if (!(_i < entries_1.length)) return [3
              /*break*/
              , 7];
              entry = entries_1[_i];
              if (!!entry.matching) return [3
              /*break*/
              , 2];
              newTransaction = true;
              return [3
              /*break*/
              , 6];

            case 2:
              if (!!codeId) return [3
              /*break*/
              , 3]; // this is a first non-empty matching code

              codeId = entry.matching;
              codeCnt++;
              return [3
              /*break*/
              , 6];

            case 3:
              if (!(entry.matching !== codeId)) return [3
              /*break*/
              , 5];
              return [4
              /*yield*/
              , this.dialogs.showConfirmationDialog(this.translate("message_003"))];

            case 4:
              agree = _a.sent();

              if (agree) {
                return [2
                /*return*/
                , this.submitMatching(entries, true)];
              }

              return [2
              /*return*/
              ];

            case 5:
              // another occurrence of the same matching code
              codeCnt++;
              _a.label = 6;

            case 6:
              _i++;
              return [3
              /*break*/
              , 1];

            case 7:
              if (!codeId) {
                // all selected transaction are new
                return [2
                /*return*/
                , this.submitMatching(entries)];
              }

              if (!(codeCnt > 0 && newTransaction)) return [3
              /*break*/
              , 9];
              return [4
              /*yield*/
              , this.dialogs.showMatchingMethodDialog()];

            case 8:
              switch (_a.sent()) {
                case "cancel":
                  return [2
                  /*return*/
                  ];

                case "forceCode":
                  return [2
                  /*return*/
                  , this.submitMatching(entries, true)];

                case "toGroup":
                  return [2
                  /*return*/
                  , this.submitMatching(entries)];
              }

              return [3
              /*break*/
              , 12];

            case 9:
              if (!!newTransaction) return [3
              /*break*/
              , 11];
              return [4
              /*yield*/
              , this.dialogs.showConfirmationDialog(this.translate("message_004"))];

            case 10:
              agree = _a.sent();

              if (agree) {
                return [2
                /*return*/
                , this.submitMatching(entries, true)];
              }

              return [3
              /*break*/
              , 12];

            case 11:
              return [2
              /*return*/
              , this.submitMatching(entries)];

            case 12:
              return [2
              /*return*/
              ];
          }
        });
      });
    };

    DashboardClient.prototype.unmatch = function () {
      return (0, _tslib.__awaiter)(this, void 0, void 0, function () {
        var entries;
        return (0, _tslib.__generator)(this, function (_a) {
          entries = this.dashboardRecord.getSelectedEntries();

          if (entries.length === 0) {
            return [2
            /*return*/
            , this.dialogs.alertNotSelectedTransaction()];
          }

          this.dashboardDOM.setWindowChanged();
          this.submit("unmatch"
          /* UNMATCH */
          , (0, _expectations.expectUnmatchingRequest)({
            account: this.dashboardRecord.getAccount(),
            entries: entries
          }));
          return [2
          /*return*/
          ];
        });
      });
    };

    DashboardClient.prototype.goToChecklist = function () {
      var filterParameters = this.dashboardRecord.getFilterParameters();
      this.dashboardDOM.goToChecklist(filterParameters.set({
        action: (0, _Maybe.nothing)()
      }));
    };

    DashboardClient.prototype.getReferenceGroupRequest = function (context) {
      return (0, _tslib.__awaiter)(this, void 0, void 0, function () {
        var entry;
        return (0, _tslib.__generator)(this, function (_a) {
          entry = this.dashboardRecord.getEntry(context.line);
          return [2
          /*return*/
          , (0, _expectations.expectReferenceGroupRequest)({
            account: this.dashboardRecord.getAccount(),
            entries: [entry],
            reference: entry.reference
          })];
        });
      });
    };

    DashboardClient.prototype.getReferenceSingleRequest = function (context) {
      return (0, _tslib.__awaiter)(this, void 0, void 0, function () {
        var entry;
        return (0, _tslib.__generator)(this, function (_a) {
          entry = this.dashboardRecord.getEntry(context.line);
          return [2
          /*return*/
          , (0, _expectations.expectReferenceSingleRequest)({
            account: this.dashboardRecord.getAccount(),
            entries: [entry],
            reference: entry.reference
          })];
        });
      });
    };

    DashboardClient.prototype.getReferenceUnmatchingRequest = function (context) {
      return (0, _tslib.__awaiter)(this, void 0, void 0, function () {
        var entry;
        return (0, _tslib.__generator)(this, function (_a) {
          entry = this.dashboardRecord.getEntry(context.line);
          return [2
          /*return*/
          , (0, _expectations.expectReferenceUnmatchingRequest)({
            account: this.dashboardRecord.getAccount(),
            entries: [entry],
            reference: entry.reference
          })];
        });
      });
    };

    DashboardClient.prototype.submit = function (action, data) {
      this.dashboardRecord.setAction(action, data);
      this.dashboardDOM.submit();
    };

    DashboardClient.prototype.submitMatching = function (entries, forceNewCode) {
      return (0, _tslib.__awaiter)(this, void 0, void 0, function () {
        return (0, _tslib.__generator)(this, function (_a) {
          this.submit("match"
          /* MATCH */
          , (0, _expectations.expectMatchingRequest)({
            account: this.dashboardRecord.getAccount(),
            accountingBook: this.dashboardRecord.getAccountingBook(),
            entries: entries,
            forceNewCode: forceNewCode,
            subsidiary: this.dashboardRecord.getSubsidiary()
          }));
          return [2
          /*return*/
          ];
        });
      });
    };

    return DashboardClient;
  }();

  _exports.DashboardClient = DashboardClient;
});