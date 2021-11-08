const mongo=require('mongodb').MongoClient;
//const client = require('socket.io').listen(4000).sockets;
const http = require("http");
const express = require("express");
const path = require("path");
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
  } = require("./utils/users");
  

const app = express();
const server = http.createServer(app);
const client = require("socket.io");
const io = client(server);
app.use(express.static(path.join(__dirname, "public")));

//connect to mongo
mongo.connect('mongodb://127.0.0.1/mongochat',(err,db)=>{
    if(err){
        throw err;
    }
   
    
    //connect to socket.io
    console.log("mongodb connected...")
    io.on('connection',(socket)=>{



        socket.on("joinRoom", ({ username, room }) => {
            const user = userJoin(socket.id, username, room);
            socket.join(user.room);
        
              // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
              });
          });
        let chat = db.collection('chats');
      
        //create function on send status
        sendStatus = function(s){
            socket.emit('status',s);
        }

        //get chts from mongo collection
        chat.find().limit(100).sort({_id:1}).toArray((err,res)=>{
            if(err){
                throw err;
            }

            let x=user.room

            //emit the message
            socket.emit('output',{res,x});

            //handle input events
            socket.on('input',(data)=>{
                let user = getCurrentUser(socket.id);
                console.log("user",us)
                let name=user.username;
                let msg=data.message;

                //check for name and msgg
                if(name==''||msg==''){
                    //send error status
                    sendStatus('pls enter a name and msg');
                }
                else{
                    chat.insert({name:name,message:msg},()=>{
                       // console.log("data",data)
                        io.emit('output',[data]);

                        //send status object
                        sendStatus({
                            message:"Message sent",
                            clear:true
                        });

                    });
                }
            });

            //handle clear
            socket.on('clear',(data)=>{

                //remove all chats
                chat.remove({},()=>{
                    //emit cleared
                    socket.emit('cleared');
                })

            });
        })
    })

});


const port=process.env.PORT || 9000;


server.listen(port, () => console.log(`server running on port ${port}`));
