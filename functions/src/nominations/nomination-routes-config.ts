import { Application } from "express";

import { NominationController } from './nominaiton-controller'

import { getSpecificNomination } from '../nominations/nominaiton-controller'

import { isAuthenticated } from "../auth/authenticated";
import { isAuthorized } from "../auth/authorized";



export function nominationRoutesConfig(app: Application) {
    
    // creates nomination
    app.post('/nominations',
       isAuthenticated,
       isAuthorized({ hasRole: ['admin', 'manager', 'user'] }),
       new NominationController().createNominationForMeeting
   );

   app.post('/nominations/on-behalf-of-trainer',
       isAuthenticated,
       isAuthorized({ hasRole: ['admin', 'manager', 'user'] }),
       new NominationController().createNominationForMeetingOnBehalfOfTrainer
   );

    // lists all nominations
    app.get('/nominations/', [
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'manager'] }),
        new NominationController().getNominationsForMeetingID
    ]);

    // get :id nomination
    app.get('/nominations/:nominationId', [
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'manager'], allowSameUser: true }),
        getSpecificNomination
    ]);

    app.get('/nominations/group-trainers-count/:meetingID', [
        // isAuthenticated,
        // isAuthorized({ hasRole: ['admin', 'manager'], allowSameUser: true }),
        new NominationController().getTrainersAndNominationsCountForMeeting
    ]);

    // updates :id nomination
    app.patch('/nominations/:nominationID', [
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'manager', 'user'], allowSameUser: true }),
        new NominationController().updateNomination
    ]);

    // deletes :id nomination 
    // app.delete('/nominations/:nominationId', [
    //     isAuthenticated,
    //     isAuthorized({ hasRole: ['admin', 'manager'] }),
    //     //deleteTrialMeeting
    // ]);
 }