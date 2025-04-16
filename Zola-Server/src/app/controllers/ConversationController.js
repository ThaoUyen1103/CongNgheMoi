import Conversation from '../models/Conversation.js'
import User from '../models/User.js'
import { io } from '../../index.js'

class ConversationController {
    // post createConversationsWeb http://localhost:3001/conversation/createConversationsWeb
    async createConversationsWeb(req, res) {
        const user_id = req.body.user_id
        const friend_id = req.body.friend_id
        if (!user_id || !friend_id) {
            console.log('Không tìm thấy user_id hoặc friend_id!!!')
            return res.status(200).json({
                message: 'Không tìm thấy user_id hoặc friend_id!!!',
            })
        }

        const members = [user_id, friend_id] // sửa từ member thành members

        const conversation = new Conversation({
            members, // sửa từ member thành members
        })
        // kiểm tra trong database xem đã tồn tại conversation nào chứa 2 giá trị trong members chưa
        const checkConversation = await Conversation.find({
            members: { $all: members }, // sửa từ member thành members
        })
        if (checkConversation.length > 0) {
            // console.log('Conversation đã tồn tại!!!')
            return res.status(200).json({
                message: 'Conversation đã tồn tại!!!',
                conversation: checkConversation[0],
            })
        }
        await conversation
            .save()
            .then(() => {
                console.log('Tạo conversation thành công!!!')
                return res.status(200).json({
                    message: 'Tạo conversation thành công!!!',
                    conversation: conversation,
                })
            })
            .catch((err) => {
                console.error(err) // log lỗi
                return res.status(200).json({
                    message: 'Lỗi khi tạo conversation!!!',
                    error: err.message, // thêm chi tiết lỗi
                })
            })
    }

    // api get all conversations từ user_id
    async getConversationsByUserIDWeb(req, res) {
        const user_id = req.body.user_id
        try {
            const conversation = await Conversation.find({
                members: { $all: [user_id] },
            })
            const list_conversation = conversation.map(
                (conversation) => conversation._id
            )
            res.status(200).json({
                message: 'Lấy all conversation thành công!!!',
                conversation: list_conversation,
            })
        } catch (err) {
            res.status(500).json(err)
        }
    }

    // api xây dựng 1 conversation chỉ có 1 thành viên là bản thân giống như cloud của tôi
    async createMyCloudConversationWeb(req, res) {
        //console.log('đã vào createMyCloudConversationWeb')
        const user_id = req.body.user_id
        const conversationName = 'Cloud của tôi'
        const avatar =
            'https://res-zalo.zadn.vn/upload/media/2021/6/4/2_1622800570007_369788.jpg'
        // kiểm tra xem đã có conversation nào có member là user_id và conversationName tên là 'Cloud của tôi' chưa nếu có thì trả về thông báo
        const checkConversation = await Conversation.find({
            members: { $all: [user_id] },
            conversationName: conversationName,
        })
        if (checkConversation.length > 0) {
            return res.status(200).json({
                message: 'ConversationCloud đã tồn tại!!!',
                conversation: checkConversation[0],
            })
        } else {
            const conversation = new Conversation({
                members: [user_id],
                conversationName,
                avatar,
            })
            await conversation
                .save()
                .then(() => {
                    console.log('Tạo conversation thành công!!!')
                    return res.status(200).json({
                        message: 'Tạo ConversationCloud thành công!!!',
                        conversation: conversation,
                    })
                })
                .catch((err) => {
                    console.error(err) // log lỗi
                    return res.status(200).json({
                        message: 'Lỗi khi tạo conversation!!!',
                        error: err.message, // thêm chi tiết lỗi
                    })
                })
        }
    }

