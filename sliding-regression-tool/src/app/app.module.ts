import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {routing, appRoutingProviders} from "./app.routing";


import { AppComponent } from './app.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { HomeComponent } from './home/home.component';
import { TableComponent } from './table/table.component';
import {RouterModule} from "@angular/router";



@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    HomeComponent,
    TableComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    routing
  ],
  providers: [
    appRoutingProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
