const fs = require('fs');
const chalk = require('chalk');
const bre = require("@nomiclabs/buidler");

async function main() {
  if(bre.network.name.indexOf("sidechain")>=0 || bre.network.name.indexOf("sokol")>=0){
    console.log("📡 Loading NiftyMediator \n")
    let MediatorAddress = fs.readFileSync(bre.config.paths.artifacts + "/NiftyMediator.address").toString()
    const NiftyMediator = await ethers.getContractAt("NiftyMediator", MediatorAddress)
    console.log("📝 Setting Mediator Contract \n")
    let MainAddress = fs.readFileSync(bre.config.paths.artifacts + "/NiftyMain.address").toString()
    await NiftyMediator.setMediatorContractOnOtherSide(MainAddress)
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
