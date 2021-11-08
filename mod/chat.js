const mongoose=require("mongoose")


const Chat=mongoose.Schema({
    name:{
        type: String,
      
       },
    message:{
        type: String,
       
    },
    room:{
        type:Number,
       
    }
}
    
  
)

module.exports =mongoose.model("Chats",Chat)