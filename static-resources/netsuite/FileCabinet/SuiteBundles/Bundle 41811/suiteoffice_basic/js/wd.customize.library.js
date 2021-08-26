// JavaScript Document
jQuery(document).ready(function($) {

  //** Selected tab
  var url = document.URL,
    urlAffects = ['contact-us', 'about-us'];

  for (i in urlAffects)
    if (url.match(urlAffects[i])) {
      jQuery('.navbar-nav li').removeClass('tab_active').removeClass('tab_inactive');
      jQuery('.navbar-nav li a[href="/' + urlAffects[i] + '"]').parent().addClass('tab_active');
      break;
    }

    //Hide Tab Wish List and Find Store.
  jQuery('.sidebar a:contains("Wish List")').hide();
  jQuery('.sidebar a:contains("Find a Store")').hide();
  if (wd.version == 'basic')
    jQuery('.nav a:contains("Find a Store")').hide();

  if (wd.version != 'premium' || !wd.configuration.customer.isLoggedIn)
    jQuery('.nav a:contains("Wish List")').hide();

  //Adjustments in body.
  if (!wd.configuration.currentpage.ishome)
    jQuery("#div__body").addClass("container");

  if (wd.configuration.currentpage.isproductpage) {
    //Show Recently view items carousel.
    if (jQuery(".list-carousel.relatedItems .item .cell").length > 0) jQuery(".list-carousel.relatedItems").show();
    //Adjustments if item is Disabled Back Order.
    if (jQuery('#addtocart').length == 0)
      jQuery('form[id*="form"][action="/app/site/backend/additemtocart.nl"]').parent().hide();
  }

  if (document.URL.match('search=')) {
    //Redirect if contains search parameter in home
    if (wd.configuration.currentpage.ishome) location.href = '/';

    //Append Search Val in Text "Search Results"
    var val = document.URL.split('search=')[1].split('&')[0],
      text = ' of <b>' + decodeURI(val) + '</b>';

    jQuery("h2:contains('Search Results')").append(text);
    jQuery("title").append(text.replace(/<b>|<\/b>/ig, ''));
  }

  //Remove message No Items Found from home
  jQuery('td p:contains("No items found.")').closest('tr').remove();

  //Resolve Dinamic Flags in Language
  if (jQuery('#shopperlanguage').length) {
    var language = jQuery('#shopperlanguage').val().split('_')[0].toLowerCase() || 'en';
    jQuery('#flag_laguage').attr('src', '/site/suiteoffice/img/flags/' + language + '.png');
  }

  //Generate Language and Currency Custom Dropdown.
  jQuery('div[class*="select_"] select').each(function() {

    $select = jQuery(this) || null;
    id = $select.attr('id');
    $selClone = jQuery("li#" + id.replace('shopper', ""));

    if ($select && $selClone) {
      var text = $select.find('option:selected').text(),
        value = $select.find('option:selected').val();

      $selClone.find('.dropdown').find('span').html(text).attr('value', value);
      $select.find('option:selected').remove();
      if (id.replace('shopper', "").match('currency'))
        $selClone.find('ul').html($select.html().replace(/option/ig, 'li data-href="/app/site/backend/setshoppercurrency.nl?redirect=/&sel' + id + '="'));
      else
        $selClone.find('ul').html($select.html().replace(/option/ig, 'li data-href="/app/site/backend/setshopperlanguagelocale.nl?redirect=/&sel' + id + '="'));

      $selClone.find('ul li').click(function() {
        var $li = jQuery(this);
        location.href = $li.data('href') + $li.attr('value');
      });
    }
  });

  //Hide if Language or Currency are null
  if (jQuery("li#language li").length > 0) jQuery("li#language").show();
  if (jQuery("li#currency li").length > 0) jQuery("li#currency").show();

  jQuery('body').mousemove(function(e) {
    if (jQuery("#loadingIndicator").hasClass('active'))
      jQuery('#loadingIndicator').css('top', e.pageY - 8).css('left', e.pageX + 8);
  });

  //Hide languaje dropdown from sidebar
  $(".sidebar #shopperlanguage").closest(".portletHandle").remove();

  //Remove white spaces from My Account
  if ($(".ext-gecko").length > 0) {
    $("td").each(function() {
      if ($(this).children().length == 1)
        $(this).find('img[src*="stretch.gif"]').parent().remove();
    });
  }

  if ($(".list").length > 0) //Script for categories
    if ($(".list .row.top img[src$='transparent.gif']").length > 0) //If category image is not available extend wording
      $(".list .row.top img[src$='transparent.gif']").parent().siblings().removeClass("col-sm-6");

  //Mobile responsive fixes
  //$(window).resize(function() {
  //Move user menu to mobile menu
  if ($(window).width() <= 767) {
    //$(".row.middle .container > div:nth-child(2)").removeClass("right").insertBefore(".navbar .nav.navbar-nav").wrap("<div class='row links'></div>");
    $("header .usr").after($("header .cart"));
    $(".navbar.navbar-collapse .container").prepend($(".s-global"));
    $(".s-global").wrap("<div class='row'></div>");
    $(".footer").prepend($(".header .row.top"));
  }
  //});

  //** Select sorting
  if(jQuery('.sp-sort').length){

    jQuery('.sp-sort').parent().removeClass('active');
    if (document.URL.match('sort1=Item_NAME')) {
      $(".sp-sort:contains('Sort by Name')").parent().addClass("active");    
    }
    if (document.URL.match('sort1=Item_ONLINECUSTOMERPRICE')) {
      $(".sp-sort:contains('Sort by Price')").parent().addClass("active");    
    }  

  } 

});

