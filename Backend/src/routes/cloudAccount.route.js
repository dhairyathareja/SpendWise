import express from "express";
import { connectAccount, removeAccount } from "../controller/cloudAccount.controller.js";

const router = express.Router();

router.post('/connect',connectAccount);
router.post('/remove',removeAccount);

export default router;