/*
 * Database class for interfacing with the Firebase realtime database
 */
function Database(config, readyCallback) {
  Database.isAnonymous = false;
  Database.uid = null;
  Database.displayName = null;
  Database.isLogging = true;

  /*
   * If somethings need to be initialized only after the database connection
   * has been established, the Database.readyCallback static variable should be
   * set to the initialization function. If it is not null, it will be called
   * when successful sign in happens.
   */
  Database.readyCallback = readyCallback;

  /*
   * Firebase configuration information obntained from the Firebase console
   */
  Database.config = config;

  /*
   * Function to initialize firebase and sign in anonymously
   */
  Database.initialize = function () {
    if (!firebase.apps.length) {
      Database.app = firebase.initializeApp(Database.config);
    } else {
      Database.app = firebase.apps[0];
    }
    firebase.auth().onAuthStateChanged(Database.handleAuthStateChange);
    Database.signInAnonymously();
  };

  /*
   * Callback function for when a library is dynamically loaded
   * Will need to wait for all libraries to be loaded before
   * initializing the database.
   */
  Database.nLibrariesLoaded = 0;
  Database.libraryLoadCallbak = function () {
    Database.nLibrariesLoaded++;
    if (Database.nLibrariesLoaded == 3) {
      Database.initialize();
    }
  };

  Database.loadJSLibrary = function (path) {
    var js = document.createElement('script');
    js.type = 'text/javascript';
    js.src = path;
    js.onreadystatechange = Database.libraryLoadCallbak;
    js.onload = Database.libraryLoadCallbak;
    document.head.appendChild(js);
  };

  Database.loadJSLibrary(
    (src = 'https://www.gstatic.com/firebasejs/6.3.0/firebase-app.js')
  );
  Database.loadJSLibrary(
    (src = 'https://www.gstatic.com/firebasejs/6.3.0/firebase-auth.js')
  );
  Database.loadJSLibrary(
    (src = 'https://www.gstatic.com/firebasejs/6.3.0/firebase-database.js')
  );

  Database.signInAnonymously = function () {
    if (Database.app === null || Database.app.auth() === null) {
      if (!window.location.href.includes('signin.html')) {
        window.location.href = 'signin.html';
      }
    }
    if (Database.displayName == null) {
      Database.app
        .auth()
        .signInAnonymously()
        .then((user) => {
          const name = Database.app.auth().currentUser.displayName;
          if (name === null && !window.location.href.includes('signin.html')) {
            window.location.href = 'signin.html';
          } else {
            Database.displayName = name;
          }
        })
        .catch(Database.handleError);
    }
  };

  Database.handleSignIn = function (callback) {
    const displayName = Database.displayName;
    var dir = 'study_users/' + displayName;
    var dbRef = firebase.database().ref(dir);
    dbRef.once('value').then(function (snapshot) {
      console.log(snapshot);
      var robot = snapshot.child('robot').val(); // If robot exists
      if (robot == null) {
        // Need to add new user information to the database
        var robotsRef = firebase.database().ref("robots");
        var robotsToCopy = [10, 21, 22, 23, 24, 25, 26, 27, 28, 11, 12]; 
        var upd = {
          name: displayName,
          robots: [],
        };
        robotsRef.once('value').then((robotSnapshot) => {
          robotSnapshot = robotSnapshot.val();
          console.log(robotSnapshot);
          robotsToCopy.forEach((index) => {
            console.log(robotSnapshot[index]);
            upd.robots.push(robotSnapshot[index]);
          });
          dbRef.update(upd, function (error) {
            if (error) {
              console.log('error', error);
            } else {
              console.log('set user data successfully');
            }
            callback();
          });
        });
      } else {
        callback();
      }
    });
  };

  Database.handleError = function (error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log('Error ' + errorCode + ': ' + errorMessage);
  };

  Database.handleAuthStateChange = function (user) {
    if (user) {
      Database.isAnonymous = user.isAnonymous;
      Database.uid = user.uid;

      if (!Database.isAnonymous) {
        console.log('Signed in as ' + user.displayName);
      } else {
        console.log('Signed in anonymously as ' + user.displayName);
        console.log('UID:', user.uid);
      }

      // Create directory in database to save this user's data
      // Database.logEvent('SessionStarted');

      if (Database.readyCallback != null || Database.readyCallback != undefined)
        Database.readyCallback();
    } else {
      console.log('User is signed out.');
    }
  };

  Database.signOut = function () {
    firebase.auth().signOut().catch(Database.handleError);
    Database.uid = null;
  };

  Database.logEvent = function (eventName, eventLog) {
    if (Database.isLogging) {
      if (eventLog == undefined) eventLog = {};
      var dir = 'users/' + Database.uid;
      var dbRef = firebase.database().ref(dir);
      var date = new Date();
      eventLog['timeStamp'] = date.getTime();
      eventLog['date'] = date.toDateString();
      eventLog['time'] = date.toTimeString();
      var newEventLog = {};
      newEventLog[eventName] = eventLog;
      dbRef.update(newEventLog);
      console.log('Logging event: ----------');
      console.log(newEventLog);
    }
  };
}
