
var testvar = "Hello from external js";
var enrollmentComplete = false;
var nickName = '';
//-- Speaker Verification methods
// Get the supported verification phrases
function getVerificationPhrases() {
	var phrases = `${baseApi}/verificationPhrases?locale=en-US`;

	var request = new XMLHttpRequest();
	request.open("GET", phrases, true);

	request.setRequestHeader('Ocp-Apim-Subscription-Key', '3af79ecc8fd944e8a24afd78b4ea9d88');

	request.onload = function(){ console.log(request.responseText); };
	request.send();
}

// 1. Start the browser listening, listen for 4 seconds, pass the audio stream to "createVerificationProfile"
function enrollNewVerificationProfile(){
	navigator.getUserMedia({audio: true}, function(stream){
		console.log('I\'m listening... say one of the predefined phrases...');
		onMediaSuccess(stream, createVerificationProfile, 4,false);
	}, onMediaError);
}

// createVerificationProfile calls the profile endpoint to get a profile Id, then calls enrollProfileAudioForVerification
function createVerificationProfile(blob){
	
	// just check if we've already fully enrolled this profile
	if (verificationProfile && verificationProfile.profileId) 
	{
		if (verificationProfile.remainingEnrollments == 0)
		{
			console.log("Verification enrollment already completed");
			return;
		} 
		else 
		{
			console.log("Verification enrollments remaining: " + verificationProfile.remainingEnrollments);
			enrollProfileAudioForVerification(blob, verificationProfile.profileId);
			return;
		}
	}

	var create = `${baseApi}/verificationProfiles`;

	var request = new XMLHttpRequest();
	request.open("POST", create, true);
	request.setRequestHeader('Content-Type','application/json');
	request.setRequestHeader('Ocp-Apim-Subscription-Key', '3af79ecc8fd944e8a24afd78b4ea9d88');

	request.onload = function () {
		console.log(request.responseText);
		var json = JSON.parse(request.responseText);
		var profileId = json.verificationProfileId;
		verificationProfile.profileId = profileId;

		// Now we can enrol this profile with the profileId
		enrollProfileAudioForVerification(blob, profileId);
	};

	request.send(JSON.stringify({'locale' :'en-us'}));
}

// enrollProfileAudioForVerification enrolls the recorded audio with the new profile Id
function enrollProfileAudioForVerification(blob, profileId){
	addAudioPlayer(blob);

	if (profileId == undefined)
	{
		console.log("Failed to create a profile for verification; try again");
		return;
	}
	
	var enroll = `${baseApi}/verificationProfiles/${profileId}/enroll`;
  
	var request = new XMLHttpRequest();
	request.open("POST", enroll, true);
	request.setRequestHeader('Ocp-Apim-Subscription-Key', '3af79ecc8fd944e8a24afd78b4ea9d88');
	request.onload = function () {
		console.log('enrolling');
		console.log(request.responseText);

		var json = JSON.parse(request.responseText);

		// need 3 successful enrolled chunks of audio per profile id
		verificationProfile.remainingEnrollments = json.remainingEnrollments;
		if (verificationProfile.remainingEnrollments == 0) 
		{
			console.log("Verification should be enabled!")
		}
	};
  
	request.send(blob);
}

// 2. Start the browser listening, listen for 4 seconds, pass the audio stream to "verifyProfile"
function startListeningForVerification(){
	if (verificationProfile.profileId || localStorage.getItem("profileId")){
		verificationProfile.profileId = localStorage.getItem("profileId");
		console.log('I\'m listening... say your predefined phrase...');
		navigator.getUserMedia({audio: true}, function(stream){onMediaSuccess(stream, verifyProfile, 4,true)}, onMediaError);
	} else {
		console.log('No verification profile enrolled yet! Click the other button...');
	}
}

// 3. Take the audio and send it to the verification endpoint for the current profile Id
function verifyProfile(blob){
	addAudioPlayer(blob);

	var verify = `https://sandesh.cognitiveservices.azure.com/spid/v1.0/verify?verificationProfileId=${verificationProfile.profileId}`;
  
	var request = new XMLHttpRequest();
	request.open("POST", verify, true);
	
	request.setRequestHeader('Content-Type','multipart/form-data');
	request.setRequestHeader('Ocp-Apim-Subscription-Key', '3af79ecc8fd944e8a24afd78b4ea9d88');
  
	request.onload = function () {
		console.log('verifying profile');

		// Was it a match?
		console.log(request.responseText);		
	};
  
	request.send(blob);
}


