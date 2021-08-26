/****************************************************************
 * Description: Suitlet Applications run functions to WD.
 *
 * @author: Alfonso Terron
 * @Email : aterron@netsuite.com
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @version 1.0                                 @Date: 14/05/2014
 *
 ****************************************************************/
window.wd  = {};
wd.version = 'premium';
wd.library = {
    Configurations: { applicationURL : "/app/site/hosting/scriptlet.nl?script=customscript_wd_applications&deploy=customdeploy_wd_applications" },

    globalLoading : function(accion){(accion==='show')?jQuery('#loadingIndicator').addClass('active'):jQuery('#loadingIndicator').removeClass('active');},

    showMessage   : function($elem, type, message){
    	var $message = jQuery(wd.templates.showmessage_temp.replace(/{{type}}/ig, type)
    													   .replace(/{{textmesagge}}/ig, message));
    	setTimeout(function(){$message.fadeOut('slow',function(){jQuery(this).remove();});}, 4000);
		$elem.prepend($message);
		$message.fadeIn('slow');
	},
	/** Advance Search **/
    globalSearch: {
        /***** start - Setting zone **/
        getContainer: function() {
            return jQuery('#autocomp-search-results');
        },
        getCellTemplate: function() {
            return wd.templates.globalsearch_cell_tmpl;
        },
        getLimitResults: function() {
            return wd.configuration.config_gs_limitresult || 5;
        },
        thread : null,
        /***** end - Setting zone **/
        initialize: function(){
        	var self = this;
            jQuery('#autocomp-search-query').on('keyup', function(event) {
            	var $target = jQuery(this),
            	value       = $target.val();
            	if(event.keyCode != '13'){
            		if (value.length >= 3){
            			clearTimeout(self.thread);
            			self.thread = setTimeout(function(){
            				self.search(value);
            			},500);
            		}else
                        self.getContainer().empty();
            	}else
            		self.seeMoreResults(value);
            });
            jQuery('.autocomp-search .btn').click(function(){ self.seeMoreResults(jQuery(this).prev().val());});
        },
        seeMoreResults : function(val){ location.href = '/Shop/?search=' + val; },
        ajax: null,
        getAjax: function() {
            if (!this.ajax)
                this.ajax = new wd.Ajax();
            return this.ajax;
        },
        search: function(keywords){
        	var self = this;
            this.getAjax().run({
                    'method': 'searchitemkeyeords',
                    'limit': this.getLimitResults(),
                    'keywords': keywords
                },
                true,
                function(data){
                	self.processData(data.results, self.getContainer());
                },
                'JSON'
            );
        },
        processData: function(results, container){
        	var self = this,
        	list     = container.empty();
        	if(results.length){
        		$li = jQuery('<li>').append(jQuery('<a>').attr('href','#').append('See more results...')).click(function(){
            		self.seeMoreResults(jQuery(this).closest(".autocomp-search").find('#autocomp-search-query').val());
            	});
        		list.append($li);
                for (var i = 0; i < results.length; i++)
                	list.tmpl(this.getCellTemplate(), results[i]);
        	}else
        		list.append('<li>No results.</li>');
        }
    },

    /** Slider Zone **/
    slider: {
        initialize: function(container, category) {
            this.getConteiner = container;
            var ajax = new wd.Ajax,
            self = this;
            ajax.run({
                    "method": "sliderzone",
                    'category': category
                },
                true,
                function(data) {
                    if (data.status_error.error)
                        return;
                    else
                       self.processSlide(data.results);
                },
                'JSON'
            );
        },
        getCellSlider: function() {
            return wd.templates.slider_cell_tmpl;
        },
        getConteiner: null,
        processSlide: function(data) {
            var wrap_carousel = this.getConteiner;

            if(data.length){
            	for (var i = 0; i < data.length; i++) {//add steps
                    wrap_carousel.find('.carousel-indicators').append('<li class="' + ((i == 0) ? 'active' : '') + '" data-slide-to="' + i + '" data-target="#main-carousel"></li>');
                    var cell = this.getCellSlider().replace('{{banner}}', 'ban' + i).replace('{{active}}', (i == 0) ? 'active' : '');
                    data[i].btndisplay = (data[i].btn == "") ? 'none' : 'block';
                    wrap_carousel.find('.carousel-inner').tmpl(cell, data[i]);
                }
            }else
            	wrap_carousel.hide();
        }
    },

    /** Marketing Zone Initialize **/
    marketingZone: {
        initialize: function() {
            var self = this;
            jQuery('.carousel-items').carousel({
                interval: false
            });
            jQuery('.marketingzone').find('.btn-tab').click(function() {
                jQuery('.marketingzone').find('.btn-tab.active').removeClass('active');
                jQuery(this).addClass('active');
                self.event(jQuery(this));
            });            
        },
        event: function(e) {
            e = (e) ? e.data('carousel') : jQuery('.list-carousel').find('.btn-tab.active').data('carousel');
            jQuery('.marketingzone').find('.carousel-items').hide();
            jQuery('#' + e).show();
            jQuery('.btn.fa-angle-right, .btn.fa-angle-left').attr('href', '#' + e);

            if (jQuery('#' + e + ' .row .cell').length <= wd.configuration.config_fi_showcell){
                jQuery('.list-carousel .btn.right, .list-carousel .btn.left').hide();
                jQuery('.row.tabs').children().first().removeClass("col-sm-11").addClass('col-sm-12');
                jQuery('.row.tabs').children().last().hide();
            }else{
                jQuery('.list-carousel .btn.right, .list-carousel .btn.left').show();
                jQuery('.row.tabs').children().first().removeClass("col-sm-12").addClass('col-sm-11');
                jQuery('.row.tabs').children().last().show();
            }
        }
    },

    /** Newsletter **/
    newsletter : {

    	initialize : function(){
    		var self = this;
    		jQuery('#newsletter').submit(function(event){self.sendNewsletter(event);});
    	},

    	serializeURL : function(url){
    		try{
	    		var params = url.split('?')[1].split('&'),
	    		arrParams = {};
	    		for(param in params ) arrParams[params[param].split('=')[0]] = '&'+params[param];
	    		return arrParams;
    		}catch(e){ return null; }
    	},

    	sendNewsletter : function(event){

    		event.preventDefault();

    		var msg        = wd.library.showMessage,
    		$elemMSG       = jQuery('.newsletter #message'),
    		baseURL        = jQuery('#newsletter').attr('data-url')+'?',
    		requiredParams = this.serializeURL(jQuery('#newsletter').attr('action'));

    		try{

    			if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/.test(jQuery('#newsletter #email').val()))
    				throw 'Please, insert a email.';

    			baseURL += requiredParams.compid + requiredParams.formid + requiredParams.h;

	    		new wd.Ajax().run(
	    		jQuery('#newsletter').serialize(),
				true,
				function(data){
                	jQuery('.newsletter #email').val('');
                	msg($elemMSG, 'success', 'Thanks!');
				},
				'html',	function(){}, baseURL);

    		}catch(e){ msg($elemMSG, 'warning', e); }
    	}
    },

    /** Quick Order **/
    quick_order: {
        wrapQO: jQuery('.wd_header_quickby'),
        getCellTemplate: function() {
            return wd.templates.qb_cell_tmpl;
        },
        initialize: function(){
        	jQuery('.wd_header_quickby').show();
            var self = this,
                countRows = wd.configuration.config_qo_maxrows || 5,
                _wrapQO = jQuery('<div>').attr('class', 'wrap_quick_order'),
                _qoList = jQuery('<div>').attr('class', 'quick_order_list'),
                _qoBtn  = jQuery('<button>').attr('class', 'btn btn-primary').click(function(){ self.multiAddToCart(self); }).html("ADD TO CART");

            self.newRowOrder(countRows, _qoList);
            _wrapQO.html(_qoList);
            _wrapQO.append(_qoBtn);
            _wrapQO.prepend('<i class="fa btn btn-xs btn-default more">+</i><i class="fa btn btn-xs btn-default less">-</i>');
            _wrapQO.find('i.more, i.less').click(function(){
                if (jQuery(this).hasClass('more')){
                    self.newRowOrder(1, _qoList);
                } else {
                    _qoList.find('div:last').hide('slow', function() {
                        jQuery(this).remove();
                    });
                }
            });
            this.wrapQO.append(_wrapQO);
            this.wrapQO.find('a').click(function() {
                if (!jQuery(this).hasClass('active')) {
                    $wrap = jQuery('.wd_header_quickby .wrap_quick_order');
                    $wrap.find('.item:first').focus();
                	$wrap.slideDown();
                    jQuery(this).addClass('active');
                }
            });

            self.wrapQO.on('click',function(e){
            	e.stopPropagation();
            });

        	$("body").on('click',function(){
        	  self.wrapQO.find(".wrap_quick_order").slideUp();
        	  self.wrapQO.find('a.active').removeClass('active');
        	});

        },
        inputSearch: null,
        searchEvent: function(elem) {
            if (elem.val().length >= 3) {
                this.inputSearch = elem;
                this.quickSearch(elem.val());
            } else elem.parent().find('ul').remove();
        },
        keys: {'TAB': 9, 'ENTER': 13, 'ARRUP': 38, 'ARRDOWN': 40 },
        selectItem: function(elem, wrap) {
        	$li = wrap.find('.list-items li.selected');
            elem.attr('data-item', $li.data('item'));
            var val = $li.find('.name').text();
            if(val!='')
            	elem.val(val.slice(0,12)+'...');
        },
        inputSearchEvent: function(e) {
        	var self  = wd.library.quick_order, $this, $wrap;
	        if (e.keyCode == self.keys['ARRUP'] || e.keyCode == self.keys['ARRDOWN']){
	        		$this = jQuery(this),
	        		$wrap = $this.parent();
	        		self.moveFocus($wrap, (e.keyCode == self.keys['ARRUP']) ? 'prev' : 'next');
	            	self.selectItem($this, $wrap);
	        } else {
	            if (e.keyCode == self.keys['TAB'] || e.keyCode == self.keys['ENTER'] || e.type === 'blur' ) {
	            	$this = jQuery(this),
	            	$wrap = $this.parent();
	            	self.selectItem($this, $wrap);
	            	$wrap.find('.list-items').remove();
	            	if(e.keyCode != self.keys['TAB'])
	            		$wrap.find('.qty').focus();
	            } else // Start search //
	            	self.searchEvent(jQuery(this));
	        }
        },
	    moveFocus: function(wrap, move) {
	        switch (move) {
	            case 'prev':
	                var $row = wrap.find('.list-items li.selected').removeClass('selected');
	                if($row.prev().length>0) $row.prev().addClass('selected'); else $row.last().addClass('selected');
	                break;
	            case 'next':
	                var $row = wrap.find('.list-items li.selected').removeClass('selected');
	                if($row.next().length>0) $row.next().addClass('selected'); else $row.first().addClass('selected');
	                break;
	        }
	    },
	    getRowOrder: function() {
	        var self = this,
	            i = jQuery('<input>').attr({
	                'type': 'text',
	                'data-item': '',
	                'placeholder': 'Enter SKU#'
	            }).attr('class', 'item').on('keyup blur', self.inputSearchEvent),
	            n = jQuery('<input>').attr({
	                'type': 'number',
	                'value': '1',
	                'min': '1',
	                'controls': ''
	            }).attr('class', 'qty'),
	            e = jQuery('<div>').attr('class', 'row_order').append(i).append(n).hide();
	        return e;
	    },
	    newRowOrder: function(count, parent) {
	        for (var i = 0; i < count; i++) {
	            var e = this.getRowOrder();
	            parent.append(e);
	            e.show('slow');
	        }
	    },
	    multiAddToCart: function(self) {
	        var countID = wd.configuration.config_website.companyid,
	        url         = '/app/site/backend/additemtocart.nl?c=' + countID + '&buyid=multi&',
	        params      = 'multi=';

	        self.wrapQO.find('.row_order').each(function() {
	            id = jQuery(this).find('.item').attr('data-item');
	            qty = jQuery(this).find('.qty').val();
	            if (id != '' && qty != '' && qty > 0) {
	                params += id + ',' + qty + ';';
	            }
	        });
	        ajax = new wd.Ajax();
	        ajax.run({},
	            true,
	            null, 'JSON', null, url + params);
	        self.reset();
	    },
	    reset : function(){
	    	var self  = this,
	    	btn       = jQuery(".wrap_quick_order .btn-primary").html("Thanks!").attr('disabled', 'disabled'),
	    	$wrap     = jQuery(".quick_order_list");
	    	setTimeout(function(){
	    		jQuery('.wd_header_quickby .wrap_quick_order').slideUp(function(){
	    			jQuery('.wd_header_quickby > a').removeClass('active');
	        		countRows = wd.configuration.config_qo_maxrows || 5;
	        		$wrap.empty();
	        		btn.html("ADD TO CART").removeAttr('disabled');
	            	self.newRowOrder(countRows, $wrap);
	    		});
	    	}, 2500);
	    },
	    ajax: null,
	    getAjax: function() {
	        if (!this.ajax) {
	            this.ajax = new wd.Ajax;
	        }
	        return this.ajax;
	    },
	    quickSearch: function(keywords) {
	    	var self = this;
	        this.getAjax().run({
	                'method': 'searchitemkeyeords',
	                'limit': 3,
	                'keywords': keywords
	            },
	            true,
	            function(data) {
	                if (data.status_error.error) return;
	                var rowQSR = self.inputSearch.parent();
	                if (rowQSR.find('.list-items').length == 0)
	                    rowQSR.append('<ul class="list-items"></ul>');
	                qsr = rowQSR.find('.list-items');
	                self.processData(data.results, qsr);
	            },
	            'JSON'
	        );
	    },
	    processData: function(results, container) {
	        var list     = container.empty(),
	        eventClicked = function(){
	        	$e = jQuery(this),
	        	$p = $e.parents('.row_order');
	        	$p.find('.item').attr('data-item', $e.data('item'));
	        	$p.val($e.text().slice(0,12)+'...');
	        	$p.find('.qty').focus();
	        	$e.parent().remove();
	        };
	        for (var i = 0; i < results.length; i++) {
	            results[i].itemurl = '#';
	            list.tmpl(jQuery().tmplStr(this.getCellTemplate(), results[i]), results[i].storedisplaythumbnail, 'click', eventClicked);
	        }
	        list.find('li').first().addClass('selected');
	    }
    },
	/** Create a Quote **/
	createAQuote: {
	    getbutton: function() {
	        return wd.templates.createquote_btn;
	    },
	    initialize: function() {
	        if (wd.configuration.currentpage.isshoppingcart && (wd.configuration.customer.email != 'NaN')) {
	            var self = this;
	            jQuery('input#checkout').closest('td').append(this.getbutton);
	            jQuery('#createaquote').click(function() {
	                self.processCreateAQuote();
	            });
	        }
	    },
	    processCreateAQuote: function() {
	        var qoute = {};
	        qoute.items = {};
	        qoute.message = "";
	        qoute.customer = wd.configuration.customer.internalid;

	        jQuery('tr[id*="carttablerow"]').each(function() {
	            var e = jQuery(this),
	               id = e.find('input[id*="item"]').attr('id').split('item')[1].split('set')[0];

	            qoute.items[id] = {};
	            qoute.items[id].internalid = id;
	            qoute.items[id].qty = e.find('input[id*="item"]').val();
	            qoute.items[id].rate = e.find('td.texttablert').eq(0).html();
	        });
	        new wd.Ajax().run({
	                'method': 'createaquote',
	                'info': JSON.stringify(qoute),
	            },
	            true,
	            function(data) {
	                alert('Thanks!');
	            },
	            'JSON',
	            null);
	    }
	},
	/** Recently View Items **/
	recentlyViewItems: {
	    initialize: function() {
	        rvis = wd.library.cookies.getCookie('rvis');
	        rvis = (!rvis || rvis == "-1") ? [] : JSON.parse(rvis);
	        if (rvis.length > 0) new wd.MarketingZone(rvis, null, jQuery('#rviItems'), wd.templates.related_item_tmpl);
	    },
	    attachItem: function(id) {
	        var rvis = '',
	            cookieName = 'rvis',
	            sizeRvi = wd.configuration.config_fi_showcell || 4; //Review in prox relase, config_fi_showcell is generic length to Marketing x
	        rvis = wd.library.cookies.getCookie(cookieName);
	        rvis = (!rvis || rvis == "-1") ? [] : JSON.parse(rvis);
	        if (rvis.indexOf(id) == -1) {
	            if (rvis.length < sizeRvi) {
	                rvis.push(id);
	                wd.library.cookies.setCookie(cookieName, '30', JSON.stringify(rvis));
	            } else {
	                rvis = rvis.slice(1, rvis.length);
	                rvis.push(id);
	                wd.library.cookies.setCookie(cookieName, '30', JSON.stringify(rvis));
	            }
	        }
	    }
	},
	/** Cookies Functionality **/
	cookies: {
	    getCookie: function(name) {
	        var nameEQ = name + "=",
	            ca = document.cookie.split(';');
	        for (var i = 0; i < ca.length; i++) {
	            var c = ca[i];
	            while (c.charAt(0) == ' ')
	                c = c.substring(1, c.length);
	            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
	        }
	        return null;
	    },
	    setCookie: function(name, days, value) {
	    	var expires = "";
	    	if (days) {
	            var date = new Date();
	            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
	            expires = "; expires=" + date.toGMTString();
	        }
	    	document.cookie = name + "=" + value + expires + "; path=/";
	    },
	    clearCookie: function(name) {
	        this.setCookie(name, "", "-1");
	    }
	},

	/** Compare Products Functionality **/
	compareProducts: {
		compareSelector: function(){ return jQuery('.compare-item:checked'); },
		getWrap        : function(){ return wd.templates.compare_wrap_tmpl; },
		getCell        : function(){ return wd.templates.compare_cell_tmpl; },
		getOtherInfo   : function(){ return wd.templates.compare_rowotherinfo_tmpl; },
		getLoading     : function(){ return wd.templates.loading_tmpl; },
		initialize     : function(){ jQuery('.item-compare').show(); },
		compare: function(){

			var self = this,
			products = [];

			if(self.compareSelector().length<2){ alert('Please, select items to compare.'); return; }

			jQuery('#compare_products .modal-body').html(self.getLoading());

			//Load products id to compare.
			self.compareSelector().each(function(){ products.push(jQuery(this).data('item')); });

			new wd.Ajax().run({
                'method': 'compareproducts',
                'cat'   : wd.configuration.currentpage.sitecategoryid,
                'data'  : JSON.stringify(products)
            },
            true,
            function(data) {
                self.processCompare(data);
            },
            'JSON',
            function(){}
            );
		},
		checked : function(elem){
			var self = this;
			if(elem.is(':checked')){
				elem.parent().addClass('checked').find('a.compare').addClass('').html('Compare Now');
				if(self.compareSelector().length > 1)
					jQuery('.item-compare.checked .compare').attr("data-target","#compare_products");
				else
					jQuery('.item-compare.checked .compare').attr("data-target","");
			}else
				elem.parent().removeClass('checked').find('a.compare').removeClass('')
											   		.attr("data-target","")
											   		.html('Add to Compare');
		},
		remove : function(elem){
			var id = elem.data('itemid')|| null;
			if(id){
				jQuery('div[data-item="'+id+'"]').remove();
				if(jQuery('a.remove').length < 2)
					jQuery('button.close').click();
			}
		},
		processCompare: function(data){

			if(data && data.results.length){
				var self = this,
				wrap     = self.getWrap(),
				cell     = self.getCell(),
				otherF   = self.getOtherInfo(),
				fields   = data.fields,
				otherFields    = '',
				otherFieldsTmp = '',
				cells          = '',
				rowsOtherInfo  = '';

				//Add Other Fields in wrap.
				for(f in fields){
					otherFields    += '<li>'+fields[f].name+'</li>';
					otherFieldsTmp += '<li>{{'+fields[f].id+'}}</li>';
				}

				//Show left information.
				wrap = wrap.replace(/{{otherinfo}}/ig, otherFields);

				//Cell Render Information-.
				var sizecol = Math.round(10/(data.results.length || 1));

				//Render other fields temp and colwidth
				otherFieldsTmp = otherF.replace(/{{fieldstemp}}/ig, otherFieldsTmp).replace(/{{colwidth}}/ig, sizecol);
				cell           = cell.replace(/{{colwidth}}/ig, sizecol);

				for(var i=0; i<data.results.length; i++){
					var item = data.results[i];
					rowsOtherInfo += jQuery().tmplStr(otherFieldsTmp, item);
					cells += jQuery().tmplStr(cell, item);
				}

				for(f in fields) //Remove tags that not render
					rowsOtherInfo = rowsOtherInfo.replace(new RegExp('{{'+fields[f].id+'}}', 'g'), 'N/A');

				//Insert Cells in wrap and Insert Wrap in modal compare products.
				jQuery('#compare_products .modal-body').html(
						wrap.replace(/{{cells}}/ig, cells)
							.replace(/{{rowsotherinfo}}/ig, rowsOtherInfo)
				);

				jQuery('#compare_products .modal-body a.remove').click(function(){self.remove(jQuery(this));});

				//** Fix Height in first column
				var i=0, total = 0;
				jQuery('.first-column li').each(function(){
					hf = jQuery(this).height();
					ho = 0;
					//** Calc max Heigth.
					jQuery('.other-info').each(function(){
						var _h = jQuery(this).find('li').eq(i).height();
						if(ho < _h) ho = _h;
					});
					//** Equals Heights for row.
					if(hf < ho)
						jQuery(this).height(ho);
					jQuery('.other-info').each(function(){ jQuery(this).find('li').eq(i).height(ho); });
					i++;
					//total += hf;
				});
				//jQuery('.first-column ul').height(total);
				//**

			}else{console.log('Error: process data, Compare Products.');}
		}
	},

	/** Lead Time Functionality **/

	leadTime : {

		initialize : function(){
			var self = this,
			listIDs  = [];

			jQuery('.leadtime').each(function(){
				listIDs.push(jQuery(this).data('itemid'));
			});

			new wd.Ajax().run({
                'method': 'leadtime',
                'iids'  : JSON.stringify(listIDs)
            },
            true,
            function(data) {
                self.processLeadTime(data.results);
            },
            'JSON',
            function(){}
            );
		},

		processLeadTime : function(results){
			if(results.length>0){
				for(i in results){
					var item = results[i];
					if(item.qtyAvailable === 0){
						var $e = jQuery('.leadtime[data-itemid="'+item.id+'"]');
						if($e.length){
							$e.tmpl(wd.templates.leadtime_msg_temp, item);
							$e.fadeIn('slow');
						}
					}
				}
			}
		}
	},

	/** Wish List Functionality **/
	wishlist : {

		getWrap : function(){ return jQuery('.wishlist'); },

		getIsAdminPage : function(){ return (jQuery('.wishlist.admin').length > 0); },

		getDataObj : function(){
			return {
				'customerid' : wd.configuration.customer.internalid,
				'method'     : null,
				'lists'       : []
			};
		},

		getListObj : function(){
			return {
				id    : null,
				name  : this.getWrap().find('.name').val(),
				desc  : this.getWrap().find('.description').val() || '',
				shared: this.getWrap().find('.shared').val() || false,
				passw : this.getWrap().find('.password').val() || '',
				lines : [{
					id     : null,
					qty    : jQuery('[name=qty]').val() || 0,
					itemid : jQuery('[name=itemid]').val() || null
				}]
			};
		},

		initialize : function(){
			var self = this;

			if(self.getIsAdminPage()){

				//** Redirect if not is logged
				if(!wd.configuration.customer.isLoggedIn) location.href = '/';

				self.getList();

				self.getWrap().find('#new .modal-footer .btn').click(function(){
					self.saveList(true);
				});

				//** Show field password in create **
				self.getWrap().find('.modal .shared input').change(function(){
					if(jQuery(this).is(':checked')){
						jQuery('.modal .password').fadeIn('slow');
					}else
						jQuery('.modal .password').fadeOut('slow');
				});

				//** change sorting list **
				self.getWrap().find('.lists .sortlists').change(function(){
					self.getList();
				});
				self.getWrap().find('[data-acction=refresh]').click(function(){
					self.getList();
				});

			}else{
				//** Show buttons to loggin or add wishlist.
				if(wd.configuration.customer.isLoggedIn)
					self.getWrap().find('a.add').click(function(e){
						e.preventDefault();
						var $elem = jQuery(this);
						if($elem.hasClass('active')){
							$elem.removeClass('active');
							self.getWrap().find('.lists').fadeOut('slow');
						}else{
							$elem.addClass('active');
							self.getList();
						}
					}).show();
				else
					self.getWrap().find('a.login').show();

				//** Add events in buttons.
				self.getWrap().find('.create').click(function(){
					var $elem = jQuery(this),
					step      = $elem.data('step');
					if(step === 'shownew'){
						self.getWrap().find('.new').show().find('.name').focus();
						$elem.val('Save list and add item').data('step', 'createandsave');
					}
					if(step === 'createandsave')
						self.saveList(true);
				});
				self.getWrap().find('.save').click(function(){
					self.saveList(false);
				});

			}
		},

		/*** Views Interactions ***/
		showPanel : function(data){
			var self = this,
			wrap     = jQuery('.wishlist .grouplist'),
			lists    = 'There are no list';

			wrap.empty();

			if(data.results && data.results.length){
				for(var i = 0; i < data.results.length; i++)
					wrap.tmpl(wd.templates.wishlist_list_temp, data.results[i]);

				self.getWrap().find('.grouplist [class*="list-"] input').change(function(){
				      var count = self.getWrap().find('.grouplist [class*="list-"] input:checked').length,
				      title     = self.getWrap().find('.panel-title').data('title');
				     (count > 0) ? self.getWrap().find('.panel-title').html( title + ' (' + count  + ')') : self.getWrap().find('.panel-title').html(title);
				});

			}else{
				lists = '<span>' + lists + '</span>';
				wrap.html(lists);
			}

			self.getWrap().find('.name').val('');
			self.getWrap().find('.create').val('Create a new list').data('step', 'shownew');
			self.getWrap().find('.new').hide();
			self.getWrap().find('.panel-title').html(self.getWrap().find('.panel-title').data('title'));

			self.getWrap().find('.lists').fadeIn('slow');

		},

		showLists : function(data, areSharedList){

			var self = this,
			wrap     = self.getWrap().find('.lists .panel-body'),
			lists    = 'There are no list';

			wrap.empty();

			// ** Pending appproval **
			var pending = data.pending || 0;
			if(pending > 0){
				var text = jQuery('.shareapproval').data('original-title');
				text = text.replace(/{{count}}/ig, pending);
				jQuery('.shareapproval').attr('data-original-title', text).tooltip('show'); setTimeout(function(){jQuery('.shareapproval').tooltip('hide');},4000);
			}else{
				var text = jQuery('.shareapproval').data('original-title');
				text = text.replace(/{{count}}/ig, '');
				jQuery('.shareapproval').attr('data-original-title', text);
			}

			if(data.results && data.results.length){

				var temp = (areSharedList ?
						wd.templates.wishlist_rowlistjoin_temp
						:
						wd.templates.wishlist_rowlist_temp);

				for(var i = 0; i < data.results.length; i++){
					if(wd.configuration.customer.internalid != data.results[i].custrecord_wl_customer.internalid)
						wrap.tmpl( temp .replace(/{{shared}}/ig   , data.results[i].custrecord_wl_shared ? 'unlock' : 'lock' )
								        .replace(/{{tooltiptext}}/ig   , data.results[i].custrecord_wl_shared ? 'This is a share list' : 'This is a private list' )
										.replace(/{{owner}}/ig   , '<span class="owner">Owner <b>'+ data.results[i].custrecord_wl_customer.name +'</b></span>')
										.replace(/{{modifyby}}/ig, 'by <b>{{lastmodifiedby}}</b>')
										.replace(/{{disabled}}/ig, 'style="display:none"')
										.replace(/{{removelist}}/ig, 'removefromlist')
										.replace(/{{removetext}}/ig, 'Remove from List')
										, data.results[i] );
					else
						wrap.tmpl( temp.replace(/{{shared}}/ig, data.results[i].custrecord_wl_shared ? 'unlock' : 'lock' )
								       .replace(/{{tooltiptext}}/ig   , data.results[i].custrecord_wl_shared ? 'This is a share list' : 'This is a private list' )
								       .replace(/{{removelist}}/ig, 'removeList')
										.replace(/{{removetext}}/ig, 'Delete')
								       , data.results[i] );
				}
			}else{
				lists = '<span>' + lists + '</span>';
				wrap.html(lists);
			}

			jQuery(".wishlist [data-acction]").click(function(e){
				e.preventDefault();
				var $elem = jQuery(this),
			    _function = $elem.data('acction');
				switch(_function){
					case 'editList'      : self.editList($elem); 	  break;
					case 'removeList'    : self.removeList($elem); 	  break;
					case 'addlisttocart' : self.addListToCart($elem); break;
					case 'viewList'      : self.viewList($elem); 	  break;
					case 'backToList'    : self.backToList($elem); 	  break;
					case 'searchLists'   : self.searchListsShared($elem); break;
					case 'joininlist'    : self.joininlist($elem);	  	  break;
					case 'removefromlist': self.removeUserList($elem);	  break;
				}
			});


		},

		/*************** List Section ***************/
		getList    : function(){
			var	self = this,
			dataobj  = self.getDataObj();
			dataobj.method = 'getlist';
			dataobj.sort   = self.getSort();

			new wd.Ajax().run(
				{
					'method' : 'wishlist',
					'dataobj': JSON.stringify(dataobj)
				},
	            true,
	            function(data) {
					if(self.getIsAdminPage())
						self.showLists(data);
					else
						self.showPanel(data);

					wd.library.globalLoading();
				},
	            'JSON',
	            function(){ wd.library.globalLoading('show'); }
            );
		},

		searchListsShared : function($elem){
			var self       = this,
			dataobj        = self.getDataObj();
			dataobj.method = 'searchlistsshared';
			dataobj.sort   = self.getSort();

			new wd.Ajax().run(
				{
					'method' : 'wishlist',
					'dataobj': JSON.stringify(dataobj)
				},
	            true,
	            function(data) {
					self.showLists(data, true);
					wd.library.globalLoading();
				},
	            'JSON',
	            function(){ wd.library.globalLoading('show'); }
            );

		},

		joininlist : function($elem){
			var self   = this,
			dataobj    = self.getDataObj();
			$row       = $elem.closest('.row'),
			successMSG = 'You joined the list ' + $row.find('.name').text();

			dataobj.lists[0] = { id : $row.data('listid'), passw : $row.find('#list-pass').val() };
			dataobj.method = 'joininlist';

			new wd.Ajax().run(
				{
					'method' : 'wishlist',
					'dataobj': JSON.stringify(dataobj)
				},
	            true,
	            function(data) {
					if(data.status_error.error){
						if(data.status_error.passerror)
							wd.library.showMessage(self.getWrap().find('.lists'), 'warning', data.status_error.msg);
						else{
							wd.library.showMessage(self.getWrap().find('.lists'), 'warning', 'Error: join list');
							self.getList();
						}
					}else{
						self.showLists(data);
						wd.library.showMessage(self.getWrap().find('.lists'), 'success', successMSG);
					}
					wd.library.globalLoading();
				},
	            'JSON',
	            function(){ wd.library.globalLoading('show'); }
	        );
		},

		removeUserList : function($elem){
			var self   = this,
			dataobj    = self.getDataObj();
			$row       = $elem.closest('.row'),

			dataobj.lists[0] = { id : $row.data('listid') };
			dataobj.method = 'removeuserlist';

			new wd.Ajax().run(
				{
					'method' : 'wishlist',
					'dataobj': JSON.stringify(dataobj)
				},
	            true,
	            function(data) {
					self.showLists(data);
					wd.library.globalLoading();
				},
	            'JSON',
	            function(){ wd.library.globalLoading('show'); }
	        );
		},

		getSort : function(data){
			var $sort =  jQuery('.lists .sortlists option:selected'),
			sortBy    = $sort.val() || null,
			desc       = ($sort.data('sort') === 'desc') || false;

			sort = (sortBy) ? {'field' : sortBy, 'desc' : desc} : null;

			return sort;
		},

		closeModal : function(){
			jQuery('.modal .close').click();
			jQuery('.modal #new-list-name').val('');
			jQuery('.modal #new-list-msg').val('');
			jQuery('.modal .shared input').removeAttr('checked');
			jQuery('.modal .password input').val('');
			jQuery('.modal .password .emails').val('');
			jQuery('.modal .password').hide('slow');
		},

		saveList : function(isNew){
			var self = this,
			dataobj  = self.getDataObj(),
			list     = self.getListObj();

			if(isNew){

				if(self.getIsAdminPage()){
					list.name   = jQuery('#new-list-name').val();
					list.desc   = jQuery('#new-list-msg').val();
					list.shared = jQuery('.modal .shared input').is(':checked');
					list.passw  = jQuery('.modal .password input').val();
					list.emails = jQuery('.modal .password .emails').val();
					list.lines  = null;
				}

				//Merhod Application save list.
				dataobj.method = 'savelist';
				dataobj.lists.push(list);

				//List Validation.
				try{
					if(list.name === '')
						throw 'Please, complete list name.';
					if( list.shared && list.passw.length > 0 && list.passw.length < 4 )
						throw 'Invalid password, please insert length > 4.';
				}catch(e){ wd.library.showMessage(self.getWrap().find('#new .modal-body'), 'warning', e); return; }
			}else{
				//Merhod Application add lines in this lists.
				dataobj.method = 'addlines';
				successmsg =
				jQuery('.grouplist [class*="list-"] input:checked').each(function(){
					var _list = self.getListObj();
					_list.id = jQuery(this).data('listid');
					dataobj.lists.push(_list);
				});
				//List Validation
				try{
					if(!dataobj.lists.length)
						throw 'Please, select one or multiple lists.';
				}catch(e){ wd.library.showMessage(self.getWrap().find('.panel-body'), 'warning', e); return; }
			}

			new wd.Ajax().run(
				{
					'method' : 'wishlist',
					'dataobj': JSON.stringify(dataobj)
				},
	            true,
	            function(data){
					if(!data.status_error.error)
						 wd.library.showMessage(self.getWrap().find('.lists'), 'success', 'Good! You added this item to your wishlist.');
					else
						 wd.library.showMessage(self.getWrap().find('.lists'), 'danger', data.status_error.msg);
					if(self.getIsAdminPage()){
						self.showLists(data);
						self.closeModal();
					}else
						self.showPanel(data);
					wd.library.globalLoading();
				},
	            'JSON',
	            function(){ wd.library.globalLoading('show'); }
            );
		},

		removeList : function($elem){

			var self   = this,
			dataobj    = self.getDataObj(),
			list       = self.getListObj();

			dataobj.method = 'removelist';
			list.id        = $elem.closest('.row').data('listid');
			list.lines     = null;

			dataobj.lists.push(list);

			new wd.Ajax().run(
					{
						'method' : 'wishlist',
						'dataobj': JSON.stringify(dataobj)
					},
		            true,
		            function(data){
						if(data.status_error.error)
							 wd.library.showMessage(self.getWrap().find('.lists'), 'danger', data.status_error.msg);
						self.showLists(data);
						wd.library.globalLoading();
					},
		            'JSON',
		            function(){}
	        );
		},

		editList : function($e){

			if($e.data('step') !== 'save'){

				var $row = $e.closest('.row');
				$editrow = jQuery(wd.templates.wishlist_rowlistedti_temp);

				$editrow.find('#new-list-name').val($row.find('.name').text());
				$editrow.find('#new-list-msg').val($row.find('.description span').text());

				if($row.find('.sharedicon').data('shared') === 'unlock'){
					$editrow.find('.shared input').attr('checked','checked');
					$editrow.find('.password').show();
				}

				$editrow.find('.shared input').change(function(){
					if(jQuery(this).is(':checked'))
						$editrow.find('.password').fadeIn('slow');
					else $editrow.find('.password').fadeOut('slow');
				});

				$row.find('.info').html($editrow);

				$e.html('Save').data('step', 'save');

			}else if($e.data('step') === 'save'){

				var self = this,
				list     = self.getListObj(),
				dataobj  = self.getDataObj(),
				$row     = $e.closest('.row');

				//Merhod Application save list.
				dataobj.method = 'editlist';
				list.id     = $row.data('listid');
				list.name   = $row.find('.name').val();
				list.desc   = $row.find('.description').val();
				list.passw  = $row.find('.password input').val();
				list.emails = $row.find('.password .emails').val();
				list.shared = ($row.find('.shared input:checked').length > 0);

				dataobj.lists.push(list);

				//List Validation.
				try{
					if(list.name === '')
						throw 'Please, complete list name.';
					if( list.shared && list.passw.length > 0 && list.passw.length < 4 )
						throw 'Invalid password, please insert length > 4.';
				}catch(e){ wd.library.showMessage(self.getWrap().find('.lists'), 'warning', e); return; }

				new wd.Ajax().run(
					{
						'method' : 'wishlist',
						'dataobj': JSON.stringify(dataobj)
					},
		            true,
		            function(data){
						if(!data.status_error.error)
							 wd.library.showMessage(self.getWrap().find('.lists'), 'success', 'Good! You added this item to your wishlist.');
						else
							 wd.library.showMessage(self.getWrap().find('.lists'), 'danger', data.status_error.msg);
						self.showLists(data);
						wd.library.globalLoading();
					},
		            'JSON',
		            function(){wd.library.globalLoading('show');}
	            );
			}
		},

		viewList : function($elem){
			var self = this,
			$wrap    = self.getWrap().find('.items'),
			$row     = $elem.closest('.row'),
			title    = $row.find('h2').text(),
			id       = $row.data('listid');

			$wrap.find('.title h1').text(title);
			$wrap.data('listid', id);

			// ** Show Items **
			self.getItemFromList($wrap);
		},

		addListToCart : function($e){

			var self = this,
			$wrap    = $e.closest('.row');
			list     = self.getListObj(),
			dataobj  = self.getDataObj();

			list.id = $wrap.data('listid');
			dataobj.method = 'getlines';

			dataobj.lists.push(list);

			new wd.Ajax().run(
					{
						'method' : 'wishlist',
						'dataobj': JSON.stringify(dataobj)
					},
		            true,
		            function(data){
						if(!data.status_error.error){
							self.multiAddToCart(data.results);
							wd.library.showMessage(self.getWrap().find('.lists'), 'success', 'Good! You added this items to your cart.');
						}else
							 wd.library.showMessage(self.getWrap().find('.lists'), 'danger', data.status_error.msg);

						wd.library.globalLoading();
					},
		            'JSON',
		            function(){wd.library.globalLoading('show');}
	        );
		},

		multiAddToCart: function(items) {
		   var countID = wd.configuration.config_website.companyid,
	        url     = '/app/site/backend/additemtocart.nl?c=' + countID + '&buyid=multi&',
	        params  = 'multi=';

	        for(var i=0;i<items.length; i++){
	        	var item = items[i];
	        	id = item.custrecord_wl_line_item.internalid;
		        qty = item.custrecord_wl_line_quantity;
		        if (id != '' && qty != '' && qty > 0)
		        	params += id + ',' + qty + ';';
	        }
	        new wd.Ajax().run({}, true, null, 'JSON', null, url + params);
		},

		/*************** Items Section ***************/

		getItemFromList : function($wrap){

			var self = this,
			list     = self.getListObj(),
			dataobj  = self.getDataObj();

			list.id = $wrap.data('listid');
			dataobj.method = 'getlines';
			dataobj.lists.push(list);

			new wd.Ajax().run(
				{
					'method' : 'wishlist',
					'dataobj': JSON.stringify(dataobj)
				},
	            true,
	            function(data) {
					self.showLines(data.results);
					wd.library.globalLoading();
				},
	            'JSON',
	            function(){wd.library.globalLoading('show');}
            );
		},

		showLines : function(items){

			var self = this,
			wrap     = self.getWrap().find('.items .wrap_items'),
			lists    = 'There are no items.';

			wrap.empty();

			if(items && items.length){
				for(var i = 0; i < items.length; i++)
					wrap.tmpl(wd.templates.wishlist_rowitem_temp.replace(/{{itemid}}/ig, items[i].custrecord_wl_line_item.internalid), items[i]);
			}else{
				lists = '<span>' + lists + '</span>';
				wrap.html(lists);
			}

			// ** Show items wrap and hide lists wrap. **
			self.getWrap().find('.lists').fadeOut('slow',function(){
				self.getWrap().find('.items').fadeIn('slow');
			});

			jQuery(".wishlist [data-acction]").click(function(e){
				e.preventDefault();
				var $elem = jQuery(this),
			    _function = $elem.data('acction');
				switch(_function){
					case 'editLine'   : self.editLine($elem);	   break;
					case 'removeLine' : self.removeLine($elem);    break;
					case 'addtocart'  : self.addLineToCart($elem); break;
					case 'moveLine'   : self.moveToList($elem);    break;

				}
			});
		},

		backToList : function(){
			var self = this;
			// ** Show items wrap and hide lists wrap. **
			self.getWrap().find('.items').fadeOut('slow',function(){
				self.getWrap().find('.lists').fadeIn('slow',function(){
					self.getWrap().find('.items').data('listid','null');
					self.getWrap().find('.items .title h1').empty();
					self.getWrap().find('.items .wrap_items').empty();
				});
			});
		},

		removeLine: function($e){
			var self = this,
			$wrap    = $e.closest('.row'),
			list     = self.getListObj(),
			dataobj  = self.getDataObj();

			list.id          = $wrap.closest('.items').data('listid');
			list.lines[0].id = $wrap.data('lineid');
			dataobj.method   = 'removeline';
			dataobj.lists.push(list);

			new wd.Ajax().run(
				{
					'method' : 'wishlist',
					'dataobj': JSON.stringify(dataobj)
				},
	            true,
	            function(data) {
					self.showLines(data.results);
					wd.library.globalLoading();
				},
	            'JSON',
	            function(){wd.library.globalLoading('show');}
	        );
		},

		addLineToCart : function($elem){
			var self = this,
			$row     = $elem.closest('.row'),
			itemid   = $elem.data('itemid');
			qty      = parseInt($row.find('.qty span').html()),
			countID  = wd.configuration.config_website.companyid,
		    url      = '/app/site/backend/additemtocart.nl?c=' + countID + '&buyid='+itemid+'&qty='+qty;

		    new wd.Ajax().run({}, true, function(){
		    	wd.library.globalLoading();
		    	wd.library.showMessage(self.getWrap().find('.items'), 'success', 'Good! You added this item to your cart.');
		    },
		    '',function(){
		    	wd.library.globalLoading('show');
		    }, url);
		},

		generateListToMove : function(){
			var self = this;
			// ** Create or Delete list to move listtomove **
			if(self.getWrap().find('.items .tomove').length > 0 && !self.getWrap().find('#listtomove').length){
				var $lists = jQuery(wd.templates.dropdown_temp.replace('{{title}}', 'Move to List')
													          .replace('{{dropdownid}}', 'listtomove')
							  );
				jQuery('.lists .row').each(function(){
				      var $e = jQuery(this);
				      $lists.find('.dropdown-menu').append(
				    		  jQuery(wd.templates.dropdown_op_temp.replace(/{{value}}/ig, $e.data('listid'))
				    				  							  .replace(/{{text}}/ig,$e.find('.name').text())
				    	      )
				      );
				});

				self.getWrap().find('.items .listsmove').html($lists);

				self.getWrap().find('.dropdown a[role="menuitem"]').click(function(){
					self.moveToList(null, jQuery(this).data('value'), jQuery(this).text());
				});

			}else if(!self.getWrap().find('.items .tomove').length)
				jQuery('#listtomove').closest('.dropdown').remove();

		},

		editLine : function($elem){

			var $row = $elem.closest('.row');

			if($elem.data('step') !== 'save'){

				var qty  = parseFloat($row.find('.qty span').text()),
				priority = $row.find('.priority span').text();

				$row.find('.priority span').html(wd.templates.wishlist_priority_temp);
				$row.find('.qty span').changeElementType('input');
				$row.find('.qty input').attr({type : 'number', min:'1', 'value' : qty}).addClass('form-control number');
				jQuery('#priority option:contains("'+priority+'")').attr('selected','selected');

				$elem.html('Save').data('step', 'save');

			}else if($elem.data('step') === 'save'){

				var self = this,
				list     = self.getListObj(),
				dataobj  = self.getDataObj();

				//Merhod Application edit line.
				dataobj.method         = 'editline';
				list.id                = $row.closest('.items').data('listid');
				list.lines[0].id       = $row.data('lineid');
				list.lines[0].qty      = parseInt($row.find('.qty input').val());
				list.lines[0].priority = jQuery('#priority option:selected').text();

				dataobj.lists.push(list);

				//List Validation.
				try{
					if(!list.lines[0].qty || list.lines[0].qty == 0)
						throw 'Please, insert quantity.';
				}catch(e){ wd.library.showMessage(self.getWrap().find('.items .row[data-lineid="'+list.lines[0].id+'"]'), 'warning', e); return; }

				new wd.Ajax().run(
					{
						'method' : 'wishlist',
						'dataobj': JSON.stringify(dataobj)
					},
		            true,
		            function(data) {
						self.showLines(data.results);
						wd.library.globalLoading();
					},
		            'JSON',
		            function(){wd.library.globalLoading('show');}
				);
			}
		},

		// ** Function Recursive! when the list is selected **
		moveToList: function($elem, listid, title){

			var self = this;

			// ** move to list ACCION **
			if(!$elem && listid){
				var list  = self.getListObj(),
				dataobj   = self.getDataObj(),
				titleList = title;

				list.id    = listid;
				list.lines = [];

				jQuery('.items .tomove').each(function(){
					var $row = jQuery(this).closest('.row');
					list.lines.push({id : $row.data('lineid')});
				});

				dataobj.lists.push(list);
				dataobj.method = 'moveline';

				new wd.Ajax().run(
					{
						'method' : 'wishlist',
						'dataobj': JSON.stringify(dataobj)
					},
		            true,
		            function(data) {
						self.showLines(data.results);

						wd.library.globalLoading();
						self.generateListToMove();

						// ** show destination list
						self.getWrap().find('.items .title h1').html(titleList);
						self.getWrap().find('.items').data('listid', listid);

						wd.library.showMessage(self.getWrap().find('.items'), 'success', 'The items were moved to ' + titleList);
					},
		            'JSON',
		            function(){wd.library.globalLoading('show');}
				);
			}else{
				// ** Select lines to move acctions **
				if($elem.data('step') !== 'tomove')
					$elem.html('pending move...').addClass('tomove').data('step', 'tomove');
				else if($elem.data('step') === 'tomove')
					$elem.html('Move').removeClass('tomove').data('step', 'move');
			}
			self.generateListToMove();
		}
	}
},
/** Marketing Zone **/
wd.MarketingZone = function() {
    this.getConteiner = null;
    this.getCell = null;
    var self = this;
    this.initialize = function(ids, zone, conteiner, cell) {
        this.getConteiner = conteiner;
        this.getCell = cell;
        var ajax = new wd.Ajax;
        ajax.run({
                "method": "marketingzone",
                'zone': zone,
                "iids": JSON.stringify(ids)
            },
            true,
            function(data) {
                if (data) {
                    data = data.results;
                    self.processMarketingZone(data);
                }
            },
            'JSON'
        );
    };
    this.processMarketingZone = function(data) {
        var wrap_conteiner = this.getConteiner.empty(),
            wrap_block = jQuery('<div>').addClass('row item');
        index = 1,
        maxCells = wd.configuration.config_fi_showcell || 4;
        if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                var cell = this.getCell;
                //cell = jQuery().tmplStr(cell, data[i]);
                wrap_block.tmpl(cell, data[i]);
                if (index == maxCells || i == data.length - 1) {
                    wrap_conteiner.append(wrap_block);
                    index = 1;
                    wrap_block = jQuery('<div>').addClass('row item');
                } else
                    index++;
            }
            wrap_conteiner.find('.row').first().addClass('active');
            wd.library.marketingZone.event( jQuery('.marketingzone .btn-tab.active') );
        } else {
	    	wrap_conteiner.parent().hide();
	    	jQuery('.btn-tab[data-carousel="' + wrap_conteiner.parent().attr('id') + '"]').hide();
        }
        processTabsEmpties();
    };
   var processTabsEmpties = function(){
	   jQuery(".list-carousel").each(function(){
		      if(jQuery(this).find('.carousel .row.item div').length == 0)
		           jQuery(this).hide();
		      else
		          jQuery(this).show();
		});
    };
},

