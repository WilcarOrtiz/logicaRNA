import { Injectable } from "@angular/core";
import { sum } from "d3";
import { FuncionesService } from "../func/funciones.service";

@Injectable({
  providedIn: "root",
})
export class EntrenamientoService {
  constructor(private funcion: FuncionesService) {}
  //Datos del entrenamiento utilizados
  pesos: number[][] = [];
  umbral: number[] = [];
  NSalidas: number = 0; //numero de salidas
  NEntradas: number = 0; //numero de entradas
  SD: number[][] = []; //Salida Esperada/deseada
  Resultado: any[] = [];
  PE: number[][] = []; //Patrones de entrada
  YRi: number[] = []; //salida funcion activacion
  EPi: number[] = []; // error del patron
  CodActivacion: string = "";
  CodAlgoEntrenamiento: string = "";
  ErrorIteracion: number[] = []; // almacena el error de la iteracion
  //no utilizados aun
  Si: number[] = []; //salida funcion soma

  entrenamiento(
    Data: Array<Array<number>>,
    pesosEntrante: Array<Array<number>>,
    umbralEntrante: Array<number>,
    NumIteraciones: number,
    RataAprendizaje: number,
    ErrorMaximoPermitido: number,
    Nentrada: number,
    Nsalida: number,
    Npatron: number,
    CodActivacion: string,
    CodAlgoEntrenamiento: string
  ) {
    this.NSalidas = Nsalida;
    /* this.pesos = pesosEntrante;
    this.umbral = umbralEntrante; */
    this.pesos = [
      [1, 1],
      [0.5, 0.5],
      [0.2, 0.3],
    ];
    this.umbral = [0, -1];
    this.CodActivacion = CodActivacion;
    this.CodAlgoEntrenamiento = CodAlgoEntrenamiento;

    this.ObtenerPESDR(Data, Nentrada, Nsalida);

    console.log("______________________________________________");
    console.log("Pesos", this.pesos);
    console.log("Umbral", this.umbral);
    console.log("Arreelgo: ", this.PE);
    console.log("______________________________________________");

    //delcaraciones
    let errorLineal: number[] = [];

    for (let i = 0; i < this.PE.length; i++) {
      let patron = this.PE[i]; // patron 1,2,3,4..n
      console.log(
        "______________________________ NUEVO PATRON _________________________________"
      );
      console.log("Patron", patron);
      this.Paso1_calcularSalidaFuncionSoma(patron);
      this.Paso2_calcularSalidaAtenuada();
      this.Paso3_calcularSalidadDeLaRed();

      let result: any;
      for (let j = 0; j < this.NSalidas; j++) {
        console.log(
          "Error lineal  YD - YR:  ",
          this.SD[i][j],
          "-",
          this.YRi[j]
        );
        errorLineal.push(parseFloat((this.SD[i][j] - this.YRi[j]).toFixed(1)));
      }
      console.log("Error lineal", errorLineal);
      this.EPi.push(
        Math.abs(errorLineal.reduce((suma, numero) => suma + numero, 0)) /
          this.NSalidas
      );
      console.log("Error del patron: ", this.EPi[i]);
      //ahora calcular los nuevos pesos y umbrales

      result = this.funcion.ejecutarFuncion(
        this.CodAlgoEntrenamiento,
        this.pesos,
        patron,
        errorLineal,
        RataAprendizaje,
        this.umbral
      );
      this.pesos = [];
      this.umbral = [];
      this.YRi = [];
      this.Si = [];
      errorLineal = [];
      this.pesos = result.pesos;
      this.umbral = result.umbral;
    }
    const promedio = parseFloat(
      (
        this.EPi.reduce((suma, numero) => suma + numero) / this.EPi.length
      ).toFixed(1)
    );
    this.ErrorIteracion.push(promedio);

  }

  private Paso3_calcularSalidadDeLaRed() {
    this.YRi = this.funcion.ejecutarFuncion(this.CodActivacion, this.Si);

  }

  private Paso2_calcularSalidaAtenuada() {
    for (let i = 0; i < this.Si.length; i++) {
      // console.log(this.Si[i], "-", this.umbral[i]);
      this.Si[i] = parseFloat((this.Si[i] - this.umbral[i]).toFixed(1));
    }
    console.log("Salida atenuada: ", ...this.Si);
  }

  private Paso1_calcularSalidaFuncionSoma(S: Array<number>) {
    let SumCol: number = 0;
    for (let j = 0; j < this.NSalidas; j++) {
      //  console.log(`Columna ${j + 1}:`);
      for (let i = 0; i < this.pesos.length; i++) {
        /**        console.log(
          S[i],
          " * ",
          this.pesos[i][j],
          "=",
          (S[i] * this.pesos[i][j]).toFixed(1)
        ); */
        SumCol += S[i] * this.pesos[i][j];
      }
      this.Si.push(parseFloat(SumCol.toFixed(1)));
      SumCol = 0;
    }
    console.log("salida funcion soma: ", ...this.Si);
  }

  private ObtenerPESDR(Data: Array<Array<number>>, M: number, N: number) {
    this.PE = Data.slice(1).map((row) => row.slice(0, M));
    this.SD = Data.slice(1).map((row) => row.slice(M, M + N));
    this.Resultado = Data.slice(1).flatMap((row) => row.slice(M + N));
  }
}
