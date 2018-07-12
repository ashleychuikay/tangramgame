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


//Read in .csv from server
var xhr = new XMLHttpRequest(),
    method = "GET",
    url = "https://raw.githubusercontent.com/ashleychuikay/tangramgame/master/tangramgametrials.csv";
    //NEW TRIAL CSV FOR TANGRAMS

xhr.open(method, url, true);

xhr.onreadystatechange = function () {
  if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {

    trials = $.csv.toArrays(xhr.responseText);
    
    allTrials = new Array;

    switchSpeaker = function(speaker) {
    	return speaker == "Child" ? "Parent" : "Child"
    };

    
    shuffledTrials = shuffle(trials.slice());
    parentItems = shuffledTrials.slice(0,Math.floor(shuffledTrials.length/2));
    childItems = shuffledTrials.slice(Math.floor(shuffledTrials.length/2),shuffledTrials.length+1);

    console.log(parentItems);
    console.log(childItems);
    // console.log(shuffledTrials)


    parentPairs = new Array;
    childPairs = new Array;


    for(i=0; i<parentItems.length; i++) {
    	parentPairs.push({target: parentItems[i][0], foils: shuffle(parentItems[i].splice(1, 4)), speaker: "Child"})
    	childPairs.push({target: childItems[i][0], foils: shuffle(childItems[i].splice(1, 4)), speaker: "Parent"})
    }

    for(j=0; j<=3; j++) {
    	block = makeBlock();
    	allTrials.push(block);
    }

   // blockTrials = makeBlock()

   console.log(allTrials)
   startExperiment(allTrials)


  //   allTrials = new Array;

		// for(i=0; i<trials.length; i++){
		// 	newArr = trials[i].slice();	

		// 	for(j=1; j<=4; j++){
		// 		subArr = newArr.slice();
		// 		subArr.push(subArr[j]);
		// 		subArr.splice(1,4);
		// 		allTrials.push(subArr);
		// 	}
		// };

		//startExperiment(allTrials)
		//console.log(allTrials)

  }
};
xhr.send();


// disables all scrolling functionality to fix a slide in place on the ipad
document.ontouchmove = function(event){
    event.preventDefault();
}


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

createDot = function(dotx, doty, i, tag) {
	var dots;
	if (tag === "smiley") {
		dots = ["smiley1", "smiley2", "smiley3", "smiley4", "smiley5"];
	} else {
		dots = [1, 2, 3, 4, 5];
	}

	var dot = document.createElement("img");
	dot.setAttribute("class", "dot");
	dot.id = "dot_" + dots[i];
	if (tag === "smiley") {
		dot.src = "dots/dot_" + "smiley" + ".jpg";
	} else {
		dot.src = "dots/dot_" + dots[i] + ".jpg";
	}

    var x = Math.floor(Math.random()*650);
    var y = Math.floor(Math.random()*540);

    var invalid = "true";

    //make sure dots do not overlap
    while (true) {
    	invalid = "true";
	   	for (j = 0; j < dotx.length ; j++) {
    		if (Math.abs(dotx[j] - x) + Math.abs(doty[j] - y) < 250) {
    			var invalid = "false";
    			break; 
    		}
		}
		if (invalid === "true") {
 			dotx.push(x);
  		  	doty.push(y);
  		  	break;	
  	 	}
  	 	x = Math.floor(Math.random()*400);
   		y = Math.floor(Math.random()*400);
	}

    dot.setAttribute("style","position:absolute;left:"+x+"px;top:"+y+"px;");
   	training.appendChild(dot);
   	// $("#allDots").appendChild(dot);
}


//for dot game
// var images = new Array();
// var dots = ["dot_1", "dot_2", "dot_3", "dot_4", "dot_5", "x", "dot_smiley"];
// for (i = 0; i<dots.length; i++) {
// 	images[i] = new Image();
// 	images[i].src = "dots/" + dots[i] + ".jpg";
// }

//for practice
var easyTrial = ["apple", "banana", "orange"];
var hardTrial = ["asparagus", "artichoke", "onion"];
var trialImages = [];

//for trials

// var trialSounds = [];

var tangrams = ["A1", "B1", "C1", "D1", "E1", "F1", "G1", "H1", "I1", "J1", "K1", "L1"];
var tangramimages = new Array();
for(i=0; i<tangrams.length; i++) {
	tangramimages[i] = new Image();
	tangramimages[i].src = "images/" + tangrams[i] + ".jpg";
};

