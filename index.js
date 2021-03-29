const app = require('./app')
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {cors:{origin:"*"}});
const User = require('./models/UserModel')

const PORT = process.env.PORT ||  5000;

const jwt = require('jsonwebtoken')
const JWT_KEY = require('./keys').JWT_KEY

app.get('/', (req, res) => {
    res.status(200).json({message: 'working...'})
})

const connections = new Map() // [userId, socket.id]

io.on('connection', (socket) => {

    connections.set(socket.handshake.query.userId, socket.id)


    socket.on('DIALOGS:CONNECT', async (userId) => {
        const user = await User.findOne({userId: userId})
        if(user) socket.emit('DIALOGS:CONNECTED', [...user.messages.keys()])
    })

    socket.on('MESSAGE:SEND', async (token, toUserId, message) => {
        const payload = jwt.verify(token, JWT_KEY)
        const from = await User.findById(payload._id)



        if(from){
            const to = await User.findOne({userId: toUserId})

            if(!to.messages.has(from.userId.toString())) to.messages.set(from.userId.toString(), [])
            if(!from.messages.has(to.userId.toString())) from.messages.set(to.userId.toString(), [])

            to.messages.set(from.userId.toString(), [...to.messages.get(from.userId.toString()), {body: message, date: Date.now(), isSelf: false}])
            from.messages.set(to.userId.toString(), [...from.messages.get(to.userId.toString()), {body: message, date: Date.now(), isSelf: true}])

            await to.save()
            await from.save()


            io.to(connections.get(toUserId.toString())).emit('MESSAGE:RECEIVED', from.userId, to.messages.get(from.userId.toString()))
            io.to(connections.get(toUserId.toString())).emit('MESSAGE:NEW')
            io.to(socket.id).emit('MESSAGE:RECEIVED', to.userId, from.messages.get(to.userId.toString()))
        }


    })

    socket.on('MESSAGE:GET', async (token, toUserId) => {
        const payload = jwt.verify(token, JWT_KEY)
        const from = await User.findById(payload._id)


        if(from){
            const to = await User.findOne({userId: toUserId})

            //socket.emit('MESSAGE:RECEIVED', to.userId, from.messages.get(to.userId.toString()))
            io.to(socket.id).emit('MESSAGE:RECEIVED', to.userId, from.messages.get(to.userId.toString()))
        }


    })

    socket.on('FRIEND:WANT_ADD', async (token, toUserId) => {
        const payload = jwt.verify(token, JWT_KEY)
        const from = await User.findById(payload._id)

        if(from){
            const to = await User.findOne({userId: toUserId})

            if(!to.inFriends) to.inFriends = []
            if(!to.inFriends.includes(from.userId))
                to.inFriends = [...to.inFriends, from.userId]

            if(!from.outFriends) from.outFriends = []
            from.outFriends = [...from.outFriends, to.userId]

            await from.save()
            await to.save()


            io.to(connections.get(to.userId.toString())).emit('FRIEND:NEW', from.userId)
        }


    })

    socket.on('FRIEND:GET_IN_FRIENDS', async (token) => {
        const payload = jwt.verify(token, JWT_KEY)
        const from = await User.findById(payload._id)

        if(from){
            const friendIn = await Promise.all(from.inFriends.map(async el => await User.findOne({userId: el})))

            const resIn = []
            friendIn.forEach(u => resIn.push({userId: u.userId, login: u.login, name: u.name, photoUrl: u.photoUrl}))

            io.to(socket.id).emit('FRIEND:IN', resIn)
        }
    })

    socket.on('FRIEND:GET_OUT_FRIENDS', async (token) => {
        const payload = jwt.verify(token, JWT_KEY)
        const from = await User.findById(payload._id)


        if(from){
            const friendOut = await Promise.all(from.outFriends.map(async el => await User.findOne({userId: el})))

            const resOut = []
            friendOut.forEach(u => resOut.push({userId: u.userId, login: u.login, name: u.name, photoUrl: u.photoUrl}))

            io.to(socket.id).emit('FRIEND:OUT', resOut)
        }
    })

    socket.on('FRIEND:GET_CURRENT_FRIENDS', async (token) => {
        const payload = jwt.verify(token, JWT_KEY)
        const from = await User.findById(payload._id)


        if(from){
            const friendCurrent = await Promise.all(from.currentFriends.map(async el => await User.findOne({userId: el})))

            const resCurrent = []
            friendCurrent.forEach(u => resCurrent.push({userId: u.userId, login: u.location, name: u.name, photoUrl: u.photoUrl}))

            io.to(socket.id).emit('FRIEND:CURRENT', resCurrent)
        }
    })


})


httpServer.listen(PORT, () => {
    console.log('server started')
})
