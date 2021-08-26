/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope public
 */

define([], function () {
  'use strict';

  return {
    /**
     * @param {string} key
     * @param {*} value
     * @returns {function({key:value}):boolean}
     */
    getFilter: function (key, value) {
      return function (x) {
        return x[key] == value;
      };
    },

    /**
     * @param {Array.<{key:string, value: string}>} items
     * @param {string} key
     * @param {string} value
     * @returns {StringMap}
     */
    getDictionary: function (items, key, value) {
      const result = {};

      items.forEach(function (variable) {
        result[variable[key]] = variable[value];
      });

      return result;
    },

    /**
     * @param {Array.<T>} xs
     * @returns {Array.<T>}
     */
    unique: function (xs) {
      return xs.filter(function (x, i, a) {
        return a.indexOf(x) === i;
      });
    },

    /**
     * @param {number[]} xs
     * @returns {number[]}
     */
    numericSort: function (xs) {
      return xs.sort(function (a, b) {
        return a - b;
      });
    },

    /**
     * @param {function} f
     * @param {function} [hasher]
     * @returns {memoize}
     */
    memoize: function (f, hasher) {
      const memoize = function (key) {
        const cache = memoize.cache;
        const address = '' + (hasher ? hasher.apply(this, arguments) : key);
        if (!cache.hasOwnProperty(address)) {
          cache[address] = f.apply(this, arguments);
        }
        return cache[address];
      };
      memoize.cache = {};
      return memoize;
    },

    /**
     * @param {number} x
     * @param {number} a
     * @param {number} b
     * @returns {number}
     */
    trim: function (x, a, b) {
      const min = Math.min;
      const max = Math.max;
      return min(max(min(a, b), x), max(a, b));
    },

    /**
     * It returns an object, with all entries of "object", that satisfies "validator" callback
     * @param {Object.<string, *>} object
     * @param {EntryValidator} validator
     * @returns {Object.<string, *>}
     */
    filterObject: function (object, validator) {
      const result = {};

      Object.keys(object)
        .filter(function (key) {
          return validator(object[key], key);
        })
        .forEach(function (key) {
          result[key] = object[key];
        });

      return result;
    },

    /**
     * It returns an object, with all entries of "object", where key is in "keys"
     * @param {Object.<string, *>} object
     * @param {string[]} keys
     * @returns {Object.<string, *>}
     */
    filterObjectKeys: function (object, keys) {
      return this.filterObject(object, function (value, key) {
        return keys.indexOf(key) >= 0;
      });
    },

    /**
     * It returns an object, that has keys in keys and entries satisfies "validator" callback
     * // value !== '' && value !== '0'
     * @param {Object.<string, *>} object
     * @param {string[]} keys
     * @returns {Object.<string, *>}
     */
    filterParameters: function (object, keys) {
      const validator = function (value) {
        return value !== '' && value !== '0';
      };
      return this.filterObjectKeys(this.filterObject(object, validator), keys);
    },

    /**
     * @param {Object} object
     * @returns {Array}
     */
    objectValues: function (object) {
      return Object.keys(object).map(function (key) {
        return object[key];
      });
    },

    /**
     * @param {module:N/ui/serverWidget.Form} form
     * @param {Object} params
     * @param {Object} options
     * @returns {module:N/ui/serverWidget.Field}
     */
    addField: function (form, params, options) {
      const field = form.addField(options);

      /* istanbul ignore next */
      if (options.id in params) {
        field.defaultValue = params[options.id];
      }
      /* istanbul ignore next */
      if (options.hasOwnProperty('defaultValue')) {
        field.defaultValue = options.defaultValue;
      }
      /* istanbul ignore next */
      if (options.hasOwnProperty('displaySize')) {
        field.updateDisplaySize(options.displaySize);
      }
      /* istanbul ignore next */
      if (options.hasOwnProperty('layoutType')) {
        field.updateLayoutType({
          layoutType: options.layoutType
        });
      }
      /* istanbul ignore next */
      if (options.hasOwnProperty('displayType')) {
        field.updateDisplayType({
          displayType: options.displayType
        });
      }
      /* istanbul ignore next */
      if (options.hasOwnProperty('options')) {
        options.options.forEach(field.addSelectOption);
      }
      /* istanbul ignore next */
      if (options.hasOwnProperty('help')) {
        field.setHelpText({
          help: options.help
        });
      }

      return field;
    },

    /**
     * @param {string} text
     * @returns {number[]}
     */
    parseIds: function (text) {
      try {
        const ids = JSON.parse(text);
        if (Array.isArray(ids)) {
          return ids.map(function (x) {
            return parseInt(x, 10);
          }).filter(function (x) {
            return !isNaN(x);
          }).filter(function (x, i, xs) {
            return xs.indexOf(x) === i;
          });
        }
      } catch (e) {
        // ignore
      }
      return [];
    },

    /**
     * @param {*} value
     * @returns {boolean}
     */
    isTrue: function (value) {
      return value === 'T' || value === true;
    },

    /**
     * @param {*} value
     * @returns {boolean}
     */
    isFalse: function (value) {
      return !this.isTrue(value);
    }
  };
});
