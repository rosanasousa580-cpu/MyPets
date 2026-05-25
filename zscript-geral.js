document.addEventListener("DOMContentLoaded", function() {

    // ==================================================
    //               ✅ FUNÇÕES GERAIS
    // ==================================================

    // ===== ELEMENTOS DO MENU E BOTÕES =====
    const btnMenu = document.getElementById('btnMenu');
    const menuLateral = document.getElementById('menuLateral');
    const fundoOverlay = document.getElementById('fundoOverlay');
    const btnAdicionar = document.getElementById('btnAdd');
    const overlayCadastro = document.querySelector('.overlay-cadastro');
    const fecharCadastro = document.querySelector('.fechar-cadastro');

    // ===== ABRIR E FECHAR MENU LATERAL =====
    if(btnMenu && menuLateral && fundoOverlay) {
        btnMenu.addEventListener('click', () => {
            menuLateral.classList.add('aberto');
            fundoOverlay.classList.add('visivel');
        });

        fundoOverlay.addEventListener('click', () => {
            menuLateral.classList.remove('aberto');
            fundoOverlay.classList.remove('visivel');
        });
    }

    // ===== ABRIR E FECHAR OVERLAY DE CADASTRO =====
    if(btnAdicionar && overlayCadastro) {
        btnAdicionar.addEventListener('click', () => {
            overlayCadastro.style.display = 'flex';
        });
    }

    if(fecharCadastro && overlayCadastro) {
        fecharCadastro.addEventListener('click', () => {
            overlayCadastro.style.display = 'none';
        });
    }

    // ===== SISTEMA DE CALENDÁRIO =====
    const diasContainer = document.querySelector('.grade-dias');
    const mesAnoTexto = document.querySelector('.cabecalho-calendario h3');
    const btnHoje = document.querySelector('.btn-hoje');
    const btnAntes = document.getElementById('btnAntes');
    const btnDepois = document.getElementById('btnDepois');

    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    let dataAtual = new Date();

    function criarCalendario(ano, mes) {
        if(!diasContainer) return; // Não executa se não tiver calendário
        
        diasContainer.innerHTML = '';
        
        const primeiroDia = new Date(ano, mes, 1).getDay();
        const diasNoMes = new Date(ano, mes + 1, 0).getDate();
        
        // Dias vazios no início
        for(let i = 0; i < primeiroDia; i++) {
            const vazio = document.createElement('div');
            diasContainer.appendChild(vazio);
        }
        
        // Renderizar os dias
        for(let dia = 1; dia <= diasNoMes; dia++) {
            const diaElemento = document.createElement('div');
            diaElemento.className = 'dia-calendario';
            
            const numero = document.createElement('div');
            numero.className = 'numero-dia';
            numero.textContent = dia;
            
            diaElemento.appendChild(numero);
            
            // Marcar dia atual
            if(dia === dataAtual.getDate() && mes === dataAtual.getMonth() && ano === dataAtual.getFullYear()) {
                diaElemento.classList.add('hoje');
            }
            
            diasContainer.appendChild(diaElemento);
        }
        
        // Atualizar título
        if(mesAnoTexto) {
            mesAnoTexto.textContent = `${meses[mes]} ${ano}`;
        }
    }

    // Iniciar Calendário
    if(diasContainer) {
        criarCalendario(dataAtual.getFullYear(), dataAtual.getMonth());
    }

    // Navegação
    if(btnAntes) {
        btnAntes.addEventListener('click', () => {
            dataAtual.setMonth(dataAtual.getMonth() - 1);
            criarCalendario(dataAtual.getFullYear(), dataAtual.getMonth());
        });
    }
    if(btnDepois) {
        btnDepois.addEventListener('click', () => {
            dataAtual.setMonth(dataAtual.getMonth() + 1);
            criarCalendario(dataAtual.getFullYear(), dataAtual.getMonth());
        });
    }
    if(btnHoje) {
        btnHoje.addEventListener('click', () => {
            dataAtual = new Date();
            criarCalendario(dataAtual.getFullYear(), dataAtual.getMonth());
        });
    }

    // ===== FILTROS =====
    const botoesFiltro = document.querySelectorAll('.filtro-btn');
    botoesFiltro.forEach(btn => {
        btn.addEventListener('click', () => {
            botoesFiltro.forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
        });
    });

    // ===== BOTÕES DE AÇÃO =====
    const botoesCheck = document.querySelectorAll('.btn-check');
    const botoesStatus = document.querySelectorAll('.btn-status');

    botoesCheck.forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.item-lista');
            if(item) item.classList.toggle('concluido');
        });
    });

    botoesStatus.forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('ativo');
            this.textContent = this.classList.contains('ativo') ? '✅ Ativo' : '⏸️ Inativo';
        });
    });


    // ==================================================
    //            ✅ FUNÇÕES DA TELA DE LOGIN
    // ==================================================

    // --- ELEMENTOS ---
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const btnEntrar = document.getElementById('btnEntrar');
    const btnCadastrar = document.getElementById('btnCadastrar');
    const btnGoogle = document.getElementById('btnGoogle');
    const olhoSenha = document.getElementById('olhoSenha');

    // --- MOSTRAR / ESCONDER SENHA ---
    if(olhoSenha && senhaInput) {
        olhoSenha.addEventListener('click', function() {
            if(senhaInput.type === 'password') {
                senhaInput.type = 'text';
                this.src = "img/olho-aberto.png";
            } else {
                senhaInput.type = 'password';
                this.src = "img/olho-fechado.png";
            }
        });
    }

    // --- LOGIN COM EMAIL E SENHA ---
    if(btnEntrar) {
        btnEntrar.addEventListener('click', function(e) {
            e.preventDefault();

            const email = emailInput.value.trim();
            const senha = senhaInput.value.trim();

            if(!email || !senha) {
                alert("⚠️ Preencha email e senha!");
                return;
            }

            auth.signInWithEmailAndPassword(email, senha)
            .then(() => {
                alert("✅ Login realizado com sucesso! 🎉");
                window.location.href = "home.html";
            })
            .catch(erro => {
                alert("❌ Erro: " + erro.message);
            });
        });
    }

    // --- CADASTRAR USUÁRIO ---
    if(btnCadastrar) {
        btnCadastrar.addEventListener('click', function(e) {
            e.preventDefault();

            const email = emailInput.value.trim();
            const senha = senhaInput.value.trim();

            if(!email || !senha) {
                alert("⚠️ Digite email e senha para cadastrar!");
                return;
            }

            auth.createUserWithEmailAndPassword(email, senha)
            .then((userCredential) => {
                alert("✅ Cadastro realizado! 🎉");
                window.location.href = "home.html";
            })
            .catch(erro => {
                alert("❌ Erro: " + erro.message);
            });
        });
    }

    // --- LOGIN COM GOOGLE ---
    if(btnGoogle) {
        btnGoogle.addEventListener('click', function() {
            const provider = new firebase.auth.GoogleAuthProvider();
            
            auth.signInWithPopup(provider)
            .then(() => {
                alert("✅ Login com Google realizado! 🎉");
                window.location.href = "home.html";
            })
            .catch(erro => {
                alert("❌ Erro: " + erro.message);
            });
        });
    }

    console.log('✅ Script Geral + Login carregado com sucesso!');

}); // ✅ FIM DO CÓDIGO UNIFICADO
