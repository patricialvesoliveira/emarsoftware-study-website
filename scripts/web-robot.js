var config = new Config();
var db = new Database(config.config, initializeWebRobot);

function initializeWebRobot() {
  finalInitialize();
}

async function finalInitialize() {
  var currentRobot = 0;
  var robotParam = Config.getURLParameter('robot');
  if (robotParam != null) currentRobot = Number(robotParam);
  console.log('currentRobot: ' + currentRobot);
  var username = await firebase.auth().currentUser.displayName;
  var robot = new RobotBackend(currentRobot, 'small', username);
  RobotBackend.initializeAPI();
  RobotBackend.initializeFace();
  RobotBackend.initializeBelly('height');
  RobotBackend.initializeProgram();
}
