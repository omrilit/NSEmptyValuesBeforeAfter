/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "./fn"], function (_exports, _fn) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.maybe = maybe;
  _exports.nothing = nothing;
  _exports.isJust = isJust;
  _exports.isNothing = isNothing;
  _exports.onlyJustValues = onlyJustValues;
  _exports.areJustEqual = areJustEqual;

  var Just =
  /** @class */
  function () {
    function Just(value) {
      this.value = value;
    }

    Just.prototype.of = function (u) {
      return maybe(u); // Slight deviation from Haskell, since sadly null does exist in JS
    };

    Just.prototype.bind = function (f) {
      return f(this.value);
    };

    Just.prototype.fmap = function (f) {
      return this.of(f(this.value));
    };

    Just.prototype.caseOf = function (patterns) {
      return patterns.just(this.value);
    };

    Just.prototype.equals = function (other) {
      return isJust(other) && (0, _fn.eq)(other.value, this.value);
    };

    Just.prototype.valueOr = function (defaultValue) {
      return this.value;
    };

    Just.prototype.valueOrThrow = function () {
      return this.value;
    };

    Just.prototype.valueOrUndefined = function () {
      return this.value;
    };

    Just.prototype["do"] = function (patterns) {
      if (patterns === void 0) {
        patterns = {};
      }

      if (typeof patterns.just === "function") {
        patterns.just(this.value);
      }

      return this;
    };

    Just.prototype.test = function (predicate) {
      return predicate(this.value);
    };

    Just.prototype.filter = function (predicate) {
      return predicate(this.value) ? this : nothing();
    };

    Just.prototype.filterType = function (predicate) {
      return predicate(this.value) ? this : nothing();
    };

    Just.prototype.toJSON = function () {
      return this.value;
    };

    Just.prototype.toString = function () {
      return "Just(" + JSON.stringify(this.value) + ")";
    };

    return Just;
  }();

  var Nothing =
  /** @class */
  function () {
    function Nothing() {}

    Nothing.prototype.of = function (u) {
      return maybe(u); // Slight deviation from Haskell, since sadly null does exist in JS
    };

    Nothing.prototype.bind = function (f) {
      return nothing();
    };

    Nothing.prototype.fmap = function (f) {
      return nothing();
    };

    Nothing.prototype.caseOf = function (patterns) {
      return patterns.nothing();
    };

    Nothing.prototype.equals = function (other) {
      return isNothing(other);
    };

    Nothing.prototype.valueOr = function (defaultValue) {
      return defaultValue;
    };

    Nothing.prototype.valueOrThrow = function (error) {
      throw error || new Error("No value is available.");
    };

    Nothing.prototype.valueOrUndefined = function () {
      return undefined;
    };

    Nothing.prototype["do"] = function (patterns) {
      if (patterns === void 0) {
        patterns = {};
      }

      if (typeof patterns.nothing === "function") {
        patterns.nothing();
      }

      return this;
    };

    Nothing.prototype.test = function (predicate) {
      return false;
    };

    Nothing.prototype.filter = function (predicate) {
      return this;
    };

    Nothing.prototype.filterType = function (predicate) {
      return this;
    };

    Nothing.prototype.toJSON = function () {
      return undefined;
    };

    Nothing.prototype.toString = function () {
      return "Nothing()";
    };

    return Nothing;
  }();

  function maybe(t) {
    if (t === null || t === undefined) {
      return nothing();
    }

    if (t instanceof Nothing || t instanceof Just) {
      return t;
    }

    if (typeof t === "string" && t === "") {
      return nothing();
    }

    if (typeof t === "number" && (isNaN(t) || !isFinite(t))) {
      return nothing();
    }

    return new Just(t);
  }

  function nothing() {
    return new Nothing();
  }

  function isJust(m) {
    return m instanceof Just;
  }

  function isNothing(m) {
    return m instanceof Nothing;
  }

  function onlyJustValues(ms) {
    return ms.filter(isJust).map(function (x) {
      return x.valueOrThrow();
    });
  }

  function areJustEqual(x, y) {
    return x.test(function (a) {
      return y.test(function (b) {
        return (0, _fn.eq)(a, b);
      });
    });
  }
});