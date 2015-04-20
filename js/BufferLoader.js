//Requesting an animation frame
window.requestAnimFrame = (function(){
  console.log('animation frame request');
  return  window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame    || 
    window.oRequestAnimationFrame      || 
    window.msRequestAnimationFrame     || 
  
    function( callback )
    {
      window.setTimeout(callback, 1000 / 60);
  };
})();

//creates a functoin called BufferLoader that takes in 3 parameters.
function BufferLoader(context, urlList, callback) 
{
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) 
{

  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() 
  {
    // Asynchronously decode the audio file data in request.response
	loader.context.decodeAudioData( request.response, function(buffer) 
    {
        if (!buffer) 
        {
          alert('error decoding file data: ' + url);
          return;
        }

        loader.bufferList[index] = buffer;

        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
    },
	
	function(error) 
	{
		console.error('decodeAudioData error', error);
	});
  }

  request.onerror = function() 
  {
    alert('BufferLoader: XHR error');
  }

  request.send();
}

//function called in the index.html
BufferLoader.prototype.load = function() 
{
  console.log("Loading the Buffer");
  //load the urlList into the buffer
  for (var i = 0; i < this.urlList.length; ++i)
  this.loadBuffer(this.urlList[i], i);
}
