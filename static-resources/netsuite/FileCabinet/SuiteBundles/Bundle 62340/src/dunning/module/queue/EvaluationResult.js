/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.x
 * @NModuleScope public
 */

define([
  'N/record',
  '../common/di',
  '../../constants'
],
function (N_record, di, C) {
  'use strict';

  /**
   * @param {InternalId} id
   * @param {InternalId} type
   * @constructor
   */
  const EvaluationResult = function (id, type) {
    if (!id) {
      throw new Error('parameter "id" expected');
    }
    if (!type) {
      throw new Error('parameter "type" expected');
    }

    /**
     * @type {InternalId}
     * @private
     * @readonly
     */
    this.id = id;

    /**
     * @type {InternalId}
     * @private
     * @readonly
     */
    this.type = type;
  };

  /**
   * @returns {InternalId}
   */
  EvaluationResult.prototype.getId = function () {
    return this.id;
  };

  /**
   * @returns {InternalId}
   */
  EvaluationResult.prototype.getType = function () {
    return this.type;
  };

  /**
   * @returns {boolean}
   */
  EvaluationResult.prototype.isEmail = function () {
    return this.type === di.variables().LETTER_TYPE.EMAIL;
  };

  /**
   * @returns {boolean}
   */
  EvaluationResult.prototype.isPdf = function () {
    return this.type === di.variables().LETTER_TYPE.PDF;
  };

  /**
   * @param {string} status The name of status ie "pending"
   * @returns {void}
   */
  EvaluationResult.prototype.changeStatusTo = function (status) {
    const values = {};

    values[C.FIELD.EVALUATION_RESULT.STATUS] = status === C.QUEUE_MODULE.STATUS.REMOVED
      ? di.variables().EVALUATION_RESULT_STATUS.REMOVED
      : di.variables().EVALUATION_RESULT_STATUS.PENDING;

    N_record.submitFields({
      type: C.TYPE.EVALUATION_RESULT,
      id: this.id,
      values: values
    });
  };

  /**
   * @returns {string}
   */
  EvaluationResult.prototype.toJSON = function () {
    return {
      id: this.id,
      type: this.type
    };
  };

  /**
   * @static
   * @param {string} json
   * @returns {EvaluationResult}
   * @throws {SyntaxError} if parsing went wrong
   */
  EvaluationResult.fromJSON = function (json) {
    const data = JSON.parse(json);
    return new EvaluationResult(data.id, data.type);
  };

  return EvaluationResult;
});
