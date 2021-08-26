/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author ldimayuga
 */

var ns_wrapper = ns_wrapper || {};

ns_wrapper.Date = function NSWrDate (pDate) {
  var date = pDate || new Date();
  this.addDays = function addDays (days) {
    date = nlapiAddDays(date, days);
  };

  this.addMonths = function addMonths (months) {
    date = nlapiAddMonths(date, months);
  };
  this.getDate = function getDate () {
    return date;
  };
  this.toString = function toString (format) {
    return nlapiDateToString(date, format);
  };

  this.toDate = function toDate (dateString, format) {
    return nlapiStringToDate(dateString, format);
  };

  this.setDate = function setDate (inDate) {
    date.setDate(inDate);
  };

  /**
   * accepts a string date, converts it to a Date object and returns a string date of format MM/DD/YYYY
   * @param {string} date
   * @returns {string}
   */
  this.toL10nDateStringFormat = function (date) {
    var obj = this.toDate(date, 'datetime');
    if (obj) {
      return [(obj.getMonth() + 1), obj.getDate(), obj.getFullYear()].join('/');
    }
  };
};

ns_wrapper.Date.stringToDate = function (strDate, format) {
  return nlapiStringToDate(strDate, format);
};
