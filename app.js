const express = require("express");
const mongo=require('mongodb').MongoClient;
const path = require("path");
const http = require("http");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(server);
//Set static
app.use(express.static(path.join(__dirname, "public")));


//connect to mongo
mongo.connect('mongodb://127.0.0.1/mongochat',(err,db)=>{
    if(err){
        throw err;
    }
   
    let chat = db.collection('chats');
      
  
//run when client connects
io.on("connection", (socket) => {
 
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);



    
    chat.find().limit(100).sort({_id:1}).toArray((err,res)=>{
      if(err){
          throw err;
      }

  let data_room= {data:res,room:user.room};

    //   //emit the message
      socket.emit('output',data_room);
    })

    //broadcast when user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage("ChanduBote", `${user.username} has joined the chat`)
      );

      // Send users and room info
    io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
  });
  //welcome to user
  socket.emit("message", formatMessage("ChanduBote", `Welcome to ChattersChat ${user.username}`));

  //listen on chat msg
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    if (user) {
      chat.insert({name:user.username,message:msg,room:user.room},()=>{
        // console.log("data",data)
      io.to(user.room).emit("message", formatMessage(user.username, msg));

     });

    }
  });
  //Runs when client dissconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage("ChanduBote", `${user.username} has left te chat`)
      );
       // send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
    }
  
  });
});
})


const port=process.env.PORT || 9000;


server.listen(port, () => console.log(`server running on port ${port}`));
