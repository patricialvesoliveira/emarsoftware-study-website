var config = new Config();
var db = new Database(config.config, databaseReadyCallback);
var moodSlider = document.getElementById('moodslider');
var stressSlider = document.getElementById('stressslider');
var mood = 'not changed';
var stress = 'not changed';
var date = new Date();
var dir;
var dbRef;
function databaseReadyCallback() {
  dir =
    'study_users/' +
    firebase.auth().currentUser.displayName +
    '/data/' +
    'scales' +
    '/' +
    date.toDateString(); 
  dbRef = firebase.database().ref(dir);
}

moodSlider.oninput = function () {
  mood = this.value;
};

stressSlider.oninput = function () {
  stress = this.value;
}

function backToIndexPage() {
  window.location.href = 'index.html';
}

function record() {
  if (mood === 'not changed') {
    alert('Please move the slider to indicate your mood levels.');
    return;
  } else if (stress === 'not changed') {
    alert('Please move the slider to indicate your stress levels.');
    return;
  } else {
    dir =
      'study_users/' +
      firebase.auth().currentUser.displayName +
      '/data/' +
      'scales' +
      '/' +
      date.toDateString(); 
    dbRef = firebase.database().ref(dir);
    dbRef.push().set({
      time: date.getTime(),
      scale: 'mood',
      value: this.mood,
    });
    dbRef.push().set({
      time: date.getTime(),
      scale: 'stress',
      value: this.stress,
    });
    console.log('Logging mood/stress: ----------');
    window.location.href = 'index.html';
  }
}
