document.addEventListener("DOMContentLoaded", function() {

    // ✅ AGORA AS VARIAVEIS ESTÃO CERTAS
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- ELEMENTOS ---
    const btnAdd = document.getElementById('btnAdd');
    const overlayCadastro = document.getElementById('overlayCadastro');
    const fecharCadastro = document.getElementById('fecharCadastro');
    const formPet = document.getElementById('formPet');
    const btnSairMenu = document.getElementById('btnSairMenu');

    // --- ABRIR / FECHAR MODAL ---
    if(btnAdd && overlayCadastro) {
        btnAdd.addEventListener('click', () => {
            formPet.reset();
            // Reseta os textos das listas ao abrir
            document.getElementById('textoSelecionado').textContent = 'Tipo';
            document.getElementById('textoSelecionadoSexo').textContent = 'Sexo';
            // Reseta os valores padrão
            document.getElementById('tipo').value = 'cachorro';
            document.getElementById('sexo').value = 'macho';
            
            // Reseta marcações visuais
            document.querySelectorAll('.opcao-item').forEach(i => i.classList.remove('selecionado'));
            document.querySelector('.opcao-item[data-valor="cachorro"]').classList.add('selecionado');
            document.querySelector('.opcao-item[data-valor="macho"]').classList.add('selecionado');
            
            overlayCadastro.style.display = 'flex';
        });
    }
    if(fecharCadastro) {
        fecharCadastro.addEventListener('click', () => overlayCadastro.style.display = 'none');
    }

    // --- SALVAR PET NO FIREBASE ---
    if(formPet) {
        formPet.addEventListener('submit', function(e) {
            e.preventDefault();

            const user = auth.currentUser;
            if(!user) {
                alert("Você precisa estar logado!");
                return;
            }

            const dados = {
                nome: document.getElementById('nome').value,
                tipo: document.getElementById('tipo').value, 
                sexo: document.getElementById('sexo').value, // ✅ SEXO SENDO SALVO
                raca: document.getElementById('raca').value,
                peso: document.getElementById('peso').value,
                cor: document.getElementById('cor').value,
                nascimento: document.getElementById('nascimento').value,
                observacoes: document.getElementById('observacoes').value,
                foto: document.getElementById('foto').value || 'img/default.png',
                userId: user.uid
            };

            db.collection("pets").add(dados)
            .then(() => {
                alert("Pet SALVO com sucesso! ✅");
                overlayCadastro.style.display = 'none';
                formPet.reset();
                carregarPets();
            })
            .catch(erro => {
                console.error("ERRO AO SALVAR:", erro);
                alert("Deu erro: " + erro.message);
            });
        });
    }

    // ✅ CARREGAR LISTA DE PETS
    function carregarPets(filtro = 'todos') {
        const user = auth.currentUser;
        const lista = document.getElementById('petsGrid');
        const mensagemVazia = document.querySelector('.texto-vazio');

        if(!user) return;

        db.collection("pets")
        .where("userId", "==", user.uid)
        .get()
        .then(snap => {
            console.log("Encontrados:", snap.size, "pets");

            lista.innerHTML = "";
            
            if(snap.empty) {
                mensagemVazia.style.display = "block";
                lista.style.display = "none";
            } else {
                mensagemVazia.style.display = "none";
                lista.style.display = "grid";

                snap.forEach(doc => {
                    const pet = doc.data();
                    pet.id = doc.id;

                    if(filtro !== 'todos' && pet.tipo !== filtro) return;

                    // ✅ MOSTRA O SEXO NO CARD TAMBÉM
                    const iconeSexo = pet.sexo === 'macho' ? '♂️' : '♀️';

                    const card = document.createElement('div');
                    card.className = 'pet-card';
                    card.setAttribute('data-id', pet.id);
                    card.innerHTML = `
                        <img class="pet-imagem" src="${pet.foto}" alt="Foto">
                        <div class="pet-info">
                            <h3 class="pet-nome">${pet.nome || 'Sem nome'} ${iconeSexo}</h3>
                            <p class="pet-detalhes">${pet.tipo || 'Tipo'} • ${pet.raca || 'Raça'}</p>
                        </div>
                    `;

                    card.addEventListener('click', () => {
                        window.location.href = `perfil-pet.html?id=${pet.id}`;
                    });

                    lista.appendChild(card);
                });
            }
        })
        .catch(erro => {
            console.error("ERRO AO BUSCAR:", erro);
        });
    }

    // ✅ FILTROS
    const botoesFiltro = document.querySelectorAll('.status-item');
    botoesFiltro.forEach(btn => {
        btn.addEventListener('click', () => {
            botoesFiltro.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filtro = btn.getAttribute('data-categoria');
            carregarPets(filtro);
        });
    });

    // ✅ VERIFICAR LOGIN E CARREGAR DADOS
    auth.onAuthStateChanged(user => {
        if(user) {
            db.collection("usuarios").doc(user.uid).get()
            .then(doc => {
                if(doc.exists) {
                    document.getElementById('nomePerfilMenu').innerText = doc.data().nome;
                }
            });

            carregarPets(); 
        } else {
            window.location.href = "index.html";
        }
    });

    // ✅ NAVEGAÇÃO BARRA INFERIOR
    const botoesNav = document.querySelectorAll('.nav-btn');
    botoesNav.forEach(btn => {
        btn.addEventListener('click', function() {
            const link = this.getAttribute('data-link');
            if(link) window.location.href = link;
        });
    });

    // ✅ BOTÃO SAIR
    if(btnSairMenu) {
        btnSairMenu.addEventListener('click', () => {
            auth.signOut().then(() => {
                window.location.href = "index.html";
            });
        });
    }

});

