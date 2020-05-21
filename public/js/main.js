'use strict';

// Get Collections in DB
function getCollections(){
  $.ajax({url: "https://us-central1-sarcon-chat.cloudfunctions.net/dblist", 
    success: function(result){
      console.log(result);
      afterCollections(result);
  },
  error: function(error){
    console.log("DB Fetch Error ",error);
  }
});
}

function afterCollections(result){
  var collection = [];
  var filteredCollection = [];
  var currentUser =  [];
  var otherUser = [];

  for(var i = 0 ; i< Object.keys(result).length; i++){
    console.log("Pushing ",result[i]);
    collection.push(result[i]);
  }
  var res = collection;
  res.forEach(function(key){
    if(checkCol(key)){
      console.log("After Filter", key);
      filteredCollection.push(key);
    }
  });
  filteredCollection.forEach(function(key){
    console.log("Filtered Collection ",key);
    currentUser.push(getUseridField(key));
    otherUser.push(getUsernameField(key));
  });
  if(currentUser.length == otherUser.length){
    for(var i = 0; i<currentUser.length; i++){
      console.log("Value in currentUser ",currentUser[i]);
      console.log("Value in otherUser ",otherUser[i]);
    }
  }
  if(filteredCollection.length == otherUser.length)
    for(var i = 0; i<filteredCollection.length; i++)
      listDM(filteredCollection[i],otherUser[i]);
  //   filteredCollection.forEach(function (col){
  //     listDM(col,otherUser);
  //  });
  
}

var DM_TEMPLATE =
    '<a href="#id=1" class="list-group-item list-group-item-action active text-white rounded-0 list-1" onclick="showMessage()">' +
      '<div class=" media">' +
        '<img src="https://img.icons8.com/material-rounded/45/000000/chat.png" class="rounded-circle mt-3" />' +
        '<div class="media-body ml-4">' +
          '<div class="d-flex align-items-center justify-content-between mb-1">' +
            '<h6 class="mb-0" id="user-name"></h6>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</a>';

// Function to create DM Chats
function createAndInsertDM(id,timestamp){
  const container = document.createElement('div');
  container.innerHTML = DM_TEMPLATE;
  const div = container.firstChild;
  div.setAttribute('id', id);
    // figure out where to insert new message
    const existingMessages = DMChatsListElement.children;
    if (existingMessages.length === 0) {
      DMChatsListElement.appendChild(div);
    } else {
      let messageListNode = existingMessages[0];
  
      DMChatsListElement.insertBefore(div, messageListNode);
    }
  
    return div;
}

// Delete a DM from the UI.
function deleteDM(id) {
  var div = document.getElementById(id);
  // If an element for that message exists we delete it.
  if (div) {
    div.parentNode.removeChild(div);
  }
}

// Get list of DM
function listDM(col,otherUser){
  firebase.firestore().collection(col)
  .get()
  .then(function(doc){
    displayDM(doc.id,otherUser);
  });
}

// Call the Polling function every 5 seconds
window.setInterval(function(){
  /// call your function here
  getCollections();
}, 30000);

// Call the Polling function every 5 seconds 
window.setInterval(function(){
  /// call your function here
  polling(location.hash);
}, 30000);

// Call the listOnlineUsers function every 10 seconds
window.setInterval(function(){
  /// call your function here
  listOnlineUsers(location.hash);
}, 30000);

// Filter only DM chats
function checkCol(collect) {
  if(collect.includes("messagesZeZ")) {
    var colStrip = collect.replace('messagesZeZ','');
    var usernameRemoved = colStrip.split('$')[0];
    var colSplit = colStrip.split("x");
    if(colSplit[0]=='4329' || colSplit[1]=='4329')
        return true;
  }
  return false;
}

// Get other User Name
function getUsernameField(collect) {
  var currentUser = 'Kumar';
  var colStrip = collect.replace('messagesZeZ','');
  var usernameRemoved = colStrip.split('$');
  if(usernameRemoved[1]== currentUser)
      return usernameRemoved[2];
  else
      return usernameRemoved[1];
}

// Split User ID of current user 
function getUseridField(collect) {
  var currentId = '4313';
  var colStrip = collect.replace('messagesZeZ','');
  var usernameRemoved = colStrip.split('$')[0];
  var colSplit = usernameRemoved.split("x");
  if(colSplit[0]==currentId)
      return colSplit[1];
  else
      return colSplit[0];
}

