import { compare, hash } from "bcrypt";
// import { verify } from "argon2";
// import { hash } from "argon2";

export const createHash =  async (password) =>{
    const generatedHash = await hash(password, 10)
    // const generatedHash = await hash(password,{
    //     memoryCost: 1024 * 1024 // 1MB
    // })
    return generatedHash
}


export const compereHash = async (password,hashpassword)=>{
    const isMatch = await compare(password,hashpassword)
    // const isMatch = await verify(hashpassword,password)
    return isMatch
}