/**
 * Module Description
 * 
 *   Version        Date            Author 
 *    1.00       21 mar 2014     Alfonso Terron
 *
 **/
jQuery(function(){	
	jQuery.fn.extend({
		 
		 tmpl : function(elemt, jsonData, event, _function, elem){
			 if(jsonData == null || !(jsonData instanceof Object) || !(typeof elemt === 'string') || elemt === '')
				 return;			 
			 //Get tmpl form tag script with template html			 
			 for( key in jsonData)
				 if(jsonData[key] instanceof Object)
					 elemt = elemt.replace( new RegExp("{{"+key+"}}", 'g') ,unescape(jsonData[key].name));
				 else
					 elemt = elemt.replace( new RegExp("{{"+key+"}}", 'g') ,unescape(jsonData[key]));			 
			 
			 elemt = elemt.replace(/{{\w*}}/ig, "");
			 
			 if(event && _function) elemt = jQuery(elemt).on(event, elem, _function);
			 
			 this.append(elemt);
		 },		
	
		tmplStr : function(elemt, jsonData){			 
			if(jsonData == null || !(jsonData instanceof Object) || !(typeof elemt === 'string') || elemt === '')
				 return;			 
			 //Get tmpl form tag script with template html
			 for( key in jsonData)
				 if(jsonData[key] instanceof Object)
					 elemt = elemt.replace( new RegExp("{{"+key+"}}", 'g') ,unescape(jsonData[key].name));
				 else
					 elemt = elemt.replace( new RegExp("{{"+key+"}}", 'g') ,unescape(jsonData[key]));
			 		 
			 return elemt.replace(/{{\w*}}/ig, "");
		 },
		 
		 changeElementType : function(newType) {
		        var attrs = {},
		        self      = this;

		        $.each(self[0].attributes, function(idx, attr) {
		            attrs[attr.nodeName] = attr.nodeValue;
		        });
		        		        
		        this.replaceWith(function() {
		        	if(newType === 'input')		        		
		        		return $("<" + newType + "/>", attrs).val(self.text()).append($(this).contents());
		        	else
		        		return $("<" + newType + "/>", attrs).append($(this).contents());
		        });
		  }		 
	});
	jQuery.expr[':'].Contains = function(a, i, m) {		
		var l = jQuery(a).text().toUpperCase().split(' ');			
		return l.indexOf( m[3].toUpperCase() ) >= 0;	
	};
});