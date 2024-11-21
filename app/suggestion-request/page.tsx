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
import { Loader } from "lucide-react";

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
});

export default function SuggestionRequestPage() {
  const [suggestionList, setSuggestionList] = useState<SuggestionRequest[]>();

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
      })
    );
  }

  return (
    <div
      className="flex flex-col xl:flex-row w-full h-full"
      style={{ height: "100%" }}
    >
      <div className="flex flex-col gap-[20px] xl:w-3/4 p-3 pr-6 pb-6 border-border border-b-[1px] xl:border-r-[1px] xl:border-b-[0px] h-fit xl:h-full">
        <div className="space-y-2 p-3">
          <ul className="mx-[10px] xl:h-full h-[calc(40dvh-101px)] overflow-auto">
            {!suggestionList ? (
              <Loader className="text-slate-400 animate-spin" size={30} />
            ) : (
              <></>
            )}
            {suggestionList?.length === 0 ? (
              <li>아직 신청된 건의사항이 없습니다.</li>
            ) : (
              <Accordion type="multiple" className="w-full">
                {suggestionList?.map((suggestionData, index) => (
                  <li key={index}>
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger>
                        <p className="font-bold text-left">
                          {suggestionData.suggestion}
                        </p>
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
          className="xl:w-1/4 xl:h-full h-[calc(60dvh-101px)] p-3 flex flex-col gap-[20px] mx-[10px] overflow-auto"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold mt-3">신청하기</h2>
          </div>
          <div className="ml-[10px] space-y-[20px] border-border border-b-[1px] pb-6">
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
            <Button className="w-fit" type="submit">
              신청하기
            </Button>
          </div>

          <div className="space-y-2 p-3">
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
        </form>
      </Form>
    </div>
  );
}
