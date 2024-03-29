import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, BeforeInsert, BeforeUpdate, OneToMany } from "typeorm";
import { Nomination } from './nomination'

@Entity()
export class TrialMeeting extends BaseEntity {

    //primary key
    @PrimaryGeneratedColumn()
    meetingId: number;

    //date that the trials are on
    @Column('datetime')
    date: Date;
    
    //closing date for nomination
    @Column('datetime')
    closeDate: Date;

    //where the trials are located
    @Column()
    location: string;


    //starting time for the location
    @Column()
    startTime: string;

    //distance for the meeting
    @Column()
    distance: string;

    //created at time stamp
    @Column('datetime')
    createdAt: Date;

    //updated at time stamp
    @Column('datetime')
    modifiedAt: Date;

    //Relationships
    //NOTE: a cascade deletion exists between meetings and nominations so that when a meeting is removed so will all the nominations for it
    @OneToMany(type => Nomination, nomination => nomination.trialDate, {cascade: true, onDelete: "CASCADE"})
    nominations: Nomination[]

    //add data before insertion
    @BeforeInsert()
    addTimestamp() {
        this.createdAt = new Date();
        this.modifiedAt = new Date();
    }

    //modify data before updating
    @BeforeUpdate()
    updateModifiedDate() {
        this.modifiedAt = new Date();
    }

}