var timeOut, lastImageData;
var video = $('#webcam')[0];
var canvasSource = $("#canvas-source")[0];
var canvasBlended = $("#canvas-blended")[0];
var contextSource = canvasSource.getContext('2d');
var contextBlended = canvasBlended.getContext('2d');
var hotspots = [];
var scaleRatio = 0;
var frmCount = 0;

    // request webcam access
    /*navigator.webkitGetUserMedia({ video: true },
        function(stream) {
            video.src = window.webkitURL.createObjectURL(stream);
            webcamReady();
        },
        function(e) { alert('Webcam error!', e); }
    );*/

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
	console.log('browser does not support video capture');

    } else { // Request the camera.
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            video.play();
            video.onplay = function() {
                webcamReady();
            };
        });
    }

    // on webcam ready
    function webcamReady() {
        contextSource.translate(canvasSource.width, 0);
        contextSource.scale(-1, 1);
        scaleRatio = canvasSource.width / $(video).width();
        gethotspots(); // initialize the indicators ('<' '>')
        tick();
    }

    /**
     * collect all the hotspots
     */
    function gethotspots() {
        $(".hotspot").each(function() {
            var el = $(this);
            var pos = el.position();
            console.log('X:' + pos.left);

            hotspots.push({
                ready: true,
                el: el,
                area: {
                    x: pos.left * scaleRatio,
                    y: pos.top * scaleRatio,
                    width: el.width() * scaleRatio,
                    height: el.height() * scaleRatio
                }
            });
        });
    }


    /**
     * ticker for movement detection
     */
    function tick() {
		  frmCount ++;
      contextSource.drawImage(video, 0, 0, 320, 240);
      blend();
      checkHotspots();
      window.webkitRequestAnimationFrame(tick);
    }


    /**
     * fast equivalent to Math.abs();
     * @param value
     * @return {*}
     */
    function fastAbs(value) {
        return (value ^ (value >> 31)) - (value >> 31);
    }

    /**
     * make black or white
     * @param   number  value
     * @return  number
     */
    function threshold(value) {
        return (value > 25) ? 0xFF : 0;
    }


    /**
     * blend two images into a new imageData
     * @param   imageData   target
     * @param   imageData   data1
     * @param   imageData   data2
     */
    function differenceAccuracy(target, data1, data2) {
        if (data1.length != data2.length)
            return null;
        var i = 0;
        var length = (data1.length * 0.25);
        while (i < length) {
            var average1 = (data1[4*i] + data1[4*i+1] + data1[4*i+2]) / 3;
            var average2 = (data2[4*i] + data2[4*i+1] + data2[4*i+2]) / 3;
            var diff = threshold(fastAbs(average1 - average2));
            target[4*i] = diff;
            target[4*i+1] = diff;
            target[4*i+2] = diff;
            target[4*i+3] = 0xFF;
            ++i;
        }
    }


    /**
     * blend the webcam data together
     */
    function blend() {
        var width = canvasSource.width;
        var height = canvasSource.height;

        // get webcam image data
        var sourceData = contextSource.getImageData(0, 0, width, height);
        // create an image if the previous image doesn’t exist
        if (!lastImageData)
            lastImageData = contextSource.getImageData(0, 0, width, height);
        // create a ImageData instance to receive the blended result
        var blendedData = contextSource.createImageData(width, height);
        // blend the 2 images
        differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data);

		    //erode
		    erode(blendedData.data,width,height);
        // draw the result in a canvas
        contextBlended.putImageData(blendedData, 0, 0);
        // store the current webcam image
        lastImageData = sourceData;
    }

	function erode(image, width,height) {
		for(var i=0;i<image.length;i++) {
			if(i>width+2 && i<(width*(height-1))-2) {
				if(image[4*i]==0xFF &&
				!(image[4*(i-1)]==0xFF ||
					image[4*(i+1)]==0xFF ||
						image[4*(i-width)]==0xFF ||
							image[4*(i+width)]==0xFF)) {
					image[4*i] = 0;
					image[4*i+1] = 0;
					image[4*i+2] = 0;
				}
			}
    }
	}

    /**
     * check if the areas are hit
     */
    function checkHotspots() {
        // loop over the note areas
        for (var r=0; r<hotspots.length; ++r) {
            var hotspot = hotspots[r];

            // get the pixels in a note area from the blended image
            var blendedData = contextBlended.getImageData(
                    hotspot.area.x,
                    hotspot.area.y,
                    hotspot.area.width,
                    hotspot.area.height);
            var i = 0;
            var average = 0;

            // loop over the pixels
            while (i < (blendedData.data.length / 4)) {
                // make an average between the color channel
                average += (blendedData.data[i*4] + blendedData.data[i*4+1] + blendedData.data[i*4+2]) / 3;
                ++i;
            }

            // calculate an average between of the color values of the note area
            average = Math.round(average / (blendedData.data.length / 4));

            // over a small limit, consider that a movement is detected
            if (average > 20 && frmCount%5 == 0) {
                hit(r, average);
            }
        }
    }

    /**
     * hit!
     * @param   hotspot     index
     * @param   number      hit
     */
    function hit(index, average) {
      var hotspot = hotspots[index];
		  (index === 0) ? window.f.prev("turn") : window.f.next("turn");

      if(hotspot.ready) {
        hotspot.ready = false;
        hotspot.el.addClass("hit");

        setTimeout(function() {
          hotspot.ready = true;
          hotspot.el.removeClass("hit");
          (index === 0) ? hotspot.el.html("<") : hotspot.el.html(">");
        }, 200);
      }
    }
