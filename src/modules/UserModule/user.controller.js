import { Router } from "express";
import { successRes } from "../../utils/success.res.js";
import { loginService, signUpService } from "./user.service.js";
// import { errRes } from "../../utils/err.hanle.js";
const router = Router();



export const routes = {
    base: "/users",
    signup: "/signup", // POST
    login: "/login"
}

router.post(routes.signup, async (req,res)=>{
    const {data} = await signUpService(req.body)
    return successRes({
        res,
        status: 201 ,
        data
        // msg : "created"
    })
})


router.post(routes.login, async(req,res)=>{
    const {identifier , password} = req.body
    const {data} = await loginService(identifier , password)
    return successRes({
        res,data
    })
})





export default router;