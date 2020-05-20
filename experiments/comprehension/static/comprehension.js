// Tangram comprehension task

// to start at beginning
var experiment;
window.onload = function(event) {
  $('#audioCheckForm').on('submit', function (e) {
    var val = document.getElementById("audioCheckTextbox").value.replace(/\s/g,'');
    if(val == '86') {
      $("#audioCheckButton").fadeOut(500);
      $("#audioCheckForm").fadeOut(500);
      setTimeout(function() {
	$('#checkMessage').html("<p>Thanks! Ready to begin?</p>");      
	$('#beforeStudy').fadeIn(500);
      }, 500);
    } else {
      $('#checkMessage').html('<p>Make sure your audio is on and listen again</p>');
    }
    return false;
  });

  experiment = new Experiment();
  showSlide("consent");
};

// disables all scrolling functionality to fix a slide in place on the ipad
document.ontouchmove = function(event){
    event.preventDefault();
};

// ---------------- PARAMETERS ------------------

//amount of white space between trials
const normalpause = 1500;

//pause after picture chosen
const timeafterClick = 1000;
//const nextSound = new WebAudioAPISound("/static/audio/next");

// ---------------- HELPER ------------------

// show slide function
function showSlide(id) {
  $(".slide").hide(); //jquery - all elements with class of slide - hide
  $("#"+id).show(); //jquery - element with given id - show
}

//array shuffle function
function shuffle (o) { //v1.0
  for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}

function enable(id){
  if(form_ok()) {
    document.getElementById(id).disabled = '';
  }
}

//get radiobutton values for consent
const getCheckedRadioValue = (name) => {
  const radios = document.getElementsByName(name);
  try {
    // calling .value without a "checked" property with throw an exception.
    return Array.from(radios).find((r, i) => radios[i].checked).value
  } catch(e) { }
}

function form_ok() {
  return (getCheckedRadioValue('age') == "eighteen" &&
	  getCheckedRadioValue('understand') == "understood" &&
	  getCheckedRadioValue('give_consent') == "consent");
}

function disable(id){
  document.getElementById(id).disabled = 'disabled';
}


function getCurrentDate () {
  var currentDate = new Date();
  var day = currentDate.getDate();
  var month = currentDate.getMonth() + 1;
  var year = currentDate.getFullYear();
  return (month + "/" + day + "/" + year);
}

function getCurrentTime () {
  var currentTime = new Date();
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  var seconds = currentTime.getSeconds();

  if (minutes < 10) minutes = "0" + minutes;
  if(seconds < 10) seconds = "0" + seconds;
  return (hours + ":" + minutes + ":" + seconds);
}

// MAIN EXPERIMENT
class Experiment {
  constructor() {
    // initialize socket to talk to server
    this.subid = "";
    //inputed at beginning of experiment
    this.age = "";
    //inputed at beginning of experiment
    this.trialnum = 0;
    //whether child received list 1 or list 2
    this.target = "";
    //word that child is queried on
    this.leftpic = "";
    //the name of the picture on the left
    this.rightpic = "";
    //the name of the picture on the right
    this.person = "";
    //the identity of original speaker
    this.side = "";
    //whether the child picked the left (L) or the right (R) picture
    this.chosenpic = "";
    //the name of the picture the child picked
    this.response = "";
    //whether the response was the correct response (Y) or the incorrect response (N)
    this.date = getCurrentDate();
    //the date of the experiment
    this.timestamp = getCurrentTime();
    //the time that the trial was completed at 
    this.reactiontime = 0;
    this.data = [];

    // Set up callback for button
    $('#audioPlayButton').on('click', this.playAudio.bind(this));
  }

  // Check subject id

  start() {
    // initialize connection to server
    this.socket = io.connect();
    
    // begin first trial as soon as we hear back from the server
    this.socket.on('onConnected', function(mongoData) {
      this.subid = mongoData['gameid'];
      this.itemid = mongoData['set_id'];
      this.trials = mongoData['trials'];
      this.numTrials = this.trials.length;
      console.log('num trials', this.numTrials);
      this.age = 'mturk';
      this.preloadedAudio = _.map(this.trials, (trial) => {
	return new WebAudioAPISound("/static/audio/" + trial['audio']);
      });
      setTimeout(function() {
	this.study(0);
      }.bind(this));
    }.bind(this));
  };

