import { memo } from 'react';

interface SectionKickerProps {
  label: string;
  className?: string;
}

export const SectionKicker = memo(function SectionKicker({
  label,
  className = '',
}: SectionKickerProps) {
  return (
    <div
      className={`inline-flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.2em] text-neutral-500 ${className}`}
    >
      <span className="h-[1px] w-5 bg-[#FF4D1C] shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
});
