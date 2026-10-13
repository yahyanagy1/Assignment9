import chalk from "chalk";
import mongoose from "mongoose";



export const DBConnection = async()=>{
    try {
        await mongoose.connect("mongodb://localhost:27017/Saraha_App-7-10",{
            serverSelectionTimeoutMS: 5000
        })
        console.log(chalk.green("DB connected succesfuly"));
    } catch (err) {
        console.log(chalk.red("DB connection failed"));
        
    }
}