//-- Speaker Identification methods
// 1. Start the browser listening, listen for 15 seconds, pass the audio stream to "createProfile"
function enrollNewProfile(name){
	nickName = name;
	navigator.getUserMedia({audio: true}, function(stream){
		console.log('I\'m listening... just start talking for a few seconds...');
		onMediaSuccess(stream, createProfile, 10,false);
	}, onMediaError);
	
}

// createProfile calls the profile endpoint to get a profile Id, then calls enrollProfileAudio
function createProfile(blob){
	addAudioPlayer(blob);

	var create = `https://sandesh.cognitiveservices.azure.com/spid/v1.0/identificationProfiles`;

	var request = new XMLHttpRequest();
	request.open("POST", create, true);

	request.setRequestHeader('Content-Type','application/json');
	request.setRequestHeader('Ocp-Apim-Subscription-Key', '3af79ecc8fd944e8a24afd78b4ea9d88');

	request.onload = function () {
		console.log('creating profile');
		console.log(request.responseText);

		var json = JSON.parse(request.responseText);
		var profileId = json.identificationProfileId;

		// Now we can enrol this profile using the profileId
		enrollProfileAudio(blob, profileId);
	};

	request.send(JSON.stringify({ 'locale' :'en-us'}));
}

// enrollProfileAudio enrolls the recorded audio with the new profile Id, polling the status
function enrollProfileAudio(blob, profileId){
  var enroll = `https://sandesh.cognitiveservices.azure.com/spid/v1.0/identificationProfiles/${profileId}/enroll?shortAudio=true`;

  var request = new XMLHttpRequest();
  request.open("POST", enroll, true);
  request.setRequestHeader('Ocp-Apim-Subscription-Key', '3af79ecc8fd944e8a24afd78b4ea9d88');
  request.onload = function () {
  	console.log('enrolling');
	console.log(request.responseText);
	
	// The response contains a location to poll for status
    var location = request.getResponseHeader('Operation-Location');

	if (location!=null) {
		// ping that location to get the enrollment status
    	pollForEnrollment(location, profileId);
	} else {
		console.log('Ugh. I can\'t poll, it\'s all gone wrong.');
	}
  };

  request.send(blob);
}

// Ping the status endpoint to see if the enrollment for identification has completed
function pollForEnrollment(location, profileId){
	var enrolledInterval;

	// hit the endpoint every few seconds 
	enrolledInterval = setInterval(function()
	{
		var request = new XMLHttpRequest();
		request.open("GET", location, true);
		request.setRequestHeader('Ocp-Apim-Subscription-Key', '3af79ecc8fd944e8a24afd78b4ea9d88');
		request.onload = function()
		{
			console.log('getting status');
			console.log(request.responseText);

			var json = JSON.parse(request.responseText);
			if (json.status == 'succeeded' && json.processingResult.enrollmentStatus == 'Enrolled')
			{
				// Woohoo! The audio was enrolled successfully! 

				// stop polling
				clearInterval(enrolledInterval);
				console.log('enrollment complete!');

				// ask for a name to associated with the ID to make the identification nicer
				//var name = window.prompt('Who was that talking?');
				profileIds = [];
				profileIds.push(new Profile(nickName, profileId));
				console.log(profileId + ' is now mapped to ' + nickName);
				localStorage.setItem("enrollmentDone","true");
				localStorage.setItem("profileId",profileId);
				localStorage.setItem("speaker",nickName);

				console.log("profileIds: ",profileIds);
				//log.value="";
			}
			else if(json.status == 'succeeded' && json.processingResult.remainingEnrollmentSpeechTime > 0) {
				// stop polling, the audio wasn't viable
				clearInterval(enrolledInterval);
				console.log('That audio wasn\'t long enough to use');
			}
			else 
			{
				// keep polling
				console.log('Not done yet..');
			}
		};

		request.send();
	}, 1000);
}

