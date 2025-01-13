// Módulos externos
const inquirer = require ('inquirer');
const chalk = require('chalk');

// Módulos internos
const fs = require('fs'); 

operation(); // Chamada da função

console.log("Iniciamos o Accounts");

function operation() { // Criação da função
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'O que você deseja fazer?',
            choices: [
                'Criar conta',
                'Consultar saldo',
                'Depositar',
                'Sacar',
                'Sair',
            ],
        },
    ])
    .then((answer) => { //escolha do usuarios

        const action =  answer['action']

        if(action === 'Criar conta') {
            createAccount()
        }else if(action === 'Depositar'){
            deposit()
        }else if(action === 'Sacar'){
            withdraw()
        }else if(action === 'Sair'){
            console.log(chalk.bgBlue.black('Obrigado por usar o Accounts'))
            process.exit()
        }else if(action === 'Consultar saldo'){
            getAccountBalance()
        }
    }) 
    .catch((err) => console.log(err));
}

//criar conta
function createAccount() {
    console.log(chalk.bgBlue.black('Parabéns por escolher nosso banco'))
    console.log(chalk.blue("Defina as opçoes da sua conta a seguir:"))

    buildAccount()
}
function buildAccount() {
    inquirer.prompt ([{
        name: 'accountName',
        message: 'Digite um nome para sua conta:',
    },
    ])
    .then((answer) => { //logar o nome da conta
        const accountName = answer['accountName']
        console.info(accountName)

        //verifica se o diretorio existe, se não, irá criar ele
        //vamos guardar os dados nele
        if(!fs.existsSync('accounts')){
            fs.mkdirSync('accounts')
        }

        if(fs.existsSync(`accounts/${accountName}.json`)){ //verifica se o nome de usuario existe
            console.log(chalk.bgRed.black('Este nome ja esta sendo utilizado, escolha outro'))
            buildAccount()
            return
        }
        
        fs.writeFileSync(// escreve dados em um arquivo de forma sincrona(espera a ação ser finalizada ate comecar outra)
            `accounts/${accountName}.json`, 
            '{"balance": 0 }', 
            function(err) {
                console.log(err)
            },
        )
        console.log(chalk.bgGreen("Parabéns, sua conta foi criada com sucesso"))
        operation()
    })
    .catch((err) => console.log(err))  
}

//Deposito
function deposit() {
    inquirer.prompt([
        {
        name: 'accountName',
        message: 'Qual o nome da sua conta?',
    }
])
    .then((answer) => {
        const accountName = answer['accountName']

        //verifica se a conta existe
       if(!checkAccount(accountName)){ //se a conta não existir, retorna ao deposit
            return deposit()
        }
            inquirer.prompt ([
                {
                name:'amount',
                message:'Qual o valor do deposito',
            },
            ])
            .then((answer) => {
                const amount = answer['amount']

                //adicionar um montante
                addAmount(accountName, amount)
                operation()
            })
            .catch((err) => console.log(err))  
    })
    .catch((err) => console.log(err))
}

//verifica se a conta existe
function checkAccount(accountName){
    if(!fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.bgRed.black("Esta conta não existe"))
        return false
    }
    return true
} 

//Adiciona dinheiro a conta
function addAmount(accountName, amount) {
   const accountData = getAccount(accountName)

   if(!amount){ // se não tiver um valor, vai exibir a mensagem de erro e retornar ao deposit
    console.log(chalk.bgRed.black("Ocorreu um erro,tente novamente"))
    return deposit()
   }

   accountData.balance =  parseFloat(amount) + parseFloat(accountData.balance)//mudando o valor do objeto(mudando o valor de dinheiro na conta)
   fs.writeFileSync(`accounts/${accountName}.json`, //salvando em um arquivo  //transforma o JSON em texto
    JSON.stringify(accountData), 
    function(err) { 
        console.log(err)
    },
   )
   console.log(chalk.bgGreen(`O deposito no valor de R$${amount} foi feito na sua conta`))
}

//pega a conta
function getAccount(accountName){
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {encoding: 'utf8', flag:'r'})//flag r para ler
    return JSON.parse(accountJSON)//converte o arquivo para json
}

//consultar saldo
function getAccountBalance(){
    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual o nome da sua conta',
    },
]).then((answer) =>{
    const accountName = answer['accountName'] //coloca a resposta em uma variavel
    
    //verifica se a conta existe
    if(!checkAccount(accountName)){
        return getAccountBalance() //da uma nova chance do usuario digitar o nome da conta
    }

    const accountData = getAccount(accountName) //resultado do saldo
    console.log(chalk.bgBlue.black(`O seu saldo é de R$${accountData.balance}`))
    operation()
})
.catch((err) => console.log(err))
}

//Sacar
function withdraw(){
    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual o nome da conta?'
    }
]).then((answer)=>{
    const accountName = answer['accountName']

    if(!checkAccount(accountName)){
        return withdraw()
    }

    inquirer.prompt([{
        name: 'amount',
        message: 'Qual o valor do saque?',
    },
]).then((answer)=>{
    const amount = answer['amount']

    removeAmount(accountName,amount)
   
})
.catch((err) => console.log(err))

})
.catch((err) => console.log(err))
}

function removeAmount(accountName, amount){ 
    const accountData = getAccount(accountName) //pega a conta em json

    if(!amount){
        console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente"))
        return withdraw()
    }

    if(accountData.balance < amount) {
        console.log(chalk.bgRed.black("Valor indisponivel"))
    }
    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount) //salvando o saldo depois do saque
    fs.writeFileSync(`accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err){ console.log(err)},
    )
    console.log(chalk.bgGreen(`Saque no valor de R$${amount} feito com sucesso`))  
    operation()
}