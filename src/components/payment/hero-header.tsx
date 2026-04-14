interface HeroHeaderProps {
  parkingLotName: string;
}

export function HeroHeader({ parkingLotName }: HeroHeaderProps) {
  return (
    <div className="bg-gradient-to-br from-brand-900 to-brand-600 text-white px-6 pt-12 pb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 text-center">
        <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
        </div>
        <h1 className="text-lg font-semibold">停车缴费</h1>
        <p className="text-blue-200/80 text-sm mt-1">{parkingLotName}</p>
      </div>
    </div>
  );
}
