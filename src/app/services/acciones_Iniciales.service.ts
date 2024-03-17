import { Injectable } from "@angular/core";
import * as XLSX from "XLSX";

interface Data {
  threshold: number[] | number[][];
  weights: number[] | number[][];
}

@Injectable({
  providedIn: "root",
})
export class FuncionesBase {
  constructor() {}

  relativePath: string = "assets/db/";

  // Función para obtener el nombre del archivo con la fecha actual y hora
  obtenerNombreArchivo(): string {
    const fechaActual = new Date();
    const fechaFormateada = fechaActual.toISOString().replace(/[-T:\.Z]/g, "");
    return `Informacion_${fechaFormateada}`;
  }

  // Función para guardar pesos y umbral en un archivo Excel
  guardarEnExcel(pesos: any, umbral: any) {
    const nombreArchivo = this.obtenerNombreArchivo();
    const wb = XLSX.utils.book_new();
    const ws_pesos = XLSX.utils.aoa_to_sheet(pesos);
    const ws_umbral = XLSX.utils.aoa_to_sheet([umbral]);
    XLSX.utils.book_append_sheet(wb, ws_pesos, "Pesos");
    XLSX.utils.book_append_sheet(wb, ws_umbral, "Umbral");
    const filePath = `${this.relativePath}${nombreArchivo}.xlsx`;
    XLSX.writeFile(wb, filePath);
    console.log(`Datos guardados en ${filePath}`);
  }

  leerDesdeExcel(event: any): { pesos: any; umbral: any } {
    const archivo: File = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet_pesos = workbook.Sheets["Pesos"];
      const sheet_umbral = workbook.Sheets["Umbral"];
      const pesos = XLSX.utils.sheet_to_json(sheet_pesos, { header: 1 }) as any;
      const umbral = XLSX.utils.sheet_to_json(sheet_umbral, {
        header: 1,
      })[0] as any;

      return { pesos, umbral };
    };

    reader.readAsArrayBuffer(archivo);

    // Retornar algo por defecto en caso de no haberse cargado aún el archivo
    return { pesos: null, umbral: null };
  }

  LeerExcel(event: any): Promise<any[]> {
    let data: any;
    let file = event.target.files[0];
    let fileReader = new FileReader();
    fileReader.readAsBinaryString(file);
    return new Promise<any[][]>((resolve, reject) => {
      fileReader.onload = (e) => {
        var workbook = XLSX.read(fileReader.result, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const matriz: any[][] = [];
        for (let i = 0; i < data.length; i++) {
          matriz.push(Object.values(data[i]));
        }
        resolve(data);
      };
    });
  }

  obtenerNumParametros(
    excelData: any
  ): { NumEntrada: number; NumSalida: number; patrones: number } {
    let contEntradas: number = 0,
      contSalidas: number = 0;
    let encabezado: string[];

    excelData[0].forEach((item: string) => {
      encabezado = item.split("");
      if (encabezado[0] === "S") {
        contEntradas++;
      }
      if (encabezado[0] === "M") {
        contSalidas++;
      }
    });
    return {
      NumEntrada: contEntradas,
      NumSalida: contSalidas,
      patrones: excelData.length - 1,
    };
  }

  InicializarPesosUmbral(
    NumEntradas: number,
    NumSalidas: number
  ): { pesos: Array<Array<number>>; umbral: Array<number> } {
    let pesos: number[][] = [],
      umbral: number[] = [];
    for (let i = 0; i < NumEntradas; i++) {
      pesos[i] = [];
      for (let j = 0; j < NumSalidas; j++) {
        let val = parseFloat((Math.random() * 2 - 1).toFixed(2));
        let val1 = parseFloat((Math.random() * 2 - 1).toFixed(2));
        umbral[j] = val1;
        pesos[i][j] = val;
      }
    }
    return { pesos: pesos, umbral: umbral };
  }
}
