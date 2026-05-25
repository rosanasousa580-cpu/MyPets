document.addEventListener("DOMContentLoaded", function() {

    // ✅ REFERÊNCIAS DO FIREBASE (Garantido que existem)
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- ELEMENTOS DA TELA ---
    const nomeUsuario = document.getElementById('nomeUsuario');
    const emailUsuario = document.getElementById('emailUsuario');
    const telefoneUsuario = document.getElementById('telefoneUsuario');
    const nascimentoUsuario = document.getElementById('nascimentoUsuario');
    const cidadeUsuario = document.getElementById('cidadeUsuario');
    const fotoUsuario = document.getElementById('fotoUsuario');
    const btnVoltar = document.getElementById('btnVoltar');
    const btnEditar = document.getElementById('btnEditar'); // Adicionei suporte ao botão de editar do HTML
    const btnTrocarSenha = document.getElementById('btnTrocarSenha');
    const btnSairConta = document.getElementById('btnSairConta');

    // ==============================================
    // ⚙️ FUNÇÕES AUXILIARES
    // ==============================================
    // Formatar data de ISO (yyyy-mm-dd) para BR (dd/mm/yyyy)
    function formatarDataBR(dataISO) {
        if (!dataISO) return "--";
        const [ano, mes, dia] = dataISO.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    // Máscara para telefone
    function formatarTelefone(texto) {
        if (!texto) return "--";
        return texto.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }

    // ==============================================
    // 🔙 BOTÃO VOLTAR
    // ==============================================
    if (btnVoltar) {
        btnVoltar.addEventListener('click', () => {
            window.history.back();
        });
    }

    // ==============================================
    // 🔐 VERIFICAÇÃO DE LOGIN
    // ==============================================
    auth.onAuthStateChanged(user => {
        if (user) {
            carregarDadosUsuario(user);
            criarModalEdicao(user); // Cria o modal dinamicamente
        } else {
            window.location.href = "index.html";
        }
    });

    // ==============================================
    // 📥 CARREGAR DADOS DO USUÁRIO
    // ==============================================
    function carregarDadosUsuario(user) {
        // Dados básicos do Auth
        if (nomeUsuario) nomeUsuario.textContent = user.displayName || "Usuário";
        if (emailUsuario) emailUsuario.textContent = user.email || "E-mail não cadastrado";
        if (fotoUsuario) fotoUsuario.src = user.photoURL || "https://via.placeholder.com/120/9b59b6/ffffff?text=👤";

        // Dados complementares do Firestore
        db.collection("usuarios").doc(user.uid).get()
        .then(doc => {
            if (doc.exists) {
                const dados = doc.data();
                if (telefoneUsuario) telefoneUsuario.textContent = formatarTelefone(dados.telefone);
                if (nascimentoUsuario) nascimentoUsuario.textContent = formatarDataBR(dados.nascimento);
                if (cidadeUsuario) cidadeUsuario.textContent = dados.cidade || "--";
            } else {
                // 🔹 Se não existir, cria o documento padrão no banco
                db.collection("usuarios").doc(user.uid).set({
                    nomeCompleto: user.displayName || "",
                    telefone: "",
                    nascimento: "",
                    cidade: "",
                    userId: user.uid
                });
            }
        })
        .catch(erro => {
            console.error("Erro ao carregar dados:", erro);
            alert("❌ Erro ao carregar dados: " + erro.message);
        });
    }

    // ==============================================
    // ✏️ FUNÇÃO DE EDITAR PERFIL (ADICIONADA E COMPLETA)
    // ==============================================
    function criarModalEdicao(usuarioLogado) {
        // Cria o HTML do Modal dinamicamente
        const overlay = document.createElement('div');
        overlay.className = 'overlay-editar';
        overlay.innerHTML = `
        <div class="container-editar">
            <h3>Editar Meu Perfil</h3>
            <form id="formEditarPerfil">
                <div class="form-grupo">
                    <label>Nome Completo</label>
                    <input type="text" id="editNome" required placeholder="Seu nome completo">
                </div>
                <div class="form-grupo">
                    <label>Telefone</label>
                    <input type="tel" id="editTelefone" placeholder="(00) 00000-0000">
                </div>
                <div class="form-grupo">
                    <label>Data de Nascimento</label>
                    <input type="date" id="editNascimento">
                </div>
                <div class="form-grupo">
                    <label>Cidade / UF</label>
                    <input type="text" id="editCidade" placeholder="Ex: Porto Alegre - RS">
                </div>
                <div class="botoes-form">
                    <button type="button" class="btn-cancelar" id="fecharEditar">Cancelar</button>
                    <button type="submit" class="btn-salvar">Salvar</button>
                </div>
            </form>
        </div>
        `;
        document.body.appendChild(overlay);

        const formEditar = document.getElementById('formEditarPerfil');
        const fecharEditar = document.getElementById('fecharEditar');

        // Abrir Modal ao clicar no botão de editar
        if (btnEditar) {
            btnEditar.addEventListener('click', () => {
                // Preenche os dados atuais no formulário antes de abrir
                db.collection("usuarios").doc(usuarioLogado.uid).get().then(doc => {
                    if (doc.exists) {
                        const dados = doc.data();
                        document.getElementById('editNome').value = dados.nomeCompleto || usuarioLogado.displayName || "";
                        document.getElementById('editTelefone').value = dados.telefone || "";
                        document.getElementById('editNascimento').value = dados.nascimento || "";
                        document.getElementById('editCidade').value = dados.cidade || "";
                    }
                });
                overlay.style.display = 'flex';
            });
        }

        // Fechar Modal
        fecharEditar.addEventListener('click', () => {
            overlay.style.display = 'none';
        });

        // SALVAR EDIÇÕES NO BANCO
        formEditar.addEventListener('submit', (e) => {
            e.preventDefault();

            const dadosAtualizados = {
                nomeCompleto: document.getElementById('editNome').value,
                telefone: document.getElementById('editTelefone').value.replace(/\D/g, ''), // Salva apenas números
                nascimento: document.getElementById('editNascimento').value,
                cidade: document.getElementById('editCidade').value,
                userId: usuarioLogado.uid
            };

            // Atualiza no Firestore
            db.collection("usuarios").doc(usuarioLogado.uid).set(dadosAtualizados, { merge: true })
            .then(() => {
                // Atualiza o nome de exibição da conta de autenticação também
                return usuarioLogado.updateProfile({
                    displayName: dadosAtualizados.nomeCompleto
                });
            })
            .then(() => {
                alert("✅ Perfil atualizado com sucesso!");
                overlay.style.display = 'none';
                carregarDadosUsuario(usuarioLogado); // Recarrega dados na tela
            })
            .catch(erro => {
                alert("❌ Erro ao salvar: " + erro.message);
            });
        });
    }

    // ==============================================
    // 🔑 TROCAR SENHA
    // ==============================================
    if (btnTrocarSenha) {
        btnTrocarSenha.addEventListener('click', () => {
            const user = auth.currentUser;
            if (user && user.email) {
                if (confirm("Um e-mail será enviado para redefinir sua senha. Deseja continuar?")) {
                    auth.sendPasswordResetEmail(user.email)
                    .then(() => {
                        alert("✅ E-mail enviado com sucesso! Verifique sua caixa de entrada.");
                    })
                    .catch(erro => {
                        alert("❌ Erro: " + erro.message);
                    });
                }
            } else {
                alert("❌ Erro: E-mail não cadastrado para esta conta.");
            }
        });
    }

    // ==============================================
    // 🚪 SAIR DA CONTA
    // ==============================================
    if (btnSairConta) {
        btnSairConta.addEventListener('click', () => {
            if (confirm("Tem certeza que deseja sair da conta?")) {
                auth.signOut().then(() => {
                    window.location.href = "index.html";
                })
                .catch(erro => {
                    alert("❌ Erro ao sair: " + erro.message);
                });
            }
        });
    }

    console.log('✅ Página Meu Perfil totalmente carregada e funcional!');

}); // ✅ FIM DO CÓDIGO
// ✅ MOSTRAR/ESCONDER CABEÇALHO AO PUXAR PARA BAIXO (ESTILO FACEBOOK)
let ultimoScroll = 0;
const cabecalho = document.querySelector('.cabecalho-perfil');

window.addEventListener('scroll', () => {
    const scrollAtual = window.pageYOffset || document.documentElement.scrollTop;

    // Se estiver no topo da tela e puxando para baixo → MOSTRA
    if (scrollAtual <= 50) {
        cabecalho.classList.add('visivel');
    } 
    // Se estiver rolando para cima ou para baixo e não estiver no topo → ESCONDE
    else {
        cabecalho.classList.remove('visivel');
    }

    ultimoScroll = scrollAtual;
});
