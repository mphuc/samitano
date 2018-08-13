function owlCarouselInit() {
    "use strict";
  /*  var e = $("#main-slider"),
        t = $(".about-slider"),
        o = $(".partner-slider"),
        n = $(".blog-slider"),
        a = $(".testimonial-slider"),
        r = '<i class="fa fa-angle-right" aria-hidden="true"></i>',
        i = '<i class="fa fa-angle-left" aria-hidden="true"></i>';
    e.length && e.owlCarousel({
        loop: !0,
        margin: 0,
        nav: !1,
        navText: [i, r],
        dots: !0,
        autoplay: !0,
        responsive: {
            0: {
                items: 1
            },
            600: {
                items: 1
            },
            1e3: {
                items: 1
            }
        }
    }), t.length && t.owlCarousel({
        loop: !0,
        margin: 0,
        nav: !0,
        navText: [i, r],
        dots: !1,
        autoplay: !1,
        responsive: {
            0: {
                items: 1
            },
            600: {
                items: 1
            },
            1e3: {
                items: 1
            }
        }
    }), a.length && a.owlCarousel({
        loop: !0,
        margin: 0,
        nav: !1,
        navText: [i, r],
        dots: !1,
        autoplay: !0,
        responsive: {
            0: {
                items: 1
            },
            600: {
                items: 1
            },
            1e3: {
                items: 1
            }
        }
    }), o.length && o.owlCarousel({
        loop: !0,
        margin: 0,
        nav: !0,
        navText: [i, r],
        dots: !1,
        autoplay: !0,
        responsive: {
            0: {
                items: 1
            },
            450: {
                items: 2
            },
            700: {
                items: 3
            },
            1e3: {
                items: 4
            }
        }
    }), n.length && n.owlCarousel({
        loop: !0,
        margin: 0,
        nav: !0,
        navText: [i, r],
        dots: !1,
        autoplay: !0,
        responsive: {
            0: {
                items: 1
            },
            700: {
                items: 2
            },
            1e3: {
                items: 3
            }
        }
    })*/
}

function rotate(e) {
    "n" == e.data.d && (currdeg -= 60), "p" == e.data.d && (currdeg += 60), carousel.css({
        "-webkit-transform": "rotateY(" + currdeg + "deg)",
        "-moz-transform": "rotateY(" + currdeg + "deg)",
        "-o-transform": "rotateY(" + currdeg + "deg)",
        transform: "rotateY(" + currdeg + "deg)"
    })
}

function comingsoonInt() {
    "use strict";
    var e = new Date("Dec 24, 2017 15:37:25").getTime();
    setInterval(function() {
        var t = (new Date).getTime(),
            o = e - t,
            n = Math.floor(o % 864e5 / 42e4),
            a = Math.floor(o / 864e5),
            r = Math.floor(o % 864e5 / 36e5),
            i = Math.floor(o % 36e5 / 6e4),
            s = Math.floor(o % 6e4 / 1e3);
        document.getElementById("weeks").innerHTML = n, document.getElementById("days").innerHTML = a, document.getElementById("hours").innerHTML = r, document.getElementById("seconds").innerHTML = s, document.getElementById("minutes").innerHTML = i
    }, 1e3)
}
$(window).on("load", function() {
    "use strict";
    var e = $(".preloader"),
        t = $(".count-number"),
        o = $("#coming-soon-timer"),
        n = $(".faqs"),
        a = $("#scroll-top"),
        r = $(".banner-video"),
        i = $('a[href*="#"]'),
        s = $("html, body"),
        l = $("#header");
    l.length && $(window).on("scroll", function() {
        $(this).scrollTop() > 10 ? l.addClass("sticky-header") : l.removeClass("sticky-header")
    }), e.length && e.addClass("loaderout"), t.appear(function() {
        $(this).each(function() {
            var e = $(this).attr("data-count");
            $(this).find(".counter").delay(6e3).countTo({
                from: 1,
                to: e,
                speed: 8e3,
                refreshInterval: 50
            })
        })
    }), owlCarouselInit(), o.length && comingsoonInt(), n.length && n.accordion(), a.length && (a.on("click", function() {
        s.animate({
            scrollTop: 0
        }, 2e3)
    }), $(window).on("scroll", function() {
        $(this).scrollTop() > 500 ? a.addClass("showScrollTop") : a.removeClass("showScrollTop")
    })), i.on("click", function(e) {
        e.preventDefault(), s.animate({
            scrollTop: $($(this).attr("href")).offset().top
        }, 1e3, "linear")
    }), r.length && $(".video").parent().click(function() {
        $(this).children(".video").get(0).paused ? ($(this).children(".video").get(0).play(), $(this).children(".playpause").fadeOut()) : ($(this).children(".video").get(0).pause(), $(this).children(".playpause").fadeIn(), $(this).children(".playpause").addClass("bg"))
    })
});
var carousel = $(".itg_carousel");
if (carousel.length) {
    currdeg = 0;
    var itNext = $(".itg_next"),
        itPrev = $(".itg_prev");
    itNext.on("click", {
        d: "n"
    }, rotate), itPrev.on("click", {
        d: "p"
    }, rotate)
}