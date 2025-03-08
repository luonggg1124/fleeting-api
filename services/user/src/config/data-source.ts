import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();
export default new DataSource({
  type: "postgres",
  url: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false
  },  
  synchronize: true, 
  logging: true,
  entities: ["src/models/entities/**/*.ts"],
  migrations: ["src/models/migrations/**/*.ts"],
  subscribers: [],
  extra: {
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  }
})
