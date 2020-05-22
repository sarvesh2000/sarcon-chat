
// Receiver Message Template
var NOTIFICATION_TEMPLATE = 
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

function createAndInsertMessage(id, timestamp) {
    const container = document.createElement('div');
    container.innerHTML = NOTIFICATION_TEMPLATE;
    
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

// Delete a Message from the UI.
function deleteMessage(id) {
    var div = document.getElementById(id);
    // If an element for that message exists we delete it.
    if (div) {
      div.parentNode.removeChild(div);
    }
}

// Loads chat messages history and listens for upcoming ones.
function loadMessages() {
    // TODO 8: Load and listens for new messages.
    var query = firebase.firestore()
                    .collection('notifications')
                    .orderBy('timestamp', 'desc')
                    .limit(1);
    
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

// We load currently existing chat messages and listen to new ones.
loadMessages();