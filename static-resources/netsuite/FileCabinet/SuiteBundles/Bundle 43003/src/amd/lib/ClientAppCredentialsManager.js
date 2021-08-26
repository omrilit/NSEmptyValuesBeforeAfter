/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['./module/error', './dao/OnlineFilingAuthorizationDAO', './Constants'], function(error, OnlineFilingAuthorizationDAO, Constants) {

    var ClientAppCredentialsManager = function() {
        this.name = 'ClientAppCredentialsManager';
        this.onlineFilingAuthorizationDAO = new OnlineFilingAuthorizationDAO();
    }

    ClientAppCredentialsManager.prototype.get = function(id) {
        try {
            var onlineFilingAuth = this.onlineFilingAuthorizationDAO.get(id);
            return onlineFilingAuth ? onlineFilingAuth.credentials : null;
        } catch(ex) {
            log.error({ title: 'ClientAppCredentialsManager.get', details: ex.code + ' : ' + ex.message });
            error.throw(
                { code: 'NO_CREDENTIALS_FOUND', message: 'No client application credentials found' },
                'ClientAppCredentialsManager.get'
            );
        }
    };

    return ClientAppCredentialsManager;
});
