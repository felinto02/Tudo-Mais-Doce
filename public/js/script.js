// ========== CARREGAR CONFIGURAÇÕES DO ADMIN ========== //
function loadAdminConfig() {
    const appData = JSON.parse(localStorage.getItem('appData')) || {};
    
    // Atualizar Cardápio
    if (document.querySelector('.cardapio-index-container')) {
        // Taxa de Entrega
        if (appData.config?.taxaEntrega) {
            document.getElementById('taxa-entrega').textContent = 
                appData.config.taxaEntrega.toFixed(2).replace('.', ',');
        }
        
        // Tempo de Entrega
        const tempoEntregaElement = document.querySelector('.cardapio-info-cardapio .info-item:nth-child(2) span');
        if (tempoEntregaElement && appData.config?.tempoEntrega) {
            tempoEntregaElement.textContent = `Entrega aproximada ${appData.config.tempoEntrega} min.`;
        }
        
        // Telefone
        const telefoneElement = document.querySelector('.cardapio-info-cardapio .info-item:nth-child(1) span');
        if (telefoneElement && appData.config?.telefone) {
            telefoneElement.textContent = appData.config.telefone;
        }
    }
}
  
  
  
  // ... (todo o conteúdo atual do seu script.js)
document.addEventListener("DOMContentLoaded", function () {
    loadAdminConfig();
    function atualizarStatusLoja() {
        const agora = new Date();
        const horaAtual = agora.getHours();

        // Elementos do status da loja
        const statusLoja = document.getElementById('index-status-loja');
        const statusTexto = document.getElementById('index-status-texto');

        // Verifica se os elementos existem antes de acessá-los
        if (statusLoja && statusTexto) {
            if (horaAtual >= 8 && horaAtual < 20) {
                statusLoja.classList.remove('offline');
                statusLoja.classList.add('online'); // Adiciona classe "online"
                statusTexto.textContent = 'Loja Aberta';
            } else {
                statusLoja.classList.remove('online');
                statusLoja.classList.add('offline'); // Mantém "offline"
                statusTexto.textContent = 'Loja Fechada';
            }
        } else {
            console.error("Erro: Elementos não encontrados no DOM. Verifique se os IDs estão corretos.");
        }
    }

    // Chama a função ao carregar a página
    atualizarStatusLoja();

    // Atualiza o status a cada minuto (60.000ms = 1 min)
    setInterval(atualizarStatusLoja, 60000);


    
    // ========== Lógica de Resumo do Pedido ========== 
    const resumoPedido = document.getElementById("pedido-resumo-pedido");
    if (resumoPedido) { 
        const pedido = JSON.parse(localStorage.getItem("pedido"));

        if (pedido && pedido.produto) {
            const taxaEntrega = pedido.taxaEntrega || 0.0; 
            const valorTotal = pedido.total; 

            resumoPedido.innerHTML = `
                <li><span>Produto:</span> <span>${pedido.produto}</span></li>
                <li><span>Quantidade:</span> <span>${pedido.quantidade}</span></li>
                <li><span>Creme:</span> <span>${pedido.creme}</span></li>
                <li><span>Acréscimos:</span> <span>${pedido.acrescimos?.length > 0 ? `R$ ${pedido.acrescimos.reduce((total, a) => total + parseFloat(a), 0).toFixed(2)}` : "Nenhum"}</span></li>
                <li><span>Observações:</span> <span>${pedido.observacao || "Nenhuma"}</span></li>
                <li><span>Preço Unitário:</span> <span>R$ ${pedido.precoUnitario.toFixed(2)}</span></li>
                <li><span>Taxa de Entrega:</span> <span>R$ ${taxaEntrega.toFixed(2)}</span></li>
                <li><span class="valor-total">Valor Total:</span> <span class="valor-total">R$ ${valorTotal.toFixed(2)}</span></li>
            `;
        } else {
            resumoPedido.innerHTML = "<li><span>Nenhum pedido encontrado.</span></li>";
        }
    }

    // ========== Lógica do Cardápio ========== 
    const precoProdutoElement = document.querySelector(".cardapio-product-preco");
    const cardapioTotalElement = document.getElementById("cardapio-total");
    const checkboxes = document.querySelectorAll(".cardapio-acrescimo-check");
    const quantityElement = document.getElementById("cardapio-quantity");
    const btnComprar = document.getElementById("btn-comprar");

    let quantidade = 1;
    const precoUnitario = parseFloat(
        precoProdutoElement.textContent
            .replace("R$", "")
            .replace(",", ".")
    );

    // ========== Funções de Controle ========== 
    function updateQuantityAndPrice() {
        let totalOpcoes = 0;
        
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                totalOpcoes += parseFloat(checkbox.dataset.preco);
            }
        });

        const total = (precoUnitario * quantidade) + totalOpcoes;
        quantityElement.textContent = quantidade;
        cardapioTotalElement.textContent = total.toFixed(2).replace(".", ",");
    }

    updateQuantityAndPrice();

    window.increaseQuantity = () => {
        quantidade++;
        updateQuantityAndPrice();
    };

    window.decreaseQuantity = () => {
        if (quantidade > 1) {
            quantidade--;
            updateQuantityAndPrice();
        }
    };

    // ========== Validação do Creme ==========
    function validarCompra() {
        const cremeSelect = document.getElementById("cardapio-creme");
        if (cremeSelect.value === "") {
            Swal.fire({
                icon: 'warning',
                title: 'Atenção!',
                text: 'Por favor, escolha o creme antes de prosseguir.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#ff9800'
            });
            return false;
        }
        return true;
    }

    // ========== Event Listeners ========== 
    document.querySelectorAll(".cardapio-qtd-btn").forEach(btn => {
        btn.addEventListener("click", updateQuantityAndPrice);
    });

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", updateQuantityAndPrice);
    });

    // ========== Event Listener do Botão Comprar ==========
    if (btnComprar) {
        btnComprar.addEventListener("click", (e) => {
            e.preventDefault();
            if (validarCompra()) {
                // Lógica de compra válida
                const cremeSelect = document.getElementById("cardapio-creme");
                const cremeTexto = cremeSelect.options[cremeSelect.selectedIndex].text;
                const taxaEntrega = parseFloat(
                    document.getElementById("taxa-entrega").textContent.replace(",", ".")
                );

                const pedido = {
                    produto: "Salada de Frutas",
                    quantidade: quantidade,
                    creme: cremeTexto,
                    observacao: document.getElementById("cardapio-observacao").value,
                    precoUnitario: precoUnitario,
                    acrescimos: Array.from(checkboxes)
                        .filter(checkbox => checkbox.checked)
                        .map(checkbox => parseFloat(checkbox.dataset.preco)),
                    taxaEntrega: taxaEntrega,
                    total: parseFloat(cardapioTotalElement.textContent.replace(",", ".")) + taxaEntrega,
                };

                localStorage.setItem("pedido", JSON.stringify(pedido));
                window.location.href = "pedido.html";
            }
        });
    }
});
    



