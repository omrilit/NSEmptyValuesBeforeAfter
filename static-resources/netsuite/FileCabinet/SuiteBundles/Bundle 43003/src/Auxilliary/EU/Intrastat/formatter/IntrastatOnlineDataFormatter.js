/**
 * Copyright © 2016, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};

Tax.EU.Intrastat.IntrastatOnlineDataFormatter = function Formatter() {
    Tax.EU.Intrastat.IntrastatFormatter.call(this);
    this.Name = 'IntrastatOnlineDataFormatter';
};

Tax.EU.Intrastat.IntrastatOnlineDataFormatter.prototype = Object.create(Tax.EU.Intrastat.IntrastatFormatter.prototype);

Tax.EU.Intrastat.IntrastatOnlineDataFormatter.prototype.process = function process(result, params) {
    var adapterData = result.adapter || [];
    var formattedData = [];
    var columns = this.getColumnDefinition(params);
    var row = null;
    
    this.initFormatter(params);

    for (var i = 0; i < adapterData.length; i++) {
        row = {};
        for (var key in columns) {
            row[key] = {};
            row[key].value = this.format(adapterData[i][key], columns[key]);
            row[key].properties = columns[key].properties || {};
            
            if (columns[key].islink) {
                row[key].properties.url = adapterData[i][key + 'Url'];
            }
        }
        
        formattedData.push(row);
    }
    
    return {data: formattedData, total: result.total};
};
