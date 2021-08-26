/**
 * Copyright © 2017, 2018, 2019 Oracle and/or its affiliates. All rights reserved.
 * 
 */

define([], constants);

function constants() {
    
    var tafConstants = {};
    
    tafConstants.taskStatus = {
        PENDING     : 1,
        INPROGRESS  : 2,
        COMPLETE    : 3,
        FAILED      : 4
    };
    
    tafConstants.completionPercentages = {
    		percent20	: 20.00,
    		percent30	: 30.00,
    		percent50	: 50.00
	};
    
    tafConstants.bundleConfig = {
        appGuid : '0ff667bf-1663-447e-b23c-5282653a6bca',
        rawFilesFolder : 'Raw Files'
    };
    
    return tafConstants;
}