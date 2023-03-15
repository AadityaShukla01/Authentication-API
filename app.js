import dotenv from 'dotenv'
dotenv.config()

//database 
import conDB from './config/conDB.js'
//importing user Routes
import userRoutes from "./routes/userRoutes.js"
import express from 'express'
import cors from 'cors';
const port = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL


const app = express();
//middleware for cors policy
app.use(cors())

//database connection
conDB(DATABASE_URL)

//middleware for json
app.use(express.json())

//load routes
app.use("/api/user", userRoutes)

app.listen(port, () => {
    console.log(`Jai Siya Ram at ${port}`);
})