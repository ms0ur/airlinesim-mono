import { UserLogin } from "@airlinesim/db/zod";
import {UserRepo} from "../../repo/userRepo";
import {loginUserByPassword} from "../../utils/auth.utils";

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, UserLogin.parse)
    let id = '';

    if (body.email){
        const user = await UserRepo.findByEmail(body.email)
        if (user){
            id = user.id;
        } else {
            setResponseStatus(event, 404, 'User not found');
            return false
        }
    }
    if (body.username) {
        const user = await UserRepo.findByUsername(body.username);
        if (user){
            id = user.id;
        } else {
            setResponseStatus(event, 404, 'User not found');
            return false
        }
    }

    try {
        const token = await loginUserByPassword(id, body.password)
        if (!token){
            setResponseStatus(event, 401, 'Wrong password');
            return false
        }
        setResponseStatus(event, 200);
        setCookie(event, 'auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 12
        });
        return true
    } catch (e) {
        setResponseStatus(event, 500, 'Server Error');
        return false
    }
})