/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['N/runtime', 'N/cache', 'N/https', 'N/redirect', './module/error', './base/BaseAuthorization', './module/util', './Constants'],
        function(runtime, cache, https, redirect, error, BaseAuthorization, filingUtil, Constants) {

    var tokenHelperModule = {
        isExpired: function(token) {
            var currentDateTime = new Date().getTime();
            return currentDateTime > token.validUntil;
        }
    };

    AuthorizationCode = function(config, requestParameters) {
        BaseAuthorization.call(this);
        this.name = 'AuthorizationCode';
        this.session = runtime.getCurrentSession();
        this.cache = cache.getCache({
            name: Constants.CACHE_ID,
            scope: cache.Scope.PRIVATE
        });
        this.config = config;
        this.requestParameters = requestParameters;
        this.stateId = config.id ? [config.id, Constants.STATE_ID].join('-') : Constants.STATE_ID;
        this.https = https;
        this.filingUtil = filingUtil;
    }

    util.extend(AuthorizationCode.prototype, BaseAuthorization.prototype);

    // this is called if there is no token in session
    AuthorizationCode.prototype.authorize = function(params) {
        var token;
        var code = this.getAuthorizationCode();
        if (code) {
            token = this.requestToken(code);
        }
        return token;
    };

    AuthorizationCode.prototype.requestToken = function(code) {
        var postData = {
            url: this.config.baseURI + this.config.token,
            body: {
                grant_type: 'authorization_code',
                client_id: this.config.clientCredentials.id,
                client_secret: this.config.clientCredentials.secret,
                code: code,
                redirect_uri: this.config.redirectURI
            },
            headers: {
                Accept: 'application/' + this.config.version,
                Content_Type: 'application/json'
            }
        };
        var response = this.https.post(postData);
        var responseBody = response.body ? JSON.parse(response.body) : {};
        if (response.code == Constants.HTTP.Status.OK) {
            return this.transformToken(responseBody);
        } else {
            error.throw({
                code: responseBody.error,
                message: responseBody.error_description
            }, this.name + '.requestToken');
        }
    };

    AuthorizationCode.prototype.transformToken = function(rawToken) {
        var currentDateTime = new Date();
        var validUntil = new Date(
                currentDateTime.setSeconds(currentDateTime.getSeconds() +
                        (rawToken.expires_in - Constants.MIN_TIME_IN_SEC))).getTime(); // add 5-minute buffer
        return {
            accessToken: rawToken.access_token,
            refreshToken: rawToken.refresh_token,
            validUntil: validUntil,
            tokenType: rawToken.token_type,
            grantedScopes: rawToken.scope.split(' ')
        };
    };

    AuthorizationCode.prototype.storeState = function(state) {
        this.cache.put({
            key: this.stateId,
            value: state,
            ttl: Constants.MIN_TIME_IN_SEC // 5mins
        });
        return state;
    };

    AuthorizationCode.prototype.generateAuthorizationURI = function(state) {
        if (!state) {
            error.throw({
                code: 'AUTHORIZATION_ERROR',
                message: 'State is a required parameter'
            }, this.name + '.generateAuthorizationURI');
        }
        var url = this.config.baseURI + this.config.authorization;
        var queryParams;
        
        var state = this.storeState(state);
        queryParams = [
            'response_type=code',
            'client_id=' + this.config.clientCredentials.id,
            'scope=' + encodeURIComponent(this.config.scope.join(' ')),
            'state=' + state,
            'redirect_uri=' + encodeURIComponent(this.config.redirectURI)
        ].join('&');

        return [url, queryParams].join('?');
    };

    AuthorizationCode.prototype.getAuthorizationCode = function() {
        var code = this.requestParameters.code;
        var state = this.requestParameters.state;
        var authError = this.requestParameters.error;

        if (authError) {
            error.throw({ code: authError.code, message: authError.description }, '');
        } else if (code) {
            var cachedState = this.cache.get({ key: this.stateId });
            this.cache.remove({ key: this.stateId });
            if (state !== cachedState) {
                error.throw({
                    code: 'AUTHORIZATION_ERROR',
                    message: 'State is invalid'
                }, this.name + '.getAuthorizationCode');
            }
        }
        return code;
    };

    return {
        // Technical Debt
        // The idea here is to have an implementation for each grant
        // Right now, we only have the Authorization Code Grant Flow
        AuthorizationCode: AuthorizationCode,
        token: tokenHelperModule
    };
});
