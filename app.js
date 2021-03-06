var SensorTag = require('sensortag');		// sensortag library
var applescript = require('applescript');	// applescript library

console.log('Sensortag OSX Remote');

function runFile(filename) {
	applescript.execFile( filename, function(err, data) {
	    if (err, data) {
	        //handle error event
	        console.error(err);
	        console.log(data);
	    } else {
	        //handle data from applescript
	        //this is both succesful data and error data.
	        console.log('AppleScript Success');
	    }
	});
}

var run_cmd = function (cmd, args, callback) {
    
    // global.logging('cmd = ' + cmd);
    
    var spawn = require('child_process').spawn,
        child = spawn(cmd, args),
        resp = "";

    child.stdout.on('data', function (buffer) { 
        resp += buffer.toString() 
    });

    child.stdout.on('end', function() { 
        if(callback)
            callback(resp) 
    });
}

// listen for tags:
SensorTag.discover(function(tag) {

	console.log('discovered ' + tag.uuid + ' ' + tag.type);

	// when you disconnect from a tag, exit the program:
	tag.on('disconnect', function() {
		console.log('disconnected!');
		process.exit(0);
	});

	function connectAndSetUpMe() {			// attempt to connect to the tag
    	console.log('connectAndSetUp');
    	
    	tag.connectAndSetUp(notifyMe);		// when you connect, call notifyMe
    }

	function notifyMe() {
		console.log('notifyMe');
		run_cmd('say', ['-v', 'Samantha', 'Connected to tag ' + tag.type]);
 		tag.notifySimpleKey(listenForButton);		// start the button listener
   	}

	// when you get a button change, print it out:
	function listenForButton() {
		tag.on('simpleKeyChange', function(left, right) {
			// if both buttons are pressed, disconnect:
			if (left && right) {
				console.log('both');
				tag.disconnect();
			} else				// if left, send the left key
			if (left) {
				console.log('left: ' + left);
				runFile('applescript/left.scpt');
			}  else
			if (right) {		// if right, send the right key
				console.log('right: ' + right);
				runFile('applescript/right.scpt');
			}
	   });
	}

	// Now that you've defined all the functions, start the process:
	connectAndSetUpMe();
});