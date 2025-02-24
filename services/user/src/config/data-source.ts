import { DataSource } from "typeorm";
import dotenv from "dotenv";



dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false
  },  
  synchronize: false, 
  logging: true,
  entities: ["./src/models/entities/**/*.ts"],
  migrations: ['./src/models/migrations/**/*.ts'],
  subscribers: ["./src/models/subscribers/**/*.ts"],
});
