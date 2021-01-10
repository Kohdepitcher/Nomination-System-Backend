import { Application } from "express";


import { isAuthenticated } from "../auth/authenticated";
import { isAuthorized } from "../auth/authorized";

import { getTrialMeetings, getSpecificTrialMeeting, createTrialMeeting, updateTrialMeeting, deleteTrialMeeting, getTrialMeetingsAfterDate,} from '../trial meetings/trial-meeting-controller';

export function trialRoutesConfig(app: Application) {
    
    // creates trial meeting
    app.post('/trial-meetings',
       isAuthenticated,
       isAuthorized({ hasRole: ['admin', 'manager'] }),
       createTrialMeeting
   );

    // lists all trial meetings
    app.get('/trial-meetings', [
        // isAuthenticated,
        // isAuthorized({ hasRole: ['admin', 'manager', 'user'] }),
        getTrialMeetings
    ]);

    // get specific trial meeting with :id
    app.get('/trial-meetings/:meetingId', [
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'manager', 'user'], allowSameUser: true }),
        getSpecificTrialMeeting
    ]);


     // get trial meetings after date
     app.get('/trial-meetings/specific?afterDate', [
        // isAuthenticated,
        // isAuthorized({ hasRole: ['admin', 'manager', 'user'], allowSameUser: true }),
        getTrialMeetingsAfterDate
    ]);

    // updates :id trial meeting
    app.patch('/trial-meetings/:meetingId', [
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'manager'], allowSameUser: true }),
        updateTrialMeeting
    ]);

    // deletes :id trial meeting
    app.delete('/trial-meetings/:meetingId', [
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'manager'] }),
        deleteTrialMeeting
    ]);
 }