// Get list of online users
function listOnlineUsers(room_id){
  var query = firebase.firestore().collection(room_id);
      // Start listening to the query.
      query.onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
          // console.log("Timestamp ",change.doc.data().timestamp.seconds);
          var time = change.doc.data().timestamp.seconds * 1000;
          if (change.type === 'removed' || Date.now() - time  > 300000) {
            deleteOnlineUser(change.doc.id);
          } else {
           displayOnlineUsers(change.doc.id,change.doc);
          }
        });
      });
}

function generateDM(div,otherUser){
  var usernameElement = div.querySelector("#user-name");
  usernameElement.innerHTML = otherUser;
}

function displayDM(id,otherUser){
  var div = document.getElementById(id) || createAndInsertDM(id);
  generateDM(div,otherUser);
}

// Delete a Message from the UI.
function deleteOnlineUser(id) {
  var div = document.getElementById(id);
  // If an element for that message exists we delete it.
  if (div) {
    div.parentNode.removeChild(div);
  }
}

var ONLINE_USER_TEMPLATE = 
      '<a class="list-group-item list-group-item-action active text-white rounded-0">' +
        '<div class="media">' +
          '<img src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg" alt="user" width="50" class="rounded-circle">' +
          '<div class="media-body ml-4">' +
            '<div class="d-flex align-items-center justify-content-between mb-1">' +
              '<h6 class="mb-0" id="username">Jason Doe</h6><small class="small font-weight-bold">' +
                '<img src="https://img.icons8.com/metro/20/000000/online.png" />' +
              '</small>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</a>';

      function createAndInsertOnlineUsers(id) {
        const container = document.createElement('div');
        container.innerHTML = ONLINE_USER_TEMPLATE;
        const div = container.firstChild;
        div.setAttribute('id',id)

        // figure out where to insert new message
        const existingMessages = onlineUsersListElement.children;
        if (existingMessages.length === 0) {
          onlineUsersListElement.appendChild(div);
        } else {
          let messageListNode = existingMessages[0];     
          onlineUsersListElement.insertBefore(div, messageListNode);
        }
        return div;
      }

function generateOnlineUsers(div,doc){
  var usernameElement = div.querySelector("#username");
  usernameElement.innerHTML = doc.get("username");
}

function displayOnlineUsers(id,doc){
  var div = document.getElementById(id) || createAndInsertOnlineUsers(id);
  generateOnlineUsers(div,doc);
}

// Checks whether the user is online
function isOnline(){
  if(location.hash == ''){
    console.log("User is new");
    alert("Click a chat");
  }else if(event.oldURL != event.newURL){
    updateUserState(location.hash);
    if(!localStorage.getItem('oldHash'))
      localStorage.setItem('oldHash',location.hash);
    else{
      deleteUserState(localStorage.getItem('oldHash'));
      localStorage.setItem('oldHash',location.hash);
    }
  }
  else if(event == undefined){
    updateUserState(location.hash);
    console.log("Event is undefined");
  }

}

