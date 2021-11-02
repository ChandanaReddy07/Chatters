const chatForm=document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName=document.getElementById('room-name');
const userList=document.getElementById('users')

//get username and room from URL
const {username,room}=Qs.parse(location.search,{
  ignoreQueryPrefix: true
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });


console.log(username,room);



//get room and user
socket.on('roomUsers',({room,users})=>{
  outputRoomName(room);
  outputUsers(users);
})


//Message submit
socket.on('message',message=>{
   console.log(message);
   outputMessage(message);

   //scroll down
   chatMessages.scrollTop = chatMessages.scrollHeight;

 });


chatForm.addEventListener('submit',(e)=>{
   e.preventDefault();

   //Get message text
   const msg = e.target.elements.msg.value;

   console.log(msg);
   // Emit message to server
   socket.emit('chatMessage',msg);

   //clear input
   e.target.elements.msg
 });

//Output message to DOM 
function outputMessage(message){
 
    const div= document.createElement('div');
    div.classList.add('message');
    div.innerHTML=`<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">
    ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//add roomname to DOM
function outputRoomName(room){
  roomName.innerText=room;

}

//add users to DOM
function outputUsers(users){
  userList.innerHTML=`
  ${users.map(user=>`<li>${user.username}</li>`).join('')}
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