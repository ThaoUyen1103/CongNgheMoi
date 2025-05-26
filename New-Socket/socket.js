import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';

const app = express();
const port = 3005;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});

//Anh thêm chỗ này á 
app.post('/api/emit-to-room', (req, res) => {
    const { room, event, payload } = req.body;

    if (!room || !event || !payload) {
        console.error('🔴 /api/emit-to-room: Thiếu tham số room, event, hoặc payload');
        return res.status(400).json({ success: false, message: 'Thiếu tham số bắt buộc.' });
    }

    console.log(`✅ Nhận lệnh emit: Event '${event}' tới Room '${room}'`);
    io.to(room).emit(event, payload);

    res.status(200).json({ success: true, message: 'Sự kiện đã được phát đi.' });
});

io.on('connection', (socket) => {
    console.log('✅ User connected to 3005:', socket.id);

    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
    });

    socket.on('join-conversation', ({ conversation_id, user_id }) => {
        if (conversation_id) {
            socket.join(conversation_id);
            console.log(`🙋 User ${user_id} joined conversation ${conversation_id}`);
        }
    });

    socket.on('send-message', (data) => {
        console.log('📩 Message received by server:', data);

        let messageData = data;
        let conversation_id;

        if (typeof data === 'string') {
            try {
                messageData = JSON.parse(data);
            } catch (err) {
                console.error('🔴 Error parsing message string:', err);
                return;
            }
        }

        if (Array.isArray(messageData)) {
            conversation_id = messageData[0]?.conversation_id;
            messageData = messageData[0];
        } else {
            conversation_id = messageData?.conversation_id;
        }

        if (!conversation_id || typeof conversation_id !== 'string') {
            console.error('🔴 Invalid conversation_id:', conversation_id);
            return;
        }

        if (!messageData || typeof messageData !== 'object' || !messageData._id || !messageData.content) {
            console.error('🔴 Invalid message data for send-message:', messageData);
            return;
        }

        console.log(`➡️ Emitting 'receive-message' to room ${conversation_id} with data:`, messageData);
        io.to(conversation_id).emit('receive-message', messageData);

        const roomClients = io.sockets.adapter.rooms.get(conversation_id);
        console.log('👥 Clients in room', conversation_id, ':', roomClients ? roomClients.size : 0);
    });

   
    // socket.on('message-recalled', (recalledMessageFromClient) => {
    //     console.log('📢 Received client-side message-recalled event with data:', recalledMessageFromClient);


    //     const message_id = recalledMessageFromClient._id;
    //     const conversation_id = recalledMessageFromClient.conversation_id;
    //     const user_id_recalled = recalledMessageFromClient.senderId;
    //     const updated_content = recalledMessageFromClient.content;
    //     const is_recalled_flag = recalledMessageFromClient.recalled;

    //     if (!message_id || !conversation_id || typeof is_recalled_flag === 'undefined') {
    //         console.error('🔴 Invalid data for message-recalled. Expected full message object from client. Received:', recalledMessageFromClient);
    //         return;
    //     }


    //     const dataToEmitToRoom = {
    //         _id: message_id,
    //         conversation_id: conversation_id,
    //         user_id_recalled: user_id_recalled,
    //         recalled: is_recalled_flag,
    //         content: updated_content,
    //         senderId: recalledMessageFromClient.senderId,

    //     };


    //     io.to(conversation_id).emit('server-message-recalled', dataToEmitToRoom);
    //     console.log(`📢 Emitted 'server-message-recalled' for message ${message_id} in conversation ${conversation_id} by user ${user_id_recalled || 'unknown'}. Data:`, dataToEmitToRoom);
    // });

    // XÓA TIN NHẮN (CHO MỌI NGƯỜI)
    socket.on('client-delete-message-for-everyone', (data) => {
        console.log('🗑️ Received client-delete-message-for-everyone:', data);
        const { message_id, conversation_id, user_id_deleted } = data; // user_id_deleted là người thực hiện xóa

        if (!message_id || !conversation_id) {
            console.error('🔴 Invalid data for client-delete-message-for-everyone. Need message_id and conversation_id.', data);
            return;
        }

        io.to(conversation_id).emit('server-message-deleted-for-everyone', {
            message_id,
            conversation_id,
            user_id_deleted
        });
        console.log(`🗑️ Message ${message_id} deleted for everyone in conversation ${conversation_id} by user ${user_id_deleted || 'unknown'}`);
    });

    // XÓA TIN NHẮN (CHỈ CHO NGƯỜI GỬI - ĐỒNG BỘ TRÊN CÁC THIẾT BỊ CỦA HỌ)
    socket.on('delete-my-message', (data) => {
        console.log('➖ Received delete-my-message (for sender only):', data);
        if (!data.message_id || !data.user_id_room) {
            console.error('🔴 Invalid data for delete-my-message. Need message_id and user_id_room.', data);
            return;
        }
        io.to(data.user_id_room).emit('message-deleted-for-me', { message_id: data.message_id });
        console.log(`➖ Sent message-deleted-for-me for message ${data.message_id} to user room ${data.user_id_room}`);
    });

    // GỬI YÊU CẦU KẾT BẠN
    socket.on('send-friend-request', (data) => {
        const { fromUserId, toUserId } = data;
        if (!fromUserId || !toUserId) {
            console.error('🔴 Invalid data for send-friend-request:', data);
            return;
        }

        io.to(toUserId).emit('receive-friend-request', {
            fromUserId,
            toUserId,
        });
        console.log(`📨 Friend request sent from ${fromUserId} to ${toUserId}`);
    });

    // THU HỒI LỜI MỜI KẾT BẠN
    socket.on('cancel-friend-request', (data) => {
        const { fromUserId, toUserId } = data;
        if (!fromUserId || !toUserId) {
            console.error('🔴 Invalid data for cancel-friend-request:', data);
            return;
        }

        io.to(toUserId).emit('friend-request-cancelled', {
            fromUserId,
            toUserId,
        });
        console.log(`↩️ Friend request cancelled from ${fromUserId} to ${toUserId}`);
    });

    // CHẤP NHẬN LỜI MỜI KẾT BẠN
    socket.on('accept-friend-request', (data) => {
        const { fromUserId, toUserId } = data;
        if (!fromUserId || !toUserId) {
            console.error('🔴 Invalid data for accept-friend-request:', data);
            return;
        }

        io.to(fromUserId).emit('friend-request-accepted', {
            fromUserId,
            toUserId,
        });
        console.log(`✅ Friend request accepted by ${toUserId} from ${fromUserId}`);
    });

    socket.on('group-event-from-backend', ({ conversation_id, event, data }) => {
        io.to(conversation_id).emit('group-event', {
            conversation_id,
            event,
            data,
        });
    });
});



io.on('error', (err) => {
    console.error('🔴 Socket.IO server error:', err);
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'Socket server is running' });
});

server.listen(port, () => {
    console.log(`🚀 Socket server is running on port ${port}`);
});

export const emitGroupEvent = (conversation_id, event, data) => {
    io.to(conversation_id).emit('group-event', {
        conversation_id,
        event,
        data,
    });
};

export { io };