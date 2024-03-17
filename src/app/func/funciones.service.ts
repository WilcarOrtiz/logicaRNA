import { Injectable } from "@angular/core";

interface Funcion {
  (...args: any[]): any;
}

class Funciones {
  tipo: string;
  nombre: string;
  codigo: string;
  funcion: Funcion;

  constructor(tipo: string, nombre: string, codigo: string, funcion: Funcion) {
    this.tipo = tipo;
    this.nombre = nombre;
    this.codigo = codigo;
    this.funcion = funcion;
  }
}

@Injectable({
  providedIn: "root",
})
export class FuncionesService {
  listaFuncionesDisponible: Array<Funciones> = [];

  constructor() {
    const limitadorDuro: Funcion = (Si: number[]) =>
      Si.map((element) => (element >= 0 ? 1 : 0));
    const reglaDelta: Funcion = (
      pesos: Array<Array<number>>,
      patron: Array<number>,
      errorlineal: Array<number>,
      rata: number,
      umbral: Array<number>
    ) => {
      let nuevoPesos: number[][] = [],
        nuevoUmbral: number[] = [];
      // Inicializar nuevoPesos con arrays vacíos
      for (let i = 0; i < pesos.length; i++) {
        nuevoPesos[i] = new Array(pesos[0].length);
      }

      /* console.log("Actualizacion");
      console.log("Patron:", patron);
      console.log("Error lineal:", errorlineal);
      console.log("Pesos", pesos);
      console.log("Rata aprendizaje", rata); */
      for (let j = 0; j < pesos[0].length; j++) {
        /*  console.log(
          "Nuevo umbral",
          umbral[j],
          "+",
          rata,
          "*",
          errorlineal[j],
          "*",
          1
        ); */
        nuevoUmbral[j] = parseFloat(
          (umbral[j] + rata * errorlineal[j] * 1).toFixed(2)
        );
        for (let i = 0; i < pesos.length; i++) {
          /*  console.log(
            pesos[i][j],
            "+",
            rata,
            "*",
            errorlineal[j],
            "*",
            patron[i]
          ); */
          nuevoPesos[i][j] = parseFloat(
            (pesos[i][j] + rata * errorlineal[j] * patron[i]).toFixed(2)
          );
        }
      }
      //console.log("pesos (nuevo)", nuevoPesos, "umbral (nuevo)", nuevoUmbral);
      return { pesos: nuevoPesos, umbral: nuevoUmbral };
    };

    this.listaFuncionesDisponible = [
      new Funciones("activacion", "Limitador Duro", "1234", limitadorDuro),
      new Funciones("entrenamiento", "Regla Delta", "5678", reglaDelta),
    ];
  }

  ejecutarFuncion(codigo: string, ...args: any[]): any {
    const funcionEncontrada = this.listaFuncionesDisponible.find(
      (funcion) => funcion.codigo === codigo
    );

    if (!funcionEncontrada) {
      throw new Error(`Función "${codigo}" no encontrada.`);
    }

    return funcionEncontrada.funcion(...args);
  }
}
