import mongoose from 'mongoose'

const Schema = mongoose.Schema

const FriendRequests = new Schema({
    friend_id: { type: String },
    friendName: { type: String },
    avatar: { type: String },
    phoneNumber: { type: String },
})

const Friend = new Schema({
    friend_id: { type: String },
})
const Conversation = new Schema({
    conversation_id: { type: String },
})
// const User = new Schema(
//     {
//         account_id: { type: String, required: true, unique: true },
//         conversation_id: [Conversation],
//         userName: { type: String, required: true },
//         firstName: { type: String, required: true },
//         lastName: { type: String, required: true },
//         phoneNumber: { type: String, required: true, unique: true },
//         dateOfBirth: { type: String, required: true },
//         gender: { type: String, required: true },
//         avatar: { type: String, required: true },
//         friendRequests: [FriendRequests],
//         friend: [Friend],
//         deleteFriend: [Friend],
//     },
//     { timestamps: true }
// )

const User = new Schema(
    {
        account_id: { type: String, required: true, unique: true },
        conversation_id: [Conversation],
        userName: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        phoneNumber: { type: String, required: true, unique: true },
        dateOfBirth: { type: String, required: true },
        gender: { type: String, required: true },
        avatar: { type: String, required: true },
        coverImage: { type: String },
        sentFriendRequests: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        friendRequests: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        friend: [Friend],
        deleteFriend: [Friend],
        deleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
    },
    { timestamps: true }
)

export default mongoose.model('User', User)
