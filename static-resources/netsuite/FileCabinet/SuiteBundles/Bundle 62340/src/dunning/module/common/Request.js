/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope public
 */

define([
  './di',
  '../../constants'
],
function (di, C) {
  'use strict';

  const MODULE = C.QUEUE_MODULE;

  /**
   * @param {module:N/http.ServerRequest} request
   * @param {module:N/runtime.Script} script
   * @constructor
   */
  const Request = function (request, script) {
    /**
     * @type {module:N/http.ServerRequest}
     * @private
     */
    this._request = request;

    /**
     * @type {module:N/runtime.Script}
     * @private
     */
    this._script = script;

    /**
     * @type {Array.<function>}
     */
    this.onProcess = [];

    /**
     * @type {Array.<function>}
     */
    this.onRemove = [];

    /**
     * @type {Array.<function>}
     */
    this.onDefault = [];
  };

  Request.prototype.handle = function () {
    const self = this;
    const apply = function (action) { action(self); };
    const run = function (actions) { actions.forEach(apply); };

    switch (this.getAction()) {
      case MODULE.ACTION.PROCESS:
        return run(this.onProcess);
      case MODULE.ACTION.REMOVE:
        return run(this.onRemove);
      default:
        return run(this.onDefault);
    }
  };

  /**
   * @returns {number[]}
   */
  Request.prototype.getIds = function () {
    const text = this._request.parameters[MODULE.PARAM.IDS];
    return (text || '').split(/[^\d]+/)
      .map(function (x) { return parseInt(x, 10); })
      .filter(function (x) { return !isNaN(x); })
      .filter(function (x, i, xs) { return xs.indexOf(x) === i; });
  };

  /**
   * @returns {string}
   */
  Request.prototype.getLetterTypeId = function () {
    return this._script.getParameter({name: MODULE.PARAM.TYPE}) || '';
  };

  /**
   * @returns {string}
   */
  Request.prototype.getAction = function () {
    return this._request.parameters[MODULE.PARAM.ACTION] || '';
  };

  /**
   * @returns {boolean}
   */
  Request.prototype.isEmailQueue = function () {
    return this.getLetterTypeId() == di.variables().LETTER_TYPE.EMAIL;
  };

  /**
   * @returns {boolean}
   */
  Request.prototype.isPdfQueue = function () {
    return this.getLetterTypeId() == di.variables().LETTER_TYPE.PDF;
  };

  /**
   * @returns {boolean}
   */
  Request.prototype.isSyncLimitExceeded = function () {
    const length = this.getIds().length;

    return (this.isEmailQueue() && length > MODULE.SYNC_LIMIT.EMAIL) ||
      (this.isPdfQueue() && length > MODULE.SYNC_LIMIT.PDF);
  };

  return Request;
});
