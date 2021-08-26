/**
 * � 2015 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or
 * otherwise make available this code.
 * 
 * @NScriptName FAM Translation Facility
 * @NScriptId _fam_translator_su
 * @NApiVersion 2.0
*/
define(['N/config', 'N/search', 'N/file', 'N/xml'],
     function (config, search, file, xml){
        function getFileId(filename){
            var searchObj, res,
                defaultFileName = 'fam_resource.en_US.resx.xml';
    
            searchObj = search.create({
                type    : 'file',
                filters : [['name', 'is', filename]],
                columns : ['internalid']
            });
           
            res = searchObj.run().getRange(0,1);
            
            if(res.length == 0){
                searchObj = search.create({
                    type    : 'file',
                    filters : [['name', 'is', defaultFileName]],
                    columns : ['internalid']
                });
                
                res = searchObj.run().getRange(0,1);
            }
            
            if(res.length == 0){
                log.debug('Translation', 'Unable to find translation resource files');
                return null;
            }
            
            return res[0].getValue('internalid');
        }
        
        
        function getResxFileName(){
            var userInfo = config.load({type: config.Type.USER_PREFERENCES}),
                lang = userInfo.getValue('LANGUAGE');
            return 'fam_resource.' + lang + '.resx.xml';
        }
        
        function loadFile(fileid){
            var xfile = file.load({id: fileid});
            return xfile;
        }
        
        function openCustomResourceFile(loadDefault){
            var resxFileName, fileId, file;
            resxFileName = loadDefault?'fam_resource.en_US.resx.xml':getResxFileName();
            fileId = getFileId(resxFileName);
            if (fileId == null) { return null; }
            
            file = loadFile(fileId);
            if (file == null) { return null; }
    
            var xml = file.getContents().replace(/<\?xml(.|[\n])*?\?>/i, '');
            return xml;
        }
        
        function getXMLData(loadDefault){
            var xmlStr;
            if(loadDefault){
                if(!this.xmlData_en_US){
                    xmlStr = openCustomResourceFile(loadDefault);
                    this.xmlData_en_US  = xml.Parser.fromString(xmlStr);
                }
                return this.xmlData_en_US;
            }else{
                if(!this.xmlData){
                    xmlStr = openCustomResourceFile();
                    this.xmlData  = xml.Parser.fromString(xmlStr);
                }
                return this.xmlData;
            }
        }
        
        function injectMessageParameter(strVar, param){
            var returnValue = strVar;
            var paramPattern = /[(]\d[)]/g;

            var paramList = returnValue.match(paramPattern);
            
            for(i in paramList){
                if (!isNaN(i) && param[i] != null){
                    returnValue = returnValue.replace(paramList[i],param[i]);
                }
            }
            return returnValue;
        }
        
        return {
            getXmlData : function getXmlData(fieldName, pageName) {
                var xmlDoc, xmlData, xpath = '//data[@name="' + fieldName + '"';
                if (pageName){
                    xpath += ' and @page="' + pageName + '"]';
                }
                else{
                    xpath += ' and not(@page)]';
                }
                
                xmlDoc = getXMLData();
                xmlData = xml.XPath.select({node:xmlDoc, xpath:xpath});
                
                if (xmlData.length == 0){ 
                    xmlDoc = getXMLData(true); //try default (english)
                    xmlData = xml.XPath.select({node:xmlDoc, xpath:xpath});
                }
                
                return xmlData;
            },
            
            getString : function getString(fieldName, pageName, messageParam){
                var xmlValue, xmlData = this.getXmlData(fieldName, pageName);
                
                if (xmlData && xmlData.length > 0){ 
                    xmlValue = xmlData[0].textContent.replace(/^\s+|\s+$/g,"");
                    
                    if(messageParam){
                        xmlValue = injectMessageParameter(xmlValue, messageParam);
                    }
                }
                else {
                    xmlValue = '(' + fieldName + ')';
                }
                
                return xmlValue;
            },
            InjectMessageParameter: injectMessageParameter
    };
});
