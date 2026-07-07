import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.connect();

  console.log("Deploying MedicalRecord...");

  const factory = await ethers.getContractFactory("MedicalRecordV2");

  const contract = await factory.deploy({
    maxPriorityFeePerGas: ethers.parseUnits("50", "gwei"),
    maxFeePerGas: ethers.parseUnits("60", "gwei"),
  });

  await contract.waitForDeployment();

  console.log("✅ MedicalRecord deployed!");
  console.log("Contract Address:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});