import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';

const app = express();
const port = 3005;

app.use(cors({
    origin: '*', // Cho phép tất cả origin, có thể giới hạn sau
    methods: ['GET', 'POST'],
    credentials: true,
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Tạo server HTTP
const server = createServer(app);

// Khởi tạo Socket.IO với timeout và ping hợp lý
const io = new Server(server, {
    cors: {
        origin: '*', // Hoặc chỉ định cụ thể: ['http://localhost:3000', 'http://192.168.34.235']
        methods: ['GET', 'POST'],
        credentials: true,
    },
    pingTimeout: 60000, // Tăng timeout để tránh ngắt kết nối sớm
    pingInterval: 25000,
});

io.on('connection', (socket) => {
    console.log('a user connected 3005:', socket.id);

    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
    });

    socket.on('conversation_id', (data) => {
        socket.join(data);
        console.log('conversation_id chung là:', data);
    });

    socket.on('send-message', (data) => {
        console.log('message được nhận là:', data);

        let messageData = data;
        let conversation_id;

        // Chuẩn hóa dữ liệu
        if (typeof data === 'string') {
            try {
                messageData = JSON.parse(data);
                console.log('Parsed messageData:', messageData);
            } catch (err) {
                console.error('Lỗi parse message:', err);
                return;
            }
        }

        // Xử lý conversation_id
        if (Array.isArray(messageData)) {
            console.log('data là mảng');
            conversation_id = messageData[0]?.conversation_id;
            messageData = messageData[0];
        } else {
            console.log('data không phải mảng');
            conversation_id = messageData.conversation_id;
        }

        // Kiểm tra dữ liệu hợp lệ
        if (!conversation_id || typeof conversation_id !== 'string') {
            console.error('conversation_id không hợp lệ:', conversation_id);
            return;
        }

        if (!messageData || typeof messageData !== 'object' || !messageData._id || !messageData.content) {
            console.error('Dữ liệu tin nhắn không hợp lệ:', messageData);
            return;
        }

        // Log trước khi emit
        console.log('Dữ liệu trước khi emit:', JSON.stringify(messageData, null, 2));

        // Gửi object trực tiếp
        io.to(conversation_id).emit('receive-message', messageData);
        console.log('Sending message to room:', conversation_id);

        // Log số lượng client trong room
        const roomClients = io.sockets.adapter.rooms.get(conversation_id);
        console.log('Clients in room', conversation_id, ':', roomClients ? roomClients.size : 0);
    });

    socket.on('message-recalled', (data) => {
        console.log('message-recalled được nhận là:', data);

        let recalledData = data;
        let conversation_id;

        // Chuẩn hóa dữ liệu
        if (typeof data === 'string') {
            try {
                recalledData = JSON.parse(data);
                console.log('Parsed recalledData:', recalledData);
            } catch (err) {
                console.error('Lỗi parse recalled data:', err);
                return;
            }
        }

        conversation_id = recalledData.conversation_id;
        if (!conversation_id || typeof conversation_id !== 'string') {
            console.error('conversation_id không hợp lệ:', conversation_id);
            return;
        }

        // Tạo object recalled hợp lệ
        const messageRecall = {
            _id: recalledData._id || recalledData.message_id,
            recalled: true,
            content: 'Tin nhắn đã bị thu hồi',
            conversation_id: conversation_id,
        };

        if (!messageRecall._id) {
            console.error('message_id không hợp lệ:', recalledData);
            return;
        }

        // Gửi object trực tiếp
        io.to(conversation_id).emit('message-recalled', messageRecall);
        console.log('Sending recalled message to room:', conversation_id);
    });

    socket.on('delete-my-message', (data) => {
        console.log('message to delete:', data.message_id);
        if (!data.message_id || !data.user_id) {
            console.error('Dữ liệu xóa tin nhắn không hợp lệ:', data);
            return;
        }
        io.to(data.user_id).emit('message-deleted', data.message_id);
        console.log('Sent delete message to user:', data.user_id);
    });
});

// Xử lý lỗi server
io.on('error', (err) => {
    console.error('Socket.IO error:', err);
});

// Endpoint kiểm tra server
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'Socket server is running' });
});

server.listen(port, () => {
    console.log(`Socket server is running on port ${port}`);
});