/** Custom Ajax **/
wd.Ajax = function() {
    this.success = null;
    this.beforeS = null;
    this.checkajax = false;
    this.req = null;
    var self = this;
    this.run = function(_params, _async, _success, _dataType, _beforeSend, _url, _method) {
        if(this.checkajax && this.req) this.req.abort();
        this.success = _success;
        this.beforeS = _beforeSend;
        var siteid   = wd.configuration.config_is_multisite? wd.configuration.config_website.internalid : '';
        _url         = _url ? _url : wd.library.Configurations.applicationURL + '&wdconfig=' + wd.configuration.id + '&site=' + siteid;
        _method      = _method ? _method : 'POST';

        this.req = jQuery.ajax({
            async: _async,
            url: _url,
            data: _params,
            dataType: _dataType,
            type    : _method,
            success: function(data) {
                self.checkajax = true;
                wd.library.globalLoading();
                if (self.success) self.success(data);
            },
            beforeSend: function(xhrObj) {
                self.checkajax = false;
                wd.library.globalLoading('show');
                if (self.beforeS) self.beforeS();
            }
        });
    };
},

//** Responsive Web Design Scrpt
wd.rwd = {
		responsiveLists : function(elem) {
			var self = this,
			$lists   = elem,
			// All elements that will be
			// converted
			$list, $table, dataAttrs;
			jQuery.each($lists, function(index, list) {
				$list     = jQuery(list);
				$table    = $list.find('table').eq(0);
				dataAttrs = {
					colXs : $list.data('col-xs'),
					colSm : $list.data('col-sm'),
					colMd : $list.data('col-md'),
					colLg : $list.data('col-lg'),
				};
				self.convertTableToDiv($table, dataAttrs, 'odd_row');
			});
		},

		convertTableToDiv : function(table, dataAttrs, oddRowClass) {
			var $table = jQuery(table), $tableBody = $table.find('>tbody'), $tableRows = $tableBody.length ? $tableBody
					.find('>tr')
					: $table.find('>tr'), $tableCols = $tableRows.find('>td'), colCount = $tableRows.length ? $tableRows
					.eq(0).find('>td').size()
					: 4, colWidth = Math.floor(12 / colCount);

			function replaceTable() { // Replace table
				return jQuery('<div class="table-container">').append( jQuery(this).contents() );
			}
			function replaceTableBody() { // Replaces tbody
				return jQuery('<div class="table-body">').append( jQuery(this).contents() );
			}
			function replaceTableRow() { // Replaces tr
				return jQuery('<div class="row">').append(jQuery(this).contents());
			}
			function replaceTableTd() {
				return jQuery(this).contents()
								   .addClass('col-xs-6'/*.replace('{0}', dataAttrs.colXs)*/)
								   .addClass('col-sm-4'/*.replace('{1}',	dataAttrs.colSm)*/)
								   .addClass('col-md-{2}'.replace('{2}',dataAttrs.colMd))/*
								   .addClass('col-md-{2}'.replace('{3}',dataAttrs.colLg))*/;
			}

			// Check if all required data attributes were entered and
			// fill them with a default value otherwise.
			dataAttrs = dataAttrs || {};
			dataAttrs.colXs = dataAttrs.colXs || colWidth;
			dataAttrs.colSm = dataAttrs.colSm || colWidth;
			dataAttrs.colMd = dataAttrs.colMd || colWidth;
			dataAttrs.colLg = dataAttrs.colLg || colWidth;

			// Replace table components
			$tableCols.replaceWith(replaceTableTd);
			$tableRows.replaceWith(replaceTableRow);
			$tableBody.replaceWith(replaceTableBody);
			$table.replaceWith(replaceTable);

			// Odd and Even Classes
			if (oddRowClass)
				jQuery('.row:nth-child(even)').addClass(oddRowClass);
		},

		adjustBreadcrumbs : function(){
			if($(".list").length > 0){
				$(".breadcrumbs .container").removeClass('container');
				$(".breadcrumbs").insertBefore(".rwd.list").first();
				if($(".category").length > 0 && $(".items").length > 0)
					$(".items").prev(".breadcrumbs").html("<h2 class='title'>Items</h2>");
			}
			if($(".single").length > 0)
				$(".breadcrumbs").insertBefore(".single");
		},

		initialize : function(){
			//Event page Initialize
			//Add styling to body in list templates make HTML as responsive as possible
			$("#div__body").addClass('container');

			//** Apply only templates .rwd
			if($('.rwd').length == 0) return;

			var self = this,
			left     = $("td.sidebar").html() || null,
			content  = $(".main").html();

			$("#div__body").html(left);
			$("#div__body").append(content);
			$(".sidebar").addClass("col-sm-2 col-xs-12");

			if($(".sidebar:visible").length > 0)
				$("#div__contentarea").addClass("col-sm-10 col-xs-12");

			//Process Category and Item list
			jQuery('.rwd').each(function(){
				var wrap = jQuery(this);
				self.responsiveLists(wrap.find('.list-table'));
				var rows = wrap.find('div.table-body>div.row');
			    wrap.find('table.list-table').remove();
				wrap.find('.row.bottom').append(rows);
				if(!jQuery('#div__contentarea').find('.inner')){jQuery('#div__contentarea').empty();}
				$('#div__contentarea').append(wrap);
			});

			//Sorting render insert before row bottom
			if(jQuery('.sp-sort').length){			    
			    var links = $(".sp-sort:eq(1), .sp-sort:eq(2)").parent(),
			    wrap      = jQuery(wd.templates.sort_wrap_tmpl || '<div class="sort">').append(links);	
			    wrap.insertBefore("#div__contentarea .row.bottom");
			}

			//Pagination section
			if( jQuery('.results').length > 0 ){
				var textRes = jQuery('.results').text(),
				prev        = jQuery('.results').parents('tr:first').children().find('img').eq(0).parent().attr('href')||'#',
				next        = jQuery('.results').parents('tr:first').children().find('img').eq(1).parent().attr('href')||'#',
				pages       = '';

				jQuery('.results').parents('tr:first').find('td[align="center"]').each(function(){
				       var elem = jQuery(this);
				       if((elem.children().length>0))
				    	   pages +='<li><a href="'+elem.children().attr('href')+'">'+elem.children().html()+'</a></li>';
				       else
				    	   pages +='<li class="active"><a href="#">'+elem.text()+'</a></li>';
				});

				//** Render Pagination
				jQuery("#div__contentarea").tmpl(
						wd.templates.pagination_tmpl,
						{ result : textRes,
						  prev   : prev,
						  pages  : pages,
						  next   : next
						}
				);

				jQuery('.results').parents('table').eq(jQuery('.results').parents('table').length-1).remove();
			}

			//Add class to homepage
			if(wd.configuration.currentpage.ishome){
				$("#div__body").addClass('home');
				$("#div__contentarea").removeClass("col-sm-10 col-xs-12");
			}

			//** Remove Title Category and Table left.
			if(wd.configuration.currentpage.isproductpage || wd.configuration.currentpage.ishome){
				$('h4.title').remove();
				$('table.list-group').remove();
			}

			//** Move Breadcrumbs.
			this.adjustBreadcrumbs();

			//** Remove All tables penddings
			$('table.list-table').remove();

			//Remove sidebar from search
			if(window.location.href.indexOf("search") > 1){
				$(".sidebar").hide();
				$("#div__contentarea").removeClass("col-sm-10");
			}

			//** Remove aux class.
			jQuery(".odd_row").removeClass('odd_row')


		}
};
