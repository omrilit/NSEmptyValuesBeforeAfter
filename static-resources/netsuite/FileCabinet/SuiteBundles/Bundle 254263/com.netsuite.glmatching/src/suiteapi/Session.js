/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.Session = void 0;

  var Session =
  /** @class */
  function () {
    function Session(session, namespace, defaultValue, parser, serializer) {
      this.session = session;
      this.namespace = namespace;
      this.defaultValue = defaultValue;

      this.parser = function (x) {
        return JSON.parse(x);
      };

      this.serializer = function (x) {
        return JSON.stringify(x);
      };

      if (parser) {
        this.parser = parser;
      }

      if (serializer) {
        this.serializer = serializer;
      }
    }

    Session.prototype.get = function (key) {
      try {
        var value = this.session.get({
          name: this.getName(key)
        });

        if (value === "") {
          return this.defaultValue;
        }

        return this.parser(value);
      } catch (e) {
        return this.defaultValue;
      }
    };

    Session.prototype.set = function (key, value) {
      this.session.set({
        name: this.getName(key),
        value: this.serializer(value)
      });
    };

    Session.prototype.clear = function (key) {
      this.session.set({
        name: this.getName(key),
        value: ""
      });
    };

    Session.prototype.getAndClear = function (key) {
      var value = this.get(key);
      this.clear(key);
      return value;
    };

    Session.prototype.getOrSearch = function (key, loadFunction) {
      var value = this.get(key);

      if (value === this.defaultValue) {
        try {
          value = loadFunction();
          this.set(key, value);
        } catch (e) {
          return this.defaultValue;
        }
      }

      return value;
    };

    Session.prototype.getName = function (key) {
      return this.namespace + "#" + key;
    };

    return Session;
  }();

  _exports.Session = Session;
});