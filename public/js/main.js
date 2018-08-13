$(document).ready(function($) {
     'use strict';
     setTimeout(function() {
        $('#home').css({'background-image' : 'url(/img/bg_home.jpg)'});

        $('.flip-items a.singapore').css({'background-image' : 'url(../img/clients/singapore_640.png)'});
        $('.flip-items a.china').css({'background-image' : 'url(../img/clients/flags_PNG14606.png)'});
        $('.flip-items a.korea').css({'background-image' : 'url(../img/clients/korea_south_640.png)'});
        $('.flip-items a.india').css({'background-image' : 'url(../img/clients/11-2-india-flag-transparent.png)'});
        $('.flip-items a.malaysia').css({'background-image' : 'url(../img/clients/malaysia_640.png)'});
        $('.flip-items a.germany').css({'background-image' : 'url(../img/clients/germany_640.png)'});
        $('.flip-items a.australia').css({'background-image' : 'url(../img/clients/Australia-Flag-Free-Download-PNG.png)'});
        $('.flip-items a.vietnam').css({'background-image' : 'url(../img/clients/6-2-vietnam-flag-png.png)'});

        $('.statistics-bg-image').css({'background-image' : 'url(/img/p2pbg.jpg)'});

        $('#contact').css({'background-image' : 'url(../img/contact.jpg)'});
        $('.clients').css({'background-image' : 'url(../img/bg.jpg)'});
     }, 1000);
  
     $('.lazy').show().lazy().removeClass('lazy');

    var affiliate = location.search;
    if (affiliate) {
        affiliate = affiliate.split("?");
        affiliate = affiliate[1].split("=");
       
        if (affiliate[0] == 'ref') {
            SetCookie('ref', affiliate[1], 2);
           
        }
    }
    function SetCookie(cookieName,cookieValue,nDays) {
     var today = new Date();
     var expire = new Date();
     if (nDays==null || nDays==0) nDays=1;
     expire.setTime(today.getTime() + 3600000*24*nDays);
     document.cookie = cookieName+"="+escape(cookieValue)
                     + ";expires="+expire.toGMTString();
    }


     $('#preloader').css('display', 'none');

     $.material.init();

     $("#sticky-nav").show().sticky({ topSpacing: 0 });


     $(function() {
         $('a[href*="#"]:not([data-toggle="tab"])').on('click', function() {
             if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
                 var target = $(this.hash);
                
                 target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                 if (target.length) {
                    $('.navbar-toggle').trigger('click');
                     $('html, body').animate({
                         scrollTop: target.offset().top
                     }, 1000);
                     return false;
                 }
             }
         });
     });


     // Typing text
     $("#animated-text").typed({
         strings: [
             "THE CRYPTO CURRENCY REVOLUTION"
         ],
         typeSpeed: 50,
         loop: true,
     });


     // Reveiws

     $("#clients #owl-carousel").owlCarousel({
         loop: true,
         items: 1,
         dots: true,
     });
     $("#slider").show();
     $("#slider").flipster({
    style: 'carousel',
    spacing: -0.1,
    nav: true,
    buttons: true,
});

     /*Blog*/

     $('#blog #blog-carousel').owlCarousel({
         loop: true,
         margin: 30,
         autoplay: true,
         nav: false,
         dots: false,
         responsive: {
             0: {
                 items: 1
             },
             300: {
                 items: 1
             },
             600: {
                 items: 2
             },
             900: {
                 items: 3
             },
             1200: {
                 items: 3
             }
         }
     });
    
 });
