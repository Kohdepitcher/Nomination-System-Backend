import { Request, Response } from "express";
import * as admin from 'firebase-admin'

export async function isAuthenticated(req: Request, res: Response, next: Function) {
    const { authorization } = req.headers

    //no header
    if (!authorization)
        return res.status(401).send({ message: 'Unauthorized' });

    //header doesnt start with Bearer
    if (!authorization.startsWith('Bearer'))
        return res.status(401).send({ message: 'Unauthorized' });

    //split the bearer token string by space character
    const split = authorization.split('Bearer ')

    //if the length of the split string isnt 2
    if (split.length !== 2)
        return res.status(401).send({ message: 'Unauthorized' });

    //store the token from the split string
    const token = split[1]

    try {

        //store the decoded token equal to the token being verified
        const decodedToken: admin.auth.DecodedIdToken = await admin.auth().verifyIdToken(token);
        //console.log("decodedToken", JSON.stringify(decodedToken))
        
        //set the locals to the fetched information from firebase
        res.locals = { ...res.locals, uid: decodedToken.uid, role: decodedToken.role, email: decodedToken.email }

        //console.log(res.locals);

        return next();
    }

    //if any error occurrs - throw back an 401 error saying unauthorised
    catch (err) {
        console.error(`${err.code} -  ${err.message}`)
        return res.status(401).send({ message: 'Unauthorized' });
    }
}