function polling(room_id){
  firebase.firestore().collection(room_id).where("user_id", "==", getUserId())
  .get()
  .then(function(querySnapshot){
    console.log("User Found... Now Polling");
    querySnapshot.forEach(function(doc){
      // console.log("Doc ID ",doc.id);
      // console.log("Doc Data ",doc.data());
      firebase.firestore().collection(room_id).doc(doc.id).update({
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(function(){
        console.log("Polling Update Successful");
      })
      .catch(function(error){
        console.log("Polling  Update Error ", error);
      });
    })
  })
  .catch(function(error){
    console.log("Polling Error. User not found ", error);
  });
}


// Delets the user online state from firebase
function deleteUserState(room_id){
  firebase.firestore().collection(room_id).where("user_id", "==", getUserId())
  .get()
  .then(function(querySnapshot){
    console.log("Delete Item found");
    querySnapshot.forEach(function(docu){
      console.log(docu.id);
      firebase.firestore().collection(room_id).doc(docu.id).delete().then(function() {
        console.log("Document successfully deleted!");
    }).catch(function(error) {
        console.error("Error removing document: ", error);
    });
    })
  })
}

// Updates the state of the user in Firebase
function updateUserState(room_id){
  firebase.firestore().collection(room_id).where("user_id", "==", getUserId())
  .get()
  .then(function(querySnapshot){
    console.log("User Found. Updating values");
    console.log(doc.length);
    querySnapshot.forEach(function(doc) {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
  })
})
.catch(function(error){
  console.log("User Not found. Creating new value");
  firebase.firestore().collection(room_id).add({
    user_id: getUserId(),
    username: getUserName(),
    status: "active",
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  })
  .catch(function(error){
    console.log("Error in creating ",error);
  });
});
}

// Returns Signed In Username
function getUserName(){
    //Change this to the username that is in Laravel
    return "Sarvesh";
}

// Checks whether user is Signed In
function isUserSignedIn(){
    // Returning true for testing puposes.
    return true;
}

// Returns User ID of user signed in
function getUserId(){
  return '12345';
}
// Returns the signed-in user's profile Pic URL.
function getProfilePicUrl() {
    return 'https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg';
}

// Saves a new message on the Firebase DB.
function saveMessage(messageText) {
    // Push a new message to Firebase.
    return firebase.firestore().collection('messages').add({
      user_id : getUserId(),
      name: getUserName(),
      text: messageText,
      profilePicUrl: getProfilePicUrl(),
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(function(error) {
      console.error('Error writing new message to database', error);
    });
}

// Loads chat messages history and listens for upcoming ones.
function loadMessages() {
    // TODO 8: Load and listens for new messages.
    var query = firebase.firestore()
                    .collection('messages')
                    .orderBy('timestamp', 'desc')
                    .limit(12);
    
    // Start listening to the query.
    query.onSnapshot(function(snapshot) {
      snapshot.docChanges().forEach(function(change) {
        if (change.type === 'removed') {
          deleteMessage(change.doc.id);
        } else {
          var message = change.doc.data();
          displayMessage(change.doc.id, message.timestamp, message.name, message.user_id,
                         message.text, message.profilePicUrl, message.imageUrl);
        }
      });
    });
}

// Saves the messaging device token to the datastore.
function saveMessagingDeviceToken() {
    // TODO 10: Save the device token in the realtime datastore
    firebase.messaging().getToken().then(function(currentToken) {
      if (currentToken) {
        console.log('Got FCM device token:', currentToken);
        // Saving the Device Token to the datastore.
        firebase.firestore().collection('fcmTokens').doc(currentToken)
            .set({uid: firebase.auth().currentUser.uid});
      } else {
        // Need to request permissions to show notifications.
        requestNotificationsPermissions();
      }
    }).catch(function(error){
      console.error('Unable to get messaging token.', error);
    });
}
  
// Requests permissions to show notifications.
function requestNotificationsPermissions() {
  // TODO 11: Request permissions to send notifications.
    console.log('Requesting notifications permission...');
    firebase.messaging().requestPermission().then(function() {
      // Notification permission granted.
      saveMessagingDeviceToken();
    }).catch(function(error) {
      console.error('Unable to get permission to notify.', error);
    });
}

// Triggered when the send new message form is submitted.
function onMessageFormSubmit(e) {
    e.preventDefault();
    // Check that the user entered a message and is signed in.
    if (messageInputElement.value) {
      saveMessage(messageInputElement.value).then(function() {
        // Clear message text field and re-enable the SEND button.
        messageInputElement.value = "";
        toggleButton();
      });
    }
}

// Template for messages.
// Sender Message Template
var MESSAGE_TEMPLATE =
    '<div class="media w-50 ml-auto mb-3">' +
      '<div class="media-body">' +
        '<div class="bg-danger rounded receiver py-2 px-3 mb-2">' +
          '<p class="text-small mb-0 text-white text_message"></p></div><p class="small text-muted time"></p>' +
    '</div></div>';

// Receiver Message Template
var MESSAGE_TEMPLATE2 = 
    '<div class="media w-50 mb-3">' +
      '<img src="" alt="user" width="50" class="rounded-circle pic">' +
      '<div class="media-body ml-3">' +
        '<div class="chat-username rounded mb-2">'+
          '<p class="text-small mb-0 text-white user_name"></p>' +  //Added class user_name for displaying name of sender
        '</div>' +
        '<div class="bg-white rounded py-2 px-3 mb-2">' +
          '<p class="text-small mb-0 text-muted text_message"></p></div><p class="small text-muted time"></p>' +  //Added class text_message for displaying the message
      '</div>' +
    '</div>';

// A loading image URL.
var LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a';

// Delete a Message from the UI.
function deleteMessage(id) {
    var div = document.getElementById(id);
    // If an element for that message exists we delete it.
    if (div) {
      div.parentNode.removeChild(div);
    }
}

function createAndInsertMessage(id, timestamp,flag = 0) {
    const container = document.createElement('div');
    if(flag == 0)
      container.innerHTML = MESSAGE_TEMPLATE;
    else
      container.innerHTML = MESSAGE_TEMPLATE2;
    const div = container.firstChild;
    div.setAttribute('id', id);
  
    // If timestamp is null, assume we've gotten a brand new message.
    // https://stackoverflow.com/a/47781432/4816918
    timestamp = timestamp ? timestamp.toMillis() : Date.now();
    div.setAttribute('timestamp', timestamp);
  
    // figure out where to insert new message
    const existingMessages = messageListElement.children;
    if (existingMessages.length === 0) {
      messageListElement.appendChild(div);
    } else {
      let messageListNode = existingMessages[0];
  
      while (messageListNode) {
        const messageListNodeTime = messageListNode.getAttribute('timestamp');
  
        if (!messageListNodeTime) {
          throw new Error(
            `Child ${messageListNode.id} has no 'timestamp' attribute`
          );
        }
  
        if (messageListNodeTime > timestamp) {
          break;
        }
  
        messageListNode = messageListNode.nextSibling;
      }
  
      messageListElement.insertBefore(div, messageListNode);
    }
  
    return div;
  }
  
function generate(id, timestamp, name, user_id, text, picUrl, imageUrl, div){
  // profile picture
  if (picUrl) {
    // div.querySelector('.pic').style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(picUrl) + ')';
    if(div.querySelector('.pic'))
      div.querySelector('.pic').src = picUrl;
  }

  // div.querySelector('.name').textContent = name;
    var messageElement = div.querySelector('.text_message');
    var timeElement = div.querySelector('.time');
    var usernameElement = div.querySelector('.chat-username');
  
    if (text) { // If the message is text.
      if(usernameElement)
        usernameElement.textContent = name;
      messageElement.textContent = text;
      // Replace all line breaks by <br>.
      messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
      console.log("Timestamp Value: ",timestamp);
      var date = new Date(timestamp.seconds*1000);
      var hours = date.getHours();
      var minutes = date.getMinutes();
      timeElement.innerHTML = date.getDate() + " " + date.getMonth() + " " + date.getFullYear() + " | " + hours + " : " + minutes;
    } else if (imageUrl) { // If the message is an image.
      var image = document.createElement('img');
      image.addEventListener('load', function() {
        messageListElement.scrollTop = messageListElement.scrollHeight;
      });
      image.src = imageUrl + '&' + new Date().getTime();
      messageElement.innerHTML = '';
      messageElement.appendChild(image);
    }
    // Show the card fading-in and scroll to view the new message.
    setTimeout(function() {div.classList.add('visible')}, 1);
    messageListElement.scrollTop = messageListElement.scrollHeight;
    messageInputElement.focus();
}


  // Displays a Message in the UI.
  function displayMessage(id, timestamp, name, user_id, text, picUrl, imageUrl) {
    if(user_id == getUserId()){
    var div = document.getElementById(id) || createAndInsertMessage(id, timestamp);
    console.log("Timestamp Display ",timestamp);
    generate(id, timestamp, name, user_id, text, picUrl, imageUrl, div);
    }else{
      var div = document.getElementById(id) || createAndInsertMessage(id, timestamp, 1);
      generate(id, timestamp, name, user_id, text, picUrl, imageUrl, div);
    }

  }
  
  // Enables or disables the submit button depending on the values of the input
  // fields.
  function toggleButton() {
    if (messageInputElement.value) {
      submitButtonElement.removeAttribute('disabled');
    } else {
      submitButtonElement.setAttribute('disabled', 'true');
    }
  }
  
  // Checks that the Firebase SDK has been correctly setup and configured.
  function checkSetup() {
    if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
      window.alert('You have not configured and imported the Firebase SDK. ' +
          'Make sure you go through the codelab setup instructions and make ' +
          'sure you are running the codelab using `firebase serve`');
    }
  }
  
  // Checks that Firebase has been imported.
  checkSetup();

// Shortcuts to DOM Elements.
var messageListElement = document.getElementById('list-messages');
var messageFormElement = document.getElementById('message-type-box');
var messageInputElement = document.getElementById('message-input');
var submitButtonElement = document.getElementById('button-addon2');
var userPicElement = document.getElementById('user-pic');
var onlineUsersListElement = document.getElementById('online-users-list');
var DMChatsListElement = document.getElementById('dm-chats-list');

// Saves message on form submit.
messageFormElement.addEventListener('submit', onMessageFormSubmit);

// Toggle for the button.
messageInputElement.addEventListener('keyup', toggleButton);
messageInputElement.addEventListener('change', toggleButton);

// initialize Firebase
// initFirebaseAuth();

// TODO: Enable Firebase Performance Monitoring.
firebase.performance();

// Get List of collections in DB
getCollections();

// We load currently existing chat messages and listen to new ones.
loadMessages();

isOnline();