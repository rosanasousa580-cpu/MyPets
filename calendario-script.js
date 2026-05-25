document.addEventListener("DOMContentLoaded", function() {

    // ✅ VARIÁVEIS FIREBASE CORRETAS
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- ELEMENTOS DO DOM ---
    const btnMenu = document.getElementById("btnMenu");
    const menuLateral = document.getElementById("menuLateral");
    const fundoOverlay = document.getElementById("fundoOverlay");
    const btnNotif = document.getElementById('btnNotif');
    const caixaNotificacao = document.getElementById('caixaNotificacao');
    const btnAdd = document.getElementById('btnAdd');
    const overlayForm = document.getElementById('overlayForm');
    const fecharForm = document.getElementById('fecharForm');
    const listaCartoesTempo = document.getElementById('listaCartoesTempo');

    const diasContainer = document.querySelector('.grade-dias');
    const mesAnoTexto = document.querySelector('#mesAnoAtual');

    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    let dataAtual = new Date();
    let eventos = [];
    let pets = [];
    let dadosChegada = {}; // Objeto para guardar DATA por PET: {idPet: "2024-01-01"}
    let eventoEditandoId = null;
    let petEmEdicao = null; // Controla qual pet está editando a data

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
        btnNotif.addEventListener('click', () => caixaNotificacao.style.display = 'flex');
    }
    const btnOk = document.querySelector('.btn-ok');
    if(btnOk) btnOk.addEventListener('click', () => caixaNotificacao.style.display = 'none');

    // --- VERIFICAÇÃO DE LOGIN ---
    auth.onAuthStateChanged(user => {
        if (user) {
            const nomePerfil = document.getElementById('nomePerfilMenu');
            if(nomePerfil) nomePerfil.textContent = user.displayName || "Amigo";
            carregarPets();
            carregarEventos();
            carregarDadosChegada(); // ✅ Carrega todas as datas de todos os pets
        } else {
            window.location.href = "index.html";
        }
    });

    // --- SAIR ---
    const btnSair = document.getElementById("btnSairMenu");
    if (btnSair) btnSair.addEventListener('click', () => {
        auth.signOut().then(() => window.location.href = "index.html");
    });

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
            document.getElementById('formEvento').reset();
            eventoEditandoId = null;
            document.getElementById('btnExcluirEvento').style.display = 'none';
            overlayForm.style.display = 'flex';
        });
    }
    if(fecharForm) fecharForm.addEventListener('click', () => overlayForm.style.display = 'none');

    // ==============================================
    // ✅ CALENDÁRIO PRINCIPAL
    // ==============================================
    function criarCalendario(ano, mes) {
        if(!diasContainer) return;
        diasContainer.innerHTML = '';

        const primeiroDia = new Date(ano, mes, 1).getDay();
        const diasNoMes = new Date(ano, mes + 1, 0).getDate();

        for(let i = 0; i < primeiroDia; i++) {
            diasContainer.appendChild(document.createElement('div'));
        }

        for(let dia = 1; dia <= diasNoMes; dia++) {
            const diaEl = document.createElement('div');
            diaEl.className = 'dia-calendario';

            const numEl = document.createElement('div');
            numEl.className = 'numero-dia';
            numEl.textContent = dia;
            diaEl.appendChild(numEl);

            const hoje = new Date();
            if(dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear()) {
                diaEl.classList.add('hoje');
            }

            const dataStr = `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
            diaEl.setAttribute('data-data', dataStr);

            // 📌 EVENTOS
            eventos.filter(ev => ev.data === dataStr).forEach(ev => {
                const evEl = document.createElement('div');
                evEl.className = 'evento-no-dia';
                let icone = '/img/outros.png';
                if(ev.tipo === 'vacina') icone = '/img/vacina.png';
                if(ev.tipo === 'consulta') icone = '/img/consulta.png';
                if(ev.tipo === 'banho') icone = '/img/banho.png';
                evEl.innerHTML = `<div class="evento-conteudo"><img src="${ev.fotoPet || 'https://cdn-icons-png.flaticon.com/512/105/105685.png'}" class="foto-pet-evento"><span class="nome-evento">${ev.petNome}</span><img src="${icone}" class="tipo-evento"></div>`;
                evEl.onclick = () => abrirEdicao(ev);
                diaEl.appendChild(evEl);
            });

            // 🎂 ANIVERSÁRIOS
            const dataMesDia = `${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
            pets.forEach(pet => {
                if(pet.nascimento && pet.nascimento.substring(5,10) === dataMesDia) {
                    const anivEl = document.createElement('div');
                    anivEl.className = 'evento-no-dia';
                    anivEl.innerHTML = `<div class="evento-conteudo"><img src="${pet.foto || 'https://cdn-icons-png.flaticon.com/512/105/105685.png'}" onerror="this.src='/img/default.png'" class="foto-pet-evento"><span class="nome-evento">${pet.nome}</span><img src="https://cdn-icons-png.flaticon.com/512/433/433196.png" class="tipo-evento"></div>`;
 diaEl.appendChild(anivEl);
                }
            });

            // 📅 MARCAÇÃO DE CHEGADA DE CADA PET
            Object.values(dadosChegada).forEach(dataPet => {
                if(dataPet === dataStr) diaEl.classList.add('chegada-pet');
            });

            diaEl.onclick = () => {
                document.getElementById('dataEvento').value = dataStr;
                overlayForm.style.display = 'flex';
            };

            diasContainer.appendChild(diaEl);
        }

        mesAnoTexto.textContent = `${meses[mes]} ${ano}`;
    }

    // NAVEGAÇÃO
    document.getElementById('btnMesAnterior').addEventListener('click', () => {
        dataAtual.setMonth(dataAtual.getMonth() - 1);
        criarCalendario(dataAtual.getFullYear(), dataAtual.getMonth());
    });
    document.getElementById('btnProximoMes').addEventListener('click', () => {
        dataAtual.setMonth(dataAtual.getMonth() + 1);
        criarCalendario(dataAtual.getFullYear(), dataAtual.getMonth());
    });
    document.getElementById('btnHoje').addEventListener('click', () => {
        dataAtual = new Date();
        criarCalendario(dataAtual.getFullYear(), dataAtual.getMonth());
    });

    // ==============================================
    // ✅ CARREGAR PETS E GERAR CARTÕES
    // ==============================================
    function carregarPets() {
        const user = auth.currentUser;
        db.collection("pets").where("userId", "==", user.uid).get()
        .then(snap => {
            pets = [];
            listaCartoesTempo.innerHTML = ''; // Limpa antes de criar

            snap.forEach(doc => {
                const pet = {id: doc.id, ...doc.data()};
                pets.push(pet);
                criarCartaoTempo(pet); // Cria UM CARTÃO PARA CADA PET
            });

            carregarPetsNoSelect(); // Atualiza select de eventos
        });
    }

    // 🃏 CRIA O CARTÃO INDIVIDUAL
    function criarCartaoTempo(pet) {
        const cartaoEl = document.createElement('div');
        cartaoEl.className = "container-tempo-pet";
        cartaoEl.innerHTML = `
            <div class="cartao-tempo" id="cartao-${pet.id}">
                <div class="frente-cartao">
                    <div class="titulo">❤️ Tempo comigo</div>
                    <div class="nome-pet">${pet.nome}</div>
                    <div class="data" id="data-texto-${pet.id}">Data de chegada: --/--/----</div>
                    <div class="numero-dias" id="dias-num-${pet.id}">0</div>
                    <div class="texto-dias">dias ao meu lado 🐾</div>
                </div>
                <div class="verso-cartao">
                    <p class="aviso">* Data marcada em rosa no calendário 📅</p>
                    <div class="botoes">
                        <button class="btn-tempo btn-editar-tempo" data-pet="${pet.id}">✏️ Editar Data</button>
                        <button class="btn-tempo btn-excluir-tempo" data-pet="${pet.id}">🗑️ Excluir</button>
                    </div>
                </div>
            </div>
        `;

        listaCartoesTempo.appendChild(cartaoEl);

        // ✅ Ação de virar o cartão ao clicar
        const cartao = cartaoEl.querySelector(`#cartao-${pet.id}`);
        cartao.addEventListener('click', (e) => {
            // Não vira se clicar nos botões
            if(!e.target.classList.contains('btn-tempo')) {
                cartao.classList.toggle('virado');
            }
        });

        // ✅ Botão EDITAR
        cartaoEl.querySelector(`.btn-editar-tempo[data-pet="${pet.id}"]`).addEventListener('click', () => {
            petEmEdicao = pet.id;
            // Se já tem data salva, preenche o input
            if(dadosChegada[pet.id]) {
                document.getElementById('dataChegadaInput').value = dadosChegada[pet.id];
            } else {
                document.getElementById('dataChegadaInput').value = '';
            }
            document.getElementById('overlayTempo').style.display = 'flex';
        });

        // ✅ Botão EXCLUIR
        cartaoEl.querySelector(`.btn-excluir-tempo[data-pet="${pet.id}"]`).addEventListener('click', () => {
            if(!dadosChegada[pet.id]) return alert("❌ Nenhuma data cadastrada para esse pet!");

            if(confirm("Tem certeza que deseja remover a data de chegada desse pet?")) {
                const user = auth.currentUser;
                db.collection("tempo_pet")
                .where("userId", "==", user.uid)
                .where("petId", "==", pet.id)
                .get()
                .then(snap => {
                    if(!snap.empty) {
                        snap.docs[0].ref.delete().then(() => {
                            delete dadosChegada[pet.id];
                            atualizarDadosCartao(pet.id, null);
                            criarCalendario(dataAtual.getFullYear(), dataAtual.getMonth());
                            alert("🗑️ Data removida!");
                        });
                    }
                });
            }
        });
    }

    // ==============================================
    // ✅ CARREGAR DATAS DE CHEGADA DE TODOS OS PETS
    // ==============================================
    function carregarDadosChegada() {
        const user = auth.currentUser;
        db.collection("tempo_pet").where("userId", "==", user.uid).get()
        .then(snap => {
            dadosChegada = {}; // Limpa objeto
            snap.forEach(doc => {
                const d = doc.data();
                dadosChegada[d.petId] = d.dataChegada; // Salva: idPet => data
                atualizarDadosCartao(d.petId, d.dataChegada); // Atualiza visual
            });
            criarCalendario(dataAtual.getFullYear(), dataAtual.getMonth()); // Atualiza marcações
        });
    }

    // ✅ ATUALIZA OS DADOS VISUAIS NO CARTÃO
    function atualizarDadosCartao(petId, dataStr) {
        const elData = document.getElementById(`data-texto-${petId}`);
        const elDias = document.getElementById(`dias-num-${petId}`);

        if(!dataStr) {
            elData.textContent = "Data de chegada: --/--/----";
            elDias.textContent = "0";
            return;
        }

        // Formatar data BR
        const [ano, mes, dia] = dataStr.split('-');
        elData.textContent = `Data de chegada: ${dia}/${mes}/${ano}`;

        // Calcular dias
        const dataChegada = new Date(dataStr + "T00:00:00");
        const hoje = new Date();
        const diferencaMs = hoje - dataChegada;
        const dias = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));
        elDias.textContent = dias >= 0 ? dias : 0;
    }

    // ==============================================
    // ✅ SALVAR / EDITAR DATA DE CHEGADA NO BANCO
    // ==============================================
    const overlayTempo = document.getElementById('overlayTempo');
    const fecharTempo = document.getElementById('fecharTempo');
    const formTempo = document.getElementById('formTempo');

    fecharTempo.addEventListener('click', () => {
        overlayTempo.style.display = 'none';
        formTempo.reset();
        petEmEdicao = null;
    });

    formTempo.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        const dataEscolhida = document.getElementById('dataChegadaInput').value;

        if(!dataEscolhida || !petEmEdicao) return alert("❌ Selecione uma data e um pet!");

        const dados = {
            userId: user.uid,
            petId: petEmEdicao,
            dataChegada: dataEscolhida
        };

        // Verifica se já existe registro para esse pet
        db.collection("tempo_pet")
        .where("userId", "==", user.uid)
        .where("petId", "==", petEmEdicao)
        .get()
        .then(snap => {
            if(!snap.empty) {
                // ATUALIZA
                snap.docs[0].ref.update(dados).then(() => {
                    dadosChegada[petEmEdicao] = dataEscolhida;
                    atualizarDadosCartao(petEmEdicao, dataEscolhida);
                    criarCalendario(dataAtual.getFullYear(), dataAtual.getMonth());
                    overlayTempo.style.display = 'none';
                    alert("✅ Data atualizada!");
                });
            } else {
                // CRIA NOVO
                db.collection("tempo_pet").add(dados).then(() => {
                    dadosChegada[petEmEdicao] = dataEscolhida;
                    atualizarDadosCartao(petEmEdicao, dataEscolhida);
                    criarCalendario(dataAtual.getFullYear(), dataAtual.getMonth());
                    overlayTempo.style.display = 'none';
                    alert("✅ Data salva!");
                });
            }
        });
    });

    // ==============================================
    // ✅ RESTO DO SISTEMA - EVENTOS, SALVAR, ETC...
    // ==============================================

    // 📋 CARREGAR PETS PARA SELECT DE EVENTOS
    function carregarPetsNoSelect() {
        const user = auth.currentUser;
        db.collection("pets").where("userId", "==", user.uid).get()
        .then(snap => {
            const select = document.getElementById('petEvento');
            select.innerHTML = '<option value="">Selecione o Pet</option>';

            snap.forEach(doc => {
                const p = doc.data();
                const opt = document.createElement('option');
                opt.value = doc.id;
                opt.textContent = p.nome;
                opt.dataset.foto = p.foto || '';
                select.appendChild(opt);
            });
        });
    }

    // 📥 CARREGAR EVENTOS DO BANCO
    function carregarEventos() {
        const user = auth.currentUser;
        db.collection("eventos").where("userId", "==", user.uid).orderBy("data", "asc").get()
        .then(snap => {
            eventos = [];
            snap.forEach(doc => {
                eventos.push({id:doc.id, ...doc.data()});
            });
            criarCalendario(dataAtual.getFullYear(), dataAtual.getMonth());
            listarEventosTela();
        });
    }

    // 💾 SALVAR / EDITAR EVENTOS
    document.getElementById('formEvento').addEventListener('submit', e => {
        e.preventDefault();
        const user = auth.currentUser;

        const dados = {
            titulo: document.getElementById('titulo').value,
            petId: document.getElementById('petEvento').value,
            petNome: document.getElementById('petEvento').selectedOptions[0].text,
            fotoPet: document.getElementById('petEvento').selectedOptions[0].dataset.foto,
            tipo: document.getElementById('tipoEvento').value,
            data: document.getElementById('dataEvento').value,
            hora: document.getElementById('horaEvento').value,
            observacao: document.getElementById('obsEvento').value,
            concluido: false,
            userId: user.uid
        };

        if(eventoEditandoId) {
            db.collection("eventos").doc(eventoEditandoId).update(dados)
            .then(() => {
                alert("✅ Atualizado!");
                overlayForm.style.display = 'none';
                carregarEventos();
            })
            .catch(erro => alert("❌ Erro: " + erro.message));
        } else {
            db.collection("eventos").add(dados)
            .then(() => {
                alert("✅ Salvo!");
                overlayForm.style.display = 'none';
                carregarEventos();
            })
            .catch(erro => alert("❌ Erro: " + erro.message));
        }
    });

    // 🗑️ EXCLUIR EVENTO
    document.getElementById('btnExcluirEvento').addEventListener('click', () => {
        if(confirm("Deseja apagar esse evento?")) {
            db.collection("eventos").doc(eventoEditandoId).delete()
            .then(() => {
                alert("🗑️ Apagado!");
                overlayForm.style.display = 'none';
                carregarEventos();
            });
        }
    });

    // ✏️ ABRIR EDIÇÃO DE EVENTO
    function abrirEdicao(ev) {
        eventoEditandoId = ev.id;
        document.getElementById('titulo').value = ev.titulo;
        document.getElementById('petEvento').value = ev.petId;
        document.getElementById('tipoEvento').value = ev.tipo;
        document.getElementById('dataEvento').value = ev.data;
        document.getElementById('horaEvento').value = ev.hora;
        document.getElementById('obsEvento').value = ev.observacao || '';

        document.getElementById('btnExcluirEvento').style.display = 'block';
        overlayForm.style.display = 'flex';
    }

    // 📋 LISTAR EVENTOS NA TELA
    function listarEventosTela(filtro = 'todos') {
        const lista = document.getElementById('listaEventos');
        lista.innerHTML = "";

        const filtrados = eventos.filter(ev => filtro === 'todos' || ev.tipo === filtro);

        if(filtrados.length === 0) {
            lista.innerHTML = "<p class='texto-vazio'>Nenhum evento encontrado 📅</p>";
            return;
        }

        filtrados.forEach(ev => {
            const item = document.createElement('div');
            item.className = `item-lista ${ev.concluido ? 'concluido' : ''}`;
            item.innerHTML = `
                <div class="info-item">
                    <h4>${ev.titulo} • ${ev.petNome}</h4>
                    <p>🗓️ ${ev.data} às ${ev.hora} | ${ev.tipo}</p>
                </div>
                <div class="acoes-item">
                    <button class="btn-check">✓</button>
                    <button class="btn-edit">✏️</button>
                </div>
            `;

            item.querySelector('.btn-check').onclick = () => {
                db.collection("eventos").doc(ev.id).update({concluido: !ev.concluido}).then(()=>carregarEventos());
            };
            item.querySelector('.btn-edit').onclick = () => abrirEdicao(ev);

            lista.appendChild(item);
        });
    }

    // 🔘 FILTROS DE EVENTOS
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            listarEventosTela(btn.dataset.tipo);
        });
    });

});