// ========== BUSCA DE CEP ==========
const cepInput = document.getElementById("pedido-cep");
const searchIcon = document.getElementById("cep-search-icon");

if (cepInput && searchIcon) {
    // Formatação do CEP durante a digitação
    cepInput.addEventListener("input", function(e) {
        let cep = e.target.value.replace(/\D/g, "");
        if (cep.length > 5) {
            cep = cep.substring(0, 5) + "-" + cep.substring(5);
        }
        e.target.value = cep;
        
        // Busca automática quando completo
        if (cep.length === 9) {
            buscarCEP(cep.replace("-", ""));
        }
    });

    // Busca manual pelo ícone
    searchIcon.addEventListener("click", function() {
        const cep = cepInput.value.replace("-", "");
        buscarCEP(cep);
    });

    // Validação de entrada numérica
    cepInput.addEventListener("keypress", function(e) {
        if (!/[0-9]/.test(e.key)) {
            e.preventDefault();
        }
    });
}

function buscarCEP(cep) {
    // Verificação de elementos primeiro
    const elementosEndereco = {
        logradouro: document.getElementById("pedido-logradouro"),
        bairro: document.getElementById("pedido-bairro"),
        cidade: document.getElementById("pedido-cidade"),
        uf: document.getElementById("pedido-uf")
    };

    // Validação inicial
    if (!cep || cep.length !== 8) {
        Swal.fire({
            icon: "warning",
            title: "CEP inválido!",
            text: "Por favor, insira um CEP válido (8 dígitos).",
        });
        return;
    }

    // Verifica se elementos existem
    if (!Object.values(elementosEndereco).every(el => el)) {
        console.error("Elementos do endereço não encontrados!");
        return;
    }

    searchIcon.classList.add("fa-spin");

    fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then(response => {
        if (!response.ok) throw new Error("Erro na conexão");
        return response.json();
    })
    .then(data => {
        if (data.erro) {
            Swal.fire({
                icon: "error",
                title: "CEP não encontrado",
                text: "Verifique o número digitado."
            });
            limparCamposEndereco();
        } else {
            // Preenche os campos com verificação
            elementosEndereco.logradouro.value = data.logradouro || "";
            elementosEndereco.bairro.value = data.bairro || "";
            elementosEndereco.cidade.value = data.localidade || "";
            elementosEndereco.uf.value = data.uf || "";
        }
    })
    .catch(error => {
        console.error("Erro:", error);
        Swal.fire({
            icon: "error",
            title: "Falha na busca",
            text: "Serviço indisponível. Tente novamente mais tarde."
        });
    })
    .finally(() => {
        searchIcon.classList.remove("fa-spin");
    });
}

