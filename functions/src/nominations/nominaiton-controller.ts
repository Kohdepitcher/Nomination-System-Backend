import { Request, Response } from "express";
// import * as admin from 'firebase-admin'

import { connect } from '../config';

//trial date entity
//import { TrialMeeting } from "../entities/trialDate";
import { Nomination } from '../entities/nomination'
import { TrialMeeting } from "../entities/trialDate";
// import { TrialMeeting } from "../entities/trialDate";
import { User } from '../entities/user'

//import { Equal} from "typeorm";

export class NominationController {
    
    //CREATE
    /*
    This method is designed to create Nominations for a specific Trial Meeting
    
    NOTE: This method requires the following in the body
    Horse Name - Name of the horse
    Horse Age - How old the horse is
    Horse Class - The class of the horse
    Jockey - Name of the jockey ridding the horse
    Meeting ID - the ID for the meeting that is being nominated for
    
    This method will deny any nominations after the closing time
    as its intended to be used by trainers
    */
    async createNominationForMeeting(request: Request, response: Response) {
        
        //body elements
        const { jockey, horseName, horseAge, horseClass, trialMeetingID } = request.body;
        
        //Throw 400 response errors for required missing body parts
        if (!horseName) {
            return response.status(400).send({ message: 'Missing name for the horse' })
        }
        
        if (!horseAge) {
            return response.status(400).send({ message: 'Missing age for the horse: ' + horseName })
        }
        
        if (!horseClass) {
            return response.status(400).send({ message: 'Missing class for the horse: ' + horseName })
        }
        
        if (!trialMeetingID) {
            return response.status(400).send({ message: 'Missing the ID of the Jumpouts that are being nominated for' })
        }
        
        
        try {
            
            //create DB Connection
            const connection = await connect();
            
            //Repos
            const meetingRepo = connection.getRepository(TrialMeeting);
            const userRepo = connection.getRepository(User)
            const nominationRepo = connection.getRepository(Nomination);
            
            //Get the matching jumpout meeting
            const matchingMeeting = await meetingRepo.findOne(trialMeetingID);
            
            //if the matching meeting is null, respond with an 400 error
            if(!matchingMeeting) {
                return response.status(400).send({ message: 'No jumpouts where found for ID: ' + trialMeetingID });
            }
            
            //check if the UTC time is past the UTC cut off time for the selected jumpouts
            //if so send back an error message
            if (new Date() > matchingMeeting.closeDate) {
                return response.status(400).send({ message: 'Sorry, nominations have closed for these Jumpouts' })
            }
            
            //get the trainer for nomination
            const matchingUser = await userRepo.findOne({ where: { UUID: response.locals.uid } })
            
            //if the matching user is null, respond with an 400 error
            if(!matchingUser) {
                return response.status(400).send({ message: 'No user was found for ID: ' + response.locals.uid });
            }
            
            
            
            //create new nomination
            var newNomination = new Nomination();
            
            //set the properties
            newNomination.horseName = horseName;
            newNomination.horseAge = horseAge;
            newNomination.horseClass = horseClass;
            newNomination.jockey = jockey;
            
            //set the jumpouts for the nomination
            newNomination.trialDate = matchingMeeting;
            
            //set the trainer for the nomination
            newNomination.user = matchingUser;
            
            const savedNomination = nominationRepo.save(newNomination);
            
            return response.status(200).send(savedNomination);
            
        } catch (err) {
            return handleError(response, err);
        }
        
    }

    //READ

    /*
        Get all nominations for meeting

        Note: this method requires the following request parameters
            Trial ID - the id of the meeting to fetch nominations for
    */
   async getNominationsForMeetingID(request: Request, response: Response) {

    //query parameters
    const { trialID } = request.query;

    //Throw 400 response errors for required missing query parts
    if (!trialID) {
        return response.status(400).send({ message: 'Missing ID for the jumpouts' })
    }

    try {

        //create a new db connection
        const connection = await connect();

        //repos
        const nominationRepo = connection.getRepository(Nomination);

        //create an array to store the fetched nominations
        var allNominations: Nomination[]

        allNominations = await nominationRepo
        .createQueryBuilder('nomination')
        .leftJoinAndSelect('nomination.trialDate', 'TrialMeeting')
        .leftJoinAndSelect('nomination.user', 'User')
        .where('nomination.trialDate.meetingId = :id', { id: trialID})
        .getMany();

        return response.status(200).send(allNominations);

    } catch (err) {
        return handleError(response, err);
    }  
    
   }

