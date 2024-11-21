"use client";

import React, { useEffect, useState } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AspectRatio } from "@/components/ui/aspect-ratio";

import { toast } from "sonner";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { TimerReset, Loader, Search, Delete, Copy } from "lucide-react";

import axios from "axios";

import Swal from "sweetalert2";

interface SongRequest {
  name: string;
  studentNumber: string;
  songTitle: string;
  singer: string;
  imgSrc: string;
}

interface SongSelectData {
  songTitle: string;
  singer: string;
  imgSrc: string;
}

interface SearchResult {
  songTitle: string;
  singer: string;
  publishYear: number;
  imgUrl: string;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "이름을 입력해주세요." }),
  studentNumber: z.string().length(5, { message: "학번이 아닙니다." }),
  email: z.string().min(1, { message: "이메일 주소를 입력해주세요." }),
  songTitle: z.string().min(1, { message: "노래제목을 입력해주세요" }),
  singer: z.string().min(1, { message: "가수를 입력해주세요" }),
  imgSrc: z.string(),
  readPrecaution: z.boolean(),
});

export default function SongRequestPage() {
  const [leftSecToRefresh, setLeftSecToRefresh] = useState<number>(5);
  const [songList, setSongList] = useState<SongRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResult, setSearchResult] = useState<SearchResult[]>([]);
  const [viewSongSelectError, setViewSongSelectError] =
    useState<boolean>(false);
  const [selectedSongData, setSelectedSongData] = useState<SongSelectData>();
  const [windowWidth, setWindowWidth] = useState<number>(0);

  async function refreshSongList() {
    axios
      .get(`/api/song-request?date=${Number(new Date())}`)
      .then((response) => {
        setSongList(response.data);
      });
  }

  useEffect(() => {
    setWindowWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    refreshSongList();
    const refreshInterval = setInterval(() => {
      setLeftSecToRefresh((prev) => prev - 1);
      if (leftSecToRefresh <= 0) {
        if (songList.length < 10) {
          refreshSongList();
        }
        setLeftSecToRefresh(5);
      }
    }, 1000);

    return () => clearInterval(refreshInterval);
  }, [leftSecToRefresh]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const response = await axios.post("/api/email-verification", {
      emailAddr: values.email + "@seoun.sen.ms.kr",
    });
    const verificationCode = response.data.code;

    const { value: verificationCodeInput } = await Swal.fire({
      title: "인증코드 입력",
      text: `입력하신 학교 이메일(${values.email}@seoun.sen.ms.kr)로 인증코드가 발송되었습니다.`,
      input: "number",
      showCancelButton: true,
      confirmButtonText: "인증",
    });
    if (verificationCodeInput !== verificationCode) {
      toast.error("이메일 인증에 실패하였습니다.");
      return;
    }
    if (!values.email.includes(values.studentNumber)) {
      toast.error("인증하신 이메일과 입력하신 학번이 일치하지 않습니다.");
      return;
    }

    axios
      .post(`/api/song-request?date=${Number(new Date())}`, {
        name: values.name,
        studentNumber: values.studentNumber,
        songTitle: values.songTitle,
        singer: values.singer,
        imgSrc: values.imgSrc,
      })
      .then((response) => {
        if (response.data.isValid) {
          toast.success("노래가 신청되었습니다.");
        } else {
          toast.error(response.data.message);
        }
        refreshSongList();
        setLeftSecToRefresh(5);
      });
    form.reset(
      (values = {
        name: "",
        studentNumber: "",
        email: "",
        singer: "",
        songTitle: "",
        imgSrc: "",
        readPrecaution: false,
      })
    );
    setViewSongSelectError(true);
  }

  return (
    <div
      className="flex flex-col xl:flex-row w-full h-full"
      style={{ height: "100%" }}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-[20px] xl:w-3/4 p-3 pr-6 pb-6 border-border border-b-[1px] xl:border-r-[1px] xl:border-b-[0px] h-fit xl:h-full"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>신청자 이름</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="studentNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>신청자 학번</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>신청자 학교 이메일</FormLabel>
                <div className="sm:flex sm:space-x-2 sm:space-y-0 space-y-3 items-end justify-center w-full">
                  <div className="flex items-center justify-center space-x-2 border-input border rounded-md pr-3 w-full">
                    <FormControl>
                      <Input {...field} className="border-0" />
                    </FormControl>
                    <p>{"@seoun.sen.ms.kr"}</p>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormLabel className={viewSongSelectError ? "text-red-800" : ""}>
            음악 선택
            {!form.getValues("songTitle")
              ? ""
              : `: ${form.getValues("songTitle")} - ${form.getValues(
                  "singer"
                )}`}
          </FormLabel>
          <Drawer>
            <DrawerTrigger className="w-fit inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              노래 선택하기
            </DrawerTrigger>
            <DrawerContent className="h-[70%]">
              <DrawerHeader>
                <DrawerTitle>노래 검색</DrawerTitle>
                <DrawerDescription>
                  노래 검색을 통해 음악 신청이 가능합니다.
                </DrawerDescription>
                <form
                  className="border-2 rounded-full border-border my-2 flex space-x-2 items-center justify-between pr-4"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <Input
                    placeholder="노래 검색..."
                    className="border-0 rounded-l-full p-5"
                    onChange={(e) => setSearchQuery(e.target.value)}
                    value={searchQuery}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const encoded = Buffer.from(
                        `${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.NEXT_PUBLIC_SPOTIFY_SECRET}`
                      ).toString("base64");
                      const headers = {
                        Authorization: `Basic ${encoded}`,
                        "Content-Type": "application/x-www-form-urlencoded",
                      };

                      const payload = new URLSearchParams();
                      payload.append("grant_type", "client_credentials");

                      axios
                        .post(
                          "https://accounts.spotify.com/api/token",
                          payload,
                          { headers: headers }
                        )
                        .then((accesstoken_response) => {
                          const access_token =
                            accesstoken_response.data.access_token;

                          const headers = {
                            Authorization: `Bearer ${access_token}`,
                          };

                          const query_params = {
                            q: searchQuery,
                            type: "track",
                            limit: 20,
                          };

                          axios
                            .get("https://api.spotify.com/v1/search", {
                              headers: headers,
                              params: query_params,
                            })
                            .then((response) => {
                              const searchResults: SearchResult[] = [];
                              response.data.tracks.items.map((d: any) => {
                                searchResults.push({
                                  songTitle: d.name,
                                  singer: d.artists.map(
                                    (artistData: any) => artistData.name
                                  )[0],
                                  publishYear: new Date(
                                    d.album.release_date
                                  ).getFullYear(),
                                  imgUrl: d.album.images[0].url,
                                });
                              });
                              setSearchResult(searchResults);
                            })
                            .catch((error) => {
                              console.error("Error:", error);
                            });
                        })
                        .catch((error) => {
                          console.error("Error:", error);
                        });
                    }}
                  >
                    <Search size={18} color="#94A3B8" />
                  </button>
                </form>
              </DrawerHeader>
              <ul className="overflow-auto w-screen p-2 pl-4">
                {searchResult.length === 0 ? (
                  <li className="m-2 font-bold ml-4 p-2">
                    검색결과가 없습니다.
                  </li>
                ) : (
                  searchResult.map((searchData, i) => (
                    <li
                      className={
                        selectedSongData?.songTitle === searchData.songTitle &&
                        selectedSongData?.singer === searchData.singer &&
                        selectedSongData?.imgSrc === searchData.imgUrl
                          ? "border-2 border-secondary rounded-md w-full p-2 box-border"
                          : "border-2 border-background rounded-md w-full p-2 box-border"
                      }
                      key={i}
                      onClick={() => {
                        setSelectedSongData({
                          songTitle: searchData.songTitle,
                          singer: searchData.singer,
                          imgSrc: searchData.imgUrl,
                        });
                        form.setValue("songTitle", searchData.songTitle);
                        form.setValue("singer", searchData.singer);
                        form.setValue("imgSrc", searchData.imgUrl);
                      }}
                    >
                      <div className="w-fit flex space-x-2 justify-stretch">
                        <div className="w-[3rem]">
                          <AspectRatio ratio={1 / 1}>
                            <img
                              src={searchData.imgUrl}
                              alt="Image"
                              className="rounded-md object-cover"
                              width={300}
                              height={300}
                            />
                          </AspectRatio>
                        </div>
                        <div className="w-fit flex flex-col items-baseline">
                          <p className="text-[0.9rem] font-bold break-words truncate">
                            {searchData.songTitle}
                          </p>
                          <p className="text-[0.7rem] font-normal break-words truncate">
                            {searchData.singer} | {searchData.publishYear}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
              <DrawerFooter>
                <div className="flex">
                  <DrawerClose asChild>
                    <Button variant="outline">완료</Button>
                  </DrawerClose>
                </div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          <FormField
            control={form.control}
            name="readPrecaution"
            render={({ field }) => (
              <FormItem className="flex flex-row space-x-3 space-y-0 items-center mb-[25px]">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>신청시 주의사항을 읽었습니다.</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="w-fit"
            type="submit"
            onClick={() => {
              if (!selectedSongData) {
                setViewSongSelectError(true);
              }
            }}
          >
            신청하기
          </Button>
        </form>
      </Form>

      <div className="xl:w-1/4 p-3 flex flex-col gap-[20px] overflow-auto">
        <div className="space-y-2 p-3 pb-6 border-border border-b-[1px]">
          <h2 className="text-lg font-semibold">신청시 주의사항</h2>
          <ul className="mx-[10px] space-y-2">
            <li>- 건전한 노래만 신청해주세요.</li>
            <li>- 대중성이 있는 노래만 신청해 주세요.</li>
            <li>- 본인이 직접 신청해주세요.</li>
            <li>- 중복된 가수의 노래 신청은 하지 말아주세요.</li>
            <li>
              - 신청곡이 신청되었으나, 방송부원들의 의견에 따라 신청곡이
              재생되지 않을 수 있습니다.
            </li>
          </ul>
        </div>
        <div className="space-y-2 p-3">
          <div className="flex">
            <h2 className="text-lg font-semibold">신청목록 </h2>
            {!songList ? (
              <Loader className="text-slate-400 animate-spin" size={17} />
            ) : (
              <></>
            )}
            <div
              className={`flex justify-between mx-3 xl:items-center xl:gap-2 ${
                windowWidth < 1500 ? "hidden" : "flex"
              }`}
            >
              <span className="text-sm text-ring font-normal mr-1">
                {new Date().toLocaleDateString()}
              </span>
              <div className="flex items-center text-ring hover:bg-secondary p-1 rounded-md cursor-pointer">
                <TimerReset
                  size={15}
                  onClick={async () => {
                    await refreshSongList();
                  }}
                />
                <p>{leftSecToRefresh}</p>
              </div>
            </div>
          </div>
          <div>
            {!songList ? (
              <ul className="mx-[10px] space-y-1 animate-pulse">. . .</ul>
            ) : (
              <ul className="">
                {songList?.length === 0 ? (
                  <li className="p-2">아직 신청된 곡이 없습니다.</li>
                ) : (
                  songList?.map((songData, index) => (
                    <li
                      key={index}
                      className="flex space-x-1 sm:space-x-3 items-center border-2 border-background hover:border-border p-2 rounded-md ease-in-out duration-300"
                    >
                      <div className="w-full flex space-x-2 justify-stretch">
                        <div className="w-[3rem]">
                          <AspectRatio ratio={1 / 1}>
                            <img
                              src={songData.imgSrc}
                              alt="Image"
                              className="rounded-md object-cover"
                              width={300}
                              height={300}
                            />
                          </AspectRatio>
                        </div>
                        <div className="w-[6rem]">
                          <p className="text-[0.9rem] font-bold break-words truncate">
                            {songData.songTitle}
                          </p>
                          <p className="text-[0.7rem] font-normal break-words truncate">
                            {songData.singer}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <div className="hover:bg-secondary rounded-full p-1 cursor-pointer">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="1"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              className="lucide lucide-ellipsis-vertical"
                            >
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${songData.songTitle} - ${songData.singer}`
                              );
                              toast.success("복사되었습니다.");
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            <span>복사</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async () => {
                              const { value: emailAddrInput, isConfirmed } =
                                await Swal.fire({
                                  title: "신청자 이메일 인증",
                                  text: "신청취소를 할 노래를 신청하신 분의 학교 이메일을 입력주세요.",
                                  html: `
                                  <div style="display: flex; gap: 0.5rem; padding: 0.5rem; justify-content: center; align-items: center; border: 2px solid; border-radius: 0.7rem">
                                    <input id="swal-input1" style="margin: 0; border: none; padding: 0.5rem 1rem; width: 50%;">
                                    <span style="font-size: 1rem;">@seoun.sen.ms.kr</span>
                                  </div>
                                `,
                                  focusConfirm: false,
                                  showCancelButton: true,
                                  confirmButtonText: "인증",
                                  preConfirm: () => {
                                    return (
                                      document.getElementById(
                                        "swal-input1"
                                      )! as any
                                    ).value;
                                  },
                                });
                              if (
                                !emailAddrInput.includes(songData.studentNumber)
                              ) {
                                toast.error(
                                  "인증하신 이메일과 입력하신 신청자의 학번이 일치하지 않습니다."
                                );
                                return;
                              }

                              const response = await axios.post(
                                "/api/email-verification",
                                {
                                  emailAddr:
                                    emailAddrInput + "@seoun.sen.ms.kr",
                                }
                              );
                              const verificationCode = response.data.code;

                              const { value: verificationCodeInput } =
                                await Swal.fire({
                                  title: "인증코드 입력",
                                  text: `입력하신 학교 이메일(${emailAddrInput}@seoun.sen.ms.kr)로 인증코드가 발송되었습니다.`,
                                  input: "number",
                                  showCancelButton: true,
                                  confirmButtonText: "인증",
                                });

                              if (verificationCodeInput !== verificationCode) {
                                toast.error("이메일 인증에 실패하였습니다.");
                                return;
                              }

                              axios
                                .delete("/api/song-request", {
                                  data: {
                                    name: songData.name,
                                    studentNumber: songData.studentNumber,
                                  },
                                })
                                .then((response) => {
                                  if (response.data.isValid) {
                                    toast.success("신청이 취소되었습니다.");
                                  } else {
                                    toast.error(response.data.message);
                                  }
                                });
                            }}
                          >
                            <Delete className="mr-2 h-4 w-4" />
                            <span>신청취소</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
