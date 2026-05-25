// ===== CONFIGURAÇÃO DO FIREBASE =====
const firebaseConfig = {
  apiKey: "AIzaSyAJkxPx8tyBAlMYUhno278fRtDnNM0YDQY",
  authDomain: "aplicativo-e26c4.firebaseapp.com",
  projectId: "aplicativo-e26c4",
  storageBucket: "aplicativo-e26c4.firebasestorage.app",
  messagingSenderId: "1021089621453",
  appId: "1:1021089621453:web:a9a2a423665c18ddf11084"
};

// ✅ INICIALIZAÇÃO
firebase.initializeApp(firebaseConfig);

// ✅ VARIÁVEIS GERAIS PARA USAR EM TODAS AS PÁGINAS
const auth = firebase.auth();
const db = firebase.firestore(); 
