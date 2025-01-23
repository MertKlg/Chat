import errorCodes from "../common/error-codes";
import { genericFunc } from "../common/generic-func";
import ResponseModel from "../model/error-model";
import databasePool from "../service/database";
import bcrypt from "bcrypt"

export const signUp = genericFunc(async(req,res,next) => {
    const {username,email,password,phone} = req.body

    const result = await databasePool.query("SELECT `email`,`phone` FROM `users` WHERE email = '"+email+"' OR phone = '"+phone+"'")

    console.log(result[0], result[1])

    if(result[1].length > 0)
        throw new ResponseModel(errorCodes.EMAIL_ALREADY_USING, 400)
 

    const hashPass = await bcrypt.hash(password, parseInt(`${process.env.SALT_ROUND}`))

    const insertResult = await databasePool.query("INSERT INTO `users` ('id', 'username', 'email', 'password', 'phone') VALUES (NULL,'"+username+"','"+email+"','"+hashPass+"','"+phone+"') ")
    console.log(insertResult)

    res.json(req.body)
})

export const signIn = genericFunc(async (req,res,next) => {
    res.json("sign in work!")
})
  