var Palette = function(color) {

    function clamp(v) {
        return Math.max(0.2, Math.min(0.85, v));
    }

    var totalValue = color.r + color.g + color.b;

    if (totalValue < 0.2 || totalValue > 0.85) {
        color = new ColorRGB(clamp(color.r), clamp(color.g), clamp(color.b), 1);
    } else {
        color.a = 1;
    }

    var hslColor = color.getHSL();

    var palette =[
        hslColor.lighten(90).getRGB().makeWarmer(7),
        hslColor.lighten(40).getRGB().makeWarmer(7),
        hslColor.lighten(20).getRGB().makeWarmer(7),
        color,
        hslColor.darken(20).getRGB().makeColder(4),
        hslColor.darken(40).getRGB().makeColder(4),
        hslColor.darken(50).getRGB().makeColder(4)
    ];

    return palette;
};

var Isocube = function(width, length, height, color, pixelSize) {

    var pixelSize = pixelSize ? pixelSize : 1;

    var colors = new Palette(color);

    var palette = {
        TRANSPARENT: new ColorRGB(1, 1, 1, 0),
        LIGHTEST_OUTLINE: colors[0],
        LIGHT_OUTLINE: colors[1],
        LIGHTEST_FACE: colors[2],
        LIGHT_FACE: colors[3],
        DARK_FACE: colors[4],
        DARKEST_FACE: colors[5],
        OUTLINE: colors[6]
    };

    var data = [];

    var bounds = {
        width: pixelSize * (2 * (width + length) - 1),
        height: pixelSize * (width + length + height - 2)
    };

    var penpos = {
        x: 0,
        y: 0
    };
    var penColor = palette.TRANSPARENT;

    for (var i = 0; i < bounds.width; i++) {
        for (var j = 0; j < bounds.height; j++) {
            setPixel(i, j, penColor);
        }
    }

    function movePen(px, py) {
        penpos.x = px;
        penpos.y = py;
    }

    function movePenPoint(point) {
        penpos.x = point.x;
        penpos.y = point.y;
    }

    function movePenRelative(dx, dy) {
        penpos.x += dx * pixelSize;
        penpos.y += dy * pixelSize;
    }

    function setPixel(x, y, color) {
        for (var i = 0; i < pixelSize; i++) {
            for (var j = 0; j < pixelSize; j++) {
                data[4 * (bounds.width * (y + j) + (x + i)) + 0] = color.r * 255;
                data[4 * (bounds.width * (y + j) + (x + i)) + 1] = color.g * 255;
                data[4 * (bounds.width * (y + j) + (x + i)) + 2] = color.b * 255;
                data[4 * (bounds.width * (y + j) + (x + i)) + 3] = color.a * 255;
            }
        }
    }

    function drawSlantedLineUpTo(target) {
        var start = penpos.x;
        while (penpos.x <= target.x && penpos.y >= target.y) {
            setPixel(penpos.x, penpos.y, penColor);
            setPixel(penpos.x + pixelSize, penpos.y, penColor);
            movePenRelative(2, -1);
        }
        movePenRelative(-2, 1);
    }

    function drawSlantedLineDownTo(target) {
        var start = penpos.x;
        while (penpos.x <= target.x && penpos.y <= target.y) {
            setPixel(penpos.x, penpos.y, penColor);
            setPixel(penpos.x + pixelSize, penpos.y, penColor);
            movePenRelative(2, 1);
        }
        movePenRelative(-2, -1);
    }

    function drawVerticalLineTo(target) {
        var start = penpos.y;
        while (penpos.y < target.y) {
            setPixel(penpos.x, penpos.y, penColor);
            movePenRelative(0, 1);
        }
        movePenRelative(0, -1);
    }

    function drawVerticalLine(distance) {
        var start = penpos.y;
        while (penpos.y < start + distance) {
            setPixel(penpos.x, penpos.y, penColor);
            movePenRelative(0, 1);
        }
        movePenRelative(0, -1);
    }

    function drawHorizontalLine(distance) {
        var start = penpos.x;
        while (penpos.x < start + distance) {
            setPixel(penpos.x, penpos.y, penColor);
            movePenRelative(1, 0);
        }
        movePenRelative(-1, 0);
    }

    function floodFill(pos) {

        function matchStartColor(position) {
            var r = data[position + 0];
            var g = data[position + 1];
            var b = data[position + 2];

            return (r == palette.TRANSPARENT.r * 255 && g == palette.TRANSPARENT.g * 255 && b == palette.TRANSPARENT.b * 255);
        }

        function colorPixel(position) {
            data[position + 0] = 255 * penColor.r;
            data[position + 1] = 255 * penColor.g;
            data[position + 2] = 255 * penColor.b;
            data[position + 3] = 255;
        }

        var pixelStack = [pos];

        while(pixelStack.length)
        {
            var newPos = pixelStack.pop();
            var x = newPos.x;
            var y = newPos.y;

            var pixelPos = (y * bounds.width + x) * 4;

            var reachLeft;
            var reachRight;

            while(y-- >= 0 && matchStartColor(pixelPos)) {
                pixelPos -= bounds.width * 4;
            }
            pixelPos += bounds.width * 4;
            y++;
            reachLeft = false;
            reachRight = false;
            while(y++ < bounds.height - 1 && matchStartColor(pixelPos)) {
                colorPixel(pixelPos);

                if (x > 0) {
                    if (matchStartColor(pixelPos - 4)) {
                        if (!reachLeft){
                            pixelStack.push({
                                x: x - 1,
                                y: y
                            });
                            reachLeft = true;
                        }
                    } else if (reachLeft) {
                        reachLeft = false;
                    }
                }

                if (x < bounds.width - 1) {
                    if (matchStartColor(pixelPos + 4)) {
                        if (!reachRight) {
                            pixelStack.push({
                                x: x + 1,
                                y: y
                            });
                            reachRight = true;
                        }
                    } else if (reachRight) {
                        reachRight = false;
                    }
                }
                pixelPos += bounds.width * 4;
            }
        }
    }

    var topLeft = {
        x: 0,
        y: pixelSize * (length - 1)
    };
    var topTop = {
        x: pixelSize * (length * 2 - 1),
        y: 0
    };
    var topRight = {
        x: pixelSize * (2 * (length + width) - 2),
        y: pixelSize * (width - 1)
    };
    var topBottom = {
        x: pixelSize * (width * 2 - 1),
        y: pixelSize * (width + length - 2)
    };

    var bottomRight = {
        x: topRight.x,
        y: topRight.y + pixelSize * (height - 1)
    };
    var bottomBottom = {
        x: topBottom.x,
        y: topBottom.y + pixelSize * (height - 1)
    };
    var bottomLeft = {
        x: topLeft.x,
        y: topLeft.y + pixelSize * (height - 1)
    };

    var topFace = {
        x: Math.round(0.5 * (topLeft.x + topRight.x)),
        y: Math.round(0.5 * (topLeft.y + topRight.y))
    };
    var rightFace = {
        x: Math.round(0.5 * (bottomBottom.x + topRight.x)),
        y: Math.round(0.5 * (bottomBottom.y + topRight.y))
    };
    var leftFace = {
        x: Math.round(0.5 * (bottomLeft.x + topBottom.x)),
        y: Math.round(0.5 * (bottomLeft.y + topBottom.y))
    };


    function fillLeft() {
        penColor = palette.LIGHT_FACE;
        floodFill(leftFace);
    }

    function fillRight() {
        penColor = palette.DARK_FACE;
        floodFill(rightFace);
    }

    function fillTop() {
        penColor = palette.LIGHTEST_FACE;
        floodFill(topFace);
    }

    function drawHighlightedOutline() {
        penColor = palette.LIGHT_OUTLINE;
        movePenPoint(topLeft);
        drawSlantedLineDownTo(topBottom);

        movePenPoint(topBottom);
        drawSlantedLineUpTo(topRight);

        movePenPoint(topBottom);
        drawVerticalLineTo(bottomBottom);
    }

    function drawCornerHighlight() {
        penColor = palette.LIGHTEST_OUTLINE;
        movePenPoint(topBottom);
        drawVerticalLine(pixelSize * 3);
        movePenPoint(topBottom);
        movePenRelative(-1, 0);
        drawHorizontalLine(pixelSize * 3);
    }

    function drawOutline() {
        penColor = palette.OUTLINE;
        movePenPoint(topLeft);
        drawSlantedLineUpTo(topTop);

        movePenPoint(topTop);
        drawSlantedLineDownTo(topRight);

        movePenPoint(topLeft);
        drawVerticalLineTo(bottomLeft);

        movePenPoint(topRight);
        drawVerticalLineTo(bottomRight);

        movePenPoint(bottomLeft);
        drawSlantedLineDownTo(bottomBottom);

        movePenPoint(bottomBottom);
        drawSlantedLineUpTo(bottomRight);
    }

    function drawInnerOutlineTop() {
        penColor = palette.LIGHT_FACE;

        movePenPoint(topLeft);
        movePenRelative(2, 0);
        drawSlantedLineUpTo(topTop);

        movePenPoint(topTop);
        movePenRelative(0, 1);
        drawSlantedLineDownTo(topRight);

        movePenPoint(topLeft);
        movePenRelative(2, 0);
        drawSlantedLineDownTo(topBottom);

        movePenPoint(topBottom);
        movePenRelative(0, -1);
        drawSlantedLineUpTo(topRight);
    }

    function drawInnerOutlineLeft() {
        penColor = palette.DARK_FACE;

        movePenPoint(topLeft);
        movePenRelative(2, 2);
        drawSlantedLineDownTo(topBottom);

        movePenPoint(topLeft);
        movePenRelative(1, 1);
        drawVerticalLineTo(bottomLeft);

        movePenPoint(bottomLeft);
        movePenRelative(2, 0);
        drawSlantedLineDownTo(bottomBottom);

        movePenPoint(topBottom);
        movePenRelative(-1, 0);
        drawVerticalLineTo(bottomBottom);
    }

    function drawInnerOutlineRight() {
        penColor = palette.DARKEST_FACE;

        movePenPoint(topBottom);
        movePenRelative(2, 0);
        drawSlantedLineUpTo(topRight);

        movePenPoint(topBottom);
        movePenRelative(1, 0);
        drawVerticalLineTo(bottomBottom);

        movePenPoint(bottomBottom);
        movePenRelative(2, -2);
        drawSlantedLineUpTo(bottomRight);

        movePenPoint(topRight);
        movePenRelative(-1, 0);
        drawVerticalLineTo(bottomRight);
    }


    drawInnerOutlineTop();
    drawInnerOutlineLeft();
    drawInnerOutlineRight();

    drawHighlightedOutline();
    drawCornerHighlight();
    drawOutline();

    fillLeft();
    fillTop();
    fillRight();

    return {
        data: data,
        bounds: bounds
    };
};

