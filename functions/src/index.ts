
//import the neccessary firebase APIs
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

//import dependencies
import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';


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
//create a json body parser
app.use(bodyParser.json());
app.use(cors({ origin : true}));

//set up routes routes for express to use
routesConfig(app);
trialRoutesConfig(app);
nominationRoutesConfig(app);

//finally create a HTTPS endpoint for express
export const api = functions.https.onRequest(app)

