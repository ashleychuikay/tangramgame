//Tangram Game

//Write function to create blocks for trials
makeBlock = function() {

   blockTrials = new Array; 

   shuffle(parentPairs);
   shuffle(childPairs);
	   
   for(i=0; i<parentItems.length; i++) {
   	parentPairs[i].speaker = switchSpeaker(parentPairs[i].speaker);
   	childPairs[i].speaker = switchSpeaker(childPairs[i].speaker);

   	blockTrials.push(new Array(parentPairs[i].target, parentPairs[i].foils.pop(), parentPairs[i].speaker));
   	blockTrials.push(new Array(childPairs[i].target, childPairs[i].foils.pop(), childPairs[i].speaker));
   };

return blockTrials;
};

switchSpeaker = function(speaker) {
	return speaker == "Child" ? "Parent" : "Child";
};


//Read in .csv from server
var xhr = new XMLHttpRequest(),
    method = "GET",
    url = "https://raw.githubusercontent.com/ashleychuikay/tangramgame/master/gamecode/tangramgametrials.csv";
    //NEW TRIAL CSV FOR TANGRAMS

xhr.open(method, url, true);

xhr.onreadystatechange = function () {
  if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {

    trials = $.csv.toArrays(xhr.responseText);
    
    allTrials = new Array;

    
    shuffledTrials = shuffle(trials.slice());
    parentItems = shuffledTrials.slice(0,Math.floor(shuffledTrials.length/2));
    childItems = shuffledTrials.slice(Math.floor(shuffledTrials.length/2),shuffledTrials.length+1);

    console.log(parentItems);
    console.log(childItems);
    // console.log(shuffledTrials)


    parentPairs = new Array;
    childPairs = new Array;


    for(i=0; i<parentItems.length; i++) {
    	parentPairs.push({target: parentItems[i][0], foils: shuffle(parentItems[i].splice(1, 4)), speaker: "Child"});
    	childPairs.push({target: childItems[i][0], foils: shuffle(childItems[i].splice(1, 4)), speaker: "Parent"});
    };

    console.log(parentPairs)
    console.log(childPairs)

    for(j=0; j<=3; j++) {
    	block = makeBlock();
    	allTrials.push(block);
    };

   console.log(allTrials)
   startExperiment(allTrials)

  };
};
xhr.send();


// disables all scrolling functionality to fix a slide in place on the ipad
document.ontouchmove = function(event){
    event.preventDefault();
};


// ---------------- PARAMETERS ------------------

var numTrials = 40;

//amount of white space between trials
var normalpause = 1500;

//pause after picture chosen, to display red border around picture selected
var timeafterClick = 1000;


// ---------------- HELPER ------------------

// show slide function
function showSlide(id) {
  $(".slide").hide(); //jquery - all elements with class of slide - hide
  $("#"+id).show(); //jquery - element with given id - show
}


