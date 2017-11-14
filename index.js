var player = $("#player");
var slider = $("#slider");
var sliderbar = $("#sliderbar");
var beforeThumb = $("#before-thumb");
var afterThumb = $("#after-thumb");
var buffer = $("#buffer");
var thumb = $("#thumb");
var controller = $("#controller");
var videoContainer = $("video");
var video = videoContainer[0];
var player = $("#player");
var pauser = $("#pauser");
var fullscreen = $("#fullscreen");
var time = $("#time");
var timer;

$(document).on("webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange", () => {
  var progress = video.currentTime / video.duration;
  var val = progress * (slider.width() - 5);

  updateBar(val);
  if((window.fullScreen) || (window.innerWidth == screen.width && window.innerHeight == screen.height)) {
    fullscreen.find("i").text("fullscreen_exit");
  } else {
    fullscreen.find("i").text("fullscreen");
  }
});

slider.bind("mousedown", (e) => {
  var parentOffset = slider.offset();
  var val = e.pageX - parentOffset.left;
  seek(val);
  e.preventDefault();
  $(document).bind("mousemove", (e) => {
    var parentOffset = slider.offset();
    var val = e.pageX - parentOffset.left;
    seek(val);
  });

  $(document).bind("mouseup", () => {
    $(document).unbind("mousemove");
  });
});

player.on("click", (e) => {
  if($(e.target).closest(controller).length > 0) {
    return;
  }

  if(video.paused) {
    video.play();
    pauser.find("i").text("pause");
  } else {
    video.pause();
    pauser.find("i").text("play_arrow");
  }
});

player.on("mousestop mouseleave", (e) => {
  clearTimeout(timer);
  if(!video.paused) {
    player.css("cursor", "none");
    controller.fadeOut(100);
  }
});

videoContainer.ready( () => {
  player.on("mouseenter mousedown", (e) => {
    var progress = video.currentTime / video.duration;
    var val = progress * (slider.width() - 5);
    updateBar(val);
  });
});

player.on("mousemove", (e) => {
  clearTimeout(timer);
  player.css("cursor", "default");
  controller.fadeIn(100);
  timer = setTimeout(function(){
    player.trigger("mousestop");
  }, 3000);
});

videoContainer.on("timeupdate", () => {
  var progress = video.currentTime / video.duration;
  var val = progress * (slider.width() - 5);
  if(video.duration - video.currentTime < 0.2) {
    player.css("cursor", "default");
    controller.fadeIn(100);
    updateBar(val);
  }
  updateBar(val);
  updateTime(video.currentTime, video.duration);
});

videoContainer.on("loadedmetadata", () => {
  updateTime(0, video.duration);
});

videoContainer.on("ended", () => {
  pauser.find("i").text("replay");
});

videoContainer.on("dblclick", () => {
  console.log("gay");
  fs();
});

pauser.on("click", (e) => {
  if(video.paused) {
    video.play();
    pauser.find("i").text("pause");
  } else {
    video.pause();
    pauser.find("i").text("play_arrow");
  }
});

var updateBar = function(val) {
  if(!controller.is(":visible")) return;

  if(val >= slider.width() - 5) {
    val = slider.width() - 5;
  }

  if(val <= slider.attr("min") / slider.attr("max") * (slider.width() - 5)) {
    val = slider.attr("min") / slider.attr("max") * (slider.width() - 5);
  }

  var bf = video.buffered;
  var range = bf.length == 0 ? 0 : bf.length - 1;

  var loadStart = bf.start(range) / video.duration;
  var loadEnd = bf.end(range) / video.duration;
  var loadPercent = loadEnd - loadStart;

  var value = (val / (slider.width() - 5)) * slider.attr("max");

  var bufferWidth = (loadPercent - (video.currentTime / video.duration)) * (slider.width() - 5);

  slider.attr("val", value);
  thumb.css("left", val);
  buffer.css("left", val + 5);
  buffer.css("width", bufferWidth)
  beforeThumb.css("width", val);
  //afterThumb.css("width", (slider.width() - 5) - (val + buffer.width()));
  //afterThumb.css("left", val + buffer.width())
}

var seek = function(val) {
  video.currentTime = val / (slider.width() - 5) * video.duration;
  if(video.paused) {
    pauser.find("i").text("play_arrow");
  } else {
    pauser.find("i").text("pause");
  }
  updateBar(val);
  updateTime(video.currentTime, video.duration);
}

var fs = function() {
  var pls = document.getElementById("video");
  if((window.fullScreen) || (window.innerWidth == screen.width && window.innerHeight == screen.height)) {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  } else {
    if (pls.requestFullscreen) {
      pls.requestFullscreen();
    } else if (pls.msRequestFullscreen) {
      pls.msRequestFullscreen();
    } else if (pls.mozRequestFullScreen) {
      pls.mozRequestFullScreen();
    } else if (pls.webkitRequestFullscreen) {
      pls.webkitRequestFullscreen();
      pls.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  }
}

fullscreen.on("click", fs);

var updateTime = function(ct, d) {
  time.text(formatTime(ct) + " / " + formatTime(d));
}

var formatTime = function(t) {
  t = Math.round(t);
  var mins = Math.floor(t / 60);
  var seconds = t % 60;

  return mins + ":" + seconds.pad(2);
}

Number.prototype.pad = function(size) {
  var s = String(this);
  while (s.length < (size || 2)) {s = "0" + s;}
  return s;
}
