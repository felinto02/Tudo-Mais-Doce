// admin.js - Script específico para a página de administração

// Estrutura padrão de dados
const DEFAULT_APP_DATA = {
    config: {
      horarioAbertura: "08:00",
      horarioFechamento: "20:00",
      telefone: "(00) 00000-0000",
      tempoEntrega: 30,
      taxaEntrega: 5.00,
      logoUrl: ""
    },
    produtos: [],
    porcoes: [],
    cremes: []
  };
  
  // Credenciais padrão
  const DEFAULT_CREDENTIALS = {
    username: "admin",
    password: "admin"
  };
  
  // Função para alternar visibilidade da senha
  function setupPasswordToggle() {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('admin-senha');
    
    if (togglePassword && passwordInput) {
      togglePassword.addEventListener('click', function() {
        // Alternar entre type password e text
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Alternar entre os ícones de olho aberto e fechado
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
      });
    }
  }
  
  // Função para máscara de telefone
  function mascaraTelefone(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor.length <= 2) {
      input.value = `(${valor}`;
    } else if (valor.length <= 7) {
      input.value = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
    } else {
      input.value = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7, 11)}`;
    }
  }
  
  // Funções principais
  function initLocalStorage() {
    if (!localStorage.getItem('appData')) {
      localStorage.setItem('appData', JSON.stringify(DEFAULT_APP_DATA));
    }
    
    if (!localStorage.getItem('adminCredentials')) {
      localStorage.setItem('adminCredentials', JSON.stringify(DEFAULT_CREDENTIALS));
    }
  }
  
  function setupLogin() {
    const loginModal = document.getElementById('admin-loginModal');
    const loginForm = document.getElementById('admin-loginForm');
    
    loginModal.style.display = 'flex';
    
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const username = document.getElementById('admin-login').value;
      const password = document.getElementById('admin-senha').value;
      const storedCredentials = JSON.parse(localStorage.getItem('adminCredentials'));
      
      if (username === storedCredentials.username && password === storedCredentials.password) {
        loginModal.style.display = 'none';
        document.getElementById('admin-content').style.display = 'block';
        document.getElementById('admin-usuarioAtual').value = storedCredentials.username;
      } else {
        document.getElementById('admin-loginError').textContent = 'Usuário ou senha incorretos';
      }
    });
  }
  
  function setupForms() {
    document.getElementById('admin-alterarSenhaForm').addEventListener('submit', handlePasswordChange);
    document.getElementById('admin-form-loja').addEventListener('submit', saveStoreConfig);
    document.getElementById('admin-form-contato').addEventListener('submit', saveContactInfo);
    document.getElementById('admin-form-produto').addEventListener('submit', saveProduct);
  }
  
  function loadExistingData() {
    const appData = JSON.parse(localStorage.getItem('appData'));
    
    if (appData.config) {
      document.getElementById('admin-horario-abertura').value = appData.config.horarioAbertura;
      document.getElementById('admin-horario-fechamento').value = appData.config.horarioFechamento;
      document.getElementById('admin-telefone').value = appData.config.telefone;
      document.getElementById('admin-tempo-entrega').value = appData.config.tempoEntrega;
      document.getElementById('admin-taxa-entrega').value = appData.config.taxaEntrega;
    }
    
    loadPorcoesList();
    loadCremesList();
  }
  
  // ... (mantenha todas as outras funções exatamente como estão)
  
  // Inicialização do documento - APENAS UM EVENT LISTENER
  document.addEventListener("DOMContentLoaded", function() {
    setupPasswordToggle(); // Adiciona o toggle da senha
    initLocalStorage();
    setupLogin();
    setupForms();
    loadExistingData();
  });
  
  // Exporte as funções necessárias para o escopo global
  window.mascaraTelefone = mascaraTelefone;
  window.abrirModalAlterarSenha = abrirModalAlterarSenha;
  window.fecharModalAlterarSenha = fecharModalAlterarSenha;
  window.adicionarPorcao = adicionarPorcao;
  window.adicionarCreme = adicionarCreme;
  window.updatePorcao = updatePorcao;
  window.removePorcao = removePorcao;
  window.updateCreme = updateCreme;
  window.removeCreme = removeCreme;