//array shuffle function
shuffle = function (o) { //v1.0
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

getCurrentDate = function() {
	var currentDate = new Date();
	var day = currentDate.getDate();
	var month = currentDate.getMonth() + 1;
	var year = currentDate.getFullYear();
	return (month + "/" + day + "/" + year);
}

getCurrentTime = function() {
	var currentTime = new Date();
	var hours = currentTime.getHours();
	var minutes = currentTime.getMinutes();

	if (minutes < 10) minutes = "0" + minutes;
	return (hours + ":" + minutes);
}

//for practice
var easyTrial = ["apple", "banana"];
var hardTrial = ["artichoke", "onion"];
var trialImages = [];

//for trials

// var trialSounds = [];

var tangrams = ["A1", "B1", "C1", "D1", "E1", "F1", "G1", "H1", "I1", "J1", "K1", "L1"];
// var tangramimages = new Array();
// for(i=0; i<tangrams.length; i++) {
// 	tangramimages[i] = new Image();
// 	tangramimages[i].src = "images/" + tangrams[i] + ".jpg";
// };

var wordList = [];
var directorList = [];
var matcherList = [];
var directorImages = [];
var matcherImages = [];
var trialSounds = [];

// shuffle practice trials
var practiceTrials = [];
var practiceWords = [];
var dpracticeImages = [];
var mpracticeImages = [];
	
for(i=0; i<=1; i++){
	newTrial = easyTrial.slice();
	shuffle(newTrial);
	newTrial.push("apple");
	practiceTrials.push(newTrial);
	newTrial = hardTrial.slice();
	shuffle(newTrial);
	newTrial.push("artichoke");
	practiceTrials.push(newTrial);
};

//construct word list for practice trials
for(i=0; i<practiceTrials.length; i++){
	var word = practiceTrials[i][2]
	practiceWords.push(word)
};

//order practice trial images
for(i=0; i<practiceTrials.length; i++) {
	subImages = practiceTrials[i].slice();
	items = subImages.splice(0,2);

	shuffle(items);
	for(j=0; j<2; j++) {
	 	dpracticeImages.push(items[j]);
	 };

	shuffle(items);
	for(k=0; k<2; k++) {
		mpracticeImages.push(items[k]);
	};
};

console.log(practiceTrials)
console.log(practiceWords)
console.log(dpracticeImages)
console.log(mpracticeImages)



function chosenTangram(element){
	return element == experiment.chosenpic
}

function startExperiment() {

	//construct wordList for correct answers
	for(i=0; i<allTrials.length; i++){
		subTrial = allTrials[i].slice();

		for(j=0; j<subTrial.length; j++){
			var word = subTrial[j][0];
			wordList.push(word)
		}
	};

	console.log(wordList)


	//load images according to trial order
	for(i=0; i<allTrials.length; i++) {
		subImages = allTrials[i].slice();
				
		for(j=0; j<subImages.length;j++) {
			newImages = subImages[j].slice();
			items = newImages.splice(0,2);
		
			shuffle(items);
			for(k=0; k<=1; k++) {
			 	directorList.push(items[k]);
			}
			
			shuffle(items);
			for(l=0; l<=1; l++) {
				matcherList.push(items[l]);
			}
		}	
	};

	//load sounds for feedback after each trial
	nextSound = new WebAudioAPISound("next");
	trialSounds.push(nextSound);

	
	// to start at beginning
	setTimeout(function() {
		console.log(globalGame.my_role);
		globalGame.my_role=="speaker1" ? showSlide("instructions") : showSlide("childinstructions");
	},900)

	// to jump around for de-bugging
	// globalGame.my_role=="speaker1" ? showSlide("directorstage") : showSlide("matcherstage");
};




// MAIN EXPERIMENT
var experiment = {

	subid: "",
		//inputed at beginning of experiment
	// parentchild: "",
		//whether parent or child is the director on a given trial
	trialnum: 0,
		//trial number
	order: 1,
		//whether child received list 1 or list 2
	word: "",
		//word that child is queried on
	pic1: "",
		//the name of the picture on the left
	pic2: "",
		//the name of the picture on the right
	side: "",
		//whether the child picked the left (L) or the right (R) picture
	chosenpic: "",
		//the name of the picture the child picked
	response: "",
		//whether the response was the correct response (Y) or the incorrect response (N)
	date: getCurrentDate(),
		//the date of the experiment
	timestamp: getCurrentTime(),
		//the time that the trial was completed at 
	reactiontime: 0,
		//time between start of trial and response 


	checkInput: function() {

		// subject ID
  		if(document.getElementById("subjectID").value.length < 1) {
			$("#checkMessage").html('<font color="red">You must input a subject ID</font>');
			return;
		};

		experiment.subid = document.getElementById("subjectID").value;

	  	$('#instructions').hide();
	    experiment.directorPractice(0);

		// showSlide("parent");
	},


	// Practice trials

	directorPractice: function(counter){

		experiment.trialnum = counter
		experiment.subid = globalGame.subid;

		console.log(practiceWords)

		// Create the object table for director (tr=table row; td= table data)

		var directorpractice_html = "";
	    
	   	//HTML for the first object on the left
		leftname = "practiceimages/" + dpracticeImages[0] + ".jpg";
		directorpractice_html += '<table align = "center" cellpadding="25"><tr></tr><tr><td align="center"><img class="pic" src="' + leftname +  '"alt="' + leftname + '" id= "leftPic"/></td>';

	
		//HTML for the first object on the right
		rightname = "practiceimages/" + dpracticeImages[1] + ".jpg";
	   	directorpractice_html += '<td align="center"><img class="pic" src="' + rightname +  '"alt="' + rightname + '" id= "rightPic"/></td>';
		
	  	directorpractice_html += '</tr></table>';
		
		var target = practiceWords[0];

		console.log(target)

		switch(target) {
			case dpracticeImages[0]:
				$("#leftPic").addClass('target');
				break;

			default: //dpracticeImages[1]
				$("#rightPic").addClass('target');		
		};

	    $("#practiceobjects").html(directorpractice_html); 
		$("#directorpractice").fadeIn();
	},


	// MATCHER PRACTICE

	// practice trials using familiar images

	matcherPractice: function(counter) {

		experiment.subid = globalGame.subid;
		$("#childinstructions").hide();

		dpracticeImages = globalGame.director.split(',');
		mpracticeImages = globalGame.matcher.split(',');
		practiceWords = globalGame.correctList.split(',');

		var matcherpractice_html = "";

		// Create the object table (tr=table row; td= table data)
	    
	   	//HTML for the first object on the left
		leftname = "practiceimages/" + mpracticeImages[0] + ".jpg";
		matcherpractice_html += '<table align = "center" cellpadding="25"><tr></tr><tr><td align="center"><img class="pic" src="' + leftname +  '"alt="' + leftname + '" id= "leftPic1"/></td>';
	
		//HTML for the first object on the right
		rightname = "practiceimages/" + mpracticeImages[1] + ".jpg";
	   	matcherpractice_html += '<td align="center"><img class="pic" src="' + rightname +  '"alt="' + rightname + '" id= "rightPic1"/></td>';
		
	  	matcherpractice_html += '</tr></table>';

	    $("#practiceobjects2").html(matcherpractice_html); 
		$("#matcherpractice").fadeIn();

		var startTime = (new Date()).getTime();

		globalGame.clickDisabled = true;
		clickDisabled = true;
		setTimeout(function() {
			clickDisabled = false;
		},  1500);
		

		$('.pic').on('click touchstart', function(event) {
	    	if (clickDisabled) return;

	    	globalGame.clickDisabled = false;
	    	
	    	//disable subsequent clicks once the participant has made their choice
			clickDisabled = true; 

			
	    	//time the participant clicked - the time the trial began
	    	experiment.reactiontime = (new Date()).getTime() - startTime;

			experiment.trialnum = counter;

	    	experiment.word = practiceWords[0]
	    	experiment.pic1 = mpracticeImages[0];
	    	experiment.pic2 = mpracticeImages[1];


	    	//Add color to selected picture
	    	var picID = $(event.currentTarget).attr('id');

	    	switch(picID) {
	    		case "leftPic":
	    			console.log("left")
	    			experiment.side = "L";
	    			experiment.chosenpic = mpracticeImages[0];
	    			$("#leftPic1").attr("src", "images/"+ mpracticeImages[0] +"_color.jpg")
	    			$("#rightPic1").attr("src", "images/"+ mpracticeImages[1] +".jpg")
	    			break;

	    		default: // "rightPic"
	    			console.log("right")
	    			experiment.side = "R";
	    			experiment.chosenpic = mpracticeImages[1];
	    			$("#rightPic1").attr("src", "images/"+ mpracticeImages[1] +"_color.jpg")
	    			$("#leftPic1").attr("src", "images/"+ mpracticeImages[0] +".jpg")
	    	};
		
	    	console.log(picID);

		    console.log(experiment.chosenpic)
		    
			
			//If the child picked the picture that matched with the word, then they were correct. If they did not, they were not correct.
			if (experiment.chosenpic === experiment.word) {
				experiment.response = "Y";
			} else {
				experiment.response = "N";
			};

			//Play sound at end of trial
		    setTimeout(function() {nextSound.play();}, 100);

			//what kind of trial was this?
			// experiment.trialtype = "practice";

			//Process the data to be saved 
			experiment.processOneRow();

			//remove the pictures from the image array that have been used, and the word from the wordList that has been used
			mpracticeImages.splice(0, 2);
			dpracticeImages.splice(0,2);
			practiceWords.splice(0, 1);

			//hide objects and show only background for 2 seconds
			setTimeout(function() {
				$(".pic").delay().fadeOut(1500);
				document.getElementById("empty").click();
				counter++
				experiment.trialnum = counter;
				console.log(counter)
				console.log("matcher")
				if(counter === 4){
					globalGame.practiceOver = true;
					console.log(globalGame.practiceOver);
					experiment.preStudy();
				} else {
			 		globalGame.practiceOver = false;
					experiment.directorPractice(counter);
				};
			}, 1);
		});

		// $("#donepractice").on('touchstart', function(event) {

		// })
	},
	
	//Slide after practice
	preStudy: function() {
		showSlide('prestudy')
	}

	//Moving from practice to study
	mpreStudy: function() {
		document.body.style.background = "white";
		$("#prestudy").hide();
		setTimeout(function () {
			experiment.matcherStudy(globalGame.trialnum);
		}, normalpause);
	},

	dpreStudy: function() {
		console.log("prestudy")
		setTimeout(function () {
			directorImages = globalGame.director;
			matcherImages = globalGame.matcher;
			wordList = globalGame.correctList;
			globalGame.trialnum = 0;
			experiment.directorStudy(globalGame.trialnum);
		}, normalpause);
	},

	//break between blocks
	matcherBreak: function() {
		showSlide('break');
		setTimeout(function() {
			$("#break").hide();
			experiment.matcherStudy(experiment.trialnum);
		}, 5000)
	},

	directorBreak: function(counter) {
		showSlide('break');
		setTimeout(function() {
			$("#break").hide();
			experiment.directorStudy(counter);
		}, 5000)
	},
	
	//the end of the experiment
    end: function () {
    	setTimeout(function () {
    		$("#matcherstage").fadeOut();
    		$("#directorstudy").fadeOut();
    	}, normalpause);
    	showSlide("finish");
    },

    //concatenates all experimental variables into a string which represents one "row" of data in the eventual csv, to live in the server
	processOneRow: function () {
		var dataforRound = experiment.subid; 
		dataforRound += "," + experiment.trialnum + "," + experiment.word;
		dataforRound += "," + experiment.pic1 + "," + experiment.pic2;
		dataforRound += "," + experiment.side + "," + experiment.chosenpic + "," + experiment.response;
		dataforRound += "," + experiment.date + "," + experiment.timestamp + "," + experiment.reactiontime + "\n";
		console.log(dataforRound)
		$.post("https://callab.uchicago.edu/experiments/tangramgame/gamecode/tangramgamesave.php", {postresult_string : dataforRound});	
	},


    // MAIN DISPLAY FUNCTION
    directorStudy: function(counter){

    	experiment.trialnum = counter;
    	experiment.subid = globalGame.subid;
    	console.log(experiment.subid);

		// Create the object table for director (tr=table row; td= table data)

		var directorobjects_html = "";

	   	//HTML for the first object on the left
		leftname = "images/" + directorImages[0] + ".jpg";
		directorobjects_html += '<table align = "center" cellpadding="25"><tr></tr><tr><td align="center"><img class="pic" src="' + leftname +  '"alt="' + leftname + '" id= "leftPic1"/></td>';

	
		//HTML for the first object on the right
		rightname = "images/" + directorImages[1] + ".jpg";
	   	directorobjects_html += '<td align="center"><img class="pic" src="' + rightname +  '"alt="' + rightname + '" id= "rightPic1"/></td>';
		
	  	directorobjects_html += '</tr></table>';
		
		$("#objects").html(directorobjects_html);	

		//Add border to target image
		var target = wordList[0];

		switch(target) {
			case directorImages[0]:
				$("#leftPic1").addClass('target');
				break;

			default: //directorImages[1]
				$("#rightPic1").addClass('target');		
		};

		$("#directorstage").fadeIn();
	},

  	matcherStudy: function(counter) {

  		$("#doneTrial").hide();

	  	// Update information

	  	experiment.subid = globalGame.subid;
	  	console.log(experiment.subid);
	  	directorImages = globalGame.director.split(',');
		matcherImages = globalGame.matcher.split(',');
		wordList = globalGame.correctList.split(',');

		// Create the object table for matcher (tr=table row; td= table data)

		var matcherobjects_html = "";
	    
	   	//HTML for the first object on the left
		leftname = "images/" + matcherImages[0] + ".jpg";
		matcherobjects_html += '<table align = "center" cellpadding="25"><tr></tr><tr><td align="center"><img class="pic" src="' + leftname +  '"alt="' + leftname + '" id= "leftPic"/></td>';

	
		//HTML for the first object on the right
		rightname = "images/" + matcherImages[1] + ".jpg";
	   	matcherobjects_html += '<td align="center"><img class="pic" src="' + rightname +  '"alt="' + rightname + '" id= "rightPic"/></td>';
		
	  	matcherobjects_html += '</tr></table>';
	    $("#objects2").html(matcherobjects_html);
		$("#matcherstage").fadeIn();
	    

	    var startTime = (new Date()).getTime();

		globalGame.clickDisabled = true;
		clickDisabled = true;
		setTimeout(function() {
			clickDisabled = false;
  			// $('#objects').fadeTo(250, 1)
		},  1500);
		

		$('.pic').on('click touchstart', function(event) {

			// counter = globalGame.trialnum;

	    	if (clickDisabled) return;

	    	globalGame.clickDisabled = false;
	    	
	    	//disable subsequent clicks once the participant has made their choice
			clickDisabled = true; 


	    	experiment.trialnum = counter;
	    	experiment.word = wordList[0];
	    	experiment.pic1 = matcherImages[0];
	    	experiment.pic2 = matcherImages[1];


			//time the participant clicked picture - the time the trial began
	    	experiment.reactiontime = (new Date()).getTime() - startTime;

	    	// Edit!! allTrials is the arrays of blocks
	    	// experiment.parentchild = allTrials[experiment.trialnum][2];

	    	//Add color to selected picture
	    	var picID = $(event.currentTarget).attr('id');

	    	switch(picID) {
	    		case "leftPic":
	    			console.log("left")
	    			experiment.side = "L";
	    			experiment.chosenpic = matcherImages[0];
	    			$("#leftPic").attr("src", "images/"+ matcherImages[0] +"_color.jpg")
	    			$("#rightPic").attr("src", "images/"+ matcherImages[1] +".jpg")
	    			break;

	    		default: // "rightPic"
	    			console.log("right")
	    			experiment.side = "R";
	    			experiment.chosenpic = matcherImages[1];
	    			$("#rightPic").attr("src", "images/"+ matcherImages[1] +"_color.jpg")
	    			$("#leftPic").attr("src", "images/"+ matcherImages[0] +".jpg")
	    	};
		
	    	console.log(picID);

	    	//remove the pictures from the image array that have been used, and the word from the wordList that has been used
			matcherImages.splice(0, 2);
			directorImages.splice(0, 2);
			wordList.splice(0, 1);

			//If the child picked the picture that matched with the word, then they were correct. If they did not, they were not correct.
			if (experiment.chosenpic === experiment.word) {
				experiment.response = "Y";
			} else {
				experiment.response = "N";
			};

			//Play sound at end of trial
		    setTimeout(function() {nextSound.play();}, 100);

		    console.log(experiment.chosenpic);

			//what kind of trial was this?
			//experiment.trialtype = allTrials[experiment.trialnum][0];

			//Process the data to be saved
			experiment.processOneRow();

			console.log(matcherImages);

			setTimeout(function() {
				$(".pic").delay().fadeOut(1500);
				document.getElementById("blank").click();
				counter++
				experiment.trialnum = counter;
				console.log(counter)
				console.log("matcher")
				// globalGame.trialnum++
				if (counter == 10|| counter == 20|| counter == 30) {
					setTimeout(function() {
						globalGame.trialnum++
						experiment.matcherBreak()
					}, 1000)
				} else if (counter === numTrials) {
					setTimeout(function() {experiment.end()}, 1000)
					return;
				} else {
					setTimeout(function() {
						experiment.directorStudy(counter);
					}, 1500);
				}
			}, 1000);

		});
	},
}


