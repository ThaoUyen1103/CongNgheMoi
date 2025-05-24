import express from 'express'
const router = express.Router()
import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

import conversationController from '../app/controllers/ConversationController.js'
//  Web--------------------------

// router.post('/create', conversationController.create)
// http://localhost:3000/conversation/createConversationsGroupWeb
router.post(
    '/createConversationsWeb',
    conversationController.createConversationsWeb
)
router.post(
    '/createConversationsGroupWeb',
    conversationController.createConversationsGroupWeb
)
// viết 1 hàm lấy conversation_id từ friend_id và user_id
router.post(
    '/getConversationIDWeb',
    conversationController.getConversationIDWeb
)
// thêm thành viên vào nhóm
router.post(
    '/addMemberToConversationGroupWeb',
    conversationController.addMemberToConversationGroupWeb
)
// xoá thành viên khỏi nhóm
router.post(
    '/removeMemberFromConversationGroupWeb',
    conversationController.removeMemberFromConversationGroupWeb
)
// gán quyền phóng nhóm cho thành viên
router.post(
    '/authorizeDeputyLeaderWeb',
    conversationController.authorizeDeputyLeaderWeb
)
// gán quyền trưởng nhóm cho thành viên
router.post(
    '/authorizeGroupLeaderWeb',
    conversationController.authorizeGroupLeaderWeb
)

router.put(
    '/updateConversationAvatarWeb', // Đây chính là đường dẫn
    upload.single('file'),             // Middleware để xử lý file upload có tên field là 'file'
    conversationController.updateConversationAvatarWeb // Hàm controller xử lý request
);
// rời nhóm
router.post('/leaveGroupWeb', conversationController.leaveGroupWeb)
// giản tán nhóm
router.post('/disbandGroupWeb', conversationController.disbandGroupWeb)
// api lấy danh sách nhóm chứa user_id và có thuộc tính GroupLeader
router.post(
    '/getConversationGroupByUserIDWeb',
    conversationController.getConversationGroupByUserIDWeb
)
// api lấy danh sách member từ conversation_id
router.post(
    '/getMemberFromConversationIDWeb',
    conversationController.getMemberFromConversationIDWeb
)
// api gỡ quyền phó nhóm
router.post(
    '/deleteDeputyLeaderWeb',
    conversationController.deleteDeputyLeaderWeb
)
// api lấy id của GroupLeader và DeputyLeader
router.post(
    '/getGroupLeaderAndDeputyLeaderWeb',
    conversationController.getGroupLeaderAndDeputyLeaderWeb
)
// api đổi tênn nhóm
router.post(
    '/changeConversationNameWeb',
    conversationController.changeConversationNameWeb
)
// api check nhóm
router.post('/checkGroupWeb', conversationController.checkGroupWeb)
// api check giữa user_id và friend_id
router.post('/checkGroupCommonWeb', conversationController.checkGroupCommonWeb)
//api tạo conversation cloud của tôi
router.post(
    '/createMyCloudConversationWeb',
    conversationController.createMyCloudConversationWeb
)
//api get all getConversationsByUserIDWeb
router.post(
    '/getConversationsByUserIDWeb',
    conversationController.getConversationsByUserIDWeb
)

//-------------------------------------------------
// add mobile
// Mobile Routes
router.post('/', conversationController.createConversation);
router.get('/:userId', conversationController.userConversations);
router.get('/findConversationById/:conversationId', conversationController.findConversationById);
router.get('/find/:firstId/:secondId', conversationController.findConversations);
router.put('/authorizeDeputyLeader', conversationController.authorizeDeputyLeader);
router.put('/unauthorizeDeputyLeader', conversationController.unauthorizeDeputyLeader);
router.put('/removeMemberFromConversationGroup', conversationController.removeMemberFromConversationGroupMobile);

router.put('/leaveGroup', conversationController.leaveGroupMobile);

router.put('/authorizeGroupLeader', conversationController.authorizeGroupLeader);

router.get('/getConversationById/:conversation_id', conversationController.getConversationById);






export default router
