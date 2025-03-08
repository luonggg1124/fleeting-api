import { DataSource } from "typeorm";
import dotenv from "dotenv";




dotenv.config();

export const AppDataSource = new DataSource({
  type: "mongodb",
  url: process.env.DB_URL, 
  synchronize: true, //false in production
  logging: true,
  database: "mail-fleeting",
  entities: ["./src/models/entities/**/*.ts"],
  migrations: ['./src/models/migrations/**/*.ts'],
});
