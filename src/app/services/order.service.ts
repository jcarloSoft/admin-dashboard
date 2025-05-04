import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  // URL base directa (puedes cambiarla cuando uses entorno productivo)
  private apiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  /**
   * Crear un nuevo pedido
   */
  createOrder(orderData: any): Observable<any> {
    return this.http.post(this.apiUrl, orderData);
  }

  /**
   * Obtener todos los pedidos (GET /api/orders)
   */
  getAllOrders(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  /**
   * Obtener un pedido por ID (GET /api/orders/{id})
   */
  getOrderById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener pedidos por cliente (GET /api/orders/customer/{customerId})
   */
  getOrdersByCustomerId(customerId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/customer/${customerId}`);
  }

  /**
   * Actualizar estado del pedido (PATCH /api/orders/{id}/status)
   */
  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
  }

  /**
   * Exportar pedidos en CSV (GET /api/orders/export)
   */
  exportOrdersToCSV(customerId?: number, status?: string): Observable<Blob> {
    const params: any = {};
    if (customerId) params.customerId = customerId;
    if (status) params.status = status;

    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob',
    });
  }
}
