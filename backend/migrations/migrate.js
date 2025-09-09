const { createTables } = require('./init');

async function runMigration() {
  console.log('🔄 Iniciando migração do banco de dados...');
  
  try {
    await createTables();
    console.log('✅ Migração concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    process.exit(1);
  }
}

runMigration();
