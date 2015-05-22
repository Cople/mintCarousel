new mintCarousel("#cubeDemo", {
    effect: "cube",
    width: 200,
    height: 300,
    fade: true,
    vertical: false,
    useMouse: true
});

new mintCarousel("#cubeDemo2", {
    effect: "cube",
    width: 300,
    height: 200,
    useMouse: true
});

new mintCarousel("#scaleDemo", {
    effect: "scale",
    fade: true,
    useMouse: true
});

new mintCarousel("#coverDemo", {
    effect: "cover",
    vertical: false,
    fade: true,
    fadeCurrentOnly: true,
    useMouse: true
});

new mintCarousel("#panDemo", {
    effect: "pan",
    useMouse: true
});

new mintCarousel("#panDemo2", {
    effect: "pan",
    vertical: false,
    useMouse: true
});

var mc = new mintCarousel("#wrapper", {
	loop: false,
	effect: "pan",
	useMouse: true,
    vertical: true,
	beforeChange: function (newIndex, oldIndex){
		console.log("beforeChange: %s → %s", oldIndex, newIndex);
	},
    afterChange: function (newIndex, oldIndex){
        console.log("afterChange: %s → %s", oldIndex, newIndex);
    },
	onTouchend: function (currIndex, direction){
		console.log("onTouchend: %s %s", currIndex, direction);
	}
});