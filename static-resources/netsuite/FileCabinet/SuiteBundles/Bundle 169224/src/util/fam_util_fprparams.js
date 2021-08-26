/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 */

define(['../adapter/fam_adapter_record'], 
function (record) {
    return {
        getAssetList : function (params) {
            var assetList = [];
            if (params.recsToProcess) {
                for (var i in params.recsToProcess) {
                    assetList = assetList.concat(params.recsToProcess[i].assets);
                }
            }
            return assetList;
        },
        
        moveAssetsToRecsFailed : function(fprRecs, assetIdList){
            var recsToProcess = fprRecs.recsToProcess || {},
                recsFailed = fprRecs.recsFailed || {};
                
            for (var j in recsToProcess){
                var assets = recsToProcess[j].assets;
                var origListLength = assetIdList.length;
                
                if (!origListLength){
                    break;
                }
               
                assetIdList = assetIdList.filter(function(i){
                    return assets.indexOf(i) < 0;
                });
                
                if (origListLength != assetIdList.length){
                    recsFailed[j] = recsToProcess[j];
                    delete recsToProcess[j];
                }
            }
                
            return {
                recsToProcess : recsToProcess,
                recsFailed : recsFailed
            }
        },
    }
});
