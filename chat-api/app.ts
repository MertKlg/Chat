import * as dotenv from 'dotenv'
dotenv.config()
import express from "express"
import errorHandler from "./api/v1/middleware/error-handler"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import v1Router from "./api/v1"

import "./api/v1/service/database"


const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended : true}))
app.use(cookieParser())


app.use("/api/v1",v1Router)


app.use(errorHandler)


app.listen(3000, ()=> {
    console.log("Server walking...")
})