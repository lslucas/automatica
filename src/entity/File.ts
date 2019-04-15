import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";
import { FileGroup } from "../service/FileService";

@Entity()
export class File {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    group: FileGroup;

    @Column()
    name: string;

    @Column()
    createdAt: Date;

}
