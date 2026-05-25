document.addEventListener("DOMContentLoaded", function() {

    // --- ELEMENTOS DO DOM ---
    const btnMenu = document.getElementById("btnMenu");
    const menuLateral = document.getElementById("menuLateral");
    const fundoOverlay = document.getElementById("fundoOverlay");
    const btnNotif = document.getElementById('btnNotif');
    const caixaNotificacao = document.getElementById('caixaNotificacao');
    const btnAdd = document.getElementById('btnAdd');
    const overlayForm = document.getElementById('overlayForm');
    const fecharForm = document.getElementById('fecharForm');

    // --- MENU ---
    if (btnMenu && menuLateral && fundoOverlay) {
        btnMenu.addEventListener("click", () => {
            menuLateral.classList.add("aberto");
            fundoOverlay.classList.add("visivel");
        });
        fundoOverlay.addEventListener("click", () => {
            menuLateral.classList.remove("aberto");
            fundoOverlay.classList.remove("visivel");
        });
    }

    // --- NOTIFICAÇÃO ---
    if (btnNotif && caixaNotificacao) {
        btnNotif.addEventListener("click", () => caixaNotificacao.style.display = 'flex');
    }
    function fecharNotificacao() {
        if(caixaNotificacao) caixaNotificacao.style.display = 'none';
    }
    const btnOk = document.querySelector('.btn-ok');
    if(btnOk) btnOk.addEventListener('click', fecharNotificacao);

    // --- VERIFICAÇÃO DE LOGIN ---
    auth.onAuthStateChanged(user => {
        if (user) {
            if(document.getElementById('nomePerfilMenu')) {
                document.getElementById('nomePerfilMenu').textContent = user.displayName || "Amigo";
            }
            carregarPetsNoSelect();
            carregarMedicamentos();
        } else {            window.location.href = "index.html";
        }
    });

    // --- FUNÇÃO SAIR ---
    function sair() {
        auth.signOut().then(() => window.location.href = "index.html");
    }
    const btnSair = document.getElementById("btnSairMenu");
    if (btnSair) btnSair.addEventListener('click', sair);

    // --- NAVEGAÇÃO ---
    const botoesNav = document.querySelectorAll('.nav-btn');
    botoesNav.forEach(btn => {
        btn.addEventListener('click', function() {
            window.location.href = this.getAttribute('data-link');
        });
    });

    // --- ABRIR / FECHAR FORMULÁRIO ---
    if(btnAdd && overlayForm) {
        btnAdd.addEventListener('click', () => {
            document.querySelector('#overlayForm h2').textContent = "Novo Medicamento 💊";
            document.getElementById('btnExcluir').style.display = 'none';
            document.getElementById('formRemedio').reset();
            overlayForm.style.display = 'flex';
        });
    }
    if(fecharForm && overlayForm) {
        fecharForm.addEventListener('click', () => overlayForm.style.display = 'none');
    }

    // ==============================================
    // ✅ CARREGAR PETS NO SELECT
    // ==============================================
    function carregarPetsNoSelect() {
        const user = auth.currentUser;
        const selectPet = document.getElementById('petId'); 
        
        db.collection("pets").where("userId", "==", user.uid).get()
        .then(snap => {
            selectPet.innerHTML = '<option value="">Selecione o Pet</option>';
            snap.forEach(doc => {
                const pet = doc.data();
                const opt = document.createElement('option');
                opt.value = doc.id;
                opt.textContent = pet.nome;
                selectPet.appendChild(opt);
            });
        });
    }

    // ==============================================
    // ✅ CARREGAR MEDICAMENTOS
    // ==============================================
    function carregarMedicamentos() {
        const user = auth.currentUser;
        const lista = document.getElementById('listaRemedios'); 
        
        db.collection("medicamentos").where("userId", "==", user.uid).orderBy("nome").get()
        .then(snap => {
            lista.innerHTML = "";
            
            if(snap.empty) {
                lista.innerHTML = '<p class="texto-vazio">Nenhum medicamento cadastrado 💊</p>';
                return;
            }

            snap.forEach(doc => {
                const med = doc.data();
                med.id = doc.id;

                // Ícones por tipo
                let icone = "💊";
                if(med.tipo === "vermifugo") icone = "🐛";
                if(med.tipo === "suplemento") icone = "🥗";
                if(med.tipo === "antiinflamatorio") icone = "🧪";

                const card = document.createElement('div');
                card.className = `remedio-card ${med.ativo ? '' : 'inativo'}`;
                card.setAttribute('data-id', med.id);
                
                card.innerHTML = `
                    <div class="remedio-info">
                        <h4>${icone} ${med.nome}</h4>
                        <p>Para: ${med.petNome} • ${med.dosagem || ''}</p>
                        <small>${med.observacao || ''}</small>
                    </div>
                    <div class="remedio-acoes">
                        <button class="btn-status ${med.ativo ? 'ativo' : ''}" data-id="${med.id}">
                            ${med.ativo ? '✅ Ativo' : '⏸️ Inativo'}
                        </button>
                        <button class="btn-editar">✏️</button>
                        <button class="btn-excluir">🗑️</button>
                    </div>
                `;

                // Botão Status (Ativar/Inativar)
                card.querySelector('.btn-status').addEventListener('click', function(e){
                    e.stopPropagation();
                    db.collection("medicamentos").doc(med.id).update({ ativo: !med.ativo })
                    .then(() => carregarMedicamentos());
                });

                // Botão Editar
                card.querySelector('.btn-editar').addEventListener('click', (e) => {
                    e.stopPropagation();
                    abrirEdicaoMed(med);
                });

                // Botão Excluir
                card.querySelector('.btn-excluir').addEventListener('click', (e) => {
                    e.stopPropagation();
                    if(confirm(`Tem certeza que quer apagar ${med.nome}?`)) {
                        db.collection("medicamentos").doc(med.id).delete()
                        .then(() => {
                            alert("Medicamento apagado!");
                            carregarMedicamentos();
                        });
                    }
                });

                lista.appendChild(card);
            });
        });
    }

    // ==============================================
    // ✅ SALVAR / ATUALIZAR MEDICAMENTO
    // ==============================================
    const formRemedio = document.getElementById('formRemedio'); 
    let medEditandoId = null;

    if(formRemedio) {
        formRemedio.addEventListener('submit', function(e) {
            e.preventDefault();
            const user = auth.currentUser;

            const dados = {
                nome: document.getElementById('nome').value, 
                petId: document.getElementById('petId').value, 
                petNome: document.getElementById('petId').options[document.getElementById('petId').selectedIndex].text,
                tipo: document.getElementById('tipo').value, 
                dosagem: document.getElementById('dosagem').value, 
                frequencia: document.getElementById('frequencia').value, 
                dataInicio: document.getElementById('dataInicio').value, 
                dataFim: document.getElementById('dataFim').value, 
                observacao: document.getElementById('observacao').value, 
                ativo: true,
                userId: user.uid
            };

            if(medEditandoId) {
                // Atualizar
                db.collection("medicamentos").doc(medEditandoId).update(dados)
                .then(() => {
                    alert("Medicamento atualizado! ✏️");
                    overlayForm.style.display = 'none';
                    formRemedio.reset();
                    medEditandoId = null;
                    carregarMedicamentos();
                });
            } else {
                // Novo
                db.collection("medicamentos").add(dados)
                .then(() => {
                    alert("Medicamento cadastrado! 💊");
                    overlayForm.style.display = 'none';
                    formRemedio.reset();
                    carregarMedicamentos();
                });
            }
        });
    }

    // ==============================================
    // ✏️ ABRIR EDIÇÃO
    // ==============================================
    function abrirEdicaoMed(med) {
        medEditandoId = med.id;
        
        document.getElementById('nome').value = med.nome || '';
        document.getElementById('petId').value = med.petId || '';
        document.getElementById('tipo').value = med.tipo || '';
        document.getElementById('dosagem').value = med.dosagem || '';
        document.getElementById('frequencia').value = med.frequencia || '';
        document.getElementById('dataInicio').value = med.dataInicio || '';
        document.getElementById('dataFim').value = med.dataFim || '';
        document.getElementById('observacao').value = med.observacao || '';

        document.querySelector('#overlayForm h2').textContent = "Editar Medicamento ✏️";
        document.getElementById('btnExcluir').style.display = 'block';
        overlayForm.style.display = 'flex';
    }

    // ==============================================
    // 🗑️ EXCLUIR DIRETO DO FORM
    // ==============================================
    const btnExcluir = document.getElementById('btnExcluir');
    if(btnExcluir) {
        btnExcluir.addEventListener('click', function() {
            if(medEditandoId && confirm("Tem certeza que quer APAGAR este medicamento?")) {
                db.collection("medicamentos").doc(medEditandoId).delete()
                .then(() => {
                    alert("Medicamento apagado! 🗑️");
                    overlayForm.style.display = 'none';
                    formRemedio.reset();
                    medEditandoId = null;
                    carregarMedicamentos();
                });
            }
        });
    }

    console.log('✅ Medicamentos carregado!');

}); 

           
