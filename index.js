
import {
    Keypair,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
  } from "@solana/web3.js";
  import {
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
    createInitializeMintInstruction,
    getMintLen,
    getMint,
    getOrCreateAssociatedTokenAccount,
    createInitializeInterestBearingMintInstruction,
    mintTo,
    getInterestBearingMintConfigState

  } from "@solana/spl-token";
  import { keypair, payer } from "./keypair.js";
  import { connection } from "./connection.js";
  
  
  // setting up the mint address
  const mint = Keypair.generate();
  const decimals = 2;
  const supply = 1000000;

   //calculating the amount of token to mint to the payer wallet
   const smallUnit = 10 ** decimals
   const amountToMint = BigInt(100 * smallUnit);

//rate needed for the config
const rateNumber = 32_767
  
  //calculating the space needed for the metadata and mint
  const mintAccInterestToken = getMintLen([ExtensionType.InterestBearingConfig])
  
  //rent required for mint account 
  const lamports = await connection.getMinimumBalanceForRentExemption(mintAccInterestToken);
  
  
  //Building the instructions below 
  
  const createAccount1 = SystemProgram.createAccount({
    // call System Program to create new account
    fromPubkey: payer,
    newAccountPubkey: mint.publicKey,
    space: mintAccInterestToken,
    programId: TOKEN_2022_PROGRAM_ID,
    lamports
  });

  const initializeInterestConfig = createInitializeInterestBearingMintInstruction(
    //initializing the interest bearing config extension.
    mint.publicKey,payer,rateNumber,TOKEN_2022_PROGRAM_ID)
  
  
  const initializeMint = createInitializeMintInstruction(
    //initializing the mint Account
    mint.publicKey,
    decimals,
    payer,
    null,
    TOKEN_2022_PROGRAM_ID,
  );
  
  
  // Add instructions to new transaction
  const transaction = new Transaction().add(
    createAccount1,
    initializeInterestConfig,
    initializeMint,
  );
  
  // Send transaction
  const transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [keypair, mint], // Signers
  );

// logging the mint account of the token with transfer fees
  
  // Fetching the mint
  const mintDetails = await getMint(connection, mint.publicKey, undefined, TOKEN_2022_PROGRAM_ID);
  console.log('Mint is ->', mintDetails);
  console.log("Interest bearing Token has been implemented");
  
  console.log(
    "\nTransaction Sig :",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
  );

// Get Interest Config from Mint Account
  const interestBearingMintConfig = await getInterestBearingMintConfigState(
    mintDetails, // Mint Account data
  );

  console.log(
    "\nMint Config: ",
    JSON.stringify(interestBearingMintConfig, null, 2),
  ); //logging the mint config.

  // Minting some token to payer wallet
console.log("==================================================");
console.log("Minting some tokens to Payer account");


  let payerATA = await getOrCreateAssociatedTokenAccount(connection,keypair,mint.publicKey,payer,undefined,undefined,undefined,TOKEN_2022_PROGRAM_ID);
  console.log('Payer ata before mintint ', payerATA.amount); //logging the payer ata before minting

 //minting
  await mintTo(connection,keypair,mint.publicKey,payerATA.address,keypair, amountToMint, [keypair], undefined,TOKEN_2022_PROGRAM_ID); //minting to the payer wallet

  payerATA = await getOrCreateAssociatedTokenAccount(connection,keypair,mint.publicKey,payer,undefined,undefined,undefined,TOKEN_2022_PROGRAM_ID);
  console.log('Payer ata after minting', payerATA.amount);// logging the source ata after minting

