import { NAV_TYPE_ITEM, } from "constants/app.constant";
import TruckIcon from 'assets/nav-icons/truck.svg?react'
export const baseNavigation = [
  {
      id: 'app',
      type: NAV_TYPE_ITEM,
      path: '/app/home',
      title: 'App',
      Icon: TruckIcon,
  },
]
