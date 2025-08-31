// restaurants/dto/restaurant-hours-response.dto.ts
// DTO de saída para horários do restaurante
export class RestaurantHoursResponseDto {
  id: string;
  restaurantId: string;
  // 0 (Domingo) .. 6 (Sábado) — ajuste se seu schema usar enum
  dayOfWeek: number;
  // Horários no formato HH:MM (string) ou Date se você usa timestamptz
  openTime: string;
  closeTime: string;
  // Flag para dias fechados ou intervalos desativados
  isClosed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
