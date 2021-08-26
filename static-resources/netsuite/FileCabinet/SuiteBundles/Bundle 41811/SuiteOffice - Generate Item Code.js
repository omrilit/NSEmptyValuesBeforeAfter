/***************************************************************
 * Description:  Process Item User event, Generate HTML Code.
 *
 * @author: Alfonso Terron
 * @Email : aterron@netsuite.com
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @version 1.0                               @Date: 20/05/2014
 *
 ***************************************************************/

var noimage = '/site/suiteoffice/img/noimage.jpg';

function initialize(type){

	if(type == 'create' || type == 'edit'){

		var item = null;

		if(nlapiGetFieldValue('custitem_wd_refresh_image_gallery') == 'T'){
			item = item || nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
			generateImageGallery(type, item);
		}

		if(nlapiGetFieldValue('custitem_wd_refresh_relateditem') == 'T'){
			item = item || nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
			generateRelatedItems(type, item);
		}

		if(nlapiGetFieldValue('custitem_wd_badges_refresh') == 'T'){
			item = item || nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
			generateBadgesHTML(type, item);
		}

		if(nlapiGetFieldValue('custitem_wd_cust_keywords') != null)
			processHasKeywords();

		try{
			if( item ){ modelError('ok'); nlapiSubmitRecord(item, false, true); }
		}catch(e){ modelError('initialize Submit Record: ' + e);  }
	}
}

function autoRefreshDetect(type, acction){

	try{

		if(acction && ( acction.match('storedisplaythumbnail') || acction.match('storedisplayimage') || acction.match('custitem_wd_image_gallery') ) && nlapiGetFieldValue('custitem_wd_refresh_image_gallery') == 'F')
			nlapiSetFieldValue('custitem_wd_refresh_image_gallery', 'T');

		if(type == 'presentationitem' && nlapiGetFieldValue('custitem_wd_refresh_relateditem') == 'F')
			nlapiSetFieldValue('custitem_wd_refresh_relateditem', 'T');

		if(acction && acction == 'custitem_wd_badges' && nlapiGetFieldValue('custitem_wd_badges_refresh') == 'F' )
			nlapiSetFieldValue('custitem_wd_badges_refresh', 'T');

	}catch(e){ console.log('autoRefreshDetect: ' + e); }
}

function processHasKeywords(type, item){

	try {

		var keywords;

		if (item){
			keywords = item.getFieldValue('itemid') + ' ' +
			item.getFieldValue('storedisplayname')  + ' ' +
			item.getFieldValue('storedescription')  + ' ' +
			item.getFieldValue('searchkeywords');

			item.setFieldValue('custitem_wd_cust_keywords', keywords);
		}else{
			keywords = nlapiGetFieldValue('itemid') + ' ' +
			nlapiGetFieldValue('storedisplayname')  + ' ' +
			nlapiGetFieldValue('storedescription')  + ' ' +
			nlapiGetFieldValue('searchkeywords');

			nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'custitem_wd_cust_keywords', keywords);
		}

	}catch (e){ modelError('processHasKeywords: ' + e); }

}

function generateImageGallery(type, item){

	try{

		var _continue = true, index = 0, fieldID = 2, carousel  = '', slider    = '';

		if(item.getFieldValue('storedisplayimage') && item.getFieldValue('storedisplaythumbnail')){
			carousel = getTemplateCarousel().replace(/{{src}}/ig, nlapiLoadFile(item.getFieldValue('storedisplayimage')).getURL() || noimage)
											.replace('{{i}}', index)
											.replace('{{active}}', 'active');
			slider   = getTemplateSlider().replace(/{{src}}/ig, nlapiLoadFile(item.getFieldValue('storedisplaythumbnail')).getURL() || noimage)
			 							  .replace('{{i}}', index)
										  .replace('{{selected}}', 'selected');
			index++;
		}

		while(_continue && index<100){

			try{

				var idField = 'custitem_wd_image_gallery_'+(fieldID++),
					src     = item.getFieldValue(idField);

				if( src.length == 0 )
					_continue = false;
				else{
					var f = nlapiLoadFile(src);
					if(f){

                       img = f.getURL();

                       carousel += getTemplateCarousel().replace(/{{src}}/ig, img)
														.replace('{{i}}', index)
														.replace('{{active}}', index ? '' : 'active');

                       slider   += getTemplateSlider().replace(/{{src}}/ig, img)
													  .replace('{{i}}', index)
													  .replace('{{selected}}', index ? '' : 'selected');

					}else{ nlapiLogExecution('ERROR', 'ERROR to load src image gallery'); }
				}

				index++;

			}catch(e){ _continue = false; }

		}

		item.setFieldValue('custitem_wd_img_gallery_carousel_html', carousel);
		item.setFieldValue('custitem_wd_img_gallery_slider_html', slider);
		item.setFieldValue('custitem_wd_refresh_image_gallery', 'F');

	}catch(e){
		modelError('generateImageGallery: ' + e);
	}
}


