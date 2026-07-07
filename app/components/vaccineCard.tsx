type Props = {
  vaccines: string;
};

export default function VaccineCard({
  vaccines,
}: Props) {
  if (!vaccines) return null;

  return (
    <div className="mt-5 rounded-xl bg-green-50 border border-green-200 p-4">
      <h2 className="font-bold text-green-700">
        💉 Vaccines Due
      </h2>

      <p className="mt-2">
        {vaccines}
      </p>
    </div>
  );
}