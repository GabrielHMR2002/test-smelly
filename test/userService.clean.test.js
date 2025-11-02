const { UserService } = require('../src/userService');

describe('UserService - Criar Usuário (Limpo)', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  test('deve criar usuário com dados válidos', () => {
    // Arrange
    const nome = 'João Silva';
    const email = 'joao@example.com';
    const idade = 25;

    // Act
    const user = userService.createUser(nome, email, idade);

    // Assert
    expect(user).toBeDefined();
    expect(user.nome).toBe(nome);
    expect(user.email).toBe(email);
    expect(user.idade).toBe(idade);
    expect(user.status).toBe('ativo');
    expect(user.id).toBeDefined();
  });

  test('deve criar usuário com flag de admin quando especificado', () => {
    // Arrange
    const nome = 'Admin User';
    const email = 'admin@example.com';
    const idade = 30;
    const isAdmin = true;

    // Act
    const user = userService.createUser(nome, email, idade, isAdmin);

    // Assert
    expect(user.isAdmin).toBe(true);
  });

  test('deve lançar erro ao criar usuário sem nome', () => {
    // Arrange
    const email = 'test@example.com';
    const idade = 25;

    // Act & Assert
    expect(() => {
      userService.createUser('', email, idade);
    }).toThrow('Nome, email e idade são obrigatórios.');
  });

  test('deve lançar erro ao criar usuário sem email', () => {
    // Arrange
    const nome = 'João Silva';
    const idade = 25;

    // Act & Assert
    expect(() => {
      userService.createUser(nome, '', idade);
    }).toThrow('Nome, email e idade são obrigatórios.');
  });

  test('deve lançar erro ao criar usuário menor de 18 anos', () => {
    // Arrange
    const nome = 'Menor de Idade';
    const email = 'menor@example.com';
    const idade = 17;

    // Act & Assert
    expect(() => {
      userService.createUser(nome, email, idade);
    }).toThrow('O usuário deve ser maior de idade.');
  });

  test('deve aceitar usuário com exatamente 18 anos', () => {
    // Arrange
    const nome = 'Usuario 18 anos';
    const email = 'usuario18@example.com';
    const idade = 18;

    // Act
    const user = userService.createUser(nome, email, idade);

    // Assert
    expect(user).toBeDefined();
    expect(user.idade).toBe(18);
  });
});

describe('UserService - Buscar Usuário Por ID (Limpo)', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  test('deve retornar usuário existente pelo ID', () => {
    // Arrange
    const nome = 'Maria Santos';
    const email = 'maria@example.com';
    const idade = 28;
    const createdUser = userService.createUser(nome, email, idade);

    // Act
    const foundUser = userService.getUserById(createdUser.id);

    // Assert
    expect(foundUser).toBeDefined();
    expect(foundUser.id).toBe(createdUser.id);
    expect(foundUser.nome).toBe(nome);
    expect(foundUser.email).toBe(email);
  });

  test('deve retornar nulo para ID de usuário inexistente', () => {
    // Arrange
    const nonExistentId = 'id-inexistente-123';

    // Act
    const foundUser = userService.getUserById(nonExistentId);

    // Assert
    expect(foundUser).toBeNull();
  });

  test('deve retornar nulo para ID vazio', () => {
    // Arrange
    const emptyId = '';

    // Act
    const foundUser = userService.getUserById(emptyId);

    // Assert
    expect(foundUser).toBeNull();
  });
});

describe('UserService - Desativar Usuário (Limpo)', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  test('deve desativar usuário não-admin com sucesso', () => {
    // Arrange
    const nome = 'Carlos Silva';
    const email = 'carlos@example.com';
    const idade = 25;
    const user = userService.createUser(nome, email, idade, false);

    // Act
    const result = userService.deactivateUser(user.id);

    // Assert
    expect(result).toBe(true);
    expect(user.status).toBe('inativo');
  });

  test('não deve desativar usuário admin', () => {
    // Arrange
    const nome = 'Admin User';
    const email = 'admin@example.com';
    const idade = 30;
    const user = userService.createUser(nome, email, idade, true);

    // Act
    const result = userService.deactivateUser(user.id);

    // Assert
    expect(result).toBe(false);
    expect(user.status).toBe('ativo');
  });

  test('deve retornar falso ao desativar usuário inexistente', () => {
    // Arrange
    const nonExistentId = 'id-inexistente-999';

    // Act
    const result = userService.deactivateUser(nonExistentId);

    // Assert
    expect(result).toBe(false);
  });

  test('deve manter os dados do usuário intactos após desativação', () => {
    // Arrange
    const nome = 'Pedro Costa';
    const email = 'pedro@example.com';
    const idade = 22;
    const user = userService.createUser(nome, email, idade);
    const originalId = user.id;

    // Act
    userService.deactivateUser(user.id);

    // Assert
    expect(user.id).toBe(originalId);
    expect(user.nome).toBe(nome);
    expect(user.email).toBe(email);
    expect(user.status).toBe('inativo');
  });
});

