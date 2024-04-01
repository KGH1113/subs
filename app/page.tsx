import React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home(): React.ReactNode {
  return (
    <main>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>SUBS의 뜻이 무엇인가요?</AccordionTrigger>
          <AccordionContent>
            &nbsp;&nbsp;&nbsp;SUBS(Seoun Broadcast System)는 서운중학교의
            동아리입니다.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>SUBS가 하는 일은 무엇인가요?</AccordionTrigger>
          <AccordionContent>
            &nbsp;&nbsp;&nbsp;SUBS는 점심시간 음악방송, 교내방송, 서운축제 등
            교내의 방송을 담당합니다.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>
            점심시간 음악방송의 음악 선정은 어떻게 이루어지나요?
          </AccordionTrigger>
          <AccordionContent>
            &nbsp;&nbsp;&nbsp;웹사이트에서 점심시간에 재생될 음악 신청곡을
            받습니다. 그 후 방송부원들이 신청곡 중 음악을 선정하여 음악을
            재생합니다. 신청곡이 신청했되었으나, 방송부원들의 의견에 따라
            신청곡이 재생되지 않을 수 있습니다.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>방송부원은 어떻게 선출되나요?</AccordionTrigger>
          <AccordionContent>
            &nbsp;&nbsp;&nbsp;방송부원은 학기 초 (3~4월)에 1학년 입학생들을
            대상으로 모집 공고가 교내에 계시됩니다.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-5">
          <AccordionTrigger>방송부 사이트 만든 사람 이름 딱대</AccordionTrigger>
          <AccordionContent>
            &nbsp;&nbsp;&nbsp;방송부 사이트 개발자의 신상정보는 다음과 같습니다
            :)
            <span className="text-xs">
              <br />
              <br />
              &nbsp;&nbsp;&nbsp;이름: 강구현 <br />
              &nbsp;&nbsp;&nbsp;학번: 31001
              <br />
              &nbsp;&nbsp;&nbsp;메일주소: gangguhyeon1113@gmail.com
              <br />
              &nbsp;&nbsp;&nbsp;인스타 아이디: @kgh_guhyeon
              <br />
              <br />
            </span>
            &nbsp;&nbsp;&nbsp;건의사항이나 따질 점은 건의사항 신청으로 :)
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </main>
  );
}
