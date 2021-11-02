const express = require("express");
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

//run when client connects
io.on("connection", (socket) => {
 
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    //welcome to user
    socket.emit("message", formatMessage("ChanduBote", "Welcome to ChatChrod"));

    // broadcast when user connects
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

  //listen on chat msg
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", formatMessage(user.username, msg));
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
const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`server running on port ${PORT}`));
