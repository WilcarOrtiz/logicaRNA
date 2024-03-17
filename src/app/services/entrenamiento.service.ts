import { Injectable } from "@angular/core";
import { sum } from "d3";
import { FuncionesService } from "../func/funciones.service";
import { FuncionesBase } from "./acciones_Iniciales.service";

@Injectable({
  providedIn: "root",
})
export class EntrenamientoService {
  constructor(
    private funcion: FuncionesService,
    private funcionBase: FuncionesBase
  ) {}
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
  ErrorLineal: number[] = [];
  //no utilizados aun
  Si: number[] = []; //salida funcion soma

  entrenamiento(
    Data: Array<Array<number>>,
    pesosEntrante: Array<Array<number>>,
    umbralEntrante: Array<number>,
    NumIteracionesMaxima: number,
    RataAprendizaje: number,
    ErrorMaximoPermitido: number,
    Nentrada: number,
    Nsalida: number,
    Npatron: number,
    CodActivacion: string,
    CodAlgoEntrenamiento: string
  ) {
    this.NSalidas = Nsalida;
    this.pesos = pesosEntrante;
    this.umbral = umbralEntrante;
    /*  para probar que funciona con los datos de la clase  this.pesos = [
      [1, 1],
      [0.5, 0.5],
      [0.2, 0.3],
    ];
    this.umbral = [0, -1]; */
    this.CodActivacion = CodActivacion;
    this.CodAlgoEntrenamiento = CodAlgoEntrenamiento;
    this.ObtenerPESDR(Data, Nentrada, Nsalida);

    let iteracionActual = 0;
    let errorIteracion = 0;

    while (iteracionActual < NumIteracionesMaxima) {
      console.log("________________ NUEVO ITERACION _________________");
      console.log("__________________________________________________");
      console.log(" iteraciones: ", iteracionActual);
      /*PE es la matriz de los patrones de entrada es decir las entradas */
      for (let i = 0; i < this.PE.length; i++) {
        let patron = this.PE[i];
        /*como es una matriz trabajamos como un patron a la vez (presentacion del patron)
        cuando se itera cada una de la filas de la matriz tenemos una iteracion  */
        //console.log(patron);
        this.Paso1_calcularSalidaFuncionSoma(patron);
        this.Paso2_calcularSalidaAtenuada();
        this.Paso3_calcularSalidadDeLaRed();

        for (let j = 0; j < this.NSalidas; j++) {
          this.ErrorLineal.push(
            parseFloat((this.SD[i][j] - this.YRi[j]).toFixed(2))
          );
        }

        this.EPi.push(
          Math.abs(
            this.ErrorLineal.reduce((suma, numero) => suma + numero, 0)
          ) / this.NSalidas
        );

        //ejecutarFuncion es una funcion del servicio Funciones de la carpeta func
        let result = this.funcion.ejecutarFuncion(
          this.CodAlgoEntrenamiento,
          this.pesos,
          patron,
          this.ErrorLineal,
          RataAprendizaje,
          this.umbral
        );
        this.vaciarVectores();
        this.pesos = result.pesos;
        this.umbral = result.umbral;
      }

      errorIteracion = parseFloat(
        (
          this.EPi.reduce((suma, numero) => suma + numero) / this.EPi.length
        ).toFixed(2)
      );
      this.ErrorIteracion.push(errorIteracion);
      console.log("Error de la iteracion", errorIteracion);
      iteracionActual++;
      console.log(errorIteracion, "<=", ErrorMaximoPermitido);
      if (errorIteracion <= ErrorMaximoPermitido) {
        //para salir en caso de que el error de la iteracion sea menor al maximo permitido (condicion ideal)
        // como se cumple la condicion guardamos en un excel los pesos y umbrales
        this.funcionBase.guardarEnExcel(this.pesos, this.umbral);
        break;
      } else {
        console.log("Debe seguir");
      }
    }
  }

  //esta funcion es para inicializar la simulacion, hasta el momento solo esta en desarrollo
  iniciarSimulacion(event: any) {
    this.vaciarVectores();
    //verificar si funciona o no
    let lectura = this.funcionBase.leerDesdeExcel(event);
    this.pesos = lectura.pesos;
    this.umbral = lectura.umbral;
  }

  private vaciarVectores() {
    this.pesos = [];
    this.umbral = [];
    this.YRi = [];
    this.Si = [];
    this.ErrorLineal = [];
  }

  private Paso3_calcularSalidadDeLaRed() {
    this.YRi = this.funcion.ejecutarFuncion(this.CodActivacion, this.Si);
    console.log("Salida de la red: ", this.YRi);
  }

  private Paso2_calcularSalidaAtenuada() {
    for (let i = 0; i < this.Si.length; i++) {
      // console.log(this.Si[i], "-", this.umbral[i]);
      this.Si[i] = parseFloat((this.Si[i] - this.umbral[i]).toFixed(2));
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
          (S[i] * this.pesos[i][j]).toFixed(2)
        ); */
        SumCol += S[i] * this.pesos[i][j];
      }
      this.Si.push(parseFloat(SumCol.toFixed(2)));
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