describe('UserService - Gerar Relatório de Usuários (Limpo)', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  test('deve gerar relatório com mensagem quando não há usuários', () => {
    // Arrange
    // (banco vazio após beforeEach)

    // Act
    const report = userService.generateUserReport();

    // Assert
    expect(report).toContain('--- Relatório de Usuários ---');
    expect(report).toContain('Nenhum usuário cadastrado.');
  });

  test('deve gerar relatório com um único usuário', () => {
    // Arrange
    const nome = 'João Silva';
    const email = 'joao@example.com';
    const idade = 25;
    const user = userService.createUser(nome, email, idade);

    // Act
    const report = userService.generateUserReport();

    // Assert
    expect(report).toContain('--- Relatório de Usuários ---');
    expect(report).toContain(`ID: ${user.id}`);
    expect(report).toContain(`Nome: ${nome}`);
    expect(report).toContain('Status: ativo');
  });

  test('deve gerar relatório com múltiplos usuários', () => {
    // Arrange
    const user1 = userService.createUser('Alice', 'alice@example.com', 25);
    const user2 = userService.createUser('Bob', 'bob@example.com', 30);

    // Act
    const report = userService.generateUserReport();

    // Assert
    expect(report).toContain('Alice');
    expect(report).toContain('Bob');
    expect(report).toContain(user1.id);
    expect(report).toContain(user2.id);
  });

  test('deve mostrar status correto para usuários inativos no relatório', () => {
    // Arrange
    const user = userService.createUser('User Inativo', 'inativo@example.com', 25);
    userService.deactivateUser(user.id);

    // Act
    const report = userService.generateUserReport();

    // Assert
    expect(report).toContain('User Inativo');
    expect(report).toContain('Status: inativo');
  });

  test('deve incluir o cabeçalho no relatório', () => {
    // Arrange
    userService.createUser('Test User', 'test@example.com', 25);

    // Act
    const report = userService.generateUserReport();

    // Assert
    expect(report).toMatch(/^--- Relatório de Usuários ---/);
  });
});

describe('UserService - Testes de Integração (Limpo)', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  test('deve criar múltiplos usuários com IDs únicos', () => {
    // Arrange
    const user1Data = { nome: 'User 1', email: 'user1@example.com', idade: 25 };
    const user2Data = { nome: 'User 2', email: 'user2@example.com', idade: 30 };

    // Act
    const user1 = userService.createUser(user1Data.nome, user1Data.email, user1Data.idade);
    const user2 = userService.createUser(user2Data.nome, user2Data.email, user2Data.idade);

    // Assert
    expect(user1.id).toBeDefined();
    expect(user2.id).toBeDefined();
    expect(user1.id).not.toBe(user2.id);
  });

  test('deve manter a consistência dos dados após múltiplas operações', () => {
    // Arrange
    const nome = 'Test User';
    const email = 'test@example.com';
    const idade = 25;

    // Act
    const createdUser = userService.createUser(nome, email, idade);
    const retrievedUser = userService.getUserById(createdUser.id);
    const deactivationResult = userService.deactivateUser(createdUser.id);
    const report = userService.generateUserReport();

    // Assert
    expect(retrievedUser.id).toBe(createdUser.id);
    expect(deactivationResult).toBe(true);
    expect(report).toContain('Status: inativo');
  });

  test('deve tratar usuários admin e não-admin de forma diferente', () => {
    // Arrange
    const adminUser = userService.createUser('Admin', 'admin@example.com', 30, true);
    const normalUser = userService.createUser('Normal', 'normal@example.com', 25, false);

    // Act
    const adminDeactivation = userService.deactivateUser(adminUser.id);
    const normalDeactivation = userService.deactivateUser(normalUser.id);

    // Assert
    expect(adminDeactivation).toBe(false);
    expect(adminUser.status).toBe('ativo');
    expect(normalDeactivation).toBe(true);
    expect(normalUser.status).toBe('inativo');
  });
});