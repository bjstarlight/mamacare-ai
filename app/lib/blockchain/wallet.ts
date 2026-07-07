export async function requestWalletConnection() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No wallet provider is available. Install MetaMask or a compatible EVM wallet.");
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
}

export async function switchWalletNetwork(chainIdHex: string) {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No wallet provider is available.");
  }

  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: chainIdHex }],
  });
}
