/**
 * Copyright © 2017, 2017, 2018, 2019 Oracle and/or its affiliates. All rights reserved.
 * 
 * @NAPIVersion 2.1
 * 
 */ 
 
define(['./taf_report_mexico',
		'./taf_report_germany_ap',
		'./taf_report_germany_ar',
	  	'./taf_report_germany', 
		], reportConfig);

function reportConfig(mexico, germanyap, germanyar, germany){
    
    var reportConfigMap = {
            'JOURNAL_MX_XML' : mexico,
            'DE_GDPDU_AP_TXT' : germanyap,
            'DE_GDPDU_AR_TXT' : germanyar,
            'DE_GDPDU_GL_TXT' : germany,
            
    };
    
    var reportConfig = function (reportId){
        return reportConfigMap[reportId] || null;        
    };
    
    return reportConfig;
};
