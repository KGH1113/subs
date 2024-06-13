"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AspectRatio } from "@/components/ui/aspect-ratio";

import { toast } from "sonner";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { TimerReset, Loader, Search } from "lucide-react";

import axios from "axios";

import Swal from "sweetalert2";

interface SongRequest {
  name: string;
  studentNumber: string;
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

  async function refreshSongList() {
    axios
      .get(`/api/song-request?date=${Number(new Date())}`)
      .then((response) => {
        setSongList(response.data);
      });
  }

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
          console.log(response.data);
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
    <div className="block sm:flex w-full h-full" style={{ height: "100%" }}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-[20px] sm:w-3/4 p-3 pr-6 pb-6 border-border border-b-[1px] sm:border-r-[1px] sm:border-b-[0px] h-fit sm:h-full"
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
                  노래 검색을 통해 음악 신청이 가능합니다. <br /> 검색 Tip) 외국
                  주요 서비스인 iTunes의 API를 사용하기 때문에, 영어로 검색하면
                  검색 정확률이 올라갑니다.
                </DrawerDescription>
                <form className="border-2 rounded-full border-border my-2 flex space-x-2 items-center justify-between pr-4">
                  <Input
                    placeholder="노래 검색..."
                    className="border-0 rounded-l-full p-5"
                    onChange={(e) => setSearchQuery(e.target.value)}
                    value={searchQuery}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      axios
                        .get(
                          `https://itunes.apple.com/search?term=${searchQuery
                            .split(" ")
                            .join("+")}&entity=musicTrack`
                        )
                        .then((response) => {
                          const searchResults: SearchResult[] = [];
                          response.data.results.map((d: any) => {
                            searchResults.push({
                              songTitle: d.trackName,
                              singer: d.artistName,
                              publishYear: new Date(
                                d.releaseDate
                              ).getFullYear(),
                              imgUrl: d.artworkUrl100,
                            });
                          });
                          setSearchResult(searchResults);
                        });
                    }}
                  >
                    <Search size={18} color="#94A3B8" />
                  </button>
                </form>
              </DrawerHeader>
              <ul className="overflow-auto w-full ml-4">
                {searchResult.length === 0 ? (
                  <li className="m-2 font-bold">검색결과가 없습니다.</li>
                ) : (
                  searchResult.map((searchData, i) => (
                    <li
                      className={
                        form.getValues("songTitle") === searchData.songTitle &&
                        form.getValues("singer") === searchData.singer
                          ? "m-2 border-[1px] border-primary rounded-md"
                          : "m-2"
                      }
                      key={i}
                      onClick={() => {
                        form.setValue("songTitle", searchData.songTitle);
                        form.setValue("singer", searchData.singer);
                        form.setValue("imgSrc", searchData.imgUrl);
                      }}
                    >
                      <div className="w-full flex space-x-2 justify-stretch">
                        <div className="w-[3rem]">
                          <AspectRatio ratio={1 / 1}>
                            <Image
                              src={searchData.imgUrl}
                              alt="Image"
                              className="rounded-md object-cover"
                              width={300}
                              height={300}
                              unoptimized
                            />
                          </AspectRatio>
                        </div>
                        <div className="w-full flex flex-col items-baseline">
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
              if (!form.getValues("songTitle") || !form.getValues("singer")) {
                setViewSongSelectError(true);
              }
            }}
          >
            신청하기
          </Button>
        </form>
      </Form>

      <div className="sm:w-1/4 p-3 flex flex-col gap-[20px] overflow-auto">
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
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">신청목록 </h2>
            <div className="hidden sm:flex sm:items-center sm:gap-2">
              <div className="flex items-center text-ring hover:bg-secondary p-1 rounded-md cursor-pointer">
                <TimerReset
                  size={15}
                  onClick={async () => {
                    await refreshSongList();
                  }}
                />
                <p>{leftSecToRefresh}</p>
              </div>
              <span className="text-sm text-ring font-normal mr-1">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            {!songList ? (
              <Loader className="text-slate-400 animate-spin" size={17} />
            ) : (
              <></>
            )}
          </div>
          <div>
            {!songList ? (
              <ul className="mx-[10px] space-y-1 animate-pulse">. . .</ul>
            ) : (
              <ul className="mx-[10px] space-y-1">
                {songList?.length === 0 ? (
                  <li>아직 신청된 곡이 없습니다.</li>
                ) : (
                  songList?.map((songData, index) => (
                    <li
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${songData.songTitle} - ${songData.singer}`
                        );
                        toast.success("복사되었습니다.");
                      }}
                      key={index}
                      className="flex space-x-1 sm:space-x-3 hover:underline cursor-pointer items-center"
                    >
                      <div className="w-full flex space-x-2 justify-stretch">
                        <div className="w-[3rem]">
                          <AspectRatio ratio={1 / 1}>
                            <Image
                              src={songData.imgSrc}
                              alt="Image"
                              className="rounded-md object-cover"
                              width={300}
                              height={300}
                              unoptimized
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
