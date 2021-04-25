const app = require('./app')
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {cors: {origin: "*"}});
const User = require('./models/UserModel')

const PORT = process.env.PORT || 5000;

const jwt = require('jsonwebtoken')
const JWT_KEY = require('./keys').JWT_KEY

app.get('/', (req, res) => {
    res.status(200).json({message: 'working...'})
})


const connections = require('./connections') // [userId, socket.id]

const observers = new Map() //userId => Set of subscribers(userId)
const notifySubscribers = (from) => {
    if (observers.has(from.userId.toString())) {
        const obs = [...observers.get(from.userId.toString())]
        obs.forEach(el => {
            io.to(connections.get(el)).emit('ONLINE:REFRESH', from.userId, from.lastSeance)
        })
    }
}

io.on('connection', (socket) => {

    connections.set(socket.handshake.query.userId, socket.id)


    socket.on('DIALOGS:CONNECT', async (userId) => {
        const user = await User.findOne({userId: userId})
        if (user) {
            socket.emit('DIALOGS:CONNECTED', [...user.messages.keys()])
            user.lastSeance = Date.now()
            await user.save()
            notifySubscribers(user)
        }
    })

    socket.on('MESSAGE:SEND', async (token, toUserId, message) => {
        const payload = jwt.verify(token, JWT_KEY)
        const from = await User.findById(payload._id)

        if (from) {

            from.lastSeance = Date.now()
            const to = await User.findOne({userId: toUserId})

            if (!to.messages.has(from.userId.toString())) to.messages.set(from.userId.toString(), [])
            if (!from.messages.has(to.userId.toString())) from.messages.set(to.userId.toString(), [])

            to.messages.set(from.userId.toString(), [...to.messages.get(from.userId.toString()), {
                body: message,
                date: Date.now(),
                isSelf: false
            }])
            from.messages.set(to.userId.toString(), [...from.messages.get(to.userId.toString()), {
                body: message,
                date: Date.now(),
                isSelf: true
            }])

            await to.save()
            await from.save()
            notifySubscribers(from)


            io.to(connections.get(toUserId.toString())).emit('MESSAGE:RECEIVED', from.userId, to.messages.get(from.userId.toString()))
            io.to(connections.get(toUserId.toString())).emit('MESSAGE:NEW')
            io.to(socket.id).emit('MESSAGE:RECEIVED', to.userId, from.messages.get(to.userId.toString()))
        }


    })

    socket.on('MESSAGE:GET', async (token, toUserId) => {
        const payload = jwt.verify(token, JWT_KEY)
        const from = await User.findById(payload._id)


        if (from) {
            from.lastSeance = Date.now()
            await from.save()
            notifySubscribers(from)
            const to = await User.findOne({userId: toUserId})

            //socket.emit('MESSAGE:RECEIVED', to.userId, from.messages.get(to.userId.toString()))
            io.to(socket.id).emit('MESSAGE:RECEIVED', to.userId, from.messages.get(to.userId.toString()))
        }


    })

    socket.on('MESSAGE:UPDATE_DIALOG_LIST', async (token) => {
        const payload = jwt.verify(token, JWT_KEY)
        const user = await User.findById(payload._id)

        if(user){
            socket.emit('DIALOGS:UPDATED', [...user.messages.keys()])
        }

    })

    socket.on('FRIEND:WANT_ADD', async (token, toUserId) => {
        const payload = jwt.verify(token, JWT_KEY)
        const from = await User.findById(payload._id)

        if (from) {
            from.lastSeance = Date.now()
            const to = await User.findOne({userId: toUserId})

            if (!to.inFriends) to.inFriends = new Map()
            if (!to.inFriends.has(from.userId.toString()))
                to.inFriends.set(from.userId.toString(), false)

            if (!from.outFriends) from.outFriends = new Map()
            if (!from.outFriends.has(to.userId.toString()))
                from.outFriends.set(to.userId.toString(), false)

            await from.save()
            notifySubscribers(from)
            await to.save()


            io.to(connections.get(to.userId.toString())).emit('FRIEND:NEW', from.userId)
        }


    })

    socket.on('FRIEND:GET_IN_FRIENDS', async (token) => {
        try {
            const payload = jwt.verify(token, JWT_KEY)
            const from = await User.findById(payload._id)

            if (from) {
                from.lastSeance = Date.now()
                await from.save()
                notifySubscribers(from)

                const friendIn = await Promise.all(Array.from(from.inFriends.keys()).map(async el => await User.findOne({userId: el})))

                const resIn = []
                friendIn.forEach(u => resIn.push({
                    userId: u.userId,
                    login: u.login,
                    name: u.name,
                    photoUrl: u.photoUrl
                }))

                io.to(socket.id).emit('FRIEND:IN', resIn)
            }
        }catch (e) {
            
        }
    })

    socket.on('FRIEND:GET_OUT_FRIENDS', async (token) => {
        try {
            const payload = jwt.verify(token, JWT_KEY)
            const from = await User.findById(payload._id)


            if (from) {
                from.lastSeance = Date.now()
                await from.save()
                notifySubscribers(from)

                const friendOut = await Promise.all(Array.from(from.outFriends.keys()).map(async el => await User.findOne({userId: el})))


                const resOut = []
                friendOut.forEach(u => resOut.push({
                    userId: u.userId,
                    login: u.login,
                    name: u.name,
                    photoUrl: u.photoUrl
                }))

                io.to(socket.id).emit('FRIEND:OUT', resOut)
            }
        }catch (e){

        }
    })

    socket.on('FRIEND:GET_CURRENT_FRIENDS', async (token) => {
        try {
            const payload = jwt.verify(token, JWT_KEY)
            const from = await User.findById(payload._id)


            if (from) {
                from.lastSeance = Date.now()
                await from.save()
                notifySubscribers(from)

                const friendCurrent = await Promise.all(Array.from(from.currentFriends.keys()).map(async el => await User.findOne({userId: el})))

                const resCurrent = []
                friendCurrent.forEach(u => resCurrent.push({
                    userId: u.userId,
                    login: u.location,
                    name: u.name,
                    photoUrl: u.photoUrl
                }))

                io.to(socket.id).emit('FRIEND:CURRENT', resCurrent)

            }
        }catch (e) {
            
        }
    })

    socket.on('FRIEND:DELETE', async (token, userId) => {
        try {
            const payload = jwt.verify(token, JWT_KEY)
            const user1 = await User.findById(payload._id)
            user1.lastSeance = Date.now()
            await user1.save()
            notifySubscribers(user1)

            const user2 = await User.findOne({userId: userId})
            if (user1 && user2) {
                io.to(connections.get(user2.userId.toString())).emit('FRIEND:DELETED')
            }

        } catch (e) {
            console.log(e)
        }
    })

    socket.on('FRIEND:SKIP', async (token, userId) => {
        try {
            const payload = jwt.verify(token, JWT_KEY)
            const user1 = await User.findById(payload._id)
            user1.lastSeance = Date.now()


            const user2 = await User.findOne({userId: userId})
            if (user1 && user2) {
                if(user1.inFriends.has(user2.userId.toString())) user1.inFriends.delete(user2.userId.toString())
                if(user1.outFriends.has(user2.userId.toString())) user1.outFriends.delete(user2.userId.toString())

                if(user2.outFriends.has(user1.userId.toString())) user2.outFriends.delete(user1.userId.toString())
                if(user2.inFriends.has(user1.userId.toString())) user2.inFriends.delete(user1.userId.toString())

                await user1.save()
                notifySubscribers(user1)
                await user2.save()

                io.to(connections.get(user2.userId.toString())).emit('FRIEND:SKIPPED')
                io.to(connections.get(user1.userId.toString())).emit('FRIEND:SKIPPED')
            }


        } catch (e) {
            console.log(e)
        }
    })

    socket.on('ONLINE:WANT_OBSERVE', async (token, userId) => {
        try {
            const payload = jwt.verify(token, JWT_KEY)
            const user1 = await User.findById(payload._id)
            const user2 = await User.findOne({userId: userId})

            if (user1 && user2) {
                const id = user2.userId.toString()

                if (!observers.has(id)) observers.set(id, new Set())
                observers.set(id, observers.get(id).add(user1.userId.toString()))
            }

            io.to(connections.get(user1.userId.toString())).emit('ONLINE:REFRESH', user2.userId, user2.lastSeance)
        }catch (e) {
            
        }
    })

    socket.on('ONLINE:STOP_OBSERVE', async (token, userId) => {
        const payload = jwt.verify(token, JWT_KEY)
        const user1 = await User.findById(payload._id)
        const user2 = await User.findOne({userId: userId})

        if (user1 && user2) {
            const id = user2.userId.toString()

            if (observers.has(id)) {
                observers.get(id).delete(user1.userId.toString())
            }
        }

    })

    socket.on('ONLINE:NOTIFY', async (token) => {
        const payload = jwt.verify(token, JWT_KEY)
        const user = await User.findById(payload._id)

        if (user) {
            const id = user.userId.toString()

            if (observers.has(id)) {
                notifySubscribers(user)
            }
        }

    })


})


httpServer.listen(PORT, () => {
    console.log('server started')
})

module.exports = io