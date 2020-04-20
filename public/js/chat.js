const socket = io()
const $form = $('#form')
const $submit = $('#formBtn')
const $MessageInput = $('#message')
const $locationBtn = $('#locationBtn')
const $displayMessage = $('#displayMessage')
// const $displayLocation = $('#displayLocation')
const $displaySidebar = $('#sidebar')

//Templates
const messageTemplate = $('#message-template').html()
const locationTemplate = $('#location-template').html()
const sidebarTemplate = $('#sidebar-template').html()

//Options
const {username, room}= Qs.parse(location.search, {ignoreQueryPrefix:true})


//AutoScroll
const autoScroll = ()=>{
    $displayMessage.scrollTop = $displayMessage.scrollHeight 
}
//Main Codes================

//Message

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        msg: message.msg,
        createdAt : moment(message.createdAt).format('hh:mm a') 
    })
    $displayMessage.before(html)
})

//Location

socket.on('locationShare',(locationMessage)=>{
    console.log(locationMessage)
    const html = Mustache.render(locationTemplate,{
        username:locationMessage.username,
        locationMessage:locationMessage.msg,
        createdAt: moment(locationMessage.createdAt).format('hh:mm a')
    })
    $displayMessage.before(html)
})

//Side Bar

socket.on('roomData',({room,users})=>{

    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    $displaySidebar.html(html)
})

$form.on('submit',(e)=>{
    e.preventDefault()
    
    // Disable the form till we get ACK
    $submit.prop("disabled", true)

    const messageContent = $('input[name="msg"]').val()
    socket.emit('sendMsg',messageContent,(error) => {

        $submit.prop("disabled", false)
        $MessageInput.val('')
        $MessageInput.focus()

        if(error){
            return console.log(error)    
        }
        console.log('message was Delivered')
    })
})

$locationBtn.on('click',()=>{

    // Disable Button till ACK
    $locationBtn.prop('disabled',true)

    navigator.geolocation.getCurrentPosition((position)=>{
        
        socket.emit('location', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error)=>{

            //Enable button again 
            $locationBtn.prop('disabled', false)

            if(error){
                return console.log('can not send the location')
            }
            console.log('location sent successfully')

        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})