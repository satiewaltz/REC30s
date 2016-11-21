(function() {

"use strict";

//// Start of code
////  Table of Contents - Ctrl+F #(number) to browse /////////
// #1 - Declare Variables
// #2 - Timer Section
// #3 - MediaRecorder Section
// #4 - Click Event handlers Section
// #5 - Audio Element Playback Events Section
//
// The method of recording audio relies if the user has a browser
// with the MediaRecorder Web API. If statement checks whether to move
// forward if they do, otherwise inform user to use modern browswer.
if (navigator.getUserMedia) {

  //// #1 - Declare Variables ////////////////////////////////
  // Grab elements to display infomation and audio tags.
  var recordBtn = document.querySelector("label"), // element
    audio = document.querySelector("audio"), // element
    recLogo = document.querySelector(".rec-logo"), // element
    currTimeStatus = document.getElementsByClassName("time"), // collection
    isAudioPlaying = false, // bool - Used to check if audio is playing.
    timer; // func - This is set to the setInterval timer.

  // Make button be controlled by keyboard.
  document.body.onkeyup = function(e){
    if(e.keyCode == 32){
      recordBtn.click(); // this also fires resetTimer()
    }
  };
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
        recordBtn.click(); // Fires resetTimer() as well.
      }
      // Change text content on page to reflect time passing.
      [...currTimeStatus].forEach(el => el.textContent = secondsCounter);
      document.title = recLogo.textContent + secondsCounter + "s";
    }, 1000);
  };

  var resetTimer = function() {
    window.clearInterval(timer);
    [...currTimeStatus].forEach(el => el.textContent = 30);
  };
  //// Section End ///////////////////////////////////////////


  //// #3 - MediaRecorder Section ////////////////////////////
  // Only get data to devices that recieve audio input.
  // Store data from audio stream in here when recording is finished.
  var constraints = { audio: true };
  var chunks = [];
  //
  // Trigger if audio stream is avaliable.
  var onSuccess = function(stream) {
    var mediaRecorder = new MediaRecorder(stream);

    //// #4 - Click Event handlers Section /////////////////////
    // Enables controls for recording
    var controlRecording = function() {
      if (mediaRecorder.state === "recording") {
        // This stops recordings if it is occuring.
        resetTimer();
        mediaRecorder.stop(); // Stop method triggers audio to play.
        recordBtn.classList.remove('now-recording');
        recordBtn.onclick = controlPlaying;
        recLogo.style.color = "green";
        recLogo.textContent = "PLAY";
      } else {
       // Otherwise, start recording.
        startTimer();
        mediaRecorder.start();
        recordBtn.textContent = "";
        recordBtn.classList.add('now-recording');
        recLogo.style.textShadow = "0px 0px 5px";
      }
    };
    // Enables controls for playback. Gets applied to
    // click event when recording is finished.
    var controlPlaying = function() {
      if (isAudioPlaying) {
        audio.pause();
        isAudioPlaying = false;
      } else {
        audio.play();
        isAudioPlaying = true;
      }
    };
    //// Section End ///////////////////////////////////////////


    //// #5 - Audio Element Events Section /////////////////////
    // These events handle styling when recording is finished,
    // and audio is played back automatically.
    //
    // Event handler when audio tag is playing.
    audio.addEventListener("playing", function() {
      recordBtn.classList.add('now-playing');
      recordBtn.style.background = "green";
      isAudioPlaying = true;
    }, false);
    // Event handler when audio tag is started from a pause
    audio.addEventListener("play", function() {
      recordBtn.classList.remove('now-paused');
      recLogo.style.textShadow = "0px 0px 5px";
    }, false);
    // Event handler when is paused
    audio.addEventListener("pause", function() {
      recordBtn.classList.remove('now-playing');
      recordBtn.classList.add('now-paused');
      recLogo.style.textShadow = "0px 0px";
      isAudioPlaying = false;
    }, false);
    // Event handler when audio ends. Everything should be reseted by here.
    audio.addEventListener("ended", function() {
      recordBtn.classList.remove('now-playing');
      recordBtn.classList.remove('now-paused');
      recordBtn.style.background = "#ca0000";
      recordBtn.textContent = "REC";
      recLogo.textContent = "REC";
      recLogo.style.color = "#ca0000";
      recLogo.style.textShadow = "0px 0px";
      recordBtn.onclick = controlRecording;
      isAudioPlaying = false;
    }, false);
    //// Section End ///////////////////////////////////////////


    // Defaults button to control recording first.
    recordBtn.onclick = controlRecording;

    // Recording on stop event handler
    mediaRecorder.onstop = function() {
      var blob = new Blob(chunks, { "type" : "audio/mp3; codecs=opus" });
      chunks = [];
      audio.src = window.URL.createObjectURL(blob); // Set data from recording to audio tag.
      document.title = "REC30s";
      audio.play(); // Audio tag plays, triggering audio events to show user sound is playing.
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
