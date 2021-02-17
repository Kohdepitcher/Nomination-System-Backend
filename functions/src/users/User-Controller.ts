/*

The purpose of this class is to handle buisness logic relating to users 

*/




import { Request, Response } from "express";
import * as admin from 'firebase-admin'
import { UserRecord } from "firebase-functions/lib/providers/auth";


import { connect } from '../config';

//trial date entity
import { User } from "../entities/user";

import { AuthRoles } from "../globals";

export class userController {
    
    /*
    This function is responsible for creating users in the database directly without creating a firebase account
    NOTE: this should only be used during development to create a user after creating a test user in firebase auth panel
    It asks for the UUID of the new user to then create a matching entry in the DB
    
    NOTE: this will not be needed after the on create firebase auth create user trigger is implemented
    as it will automatically create a user itself and assign a role
    */
    async createUserInDB(req: Request, res: Response) {
        
        //create a constant to store the request body
        const { uid, name, role } = req.body
        
        //if any of the required fields are empty
        //repond with a missig fields error
        if (!uid) {
            
            //send 400 error to client
            return res.status(400).send({ message: 'Missing UID in body' });
        }
        
        if (!name) {
            
            //send 400 error to client
            return res.status(400).send({ message: 'Missing name in body' });
        }
        
        if (!role) {
            
            //send 400 error to client
            return res.status(400).send({ message: 'Missing role in body' });
        }
        
        if (!Object.values(AuthRoles).includes(role)) {
            
            //send 400 error to client
            return res.status(400).send({ message: 'Role: ' + role + " is not a valid role, must be either: " + AuthRoles.Admin + " or " + AuthRoles.Trainer})
        }
        
        try {
            
            //create a new connection to the DB
            const connection = await connect();
            
            //get the user repo
            const userRepo = connection.getRepository(User);
            
            //create a new user
            const newUser = new User();
            newUser.UUID = uid;
            newUser.name = name;
            newUser.role = role;
            
            //save the new user to the db
            await userRepo.save(newUser);
            
            //send a success message to the client
            return res.status(201).send({body: "Successfully created user: " + name + " UID: " + uid})
            
        } catch (error) {
            return handleError(res,error);
        }
        
    }
    
    
    //creates a new user account and in database
    //requres a name, password, and email
    
    /*
    This function is responsible for creating a user in the system
    It will create a fireauth user account using the provided details in the request body and assign a default role of user
    It will also create a matching user entry in the DB using the provided details in the request body
    
    NOTE: This query requires the following in the body:
    name - becomes the user name and display name in fireauth
    email - assigned to the DB record and firebase auth
    password - set the password of the user account 
    
    NOTE: Users created using this will have an automatic randomly generated password assigned to them
    and if a user wants to use their account, they will have to reset their password
    
    NOTE: This should only be used by an admin to create an account as it doesnt actually return the required auth details to log in on the client side
    Users should use the fireauth web createuser api for the front end
    */
    async createUser(req: Request, res: Response) {
        
        //create a constant to store the request body
        const { displayName, email } = req.body
        
        try {
            
            //default role
            const role = AuthRoles.Trainer;
            
            //if any of the required fields are empty
            if (!displayName) {
                
                //send 400 error to client
                return res.status(400).send({ message: 'Missing name in body' })
            }
            
            if (!email) {
                
                //send 400 error to client
                return res.status(400).send({ message: 'Missing email in body' })
            }
            
            
            //create and store the user
            const { uid } = await admin.auth().createUser({
                
                //set the name of the user
                displayName,
                
                //set a random password
                password: Math.random().toString(36).replace('0.', ''),
                
                //set the email of the user
                email
            })
            
            //set the custom role claim
            await admin.auth().setCustomUserClaims(uid, { role })
            
            //create new connection to DB
            const connection = await connect();
            
            //get the user repository
            const repo = connection.getRepository(User);
            
            //create a new user
            const newUser = new User();
            
            //parse data from func parameters
            //uuid from fireauth
            newUser.UUID = uid;
            
            //name is the display name
            newUser.name = displayName;
            
            newUser.role = role;
            
            //save the user in DB
            await repo.save(newUser);
            
            //fetch the user record from fireauth that matches the uid
            const user = await admin.auth().getUser(uid)
            
            
            //send success message to cleint
            return res.status(200).send({ user: mapUser(user) })
        } catch (err) {
            return handleError(res, err)
        }
    }
    
    
    /*
    returns a list of all users within the system consisting of their db record mapped to their fireauth account
    
    //TODO: make the function do paging, cloud also be inefficient to individually map a fireauth user to their db record
    */
    async getAllUsers(req: Request, res: Response) {
        
        // try {
        
        //         //create a connection to the db
        //         const connection = await connect()
        
        //         //get the user repo
        //         const userRepo = connection.getRepository(User);
        
        //         //store an empty array of users
        //         const mappedUsers = [];
        
        //         //fetch all the users from the DB
        //         const fetchedUsers: User[] = await userRepo.find();
        
        //         //iterate over all fetched users and map them to their fireauth account
        //         for (const index in fetchedUsers) {
        
        //             //fireauth user
        //             const user = await admin.auth().getUser(fetchedUsers[index].UUID);
        
        //             //map and then push to an empty array
        //             mappedUsers.push({ user: mapUser(user), db: fetchedUsers[index]});
        
        //         }
        
        //         //return all the matching users
        
        //         return res.status(200).send({users: mappedUsers});
        
        // } catch (error) {
        //     return handleError(res, error)
        // }
        
        try {
            const listUsers = await admin.auth().listUsers()
            const users = listUsers.users.map(mapUser)
            return res.status(200).send({users: users})
        } catch (err) {
            return handleError(res, err)
        }
        
    }
    
