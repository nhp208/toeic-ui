import Auth from '~/pages/Auth';
import Home from '~/pages/Home';
import Introduce from '~/pages/Introduce';
//public routes
const publicRoutes = [
    {
        path: '/',
        component: Introduce,
        layout: null,
    },
    {
        path: '/home',
        component: Home,
        // dùng DefaultLayout
    },
    {
        path: '/auth',
        component: Auth,
        layout: null,
    },

];
const privateRoutes = [];
export { publicRoutes, privateRoutes };
