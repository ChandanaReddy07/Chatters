const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const usersList = document.getElementById('users');

const { username, room } =Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);

  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on("output",(data_room)=>{
 

  let {data,room}=data_room;
  console.log("room",room)

  if(data.length){
    for(var x = 0;x < data.length;x++){
        // Build out message div

        if(data[x].room===room){
        console.log("data name",data[x])
        const div = document.createElement("div");
        div.classList.add("message");
        div.innerHTML = `<p class="meta">${data[x].name}</p>
          <p class="text">
              ${data[x].message}
          </p>`;
        document.querySelector(".chat-messages").appendChild(div);
        }
    }
}
  
})

// Join chatroom
socket.emit("joinRoom", { username, room });

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  socket.emit("chatMessage", msg);
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Output message
function outputMessage(data) {
 
      const div = document.createElement("div");
      div.classList.add("message");
      div.innerHTML = `<p class="meta">${data.username} <span>${data.time}</span></p>
        <p class="text">
            ${data.text}
        </p>`;
      document.querySelector(".chat-messages").appendChild(div);
   
}

// Add roomname
function outputRoomName(room) {
  roomName.innerHTML = room;
}

// Add users
function outputUsers(users) {
  usersList.innerHTML = `
        ${users.map((user) => `<li>${user.username}</li>`).join("")}
    `;
}


//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});