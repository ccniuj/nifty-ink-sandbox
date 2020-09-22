let LogDecoder = require("@maticnetwork/eth-decoder").default.LogDecoder
let Web3 = require("web3")
let NiftyMedoatorABI = require("./packages/buidler/artifacts/NiftyMediator").abi
let NiftyMainABI = require("./packages/buidler/artifacts/NiftyMain").abi
let ForeignAMB = require("./packages/buidler/artifacts/ForeignAMB").abi
let HomeAMB = require("./packages/buidler/artifacts/HomeAMB").abi

// create decoder object
const decoder = new LogDecoder([
    NiftyMedoatorABI,
    NiftyMainABI,
    ForeignAMB,
    HomeAMB
]);

let HomeWeb3 = new Web3("http://localhost:8546")
let ForeignWeb3 = new Web3("http://localhost:8545")
HomeWeb3.eth.getTransactionReceipt("0x3add8ec9b3d0eed32a493998a54631211e301474074226be7912c154d0fe427e").
    then(receipt => {
        // parse logs
        const parsedLogs = decoder.decodeLogs(receipt.logs) // For truffle testsuite, use `receipt.receipt.logs`
        console.log("HomeWeb3 Log")
        console.log(parsedLogs)
    })

ForeignWeb3.eth.getTransactionReceipt("0xc7e98959120cc4973dfaf493d235dc74d9194e17fcebf413bf41b0a349a52bb2").
    then(receipt => {
        // parse logs
        const parsedLogs = decoder.decodeLogs(receipt.logs) // For truffle testsuite, use `receipt.receipt.logs`
        console.log("ForeignWeb3 Log")
        console.log(parsedLogs)
    })