var wordList = [];
var directorImages = [];
var matcherImages = [];

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

	//CONTROL FLOW

	//shuffle trials to randomize order, check to make sure the same set of tangrams does not appear back to back
	
	shuffle(allTrials)

	function checkTrials() {
		shuffle(allTrials)
		for(i=0; i<allTrials.length-1; i++) {
			if(allTrials[i+1].includes(allTrials[i][0])) {
				var temp = allTrials[i+1];
				allTrials[i+1] = allTrials[i+2];
				allTrials[i+2] = temp;

				if(allTrials[i+2].includes(allTrials[i+1][0])) {
				checkTrials(allTrials);
				}
			}
			if(allTrials[allTrials.length-2].includes(allTrials[allTrials.length-1][0])) {
				checkTrials(allTrials);
			}
		}
	};

	checkTrials(allTrials);

	//construct wordList for correct answers
	for(i=0; i<allTrials.length; i++){
		var word = allTrials[i][0];
		wordList.push(word)
	};


	//load images according to trial order
	for(i=0; i<allTrials.length; i++) {
		subImages = allTrials[i].slice();
		items = subImages.splice(0,2);
		shuffle(items);
		for(j=0; j<=1; j++) {
		 	directorImages.push(items[j]);
		}
		shuffle(items);
		for(k=0; j<=1; j++) {
			matcherImages.push(items[k]);
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

	//to jump around for de-bugging
	// experiment.preStudy();

}




// MAIN EXPERIMENT
var experiment = {

	subid: "",
		//inputed at beginning of experiment
	parentchild: "",
		//whether parent or child starts as director inputed at begininng of experiment
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
			experiment.next(0);
		}, normalpause);
	},

	directorStudy: function(){
		$('#prestudy').hide();
		setTimeout(function() {
			var parentList = globalGame.correctList.split(',');
			$(".correctWord").html(parentList[globalGame.trialnum]);
			$("#parentstudy").fadeIn(500);
		}, 2500)
		// Create the object table for director (tr=table row; td= table data)
	    
	   	//HTML for the first object on the left
		leftname = "tangramimages/" + directorImages[0] + ".png";
		directorobjects_html += '<table align = "center" cellpadding="25"><tr></tr><tr><td align="center"><img class="pic" src="' + leftname +  '"alt="' + leftname + '" id= "leftPic"/></td>';

	
		//HTML for the first object on the right
		rightname = "tangramimages/" + directorImages[1] + ".png";
	   	directorobjects_html += '<td align="center"><img class="pic" src="' + rightname +  '"alt="' + rightname + '" id= "rightPic"/></td>';
		
	  	directorobjects_html += '</tr></table>';
		
		var target = "tangramimages/" + wordList[0] + ".png";
		$(target).css("margin", "-8px");

	    $("#objects").html(directorobjects_html); 
		$("#directorstage").fadeIn();
	},

	parentPractice: function(){
		$('#prepractice').hide();
		setTimeout(function() {
			var parentList = globalGame.practiceList.split(',');
			$(".practiceWord").html(parentList[globalGame.trialnum]);
			$("#parentpractice").fadeIn(500);
		}, 1500)
	},

	checkInput: function() {
		// subject ID
  		if (document.getElementById("subjectID").value.length < 1) {
			$("#checkMessage").html('<font color="red">You must input a subject ID</font>');
			return;
		}
  		experiment.subid = document.getElementById("subjectID").value;
  		experiment.parentchild = document.getElementById("parentchild");

		showSlide("parent");
	},

	//practice trials using food items
	practice: function(counter) {

		var numTrials = 4

		experiment.subid = globalGame.subid;
		$("#child").hide();

		var objects_html = "";

		// Create the object table (tr=table row; td= table data)
	    
	   	//HTML for the first object on the left
		leftname = "practiceimages/" + practiceImages[0] + ".png";
		objects_html += '<table align = "center" cellpadding="25"><tr></tr><tr><td align="center"><img class="pic" src="' + leftname +  '"alt="' + leftname + '" id= "leftPic1"/></td>';
	
		//HTML for the first object on the right
		rightname = "practiceimages/" + practiceImages[1] + ".png";
	   	objects_html += '<td align="center"><img class="pic" src="' + rightname +  '"alt="' + rightname + '" id= "rightPic1"/></td>';
		
	  	objects_html += '</tr></table>';
	    $("#practiceobjects").html(objects_html); 
		$("#practicestage").fadeIn();

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
			clickDisabled = true; 

			
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
	    	experiment.pic3 = practiceImages[2];

	    	//Was the picture clicked on the right or the left?
	    	var picID = $(event.currentTarget).attr('id');

	    	switch(picID) {
	    		case "leftPic1":
	    			experiment.side = "L";
	    			experiment.chosenpic = practiceImages[0];
	    			// 'winningSound= trialSounds[animals.findIndex(chosenAnimal)]
	    			break;
	    		case "middlePic1":
	    			experiment.side = "M";
	    			experiment.chosenpic = practiceImages[1];
	    			// winningSound= trialSounds[animals.findIndex(chosenAnimal)]
	    			break;
	    		default: // "rightPic"
	    			experiment.side = "R"
	    			experiment.chosenpic = practiceImages[2];
	    			// winningSound= trialSounds[animals.findIndex(chosenAnimal)]
	    	}

	    	//Play animal sound according to chosen picture
		    // setTimeout(function() {winningSound.play();}, 100)

		    console.log(experiment.chosenpic)
		    
			
			//If the child picked the picture that matched with the word, then they were correct. If they did not, they were not correct.
			if (experiment.chosenpic === experiment.word) {
				experiment.response = "Y";
			} else {
				experiment.response = "N"
			}

			//what kind of trial was this?
			experiment.trialtype = "practice";


			//Add one to the counter and process the data to be saved; the child completed another "round" of the 
			experiment.processOneRow();



	   	   $(document.getElementById(picID)).css('margin', "-8px");
		// $(document.getElementById(picID)).animate({'margin-top': '-70px'}, 'fast');

			//remove the pictures from the image array that have been used, and the word from the wordList that has been used
			practiceImages.splice(0, 3);
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
	},
	

	//the end of the experiment
    end: function () {
    	setTimeout(function () {
    		$("#stage").fadeOut();
    		$('#parentstudy').fadeOut();
    	}, normalpause);
    	showSlide("finish");
    },

    //concatenates all experimental variables into a string which represents one "row" of data in the eventual csv, to live in the server
	processOneRow: function () {
		var dataforRound = experiment.subid; 
		dataforRound += "," + experiment.trialnum + "," + experiment.word;
		dataforRound += "," + experiment.pic1 + "," + experiment.pic2 + "," + experiment.pic3;
		dataforRound += "," + experiment.side + "," + experiment.chosenpic + "," + experiment.response + "," + experiment.trialtype;
		dataforRound += "," + experiment.date + "," + experiment.timestamp + "," + experiment.reactiontime + "\n";
		console.log(dataforRound)
		$.post("https://callab.uchicago.edu/experiments/animalgame/gamecode/animalgamesave.php", {postresult_string : dataforRound});	

	},


    // MAIN DISPLAY FUNCTION
  	next: function(counter) {

	  	experiment.subid = globalGame.subid;
		var directorobjects_html = "";


		// Create the object table for matcher (tr=table row; td= table data)

		var matcherobjects_html = "";
	    
	   	//HTML for the first object on the left
		leftname = "tangramimages/" + matcherImages[0] + ".png";
		matcherobjects_html += '<table align = "center" cellpadding="25"><tr></tr><tr><td align="center"><img class="pic" src="' + leftname +  '"alt="' + leftname + '" id= "leftPic"/></td>';

	
		//HTML for the first object on the right
		rightname = "tangramimages/" + matcherImages[1] + ".png";
	   	matcherobjects_html += '<td align="center"><img class="pic" src="' + rightname +  '"alt="' + rightname + '" id= "rightPic"/></td>';
		
	  	matcherobjects_html += '</tr></table>';
	    $("#objects").html(matcherobjects_html); 
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

	    	//time the participant clicked - the time the trial began
	    	experiment.reactiontime = (new Date()).getTime() - startTime;

	    	experiment.trialnum = counter;
	    	experiment.word = wordList[0]
	    	experiment.pic1 = allImages[0];
	    	experiment.pic2 = allImages[1];
	    	experiment.pic3 = allImages[2];

	    	//Was the picture clicked on the right or the left?
	    	var picID = $(event.currentTarget).attr('id');

	    	switch(picID) {
	    		case "leftPic":
	    			experiment.side = "L";
	    			experiment.chosenpic = matcherImages[0];
	    			break;

	    		default: // "rightPic"
	    			experiment.side = "R"
	    			experiment.chosenpic = matcherImages[1];
	    	}
			
			//If the child picked the picture that matched with the word, then they were correct. If they did not, they were not correct.
			if (experiment.chosenpic === experiment.word) {
				experiment.response = "Y";
				winningSound = trialSounds[0]
			} else {
				experiment.response = "N"
				winningSound = trialSounds[1]
			}

			//Play animal sound according to chosen picture
		    setTimeout(function() {winningSound.play();}, 100)

		    console.log(experiment.chosenpic)

			//what kind of trial was this?
			experiment.trialtype = allTrials[experiment.trialnum][0];


			//Add one to the counter and process the data to be saved
			experiment.processOneRow();


	    $(document.getElementById(picID)).css('margin', "-8px");
	    console.log(picID)
			// $(document.getElementById(picID)).animate({'margin-top': '-60px'}, 'fast');

			//remove the pictures from the image array that have been used, and the word from the wordList that has been used
			matcherImages.splice(0, 2);
			directorImages.splice(0, 2);
			wordList.splice(0, 1);


			//hide animals and show only background for 2 seconds
			setTimeout(function() {
				$(".pic").delay().fadeOut(2000);
				counter++; 
				if (counter === numTrials) {
					setTimeout(function() {experiment.end()}, 1000)
					return;
				} else {
					setTimeout(function() {
						experiment.next(counter)
					}, 3000);
				}
			});
		});
	},
}


