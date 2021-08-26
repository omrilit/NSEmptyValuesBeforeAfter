/**
 * @copyright © 2020, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../lib/errors", "../../vendor/lodash-4.17.4", "./Maybe"], function (_exports, _errors, _lodash, _Maybe) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.toPlaceholders = toPlaceholders;
  _exports.isIn = isIn;
  _exports.joinQueryConditions = joinQueryConditions;
  _exports.uncommentIf = uncommentIf;

  function toPlaceholders(xs) {
    if (xs.length > 0) {
      return "?" + (0, _lodash.repeat)(",?", xs.length - 1);
    }

    throw (0, _errors.createError)("Cannot make placeholders for zero elements");
  }

  function isIn(query, xs) {
    var limit = 1000;

    if (xs.length > 1) {
      return joinQueryConditions("OR", (0, _lodash.chunk)(xs, limit).map(function (ch) {
        return (0, _Maybe.maybe)(query + " IN (" + toPlaceholders(ch) + ")");
      }));
    }

    if (xs.length === 1) {
      return (0, _Maybe.maybe)(query + " = ?");
    }

    return (0, _Maybe.nothing)();
  }

  function joinQueryConditions(connection, conditions) {
    var query = (0, _Maybe.onlyJustValues)(conditions);

    if (query.length === 0) {
      return (0, _Maybe.nothing)();
    }

    if (query.length === 1) {
      return (0, _Maybe.maybe)(query[0]);
    }

    return connection === "OR" ? (0, _Maybe.maybe)("(" + query.join(" " + connection + " ") + ")") : (0, _Maybe.maybe)(query.join(" " + connection + " "));
  }

  function uncommentIf(isTrue) {
    return isTrue ? "" : "-- ";
  }
});