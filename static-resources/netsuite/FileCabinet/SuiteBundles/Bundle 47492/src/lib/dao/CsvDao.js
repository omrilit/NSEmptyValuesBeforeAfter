/**
 * Copyright © 2017, 2017, Oracle and/or its affiliates. All rights reserved.
 */ 

if (!TAF) { var TAF = {}; }
TAF.DAO = TAF.DAO || {};

TAF.DAO.CsvDAO = function _Csv() {
    this.csvData = {};
    this.MAX_RESULTS_PER_LINE = 1000;
    this.hasMoreRows = false;
    this.hasMoreFiles = false;
    this.columnMap = {};
    this.transformMap = {};
};

TAF.DAO.CsvDAO.prototype.extractData = function(fileId){
    if(!fileId){
        throw nlapiCreateError('MISSING_PARAMETER', 'CSV Parser: File Id is required');
    }
    var fileData = nlapiLoadFile(fileId).getValue();
    this.csvData = this.parse(fileData)
};

TAF.DAO.CsvDAO.prototype.getList = function (fileId){
    this.extractData(fileId);
    return this.csvData.data;
}

TAF.DAO.CsvDAO.prototype.parse = function (strdata) {
    var foundValue, fieldIndex = 0, data = [], meta = {}, arrMatches = null,
        delimiter = ',',
        header = true;
    
    var objPattern = new RegExp((
                            // Delimiters.
                            "(\\" + delimiter + "|\\r?\\n|\\r|^)" +
                            // Quoted fields.
                            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
                            // Standard fields.
                            "([^\"\\" + delimiter + "\\r\\n]*))"
                            ), "gi");
    
    if (header) { meta.fields = []; }
    else { data.push([]); }
    
    while (arrMatches = objPattern.exec(strdata)) {
        //check if delimiter is not row delimiter
        if (arrMatches[1].length > 0 && arrMatches[1] !== delimiter) {
            var isNewLine = data.length > 0 ? 
                  Object.keys(data[data.length - 1]).length > 0 ? true : false
              : true;
          if (isNewLine){
              if (header) {
                  data.push(this.container?this.container():{});
              }
              else { data.push([]); }
          }
          fieldIndex = 0;
        }
    
        //capture value
        if (arrMatches[2]) { //quoted value
            foundValue = arrMatches[2].replace(new RegExp( "\"\"", "g" ), "\"");
        }
        else { foundValue = arrMatches[3];} //unquoted value
    
        if (data.length === 0) {
            if(this.columnMap[foundValue]){
                foundValue = this.columnMap[foundValue];
            }
            meta.fields.push(foundValue);
        }
        else if (header) {
            if (fieldIndex > meta.fields.length - 1) {
                if (!data[data.length - 1].__parsed_extra) {
                    data[data.length - 1].__parsed_extra = [];
                }
                data[data.length - 1].__parsed_extra.push(foundValue);
            }
            else {
                var currField = meta.fields[fieldIndex];
                if(this.validationMap[currField]){
                    this.validationMap[currField](foundValue);
                }
                if (foundValue && !data[data.length - 1][currField]){ //do not overwrite if already existing
                    var newValue = foundValue;
                    if(this.transformMap[currField]){
                        newValue = this.transformMap[currField].call(this, foundValue);
                    }
                    data[data.length - 1][currField] = newValue;
                    
                    if(this.sourceOtherFields[currField]){
                        var target = this.sourceOtherFields[currField];
                        data[data.length - 1][target.targetField] = target.transform.call(this, newValue);
                    }
                }
                fieldIndex++;
            }
        }
        else {
               data[data.length - 1].push(foundValue);
        }
    }
    
    //remove last blank line
    data.splice(-1);

    return { data : data, meta : meta};
};
