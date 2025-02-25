import * as dotenv from 'dotenv'
dotenv.config()
import express from "express"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import v1Router from "./api/v1"
import http from "http"
import "./database"
import { Server } from 'socket.io'
import cors from "cors"
import appSocket from './api/v1/sockets'

const port = 8080
const app = express()

const server = http.createServer(app)
const io = new Server(server, {
    cors : {
        origin : ["http://localhost:3000","http://localhost:3001","http://localhost:3002"],
        credentials : true,
    }
})

app.use(cors({
    origin : ["http://localhost:3000","http://localhost:3001","http://localhost:3002"],
    methods : "*",
    credentials : true
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended : true}))
app.use(cookieParser())

app.use("/api/v1",v1Router)

appSocket(io)

server.listen(port, () => {
    console.log("Server walking")
})
