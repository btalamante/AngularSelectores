import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaisesServiceService } from '../../services/paises-service.service';
import { Pais, PaisSmall } from '../../interfaces/paises-interface';
import { switchMap, tap } from "rxjs/operators";

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [
  ]
})
export class SelectorPageComponent implements OnInit {

  miFormulario: FormGroup = this.fb.group({
    region: ['', Validators.required],
    pais: ['', Validators.required],
    frontera: ['', Validators.required]
  });

  cargando: boolean = false;

  // Llenar selectores
  regiones: string[] = [];
  paises: PaisSmall[] = [];
  // fronteras: string[] = [];
  fronteras: PaisSmall[] = [];

  constructor(private fb: FormBuilder, private ps: PaisesServiceService) { }

  ngOnInit(): void {
    this.regiones = this.ps.regiones;

    // Cuando cambie la region
    // observable del control region y que nos ayuda a detectar cuando existen cambios
    // dentro del combo Continente
    // y al cambiar traemos los paises de dicha región
    // el value Changes regresa el observable necesario para esto
    /**
     * Podemos refactorizar el código de abajo usando un switchmap
     */
    // this.miFormulario.get('region')?.valueChanges
    //   .subscribe(region => {
    //     this.ps.getPaisesPorRegion(region)
    //       .subscribe(paises => {
    //         this.paises = paises;
    //       })
    //   });
    this.miFormulario.get('region')?.valueChanges
      .pipe(
        tap(
          /**
           * 
           * Tap nos ayuda a poder realizar acciones previas a otros operadores
           */
          (_) => {
            this.miFormulario.get('pais')?.reset('');
            /**
             * Cambiamos la propiedad para que aparezca el cargando
             */
            this.cargando = true;
            /**
             * Deshabilitamos el select de frontera al seleccionar un valir de región
             */
            //this.miFormulario.get('frontera')?.disable();
          }),
        switchMap(
          region => {
            return this.ps.getPaisesPorRegion(region);
          }
        )
      )
      .subscribe(paises => {
        /**
         * Desparecemos el mensajde de cargando
         */
        this.cargando = false;
        this.paises = paises;
      });

    this.miFormulario.get('pais')?.valueChanges
      .pipe(
        tap(
          (_) => {
            this.fronteras = [];
            /**
             * Habilitamos el select de frontera para que pueda seleccionar valores
             */
            //this.miFormulario.get('frontera')?.enable();
            this.cargando = true;            
            this.miFormulario.get('frontera')?.reset('');
          }
        ),
        switchMap(
          codigo => {
            return this.ps.getFronteras(codigo);
          }
        ),
        switchMap(pais => {
          return this.ps.getPaisesPorCodigos(pais?.borders)
        })
      )
      .subscribe(
        paises => {
          /**
           * Aquí le decimos que si el valor es nulo asigne un arreglo vacío
           */
          // this.fronteras = frontera?.borders || [];
          console.log('paises', paises);
          this.cargando = false;
          this.fronteras = paises;
        }
      )
    // .pipe(
    //   tap(
    //     (_) => {
    //       this.miFormulario.get('frontera')?.reset('');
    //     }),
    //   switchMap(
    //     pais => {
    //       console.log(pais.code);
    //       console.log('pais', pais);
    //       return this.ps.getFronteras(pais);
    //     }
    //   )
    // )
    // .subscribe(fronteras => {
    //   // this.pais?.borders = fronteras.borders;
    //   console.log(fronteras);
    // });
  }

  guardar() {
    console.log(this.miFormulario.value);
  }

}