   /*
        This method returns all the trainers who have nominated for a jumpout and how many nominations they have made

   */
  async getTrainersAndNominationsCountForMeeting(request: Request, response: Response) {
    
    const { meetingID } = request.params;

    //Throw 400 response errors for required missing query parts
    if (!meetingID) {
        return response.status(400).send({ message: 'Missing ID for the jumpouts' })
    }
    
    try {
        
        const connection = await connect();
        const nominationRepo = connection.getRepository(Nomination);
        // const meetingRepo = connection.getRepository(TrialMeeting);
        
        let groupedAndCounted = await nominationRepo.createQueryBuilder('nomination')
        
        //join on trial meeting
        .leftJoin('nomination.trialDate', "trialDate")
        
        //join on user
        .leftJoinAndSelect('nomination.user', 'User')
        
        //select distinct just user name and count of userIDs in nominations as count
        .select(['DISTINCT(User.name)', 'COUNT(User.userID) AS count'])
        
        //group by name of the user
        .groupBy('user.name')
        
        //only execute for the meeting that matches the meetingID
        .where('trialDate.meetingID = :id', { id: meetingID })
        
        //filter out scratched nominations
        .andWhere('nomination.isScratched = false')
        
        //return raw result since it doesnt match an entity
        .getRawMany()
        
        //send the array to the client
        return response.status(200).send(groupedAndCounted);
        
    } catch (error) {
        return handleError(response, error)
    }
    
}
    
}

//create a trial date
//requires trial ID, User UUID, horse name, horse age, horse class, jockey
export async function createNominaton (request: Request, response: Response) {
    
    const { jockey, horseName, horseAge, horseClass, trialMeetingID } = request.body;
    
    if ( !jockey || !horseName || !horseAge || !horseClass || !trialMeetingID) {
        return response.status(400).send({ message: 'Missing fields' })
    }
    
    const newNomination = new Nomination();
    
    // try {
    
    // } catch (error) {
    
    // }
    
    try {
        
        //create a new DB connection
        const connection = await connect();
        
        //get the nomination repo
        const nominationRepo = connection.getRepository(Nomination);
        
        //get the user repository
        const userRepo = connection.getRepository(User)
        .createQueryBuilder("user")
        .where("user.UUID = :UUID", {UUID: response.locals.uid})
        .getOne();
        
        
        
        
        newNomination.jockey = jockey;
        newNomination.horseName = horseName;
        newNomination.horseAge = horseAge;
        newNomination.horseClass = horseClass;
        
        //foreign key for a trial meeting primary key
        newNomination.trialDate = trialMeetingID;
        
        //foreign key for the user
        newNomination.user = await userRepo;
        
        //save the nomination in the system
        const savedNomination = await nominationRepo.save(newNomination);
        
        return response.status(200).send(savedNomination);
        
    } catch (error) {
        return handleError(response, error)
        console.log(error);
    }
    
};

//update specific nomination
export async function updateNomination (request: Request, response: Response) {
    
    //get the trial id from the request query
    const {nominationId} = request.params
    console.log(nominationId)
    
    const {jockey, horseName, horseAge, horseClass, isScratched, trialMeetingID } = request.body;
    
    if ( !nominationId || !jockey || !horseName || !horseAge || !horseClass || !isScratched || !trialMeetingID) {
        return response.status(400).send({ message: 'Missing fields' })
    }
    
    try {
        const connection = await connect();
        
        //create a nominaiton repo
        const nominationRepo = connection.getRepository(Nomination);
        
        //find the selected nomination according to id
        const updatedNomination = await nominationRepo.findOne(nominationId);
        updatedNomination.jockey = jockey;
        updatedNomination.horseName = horseName;
        updatedNomination.horseAge = horseAge;
        updatedNomination.horseClass = horseClass;
        updatedNomination.isScratched = isScratched
        updatedNomination.trialDate = trialMeetingID
        
        
        
        const savedTrialMeeting = await nominationRepo.save(updatedNomination);
        
        return response.status(200).send(savedTrialMeeting);
        
    } catch (error) {
        return handleError(response, error)
    }
    
};

