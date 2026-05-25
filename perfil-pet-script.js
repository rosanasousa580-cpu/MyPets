document.addEventListener("DOMContentLoaded", function() {

    // --- PEGAR ID DO PET NA URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const petId = urlParams.get('id');

    if (!petId) {
        alert("⚠️ Nenhum pet selecionado!");
        window.history.back();
        return;
    }

    // --- ELEMENTOS DO PERFIL ---
    const nomePet           = document.getElementById('nomePet');
    const tipoRaca          = document.getElementById('tipoRaca');
    const nascimentoSigno   = document.getElementById('nascimentoSigno');
    const pesoPet           = document.getElementById('pesoPet');
    const corPet            = document.getElementById('corPet');
    const idadePet          = document.getElementById('idadePet');
    const observacoesPet    = document.getElementById('observacoesPet');
    const fotoPet           = document.getElementById('fotoPet');
    const vacinasContainer  = document.getElementById('vacinasPet');
    const lembretesContainer = document.getElementById('lembretesPet');
    const perfilCard        = document.querySelector('.perfil-card'); // Controle de gênero

    // --- ELEMENTOS DO CONTAINER DE EDIÇÃO ---
    const containerEdicao    = document.getElementById('containerEdicao');
    const btnAbrirEditar     = document.getElementById('btnEditar');
    const btnFecharEditar    = document.getElementById('btnFecharEditar');
    const btnSalvarEdicao    = document.getElementById('btnSalvarEdicao');

    const editaTipo          = document.getElementById('editaTipo');
    const editaRaca          = document.getElementById('editaRaca');
    const editaNome          = document.getElementById('editaNome');
    const editaNascimento    = document.getElementById('editaNascimento');
    const editaPeso          = document.getElementById('editaPeso');
    const editaCor           = document.getElementById('editaCor');
    const editaGenero        = document.getElementById('editaGenero');
    const editaObservacoes   = document.getElementById('editaObservacoes');
    const editaFoto          = document.getElementById('editaFoto');

    // --- BOTÕES DE NAVEGAÇÃO ---
    document.getElementById('btnVoltar').addEventListener('click', () => {
        window.history.back();
    });

    // 📌 FUNÇÃO IDADE - FORMATO ANO-MÊS-DIA (2026-03-05)
    function calcularIdadeCompleto(dataNasc, peso = null) {
        if(!dataNasc) return {texto: "--", detalhado: "--", classificacao: ""};

        const [ano, mes, dia] = dataNasc.split("-").map(Number);
        const nasc = new Date(ano, mes - 1, dia);
        const hoje = new Date();

        let anos = hoje.getFullYear() - nasc.getFullYear();
        let meses = hoje.getMonth() - nasc.getMonth();
        let dias = hoje.getDate() - nasc.getDate();

        if(dias < 0) { meses--; dias += new Date(hoje.getFullYear(), hoje.getMonth(), 0).getDate(); }
        if(meses < 0) { anos--; meses += 12; }

        let texto = "";
        if(meses < 1) {
            const semanas = Math.floor(dias / 7);
            texto = `${semanas} Semana${semanas !== 1 ? 's' : ''}`;
        } else if(anos < 1) {
            texto = `${meses} Mês${meses !== 1 ? 'es' : ''}`;
        } else {
            texto = `${anos} Ano${anos !== 1 ? 's' : ''}`;
        }

        const detalhado = `${dias} Dias • ${meses} Meses • ${anos} Anos`;

        let classificacao = "";
        if(peso && !isNaN(peso)) {
            if(peso <= 10) { classificacao = (meses < 9) ? "Filhote" : "Adulto 🐶"; }
            else if(peso <= 25) { classificacao = (meses < 12) ? "Filhote" : "Adulto"; }
            else if(peso <= 44) { classificacao = (meses < 15) ? "Filhote" : "Adulto"; }
            else { classificacao = (meses < 18) ? "Filhote" : "Adulto"; }
        }

        return {texto, detalhado, classificacao};
    }

    // 📌 FUNÇÃO SIGNO AUTOMÁTICO - 100% FUNCIONAL 🎯
    function obterSignoInfo(dataNasc) {
        if(!dataNasc) return {nome: "--", icone: ""};

        // Pegando dados do formato do banco: AAAA-MM-DD
        let partes = dataNasc.split("-");
        let dia = Number(partes[2]);
        let mes = Number(partes[1]);

        if      ((mes == 3 && dia >=21) || (mes == 4 && dia <=19)) return {nome:"Áries", icone:"♈"};
        else if ((mes == 4 && dia >=20) || (mes == 5 && dia <=20)) return {nome:"Touro", icone:"♉"};
        else if ((mes == 5 && dia >=21) || (mes == 6 && dia <=20)) return {nome:"Gêmeos", icone:"♊"};
        else if ((mes == 6 && dia >=21) || (mes == 7 && dia <=22)) return {nome:"Câncer", icone:"♋"};
        else if ((mes == 7 && dia >=23) || (mes == 8 && dia <=22)) return {nome:"Leão", icone:"♌"};
        else if ((mes == 8 && dia >=23) || (mes == 9 && dia <=22)) return {nome:"Virgem", icone:"♍"};
        else if ((mes == 9 && dia >=23) || (mes == 10 && dia <=22)) return {nome:"Libra", icone:"♎"};
        else if ((mes == 10 && dia >=23) || (mes == 11 && dia <=21)) return {nome:"Escorpião", icone:"♏"};
        else if ((mes == 11 && dia >=22) || (mes == 12 && dia <=21)) return {nome:"Sagitário", icone:"♐"};
        else if ((mes == 12 && dia >=22) || (mes == 1 && dia <=19)) return {nome:"Capricórnio", icone:"♑"};
        else if ((mes == 1 && dia >=20) || (mes == 2 && dia <=18)) return {nome:"Aquário", icone:"♒"};
        else if ((mes == 2 && dia >=19) || (mes == 3 && dia <=20)) return {nome:"Peixes", icone:"♓"};

        return {nome: "--", icone: ""};
    }

    // ✅ CARREGAR DADOS NA TELA
    function carregarDados() {
        db.collection("pets").doc(petId).get()
        .then(doc => {
            if(doc.exists) {
                const pet = doc.data();

                // ✅ DEFINIR GÊNERO PARA CORES DINÂMICAS
                if(pet.genero && pet.genero.toLowerCase() === "fêmea") {
                    perfilCard.classList.remove("masculino");
                    perfilCard.classList.add("feminino");
                } else {
                    perfilCard.classList.remove("feminino");
                    perfilCard.classList.add("masculino");
                }

                // ✅ CÁLCULOS ATIVADOS AQUI
                const dadosIdade = calcularIdadeCompleto(pet.nascimento, parseFloat(pet.peso));
                const dadosSigno = obterSignoInfo(pet.nascimento); // <-- AQUI O SIGNO É CALCULADO

                nomePet.textContent = pet.nome || 'Sem nome';
                tipoRaca.textContent = `${pet.tipo || 'Tipo'} • ${pet.raca || 'Raça'}`;
                
                // ✅ EXIBINDO NASCIMENTO E SIGNO NA TELA
                nascimentoSigno.innerHTML = `
                    Nascido em: ${pet.nascimento || '--/--/----'}<br>
                    <strong>${dadosSigno.icone} ${dadosSigno.nome}</strong>
                `;

                pesoPet.textContent = pet.peso ? `${pet.peso} kg` : "";
                corPet.textContent = pet.cor || "";
                idadePet.innerHTML = `<div class="carta-idade" id="cartaIdade"><div class="frente">${dadosIdade.texto}</div><div class="tras">${dadosIdade.detalhado}</div></div><small>${dadosIdade.classificacao}</small>`;
                observacoesPet.textContent = pet.observacoes || 'Nenhuma observação.';
                fotoPet.src = pet.foto || 'img/default.png';

                document.getElementById('cartaIdade').addEventListener('click', ()=>{
                    document.getElementById('cartaIdade').classList.toggle('virada');
                });

                // Vacinas
                if(pet.vacinas?.length > 0) {
                    vacinasContainer.innerHTML = "";
                    pet.vacinas.forEach(v=>{
                        vacinasContainer.innerHTML += `<div class="item-lista"><div class="info-item"><h4>${v.nome}</h4><p>Data: ${v.data}</p></div><span class="tag vacina">💉</span></div>`;
                    });
                } else vacinasContainer.innerHTML = '<p class="texto-vazio">Nenhuma vacina.</p>';

                // Lembretes
                if(pet.lembretes?.length > 0) {
                    lembretesContainer.innerHTML = "";
                    pet.lembretes.forEach(l=>{
                        lembretesContainer.innerHTML += `<div class="item-lista"><div class="info-item"><h4>${l.descricao}</h4><p>Data: ${l.data}</p></div><span class="tag lembrete">📅</span></div>`;
                    });
                } else lembretesContainer.innerHTML = '<p class="texto-vazio">Nenhum lembrete cadastrado.</p>';

                // 📌 PREENCHER FORMULÁRIO DE EDIÇÃO
                editaTipo.value        = pet.tipo || "";
                editaRaca.value        = pet.raca || "";
                editaNome.value        = pet.nome || "";
                editaNascimento.value  = pet.nascimento || "";
                editaPeso.value        = pet.peso || "";
                editaCor.value         = pet.cor || "";
                editaGenero.value      = pet.genero || "";
                editaObservacoes.value = pet.observacoes || "";
                editaFoto.value        = pet.foto || "";

            } else {
                alert("❌ Não foi possível carregar os dados do pet. ID inválido ou não existe mais.");
                console.error("ID do pet não existe no banco:", petId);
            }
        })
        .catch(erro => {
            alert("❌ Erro de conexão: " + erro.message);
            console.error("Erro ao buscar dados:", erro);
        });
    }

    // ✅ ABRIR E FECHAR EDIÇÃO
    btnAbrirEditar.addEventListener('click', ()=> containerEdicao.style.display = "flex");
    btnFecharEditar.addEventListener('click', ()=> containerEdicao.style.display = "none");

    // ✅ SALVAR ATUALIZAÇÃO NO FIREBASE
    btnSalvarEdicao.addEventListener('click', ()=>{
        const dadosAtualizados = {
            tipo: editaTipo.value,
            raca: editaRaca.value,
            nome: editaNome.value,
            nascimento: editaNascimento.value,
            peso: editaPeso.value,
            cor: editaCor.value,
            genero: editaGenero.value,
            observacoes: editaObservacoes.value,
            foto: editaFoto.value
        };

        db.collection("pets").doc(petId).update(dadosAtualizados)
        .then(()=>{
            alert("✅ Atualizado com sucesso!");
            containerEdicao.style.display = "none";
            carregarDados(); // Recarrega tudo com os cálculos novos
        })
        .catch(erro=> alert("❌ Erro ao salvar: "+erro));
    });

    // INICIA CARREGANDO
    carregarDados();

});

// ✅ MOSTRAR/ESCONDER CABEÇALHO AO ROLAR
let ultimoScroll = 0;
const cabecalho = document.querySelector('.cabecalho-perfil');

window.addEventListener('scroll', () => {
    const scrollAtual = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollAtual <= 50) {
        cabecalho.classList.add('visivel');
    } else {
        cabecalho.classList.remove('visivel');
    }
    ultimoScroll = scrollAtual;
});
