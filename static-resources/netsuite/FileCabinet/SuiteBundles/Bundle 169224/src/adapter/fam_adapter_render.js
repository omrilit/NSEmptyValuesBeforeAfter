/**
 * © 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

define(['N/render'],
    famAdapterRender);

function famAdapterRender(render) {
    var module = {};
    module.create = function(options) {
        return render.create();
    };
    
    return module;
}