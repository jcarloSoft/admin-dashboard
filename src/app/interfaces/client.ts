export interface Client {
  id: number;
  documentId: string;
  name: string;
  phone: string;
  email: string;
  nickTiktok: string;
  initialDeposit: number;
  shippingPreference: 'ACCUMULATE' | 'SHIP'; // ✅ no SEND
  remainingDeposit: number; // ✅ Asegúrate de que exista esta línea
}