var ColorHSL = (function() {

    function ColorHSL(h, s, l, a) {
        this.h = h;
        this.s = s;
        this.l = l;
        this.a = a;
    }

    ColorHSL.prototype.darken = function(amount) {
        return new ColorHSL(this.h, this.s, this.l * (1 - amount / 100), 1);
    };

    ColorHSL.prototype.lighten = function(amount) {
        return new ColorHSL(this.h, this.s, this.l * (1 + amount / 100), 1);
    };

    ColorHSL.prototype.saturate = function(amount) {
        return new ColorHSL(this.h, this.s * (1 + amount / 100), this.l, 1);
    };

    ColorHSL.prototype.desaturate = function(amount) {
        return new ColorHSL(this.h, this.s * (1 - amount / 100), this.l, 1);
    };

    ColorHSL.prototype.getRGB = function() {
        var r;
        var g;
        var b;

        function hue2rgb(p, q, t) {
            if (t < 0) {
                t += 1;
            }
            if (t > 1) {
                t -= 1;
            }
            if (t < 1 / 6) {
                return p + (q - p) * 6 * t;
            }
            if (t < 1 / 2) {
                return q;
            }
            if (t < 2 / 3) {
                return p + (q - p) * (2 / 3 - t) * 6;
            }
            return p;
        }

        if (this.s === 0) {
            r = g = b = this.l;
        } else {
            var q = this.l < 0.5 ? this.l * (1 + this.s) : this.l + this.s - this.l * this.s;
            var p = 2 * this.l - q;
            r = hue2rgb(p, q, this.h + 1 / 3);
            g = hue2rgb(p, q, this.h);
            b = hue2rgb(p, q, this.h - 1 / 3);
        }

        return new ColorRGB(r, g, b, 1);
    };

    return ColorHSL;

})();

