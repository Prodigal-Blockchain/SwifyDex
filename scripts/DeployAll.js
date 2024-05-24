const { ethers, run, network } = require("hardhat");
require("dotenv").config();

async function main() {
  //Factory
  const SwifyDexFactoryContract = await ethers.getContractFactory(
    "SwifyDexFactory"
  );
  console.log("Deploying SwifyDexFactoryContract...");
  const SwifyDexFactory = await SwifyDexFactoryContract.deploy();
  const SwifyDexFactoryContractAddress = await SwifyDexFactory.getAddress();
  console.log(
    `Deployed SwifyDexFactoryContract to : ${SwifyDexFactoryContractAddress}`
  );
  await SwifyDexFactory.deploymentTransaction(6);

  //swapRouter
  const SwapRouterContract = await ethers.getContractFactory("SwapRouter");
  console.log("Deploying SwapRouterContract...");
  const SwapRouter = await SwapRouterContract.deploy(
    SwifyDexFactoryContractAddress,
    "0xfff9976782d46cc05630d1f6ebab18b2324d6b14"
  );
  const SwapRouterContractAddress = await SwapRouter.getAddress();
  console.log(`Deployed SwapRouterContract to : ${SwapRouterContractAddress}`);
  await SwapRouter.deploymentTransaction(6);

  //NFTPositionDescriptorLibrary
  const NFTDescriptorLibrary = await ethers.getContractFactory("NFTDescriptor");
  console.log("Deploying NFTDescriptor Library...");
  const nftDescriptor = await NFTDescriptorLibrary.deploy();
  const nftDescriptorAddress = await nftDescriptor.getAddress();
  console.log(`NFTDescriptor Library deployed to: ${nftDescriptorAddress}`);
  await nftDescriptor.deploymentTransaction(6);

  //NonfungibleTokenPositionDescriptor
  const NonfungibleTokenPositionDescriptorContract =
    await ethers.getContractFactory("NonfungibleTokenPositionDescriptor", {
      libraries: {
        NFTDescriptor: nftDescriptorAddress,
      },
    });
  console.log("Deploying NonfungibleTokenPositionDescriptorContract...");
  const NonfungibleTokenPositionDescriptor =
    await NonfungibleTokenPositionDescriptorContract.deploy(
      "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
      "0x000000000000000000000000000000000000000000000000000000000000abcd"
    );
  const NonfungibleTokenPositionDescriptorContractAddress =
    await NonfungibleTokenPositionDescriptor.getAddress();
  console.log(
    `Deployed NonfungibleTokenPositionDescriptorContract to : ${NonfungibleTokenPositionDescriptorContractAddress}`
  );
  await NonfungibleTokenPositionDescriptor.deploymentTransaction(6);

  //NonFungiblePositionManager
  const NonfungiblePositionManagerContract = await ethers.getContractFactory(
    "NonfungiblePositionManager"
  );
  console.log("Deploying NonfungiblePositionManager...");
  const NonfungiblePositionManager =
    await NonfungiblePositionManagerContract.deploy(
      SwifyDexFactoryContractAddress,
      NonfungibleTokenPositionDescriptorContractAddress,
      "0xfff9976782d46cc05630d1f6ebab18b2324d6b14"
    );
  const NonfungiblePositionManagerContractAddress =
    await NonfungiblePositionManager.getAddress();
  console.log(
    `Deployed NonfungiblePositionManager to : ${NonfungiblePositionManagerContractAddress}`
  );
  await NonfungiblePositionManager.deploymentTransaction(6);

  // Create the pool
  const SwifyDexPoolTransaction = await SwifyDexFactory.createPool(
    "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357",
    "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0",
    3000
  );

  // Wait for the transaction to be mined
  const SwifyDexPoolReceipt = await SwifyDexPoolTransaction.wait();

  // Check if events array exists and find the specific event
  if (SwifyDexPoolReceipt.events && SwifyDexPoolReceipt.events.length > 0) {
    const SwifyDexPoolEvent = SwifyDexPoolReceipt.events.find(
      (event) => event.event === "PoolCreated"
    );
    if (
      SwifyDexPoolEvent &&
      SwifyDexPoolEvent.args &&
      SwifyDexPoolEvent.args.poolAddress
    ) {
      const SwifyDexPoolContractAddress = SwifyDexPoolEvent.args.poolAddress;
      console.log(`SwifyDexPool deployed to: ${SwifyDexPoolContractAddress}`);
    } else {
      console.log(
        "No PoolCreated event found or poolAddress not present in the event."
      );
    }
  } else {
    console.log("No events found in the transaction receipt.");
  }

  if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    await customVerify(SwifyDexFactoryContractAddress, []);

    await customVerify(SwapRouterContractAddress, [
      SwifyDexFactoryContractAddress,
      "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
    ]);

    await customVerify(NonfungibleTokenPositionDescriptorContractAddress, [
      "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
      "0x000000000000000000000000000000000000000000000000000000000000abcd",
    ]);

    await customVerify(NonfungiblePositionManagerContractAddress, [
      SwifyDexFactoryContractAddress,
      NonfungibleTokenPositionDescriptorContractAddress,
      "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
    ]);

    // await customVerify(SwifyDexPoolContractAddress, [
    //   "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357",
    //   "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0",
    //   3000,
    // ]);
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
