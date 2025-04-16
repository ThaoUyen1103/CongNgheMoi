// Init server
import express from 'express'
import morgan from 'morgan'
import methodOverride from 'method-override'
import cors from 'cors'
import path from 'path'
import { Server } from 'socket.io'
import { createServer } from 'http'
import bodyParser from 'body-parser'
import passport from 'passport'

import passportLocal from 'passport-local'
const app = express()
const port = 3001
app.use(cors())

import route from './routes/index.js'
import db from './config/db/index.js'

// ...rest of your code
//connect to db
// db.connect()
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.set('view engine', 'ejs')
app.set('views', './src/views')

app.use(express.json({ extended: false }))

const LocalStrategy = passportLocal.Strategy

// //connect to db
// db.connect()
app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(passport.initialize())
//unlock cors
app.use((req, res, next) => {
    const origin = req.headers['origin'] || '*'
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    next()
})
app.use(methodOverride('_method'))

// HTTP logger
app.use(morgan('combined'))
//----------------------------------------------------------------
const server = createServer(app)
export const io = new Server(server, {
    cors: {
        origin: '*',
    },
})

// test socket Web
// app.get('/index', (req, res) => {
//     console.log('Đã vào')
//     // load trang index.ejs
//     res.render('index')
// })

io.on('connection', (socket) => {
    console.log('>> New socket connected:', socket.id);

    // Ghi log toàn bộ event bất kỳ để debug
    socket.onAny((event, data) => {
        console.log(`>> Socket ${socket.id} received event: "${event}" with data:`, data);
    });
    console.log('a user connected')
    socket.on('disconnect', () => {
        console.log('user disconnected')
    })

    socket.on('conversation_id', (data) => {
        socket.join(data)
        console.log('conversation_id chung là : ' + data)
    })

    // server nhận message từ client có conversation_id và gửi lại message đó cho các client khác trong conversation_id đó
    socket.on('send-message', (data) => {
        console.log('message được nhận là : ' + JSON.stringify(data))
        // // io.emit('chat message', msg)

        // Kiểm tra nếu data là mảng và lấy conversation_id từ phần tử đầu tiên
        const conversation_id = Array.isArray(data)
            ? data[0].conversation_id
            : data.conversation_id

        socket.to(conversation_id).emit('receive-message', JSON.stringify(data))
    })

    socket.on('message-recalled', (data) => {
        const conversation_id = data.conversation_id

        const messageRecall = {
            _id: data._id,
            recalled: true,
            content: 'Tin nhắn đã bị thu hồi',
            conversation_id: data.conversation_id,
        }

        io.to(conversation_id).emit('message-recalled', JSON.stringify(messageRecall))
    })
    socket.on('delete-my-message', (data) => {
        console.log('message to delete: ' + data.message_id)
        io.to(data.user_id).emit('message-deleted', data.message_id)
    })
    // socket.on('addMemberToGroup', (data) => {
    //     // Add the member to the group in your database here
    //     console.log('data đã nhận là: ', data)
    //     // Then emit an event to all clients with the new member and group info
    //     io.emit('memberAddedToGroup', data)

    //     // Emit a notification event
    //     io.emit('notification', {
    //         content: `${data} `,
    //         type: 'notify',
    //     })
    // })
})

// Routes initfbu
route(app)

db.connect()
    .then(() => {
        // const bucketname = process.env.s3_bucket
        // console.log('bucketname nhận là : ', bucketname)
        server.listen(port, () => {
            console.log(`App listening on port ${port}`)
        })
    })
    .catch((error) => {
        console.error('Failed to connect to the database', error)
    })

// server.listen(port, () => {
//     console.log(`App listening on port ${port}`)
// })
// app.listen(port, () => {
//     console.log(`App listening on port ${port}`)
// })
