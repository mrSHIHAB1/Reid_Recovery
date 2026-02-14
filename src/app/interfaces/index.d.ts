const email = req.user.email;import { JwtPayload } from "jsonwebtoken";


declare global {
    namespace Express {
        interface Request {
            user: JwtPayload
        }
    }
}