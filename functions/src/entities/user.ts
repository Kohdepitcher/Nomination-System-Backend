import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, BeforeInsert, BeforeUpdate, OneToMany } from "typeorm";
import { AuthRoles } from "../globals";
import { Nomination } from './nomination'

@Entity()
export class User extends BaseEntity {

    //Primary key
    @PrimaryGeneratedColumn()
    userID: number;

    //name of the user
    @Column({ nullable: false, default: 'Not Set' })
    name: string;

    //links the firebase auth user account to matching user entry in the db
    @Column({ nullable: false })
    UUID: string;

    //store the user roll in the db
    //set a default value to lowest roll
    @Column({ nullable: false, default: AuthRoles.Trainer })
    role: AuthRoles;

    /*
        Relationships
        * one to many between nominations and users, i.e. a user can have many nominations but a nomination can only have a single user
    */
    @OneToMany(type => Nomination, nomination => nomination.user)
    nominations: Nomination[]

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

        
    }

    //modify data before updating
    @BeforeUpdate()
    updateModifiedDate() {
        this.modifiedAt = new Date();
    }

}
