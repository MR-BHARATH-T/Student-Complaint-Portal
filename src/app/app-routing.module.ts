// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// import { HomeComponent } from './home/home';
// import { RegisterComponent } from './auth/register/register';
// import { LoginComponent } from './auth/login/login';
// import { LogoutComponent } from './auth/logout/logout';
// import { ComplaintComponent } from './complaint/complaint';
// import { DashboardComponent } from './complaint/dashboard/dashboard';
// import { AuthGuard } from './services/auth.guard'; // we'll create this guard below

// const routes: Routes = [
//   { path: '', component: HomeComponent },
//   { path: 'register', component: RegisterComponent },
//   { path: 'login', component: LoginComponent },
//   { path: 'logout', component: LogoutComponent },
//   { path: 'complaint/new', component: ComplaintComponent, canActivate: [AuthGuard] },
//   { path: 'complaint/edit/:id', component: ComplaintComponent, canActivate: [AuthGuard] },
//   { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
//   { path: '**', redirectTo: '' }
// ];

// @NgModule({
//   imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
//   exports: [RouterModule]
// })
// export class AppRoutingModule {}
