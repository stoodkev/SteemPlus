var logger = function(){
	var info = function(message)
	{
		console.log(message);
	}

	var debug = function(message)
	{
		if(DEBUG_MODE)
		{
			console.log(message);
		}
	}
}