    //api tạo nhóm trò chuyện
    async createConversationsGroupWeb(req, res) {
        const user_id = req.body.user_id
        const friend_ids = req.body.friend_ids
        const groupLeader = req.body.user_id
        const conversationName = req.body.conversationName

        // Kiểm tra rỗng các id thì trả về lỗi
        if (!user_id || !friend_ids || friend_ids.length === 0) {
            console.log('Không tìm thấy user_id hoặc friend_ids!!!')
            return res.status(200).json({
                message: 'Không tìm thấy user_id hoặc friend_ids!!!',
            })
        }
        const members = [user_id, ...friend_ids]
        const conversation = new Conversation({
            members,
            groupLeader,
            conversationName,
        })

        await conversation
            .save()
            .then(() => {
                console.log('Tạo conversationGroup thành công!!!')
                return res.status(200).json({
                    message: 'Tạo conversationGroup thành công!!!',
                    conversation: conversation,
                })
            })
            .catch((err) => {
                console.error(err) // log lỗi
                return res.status(200).json({
                    message: 'Lỗi khi tạo conversation!!!',
                    error: err.message, // thêm chi tiết lỗi
                })
            })
    }

    // xây dựng 1 api thêm thành viên nhóm addMemberToConversationGroupWeb
    async addMemberToConversationGroupWeb(req, res) {
        const conversation_id = req.body.conversation_id
        const friend_ids = req.body.friend_ids

        // tìm Conversation theo conversation_id
        const conversation = await Conversation.findOne({
            _id: conversation_id,
        })
        // kiểm tra friend_ids đã có trong members chưa nếu có thì trả về thông báo
        const checkMembers = conversation.members.filter((member) =>
            friend_ids.includes(member.toString())
        )
        if (checkMembers.length > 0) {
            return res.status(200).json({
                message: 'Thành viên đã có trong nhóm!!!',
            })
        } else {
            // thêm danh sách friend_ids vào conversation_id
            try {
                const conversation = await Conversation.findOneAndUpdate(
                    { _id: conversation_id },
                    { $push: { members: { $each: friend_ids } } },
                    { new: true }
                )
                if (!conversation) {
                    return res
                        .status(404)
                        .json({ message: 'Conversation not found' })
                }
                return res.status(200).json({
                    message: 'Thêm thành viên vào nhóm thành công!!!',
                    conversation: conversation,
                })
            } catch (error) {
                res.status(500).json({ message: error.message })
            }
        }
    }

