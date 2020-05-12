var config = new Config();
var db = new Database(config.config, databaseReadyCallback);
var currentRobot = -1;
var robotNames = [];
var startDiaryTime;
var endDiaryTime;
var startFaceRenderTime;
var endFaceRenderTime;

function databaseReadyCallback() {
  var dbRef = firebase.database().ref('/');
  // dbRef.on("value", updateUserRobotInfo);

  var displayName = firebase.auth().currentUser.displayName;
  var uidDiv = document.getElementById('loginID');
  if (uidDiv) {
    uidDiv.innerHTML = displayName;
  }
  firebase
    .database()
    .ref('/users/' + displayName + '/analytics/' + Database.session)
    .on('value', function (snapshot) {
      var username =
        (snapshot.val() && snapshot.val().SessionStarted.date) || 'other';
      console.log(username);
    });
  newFaceNotification();
}

function updateUserRobotInfo(snapshot) {
  var database = snapshot.val();
  var robotListHTML = "";
  if (Database.displayName != null) {
    var userData = database.users[Database.displayName];
    if (userData != undefined)
      if (userData.currentRobot != undefined)
        currentRobot = userData.currentRobot;
    var robots = database.robots;

    robotNames = [];
    for (var i=0; i<robots.length; i++) {
      robotNames.push(robots[i].name);
      robotListHTML += "<a class='dropdown-item' href='#' onclick='setRobot(" + i + ")'>" + robots[i].name + "</a>";
    }
    
    var robotsDiv = document.getElementById("robots");
    robotsDiv.innerHTML = robotListHTML;
    
    var selectedRobotDiv = document.getElementById("selectedRobot");
    if (currentRobot == -1)
      selectedRobotDiv.innerHTML = "Select robot";
    else
      selectedRobotDiv.innerHTML = robotNames[currentRobot];
  } 
}

async function newFaceNotification() {
  var dbUserRef = firebase.database().ref('/users/');
  let total = 0;
  const snapshot = await dbUserRef.once('value');
  const userData = snapshot.val();
  Object.keys(userData).forEach((element) => {
    if (userData[element].public && userData[element].public.faces) {
      total += Object.keys(userData[element].public.faces).length;
    }
  });
  let count = 0;
  if (
    userData[Database.displayName] &&
    userData[Database.displayName].public &&
    userData[Database.displayName].public.viewedFaces
  ) {
    Object.keys(userData[Database.displayName].public.viewedFaces).forEach((elem) => {
      count += userData[Database.displayName].public.viewedFaces[elem].length;
    });
  }
  console.log('count', count, 'total', total);
  if (count !== total) {
    notification = document.getElementById('newFaceNotifContainer');
    notification.setAttribute('style', 'display: block;');
  }
}

function setRobot(robotId) {
  console.log("Setting robot: " + robotId);
  var dir = '/users/'+ (Database.uid) + "/";
  var dbRef = firebase.database().ref(dir);
  dbRef.update({currentRobot:robotId});
}

function disableButton(buttonID) {
  var button = document.getElementById(buttonID);
  button.disabled = true;
}

function enableButton(buttonID) {
  var button = document.getElementById(buttonID);
  button.disabled = false;
}

function startEditor() {
  window.location.href = "edit.html";
}

// function startDiary() {
//   window.location.href = 'diary.html';
// }

function startGallery() {
    window.location.href = 'gallery.html';
}

function startDiary() {
  sessionStorage.setItem(startDiaryTime, new Date().getTime());
  //console.log(startDiaryTime)
  window.location.href = "diary.html";
}


function doneTyping() {
  endDiaryTime = new Date().getTime() ; 
  calculateTime(sessionStorage.getItem(startDiaryTime), endDiaryTime, "diary");
  window.location.href = "index.html";
}

function closeRobot() {
  endFaceRenderTime = new Date().getTime();
  calculateTime(sessionStorage.getItem(startFaceRenderTime), endFaceRenderTime, 'faceRender');
  window.location.href = 'index.html';
}

function startVAS() {
  window.location.href = "datain_stress.html";
}

function startWebRobot() {
  sessionStorage.setItem(startFaceRenderTime, new Date().getTime());
  window.location.href = 'render-face.html';
}

function logout() {
  Database.signOut();
  window.location.href = 'signin.html';
}

function calculateTime(start, end, event) {
  var dur = (end - start) / 1000;
  var currDate = (new Date()).toDateString();
  console.log(dur);
  var dir =
    'users/' +
    firebase.auth().currentUser.displayName +
    '/' +
    event +
    '/' +
    currDate;
  var dbRef = firebase.database().ref(dir);
  dbRef.push().set({
      date: currDate,
      time_start: start,
      time_end: end,
      duration_sec: dur
    });
  console.log("Logging diary time: ----------");
}