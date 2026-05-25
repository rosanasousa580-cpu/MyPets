document.addEventListener("DOMContentLoaded", function() {

    // ===== ALTERNAR TELAS LOGIN <-> CADASTRO =====
    const cardLogin = document.getElementById('cardLogin');
    const cardCadastro = document.getElementById('cardCadastro');

    document.getElementById('abrirCadastro').addEventListener('click', (e) => {
        e.preventDefault();
        cardLogin.style.display = 'none';
        cardCadastro.style.display = 'block';
    });

    document.getElementById('voltarLogin').addEventListener('click', (e) => {
        e.preventDefault();
        cardCadastro.style.display = 'none';
        cardLogin.style.display = 'block';
    });


    // ===== MOSTRAR / ESCONDER SENHA =====
    window.mostrarSenha = function(){
        const inputSenha = document.getElementById('senha');
        const icone = document.getElementById('olho');

        if(inputSenha.type === 'password'){
            inputSenha.type = 'text';
            icone.src = "img/olho-aberto.png";
        } else {
            inputSenha.type = 'password';
            icone.src = "img/olho-fechado.png";
        }
    }


    // ✅ LOGAR USUÁRIO
    window.logarUsuario = function(){
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value.trim();

        if(!email || !senha){
            alert("⚠️ Preencha e-mail e senha!");
            return;
        }

        firebase.auth().signInWithEmailAndPassword(email, senha)
        .then(() => {
            window.location.href = "home.html"; // Redireciona
        })
        .catch(erro => {
            alert("❌ Erro: " + erro.message);
        });
    }


    // ✅ CADASTRAR USUÁRIO
    window.cadastrarUsuario = function(){
        const nome = document.getElementById('nomeCad').value.trim();
        const email = document.getElementById('emailCad').value.trim();
        const senha = document.getElementById('senhaCad').value.trim();
        const confirmaSenha = document.getElementById('confirmaSenhaCad').value.trim();

        if(!nome || !email || !senha){
            alert("⚠️ Preencha todos os campos!");
            return;
        }

        if(senha !== confirmaSenha){
            alert("⚠️ As senhas não coincidem!");
            return;
        }

        firebase.auth().createUserWithEmailAndPassword(email, senha)
        .then((usuario) => {
            // Salvar dados no Firestore
            return firebase.firestore().collection('usuarios').doc(usuario.user.uid).set({
                nome: nome,
                email: email
            });
        })
        .then(() => {
            alert("✅ Cadastro realizado com sucesso!");
            window.location.href = "home.html";
        })
        .catch(erro => {
            alert("❌ Erro: " + erro.message);
        });
    }


    // ✅ LOGIN COM GOOGLE
    window.entrarComGoogle = function(){
        const provedor = new firebase.auth.GoogleAuthProvider();

        firebase.auth().signInWithPopup(provedor)
        .then((resultado) => {
            const usuario = resultado.user;

            // Verifica se já tem cadastro
            firebase.firestore().collection('usuarios').doc(usuario.uid).get()
            .then(doc => {
                if(!doc.exists){
                    // Cadastra automaticamente se for primeiro acesso
                    firebase.firestore().collection('usuarios').doc(usuario.uid).set({
                        nome: usuario.displayName,
                        email: usuario.email
                    });
                }
                window.location.href = "home.html";
            });
        })
        .catch(erro => {
            alert("❌ Erro: " + erro.message);
        });
    }

});
