import mysql from "mysql"

const database = mysql.createConnection({
    user : "root",
    password : "",
    database : "mess-database"   
})