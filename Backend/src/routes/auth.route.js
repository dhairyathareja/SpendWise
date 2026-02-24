import express from "express";
import { getProfileInfo, postLogin, postLogout, postSignUp } from "../controller/Auth.controller.js";

const router = express.Router();


router.post('/signUp',postSignUp);
router.post('/login',postLogin);
router.post('/logout',postLogout);

router.get('/profileInfo/:userId',getProfileInfo);


export default router;