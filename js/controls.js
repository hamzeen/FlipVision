function setupToolbar(pClass) {
      function setup(pClass, i, n, duration) {
        i++;
        var s = pClass.substring(0, i);
        var r = s.substring(0, i - 1);
        objDesc.innerHTML = r;

        i <= pClass.length ? setTimeout(function() {
            setup(pClass, i, n, duration);
        }, 30) : setTimeout(function() { n(); }, duration);
      }

      function toggleDesc() {
        setup("Developed by Hamzeen. H.", 0, function() {
            setup("Open Menu for Instructions", 0, function() {
                toggleDesc();
            }, 4000);
        }, 3000);
      }

      var n = $(".meta-wrapper");
      if (document.querySelector(pClass)) {
        var objDesc = document.querySelector(".title-desc span");
        objDesc && toggleDesc();
        "function" == typeof callback && callback(n);
      }
    }

    $(document).ready(function() {
      setTimeout(function() {
        $("body").addClass("onload");
      }, 2e3);
    });

    $(".btn_more")
    .click(function() {
      $(this).toggleClass("transform");
      $("#instructions").toggleClass("collapsed");
    });


    setupToolbar(".widget-meta");
    new WOW({live: !0,offset: 20}).init();

    $(function() {
      if(!flux.browser.supportsTransitions)
        alert("this demo requires your browser to support CSS3 transitions");

      window.f = new flux.slider('#slider', {
                    pagination: false,
                    autoplay: false
                 });

      var hammer = new Hammer(document.getElementById("slidercontainer"));

      hammer.ondrag = function(ev) { // ondrag we preview the next/prev slide
        var left = 0;
        if(ev.direction == 'left') {
          left = 0 - ev.distance;
        } else if(ev.direction == 'right') {
          left = ev.distance;
        }
      };

        hammer.ondragend = function(ev) {
          if(Math.abs(ev.distance) > 70) {
            if(ev.direction == 'right') {
              window.f.prev("turn");
              // console.log(window.f.currentImageIndex+1);
            }
            else if(ev.direction == 'left') {
              window.f.next("turn");
              // console.log(window.f.currentImageIndex+1);
            }
          }
        };

        $(document).keyup(function (i) {
          if (i.keyCode == 39) {
            i.preventDefault();
            window.f.next("turn");
          } else if(i.keyCode == 37){
            i.preventDefault();
            window.f.prev("turn");
          }
        });
    });
