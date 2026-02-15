import express from 'express';
import { UserRoutes } from '../modules/user/user.route';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { TruckRoutes } from '../modules/Truck/truck.route';
import { ServicesRoutes } from '../modules/services/services.route';


const router = express.Router();



const moduleRoutes = [
    {
        path: '/user',
        route: UserRoutes
    },
    {
        path: '/auth',
        route:AuthRoutes
    },
    {
        path: '/truck',
        route:TruckRoutes
    },{
        path: '/services',
        route:ServicesRoutes
    }
    
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;