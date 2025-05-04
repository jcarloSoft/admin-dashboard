import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../interfaces/category.model'; // Asegúrate de que Category sea el DTO correcto

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = 'http://localhost:8080/api/categories'; // Asegúrate de que esta sea la URL correcta

  constructor(private http: HttpClient) {}

  /** Trae todas las categorías */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  /** Trae una categoría por su ID */
  getCategoryById(id: number): Observable<Category> {
    // Cambié el tipo de 'id' a string
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  /** Crea una nueva categoría */
  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/create`, category); // Asegúrate de que la ruta sea la correcta
  }

  /** Actualiza una categoría existente */
  updateCategory(
    id: number,
    category: Partial<Category>
  ): Observable<Category> {
    // Cambié el tipo de 'id' a string
    return this.http.put<Category>(`${this.apiUrl}/update/${id}`, category); // Asegúrate de que la ruta sea la correcta
  }

  /** Elimina una categoría por su ID */
  deleteCategory(id: number): Observable<void> {
    // Cambié el tipo de 'id' a string
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`); // Asegúrate de que la ruta sea la correcta
  }
}
