import { Router } from "express";
import * as US from "./user.service.js"
import { authentication } from "../../common/middleware/authentication.js";
import { authorization } from "../../common/middleware/authorization.js";
import { RoleEnum } from "../../common/enum/user.enum.js";
import { Validation } from "../../common/middleware/validation.js";
import {
    refreshTokenSchema, signInSchema, signUpSchema, shareProfileSchema, updateProfileSchema,
    updatePasswordSchema
} from "./user.validation.js";
import { multerLocal } from "../../common/middleware/multer.js";
const userRouter = Router();


userRouter.post("/signUp",
    multerLocal("users", ["image/jpeg", "image/png"]).fields([
        { name: "attachment", max: 1 },
        { name: "attachments", max: 5 }
    ]),
    Validation(signUpSchema),
    US.signUp);

userRouter.post("/signUp/gmail", US.signUpWithGmail);

userRouter.post("/signIn", Validation(signInSchema), US.signIn);

userRouter.post("/refresh-token", Validation(refreshTokenSchema), US.refreshToken);

userRouter.get("/profile", authentication, US.getProfile);

userRouter.patch("/update-profile", Validation(updateProfileSchema), authentication, US.updateProfile);

userRouter.patch("/update-password", Validation(updatePasswordSchema), authentication, US.updatePassword);

userRouter.patch("/logout", authentication, US.logout);

userRouter.get("/share-profile/:id", Validation(shareProfileSchema), US.shareProfile);



export default userRouter;