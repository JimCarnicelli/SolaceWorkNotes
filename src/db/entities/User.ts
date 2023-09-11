import 'reflect-metadata';
import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AppDataSource } from '../db';
import {v4 as uuid} from 'uuid';

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    public id!: string;

    @Column({
        length: 50,
    })
    public firstName!: string;

    @Column({
        length: 50,
    })
    public lastName!: string;

    @Column()
    public age!: number;

    @CreateDateColumn()
    public createdAt!: Date;

    @UpdateDateColumn()
    public updatedAt!: Date;

    @BeforeInsert()
    addId() {
        this.id = uuid();
    }
}

export async function doAThing() {

    const userRepository = AppDataSource.getRepository(User)

    const user = new User();
    user.firstName = 'Timber';
    user.lastName = 'Saw';
    user.age = 25;
    await userRepository.save(user);

    const allUsers = await userRepository.find();
    const firstUser = await userRepository.findOneBy({
        id: 'xyz',
    });  // find by id
    const timber = await userRepository.findOneBy({
        firstName: 'Timber',
        lastName: 'Saw',
    });  // find by firstName and lastName

    if (timber)
        await userRepository.remove(timber);

}