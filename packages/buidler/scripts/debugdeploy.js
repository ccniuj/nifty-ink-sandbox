const fs = require('fs');
const chalk = require('chalk');
const bre = require("@nomiclabs/buidler");
/*
 redeploy NiftyMediator, update NiftyRegistry and reset the mediatorContractOnOtherSide on NiftyMain
 */
async function main() {
  if(bre.network.name.indexOf("sidechain")>=0 || bre.network.name.indexOf("sokol")>=0){
    const Liker = await deploy("Liker")
    const NiftyRegistry = await deploy("NiftyRegistry")
    const NiftyInk = await deploy("NiftyInk")
    const NiftyToken = await deploy("NiftyToken")
    const NiftyMediator = await deploy("NiftyMediator")
    await NiftyRegistry.setInkAddress(NiftyInk.address)
    await NiftyRegistry.setTokenAddress(NiftyToken.address)
    await NiftyRegistry.setBridgeMediatorAddress(NiftyMediator.address)
    await NiftyInk.setNiftyRegistry(NiftyRegistry.address)
    await NiftyToken.setNiftyRegistry(NiftyRegistry.address)
    await NiftyMediator.setNiftyRegistry(NiftyRegistry.address)
    await Liker.addContract(NiftyInk.address)

    if(bre.network.name.indexOf("kovan")>=0){
      await NiftyMediator.setBridgeContract("0xFe446bEF1DbF7AFE24E81e05BC8B271C1BA9a560")
      await NiftyRegistry.setTrustedForwarder("0x77777e800704Fb61b0c10aa7b93985F835EC23fA")
      await NiftyMediator.setRequestGasLimit("1500000")
    }

    if(bre.network.name.indexOf("sidechain")>=0) {
      let trustedForwarder
      try{
        await NiftyMediator.setBridgeContract("0x9539a46432a405f0CCc1a1fceaD5866bFf271B04")
        await NiftyMediator.setRequestGasLimit("1500000")

        let trustedForwarderObj = JSON.parse(fs.readFileSync("../react-app/src/gsn/Forwarder.json"))
        console.log("⛽️ Setting GSN Trusted Forwarder on NiftyRegistry to ",trustedForwarderObj.address)
        await NiftyRegistry.setTrustedForwarder(trustedForwarderObj.address)
        console.log("⛽️ Setting GSN Trusted Forwarder on Liker to ",trustedForwarderObj.address)
        await Liker.setTrustedForwarder(trustedForwarderObj.address)
      }catch(e){
        console.log(e)
      }
    }
  }

  if(bre.network.name.indexOf("localhost")>=0 || bre.network.name.indexOf("kovan")>=0){
    const NiftyMain = await deploy("NiftyMain")

    if(bre.network.name.indexOf("kovan")>=0) {
      await NiftyMain.setBridgeContract("0xFe446bEF1DbF7AFE24E81e05BC8B271C1BA9a560")
      await NiftyMain.setMediatorContractOnOtherSide("0x339d0e6f308a410F18888932Bdf661636A0F538f")
      await NiftyMain.setRequestGasLimit("1500000")
    }

    if(bre.network.name.indexOf("localhost")>=0) {
      await NiftyMain.setBridgeContract("0x9539a46432a405f0CCc1a1fceaD5866bFf271B04")
      await NiftyMain.setRequestGasLimit("1500000")
      let MediatorAddress = fs.readFileSync(bre.config.paths.artifacts + "/NiftyMediator.address").toString()
      await NiftyMain.setMediatorContractOnOtherSide(MediatorAddress)
    }
  }
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});


async function deploy(name,_args){
  let args = []
  if(_args){
    args = _args
  }
  console.log("📄 "+name)
  const contractArtifacts = artifacts.require(name);
  //console.log("contractArtifacts",contractArtifacts)
  //console.log("args",args)

  const promise =  contractArtifacts.new(...args)


  promise.on("error",(e)=>{console.log("ERROR:",e)})


  let contract = await promise


  console.log(chalk.cyan(name),"deployed to:", chalk.magenta(contract.address));
  fs.writeFileSync("artifacts/"+name+".address",contract.address);
  console.log("\n")
  return contract;
}

async function autoDeploy() {
  let contractList = fs.readdirSync("./contracts")
  for(let c in contractList){
    if(contractList[c].indexOf(".sol")>=0 && contractList[c].indexOf(".swp.")<0){
      const name = contractList[c].replace(".sol","")
      let args = []
      try{
        const argsFile = "./contracts/"+name+".args"
        if (fs.existsSync(argsFile)) {
          args = JSON.parse(fs.readFileSync(argsFile))
        }
      }catch(e){
        console.log(e)
      }
      await deploy(name,args)
    }
  }
}
