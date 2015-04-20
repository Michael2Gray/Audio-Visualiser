var Audio = 
{
	FREQ_MUL: 5000,
	QUAL_MUL: 30,
	playing: false,
};

//var to trak what song is being played
var trackNumber = 0;

//used to track the position of the song between toggles i.e Play/Pause
var startOffset = 0;
var startTime = 0;

//********************
//	For Visualiser
//********************

//canvas widths and heights
var cWidth = 800;
var cHeight = 500;

//variables for the the frequency 
var smoothing = 0.9;
var fftSize = 1024;

var freqs;

//Volume Control Node
Audio.gainNode = null;

Audio.play = function()
{
	startTime = context.currentTime;

	//if there is no gain node create one
	if (!context.createGain)
		context.createGain = context.createGainNode;

	//create the source
	var source = context.createBufferSource();

	//creates the gain node
	this.gainNode = context.createGain();

	//tells the source which sound to play
	source.buffer = bufferLoader.bufferList[trackNumber];

	//creates a filter modification node
	var filter = context.createBiquadFilter();
	//lowpass filter
	filter.type = 0;
	filter.frequency.value = this.FREQ_MUL;

	//create the analyser to analayse the song
	var analyser = context.createAnalyser();
	//set the minimum and maximum decibels
	analyser.minDecibels = -140;
	analyser.maxDecibels = 0;

	console.log(freqs);

	//connect the source to the gainNode, filter and analyser
	source.connect(this.gainNode);
	source.connect(filter);
	source.connect(analyser);

	//connect the gainNode, filter and analyser to the destination(speakers)
	this.gainNode.connect(context.destination);
	filter.connect(context.destination);
	analyser.connect(context.destination);

	//loop the song
	source.loop = true;

	//play the song depending on the tracknumber
	if (!source.start)
		source.start = source.noteOn;
	
	//starts the source, taking into consideration the time of the pause
	source.start(0, startOffset % source.buffer.duration);

	//store the filter, source, gainNode and analyer  
	this.source = source;
	this.filter = filter;
	this.analyser = analyser;

	//Implement the draw function each frame
	requestAnimFrame(this.draw.bind(this));

	console.log(trackNumber);
};

Audio.stop = function()
{
	//Stops the music

	if (!this.source.stop)
		this.source.stop = source.noteOff;
	this.source.stop(0);
	this.source.noteOff;
};

Audio.toggle = function() 
{
	//if the music playing
	if(this.playing) 
	{
		//call the function
		this.stop();
		//measures the amount of time passed since the pause
		startOffset += context.currentTime - startTime;
	}

	else 
	{
		//calls the play function
		this.play();
	}

	this.playing = !this.playing;
};

Audio.next = function()
{
	//turns off the current song
	this.source.stop(0);
	this.source.noteOff;
	
	//increases the tracknumber
	trackNumber++;

	//if the tracknumber is greater then 2
	if (trackNumber>2) 
	{
		//set the tracknumber to 0
		trackNumber = 0;
		//set the startTime to 0
		startTime = 0;
	}

	//set the startTime to 0
	startTime = 0;

	//call the play function
	this.play();
};

Audio.prev = function()
{
	//turns off the current song
	this.source.stop(0);
	this.source.noteOff;
	
	//decreases the tracknumber
	trackNumber--;
	
	//if the tracknumber is less then 0
	if (trackNumber<0) 
	{
		//set the tracknumber to 2
		trackNumber = 2;
		//set the startTime to 0
		startTime = 0;
	}

	//set the startTime to 0
	startTime = 0;

	//call the play function
	this.play();
};

Audio.changeVolume = function(element)
{
	console.log("Changing Volume");

	//sets the volume to the value of the range
	var volume = element.value;
	console.log(volume);

	var fraction = parseInt(volume)/parseInt(element.max);
	//Decreases the value of the gainNode
	this.gainNode.gain.value = fraction*fraction;
};

Audio.changeFrequency = function(element)
{
	//min and max Hertz values
	var minValue = 40;
	var maxValue = context.sampleRate / 2;

	var numberofOctaves = Math.log(maxValue/minValue)/Math.LN2;

	var multiplier = Math.pow(2, numberofOctaves * (element.value - 1.0));

	//sets the filters frequency value
	this.filter.frequency.value = maxValue*multiplier;
	console.log("Changing Frequency");
};

Audio.changeQuality = function(element)
{
	//sets the filters quality value
	this.filter.Q.value = element.value*this.QUAL_MUL;
	console.log("Changing Quality");
};

Audio.toggleFilter = function(element)
{
	//this.source.disconnect(0);
	//if the checkbox is checked
	if (element.checked) 
	{
		//everything is connected
		this.source.connect(this.filter);
		this.gainNode.connect(context.destination);
		this.filter.connect(context.destination);
		this.analyser.connect(context.destination);
		console.log("Filter On");
	}

	else
	{
		//the filter is disconnected
		this.source.connect(context.destination);
		this.gainNode.connect(context.destination);
		this.analyser.connect(context.destination);
		this.filter.disconnect(0);
		console.log("Filter Off");
	}
}

//----------------
//   Visualiser
//----------------

//Function that draws the visualisation
Audio.draw = function()
{
	console.log('Draw Function');

	//sets an array of frequency values retrieveed from the analyser
	freqs = new Uint8Array(this.analyser.frequencyBinCount);

	//sets the smoothing and fftSize variables
	this.analyser.smoothingTimeConstant = smoothing;
	this.analyser.fftSize = fftSize;

	//retrieves the frequencys
	this.analyser.getByteFrequencyData(freqs);

	var width = Math.floor(1/freqs.length, 10);

	var canvas = document.querySelector('canvas');
	var ctx = canvas.getContext('2d');

	canvas.width = cWidth;
	canvas.height = cHeight;

	//for every frequency value
	for(var i=0; i<this.analyser.frequencyBinCount; i++)
	{
		//fill in the canvas depending on the values set
		var value = freqs[i];
		var percent = value / 256;
		var height = cHeight*percent;
		var offset = cHeight - height;
		var barWidth = 5;
		ctx.fillStyle = '#ff5e3c';
		ctx.fillRect(i*barWidth,offset,barWidth,height);
	}

	//if audio is playing draw the visualiser
	if (this.playing) {
    requestAnimFrame(this.draw.bind(this));
  }
}