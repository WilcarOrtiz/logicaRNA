import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), CommonModule, BrowserModule],
};
