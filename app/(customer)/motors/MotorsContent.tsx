"use client";

import { useState } from "react";
import MotorCard, { Motor } from "@/components/MotorCard";
import BookingModal from "@/components/BookingModal";
import { Bike } from "lucide-react";

interface MotorsContentProps {
  motors: Motor[];
  rentedMotorIds: string[];
}

export default function MotorsContent({ motors, rentedMotorIds }: MotorsContentProps) {
  const [selectedMotor, setSelectedMotor] = useState<Motor | null>(null);

  if (motors.length === 0) {
    return (
      <div className="text-center py-16">
        <Bike className="w-16 h-16 text-[#1a1a1a]/20 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Tidak ada motor ditemukan</h3>
        <p className="text-[#1a1a1a]/60">Motor belum tersedia saat ini</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {motors.map((motor, index) => (
          <div
            key={motor.id}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <MotorCard
              motor={motor}
              isRented={rentedMotorIds.includes(String(motor.id))}
              onDetail={() => setSelectedMotor(motor)}
            />
          </div>
        ))}
      </div>

      {selectedMotor && (
        <BookingModal motor={selectedMotor} onClose={() => setSelectedMotor(null)} />
      )}
    </>
  );
}
