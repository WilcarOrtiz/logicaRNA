import { Component } from "@angular/core";

import { RouterOutlet } from "@angular/router";
import { MessageComponent } from "./shared/message/message.component";
import { DibujoComponent } from "./shared/dibujo/dibujo.component";

import { EntrenamientoService } from "./services/entrenamiento.service";
import { FuncionesBase } from "./services/acciones_Iniciales.service";

@Component({
  selector: "app-root",
  standalone: true,
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
  imports: [RouterOutlet, MessageComponent, DibujoComponent],
})
export class AppComponent {
  title = "RNA";
  excelData: any[][] = [];
  Data: any[][] = [];
  pesos: number[][] = [];
  umbral: number[] = [];

  //parametro de entrenamiento
  entradas: number = 0;
  salidas: number = 0;
  patrones: number = 0;

  constructor(
    private funcionesExtra: FuncionesBase,
    private entrenamientoService: EntrenamientoService
  ) {}

  LeerExcel(event: any) {
    //primero se lee el excel
    this.funcionesExtra
      .LeerExcel(event)
      .then((e) => {
        this.Data = e;
        //ya que tenemos los datos lo pasamos a la funcion que nos dara los parametros
        let resultado = this.funcionesExtra.obtenerNumParametros(this.Data);
        resultado
          ? ((this.entradas = resultado.NumEntrada),
            (this.salidas = resultado.NumSalida),
            (this.patrones = resultado.patrones),
            //se inicializa los pesos y umbrales de manera aletoria, esta aqui pero en realidad va por fuera
            //ya que debe ser un button o check
            this.InicializarPesosUmbral(),
            //luego se inicia el entrenamiento de igual forma esta funcion va en button
            this.IniciarEntrenamiento())
          : alert("No se cargaron los patrones de entrada");
      })
      .catch();
  }

  InicializarPesosUmbral() {
    let resultado = this.funcionesExtra.InicializarPesosUmbral(
      this.entradas,
      this.salidas
    );
    this.pesos = resultado.pesos;
    this.umbral = resultado.umbral;
  }

  IniciarEntrenamiento() {
    this.entrenamientoService.entrenamiento(
      //la data es el la informacion del excel en formato de matriz
      this.Data,
      this.pesos,
      this.umbral,
      300,
      0.07,
      0.03,
      this.entradas,
      this.salidas,
      this.patrones,
      //Estos codigos son referentes a la funcion de activacin y al algoritmo de entrenamiento,
      "1234",
      "5678"
    );
  }
}