  //manipulation check
  check () {
    $("#stage").fadeOut();
    $("#check").fadeIn;
    $("#checkobjects").html('\
      <table align = "center" cellpadding="25"> \
        <tr></tr>\
        <tr>\
          <td align="center">\
            <img class="pic" src="static/images/A1.jpg" alt="images/A1.jpg" id= "leftPic"/>\
          </td>\
          <td align="center">\
            <img class="pic" src="static/images/B1.jpg" alt="images/B1.jpg" id= "rightPic"/>\
          </td>\
        </tr>\
      </table>'
    ).fadeIn(1000);
    $("#finalCheckButton").delay().fadeIn(1000);
    $(".pic").on('click touchstart', this.handleClick.bind(this));

    handleClick(event) {
    // don't count click if disabled
    // but disable subsequent clicks once the participant has made their choice
    if (this.clickDisabled) {
      $('#error').fadeIn();
      setTimeout(function() {$('#error').fadeOut();}, 1500);
      return;
    }

    // Add color to selected picture
    var picID = $(event.currentTarget).attr('id');
    if(picID == "leftPic") {
      this.side = "L";
      this.chosenpic = this.leftpic;
      $("#leftPic").attr("src", "static/images/A1_color.jpg");
      $("#rightPic").attr("src", "static/images/B1.jpg");
    } else if(picID == "rightPic") {
      this.side = "R";
      this.chosenpic = this.rightpic;
      $("#rightPic").attr("src", "static/images/B1_color.jpg");
      $("#leftPic").attr("src", "static/images/A1.jpg");
    } else {
      console.error('unknown picID:', picID);
    };

    this.processOneRow();

  };

  //the end of the experiment
  end () {
    console.log('if submitted, data on mturk would be');
    console.log(this.data);

    setTimeout(function () {
      turk.submit(this.data, true);
      $("#check").fadeOut();
      showSlide("finish");
    }.bind(this), normalpause);
  };

  //concatenates all experimental variables into a string which
  //represents one "row" of data in the eventual csv, to live in the
  //server
  processOneRow () {
    var jsonForRound = _.pick(this, [
      'subid', 'itemid', 'audioid', 'trialnum', 'age', 'target',
      'leftpic','rightpic', 'person','side','chosenpic','correct',
      'date','timestamp','reactiontime', 'occurrence'
    ]);

    // send to server and save locally to submit to mturk
    console.log('data is')
    console.log(jsonForRound);
    this.socket.emit('currentData', jsonForRound);
    this.data.push(jsonForRound);
  };

  //Comprehension game
  study(trialnum) {
    var currTrial = this.trials[trialnum];
    this.trialnum = trialnum;
    this.clickDisabled = true;
    this.audioid = currTrial['audio'];
    this.occurrence = currTrial['occurrence'];
    this.target = currTrial['target'];
    this.leftpic = currTrial['leftpic'];
    this.rightpic = currTrial['rightpic'];
    this.person = currTrial['person'];
    
    $("#blank").click();
    $("#instructions").hide();
    $("#objects").hide();
    $("#stage").fadeIn();    

    // Create the object table for matcher (tr=table row; td= table data)
    var objects_html = "";
    
    //HTML for the objects on the left & right
    var leftname = "static/images/" + currTrial['leftpic'] + ".jpg";
    var rightname = "static/images/" + currTrial['rightpic'] + ".jpg";
    $("#objects").html('\
      <table align = "center" cellpadding="25"> \
        <tr></tr>\
        <tr>\
          <td align="center">\
            <img class="pic" src="' + leftname +  '"alt="' + leftname + '" id= "leftPic"/>\
          </td>\
          <td align="center">\
            <img class="pic" src="' + rightname +  '"alt="' + rightname + '" id= "rightPic"/>\
          </td>\
        </tr>\
      </table>'
    ).fadeIn(1000);
    $("#audioPlayButton").delay().fadeIn(1000);      
    $('.pic').on('click touchstart', this.handleClick.bind(this));    
  }

  playAudio(event) {
    // Play audio
    var audio = this.preloadedAudio[this.trialnum];
    console.log('here');
    console.log(audio);
    // after audio finishes, allow to click tangram and start clock
    audio.play(function(){
      this.clickDisabled = false;
      this.startTime = (new Date()).getTime();
    }.bind(this));
  }

  handleClick(event) {
    // don't count click if disabled
    // but disable subsequent clicks once the participant has made their choice
    if (this.clickDisabled) {
      $('#error').fadeIn();
      setTimeout(function() {$('#error').fadeOut();}, 1500);
      return;
    }

    // time the participant clicked picture - the time the audio finished
    this.reactiontime = (new Date()).getTime() - this.startTime;
    this.clickDisabled = true; 

    // Add color to selected picture
    var picID = $(event.currentTarget).attr('id');
    if(picID == "leftPic") {
      this.side = "L";
      this.chosenpic = this.leftpic;
      $("#leftPic").attr("src", "static/images/"+ this.leftpic +"_color.jpg");
      $("#rightPic").attr("src", "static/images/"+ this.rightpic +".jpg");
    } else if(picID == "rightPic") {
      this.side = "R";
      this.chosenpic = this.rightpic;
      $("#rightPic").attr("src", "static/images/"+ this.rightpic +"_color.jpg");
      $("#leftPic").attr("src", "static/images/"+ this.leftpic +".jpg");
    } else {
      console.error('unknown picID:', picID);
    };
    
    console.log(picID);

    // If the child picked the picture that matched with the target,
    // then they were correct. If they did not, they were not
    // correct.
    this.correct = this.chosenpic === this.target;

    //Process the data to be saved
    this.processOneRow();

    setTimeout(function() {
      $(".pic").delay().fadeOut(1000);
      $("#audioPlayButton").delay().fadeOut(1000);      
      document.getElementById("blank").click();
      setTimeout(function() {
	if (this.trialnum + 1 === this.numTrials) {
	  this.end();
	} else {
	  this.study(this.trialnum + 1);
	}
      }.bind(this), 1000);
    }.bind(this), 1000);
  }
}

