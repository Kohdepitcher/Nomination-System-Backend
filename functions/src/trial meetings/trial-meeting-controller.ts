import { Request, Response } from "express";
// import * as admin from 'firebase-admin'

import { connect } from '../config';

//trial date entity
import { TrialMeeting } from "../entities/trialDate";

//import { MoreThanOrEqual } from "typeorm";
//import { LessThanOrEqual } from "typeorm";



//CREATE
//create trial date
export async function createTrialMeeting(request: Request, response: Response) {

    const { date, closeDate, startTime, location, distance } = request.body;

    //if the id hasn't been set
    if (!date || !closeDate|| !location || !startTime || !distance) {
        return response.status(400).send({ message: 'Missing fields' })
    }

    try {
        const connection = await connect();

        const repo = connection.getRepository(TrialMeeting);

        const newTrialMeeting = new TrialMeeting();

        //parse the date string from the body into a date object
        newTrialMeeting.date = new Date(Date.parse(date));

         //parse the date string from the body into a date object
         newTrialMeeting.closeDate = new Date(Date.parse(closeDate));

        //set the location to the passed location string in the body
        newTrialMeeting.location = location;

         //set the start time from body
         newTrialMeeting.startTime = startTime;

         //set the distance from the body
         newTrialMeeting.distance = distance;

        const savedTrialMeeting = await repo.save(newTrialMeeting);

        return response.status(200).send(savedTrialMeeting);

    } catch (error) {
        return handleError(response, error)
    }

};

//UPDATE
//update specific trial date
export async function updateTrialMeeting(request: Request, response: Response) {

    //get the trial id from the request query
    const { meetingId } = request.params
    console.log(meetingId)

    const { date, closeDate, startTime, location, distance } = request.body;

    //if the id hasn't been set
    if (!date || !closeDate|| !location || !startTime || !distance) {
        return response.status(400).send({ message: 'Missing fields' })
    }

    try {
        const connection = await connect();

        const TrialMeetingRepo = connection.getRepository(TrialMeeting);

        const updatedTrialMeeting = await TrialMeetingRepo.findOne(meetingId);

        updatedTrialMeeting.date = new Date(Date.parse(date));
        updatedTrialMeeting.closeDate = new Date(Date.parse(closeDate));
        updatedTrialMeeting.location = location;
        updatedTrialMeeting.distance = distance;
        updatedTrialMeeting.startTime = startTime;


        const savedTrialMeeting = await TrialMeetingRepo.save(updatedTrialMeeting);

        return response.status(200).send(savedTrialMeeting);

    } catch (error) {
        return handleError(response, error);
    }

};




//READ
//get all trial dates after date
//used on the nomination page to show next 5 upcoming trials
export async function getTrialMeetings(request: Request, response: Response) {

    try {
        //query parameters
        const fromDate  = request.query.fromDate;//query.fromDate;
        const beforeDate = request.query.beforeDate;

        console.log(fromDate);
        console.log(beforeDate);

        console.log(request.query)


        const connection = await connect();
        const TrialMeetingRepo = connection.getRepository(TrialMeeting);

        

        //Get all rows
        var allTrialMeetings: TrialMeeting[]// = await TrialMeetingRepo.find();

        if (request.query.fromDate && request.query.beforeDate) {

            allTrialMeetings = await TrialMeetingRepo.createQueryBuilder('meeting')
                .select()
                .where('meeting.date BETWEEN :fromDate AND :toDate', { fromDate: fromDate, toDate: beforeDate })
                //.andWhere('meeting.date <= :toDate', { toDate: beforeDate })
                .getMany()

            // allTrialMeetings = await TrialMeetingRepo.find({

            //     //only where the dates are greater than passed date
            //     where: [
            //         // { date: MoreThanOrEqual(Date.parse(fromDate)) },
            //         { date: LessThanOrEqual(Date.parse(toDate)) }
            //     ],



            //     //oder by the date
            //     order: {
            //         date: 'ASC'
            //     },

            //     //skip none
            //     skip: 0,

            // })
        } else {
            allTrialMeetings = await TrialMeetingRepo.find();
        }

        response.status(200).send(allTrialMeetings);

    } catch (error) {
        handleError(response, error);
    }





};

//get all trial dates after date
export async function getTrialMeetingsAfterDate(request: Request, response: Response) {
    console.log("getting t")


    //query parameters
    const { afterDate } = request.query;
    console.log("fetching trial meetings after " + afterDate)

    //db connection
    const connection = await connect();

    //trial meeting repo
    const TrialMeetingRepo = connection.getRepository(TrialMeeting);

    // Get all rows
    const allTrialMeetingsAfterDate = await TrialMeetingRepo.createQueryBuilder('trialMeeting')
        .where('trialMeeting.date => :date', { date: new Date(Date.parse(afterDate)) })//{ date: (this.afterDate, 'YYYY-MM-DD HH:MM:SS')}) //new Date(Date.parse(afterDate).)})
        .limit(30)
        .getMany()


    response.send(allTrialMeetingsAfterDate);

};

//Get trials meetings from date to date
export async function getTrialMeetingsBetween(request: Request, response: Response) {

    //query parameters
    //fromDate
    const { fromDate } = request.query;
    const { toDate } = request.query;

    if (!fromDate) {
        return response.status(400).send({ message: 'Missing fields' })
    }

    if (!toDate) {
        return response.status(400).send({ message: 'Missing fields' })
    }

    // Get all rows
    var allTrialMeetings: TrialMeeting[]// = await TrialMeetingRepo.find();

    return allTrialMeetings;

    // try {
    //     const connection = await connect();
    //     const TrialMeetingRepo = connection.getRepository(TrialMeeting);

    //     allTrialMeetings = await TrialMeetingRepo.createQueryBuilder('trialMeeting')
    //     .select()
    //     .where('trialMeeting.date >= :date', { date: new Date(Date.parse(fromDate)) })
    //     .andWhere('trialMeeting.date <= :date', { date: new Date(Date.parse(toDate)) })
    //     .getMany()


    // } catch (error) {
    //     return handleError(response, error)
    // }

    // return response.status(200).send(allTrialMeetings);
}

//get specific trial date using an ID
export async function getSpecificTrialMeeting(request: Request, response: Response) {

    //get the trial id from the request query
    const { meetingId } = request.params
    console.log(meetingId)

    //if the id hasn't been set
    if (!meetingId) {
        return response.status(400).send({ message: 'Missing fields' })
    }

    try {
        const connection = await connect();
        const TrialMeetingRepo = connection.getRepository(TrialMeeting);

        // Get single row that matches
        const allTrialMeetings = await TrialMeetingRepo.findOne(meetingId);

        return response.status(200).send(allTrialMeetings);

    } catch (error) {
        return handleError(response, error)
    }

};

//delete specific trial date
export async function deleteTrialMeeting(request: Request, response: Response) {

    try {

        //get the trial id from the request query
        const { meetingId } = request.params
        console.log(meetingId)

        //if the id hasn't been set
        if (!meetingId) {
            return response.status(400).send({ message: 'Missing fields' })
        }

        const connection = await connect();

        const TrialMeetingRepo = connection.getRepository(TrialMeeting);

        const toBeDeletedTrialMeeting = await TrialMeetingRepo.findOne(meetingId);

        const deletedTrialMeeting = await TrialMeetingRepo.remove(toBeDeletedTrialMeeting);

        return response.status(200).send(deletedTrialMeeting);

    } catch (error) {
        return handleError(response, error)
    }

};

function handleError(res: Response, err: any) {
    return res.status(500).send({ message: `${err.code} - ${err.message}` });
}