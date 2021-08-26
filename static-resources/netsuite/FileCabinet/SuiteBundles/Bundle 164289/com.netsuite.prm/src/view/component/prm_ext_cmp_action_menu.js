/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var HeaderActionMenuUtil = (function () {
    
    var hideNode = function (node) {
        node.data.isHidden = true;
        var el1 = Ext4.get(PRM.App.Grid.getView().getNode(node));
        if (el1 && el1.addCls) {
            el1.addCls('prm-display-none');
        }
        var el2 = Ext4.get(PRM.App.Grid.lockedGrid.getView().getNode(node));
        if (el2 && el2.addCls) {
            el2.addCls('prm-display-none');
        }
    };
    
    var showNode = function (node) {
        node.data.isHidden = false;
        var el1 = Ext4.get(PRM.App.Grid.getView().getNode(node));
        if (el1 && el1.addCls) {
            el1.removeCls('prm-display-none');
        }
        var el2 = Ext4.get(PRM.App.Grid.lockedGrid.getView().getNode(node));
        if (el2 && el2.addCls) {
            el2.removeCls('prm-display-none');
        }
    };
    
    var eachSubNode = function (fnCallBack, type) {
        PRM.App.Grid.getRootNode().eachChild(function (projectNode) {
            projectNode.eachChild(function (subNode) {
                if (type) {
                    if (subNode && subNode.data.type == type) {
                        fnCallBack(subNode);
                    }
                } else {
                    fnCallBack(subNode);
                }
            });
        });
    };
    
    var eachResourceSummary = function (fnCallBack) {
        eachSubNode(function (subNode) {
            fnCallBack(subNode);
        }, 'resource-summary');
    };
    
    var eachTask = function (fnCallBack) {
        eachSubNode(function (subNode) {
            fnCallBack(subNode);
        }, 'task');
    };
    
    var toggleNode = function (shown, node) {
        if (shown) {
            hideNode(node);
        } else {
            showNode(node);
        }
    };
    
    return {
        hideNode : hideNode,
        showNode : showNode,
        toggleNode : toggleNode,
        eachResourceSummary : eachResourceSummary,
        eachTask : eachTask
    };
    
})();