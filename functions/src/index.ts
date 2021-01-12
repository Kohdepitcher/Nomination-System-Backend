
//import the neccessary firebase APIs
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

//import dependencies
import * as express from 'express';


import * as cors from 'cors';
import * as bodyParser from 'body-parser';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


// import { connect } from './config';

// //trial date entity
// import { TrialMeeting } from './entities/trialDate';
// import { Nomination } from './entities/nomination'
//import admin = require('firebase-admin');

//import routes for the API
import { routesConfig } from './routes/users-routes-config';
import { trialRoutesConfig } from "./trial meetings/trial-meeting-routes-config";
import {nominationRoutesConfig} from './nominations/nomination-routes-config'


//////////////////////////////////////////////////
//      Setting up the firebase admin API       //
//////////////////////////////////////////////////

/*
    For local testing, we need to use the service account key,
    but this needs to be removed since firebase server will not be able to find this and the server should already have the same key locally
*/

//reference to the service account private key location
var serviceAccount = require("/Users/kohdepitcher/Downloads/rjc-trial-nominations-firebase-adminsdk-fja4z-18004e30c7.json");

//initialise the admin API
admin.initializeApp({
    //projectId: "pure-wall-267514",
    //serviceAccountId: "firebase-adminsdk-fja4z@rjc-trial-nominations.iam.gserviceaccount.com",
    credential: admin.credential.cert(serviceAccount),//.applicationDefault(),//.cert(serviceAccount),
  databaseURL: "https://rjc-trial-nominations.firebaseio.com"
});

//////////////////////////////////
//      SETTING UP EXPRESS      //
//////////////////////////////////

//create an instance of express
const app = express();

//tell express what extra libraries are needed to be included
app.use(bodyParser.json());
app.use(cors({ origin : true}));

//set up routes routes for express to use
routesConfig(app);
trialRoutesConfig(app);
nominationRoutesConfig(app);

//finally create a HTTPS endpoint for express
export const api = functions.https.onRequest(app)


// //create trial date
// export const createTrialMeeting = functions.https.onRequest(async (request, response) => {

//     const { date, location } = request.body;

//     try {
//         const connection = await connect();

//         const repo = connection.getRepository(TrialMeeting);

//         const newTrialMeeting = new TrialMeeting();

//         //parse the date string from the body into a date object
//         newTrialMeeting.date = new Date(Date.parse(date));

//         //set the location to the passed location string in the body
//         newTrialMeeting.location = location;


//         const savedTrialMeeting = await repo.save(newTrialMeeting);

//         response.send(savedTrialMeeting);

//     } catch (error) {
//         response.send(error)
//     }

// });

// //update specific trial date
// export const updateTrialMeeting = functions.https.onRequest(async (request, response) => {

//     const { id, date, location } = request.body;

//     try {
//         const connection = await connect();

//         const TrialMeetingRepo = connection.getRepository(TrialMeeting);

//         const updatedTrialMeeting = await TrialMeetingRepo.findOne(id);
//         updatedTrialMeeting.date = new Date(Date.parse(date));
//         updatedTrialMeeting.location = location;


//         const savedTrialMeeting = await TrialMeetingRepo.save(updatedTrialMeeting);

//         response.send(savedTrialMeeting);

//     } catch (error) {
//         response.send(error)
//     }

// });


// //get all trial dates
// export const getTrialMeetings = functions.https.onRequest(async (request, response) => {

//     const connection = await connect();
//     const TrialMeetingRepo = connection.getRepository(TrialMeeting);

//     // Get all rows
//     const allTrialMeetings = await TrialMeetingRepo.find();

//     response.send(allTrialMeetings);

// });

// //get specific trial date

// //delete specific trial date



// //Nomination functions
// //create trial date
// export const createNominaton = functions.https.onRequest(async (request, response) => {

//     const { jockey, horseName, horseAge, horseClass, trialMeetingID } = request.body;

//     try {
//         const connection = await connect();

//         const repo = connection.getRepository(Nomination);

//         const newNomination = new Nomination();
//         newNomination.jockey = jockey
//         newNomination.horseName = horseName
//         newNomination.horseAge = horseAge
//         newNomination.horseClass = horseClass

//         //foreign key for a trial meeting primary key
//         newNomination.trialDate = trialMeetingID
        
//         const savedNomination = await repo.save(newNomination);

//         response.send(savedNomination);

//     } catch (error) {
//         response.send(error);
//         console.log(error);
//     }

// });

// //update specific nomination
// export const updateNomination = functions.https.onRequest(async (request, response) => {

//     const { id, jockey, horseName, horseAge, horseClass, trialMeetingID } = request.body;

//     try {
//         const connection = await connect();

//         //create a nominaiton repo
//         const nominationRepo = connection.getRepository(Nomination);

//         //find the selected nomination according to id
//         const updatedNomination = await nominationRepo.findOne(id);
//         updatedNomination.jockey = jockey;
//         updatedNomination.horseName = horseName;
//         updatedNomination.horseAge = horseAge;
//         updatedNomination.horseClass = horseClass;
//         updatedNomination.trialDate = trialMeetingID
        


//         const savedTrialMeeting = await nominationRepo.save(updatedNomination);

//         response.send(savedTrialMeeting);

//     } catch (error) {
//         response.send(error)
//     }

// });

// //get all nominations
// export const getAllNominations = functions.https.onRequest(async (request, response) => {

//     const connection = await connect();
//     const nominationRepo = connection.getRepository(Nomination);

//     // Get all rows
//     const allTrialMeetings = await nominationRepo
//     .createQueryBuilder('nomination')
//     .leftJoinAndSelect('nomination.trialDate', 'TrialMeeting')
//     .getMany();

//     response.send(allTrialMeetings);

// });