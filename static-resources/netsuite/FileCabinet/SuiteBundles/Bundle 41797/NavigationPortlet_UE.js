/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Jul 2014     mdeasis
 *
 */

jQuery(document).ready(function() {
	//Components
	var _category_list=jQuery('.nav_category_list');
	var _category_height=0;
	var _category_count=0, _category_display=0, _category_ctr=0;
	var _category_mover=null;
	var _is_over=false;
	var _category_row_count=4;
	
	var _arrow_up=jQuery('<div class="nav_scroller_up"><a href="#">&#x25B2;</a></div>');
	var _arrow_down=jQuery('<div class="nav_scroller_down"><a href="#">&#x25BC;</a></div>');
	//var _slim_scroll=jQuery('.slimScrollDiv');
	
	function init() {
//var elem=window.parent.document.getElementsByClassName('ns-script-portlet-content-wrapper');
//for (var i=0;elem && i<elem.length;i++) {var e=elem[i].children[0]; if (e.id.indexOf('nav_frame')>-1){var temp_width=parseInt(elem[i].offsetWidth)+2; e.style.width=temp_width+'px';elem[i].style.overflow='hidden';} }
		//Category ID
		var category_id=jQuery('#nav_default_category').val();
		if (category_id==null||category_id=='') {
			category_id=0;
		}
		else {
			category_id=jQuery('#nav_category_'+category_id).index();
		}
		
		//Category Row Count
		_category_row_count=jQuery('#nav_count').length>0?jQuery('#nav_count').val():4;
		jQuery('.nav_active_category').text(jQuery('.nav_category_list li:eq('+category_id+') a').text());
		//Reset components' positions
		jQuery('.nav_item_holder:visible').addClass('displayNone');
		jQuery('.nav_item_holder:eq('+category_id+')').removeClass('displayNone');
		//jQuery('.nav_item_holder:eq('+category_id+') .nav_item').css('left','0');
		var _comp_parent=jQuery('.nav_item_holder:eq('+category_id+')');
		var _comp_count=_comp_parent.find('.nav_item').length;
		
		//<<--
		//Category Menu Height
		//-->>
		_category_ctr=0;
		_category_height=getPageHeight(_comp_count, _category_row_count);
		//_category_display=getMenuCount(_category_height);
		_category_display=getMenuCount(parseInt(jQuery('.nav_subcategory table').height())+44);
		_category_count=_category_list.find('ul li').length;
		//if (_category_height>85) {
                //No active subsidiary flag
                if (jQuery('#no_active_category_flag:visible').length==1) {
                        _category_height=85;
                         jQuery('.nav_subcategory table').height(85);
                        _category_list.find('ul').css('height', '42px');
                        _category_list.prepend(_arrow_up);
                        _arrow_up.find('a').hide();
                        _category_list.append(_arrow_down);
                }
                else if (_category_height>85) {

			_category_list.prepend(_arrow_up);
			_arrow_up.find('a').hide();
			_category_list.append(_arrow_down);
			if (_category_count<=_category_display) {
				_arrow_down.find('a').hide();
			}
			_category_list.find('ul').css('height', ((_category_count<_category_display?_category_count:_category_display)*42)+'px');
		}
		//Resize IFrame
		var _iframe_index=jQuery('#nav_id').val();
		window.parent.document.getElementById('nav_frame_'+_iframe_index).height=(parseInt(jQuery('.nav_subcategory table').height())+44)+'px';
		//window.parent.document.getElementById('nav_frame_'+_iframe_index).height=getPageHeight(_comp_count, _category_row_count);
		
		//<<--
		//Category Menu Height
		//-->>
		//if (_comp_count>_category_row_count) {
		//	wrapRow(_comp_parent, _comp_count, _category_row_count);
		//	if (!_comp_parent.hasClass('organized')) {
		//		_comp_parent.addClass('organized');
		//	}
			//Animation
			//var _item_holder=jQuery('.nav_item_holder:eq('+category_id+') > div');
			//animateByRow(category_id, 0, 0, _item_holder.length);
		//}
		//else {
			//Animation
			//animateRow(category_id);
		//}
		//jQuery('.nav_category .slimScrollDiv').css('z-index', '0');
	}
	
	//Arrow Down
	_arrow_down.find('a').mouseenter(function() {
		if (_category_mover!=null) {
			clearInterval(_category_mover);
			_category_mover=null;
		}
		_category_mover=setInterval(function() {
			//Displays arrow up
			if (_category_ctr+1>0) {
				_arrow_up.find('a').show();
			}
			//Hides arrow down
			if ((_category_ctr+1)==(_category_count-_category_display)) {
				_arrow_down.find('a').hide();
			}
			//Move category menu list
			if ((_category_ctr)<(_category_count-_category_display)) {
				_category_list.find('ul').stop(true, true).animate({'top':'-=42px'}, 300);
				_category_ctr++;
			}
		}, 200);
	});
	
	//Arrow Up
	_arrow_up.find('a').mouseenter(function() {
		if (_category_mover!=null) {
			clearInterval(_category_mover);
			_category_mover=null;
		}
		_category_mover=setInterval(function() {
			//Hides arrow up
			if (_category_ctr-1==0) {
				_arrow_up.find('a').hide();
			}
			//Displays arrow down
			if (_category_ctr>0) {
				_arrow_down.find('a').show();
			}
			//Move category menu list
			if (_category_ctr>0) {
				_category_list.find('ul').animate({'top':'+=42px'}, 300);
				_category_ctr--;
			}
		}, 200);
	});
	
	//Arrow Up
	_arrow_up.mouseleave(function() {
		if (_category_mover!=null) {
			clearInterval(_category_mover);
			_category_mover=null;
		}
	});
	
	//Arrow Down
	_arrow_down.mouseleave(function() {
		if (_category_mover!=null) {
			clearInterval(_category_mover);
			_category_mover=null;
		}
	});
	
	_category_list.find('ul li a').click(function() {
		var category_index=jQuery(this).parent('li').index();
		var category_name=jQuery(this).text();
		_category_list.slideUp(300, function() {
			jQuery('.nav_active_category').text(category_name);
		});
		//Components card counter
		var _comp_parent=jQuery('.nav_item_holder:eq('+category_index+')');
		var _comp_count=_comp_parent.find('.nav_item').length;
		
		//Reset components' positions
		//if (jQuery('.nav_item_holder:visible').parent().is('div.slimScrollDiv')) {
		//	jQuery('.nav_item_holder:visible').unwrap();
		//}
		jQuery('.nav_item_holder:visible').addClass('displayNone');
		jQuery('.nav_item_holder:eq('+category_index+')').removeClass('displayNone');
		jQuery('.nav_item_holder:eq('+category_index+') .nav_item').css('left','0');
		
		//<<--
		//Category Menu Height
		//-->>
		_category_ctr=0;
		_arrow_up.find('a').show();
		_arrow_down.find('a').show();
		_category_height=getPageHeight(_comp_count, _category_row_count);
		//_category_display=getMenuCount(_category_height);
		_category_display=getMenuCount(parseInt(jQuery('.nav_subcategory table').height())+44);
		if (_category_height>85) {
			_category_list.prepend(_arrow_up);
			_arrow_up.find('a').hide();
			_category_list.append(_arrow_down);
			if (_category_count<=_category_display) {
				_arrow_down.find('a').hide();
			}
			_category_list.find('ul').css({'height':((_category_count<_category_display?_category_count:_category_display)*42)+'px', 'top':'0'});
		 }
		//<<--
		//Category Menu Height
		//-->>

		//Resize IFrame
		var _iframe_index=jQuery('#nav_id').val();
		window.parent.document.getElementById('nav_frame_'+_iframe_index).height=(parseInt(jQuery('.nav_subcategory table').height())+44)+'px';
		//window.parent.document.getElementById('nav_frame_'+_iframe_index).height=getPageHeight(_comp_count, _category_row_count);
		//If components count is greater than four
		//if (_comp_count>_category_row_count) {
		//	wrapRow(_comp_parent, _comp_count, _category_row_count);
		//	if (!_comp_parent.hasClass('organized')) {
		//		_comp_parent.addClass('organized');
		//	}
			//Animation
			//var _item_holder=jQuery('.nav_item_holder:eq('+category_index+') > div');
			//animateByRow(category_index, 0, 0, _item_holder.length);
		//}
		//If components count is less than or equal to four
		//else {
			//Animation
			//animateRow(category_index);
		//}
		//jQuery('.nav_category .slimScrollDiv').css('z-index', '0');
		return false;
	});
	
	//_slim_scroll.mouseleave(function() {
	//	setTimeout(function() {
	//		if (!_category_list.is(':hover')) {
	//			_category_list.slideUp(500);
	//		}
	//	}, 300);
	//});
	
	//jQuery('.nav_subcategory').mouseenter(function() {
	//	setTimeout(function() {
	//		if (_category_list.is(':visible')) {
	//			_category_list.slideUp(500);
	//		}
	//	}, 300);
	//});
	
	jQuery('.nav_category > a *').mouseenter(function() {
		//jQuery('.slimScrollDiv:eq(0)').css('z-index', '200');
		//jQuery('.slimScrollDiv:eq(1)').css('z-index', '0');
		_is_over=true;
		if (!_category_list.is(':animated')) {
			_category_list.slideDown(300);
		}
	});
	
	jQuery('.nav_category > a').mouseleave(function() {
		setTimeout(function() {
			if (!_is_over) {
				if (!_category_list.is(':animated')) {
					_category_list.slideUp(300);
				}
			}
			_is_over=false;
		}, 200);
	});
	
	_category_list.mouseenter(function() {
		_is_over=true;
		if (!_category_list.is(':animated')) {
			_category_list.slideDown(300);
		}
	});
	
	_category_list.mouseleave(function() {
		setTimeout(function() {
			//if (jQuery('.slimScrollDiv:hover').length==0) {
			if (!_is_over) {	
				if (!_category_list.is(':animated')) {
					_category_list.slideUp(300);
				}
			}
			_is_over=false;
			//}
		}, 200);
		
	});
	
	jQuery('.nav_category, .nav_subcategory').mouseenter(function() {
		setTimeout(function() {
			if (!_is_over) {
				if (!_category_list.is(':animated')) {
					_category_list.slideUp(300);
				}
			}
			_is_over=false;
		}, 200);
	});
	
	//Enable SlimScroll
	//_category_list.slimScroll({
	//	height: '180px',
	//	width: '240px'
	//});
	//jQuery('.slimScrollDiv').css({position: 'absolute', top: '40px', 'z-index':200});
	//Initialization
	init();
	
	function animateRow(category_index) {
		var card_ctr=0;
		var card_animator=setInterval(function() {
			jQuery('.nav_item_holder:eq('+category_index+') .nav_item:gt('+card_ctr+')').animate({'left':'+=340px'}, 500);
			card_ctr++;
			if (card_ctr==4) {
				clearInterval(card_animator);
			}
		}, 500);
	}
	
	function animateByRow(category_index, div_index, cycle_start, cycle_limit) {
		var ctr=0;
		var limit=jQuery('.nav_item_holder:eq('+category_index+') > div:eq('+div_index+') .nav_item').length;
		var card_animator=setInterval(function() {
			jQuery('.nav_item_holder:eq('+category_index+') > div:eq('+div_index+') .nav_item:gt('+ctr+')').animate({'left':'+=340px'}, 500);
			ctr++;
			if (ctr==limit) {
				clearInterval(card_animator);
				if (cycle_start<cycle_limit) {
					animateByRow(category_index, div_index+1, cycle_start+1, cycle_limit);
				}
			}
		}, 500);
	}
	
	function wrapRow(comp_parent, comp_count, row_count) {
		if (!comp_parent.hasClass('organized')) {
			var wrapper=null;
			for (var i=0;i<comp_count;i++) {
				if (i%row_count==0) {
					wrapper=jQuery('<div></div>');
				}
				var child=comp_parent.find('.nav_item:eq(0)').clone();
				comp_parent.find('.nav_item:eq(0)').remove();
				wrapper.append(child);
				if (i%row_count==row_count-1||i==comp_count-1) {
					wrapper.append(jQuery('<div class="clearB"></div>'));
					comp_parent.append(wrapper);
					//wrapper.find('.nav_item').css('top', (parseInt(i/4)*child.outerHeight())+'px');
					//comp_parent.slimScroll({
					//	height: '200px'
					//});
				}
			}
		}
	}
	
	function getPageHeight(comp_count, row_count) {
		//var page_height=0;
		//page_height+=40;//nav_category
		//page_height+=170*computeNumOfRow(comp_count, row_count);//nav_subcategory
		var child_height=getChildrenMaxHeight(comp_count, row_count)+40;
		return child_height;
		//return Math.max(page_height, child_height);
	}
	
	function computeNumOfRow(comp_count, row_count) {
		if (comp_count>row_count)
			return 1+computeNumOfRow(comp_count-row_count, row_count);
		else
			return 1;
	}
	
	function getMenuCount(comp_height) {
		var nav_height=comp_height-80;//remove the header(40) and the arrows(20*2)
		return nav_height=parseInt(nav_height/42);
	}
	
	function getChildrenMaxHeight(comp_count, row_count) {
		var max_height=0, row_height=0;
		jQuery('.nav_item:visible').each(function(i, e) {
			var temp_height=jQuery(this).height()+20;//10px padding top + 10px padding bottom
			if (temp_height>row_height) {
				row_height=temp_height;
			}
			if ((i%row_count==row_count-1)||(i==comp_count-1)) {
				max_height+=row_height;
			}
		});
		return max_height;
	}
	
});