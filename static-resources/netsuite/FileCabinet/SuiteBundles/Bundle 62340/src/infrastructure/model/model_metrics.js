/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This is the model objects of the usage metrics.
 *
 * @author cboydon
 */

var model = model || {};

model.Metrics = function Metrics () {
  var obj = {
    'id': null,
    'name': null,
    'value': null,
    'startDateTime': null,
    'endDateTime': null,
    'runTime': null,
    'month': null,
    'year': null
  };

  Object.seal(obj);
  return obj;
};
