/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var ns_wrapper = ns_wrapper || {};

ns_wrapper.Translator = function Translator (locale) {
  var translation = new suite_l10n.message.Translation(locale);

  this.getString = function getString (string) {
    return translation[string] || '';
  };

  this.getStringMap = function getStringMap (stringArray) {
    var stringMap = {};

    for (var i = 0; i < stringArray.length; i++) {
      var key = stringArray[i];
      stringMap[key] = this.getString(key);
    }

    return stringMap;
  };
};
