import mongoose from 'mongoose'

async function connect() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        })
        console.log('Connect to Database successfully!!!')
    } catch (err) {
        console.log('Connect failure!!!')
        console.error(err)
    }
}

export default { connect }