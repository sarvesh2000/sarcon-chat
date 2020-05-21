const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

const {Firestore} = require('@google-cloud/firestore');

// Create a new client
const firestore = new Firestore();

exports.dblist = functions.https.onRequest((request, response) =>{
    var collect = [];
    firestore.listCollections().then(collections => {
        for (let collection of collections) {
          console.log(`Found collection with id: ${collection.id}`);
          collect.push(collection.id);
        }
        response.set('Cache-Control','public, max-age=300, s-maxage=600');
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.header("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
        response.header("Access-Control-Max-Age", "3600");
        response.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    response.send(Object.assign({}, collect));
    return "Success";
    })
    .catch(error => {
        response.send("Error Occurred "+ error);
    });
    
    for (let i in collect)
        console.log('items in collect',i);
});
