#Isocube

Isocube.js is a pixel art cube (rectangular cuboid) generator.

![Example result](/../images/images/example.png?raw=true)

##Usage

```javascript

	var width = 40;
	var height = 50;
	var length = 30;
	var color = new ColorRGB(0.3, 0.1, 0.6, 1.0);
	var pixelSize = 2; // How "zoomed in" the cube should be
	
	var pixelcube = Isocube(width, length, height, color, pixelSize)

	// Draw to canvas
    var canvas = document.getElementById("canvas");
    var width = canvas.width = isocube.bounds.width;
    var height = canvas.height = isocube.bounds.height;
    var ctx = canvas.getContext('2d');
    var canvasData = ctx.getImageData(0, 0, width, height);

    for (var i = 0; i < isocube.data.length; i++) {
        canvasData.data[i] = isocube.data[i];
    };

    ctx.putImageData(canvasData, 0, 0);
```
