/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.x
 * @NModuleScope public
 */

define(function () {
  'use strict';

  /**
   * @param {module:N/runtime} nRuntime
   * @constructor
   */
  function Runtime (nRuntime) {
    this._nRuntime = nRuntime;
  }

  Runtime.prototype = {
    /**
     * @returns {boolean}
     */
    isOneWorld: function () {
      return this._nRuntime.isFeatureInEffect({
        feature: 'SUBSIDIARIES'
      });
    },

    /**
     * @returns {boolean}
     */
    isSingleInstance: function () {
      return !this.isOneWorld();
    }
  };

  return Runtime;
});
