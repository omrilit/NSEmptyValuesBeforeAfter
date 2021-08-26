/****************************************************************
 * Description: Userevent - Upload object configuration from 
 * Web Site run functions to WD.
 * 
 * @author: Alfonso Terron
 * @Email : aterron@netsuite.com
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @version 1.0                                 @Date: 14/05/2014 
 * 
 ****************************************************************/
function uploadConfiguration(type){
	
	try{
		
		if( type == 'create' || type == 'edit' ){
		
			var record = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId()),
			config     = JSON.parse(JSON.stringify(record));
			
			/** Dynamic Generate Object Configuration **/
			
			//Remove globallibrary and html fields from configuration.			
			//arrDeleteFields = ['_sm_', '_gl_', '_mc_'];			
			delete config.custrecord_wd_config_gl_styles;
			delete config.custrecord_wd_config_gl_header;
			delete config.custrecord_wd_config_gl_footer;
			delete config.custrecord_wd_config_mc_header;
			delete config.custrecord_wd_config_mc_footer;
			delete config.custrecord_wd_sm_sharelinks;
			delete config.custrecord_wd_sm_livechat;
			delete config.custrecord_wd_config_internalrecive;
			delete config.custrecord_wd_config_mrkting_zone;
			delete config.custrecord_wd_gen_companyinfo;
						
			//Rename Attribute to remove custrecord_ from object configuration.
			for(c in config){
				
				if(c.match('_cp_') || c.match('_sm_') || c.match('_wl_') || c.match('_cq_') || c.match('_gen_')){
					delete config[c]; continue;
				}		
				
				var sliceID = (c.match('custrecord_') != null)? c.replace('custrecord_wd_','') : c;				
			    config[sliceID] = config[c];
			    if( sliceID != c ) delete config[c];
			    
			}
			
			/** Include Files and Generate Configuration ******************************/ 
			var headerCode    = renderedTags(record.getFieldValue('custrecord_wd_config_gl_header')),
				footerCode    = renderedTags(record.getFieldValue('custrecord_wd_config_gl_footer')),
				configuration = JSON.stringify(config);
					
			/** Save Object Configuration **/
			var masterCodeHeader = "<!-- WD Configuration Master Code Header [START] -->"; 
			masterCodeHeader    += headerCode;
			masterCodeHeader    += "<!-- WD Configuration Master Code Header [END] -->";
			
			nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'custrecord_wd_config_mc_header', masterCodeHeader, true);

			var masterCodeFooter = "<!-- WD Configuration Master Code Footer [START] -->";			
			masterCodeFooter    += footerCode;
			masterCodeFooter    += "<script>wd.configuration=JSON.parse('"+configuration+"');</script>";
			masterCodeFooter    += "<!-- WD Configuration Master Code Footer [END] -->";
			
			nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'custrecord_wd_config_mc_footer', masterCodeFooter, true);
			
		}
		
	}catch(e){ nlapiLogExecution('ERROR', 'e - uploadConfiguration', e); }		
}

function renderedTags(html){
	var companyid  = nlapiGetContext().getCompany();
	return html.replace(/<NLCOMPANYID>/ig, companyid);
}

function initFormConfiguration(type, action){
	
	try{		
		includeFiles();		
		setTimeout(function(){
		
			jQuery('input[id*="custrecord_wd_config_cp"]').each(function(){			
			
				var self = jQuery(this);				
				
				self.css('background-color', self.val());
				
				self.ColorPicker(
					{
						onSubmit: function(hsb, hex, rgb, el) {
							self.val('#'+hex);
							self.ColorPickerHide();
							self.css('background-color', '#'+hex);
							self.css('color', (hex<"542854")? '#FFFFFF' : '#000000' );
						},
						onBeforeShow: function () {
							self.ColorPickerSetColor(this.value.replace('#',''));
						}
					}
				);
			});
		}, 600);
		
		
	}catch(e){ alert('ERROR e - initFormConfiguration' + e); }
}

function includeFiles(){

	var wrap = jQuery('body');
	
	var links =  '<link rel="stylesheet" type="text/css" href="/site/suiteoffice/colorpicker/css/colorpicker.css">';
	links     += '<link rel="stylesheet" type="text/css" href="/site/suiteoffice/colorpicker/css/layout.css">';
	//links     += "<script type='text/javascript' src='/site/suiteoffice/colorpicker/js/eye.js'></script>";
    
    jQuery('head').append(jQuery('<script>').attr({src:'/site/suiteoffice/colorpicker/js/eye.js'}));
    jQuery('head').append(jQuery('<script>').attr({src:'/site/suiteoffice/colorpicker/js/utils.js'}));
    jQuery('head').append(jQuery('<script>').attr({src:'/site/suiteoffice/colorpicker/js/colorpicker.js'}));
	//links     += '<script type="text/javascript" src="/site/suiteoffice/colorpicker/js/utils.js"></script>';
	//links     += '<script type="text/javascript" src="/site/suiteoffice/colorpicker/js/colorpicker.js"></script>';
	
	wrap.append(links);
}