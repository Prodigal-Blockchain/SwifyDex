const { ethers, run, network } = require("hardhat");
require("dotenv").config();

async function main() {
  //Factory

  //NonFungiblePositionManager
  const SwifyDexPoolContractAddress =
    "0xC797cE2Da96Eb925aeF84c097bD3d9424f527F06";

  if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    await customVerify(SwifyDexPoolContractAddress, []);
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function customVerify(ContractAddress, args) {
  console.log("Verifying...");
  await sleep(120 * 1000);
  try {
    await run("verify:verify", {
      address: ContractAddress,
      constructorArguments: args,
      contract: "contracts/Core/SwifyDexPool.sol:SwifyDexPool",
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified");
    } else {
      console.log(e);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
