/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib", "../common/fn", "../common/MatchingStatus", "../common/Maybe", "../../vendor/lodash-4.17.4"], function (_exports, _tslib, _fn, _MatchingStatus, _Maybe, _lodash) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.FilterParameters = void 0;

  function isTranType(x) {
    return (0, _lodash.isPlainObject)(x) && typeof x.name === "string" && typeof x.type === "string";
  }

  function silentParse(x) {
    try {
      return JSON.parse(x);
    } catch (e) {
      // intentionally swallowed
      return undefined;
    }
  }

  function parseTranTypes(values) {
    return Array.isArray(values) ? values.map(silentParse).filter(isTranType) : [];
  } // default option of Account filter on Dashboard has value equal '0'


  function maybeId(value) {
    return (0, _Maybe.maybe)(value).filterType(_fn.isInternalId).fmap(String).filter(function (x) {
      return x !== "0";
    });
  }

  function maybeString(value) {
    return (0, _Maybe.maybe)(value).filterType(_lodash.isString);
  }

  function maybeAmount(value) {
    return maybeString(value).filter(function (x) {
      var y = parseFloat(x);
      return !(isNaN(y) || y === 0);
    });
  }

  var FilterParameters =
  /** @class */
  function () {
    function FilterParameters(options) {
      if (options === void 0) {
        options = {};
      }

      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;

      this.account = (_a = options.account) !== null && _a !== void 0 ? _a : (0, _Maybe.nothing)();
      this.accountingBook = (_b = options.accountingBook) !== null && _b !== void 0 ? _b : (0, _Maybe.nothing)();
      this.accountingContext = (_c = options.accountingContext) !== null && _c !== void 0 ? _c : (0, _Maybe.nothing)();
      this.accountingPeriod = (_d = options.accountingPeriod) !== null && _d !== void 0 ? _d : (0, _Maybe.nothing)();
      this.action = (_e = options.action) !== null && _e !== void 0 ? _e : (0, _Maybe.nothing)();
      this.amountMax = (_f = options.amountMax) !== null && _f !== void 0 ? _f : (0, _Maybe.nothing)();
      this.amountMin = (_g = options.amountMin) !== null && _g !== void 0 ? _g : (0, _Maybe.nothing)();
      this.billingStatus = (_h = options.billingStatus) !== null && _h !== void 0 ? _h : (0, _Maybe.nothing)();
      this.classification = (_j = options.classification) !== null && _j !== void 0 ? _j : (0, _Maybe.nothing)();
      this.customer = (_k = options.customer) !== null && _k !== void 0 ? _k : (0, _Maybe.nothing)();
      this.dateMax = (_l = options.dateMax) !== null && _l !== void 0 ? _l : (0, _Maybe.nothing)();
      this.dateMin = (_m = options.dateMin) !== null && _m !== void 0 ? _m : (0, _Maybe.nothing)();
      this.department = (_o = options.department) !== null && _o !== void 0 ? _o : (0, _Maybe.nothing)();
      this.employee = (_p = options.employee) !== null && _p !== void 0 ? _p : (0, _Maybe.nothing)();
      this.isMatchable = (_q = options.isMatchable) !== null && _q !== void 0 ? _q : false;
      this.location = (_r = options.location) !== null && _r !== void 0 ? _r : (0, _Maybe.nothing)();
      this.matchingCode = (_s = options.matchingCode) !== null && _s !== void 0 ? _s : (0, _Maybe.nothing)();
      this.matchingReference = (_t = options.matchingReference) !== null && _t !== void 0 ? _t : (0, _Maybe.nothing)();
      this.matchingStatus = (_u = options.matchingStatus) !== null && _u !== void 0 ? _u : _MatchingStatus.MatchingStatusOptions.empty();
      this.memo = (_v = options.memo) !== null && _v !== void 0 ? _v : (0, _Maybe.nothing)();
      this.memoLine = (_w = options.memoLine) !== null && _w !== void 0 ? _w : (0, _Maybe.nothing)();
      this.pageNumber = Math.max(options.pageNumber || 0, 0);
      this.pageSize = Math.max(options.pageSize || 0, 0);
      this.subsidiary = (_x = options.subsidiary) !== null && _x !== void 0 ? _x : (0, _Maybe.nothing)();
      this.transactionTypes = options.transactionTypes || [];
      this.vendor = (_y = options.vendor) !== null && _y !== void 0 ? _y : (0, _Maybe.nothing)();
    }

    FilterParameters.parse = function (json) {
      return new FilterParameters({
        account: maybeId(json.account),
        accountingBook: maybeId(json.accountingBook),
        accountingContext: maybeId(json.accountingContext),
        accountingPeriod: maybeId(json.accountingPeriod),
        action: maybeString(json.action),
        amountMax: maybeAmount(json.amountMax),
        amountMin: maybeAmount(json.amountMin),
        billingStatus: maybeString(json.billingStatus),
        classification: maybeId(json.classification),
        customer: maybeId(json.customer),
        dateMax: maybeString(json.dateMax),
        dateMin: maybeString(json.dateMin),
        department: maybeId(json.department),
        employee: maybeId(json.employee),
        isMatchable: json.isMatchable === "T",
        location: maybeId(json.location),
        matchingCode: maybeString(json.matchingCode),
        matchingReference: maybeString(json.matchingReference),
        matchingStatus: _MatchingStatus.MatchingStatusOptions.parse(json.matchingStatus),
        memo: maybeString(json.memo),
        memoLine: maybeString(json.memoLine),
        pageNumber: (0, _lodash.toNumber)(json.pageNumber),
        pageSize: (0, _lodash.toNumber)(json.pageSize),
        subsidiary: maybeId(json.subsidiary),
        transactionTypes: parseTranTypes(json.transactionTypes),
        vendor: maybeId(json.vendor)
      });
    };

    FilterParameters.prototype.isValid = function (isOneWorld, isMultiBookEnabled) {
      var hasSubsidiary = (0, _Maybe.isJust)(this.subsidiary);
      var hasAccount = (0, _Maybe.isJust)(this.account);
      var hasAccountingBook = (0, _Maybe.isJust)(this.accountingBook);
      return hasAccount && (isOneWorld && hasSubsidiary || !isOneWorld) && (hasAccountingBook || !isMultiBookEnabled);
    };

    FilterParameters.prototype.set = function (data) {
      return new FilterParameters((0, _tslib.__assign)((0, _tslib.__assign)({}, this), data));
    };

    return FilterParameters;
  }();

  _exports.FilterParameters = FilterParameters;
});