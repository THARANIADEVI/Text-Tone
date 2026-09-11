export default function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div className="w-full p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm">
      {message}
    </div>
  );
}
