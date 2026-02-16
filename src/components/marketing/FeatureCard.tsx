export default function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
      <h3 className="text-xl font-semibold text-indigo-600">{title}</h3>
      <p className="mt-2 text-gray-700">{description}</p>
    </div>
  );
}