jQuery(window).load(function() {

  //Remove white spaces from My Account
  jQuery('img[src*="stretch."]').css('display', 'none');
  jQuery('td > img[src*="stretch."]').each(function() {
    jQuery(this).parent().remove();
  });

	if(wd.configuration.currentpage.ishome)
		wd.library.marketingZone.event();

  if (wd.configuration.currentpage.isproductpage) { // Instantiate EasyZoom plugin

    jQuery('.easyzoom').easyZoom();

    // handles the image gallery thumbnails
    $('[id^=carousel-selector-]').click(function() {
      var id_selector = $(this).attr("id"),
        id = id_selector.substr(id_selector.length - 1);
      id = parseInt(id);
      $('#single-carousel').carousel(id);
      $('[id^=carousel-selector-]').removeClass('selected');
      $(this).addClass('selected');
    });
    // when the image gallery slides, auto update
    $('#single-carousel').on('slid', function(e) {
      var id = $('.item.active').data('slide-number');
      id = parseInt(id);
      $('[id^=carousel-selector-]').removeClass('selected');
      $('[id^=carousel-selector-' + id + ']').addClass('selected');
    });

    //Show or hide Option title
    if ($(".opts .labelSpanEdit").length > 0)
      $(".opts h4").show();

    //Handle Out of stock color
    var qtyAvailable = $("#qty-av").html();
    if (qtyAvailable == '')
      $(".panel.stock").hide();

    if (parseInt(qtyAvailable) > 0)
      $(".stock h5 .yes").html('In Stock');
    else {
      if ($(".stock h5 .yes").html() == "")
        $(".stock h5 .yes").html('Out of Stock');
      $(".stock h5 .yes").removeClass("yes").addClass("no");
    }

    //Show or hide Qty pricing table
    if ($(".price table.bglt").length > 0) {
      $(".single .price h3").contents().get(0).remove();
	  $(".qty-price").show();
      /*$(".single .price h3").hide();      
      $(".qty-price a").click(function(event) {
        event.preventDefault();
        $(".single .price a .btn").html("-");
        $(".single .price h3").toggle("fast", function() {
          if ($(".single .price a .btn").hasClass('active')) {
            $(".single .price a .btn").removeClass('active');
            $(".single .price a .btn").html('+');
          } else {
            $(".single .price a .btn").addClass('active');
            $(".single .price a .btn").html('-');
          }
        });
      });*/
    }	
	//Stop carousel loop
    $('.carousel').carousel("pause");
  }
  
  //Show or hide Qty pricing table in cells
	$(".cell").each(function(index){
	  var _this = $(this);
	  if(_this.find('h3 .bglt').length){
		_this.find(".price h3").hide();
		_this.find(".qty-price").show();
		_this.find(".qty-price a").click(function(event){
			event.preventDefault();		  
			if($(this).find(".btn").hasClass('active')){
			  $(this).find(".btn").removeClass('active').html('+'); 
			}
			else{
			  $(this).find(".btn").addClass('active').html("-");
			}			
			$(this).closest(".price").find('h3').slideToggle("fast");        
		});
	  }
	});

  //Add finger touch functionality to slider
  try {
     $(".carousel").swiperight(function() {
        $(this).carousel('prev');
     });
     $(".carousel").swipeleft(function() {
        $(this).carousel('next');
     });
  } catch (e) {}
  
	//Add same height as content to left nav
	function sidebarHeight(){
		var sidebar_height = $("#sidebar").height();
		var content_height = $("#div__contentarea").height();
		if(content_height > sidebar_height){
			$("#sidebar").height(content_height);
		}
	}
	sidebarHeight();
	
	//Assign same height to each cell
	/*function cellThumbHeight(){
		var maxHeight = 0;
		$(".list .cell").each(function(){
			var curHeight = parseInt($(this).height());
			if(curHeight > maxHeight){
				maxHeight = curHeight;
			}	
		});
		$(".list .cell").height(maxHeight);
	}
	cellThumbHeight();*/
	
	$(window).resize(function(){
		sidebarHeight();
		//cellThumbHeight();
	});
});