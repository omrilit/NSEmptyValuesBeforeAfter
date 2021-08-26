/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.x
 * @NModuleScope public
 */

define(['../utils'], function (utils) {
  'use strict';

  /**
   * @param {module:N/record} nRecord
   * @constructor
   */
  function Subsidiary (nRecord) {
    this._nRecord = nRecord;
  }

  Subsidiary.prototype = {
    /**
     * @param {number} subsidiaryId
     * @returns {boolean}
     */
    isNotElemintion: function (subsidiaryId) {
      const record = this._nRecord.load({
        id: subsidiaryId,
        type: this._nRecord.Type.SUBSIDIARY
      });

      return utils.isFalse(record.getValue({fieldId: 'iselimination'}));
    }
  };

  return Subsidiary;
});
