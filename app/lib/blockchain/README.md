# BOT Chain integration

This module stores only user-consented healthcare milestones on-chain.

## Design principles

- Keep raw medical records off-chain.
- Hash milestone metadata and store the hash on BOT Chain.
- Require explicit consent before recording an event.
- Reuse the existing app architecture and UI.

## Service layers

- config.ts: environment-driven network settings.
- service.ts: provider, wallet, network switch, explorer, and transaction orchestration.
- milestoneStore.ts: local projection store for pending and confirmed milestone attestations.
- consentChain.ts: consent-aware wrappers that queue only eligible milestone events.
- types.ts: shared transaction, wallet, and milestone payload types.
- useBotChain.ts: reusable client-side hook for wallet status and milestone submissions.

## Environment variables

- `NEXT_PUBLIC_BOT_CHAIN_ID`: BOT Chain numeric chain ID.
- `NEXT_PUBLIC_BOT_NETWORK`: Display name shown in the wallet UX.
- `NEXT_PUBLIC_BOT_RPC`: Public BOT Chain RPC URL for read operations.
- `NEXT_PUBLIC_BOT_EXPLORER`: Optional explorer base URL for tx and address links.
- `NEXT_PUBLIC_MEDICAL_RECORD_CONTRACT`: Deployed `MedicalRecordV2` contract address.
- `NEXT_PUBLIC_BOT_CURRENCY_NAME`: Native token name used for wallet add-network prompts.
- `NEXT_PUBLIC_BOT_CURRENCY_SYMBOL`: Native token symbol.
- `NEXT_PUBLIC_BOT_CURRENCY_DECIMALS`: Native token decimals.

User wallets sign milestone writes directly in the browser. Only consented milestone hashes are stored on-chain; all sensitive medical details stay in local app state.
