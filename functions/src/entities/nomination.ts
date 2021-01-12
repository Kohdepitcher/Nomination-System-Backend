import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, BeforeInsert, BeforeUpdate, ManyToOne } from "typeorm";

import { TrialMeeting } from './trialDate'
import { User } from './user'

@Entity()
export class Nomination extends BaseEntity {

    //Primary key
    @PrimaryGeneratedColumn()
    nominationID: number;

    //name of the jockey
    //can be null since it wont always be provided
    @Column({ nullable: true })
    jockey: string;

    //name of the horse
    //cant be null since horse names are required
    @Column({ nullable: false })
    horseName: string;

    //age of the horse
    //cant be null since age is required
    @Column({ nullable: false})
    horseAge: number;

    //class of the horse
    //cant be null since the class needs to be known
    @Column({ nullable: false })
    horseClass: string;

    //scratching status of the horse
    //scratched status cant be null but will have a default value of false upon insertion
    @Column({ nullable: false})
    isScratched: boolean;



    /*
        Relationships
    */
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
