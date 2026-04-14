interface VehicleInfoCardProps {
  plateNumber: string;
  entryLane: string;
  vehicleImage?: string;
  vehicleType: string;
}

export function VehicleInfoCard({
  plateNumber,
  entryLane,
  vehicleImage,
  vehicleType,
}: VehicleInfoCardProps) {
  return (
    <div className="bg-white rounded-2xl card-shadow p-5 mb-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">车辆信息</span>
        <span className="text-xs text-gray-400">{vehicleType}</span>
      </div>
      <div className="flex items-center gap-4">
        {vehicleImage && (
          <div
            className="w-20 h-14 rounded-lg bg-cover bg-center flex-shrink-0 border border-gray-100"
            style={{ backgroundImage: `url('${vehicleImage}')` }}
            role="img"
            aria-label="车辆照片"
          />
        )}
        <div>
          <div className="font-mono text-2xl font-bold text-gray-900 tracking-wider">
            {plateNumber}
          </div>
          <div className="text-xs text-gray-500 mt-1">{entryLane}</div>
        </div>
      </div>
    </div>
  );
}