// 2. Start the browser listening, listen for 10 seconds, pass the audio stream to "identifyProfile"
function startListeningForIdentification(){
	profileIds = []; //get profileId enrolled from localStorage.
	var nickName = localStorage.getItem('speaker');
	var profileId = localStorage.getItem('profileId');
	profileIds.push(new Profile(nickName, profileId));
	if (profileIds.length > 0 ){
		//log.value='';
		console.log('I\'m listening... just start talking for a few seconds...');
		//log.value='Maybe read this: \n' + thingsToRead[Math.floor(Math.random() * thingsToRead.length)];
		localStorage.removeItem("listening");
		localStorage.setItem("listening",true);
		localStorage.removeItem("recognitionDone");
		navigator.getUserMedia({audio: true}, function(stream){onMediaSuccess(stream, identifyProfile, 5,true)}, onMediaError);
	} else {
		console.log('No profiles enrolled yet! Click the other button...');
	}
	
}

// 3. Take the audio and send it to the identification endpoint
function identifyProfile(blob){
	addAudioPlayer(blob);

	// comma delimited list of profile IDs we're interested in comparing against
	//var Ids = profileIds.map(x => x.profileId).join();
	localStorage.removeItem("recognitionSarted");
	localStorage.setItem("listening",false);
	localStorage.setItem("recognitionSarted",true);
	console.log("Sending to identification end point.");

	var Ids;
	if (localStorage.getItem("profileId")){
		verificationProfile.profileId = localStorage.getItem("profileId");
		Ids = localStorage.getItem("profileId");
	}
	console.log('Ids to identify: ',Ids)
	var identify = `https://sandesh.cognitiveservices.azure.com/spid/v1.0/identify?identificationProfileIds=${Ids}&shortAudio=true`;
  
	var request = new XMLHttpRequest();
	request.open("POST", identify, true);
	
	//request.setRequestHeader('Content-Type','application/json');
	request.setRequestHeader('Ocp-Apim-Subscription-Key', '3af79ecc8fd944e8a24afd78b4ea9d88');
  
	request.onload = function () {
		console.log('identifying profile');
		console.log(request.responseText);

		// The response contains a location to poll for status
		var location = request.getResponseHeader('Operation-Location');
		console.log("Location to poll for: "+location);
		if (location!=null) {
			// ping that location to get the identification status
			pollForIdentification(location,Ids);
		} else {
			console.log('Ugh. I can\'t poll, it\'s all gone wrong.');
		}
	};
  
	request.send(blob);
}

// Ping the status endpoint to see if the identification has completed
function pollForIdentification(location,targetId){
	var identifiedInterval;
	var responseRecieved = false;
	// hit the endpoint every few seconds 
	identifiedInterval = setInterval(function()
	{
		var request = new XMLHttpRequest();
		request.open("GET", location, true);
		request.setRequestHeader('Ocp-Apim-Subscription-Key', '3af79ecc8fd944e8a24afd78b4ea9d88');

		request.onload = function()
		{     
			console.log('getting status');
			console.log(request.responseText);

			var json = JSON.parse(request.responseText);
			var txtInput;
			if (json.status == 'succeeded' && !responseRecieved)
			{
				responseRecieved = true;
				// Identification process has completed
				clearInterval(identifiedInterval);
				localStorage.setItem("recognitionSarted",false);
				localStorage.setItem("recognitionDone",json.status);
				if(targetId == json.processingResult.identifiedProfileId){
					console.log("Speaker is: ",targetId );
					txtInput = "Identified as "+localStorage.getItem('speaker');
					localStorage.setItem("speakerRecongized",true);
					identifySpeaker();
				}else{
					txtInput = "You are not authorized to do this."
					console.log("Speaker not recognized.");
					localStorage.setItem("speakerRecongized",false);
				}
				
				
				//var txtInput = document.querySelector('#log');
				// var voiceList = document.querySelector('#voiceList');
				// var btnSpeak = document.querySelector('#btnSpeak');
				
				// var voices = [];
				//PopulateVoices();
				// if(speechSynthesis !== undefined){
				// 	speechSynthesis.onvoiceschanged = PopulateVoices;
				// }
				var synth = window.speechSynthesis;
				var toSpeak = new SpeechSynthesisUtterance(txtInput);
				
				synth.speak(toSpeak);
			}
			else 
			{
				// Not done yet			
				console.log('still thinking..');
				console.log(json);
			}
			
		};

		request.send();
	}, 500);
}

