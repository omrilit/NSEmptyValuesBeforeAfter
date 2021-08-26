/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib", "../common/expectations", "../common/fn", "../common/Maybe", "../dashboard/permissions", "../../vendor/lodash-4.17.4", "./CSVReferenceResolver", "./types", "./utils"], function (_exports, _tslib, _expectations, _fn, _Maybe, _permissions, _lodash, _CSVReferenceResolver, _types, _utils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.handleBeforeLoadConstructor = handleBeforeLoadConstructor;
  _exports.recalculateFromHistoryConstructor = recalculateFromHistoryConstructor;
  _exports.updateTranLinesFromDifferenceConstructor = updateTranLinesFromDifferenceConstructor;
  _exports.filterLinesForReference = filterLinesForReference;
  _exports.TransactionEventHandler = void 0;
  var createTransactionSessionId = "create_type";

  var isEdit = function isEdit(context) {
    return context.type === context.UserEventType.EDIT || context.type === context.UserEventType.XEDIT;
  };

  var isDelete = function isDelete(context) {
    return context.type === context.UserEventType.DELETE;
  };

  var isView = function isView(context) {
    return context.type === context.UserEventType.VIEW;
  };

  var isCreate = function isCreate(context) {
    return context.type === context.UserEventType.CREATE;
  };

  var isMatched = function isMatched(_a) {
    var matching = _a.matching;
    return matching.test(function (_a) {
      var id = _a.id;
      return (0, _fn.isInternalId)(id);
    });
  };

  var getId = function getId(context) {
    return (0, _expectations.expectInternalId)(context.newRecord.id);
  };

  var doesAccountChanged = function doesAccountChanged(a, b) {
    return a.account !== b.account;
  };

  var doesAmountChanged = function doesAmountChanged(a, b) {
    return a.credit !== b.credit || a.debit !== b.debit;
  };

  var doesSubsidiaryChanged = function doesSubsidiaryChanged(a, b) {
    return a.subsidiary !== b.subsidiary;
  };

  var isCollinear = function isCollinear(a, b) {
    return (0, _fn.eq)(a.transaction, b.transaction) && (0, _fn.eq)(a.line, b.line);
  };

  var isMatchingSame = function isMatchingSame(a, b) {
    return (0, _Maybe.areJustEqual)(a.matching.fmap(function (_a) {
      var id = _a.id;
      return id;
    }), b.matching.fmap(function (_a) {
      var id = _a.id;
      return id;
    }));
  };

  var isOneFromResultMatched = function isOneFromResultMatched(results) {
    return (0, _lodash.some)(results, isMatched);
  };

  var isRemovable = function isRemovable(tranLine) {
    return (0, _fn.isInternalId)(tranLine.id) && (isMatched(tranLine) || tranLine.reference !== "");
  };

  var haveCollinearTranLine = function haveCollinearTranLine(xs, ys) {
    return (0, _lodash.some)(xs, function (x) {
      return (0, _lodash.some)(ys, function (y) {
        return isMatchingSame(x, y);
      });
    });
  };

  var calculateBalances = function calculateBalances(tranLines) {
    return (0, _utils.getMatchingIds)(tranLines).reduce(function (a, matchingId) {
      var _a;

      return (0, _tslib.__assign)((0, _tslib.__assign)({}, a), (_a = {}, _a[matchingId] = (0, _utils.totalTranLines)(tranLines.filter((0, _utils.isMatchingEqual)(matchingId))).balance, _a));
    }, {});
  };

  var commentWith = function commentWith(comment) {
    return function (history) {
      return (0, _tslib.__assign)((0, _tslib.__assign)({}, history), {
        comment: comment
      });
    };
  };

  var isChanged = function isChanged(x) {
    return x !== undefined && !(0, _fn.eq)(x.after, x.before) && (x.after !== undefined || x.before !== undefined);
  };

  function fillUpOldBalances(history, balancesBeforeSubmit) {
    return history.map(function (h) {
      var matchingIds = (0, _utils.getMatchingIds)(h.transactions);

      if (matchingIds.length > 0 && matchingIds[0] in balancesBeforeSubmit) {
        return (0, _tslib.__assign)((0, _tslib.__assign)({}, h), {
          balance: (0, _tslib.__assign)((0, _tslib.__assign)({}, h.balance), {
            before: balancesBeforeSubmit[matchingIds[0]]
          })
        });
      }

      return h;
    });
  }

  var isReferenceChanged = function isReferenceChanged(reference) {
    return (0, _Maybe.isJust)((0, _Maybe.maybe)(reference));
  };

  function joinHistory(updateHistory, recalculationData) {
    return updateHistory.map(function (u) {
      for (var _i = 0, recalculationData_1 = recalculationData; _i < recalculationData_1.length; _i++) {
        var r = recalculationData_1[_i];

        if (haveCollinearTranLine(u.transactions, r.transactions)) {
          return (0, _lodash.merge)({}, u, {
            balance: r.balance,
            code: r.code,
            status: r.status
          });
        }
      }

      return u;
    });
  }

  function handleBeforeLoadConstructor(logError, messageSession, translate, messageType, warningMessageRenderer, tranLineSearch, isAnyLineMatchedSession, referenceSession) {
    return function (context) {
      try {
        if (isView(context)) {
          var message = warningMessageRenderer(messageSession.getAndClear(getId(context)));

          if (referenceSession.getAndClear(getReferenceSessionId(context))) {
            context.form.addPageInitMessage({
              message: translate("error_reference_permission_message"),
              title: translate("transaction_edit_title"),
              type: messageType.INFORMATION
            });
          }

          if (message) {
            context.form.addPageInitMessage({
              message: message,
              title: translate("transaction_edit_title"),
              type: messageType.INFORMATION
            });
          }
        } else if (isEdit(context)) {
          var transactionId = getId(context);
          var tranLines = tranLineSearch.findByTransactionIds([transactionId]);
          var isAnyLineMatched = isOneFromResultMatched(tranLines);
          isAnyLineMatchedSession.set(transactionId, isAnyLineMatched);

          if (isAnyLineMatched) {
            context.form.addPageInitMessage({
              message: translate("transaction_before_edit_warning"),
              title: translate("transaction_before_edit_title"),
              type: messageType.WARNING
            });
          }
        }
      } catch (e) {
        logError({
          details: e,
          title: "tran_user_event"
        });
      }
    };
  }

  function recalculateFromHistoryConstructor(tranLineSearch, getCurrentDateTime, getCurrentUser, matchingRepository) {
    return function (history) {
      var creditHasChanged = function creditHasChanged(_a) {
        var credit = _a.credit;
        return credit && !(0, _fn.eq)(credit.before, credit.after);
      };

      var debitHasChanged = function debitHasChanged(_a) {
        var debit = _a.debit;
        return debit && !(0, _fn.eq)(debit.before, debit.after);
      };

      var matchingHasChanged = function matchingHasChanged(_a) {
        var matching = _a.matching;
        return matching && !(0, _fn.eq)(matching.before, matching.after);
      };

      var flatHistory = (0, _lodash.flatMap)(history, _utils.flattenHistory);
      var idsFromMatchingChange = (0, _lodash.flatMap)(flatHistory.filter(matchingHasChanged), function (h) {
        return h.matching && [h.matching.after, h.matching.before];
      });
      var idsFromAmountChange = (0, _lodash.flatMap)(flatHistory.filter(function (h) {
        return creditHasChanged(h) || debitHasChanged(h);
      }), function (h) {
        return h.transactions[0].matching.fmap(function (x) {
          return x.id;
        }).valueOrUndefined();
      });
      var matchingIds = (0, _lodash.uniq)((0, _lodash.compact)((0, _tslib.__spreadArrays)(idsFromMatchingChange, idsFromAmountChange)));
      var tranLines = tranLineSearch.findByMatchingIds(matchingIds);
      var date = getCurrentDateTime();
      var user = getCurrentUser();
      return matchingRepository.recalculate(tranLines, date, user, true);
    };
  }

  function updateTranLinesFromDifferenceConstructor(tranLineRepository) {
    return function (linesBeforeSubmit, linesAfterSubmit) {
      var history = [];

      for (var _i = 0, linesBeforeSubmit_1 = linesBeforeSubmit; _i < linesBeforeSubmit_1.length; _i++) {
        var lineBefore = linesBeforeSubmit_1[_i];
        var isExistingLine = false;

        for (var _a = 0, linesAfterSubmit_1 = linesAfterSubmit; _a < linesAfterSubmit_1.length; _a++) {
          var lineAfter = linesAfterSubmit_1[_a];

          if (isCollinear(lineBefore, lineAfter)) {
            if (isMatched(lineAfter) && doesAccountChanged(lineBefore, lineAfter)) {
              history.push.apply(history, tranLineRepository.unMatch(lineAfter).map(commentWith(_types.Reason.ACCOUNT_CHANGE)));
            } else if (isMatched(lineAfter) && doesSubsidiaryChanged(lineBefore, lineAfter)) {
              history.push.apply(history, tranLineRepository.unMatch(lineAfter).map(commentWith(_types.Reason.SUBSIDIARY_CHANGE)));
            } else if (isMatched(lineAfter) && doesAmountChanged(lineBefore, lineAfter)) {
              history.push.apply(history, tranLineRepository.save(lineAfter).map(commentWith(_types.Reason.AMOUNT_CHANGE)));
            } else if (lineAfter.id) {
              history.push.apply(history, tranLineRepository.save(lineAfter).map(commentWith(_types.Reason.NONE)));
            }

            isExistingLine = true;
          }
        }

        if (!isExistingLine && isRemovable(lineBefore)) {
          history.push.apply(history, tranLineRepository.remove(lineBefore).map(commentWith(_types.Reason.DELETED)));
        }
      }

      return history;
    };
  }

  function getReferenceSessionId(context) {
    return isCreate(context) ? createTransactionSessionId : getId(context);
  }

  function getPermissions(context) {
    return (0, _permissions.expectCustomPermission)((0, _fn.stringOrDefault)(context.newRecord.getValue(_types.permissionBodyField)));
  }

  function getSupportedAccounts(accountRepository) {
    return accountRepository.findOptions().map(function (o) {
      return o.value;
    });
  }

  function filterLinesForReference(lines, accountsIds) {
    return lines.filter(function (o) {
      return accountsIds.indexOf(o.account) !== -1;
    });
  }

  var TransactionEventHandler =
  /** @class */
  function () {
    function TransactionEventHandler(balanceSession, messageSession, recalculateFromHistory, resultsSession, tranLineRepository, tranLineSearch, updateTranLinesFromDifference, isAnyLineMatchedSession, runtime, createReferenceSingleJob, scheduler, referenceSession, accountRepository) {
      this.balanceSession = balanceSession;
      this.messageSession = messageSession;
      this.recalculateFromHistory = recalculateFromHistory;
      this.resultsSession = resultsSession;
      this.tranLineRepository = tranLineRepository;
      this.tranLineSearch = tranLineSearch;
      this.updateTranLinesFromDifference = updateTranLinesFromDifference;
      this.isAnyLineMatchedSession = isAnyLineMatchedSession;
      this.runtime = runtime;
      this.createReferenceSingleJob = createReferenceSingleJob;
      this.scheduler = scheduler;
      this.referenceSession = referenceSession;
      this.accountRepository = accountRepository;
    }

    TransactionEventHandler.prototype.handleBeforeSubmit = function (context) {
      var record = context.newRecord;
      this.referenceSession.set(getReferenceSessionId(context), (0, _fn.stringOrDefault)(record.getValue(_types.tReference)));
      record.setValue(_types.tReference, "");

      if (isEdit(context) || isDelete(context)) {
        var transactionId = getId(context);

        if (this.isAnyLineMatchedSession.get(transactionId) || context.newRecord.type === "deposit") {
          var linesBeforeSubmit = this.tranLineSearch.findByTransactionIds([transactionId]);
          var matchedTranLines = this.tranLineSearch.findByMatchingIds((0, _utils.getMatchingIds)(linesBeforeSubmit));
          var balancesBeforeSubmit = calculateBalances(matchedTranLines);
          this.balanceSession.set(transactionId, balancesBeforeSubmit);
          this.resultsSession.set(transactionId, linesBeforeSubmit);
        }
      }
    };

    TransactionEventHandler.prototype.handleAfterSubmit = function (context) {
      var transactionId = getId(context);
      var linesAfterSubmit = this.resolveReference(this.runtime, context);

      if (this.isAnyLineMatchedSession.getAndClear(transactionId) || context.newRecord.type === "deposit") {
        if (isEdit(context)) {
          var balancesBeforeSubmit = this.balanceSession.getAndClear(transactionId);
          var linesBeforeSubmit = this.resultsSession.getAndClear(transactionId);

          if (linesAfterSubmit.length === 0) {
            linesAfterSubmit = this.tranLineSearch.findByTransactionIds([transactionId]);
          }

          var updateHistory = this.updateTranLinesFromDifference(linesBeforeSubmit, linesAfterSubmit);
          var recalculationHistory = this.recalculateFromHistory(updateHistory);
          var joinedHistory = joinHistory(updateHistory, recalculationHistory);
          var historyWithBalances = fillUpOldBalances(joinedHistory, balancesBeforeSubmit);
          var modifiedLines = historyWithBalances.filter(function (x) {
            return isChanged(x.balance) || isChanged(x.code) || isChanged(x.status) || isChanged(x.accountChange);
          });
          this.messageSession.set(transactionId, modifiedLines);
        } else if (isDelete(context)) {
          var oldLines = this.resultsSession.getAndClear(transactionId);
          var deleteHistory = this.deleteAllLines(oldLines.filter(function (x) {
            return (0, _fn.eq)(x.transaction, transactionId);
          }));
          this.recalculateFromHistory(deleteHistory);
        }
      }
    };

    TransactionEventHandler.prototype.resolveReference = function (runtime, context) {
      var transactionId = getId(context);
      var linesAfterSubmit = [];
      var reference = this.referenceSession.get(getReferenceSessionId(context));

      if (runtime.getContextType() === runtime.getContextTypeEnum().USER_INTERFACE && isReferenceChanged(reference)) {
        linesAfterSubmit = this.tranLineSearch.findByTransactionIds([transactionId]);
        var linesForReference = filterLinesForReference(linesAfterSubmit, getSupportedAccounts(this.accountRepository));

        if (linesForReference.length > 0) {
          var referenceSingleRequest = (0, _CSVReferenceResolver.toReferenceSingleRequest)(linesForReference, reference);
          var isNotAuthorized = referenceSingleRequest.entries.filter(function (result) {
            return (0, _permissions.checkAuthorized)(getPermissions(context), result.isPeriodClosed);
          });

          if (isNotAuthorized.length === 0) {
            this.createReferenceSingleJob(referenceSingleRequest);
            this.scheduler.tryReschedule();
            this.referenceSession.clear(getReferenceSessionId(context));
          }
        } else {
          this.referenceSession.clear(getReferenceSessionId(context));
        }
      }

      return linesAfterSubmit;
    };

    TransactionEventHandler.prototype.deleteAllLines = function (tranLines) {
      var _this = this;

      return (0, _lodash.flatMap)(tranLines.filter(isRemovable), function (tranLine) {
        return _this.tranLineRepository.remove(tranLine);
      });
    };

    return TransactionEventHandler;
  }();

  _exports.TransactionEventHandler = TransactionEventHandler;
});