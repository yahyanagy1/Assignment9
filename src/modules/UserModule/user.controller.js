import { Router } from "express";
import jwt from "jsonwebtoken";
import { successRes } from "../../utils/success.res.js";
import { loginService, refreshToken, signUpService } from "./user.service.js";
import { errRes } from "../../utils/err.hanle.js";
import { userModel } from "../../DB/models/UserModel/user.model.js";
import { authoreization, auth, decodeToken, tokenEnum } from "../../middlewares/auth.middlerware.js";
import { roleEnum } from "./user.types.js";
import { signupSchema } from "./user.validation.js";
import { validation } from "../../middlewares/validation.middleware.js";

const router = Router();

export const routes = {
    base: "/users",
    signup: "/signup",          // POST
    login: "/login",            // POST
    me: "/me",                  // GET
    refresh: "/refresh-token"   // POST
}

router.post(routes.signup,validation(signupSchema), async (req, res, next) => {

    try {
        const { data } = await signUpService(req.body)
        return successRes({ res, status: 201, data })
    } catch (err) {
        next(err)
    }
})

router.post(routes.login, async (req, res, next) => {
    try {
        const { identifier, password } = req.body
        const { data } = await loginService(identifier, password)
        return successRes({ res, data })
    } catch (err) {
        next(err)
    }
})

router.get(routes.me, auth, authoreization(roleEnum.user, roleEnum.admin), async (req, res) => {
    const user = req.user
    return successRes({ res, data: { user } })
})

router.post(routes.refresh, async (req, res, next) => {

    const authorization = req.headers.authorization
    const { data } = await refreshToken(authorization)
    return successRes({ res, data })
})

export default router;