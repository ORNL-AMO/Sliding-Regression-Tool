import {Routes, RouterModule} from "@angular/router";
import {ModuleWithProviders} from "@angular/core";
import {HomeComponent} from "./home/home.component";
import {TableComponent} from "./table/table.component";

const appRoutes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'table',
    component: TableComponent

  }
]
export const appRoutingProviders: any[] = [
]
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
