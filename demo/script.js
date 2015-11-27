function startDemo() {
    var isocube = new Isocube(Math.round(40 + Math.random() * 40), Math.round(40 + Math.random() * 40), 2 * Math.round(40 + Math.random() * 40), new ColorRGB(Math.random(), Math.random(), Math.random(), 1), 1);

    var canvas = document.getElementById("canvas");
    var width = canvas.width = isocube.bounds.width;
    var height = canvas.height = isocube.bounds.height;
    var canvasCtx = canvas.getContext('2d');
    var canvasData = canvasCtx.getImageData(0, 0, width, height);

    for (var i = 0; i < isocube.data.length; i++) {
        canvasData.data[i] = isocube.data[i];
    };

    canvasCtx.putImageData(canvasData, 0, 0);
}
