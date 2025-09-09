const { createTables } = require('./init-neon');

async function runMigration() {
  console.log('🚀 Iniciando migração para Neon DB...');
  console.log('📍 Database URL:', process.env.DATABASE_URL ? 'Configurado' : 'Não configurado');
  
  try {
    await createTables();
    console.log('✅ Migração concluída com sucesso!');
    
    if (process.env.NODE_ENV === 'production') {
      console.log('🌐 Banco de dados pronto para produção!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    console.error('💡 Verifique se a DATABASE_URL está configurada corretamente');
    process.exit(1);
  }
}

runMigration();
