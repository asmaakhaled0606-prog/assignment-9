import joi from "joi";
import { Types } from "mongoose";

export const generalRules = {
    id: joi.string().custom((value, helper) => {
        return Types.ObjectId.isValid(value) ? value : helper.message("inavalid id")
    }),
    email: joi.string().email({ minDomainSegments: 2, maxDomainSegments: 2 }),
    password: joi.string(),
    file: joi.object({
        fieldname: joi.string().required(),
        originalname: joi.string().required(),
        encoding: joi.string().required(),
        mimetype: joi.string().required(),
        path: joi.string(),
        destination: joi.string(),
        filename: joi.string(),
        size: joi.number().required()
    }).required().messages({
        "any.required": "profile image is reqiured"
    }),
    token: joi.object({
        authorization: joi.string().required(),
        connection: joi.string(),
        "accept-encoding": joi.string(),
        accept: joi.string(),
        "user-agent": joi.string(),
        host: joi.string(),
        "content-length": joi.string(),
        "content-type": joi.string(),
        "postman-token": joi.string()
    })
}