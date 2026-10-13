export const successRes = ({res, status = 200 , msg = "user route is working" , data = {}})=>{
    
    res.status(status).json({
        msg,
        data,
        status,
        timestamp: new Date(Date.now())
    })
}