/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../common/expectations", "../common/fn", "../common/MatchingStatus", "../matching/expectations", "../../lib/errors", "./types"], function (_exports, _expectations, _fn, _MatchingStatus, _expectations2, _errors, _types) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.expectJobStatus = expectJobStatus;
  _exports.expectJobType = expectJobType;
  _exports.expectHistoryData = expectHistoryData;

  function expectJobStatus(value) {
    switch (value) {
      case _types.JobStatus.FAILED:
      case _types.JobStatus.PENDING:
      case _types.JobStatus.PROCESSING:
      case _types.JobStatus.SUCCEEDED:
        return value;
    }

    throw (0, _errors.createTypeError)("Unexpected value of JobStatus");
  }

  function expectJobType(value) {
    switch (value) {
      case _types.JobType.MATCHING:
      case _types.JobType.UNMATCHING:
      case _types.JobType.RECALCULATION:
      case _types.JobType.REFERENCE_GROUP:
      case _types.JobType.REFERENCE_SINGLE:
      case _types.JobType.REFERENCE_UNMATCH:
        return value;
    }

    throw (0, _errors.createTypeError)("Unexpected value of JobType");
  }

  function expectHistoryData(value) {
    var expectOptionalChangeOfInternalId = (0, _expectations.expectOptionalOf)((0, _expectations.expectChangeOf)(_expectations.expectInternalId));
    var expectOptionalChangeOfString = (0, _expectations.expectOptionalOf)((0, _expectations.expectChangeOf)(_expectations.expectString));
    var object = (0, _expectations.expectPlainObject)(value);
    var account = (0, _expectations.expectOptionalInternalId)(object.account);
    var accountChange = expectOptionalChangeOfInternalId(object.accountChange);
    var balance = (0, _expectations.expectOptionalOf)((0, _expectations.expectChangeOf)(_expectations.expectNumber))(object.balance);
    var code = expectOptionalChangeOfString(object.code);
    var comment = (0, _expectations.expectOptionalString)(object.comment);
    var credit = expectOptionalChangeOfString(object.credit);
    var debit = expectOptionalChangeOfString(object.debit);
    var line = expectOptionalChangeOfInternalId(object.line);
    var matching = expectOptionalChangeOfInternalId(object.matching);
    var matchingDate = (0, _expectations.expectOptionalDate)(object.matchingDate);
    var reference = expectOptionalChangeOfString(object.reference);
    var status = (0, _expectations.expectOptionalOf)((0, _expectations.expectChangeOf)(_MatchingStatus.expectMatchingStatus))(object.status);
    var transactionChange = expectOptionalChangeOfInternalId(object.transactionChange);
    var transactions = (0, _expectations.expectNonEmptyArrayOf)(_expectations2.expectTranLine)(object.transactions);
    var user = (0, _expectations.expectOptionalInternalId)(object.user);
    return (0, _fn.compactObject)({
      account: account,
      accountChange: accountChange,
      balance: balance,
      code: code,
      comment: comment,
      credit: credit,
      debit: debit,
      line: line,
      matching: matching,
      matchingDate: matchingDate,
      reference: reference,
      status: status,
      transactionChange: transactionChange,
      transactions: transactions,
      user: user
    });
  }
});