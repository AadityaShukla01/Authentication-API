import mongoose from "mongoose";

const conDB = async (DATABASE_URL) => {
    try {
        const DB_OPTION = {
            dbname: "sai"
        }
        await mongoose.connect(DATABASE_URL, DB_OPTION)
        console.log('Con')
    }
    catch (error) {
        console.log(error)
    }

}

export default conDB;
// module.exports = conDB;