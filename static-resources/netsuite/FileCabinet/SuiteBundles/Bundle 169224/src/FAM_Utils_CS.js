/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 */

var FAM;
if (!FAM) { FAM = {}; }

// implemented as an object as member functions should have no dependency of each other
FAM.Util_CS = {
    /**
     * Checks the value of convention against depreciation period
     *
     * Parameters:
     *     deprMethodId
     *     convention
     * Returns:
     *     void
    **/
    checkConvention : function (deprMethodId, convention) {
        var deprPeriod;

        if (!deprMethodId) { // no values loaded yet
            return true;
        }

        convention = +convention || FAM.Conventions.None;
        deprPeriod = +nlapiLookupField('customrecord_ncfar_deprmethod', deprMethodId,
            'custrecord_deprmethoddeprperiod');

        if ((deprPeriod === FAM.DeprPeriod.Annually &&
                convention === FAM.Conventions['Mid-Month']) ||
            (deprPeriod === FAM.DeprPeriod.Monthly &&
                (convention === FAM.Conventions['Half-Year'] ||
                convention === FAM.Conventions['Mid-Quarter']))) {

            return false;
        }

        return true;
    },

    /**
     * Accepts a hashmap of message ids to fetch messages from resource list
     *
     * Parameters:
     *     msgIds {string{}} - message ids to be retrieved
     *     screenName {string} - category identifier for the strings
     * Returns:
     *     {string{}} - object containing the messages identified by message id
    **/
    fetchMessageObj : function (msgIds, screenName) {
        var id, suParams, response, messages, DELIMITER = '$$', ret = {}, messageId = [];

        for (id in msgIds) {
            messageId.push(msgIds[id]);
        }

        suParams = {
            'custpage_messageid' : messageId.join(DELIMITER),
            'custpage_delimiter' : DELIMITER
        };

        if (screenName) {
            suParams.custpage_pageid = screenName;
        }

        //Request for String translation for messages
        response = nlapiRequestURL(
            nlapiResolveURL('SUITELET', 'customscript_fam_language_resource',
                'customdeploy_language_resource_deploy', false),
            suParams
        );

        //Store chain messages to array
        messages = response.getBody().split(DELIMITER);
        messages.reverse();

        for (id in msgIds) {
            ret[id] = messages.pop();
        }

        return ret;
    },

    /**
    * Replace first instance of (word) with the an html formatted link
    * Parameters
    *     {String} - msg: the display message; Requires a word enveloped in ()
    *     {String} - link: the html link
    * Return
    *     {String} - html formatted syntax for link message
    */
    insertLink : function (msg, link) {
        if(!msg || !link) return null;

        var linkLabel   = msg.slice((msg.indexOf('(') + 1),+msg.indexOf(')')),
            linkHtml    = '<a href=' + link + '>' + linkLabel + '</a>';
        return msg.replace('(','').replace(')','').replace(linkLabel, linkHtml);
    }
};

/**
 * Object.keys
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
 */
if (!Object.keys) {
  Object.keys = (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}

/**
 * Array.prototype.indexOf
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
 * Production steps of ECMA-262, Edition 5, 15.4.4.14
 * Reference: http://es5.github.io/#x15.4.4.14
 */
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(searchElement, fromIndex) {

    var k;

    // 1. Let o be the result of calling ToObject passing
    //    the this value as the argument.
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }

    var o = Object(this);

    // 2. Let lenValue be the result of calling the Get
    //    internal method of o with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = o.length >>> 0;

    // 4. If len is 0, return -1.
    if (len === 0) {
      return -1;
    }

    // 5. If argument fromIndex was passed let n be
    //    ToInteger(fromIndex); else let n be 0.
    var n = +fromIndex || 0;

    if (Math.abs(n) === Infinity) {
      n = 0;
    }

    // 6. If n >= len, return -1.
    if (n >= len) {
      return -1;
    }

    // 7. If n >= 0, then Let k be n.
    // 8. Else, n<0, Let k be len - abs(n).
    //    If k is less than 0, then let k be 0.
    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    // 9. Repeat, while k < len
    while (k < len) {
      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the
      //    HasProperty internal method of o with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      //    i.  Let elementK be the result of calling the Get
      //        internal method of o with the argument ToString(k).
      //   ii.  Let same be the result of applying the
      //        Strict Equality Comparison Algorithm to
      //        searchElement and elementK.
      //  iii.  If same is true, return k.
      if (k in o && o[k] === searchElement) {
        return k;
      }
      k++;
    }
    return -1;
  };
}

/**
 * Function.prototype.bind
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
 */
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    if (this.prototype) {
      // Function.prototype doesn't have a prototype property
      fNOP.prototype = this.prototype; 
    }
    fBound.prototype = new fNOP();

    return fBound;
  };
}

/**
 * Wrapper function for reloading page for stubbing purposes
**/
function reloadPage() {
    window.location.reload();
}

function redirectPage(link) {
    window.location = link;
}