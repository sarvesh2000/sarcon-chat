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

// Sends a notifications to all users when a new message is posted.
exports.sendNotifications = functions.firestore.document('messages/{messageId}').onCreate(
    async (snapshot) => {
      // Notification details.
      const text = snapshot.data().text;
      const payload = {
        notification: {
          title: `${snapshot.data().name} posted ${text ? 'a message' : 'an image'}`,
          body: text ? (text.length <= 100 ? text : text.substring(0, 97) + '...') : '',
          icon: snapshot.data().profilePicUrl || '/images/profile_placeholder.png',
          click_action: `https://${process.env.GCLOUD_PROJECT}.firebaseapp.com`,
        }
      };
  
      // Get the list of device tokens.
      const allTokens = await admin.firestore().collection('fcmTokens').get();
      const tokens = [];
      allTokens.forEach((tokenDoc) => {
        tokens.push(tokenDoc.id);
      });
  
      if (tokens.length > 0) {
        // Send notifications to all tokens.
        const response = await admin.messaging().sendToDevice(tokens, payload);
        await cleanupTokens(response, tokens);
        console.log('Notifications have been sent and tokens cleaned up.');
      }
    });
// Cleans up the tokens that are no longer valid.
function cleanupTokens(response, tokens) {
    // For each notification we check if there was an error.
    const tokensDelete = [];
    response.results.forEach((result, index) => {
      const error = result.error;
      if (error) {
        console.error('Failure sending notification to', tokens[index], error);
        // Cleanup the tokens who are not registered anymore.
        if (error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered') {
          const deleteTask = admin.firestore().collection('messages').doc(tokens[index]).delete();
          tokensDelete.push(deleteTask);
        }
      }
    });
    return Promise.all(tokensDelete);
   }  