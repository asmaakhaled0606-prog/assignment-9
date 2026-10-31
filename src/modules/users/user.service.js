import userModel from "../../DB/models/user.model.js"
import * as dbService from "../../DB/service/db.service.js"
import { Decrypt, Encrypt } from "../../common/security/encrypt.js";
import { Compare, Hash } from "../../common/security/hash.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';
import { ProviderEnum } from "../../common/enum/user.enum.js";
const client = new OAuth2Client();
import { randomUUID } from "node:crypto";
import joi from "joi";
import { deleteKey, keys, setValue } from "../../DB/service/redis.service.js";

//-----------------------signUp---------------------------

export const signUp = async (req, res, next) => {

    const { fName, lName, email, password, age, gender, phone } = req.body;

    if (await userModel.findOne({ email: email.toLowerCase() })) {
        throw new Error("email already exists")
    }

    const paths = []
    for (const file of req.files.attachments) {
        paths.push(file.path)
    }

    const user = await dbService.create({
        model: userModel,
        data: {
            fName,
            lName,
            email,
            password: await Hash(password),
            age,
            gender,
            phone: Encrypt(phone),
            profileImage: req.files.attachment[0].path,
            coverImages: paths
        }
    })
    console.log(user)
    return res.status(201).json({ message: "user created", user })
}


//-----------------------signUpWithGmail---------------------------

export const signUpWithGmail = async (req, res, next) => {

    const { idToken } = req.body;

    const decoded = await client.verifyIdToken({
        idToken,
        audience: "886829864656-4bufqr0kgejpiapl510v1a9k60fmoo72.apps.googleusercontent.com",
    });

    const { family_name, given_name, picture, email_verified, email } = decoded.getPayload();

    let user = await userModel.findOne({ email: email.toLowerCase() })

    if (!user) {
        user = await userModel.create({
            fName: given_name,
            lName: family_name,
            email: email,
            profileImage: picture,
            isConfirmed: email_verified,
            provider: ProviderEnum.google
        })
    }

    if (user.provider == ProviderEnum.system) {
        throw new Error("login with system only", { cause: 400 })
    }

    const access_token = jwt.sign({ id: user._id, email: user.email }, "asmaa123", {
        expiresIn: 60 * 5,
    })

    const refresh_token = jwt.sign({ id: user._id, email: user.email }, "khaled123")

    return res.status(200).json({ message: "done", tokens: { access_token, refresh_token } })
}


//-----------------------signIn---------------------------

export const signIn = async (req, res, next) => {

    const { email, password } = req.body;

    const user = await dbService.findOne({
        model: userModel,
        filter: { email: email.toLowerCase(), provider: ProviderEnum.system }
    });
    if (!user) {
        throw new Error("email doesn't exist or you can login where you signed up", { cause: 400 })
    }

    if (!await Compare(password, user.password)) {
        throw new Error("inValid password")
    }

    const tokenId = randomUUID();

    const access_token = jwt.sign({ id: user._id, email: user.email }, "asmaa123", {
        expiresIn: 60 * 5,
        audience: "http://localhost:4000",
        issuer: "http://localhost:3000",
        jwtid: tokenId
    })
    const refresh_token = jwt.sign({ id: user._id, email: user.email }, "khaled123", {
        expiresIn: 60 * 60,
        jwtid: tokenId
    })


    return res.status(200).json({ message: "done", tokens: { access_token, refresh_token } })
}


//-----------------------getProfile---------------------------

export const getProfile = async (req, res, next) => {

    return res.status(200).json({ message: "done", user: req.user })
}


//-----------------------shareProfile---------------------------

export const shareProfile = async (req, res, next) => {

    const { id } = req.params
    let user = await dbService.findById({
        model: userModel,
        id,
        options: { password: 0 }
    })
    if (!user) {
        throw new Error("user doesn't exist", { cause: 400 })
    }
    user.phone = Decrypt(user.phone)
    return res.status(200).json({ message: "done", user })
}


//-----------------------refreshToken---------------------------

export const refreshToken = async (req, res, next) => {

    const { authorization } = req.headers

    if (!authorization) {
        throw new Error("token doesn't exist", { cause: 404 })
    }
    const decoded = jwt.verify(authorization, "khaled123")
    if (!decoded?.id) {
        throw new Error("invalid token", { cause: 400 })
    }
    console.log(decoded)
    const user = await dbService.findOne({
        model: userModel,
        filter: { _id: decoded.id }
    });
    if (!user) {
        throw new Error("user doesn't exist", { cause: 400 })
    }
    const access_token = jwt.sign({ id: user._id, email: user.email }, "asmaa123", {
        expiresIn: 60 * 5,
        audience: "http://localhost:4000",
        issuer: "http://localhost:3000"
    })
    return res.status(200).json({ message: "Done", access_token })
}


//-----------------------updateProfile---------------------------

export const updateProfile = async (req, res, next) => {

    const { fName, lName, age, gender, phone } = req.body;

    let updateQuery = {}

    if (fName !== undefined) {
        updateQuery.fName = fName
    }
    if (lName !== undefined) {
        updateQuery.lName = lName
    }
    if (age !== undefined) {
        updateQuery.age = age
    }
    if (gender !== undefined) {
        updateQuery.gender = gender
    }
    if (phone !== undefined) {
        updateQuery.phone = Encrypt(phone)
    }

    let user = await dbService.findByIdAndUpdate({
        model: userModel,
        id: req.user._id,
        update: updateQuery
    })

    return res.status(200).json({ message: "user updated", user })
}


//-----------------------updatePassword---------------------------

export const updatePassword = async (req, res, next) => {

    const { oldPassword, newPassword } = req.body;

    if (! await Compare(oldPassword, req.user.password)) {
        throw new Error("invalid old password")
    }

    req.user.password = await Hash(newPassword)

    req.user.changeCredentialAt = new Date()

    await req.user.save()

    return res.status(200).json({ message: "user updated", user: req.user })
}


//-----------------------logout---------------------------

export const logout = async (req, res, next) => {

    const { flag } = req.query

    if (flag == "all") {
        req.user.changeCredentialAt = new Date()
        await req.user.save()
        await deleteKey(await keys(`revoke_token::${req.user._id}`))
    } else {
        console.log(req.decoded.exp - Math.floor((Date.now()/1000)))
        await setValue({
            key:`revoke_token::${req.user._id}::${req.decoded.jti}`,
            value:`${req.decoded.jti}`,
            ttl: req.decoded.exp - Math.floor((Date.now()/1000))
        })
    }

    return res.status(200).json({ message: "done" })

}



