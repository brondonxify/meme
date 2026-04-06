import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import Link from "next/link";
import React from "react";
import { NavMenu } from "../navbar.types";
import { MenuList } from "./MenuList";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { MenuItem } from "./MenuItem";
import Image from "next/image";
import SearchDropdown from "./SearchDropdown";
import ResTopNavbar from "./ResTopNavbar";
import CartBtn from "./CartBtn";
import UserBtn from "./UserBtn";

const data: NavMenu = [
  {
    id: 1,
    label: "Shop",
    type: "MenuList",
    children: [
      {
        id: 11,
        label: "Computers",
        url: "/shop?category=Computers",
        description: "Desktop PCs, workstations, and servers for every need",
      },
      {
        id: 12,
        label: "Laptops",
        url: "/shop?category=Laptops",
        description: "Business laptops, gaming rigs, and ultrabooks",
      },
      {
        id: 13,
        label: "Accessories",
        url: "/shop?category=Accessories",
        description: "Keyboards, mice, monitors, and peripherals",
      },
      {
        id: 14,
        label: "Networking",
        url: "/shop?category=Networking",
        description: "Routers, switches, and enterprise networking solutions",
      },
    ],
  },
  {
    id: 2,
    type: "MenuItem",
    label: "About",
    url: "/about",
    children: [],
  },
];

const TopNavbar = () => {
  return (
    <nav className="sticky top-0 bg-white z-20">
      <div className="flex relative max-w-frame mx-auto items-center justify-between md:justify-start py-5 md:py-6 px-4 xl:px-0">
        <div className="flex items-center">
          <div className="block md:hidden mr-4">
            <ResTopNavbar data={data} />
          </div>
          <Link
            href="/"
            className={cn([
              integralCF.className,
              "text-2xl lg:text-[32px] mb-2 mr-3 lg:mr-10",
            ])}
          >
            HI-TECH
          </Link>
        </div>
        <NavigationMenu className="hidden md:flex mr-2 lg:mr-7">
          <NavigationMenuList>
            {data.map((item) => (
              <React.Fragment key={item.id}>
                {item.type === "MenuItem" && (
                  <MenuItem label={item.label} url={item.url} />
                )}
                {item.type === "MenuList" && (
                  <MenuList data={item.children} label={item.label} />
                )}
              </React.Fragment>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <SearchDropdown />
        <div className="flex items-center">
          <Link href="/search" className="block md:hidden mr-[14px] p-1">
            <Image
              priority
              src="/icons/search-black.svg"
              height={100}
              width={100}
              alt="search"
              className="max-w-[22px] max-h-[22px]"
            />
          </Link>
          <CartBtn />
          <UserBtn />
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
