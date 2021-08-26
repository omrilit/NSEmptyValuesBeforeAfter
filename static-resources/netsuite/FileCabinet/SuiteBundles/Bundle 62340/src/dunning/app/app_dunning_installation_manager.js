/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author ldimayuga
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningConfigurationInstallationManager = function DunningConfigurationInstallationManager () {
  var Search = ns_wrapper.Search;
  var SUBSIDIARY_RECORD = 'subsidiary';
  var CONFIG_RECORD = 'customrecord_3805_dunning_config';
  var SUBSIDIARY_FIELD = 'custrecord_3805_config_subsidiary';
  var search;

  /**
   * This function returns all subsidiaries without prior Dunning Configurations
   * @returns list of subsidiaries
   */
  this.getSubsToConfigure = function getSubsToConfigure () {
    var allSubs = getAllSubsidiaries();
    var subsWithConfig = this.getSubsidiariesWithConfig();
    var qualifiedSubs = [];

    for (var i = 0; i < allSubs.length; i++) {
      var index = subsWithConfig.indexOf(allSubs[i]);

      if (index == -1) { // no config yet
        qualifiedSubs.push(allSubs[i]);
      }
    }

    return qualifiedSubs;
  };

  /**
   * This function returns all subsidiaries
   * @returns list of all subsidiaries
   */
  function getAllSubsidiaries () {
    search = new Search(SUBSIDIARY_RECORD);
    var subsIterator;
    var subsList = [];

    search.addFilter('iselimination', 'is', 'F');
    search.addFilter('isinactive', 'is', 'F');

    search.addColumn('name');

    subsIterator = search.getIterator();

    if (subsIterator) {
      var r;
      while (subsIterator.hasNext()) {
        r = subsIterator.next();
        subsList.push(r.getId());
      }
    }

    return subsList;
  }

  /**
   * This function returns subsidiaries with Dunning Configuration
   * @returns list of subsidiaries with dunning config
   */
  this.getSubsidiariesWithConfig = function getSubsidiariesWithConfig () {
    search = new Search(CONFIG_RECORD);
    var subsIterator;
    var subsList = [];

    search.addColumn(SUBSIDIARY_FIELD);

    subsIterator = search.getIterator();

    if (subsIterator) {
      var r;
      while (subsIterator.hasNext()) {
        r = subsIterator.next();
        subsList.push(r.getValue(SUBSIDIARY_FIELD));
      }
    }

    return subsList;
  };
};
