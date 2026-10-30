import jwt from "jsonwebtoken";
import { userModel } from "../DB/models/UserModel/user.model.js";
import { errRes } from "../utils/err.hanle.js";

export const tokenEnum = {
    access: "access",
    refresh: "refresh"
}

export const auth = async (req, res, next) => {
    // console.log(0);

    try {
        const { user } = await decodeToken({ authorization: req.headers.authorization })
        req.user = user
        next()
    } catch (err) {
        next(err)   // يوصل للـ error handler اللي في bootstrap.js
    }
}

export const decodeToken = async ({ authorization, tokenType = tokenEnum.access }) => {
    if (!authorization || !authorization.startsWith("Bearer ")) {
        errRes({
            msg: "in-valid token",
            statusCode: 401
        });
    }

    const token = authorization.split(" ")[1];

    const payload = jwt.verify(
        token,
        tokenType === tokenEnum.access
            ? process.env.ACCESS_TOKEN_SECRET
            : process.env.REFRESH_TOKEN_SECRET
    );

    const user = await userModel.findById(payload._id)
    if (!user) {
        errRes({
            msg: "user not found",
            statusCode: 404
        })
    }


    // if (!user.confirmedAt) {
    //     errRes(
    //         {
    //             msg:"confirm first",
    //             statusCode:401
    //         }
    //     )
    // }

    return { user }
}



export const authoreization = (...roles) => {
    return (req, res, next) => {
        console.log({ roles, userRole: req.user.role });

        if (!roles.includes(req.user.role)) {
            errRes({
                msg: "unAuthorized",
                statusCode: 403
                // 401 = مش مسجل دخول، 403 = مسجل بس ممنوع
            });


        }

        next()

    }


}
