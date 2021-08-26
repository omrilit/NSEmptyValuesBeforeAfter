/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.x
 * @NModuleScope public
 */

define(['../utils'], function (utils) {
  'use strict';

  const recordType = 'customrecord_3805_dunning_config';
  const subsidiaryField = 'custrecord_3805_config_subsidiary';
  const isInactiveField = 'isinactive';

  /**
   * @param {module:N/record} nRecord
   * @param {module:N/search} nSearch
   * @constructor
   */
  function Config (nRecord, nSearch) {
    this._nRecord = nRecord;
    this._nSearch = nSearch;
  }

  Config.prototype = {
    /**
     * @param {number} subsidiaryId
     * @param {boolean} isInactive
     * @returns {number} ID of new Config
     */
    create: function (subsidiaryId, isInactive) {
      const record = this._nRecord.create({
        type: recordType
      });

      record.setValue({
        fieldId: subsidiaryField,
        value: subsidiaryId
      });
      record.setValue({
        fieldId: isInactiveField,
        value: isInactive
      });

      return record.save();
    },

    /**
     * @param {number} subsidiaryId
     * @returns {Array<{id:number,isInactive:boolean}>}
     */
    findBySubsidiary: function (subsidiaryId) {
      const search = this._nSearch.create({
        columns: [
          this._nSearch.createColumn({
            name: isInactiveField
          }),
          this._nSearch.createColumn({
            name: isInactiveField
          })
        ],
        filters: [
          this._nSearch.createFilter({
            name: subsidiaryField,
            operator: this._nSearch.Operator.IS,
            values: subsidiaryId
          })
        ],
        type: recordType
      });

      return search.run()
        .getRange({ start: 0, end: 1 })
        .map(function (result) {
          return {
            id: result.id,
            isInactive: utils.isTrue(result.getValue(result.columns[0]))
          };
        });
    },

    /**
     * @param {number} configId
     */
    remove: function (configId) {
      this._nRecord.delete({
        id: configId,
        type: recordType
      });
    },

    /**
     * @param {number} configId
     * @param {boolean} isInactive
     */
    update: function (configId, isInactive) {
      const record = this._nRecord.load({
        id: configId,
        type: recordType
      });

      record.setValue({
        fieldId: isInactiveField,
        value: isInactive
      });

      record.save();
    }
  };

  return Config;
});
