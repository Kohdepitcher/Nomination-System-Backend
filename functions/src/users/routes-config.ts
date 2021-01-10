import { Application } from "express";
// import { create } from "./controller";
// import { all } from "./controller";
// import { get } from "./controller";
// import { patch } from "./controller";
import { remove } from "./controller";

import { isAuthenticated } from "../auth/authenticated";
import { isAuthorized } from "../auth/authorized";

//import the user controller
import { userController } from '../users/controller'
import { AuthRoles } from "../globals";

export function routesConfig(app: Application) {
    
    // creates user
    app.post('/users', [
       isAuthenticated,
       isAuthorized({ hasRole: ['admin', 'manager'] }),
       new userController().createUser
    ]);

     //DONT USE - FOR TESTING ONLY
     app.post('/user-in-db/', [
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'manager'], allowSameUser: true }),
        new userController().createUserInDB
    ]);

    // lists all users
    app.get('/users', [
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'manager'], allowSameUser: true }),
        new userController().getAllUsers
    ]);

    // get :id user
    app.get('/users/:uid', [
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'manager'], allowSameUser: true }),
        new userController().getUser
    ]);

    // updates :id user
    // app.patch('/users/:uid', [
    //     isAuthenticated,
    //     isAuthorized({ hasRole: ['admin', 'manager'], allowSameUser: true }),
    //     patch
    // ]);

    app.patch('/users/self_patch/', [
        isAuthenticated,
        isAuthorized({ hasRole: [AuthRoles.Admin, AuthRoles.Trainer], allowSameUser: true}),
        new userController().updateUser
    ])

    // deletes :id user
    app.delete('/users/:uid', [
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'manager'] }),
        remove
    ]);
 }