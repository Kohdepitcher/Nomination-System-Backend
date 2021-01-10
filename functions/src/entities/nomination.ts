import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, BeforeInsert, BeforeUpdate, ManyToOne } from "typeorm";

import { TrialMeeting } from './trialDate'
import { User } from './user'

@Entity()
export class Nomination extends BaseEntity {

    //Primary key
    @PrimaryGeneratedColumn()
    nominationID: number;

    //name of the jockey
    @Column()
    jockey: string;

    //name of the horse
    @Column()
    horseName: string;

    //age of the horse
    @Column()
    horseAge: number;

    //class of the horse
    @Column()
    horseClass: string;

    //scratching status of the horse
    @Column()
    isScratched: boolean;

    //Foreign Key
    // @Column()
    // trialMeetingID: number;

    //relationships
    @ManyToOne(type => TrialMeeting, trialMeeting => trialMeeting.nominations)
    trialDate: TrialMeeting;

    @ManyToOne(type => User, user => user.nominations)
    user: User;

    //created at time stamp
    @Column('datetime')
    createdAt: Date;

    //updated at time stamp
    @Column()
    modifiedAt: Date;

    //add data before insertion
    @BeforeInsert()
    setupDefaultValues() {
        this.createdAt = new Date();
        this.modifiedAt = new Date();

        this.isScratched = false;
    }

    //modify data before updating
    @BeforeUpdate()
    updateModifiedDate() {
        this.modifiedAt = new Date();
    }

}
