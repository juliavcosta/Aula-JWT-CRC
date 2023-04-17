const {sign, verify} = require("jsonwebtoken");

//Criar Token 
const createToken = (user) => {
    const accessToken = sign({
        nome: user.nome, id: user.id
    },
    "jwtsecret", 
    );
    return accessToken
}

const validadeToken = (req, res, next) => {
    const accessToken = req.cookies["access-token"];
    if(!accessToken) {return res.status(400).json({error: "Usuário não autenticado"})};

    try{
        const validToken = verify(accessToken, "jwtsecret");
        if(validToken){
            req.authenticated = true;
            return next();
        }
    }catch(error){
        return res.status(400).json({error: error});
    }
}


module.exports = {createToken, validadeToken};
