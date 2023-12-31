if (typeof firebase === 'undefined') throw new Error('hosting/init-error: Firebase SDK not detected. You must include it before /__/firebase/init.js');
var firebaseConfig = {
    apiKey: "AIzaSyDUOftiKU_v3ersofPmYU_jgAqcPOVulSQ",
    authDomain: "final-project-c28e8.firebaseapp.com",
    databaseURL: "https://final-project-c28e8-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "final-project-c28e8",
    storageBucket: "final-project-c28e8.appspot.com",
    messagingSenderId: "121493730808",
    appId: "1:121493730808:web:fe852b05ac3e74946ad20d",

};
if (firebaseConfig) {
  firebase.initializeApp(firebaseConfig);


  var firebaseEmulators = undefined;
  if (firebaseEmulators) {
    console.log("Automatically connecting Firebase SDKs to running emulators:");
    Object.keys(firebaseEmulators).forEach(function (key) {
      console.log('\t' + key + ': http://' + firebaseEmulators[key].hostAndPort);
    });

    if (firebaseEmulators.database && typeof firebase.database === 'function') {
      firebase.database().useEmulator(firebaseEmulators.database.host, firebaseEmulators.database.port);
    }

    if (firebaseEmulators.firestore && typeof firebase.firestore === 'function') {
      firebase.firestore().useEmulator(firebaseEmulators.firestore.host, firebaseEmulators.firestore.port);
    }

    if (firebaseEmulators.functions && typeof firebase.functions === 'function') {
      firebase.functions().useEmulator(firebaseEmulators.functions.host, firebaseEmulators.functions.port);
    }

    if (firebaseEmulators.auth && typeof firebase.auth === 'function') {
      // TODO: Consider using location.protocol + '//' instead (may help HTTPS).
      firebase.auth().useEmulator('http://' + firebaseEmulators.auth.hostAndPort);
    }

    if (firebaseEmulators.storage && typeof firebase.storage === 'function') {
      firebase.storage().useEmulator(firebaseEmulators.storage.host, firebaseEmulators.storage.port);
    }
  } else {
    console.log("To automatically connect the Firebase SDKs to running emulators, replace '/__/firebase/init.js' with '/__/firebase/init.js?useEmulator=true' in your index.html");
  }
}
