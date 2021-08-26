/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

define(["exports", "../../vendor/tslib", "../../lib/errors", "./fn", "./Maybe"], function (_exports, _tslib, glmErrors, _fn, _Maybe) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.isMatchingStatus = isMatchingStatus;
  _exports.parseMatchingStatus = parseMatchingStatus;
  _exports.expectMatchingStatus = expectMatchingStatus;
  _exports.MatchingStatusOptions = _exports.MatchingStatusMap = void 0;
  glmErrors = _interopRequireWildcard(glmErrors);

  function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

  function isMatchingStatus(value) {
    return value === "matched"
    /* MATCHED */
    || value === "paired"
    /* PAIRED */
    || value === "none"
    /* NONE */
    ;
  }

  function parseMatchingStatus(value) {
    return isMatchingStatus(value) ? value : "none"
    /* NONE */
    ;
  }

  function expectMatchingStatus(value) {
    if (isMatchingStatus(value)) {
      return value;
    }

    throw glmErrors.createTypeError("Unexpected value of MatchingStatus");
  }

  var MatchingStatusMap =
  /** @class */
  function () {
    function MatchingStatusMap(createError, findAllVariables) {
      this.createError = createError;
      this.findAllVariables = findAllVariables;
    }

    MatchingStatusMap.prototype.getByStatus = function (status) {
      var variables = this.getAll().filter(function (x) {
        return x.value === status;
      });

      if (variables.length !== 1) {
        throw this.createError("Matching status not found");
      }

      return variables[0];
    };

    MatchingStatusMap.prototype.getById = function (id) {
      var variables = this.getAll().filter(function (x) {
        return x.id === id;
      });
      return variables.length === 1 ? (0, _Maybe.maybe)(variables[0]) : (0, _Maybe.nothing)();
    };

    MatchingStatusMap.prototype.getAll = function () {
      return this.findAllVariables().filter(function (x) {
        return isMatchingStatus(x.value);
      });
    };

    return MatchingStatusMap;
  }();

  _exports.MatchingStatusMap = MatchingStatusMap;

  var MatchingStatusOptions =
  /** @class */
  function () {
    function MatchingStatusOptions(options) {
      this.options = options;
    }

    MatchingStatusOptions.empty = function () {
      return new MatchingStatusOptions([["matched"
      /* MATCHED */
      , false], ["none"
      /* NONE */
      , false], ["paired"
      /* PAIRED */
      , false]]);
    };

    MatchingStatusOptions.fromArray = function (options) {
      var states = options.filter(isMatchingStatus).reduce(function (a, x) {
        var _a;

        return (0, _tslib.__assign)((0, _tslib.__assign)({}, a), (_a = {}, _a[x] = true, _a));
      }, {});
      return new MatchingStatusOptions([["matched"
      /* MATCHED */
      , "matched"
      /* MATCHED */
      in states], ["none"
      /* NONE */
      , "none"
      /* NONE */
      in states], ["paired"
      /* PAIRED */
      , "paired"
      /* PAIRED */
      in states]]);
    };

    MatchingStatusOptions.full = function () {
      return new MatchingStatusOptions([["matched"
      /* MATCHED */
      , true], ["none"
      /* NONE */
      , true], ["paired"
      /* PAIRED */
      , true]]);
    };

    MatchingStatusOptions.parse = function (value) {
      if (value instanceof MatchingStatusOptions) {
        return value;
      }

      return Array.isArray(value) ? MatchingStatusOptions.fromArray(value.filter(isMatchingStatus)) : MatchingStatusOptions.empty();
    };

    MatchingStatusOptions.prototype.equals = function (t) {
      return (0, _fn.eq)(this.options, t.options);
    };

    MatchingStatusOptions.prototype.getSelected = function () {
      return this.options.filter(function (x) {
        return x[1];
      }).map(function (x) {
        return x[0];
      });
    };

    MatchingStatusOptions.prototype.isSelected = function (status) {
      return this.options.filter(function (x) {
        return x[1] && status === x[0];
      }).length > 0;
    };

    MatchingStatusOptions.prototype.isSelectedAll = function () {
      return this.options.filter(function (x) {
        return x[1];
      }).length === 3;
    };

    MatchingStatusOptions.prototype.isSelectedAnything = function () {
      return this.options.filter(function (x) {
        return x[1];
      }).length > 0;
    };

    return MatchingStatusOptions;
  }();

  _exports.MatchingStatusOptions = MatchingStatusOptions;
});