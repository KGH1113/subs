"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import * as Lucide from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import useNavigation from "@/hooks/use-navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSidebar, setShowSidebar] = useState<boolean>();
  const [isMobile, setIsMobile] = useState<boolean>();

  const {
    isHomeActive,
    isSongRequestActive,
    isMorningSongRequestActive,
    isSuggestionActive,
    isNewCrewActive,
  } = useNavigation();

  function getTitle(): string {
    if (isHomeActive) {
      return "SUBS";
    } else if (isSongRequestActive) {
      return "점심시간 음악신청";
    } else if (isMorningSongRequestActive) {
      return "등굣길 음악신청";
    } else if (isSuggestionActive) {
      return "건의사항 신청";
    } else if (isNewCrewActive) {
      return "방송부원 모집";
    } else {
      return "";
    }
  }

  useEffect(() => {
    setShowSidebar(window?.innerWidth > 640);
    setIsMobile(window?.innerWidth <= 640);
  }, []);

  const SidebarLink = ({
    children,
    hrefName,
    active,
    ...props
  }: {
    children: React.ReactNode;
    hrefName: string;
    active: boolean;
    onClick?: () => void;
  }) => {
    const cln =
      "mb-2 overflow-hidden w-full font-semibold text-2lg hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-start whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2";
    return (
      <Link
        href={hrefName}
        className={active ? cln + " bg-accent" : cln}
        {...props}
      >
        <div className="flex gap-3 jusify-start items-center">{children}</div>
      </Link>
    );
  };

  const SidebarLayout = ({ children }: { children: React.ReactNode }) =>
    isMobile ? (
      <div className={`${showSidebar ? "" : "hidden"}`}>{children}</div>
    ) : (
      <ResizablePanel
        minSize={10}
        defaultSize={15}
        className={`${showSidebar ? "" : "hidden"}`}
      >
        {children}
      </ResizablePanel>
    );

  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen">
      <SidebarLayout>
        <aside
          id="sidebar"
          className="max-[640px]:absolute z-20 top-0 h-screen"
        >
          <div className="max-[640px]:flex max-[640px]:gap-3 max-[640px]:w-3/4">
            <div className="block h-[200px] justify-center items-center p-6 bg-background overflow-hidden max-[640px]:border-solid max-[640px]:border h-screen">
              <div className="flex gap-3 w-full h-8 mt-3 mb-8 items-center font-semibold">
                <Avatar>
                  <AvatarImage src={"https://i.ibb.co/XJyZjdm/logo192.png"} />
                  <AvatarFallback>SUBS</AvatarFallback>
                </Avatar>
                SUBS
              </div>
              <Separator className="my-4" />
              <div className="mt-10">
                <SidebarLink hrefName={"/"} active={isHomeActive}>
                  <Lucide.Home className="w-5" />
                  <span>{"SUBS"}</span>
                </SidebarLink>
                <SidebarLink
                  hrefName={"/song-request"}
                  active={isSongRequestActive}
                >
                  <Lucide.Music4 className="w-5" />
                  <span>{"점심시간 음악신청"}</span>
                </SidebarLink>
                <SidebarLink
                  hrefName={"/morning-song-request"}
                  active={isMorningSongRequestActive}
                >
                  <Lucide.Music2 className="w-5" />
                  <span>{"등굣길 음악신청"}</span>
                </SidebarLink>
                <SidebarLink
                  hrefName={"/suggestion-request"}
                  active={isSuggestionActive}
                >
                  <Lucide.Mail className="w-5" />
                  <span>{"건의사항 신청"}</span>
                </SidebarLink>
                <SidebarLink hrefName={"/new-crew"} active={isNewCrewActive}>
                  <Lucide.File className="w-5" />
                  <span>{"방송부원 모집"}</span>
                </SidebarLink>
              </div>
            </div>
            <button
              className="inline-flex items-center justify-center mt-4 border border-input bg-background rounded-md h-10 w-10 p-2 min-[640px]:hidden"
              onClick={() => {
                setShowSidebar(false);
              }}
            >
              <Lucide.X />
            </button>
          </div>
        </aside>
      </SidebarLayout>
      <ResizableHandle withHandle className="max-[640px]:hidden" />
      <ResizablePanel minSize={70} defaultSize={85}>
        <div className="fixed sm:relative z-10 flex w-full h-[101px] justify-between items-center px-5 border-border border-b-[1px] bg-background">
          <div className="w-[24px] h-[24px] flex items-center justify-center">
            <Lucide.Menu
              className="min-[640px]:hidden"
              onClick={() => {
                setShowSidebar(true);
              }}
            />
          </div>
          <h1 className="font-semibold text-lg mr-3">{getTitle()}</h1>
        </div>
        <main className="w-full h-full overflow-visible p-6 text-sm font-medium mt-[101px] sm:mt-[0px]">
          {children}
        </main>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
