"use client";

type BlockchainBadgeProps = {
  verified: boolean;
  category?: string;
  txHash?: string;
  timestamp?: string;
};

export default function BlockchainBadge({
  verified,
  category = "Medical Record",
  txHash,
  timestamp,
}: BlockchainBadgeProps) {
  if (!verified) {
    return (
      <div className="mt-6 rounded-2xl border border-yellow-300 bg-yellow-50 p-5">
        <h3 className="font-bold text-yellow-700">
          🟡 Not Yet Protected
        </h3>

        <p className="mt-2 text-sm text-yellow-700">
          This record has not yet been verified on BOT Chain.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-green-300 bg-green-50 p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <h3 className="text-lg font-bold text-green-700">
            🛡️ Verified on BOT Chain
          </h3>

          <p className="text-sm text-green-600">
            This medical record is tamper-resistant.
          </p>
        </div>

        <div className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
          VERIFIED
        </div>

      </div>

      <div className="mt-5 space-y-3 text-sm">

        <div>
          <span className="font-semibold">
            Category
          </span>

          <p>{category}</p>
        </div>

        {timestamp && (
          <div>
            <span className="font-semibold">
              Protected
            </span>

            <p>{timestamp}</p>
          </div>
        )}

        {txHash && (
          <div>
            <span className="font-semibold">
              Transaction Hash
            </span>

            <div className="mt-2 rounded-lg border bg-white p-3 break-all font-mono text-xs">
              {txHash}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}