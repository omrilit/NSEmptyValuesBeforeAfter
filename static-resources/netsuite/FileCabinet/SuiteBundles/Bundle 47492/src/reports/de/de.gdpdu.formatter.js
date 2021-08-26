var TAF = TAF || {};
TAF.DE = TAF.DE || {};
TAF.DE.GDPDU = TAF.DE.GDPDU || {};

TAF.DE.GDPDU.Formatter = function() {
    this.charMap = {
        quote: {regex: /"/g, replaceChar: ''},
        tab: {regex: /\t/g, replaceChar: ' '},
        feed: {regex: /\r\n|\n|\r/g, replaceChar: ' '},
        enq: {regex: //g, replaceChar: ''}
    };
};

TAF.DE.GDPDU.Formatter.prototype.cleanString = function(string) {
    var mapping = null;
    
    for (var char in this.charMap) {
        mapping = this.charMap[char];
        string = string.replace(mapping.regex, mapping.replaceChar);
    }
    
    return string;
};
