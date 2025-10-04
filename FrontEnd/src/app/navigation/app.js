import {
    HomeIcon,
    CalendarDaysIcon,
    UsersIcon
} from '@heroicons/react/24/outline';
import TruckIcon from 'assets/nav-icons/truck.svg?react'
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM,NAV_TYPE_COLLAPSE } from 'constants/app.constant'


const ROOT_APP = '/app'

const path = (root, item) => `${root}${item}`;

export const app = {
    id: 'app',
    type: NAV_TYPE_ROOT,
    path: '/app',
    title: 'App',
    Icon: TruckIcon,
    childs: [
        {
            id: 'app.home',
            path: path(ROOT_APP, '/home'),
            type: NAV_TYPE_ITEM,
            title: 'Home',
            Icon: HomeIcon,
        },
        {
            id: 'app.invoice',
            path: path(ROOT_APP, '/invoice'),
            type: NAV_TYPE_COLLAPSE,
            title: 'Invoices',
            Icon: CalendarDaysIcon,
            childs: [
                {
                    id: 'app.invoice.create',
                    path: path(ROOT_APP, '/invoice/create'),
                    type: NAV_TYPE_ITEM,
                    title: 'Create Invoice',
                },
                {
                    id: 'app.invoice.history',
                    type: NAV_TYPE_ITEM,
                    path: path(ROOT_APP, '/invoice/history'),
                    title: 'Invoice History',
                },
            ],
        },
        {
            id: 'app.clients',
            path: path(ROOT_APP, '/clients'),
            type: NAV_TYPE_COLLAPSE,
            title: 'Clients',
            Icon: UsersIcon,
            childs: [
                {
                    id: 'app.clients.register',
                    type: NAV_TYPE_ITEM,
                    path: path(ROOT_APP, '/clients/register'),
                    title: 'Add Client',
                },
                {
                    id: 'app.clients.all',
                    type: NAV_TYPE_ITEM,
                    path: path(ROOT_APP, '/clients/all'),
                    title: 'Clients History',
                },
            ],
        },

    ]
}