var ColorRGB = (function() {

    function ColorRGB(r, g, b, a) {
        this.r = Math.max(0, Math.min(r, 1));
        this.g = Math.max(0, Math.min(g, 1));
        this.b = Math.max(0, Math.min(b, 1));
        this.a = Math.max(0, Math.min(a, 1));
    }

    ColorRGB.prototype.getHSL = function() {
        var max = Math.max(this.r, this.g, this.b);
        var min = Math.min(this.r, this.g, this.b);
        var h;
        var s;
        var l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case this.r:
                h = (this.g - this.b) / d + (this.g < this.b ? 6 : 0);
                break;
                case this.g:
                h = (this.b - this.r) / d + 2;
                break;
                case this.b:
                h = (this.r - this.g) / d + 4;
                break;
            }
            h /= 6;
        }

        return new ColorHSL(h, s, l, 1);
    };

    ColorRGB.prototype.makeWarmer = function(amount) {
        return new ColorRGB(this.r * (1 + amount / 100), this.g, this.b * (1 - amount / 100), this.a);
    };

    ColorRGB.prototype.makeColder = function(amount) {
        return new ColorRGB(this.r * (1 - amount / 100), this.g, this.b * (1 + amount / 100), this.a);
    };

    ColorRGB.prototype.toString = function() {
        return this.r + "-" + this.g + "-" + this.b + "-" + this.a;
    };

    return ColorRGB;

})();