/* Back-end of robot states and actions
triggered by changes in the database*/

function RobotBackend(robotId, scale, username) {
  
  RobotBackend.username = username;
  RobotBackend.robotId = robotId;
  
  RobotBackend.belly = null;
  RobotBackend.sound = null;
  RobotBackend.face = null;
  RobotBackend.runProgram = false;
  RobotBackend.programs = null;
  RobotBackend.defaultProgram = 0;

  RobotBackend.initializeAPI = function() {
    var dbRefAPI = firebase.database().ref(
      'study_users/' + username + '/robots/' + RobotBackend.robotId + '/customAPI/');
    dbRefAPI.on("value", RobotBackend.updateRobotAPI);
  }

  RobotBackend.initializeProgram = function() {
    var dbRefAPI = firebase
      .database()
      .ref('study_users/' + username + '/robots/' + RobotBackend.robotId + '/programs/');
    dbRefAPI.on('value', RobotBackend.updatePrograms);
  }

  RobotBackend.initializeFace = function() {
    RobotBackend.face = new Face();
    RobotBackend.sound = new Sound();
    
    var dbRefState = firebase.database().ref(
      'study_users/' + username + '/robots/' + RobotBackend.robotId + '/state/');
    dbRefState.on("value", Face.updateRobotFace);
    
    var dbRefActions = firebase.database().ref(
      'study_users/' + username + '/robots/' + RobotBackend.robotId + '/actions/');
    dbRefActions.on("value", RobotBackend.speakReceived);
    dbRefActions.on("value", RobotBackend.soundReceived);
  }

  RobotBackend.initializeBelly = function(resizeAxis) {
    RobotBackend.belly = new Belly(robotId, scale, resizeAxis, username);

    var dbRefState = firebase
      .database()
      .ref(
        'study_users/' +
          username +
          '/robots/' +
          RobotBackend.robotId +
          '/state/'
      );
    dbRefState.on('value', Belly.updateRobotBelly);

    // var dbRefAPI = firebase.database().ref(
    // 'study_users/' + username + '/robots/' + RobotBackend.robotId + '/customAPI/');
    // dbRefAPI.on("value", Belly.updateRobotBelly);
  }
  
  RobotBackend.resetRobotAction = function(actionName, updates) {
    var dbRef = firebase.database().ref(
      'study_users/' + username + "/robots/" + RobotBackend.robotId + "/actions/" + actionName + "/");
    dbRef.update(updates);
  }

  /* ACTIONS */

  RobotBackend.isSpeaking = false;
  RobotBackend.speakReceived = function(snapshot) {
    var robotActions = snapshot.val();
    if (robotActions.speak != undefined) {
      var sentence = robotActions.speak.text;
      if (sentence != "") {
        if (!RobotBackend.isSpeaking)
        {
          RobotBackend.isSpeaking = true;
          console.log(">>>>>>>>>   Speaking sentence " + sentence);
          Sound.speak(sentence);
          RobotBackend.resetRobotAction("speak", {text:""});
        }
      } else {
        RobotBackend.isSpeaking = false;
      }
    }
  }

  RobotBackend.isMakingSound = false;
  RobotBackend.soundReceived = function(snapshot) {
    var robotActions = snapshot.val();
    if (robotActions.sound != undefined) {
      var soundIndex = Number(robotActions.sound.index);
      if (soundIndex != -1) {
        if (!RobotBackend.isMakingSound)
        {
          if (Sound.sounds != null && Sound.sounds.length > 0) {
            if (soundIndex<0 || soundIndex>=Sound.sounds.length)
              soundIndex = 0;

            RobotBackend.isMakingSound = true;
            var soundInfo = Sound.sounds[soundIndex];
            console.log(">>>>>>>>>   Making sound " + soundInfo.name);
            Sound.makeSound(soundIndex);
            RobotBackend.resetRobotAction("sound", {index:-1});
          }
        }
      } else {
        RobotBackend.isMakingSound = false;
      }
    }
  }
  
  /* STATE CHANGES */

  RobotBackend.updateRobotAPI = function(snapshot) {
    var apiData = snapshot.val();
      
    if (RobotBackend.belly != null)
      Belly.bellyScreens = apiData.inputs.bellyScreens;

    if (RobotBackend.face != null)
      Face.faces = apiData.states.faces;

    if (RobotBackend.sound != null) {
      // Load sounds only once in the beginning
      if (Sound.sounds == null && apiData.actions!=undefined) {
        var newSounds = apiData.actions.sounds;
        if (newSounds != undefined && newSounds.length > 0)
          Sound.loadSounds(newSounds);
      }
    }
  }

  RobotBackend.updatePrograms = function(snapshot) {
    var programData = snapshot.val();
    if (RobotBackend.programs === null) {
      RobotBackend.programs = programData;
      console.log('Running program:', RobotBackend.programs.length - 1, 'on', robotId);
      runDefaultProgram(RobotBackend.programs[RobotBackend.programs.length - 1].program, robotId);
    }
  }
}


