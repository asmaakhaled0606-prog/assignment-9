import joi from "joi";
import { generalRules } from "../../common/utils/generalRules.js";


export const signUpSchema = {
    body: joi.object({
        fName: joi.string().alphanum().min(2).max(10).required().messages({
            "any.required": "where is fname",
            "string.min": "name is too short"
        }),
        lName: joi.string().required(),
        email: generalRules.email.required(),
        password: generalRules.password.required(),
        phone: joi.string().required(),
        gender: joi.string().valid("male", "female").required(),
        cPassword: joi.string().valid(joi.ref("password")).required(),
        age: joi.number().required(),
    }).required(),

    files: joi.object({
        attachment: joi.array().items(generalRules.file.required()).required(),
        attachments: joi.array().items(generalRules.file.required()).required()
    }).required()
}

export const signInSchema = {
    body: joi.object({
        email: generalRules.email.required(),
        password: generalRules.password.required()
    })
}

export const refreshTokenSchema = {
    headers: generalRules.token.required()
}

export const shareProfileSchema = {
    params: joi.object({
        id: generalRules.id.required()
    }).required()
}

export const updateProfileSchema = {
    body: joi.object({
        fName: joi.string().alphanum().min(2).max(10).messages({
            "any.required": "where is fname",
            "string.min": "name is too short"
        }),
        lName: joi.string(),
        phone: joi.string(),
        gender: joi.string().valid("male", "female"),
        age: joi.number(),
    }).required()
}

export const updatePasswordSchema = {
    body: joi.object({
        oldPassword: generalRules.password.required(),
        newPassword: generalRules.password.required(),
        cPassword: joi.string().valid(joi.ref("newPassword")).required()
    })
}
