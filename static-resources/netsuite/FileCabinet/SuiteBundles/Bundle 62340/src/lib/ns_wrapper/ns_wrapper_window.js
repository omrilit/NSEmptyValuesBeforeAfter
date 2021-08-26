/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var ns_wrapper = ns_wrapper || {};

/*
 * Must be used in the client side to have access to the browser's window object
 */
ns_wrapper.Window = function Window () {
  function forceChangeLocation (url) {
    if (url) {
      window.location.href = url;
      return url;
    } else {
      window.location.reload();
      return window.location.href;
    }
  }

  function reload () {
    return forceChangeLocation();
  }

  return {
    forceChangeLocation: forceChangeLocation,
    reload: reload
  };
};
