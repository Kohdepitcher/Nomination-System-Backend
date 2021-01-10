//import the necessary express APIs
import {Response } from "express";


//global enum to define types of auth roles
//models the available roles within the system
export enum AuthRoles {
    Admin = "admin",
    Trainer = "user"
}

// export enum userRole {
//     user = "user",
//     manager = "manager",
//     admin = "admin"
// }

export function dateFromUTCString(s) {
    s = s.split(/[-T:Z]/ig);
    return new Date(Date.UTC(s[0], --s[1], s[2], s[3], s[4], s[5]));
}

export function handleError(res: Response, err: any) {
    return res.status(500).send({ message: `${err.code} - ${err.message}` });
}