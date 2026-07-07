"use client";

type Props = {
  pregnancyWeek: string;
};

export default function ClinicalTimeline({
  pregnancyWeek,
}: Props) {
  const timeline = [
    {
      title: "Mother Registered",
      date: "Today",
      color: "bg-blue-500",
    },
    {
      title: `Pregnancy Week ${pregnancyWeek || "-"}`,
      date: "Current",
      color: "bg-pink-500",
    },
    {
      title: "Blockchain Verification",
      date: "Verified",
      color: "bg-green-500",
    },
    {
      title: "Next ANC Visit",
      date: "Upcoming",
      color: "bg-yellow-500",
    },
    {
      title: "Baby Vaccination",
      date: "Scheduled",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="rounded-3xl bg-white shadow-lg p-6">

      <h2 className="text-2xl font-bold mb-8">
        📋 Clinical Timeline
      </h2>

      <div className="space-y-6">

        {timeline.map((item, index) => (

          <div
            key={index}
            className="flex items-start gap-5"
          >

            <div
              className={`w-4 h-4 rounded-full mt-2 ${item.color}`}
            />

            <div className="flex-1">

              <h3 className="font-semibold text-lg">
                {item.title}
              </h3>

              <p className="text-gray-500">
                {item.date}
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}