"use client";

import { useState } from "react";

import { UploadButton } from "@/utils/uploadthing";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { toast } from "sonner";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import axios from "axios";

interface Application {
  name: string;
  studentNumber: string;
  applicationFileURL: string;
  fileType: string;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "이름을 입력해주세요." }),
  studentNumber: z.string().length(5, { message: "학번이 아닙니다." }),
  readPrecaution: z.boolean(),
});

export default function NewCrewPage() {
  const [fileUrl, setFileUrl] = useState<string>();
  const [fileType, setFileType] = useState<string>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    axios
      .post(`/api/submit-application?date=${Number(new Date())}`, {
        name: values.name,
        studentNumber: values.studentNumber,
        applicationFileURL: fileUrl,
        fileType: fileType,
      })
      .then((response) => {
        if (response.data.isValid) {
          toast.success("신규 방송부원 지원이 완료되었습니다 .");
        } else {
          console.log(response.data);
          toast.error(response.data.message);
        }
      });
    form.reset(
      (values = {
        name: "",
        studentNumber: "",
        readPrecaution: false,
      })
    );
    setFileUrl("");
    setFileType("");
  }

  return (
    <div
      className="flex flex-col xl:flex-row w-ful h-full"
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
          <>
            <FormLabel>지원서 업로드</FormLabel>
            {!fileUrl ? (
              <UploadButton
                className="w-fit flex flex-row m-0 gap-3 ut-button:bg-background ut-button:text-ring ut-button:border-[1px] ut-button:border-border ut-allowed-content:text-ring"
                endpoint="mediaPost"
                onClientUploadComplete={(res) => {
                  console.log("Files: ", res);
                  setFileUrl(res[0].url);
                  setFileType(res[0].name.split(".").pop());
                }}
                onUploadError={(error: Error) => {
                  console.error(`ERROR! ${error}`);
                  toast.error("파일 용량이 너무 큽니다. (8MB)");
                }}
              />
            ) : (
              <div className="bg-background text-ring border-[1px] border-border rounded-md w-fit p-[15px] px-[40px]">
                업로드되었습니다. ✓
              </div>
            )}
          </>
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
                <FormLabel>지원 시 주의사항을 읽었습니다.</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-fit" type="submit" disabled={!fileUrl}>
            신청하기
          </Button>
        </form>
      </Form>

      <div className="xl:w-1/4 p-3 flex flex-col gap-[20px]">
        <div className="space-y-2 p-3 pb-6 border-border border-b-[1px]">
          <h2 className="text-lg font-semibold">지원 시 주의사항</h2>
          <ul className="mx-[10px] space-y-2">
            <li>
              - 학교의 중요 행사를 담당하기에 성실함과 책임감이 중요합니다.
            </li>
            <li>
              - 행사 준비 일정 등으로 인해 개인 시간을 소비해야 하는 경우도
              발생할 수 있습니다.
            </li>
            <li>
              - 지원서에 포함되어야 하는 내용은 다음과 같습니다: 지원동기,
              자기소개, 학급임원경험
            </li>
            <li>
              - 직접 편집한 영상이 있으신 분은 seounbroadcast@gmail.com으로
              보내주시면 선발에 참고하도록 하겠습니다.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
