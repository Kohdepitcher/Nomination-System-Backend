import { Application } from "express";

import { getAllNominations, createNominaton, getSpecificNomination, updateNomination} from '../nominations/nominaiton-controller'

import { isAuthenticated } from "../auth/authenticated";
import { isAuthorized } from "../auth/authorized";



export function nominationRoutesConfig(app: Application) {
    
    // creates nomination
    app.post('/nominations',
       isAuthenticated,
       isAuthorized({ hasRole: ['admin', 'manager', 'user'] }),
       createNominaton
   );

    // lists all nominations
    app.get('/nominations', [
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'manager'] }),
        getAllNominations
    ]);

    // get :id nomination
    app.get('/nominations/:nominationId', [
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'manager'], allowSameUser: true }),
        getSpecificNomination
    ]);

    // updates :id nomination
    app.patch('/nominations/:nominationId', [
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'manager', 'user'], allowSameUser: true }),
        updateNomination
    ]);

    // deletes :id nomination
    // app.delete('/nominations/:nominationId', [
    //     isAuthenticated,
    //     isAuthorized({ hasRole: ['admin', 'manager'] }),
    //     //deleteTrialMeeting
    // ]);
 }