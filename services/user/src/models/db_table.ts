import AppDataSource from "../config/data-source";
const queryRunner = AppDataSource.createQueryRunner();

async function checkTables() {
    await AppDataSource.initialize();
  await queryRunner.connect();
  const tables = await queryRunner.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
  );
  console.log("Tables:", tables);
  await queryRunner.release();
}

checkTables();
