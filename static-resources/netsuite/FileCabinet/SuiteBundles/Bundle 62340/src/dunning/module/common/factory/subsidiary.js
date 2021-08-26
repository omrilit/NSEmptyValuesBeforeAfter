/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.x
 * @NModuleScope public
 */

define(['N/record', '../class/subsidiary'], function (nRecord, Subsidiary) {
  'use strict';

  return new Subsidiary(nRecord);
});
