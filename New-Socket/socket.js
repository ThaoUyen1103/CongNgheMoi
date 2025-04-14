import express from 'express';
import cors from 'cors';
import path from 'path';
import { Server } from 'socket.io';
import { createServer } from 'http';

const app = express();
const port = 3005;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const server = createServer(app);
export const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

io.on('connection', (socket) => {
    console.log('a user connected 3005');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('conversation_id', (data) => {
        socket.join(data);
        console.log('conversation_id chung là : ' + data);
    });

    socket.on('send-message', (data) => {
        console.log('message được nhận là : ' + JSON.stringify(data));

        let conversation_id;

        if (Array.isArray(data)) {
            console.log('data là mảng');
            conversation_id = data[0].conversation_id;
        } else {
            console.log('data không phải mảng');
            conversation_id = data.conversation_id;
        }

        if (typeof conversation_id === 'object' && conversation_id !== null) {
            conversation_id = conversation_id._id;
        }

        // Gửi đến tất cả client trong room, bao gồm cả client gửi
        io.to(conversation_id).emit('receive-message', JSON.stringify(data));
        console.log('Sending message to room: ' + conversation_id);
    });

    socket.on('message-recalled', (data) => {
        console.log('message-recalled được nhận là : ' + JSON.stringify(data));
        const conversation_id = data.conversation_id;
        io.to(conversation_id).emit('message-recalled', JSON.stringify(data));
    });

    socket.on('delete-my-message', (data) => {
        console.log('message to delete: ' + data.message_id);
        io.to(data.user_id).emit('message-deleted', data.message_id);
    });

    socket.on('notification', (data) => {
        console.log('notification được nhận là : ' + JSON.stringify(data));
        io.emit('notification', data);
        console.log('Sending notification to all clients');
    });

    socket.on('last-message', (data) => {
        console.log('last-message được nhận là : ' + JSON.stringify(data));
        io.emit('last-message', data);
        console.log('Sending last-message to all clients');
    });

    socket.on('conversation-group', (data) => {
        console.log('conversation-group được nhận là : ' + JSON.stringify(data));
        io.emit('new-conversation', data);
        console.log('Sending conversation-group to all clients');
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});