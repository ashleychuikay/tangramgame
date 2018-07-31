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

var numTrials = 36;

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
var easyTrial = ["apple", "banana", "orange"];
var hardTrial = ["asparagus", "artichoke", "onion"];
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
var directorImages = [];
var matcherImages = [];
var trialSounds = [];
// shuffle practice trials
// practiceTrials = [];
// practiceWords = [];
// practiceImages = [];
	
// for(i=0; i<=1; i++){
// 	newTrial = easyTrial.slice();
// 	shuffle(newTrial);
// 	newTrial.push("apple");
// 	practiceTrials.push(newTrial);
// 	newTrial = hardTrial.slice();
// 	shuffle(newTrial);
// 	newTrial.push("artichoke");
// 	practiceTrials.push(newTrial);
// };

// //construct word list for practice trials
// for(i=0; i<practiceTrials.length; i++){
// 	var word = practiceTrials[i][3]
// 	practiceWords.push(word)
// };

// //order practice trial images
// for(i=0; i<practiceTrials.length; i++) {
// 	subImages = practiceTrials[i].slice();
// 	 for(j=0; j<=2; j++) {
// 	 	newImages = subImages.slice();
// 	 	practiceImages.push(newImages[j]);
// 	 }
// };

// console.log(practiceTrials)
// console.log(practiceImages)
// console.log(practiceWords)



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
			 	directorImages.push(items[k]);
			}
			
			shuffle(items);
			for(l=0; l<=1; l++) {
				matcherImages.push(items[l]);
			}
		}	
	};

	//load sounds for feedback after each trial
	yesSound = new WebAudioAPISound("tangramsounds/yes");
	noSound = new WebAudioAPISound("tangramsounds/no");
	trialSounds.push(yesSound);
	trialSounds.push(noSound);

	
	// to start at beginning
	setTimeout(function() {
		console.log(globalGame.my_role);
		globalGame.my_role=="speaker1" ? showSlide("instructions") : showSlide("childinstructions");
	},900)

	// to jump around for de-bugging
	// globalGame.my_role=="speaker1" ? showSlide("directorstage") : showSlide("matcherstage");

}




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


	preStudy: function() {
		document.body.style.background = "white";
		$("#prestudy").hide();
		setTimeout(function () {
			experiment.matcherStudy(0);
		}, normalpause);
	},


	directorPractice: function(){
		$('#prepractice').hide();

		// Create the object table for director (tr=table row; td= table data)

		var practiceobjects_html = "";
	    
	   	//HTML for the first object on the left
		leftname = "practiceimages/" + practiceImages[0] + ".jpg";
		directorobjects_html += '<table align = "center" cellpadding="25"><tr></tr><tr><td align="center"><img class="pic" src="' + leftname +  '"alt="' + leftname + '" id= "leftPic"/></td>';

	
		//HTML for the first object on the right
		rightname = "practiceimages/" + practiceImages[1] + ".jpg";
	   	directorobjects_html += '<td align="center"><img class="pic" src="' + rightname +  '"alt="' + rightname + '" id= "rightPic"/></td>';
		
	  	directorobjects_html += '</tr></table>';
		
		var target = "practiceimages/" + wordList[0] + ".jpg";
		$(target).css("margin", "-8px");

	    $("#objects").html(practiceobjects_html); 
		$("#directorpractice").fadeIn();
	},

	checkInput: function() {
		// subject ID
  		if (document.getElementById("subjectID").value.length < 1) {
			$("#checkMessage").html('<font color="red">You must input a subject ID</font>');
			return;
		}
  		experiment.subid = document.getElementById("subjectID").value;

		// showSlide("parent");
	},

	//practice trials using food items
	matcherPractice: function(counter) {

		var numTrials = 4

		experiment.subid = globalGame.subid;
		$("#childinstructions").hide();

		var practiceobjects_html = "";

		// Create the object table (tr=table row; td= table data)
	    
	   	//HTML for the first object on the left
		leftname = "practiceimages/" + practiceImages[0] + ".jpg";
		objects_html += '<table align = "center" cellpadding="25"><tr></tr><tr><td align="center"><img class="pic" src="' + leftname +  '"alt="' + leftname + '" id= "leftPic1"/></td>';
	
		//HTML for the first object on the right
		rightname = "practiceimages/" + practiceImages[1] + ".jpg";
	   	objects_html += '<td align="center"><img class="pic" src="' + rightname +  '"alt="' + rightname + '" id= "rightPic1"/></td>';
		
	  	objects_html += '</tr></table>';
	    $("#practiceobjects").html(objects_html); 
		$("#matcherpractice").fadeIn();

		var startTime = (new Date()).getTime();

		globalGame.clickDisabled = true;
		clickDisabled = true;
		setTimeout(function() {
			clickDisabled = false;
		},  1500);
		

		$('.pic').on('touchstart', function(event) {
	    	if (clickDisabled) return;

	    	globalGame.clickDisabled = false;
	    	
	    	//disable subsequent clicks once the participant has made their choice
			// clickDisabled = true; 

			
	    	//time the participant clicked - the time the trial began
	    	experiment.reactiontime = (new Date()).getTime() - startTime;

			experiment.trialnum = counter;
			counter++;
			console.log(counter); 
				if(counter === numTrials){
					globalGame.practiceOver = true
					console.log(globalGame.practiceOver)
				}



	    	experiment.word = practiceWords[0]
	    	experiment.pic1 = practiceImages[0];
	    	experiment.pic2 = practiceImages[1];

	    	//Was the picture clicked on the right or the left?
	    	var picID = $(event.currentTarget).attr('id');

	    	switch(picID) {
	    		case "leftPic1":
	    			experiment.side = "L";
	    			experiment.chosenpic = practiceImages[0];
	    			break;

	    		default: // "rightPic"
	    			experiment.side = "R"
	    			experiment.chosenpic = practiceImages[1];		
	    	}

	    	//Play sound according to chosen picture
		    setTimeout(function() {winningSound.play();}, 100)

		    console.log(experiment.chosenpic)
		    
			
			//If the child picked the picture that matched with the word, then they were correct. If they did not, they were not correct.
			if (experiment.chosenpic === experiment.word) {
				experiment.response = "Y";
				winningSound = trialSounds[0];
			} else {
				experiment.response = "N";
				winningSound = trialSounds[1];
			}

			//Play sound according to chosen picture
		    setTimeout(function() {winningSound.play();}, 100);

			//what kind of trial was this?
			// experiment.trialtype = "practice";

			//Process the data to be saved 
			experiment.processOneRow();


	   	   $(document.getElementById(picID)).css('margin', "-8px");

			//remove the pictures from the image array that have been used, and the word from the wordList that has been used
			practiceImages.splice(0, 2);
			practiceWords.splice(0, 1);


			//hide objects and show only background for 2 seconds
			setTimeout(function() {
				$(".pic").delay().fadeOut(2000);

				setTimeout(function() {
					if(counter === numTrials){
						showSlide('child')
				 } else {
				 	globalGame.practiceOver = false
					experiment.practice(counter)
					};
				}, 3000);
			}, 1);
		});

		$("#donepractice").on('touchstart', function(event) {

		})
	},
	
	//break between blocks
	matcherBreak: function() {
		showSlide('break');
		setTimeout(function() {
			experiment.matcher()
		}, 5000)
	},

	directorBreak: function() {
		showSlide('break');
		setTimeout(function() {
			experiment.directorStudy()
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
		$.post("https://callab.uchicago.edu/experiments/animalgame/gamecode/tangramgamesave.php", {postresult_string : dataforRound});	

	},


    // MAIN DISPLAY FUNCTION
    directorStudy: function(){

		$('#prestudy').hide();
		// setTimeout(function() {
		// 	var parentList = globalGame.correctList.split(',');
		// 	$(".correctWord").html(parentList[globalGame.trialnum]);
		// 	$("#parentstudy").fadeIn(500);
		// }, 2500)
		// Create the object table for director (tr=table row; td= table data)

		var directorobjects_html = "";
	    
	   	//HTML for the first object on the left
		leftname = "images/" + directorImages[0] + ".jpg";
		directorobjects_html += '<table align = "center" cellpadding="25"><tr></tr><tr><td align="center"><img class="pic" src="' + leftname +  '"alt="' + leftname + '" id= "leftPic"/></td>';

	
		//HTML for the first object on the right
		rightname = "images/" + directorImages[1] + ".jpg";
	   	directorobjects_html += '<td align="center"><img class="pic" src="' + rightname +  '"alt="' + rightname + '" id= "rightPic"/></td>';
		
	  	directorobjects_html += '</tr></table>';
		
		// var target = "images/" + wordList[0] + ".jpg";
		// $(target).css("margin", "-8px");

	    $("#objects").html(directorobjects_html); 
		$("#directorstage").fadeIn();
	},

  	matcherStudy: function(counter) {

	  	experiment.subid = globalGame.subid;
	  			
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
		

		$('.pic').on('touchstart', function(event) {

	    	if (clickDisabled) return;

	    	globalGame.clickDisabled = false;
	    	
	    	//disable subsequent clicks once the participant has made their choice
			// clickDisabled = true; 


	    	experiment.trialnum = counter;
	    	experiment.word = wordList[0];
	    	experiment.pic1 = allImages[0];
	    	experiment.pic2 = allImages[1];
	    	experiment.pic3 = allImages[2];
	    	experiment.parentchild = allTrials[experiment.trialnum][2];

	    	//Was the picture clicked on the right or the left?
	    	var picID = $(event.currentTarget).attr('id');

	    	switch(picID) {
	    		case "leftPic":
	    			experiment.side = "L";
	    			experiment.chosenpic = matcherImages[0];
	    			break;

	    		default: // "rightPic"
	    			experiment.side = "R";
	    			experiment.chosenpic = matcherImages[1];
	    	};
			
			// //what kind of trial was this?
			// experiment.trialtype = allTrials[experiment.trialnum][0];


	    $(document.getElementById(picID)).css('margin', "-8px");
	    console.log(picID);
		});
		
		$('#doneTrial').on('click', function(event) {

			//time the participant clicked next - the time the trial began
	    	experiment.reactiontime = (new Date()).getTime() - startTime;

			//If the child picked the picture that matched with the word, then they were correct. If they did not, they were not correct.
			if (experiment.chosenpic === experiment.word) {
				experiment.response = "Y";
				winningSound = trialSounds[0];
			} else {
				experiment.response = "N";
				winningSound = trialSounds[1];
			};

			//Play sound according to chosen picture
		    setTimeout(function() {winningSound.play();}, 100);

		    console.log(experiment.chosenpic);

			//what kind of trial was this?
			//experiment.trialtype = allTrials[experiment.trialnum][0];

			//Process the data to be saved
			experiment.processOneRow();

			//remove the pictures from the image array that have been used, and the word from the wordList that has been used
			matcherImages.splice(0, 2);
			directorImages.splice(0, 2);
			wordList.splice(0, 1);

			setTimeout(function() {
				$(".pic").delay().fadeOut(2000);
				counter++;
				if (counter == 10|| counter == 20|| counter == 30) {
					setTimeout(function() {
						experiment.matcherBreak()
					}, 1000)
				} else if (counter === numTrials) {
					setTimeout(function() {experiment.end()}, 1000)
					return;
				} else {
					setTimeout(function() {
						experiment.directorStudy();
					}, 1000);
				}
			});
		})
	},
}


