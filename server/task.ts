import { TaskModel } from "./models/task";
import { GenezioAuth, GenezioDeploy, GnzContext } from "@genezio/types";
import { DataTypes, Sequelize } from "sequelize";
import * as pg from "pg";

export type Task = {
  id: number;
  title: string;
  ownerId: string;
  solved: boolean;
  date: Date;
};

/**
 * The Task server class that will be deployed on the genezio infrastructure.
 */
@GenezioDeploy()
export class TaskService {
  dbConnected: Promise<void>;

  constructor() {
    this.dbConnected = new Promise<void>(async (resolve) => {
        const urlPostgresqlEmail = process.env.TODO_LIST_DB_DATABASE_URL!;
          const sequelize = new Sequelize(urlPostgresqlEmail, {
              dialect: "postgres",
              define: {
                  timestamps: false,
              },
              logging: false,
              dialectOptions: {
                  ssl: {
                      require: true,
                  },
              },
              dialectModule: pg.Client,
          });

          TaskModel.init(
              {
                  id: {
                      type: DataTypes.INTEGER,
                      autoIncrement: true,
                      primaryKey: true,
                  },
                  ownerId: {
                      type: DataTypes.STRING,
                  },
                  title: {
                      type: DataTypes.STRING,
                      unique: true,
                  },
                  date: DataTypes.DATE,
                  solved: DataTypes.BOOLEAN,
              },
              {
                  sequelize: sequelize,
                  modelName: "Task",
                  tableName: "tasks",
              },
          );
          console.log("Connecting to the database");
          const connect = await sequelize?.sync().catch((error) => {
              console.error(error);
              process.exit(1);
          });

          if (connect == null) {
              console.error("Error connecting to the database");
              return;
          } else {
              console.log("Connected to the database postgresql google");
          }

          resolve();
      });
  }

  /**
   * Method that returns all tasks for a giving user ID.
   * Only authenticated users with a valid token can access this method.
   *
   * The method will be exported via SDK using genezio.
   *
   * @returns An object containing two properties: { success: true, tasks: tasks }
   */
  @GenezioAuth()
  async getAllTasksByUser(
    context: GnzContext
  ): Promise<Task[]> {
      await this.dbConnected;
      const userId = context.user!.userId;
      console.log(`Get all tasks by user request received with userID ${userId}`);

      const tasks = (await TaskModel.findAll({ where: { ownerId: context.user!.userId } }))
      .map((task) => ({
          title: task.title,
          ownerId: task.ownerId,
          solved: task.solved,
          date: task.date,
          id: task.id,
      }));

      return tasks;
  }

  /**
   * Method that creates a task for a giving user ID.
   * Only authenticated users with a valid token can access this method.
   *
   * The method will be exported via SDK using genezio.
   *
   * @param {*} title The tasktitle.
   * @returns An object containing the newly created task.
   */
  @GenezioAuth()
  async createTask(
    context: GnzContext,
    title: string,
  ): Promise<Task> {
      const task = await TaskModel.create({
        title: title,
        ownerId: context.user!.userId,
      });

    return {
        title: title,
        ownerId: context.user!.userId,
        id: task.id,
        solved: false,
        date: new Date(),
    };
  }

  /**
   * Method that creates a task for a giving user ID.
   * Only authenticated users with a valid token can access this method.
   *
   * The method will be exported via SDK using genezio.
   *
   * @param {*} id The task's id.
   * @param {*} title The task's title.
   * @param {*} solved If the task is solved or not.
   * @returns An object containing two properties: { success: true }
   */
  @GenezioAuth()
  async updateTask(
    context: GnzContext,
    id: number,
    title: string,
    solved: boolean
  ): Promise<void> {
      console.log(context.user!.userId);
      await TaskModel.update(
        {
          title: title,
          solved: solved,
        }, {
            where: {
                id: id,
                ownerId: context.user!.userId,
            },
        }
      );
  }

  /**
   * Method that deletes a task for a giving user ID.
   * Only authenticated users with a valid token can access this method.
   *
   * The method will be exported via SDK using genezio.
   *
   * @param {*} id The task id.
   * @returns An object containing one property: { success: true }
   */
  @GenezioAuth()
  async deleteTask(context: GnzContext, id: number): Promise<void> {
    await TaskModel.destroy({ where: { id: id, ownerId: context.user!.userId } });
  }
}
