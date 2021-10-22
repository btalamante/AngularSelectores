import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { Pais, PaisSmall } from '../interfaces/paises-interface';

@Injectable({
  providedIn: 'root'
})
export class PaisesServiceService {

  private _regiones: string[] = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];
  private _baseUrl: string = 'https://restcountries.com/v2';

  get regiones() {
    return [...this._regiones];
  }

  constructor(private http: HttpClient) { }

  getPaisesPorRegion(region: string): Observable<PaisSmall[]> {
    const url: string = `${this._baseUrl}/region/${region}?fields=alpha3Code,name`
    return this.http.get<PaisSmall[]>(url);
  }

  getFronteras(pais: string): Observable<Pais | null> {
    if (!pais) {
      return of(null);
    }
    const url: string = `${this._baseUrl}/alpha/${pais}`;
    return this.http.get<Pais>(url);

  }

  getPaisPorCodigoSmall(pais: string): Observable<PaisSmall> {
    const url: string = `${this._baseUrl}/alpha/${pais}?fields=alpha3Code,name`;
    return this.http.get<PaisSmall>(url);
  }

  getPaisesPorCodigos(borders: string[] | undefined): Observable<PaisSmall[]> {
    if (!borders) {
      return of([]);
    }
    /**
     * Arreglo de Observables de tipo PaisSmall
     */
    const peticiones: Observable<PaisSmall>[] = [];
    borders.forEach(border => {
      /**
       * Vamos llenando el arreglo de Observables con las peticiones
       * una por cada borde del arreglo enviado a la función
       */
      const peticion = this.getPaisPorCodigoSmall(border);
      peticiones.push(peticion);
    });

    /**
     * Disparamos todas las peticiones de manera simultanea
     * utilizando combineLatest
     */
    return combineLatest(peticiones);
  }

}
