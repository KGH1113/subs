import { connectToDB } from "@/lib/mongoose";
import MorningSongRequestModel from "@/lib/models/MorningSongRequest";
import { NextRequest, NextResponse } from "next/server";

process.env.TZ = "Asia/Seoul";

interface SongRequest {
  name: string;
  studentNumber: string;
  songTitle: string;
  singer: string;
}

interface BlacklistItem {
  name: string;
  studentNumber: string;
}

interface Validity {
  isValid: boolean;
  message: string;
}

function isRequestValid({
  requests,
  blacklist,
  newRequest,
}: {
  requests: SongRequest[];
  blacklist: BlacklistItem[];
  newRequest: SongRequest;
}): Validity {
  const strProcess = (str: string) =>
    str
      .toUpperCase()
      .replace(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi, "") // replace all special chars to empty char
      .trim()
      .split(" ")
      .join("");

  const { studentNumber, songTitle, singer } = newRequest;
  let message: string = "";

  // Check if it is a weekend in Seoul, Korea
  const today = new Date();
  const dayOfWeek = today.getDay();
  // const isWeekend = false;
  const isWeekend: boolean = dayOfWeek === 0 || dayOfWeek === 6; // 0 is Sunday, 6 is Saturday (considering Sunday as the weekend)

  const isValidTime: boolean = today.getHours() <= 8 || today.getHours() >= 18;

  // Check if the request limit (10개) is over
  const requestCount = requests.length;
  const isRequestLimitReached: boolean = requestCount >= 10;

  // Check if the duplicated song has already been requested
  const isDuplicateSongRequested: boolean = requests.some(
    (req) => strProcess(req.songTitle) === strProcess(songTitle)
  );

  // Check if the requester already requested
  const isRequesterAlreadyRequested: boolean = requests.some(
    (req) => req.studentNumber === studentNumber
  );

  // Check if the requester is in the blacklist
  const isRequesterBlacklisted: boolean = blacklist.some(
    (blacklisted) => blacklisted.studentNumber === studentNumber
  );

  // Check if the duplicated singer has been requested
  const duplicatedSingerNames: string[][] = [
    ["G-IDLE", "IDLE", "아이들", "여자아이들"],
    ["bts", "방탄소년단", "방탄"],
    ["BTS 정국", "bts jungkook", "jungkook", "정국"],
    ["v", "방탄소년단 v", "방탄소년단 뷔", "뷔", "방탄 v", "방탄 뷔"],
    ["nct", "엔시티"],
    ["엔시티 유", "nct u"],
    ["Seventeen", "세븐틴", "새븐틴"],
    ["txt", "투머로우바이투게더", "투바투"],
  ].map((d, i) => d.map(strProcess));

  const isDuplicateSingerRequested: boolean = duplicatedSingerNames.some(
    (singerVariations) =>
      requests.some((req) =>
        singerVariations.includes(strProcess(req.singer))
      ) && singerVariations.includes(strProcess(singer))
  );

  // Final validation
  if (isWeekend) {
    message = "주말에는 신청을 받지 않습니다.";
  } else if (!isValidTime) {
    message = "신청이 가능한 시간대가 아닙니다.";
  } else if (isRequestLimitReached) {
    message = "오늘 신청이 마감되었습니다. (10개)";
  } else if (isDuplicateSongRequested) {
    message = "동일한 신청곡이 존재합니다.";
  } else if (isRequesterAlreadyRequested) {
    message = "이미 신청하셨습니다.";
  } else if (isRequesterBlacklisted) {
    message =
      "블랙리스트에 등록되신 것 같습니다. 최근 신청 시 주의사항을 위반한 적이 있는지 확인해주세요";
  } else if (
    isDuplicateSingerRequested ||
    requests.some((req) => req.singer === singer)
  ) {
    message = "동일한 가수의 신청곡이 존재합니다.";
  }

  const isValid: boolean = message === ""; // If error message is empty, request is valid

  return { isValid, message };
}

async function addSongRequest({
  name,
  studentNumber,
  songTitle,
  singer,
}: SongRequest): Promise<Validity> {
  await connectToDB();

  const isValidDoc = JSON.parse(
    JSON.stringify(
      await MorningSongRequestModel.findById("65945566f2790d57d00ff1fe")
    )
  );
  if (!isValidDoc.isValid) {
    return { isValid: false, message: isValidDoc.message };
  }

  const currentDate = new Date();
  const dateString: string =
    currentDate.getHours() >= 18
      ? `${currentDate.getMonth() + 1}/${
          currentDate.getDate() + 1
        }/${currentDate.getFullYear()}`
      : `${
          currentDate.getMonth() + 1
        }/${currentDate.getDate()}/${currentDate.getFullYear()}`;

  const v = await MorningSongRequestModel.findOne({
    date: dateString,
  });
  const requests = v ? v : { requests: [] };
  const blacklist = await MorningSongRequestModel.findOne({
    date: "blacklist",
  });
  const requestValidity = isRequestValid({
    requests: requests.requests,
    blacklist: blacklist.requests,
    newRequest: { name, studentNumber, songTitle, singer },
  });
  if (requestValidity.isValid) {
    await MorningSongRequestModel.findOneAndUpdate(
      { date: dateString },
      {
        $push: {
          requests: {
            name: name,
            studentNumber: studentNumber,
            songTitle: songTitle,
            singer: singer,
            timestamp: new Date(),
          },
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return {
      isValid: true,
      message: "노래가 성공적으로 신청되었습니다.",
    };
  } else {
    return { isValid: false, message: requestValidity.message };
  }
}

async function getSongList(): Promise<SongRequest[]> {
  await connectToDB();
  const currentDate = new Date();
  const dateString: string =
    currentDate.getHours() >= 18
      ? `${currentDate.getMonth() + 1}/${
          currentDate.getDate() + 1
        }/${currentDate.getFullYear()}`
      : `${
          currentDate.getMonth() + 1
        }/${currentDate.getDate()}/${currentDate.getFullYear()}`;
  const v = await MorningSongRequestModel.findOne({
    date: dateString,
  });
  const requests: { requests: SongRequest[] } = v ? v : { requests: [] };
  return requests.requests;
}

export async function POST(request: NextRequest) {
  const requestedData: SongRequest = await request.json();
  const result = await addSongRequest(requestedData);
  return NextResponse.json(result);
}

export async function GET(request: NextRequest) {
  const data = await getSongList();
  return NextResponse.json(data);
}
