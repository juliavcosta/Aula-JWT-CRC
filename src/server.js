const express = require("express");
const {PrismaClient} = require("@prisma/client");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const {createToken, validadeToken} = require("./JWT");
const cors = require("cors");

const app = express();
app.use(express.json());

//MIDDLEWARE COOKIE
app.use(cookieParser());
app.use(cors());

const prisma = new PrismaClient();

app.listen(8080, () => {
    console.log("O servidor está no ar...");
})

//REGISTER 
app.post("/register", async(req, res) => {
    try {
    const {nome, senha} = req.body;
        
    await bcrypt.hash(senha, 10).then((hash) => {
        prisma.user.create({
            data:{
                nome: nome,
                senha: hash,
            }   
        }).then(() => {
            res.json("Usuario criado")
        }).catch((error) => {
            res.json({error: "Usuario já existe"})
        })
    })
    }catch(error){
        res.json(error)
    }
});

//LOGIN
app.post("/login", async(req, res) => {
    try{
        const {nome, senha} = req.body;
        const usuario = await prisma.user.findUnique({where: {nome}});
        if(!usuario){
            res.json({error: "Algo deu errado"});
        }

        const Psenha = usuario.senha;
        bcrypt.compare(senha, Psenha).then((match) => {
            if(!match){
                res.status(400).json({error: "Senha ou usuario incorretos"})
            }else{
                const accessToken = createToken(usuario);
                res.cookie("access-token", accessToken, {
                    maxAge: 60 * 60 * 24 * 30 * 1000,
                });
                res.json("Você está logado");
            }
        })

    }catch(error){
        console.error(error);
    }
})

//VALIDAÇÃO
app.get("/", validadeToken, async(req, res) => {
    return res.json("Token verificado");
});