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

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { TimerReset } from "lucide-react";

import { addSongRequest } from "@/lib/actions/SongRequest.actions";

interface SongRequest {
  name: string;
  studentNumber: string;
  songTitle: string;
  singer: string;
}

interface Props {
  songList: SongRequest[];
}

const formSchema = z.object({
  name: z.string().min(1, { message: "이름을 입력해주세요." }),
  studentNumber: z.string().length(5, { message: "학번이 아닙니다." }),
  songTitle: z.string().min(1, { message: "노래제목을 입력해주세요" }),
  singer: z.string().min(1, { message: "가수를 입력해주세요" }),
  readPrecaution: z.boolean(),
});

export default function SongRequestForm({ songList }: Props) {
  const [leftSecToRefresh, setLeftSecToRefresh] = useState<number>(5);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addSongRequest({
      name: values.name,
      studentNumber: values.studentNumber,
      songTitle: values.songTitle,
      singer: values.singer,
    });
  }

  return (
    <div className="block sm:flex w-full" style={{ height: "89%" }}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-[20px] sm:w-3/4 p-3 pr-6 border-border border-b-[1px] sm:border-r-[1px] sm:border-b-[0px]"
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
              <FormItem className="flex flex-row space-x-3 space-y-0 items-center">
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
      {/* <AlertDialog>
          <AlertDialogTrigger asChild>
            
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog> */}

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
            {songList?.map((songData, index) => (
              <li key={index}>
                {songData.songTitle} - {songData.singer}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}