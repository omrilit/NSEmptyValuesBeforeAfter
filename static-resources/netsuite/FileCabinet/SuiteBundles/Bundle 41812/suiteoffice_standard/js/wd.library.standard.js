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
wd.version = 'standard';
wd.library = {
    Configurations: { applicationURL : "/app/site/hosting/scriptlet.nl?script=customscript_wd_applications&deploy=customdeploy_wd_applications" },

    globalLoading : function(accion){(accion==='show')? jQuery('#loadingIndicator').addClass('active'):jQuery('#loadingIndicator').removeClass('active');},

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
            jQuery('#autocomp-search-query').on('keyup', function(event){
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
                function(data) {
                	self.processData(data.results, self.getContainer());
                },
                'JSON'
            );
        },
        processData: function(results, container) {

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
	            this.ajax = new wd.Ajax();
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
  var processTabsEmpties = function() {
    jQuery(".list-carousel").each(function() {
      if (jQuery(this).find('.carousel .row.item div').length == 0)
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
