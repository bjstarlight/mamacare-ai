declare module "crypto-js" {
  const CryptoJS: {
    SHA256: (input: string) => { toString(): string };
  };
  export default CryptoJS;
}

