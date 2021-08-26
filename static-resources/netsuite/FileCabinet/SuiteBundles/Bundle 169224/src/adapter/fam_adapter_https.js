/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 */

define(['N/https'], function (https) {
    var module = {};
    
    module.createSecureKey = function (options) {
        return https.createSecureKey(options);
    };
    
    module.createSecureString = function (options) {
        return https.createSecureString(options);
    };
    
    module.delete = function (options) {
        return https.delete(options);
    };
    
    module.get = function (options) {
        return https.get(options);
    };
    
    module.getCacheDuration = function (param) {
        return param ? https.CacheDuration[param] : https.CacheDuration;
    };
    
    module.getClientResponse = function (param) {
        return param ? https.ClientResponse[param] : https.ClientResponse;
    };
    
    module.getEncoding = function (param) {
        return param ? https.Encoding[param] : https.Encoding;
    };
    
    module.getMethod = function (param) {
        return param ? https.Method[param] : https.Method;
    };
    
    module.getSecureString = function (param) {
        return param ? https.SecureString[param] : https.SecureString;
    };
    
    module.getServerRequest = function (param) {
        return param ? https.ServerRequest[param] : https.ServerRequest;
    };
    
    module.getServerResponse = function (param) {
        return param ? https.ServerResponse[param] : https.ServerResponse;
    };
    
    module.post = function (options) {
        return https.post(options);
    };
    
    module.put = function (options) {
        return https.put(options);
    };
    
    module.request = function(options) {
        return https.request(options);
    };
    
    return module;
});