function generateRelatedItems(type, item){

	try{

		//nlapiLogExecution('ERROR', 'Run generateRelatedItems', item.getId());

		var index = 1,
		list      = 'customsearch_wd_all_items',
		limit     = item.getLineItemCount('presentationitem'),
		arrIDS    = [],
		html      = '';

		while(index <= limit){
			arrIDS.push(item.getLineItemValue('presentationitem','item', index));
			index++;
		}

		if(arrIDS && arrIDS.length){

			filters_array = [ new nlobjSearchFilter('internalid', null, 'is', arrIDS) ];
			columns_array = [ new nlobjSearchColumn( 'internalid' ) ];

			var results = nlapiSearchRecord('item', list, filters_array, columns_array),
			counter     = 1,
			top_counter = 6,
			active      = 'active';

			for(var i = 0; i < results.length; i++){
				try{

					if(counter == 1)
						html += '<div class="row item '+ active + '">';

					html += getTemplateCell().replace(/{{displayname}}/gi     , results[i].getValue('displayname'))
											 .replace(/{{itemurl}}/gi         , results[i].getValue('itemurl'))
											 .replace(/{{storedisplayname}}/gi, results[i].getValue('storedisplayname'))
											 .replace(/{{storedisplaythumbnail}}/gi, results[i].getText('storedisplaythumbnail'));

	               if(counter == top_counter || i == results.length-1 ){
	            	   counter = 1;
	            	   html   += '</div>';
	            	   active  = '';
	               }else
	            	   counter++;

				}catch(e){ modelError('Generate cell related item: '+ e); break; }
			}

		}

		item.setFieldValue('custitem_wd_relateditem_html', html);
		item.setFieldValue('custitem_wd_refresh_relateditem', 'F');

	}catch(e){ modelError('generateRelatedItems: ' + e); }
}

function generateBadgesHTML(type, item) {

	try{

		//nlapiLogExecution('ERROR', 'Run generateBadgesHTML', item.getId());

		var wrap  ='',
		arrBadges = nlapiGetFieldValues('custitem_wd_badges');

		if(arrBadges && arrBadges.length){

			filters_array = [ new nlobjSearchFilter('internalid', null, 'is', arrBadges) ];
			columns_array = [
			                  new nlobjSearchColumn( 'internalid' ),
			                  new nlobjSearchColumn( 'custrecord_wd_badges_content' )
			                ];

			var results = nlapiSearchRecord('customrecord_wd_badges', null, filters_array, columns_array),
			badge;

			if(results){
				for(var i=0; i<results.length;i++){
					badge = results[i];
					wrap += badge.getValue('custrecord_wd_badges_content');
				}
			}
		}

		item.setFieldValue('custitem_wd_badges_html', wrap);
		item.setFieldValue('custitem_wd_badges_refresh', 'F');

	}catch(e){ modelError('generateBadgesHTML: ' + e); }
}

//** Call from scheduled scripts **//
//** Afther install QS.
function processItems(){

	try{

		var filter = [nlobjSearchFilter('custitem_wd_process_items', null, 'is','F')],
		items      = nlapiSearchRecord('item','customsearch_wd_all_items', filter);

		for(i in items){

			var item = items[i];
			item     = nlapiLoadRecord(item.getRecordType(), item.getId());

			generateImageGallery('edit', item);

			generateRelatedItems('edit', item);

			generateBadgesHTML('edit', item);

			processHasKeywords('edit', item);

			item.setFieldValue('custitem_wd_process_items', 'T');

			try{ nlapiSubmitRecord(item, true, true);
			}catch(e){ modelError('processItems -> Error save item: ' + e); }

		}

	}catch(e){
		modelError('processItems: '+ e);
	}
}

//** Item DrillDown
function getTemplateCarousel(){
	return '<div class="item {{active}} easyzoom easyzoom--overlay" data-slide-number="{{i}}"><a href="{{src}}"><img src="{{src}}" class="img-responsive"></a></div>';
}

function getTemplateSlider(){
	return '<div class="col-xs-2 thumbnail"><a id="carousel-selector-{{i}}" class="{{selected}}"><img src="{{src}}"></a></div>';
}

//** Related Items
function getTemplateCell(){
	return '<div class="col-xs-6 col-sm-4 col-md-2 cell"><a  class="thumbnail"  href="{{itemurl}}" title="{{displayname}}"><img src="{{storedisplaythumbnail}}" alt="{{displayname}}"></a><h3><a href="{{itemurl}}">{{storedisplayname}}</a></h3></div>';
}

function modelError(error){
	nlapiLogExecution('ERROR', 'e', error);
}
