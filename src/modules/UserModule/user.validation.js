import z, { object } from 'zod';
import { GenderEnum } from './user.types.js';

export const signupSchema = {
    body: z.strictObject({
        fullName: z.string(),
        email: z.email(),
        phone: z.string().min(10).max(15),
        password: z.string(),
        gender: z.number().refine((v) => Object.values(GenderEnum).includes(v)).optional(),
        age: z.number().optional(),
        userName: z.string(),
        bio: z.string().optional(),
    }),
    query : z.strictObject({
         id:z.string()
    })
}

