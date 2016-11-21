(function() {

"use strict";

//// Start of code
////  Table of Contents - Ctrl+F #(number) to browse /////////
// #1 - Declare Variables
// #2 - Timer Section
// #3 - Audio Element Events Section

// The method of recording audio relies if the user has a browser
// with the MediaRecorder Web API. If statement checks whether to move
// forward if they do, otherwise inform user to use modern browswer.
if (navigator.getUserMedia) {

  //// #1 - Declare Variables ////////////////////////////////
  // Grab elements to display infomation and audio tags
  var recordBtn = document.querySelector("label"), // element
    soundClips = document.querySelector(".sounds-list"), // element
    audio = document.querySelector("audio"), // element
    currTimeStatus = document.getElementsByClassName("time"), // collection
    isAudioPlaying = false, // bool - Is it currently playing audio?
    timer; // func - Is set to a setInterval timer. Needed for clearInt()

  // Make button be contorlled by keyboard
  document.body.onkeyup = function(e){
    if(e.keyCode == 32){
      recordBtn.click(); // also fires resetTimer()
    }
  }
  //// Section End ///////////////////////////////////////////

  //// #2 - Timer Section ////////////////////////////////////
  // This is the timer that counts down as the recording progresses.
  // Timer functions are called by the REC button clicks.
  // These merely define the limit of the recordings,
  // as well as restarting the countdown on new recordings.
  //
  // Count up to 30 seconds w/ Reset conditional
  var startTimer = function() {
    var secondsCounter = 30;
    timer = setInterval(function(){
      if (secondsCounter > 0) {
        secondsCounter -= 1;
      } else {
        secondsCounter = 30;
        recordBtn.click(); // also fires resetTimer()
      }
      [...currTimeStatus].forEach(el => el.textContent = secondsCounter);
    }, 1000);
  }

  var resetTimer = function() {
    window.clearInterval(timer);
    [...currTimeStatus].forEach(el => el.textContent = 30);
  }
  //// Section End ///////////////////////////////////////////


  //// #5 - MediaRecorder Section ////////////////////////////
  // Only get data to devices that recieve audio input
  var constraints = { audio: true };
  // Store data from audio stream in here when recording is finished.
  var chunks = [];
  //
  // Trigger if audio stream is avaliable.
  var onSuccess = function(stream) {
    var mediaRecorder = new MediaRecorder(stream);

    //// #3 - Click Event handlers Section /////////////////////
    var controlRecording = function() {
      if (mediaRecorder.state === "recording") { // stop recording - if it is recording
        resetTimer();
        mediaRecorder.stop(); // stop method triggers audio to play
        recordBtn.classList.remove('now-recording');
        recordBtn.onclick = controlPlaying;
      } else { // else start recording
        startTimer();
        mediaRecorder.start();
        recordBtn.textContent = "";
        recordBtn.classList.add('now-recording');
      }
      console.log(mediaRecorder.state);
    };

    var controlPlaying = function() {
      if (isAudioPlaying) {
        audio.pause();
        isAudioPlaying = false;
      } else {
        audio.play();
        isAudioPlaying = true;
      }
    }
    //// Section End ///////////////////////////////////////////

    //// #4 - Audio Element Events Section /////////////////////
    // Event handler when audio tag is playing
    audio.addEventListener("playing", function() {
      recordBtn.classList.add('now-playing');
      recordBtn.style.background = "green";
      isAudioPlaying = true;
    }, false);
    // Event handler when audio tag is paused

    audio.addEventListener("play", function() {
      recordBtn.classList.remove('now-paused');
    }, false);

    audio.addEventListener("pause", function() {
      recordBtn.classList.remove('now-playing');
      recordBtn.classList.add('now-paused');
      isAudioPlaying = false;
    }, false);
    // Event handler when audio ends
    audio.addEventListener("ended", function() {
      recordBtn.classList.remove('now-playing');
      recordBtn.classList.remove('now-paused');
      recordBtn.style.background = "#ca0000";
      recordBtn.textContent = "REC";
      recordBtn.onclick = controlRecording;
      isAudioPlaying = false;
    }, false);
    //// Section End ///////////////////////////////////////////

    // Button click event handler
    recordBtn.onclick = controlRecording;

    // Recording on stop event handler
    mediaRecorder.onstop = function() {
      var blob = new Blob(chunks, { "type" : "audio/mp3; codecs=opus" });
      chunks = [];
      audio.src = window.URL.createObjectURL(blob); // Set data from recording to audio tag.
      audio.play(); // Audio tag plays, triggering the events to show user it is playing.
      console.log("recorder stopped");
    };

    // Store data whenever it is avaliable to begin processing it.
    mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
    };
  };

  // Log error if something breaks.
  var onError = function(err) {
    console.log("Uh oh! The following error occured: " + err);
  };

  // Activate media stream.
  navigator.getUserMedia(constraints, onSuccess, onError);
  //// Section End ///////////////////////////////////////////

} else {
  alert(`Your broswer doesn't support audio recording.
         Try switching to a more modern browser!`);
}

// End of code
})();