    // api xoá thành viên nhóm trong member , nếu
    async removeMemberFromConversationGroupWeb(req, res) {
        const conversation_id = req.body.conversation_id
        const user_id = req.body.user_id
        // lấy ra friend_id cần xóa
        const friend_id = req.body.friend_id
        // tìm Conversation theo conversation_id
        const conversation = await Conversation.findOne({
            _id: conversation_id,
        })
        console.log('conversation là', conversation)
        if (
            conversation.groupLeader.toString() !== user_id &&
            (conversation.deputyLeader
                ? conversation.deputyLeader.toString() !== user_id
                : true)
        ) {
            return res.status(200).json({
                message: 'Bạn không có quyền xóa thành viên khỏi nhóm!!!',
            })
        } else if (conversation.groupLeader.toString() === friend_id) {
            console.log('Trưởng nhóm không thể bị xóa khỏi nhóm!!!')
            return res.status(200).json({
                message: 'Trưởng nhóm không thể bị xóa khỏi nhóm!!!',
            })
        }

        // xóa friend_id khỏi members
        try {
            const conversation = await Conversation.findOneAndUpdate(
                { _id: conversation_id },
                { $pull: { members: friend_id } },
                { new: true }
            )
            if (!conversation) {
                return res
                    .status(404)
                    .json({ message: 'Conversation not found' })
            }
            return res.status(200).json({
                message: 'Xóa thành viên khỏi nhóm thành công!!!',
                conversation: conversation,
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
    // api gán quyền phó nhóm cho các thành viên khác
    async authorizeDeputyLeaderWeb(req, res) {
        const conversation_id = req.body.conversation_id
        const user_id = req.body.user_id
        const friend_id = req.body.friend_id
        // tìm Conversation theo conversation_id
        const conversation = await Conversation.findOne({
            _id: conversation_id,
        })
        if (conversation.groupLeader.toString() !== user_id) {
            return res.status(200).json({
                message: 'Bạn không có quyền gán phó nhóm!!!',
            })
        }
        // kiểm tra friend_id đã có trong deputyLeader chưa nếu có thì trả về thông báo
        if (conversation.deputyLeader.includes(friend_id)) {
            return res.status(200).json({
                message: 'Thành viên đã là phó nhóm rồi!!!',
            })
        }
        // kiểm tra firend_id có phải là groupLeader không nếu có thì trả về thông báo
        if (conversation.groupLeader.toString() === friend_id) {
            return res.status(200).json({
                message: 'Thành viên đã là trưởng nhóm rồi!!!',
            })
        }

        // gán quyền phó nhóm cho friend_id
        try {
            const conversation = await Conversation.findOneAndUpdate(
                { _id: conversation_id },
                { $push: { deputyLeader: friend_id } },
                { new: true }
            )
            if (!conversation) {
                return res
                    .status(404)
                    .json({ message: 'Conversation not found' })
            }
            return res.status(200).json({
                message: 'Gán quyền phó nhóm thành công!!!',
                conversation: conversation,
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
    // api gán quyền trưởng nhóm cho 1 thành viên khác
    async authorizeGroupLeaderWeb(req, res) {
        const conversation_id = req.body.conversation_id
        const user_id = req.body.user_id
        const friend_id = req.body.friend_id
        // tìm Conversation theo conversation_id
        const conversation = await Conversation.findOne({
            _id: conversation_id,
        })
        if (conversation.groupLeader.toString() !== user_id) {
            return res.status(200).json({
                message: 'Bạn không có quyền gán trưởng nhóm!!!',
            })
        }
        conversation.groupLeader = friend_id

        // nếu friend_id đã có trong deputyLeader thì xóa friend_id khỏi deputyLeader
        if (conversation.deputyLeader.includes(friend_id)) {
            conversation.deputyLeader = conversation.deputyLeader.filter(
                (deputyLeader) => deputyLeader !== friend_id
            )
        }
        try {
            await conversation.save()
            return res.status(200).json({
                message: 'Gán quyền trưởng nhóm thành công!!!',
                conversation: conversation,
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
    // api gỡ quyền phó nhóm deleteDeputyLeaderWeb chỉ dành cho groupLeader
    async deleteDeputyLeaderWeb(req, res) {
        const conversation_id = req.body.conversation_id
        const user_id = req.body.user_id
        const friend_id = req.body.friend_id
        // tìm Conversation theo conversation_id
        const conversation = await Conversation.findOne({
            _id: conversation_id,
        })
        if (conversation.groupLeader.toString() !== user_id) {
            return res.status(200).json({
                message: 'Bạn không có quyền gỡ quyền phó nhóm!!!',
            })
        }

        // xóa friend_id khỏi deputyLeader
        try {
            const conversation = await Conversation.findOneAndUpdate(
                { _id: conversation_id },
                { $pull: { deputyLeader: friend_id } },
                { new: true }
            )
            if (!conversation) {
                return res
                    .status(404)
                    .json({ message: 'Conversation not found' })
            }
            return res.status(200).json({
                message: 'Gỡ quyền phó nhóm thành công!!!',
                conversation: conversation,
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    // api rời khỏi nhóm cho tât cả thành viên
    async leaveGroupWeb(req, res) {
        const conversation_id = req.body.conversation_id
        const user_id = req.body.user_id
        // tìm Conversation theo conversation_id
        const conversation = await Conversation.findOne({
            _id: conversation_id,
        })
        if (conversation.groupLeader.toString() === user_id) {
            return res.status(200).json({
                message: 'Trưởng nhóm không thể rời khỏi nhóm!!!',
            })
        }

        // xóa user_id khỏi members
        try {
            const conversation = await Conversation.findOneAndUpdate(
                { _id: conversation_id },
                { $pull: { members: user_id } },
                { new: true }
            )
            // nếu user_id là phó nhóm thì xóa user_id khỏi deputyLeader
            if (conversation.deputyLeader.includes(user_id)) {
                conversation.deputyLeader = conversation.deputyLeader.filter(
                    (deputyLeader) => deputyLeader !== user_id
                )
            }
            await conversation.save() // Lưu lại thay đổi

            if (!conversation) {
                return res
                    .status(404)
                    .json({ message: 'Conversation not found' })
            }
            return res.status(200).json({
                message: 'Rời khỏi nhóm thành công!!!',
                conversation: conversation,
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
    // api giản tán nhóm chỉ dành cho groupLeader
    async disbandGroupWeb(req, res) {
        const conversation_id = req.body.conversation_id
        const user_id = req.body.user_id
        // tìm Conversation theo conversation_id
        const conversation = await Conversation.findOne({
            _id: conversation_id,
        })
        if (conversation.groupLeader.toString() !== user_id) {
            return res.status(200).json({
                message: 'Bạn không có quyền giải tán nhóm!!!',
            })
        }

        // sử dụng mongoose-delete để thêm thuộc tính deleted vào conversation
        try {
            await Conversation.delete({ _id: conversation_id })
            return res.status(200).json({
                message: 'Giải tán nhóm thành công!!!',
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
    // api lấy tất cả conversation mảng members chứa user_id và members có từ 3 phần tử trở lên
    async getConversationGroupByUserIDWeb(req, res) {
        const user_id = req.body.user_id
        try {
            const conversation = await Conversation.find({
                members: { $all: [user_id] },
            })
            // lọc ra những conversation có thuộc tính là groupLeader với avatar thì mới chọn
            // const conversationGroup = conversation.filter(
            //     (conversation) => conversation.groupLeader
            // )

            // lọc ra những conversation có thuộc tính là groupLeader với avatar và có thuộc tính deleted = null thì mới chọn
            const conversationGroup = conversation.filter(
                (conversation) =>
                    conversation.groupLeader && !conversation.deleted
            )

            res.status(200).json({
                message: 'Lấy conversationGroup thành công!!!',
                conversationGroup: conversationGroup,
            })
        } catch (err) {
            res.status(500).json(err)
        }
    }

    async getConversationIDWeb(req, res) {
        const friend_id = req.body.friend_id
        const user_id = req.body.user_id

        try {
            const conversation = await Conversation.findOne({
                members: { $all: [user_id, friend_id] },
            })

            if (!conversation) {
                return res
                    .status(404)
                    .json({ message: 'Conversation not found' })
            }

            return res.status(200).json({
                thongbao: 'Tìm conversation_id thành công!!!',
                conversation_id: conversation._id,
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    // api lấy danh sách member từ conversation_id
    async getMemberFromConversationIDWeb(req, res) {
        const conversation_id = req.body.conversation_id
        try {
            const conversation = await Conversation.findOne({
                _id: conversation_id,
            })
            if (!conversation) {
                return res
                    .status(404)
                    .json({ message: 'Conversation not found' })
            }
            return res.status(200).json({
                message: 'Lấy danh sách thành viên thành công!!!',
                members: conversation.members,
            })
        } catch (error) {
            res.status(200).json({ message: error.message })
        }
    }
    // api lấy id của GroupLeader và lấy mảng danh sách các id của DeputyLeader
    async getGroupLeaderAndDeputyLeaderWeb(req, res) {
        const conversation_id = req.body.conversation_id
        try {
            const conversation = await Conversation.findOne({
                _id: conversation_id,
            })
            if (!conversation) {
                return res
                    .status(404)
                    .json({ message: 'Conversation not found' })
            }
            return res.status(200).json({
                message: 'Lấy GroupLeader và DeputyLeader thành công!!!',
                groupLeaderId: conversation.groupLeader,
                deputyLeaderIds: conversation.deputyLeader,
            })
        } catch (error) {
            res.status(200).json({ message: error.message })
        }
    }
    async changeConversationNameWeb(req, res) {
        // console.log('đã vào')
        // res.status(200).json({ message: 'Đổi tên nhóm thành công!!!' })
        const conversation_id = req.body.conversation_id
        const user_id = req.body.user_id
        const conversationName = req.body.conversationName
        // tìm Conversation theo conversation_id
        // từ user_id tìm ra tên của user đổi tên nhóm không cần kiểm tra quyền
        const user = await User.findOne({
            _id: user_id,
        })
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        // tìm ra tên user
        const userName = user.userName

        const conversation = await Conversation.findOne({
            _id: conversation_id,
        })
        conversation.conversationName = conversationName
        try {
            await conversation.save()
            return res.status(200).json({
                message: 'Đổi tên nhóm thành công!!!',
                userChangeName: userName,
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    // adđ mobile-------------------------
    async createConversation(req, res) {
        const newConversation = new Conversation({
            members: [req.body.senderId, req.body.receiverId],
        })
        try {
            const result = await newConversation.save()
            //res.status(200).json(result)
        } catch (err) {
            res.status(500).json(err)
        }
    }
    async userConversations(req, res) {
        try {
            const conversation = await Conversation.find({
                members: { $in: [req.params.userId] },
            })
            res.status(200).json(conversation)
        } catch (err) {
            res.status(500).json(err)
        }
    }
    async findConversations(req, res) {
        try {
            const conversation = await Conversation.findOne({
                members: { $all: [req.params.firstId, req.params.secondId] },
            })
            res.status(200).json(conversation)
        } catch (err) {
            res.status(500).json(err)
        }
    }
    //find conversation by conversation_id mobile
    async findConversationById(req, res) {
        try {
            const conversation = await Conversation.findOne({
                _id: req.params.conversationId,
            })
            res.status(200).json(conversation)
        } catch (err) {
            res.status(500).json(err)
        }
    }
    //api tạo nhóm trò chuyện
    async createConversationsGroupMobile(req, res) {
        // console.log('đã vào createConversationsGroupWeb')
        // return res.status(200).json({
        //     message: 'Đã vào createConversationsGroupWeb',
        // })
        const user_id = req.body.user_id
        const friend_ids = req.body.friend_ids
        const groupLeader = req.body.user_id
        const conversationName = req.body.conversationName

        // Kiểm tra rỗng các id thì trả về lỗi
        if (!user_id || !friend_ids) {
            console.log('Không tìm thấy user_id hoặc friend_ids!!!')
            return res.status(200).json({
                message: 'Không tìm thấy user_id hoặc friend_ids!!!',
            })
        }
        const members = [user_id, ...friend_ids]
        const conversation = new Conversation({
            members,
            groupLeader,
            conversationName,
        })

        await conversation
            .save()
            .then(() => {
                console.log('Tạo conversation thành công!!!')
                return res.status(200).json(conversation)
            })
            .catch((err) => {
                console.error(err) // log lỗi
                return res.status(200).json({
                    message: 'Lỗi khi tạo conversation!!!',
                    error: err.message, // thêm chi tiết lỗi
                })
            })
    }
    async removeMemberFromConversationGroupMobile(req, res) {
        const conversation_id = req.body.conversation_id
        const user_id = req.body.user_id
        // lấy ra friend_id cần xóa
        const friend_id = req.body.friend_id
        // tìm Conversation theo conversation_id
        const conversation = await Conversation.findOne({
            _id: conversation_id,
        })
        console.log('conversation là', conversation)
        if (
            conversation.groupLeader.toString() !== user_id &&
            (conversation.deputyLeader
                ? conversation.deputyLeader.toString() !== user_id
                : true)
        ) {
            return res.status(200).json({
                message: 'Bạn không có quyền xóa thành viên khỏi nhóm!!!',
            })
        }

        // xóa friend_id khỏi members
        try {
            const conversation = await Conversation.findOneAndUpdate(
                { _id: conversation_id },
                { $pull: { members: friend_id } },
                { new: true }
            )
            if (!conversation) {
                return res
                    .status(404)
                    .json({ message: 'Conversation not found' })
            }
            return res.status(200).json({
                message: 'Xóa thành viên khỏi nhóm thành công!!!',
                conversation: conversation,
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
    async authorizeDeputyLeader(req, res) {
        const conversation_id = req.body.conversation_id
        const user_id = req.body.user_id
        const friend_id = req.body.friend_id
        // tìm Conversation theo conversation_id
        const conversation = await Conversation.findOne({
            _id: conversation_id,
        })
        if (conversation.groupLeader.toString() !== user_id) {
            return res.status(200).json({
                message: 'Bạn không có quyền gán phó nhóm!!!',
            })
        }

        // gán quyền phó nhóm cho friend_id
        try {
            const conversation = await Conversation.findOneAndUpdate(
                { _id: conversation_id },
                { $push: { deputyLeader: friend_id } },
                { new: true }
            )
            if (!conversation) {
                return res
                    .status(404)
                    .json({ message: 'Conversation not found' })
            }
            return res.status(200).json({
                message: 'Gán quyền phó nhóm thành công!!!',
                conversation: conversation,
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
    // api hủy quyền phó nhóm cho các thành viên khác
    async unauthorizeDeputyLeader(req, res) {
        const conversation_id = req.body.conversation_id
        const user_id = req.body.user_id
        const friend_id = req.body.friend_id
        // tìm Conversation theo conversation_id
        const conversation = await Conversation.findOne({
            _id: conversation_id,
        })
        if (conversation.groupLeader.toString() !== user_id) {
            return res.status(200).json({
                message: 'Bạn không có quyền hủy phó nhóm!!!',
            })
        }

        // hủy quyền phó nhóm cho friend_id
        try {
            const conversation = await Conversation.findOneAndUpdate(
                { _id: conversation_id },
                { $pull: { deputyLeader: friend_id } },
                { new: true }
            )
            if (!conversation) {
                return res
                    .status(404)
                    .json({ message: 'Conversation not found' })
            }
            return res.status(200).json({
                message: 'Hủy quyền phó nhóm thành công!!!',
                conversation: conversation,
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
    async authorizeGroupLeader(req, res) {
        const conversation_id = req.body.conversation_id
        const user_id = req.body.user_id
        const friend_id = req.body.friend_id
        // tìm Conversation theo conversation_id
        const conversation = await Conversation.findOne({
            _id: conversation_id,
        })
        if (conversation.groupLeader.toString() !== user_id) {
            return res.status(200).json({
                message: 'Bạn không có quyền gán trưởng nhóm!!!',
            })
        }
        conversation.groupLeader = friend_id

        // nếu friend_id đã có trong deputyLeader thì xóa friend_id khỏi deputyLeader
        if (conversation.deputyLeader.includes(friend_id)) {
            conversation.deputyLeader = conversation.deputyLeader.filter(
                (deputyLeader) => deputyLeader !== friend_id
            )
        }
        try {
            await conversation.save()
            return res.status(200).json({
                message: 'Gán quyền trưởng nhóm thành công!!!',
                conversation: conversation,
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
    // xây dựng 1 api thêm thành viên nhóm addMemberToConversationGroupWeb
    async addMemberToConversationGroupMobile(req, res) {
        // console.log('đã vào addMemberToConversationGroupWeb')
        // return res.status(200).json({
        //     message: 'Đã vào addMemberToConversationGroupWeb',
        // })
        const conversation_id = req.body.conversation_id
        const friend_ids = req.body.friend_ids

        // thêm danh sách friend_ids vào conversation_id
        try {
            const conversation = await Conversation.findOneAndUpdate(
                { _id: conversation_id },
                { $push: { members: { $each: friend_ids } } },
                { new: true }
            )
            if (!conversation) {
                return res
                    .status(404)
                    .json({ message: 'Conversation not found' })
            }
            return res.status(200).json(conversation)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
    //xây dựng api đổi tên Nhóm
    async changeGroupName(req, res) {
        const conversation_id = req.body.conversation_id
        const conversationName = req.body.conversationName
        // tìm Conversation theo conversation_id
        const conversation = await Conversation.findOneAndUpdate(
            { _id: conversation_id },
            { $set: { conversationName: conversationName } },
            { new: true }
        )
        try {
            await conversation.save()
            return res.status(200).json({
                message: 'Đổi tên nhóm thành công!!!',
                conversation: conversation,
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
    // api rời khỏi nhóm cho tât cả thành viên
    async leaveGroup(req, res) {
        const conversation_id = req.body.conversation_id
        const user_id = req.body.user_id
        // tìm Conversation theo conversation_id
        const conversation = await Conversation.findOne({
            _id: conversation_id,
        })
        if (conversation.groupLeader.toString() === user_id) {
            return res.status(200).json({
                message: 'Trưởng nhóm không thể rời khỏi nhóm!!!',
            })
        }

        // xóa user_id khỏi members
        try {
            const conversation = await Conversation.findOneAndUpdate(
                { _id: conversation_id },
                { $pull: { members: user_id } },
                { new: true }
            )
            // nếu user_id là deputyLeader thì xóa user_id khỏi deputyLeader
            if (conversation.deputyLeader.includes(user_id)) {
                conversation.deputyLeader = conversation.deputyLeader.filter(
                    (deputyLeader) => deputyLeader !== user_id
                )
            }
            if (!conversation) {
                return res
                    .status(404)
                    .json({ message: 'Conversation not found' })
            }
            return res.status(200).json({
                message: 'Rời khỏi nhóm thành công!!!',
                conversation: conversation,
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
    // api giản tán nhóm chỉ dành cho groupLeader
    async disbandGroupMobile(req, res) {
        const conversation_id = req.body.conversation_id
        const user_id = req.body.user_id
        // tìm Conversation theo conversation_id
        const conversation = await Conversation.findOne({
            _id: conversation_id,
        })
        if (conversation.groupLeader.toString() !== user_id) {
            return res.status(200).json({
                message: 'Bạn không có quyền giải tán nhóm!!!',
            })
        }

        // sử dụng mongoose-delete để thêm thuộc tính deleted vào conversation
        try {
            await Conversation.delete({ _id: conversation_id })
            return res.status(200).json({
                message: 'Giải tán nhóm thành công!!!',
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
    // upadte conversation avatar
    async updateConversationAvatar(req, res) {
        const conversation_id = req.body.conversation_id
        const avatar = req.body.avatar
        // tìm Conversation theo conversation_id
        const conversation = await Conversation.findOne({
            _id: conversation_id,
        })
        conversation.avatar = avatar
        try {
            await conversation.save()
            return res.status(200).json({
                message: 'Cập nhật avatar nhóm thành công!!!',
                conversation: conversation,
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    //-------------------

    // api check conversation có phải là nhóm  hay chưa dựa vào conversation đó có thuộc tính groupLeader hay không hoặc có conversationName hay không
    async checkGroupWeb(req, res) {
        const conversation_id = req.body.conversation_id
        try {
            const conversation = await Conversation.findOne({
                _id: conversation_id,
            })
            if (!conversation) {
                return res
                    .status(404)
                    .json({ message: 'Conversation not found' })
            }
            if (
                conversation.groupLeader ||
                (conversation.conversationName &&
                    conversation.conversationName !== 'Cloud của tôi')
            ) {
                return res.status(200).json({
                    message: 'Conversation là nhóm!!!',
                })
            } else {
                return res.status(200).json({
                    message: 'Conversation không phải là nhóm!!!',
                })
            }
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
    // viết 1 api lấy tin nhắn cuối cùng của conversation nếu mà là của user mình nhắn sẽ hiện àlaf "Bạn : message" còn néu của người khác thì hiện là "userName : message"

    // viết 1 api check nhóm chung giữa user_id và friend_id ta sẽ check xem 2 user_id và friend_id có chung 1 nhóm nào không nếu có thì trả về số lượng nhóm chung và tên nhóm cùng với avatar của nhóm
    async checkGroupCommonWeb(req, res) {
        const user_id = req.body.user_id
        const friend_id = req.body.friend_id

        // chỉ check conversation có thuộc tính groupLeader và conversationName và thuộc tính deleted = false
        const conversation = await Conversation.find({
            members: { $all: [user_id, friend_id] },
            groupLeader: { $ne: null },
            conversationName: { $ne: null },
            deleted: false,
        })
        if (conversation.length === 0) {
            return res.status(200).json({
                message: 'Không có nhóm chung!!!',
            })
        }
        return res.status(200).json({
            message: 'Có nhóm chung!!!',

            conversation: conversation,
            // trả về số lượng nhóm chung
            conversationCount: conversation.length,
        })
    }
    async createConversationsMobile(req) {
        const user_id = req.body.user_id;
        const friend_id = req.body.friend_id;
        if (!user_id || !friend_id) {
            console.log('Không tìm thấy user_id hoặc friend_id!!!');
            return {
                status: 400,
                data: { message: 'Không tìm thấy user_id hoặc friend_id!!!' },
            };
        }

        const members = [user_id, friend_id];

        const conversation = new Conversation({
            members,
        });

        const checkConversation = await Conversation.find({
            members: { $all: members },
        });

        if (checkConversation.length > 0) {
            return {
                status: 200,
                data: {
                    message: 'Conversation đã tồn tại!!!',
                    conversation: checkConversation[0],
                },
            };
        }

        try {
            await conversation.save();
            console.log('Tạo conversation thành công!!!');
            return {
                status: 200,
                data: {
                    message: 'Tạo conversation thành công!!!',
                    conversation: conversation,
                },
            };
        } catch (err) {
            console.error(err);
            return {
                status: 500,
                data: {
                    message: 'Lỗi khi tạo conversation!!!',
                    error: err.message,
                },
            };
        }
    }

    // thêm moible 
    async getConversationsByUserIDMobile(req, res) {
        try {
            const user_id = req.body.user_id;
            if (!user_id) {
                return res.status(400).json({ message: 'Thiếu user_id trong body' });
            }

            const user = await User.findById(user_id);
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }

            // Lấy danh sách conversation_id từ user
            const conversationIds = user.conversation_id.map(conv => conv.conversation_id);
            console.log('Conversation IDs from user:', conversationIds);

            // Kiểm tra nếu không có cuộc trò chuyện
            if (!conversationIds || conversationIds.length === 0) {
                return res.status(200).json({
                    message: 'Lấy all conversation thành công!!!',
                    conversation: [],
                });
            }

            // Lấy tất cả các cuộc trò chuyện từ danh sách conversationIds
            const conversations = await Conversation.find({
                _id: { $in: conversationIds },
                deleted: false,
            }).lean();

            console.log('Conversations found:', conversations);

            return res.status(200).json({
                message: 'Lấy all conversation thành công!!!',
                conversation: conversations.map(conv => conv._id),
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    async getConversationById(req, res) {
        try {
            const conversation_id = req.params.conversation_id;
            const conversation = await Conversation.findById(conversation_id);
            if (!conversation) {
                return res.status(404).json({ message: 'Conversation not found' });
            }
            return res.status(200).json({
                message: 'Lấy thông tin cuộc trò chuyện thành công!!!',
                conversation: conversation,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
}

export default new ConversationController()