//get all nominations
export async function getAllNominations (request: Request, response: Response) {
    
    //query parameters
    const {trialID} = request.query;
    
    
    const connection = await connect();
    const nominationRepo = connection.getRepository(Nomination);
    
    // Get all rows
    var allNominations: Nomination[]
    
    if (trialID != null) {
        allNominations = await nominationRepo
        .createQueryBuilder('nomination')
        .leftJoinAndSelect('nomination.trialDate', 'TrialMeeting')
        .leftJoinAndSelect('nomination.user', 'User')
        .where('nomination.trialDate.meetingId = :id', { id: trialID})
        .getMany();
        // allNominations = await nominationRepo.find({
        
        //     //only where the dates are greater than passed date
        //     where: {
        //         //date: MoreThan(new Date(Date.parse(afterDate)))
        //         trialDate: Equal(trialID)
        //     },
        
        //     //oder by the date
        //     // order: {
        //     //     //date: 'ASC'
        //     // },
        
        //     //skip none
        //     //skip: 0,
        
        //     //first 5 as decided by order vy
        //     //take: 5
        
        // })
    } else {
        allNominations = await nominationRepo
        .createQueryBuilder('nomination')
        .leftJoinAndSelect('nomination.trialDate', 'TrialMeeting')
        .leftJoinAndSelect('nomination.user', 'User')
        .getMany();
    }
    
    
    
    response.status(200).send(allNominations);
    
};

//get all nominations
export async function getAllNominationsWithTrialDates (request: Request, response: Response) {
    
    
    const connection = await connect();
    const nominationRepo = connection.getRepository(Nomination);
    
    // Get all rows
    const allTrialMeetings = await nominationRepo
    .createQueryBuilder('nomination')
    .leftJoinAndSelect('nomination.trialDate', 'TrialMeeting')
    .leftJoinAndSelect('nomination.user', 'User')
    .getMany();
    
    response.status(200).send(allTrialMeetings);
    
};

//get specific nomination
export async function getSpecificNomination (request: Request, response: Response) {
    
    //get the nominaiton id from the request query
    const {nominationId} = request.params
    console.log(nominationId)
    
    
    if ( !nominationId) {
        return response.status(400).send({ message: 'Missing fields' })
    }
    
    const connection = await connect();
    const nominationRepo = connection.getRepository(Nomination);
    
    // Get all rows
    let specificNomination = await nominationRepo
    .createQueryBuilder('nomination')
    .where("nomination.nominationID = :id", { id: nominationId})
    .leftJoinAndSelect('nomination.trialDate', 'TrialMeeting')
    .getMany()
    
    
    
    return response.status(200).send(specificNomination);
    
};

export async function getTrainersAndNominationsCountForMeeting(request: Request, response: Response) {
    
    const {meetingID} = request.params;
    
    try {
        
        const connection = await connect();
        const nominationRepo = connection.getRepository(Nomination);
        // const meetingRepo = connection.getRepository(TrialMeeting);
        
        let groupedAndCounted = await nominationRepo.createQueryBuilder('nomination')
        
        //join on trial meeting
        .leftJoin('nomination.trialDate', "trialDate")
        
        //join on user
        .leftJoinAndSelect('nomination.user', 'User')
        
        //select distinct just user name and count of userIDs in nominations as count
        .select(['DISTINCT(User.name)', 'COUNT(User.userID) AS count'])
        
        //group by name of the user
        .groupBy('user.name')
        
        //only execute for the meeting that matches the meetingID
        .where('trialDate.meetingID = :id', { id: meetingID })
        
        //filter out scratched nominations
        .andWhere('nomination.isScratched = false')
        
        //return raw result since it doesnt match an entity
        .getRawMany()
        
        
        
        
        //send the array to the client
        return response.status(200).send(groupedAndCounted);
        
    } catch (error) {
        return handleError(response, error)
    }
    
}

//update specific nomination
export async function deleteNomination (request: Request, response: Response) {
    
    //get the trial id from the request query
    const {nominationId} = request.params
    console.log(nominationId)
    
    
    if ( !nominationId ) {
        return response.status(400).send({ message: 'Missing fields' })
    }
    
    try {
        const connection = await connect();
        
        //create a nominaiton repo
        const nominationRepo = connection.getRepository(Nomination);
        
        
        //find the selected nomination according to id
        const updatedNomination = await nominationRepo.findOne(nominationId);      
        
        
        const savedTrialMeeting = await nominationRepo.remove(updatedNomination);
        
        return response.status(200).send(savedTrialMeeting);
        
    } catch (error) {
        return handleError(response, error)
    }
    
};

//update specific nomination
export async function test (request: Request, response: Response) {
    
        return response.status(200).send(response.locals.role);
    
};

function handleError(res: Response, err: any) {
    return res.status(500).send({ message: `${err.code} - ${err.message}` });
}