"use client";

import React, { useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { toast } from "sonner";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { TimerReset } from "lucide-react";

import axios from "axios";

interface SongRequest {
  name: string;
  studentNumber: string;
  songTitle: string;
  singer: string;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "이름을 입력해주세요." }),
  studentNumber: z.string().length(5, { message: "학번이 아닙니다." }),
  songTitle: z.string().min(1, { message: "노래제목을 입력해주세요" }),
  singer: z.string().min(1, { message: "가수를 입력해주세요" }),
  readPrecaution: z.boolean(),
});

export default function MorningSongRequestPage() {
  const [leftSecToRefresh, setLeftSecToRefresh] = useState<number>(5);
  const [songList, setSongList] = useState<SongRequest[]>();

  async function refreshSongList() {
    axios
      .get(`/api/morning-song-request?date=${Number(new Date())}`)
      .then((response) => {
        setSongList(response.data);
      });
  }

  useEffect(() => {
    refreshSongList();
    const refreshInterval = setInterval(() => {
      setLeftSecToRefresh((prev) => prev - 1);
      if (leftSecToRefresh <= 0) {
        refreshSongList();
        setLeftSecToRefresh(5);
      }
    }, 1000);

    return () => clearInterval(refreshInterval);
  }, [leftSecToRefresh]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    axios
      .post(`/api/morning-song-request?date=${Number(new Date())}`, {
        name: values.name,
        studentNumber: values.studentNumber,
        songTitle: values.songTitle,
        singer: values.singer,
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
        singer: "",
        songTitle: "",
        readPrecaution: false,
      })
    );
  }

  return (
    <div className="block sm:flex w-full" style={{ height: "100%" }}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-[20px] sm:w-3/4 p-3 pr-6 pb-6 border-border border-b-[1px] sm:border-r-[1px] sm:border-b-[0px] h-full sm:h-fit"
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
            name="songTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>노래 제목</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="singer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>가수</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <Button className="w-fit" type="submit">
            신청하기
          </Button>
        </form>
      </Form>

      <div className="sm:w-1/4 p-3 flex flex-col gap-[20px]">
        <div className="space-y-2 p-3 pb-6 border-border border-b-[1px]">
          <h2 className="text-lg font-semibold">신청시 주의사항</h2>
          <ul className="mx-[10px] space-y-2">
            <li>- 건전한 노래만 신청해주세요.</li>
            <li>
              - 일본노래, 이세계아이돌, 보컬로이드 등은 신청하지 말아주세요.
            </li>
            <li>- 본인이 직접 신청해주세요.</li>
            <li>- 중복된 가수의 노래 신청은 하지 말아주세요.</li>
            <li>
              - 신청은 노래가 재생되는 날 기준 전날 오후 4시부터 당일 8시까지
              가능합니다.
            </li>
          </ul>
        </div>
        <div className="space-y-2 p-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">신청목록</h2>
            <div className="flex items-center text-ring">
              <TimerReset size={15} />
              <p>{leftSecToRefresh}</p>
            </div>
          </div>
          <ul className="mx-[10px]">
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
                >
                  {`${songData.songTitle} - ${songData.singer}`}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
