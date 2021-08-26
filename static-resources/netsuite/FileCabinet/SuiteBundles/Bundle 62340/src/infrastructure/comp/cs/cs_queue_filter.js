/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author ldimayuga
 */
var infra = infra || {};
infra.comp = infra.comp || {};
infra.comp.cs = infra.comp.cs || {};

infra.comp.cs.DunningQueueFilter = function DunningQueueFilter (formStateObject) {
  this.renderPage = function renderPage () {
    var url = ns_wrapper.api.url.resolveUrlWithParams(formStateObject);
    new ns_wrapper.Window().forceChangeLocation(url);
  };
};
