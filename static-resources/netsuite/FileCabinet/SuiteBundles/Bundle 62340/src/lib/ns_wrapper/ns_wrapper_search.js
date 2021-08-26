/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var ns_wrapper = ns_wrapper || {};
ns_wrapper.search = ns_wrapper.search || {};

/**
 * @param {string} field
 * @param {string|null} join
 * @param {string} operator
 * @param {*} value
 * @returns {nlobjSearchFilter}
 */
ns_wrapper.search.createSearchFilter = function (field, join, operator, value) {
  return new nlobjSearchFilter(field, join, operator, value);
};

/**
 * @param {string} field
 * @param {string|null} [join]
 * @param {string|null} [summary]
 * @returns {nlobjSearchColumn}
 */
ns_wrapper.search.createSearchColumn = function (field, join, summary) {
  return new nlobjSearchColumn(field, join, summary);
};

/**
 * @interface ns_wrapper.search.IIterator
 */

/**
 * @method ns_wrapper.search.IIterator#hasNext
 * @returns {boolean}
 */

/**
 * @method ns_wrapper.search.IIterator#next
 * @returns {nlobjSearchResult}
 * @throws {ns_wrapper.search.IteratorOverflow}
 */

/**
 * @param {string} [message]
 * @constructor
 * @extends RangeError
 */
ns_wrapper.search.IteratorOverflow = function (message) {
  this.name = 'IteratorOverflow';
  this.message = message || 'Iterator has overflowed';
  this.stack = (new RangeError()).stack;
};
ns_wrapper.search.IteratorOverflow.prototype = Object.create(RangeError.prototype);
ns_wrapper.search.IteratorOverflow.prototype.constructor = ns_wrapper.search.IteratorOverflow;

/**
 * @param {nlobjSearchResultSet} resultSet
 * @constructor
 * @implements ns_wrapper.search.IIterator
 */
ns_wrapper.search.Iterator = function (resultSet) {
  /**
   * @type {nlobjSearchResultSet}
   * @private
   */
  this._resultSet = resultSet;

  /**
   * @type {number}
   * @private
   */
  this._index = -1;

  /**
   * @type {nlobjSearchResult[]}
   * @private
   */
  this._results = [];
};

ns_wrapper.search.Iterator.prototype.hasNext = function () {
  var next = this._index + 1;
  if (this._results.length > next) {
    return true;
  }

  this._results = this._results.concat(this._resultSet.getResults(next, next + 1000) || []);

  return this._results.length > next;
};

ns_wrapper.search.Iterator.prototype.next = function () {
  if (this.hasNext()) {
    return this._results[++this._index];
  }
  throw new ns_wrapper.search.IteratorOverflow();
};

/**
 * @param {nlobjSearchResultSet} resultSet
 * @param {number} start
 * @param {number} end
 * @constructor
 * @implements ns_wrapper.search.IIterator
 */
ns_wrapper.search.LimitedIterator = function (resultSet, start, end) {
  /**
   * @type {nlobjSearchResultSet}
   * @private
   */
  this._resultSet = resultSet;

  /**
   * @type {number}
   * @private
   */
  this._index = -1;

  /**
   * @type {number}
   * @private
   */
  this._start = start;

  /**
   * @type {number}
   * @private
   */
  this._end = end;

  /**
   * @type {nlobjSearchResult[]}
   * @private
   */
  this._results = [];
};

/**
 * @returns {boolean}
 */
ns_wrapper.search.LimitedIterator.prototype.hasNext = function () {
  var next = this._index + 1;
  if (this._results.length > next) {
    return true;
  }

  var a = this._start + next;
  var b = Math.min(this._end, a + 1000);
  this._results = this._results.concat(this._resultSet.getResults(a, b) || []);

  return this._results.length > next;
};

/**
 * @returns {nlobjSearchResult}
 * @throws
 */
ns_wrapper.search.LimitedIterator.prototype.next = function () {
  if (this.hasNext()) {
    return this._results[++this._index];
  }
  throw new ns_wrapper.search.IteratorOverflow();
};

/**
 * @param {string} type
 * @constructor
 */
ns_wrapper.Search = function (type) {
  /**
   * @type {string}
   * @private
   */
  this._type = type;

  /**
   * @type {nlobjSearchColumn[]}
   * @private
   */
  this._columns = [];

  /**
   * @type {nlobjSearchFilter[]}
   * @private
   */
  this._filters = [];

  /**
   * @type {string[]|null}
   * @private
   */
  this._filterExpression = null;

  /**
   * @type {string|null}
   * @private
   */
  this._savedSearchId = null;

  /**
   * @type {boolean}
   * @private
   */
  this._isClearSSColumns = false;

  /**
   * @type {nlobjSearchResultSet|null}
   * @private
   */
  this._resultSet = null;

  /**
   *
   * @type {number}
   * @private
   */
  this._start = 0;

  /**
   * @type {number}
   * @private
   */
  this._end = 0;
};

