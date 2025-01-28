import * as dotenv from 'dotenv'
dotenv.config()
import express from "express"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import v1Router from "./api/v1"
import http from "http"
import { initializeSocket } from './socket'
import "./database"
const port = 3001
const app = express()
const server = http.createServer(app)


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended : true}))
app.use(cookieParser())

app.use("/api/v1",v1Router)

server.listen(port, () => {
    console.log("Server walking")
    initializeSocket(server)
})
