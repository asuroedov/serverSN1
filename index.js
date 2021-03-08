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
        socket.emit('DIALOGS:CONNECTED', [...user.messages.keys()])
    })

    socket.on('MESSAGE:SEND', async (token, toUserId, message) => {
        const payload = jwt.verify(token, JWT_KEY)
        const from = await User.findById(payload._id)

        if(from){
            const to = await User.findOne({userId: toUserId})
            to.messages.get(from.userId).push(message)
            from.messages.get(to.userId).push(message)
            await to.save()
            await from.save()

            socket.to(connections.get(toUserId)).emit('MESSAGE:NEW', to.messages.get(from.userId))
        }


    })

    socket.on('MESSAGE:GET', async (token, toUserId) => {
        const payload = jwt.verify(token, JWT_KEY)
        const from = await User.findById(payload._id)


        if(from){
            const to = await User.findOne({userId: toUserId})

            socket.emit('MESSAGE:RECEIVED', to.userId, from.messages.get(to.userId.toString()))
        }


    })


})


httpServer.listen(PORT, () => {
    console.log('server started')
})
