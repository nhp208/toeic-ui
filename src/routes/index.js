import Auth from '~/pages/Auth';
import Home from '~/pages/Home';
import Introduce from '~/pages/Introduce';
import AuthCallback from '~/pages/AuthCallback';
import Profile from '~/pages/Profile';
import EditProfile from '~/pages/Profile/EditProfile';
import Vocabulary from '~/pages/Vocabulary';
import Admin from '~/pages/Admin';
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
    {
        path: '/auth/callback',
        component: AuthCallback,
        layout: null,
    },
    {
        path: '/profile',
        component: Profile,
        // dùng DefaultLayout
    },
    {
        path: '/profile/edit',
        component: EditProfile,
        // dùng DefaultLayout
    },
    {
        path: '/vocabulary',
        component: Vocabulary,
        // dùng DefaultLayout
    },
    {
        path: '/vocabulary/flashcard',
        component: Vocabulary,
    },
    {
        path: '/vocabulary/review',
        component: Vocabulary,
    },
    {
        path: '/vocabulary/list',
        component: Vocabulary,
    },
    {
        path: '/admin',
        component: Admin,
        // dùng DefaultLayout
    },

];
const privateRoutes = [];
export { publicRoutes, privateRoutes };
