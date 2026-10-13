import chalk from 'chalk';
import express from 'express';
import UserRouter, { routes as userRoutes } from './modules/UserModule/user.controller.js';
import { DBConnection } from './DB/db.connection.js';
import { userModel } from './DB/models/UserModel/user.model.js';

const app = express();

const bootsrtrap = async () => {

    app.use(express.json());
    await DBConnection()


    app.get("/", async (req, res) => {
        const user = await userModel.find()
        res.json({
            user
        })

    })


    // await userModel.create({
    //     fullName:"Yayah Ahmed",
    //     email:"@gmail.com",
    //     phone:"01573273",
    //     password:"dfghjktyu",
    //     userName:"yahay_22"
    // })

    const user = await userModel.find()
    console.log(user);



    app.use(userRoutes.base, UserRouter);

    app.use((err, req, res, next) => {
        const statusCode = err.cause?.statusCode || 500;
        console.log({ statusCode });
        res.status(statusCode).json({
            errMsg: err.message,
            status: statusCode
        })
    })


    app.listen(3000, () => {
        console.log(chalk.green("server is running ..."));

    })
}





export default bootsrtrap;