    /*
    returns a list of users based on their role from the db
    fetching from the db should be quicker without pairing up fireauth data
    
    NOTE: this method requires the following request parameters
    role - the kind of users that need to be returned
    */
    async getUsersForRole(req: Request, res: Response) {
        
        //store the uid from the request parameters
        const { role } = req.params
        
        //check if the role is not null
        if (!role) {
            //send 400 error to client
            return res.status(400).send({ message: 'Missing role in request params' })
        }
        
        try {
            
            //create DB Connection
            const connection = await connect();
            
            //Repos
            const userRepo = connection.getRepository(User)
            
            //fetch the users with the matching role
            const allUsersMatchingRole = await userRepo.find({ 
                select: ["userID", "name"],
                where: { role: role },
                order: { name: "ASC" }
            })
            
            //return the results
            return res.status(200).send(allUsersMatchingRole)
            
        } catch (err) {
            return handleError(res, err)
        }
        
    }
    
    
    /*
    returns a single entry consisting of a fireauth user and db user
    
    NOTE: this func requires the following inputs in the request parameters
    uid - the UID of the user that the getUser Request is for
    */
    async getUser(req: Request, res: Response) {
        
        //store the uid from the request parameters
        const { uid } = req.params
        
        if (!uid) {
            
            //send 400 error to client
            return res.status(400).send({ message: 'Missing uid in request params' })
        }
        
        try {
            
            // //db connection
            // const connection = await connect();
            
            // //user repo
            // const userRepo = connection.getRepository(User);
            
            //fetch a user from the db that matches the uid
            // const fetchedUser = await userRepo.findOne({UUID: uid})
            
            // console.log(fetchedUser);
            
            
            
            
            
            
            //fetch the user record from fireauth that matches the uid
            const user = await admin.auth().getUser(uid).then((userRecord) => {
                return userRecord
            }).catch((error) => {
                return handleError(res, error)
            })
            
            // console.log(mapUser(user as UserRecord));
            
            return res.status(200).send({ user: mapUser(user as UserRecord) })
        } catch (err) {
            return handleError(res, err)
        }
    }
    
    /*
    This function is responsible for updating the user's account information
    Since it has to work for all roles, no admin only edits can be done so no role changing
    
    This request doesnt need a UID since it can be pulled from the token that was passed along with the PATCH request
    
    NOTE: this func requires the following parameters
    displayName - the name of the user
    email - the email address of the user
    */
    //    async updateUser(req: Request, res: Response) {
    
    //         const { displayName, email } = req.body;
    
    //         try {
    
    //             const connection = await connect();
    //             const userRepo = connection.getRepository(User);
    
    //             //firest fetch the user from the db
    //             //use the uid from the auth token
    //             const userFromDB = await userRepo.findOne({UUID: res.locals.uid})
    
    
    
    //             //then fetch the same user from fireauth
    //             // const userfromFireAuth = await admin.auth().getUser(res.locals.uid)
    
    //             //if the email is provided
    //             if (email) {
    //                 await admin.auth().updateUser(res.locals.uid, {
    //                     email: email
    //                 });
    //             }
    
    //             //if the name is provided
    //             if (displayName) {
    
