import { Server } from 'socket.io'
import express from 'express'
import { createServer } from 'http'

import cors from 'cors'
const app = express()

app.use(cors())
const server = createServer(app)
export const io = new Server(server, {
    cors: {
        origin: '*',
    },
})

io.on('connection', (socket) => {
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
        console.log('message-recalled được nhận là : ' + JSON.stringify(data))
        // // io.emit('chat message', msg)

        // Kiểm tra nếu data là mảng và lấy conversation_id từ phần tử đầu tiên
        const conversation_id = data.conversation_id

        io.to(conversation_id).emit('message-recalled', JSON.stringify(data))
    })
    socket.on('delete-my-message', (data) => {
        console.log('message to delete: ' + data.message_id)
        io.to(data.user_id).emit('message-deleted', data.message_id)
    })

    // socket.on('forward-message', (data) => {
    //     const { original_message, from_user_id, to_conversations } = data
    
    //     to_conversations.forEach((conversation_id) => {
    //         const forwardedMessage = {
    //             ...original_message,
    //             conversation_id,
    //             from_user_id,
    //             forwarded: true,
    //             forwarded_at: new Date(),
    //         }
    
    //         io.to(conversation_id).emit('receive-message', JSON.stringify(forwardedMessage))
    //     })
    // })
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