// ===== FUNÇÃO DA LISTA SUSPENSA - TIPO =====
document.addEventListener('DOMContentLoaded', () => {
    const botaoLista = document.getElementById('botaoLista');
    const listaOpcoes = document.getElementById('listaOpcoes');
    const textoSelecionado = document.getElementById('textoSelecionado');
    const inputValor = document.getElementById('tipo');
    const opcoes = document.querySelectorAll('.opcao-item:not(.opcao-item-sexo)');

    botaoLista.addEventListener('click', (e) => {
        e.stopPropagation();
        const estaAberto = listaOpcoes.style.display === 'block';
        listaOpcoes.style.display = estaAberto ? 'none' : 'block';
        botaoLista.classList.toggle('aberto', !estaAberto);
        
        // Fecha a outra lista se estiver aberta
        document.getElementById('listaOpcoesSexo').style.display = 'none';
        document.getElementById('botaoListaSexo').classList.remove('aberto');
    });

    opcoes.forEach(opcao => {
        opcao.addEventListener('click', () => {
            const valorEscolhido = opcao.getAttribute('data-valor');
            const textoEscolhido = opcao.querySelector('span').textContent;
            textoSelecionado.textContent = textoEscolhido;
            inputValor.value = valorEscolhido;
            opcoes.forEach(item => item.classList.remove('selecionado'));
            opcao.classList.add('selecionado');
            listaOpcoes.style.display = 'none';
            botaoLista.classList.remove('aberto');
        });
    });

    // ===== FUNÇÃO DA LISTA SUSPENSA - SEXO =====
    const botaoListaSexo = document.getElementById('botaoListaSexo');
    const listaOpcoesSexo = document.getElementById('listaOpcoesSexo');
    const textoSelecionadoSexo = document.getElementById('textoSelecionadoSexo');
    const inputValorSexo = document.getElementById('sexo');
    const opcoesSexo = document.querySelectorAll('.opcao-item-sexo, #listaOpcoesSexo .opcao-item');

    botaoListaSexo.addEventListener('click', (e) => {
        e.stopPropagation();
        const estaAberto = listaOpcoesSexo.style.display === 'block';
        listaOpcoesSexo.style.display = estaAberto ? 'none' : 'block';
        botaoListaSexo.classList.toggle('aberto', !estaAberto);
        
        // Fecha a outra lista se estiver aberta
        document.getElementById('listaOpcoes').style.display = 'none';
        document.getElementById('botaoLista').classList.remove('aberto');
    });

    opcoesSexo.forEach(opcao => {
        opcao.addEventListener('click', () => {
            const valorEscolhido = opcao.getAttribute('data-valor');
            const textoEscolhido = opcao.querySelector('span').textContent;
            textoSelecionadoSexo.textContent = textoEscolhido;
            inputValorSexo.value = valorEscolhido;
            opcoesSexo.forEach(item => item.classList.remove('selecionado'));
            opcao.classList.add('selecionado');
            listaOpcoesSexo.style.display = 'none';
            botaoListaSexo.classList.remove('aberto');
        });
    });

    // Fechar todas ao clicar fora
    document.addEventListener('click', () => {
        listaOpcoes.style.display = 'none';
        botaoLista.classList.remove('aberto');
        listaOpcoesSexo.style.display = 'none';
        botaoListaSexo.classList.remove('aberto');
    });
});
