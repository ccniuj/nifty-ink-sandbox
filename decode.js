let LogDecoder = require("@maticnetwork/eth-decoder").default.LogDecoder
let Web3 = require("web3")
let NiftyMedoatorABI = require("./packages/buidler/artifacts/NiftyMediator").abi
let ForeignAMB = require("./packages/buidler/artifacts/ForeignAMB").abi
let HomeAMB = require("./packages/buidler/artifacts/HomeAMB").abi

// create decoder object
const decoder = new LogDecoder([NiftyMedoatorABI, ForeignAMB, HomeAMB]);

let HomeWeb3 = new Web3("http://localhost:8546")
HomeWeb3.eth.getTransactionReceipt("0x32fccb5782c3ee87d57fd5677b043bd072e0cfe3164bdaa32924d36398cb8eb8").
    then(receipt => {
        // parse logs
        const parsedLogs = decoder.decodeLogs(receipt.logs) // For truffle testsuite, use `receipt.receipt.logs`
        console.log(parsedLogs)
    })

let ForeignWeb3 = new Web3("http://localhost:8545")
ForeignWeb3.eth.getTransactionReceipt("0xd1030295b7781ffcee8cad6a74cd0b60b29998e9705899e11dd0c475d7b482c4").
    then(receipt => {
        // parse logs
        const parsedLogs = decoder.decodeLogs(receipt.logs) // For truffle testsuite, use `receipt.receipt.logs`
        console.log(parsedLogs)
    })