    //                 //update the user's name
    //                 userFromDB.name = displayName
    
    //                 await admin.auth().updateUser(res.locals.uid, {
    //                     displayName: displayName
    //                 });
    //             }
    
    
    //             //finally save the updated user to the DB
    //             await userRepo.save(userFromDB)
    
    //             //update the user's fireauth account informaiton
    //             // await admin.auth().updateUser(res.locals.uid, );
    
    //             return res.status(200).send({ body: 'Successfully updated account information' })
    
    //         } catch (error) {
    //             return handleError(res, error)
    //         }
    
    //    }
    
    
    /*
    This function is responsible for updating a pacific user in both fireauth and db
    
    NOTE: if the user token attached to the request has a role of 'user', then they can only update their own record
    if the user token attached has a admin role, then they can update any user using their UIDs
    
    NOTE: only admins can assign roles to users
    
    NOTE: this func requires the following inputs in the request parameters
    uid - the UID of the user that the request is for (admins) or it will be the uid of the person who called it
    
    NOTE: this func requires the following inputes in the request parameters
    displayName - the name of the user
    email - the email address for the user
    role - the role for the user
    
    its intended that when this function is called, the uid of the user will be in req params when they edit their information in the front end,
    it will only be different if an admin is trying to edit someone's record
    
    
    */
    async patchUser(req: Request, res: Response) {
        
        //store the uid from req params
        const { uid } = req.params
        
        //store the body of the request
        const { displayName, email, role } = req.body
        
        //temp store a UID that will be set soon
        var specifiedUID
        
        //check if uid field is empty
        if (!uid) {
            
            //return error
            return res.send(400).send({ message: 'Missing UID in request parameters'})
        }
        
        
        //check the role of the user
        //user is a trainer
        if (res.locals.role == AuthRoles.Trainer) {
            
            //fetch the uid from the token instead of request param
            specifiedUID = res.locals.uid
        }
        
        //user is an admin
        else if (res.locals.role == AuthRoles.Admin) {
            
            //if the uid is not set on the parameter when called by an admin
            if (!req.params.uid) {
                return res.status(400).send({ message: 'Missing user UID when updating details by admin' })
            }
            
            //set the uid to the one passed in from request param
            specifiedUID = uid
        }
        
        
        //if any of the required fields are empty
        // no name in body
        if (!displayName) {
            
            //send 400 error to client
            return res.status(400).send({ message: 'Missing displayName for user' })
        }
        
        if (!email) {
            
            //send 400 error to client
            return res.status(400).send({ message: 'Missing email for user' })
        }
        
        if (!role) {
            
            //send 400 error to client
            return res.status(400).send({ message: 'Missing role for user' })
        }
        
        
        //firebase account update
        try {
            
            //update the user information in fire auth
            await admin.auth().updateUser(specifiedUID, { displayName, email })
            
            //check if the user is admin
            if (res.locals.role == AuthRoles.Admin) {
                
                //check if the role string from body is a valid role
                //if not return an error
                if (!Object.values(AuthRoles).includes(role)) {
                    return res.status(400).send({ message: 'Role: ' + role + " is not a valid role, must be either: " + AuthRoles.Admin + " or " + AuthRoles.Trainer})
                }
                
                //if everything is successfull so far, update the role of the user
                
                await admin.auth().setCustomUserClaims(specifiedUID, { role })
                
            }
            
        } catch (error) {
            return handleError(res, error)
        }
        
        
        
        //Database user update
        try {
            
            //create connection to the server
            const connection = await connect();
            
            //create a user repository
            const userRepo = connection.getRepository(User);
            
            //find the user that matches the uid of the "to be updated" user
            const updateUser = await userRepo.findOne({UUID: specifiedUID});
            
            //set the name of the user
            updateUser.name = displayName
            
            //save the changes to the DB
            await userRepo.save(updateUser);
            
            return res.status(200).send({ message: 'Successfully updated user: ' + displayName })
        } catch (err) {
            return handleError(res, err)
        }
    }
    
    /*
    This function is responsible for deleting users from both fireauth and the db
    
    NOTE: if the user token attached to the request has a role of 'user', then they can only delete their own record and account
    if the user token attached has a admin role, then they can delete any user using their UIDs
    */
    async removeUser(req: Request, res: Response) {
        
    }
    
    
    
