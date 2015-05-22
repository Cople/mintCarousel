(function(window, $) {
    var defaults = {
            selector: ".page",
            easing: "ease-out",
            duration: 300,
            vertical: true,
            effect: "scale",
            start: 0,
            fade: false,
            fadeCurrentOnly: false,
            loop: true,
            bounce: true,
            threshold: 70,
            draggable: true,
            hidePages: false,
            useMouse: false,
            stopPropagation: true,
            disabled: false,
            disablePrevOnPages: [],
            disableNextOnPages: [],
            width: null,
            height: null,
            beforeChange: null,
            afterChange: null,
            onTouchend: null
        },
        docEl = document.documentElement,
        style = docEl.style,
        matches = docEl.matches || docEl.webkitMatchesSelector || docEl.mozMatchesSelector || docEl.msMatchesSelector || docEl.oMatchesSelector,
        transformName = "transform" in style ? "transform" : "WebkitTransform",
        transitionName = "transition" in style ? "transition" : "WebkitTransition",
        transitionendName = "transition" in style ? "transitionend" : "webkitTransitionEnd",
        TOUCH_EVENTS_NAMES, TOUCH_EVENTS_TYPE;

    if (navigator.pointerEnabled) {
        TOUCH_EVENTS_NAMES = {
            start: "pointerdown",
            move: "pointermove",
            end: "pointerup",
            cancel: "pointercancel"
        };
        TOUCH_EVENTS_TYPE = "pointer";
    } else if (navigator.msPointerEnabled) {
        TOUCH_EVENTS_NAMES = {
            start: "MSPointerDown",
            move: "MSPointerMove",
            end: "MSPointerUp",
            cancel: "MSPointerCancel"
        };
        TOUCH_EVENTS_TYPE = "pointer";
    } else if ("ontouchstart" in window) {
        TOUCH_EVENTS_NAMES = {
            start: "touchstart",
            move: "touchmove",
            end: "touchend",
            cancel: "touchcancel"
        };
        TOUCH_EVENTS_TYPE = "touch";
    } else {
        TOUCH_EVENTS_NAMES = {
            start: "mousedown",
            move: "mousemove",
            end: "mouseup",
            cancel: "mouseleave"
        };
        TOUCH_EVENTS_TYPE = "mouse";
    };

    function isPrimaryTouch(event) {
        return TOUCH_EVENTS_TYPE == "pointer" ? event.isPrimary : true;
    };

    function getTouchEvent(event) {
        return TOUCH_EVENTS_TYPE == "touch" ? event.touches[0] : event;
    };

    function one(element, eventName, callback, timeout) {
        var eventHandler = function() {
            element.removeEventListener(eventName, eventHandler, false);
            callback();
            if (timeout) clearTimeout(timer);
        }, timer;
        element.addEventListener(eventName, eventHandler, false);
        if (timeout) timer = setTimeout(eventHandler, timeout);
    };

    function extend() {
        for (var i = 1, len = arguments.length; i < len; i++) {
            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key)) arguments[0][key] = arguments[i][key];
            };
        };
        return arguments[0];
    };

    function easeOutCubic(currentIteration, startValue, changeInValue, totalIterations) {
        return changeInValue * (Math.pow(currentIteration / totalIterations - 1, 3) + 1) + startValue;
    };

    function mintCarousel(wrapper, options) {
        var self = this,
            settings = extend({}, defaults, options),
            touchEventsNames = (TOUCH_EVENTS_TYPE == "mouse" && !settings.useMouse) ? {} : extend({}, TOUCH_EVENTS_NAMES),
            isV = settings.vertical,
            pageDir = isV ? "pageY" : "pageX",
            wrapper = typeof wrapper == "string" ? document.querySelector(wrapper) : wrapper,
            pages = Array.prototype.slice.call(wrapper.children).filter(function(el) {
                return matches.call(el, settings.selector)
            }),
            total = pages.length,
            moving = false,
            disabled = settings.disabled,
            size = (settings.width && settings.height) ? {
                width: settings.width,
                height: settings.height
            } : wrapper.getBoundingClientRect(),
            range = size[isV ? "height" : "width"],
            delta = 0,
            currIdx = settings.start,
            lastIdx, currPage, prevPage, nextPage, firstTouch, lastTouch;

        function init() {
            if (!range) range = window[isV ? "innerHeight" : "innerWidth"];
            if (settings.effect == "cube") {
                wrapper.style.overflow = "visible";
                wrapper.style["perspective" in wrapper.style ? "perspective" : "webkitPerspective"] = range * 4 + "px";
            };
            pages.forEach(function(page, index) {
                page._pageIdx = index;
                page.classList.add("page-" + (index + 1));
                if (index != currIdx){
                    if (settings.hidePages) wrapper.removeChild(page);
                } else {
                    page.classList.add("active");
                };
            });
            wrapper.classList.add("mintCarousel");
            wrapper.style.touchAction = wrapper.style.msTouchAction = isV ? "pan-y" : "pan-x";
            wrapper.addEventListener(touchEventsNames.start, touchstart, false);
            wrapper.addEventListener(touchEventsNames.move, function(event) {
                event.preventDefault();
            }, false);
        };

        function canPrev() {
            return settings.loop || (currIdx > 0 && settings.disablePrevOnPages.indexOf(currIdx) == -1);
        };

        function canNext() {
            return settings.loop || (currIdx < total - 1 && settings.disableNextOnPages.indexOf(currIdx) == -1);
        };

        function updateStyle(pct) {
            var absPct = Math.abs(pct);
            var pct100 = pct * 100;

            if (settings.fade) {
                currPage.style.opacity = 1 - absPct;
                if (!settings.fadeCurrentOnly && prevPage) prevPage.style.opacity = pct;
                if (!settings.fadeCurrentOnly && nextPage) nextPage.style.opacity = -pct;
            };
            if (settings.effect == "scale") {
                if (isV) {
                    currPage.style[transformName] = "translate3d(0, " + pct * 50 + "%, 0) scale(" + ((1 - absPct) * 0.5 + 0.5) + ")";
                } else {
                    currPage.style[transformName] = "translate3d(" + pct * 50 + "%, 0, 0) scale(" + ((1 - absPct) * 0.5 + 0.5) + ")";
                };
            };
            if (settings.effect == "pan") {
                if (isV) {
                    currPage.style[transformName] = "translate3d(0, " + pct100 + "%, 0)";
                } else {
                    currPage.style[transformName] = "translate3d(" + pct100 + "%, 0, 0)";
                };
            };
            if (settings.effect == "cover") {
                if (isV) {
                    currPage.style[transformName] = "scale(" + ((1 - absPct) * 0.5 + 0.5) + ")";
                } else {
                    currPage.style[transformName] = "scale(" + ((1 - absPct) * 0.5 + 0.5) + ")";
                };
            };
            if (settings.effect == "scale" || settings.effect == "pan" || settings.effect == "cover") {
                if (isV) {
                    if (prevPage) prevPage.style[transformName] = "translate3d(0, " + (pct100 - 100) + "%, 0)";
                    if (nextPage) nextPage.style[transformName] = "translate3d(0, " + (pct100 + 100) + "%, 0)";
                } else {
                    if (prevPage) prevPage.style[transformName] = "translate3d(" + (pct100 - 100) + "%, 0, 0)";
                    if (nextPage) nextPage.style[transformName] = "translate3d(" + (pct100 + 100) + "%, 0, 0)";
                };
                return;
            };
            if (settings.effect == "cube") {
                var z = (0.888 * range / 2);
                //var y = 90 * Math.min(1, Math.max(-1, pct));
                var y = 90 * pct;
                var offset = 90;
                var rotateDir = isV ? "rotateX" : "rotateY";
                if (isV) {
                    y = -y;
                    offset *= -1;
                };
                currPage.style[transformName] = rotateDir + "(" + y + "deg) translateZ(" + z + "px) scale(0.888)";
                if (prevPage) prevPage.style[transformName] = rotateDir + "(" + (y - offset) + "deg) translateZ(" + z + "px) scale(0.888)";
                if (nextPage) nextPage.style[transformName] = rotateDir + "(" + (y + offset) + "deg) translateZ(" + z + "px) scale(0.888)";
            };
        };

        function prepare(direction, index) {
            moving = true;
            currPage = pages[currIdx];
            currPage.classList.add("curr");
            if ((!direction || direction == "prev") && (currIdx == 0 ? settings.loop : true) && (settings.disablePrevOnPages.indexOf(currIdx) == -1)) {
                prevPage = pages[typeof index == "number" ? index : currIdx > 0 ? currIdx - 1 : total - 1];
                prevPage.classList.add("prev");
                if (settings.hidePages) wrapper.appendChild(prevPage);
            };
            if ((!direction || direction == "next") && (currIdx == total - 1 ? settings.loop : true) && (settings.disableNextOnPages.indexOf(currIdx) == -1)) {
                nextPage = pages[typeof index == "number" ? index : currIdx < total - 1 ? currIdx + 1 : 0];
                nextPage.classList.add("next");
                if (settings.hidePages) wrapper.appendChild(nextPage);
            };
            updateStyle(0);
        };

        function cleanStyle(el) {
            el.style[transitionName] = el.style[transformName]  = el.style.opacity = null;
        };

        function cleanup(type) {
            cleanStyle(wrapper);
            cleanStyle(currPage);
            currPage.classList.remove("curr");
            currPage = null;
            if (prevPage) {
                cleanStyle(prevPage);
                prevPage.classList.remove("prev");
                prevPage = null;
            };
            if (nextPage) {
                cleanStyle(nextPage);
                nextPage.classList.remove("next");
                nextPage = null;
            };
            moving = false;
            if (type != "restore" && settings.afterChange) settings.afterChange.call(self, currIdx, lastIdx, pages[currIdx]);
        };

        function touchstart(event) {
            if (settings.stopPropagation) event.stopPropagation();
            if (disabled || moving || !isPrimaryTouch(event)) return false;
            var pos = getTouchEvent(event)[pageDir];
            firstTouch = {
                pos: pos,
                time: Date.now()
            };
            wrapper.addEventListener(touchEventsNames.move, touchmove, false);
            wrapper.addEventListener(touchEventsNames.end, touchend, false);
            wrapper.addEventListener(touchEventsNames.cancel, touchend, false);
        };

        function touchmove(event) {
            if (!isPrimaryTouch(event)) return false;
            var lastDelta = delta;
            var pos = getTouchEvent(event)[pageDir];
            lastTouch = {
                pos: pos,
                time: Date.now()
            };
            delta = lastTouch.pos - firstTouch.pos;
            if (!moving) {
                prepare();
            } else {
                if (!settings.bounce && ((delta < 0 && !canNext()) || (delta > 0 && !canPrev()))) {
                    firstTouch.pos = lastTouch.pos;
                    firstTouch.time = lastTouch.time;
                    delta = 0;
                    return false;
                };
                if (settings.draggable) {
                    var threshold = settings.threshold * 2;
                    var thresholdPct = settings.threshold / range;
                    if (delta > 0 && !prevPage) {
                        if (delta > threshold) {
                            delta = lastDelta;
                            firstTouch.pos = lastTouch.pos - threshold;
                        } else {
                            updateStyle(easeOutCubic(delta, 0, thresholdPct, threshold));
                        };
                    } else if (delta < 0 && !nextPage) {
                        if (-delta > threshold) {
                            delta = lastDelta;
                            firstTouch.pos = lastTouch.pos + threshold;
                        } else {
                            updateStyle(-easeOutCubic(-delta, 0, thresholdPct, threshold));
                        };
                    } else {
                        updateStyle(delta / range);
                    };
                };
            };
        };

        function touchend(event) {
            wrapper.removeEventListener(touchEventsNames.move, touchmove, false);
            wrapper.removeEventListener(touchEventsNames.end, touchend, false);
            wrapper.removeEventListener(touchEventsNames.cancel, touchend, false);
            if (!moving) return false;
            var pct = delta / range;
            var speed = delta / (lastTouch.time - firstTouch.time);
            if (speed < -0.8 || pct < -0.2) {
                settings.onTouchend && settings.onTouchend.call(self, currIdx, "next");
                if (prevPage && settings.hidePages) wrapper.removeChild(prevPage);
                nextPage ? next() : restore();
            } else if (speed > 0.8 || pct > 0.2) {
                settings.onTouchend && settings.onTouchend.call(self, currIdx, "prev");
                if (nextPage && settings.hidePages) wrapper.removeChild(nextPage);
                prevPage ? prev() : restore();
            } else {
                settings.onTouchend && settings.onTouchend.call(self, currIdx, "restore");
                restore();
            };
        };

        function prev() {
            if (!moving) return false;
            lastIdx = currIdx;
            currIdx = prevPage._pageIdx;
            settings.beforeChange && settings.beforeChange.call(self, currIdx, lastIdx);
            wrapper.style[transitionName] = currPage.style[transitionName] = prevPage.style[transitionName] = settings.duration + "ms " + settings.easing;
            updateStyle(1);
            one(currPage, transitionendName, function() {
                if (settings.hidePages) wrapper.removeChild(currPage);
                currPage.classList.remove("active");
                prevPage.classList.add("active");
                cleanup("prev");
            }, settings.duration + 50);
        };

        function next() {
            if (!moving) return false;
            lastIdx = currIdx;
            currIdx = nextPage._pageIdx;
            settings.beforeChange && settings.beforeChange.call(self, currIdx, lastIdx);
            wrapper.style[transitionName] = currPage.style[transitionName] = nextPage.style[transitionName] = settings.duration + "ms " + settings.easing;
            updateStyle(-1);
            one(currPage, transitionendName, function() {
                if (settings.hidePages) wrapper.removeChild(currPage);
                currPage.classList.remove("active");
                nextPage.classList.add("active");
                cleanup("next");
            }, settings.duration + 50);
        };

        function restore() {
            if (!settings.draggable) return cleanup("restore");
            wrapper.style[transitionName] = currPage.style[transitionName] = settings.duration + "ms " + settings.easing;
            if (prevPage) prevPage.style[transitionName] = currPage.style[transitionName];
            if (nextPage) nextPage.style[transitionName] = currPage.style[transitionName];
            updateStyle(0);
            one(currPage, transitionendName, function() {
                cleanup("restore");
            }, settings.duration + 50);
        };

        this.getCurrentPage = function(index) {
            return pages[currIdx];
        };
        this.count = function(index) {
            return pages.length;
        };
        this.prev = function(index) {
            if (disabled || moving || currIdx == index || !canPrev()) return false;
            prepare("prev", index);
            setTimeout(prev, 20);
        };
        this.next = function(index) {
            if (disabled || moving || currIdx == index || !canNext()) return false;
            prepare("next", index);
            setTimeout(next, 20);
        };
        this.goto = function(index) {
            index < currIdx ? this.prev(index) : this.next(index);
        };
        this.enable = function() {
            disabled = false;
        };
        this.disable = function() {
            disabled = true;
        };
        this.config = function(options) {
            extend(settings, options);
            isV = settings.vertical;
            pageDir = isV ? "pageY" : "pageX";
        };

        init();
    };

    window.mintCarousel = mintCarousel;

    if ($) {
        var pluginName = "mintCarousel";
        $.fn[pluginName] = function(method, param) {
            return this.each(function() {
                var $el = $(this);
                if (typeof method == "string") {
                    $el.data(pluginName)[method](param);
                } else {
                    if (!$el.data(pluginName)) $el.data(pluginName, new mintCarousel(this, method));
                };
            });
        };
    };
})(window, window.Zepto || window.jQuery);