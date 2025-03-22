import sequelize from './sequelize';

sequelize.authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
  })
  .catch((error) => {
    console.error('Erro ao conectar com o banco de dados:', error);
  });
