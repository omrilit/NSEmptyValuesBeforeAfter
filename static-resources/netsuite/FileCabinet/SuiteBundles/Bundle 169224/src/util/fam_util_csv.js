/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 */

define([], function (){
    function convertValuesToValidCsv(values) {
        var convertedFields = {};
        for (var j in values){
            convertedFields[j] = values[j].replace(/\n/g, ' ');
            if (convertedFields[j].indexOf(',') !== -1){
                convertedFields[j] = convertedFields[j].replace(/"/g, '""');
                convertedFields[j] = '"' + convertedFields[j] + '"';
            } 
        }
        return convertedFields;
    };

    /**
     * Parses CSV Strings and converts to JavaScript Readable Objects
     *
     * Parameters:
     *     strData {string} - CSV String to be parsed
     *     config {Object} - configurations below
     *         delimiter {string} - delimiter used on the CSV String
     *         header {boolean} - denotes that the first row of data will be the field names
     * Returns:
     *     {Object} - parsed object with details below
     *         data {Array|Object} - parsed data, if header: true, is an Object, otherwise an Array
     *             __parsed_extra {Array} - extra fields parsed if header: true
     *         meta {Object} - container for CSV String Information
     *             fields {Array} - fields parsed when header: true
    **/
    function parseText(strData, config) {
        var foundValue, fieldIndex = 0, data = [], meta = {}, arrMatches = null,
            delimiter = config && config.delimiter || ',',
            header = config && config.header,
            objPattern = new RegExp((
                // Delimiters.
                "(\\" + delimiter + "|\\r?\\n|\\r|^)" +
                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
                // Standard fields.
                "([^\"\\" + delimiter + "\\r\\n]*))"
            ), "gi");
        
        if (header) { meta.fields = []; }
        else { data.push([]); }
        while (arrMatches = objPattern.exec(strData)) {
            //check if delimiter is not row delimiter
            if (arrMatches[1].length > 0 && arrMatches[1] !== delimiter) {
                var isNewLine = data.length > 0 ? 
                      Object.keys(data[data.length - 1]).length > 0 ? true : false
                  : true;
              if (isNewLine){
                  if (header) {
                      data.push({});
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
                    if (foundValue){
                        data[data.length - 1][meta.fields[fieldIndex]] = foundValue;
                    }
                    
                    fieldIndex++;
                }
            }
            else {
                data[data.length - 1].push(foundValue);
            }
        }
        
      //blank last line checking
      if (data.length > 0 && 
              Object.keys(data[data.length - 1]).length === 0){
          data.splice(-1);
      }
      
      return { data : data, meta : meta };
    };
    
    return {
        convertValuesToValidCsv : convertValuesToValidCsv,
        parseText : parseText
    };
});