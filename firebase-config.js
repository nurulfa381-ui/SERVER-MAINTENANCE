/* =========================================================
   SERVER MAINTENANCE C05
   FIREBASE CONFIG + ANONYMOUS AUTHENTICATION
========================================================= */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getDatabase,
  ref,
  set,
  update,
  get,
  onValue
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


/* =========================================================
   FIREBASE PROJECT CONFIG
========================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyAfWfT-i1I_I69UbIqXHyWo3ypyCk4ncRo",
  authDomain: "server-maintenance-c7b46.firebaseapp.com",
  databaseURL:
    "https://server-maintenance-c7b46-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "server-maintenance-c7b46",
  storageBucket:
    "server-maintenance-c7b46.firebasestorage.app",
  messagingSenderId: "15629395152",
  appId:
    "1:15629395152:web:63ff0fee32004a0e2f6ad5"
};


/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

try {

  const app = initializeApp(firebaseConfig);

  const database = getDatabase(app);

  const auth = getAuth(app);


  /* =======================================================
     START FIREBASE SYNC
  ======================================================= */

  function startFirebaseSync(user) {

    if (!user) {
      console.warn(
        "Firebase Auth: pengguna belum disahkan."
      );
      return;
    }

    console.log(
      "Firebase Anonymous Auth aktif:",
      user.uid
    );


    /*
      UID disediakan secara global sekiranya
      diperlukan oleh Firebase Rules kemudian.
    */

    window.C05FirebaseAuth = {
      uid: user.uid,
      authenticated: true,
      anonymous: user.isAnonymous
    };


    if (window.FirebaseSync) {

      /*
        Elakkan FirebaseSync di-init
        berulang kali.
      */

      if (!window.FirebaseSync.enabled) {

        window.FirebaseSync.init({
          database,
          ref,
          set,
          update,
          get,
          onValue
        });

        console.log(
          "Firebase SERVER MAINTENANCE berjaya disambungkan."
        );

      }

    } else {

      console.warn(
        "firebase-sync.js belum dimuatkan."
      );

    }

  }


  /* =======================================================
     AUTH STATE LISTENER
  ======================================================= */

  onAuthStateChanged(
    auth,
    async (user) => {

      if (user) {

        /*
          Pengguna sudah mempunyai sesi
          anonymous Firebase.
        */

        startFirebaseSync(user);

        return;

      }


      /* ===================================================
         AUTO ANONYMOUS LOGIN
      =================================================== */

      try {

        console.log(
          "Firebase: memulakan Anonymous Authentication..."
        );

        const credential =
          await signInAnonymously(auth);

        startFirebaseSync(
          credential.user
        );

      } catch (authError) {

        console.error(
          "Firebase Anonymous Authentication gagal:",
          authError
        );

      }

    }
  );


} catch (error) {

  console.error(
    "Firebase gagal dimulakan:",
    error
  );

}
