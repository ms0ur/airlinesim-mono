import { z, email } from "zod";

export const UserLogin = z.object({
    email: email().optional(),
    username: z.string().optional(),
    password: z.string(),
}).refine(
    (data) => data.email || data.username,
    {
        message: "Нужно указать либо email, либо username",
        path: ["email", "username"],
    }
);