// Função auxiliar para limpar campos
function limparCamposEndereco() {
    const campos = ["pedido-logradouro", "pedido-bairro", "pedido-cidade", "pedido-uf"];
    campos.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) campo.value = "";
    });
}

    // ========== MASCARA DE NOME JUSTIFY ================//
    window.onload = function () {
        const inputNome = document.getElementById("pedido-nome");
        const inputComplemento = document.getElementById("pedido-complemento");
    
        // Lista de exceções (artigos, preposições, conjunções)
        const excecoes = ["da", "de", "e", "do", "a", "as", "o", "os", "em", "para", "com"];
    
        // Função para formatar o nome
        function formatarNome(nome) {
            return nome
                .split(" ")  // Dividir o nome em palavras
                .map(function (palavra, index) {
                    // Se a palavra for uma exceção, não capitaliza
                    if (excecoes.includes(palavra.toLowerCase()) && index !== 0) {
                        return palavra.toLowerCase();  // Deixa em minúsculas se for exceção
                    }
                    return palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase();  // Capitaliza normalmente
                })
                .join(" ");  // Junta as palavras de volta em uma string
        }
    
        // Função para configurar a formatação
        function configurarFormatacao(input) {
            if (input) {
                input.addEventListener("input", function () {
                    let posicaoCursor = this.selectionStart;
                    let valorFormatado = formatarNome(this.value);
                    this.value = valorFormatado;
                    this.setSelectionRange(posicaoCursor, posicaoCursor);  // Manter o cursor no mesmo local
                });
    
                input.addEventListener("keydown", function (event) {
                    if (event.key === " ") {
                        let posicaoCursor = this.selectionStart;
                        this.value = this.value.substring(0, posicaoCursor) + " " + this.value.substring(posicaoCursor);
                        this.setSelectionRange(posicaoCursor + 1, posicaoCursor + 1);  // Manter o cursor após o espaço
                        event.preventDefault();
                    }
                });
            }
        }
    
        // Chama a função para os inputs
        configurarFormatacao(inputNome);
        configurarFormatacao(inputComplemento);
    };
    

    // ========== MASCARA DE TELEFONE ================//
    function mascaraTelefone(input) {
        let valor = input.value.replace(/\D/g, '');
        if (valor.length <= 2) {
            input.value = `(${valor}`;
        } else if (valor.length <= 7) {
            input.value = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
        } else {
            input.value = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7, 11)}`;
        }
    };

// ========== MENSAGEM DE CAMPOS OBRIGATORIOS E BOTÃO ================//
document.getElementById('pedido-btn').addEventListener('click', function(event) {
    event.preventDefault();  // Previne o envio do formulário para validar antes
    
    // Lista de campos obrigatórios
    const camposObrigatorios = [
        'pedido-cep', 'pedido-logradouro', 'pedido-numero', 'pedido-bairro', 'pedido-cidade', 'pedido-uf',
        'pedido-nome', 'pedido-telefone'
    ];
    
    let todosPreenchidos = true;

    for (let campo of camposObrigatorios) {
        const input = document.getElementById(campo);
        if (!input.value.trim()) {
            todosPreenchidos = false;
            break;
        }
    }

    // Validação específica do telefone
    const telefoneInput = document.getElementById('pedido-telefone');
    const telefoneNumerico = telefoneInput.value.replace(/\D/g, ''); // Remove tudo que não for número
    if (telefoneNumerico.length !== 11) {
        todosPreenchidos = false;
    }

    if (!todosPreenchidos) {
        // Alerta de erro caso falte algum campo ou telefone esteja incompleto
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Todos os campos são obrigatórios!',
            confirmButtonText: 'OK'
        });
    } else {
        // Alerta de confirmação caso todos os campos estejam preenchidos corretamente
        Swal.fire({
            title: "Deseja realmente fazer o pedido?",
            text: "Verifique as informações antes de confirmar.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sim, confirmar pedido",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                // Obter o valor total do pedido
                const pedido = JSON.parse(localStorage.getItem("pedido"));
                const valorTotal = pedido?.total || 0;
                
                // Mostrar modal do Pix
                showPixPaymentModal(valorTotal);
            }
        });
    }
});

// ========== MODAL DE PAGAMENTO PIX ================//
function showPixPaymentModal(valorTotal) {
    // Configuração do modal
    Swal.fire({
        title: 'Pagamento via Pix',
        html: `
            <div class="payment-info">
                <div class="info-item">
                    <span class="info-label">Valor:</span> R$ ${valorTotal.toFixed(2)}
                </div>
                <div class="info-item">
                    <span class="info-label">Tempo restante:</span>
                    <div class="timer" id="modalCountdown">10:00</div>
                </div>
            </div>
            
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=00020101021226930014br.gov.bcb.pix2566qrcodepix-h.mercadopago.com/instore/o/v2/d6a0b8b8f8b14a5a9a2e5a5a5a5a5a5a5204000053039865405${valorTotal.toFixed(2).replace('.', '')}5802BR5925MERCADO%20PAGO%20LTDA6009SAO%20PAULO62070503***6304A8B2" 
                 class="qr-code" alt="QR Code Pix">
            
            <p style="text-align: center; margin-bottom: 10px;">Ou copie o código abaixo:</p>
            <input type="text" class="pix-code" value="00020101021226930014br.gov.bcb.pix2566qrcodepix-h.mercadopago.com/instore/o/v2/d6a0b8b8f8b14a5a9a2e5a5a5a5a5a5a5204000053039865405${valorTotal.toFixed(2).replace('.', '')}5802BR5925MERCADO PAGO LTDA6009SAO PAULO62070503***6304A8B2" readonly>
            <button class="copy-btn" onclick="copyPixCode()">Copiar Código</button>
        `,
        showConfirmButton: false,
        showCancelButton: false, // Removido o botão Fechar conforme solicitado
        allowOutsideClick: false,
        didOpen: () => {
            // Inicia o temporizador quando o modal abre
            startTimer(600, document.getElementById('modalCountdown'));
        }
    });
}

// Função para copiar o código Pix
function copyPixCode() {
    const pixCode = document.querySelector('.pix-code');
    pixCode.select();
    document.execCommand('copy');
    
    // Feedback visual
    const copyBtn = document.querySelector('.copy-btn');
    copyBtn.textContent = 'Código copiado!';
    copyBtn.style.backgroundColor = '#2ecc71';
    
    setTimeout(() => {
        copyBtn.textContent = 'Copiar Código';
        copyBtn.style.backgroundColor = '#3498db';
    }, 2000);
}

// Temporizador de contagem regressiva
function startTimer(duration, display) {
    let timer = duration, minutes, seconds;
    const interval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        
        display.textContent = minutes + ":" + seconds;
        
        if (--timer < 0) {
            clearInterval(interval);
            display.textContent = "Expirado";
            display.style.color = "#e74c3c";
        }
    }, 1000);
}

// Torna a função acessível globalmente para o botão no modal
window.copyPixCode = copyPixCode;

// ========== FUNÇÃO PARA LIMPAR OS CAMPOS ============
function limparCampos() {
    // Limpa os campos de texto
    document.querySelectorAll('input').forEach(input => input.value = '');
}

