# mintCarousel
移动端页面滑动组件

### Demo

![Demo](http://chart.apis.google.com/chart?cht=qr&chs=200x200&chl=http%3A//cople.github.io/mintCarousel/&chld=H|0)
[Demo](http://cople.github.io/mintCarousel/)

### Usage

```js
var mc = new mintCarousel("#demo", options);
```

### Options

```js
{
     selector: ".page",
     easing: "ease-out",
     duration: 300,
     vertical: true,
     effect: "scale", // scale,cover,pan,cube
     start: 0,
     fade: false,
     fadeCurrentOnly: false,
     loop: true,
     bounce: true,
     threshold: 70,
     draggable: true,
     hidePages: false,
     useMouse: false,
     freeMode: true,
     stopPropagation: true,
     disabled: false,
     disablePrevOnPages: [],
     disableNextOnPages: [],
     width: null,
     height: null,
     beforeChange: null, // function(newIdx, oldIdx){}
     afterChange: null, // function(newIdx, oldIdx){}
     onTouchend: null // function(currIdx, direction){}
}
```

### Methods

```js
mc.getCurrentPage(); // return the index of the current page
mc.count(); // return the length of pages
mc.prev();
mc.next();
mc.goto(index);
mc.enable();
mc.disable();
mc.config(options);
```