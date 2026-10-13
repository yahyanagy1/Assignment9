import bootsrtrap from './src/bootstrap.js';
import jwt from "jsonwebtoken";
bootsrtrap()



console.log(jwt.verify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2YWNjMjRjODdjNGMwYzk2YjA0MzY2Y2IiLCJlbWFpbCI6InlheWFAZ21haWwuY29tIiwiaWF0IjoxNzkxODcwMzA2fQ.VTW8A7fl6Ywr3caTO-B7spfP2ofp8x4z6eYxbI-Jd0o","accessToken_sdfghjkl"));
