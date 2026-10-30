import { userModel } from "../../DB/models/UserModel/user.model.js"
import { decodeToken, tokenEnum } from "../../middlewares/auth.middlerware.js";
import { errRes } from "../../utils/err.hanle.js"
import jwt from "jsonwebtoken";
import { compereHash, createHash } from "../../utils/security/hash.js";

// ================================================================
//                         SIGN UP SERVICE
// ================================================================
// Service = the place where the real work happens.
// This one creates a new account. It has 3 steps:
//   1) Look: does this user already exist?
//   2) If yes -> stop and send an error.
//   3) If no  -> save the new user and give it back.
//
// async = this function waits for the database. The database needs time to answer.
// { fullName, email, ... } = the data we receive from the user's sign up form.
export const signUpService = async ({ fullName, email, phone, password, age, userName, gender }) => {


    // ------------------------- STEP 1: LOOK -------------------------
    // findOne = search the database and give back ONE user (or nothing).
    // await   = wait here until the database answers.
    //
    // $or = "or". We look for a user who has:
    //   the same email   OR   the same userName.
    // If we find one, it means this person (or this name) is already taken.
    const isEsist = await userModel.findOne({
        $or: [
            { email },
            { userName }
        ]
    })


    // ------------------ STEP 2: STOP IF IT EXISTS --------------------
    // If isEsist has a user inside, the sign up must stop.
    if (isEsist) {
        // errRes = our helper that creates an error and STOPS the code.
        // So the lines below it will not run. That is why we don't need "else".
        errRes({
            // Which one is the problem? The email or the userName?
            // If the email is the same -> "email already exist"
            // If not                   -> "userName already exist"
            msg: `${isEsist.email == email ? "email" : "userName"} already exist`,
            statusCode: 400 // 400 = bad request (the user sent something we can't accept)
        })
    }

    // Another way (we don't use it): search for email and userName at the same time.
    // It is faster, but our $or is simpler.
    // const [isEmailExist , isUserNameExist] = await Promise.all([
    //     userModel.findOne([ email]),
    //     userModel.findOne([ userName]),
    // ])


    // --------------------- STEP 3: SAVE THE USER ---------------------
    // We only reach this line if nobody had the same email or userName.
    // create = make a new user and save it in the database.
    // The schema rules (required, unique, enum...) are checked here.
    const user = await userModel.create({
        fullName, email, phone, password: await createHash(password) , age, userName, gender
    })


    // -------------------- GIVE THE ANSWER BACK -----------------------
    // We return the new user to whoever called this function (the controller).
    // The controller will send it to the client.
    // Because of our toJSON settings, the password will be removed from the answer.
    return {
        data: {
            user
        }
    }

}



export const loginService = async (identifier, password) => {
    const user = await userModel.findOne({
        $or: [
            { email: identifier },
            { userName: identifier },

        ]
    })
    if (!user) {
        errRes({
            msg: "invaled credentials",
            statusCode: 404
        })
    }

    const isPasswordMatch = await compereHash(password,user.password)
    if (!isPasswordMatch) {
        errRes({
            msg: "invaled credentials",
            statusCode: 400
        })
    }


    const accessToken = jwt.sign({
        _id: user._id,
        email: user.email
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m"
    })


    const refreshToken = jwt.sign({
        _id: user._id,
        email: user.email
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d"
    })


    return {
        data: {
            accessToken,
            refreshToken
        }
    }

}



export const refreshToken = async (authorization) => {
    const { user } = await decodeToken({ authorization, tokenType: tokenEnum.refresh })
    const accessToken = jwt.sign({
        _id: user._id,
        email: user.email,

    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "7d"
    })

    return {
        data: {
            accessToken
        }
    }

}