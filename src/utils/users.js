users=[]

// Create User
const addUser = ({ id,username,room })=>{
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if(!username || !room){
        return {
            error:"Not valid username or room"
        }
    }

    // If username already user

    const exists = users.find((user)=>{
        return user.room ===room && user.username ===username 
    })

    if(exists){
        return {
            error:"username already in use"
        }
    }
    //store user
    const user = {id,username, room}
    users.push(user)
    return {user}
}

//Remove User
const removeUser = (id)=>{
    const index = users.findIndex((user)=>{
        return user.id === id
    })
    if(index!==-1){
        return users.splice(index,1)[0]
    }
}


// Get User
const getUser = (id)=>{
    return users.find((user) => user.id === id)
}

//Get User Room
const getUserRoom = (room) =>{
    const ar = []
    users.find((user)=>{{
        if(user.room === room){
            ar.push(user)
        }
    }})
    return ar
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserRoom
}