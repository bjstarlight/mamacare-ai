"use client";

type BackButtonProps = {
  onClick: () => void;
};

export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="mb-4 rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
    >
      ← Back
    </button>
  );
}