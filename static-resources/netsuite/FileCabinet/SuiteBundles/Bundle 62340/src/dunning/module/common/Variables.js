/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope public
 */

define(['./utils'],
  function (utils) {
    'use strict';

    /**
     * @name Variables
     * @param {Array.<Variable>} variables
     * @constructor
     */
    const Variables = function (variables) {
      /**
       * Returns an ID of Localization Variable Record by value and type of its "value"-column.
       * @param {string} value
       * @param {InternalId} [type]
       * @returns {InternalId|null}
       */
      this.get = function (value, type) {
        var found = variables.filter(utils.getFilter('value', value));

        if (type) {
          found = found.filter(utils.getFilter('type', type));
        }

        return found.length > 0 ? found[0].id : null;
      };

      /* istanbul ignore next: istanbul cannot see the test */
      /**
       * @param {InternalId} type
       * @returns {StringMap} Keys are IDs and values are Names
       */
      this.getByType = function (type) {
        const found = variables.filter(utils.getFilter('type', type));
        return utils.getDictionary(found, 'id', 'name');
      };

      /**
       * @constant
       * @enum {InternalId}
       */
      this.Type = {
        DUNNING_SOURCE: this.get('dunning_source'),
        EVALUATION_RESULT_STATUS: this.get('dunning_eval_result_status'),
        LETTER_TYPE: this.get('letter_type'),
        TYPE: this.get('var_type')
      };

      /**
       * @constant
       * @enum {InternalId}
       */
      this.EVALUATION_RESULT_STATUS = {
        QUEUED: this.get('queued', this.Type.EVALUATION_RESULT_STATUS),
        PENDING: this.get('pending', this.Type.EVALUATION_RESULT_STATUS),
        REMOVED: this.get('removed', this.Type.EVALUATION_RESULT_STATUS)
      };

      /**
       * @constant
       * @enum {InternalId}
       */
      this.LETTER_TYPE = {
        EMAIL: this.get('email', this.Type.LETTER_TYPE),
        PDF: this.get('pdf', this.Type.LETTER_TYPE)
      };
    };

    return Variables;
  });
