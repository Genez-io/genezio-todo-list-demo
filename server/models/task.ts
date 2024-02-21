import { Model } from "sequelize";

export class TaskModel extends Model {
  id!: number;
  ownerId!: string;
  title!: string;
  date!: Date;
  solved!: boolean;
}
