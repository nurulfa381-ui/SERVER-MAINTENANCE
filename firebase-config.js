import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getDatabase,
  ref,
  set,
  update,
  get,
  onValue
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAfWfT-i1I_I69UbIqXHyWo3ypyCk4ncRo",
  authDomain: "server-maintenance-c7b46.firebaseapp.com",
  databaseURL: "https://server-maintenance-c7b46-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "server-maintenance-c7b46",
  storageBucket: "server-maintenance-c7b46.firebasestorage.app",
  messagingSenderId: "15629395152",
  appId: "1:15629395152:web:63ff0fee32004a0e2f6ad5"
};

try {
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  if (window.FirebaseSync) {
    window.FirebaseSync.init({
      database,
      ref,
      set,
      update,
      get,
      onValue
    });

    console.log("Firebase SERVER MAINTENANCE berjaya disambungkan.");
  } else {
    console.warn("firebase-sync.js belum dimuatkan.");
  }
} catch (error) {
  console.error("Firebase gagal dimulakan:", error);
}