    /*
    returns all parts of the fireauth account as a string
    */
    mapUser(user: admin.auth.UserRecord) {
        
        //store the custom claims
        const customClaims = (user.customClaims || { role: '' }) as { role?: string }
        
        //if the role doesnt exist on the user account, return role not set
        const role = customClaims.role ? customClaims.role : 'Role Not Set'
        return {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            role,
            lastSignInTime: user.metadata.lastSignInTime,
            creationTime: user.metadata.creationTime
        }
    }
    
}



//creates a new user account and in database
//requres a name, password, and email

/*
This function is responsible for creating a user in the system
It will create a fireauth user account using the provided details in the request body and assign a default role of user
It will also create a matching user entry in the DB using the provided details in the request body

NOTE: This query requires the following in the body:
name - becomes the user name and display name in fireauth
email - assigned to the DB record and firebase auth
password - set the password of the user account

NOTE: Users created using this will have an automatic randomly generated password assigned to them
and if a user wants to use their account, they will have to reset their password

NOTE: This should only be used by an admin to create an account as it doesnt actually return the required auth details to log in on the client side
Users should use the fireauth web createuser api for the front end
*/

// export async function create(req: Request, res: Response) {

//     try {

//         //default role
//         const role = 'user';

//         //create a constant to store the request body
//         const { displayName, email } = req.body

//         //if any of the required fields are empty
//         if (!displayName || !email) {

//             //send 400 error to client
//             return res.status(400).send({ message: 'Missing fields' })
//         }


//         //create and store the user
//         const { uid } = await admin.auth().createUser({
//             displayName,
//             password: Math.random().toString(36).replace('0.', ''),
//             email
//         })

//         //set the custom role claim
//         await admin.auth().setCustomUserClaims(uid, { role })

//         //create new connection to DB
//         const connection = await connect();

//         //get the user repository
//         const repo = connection.getRepository(User);

//         //create a new user
//         const newUser = new User();

//         //parse data from func parameters
//         //uuid from fireauth
//         newUser.UUID = uid;

//         //name is the display name
//         newUser.name = displayName;

//         //save the user in DB
//         const savedUser = await repo.save(newUser);


//         //send success message to cleint
//         return res.status(201).send({ uid, savedUser })
//     } catch (err) {
//         return handleError(res, err)
//     }
// }

//lists all the users in fire auth
// export async function all(req: Request, res: Response) {
//     try {
//         const listUsers = await admin.auth().listUsers()
//         const users = listUsers.users.map(mapUser)
//         return res.status(200).send(users)
//     } catch (err) {
//         return handleError(res, err)
//     }
// }





//get details of specific user with id
// export async function get(req: Request, res: Response) {
//     try {
//         const { id } = req.params
//         const user = await admin.auth().getUser(id)
//         return res.status(200).send({ user: mapUser(user) })
//     } catch (err) {
//         return handleError(res, err)
//     }
// }

function mapUser(user: admin.auth.UserRecord) {
    
    //store the custom claims
    const customClaims = (user.customClaims || { role: '' }) as { role?: string }
    
    //if the role doesnt exist on the user account, return role not set
    const role = customClaims.role ? customClaims.role : 'Role Not Set'
    return {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        role,
        lastSignInTime: user.metadata.lastSignInTime,
        creationTime: user.metadata.creationTime
    }
}

// //update user
// export async function patch(req: Request, res: Response) {
//     try {
//         const { uid } = req.params
//         const { displayName, email, role } = req.body

//         if (!uid || !displayName || !email || !role) {
//             return res.status(400).send({ message: 'Missing fields' })
//         }

//         await admin.auth().updateUser(uid, { displayName, email })
//         await admin.auth().setCustomUserClaims(uid, { role })

//         const user = await admin.auth().getUser(uid)

//            const connection = await connect();

//             const userRepo = connection.getRepository(User);

//             const updateUser = await userRepo.findOne({UUID: uid});
//             updateUser.name = displayName


//             await userRepo.save(updateUser);

//         return res.status(204).send({ user: mapUser(user) })
//     } catch (err) {
//         return handleError(res, err)
//     }
// }

//remove user
export async function remove(req: Request, res: Response) {
    try {
        const { id } = req.params
        await admin.auth().deleteUser(id)
        return res.status(204).send({})
    } catch (err) {
        return handleError(res, err)
    }
}

function handleError(res: Response, err: any) {
    return res.status(500).send({ message: `${err.code} - ${err.message}` });
}

//get all users from database
// export async function getFromDB(req: Request, res: Response) {



// }

//get specific user from db with name