//-- If it looks like the profiles are messed up, kick off "BurnItAll" to delete all profile data
// BurnItAll('identification') - clear identification profiles
// BurnItAll('verification') - clear verification profiles
function BurnItAll(mode = 'identification'){
	// brute force delete everything - keep retrying until it's empty
	var listing = `${baseApi}/${mode}Profiles`;

	var request = new XMLHttpRequest();
	request.open("GET", listing, true);

	request.setRequestHeader('Ocp-Apim-Subscription-Key', '3af79ecc8fd944e8a24afd78b4ea9d88');

	request.onload = function () {
		var json = JSON.parse(request.responseText);
		for(var x in json){
			if (json[x][mode + 'ProfileId'] == undefined) {continue;}
			var request2 = new XMLHttpRequest();
			request2.open("DELETE", listing + '/'+ json[x][mode + 'ProfileId'], true);
			request2.setRequestHeader('Ocp-Apim-Subscription-Key', '3af79ecc8fd944e8a24afd78b4ea9d88');
			request2.onload = function(){
				console.log(request2.responseText);
			};
			request2.send();
		}
	};

	request.send();
}

// This method adds the recorded audio to the page so you can listen to it
function addAudioPlayer(blob){	
	var url = URL.createObjectURL(blob);
	//var log = document.getElementById('log');

	var audio = document.querySelector('#replay');
	if (audio != null) {audio.parentNode.removeChild(audio);}

	audio = document.createElement('audio');
	audio.setAttribute('id','replay');
	audio.setAttribute('controls','controls');

	var source = document.createElement('source');
	source.src = url;

	audio.appendChild(source);
	//log.parentNode.insertBefore(audio, log);
}

// Example phrases
var thingsToRead = [
	"Never gonna give you up\nNever gonna let you down\nNever gonna run around and desert you\nNever gonna make you cry\nNever gonna say goodbye\nNever gonna tell a lie and hurt you",
	"There's a voice that keeps on calling me\n	Down the road, that's where I'll always be.\n	Every stop I make, I make a new friend,\n	Can't stay for long, just turn around and I'm gone again\n	\n	Maybe tomorrow, I'll want to settle down,\n	Until tomorrow, I'll just keep moving on.\n	\n	Down this road that never seems to end,\n	Where new adventure lies just around the bend.\n	So if you want to join me for a while,\n	Just grab your hat, come travel light, that's hobo style.",
	"They're the world's most fearsome fighting team \n	They're heroes in a half-shell and they're green\n	When the evil Shredder attacks\n	These Turtle boys don't cut him no slack! \n	Teenage Mutant Ninja Turtles\nTeenage Mutant Ninja Turtles",
	"If you're seein' things runnin' thru your head \n	Who can you call (ghostbusters)\n	An' invisible man sleepin' in your bed \n	Oh who ya gonna call (ghostbusters) \nI ain't afraid a no ghost \n	I ain't afraid a no ghost \n	Who ya gonna call (ghostbusters) \n	If you're all alone pick up the phone \n	An call (ghostbusters)",
];

// vanilla javascript queystring management
var qs = (function(a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
        var p=a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
})(window.location.search.substr(1).split('&'));

// Get the Cognitive Services key from the querystring
var key = qs['key'];
var baseApi = qs['endpoint'];

// Speaker Recognition API profile configuration - constructs to make management easier
var Profile = class { constructor (name, profileId) { this.name = name; this.profileId = profileId;}};
var VerificationProfile = class { constructor (name, profileId) { this.name = name; this.profileId = profileId; this.remainingEnrollments = 3}};
var profileIds = [];
var verificationProfile = new VerificationProfile();

(function () {
	// Cross browser sound recording using the web audio API
	navigator.getUserMedia = ( navigator.getUserMedia ||
							navigator.webkitGetUserMedia ||
							navigator.mozGetUserMedia ||
							navigator.msGetUserMedia);

	// Really easy way to dump the console logs to the page
	
})();
