/**
 * Project Task Manager
 * RESX Translation : Client
 *
 * Version    Date          Author          Remarks
 *  1.00    2014 04 21      maquino         Initial version
 *  
 */
translatedStrings = {
    init : function() {
        this.defaultMap = this.loadMap(defaultRESXString);
        this.prefMap = this.loadMap(prefRESXString);
    },
    loadMap : function(xmlString) {
        var safari = (navigator.userAgent.search('Safari') != -1) ? true : false;
        var ie = (navigator.userAgent.search('MSIE') != -1 || navigator.userAgent.search('Trident') != -1) ? true : false;
        var xml, map = {};
        if (!ie) {
            xml = new DOMParser().parseFromString(xmlString, "text/xml");
        } else {
            xml = new ActiveXObject("Microsoft.XMLDOM");
            xml.async = "false";
            xml.loadXML(xmlString);
        }
        var data = xml.getElementsByTagName('data');
        var count = data.length;
        for ( var i = 0; i < count; i++) {
            if(safari){
                try
                {
                    map[data[i].attributes.name.value] = data[i].getElementsByTagName('value')[0].childNodes[0].nodeValue;
                }
                catch(err)
                {
                    map[data[i].attributes.name.value] = '';
                }
            }
            else if (ie){
                map[data[i].attributes[0].text] = data[i].text;
            }
            else {
                map[data[i].attributes.name.value] = data[i].children[0].textContent;
            }
        }
        return map;
    },
    getText : function(stringId) {
        var pref = this.prefMap[stringId];
        var def = this.defaultMap[stringId];
        if (pref) return pref;
        else if (def) return def;
        else return "ERROR";
    }
};
translatedStrings.init();