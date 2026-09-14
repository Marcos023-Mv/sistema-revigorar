import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import logger from '../utils/logger';

async function sync() {
  try {
    await AppDataSource.initialize();
    logger.info('✓ Banco sincronizado com sucesso');
    logger.info('  Tabelas criadas:');
    const tables = AppDataSource.entityMetadatas.map(e => e.tableName);
    tables.forEach(t => logger.info(`    - ${t}`));
    await AppDataSource.destroy();
    process.exit(0);
  } catch (err) {
    logger.error('✗ Falha ao sincronizar banco:', err);
    process.exit(1);
  }
}

sync();
