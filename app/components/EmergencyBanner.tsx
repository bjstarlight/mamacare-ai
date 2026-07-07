type Props = {
  emergency: boolean;
};

export default function EmergencyBanner({
  emergency,
}: Props) {
  if (!emergency) return null;

  return (
    <div className="mt-6 rounded-xl border-2 border-red-600 bg-red-100 p-4">
      <h2 className="font-bold text-red-700">
        🚨 Medical Emergency
      </h2>

      <p className="mt-2">
        Please proceed to the nearest hospital immediately.
      </p>
    </div>
  );
}