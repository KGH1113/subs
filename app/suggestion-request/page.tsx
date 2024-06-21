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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { toast } from "sonner";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import axios from "axios";

import Swal from "sweetalert2";

interface SuggestionRequest {
  name: string;
  studentNumber: string;
  suggestion: string;
  answer: string;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "이름을 입력해주세요." }),
  studentNumber: z.string().length(5, { message: "학번이 아닙니다." }),
  email: z.string().min(1, { message: "이메일 주소를 입력해주세요." }),
  suggestion: z.string().min(1, { message: "건의사항을 입력해주세요." }),
  readPrecaution: z.boolean(),
});

export default function SuggestionRequestPage() {
  const [suggestionList, setSuggestionList] = useState<SuggestionRequest[]>();
  const [verificationSuccess, setVerificationSuccess] =
    useState<boolean>(false);

  async function refreshSuggestionList() {
    axios.get("/api/suggestion-request").then((response) => {
      setSuggestionList(response.data);
    });
  }

  useEffect(() => {
    refreshSuggestionList();
  }, []);

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
      .post(`/api/suggestion-request?date=${Number(new Date())}`, {
        name: values.name,
        studentNumber: values.studentNumber,
        suggestion: values.suggestion,
      })
      .then((response) => {
        if (response.data.isValid) {
          toast.success("건의사항이 신청되었습니다.");
        } else {
          console.log(response.data);
          toast.error(response.data.message);
        }
        refreshSuggestionList();
      });
    form.reset(
      (values = {
        name: "",
        studentNumber: "",
        email: "",
        suggestion: "",
        readPrecaution: false,
      })
    );
  }

  return (
    <div className="block sm:flex h-full w-full">
      <div className="flex flex-col gap-[20px] sm:w-3/4 sm:m-3 sm:mt-6 sm:mr-6 mb-6 border-border border-b-[1px] sm:border-r-[1px] sm:border-b-[0px] h-[calc(100dvh-200px)] overflow-auto">
        <div className="space-y-2 p-3">
          <ul className="mx-[10px]">
            {suggestionList?.length === 0 ? (
              <li>아직 신청된 건의사항이 없습니다.</li>
            ) : (
              <Accordion type="multiple" className="w-full">
                {suggestionList?.map((suggestionData, index) => (
                  <li key={index}>
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger>
                        <p className="font-bold">{suggestionData.suggestion}</p>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-slate-400">
                          &nbsp;&nbsp;&nbsp;
                          {suggestionData.answer !== ""
                            ? suggestionData.answer
                            : "(아직 답변이 달리지 않았습니다.)"}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </li>
                ))}
              </Accordion>
            )}
          </ul>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="sm:w-1/4 p-3 flex flex-col gap-[20px] mx-[10px]"
        >
          <div className="space-y-2 p-3 pb-6 border-border border-b-[1px]">
            <h2 className="text-lg font-semibold">신청시 주의사항</h2>
            <ul className="mx-[10px] space-y-2">
              <li>- 특정 방송부원을 저격하지 말아주세요</li>
              <li>- 방송부원을 비하하는 내용을 신청하지 말아주세요.</li>
              <li>
                - 신청된 건의사항의 답변은 방송부원들이 직접 달아드리니,
                오래걸릴 수 있습니다.
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">신청하기</h2>
          </div>
          <div className="ml-[10px] space-y-[20px]">
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
                  <div className="space-y-2 w-full">
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
            <FormField
              control={form.control}
              name="suggestion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>건의사항</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none" {...field} />
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
          </div>
        </form>
      </Form>
    </div>
  );
}
