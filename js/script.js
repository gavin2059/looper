var $ = jQuery;
var currentStatus = -1;
var baseLength = 0;
var layer = -1;
var loops = [];
var layerrefs = [];
var d = new Date();
var play;
var myRecorder = {
    objects: {
        context: null,
        stream: null,
        recorder: null
    },
    init: function () {
        if(myRecorder.objects.context == null || myRecorder.objects.context == undefined) {
            myRecorder.objects.context = new (window.AudioContext || window.webkitAudioContext);
        }
    },
    reset: function () {
        document.querySelector('.recordings').innerHTML = "";
        //myRecorder.objects = {
        //context: null,
        //stream: null,
        //recorder: null
        //};
        layer = -1;
        layerrefs[layer] = null;
        baseLength = 0;
        for(loop in loops) {
            clearInterval(loops[loop]);
        }
        loops = [];
    },
    start: function () {
        var options = {audio: true, video: false};
        navigator.mediaDevices.getUserMedia(options).then(function (stream) {
            myRecorder.objects.stream = stream;
            myRecorder.objects.recorder = new Recorder(
                    myRecorder.objects.context.createMediaStreamSource(stream),
                    {numChannels: 1}
            );
            myRecorder.objects.recorder.record();
        }).catch(function (err) {});
    },
    stop: function (listObject) {
        layer++;
        if (null !== myRecorder.objects.stream) {
            myRecorder.objects.stream.getAudioTracks()[0].stop();
        }
        if (null !== myRecorder.objects.recorder) {
            myRecorder.objects.recorder.stop();
        
        // Validate object
        if (null !== listObject
                && 'object' === typeof listObject
                && listObject.length > 0) {
            // Export the WAV file
                myRecorder.objects.recorder.exportWAV(function (blob) {
                url = (window.URL || window.webkitURL)
                        .createObjectURL(blob);

                var audioObject = $('<audio onloadeddata="setLoop()" controls id="' + layer + '"></audio>')
                .attr('src', url);

                // Prepare the download link
                //var downloadObject = $('<a>&#9660; Save</a>')
                //        .attr('href', url)
                //        .attr('download', 'loop.wav');

                // Wrap everything in a row
                var holderObject;
                if(layer == 0){
                    holderObject = $('<div class="row"></div>')
                        .append(audioObject)
                      //.append(downloadObject);
                }
                else{
                    holderObject = $('<div class="row"></div>')
                        .append(audioObject)
                }
                // Append to the list
                listObject.append(holderObject);
            });
        }
    }
    }
};

function setLoop() {
    layerrefs[layer] = document.getElementById(layer);
    const play = layerrefs[layer].play.bind(layerrefs[layer]);
    var layerLocal=  layer;
    if (layer == 0) {
        baseLength = layerrefs[layer].duration * 1000;
        play();
        loops[layerLocal] = setInterval(()=>{
            console.log("1");
            play();
            layerrefs[layerLocal].currentTime = 0;
        }, baseLength + 300);
     }
     else {
        setTimeout(()=>{
            play();
            loops[layerLocal] = setInterval(()=>{
                console.log("2");
                play();
                layerrefs[layerLocal].currentTime = 0;
            }, baseLength + 300);
        }, 
        baseLength - layerrefs[layerLocal].duration * 1000-200);
     }
}

// Prepare the recordings list
var listObject = $('[data-role="recordings"]');
function changeStatus(e){
if(e != null && e.key == "Escape"){
    myRecorder.reset();
    document.querySelector("#status").textContent = "Start";
    document.querySelector("#instructions").textContent = 
        "Press any key / click anywhere to start recording."
    currentStatus = -1;
    console.log("stopped");
    return;
}
if(currentStatus == -1){
    myRecorder.init();
    myRecorder.start();
    document.querySelector("#status").textContent = "Recording";
    document.querySelector("#instructions").textContent = 
        "Press any key / click anywhere to stop recording. Press ESC to quit."
    currentStatus = 1;
    console.log("started");
    return;
}
if(currentStatus == 0){
    myRecorder.init();
    myRecorder.start();
    document.querySelector("#status").textContent = "Recording";
    document.querySelector("#instructions").textContent = 
        "Press any key / click anywhere to stop recording. Press ESC to quit."
    console.log("resumed");
}
if(currentStatus == 1){
    myRecorder.init();
    myRecorder.stop(listObject);
    document.querySelector("#status").textContent = "Playing";
    document.querySelector("#instructions").textContent = 
        "Press any key / click anywhere to overdub. Press ESC to quit."
    console.log("paused");    
}
currentStatus = (currentStatus + 1) % 2
};

document.addEventListener('touchend', (e)=>{changeStatus(e)});
document.addEventListener('keyup', (e)=>{changeStatus(e)});
//document.querySelector('body').addEventListener('click', (e)=>{changeStatus(e)});