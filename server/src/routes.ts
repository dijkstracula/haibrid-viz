import { Request, Response } from "express";

export const status = (req: Request, res: Response) => {
    console.log(req.path);
    res.json({ "msg": "It works, with JSON!"});
};