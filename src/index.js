const path = require('path')
const http = require('http')
const express = require('express')
const socketio =require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const {createMessage} = require('./utils/time')
const {addUser, removeUser, getUser, getUserRoom} = require('./utils/users')


const port = process.env.PORT || 3000
const publicDir = path.join(__dirname,'../public')

app.use(express.static(publicDir))
let msg='WELCOME!'

io.on('connection',(socket)=>{
    console.log('new client websocket')

    //Start - Welcome the use
    socket.on('join',(options, callback)=>{
        const {error, user} = addUser({id: socket.id, ...options})

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message',createMessage("Welcome!"))             // To self client
        socket.to(user.room).broadcast.emit('message',createMessage(user.username,`${user.username} Has joined`))        // To all clients except self
        
        io.to(user.room).emit("roomData",{
            room:user.room,
            users: getUserRoom(user.room)
        })
        
        callback()

    })


    // Message sending
    socket.on('sendMsg',(messageContent,callback)=>{
        const filter = new Filter()

        if(filter.isProfane(messageContent)){
            return callback("Profanity is not allowed")
        }
        const user = getUser(socket.id)
        if(user){
            io.to(user.room).emit('message',createMessage(user.username,messageContent))         // To all clients including self
            callback()
        }
    })

    // Location

    socket.on('location',(position,callback)=>{

        const user = getUser(socket.id)
        if(user){
            io.to(user.room).emit('locationShare',createMessage(user.username, `https://google.com/maps?q=${position.latitude},${position.longitude}`))
            callback()
        }
    })

    // Disconnect
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit("message",createMessage(user.username,`${user.username} has left`))    
            io.to(user.room).emit("roomData",{
                room:user.room,
                users:getUserRoom(user.room)
            })

        }
    })
})

server.listen(port, ()=>{
    console.log(`Logged in ${port}!`);
})
