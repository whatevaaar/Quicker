var firebaseConfig = {
  apiKey: "AIzaSyD8dArG_JyWaYnQgZ5HTVs_Wo75TfFCBzA",
  authDomain: "quicker-1602453065215.firebaseapp.com",
  databaseURL: "https://quicker-1602453065215.firebaseio.com",
  projectId: "quicker-1602453065215",
  storageBucket: "quicker-1602453065215.appspot.com",
  messagingSenderId: "44639973669",
  appId: "1:44639973669:web:7611ad1c4ab30f64fceacc",
  measurementId: "G-Q36FS6DVDZ"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

function regresarNombreDeCliente(nombre) {
  let arr = nombre.split('-')
  return arr[0].replaceAll('_', ' ');
}

function regresarIndustria(nombre) {
  let arr = nombre.split('-')
  if (!arr[1])
    return "";
  return arr[1].replaceAll('_', ' ');
}

function regresarProducto(nombre) {
  let arr = nombre.split('-')
  if (!arr[2])
    return "";
  return arr[2].replaceAll('_', ' ');
}

function regresarFecha(nombre) {
  let arr = nombre.split('-')
  if (!arr[3])
    return "";
  return arr[3].slice(0, arr[3].indexOf('.')).replaceAll('_', ' ');
}

function regresarNombreSinExtension(nombre) {
  return nombre.slice(0, nombre.indexOf('.'));
}

