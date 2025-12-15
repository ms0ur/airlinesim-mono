import { z } from "zod";


export const userCreate = z.object({
    username: z.string().min(1).max(30).trim(),
    email: z.email().max(254).trim(),
    password: z.string().min(1).max(255),
});
export type UserCreate = z.infer<typeof userCreate>;

export const userUpdate = z
    .object({
        id: z.uuid(),
        username: z.string().min(1).max(30).trim().optional(),
        email: z.email().max(254).trim().optional(),
        password: z.string().min(1).max(255).optional(),
    })
    .refine((obj) => Object.keys(obj).length > 0, {
        message: "Нужно передать хотя бы одно поле",
        path: ["_"],
    });
export type UserUpdate = z.infer<typeof userUpdate>;


export const userPublic = z.object({
    id: z.uuid(),
    username: z.string().min(1).max(30),
    email: z.email().max(254),
    createdAt: z.union([z.date(), z.string()]),
});
export type UserPublic = z.infer<typeof userPublic>;