ns_wrapper.Search.prototype = {
  /**
   * @returns {boolean}
   * @private
   */
  _isLimited: function () {
    return this._start > 0 || this._end > 0;
  },

  /**
   * @param {number} index
   */
  setStartIndex: function (index) {
    this._start = Math.max(0, ~~index);
  },

  /**
   * @param {number} index
   */
  setEndIndex: function (index) {
    this._end = Math.max(0, ~~index);
  },

  /**
   * @param {boolean} setting
   */
  clearSavedSearchColumns: function (setting) {
    this._isClearSSColumns = setting;
  },

  /**
   * @param {string} field
   * @param {string} operator
   * @param {*} value
   */
  addFilter: function (field, operator, value) {
    this._filters.push(ns_wrapper.search.createSearchFilter(field, null, operator, value));
  },

  /**
   * @param {string} field
   * @param {string} join
   * @param {string} operator
   * @param {*} value
   */
  addJoinFilter: function (field, join, operator, value) {
    this._filters.push(ns_wrapper.search.createSearchFilter(field, join, operator, value));
  },

  /**
   * @param {nlobjSearchFilter[]} filters
   */
  addFilters: function (filters) {
    this._filters = this._filters.concat(filters);
  },

  /**
   * @returns {string}
   */
  getFilters: function () {
    return JSON.stringify(this._filters.map(function (filter) {
      var object = {};

      if (filter.name) {
        object.field = filter.name;
      }
      if (filter.join) {
        object.join = filter.join;
      }
      if (filter.operator) {
        object.operator = filter.operator;
      }
      if (filter.values) {
        object.value = filter.values;
      }

      return object;
    }));
  },

  removeFilters: function () {
    this._filters = [];
  },

  /**
   * @param {string} field
   */
  addColumn: function (field) {
    this._columns.push(ns_wrapper.search.createSearchColumn(field));
  },

  /**
   * @param {string} field
   * @param {string} join
   */
  addJoinColumn: function (field, join) {
    this._columns.push(ns_wrapper.search.createSearchColumn(field, join));
  },

  /**
   * @param {string} field
   * @param {string} summary
   */
  addSummaryColumn: function (field, summary) {
    this._columns.push(ns_wrapper.search.createSearchColumn(field, null, summary));
  },

  /**
   * @param {string} field
   * @param {string} summary
   * @param {string} formula
   */
  addSummaryFormulaColumn: function (field, summary, formula) {
    var column = ns_wrapper.search.createSearchColumn(field, null, summary);
    column.setFormula(formula);
    this._columns.push(column);
  },

  /**
   * @param {string} field
   * @param {string} join
   * @param {string} summary
   */
  addSummaryJoinColumn: function (field, join, summary) {
    this._columns.push(ns_wrapper.search.createSearchColumn(field, join, summary));
  },

  /**
   * @param {nlobjSearchColumn[]} columns
   */
  addColumns: function (columns) {
    this._columns = this._columns.concat(columns);
  },

  /**
   * @returns {string}
   */
  getColumns: function () {
    return JSON.stringify(this._columns.map(function (column) {
      var object = {};

      if (column.name) {
        object.field = column.name;
      }
      if (column.join) {
        object.join = column.join;
      }
      if (column.summary) {
        object.summary = column.summary;
      }

      return object;
    }));
  },

  removeColumns: function () {
    this._columns = [];
  },

  /**
   * @param {string} id
   */
  setSavedSearchId: function (id) {
    this._savedSearchId = id;
  },

  /**
   * @param {string[]} expression
   */
  setFilterExpression: function (expression) {
    this._filterExpression = expression;
  },

  /**
   * @param {Object} options
   * @param {string} options.name
   * @param {string} options.order
   * @param {string} [options.join]
   */
  setSort: function (options) {
    var hasSameName = function (column) {
      return column.getName() === options.name;
    };
    var hasSameJoin = function (column) {
      var join = column.getJoin();
      return join ? join === options.join : true;
    };
    var setOrder = function (column) {
      column.setSort(options.order);
    };

    this._columns.filter(hasSameName).filter(hasSameJoin).forEach(setOrder);
  },

  /**
   * Returns an iterator of the result set
   * @returns {ns_wrapper.search.IIterator}
   */
  getIterator: function () {
    if (!this._resultSet) {
      var search;
      if (this._savedSearchId) {
        search = nlapiLoadSearch(this._type, this._savedSearchId);
        if (this._isClearSSColumns) {
          search.setColumns(null);
        }
        if (this._columns.length > 0) {
          search.addColumns(this._columns);
        }
        if (this._filters.length > 0) {
          search.addFilters(this._filters);
        }
        if (this._filterExpression) {
          search.setFilterExpression(this._filterExpression);
        }
      } else {
        search = nlapiCreateSearch(this._type, this._filters, this._columns);
      }

      this._resultSet = search.runSearch();
    }

    return this._isLimited()
      ? new ns_wrapper.search.LimitedIterator(this._resultSet, this._start, this._end)
      : new ns_wrapper.search.Iterator(this._resultSet);
  },

  /**
   * @template T
   * @param {number} [count=1]
   * @param {function(nlobjSearchResult, number):T} [mapper] default value is identity function
   * @returns {Array.<T>}
   */
  head: function (count, mapper) {
    var _count = Math.max(1, count || 0);
    var _mapper = mapper || function (x) { return x; };
    var results = [];
    var iterator = this.getIterator();

    for (var i = 0; i < _count && iterator.hasNext(); i++) {
      results.push(_mapper(iterator.next(), i));
    }

    return results;
  },

  /**
   * @template T
   * @param {function(nlobjSearchResult, number):T} [mapper] default value is identity function
   * @returns {Array.<T>}
   */
  map: function (mapper) {
    return this.head(Infinity, mapper);
  }
};
