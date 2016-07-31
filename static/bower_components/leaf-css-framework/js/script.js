// Generated by CoffeeScript 1.8.0
(function() {
  var activateLists, alignChildren, checkResize, elements, getPlatform, init, initFlip, initSlider, initWaves, makeSquare, rows, slide, slideTo;

  getPlatform = function() {
    return window.getComputedStyle(document.body, ':before').getPropertyValue('content').replace(/'/g, '').replace(/"/g, '');
  };

  rows = {
    'mod-row': ['card', 'tile', 'flip'],
    'mod-lists .list-item': ['pull-left', 'pull-right']
  };

  alignChildren = function(rows) {
    var children, row, _results;
    if (rows == null) {
      rows = {};
    }
    _results = [];
    for (row in rows) {
      children = rows[row];
      _results.push($('.' + row).each(function() {
        var child, parent, tallest, _i, _len, _results1;
        parent = $(this);
        tallest = false;
        _results1 = [];
        for (_i = 0, _len = children.length; _i < _len; _i++) {
          child = children[_i];
          parent.find('.' + child).each(function() {
            var height, obj;
            obj = $(this);
            obj.css('height', 'auto');
            height = obj.outerHeight();
            if (height > tallest) {
              return tallest = height;
            }
          });
          if (tallest) {
            _results1.push((function() {
              var _j, _len1, _results2;
              _results2 = [];
              for (_j = 0, _len1 = children.length; _j < _len1; _j++) {
                child = children[_j];
                _results2.push(parent.find('.' + child).css('height', tallest));
              }
              return _results2;
            })());
          } else {
            _results1.push(void 0);
          }
        }
        return _results1;
      }));
    }
    return _results;
  };

  elements = ['resize', 'circle'];

  makeSquare = function(elements, angle) {
    var element, _i, _len, _results;
    if (elements == null) {
      elements = ['resize'];
    }
    if (angle == null) {
      angle = 'height';
    }
    _results = [];
    for (_i = 0, _len = elements.length; _i < _len; _i++) {
      element = elements[_i];
      _results.push($('.' + element).each(function() {
        var obj, reset, value;
        obj = $(this);
        if (angle === 'height') {
          value = obj.innerWidth();
          reset = 'width';
        } else {
          value = obj.outerHeight();
          reset = 'height';
        }
        return obj.css(angle, value);
      }));
    }
    return _results;
  };

  checkResize = function() {
    return $(window).resize(function() {
      clearTimeout(window.counter);
      return window.counter = setTimeout(function() {
        makeSquare(elements);
        alignChildren(rows);
        return window.platform = getPlatform();
      }, 500);
    });
  };

  activateLists = function() {
    return $('.minimized li a').on('click', function() {
      var children, obj, toggle;
      obj = $(this);
      if (obj.attr('href') === '#') {
        children = obj.parent().children('ul');
        toggle = obj.find('.toggle');
        if (children.hasClass('opened')) {
          children.removeClass('opened');
          toggle.removeClass(toggle.attr('data-altclass'));
          toggle.addClass(toggle.attr('data-class'));
          children.slideUp('fast');
        } else {
          children.addClass('opened');
          toggle.removeClass(toggle.attr('data-class'));
          toggle.addClass(toggle.attr('data-altclass'));
          children.slideDown('fast');
        }
        return false;
      }
    });
  };

  initFlip = function() {
    var flips;
    flips = $('.flip');
    flips.each(function() {
      var events, flip;
      flip = $(this);
      events = {};
      if (flip.hasClass('onclick')) {
        events.click = function() {
          if (!flip.hasClass('toggle')) {
            return flip.addClass('toggle');
          } else {
            return flip.removeClass('toggle');
          }
        };
      } else {
        events.mouseenter = function() {
          return flip.addClass('toggle');
        };
        events.mouseleave = function() {
          return flip.removeClass('toggle');
        };
      }
      flip.on(events);
    });
  };

  slide = function(obj, nextslide) {
    var marginleft;
    marginleft = nextslide * 100;
    obj.self.children('.stripe').animate({
      'marginLeft': '-' + marginleft + '%'
    });
    obj.nav.find('a').removeClass('active');
    obj.nav.find('a:eq(' + nextslide + ')').addClass('active');
    obj.self.data('currentslide', nextslide);
    if ((nextslide + 1) === obj.self.find('.slide').length) {
      obj.prevbutton.removeClass('inactive');
      obj.nextbutton.addClass('inactive');
      return 0;
    } else {
      obj.nextbutton.removeClass('inactive');
      if (nextslide === 0) {
        obj.prevbutton.addClass('inactive');
      } else {
        obj.prevbutton.removeClass('inactive');
      }
      return nextslide;
    }
  };

  slideTo = function(direction, slider, interval) {
    var currentslide;
    if (interval == null) {
      interval = false;
    }
    if (!interval) {
      clearInterval(slider.self.data('interval'));
    }
    currentslide = slider.self.data('currentslide');
    if (direction === 'next') {
      currentslide++;
      if (currentslide >= slider.self.find('.stripe.crow .slide').length) {
        currentslide = 0;
      }
      return slide(slider, currentslide);
    } else if (direction === 'prev') {
      currentslide--;
      if (currentslide < 0) {
        currentslide = slider.self.find('.stripe.crow .slide').length - 1;
      }
      return slide(slider, currentslide);
    }
  };

  initSlider = function() {
    var sliders;
    sliders = $('.slider');
    sliders.each(function() {
      var hammertime, slider;
      slider = {
        self: $(this),
        nav: $(this).find('.slider-nav'),
        nextbutton: $(this).find('.next'),
        prevbutton: $(this).find('.prev'),
        interval: 0
      };
      if (slider.self.find('.stripe.crow .slide').length > 1) {
        if (typeof slider.self.data('currentslide') === 'undefined') {
          slider.self.data('currentslide', 0);
        }
        if (slider.interval) {
          slider.self.data('interval', setInterval(function() {
            return slideTo('next', slider, true);
          }, slider.interval));
        }
        hammertime = new Hammer(slider.self[0]);
        hammertime.on('swipeleft', function(ev) {
          return slideTo('next', slider);
        });
        hammertime.on('swiperight', function(ev) {
          return slideTo('prev', slider);
        });
      }
      if (slider.nextbutton.length) {
        slider.nextbutton.on('click', function() {
          slideTo('next', slider);
          return false;
        });
      }
      if (slider.prevbutton.length) {
        slider.prevbutton.on('click', function() {
          slideTo('prev', slider);
          return false;
        });
      }
      return slider.nav.find('a').on('click', function() {
        var index;
        clearInterval(slider.self.data('interval'));
        index = slider.nav.find('a').index(this);
        slide(slider, index);
        return false;
      });
    });
  };

  initWaves = function() {
    return Waves.displayEffect();
  };

  init = function() {
    imagesLoaded($('body')[0]).on('always', function() {
      makeSquare(elements);
      return alignChildren(rows);
    });
    checkResize();
    activateLists();
    initSlider();
    initWaves();
    return initFlip();
  };

  init();

}).call(this);
