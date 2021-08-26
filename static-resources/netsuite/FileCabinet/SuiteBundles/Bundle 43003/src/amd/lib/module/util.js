/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define([
    'N/error',
    'N/runtime',
    'N/file',
    'N/crypto',
    'N/encode',
    'N/search',
    '../Constants',
    '../dao/FileDAO'],
function(
    error,
    runtime,
    file,
    crypto,
    encode,
    search,
    Constants,
    FileDAO) {

    var module = {

        generateRandomString: function() {
            return 'xxxxxxxxxxxxxxxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },

        generateCryptographicallyRandomString: function(guid) {
            var sKey = crypto.createSecretKey({
                guid: guid,
                encoding: encode.Encoding.UTF_8
            });
            var cipher = crypto.createCipher({
                algorithm: crypto.EncryptionAlg.AES,
                key: sKey
            });
            var cipherPayload = cipher.final({
                outputEncoding: encode.Encoding.HEX
            });
            return cipherPayload.iv;
        },

        // Finds and returns the value of the object in a given JSON
        findInJSON: function(json, key) {
            var value;
            for (var cKey in json) {
                if (cKey === key) {
                    return json[cKey];
                } else if (typeof json[cKey] === 'object' && !Array.isArray(json[cKey])) {
                    value = this.findInJSON(json[cKey], key);
                }
            }
            return value;
        },

        // TODO make a proper formatter
        formatDateToMTDDate: function(date, format) {
        	var formattedDate = date;
            var year = date.getFullYear();
            var month = ('00' + (date.getMonth() + 1)).slice(-2);
            var date = ('00' + date.getDate()).toString().slice(-2);
            var separator;
            
            switch(format) {
            	case 'shortdate': formattedDate = [month, date, year].join('/'); break;
            	default: formattedDate = [year, month, date].join('-'); break;
            }
            
            return formattedDate;
        },

        render: function(template, values) {
            var expressionList = template.match(/{{\s*[\w\.]+\s*}}/g);
            var key;
            var keys;
            for (var i = 0; expressionList && i < expressionList.length; i++) {
                key = expressionList[i].replace('{{', '').replace('}}', '');
                if (key.indexOf('.') > -1) {
                    keys = key.split('.');
                    template = template.replace(expressionList[i], values[keys[0]][keys[1]]);
                } else {
                    template = template.replace(expressionList[i], values[key]);
                }
            }
            return template;
        },

        // sample usage: formatString('Hello {0}!', 'world') -> 'Hello world!'
        formatString: function (b) {
            var a = arguments;
            return b.replace(/(\{\{\d\}\}|\{\d\})/g, function (b) {
                if (b.substring(0, 2) == "{{") return b;
                var c = parseInt(b.match(/\d/)[0]);
                return a[c + 1]
            })
        },
        
        getBundleFolder: function() {
            var SUITEBUNDLE_FOLDER = 'SuiteBundles/';
            var parentId;
            var parentSearch = search.create({
                type: 'file',
                filters: [search.createFilter({
                    name: 'name',
                    operator: search.Operator.IS,
                    values: Constants.APP.GUID
                })],
                columns: ['folder']
            });
            parentSearch.run().each(function(row) {
                parentId = row.getValue({
                    name: 'folder'
                });
            });

            var grandParentId;
            var grandParentSearch = search.create({
                type: search.Type.FOLDER,
                filters: [search.createFilter({
                    name: 'internalid',
                    operator: search.Operator.ANYOF,
                    values: [parentId]
                })],
                columns: ['parent']
            });
            grandParentSearch.run().each(function(row) {
                grandParentId = row.getValue({
                    name: 'parent'
                });
            });

            return SUITEBUNDLE_FOLDER + search.lookupFields({
                type: search.Type.FOLDER,
                id: grandParentId,
                columns: ['name']
            }).name;
        }

    };

    return module;
});
