
"use strict";

const CHAVE_USUARIOS = "usuarios_cadastrados";
const CHAVE_TENTATIVAS = "tentativas_login";
const CHAVE_BLOQUEIO = "login_bloqueado";

function obterUsuarios() {
    try {
        const dados = JSON.parse(
            localStorage.getItem(CHAVE_USUARIOS) || "[]"
        );

        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

function mostrarMensagem(texto, tipo = "erro") {
    const mensagem = document.getElementById("mensagem");

    if (!mensagem) {
        return;
    }

    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo}`;
    mensagem.hidden = false;
}

// ============================
// CADASTRO
// ============================

const formularioCadastro = document.querySelector(
    'form[data-tipo="cadastro"]'
);

if (formularioCadastro) {
    formularioCadastro.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const nome = document.getElementById("nome").value.trim();

        const email = document
            .getElementById("email-cadastro")
            .value.trim()
            .toLowerCase();

        const senha = document.getElementById("senha-cadastro").value;

        const confirmarSenha =
            document.getElementById("confirmar-senha").value;

        const usuarios = obterUsuarios();

        // Verifica o tamanho da senha
        if (senha.length < 8) {
            mostrarMensagem(
                "Erro: a senha deve ter pelo menos 8 caracteres."
            );
            return;
        }

        // Verifica se as senhas coincidem
        if (senha !== confirmarSenha) {
            mostrarMensagem(
                "Erro: as senhas digitadas não coincidem."
            );
            return;
        }

        // Impede o cadastro de e-mail repetido
        const emailExiste = usuarios.some(
            usuario => usuario.email === email
        );

        if (emailExiste) {
            mostrarMensagem(
                "Erro: este e-mail já está cadastrado. Utilize outro e-mail."
            );
            return;
        }

        // Impede o uso de uma senha já cadastrada
        const senhaExiste = usuarios.some(
            usuario => usuario.senha === senha
        );

        if (senhaExiste) {
            mostrarMensagem(
                "Erro: esta senha já está sendo utilizada por outra conta. Crie outra senha."
            );
            return;
        }

        // Salva a nova conta
        usuarios.push({
            nome: nome,
            email: email,
            senha: senha
        });

        try {
            localStorage.setItem(
                CHAVE_USUARIOS,
                JSON.stringify(usuarios)
            );
        } catch {
            mostrarMensagem(
                "Erro: não foi possível salvar o cadastro neste navegador."
            );
            return;
        }

        mostrarMensagem(
            "Cadastro realizado com sucesso! Redirecionando para o login...",
            "sucesso"
        );

        formularioCadastro.reset();

        setTimeout(function () {
            window.location.href = "index.html";
        }, 1500);
    });
}

// ============================
// LOGIN
// ============================

const formularioLogin = document.querySelector(
    'form[data-tipo="login"]'
);

if (formularioLogin) {
    const campoEmail = document.getElementById("email-login");
    const campoSenha = document.getElementById("senha-login");

    const botaoEntrar = formularioLogin.querySelector(
        'button[type="submit"]'
    );

    let tentativas =
        Number(localStorage.getItem(CHAVE_TENTATIVAS)) || 0;

    let bloqueado =
        localStorage.getItem(CHAVE_BLOQUEIO) === "true";

    function bloquearLogin() {
        bloqueado = true;

        localStorage.setItem(CHAVE_BLOQUEIO, "true");

        campoEmail.disabled = true;
        campoSenha.disabled = true;
        botaoEntrar.disabled = true;

        mostrarMensagem(
            "Acesso bloqueado! Você errou o e-mail ou a senha 5 vezes. Não é possível realizar novas tentativas."
        );
    }

    // Verifica se o usuário já atingiu o limite
    if (tentativas >= 5 || bloqueado) {
        bloquearLogin();
    }

    formularioLogin.addEventListener("submit", function (evento) {
        evento.preventDefault();

        if (bloqueado || tentativas >= 5) {
            bloquearLogin();
            return;
        }

        const email = campoEmail.value.trim().toLowerCase();
        const senha = campoSenha.value;

        const usuarios = obterUsuarios();

        const usuarioValido = usuarios.find(function (usuario) {
            return usuario.email === email && usuario.senha === senha;
        });

        if (usuarioValido) {
            // Limpa as tentativas depois de um login válido
            localStorage.removeItem(CHAVE_TENTATIVAS);

            mostrarMensagem(
                `Login realizado com sucesso! Bem-vindo(a), ${usuarioValido.nome}.`,
                "sucesso"
            );

            // Evita novas submissões neste formulário
            campoEmail.disabled = true;
            campoSenha.disabled = true;
            botaoEntrar.disabled = true;

            return;
        }

        // Registra uma tentativa incorreta
        tentativas++;

        localStorage.setItem(
            CHAVE_TENTATIVAS,
            String(tentativas)
        );

        if (tentativas >= 5) {
            bloquearLogin();
            return;
        }

        const restantes = 5 - tentativas;

        mostrarMensagem(
            `E-mail ou senha incorretos. Você ainda tem ${restantes} tentativa(s).`
        );
    });
}

// ============================
// ESQUECEU A SENHA
// ============================

const linkEsqueceuSenha = document.getElementById("esqueceu-senha");

if (linkEsqueceuSenha) {
    linkEsqueceuSenha.addEventListener("click", function (evento) {
        evento.preventDefault();

        mostrarMensagem(
            "A recuperação de senha ainda não está implementada."
        );
    });
}
